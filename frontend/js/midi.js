
import {scheduleNote,clearNotes,setTime,setRate} from './render.js';
let midiData=null,playing=false,startMs=0,pauseTime=0,rate=1,midiOffset=0;
function sideForPitch(p){return (p%12)<6?0:1;}
export function initMIDI(){
  document.addEventListener('MIDI_LOADED',(ev)=>{
    midiData=ev.detail; const dur=midiData?.meta?.duration||0;
    document.dispatchEvent(new CustomEvent('DURATION',{detail:dur}));
    clearNotes();
    for(const n of midiData.notes){ scheduleNote(n.pitch,n.start,n.end,sideForPitch(n.pitch)); }
  });
  document.addEventListener('SET_RATE',(ev)=>{ rate=ev.detail||1; setRate(rate); if(playing){ startMs = performance.now()-pauseTime*1000/rate; } });
  document.addEventListener('SET_OFFSET',(ev)=>{ midiOffset = ev.detail||0; });
  document.addEventListener('SEEK',(ev)=>{ const t=ev.detail||0; pauseTime=t; setTime(Math.max(0,t)-midiOffset); document.dispatchEvent(new CustomEvent('TIME',{detail:t})); });
}
export function play(){ if(!midiData){return;} playing=true; startMs=performance.now()-pauseTime*1000/rate; tick(); }
export function pause(){ playing=false; }
export function stop(){ playing=false; pauseTime=0; setTime(0); document.dispatchEvent(new CustomEvent('TIME',{detail:0})); }
function tick(){ if(!playing) return; const now=performance.now(); const t=((now-startMs)/1000)*rate; pauseTime=t; setTime(Math.max(0,t)-midiOffset); document.dispatchEvent(new CustomEvent('TIME',{detail:t})); requestAnimationFrame(tick); }
