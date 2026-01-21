# Quick script to set Firebase Admin SDK credentials environment variable
# Run this script before starting your dev server, or set it permanently (see below)

$keyPath = "$PWD\firebase\firebase-admin-key.json"

if (Test-Path $keyPath) {
    $env:GOOGLE_APPLICATION_CREDENTIALS = $keyPath
    Write-Host "✅ Environment variable set for current session!" -ForegroundColor Green
    Write-Host "   GOOGLE_APPLICATION_CREDENTIALS = $keyPath" -ForegroundColor Gray
    Write-Host "`n⚠️  Note: This is only for the current PowerShell session." -ForegroundColor Yellow
    Write-Host "   To make it permanent, run this command as Administrator:" -ForegroundColor Yellow
    Write-Host "   [System.Environment]::SetEnvironmentVariable('GOOGLE_APPLICATION_CREDENTIALS', '$keyPath', 'User')" -ForegroundColor Cyan
} else {
    Write-Host "❌ Service account key file not found at: $keyPath" -ForegroundColor Red
    Write-Host "   Please make sure service-account-key.json exists in the project root." -ForegroundColor Yellow
}

