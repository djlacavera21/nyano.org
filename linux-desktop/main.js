const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { name, version } = require('./package.json');

let nodeProcess;

function startNanoNode() {
  const nodePath = path.join(__dirname, '..', 'nano-node', 'build', 'nano_node');
  if (fs.existsSync(nodePath)) {
    nodeProcess = spawn(nodePath, ['--daemon'], { stdio: 'ignore' });
  } else {
    console.error('nano_node binary not found. Run scripts/setup-nano-node.sh first.');
  }
}

function stopNanoNode() {
  if (nodeProcess && !nodeProcess.killed) {
    nodeProcess.kill();
  }
}

function getStatePath() {
  return path.join(app.getPath('userData'), 'window-state.json');
}

function loadWindowState() {
  try {
    return JSON.parse(fs.readFileSync(getStatePath(), 'utf-8'));
  } catch {
    return { width: 900, height: 700 };
  }
}

function saveWindowState(win) {
  const bounds = win.getBounds();
  const state = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized: win.isMaximized()
  };
  try {
    fs.writeFileSync(getStatePath(), JSON.stringify(state));
  } catch {}
}

function createWindow () {
  const state = loadWindowState();
  const win = new BrowserWindow({
    width: state.width || 900,
    height: state.height || 700,
    x: state.x,
    y: state.y,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (state.isMaximized) win.maximize();

  win.loadFile('index.html');

  win.on('close', () => saveWindowState(win));
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [{ role: 'quit' }]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              message: `${name} ${version}`,
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  startNanoNode();
  createWindow();
  createMenu();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', stopNanoNode);
