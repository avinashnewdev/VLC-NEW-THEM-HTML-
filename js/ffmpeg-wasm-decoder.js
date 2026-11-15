/* Optional FFmpeg/WebAssembly software decoder. Loaded on demand to avoid a large startup download.
   Usage: await VLCSoftwareDecoder.decode(file, { onProgress }); returns {url, blob, revoke()}.
   This is an explicit local-file transcode path; it does not bypass DRM or protected streams. */
(() => {
  'use strict';
  let ffmpegPromise;
  async function loadFFmpeg(onProgress){
    if(!ffmpegPromise)ffmpegPromise=(async()=>{
      if(!window.FFmpegWASM){
        await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://unpkg.com/@ffmpeg/ffmpeg@0.12.15/dist/umd/ffmpeg.js';s.onload=resolve;s.onerror=()=>reject(new Error('Could not load FFmpeg WebAssembly wrapper'));document.head.appendChild(s);});
      }
      const {FFmpeg}=window.FFmpegWASM;const ffmpeg=new FFmpeg();
      ffmpeg.on('progress',({progress})=>onProgress?.(Math.max(0,Math.min(1,progress))));
      await ffmpeg.load({coreURL:'https://unpkg.com/@ffmpeg/core-st@0.12.10/dist/umd/ffmpeg-core.js'});
      return ffmpeg;
    })();
    return ffmpegPromise;
  }
  async function decode(file,{onProgress,outputFormat='mp4'}={}){
    if(!(file instanceof Blob))throw new TypeError('Pass a local File or Blob.');
    const ffmpeg=await loadFFmpeg(onProgress);
    const ext=(file.name||'input').split('.').pop().replace(/[^a-z0-9]/gi,'').toLowerCase()||'bin';
    const input='input.'+ext,output='decoded.'+outputFormat;
    await ffmpeg.writeFile(input,new Uint8Array(await file.arrayBuffer()));
    const args=outputFormat==='webm'?['-i',input,'-c:v','libvpx','-c:a','libopus',output]:['-i',input,'-c:v','libx264','-preset','ultrafast','-c:a','aac','-movflags','+faststart',output];
    const code=await ffmpeg.exec(args);if(code!==0)throw new Error('FFmpeg exited with code '+code);
    const data=await ffmpeg.readFile(output);const blob=new Blob([data.buffer],{type:outputFormat==='webm'?'video/webm':'video/mp4'});const url=URL.createObjectURL(blob);
    try{await ffmpeg.deleteFile(input);await ffmpeg.deleteFile(output);}catch{}
    return {url,blob,revoke:()=>URL.revokeObjectURL(url)};
  }
  window.VLCSoftwareDecoder={decode,load:()=>loadFFmpeg()};
})();