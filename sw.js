/* Same-origin app-shell cache. External media/streams are never cached. */
const CACHE_NAME = 'vlc-player-shell-v3';
const APP_SHELL = [
  './', './index.html', './manifest.webmanifest',
  './js/network-playlists.js', './js/video-codec-compat.js',
  './js/youtube-playlists.js', './js/zoom-panel-behavior.js',
  './js/miniplayer-video.js', './js/pwa-install.js',
  './js/ffmpeg-wasm-decoder.js', './js/player-enhancements.js',
  './css/network-playlists.css', './css/zoom-panel-behavior.css',
  './css/miniplayer-video.css', './icons/player-icon.svg'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
      }
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
    }
    return response;
  })));
});