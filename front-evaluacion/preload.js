const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer process via contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  // Información de la plataforma
  platform: process.platform,
  isElectron: true,

  // Versiones
  versions: {
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  },
});
