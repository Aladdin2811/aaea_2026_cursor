@echo off
setlocal
cd /d "%~dp0..\.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Run-StbRateAttempt.ps1" -Attempt 1
exit /b %ERRORLEVEL%
