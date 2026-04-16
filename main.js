const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset', // Modern title bar on macOS, but we'll handle Windows/Linux too
  });

  win.loadFile('index.html');
  
  // Open DevTools in development
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('open-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
  });
  if (canceled) return null;
  const content = fs.readFileSync(filePaths[0], 'utf8');
  return { path: filePaths[0], content };
});

ipcMain.handle('save-file', async (event, filePath, content) => {
  if (!filePath) {
    const { canceled, filePath: newPath } = await dialog.showSaveDialog({
      filters: [{ name: 'Markdown', extensions: ['md'] }]
    });
    if (canceled) return null;
    filePath = newPath;
  }
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
});

ipcMain.handle('export-pdf', async (event, htmlContent) => {
  const win = BrowserWindow.getFocusedWindow();
  const { filePath, canceled } = await dialog.showSaveDialog({
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  
  if (canceled) return false;

  const pdfOptions = {
    marginsType: 0,
    pageSize: 'A4',
    printBackground: true,
    landscape: false
  };

  try {
    const data = await win.webContents.printToPDF(pdfOptions);
    fs.writeFileSync(filePath, data);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
});

ipcMain.on('show-help', () => {
  const helpWin = new BrowserWindow({
    width: 600,
    height: 700,
    title: 'MarkFlow Help',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  helpWin.loadFile('help.html');
});

ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url);
});
