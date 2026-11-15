const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { LibVLCNativeHost } = require('./native/libvlc-host.cjs');

let win;
let vlc;
let videoBounds = { x: 0, y: 48, width: 800, height: 450 };

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 860, minHeight: 560,
    backgroundColor: '#090909',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.loadFile(path.join(__dirname, '..', 'index.html'));
  win.on('resize', () => positionVideoSurface());
  win.on('closed', () => { win = null; });
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('desktop:ready', { platform: process.platform });
  });
}

function positionVideoSurface() {
  if (vlc && win && !win.isDestroyed()) {
    const rect = win.getContentBounds();
    vlc.setVideoBounds({
      x: Math.max(0, Math.round(videoBounds.x)),
      y: Math.max(0, Math.round(videoBounds.y)),
      width: Math.max(1, Math.min(rect.width, Math.round(videoBounds.width))),
      height: Math.max(1, Math.min(rect.height, Math.round(videoBounds.height)))
    });
  }
}

app.whenReady().then(() => {
  try {
    const bundled = path.join(process.resourcesPath || __dirname, 'libvlc');
    const libPath = process.env.LIBVLC_PATH || bundled;
    vlc = new LibVLCNativeHost({ libDir: libPath });
  } catch (error) {
    console.error('[libVLC]', error);
  }
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

ipcMain.handle('vlc:status', () => vlc ? vlc.getStatus() : {
  available: false, error: 'libVLC could not be loaded. Install VLC/libVLC or set LIBVLC_PATH.'
});
ipcMain.handle('vlc:open-dialog', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'Media', extensions: ['mkv','mp4','mov','avi','webm','ts','m2ts','mp3','flac','wav','m4a','ogg'] }]
  });
  if (result.canceled || !result.filePaths[0]) return null;
  if (!vlc) throw new Error('libVLC is not available.');
  vlc.open(result.filePaths[0]);
  return { path: result.filePaths[0], name: path.basename(result.filePaths[0]) };
});
ipcMain.handle('vlc:open-path', (_event, filePath) => {
  if (!vlc) throw new Error('libVLC is not available.');
  if (typeof filePath !== 'string' || !path.isAbsolute(filePath) || !fs.existsSync(filePath)) throw new Error('Invalid local media path.');
  vlc.open(filePath);
  return { path: filePath, name: path.basename(filePath) };
});
ipcMain.handle('vlc:play', () => vlc?.play());
ipcMain.handle('vlc:pause', () => vlc?.pause());
ipcMain.handle('vlc:stop', () => vlc?.stop());
ipcMain.handle('vlc:tracks', () => vlc?.getTracks() || { audio: [], subtitles: [] });
ipcMain.handle('vlc:select-audio', (_e, id) => vlc?.selectAudio(Number(id)));
ipcMain.handle('vlc:select-subtitle', (_e, id) => vlc?.selectSubtitle(Number(id)));
ipcMain.handle('vlc:add-subtitle', async () => {
  const result = await dialog.showOpenDialog(win, { properties: ['openFile'], filters: [{ name: 'Subtitles', extensions: ['srt','ass','ssa','vtt','sub'] }] });
  if (result.canceled || !result.filePaths[0]) return null;
  vlc?.addSubtitle(result.filePaths[0]);
  return path.basename(result.filePaths[0]);
});
ipcMain.on('vlc:video-bounds', (_e, bounds) => {
  if (!bounds || !['x','y','width','height'].every(k => Number.isFinite(bounds[k]))) return;
  videoBounds = bounds;
  positionVideoSurface();
});
ipcMain.on('vlc:video-hidden', () => vlc?.hideVideo());

app.on('before-quit', () => { try { vlc?.dispose(); } catch {} });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });