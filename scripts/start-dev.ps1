# SBV Professional App - Development Server Starter
# Letzte Aktualisierung: 21. Juli 2025

Write-Host "🚀 SBV Professional Dashboard - Development Server" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# Überprüfe Node.js Installation
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js ist nicht installiert!" -ForegroundColor Red
    Write-Host "Bitte installieren Sie Node.js von https://nodejs.org" -ForegroundColor Yellow
    pause
    exit 1
}

# Überprüfe ob package.json existiert
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json nicht gefunden!" -ForegroundColor Red
    Write-Host "Stellen Sie sicher, dass Sie im Projektverzeichnis sind." -ForegroundColor Yellow
    pause
    exit 1
}

# Überprüfe .env Datei
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env Datei nicht gefunden!" -ForegroundColor Yellow
    Write-Host "Erstelle .env aus Template..." -ForegroundColor Blue
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env Datei erstellt. Bitte konfigurieren Sie Ihre Datenbankverbindung." -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example nicht gefunden!" -ForegroundColor Red
        pause
        exit 1
    }
}

# Installiere Dependencies falls nötig
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installiere Dependencies..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install fehlgeschlagen!" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "✅ Dependencies erfolgreich installiert!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🌟 Starte SBV Professional Dashboard..." -ForegroundColor Blue
Write-Host "📊 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔌 API: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "👑 Super Admin: superadmin@digitale-rakete.ch" -ForegroundColor Cyan
Write-Host ""
Write-Host "Drücken Sie Strg+C zum Beenden..." -ForegroundColor Gray

# Starte Server
node src/backend/server.js
