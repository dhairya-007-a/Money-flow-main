const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('financeBackend', {
  isElectron: true,
  getStatus: () => ipcRenderer.invoke('backend:get-status'),
  loadAll: () => ipcRenderer.invoke('backend:load-all'),
  saveAll: (data) => ipcRenderer.invoke('backend:save-all', data),
  createBackup: (note) => ipcRenderer.invoke('backend:create-backup', note),
  openDataFolder: () => ipcRenderer.invoke('backend:open-data-folder'),
  exportFile: (options) => ipcRenderer.invoke('backend:export-file', options),
  importFile: () => ipcRenderer.invoke('backend:import-file'),
  showNotification: (options) => ipcRenderer.invoke('backend:show-notification', options)
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('[Finance Flow] Native Electron IPC Backend Bridge Active');
});
