const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vlcNative', Object.freeze({
  name: 'libVLC Native Engine',
  getStatus: () => ipcRenderer.invoke('vlc:status'),
  openDialog: () => ipcRenderer.invoke('vlc:open-dialog'),
  openPath: filePath => ipcRenderer.invoke('vlc:open-path', filePath),
  play: () => ipcRenderer.invoke('vlc:play'),
  pause: () => ipcRenderer.invoke('vlc:pause'),
  stop: () => ipcRenderer.invoke('vlc:stop'),
  listAudioTracks: async () => (await ipcRenderer.invoke('vlc:tracks')).audio,
  listSubtitleTracks: async () => (await ipcRenderer.invoke('vlc:tracks')).subtitles,
  selectAudioTrack: id => ipcRenderer.invoke('vlc:select-audio', id),
  selectSubtitleTrack: id => ipcRenderer.invoke('vlc:select-subtitle', id),
  loadSubtitle: () => ipcRenderer.invoke('vlc:add-subtitle'),
  setVideoBounds: bounds => ipcRenderer.send('vlc:video-bounds', bounds),
  hideVideo: () => ipcRenderer.send('vlc:video-hidden'),
  onReady: callback => ipcRenderer.on('desktop:ready', (_event, info) => callback(info))
}));