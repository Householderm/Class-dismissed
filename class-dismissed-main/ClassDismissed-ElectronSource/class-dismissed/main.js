const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');

// Keep a global reference to prevent garbage collection
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 960,
    minHeight: 700,
    title: 'Class Dismissed 🎓 — Teacher Retirement Planner',
    backgroundColor: '#f7f7fc',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Allow local file access for offline operation
      webSecurity: false
    },
    // Show window once ready to avoid flash
    show: false
  });

  // Load the app HTML
  mainWindow.loadFile('app.html');

  // Show window once fully loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open external links in default browser, not in Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

// Build application menu
function buildMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // macOS app menu
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about', label: 'About Class Dismissed' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),

    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'Print / Save as PDF',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow?.webContents.print()
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit', label: 'Exit' }
      ]
    },

    // Edit menu
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

    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload', label: 'Restart Planner' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn', accelerator: 'CmdOrCtrl+=' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },

    // Help menu
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Class Dismissed',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Class Dismissed',
              message: 'Class Dismissed 🎓',
              detail: [
                'Version 1.0.0',
                '',
                'A free retirement planner built exclusively',
                'for public school teachers and their spouses.',
                '',
                '• Pension & Social Security planning',
                '• Social Security Fairness Act (2025) built in',
                '• Tax minimization strategies',
                '• Fully private — no data ever leaves your computer',
                '',
                '© 2025 Class Dismissed',
                'For educational purposes only.',
                'Not a substitute for professional financial advice.'
              ].join('\n'),
              buttons: ['OK']
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Visit SSA.gov (Social Security)',
          click: () => shell.openExternal('https://www.ssa.gov/myaccount/')
        },
        {
          label: 'IRS Retirement Plans for Teachers',
          click: () => shell.openExternal('https://www.irs.gov/retirement-plans/403b-tax-sheltered-annuity-plans')
        },
        { type: 'separator' },
        {
          label: 'Privacy Notice',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Privacy Notice',
              message: 'Your Privacy',
              detail: [
                'Class Dismissed is 100% private by design.',
                '',
                '✓ No data is ever sent to any server',
                '✓ No account or login required',
                '✓ No analytics or tracking',
                '✓ All calculations happen on your device',
                '✓ Closing the app clears all entered data',
                '',
                'Your financial information belongs to you alone.'
              ].join('\n'),
              buttons: ['Got it']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  buildMenu();

  // macOS: re-create window when dock icon clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Security: prevent navigation to external URLs within the app window
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.protocol !== 'file:') {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
});
