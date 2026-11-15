/* Mirrors the active video into the floating mini-player only while it is visible. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  let syncTimer = 0;
  function sync() {
    const mini = byId('mini-video-el'), shell = byId('miniplayer');
    const real = byId('real-video-el'), net = byId('net-video-el');
    if (!mini || !shell) return;
    const opened = shell.classList.contains('open');
    const source = (net && net.style.display !== 'none' && net.currentSrc) ? net : real;
    if (!opened || !source || !source.currentSrc || source.readyState < 1) {
      if (!opened) { mini.pause(); }
      return;
    }
    mini.muted = true;
    mini.playsInline = true;
    if (mini.src !== source.currentSrc) {
      mini.src = source.currentSrc;
      mini.load();
    }
    try {
      if (Number.isFinite(source.currentTime) && Math.abs(mini.currentTime - source.currentTime) > 0.8) mini.currentTime = source.currentTime;
    } catch (_) {}
    if (!source.paused && mini.paused) mini.play().catch(() => {});
    if (source.paused && !mini.paused) mini.pause();
  }
  window.addEventListener('DOMContentLoaded', () => {
    const shell = byId('miniplayer');
    if (!shell) return;
    new MutationObserver(sync).observe(shell, { attributes: true, attributeFilter: ['class'] });
    ['play','pause','timeupdate','loadedmetadata','emptied'].forEach(name => {
      [byId('real-video-el'), byId('net-video-el')].filter(Boolean).forEach(el => el.addEventListener(name, sync));
    });
    syncTimer = window.setInterval(sync, 700);
    window.addEventListener('beforeunload', () => clearInterval(syncTimer), { once: true });
  });
})();