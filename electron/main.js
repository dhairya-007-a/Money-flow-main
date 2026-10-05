const { app, BrowserWindow, ipcMain, dialog, shell, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

// Database and Backup Paths in user's OS AppData directory
const userDataDir = app.getPath('userData');
const dbFilePath = path.join(userDataDir, 'finance_data_store.json');
const backupsDir = path.join(userDataDir, 'backups');

// Ensure backups directory exists
try {
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }
} catch (err) {
  console.error('[Electron Backend] Failed to create backups dir:', err);
}

// Atomic file write helper to prevent data corruption during unexpected shutdown
function atomicWriteFile(filePath, dataString) {
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, dataString, 'utf8');
  fs.renameSync(tempPath, filePath);
}

// Setup Backend IPC Handlers
function setupIpcHandlers() {
  // 1. Get backend status & statistics
  ipcMain.handle('backend:get-status', async () => {
    try {
      let sizeBytes = 0;
      let lastSaved = null;
      if (fs.existsSync(dbFilePath)) {
        const stats = fs.statSync(dbFilePath);
        sizeBytes = stats.size;
        lastSaved = stats.mtime.toISOString();
      }

      let backupCount = 0;
      if (fs.existsSync(backupsDir)) {
        backupCount = fs.readdirSync(backupsDir).filter(f => f.endsWith('.json')).length;
      }

      return {
        isElectron: true,
        storageType: 'file',
        dbFilePath,
        backupsDir,
        sizeBytes,
        lastSaved,
        backupCount,
        platform: process.platform,
        version: app.getVersion()
      };
    } catch (error) {
      console.error('[Electron Backend] Error in get-status:', error);
      return {
        isElectron: true,
        storageType: 'file',
        error: error.message
      };
    }
  });

  // 2. Load all data from disk file
  ipcMain.handle('backend:load-all', async () => {
    try {
      if (!fs.existsSync(dbFilePath)) {
        console.log('[Electron Backend] No existing database file found at:', dbFilePath);
        return null;
      }
      const raw = fs.readFileSync(dbFilePath, 'utf8');
      const data = JSON.parse(raw);
      console.log('[Electron Backend] Loaded data from disk successfully.');
      return data;
    } catch (error) {
      console.error('[Electron Backend] Error reading database:', error);
      return null;
    }
  });

  // 3. Save all data to disk file (atomic)
  ipcMain.handle('backend:save-all', async (event, dataPayload) => {
    try {
      const serialized = JSON.stringify(dataPayload, null, 2);
      atomicWriteFile(dbFilePath, serialized);

      // Auto-create snapshot backup every 20 minutes if file exists
      const stats = fs.statSync(dbFilePath);
      return {
        success: true,
        lastSaved: stats.mtime.toISOString(),
        sizeBytes: stats.size
      };
    } catch (error) {
      console.error('[Electron Backend] Error saving data to disk:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // 4. Create explicit backup snapshot
  ipcMain.handle('backend:create-backup', async (event, customNote = '') => {
    try {
      if (!fs.existsSync(dbFilePath)) {
        return { success: false, error: 'Database file does not exist yet.' };
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const noteSuffix = customNote ? `_${customNote.replace(/[^a-zA-Z0-9]/g, '')}` : '';
      const backupFileName = `backup_${timestamp}${noteSuffix}.json`;
      const targetPath = path.join(backupsDir, backupFileName);

      fs.copyFileSync(dbFilePath, targetPath);
      return {
        success: true,
        fileName: backupFileName,
        filePath: targetPath,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[Electron Backend] Error creating backup:', error);
      return { success: false, error: error.message };
    }
  });

  // 5. Open local storage directory in OS File Explorer
  ipcMain.handle('backend:open-data-folder', async () => {
    try {
      await shell.openPath(userDataDir);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 6. Native Export Dialog (Save JSON or CSV or PDF)
  ipcMain.handle('backend:export-file', async (event, { defaultFileName, content, filterName, extension }) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Financial Records',
        defaultPath: defaultFileName,
        filters: [{ name: filterName || 'File', extensions: [extension || 'json'] }]
      });

      if (canceled || !filePath) return { success: false, canceled: true };

      fs.writeFileSync(filePath, content, 'utf8');
      return { success: true, filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 7. Native Import Dialog (Open JSON backup)
  ipcMain.handle('backend:import-file', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Import Financial Backup',
        properties: ['openFile'],
        filters: [{ name: 'JSON Backup', extensions: ['json'] }]
      });

      if (canceled || !filePaths || filePaths.length === 0) {
        return { success: false, canceled: true };
      }

      const content = fs.readFileSync(filePaths[0], 'utf8');
      const parsed = JSON.parse(content);
      return { success: true, data: parsed, filePath: filePaths[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 8. Native System Notification
  ipcMain.handle('backend:show-notification', async (event, { title, body }) => {
    try {
      if (Notification.isSupported()) {
        new Notification({
          title: title || 'Finance Flow',
          body: body || 'Update recorded',
          icon: path.join(__dirname, '../public/logo.png')
        }).show();
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#080D0B',
    title: 'Finance Flow • Personal Finance Suite',
    icon: path.join(__dirname, '../public/logo.png'),
    show: false, // Prevents white flash before content loads
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Minimal clean desktop framing
  mainWindow.setMenuBarVisibility(false);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const distPath = path.join(__dirname, '../dist/index.html');
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl).catch(() => {
      // Fallback if dev server is still starting
      setTimeout(() => mainWindow.loadURL(devServerUrl), 1000);
    });
  } else if (fs.existsSync(distPath)) {
    // Ultra-fast instant startup from compiled bundle
    mainWindow.loadFile(distPath);
  } else {
    // Dev fallback if dist is not yet built
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      setTimeout(() => mainWindow.loadURL('http://localhost:5173'), 1500);
    });
  }
}

// Single-instance lock to prevent database collision and duplicate windows
const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    setupIpcHandlers();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}

