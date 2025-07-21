# SBV Professional App - Setup Anleitung

## 🎯 Überblick

Diese Anleitung führt Sie durch die komplette Installation und Konfiguration der SBV Professional Web Application.

## 📋 Voraussetzungen

- **Node.js** (Version 16 oder höher)
- **PostgreSQL** Zugriff (bereits konfiguriert)
- **PowerShell** (Windows)
- **Git** (für Versionskontrolle)

## 🚀 Installation

### 1. Projektverzeichnis

```powershell
# Navigieren Sie in das Projektverzeichnis
cd c:\Users\Ivan\Desktop\retool\sbv-professional-app
```

### 2. Automatische Installation

```powershell
# Starten Sie den Development Server (installiert automatisch alle Dependencies)
.\scripts\start-dev.ps1
```

Das Skript führt automatisch folgende Schritte aus:
- ✅ Überprüft Node.js Installation
- ✅ Erstellt .env Datei aus Template
- ✅ Installiert npm Dependencies
- ✅ Startet den Express.js Server

### 3. Manuelle Installation (Optional)

```powershell
# Dependencies installieren
npm install

# .env Datei konfigurieren
copy .env.example .env
# Bearbeiten Sie .env mit Ihren Datenbankdaten

# Server starten
npm start
```

## 🔧 Konfiguration

### Umgebungsvariablen (.env)

```bash
# Server
PORT=3000
NODE_ENV=development

# Datenbank (bereits konfiguriert)
DB_HOST=postgresql-sbv-fg-app-u38422.vm.elestio.app
DB_PORT=25432
DB_NAME=sbv_fg_app

# Super Admin (bereits erstellt)
SUPER_ADMIN_EMAIL=superadmin@digitale-rakete.ch
SUPER_ADMIN_PASSWORD=SBV-Admin-2025-SecurePass!
```

## 🌐 Zugriff

Nach dem Start ist die Anwendung verfügbar unter:

- **Frontend Dashboard:** `http://localhost:3000`
- **API Endpoints:** `http://localhost:3000/api`
- **API Dokumentation:** `http://localhost:3000/api/docs`

### Super Admin Login

- **Email:** `superadmin@digitale-rakete.ch`
- **Passwort:** `SBV-Admin-2025-SecurePass!`

## 📁 Projektstruktur

```
sbv-professional-app/
├── src/
│   ├── frontend/           # Swiss Corporate Design Dashboard
│   │   ├── dashboard.html  # Hauptdashboard
│   │   ├── scripts/        # JavaScript Dateien
│   │   └── styles/         # CSS Stylesheets
│   └── backend/           # Express.js Server
│       ├── server.js      # Hauptserver
│       ├── routes/        # API Routes
│       └── models/        # Datenmodelle
├── retool-integration/    # Retool Komponenten
├── scripts/              # Deployment Scripts
├── config/              # Konfigurationsdateien
└── docs/               # Dokumentation
```

## 🔍 Entwicklung

### Server neustarten

```powershell
# Server stoppen: Strg+C
# Server neu starten:
.\scripts\start-dev.ps1
```

### Logs überprüfen

Der Server zeigt alle wichtigen Informationen in der Konsole:
- ✅ Datenbankverbindung
- ✅ Super Admin Status
- ✅ API Endpunkte
- ⚠️ Fehler und Warnungen

## 🆘 Problembehandlung

### Server startet nicht

```powershell
# Port 3000 bereits belegt?
Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force

# Node.js Prozesse beenden
Get-Process node | Stop-Process -Force
```

### Datenbankverbindung fehlgeschlagen

1. Überprüfen Sie die .env Datei
2. Stellen Sie sicher, dass PostgreSQL erreichbar ist
3. Führen Sie `.\scripts\db-setup.ps1` aus

### Dependencies Probleme

```powershell
# Löschen und neu installieren
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
```

## 📞 Support

Bei Problemen wenden Sie sich an:
- **Email:** superadmin@digitale-rakete.ch
- **Dokumentation:** `docs/` Verzeichnis
