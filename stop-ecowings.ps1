# stop-ecowings.ps1
# EcoWings - Tum servisleri durdurur

Write-Host "EcoWings servisleri durduruluyor..." -ForegroundColor Yellow

# Port'lari kullanan process'leri bul ve sonlandir
$ports = @(5000, 3000, 8001, 8002)

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            $processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
            Write-Host "  Port $port -> $processName (PID: $processId) durduruluyor..." -ForegroundColor Gray
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "  Port $port -> calisan servis yok" -ForegroundColor DarkGray
    }
}

# EcoWings baslikli PowerShell pencerelerini kapat
Get-Process powershell -ErrorAction SilentlyContinue | ForEach-Object {
    $title = $_.MainWindowTitle
    if ($title -match "BACKEND|FRONTEND|FAQ SERVICE|ECO AGENT|ML SERVICE") {
        Write-Host "  Pencere kapatiliyor: $title" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "Tum servisler durduruldu." -ForegroundColor Green
