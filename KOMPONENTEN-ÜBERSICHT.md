# 🏦 SBV Professional App - Komponenten Übersicht

## 📁 Projektstruktur

```
sbv-professional-app/
├── src/
│   ├── backend/
│   │   └── server.js                   # Express.js Server mit PostgreSQL
│   └── frontend/
│       ├── dashboard.html              # Hauptdashboard (Swiss Corporate Design)
│       ├── pages/
│       │   ├── gesuche.html           # Gesuche mit Retool-Integration
│       │   ├── gesuche-kanban.html    # Kanban-Board für Gesuche
│       │   ├── berichte.html          # Berichte mit AI-Systemen
│       │   ├── berichte-portal.html   # Erweiterte Berichte
│       │   ├── bericht-erstellen.html # Bericht-Creator
│       │   ├── dokumente.html         # Dokumentenverwaltung
│       │   └── rapport-erstellen.html # Rapport-Creator
│       ├── assets/                    # Statische Assets
│       ├── js/                        # JavaScript Dateien
│       └── scripts/                   # Frontend Scripts
├── retool-components/
│   ├── SBV_Gesuch_APP.json          # Hauptgesuch-App Export
│   ├── SBV-Gesuch-Tool-Dashboard.json # Dashboard Export
│   ├── SBV-Current-Export.json      # Aktueller Export
│   └── SBV-Gesuch-Tool/             # RSX-Komponenten
│       ├── main.rsx                  # Haupt-Retool-Komponente
│       ├── sidebar.rsx               # Navigation
│       ├── src/
│       │   ├── Gesuche.rsx          # Gesuche-Komponente
│       │   ├── Rapport.rsx          # Rapport-Komponente
│       │   ├── neuesgesuch.rsx      # Neues Gesuch
│       │   └── container3.rsx       # Container
│       └── lib/
│           ├── html1.html           # HTML-Templates
│           └── html1.css            # Styles
├── config/                          # Konfigurationsdateien
├── docs/                           # Dokumentation
└── scripts/                        # Build/Deploy Scripts
```

## 🎯 Integrierte Retool-Komponenten

### 📄 Gesuche-System
- **gesuche.html**: Vollständige Gesuche-Verwaltung mit PDF-Viewer
- **gesuche-kanban.html**: Kanban-Board für Gesuch-Workflow
- **Gesuche.rsx**: Original Retool-Komponente für Gesuche

### 📊 Berichte & Analysen
- **berichte.html**: AI-gestütztes Berichtssystem
- **berichte-portal.html**: Erweiterte Berichte-Übersicht
- **bericht-erstellen.html**: Interactive Berichterstellung
- **rapport-erstellen.html**: Detaillierte Rapport-Erstellung
- **Rapport.rsx**: Original Retool-Rapport-Komponente

### 📁 Dokumentenverwaltung
- **dokumente.html**: Upload und Verwaltung von Dokumenten
- **html1.html/css**: Template-System für Dokumente

## 🔧 Technische Integration

### Backend (server.js)
- ✅ PostgreSQL Datenbankverbindung
- ✅ Super Admin User (superadmin@digitale-rakete.ch)
- ✅ REST API Endpoints
- ✅ File Upload Support
- ✅ CORS & Security

### Frontend (dashboard.html)
- ✅ Swiss Corporate Design
- ✅ Plus Jakarta Sans Schriftart
- ✅ Responsive Navigation
- ✅ iframe-Integration für Retool-Komponenten
- ✅ Modern UI/UX

### Retool-Integration
- ✅ RSX-Komponenten verfügbar
- ✅ JSON-Exports für Import
- ✅ HTML-Templates als Fallback
- ✅ iframe-Embedding möglich

## 🚀 Deployment

```bash
cd sbv-professional-app
npm install
npm start
```

Server läuft auf: http://localhost:3000

## 📋 Nächste Schritte

1. **Retool-Einbindung**: iframe-Integration in dashboard.html
2. **API-Verbindung**: Retool-Komponenten mit PostgreSQL verbinden
3. **Testing**: Alle Komponenten durchtesten
4. **Documentation**: API-Dokumentation erweitern
