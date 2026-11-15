/* Keeps the four-edge zoom editor open while the user previews adjustments. */
(() => {
  'use strict';
  const panel = () => document.getElementById('pop-zoom-4side');
  const body = () => document.getElementById('pop-zoom-4side-body');
  function ensureOk() {
    const p = panel(), b = body();
    if (!p || !b || !p.classList.contains('open') || b.querySelector('#vlc-zoom-confirm')) return;
    const footer = document.createElement('div');
    footer.className = 'vlc-zoom-confirm-row';
    footer.innerHTML = '<button type="button" class="btn-primary" id="vlc-zoom-confirm">OK</button>';
    b.appendChild(footer);
    footer.querySelector('button').addEventListener('click', () => {
      p.classList.remove('open');
      if (window.showToast) window.showToast('4-Side Zoom settings applied.');
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    const b = body();
    if (!b) return;
    new MutationObserver(ensureOk).observe(b, { childList: true, subtree: true });
    ensureOk();
  });
  document.addEventListener('click', event => {
    const p = panel();
    if (p && p.classList.contains('open') && !event.target.closest('#pop-zoom-4side')) {
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener('keydown', event => {
    const p = panel();
    if (p && p.classList.contains('open') && event.key === 'Escape') {
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }, true);
})();