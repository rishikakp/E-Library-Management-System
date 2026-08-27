Write-Host "Starting E-Library application..." -ForegroundColor Green

$backendDir = Join-Path -Path $PSScriptRoot -ChildPath "backend"
$frontendDir = Join-Path -Path $PSScriptRoot -ChildPath "frontend"

# Start backend in new terminal
Start-Process -WindowStyle Normal -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; npm start"

Start-Sleep -Seconds 3

# Start frontend in new terminal
Start-Process -WindowStyle Normal -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm run dev"

Write-Host "`nBoth servers starting..."
Write-Host "  Backend:  http://localhost:5000"
Write-Host "  Frontend: http://localhost:5173"
