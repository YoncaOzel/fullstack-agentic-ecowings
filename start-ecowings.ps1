# start-ecowings.ps1
# EcoWings - Tum servisleri tek komutla baslatir

$projectRoot = $PSScriptRoot
Write-Host "EcoWings baslatiliyor..." -ForegroundColor Cyan
Write-Host "Proje koku: $projectRoot" -ForegroundColor Gray
Write-Host ""

# 1. Backend (.NET 8) - HTTPS port 5000
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$Host.UI.RawUI.WindowTitle = 'BACKEND (.NET)'; Set-Location '$projectRoot\Backend'; Write-Host 'Backend baslatiliyor...' -ForegroundColor Blue; dotnet run --project CleanArchitecture/CleanArchitecture.WebApi"
)

Start-Sleep -Seconds 2

# 2. Frontend (Vite) - port 3000
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$Host.UI.RawUI.WindowTitle = 'FRONTEND (Vite)'; Set-Location '$projectRoot\frontend\ecowings'; Write-Host 'Frontend baslatiliyor...' -ForegroundColor Green; npm run dev"
)

Start-Sleep -Seconds 2

# 3. FAQ Service - port 8001
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$Host.UI.RawUI.WindowTitle = 'FAQ SERVICE (8001)'; Set-Location '$projectRoot\faq_service'; `$env:PYTHONIOENCODING='utf-8'; Write-Host 'FAQ Service baslatiliyor (port 8001)...' -ForegroundColor Yellow; .\venv\Scripts\uvicorn.exe main:app --reload --host 0.0.0.0 --port 8001"
)

Start-Sleep -Seconds 2

# 4. Eco Agent Service - port 8002
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$Host.UI.RawUI.WindowTitle = 'ECO AGENT SERVICE (8002)'; Set-Location '$projectRoot\eco_agent_service'; Write-Host 'Eco Agent baslatiliyor (port 8002)...' -ForegroundColor Magenta; .\venv\Scripts\uvicorn.exe main:app --reload --host 0.0.0.0 --port 8002"
)

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Tum servisler baslatildi!" -ForegroundColor Green
Write-Host ""
Write-Host "Servis adresleri:" -ForegroundColor Cyan
Write-Host "   Frontend       -> http://localhost:3000" -ForegroundColor Gray
Write-Host "   Backend API    -> https://localhost:5000/swagger" -ForegroundColor Gray
Write-Host "   FAQ Service    -> http://localhost:8001/docs" -ForegroundColor Gray
Write-Host "   Eco Agent      -> http://localhost:8002/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "Durdurmak icin: .\stop-ecowings.ps1" -ForegroundColor Yellow
