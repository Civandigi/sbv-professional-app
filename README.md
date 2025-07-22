# SBV Professional Web Application

## 📋 Projekt Übersicht

Professionelle Web-Anwendung für die Schweizerische Bankiervereinigung (SBV) mit Swiss Corporate Design, Rapport-System und rollenbasierten Berechtigungen.

## 🔥 PHASE 1 - Rapport-Editing System (IMPLEMENTIERT)

**Status: ✅ ABGESCHLOSSEN**

### Features:
- ✅ **PUT /api/berichte/:id** - Rapport Bearbeitungs-API
- ✅ **Rollenbasierte Berechtigungen**:
  - Super Admin: Kann alles (Bearbeiten + Genehmigen)
  - Admin: Kann Rapporte bearbeiten (aber nicht genehmigen)
  - User: Kann Rapporte nur anzeigen
- ✅ **Frontend Integration** in `rapport.html` mit:
  - Echte API-Aufrufe statt Dummy-Daten
  - Modal-Editor für Rapport-Bearbeitung
  - Rollenbasierte UI-Einschränkungen
  - Status-Management (Entwurf → In Bearbeitung → Fertig → Genehmigt)

### Test-Benutzer:
```
Super Admin: superadmin@sbv-demo.ch (Passwort: test123)
Admin:       admin@sbv-demo.ch      (Passwort: test123)  
User:        user@sbv-demo.ch       (Passwort: test123)
```

### API-Endpunkte:
```
PUT /api/berichte/:id - Rapport bearbeiten
Berechtigung: Admin/Super Admin
Payload: { titel, beschreibung, jahr, status, notizen }
```

## 🏗️ Projektstruktur

```
sbv-professional-app/
├── README.md                    # Diese Datei
├── package.json                 # Node.js Dependencies  
├── scripts/
│   └── create-test-users.sql    # Demo-Benutzer für Tests
├── src/
│   ├── frontend/               # Frontend Dateien
│   │   ├── pages/
│   │   │   ├── rapport.html    # ✅ PHASE 1: Rapport-Management mit Backend-Integration
│   │   │   └── einstellungen.html # ✅ Saubere API-Docs (ohne Emojis)
│   ├── backend/               # Backend Server
│   │   └── server.js          # ✅ PUT /api/berichte/:id implementiert
├── retool-integration/
│   └── gesuch-tool/           # Retool Integration
└── docs/
    └── SETUP.md               # Setup Anleitung
```

## 🎯 Aktuelle Features

### ✅ FERTIG:
- Swiss Corporate Design Dashboard
- PostgreSQL Datenbankintegration 
- Express.js Backend API mit JWT-Auth
- Rollenbasiertes Benutzer-System
- **PHASE 1: Rapport-Editing** (Admin kann bearbeiten, Super Admin kann genehmigen)
- API-Dokumentation (sauber, ohne Emojis)
- Test-Benutzer für Demo

### 🔜 NÄCHSTE PHASEN:
- **Phase 2**: Erweiterte Rollen-Beschränkungen im UI
- **Phase 3**: Genehmigungsworkflow mit E-Mail-Benachrichtigungen  
- **Phase 4**: Datei-Anhänge für Rapporte

## 🚀 Quick Start

```bash
# 1. Dependencies installieren
npm install

# 2. Server starten  
npm start

# 3. Browser öffnen
http://localhost:3000

# 4. Testen
# Login: superadmin@sbv-demo.ch / test123
# Gehe zu: http://localhost:3000/pages/rapport.html
# Klicke "Bearbeiten" bei einem Rapport
```

## 📡 API Status

### 🟢 Implementiert:
- `GET /api/berichte` - Alle Rapporte abrufen
- `PUT /api/berichte/:id` - **[NEU]** Rapport bearbeiten (rollenbasiert)
- `POST /api/berichte/from-gesuch` - Rapport aus Gesuch erstellen
- `POST /api/gesuche/upload` - PDF-Upload (Super Admin only)
- `GET /api/health` - Server-Status

### Rollen-Matrix:
| Aktion | User | Admin | Super Admin |
|--------|------|-------|------------|
| Rapporte anzeigen | ✅ | ✅ | ✅ |
| Rapporte bearbeiten | ❌ | ✅ | ✅ |
| Rapporte genehmigen | ❌ | ❌ | ✅ |
| PDF hochladen | ❌ | ❌ | ✅ |

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
