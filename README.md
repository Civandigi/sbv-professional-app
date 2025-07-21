# SBV Professional Web Application

## 📋 Projekt Übersicht

Professionelle Web-Anwendung für die Schweizerische Bankiervereinigung (SBV) mit Swiss Corporate Design und vollständiger Retool-Integration.

## 🏗️ Projektstruktur

```
sbv-professional-app/
├── README.md                    # Diese Datei
├── package.json                 # Node.js Dependencies
├── .env.example                # Umgebungsvariablen Template
├── src/
│   ├── frontend/               # Frontend Dateien
│   │   ├── dashboard.html      # Hauptdashboard (Swiss Corporate Design)
│   │   ├── styles/            # CSS Styles
│   │   └── scripts/           # JavaScript Dateien
│   ├── backend/               # Backend Server
│   │   ├── server.js          # Express.js Server
│   │   ├── routes/            # API Routes
│   │   ├── models/            # Datenbank Models
│   │   └── middleware/        # Express Middleware
├── config/
│   ├── database.js            # Datenbank Konfiguration
│   └── environment.js         # Umgebung Settings
├── retool-integration/
│   ├── components/            # Retool Komponenten
│   └── exports/              # Retool Exports
├── scripts/
│   ├── start-dev.ps1         # Development Server starten
│   ├── deploy.ps1            # Deployment Script
│   └── db-setup.ps1          # Datenbank Setup
└── docs/
    ├── API.md                # API Dokumentation
    ├── SETUP.md              # Setup Anleitung
    └── CHANGELOG.md          # Änderungsprotokoll
```

## 🎯 Aktuelle Features

- ✅ Swiss Corporate Design Dashboard
- ✅ PostgreSQL Datenbankintegration
- ✅ Super Admin User (superadmin@digitale-rakete.ch)
- ✅ Express.js Backend API
- ✅ Retool HTML Editor Integration
- ✅ Git Versionskontrolle

## 🚀 Quick Start

```powershell
# 1. In Projektverzeichnis wechseln
cd sbv-professional-app

# 2. Dependencies installieren
npm install

# 3. Umgebungsvariablen kopieren und konfigurieren
copy .env.example .env

# 4. Development Server starten
.\scripts\start-dev.ps1
```

## 🔧 Entwicklung

- **Frontend:** Läuft auf `http://localhost:3000`
- **API:** Verfügbar unter `http://localhost:3000/api`
- **Datenbank:** PostgreSQL (postgresql-sbv-fg-app-u38422.vm.elestio.app:25432)

## 📞 Support

- **Email:** superadmin@digitale-rakete.ch
- **Passwort:** SBV-Admin-2025-SecurePass!

---
**Letzte Aktualisierung:** 21. Juli 2025
