
let duration=0, time=0; const ticksEl=document.getElementById('ticks'); const playhead=document.getElementById('playhead');
let draggingHead=false, draggingBar=false, startX=0, startOffset=0;
let midiOffset=0; const SNAP=0.25; // seconds
let pendingDrop=false;
export function initTimeline(){
  window.addEventListener('resize', layout);
  document.addEventListener('DURATION',(e)=>{duration=e.detail||0; layout(); updateTime(0);});
  document.addEventListener('TIME',(e)=>{updateTime(e.detail||0);});

  const timeline = document.getElementById('timeline');
  timeline.addEventListener('mousedown',(ev)=>{
    const rect=ticksEl.getBoundingClientRect(); const x=ev.clientX-rect.left; const t = clamp(mapXToTime(x),0,duration);
    if(ev.target.closest('#playhead')){ draggingHead=true; startX=ev.clientX; }
    else if(ev.target.closest('#bar-midi')){ draggingBar=true; startX=ev.clientX; startOffset=midiOffset; }
    else { seekTo(t, ev.shiftKey); }
  });
  window.addEventListener('mousemove',(ev)=>{
    if(draggingHead){ const rect=ticksEl.getBoundingClientRect(); const x=clamp(ev.clientX-rect.left,0,rect.width); const t=mapXToTime(x); seekTo(t, ev.shiftKey); }
    if(draggingBar){ const dx=ev.clientX-startX; const sec=pxToSec(dx); const raw=startOffset+sec; midiOffset = ev.shiftKey? raw : snap(raw); emitOffset(); }
  });
  window.addEventListener('mouseup',()=>{draggingHead=false; draggingBar=false;});

  layout();

  document.addEventListener('INTENT_TIMELINE_DROP', (e)=>{
    if(e.detail==='midi') pendingDrop=true;
  });
  // when MIDI parsed and ready, if last drop intended to timeline -> insert bar
  document.addEventListener('MIDI_LOADED',()=>{
    if(pendingDrop){ addMidiBar(); pendingDrop=false; }
  });
}
function addMidiBar(){
  const slot=document.getElementById('slot-midi'); if(slot){ slot.remove(); }
  if(!document.getElementById('bar-midi')){
    const bar=document.createElement('div'); bar.className='bar pink draggable'; bar.id='bar-midi';
    bar.innerHTML='<span class="title">MIDI</span><span class="offset">Offset: +00:00.00</span>';
    document.querySelector('.track[data-kind="midi"]').appendChild(bar);
  }
  updateOffsetLabel();
}
function layout(){
  ticksEl.innerHTML=''; const w=ticksEl.clientWidth; const beat=0.5;
  for(let s=0; s<=duration; s+=beat){
    const x=(duration>0? (s/duration):0)*w;
    const t=document.createElement('div'); t.className='t'; t.style.left=(x|0)+'px'; t.style.opacity = (Math.round(s/beat)%4==0)?1:0.35; ticksEl.appendChild(t);
    if(Math.round(s)%2===0){ const lb=document.createElement('div'); lb.className='label'; lb.style.left=(x|0)+'px'; lb.textContent=toTime(s); ticksEl.appendChild(lb);}
  }
  updateOffsetLabel();
}
function updateTime(t){ time=clamp(t,0,duration||0); const w=ticksEl.clientWidth; const x=(duration>0? (time/duration):0)*w; playhead.style.left=(x|0)+'px'; document.getElementById('timeText').textContent=toTime(time)+' / '+toTime(duration||0); }
function toTime(sec){ const m=Math.floor(sec/60), s=Math.floor(sec%60), ms=Math.floor((sec*100)%100); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(2,'0')}`; }
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function mapXToTime(x){ const w=ticksEl.clientWidth; return (w? x/w:0)*(duration||0); }
function pxToSec(dx){ const w=ticksEl.clientWidth; return (w? dx/w:0)*(duration||0); }
function seekTo(t, noSnap){ const tt = noSnap? t : snap(t); document.dispatchEvent(new CustomEvent('SEEK',{detail:tt})); }
function snap(v){ return Math.round(v/SNAP)*SNAP; }
function emitOffset(){ document.dispatchEvent(new CustomEvent('SET_OFFSET',{detail:midiOffset})); updateOffsetLabel(); }
function updateOffsetLabel(){ const el=document.querySelector('#bar-midi .offset'); if(!el) return; const s=midiOffset; const sign=s>=0?'+':'-'; const abs=Math.abs(s); const m=Math.floor(abs/60), ss=Math.floor(abs%60), ms=Math.floor((abs*100)%100); el.textContent = `Offset: ${sign}${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}.${String(ms).padStart(2,'0')}`; }
