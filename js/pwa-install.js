/* PWA install prompt and service-worker registration for GitHub Pages. */
(() => {
  'use strict';
  let deferredPrompt = null;
  function addInstallButton() {
    const host = document.querySelector('.topbar-right');
    if (!host || document.getElementById('vlc-install-app')) return;
    const btn = document.createElement('button');
    btn.id = 'vlc-install-app';
    btn.className = 'mode-pill';
    btn.type = 'button';
    btn.textContent = 'Install App';
    btn.title = 'Install this player as a desktop app';
    btn.hidden = true;
    btn.addEventListener('click', async () => {
      if (!deferredPrompt) {
        alert('If Install App is unavailable, open your browser menu and choose Install page as app / Apps → Install this site.');
        return;
      }
      deferredPrompt.prompt();
      await deferredPrompt.userChoice.catch(() => null);
      deferredPrompt = null;
      btn.hidden = true;
    });
    host.appendChild(btn);
  }
  window.addEventListener('DOMContentLoaded', () => {
    addInstallButton();
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(err => console.warn('PWA offline cache unavailable:', err));
    }
  });
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    addInstallButton();
    const btn = document.getElementById('vlc-install-app');
    if (btn) btn.hidden = false;
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const btn = document.getElementById('vlc-install-app');
    if (btn) btn.hidden = true;
  });
})();