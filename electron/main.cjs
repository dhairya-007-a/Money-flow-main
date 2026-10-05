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
        console.log('[Electron Backend] Initializing fresh default database at:', dbFilePath);
        const defaultStore = {
          version: '2.0.0',
          currency: '₹',
          monthlyBudget: 50000,
          categories: [
            { id: 'here-i-paid', name: 'Here I Paid', iconName: 'CreditCard', imageUrl: './dollars.png', color: '#74c69d', bgGradient: 'from-[#74c69d] to-[#52b788]', budgetLimit: 10000 },
            { id: 'food', name: 'Food & Dining', iconName: 'Utensils', imageUrl: './food.png', color: '#52b788', bgGradient: 'from-[#52b788] to-[#40916c]', budgetLimit: 12000 },
            { id: 'laundry', name: 'Laundry & Clean', iconName: 'Shirt', color: '#b7e4c7', bgGradient: 'from-[#b7e4c7] to-[#95d5b2]', budgetLimit: 3000 },
            { id: 'travel', name: 'Travel & Transport', iconName: 'Car', color: '#2d6a4f', bgGradient: 'from-[#40916c] to-[#2d6a4f]', budgetLimit: 8000 },
            { id: 'shopping', name: 'Shopping & Clothes', iconName: 'ShoppingBag', color: '#95d5b2', bgGradient: 'from-[#95d5b2] to-[#74c69d]', budgetLimit: 10000 },
            { id: 'bills', name: 'Bills & Utilities', iconName: 'Zap', imageUrl: './budget.png', color: '#40916c', bgGradient: 'from-[#40916c] to-[#2d6a4f]', budgetLimit: 15000 },
            { id: 'entertainment', name: 'Entertainment', iconName: 'Gamepad2', color: '#52b788', bgGradient: 'from-[#52b788] to-[#2d6a4f]', budgetLimit: 5000 },
            { id: 'health', name: 'Health & Medical', iconName: 'HeartPulse', color: '#b7e4c7', bgGradient: 'from-[#b7e4c7] to-[#52b788]', budgetLimit: 4000 }
          ],
          transactions: [
            { id: "tx-demo-1", amount: 1450, merchant: "Green Valley Supermarket", description: "Weekly organic groceries & produce", date: "2026-10-01", time: "14:30", categoryId: "food", paymentMethod: "online", createdAt: "2026-10-01T09:00:00.000Z" },
            { id: "tx-demo-2", amount: 2199, merchant: "FiberNet Broadband", description: "Monthly fiber internet utility", date: "2026-10-02", time: "10:15", categoryId: "bills", paymentMethod: "online", createdAt: "2026-10-02T04:45:00.000Z" },
            { id: "tx-demo-3", amount: 320, merchant: "Artisan Roasters Cafe", description: "Cold brew coffee & pastry", date: "2026-10-03", time: "11:20", categoryId: "food", paymentMethod: "cash", createdAt: "2026-10-03T05:50:00.000Z" },
            { id: "tx-demo-4", amount: 650, merchant: "Metro Transit System", description: "Weekly commute metro card refill", date: "2026-10-04", time: "08:45", categoryId: "travel", paymentMethod: "online", createdAt: "2026-10-04T03:15:00.000Z" },
            { id: "tx-demo-5", amount: 1200, merchant: "Paperback Bookstore", description: "Financial planning & productivity books", date: "2026-10-05", time: "16:10", categoryId: "shopping", paymentMethod: "online", createdAt: "2026-10-05T10:40:00.000Z" }
          ]
        };
        atomicWriteFile(dbFilePath, JSON.stringify(defaultStore, null, 2));
        return defaultStore;
      }
      const raw = fs.readFileSync(dbFilePath, 'utf8').replace(/^\uFEFF/, '');
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
          title: title || 'FinanceCalc Public',
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
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#080D0B',
    title: 'FinanceCalc Public',
    icon: path.join(__dirname, '../public/logo.png'),
    show: false, // Prevents white flash before content loads
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
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
