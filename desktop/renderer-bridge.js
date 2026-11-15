(() => {
  'use strict';
  if (!window.vlcNative) return;
  const bridge = window.vlcNative;
  const api = window.VLCDesktop = {
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

  const panel = document.createElement('section');
  panel.id = 'vlc-native-toolbar';
  panel.innerHTML = `
    <style>
      #vlc-native-toolbar{position:fixed;right:16px;top:52px;z-index:2147483000;display:flex;gap:6px;align-items:center;flex-wrap:wrap;max-width:min(620px,70vw);padding:8px;background:rgba(18,18,18,.94);border:1px solid #59401f;border-radius:10px;box-shadow:0 8px 28px #0008;color:#eee;font:12px Segoe UI,sans-serif}
      #vlc-native-toolbar button,#vlc-native-toolbar select{height:30px;padding:0 9px;border:1px solid #555;border-radius:6px;background:#242424;color:#eee}
      #vlc-native-toolbar button:first-child{background:#bd6b13;border-color:#df8a25}
      #vlc-native-toolbar .status{color:#d9a15c;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    </style>
    <button data-act="open">Open Local File</button>
    <button data-act="play">Play</button><button data-act="pause">Pause</button><button data-act="stop">Stop</button>
    <select data-track="audio" aria-label="Audio track"><option value="">Audio tracks</option></select>
    <select data-track="sub" aria-label="Subtitle track"><option value="-1">Subtitles off</option></select>
    <button data-act="subtitle">Add subtitle</button><span class="status">Checking libVLC…</span>`;
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(panel));
  if (document.readyState !== 'loading') document.body.appendChild(panel);

  const status = panel.querySelector('.status');
  const audioSelect = panel.querySelector('[data-track="audio"]');
  const subSelect = panel.querySelector('[data-track="sub"]');
  const refreshTracks = async () => {
    try {
      const [audio, subs] = await Promise.all([api.audioTracks(), api.subtitleTracks()]);
      audioSelect.innerHTML = '<option value="">Audio tracks</option>' + audio.map(t => `<option value="${t.id}">${String(t.label).replace(/[&<>"]/g,'')}</option>`).join('');
      subSelect.innerHTML = '<option value="-1">Subtitles off</option>' + subs.map(t => `<option value="${t.id}">${String(t.label).replace(/[&<>"]/g,'')}</option>`).join('');
    } catch (e) { status.textContent = e.message; }
  };
  panel.addEventListener('click', async event => {
    const button = event.target.closest('button[data-act]');
    if (!button) return;
    try {
      const action = button.dataset.act;
      if (action === 'open') {
        const file = await api.open();
        if (file) { status.textContent = file.name; await refreshTracks(); }
      } else if (action === 'subtitle') {
        const name = await api.addSubtitle();
        if (name) { status.textContent = 'Subtitle: ' + name; await refreshTracks(); }
      } else if (action === 'play') await api.play();
      else if (action === 'pause') await api.pause();
      else if (action === 'stop') await api.stop();
    } catch (error) { status.textContent = error.message || 'Native playback error'; }
  });
  audioSelect.addEventListener('change', async () => {
    if (audioSelect.value !== '') await api.selectAudio(Number(audioSelect.value));
  });
  subSelect.addEventListener('change', async () => api.selectSubtitle(Number(subSelect.value)));

  const video = () => document.querySelector('#real-video-el, #net-video-el, video');
  let last = '';
  const updateBounds = () => {
    const el = video();
    if (!el) return;
    const r = el.getBoundingClientRect();
    const bounds = { x: Math.round(r.left), y: Math.round(r.top),
      width: Math.round(r.width), height: Math.round(r.height) };
    const key = JSON.stringify(bounds);
    if (key !== last && r.width > 0 && r.height > 0) {
      last = key;
      bridge.setVideoBounds(bounds);
    }
  };
  if ('ResizeObserver' in window) new ResizeObserver(updateBounds).observe(document.documentElement);
  window.addEventListener('resize', updateBounds);
  window.addEventListener('scroll', updateBounds, true);
  setInterval(updateBounds, 700);
  bridge.onReady(async () => {
    const result = await api.status();
    status.textContent = result.available ? 'libVLC native engine ready' : result.error;
    setTimeout(updateBounds, 300);
  });
})();