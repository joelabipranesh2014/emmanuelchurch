# Firebase Admin SDK Credentials Setup Script
# This script helps you set up Firebase Admin SDK credentials for local development

Write-Host "`n🔥 Firebase Admin SDK Credentials Setup`n" -ForegroundColor Cyan

Write-Host "To use Firebase Admin SDK, you need a service account key file." -ForegroundColor Yellow
Write-Host "`nFollow these steps:`n" -ForegroundColor Yellow

Write-Host "1. Go to Firebase Console:" -ForegroundColor White
Write-Host "   https://console.firebase.google.com/" -ForegroundColor Gray

Write-Host "`n2. Select your project: emmanuel-church-e7274" -ForegroundColor White

Write-Host "`n3. Go to Project Settings → Service Accounts" -ForegroundColor White

Write-Host "`n4. Click 'Generate New Private Key'" -ForegroundColor White

Write-Host "`n5. Save the JSON file (e.g., as 'service-account-key.json')" -ForegroundColor White

Write-Host "`n6. Enter the full path to your service account key file:" -ForegroundColor Cyan
$keyPath = Read-Host "Path"

if (Test-Path $keyPath) {
    # Set environment variable for current session
    $env:GOOGLE_APPLICATION_CREDENTIALS = $keyPath
    Write-Host "`n✅ Environment variable set for current session!" -ForegroundColor Green
    Write-Host "   GOOGLE_APPLICATION_CREDENTIALS = $keyPath" -ForegroundColor Gray
    
    Write-Host "`n⚠️  Note: This setting is only for the current PowerShell session." -ForegroundColor Yellow
    Write-Host "   To make it permanent, add it to your system environment variables." -ForegroundColor Yellow
    
    Write-Host "`n📝 To make it permanent, run this command as Administrator:" -ForegroundColor Cyan
    Write-Host "   [System.Environment]::SetEnvironmentVariable('GOOGLE_APPLICATION_CREDENTIALS', '$keyPath', 'User')" -ForegroundColor Gray
    
    Write-Host "`n🚀 You can now restart your dev server (npm run dev)" -ForegroundColor Green
} else {
    Write-Host "`n❌ File not found: $keyPath" -ForegroundColor Red
    Write-Host "   Please check the path and try again." -ForegroundColor Yellow
}

Write-Host "`n"

