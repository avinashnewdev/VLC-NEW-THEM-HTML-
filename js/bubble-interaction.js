/* Global soft bubble press feedback for interactive controls. */
(() => {
  'use strict';
  if (window.__vlcBubbleFeedbackInstalled) return;
  window.__vlcBubbleFeedbackInstalled = true;

  const style = document.createElement('style');
  style.id = 'vlc-bubble-feedback-style';
  style.textContent = `
    .vlc-bubble-target{position:relative!important;isolation:isolate}
    .vlc-press-bubble{position:absolute;z-index:0;pointer-events:none;width:14px;height:14px;border-radius:50%;
      left:var(--vlc-bubble-x,50%);top:var(--vlc-bubble-y,50%);
      background:radial-gradient(circle,rgba(255,255,255,.42) 0%,rgba(255,255,255,.18) 38%,rgba(211,121,24,.2) 68%,rgba(211,121,24,0) 100%);
      transform:translate(-50%,-50%) scale(.15);opacity:0;
      animation:vlcBubblePop 560ms cubic-bezier(.16,1,.3,1) forwards}
    .vlc-bubble-target>*:not(.vlc-press-bubble){position:relative;z-index:1}
    @keyframes vlcBubblePop{
      0%{transform:translate(-50%,-50%) scale(.15);opacity:0}
      16%{opacity:.9}
      62%{transform:translate(-50%,-50%) scale(8.5);opacity:.28}
      100%{transform:translate(-50%,-50%) scale(10);opacity:0}
    }
    @media(prefers-reduced-motion:reduce){.vlc-press-bubble{animation-duration:1ms}}
  `;
  (document.head || document.documentElement).appendChild(style);

  const selector = [
    'button', '[role="button"]', '.icon-btn', '.mode-pill', '.crumb-item',
    '.settings-cat-btn', '.tab-btn', '.control-btn', '.transport-btn',
    '.playlist-item', '.library-item', '.vlc-enhancement-action',
    '.vlc-profile-actions button', '.win-btn', '.eq-band button'
  ].join(',');

  document.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const target = event.target.closest(selector);
    if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;
    if (target.matches('input,select,textarea,label') || target.closest('input,select,textarea')) return;

    target.classList.add('vlc-bubble-target');
    const rect = target.getBoundingClientRect();
    const bubble = document.createElement('span');
    bubble.className = 'vlc-press-bubble';
    bubble.setAttribute('aria-hidden', 'true');
    bubble.style.setProperty('--vlc-bubble-x', Math.max(0, Math.min(rect.width, event.clientX - rect.left)) + 'px');
    bubble.style.setProperty('--vlc-bubble-y', Math.max(0, Math.min(rect.height, event.clientY - rect.top)) + 'px');
    target.appendChild(bubble);
    bubble.addEventListener('animationend', () => bubble.remove(), { once: true });
    window.setTimeout(() => { if (bubble.isConnected) bubble.remove(); }, 750);
  }, { passive: true, capture: true });
})();