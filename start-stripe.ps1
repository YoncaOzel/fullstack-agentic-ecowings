$appsettings = "$PSScriptRoot\Backend\CleanArchitecture\CleanArchitecture.WebApi\appsettings.json"
$forwardTo   = "https://localhost:5000/api/payment/webhook"

Write-Host "Stripe webhook secret aliniyor..." -ForegroundColor Cyan
$secret = stripe listen --print-secret 2>$null
if (-not $secret -or -not $secret.StartsWith("whsec_")) {
    Write-Host "HATA: Secret alinamadi. 'stripe login' yapip tekrar dene." -ForegroundColor Red
    exit 1
}

$content = Get-Content $appsettings -Raw
$updated = $content -replace '"WebhookSecret"\s*:\s*"whsec_[^"]*"', """WebhookSecret"": ""$secret"""
Set-Content $appsettings -Value $updated -Encoding utf8 -NoNewline

Write-Host "appsettings.json guncellendi: $secret" -ForegroundColor Green
Write-Host ""
Write-Host "Stripe dinleniyor -> $forwardTo" -ForegroundColor Cyan
stripe listen --forward-to $forwardTo
