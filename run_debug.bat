
@echo on
setlocal enableextensions enabledelayedexpansion
cd /d "%~dp0"
title SyncPiano v0.5.4a - Debug
chcp 65001 >nul
if not exist .venv (python -m venv .venv)
call .venv\Scripts\activate
python -m pip install --upgrade pip setuptools wheel
pip install --prefer-binary -r requirements.txt
if not exist logs mkdir logs
python -X utf8 -u -m backend.main 1> logs\stdout.txt 2> logs\stderr.txt
echo ==== STDERR (tail) ====
powershell -NoProfile -Command "Get-Content -Path 'logs\\stderr.txt' -Tail 100"
pause
