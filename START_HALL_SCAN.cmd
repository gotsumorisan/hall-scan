@echo off
setlocal
cd /d "%~dp0"
if not exist "node_modules\vite\bin\vite.js" (
  echo Dependencies are missing. Run pnpm install first. See README.md.
  pause
  exit /b 1
)
set "HALL_SCAN_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
echo HALL SCAN: http://127.0.0.1:5173
if exist "%HALL_SCAN_NODE%" (
  "%HALL_SCAN_NODE%" "node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5173
) else (
  node "node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5173
)
