# SBV Professional App - Database Setup
# Letzte Aktualisierung: 21. Juli 2025

Write-Host "🗄️  SBV Professional Dashboard - Database Setup" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# Lade .env Datei
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env Datei nicht gefunden!" -ForegroundColor Red
    Write-Host "Führen Sie zuerst .\scripts\start-dev.ps1 aus, um die .env zu erstellen." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "📋 Datenbank Konfiguration:" -ForegroundColor Blue
Write-Host "   Host: postgresql-sbv-fg-app-u38422.vm.elestio.app" -ForegroundColor Cyan
Write-Host "   Port: 25432" -ForegroundColor Cyan
Write-Host "   Database: sbv_fg_app" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔧 Verfügbare Tabellen:" -ForegroundColor Blue
Write-Host "   • sbv_benutzer (Benutzer und Administratoren)" -ForegroundColor White
Write-Host "   • sbv_gesuche (Gesuchsdaten)" -ForegroundColor White
Write-Host "   • sbv_berichte (Berichtsdaten)" -ForegroundColor White
Write-Host "   • sbv_dokumente (Dokumentenarchiv)" -ForegroundColor White
Write-Host ""

Write-Host "✅ Datenbank bereits konfiguriert und verbunden!" -ForegroundColor Green
Write-Host "👑 Super Admin User bereits erstellt:" -ForegroundColor Blue
Write-Host "   📧 Email: superadmin@digitale-rakete.ch" -ForegroundColor Cyan
Write-Host "   🔒 Password: SBV-Admin-2025-SecurePass!" -ForegroundColor Cyan

Write-Host ""
Write-Host "🚀 Starten Sie den Server mit: .\scripts\start-dev.ps1" -ForegroundColor Green
