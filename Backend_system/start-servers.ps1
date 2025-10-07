# Start Chat System Servers
Write-Host "Starting Chat System Servers..." -ForegroundColor Green

# Start PeerJS Server
Write-Host "Starting PeerJS Server on port 9000..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "peerjs-server.js" -WindowStyle Normal

# Wait a moment for PeerJS to start
Start-Sleep -Seconds 2

# Start Main Backend Server
Write-Host "Starting Main Backend Server on port 3000..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal

Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "PeerJS Server: http://localhost:9000" -ForegroundColor Cyan
Write-Host "Backend Server: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
