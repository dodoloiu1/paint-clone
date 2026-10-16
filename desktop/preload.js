const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nativeAPI', {
  isNative: true,
  openFileDialog: () => ipcRenderer.invoke('dialog:open-file'),
  saveFileDialog: (params) => ipcRenderer.invoke('dialog:save-file', params),
  setWindowTitle: (title) => ipcRenderer.invoke('window:set-title', title),
  onMenuAction: (callback) => {
    const handler = (event, action) => callback(action);
    ipcRenderer.on('menu:action', handler);
    return () => ipcRenderer.removeListener('menu:action', handler);
  },
  onFileOpened: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('file:opened', handler);
    return () => ipcRenderer.removeListener('file:opened', handler);
  }
});
