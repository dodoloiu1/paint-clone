const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  const iconPath = path.join(__dirname, 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 850,
    minHeight: 600,
    title: 'Untitled - Paint',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#1f1f1f',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the Paint HTML app
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.on('did-finish-load', () => {
    // If a file path was passed via command line (e.g., Paint.exe image.png)
    const targetFile = process.argv.slice(1).find(arg => {
      if (!arg || arg.startsWith('-') || arg === '.') return false;
      return fs.existsSync(arg) && /\.(png|jpg|jpeg|bmp|webp)$/i.test(arg);
    });
    if (targetFile) {
      try {
        const buffer = fs.readFileSync(targetFile);
        const ext = path.extname(targetFile).toLowerCase();
        let mime = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
        else if (ext === '.bmp') mime = 'image/bmp';
        else if (ext === '.webp') mime = 'image/webp';
        mainWindow.webContents.send('file:opened', {
          name: path.basename(targetFile),
          dataUrl: `data:${mime};base64,${buffer.toString('base64')}`
        });
      } catch (err) {
        console.error('Failed to open startup file:', err);
      }
    }
  });

  // Configure native application menu
  const menuTemplate = [
    {
      label: '&File',
      submenu: [
        {
          label: '&New',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu:action', 'new')
        },
        {
          label: '&Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu:action', 'open')
        },
        {
          label: '&Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu:action', 'save')
        },
        {
          label: 'Save &As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow.webContents.send('menu:action', 'save-as')
        },
        { type: 'separator' },
        {
          label: 'E&xit',
          accelerator: 'Alt+F4',
          click: () => app.quit()
        }
      ]
    },
    {
      label: '&Edit',
      submenu: [
        {
          label: '&Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: () => mainWindow.webContents.send('menu:action', 'undo')
        },
        {
          label: '&Redo',
          accelerator: 'CmdOrCtrl+Y',
          click: () => mainWindow.webContents.send('menu:action', 'redo')
        },
        { type: 'separator' },
        {
          label: 'Cu&t',
          accelerator: 'CmdOrCtrl+X',
          click: () => mainWindow.webContents.send('menu:action', 'cut')
        },
        {
          label: '&Copy',
          accelerator: 'CmdOrCtrl+C',
          click: () => mainWindow.webContents.send('menu:action', 'copy')
        },
        {
          label: '&Paste',
          accelerator: 'CmdOrCtrl+V',
          click: () => mainWindow.webContents.send('menu:action', 'paste')
        },
        {
          label: 'Select &All',
          accelerator: 'CmdOrCtrl+A',
          click: () => mainWindow.webContents.send('menu:action', 'select-all')
        }
      ]
    },
    {
      label: '&View',
      submenu: [
        {
          label: 'Zoom &In',
          accelerator: 'CmdOrCtrl+=',
          click: () => mainWindow.webContents.send('menu:action', 'zoom-in')
        },
        {
          label: 'Zoom &Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => mainWindow.webContents.send('menu:action', 'zoom-out')
        },
        {
          label: '100% Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => mainWindow.webContents.send('menu:action', 'zoom-100')
        },
        { type: 'separator' },
        {
          label: 'Toggle &Gridlines',
          accelerator: 'CmdOrCtrl+G',
          click: () => mainWindow.webContents.send('menu:action', 'toggle-grid')
        },
        {
          label: 'Toggle &Dark Theme',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: () => mainWindow.webContents.send('menu:action', 'toggle-theme')
        },
        { type: 'separator' },
        {
          label: 'Toggle &Full Screen',
          accelerator: 'F11',
          click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen())
        }
      ]
    },
    {
      label: '&Help',
      submenu: [
        {
          label: 'About Paint',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Paint',
              message: 'Paint (Windows Native Edition)',
              detail: 'Classic Windows Paint recreated with modern Fluent UI, pixel zoom, 3-step curve bending, interactive shape handles, and dark/light mode.\n\nVersion 1.0.0'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Auto-hide menu bar so Ribbon is clean like real Paint, but Alt activates menu
  mainWindow.setAutoHideMenuBar(true);
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC: Native Open File Dialog
ipcMain.handle('dialog:open-file', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(win, {
    title: 'Open Picture',
    filters: [
      { name: 'All Picture Files', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'webp'] },
      { name: 'PNG Image (*.png)', extensions: ['png'] },
      { name: 'JPEG Image (*.jpg;*.jpeg)', extensions: ['jpg', 'jpeg'] },
      { name: 'Bitmap Files (*.bmp)', extensions: ['bmp'] },
      { name: 'All Files (*.*)', extensions: ['*'] }
    ],
    properties: ['openFile']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const filePath = result.filePaths[0];
  const buffer = await fs.promises.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  let mime = 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
  else if (ext === '.bmp') mime = 'image/bmp';
  else if (ext === '.webp') mime = 'image/webp';

  const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
  return {
    canceled: false,
    name: path.basename(filePath),
    filePath,
    dataUrl
  };
});

// IPC: Native Save File Dialog & Direct Disk Write
ipcMain.handle('dialog:save-file', async (event, { format, dataUrl, defaultName }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const ext = (format === 'jpeg') ? 'jpg' : (format || 'png');
  const filterDesc = (format === 'jpeg') ? 'JPEG Image (*.jpg)' : (format === 'bmp' ? 'Bitmap File (*.bmp)' : 'PNG Image (*.png)');

  const result = await dialog.showSaveDialog(win, {
    title: 'Save Picture',
    defaultPath: defaultName || `Untitled.${ext}`,
    filters: [
      { name: filterDesc, extensions: [ext] },
      { name: 'All Files (*.*)', extensions: ['*'] }
    ]
  });

  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }

  let finalBuffer;
  if (dataUrl.startsWith('data:')) {
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    finalBuffer = Buffer.from(base64Data, 'base64');
  } else {
    finalBuffer = Buffer.from(dataUrl);
  }

  await fs.promises.writeFile(result.filePath, finalBuffer);

  return {
    canceled: false,
    filePath: result.filePath,
    name: path.basename(result.filePath)
  };
});

// IPC: Window Title
ipcMain.handle('window:set-title', (event, title) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && title) {
    win.setTitle(title);
  }
  return true;
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();
  if (process.argv.includes('--test-run')) {
    console.log('TEST_RUN_SUCCESS');
    setTimeout(() => {
      app.quit();
    }, 1500);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
