
import {layoutKeys,isBlack} from './piano_layout.js';
const S={w:0,h:0,layout:null,colors:{a:'#ff3b30',b:'#ffd60a'},flags:{particles:true,liquid:true,glare:true},zoom:1,rate:1};
let canvas,ctx;export const visualNotes=[];let timeSec=0;
export function initRenderer(){
  canvas=document.getElementById('preview');ctx=canvas.getContext('2d');
  resize();window.addEventListener('resize',resize);requestAnimationFrame(loop);
  canvas.addEventListener('wheel',(e)=>{if(e.ctrlKey){e.preventDefault();const d=Math.sign(e.deltaY);S.zoom=Math.min(2.5,Math.max(0.5,S.zoom+(d>0?-0.1:0.1)));document.getElementById('zoomHud').textContent=Math.round(S.zoom*100)+'%';}});
}
export function setColors(a,b){S.colors.a=a;S.colors.b=b;}
export function setFlags(o){Object.assign(S.flags,o||{});}export function setRate(r){S.rate=r;}
export function scheduleNote(pitch,start,end,side){visualNotes.push({pitch,t0:start,t1:end,side});}
export function clearNotes(){visualNotes.length=0;}export function setTime(t){timeSec=t;}
function resize(){
  const frame=document.getElementById('previewFrame'); const W=frame.clientWidth||window.innerWidth; const H=frame.clientHeight||Math.floor(window.innerHeight*0.55);
  const targetRatio=16/9; let w=W, h=Math.round(W/targetRatio);
  if(h>H){ h=H; w=Math.round(H*targetRatio); }
  canvas.style.width=w+'px'; canvas.style.height=h+'px';
  canvas.width=w; canvas.height=h;
  S.w=w; S.h=h; S.layout=layoutKeys(S.w,S.h);
}
function rr(x,y,w,h,r){const c=ctx; c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath();}
function drawKeys(){const L=S.layout;const {whites,blacks,kbTop,gap}=L;
  // base shelf under keys (gray gradient)
  const shelfH=Math.floor(L.whiteL*0.38);
  const shelfY=kbTop+L.whiteL-2;
  const shelfGrad=ctx.createLinearGradient(0,shelfY,0,shelfY+shelfH);
  shelfGrad.addColorStop(0,'#d8dce6'); shelfGrad.addColorStop(0.5,'#c3c8d4'); shelfGrad.addColorStop(1,'#a9afbd');
  /* reflection disabled */
  // subtle ambient shadow on shelf
  /* ambient strip removed */

  // whites (ivory) with gentle vertical gradient
  ctx.save(); ctx.shadowColor='rgba(0,0,0,0.55)'; ctx.shadowBlur=22; ctx.shadowOffsetY=16;
  for(const k of whites){
    const g=ctx.createLinearGradient(k.x,k.y,k.x,k.y+k.h);
    g.addColorStop(0,'#fbfcff');
    g.addColorStop(0.28,'#f4f6fb');
    g.addColorStop(1,'#dde2ec');
    ctx.fillStyle=g; ctx.fillRect(k.x,k.y,k.w,k.h);
    // inner bevel
    ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=0.6; ctx.strokeRect(k.x+0.3,k.y+0.3,k.w-0.6,k.h-0.6);
  }
  // key gaps
  ctx.fillStyle='#0f1217'; for(const k of whites){ ctx.fillRect(Math.round(k.x-0.5),k.y,1,k.h); }

  // blacks (glossy with top shine)
  ctx.shadowColor='rgba(0,0,0,0.8)'; ctx.shadowBlur=18; ctx.shadowOffsetY=12;
  for(const k of blacks){
    const bGrad=ctx.createLinearGradient(k.x,k.y,k.x,k.y+k.h);
    bGrad.addColorStop(0,'#3f4148'); bGrad.addColorStop(0.15,'#282c33'); bGrad.addColorStop(1,'#0c1016');
    ctx.fillStyle=bGrad; rr(k.x,k.y,k.w,k.h,1.2); ctx.fill();
    const shine=ctx.createLinearGradient(k.x+2,k.y+2,k.x+2,k.y+k.h*0.44);
    shine.addColorStop(0,'rgba(255,255,255,0.40)'); shine.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=shine; rr(k.x+2,k.y+2,k.w-4,Math.max(4,k.h*0.44),6); ctx.fill();
    // cast shadow onto shelf (diagonal)
    const sx=k.x+k.w*0.5, sy=kbTop+L.whiteL;
    ctx.beginPath(); ctx.moveTo(sx-2,sy);
    ctx.lineTo(sx+L.whiteW*0.7, sy+shelfH*0.85);
    ctx.lineTo(sx+L.whiteW*0.4, sy+shelfH); ctx.closePath();
    const cs=ctx.createLinearGradient(sx,sy,sx+L.whiteW*0.8, sy+shelfH);
    cs.addColorStop(0,'rgba(0,0,0,0.12)'); cs.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=cs; ctx.fill();
  }
  ctx.restore();

  // crisp red line and glow
  const redY=kbTop-4;
  ctx.fillStyle='#b90f12'; ctx.fillRect(0,redY,S.w,2);
  const gh=ctx.createLinearGradient(0,redY-10,0,redY+16);
  gh.addColorStop(0,'rgba(255,0,0,0)');
  gh.addColorStop(0.45,'rgba(255,32,32,0.18)');
  gh.addColorStop(0.6,'rgba(255,64,64,0.65)');
  gh.addColorStop(0.8,'rgba(255,32,32,0.18)');
  gh.addColorStop(1,'rgba(255,0,0,0)');
  ctx.fillStyle=gh; ctx.fillRect(0,redY-10,S.w,26);
}
function xForPitch(p){const L=S.layout; return L.centers && L.centers[p]!==undefined ? L.centers[p] : (L.whites[0].x + L.whiteW/2);}
function drawNotes(){const L=S.layout;const bottom=L.kbTop;const a=S.colors.a,b=S.colors.b;const t=timeSec;
  for(const n of visualNotes){
    if(t>n.t1+2) continue;
    const x=xForPitch(n.pitch);
    const width=isBlack(n.pitch)?L.whiteW*0.36:L.whiteW*0.46;
    const speed=320*S.zoom*S.rate;
    const len=Math.max(8,(n.t1-t)*speed);
    const yy=bottom-Math.max(0,(t-n.t0)*speed);
    const y0=yy-len, y1=yy;
    const col=n.side===0?a:b;
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    ctx.strokeStyle=col; ctx.lineWidth=4; ctx.shadowColor=col; ctx.shadowBlur=18;
    rr(x-width/2,y0,width,y1-y0,8); ctx.stroke();
    ctx.fillStyle=col+'22'; rr(x-width/2+2,y0+2,width-4,y1-y0-4,8); ctx.fill();
    ctx.restore();
  }
}
function loop(){ ctx.clearRect(0,0,S.w,S.h); drawNotes(); drawKeys(); requestAnimationFrame(loop); }
