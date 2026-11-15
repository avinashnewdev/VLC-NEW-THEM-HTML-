/* VLC Player enhancements: artwork-reactive spectrum, appearance controls, user profile and subtitle lookup. */
(() => {
  'use strict';
  const STORE='vlc-player-enhancements-v1';
  const defaults={uiBlur:18,artBlur:22,reflection:32,spectrumMode:'artwork',autoSubtitle:true,subtitleLanguage:'eng',openSubtitlesApiKey:'',profile:{name:'',email:'',avatar:''},profiles:[],activeProfileId:'',editingProfileId:''};
  let cfg={...defaults};
  try{cfg={...defaults,...JSON.parse(localStorage.getItem(STORE)||'{}')};cfg.profile={...defaults.profile,...(cfg.profile||{})};cfg.profiles=Array.isArray(cfg.profiles)?cfg.profiles:[];}catch{}
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
      .vlc-enhancement-note{font-size:11px;color:var(--fg-a2);line-height:1.5}\n      .vlc-profile-create{display:flex;align-items:center;gap:14px;margin:12px 0}.vlc-profile-fields{flex:1;min-width:0}.vlc-profile-avatar{width:48px;height:48px;border-radius:50%;border:2px solid var(--accent);display:grid;place-items:center;overflow:hidden;color:var(--accent);font-size:25px;flex-shrink:0}.vlc-profile-avatar.large{width:58px;height:58px}.vlc-profile-avatar img{width:100%;height:100%;object-fit:cover}.vlc-profile-snapshot{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:10px 0;color:var(--fg-2);font-size:12px}.vlc-profile-snapshot strong{color:var(--accent);font-weight:500}.vlc-profile-save-row{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.vlc-profile-empty{padding:20px;text-align:center;border:1px dashed var(--div-bright);border-radius:9px;color:var(--fg-a2)}.vlc-profile-saved-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--div-dim)}.vlc-profile-info{flex:1;min-width:0;display:grid;gap:3px}.vlc-profile-info small{font-size:11px;color:var(--fg-a2)}.vlc-profile-actions{display:flex;gap:5px;flex-wrap:wrap}.vlc-profile-actions button{font-size:11px;padding:6px 8px}
      .music-cover-art{position:relative}
      .music-cover-art:before{content:"";position:absolute;inset:-18px;z-index:0;pointer-events:none;background-image:var(--vlc-art-bg);background-size:cover;background-position:center;filter:blur(var(--vlc-art-blur,22px));opacity:.5;transform:scale(1.08)}
      .music-cover-art img{position:relative;z-index:1}
      .music-cover-art:after{content:"";position:absolute;left:0;right:0;top:100%;height:var(--vlc-art-reflection,32%);pointer-events:none;opacity:var(--vlc-reflection-opacity,.32);background-image:var(--vlc-art-bg);background-size:cover;background-position:center;transform:scaleY(-1);filter:blur(2px);mask-image:linear-gradient(to bottom,rgba(0,0,0,.55),transparent)}
    `;document.head.appendChild(st);
  }
  function addSettingsTab(){
    const side=document.querySelector('.settings-sidebar');if(!side||document.getElementById('vlc-profile-tab'))return;
    const group=document.createElement('div');group.className='settings-group-label';group.textContent='Personal';
    const btn=document.createElement('button');btn.className='settings-cat-btn';btn.id='vlc-profile-tab';btn.textContent='Edit Profile';
    side.append(group,btn);
    btn.addEventListener('click',renderProfileSettings);
  }
  function card(title,html){return '<section class="settings-card"><h4>'+title+'</h4>'+html+'</section>';}
  function rangeRow(label,key,min,max,step,unit,prefix='vlc-'){
    const id=prefix+key;const val=cfg[key];return '<div class="vlc-enhancement-row"><label for="'+id+'">'+label+'</label><input id="'+id+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'"><output id="'+id+'-out">'+val+unit+'</output></div>';
  }
  function profileSnapshot(){
    return {theme:getComputedStyle(root).getPropertyValue('--bg-a1').trim()||'Current theme',accent:getComputedStyle(root).getPropertyValue('--accent').trim()||'VLC Orange',uiBlur:cfg.uiBlur,artBlur:cfg.artBlur,reflection:cfg.reflection,eq:document.querySelector('[data-eq-preset].active')?.textContent?.trim()||'Current EQ',zoom:document.getElementById('zoom-value')?.textContent?.trim()||'Current zoom'};
  }
  function renderProfileSettings(){
    const body=document.getElementById('settings-cat-body');if(!body)return;
    document.querySelectorAll('.settings-cat-btn').forEach(b=>b.classList.toggle('active',b.id==='vlc-profile-tab'));
    document.getElementById('settings-cat-title').textContent='Edit Profile';
    const editing=cfg.profiles.find(p=>p.id===cfg.editingProfileId)||null;
    const current=editing||{name:'',note:'',avatar:''};
    const snap=profileSnapshot();
    const saved=cfg.profiles.map(p=>'<div class="vlc-profile-saved-row"><div class="vlc-profile-avatar">'+(p.avatar?'<img src="'+esc(p.avatar)+'" alt="">':'<span>♙</span>')+'</div><div class="vlc-profile-info"><strong>'+esc(p.name)+'</strong><small>'+esc(p.note||'Personal profile')+'</small><small>Theme '+esc(p.snapshot?.theme||'Current')+' · Blur '+esc(p.snapshot?.uiBlur??cfg.uiBlur)+'px · Art Refl '+esc(p.snapshot?.reflection??cfg.reflection)+'%</small></div><div class="vlc-profile-actions"><button class="vlc-enhancement-action" data-edit-profile="'+esc(p.id)+'">Edit</button><button class="vlc-enhancement-action" data-use-profile="'+esc(p.id)+'">Use</button><button class="vlc-enhancement-action" data-delete-profile="'+esc(p.id)+'">Delete</button></div></div>').join('');
    body.innerHTML=card('Create Your Profile','<p class="vlc-enhancement-note">No default profiles are pre-loaded. Create or edit your own profile with your name, avatar photo, and custom audio/video/theme settings.</p><div class="vlc-profile-create"><div class="vlc-profile-avatar large" id="vlc-profile-avatar-preview">'+(current.avatar?'<img src="'+esc(current.avatar)+'" alt="">':'<span>♙</span>')+'</div><div class="vlc-profile-fields"><input class="vlc-enhancement-input" id="vlc-profile-name" maxlength="60" placeholder="Enter your profile name…" value="'+esc(current.name)+'"><input class="vlc-enhancement-input" id="vlc-profile-note" maxlength="140" placeholder="Role or setup note (optional, e.g. Custom Audio & 4K Video)" value="'+esc(current.note)+'"><input id="vlc-profile-photo" type="file" accept="image/*" hidden><button class="vlc-enhancement-action" id="vlc-profile-upload">Upload Photo</button></div></div><div class="vlc-profile-snapshot"><span>Included in Profile Snapshot</span><strong>Theme ('+esc(snap.theme)+') · Accent ('+esc(snap.accent)+') · Blur ('+cfg.uiBlur+'px) · Art Refl ('+cfg.reflection+'%) · EQ & Zoom</strong></div><div class="vlc-profile-save-row"><button class="vlc-enhancement-action primary" id="vlc-profile-save">'+(editing?'Save Profile Changes':'＋ Save New Profile')+'</button>'+(editing?'<button class="vlc-enhancement-action" id="vlc-profile-cancel">Cancel Edit</button>':'')+'</div><p class="vlc-enhancement-note" id="vlc-profile-status"></p>')+
    card('Your Saved Profiles ('+cfg.profiles.length+')',saved||'<div class="vlc-profile-empty">No profile exists yet. Enter your name above and click <b>＋ Save New Profile</b> to create your first profile.</div>')+
    card('Automatic online subtitles','<label style="display:flex;align-items:center;gap:8px;margin:8px 0"><input id="vlc-auto-sub" type="checkbox" '+(cfg.autoSubtitle?'checked':'')+'> Automatically search and load the best matching subtitle when a local video opens</label><label class="pop-label">Subtitle language (ISO 639-2)</label><input class="vlc-enhancement-input" id="vlc-sub-lang" maxlength="3" value="'+esc(cfg.subtitleLanguage)+'" placeholder="eng"><label class="pop-label">OpenSubtitles API key</label><input class="vlc-enhancement-input" id="vlc-sub-key" type="password" autocomplete="off" placeholder="Add your own OpenSubtitles API key" value="'+esc(cfg.openSubtitlesApiKey)+'"><button class="vlc-enhancement-action" id="vlc-sub-test">Save subtitle settings</button><p class="vlc-enhancement-note">Online subtitle search needs an OpenSubtitles API key. The key is stored locally in this browser only. Search is offered when a local video is loaded; protected or DRM streams are not modified.</p>');
    ['uiBlur','artBlur','reflection'].forEach(k=>{const el=document.getElementById('vlc-'+k);el.addEventListener('input',()=>{cfg[k]=Number(el.value);document.getElementById('vlc-'+k+'-out').textContent=el.value+(k==='reflection'?'%':'px');save();applyLook();});});
    let avatar=current.avatar||'';
    document.getElementById('vlc-profile-upload').onclick=()=>document.getElementById('vlc-profile-photo').click();
    document.getElementById('vlc-profile-photo').onchange=e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/'))return;const reader=new FileReader();reader.onload=()=>{avatar=String(reader.result);document.getElementById('vlc-profile-avatar-preview').innerHTML='<img src="'+avatar+'" alt="">';};reader.readAsDataURL(file);};
    document.getElementById('vlc-profile-save').onclick=()=>{const name=document.getElementById('vlc-profile-name').value.trim();const status=document.getElementById('vlc-profile-status');if(!name){status.textContent='Enter a profile name first.';return;}const id=cfg.editingProfileId||('profile-'+Date.now());const profile={id,name,note:document.getElementById('vlc-profile-note').value.trim(),avatar,snapshot:profileSnapshot(),updatedAt:new Date().toISOString()};const ix=cfg.profiles.findIndex(p=>p.id===id);if(ix>=0)cfg.profiles[ix]=profile;else cfg.profiles.push(profile);cfg.activeProfileId=id;cfg.editingProfileId='';cfg.profile={name,email:'',avatar};save();renderProfileSettings();toast(ix>=0?'Profile updated':'New profile saved');};
    document.getElementById('vlc-profile-cancel')?.addEventListener('click',()=>{cfg.editingProfileId='';renderProfileSettings();});
    body.querySelectorAll('[data-edit-profile]').forEach(b=>b.onclick=()=>{cfg.editingProfileId=b.dataset.editProfile;renderProfileSettings();});
    body.querySelectorAll('[data-use-profile]').forEach(b=>b.onclick=()=>{const p=cfg.profiles.find(x=>x.id===b.dataset.useProfile);if(!p)return;cfg.activeProfileId=p.id;if(p.snapshot){['uiBlur','artBlur','reflection'].forEach(k=>{if(Number.isFinite(Number(p.snapshot[k])))cfg[k]=Number(p.snapshot[k]);});}cfg.profile={name:p.name,email:'',avatar:p.avatar||''};save();applyLook();renderProfileSettings();toast('Profile applied');});
    body.querySelectorAll('[data-delete-profile]').forEach(b=>b.onclick=()=>{cfg.profiles=cfg.profiles.filter(p=>p.id!==b.dataset.deleteProfile);if(cfg.activeProfileId===b.dataset.deleteProfile)cfg.activeProfileId='';if(cfg.editingProfileId===b.dataset.deleteProfile)cfg.editingProfileId='';save();renderProfileSettings();});
    document.getElementById('vlc-ffmpeg-decode').onclick=async()=>{const status=document.getElementById('vlc-ffmpeg-status');const file=document.getElementById('local-media-input')?.files?.[0];if(!file){status.textContent='Select a local file using Open File first.';return;}if(!window.VLCSoftwareDecoder){status.textContent='FFmpeg decoder module is not available.';return;}status.textContent='Loading FFmpeg…';try{const result=await window.VLCSoftwareDecoder.decode(file,{onProgress:p=>status.textContent='Decoding '+Math.round(p*100)+'%'});const audio=file.type.startsWith('audio/');const target=document.getElementById(audio?'real-audio-el':'real-video-el');if(!target)throw new Error('Playback element unavailable');if(window.__vlcDecodedObjectUrl)URL.revokeObjectURL(window.__vlcDecodedObjectUrl);window.__vlcDecodedObjectUrl=result.url;target.src=result.url;await target.play();status.textContent='Software-decoded output is playing.';}catch(e){status.textContent='Decode failed: '+e.message;}};
    document.getElementById('vlc-auto-sub').onchange=e=>{cfg.autoSubtitle=e.target.checked;save();};
    document.getElementById('vlc-sub-test').onclick=()=>{cfg.subtitleLanguage=(document.getElementById('vlc-sub-lang').value||'eng').trim().slice(0,3);cfg.openSubtitlesApiKey=document.getElementById('vlc-sub-key').value.trim();save();toast('Subtitle settings saved');};
  }
  function esc(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function toast(msg){const el=document.getElementById('vlc-toast');if(el){el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2400);}else console.info(msg);}
  function renderGlobalAppearance(){
    const title=document.getElementById('settings-cat-title');
    const body=document.getElementById('settings-cat-body');
    if(!title||!body||!title.textContent.includes('Global Settings'))return;
    const appearance=Array.from(body.querySelectorAll('.settings-card')).find(el=>el.querySelector('h4')?.textContent.trim()==='Appearance');
    if(!appearance||appearance.querySelector('#vlc-global-visual-effects'))return;
    const section=document.createElement('div');section.id='vlc-global-visual-effects';
    section.innerHTML='<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--div-dim)"><h4 style="margin:0 0 8px">Visual Effects</h4>'+rangeRow('Interface glass blur','uiBlur',0,40,1,'px','vlc-global-')+rangeRow('Album-art background blur','artBlur',0,50,1,'px','vlc-global-')+rangeRow('Artwork reflection strength','reflection',0,100,1,'%','vlc-global-')+'<p class="vlc-enhancement-note">Effects apply immediately to the player interface and album artwork.</p><h4 style="margin:14px 0 6px">Offline Codec Engine</h4><p class="vlc-enhancement-note" id="vlc-codec-engine-status">Checking codec engine…</p></div>';
    appearance.appendChild(section);
    const codecStatus=document.getElementById('vlc-codec-engine-status');
    if(codecStatus){const status=window.VLCOfflineCodecEngine?.getStatus?.();codecStatus.textContent=status?.available?'Native engine connected: '+status.name:'Browser-only mode. Native offline HEVC/H.265 decoding requires a desktop libVLC host.';}
    ['uiBlur','artBlur','reflection'].forEach(k=>{const el=document.getElementById('vlc-global-'+k);el.addEventListener('input',()=>{cfg[k]=Number(el.value);document.getElementById('vlc-global-'+k+'-out').textContent=el.value+(k==='reflection'?'%':'px');save();applyLook();});});
  }
  function currentVideoTitle(){
    const media=document.querySelector('#real-video-el, #net-video-el');const src=media?.currentSrc||media?.src||'';
    try{const u=new URL(src,location.href);if(!/^blob:|^data:/i.test(src)){const name=decodeURIComponent(u.pathname.split('/').pop().replace(/\.[^.]+$/,'')).replace(/[._-]+/g,' ').trim();if(name)return name;}}catch{}
    return document.querySelector('.music-track-label')?.textContent?.trim()||document.querySelector('#video-title')?.textContent?.trim()||'';
  }
  async function searchOnlineSubtitles(auto=false){
    if(!cfg.openSubtitlesApiKey){toast('Add an OpenSubtitles API key in Edit Profile settings first.');return;}
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
      if(auto){const best=(results[0].attributes?.files||[])[0];if(best){await downloadSubtitle(best.file_id,{disabled:false,textContent:'Auto loading…'});return;}}
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
    document.querySelectorAll('#real-video-el,#net-video-el').forEach(v=>v.addEventListener('loadedmetadata',()=>{const src=v.currentSrc||v.src;if(cfg.autoSubtitle&&cfg.openSubtitlesApiKey&&src.startsWith('blob:')&&window.__vlcLastSubtitleSource!==src){window.__vlcLastSubtitleSource=src;searchOnlineSubtitles(true);}}));
    addStyles();addSettingsTab();addSubtitleSearchButton();applyLook();installSpectrumColors();renderGlobalAppearance();
    const observer=new MutationObserver(()=>{addSettingsTab();addSubtitleSearchButton();applyLook();renderGlobalAppearance();});
    observer.observe(document.body,{childList:true,subtree:true});
    const profileMenu=document.getElementById('menu-profile-lbl');if(profileMenu)profileMenu.textContent='Edit profile…';
    document.querySelectorAll('[data-menu-action="cycle-profile"]').forEach(el=>{el.addEventListener('click',()=>{const open=document.getElementById('btn-close-settings');if(open){document.getElementById('modal-settings')?.classList.add('open');addSettingsTab();renderProfileSettings();}},{capture:true});});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.VLCPlayerEnhancements={getSettings:()=>({...cfg}),searchOnlineSubtitles,applyLook};
})();