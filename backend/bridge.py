
from PySide6.QtCore import QObject, Signal, Slot
from PySide6.QtWidgets import QFileDialog
from .midi_parser import parse_midi
import json, shutil, subprocess, os, pathlib

class Bridge(QObject):
    logMessage = Signal(str)
    midiLoaded = Signal(str)
    notify = Signal(str)
    exportDone = Signal(str)
    recentUpdated = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.recent = []

    def _add_recent(self, path: str):
        p = str(pathlib.Path(path).resolve())
        if p not in self.recent:
            self.recent.insert(0, p)
            self.recent = self.recent[:12]
        self.recentUpdated.emit(json.dumps(self.recent))

    @Slot()
    def openMidi(self):
        dlg = QFileDialog()
        dlg.setFileMode(QFileDialog.ExistingFile)
        dlg.setNameFilters(["MIDI files (*.mid *.midi)","All files (*.*)"])
        if dlg.exec():
            path = dlg.selectedFiles()[0]
            self.openPath(path)

    @Slot(str)
    def openPath(self, path: str):
        if not path:
            self.notify.emit("No path."); return
        p = pathlib.Path(path)
        if not p.exists():
            self.notify.emit(f"Not found: {path}"); return
        self._add_recent(path)
        ext = p.suffix.lower()
        try:
            if ext in (".mid",".midi"):
                self.logMessage.emit(f"Loading MIDI: {p}")
                data = parse_midi(str(p))
                self.midiLoaded.emit(json.dumps(data))
                self.notify.emit("MIDI loaded.")
            else:
                self.notify.emit(f"Loaded: {p.name}")
        except Exception as e:
            self.notify.emit(f"Failed to open: {e}")

    @Slot(result=str)
    def chooseDir(self) -> str:
        dlg = QFileDialog()
        dlg.setFileMode(QFileDialog.Directory)
        if dlg.exec():
            return dlg.selectedFiles()[0]
        return ""

    @Slot(str, str, int, int, int, str, result=bool)
    def exportVideo(self, out_dir: str, out_name: str, width: int, height: int, fps: int, fmt: str) -> bool:
        try:
            if shutil.which("ffmpeg") is None:
                self.notify.emit("ffmpeg not found. PNG sequence only."); return False
            os.makedirs(out_dir, exist_ok=True)
            if fmt.lower() == "webm":
                out_path = os.path.join(out_dir, f"{out_name}.webm")
                cmd = ["ffmpeg","-y","-framerate",str(fps),"-f","image2",
                       "-s",f"{width}x{height}",
                       "-i",os.path.join(out_dir,"frame_%06d.png"),
                       "-c:v","libvpx-vp9","-b:v","0","-crf","33","-pix_fmt","yuv420p",
                       out_path]
            else:
                out_path = os.path.join(out_dir, f"{out_name}.mp4")
                cmd = ["ffmpeg","-y","-framerate",str(fps),"-f","image2",
                       "-s",f"{width}x{height}",
                       "-i",os.path.join(out_dir,"frame_%06d.png"),
                       "-c:v","libx264","-pix_fmt","yuv420p","-movflags","+faststart",
                       out_path]
            subprocess.run(cmd, check=True)
            self.exportDone.emit(out_path); return True
        except Exception as e:
            self.notify.emit(f"Export error: {e}"); return False
