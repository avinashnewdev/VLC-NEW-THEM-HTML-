/* VLC Player enhancements: artwork-reactive spectrum, appearance controls, user profile and subtitle lookup. */
(() => {
  'use strict';
  const STORE='vlc-player-enhancements-v1';
  const defaults={uiBlur:18,artBlur:22,reflection:32,spectrumMode:'artwork',subtitleLanguage:'eng',openSubtitlesApiKey:'',profile:{name:'',email:'',avatar:''}};
  let cfg={...defaults};
  try{cfg={...defaults,...JSON.parse(localStorage.getItem(STORE)||'{}')};cfg.profile={...defaults.profile,...(cfg.profile||{})};}catch{}
  const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(cfg));}catch{}};
  const root=document.documentElement;
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
  function applyLook(){
    root.style.setProperty('--vlc-ui-blur',cfg.uiBlur+'px');
    root.style.setProperty('--vlc-art-blur',cfg.artBlur+'px');
    root.style.setProperty('--vlc-art-reflection',clamp(cfg.reflection,0,100)+'%');
    document.querySelectorAll('#controls-bar,.floating-popover,.yt-embed-toolbar,.subtitle-style-panel').forEach(el=>{
      el.style.backdropFilter='blur('+cfg.uiBlur+'px)';
      el.style.webkitBackdropFilter='blur('+cfg.uiBlur+'px)';
    });
    const art=document.querySelector('.music-cover-art img[alt="Album Artwork"], .music-cover-art img, #music-cover-art img');
    if(art){art.style.filter='';art.style.transform='';root.style.setProperty('--vlc-art-bg','url("'+String(art.currentSrc||art.src).replace(/["\\\\]/g,'')+'")');}
    const cover=document.querySelector('.music-cover-art');
    if(cover){cover.style.setProperty('--vlc-reflection-opacity',String(clamp(cfg.reflection,0,100)/100));cover.style.setProperty('--vlc-art-blur',cfg.artBlur+'px');cover.style.setProperty('--vlc-art-reflection',clamp(cfg.reflection,0,100)+'%');}
  }
  function addStyles(){
    if(document.getElementById('vlc-enhancement-styles'))return;
    const st=document.createElement('style');st.id='vlc-enhancement-styles';st.textContent=`
      .vlc-enhancement-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 0;border-bottom:1px solid var(--div-dim)}
      .vlc-enhancement-row label{color:var(--fg-2);font-size:13px;flex:1}
      .vlc-enhancement-row input[type=range]{width:min(220px,45%);accent-color:var(--accent)}
      .vlc-enhancement-row output{min-width:48px;text-align:right;color:var(--accent);font-variant-numeric:tabular-nums}
      .vlc-enhancement-input{width:100%;background:var(--bg-b1);border:1px solid var(--div-bright);border-radius:7px;padding:9px 11px;color:var(--fg-1);margin:5px 0 12px}
      .vlc-enhancement-action{padding:8px 13px;border:1px solid var(--div-bright);border-radius:7px;background:var(--bg-a3);color:var(--fg-1);cursor:pointer}
      .vlc-enhancement-action.primary{background:var(--accent);color:#111;border-color:var(--accent)}
      .vlc-enhancement-note{font-size:11px;color:var(--fg-a2);line-height:1.5}
      .music-cover-art{position:relative}
      .music-cover-art:before{content:"";position:absolute;inset:-18px;z-index:0;pointer-events:none;background-image:var(--vlc-art-bg);background-size:cover;background-position:center;filter:blur(var(--vlc-art-blur,22px));opacity:.5;transform:scale(1.08)}
      .music-cover-art img{position:relative;z-index:1}\n      .music-cover-art:after{content:"";position:absolute;left:0;right:0;top:100%;height:var(--vlc-art-reflection,32%);pointer-events:none;opacity:var(--vlc-reflection-opacity,.32);background-image:var(--vlc-art-bg);background-size:cover;background-position:center;transform:scaleY(-1);filter:blur(2px);mask-image:linear-gradient(to bottom,rgba(0,0,0,.55),transparent)}
    `;document.head.appendChild(st);
  }
  function addSettingsTab(){
    const side=document.querySelector('.settings-sidebar');if(!side||document.getElementById('vlc-profile-tab'))return;
    const group=document.createElement('div');group.className='settings-group-label';group.textContent='Personal';
    const btn=document.createElement('button');btn.className='settings-cat-btn';btn.id='vlc-profile-tab';btn.textContent='Profile & Appearance';
    side.append(group,btn);
    btn.addEventListener('click',renderProfileSettings);
  }
  function card(title,html){return '<section class="settings-card"><h4>'+title+'</h4>'+html+'</section>';}
  function rangeRow(label,key,min,max,step,unit,prefix='vlc-'){
    const id=prefix+key;const val=cfg[key];return '<div class="vlc-enhancement-row"><label for="'+id+'">'+label+'</label><input id="'+id+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'"><output id="'+id+'-out">'+val+unit+'</output></div>';
  }
  function renderProfileSettings(){
    const body=document.getElementById('settings-cat-body');if(!body)return;
    document.querySelectorAll('.settings-cat-btn').forEach(b=>b.classList.toggle('active',b.id==='vlc-profile-tab'));
    document.getElementById('settings-cat-title').textContent='Profile & Appearance';
    body.innerHTML=card('Your profile','<p class="vlc-enhancement-note">No profile is created by default. Create and save your own profile only when you choose.</p><label class="pop-label">Display name</label><input class="vlc-enhancement-input" id="vlc-profile-name" maxlength="60" placeholder="Enter your name" value="'+esc(cfg.profile.name)+'"><label class="pop-label">Email (optional)</label><input class="vlc-enhancement-input" id="vlc-profile-email" type="email" maxlength="120" placeholder="Email address" value="'+esc(cfg.profile.email)+'"><label class="pop-label">Avatar image URL (optional)</label><input class="vlc-enhancement-input" id="vlc-profile-avatar" type="url" placeholder="https://…" value="'+esc(cfg.profile.avatar)+'"><button class="vlc-enhancement-action primary" id="vlc-profile-save">Save profile</button> <button class="vlc-enhancement-action" id="vlc-profile-clear">Delete profile</button><p class="vlc-enhancement-note" id="vlc-profile-status"></p>')+
    card('Visual customization',rangeRow('Interface glass blur','uiBlur',0,40,1,'px')+rangeRow('Album-art background blur','artBlur',0,50,1,'px')+rangeRow('Artwork reflection strength','reflection',0,100,1,'%')+'<p class="vlc-enhancement-note">Changes apply immediately and are saved on this device.</p>')+
    card('FFmpeg software decoding','<p class="vlc-enhancement-note">Decode the currently selected local media file with the optional FFmpeg/WebAssembly engine. The first use downloads the decoder core.</p><button class="vlc-enhancement-action" id="vlc-ffmpeg-decode">Decode selected local file</button><p class="vlc-enhancement-note" id="vlc-ffmpeg-status"></p>')+\n    card('Automatic online subtitles','<label class="pop-label">Subtitle language (ISO 639-2)</label><input class="vlc-enhancement-input" id="vlc-sub-lang" maxlength="3" value="'+esc(cfg.subtitleLanguage)+'" placeholder="eng"><label class="pop-label">OpenSubtitles API key</label><input class="vlc-enhancement-input" id="vlc-sub-key" type="password" autocomplete="off" placeholder="Add your own OpenSubtitles API key" value="'+esc(cfg.openSubtitlesApiKey)+'"><button class="vlc-enhancement-action" id="vlc-sub-test">Save subtitle settings</button><p class="vlc-enhancement-note">Online subtitle search needs an OpenSubtitles API key. The key is stored locally in this browser only. Search is offered when a local video is loaded; protected or DRM streams are not modified.</p>');
    ['uiBlur','artBlur','reflection'].forEach(k=>{const el=document.getElementById('vlc-'+k);el.addEventListener('input',()=>{cfg[k]=Number(el.value);document.getElementById('vlc-'+k+'-out').textContent=el.value+(k==='reflection'?'%':'px');save();applyLook();});});
    document.getElementById('vlc-profile-save').onclick=()=>{cfg.profile={name:document.getElementById('vlc-profile-name').value.trim(),email:document.getElementById('vlc-profile-email').value.trim(),avatar:document.getElementById('vlc-profile-avatar').value.trim()};save();document.getElementById('vlc-profile-status').textContent=cfg.profile.name?'Profile saved on this device.':'Enter a display name to create a profile.';};
    document.getElementById('vlc-profile-clear').onclick=()=>{cfg.profile={...defaults.profile};save();renderProfileSettings();};
    document.getElementById('vlc-ffmpeg-decode').onclick=async()=>{const status=document.getElementById('vlc-ffmpeg-status');const file=document.getElementById('local-media-input')?.files?.[0];if(!file){status.textContent='Select a local file using Open File first.';return;}if(!window.VLCSoftwareDecoder){status.textContent='FFmpeg decoder module is not available.';return;}status.textContent='Loading FFmpeg…';try{const result=await window.VLCSoftwareDecoder.decode(file,{onProgress:p=>status.textContent='Decoding '+Math.round(p*100)+'%'});const audio=/^(audio)\\//.test(file.type);const target=document.getElementById(audio?'real-audio-el':'real-video-el');if(!target)throw new Error('Playback element unavailable');if(window.__vlcDecodedObjectUrl)URL.revokeObjectURL(window.__vlcDecodedObjectUrl);window.__vlcDecodedObjectUrl=result.url;target.src=result.url;await target.play();status.textContent='Software-decoded output is playing.';}catch(e){status.textContent='Decode failed: '+e.message;}};\n    document.getElementById('vlc-sub-test').onclick=()=>{cfg.subtitleLanguage=(document.getElementById('vlc-sub-lang').value||'eng').trim().slice(0,3);cfg.openSubtitlesApiKey=document.getElementById('vlc-sub-key').value.trim();save();toast('Subtitle settings saved');};
  }
  function esc(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function toast(msg){const el=document.getElementById('vlc-toast');if(el){el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2400);}else console.info(msg);}
  function addCustomizeControls(){
    const box=document.querySelector('#customize-modal .customize-box');if(!box||document.getElementById('vlc-visual-customize'))return;
    const section=document.createElement('section');section.id='vlc-visual-customize';section.className='settings-card';section.style.marginTop='14px';
    section.innerHTML='<h4>Visual effects</h4>'+rangeRow('Interface glass blur','uiBlur',0,40,1,'px','vlc-custom-')+rangeRow('Album-art background blur','artBlur',0,50,1,'px','vlc-custom-')+rangeRow('Artwork reflection strength','reflection',0,100,1,'%','vlc-custom-')+'<button class="vlc-enhancement-action" id="vlc-open-profile-settings">More profile & subtitle settings</button>';
    box.appendChild(section);
    ['uiBlur','artBlur','reflection'].forEach(k=>{const el=document.getElementById('vlc-custom-'+k);el.addEventListener('input',()=>{cfg[k]=Number(el.value);document.getElementById('vlc-custom-'+k+'-out').textContent=el.value+(k==='reflection'?'%':'px');save();applyLook();});});
    document.getElementById('vlc-open-profile-settings').onclick=()=>{const modal=document.getElementById('modal-settings');document.querySelectorAll('.modal-backdrop').forEach(m=>m.classList.remove('open'));modal.classList.add('open');addSettingsTab();renderProfileSettings();};
  }
  function currentVideoTitle(){
    const media=document.querySelector('#real-video-el, #net-video-el');const src=media?.currentSrc||media?.src||'';
    try{return decodeURIComponent(new URL(src,location.href).pathname.split('/').pop().replace(/\.[^.]+$/,'')).replace(/[._-]+/g,' ').trim();}catch{return document.title;}
  }
  async function searchOnlineSubtitles(){
    if(!cfg.openSubtitlesApiKey){toast('Add an OpenSubtitles API key in Profile & Appearance settings first.');return;}
    const query=currentVideoTitle();if(!query){toast('Could not detect the video title.');return;}
    try{
      toast('Searching online subtitles…');
      const url='https://api.opensubtitles.com/api/v1/subtitles?'+new URLSearchParams({query, languages:cfg.subtitleLanguage||'eng', order_by:'download_count', order_direction:'desc'});
      const res=await fetch(url,{headers:{'Api-Key':cfg.openSubtitlesApiKey,'Content-Type':'application/json'}});
      if(!res.ok)throw new Error('OpenSubtitles returned HTTP '+res.status);
      const data=await res.json();const results=(data.data||[]).slice(0,8);
      const list=document.getElementById('add-subs-list');if(!list)throw new Error('Subtitle dialog is not available');
      list.innerHTML='';
      if(!results.length){list.textContent='No matching subtitles found.';return;}
      results.forEach(item=>{const a=item.attributes||{};const file=(a.files||[])[0];if(!file)return;const row=document.createElement('div');row.className='vlc-enhancement-row';const label=document.createElement('label');label.textContent=(a.release||a.feature_details?.title||'Subtitle')+' · '+(a.language||cfg.subtitleLanguage);const b=document.createElement('button');b.className='vlc-enhancement-action';b.textContent='Download & load';b.onclick=()=>downloadSubtitle(file.file_id,b);row.append(label,b);list.appendChild(row);});
      if(!list.children.length)list.textContent='No downloadable subtitle files were returned.';
    }catch(e){console.error(e);toast('Subtitle search failed: '+e.message);}
  }
  async function downloadSubtitle(fileId,button){
    try{
      button.disabled=true;button.textContent='Downloading…';
      const res=await fetch('https://api.opensubtitles.com/api/v1/download',{method:'POST',headers:{'Api-Key':cfg.openSubtitlesApiKey,'Content-Type':'application/json'},body:JSON.stringify({file_id:fileId})});
      if(!res.ok)throw new Error('Download request HTTP '+res.status);
      const data=await res.json();if(!data.link)throw new Error('No subtitle download link received');
      const fileRes=await fetch(data.link);if(!fileRes.ok)throw new Error('Subtitle file download failed');
      const blob=await fileRes.blob();const url=URL.createObjectURL(blob);
      const video=document.querySelector('#real-video-el, #net-video-el');if(!video)throw new Error('Video element not found');
      const track=document.createElement('track');track.kind='subtitles';track.label='Online subtitle';track.srclang=cfg.subtitleLanguage||'eng';track.src=url;track.default=true;video.appendChild(track);
      track.addEventListener('load',()=>{if(track.track)track.track.mode='showing';},{once:true});
      toast('Online subtitle loaded');
    }catch(e){console.error(e);toast('Could not load subtitle: '+e.message);}finally{button.disabled=false;button.textContent='Download & load';}
  }
  function addSubtitleSearchButton(){
    const modal=document.getElementById('modal-add-subs');if(!modal||document.getElementById('vlc-online-sub-search'))return;
    const row=document.createElement('div');row.style.cssText='display:flex;justify-content:flex-end;margin:8px 0';
    const b=document.createElement('button');b.id='vlc-online-sub-search';b.className='vlc-enhancement-action';b.textContent='Find subtitles online automatically';b.onclick=searchOnlineSubtitles;row.appendChild(b);
    const list=document.getElementById('add-subs-list');if(list)list.parentNode.insertBefore(row,list);
  }
  function installSpectrumColors(){
    const canvas=document.getElementById('visualizer-canvas');if(!canvas)return;
    const img=document.querySelector('.music-cover-art img[alt="Album Artwork"], .music-cover-art img');
    if(!img)return;
    const sample=()=>{try{const c=document.createElement('canvas');c.width=c.height=24;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,24,24);const d=x.getImageData(0,0,24,24).data;const colors=[];for(let i=0;i<d.length;i+=16){if(d[i+3]>100)colors.push('rgb('+d[i]+','+d[i+1]+','+d[i+2]+')');}if(colors.length)root.style.setProperty('--vlc-art-spectrum',colors[Math.floor(colors.length/2)]);}catch{root.style.setProperty('--vlc-art-spectrum','var(--accent)');}};
    if(img.complete)sample();else img.addEventListener('load',sample,{once:true});
    new MutationObserver(sample).observe(img,{attributes:true,attributeFilter:['src']});
  }
  function install(){
    addStyles();addSettingsTab();addCustomizeControls();addSubtitleSearchButton();applyLook();installSpectrumColors();
    const observer=new MutationObserver(()=>{addSettingsTab();addCustomizeControls();addSubtitleSearchButton();applyLook();});
    observer.observe(document.body,{childList:true,subtree:true});
    const profileMenu=document.getElementById('menu-profile-lbl');if(profileMenu)profileMenu.textContent='Edit profile…';
    document.querySelectorAll('[data-menu-action="cycle-profile"]').forEach(el=>{el.addEventListener('click',()=>{const open=document.getElementById('btn-close-settings');if(open){document.getElementById('modal-settings')?.classList.add('open');addSettingsTab();renderProfileSettings();}},{capture:true});});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.VLCPlayerEnhancements={getSettings:()=>({...cfg}),searchOnlineSubtitles};
})();