
import {initBridge} from './bridge.js';
let backend=null; initBridge().then(b=>backend=b);
let isPlaying=false;
const btn=document.getElementById('btnPlay');

function render(){
  btn.textContent = isPlaying ? '⏸' : '▶';
  btn.title = isPlaying ? 'Pause' : 'Play';
}
btn?.addEventListener('click',()=>{
  isPlaying=!isPlaying; render();
  if(backend){ backend.send && backend.send(isPlaying?'PLAY':'PAUSE'); }
  document.dispatchEvent(new CustomEvent(isPlaying?'PLAY':'PAUSE'));
});
document.addEventListener('ENDED',()=>{ isPlaying=false; render(); });
render();
