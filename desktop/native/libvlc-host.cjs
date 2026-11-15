const path = require('node:path');
const koffi = require('koffi');

class LibVLCNativeHost {
  constructor({ libDir }) {
    if (process.platform !== 'win32') {
      throw new Error('The first native video-surface implementation currently targets Windows. Linux/macOS adapters are not wired yet.');
    }
    const dll = path.join(libDir, 'libvlc.dll');
    this.lib = koffi.load(dll);
    this.user32 = koffi.load('user32.dll');
    this.defineApi();
    this.player = null;
    this.media = null;
    this.videoWindow = null;
    this.parentWindow = null;
    this.instance = this.lib.libvlc_new(0, null);
    if (!this.instance) throw new Error('libvlc_new failed. Check libvlc.dll and its plugins directory.');
  }

  defineApi() {
    const L = this.lib;
    L.func('void* libvlc_new(int argc, void* argv)');
    L.func('void libvlc_release(void* instance)');
    L.func('void* libvlc_media_player_new(void* instance)');
    L.func('void libvlc_media_player_release(void* player)');
    L.func('void* libvlc_media_new_path(void* instance, const char* path)');
    L.func('void libvlc_media_release(void* media)');
    L.func('void libvlc_media_player_set_media(void* player, void* media)');
    L.func('int libvlc_media_player_play(void* player)');
    L.func('void libvlc_media_player_pause(void* player)');
    L.func('void libvlc_media_player_stop(void* player)');
    L.func('void libvlc_media_player_set_hwnd(void* player, void* hwnd)');
    L.func('int libvlc_audio_get_track_count(void* player)');
    L.func('int libvlc_audio_get_track(void* player)');
    L.func('int libvlc_audio_set_track(void* player, int id)');
    L.func('int libvlc_video_get_spu_count(void* player)');
    L.func('int libvlc_video_get_spu(void* player)');
    L.func('int libvlc_video_set_spu(void* player, int id)');
    L.func('int libvlc_video_set_subtitle_file(void* player, const char* path)');
    L.func('void* libvlc_audio_get_track_description(void* player)');
    L.func('void* libvlc_video_get_spu_description(void* player)');
    L.func('void libvlc_track_description_list_release(void* list)');
    this.user32.func('void* CreateWindowExW(uint32_t exStyle, const wchar_t* className, const wchar_t* windowName, uint32_t style, int x, int y, int width, int height, void* parent, void* menu, void* instance, void* param)');
    this.user32.func('int SetWindowPos(void* hwnd, void* insertAfter, int x, int y, int cx, int cy, uint32_t flags)');
    this.user32.func('int ShowWindow(void* hwnd, int command)');
    this.user32.func('int DestroyWindow(void* hwnd)');
  }

  getStatus() {
    return { available: true, name: 'libVLC', platform: process.platform, native: true,
      features: ['offline media decoding', 'HEVC/H.265 (if enabled in bundled libVLC build)', 'multi-audio tracks', 'external subtitles'] };
  }

  ensureVideoSurface() {
    if (this.videoWindow) return;
    // Electron supplies its native HWND through the main process.
    const { BrowserWindow } = require('electron');
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) throw new Error('Main application window is not ready.');
    this.parentWindow = koffi.as(win.getNativeWindowHandle(), 'void*');
    this.videoWindow = this.user32.CreateWindowExW(
      0, 'STATIC', '', 0x40000000 | 0x10000000 | 0x04000000 | 0x02000000,
      0, 48, 800, 450, this.parentWindow, null, null, null
    );
    if (!this.videoWindow) throw new Error('Could not create the native video surface.');
    this.lib.libvlc_media_player_set_hwnd(this.player, this.videoWindow);
  }

  open(filePath) {
    this.stop();
    if (this.media) { this.lib.libvlc_media_release(this.media); this.media = null; }
    if (!this.player) this.player = this.lib.libvlc_media_player_new(this.instance);
    if (!this.player) throw new Error('libvlc_media_player_new failed.');
    this.media = this.lib.libvlc_media_new_path(this.instance, filePath);
    if (!this.media) throw new Error('libVLC could not open this media path.');
    this.lib.libvlc_media_player_set_media(this.player, this.media);
    this.ensureVideoSurface();
    const result = this.lib.libvlc_media_player_play(this.player);
    if (result < 0) throw new Error('libVLC could not start playback.');
    return true;
  }

  setVideoBounds({ x, y, width, height }) {
    if (!this.videoWindow) return;
    this.user32.SetWindowPos(this.videoWindow, null, x, y, width, height, 0x0010 | 0x0004);
  }
  hideVideo() { if (this.videoWindow) this.user32.ShowWindow(this.videoWindow, 0); }
  play() { return this.player ? this.lib.libvlc_media_player_play(this.player) : false; }
  pause() { if (this.player) this.lib.libvlc_media_player_pause(this.player); }
  stop() { if (this.player) this.lib.libvlc_media_player_stop(this.player); }

  readDescriptions(pointer) {
    const rows = [];
    const Desc = koffi.struct('libvlc_track_description_t', { i_id: 'int', psz_name: 'str', p_next: 'void*' });
    let node = pointer;
    let guard = 0;
    while (node && guard++ < 128) {
      const item = koffi.decode(node, Desc);
      rows.push({ id: item.i_id, label: item.psz_name || 'Track ' + (rows.length + 1) });
      node = item.p_next;
    }
    return rows;
  }

  getTracks() {
    if (!this.player) return { audio: [], subtitles: [] };
    const audioPtr = this.lib.libvlc_audio_get_track_description(this.player);
    const subPtr = this.lib.libvlc_video_get_spu_description(this.player);
    const audio = audioPtr ? this.readDescriptions(audioPtr) : [];
    const subtitles = subPtr ? this.readDescriptions(subPtr) : [];
    if (audioPtr) this.lib.libvlc_track_description_list_release(audioPtr);
    if (subPtr) this.lib.libvlc_track_description_list_release(subPtr);
    return { audio, subtitles };
  }
  selectAudio(id) { if (!this.player) throw new Error('No media is playing.'); return this.lib.libvlc_audio_set_track(this.player, id); }
  selectSubtitle(id) { if (!this.player) throw new Error('No media is playing.'); return this.lib.libvlc_video_set_spu(this.player, id); }
  addSubtitle(filePath) { if (!this.player) throw new Error('No media is playing.'); return this.lib.libvlc_video_set_subtitle_file(this.player, filePath); }

  dispose() {
    this.stop();
    if (this.videoWindow) this.user32.DestroyWindow(this.videoWindow);
    if (this.media) this.lib.libvlc_media_release(this.media);
    if (this.player) this.lib.libvlc_media_player_release(this.player);
    if (this.instance) this.lib.libvlc_release(this.instance);
    this.videoWindow = this.media = this.player = this.instance = null;
  }
}

module.exports = { LibVLCNativeHost };