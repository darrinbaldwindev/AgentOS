@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0AgentOS-Install.ps1"
if errorlevel 1 (
  echo.
  echo AgentOS installation failed. Review the message above.
  pause
  exit /b 1
)
echo.
echo AgentOS v1 installation completed successfully.
pause
