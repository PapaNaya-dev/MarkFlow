const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (path, content) => ipcRenderer.invoke('save-file', path, content),
  exportPDF: () => ipcRenderer.invoke('export-pdf'),
  showHelp: () => ipcRenderer.send('show-help'),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', (event, value) => callback(value)),
});
