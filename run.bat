
@echo on
setlocal enableextensions enabledelayedexpansion
cd /d "%~dp0"
title SyncPiano v0.5.4a - Launcher
chcp 65001 >nul
where python >nul 2>&1 || (echo [ERROR] Python 3.10+ not found. & pause & exit /b 1)
if not exist .venv (python -m venv .venv || (echo [ERROR] venv failed & pause & exit /b 1))
call .venv\Scripts\activate
python -m pip install --upgrade pip setuptools wheel
pip install --prefer-binary -r requirements.txt || (echo [ERROR] install failed & pause & exit /b 1)
python -m backend.main
echo [EXIT CODE] %ERRORLEVEL%
pause
