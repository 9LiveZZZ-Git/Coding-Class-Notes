const { app, BrowserWindow, Menu, shell, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Computing Arts Textbook',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the textbook landing page
  mainWindow.loadFile(path.join(__dirname, 'content', 'index.html'));

  // Open external links in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Handle in-page navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const fileUrl = mainWindow.webContents.getURL();
    // Allow file:// navigation (internal textbook pages)
    if (url.startsWith('file://')) return;
    // Open http(s) links externally
    if (url.startsWith('http://') || url.startsWith('https://')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Build the application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Navigation',
      submenu: [
        {
          label: 'Home (All Chapters)',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            if (mainWindow) {
              mainWindow.loadFile(path.join(__dirname, 'content', 'index.html'));
            }
          }
        },
        { type: 'separator' },
        ...Array.from({ length: 15 }, (_, i) => ({
          label: `Chapter ${i + 1}`,
          accelerator: i < 9 ? `CmdOrCtrl+${i + 1}` : undefined,
          click: () => {
            if (mainWindow) {
              const chNum = String(i + 1).padStart(2, '0');
              mainWindow.loadFile(path.join(__dirname, 'content', `ch${chNum}`, 'index.html'));
            }
          }
        }))
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Computing Arts Textbook',
              message: 'MAT 200C: Computing Arts',
              detail: 'Interactive textbook covering creative coding with p5.js, GLSL shaders, fractals, simulation, and more.\n\nUniversity of California, Santa Barbara'
            });
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
