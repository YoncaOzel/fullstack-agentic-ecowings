# setup-python-services.ps1
# EcoWings - Tum Python servisleri icin venv'leri kurar (tek seferlik)

$projectRoot = $PSScriptRoot
$services = @("faq_service", "eco_agent_service", "ml_service")

foreach ($service in $services) {
    $servicePath = "$projectRoot\$service"
    if (-not (Test-Path $servicePath)) {
        Write-Host "HATA: $service klasoru bulunamadi: $servicePath" -ForegroundColor Red
        continue
    }

    Write-Host "$service icin venv kuruluyor..." -ForegroundColor Cyan
    Set-Location $servicePath

    if (Test-Path "venv") {
        Write-Host "   venv zaten var, atliyorum." -ForegroundColor Yellow
    } else {
        python -m venv venv
        .\venv\Scripts\Activate.ps1
        pip install --upgrade pip
        if (Test-Path "requirements.txt") {
            pip install -r requirements.txt
        } else {
            Write-Host "   requirements.txt yok, manuel kurulum gerekli." -ForegroundColor Yellow
        }
        deactivate
    }

    Set-Location $projectRoot
}

Write-Host ""
Write-Host "Tum Python servisleri icin kurulum tamamlandi." -ForegroundColor Green
