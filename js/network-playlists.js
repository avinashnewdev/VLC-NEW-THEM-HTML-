/* VLC IPTV playlist manager. Client-side only; playlist data stays in browser storage. */
(() => {
  'use strict';
  const KEY='vlc.iptv.playlists.v1', MAX=8*1024*1024, LIMIT=10000;
  let lists=[], selected=0, query='';
  try { const x=JSON.parse(localStorage.getItem(KEY)||'[]'); if(Array.isArray(x)) lists=x.slice(0,100); } catch(_){}
  const byId=id=>document.getElementById(id);
  const safeUrl=value=>{try{const u=new URL(String(value).trim());return ['http:','https:'].includes(u.protocol)?u.href:null;}catch(_){return null;}};
  const esc=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(lists));return true;}catch(_){say('Browser storage is full or disabled; export your playlist as a backup.',true);return false;}};
  const say=(msg,bad)=>{const el=byId('iptv-status');if(el){el.textContent=msg;el.style.color=bad?'#e88':'var(--fg-a2)';}};
  function parse(text,name){
    if(typeof text!=='string'||text.length>MAX)throw Error('Playlist exceeds the 8 MB safety limit.');
    if(/^#EXT-X-(?:TARGETDURATION|STREAM-INF|MEDIA-SEQUENCE|ENDLIST)/mi.test(text))throw Error('This is an HLS media manifest, not a channel list. Add its URL using Open Network Stream instead.');
    const out=[];let meta={};
    for(const raw of text.replace(/^\uFEFF/,'').split(/\r?\n/)){
      const line=raw.trim();if(!line)continue;
      if(line.startsWith('#EXTINF:')){
        const comma=line.indexOf(','), attrs=comma<0?line.slice(8):line.slice(8,comma);
        const title=comma<0?'Untitled channel':line.slice(comma+1).trim();
        const attr=k=>{const m=attrs.match(new RegExp('(?:^|\\s)'+k+'="([^"]*)"','i'));return m?m[1]:'';};
        meta={name:title||'Untitled channel',logo:attr('tvg-logo'),group:attr('group-title'),kind:/radio|audio/i.test(attr('group-title'))?'audio':'video'};
      } else if(line.startsWith('#EXTGRP:')) meta.group=line.slice(8).trim();
      else if(!line.startsWith('#')){const url=safeUrl(line);if(url){const audioExt=/\.(?:mp3|aac|m4a|flac|wav|ogg|opus|wma|aiff)(?:$|[?#])/i.test(url);out.push({...meta,kind:meta.kind==='audio'||audioExt?'audio':'video',url});}meta={};if(out.length>=LIMIT)break;}
    }
    if(!out.length)throw Error('No valid HTTP(S) stream URLs were found.');
    return {name:String(name||'Imported playlist').slice(0,100),entries:out,addedAt:Date.now()};
  }
  function render(){
    const root=byId('iptv-manager-root');if(!root)return;
    const p=lists[selected];
    root.innerHTML='<div class="iptv-playlist-list">'+lists.map((x,i)=>'<button class="iptv-playlist-chip '+(i===selected?'active':'')+'" data-pl="'+i+'">'+esc(x.name)+' · '+x.entries.length+'</button>').join('')+'</div>'+
      '<div class="iptv-toolbar"><input class="iptv-search" id="iptv-search" type="search" placeholder="Search channels…">'+(p?'<button class="btn-primary" id="iptv-play-all" '+(!p.entries.length?'disabled':'')+'>▶ Play Full Playlist ('+p.entries.length+')</button><button class="btn-secondary" id="iptv-remove">Remove playlist</button>':'')+'</div><div class="iptv-channel-list" id="iptv-channels"></div>';
    const search=byId('iptv-search');if(search){search.value=query;search.addEventListener('input',()=>{query=search.value.toLowerCase();renderChannels();});}
    renderChannels();
  }
  function renderChannels(){
    const box=byId('iptv-channels'),p=lists[selected];if(!box)return;
    const entries=p?p.entries.map((e,i)=>({...e,index:i})).filter(e=>!query||(e.name+' '+e.group).toLowerCase().includes(query)):[];
    box.innerHTML=entries.length?entries.map(e=>'<div class="iptv-channel">'+(safeUrl(e.logo)?'<img src="'+esc(safeUrl(e.logo))+'" alt="" loading="lazy" referrerpolicy="no-referrer">':'<span>📺</span>')+
      '<div class="iptv-channel-main"><span class="iptv-channel-name">'+esc(e.name)+'</span><span class="iptv-channel-meta">'+esc(e.group||'Uncategorized')+' · '+esc(new URL(e.url).hostname)+'</span></div><button class="btn-primary" data-play="'+e.index+'">Play</button></div>').join(''):'<div class="iptv-empty">Import an M3U / M3U8 playlist to show channels here.</div>';
  }
  function exportList(){
    const p=lists[selected];if(!p)return say('Select a playlist first.',true);
    const lines=['#EXTM3U'];p.entries.forEach(e=>{lines.push('#EXTINF:-1 tvg-logo="'+String(e.logo||'').replace(/["\r\n]/g,'')+'" group-title="'+String(e.group||'').replace(/["\r\n]/g,'')+'",'+String(e.name||'Channel').replace(/[\r\n]/g,' '));lines.push(e.url);});
    const blob=new Blob([lines.join('\n')],{type:'audio/x-mpegurl;charset=utf-8'}),a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download=(p.name.replace(/[^a-z0-9_-]+/gi,'_')||'iptv-playlist')+'.m3u';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);say('M3U playlist exported.');
  }
  async function importFile(file){
    if(file.size>MAX)throw Error(file.name+' exceeds 8 MB.');
    lists.push(parse(await file.text(),file.name.replace(/\.(m3u8?|txt)$/i,'')));selected=lists.length-1;save();render();say('Imported '+lists[selected].entries.length+' channels.');
  }
  async function importUrl(){
    const input=byId('iptv-url'),url=safeUrl(input&&input.value);if(!url)return say('Enter a valid HTTP(S) playlist URL.',true);
    const btn=byId('iptv-fetch');btn.disabled=true;say('Fetching playlist…');
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    try{
      const res=await fetch(url,{signal:controller.signal,credentials:'omit',redirect:'follow'});if(!res.ok)throw Error('HTTP '+res.status);
      lists.push(parse(await res.text(),url.split('/').pop()||'Remote playlist'));selected=lists.length-1;save();render();say('Imported '+lists[selected].entries.length+' channels.');
    }catch(e){say('Remote import failed: '+e.message+'. The playlist host must allow CORS. Download the M3U file and import it instead.',true);}
    finally{clearTimeout(timer);btn.disabled=false;}
  }
  function mount(){
    const body=byId('lib-dynamic-body'),nav=document.querySelector('[data-lib-tab="network"]');
    if(!body||!nav||!nav.classList.contains('active'))return;
    if(!byId('iptv-manager-root')){
      const panel=document.createElement('section');panel.className='network-manager-panel';
      panel.innerHTML='<div class="network-manager-head"><div><h3>IPTV & Network Playlists</h3><p>Import M3U / M3U8, search channels, play streams and export playlists.</p></div><div class="network-manager-actions"><label class="btn-primary" for="iptv-files" style="cursor:pointer">Import M3U / M3U8</label><input id="iptv-files" type="file" accept=".m3u,.m3u8,.txt" multiple hidden><button class="btn-secondary" id="iptv-export">Export .m3u</button></div></div>'+
        '<div class="network-import-row"><input id="iptv-url" type="url" placeholder="https://host/playlist.m3u (CORS required)"><button class="btn-primary" id="iptv-fetch">Import URL</button></div><p class="network-import-note" id="iptv-status">Imported playlists are stored locally in this browser. No playlist data is uploaded to GitHub.</p><div id="iptv-manager-root"></div>';
      body.prepend(panel);
      byId('iptv-files').addEventListener('change',async e=>{for(const f of e.target.files){try{await importFile(f);}catch(err){say(err.message,true);}}e.target.value='';});
      byId('iptv-export').addEventListener('click',exportList);byId('iptv-fetch').addEventListener('click',importUrl);
      panel.addEventListener('click',e=>{
        const chip=e.target.closest('[data-pl]');if(chip){selected=Number(chip.dataset.pl);query='';render();return;}
        if(e.target.id==='iptv-remove'){lists.splice(selected,1);selected=Math.max(0,selected-1);query='';save();render();return;}\n        if(e.target.id==='iptv-play-all'){const current=lists[selected];if(!current)return;try{if(!window.VLCNetworkBridge?.addPlaylistAndPlay)throw Error('Online player integration unavailable; reload the app.');window.VLCNetworkBridge.addPlaylistAndPlay(current.entries,current.name);say('Playing all '+current.entries.length+' playlist entries.');}catch(err){say(err.message,true);}return;}
        const play=e.target.closest('[data-play]');if(play){const item=lists[selected]&&lists[selected].entries[Number(play.dataset.play)];if(!item)return;
          try{if(!window.VLCNetworkBridge)throw Error('Player integration unavailable; reload the page.');window.VLCNetworkBridge.addAndPlay({...item,playlistName:lists[selected].name});say('Playing '+item.name);}catch(err){say(err.message,true);}}
      });
    }
    render();
  }
  window.VLCNetworkManager={mount,parse};
  document.addEventListener('DOMContentLoaded',()=>{
    const body=byId('lib-dynamic-body');if(!body)return;
    new MutationObserver(mount).observe(body,{childList:true,subtree:false});
    const nav=document.querySelector('[data-lib-tab="network"]');if(nav)nav.addEventListener('click',()=>setTimeout(mount,0));
    mount();
  });
})();
