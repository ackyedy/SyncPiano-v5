
import {initBridge} from './bridge.js';
let backend=null; initBridge().then(b=>backend=b);
const grid=document.getElementById('fileGrid'), picker=document.getElementById('filePicker'), btn=document.getElementById('btnImport');
const recentEl=document.getElementById('recentList'); const MAX_RECENT=12;
let dragKind=null, dragPath='';

btn.addEventListener('click',()=> picker.click());
picker.addEventListener('change',()=>{
  for(const f of picker.files){
    if(!/\.mid(i)?$/i.test(f.name)) continue; // MIDIのみ
    addFileCard(f);
    if(backend && f.path){ backend.openPath(f.path); }
  }
  saveRecentFromGrid();
});
document.addEventListener('RECENT',(e)=>{ setRecent(e.detail); });

function setRecent(list){ recentEl.innerHTML=''; (list||loadRecent()).forEach(p=>{
  const it=document.createElement('div'); it.className='item'; it.textContent=p; it.title=p;
  it.addEventListener('click',()=>backend&&backend.openPath(p));
  recentEl.appendChild(it);
}); }

function loadRecent(){ try{return JSON.parse(localStorage.getItem('recent')||'[]');}catch(e){return [];} }
function saveRecentFromGrid(){ const names=[...grid.querySelectorAll('.file')].map(el=>el.dataset.path).filter(Boolean); const merged=[...new Set([...names, ...loadRecent()])].slice(0,MAX_RECENT); localStorage.setItem('recent', JSON.stringify(merged)); setRecent(merged); }

export function addFileCard(f){
  if(!/\.mid(i)?$/i.test(f.name)) return;
  const card=document.createElement('div'); card.className='file'; card.dataset.path = f.path||''; card.dataset.kind='midi'; card.setAttribute('draggable','true');
  card.addEventListener('dragstart',(e)=>{ dragKind='midi'; dragPath=card.dataset.path||''; e.dataTransfer.setData('text/plain', dragPath); document.body.classList.add('dragging-midi'); });
  card.addEventListener('dragend',()=>{ dragKind=null; dragPath=''; document.body.classList.remove('dragging-midi'); });
  const th=document.createElement('div'); th.className='thumb'; th.textContent='♪';
  const meta=document.createElement('div'); meta.className='meta';
  const name=document.createElement('div'); name.className='name'; name.textContent=f.name;
  meta.append(name);
  card.append(th, meta); grid.prepend(card);
}

// Only MIDI slot accepts
const midiSlot=document.getElementById('slot-midi');
midiSlot.addEventListener('dragover',e=>{
  // Library card OR OS file
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if( (dragKind==='midi') || (f && /\.mid(i)?$/i.test(f.name)) ){
    e.preventDefault(); midiSlot.classList.add('dragover');
  }
});
midiSlot.addEventListener('dragleave',()=>midiSlot.classList.remove('dragover'));
midiSlot.addEventListener('drop',e=>{
  midiSlot.classList.remove('dragover');
  // OS drop
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if(f && f.path && /\.mid(i)?$/i.test(f.name)){
    if(backend){ backend.openPath(f.path); }
    document.dispatchEvent(new CustomEvent('INTENT_TIMELINE_DROP',{detail:'midi'}));
    return;
  }
  // Library card drop
  if(dragKind==='midi'){
    if(dragPath && backend){ backend.openPath(dragPath); }
    document.dispatchEvent(new CustomEvent('INTENT_TIMELINE_DROP',{detail:'midi'}));
  }
});

// Fallback: drop anywhere on timeline -> route to MIDI slot if y is within first track
const timelineEl=document.getElementById('timeline');
timelineEl.addEventListener('dragover',e=>{
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if( (dragKind==='midi') || (f && /\.mid(i)?$/i.test(f.name)) ){
    e.preventDefault();
  }
});
timelineEl.addEventListener('drop',e=>{
  const rect = document.querySelector('.track[data-kind="midi"]').getBoundingClientRect();
  if(e.clientY>=rect.top && e.clientY<=rect.bottom){
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if(f && f.path && /\.mid(i)?$/i.test(f.name)){
      backend && backend.openPath(f.path);
      document.dispatchEvent(new CustomEvent('INTENT_TIMELINE_DROP',{detail:'midi'}));
    }else if(dragKind==='midi'){
      if(dragPath){ backend && backend.openPath(dragPath); }
      document.dispatchEvent(new CustomEvent('INTENT_TIMELINE_DROP',{detail:'midi'}));
    }
  }
});
