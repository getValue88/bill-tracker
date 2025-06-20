const { app, BrowserWindow } = require('electron');
const path = require('path');
const childProcess = require('child_process');
const waitOn = require('wait-on');

const NEXT_PORT = process.env.PORT || '3000';
const NEXT_URL = `http://localhost:${NEXT_PORT}`;

let nextProcess; // will hold reference to the spawned Next.js process

async function createMainWindow() {
  await waitOn({ resources: [NEXT_URL] });

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  await mainWindow.loadURL(NEXT_URL);
}

function startNext() {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    nextProcess = childProcess.spawn(cmd, ['run', 'dev'], {
      stdio: 'inherit',
      env: { ...process.env, PORT: NEXT_PORT },
    })
  } else {
    // use standalone server built by Next.js (included inside asar)
    const serverPath = path.join(__dirname, '..', '.next', 'standalone', 'server.js')
    nextProcess = childProcess.spawn(process.execPath, [serverPath], {
      stdio: 'inherit',
      env: { ...process.env, PORT: NEXT_PORT },
    })
  }
}

app.whenReady().then(() => {
  startNext();
  createMainWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('quit', () => {
  if (nextProcess) nextProcess.kill();
}); 