
from __future__ import annotations
from dataclasses import dataclass
from typing import List, Dict, Any, Tuple
import mido

@dataclass
class NoteEvent:
    pitch: int
    start: float
    end: float
    velocity: int
    track: int

def parse_midi(path: str) -> Dict[str, Any]:
    mid = mido.MidiFile(path)
    tpb = mid.ticks_per_beat
    default_tempo = 500000  # 120bpm
    def ticks_to_sec(ticks: int, tempo_us: int) -> float:
        return (ticks * tempo_us) / 1_000_000.0 / tpb

    notes: List[NoteEvent] = []
    tempos = [(0, default_tempo)]
    for ti, track in enumerate(mid.tracks):
        abs_ticks = 0
        tempo = default_tempo
        active: Dict[int, Tuple[float, int]] = {}
        for msg in track:
            abs_ticks += msg.time
            if msg.type == "set_tempo":
                tempo = msg.tempo
                tempos.append((abs_ticks, tempo))
            if msg.type == "note_on" and msg.velocity > 0:
                active[msg.note] = (ticks_to_sec(abs_ticks, tempo), msg.velocity)
            elif msg.type in ("note_off",) or (msg.type=="note_on" and msg.velocity==0):
                if msg.note in active:
                    t0, vel = active.pop(msg.note)
                    t1 = ticks_to_sec(abs_ticks, tempo)
                    if t1 > t0:
                        notes.append(NoteEvent(msg.note, t0, t1, vel, ti))
        for p,(t0,vel) in active.items():
            notes.append(NoteEvent(p, t0, t0+0.05, vel, ti))

    duration = max((n.end for n in notes), default=0.0)
    return {
        "notes":[n.__dict__ for n in notes],
        "meta":{
            "duration":duration,
            "tracks":len(mid.tracks),
            "ticks_per_beat":tpb,
            "tempos":tempos
        }
    }
