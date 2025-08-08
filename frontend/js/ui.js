
import {initBridge} from './bridge.js';
import {applyLang} from './i18n.js';
import {initRenderer,setColors,setFlags} from './render.js';
import {initMIDI,play,pause,stop} from './midi.js';
import {initTimeline} from './timeline.js';

async function main(){
  initRenderer(); initMIDI(); initTimeline();
  const backend = await initBridge();

  document.querySelectorAll('#tool .tool').forEach(btn=>{
    btn.addEventListener('click',()=>{
      if(btn.id==='toggleMode'){ document.body.classList.toggle('simple'); return; }
      document.querySelectorAll('#tool .tool').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('#left .panel').forEach(el=>el.classList.remove('active'));
      const p = btn.dataset.panel;
      const t = document.getElementById('panel-'+p) || document.getElementById('panel-files');
      t.classList.add('active');
    });
  });

  document.querySelectorAll('.preset').forEach(p=>p.addEventListener('click',()=>{setColors(p.dataset.a,p.dataset.b);}));
  const colorA=document.getElementById('colorA'), colorB=document.getElementById('colorB');
  const setCol=()=>setColors(colorA.value,colorB.value); colorA.addEventListener('input',setCol); colorB.addEventListener('input',setCol); setCol();
  document.getElementById('toggleParticles').addEventListener('change',e=>setFlags({particles:e.target.checked}));
  document.getElementById('toggleGlare').addEventListener('change',e=>setFlags({glare:e.target.checked}));

  document.getElementById('btnPickDir').addEventListener('click', async()=>{
    if(!backend) return; const dir = await backend.chooseDir(); document.getElementById('saveDir').textContent=dir;
  });
  document.getElementById('btnExport').addEventListener('click',()=>{
    if(!backend){document.getElementById('exportStatus').textContent='Backend missing.';return;}
    const dir=document.getElementById('saveDir').textContent||'';
    const name=(document.getElementById('outName').value||'syncpiano_export').replace(/[^a-zA-Z0-9_\-\.]/g,'');
    const [w,h]=(document.getElementById('res').value||'1920x1080').split('x').map(v=>parseInt(v,10));
    const fps=parseInt(document.getElementById('fps').value,10)||60;
    const fmt=document.getElementById('fmt').value||'mp4';
    const ok=backend.exportVideo(dir, name, w, h, fps, fmt);
    document.getElementById('exportStatus').textContent= ok?'Export started':'PNG sequence only (ffmpeg missing)';
  });
  document.addEventListener('EXPORT_DONE',(e)=>{document.getElementById('exportStatus').textContent='Exported: '+e.detail;});
  document.addEventListener('NOTIFY',(e)=>{document.getElementById('exportStatus').textContent=e.detail;});

  document.getElementById('btnPlay').addEventListener('click',play);
  document.getElementById('btnPause').addEventListener('click',pause);
  document.getElementById('btnBack').addEventListener('click',()=>{stop();});
  document.getElementById('btnFwd').addEventListener('click',()=>{});

  const emitRate=(r)=>document.dispatchEvent(new CustomEvent('SET_RATE',{detail:r}));
  document.querySelectorAll('.rateBtn').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.rateBtn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); emitRate(parseFloat(b.dataset.r));
  }));

  // language default JA
  const lang=document.getElementById('lang'); const apply=()=>applyLang(lang.value||'ja'); lang.addEventListener('change',apply); apply();
}
main();
