const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'MarkFlow.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
  });

  mainWindow.loadFile('index.html');
  
  // Handle file opening from command line
  mainWindow.webContents.on('did-finish-load', () => {
    const filePath = getFilePathFromArgs();
    if (filePath) {
      openFileByPath(filePath);
    }
  });
}

function getFilePathFromArgs() {
  // On Windows/Linux, the file path is usually the last argument
  const args = process.argv;
  if (app.isPackaged) {
    // In packaged app, args[0] is exe, args[1] could be file
    if (args.length >= 2) {
      const p = args[args.length - 1];
      if (fs.existsSync(p) && fs.lstatSync(p).isFile() && p.match(/\.(md|markdown)$/i)) {
        return p;
      }
    }
  } else {
    // In development (electron . path/to/file)
    if (args.length >= 3) {
      const p = args[args.length - 1];
      if (fs.existsSync(p) && fs.lstatSync(p).isFile() && p.match(/\.(md|markdown)$/i)) {
        return p;
      }
    }
  }
  return null;
}

function openFileByPath(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    mainWindow.webContents.send('file-opened', { path: filePath, content });
  } catch (err) {
    console.error('Failed to open file:', err);
  }
}

// For macOS "Open With" while app is running
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (mainWindow) {
    openFileByPath(filePath);
  } else {
    // If window not yet created, it will be handled by createWindow logic if we store it
    global.fileToOpen = filePath;
  }
});

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
    width: 800,
    height: 800,
    title: 'MarkFlow - Markdown Tutorial',
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
