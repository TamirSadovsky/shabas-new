// main.mjs (ESM)
import { app, BrowserWindow, ipcMain } from 'electron';
import { exec } from 'child_process';
import path from 'path';
import si from 'systeminformation';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let win;

// Small RTL helper (still unused now, keep if you need)
const rtl = s => `\u202B${s}\u202C`;

// Single instance guard (optional but recommended)
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

// Create window
function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 800,
    autoHideMenuBar: true, // hide "File / Edit / ..." in prod
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // DEV ↔ PROD loader
  const DEV_URL = process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:5173';
  if (!app.isPackaged) {
    // Development: Vite dev server
    win.loadURL(DEV_URL);
    // win.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Production: built files
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

// ---------- Immediate actions: shutdown ----------
ipcMain.on('shutdown-now', () => {
  exec('shutdown /s /t 0', err => err && console.error(err));
});

// ---------- Custom modal (centered buttons) ----------
ipcMain.handle('confirm-shutdown', async () => {
  const modal = new BrowserWindow({
    parent: win,
    modal: true,
    width: 420,
    height: 220,
    resizable: false,
    minimizable: false,
    maximizable: false,
    show: false,
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: false, nodeIntegration: true },
    titleBarStyle: 'default',
  });

  modal.setMenuBarVisibility(false);

  const html = `
    <!doctype html>
    <html lang="he" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <style>
          html,body{margin:0;padding:0;font-family:Tahoma,Segoe UI,Arial,sans-serif;background:#fff}
          .wrap{
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            height:100%;padding:16px 16px 20px;
          }
          .title{
            font-weight:700;font-size:18px;color:#111;
            margin-bottom:40px;
            text-align:center;
          }
          .row{display:flex;gap:12px;justify-content:center;align-items:center;direction:rtl}
          button{
            padding:10px 16px;border-radius:10px;border:1px solid #d9d9d9;background:#f6f6f6;
            font-size:14px;cursor:pointer
          }
          .danger{background:#ffe9e9;border-color:#ffc8c8}
          button:focus{outline:2px solid #6aa9ff;outline-offset:2px}
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="title">האם לכבות את הטאבלט?</div>
          <div class="row">
            <button id="ok" class="danger" autofocus>כבה טאבלט</button>
            <button id="cancel">ביטול</button>
          </div>
        </div>
        <script>
          const { ipcRenderer } = require('electron');
          document.getElementById('ok').onclick = () => { ipcRenderer.send('modal-choice', 'ok'); };
          document.getElementById('cancel').onclick = () => { ipcRenderer.send('modal-choice', 'cancel'); };
          window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') ipcRenderer.send('modal-choice','cancel');
            if (e.key === 'Enter')  ipcRenderer.send('modal-choice','ok');
          });
        </script>
      </body>
    </html>
  `;

  modal.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  modal.once('ready-to-show', () => modal.show());

  const choice = await new Promise((resolve) => {
    const handler = (_e, val) => {
      resolve(val);
      ipcMain.removeListener('modal-choice', handler);
      if (!modal.isDestroyed()) modal.close();
    };
    ipcMain.on('modal-choice', handler);
  });

  return choice === 'ok';
});

// ---------- Battery: one-shot ----------
ipcMain.handle('get-battery', async () => {
  try {
    const b = await si.battery();
    return {
      hasBattery: b.hasbattery ?? b.hasBattery ?? false,
      percent: b.percent ?? null,
      isCharging: b.ischarging ?? b.isCharging ?? false,
      acConnected: b.acconnected ?? b.acConnected ?? false,
      timeRemaining: b.timeremaining ?? b.timeRemaining ?? null,
    };
  } catch {
    return { hasBattery: false, percent: null, isCharging: false, acConnected: false, timeRemaining: null };
  }
});

// ---------- Battery: resilient streaming (per-renderer) ----------
const batteryIntervals = new Map(); // key: webContents.id -> intervalId

ipcMain.on('subscribe-battery', (evt) => {
  const wc = evt.sender;
  const key = wc.id;

  // Already streaming for this renderer
  if (batteryIntervals.has(key)) return;

  const tick = async () => {
    // If the renderer is gone (reload/close), stop this interval cleanly
    if (wc.isDestroyed()) {
      const intervalId = batteryIntervals.get(key);
      if (intervalId) clearInterval(intervalId);
      batteryIntervals.delete(key);
      return;
    }

    try {
      const b = await si.battery();
      wc.send('battery-update', {
        hasBattery: b.hasbattery ?? b.hasBattery ?? false,
        percent: b.percent ?? null,
        isCharging: b.ischarging ?? b.isCharging ?? false,
        acConnected: b.acconnected ?? b.acConnected ?? false,
        timeRemaining: b.timeremaining ?? b.timeRemaining ?? null,
      });
    } catch {
      wc.send('battery-update', {
        hasBattery: false,
        percent: null,
        isCharging: false,
        acConnected: false,
        timeRemaining: null,
      });
    }
  };

  // Start now, then poll every 15s
  tick();
  const id = setInterval(tick, 15000);
  batteryIntervals.set(key, id);

  // Extra safety: if this webContents is destroyed, clear its interval
  wc.once('destroyed', () => {
    const intervalId = batteryIntervals.get(key);
    if (intervalId) clearInterval(intervalId);
    batteryIntervals.delete(key);
  });
});

ipcMain.on('unsubscribe-battery', (evt) => {
  const key = evt.sender.id;
  const id = batteryIntervals.get(key);
  if (id) clearInterval(id);
  batteryIntervals.delete(key);
});

// Global cleanup when all windows are closed
app.on('window-all-closed', () => {
  // Clear any remaining intervals
  for (const id of batteryIntervals.values()) clearInterval(id);
  batteryIntervals.clear();

  if (process.platform !== 'darwin') app.quit();
});

// macOS: re-create window when app icon clicked and no windows open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
