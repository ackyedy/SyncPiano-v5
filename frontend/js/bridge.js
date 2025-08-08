
export let backend=null;
let ready=null;
export function initBridge(){
  if(backend) return Promise.resolve(backend);
  if(ready) return ready;
  ready = new Promise((resolve)=>{
    if(typeof qt==='undefined'||!qt.webChannelTransport){console.warn('Qt WebChannel not available.');resolve(null);return;}
    new QWebChannel(qt.webChannelTransport,function(ch){
      backend=ch.objects.bridge;
      backend.logMessage.connect((m)=>document.dispatchEvent(new CustomEvent('NOTIFY',{detail:m})));
      backend.notify.connect((m)=>document.dispatchEvent(new CustomEvent('NOTIFY',{detail:m})));
      backend.midiLoaded.connect((json)=>document.dispatchEvent(new CustomEvent('MIDI_LOADED',{detail:JSON.parse(json)})));
      backend.exportDone.connect((p)=>document.dispatchEvent(new CustomEvent('EXPORT_DONE',{detail:p})));
      backend.recentUpdated.connect((json)=>document.dispatchEvent(new CustomEvent('RECENT',{detail:JSON.parse(json)})));
      resolve(backend);
    });
  });
  return ready;
}
