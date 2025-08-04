const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { name, version } = require('./package.json');

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
    isMaximized: win.isMaximized(),
  };
  try {
    fs.writeFileSync(getStatePath(), JSON.stringify(state));
  } catch {}
}

let nodeProcess;
let minerProcess;
let mainWindow;
function startLocalNode() {
  const nodePath = path.join(
    __dirname,
    '..',
    'nano-node',
    'build',
    'nano_node',
  );
  if (fs.existsSync(nodePath)) {
    nodeProcess = spawn(nodePath, ['--daemon']);
    nodeProcess.on('error', (err) => {
      console.error('Failed to start nano_node', err);
    });
  }
}

function stopLocalNode() {
  if (nodeProcess) {
    nodeProcess.kill();
    nodeProcess = null;
  }
}

function isNodeRunning() {
  return !!nodeProcess && !nodeProcess.killed;
}

function startMiner() {
  if (minerProcess) return;
  const cwd = path.join(__dirname, '..');
  const cmd = process.platform === 'win32' ? 'start.bat' : 'xmrig';
  const minerPath = path.join(cwd, cmd);
  const configPath = path.join(cwd, 'config.json');
  const args = process.platform === 'win32' ? [] : ['-c', configPath];
  minerProcess = spawn(minerPath, args, {
    cwd,
    shell: process.platform === 'win32',
  });
  minerProcess.stdout.on('data', (data) => {
    mainWindow?.webContents.send('miner-output', data.toString());
  });
  minerProcess.stderr.on('data', (data) => {
    mainWindow?.webContents.send('miner-output', data.toString());
  });
  minerProcess.on('exit', (code) => {
    mainWindow?.webContents.send('miner-exit', code ?? 0);
    minerProcess = null;
  });
}

function stopMiner() {
  if (minerProcess) {
    minerProcess.kill();
    minerProcess = null;
  }
}

function isMinerRunning() {
  return !!minerProcess && !minerProcess.killed;
}

function createWindow() {
  const state = loadWindowState();
  const win = new BrowserWindow({
    width: state.width || 900,
    height: state.height || 700,
    x: state.x,
    y: state.y,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow = win;

  if (state.isMaximized) win.maximize();

  win.loadFile('index.html');

  win.on('close', () => saveWindowState(win));
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [{ role: 'quit' }],
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
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

ipcMain.handle('start-node', () => {
  if (!isNodeRunning()) startLocalNode();
  return isNodeRunning();
});

ipcMain.handle('stop-node', () => {
  stopLocalNode();
  return true;
});

ipcMain.handle('node-status', () => isNodeRunning());

ipcMain.handle('start-miner', () => {
  if (!isMinerRunning()) startMiner();
  return isMinerRunning();
});

ipcMain.handle('stop-miner', () => {
  stopMiner();
  return true;
});

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  stopLocalNode();
  stopMiner();
});
