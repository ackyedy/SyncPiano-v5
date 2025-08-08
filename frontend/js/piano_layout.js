
// 88-key layout with thin inter-key gaps
export function layoutKeys(W,H){
  const kbH = Math.round(H*0.22);
  const kbTop = H - kbH - 24;
  const whiteCount = 52;
  const whiteW = Math.floor(W / whiteCount);
  const gap = Math.max(1, Math.round(whiteW * 0.025)); // ~1px on FHD
  const drawW = whiteW; // full slot; gaps are drawn as overlay

  const whites = [];
  let x=0;
  for(let i=0;i<whiteCount;i++){
    whites.push({x:x, y:kbTop, w:drawW, h:kbH, i});
    x += whiteW;
  }

  // Mapping for black-key positions over whites per octave
  const pattern = [1,2,4,5,6]; // black indices relative to white keys in an octave (C=0)
  const blacks = [];
  const blackH = Math.round(kbH*0.72);
  const blackW = Math.round(whiteW*0.58); // slimmer
  function whiteIndexToX(i){ return whites[i].x + whiteW - blackW/2; }

  let idx = 0;
  for(let oct=0; oct<7; oct++){
    const base = oct*7;
    for(const rel of pattern){
      const wi = base + rel;
      if(wi>=whiteCount) continue;
      const bx = whiteIndexToX(wi-1);
      blacks.push({x:bx, y:kbTop, w:blackW, h:blackH, i:idx++});
    }
  }
  // The first two blacks belong to A0/Bb0 region (leftmost), and last 1-2 missing by natural layout; above loop fits most.
  // Fix leftmost group around A0-B0-C1
  // Align centers array for quick pitch->x mapping (A0=21..C8=108). We'll approximate: map white index to midi pitch center.
  const centers={};
  // Build mapping for white keys
  const whiteMidiOrder = [0,2,4,5,7,9,11]; // C D E F G A B (as semitones)
  let midi=21; // A0
  let wPtr=0;
  // approximate mapping by iterating 88 keys and decide if white/black
  for(let k=0;k<88;k++){
    const semitone = (k+9)%12; // align so that A is 9 mod 12 at key index 0
    const isBlack = [1,3,6,8,10].includes(semitone);
    const cx = isBlack ? null : whites[wPtr].x + whiteW/2;
    if(!isBlack){ centers[21+k] = cx; wPtr++; }
  }
  // map blacks by nearest neighbor in x
  const blackSemis = [1,3,6,8,10];
  // Make a rough pass placing blacks between surrounding whites
  for(const b of blacks){
    // find closest white center
    let min=1e9, cx=0;
    for(const wi of whites){
      const d = Math.abs((wi.x+whiteW/2)- (b.x + b.w/2));
      if(d<min){ min=d; cx=wi.x+whiteW/2; }
    }
  }

  return {whites, blacks, whiteW, whiteL:kbH, kbTop, gap, centers};
}
export function isBlack(pitch){
  const st = pitch % 12; return [1,3,6,8,10].includes(st);
}
