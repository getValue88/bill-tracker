const { app, BrowserWindow } = require('electron');
const path = require('path');
const childProcess = require('child_process');
const waitOn = require('wait-on');
const fs = require('fs');

const NEXT_PORT = process.env.PORT || '3000';
const NEXT_URL = `http://localhost:${NEXT_PORT}`;

let nextProcess; // will hold reference to the spawned Next.js process

// Create a write stream for logging the Next.js server stdout/stderr when packaged.
const nextLogPath = path.join(app.getPath('userData'), 'next.log');
let nextLogStream;

async function createMainWindow() {
  try {
    // Wait at most 25 seconds for the server to become available.
    await waitOn({ resources: [NEXT_URL], timeout: 25_000 });
  } catch (err) {
    console.error('Timed-out waiting for Next.js server — see log at', nextLogPath, err);
    // Still create a window to display an error page so the app doesn't appear to
    // do nothing.
    const errorWindow = new BrowserWindow({
      width: 800,
      height: 600,
    });
    errorWindow.loadURL('data:text/plain,Failed to start internal server. See logs.');
    return;
  }

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

function runPrismaDbPush(workingDir, databaseUrl) {
  // Locate the Prisma CLI inside the packaged app.
  const possibleCliPaths = [
    path.join(process.resourcesPath, 'app', 'node_modules', 'prisma', 'build', 'index.js'),
    path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'prisma', 'build', 'index.js'),
    path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js'),
  ];

  const cliPath = possibleCliPaths.find((p) => fs.existsSync(p));
  if (!cliPath) {
    console.warn('Prisma CLI not found, skipping db push');
    return;
  }

  const schemaCandidates = [
    path.join(process.resourcesPath, 'app', 'prisma', 'schema.prisma'),
    path.join(process.resourcesPath, 'app.asar.unpacked', 'prisma', 'schema.prisma'),
    path.join(__dirname, '..', '..', 'prisma', 'schema.prisma'),
  ];
  const schemaPath = schemaCandidates.find((p) => fs.existsSync(p));

  const args = [cliPath, 'db', 'push', '--accept-data-loss'];
  if (schemaPath) args.push('--schema', schemaPath);

  const result = childProcess.spawnSync(process.execPath, args, {
    stdio: 'pipe',
    cwd: workingDir,
    env: { ...process.env, DATABASE_URL: databaseUrl, ELECTRON_RUN_AS_NODE: '1' },
  });

  if (result.status !== 0) {
    console.error('Prisma db push failed', result.error || result.stderr?.toString());
  }
}

function startNext() {
  // In packaged (production) builds `app.isPackaged` is true. Rely on that instead of the
  // NODE_ENV variable so we don't accidentally mis-detect the environment.
  const isDev = !app.isPackaged;

  if (isDev) {
    const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    nextProcess = childProcess.spawn(cmd, ['run', 'dev'], {
      stdio: 'inherit',
      env: { ...process.env, PORT: NEXT_PORT },
    })
  } else {
    // In production we use the standalone Next.js server that was created by
    // `next build` (enabled via `output: 'standalone'` in next.config.js).
    //
    // IMPORTANT: `process.execPath` points to the Electron binary, so spawning
    // it directly would recursively launch new GUI instances. By setting
    // ELECTRON_RUN_AS_NODE=1 we force the spawned Electron process to behave
    // like a regular Node.js runtime, preventing the infinite-process loop
    // that was exhausting system memory.
    // Resolve where the standalone Next.js server is located, depending on
    // whether the app is packaged with asar or not.
    const candidateServerPaths = [
      // When asar is disabled (our current config)
      path.join(process.resourcesPath, 'app', '.next', 'standalone', 'server.js'),
      // When asar is enabled but unpacked into app.asar.unpacked
      path.join(process.resourcesPath, 'app.asar.unpacked', '.next', 'standalone', 'server.js'),
      // Fallback to path relative to current file (inside asar)
      path.join(__dirname, '..', '.next', 'standalone', 'server.js'),
    ];

    const serverPath = candidateServerPaths.find((p) => fs.existsSync(p));

    if (!serverPath) {
      console.error('Could not locate standalone server.js in expected locations', candidateServerPaths);
      return;
    }

    // Ensure a writable SQLite DB lives in the userData directory, so the
    // packaged app never tries to write into the read-only resources folder.
    const dbPath = path.join(app.getPath('userData'), 'bill-tracker.sqlite');
    const databaseUrl = `file:${dbPath}`;

    // Ensure database schema exists before starting server
    runPrismaDbPush(path.dirname(serverPath), databaseUrl);

    nextProcess = childProcess.spawn(process.execPath, [serverPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PORT: NEXT_PORT,
        ELECTRON_RUN_AS_NODE: '1',
        DATABASE_URL: databaseUrl,
      },
      cwd: path.dirname(serverPath),
    });

    // In production capture stdout/stderr to a file for troubleshooting.
    if (!isDev) {
      nextLogStream = fs.createWriteStream(nextLogPath, { flags: 'a' });
      nextProcess.stdout?.pipe(nextLogStream);
      nextProcess.stderr?.pipe(nextLogStream);
    }
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
  if (nextLogStream) nextLogStream.close();
}); 