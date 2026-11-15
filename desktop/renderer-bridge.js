(() => {
  'use strict';
  if (!window.vlcNative) return;
  const bridge = window.vlcNative;
  window.VLCDesktop = {
    open: () => bridge.openDialog(),
    play: () => bridge.play(),
    pause: () => bridge.pause(),
    stop: () => bridge.stop(),
    status: () => bridge.getStatus(),
    audioTracks: () => bridge.listAudioTracks(),
    subtitleTracks: () => bridge.listSubtitleTracks(),
    selectAudio: id => bridge.selectAudioTrack(id),
    selectSubtitle: id => bridge.selectSubtitleTrack(id),
    addSubtitle: () => bridge.loadSubtitle()
  };

  const video = () => document.querySelector('#real-video-el, #net-video-el, video');
  let last = '';
  const updateBounds = () => {
    const el = video();
    if (!el) { bridge.hideVideo(); return; }
    const r = el.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    const bounds = { x: Math.round(r.left * scale), y: Math.round(r.top * scale),
      width: Math.round(r.width * scale), height: Math.round(r.height * scale) };
    const key = JSON.stringify(bounds);
    if (key !== last && r.width > 0 && r.height > 0) {
      last = key;
      bridge.setVideoBounds(bounds);
    }
  };
  new ResizeObserver(updateBounds).observe(document.documentElement);
  window.addEventListener('resize', updateBounds);
  window.addEventListener('scroll', updateBounds, true);
  setInterval(updateBounds, 700);
  bridge.onReady(() => setTimeout(updateBounds, 300));
})();