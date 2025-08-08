
import sys, pathlib, os, traceback
from PySide6.QtCore import Qt, QUrl
from PySide6.QtGui import QShortcut
from PySide6.QtWidgets import QApplication, QMainWindow, QMessageBox
from PySide6.QtWebEngineWidgets import QWebEngineView
from PySide6.QtWebChannel import QWebChannel

APP_DIR = pathlib.Path(__file__).resolve().parents[1]

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("SyncPiano v0.5.4a")
        self.view = QWebEngineView(self)
        self.setCentralWidget(self.view)

        from .bridge import Bridge
        channel = QWebChannel(self.view.page())
        self.bridge = Bridge(self)
        channel.registerObject("bridge", self.bridge)
        self.view.page().setWebChannel(channel)

        index_path = (APP_DIR / "frontend" / "index.html").resolve()
        if not index_path.exists():
            html = f"""<html><body style='background:#1e1e1e;color:#eee;font-family:sans-serif'>
            <h2>index.html が見つかりません</h2>
            <p>探した場所: {index_path}</p>
            <p>解凍フォルダの構成を維持したまま展開してください。</p>
            </body></html>"""
            self.view.setHtml(html)
        else:
            self.view.setUrl(QUrl.fromLocalFile(str(index_path)))

        self.showFullScreen()
        QShortcut(Qt.Key_F11, self, activated=self.toggle_fullscreen)  # F11 toggle
        QShortcut(Qt.Key_Escape, self, activated=lambda: self.showNormal())  # ESC exits fullscreen

    def toggle_fullscreen(self):
        if self.isFullScreen():
            self.showNormal()
        else:
            self.showFullScreen()

def main():
    try:
        os.environ["QTWEBENGINE_DISABLE_SANDBOX"] = "1"
        app = QApplication(sys.argv)
        w = MainWindow()
        w.show()
        sys.exit(app.exec())
    except Exception as e:
        tb = traceback.format_exc()
        try:
            (APP_DIR / "logs").mkdir(exist_ok=True, parents=True)
            with open(str(APP_DIR / "logs" / "fatal.txt"), "w", encoding="utf-8") as f:
                f.write(tb)
        except Exception:
            pass
        QMessageBox.critical(None, "SyncPiano fatal error", tb)
        raise

if __name__ == "__main__":
    main()
