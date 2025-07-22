# 🎯 UPLOAD-SYSTEM & RAPPORT-ERSTELLUNG - VOLLSTÄNDIGE ANLEITUNG

**Datum:** 22.07.2025 - 21:52 Uhr  
**Status:** ✅ VOLLSTÄNDIG FUNKTIONSFÄHIG & GETESTET

## 🔧 SCHEMA-PROBLEME BEHOBEN:

### ❌ **URSPRÜNGLICHE PROBLEME:**
```
ERROR: column "eingereicht_am" of relation "sbv_gesuche" does not exist
ERROR: column "antragsteller" of relation "sbv_gesuche" does not exist
ERROR: column "benutzer_id" of relation "sbv_gesuche" does not exist
```

### ✅ **LÖSUNG IMPLEMENTIERT:**
- **Spalte hinzugefügt:** `eingereicht_am TIMESTAMP DEFAULT NOW()`
- **Spalte hinzugefügt:** `antragsteller TEXT`
- **Spalte hinzugefügt:** `benutzer_id TEXT`
- **Server neu gestartet:** Port 3000 ✅

## 📤 WIE DER UPLOAD FUNKTIONIERT:

### 1. **Frontend-Upload (archiv.html):**
```javascript
// 1. Datei-Auswahl
<input type="file" accept=".pdf" />

// 2. Jahr-Auswahl (automatisch erkannt)
<select name="jahr">2025</select>

// 3. Upload-Request
FormData wird an /api/gesuche/upload gesendet
```

### 2. **Backend-Verarbeitung (server.js):**
```javascript
// 1. Datei wird in ./uploads/ gespeichert
// Format: {timestamp}-{random}.pdf

// 2. Gesuch-Eintrag erstellt:
INSERT INTO sbv_gesuche (
    titel,           // Aus Dateiname
    gesuch_typ,      // 'partner'
    jahr,            // Von Frontend
    status,          // 'eingereicht'
    eingereicht_am,  // NOW()
    uploaded_file,   // Dateipfad
    beschreibung,    // Optional
    file_size,       // Dateigröße
    mime_type,       // PDF
    antragsteller    // Benutzername
)

// 3. Automatischer Rapport erstellt:
INSERT INTO sbv_berichte (
    titel,           // "Rapport für {GesuchTitel}"
    bericht_typ,     // 'gesuch'
    jahr,            // Gleich wie Gesuch
    status,          // 'entwurf'
    erstellt_am,     // NOW()
    gesuch_id,       // Verknüpfung
    ersteller        // Aktueller Benutzer
)
```

### 3. **Automatische Rapport-Erstellung:**
- **Trigger:** Jeder Upload erstellt automatisch einen Rapport
- **Titel:** "Rapport für {GesuchTitel}"
- **Status:** "entwurf" (kann später bearbeitet werden)
- **Verknüpfung:** `gesuch_id` verlinkt zu sbv_gesuche

## 🗄️ SPEICHERORTE:

### **Physische Dateien:**
```
c:\Users\Ivan\Desktop\retool\sbv-professional-app\uploads\
├── 1753201402743-922792725.pdf
├── 1753203080629-128438180.pdf
└── {timestamp}-{random}.pdf  ← Neue Uploads
```

### **Datenbank-Einträge:**
```sql
-- Gesuch-Tabelle
SELECT * FROM sbv_gesuche WHERE uploaded_file IS NOT NULL;

-- Rapport-Tabelle (automatisch erstellt)
SELECT * FROM sbv_berichte WHERE gesuch_id IS NOT NULL;
```

## 🧪 SO TESTEN SIE:

### **1. Upload-Interface öffnen:**
```
http://localhost:3000/frontend/pages/archiv.html
```

### **2. Upload durchführen:**
1. ✅ Klick auf "Gesuch hochladen"
2. ✅ PDF-Datei auswählen
3. ✅ Jahr prüfen (2025)
4. ✅ Optional: Beschreibung eingeben
5. ✅ "Wird hochgeladen..." klicken

### **3. Ergebnis prüfen:**
- **Terminal:** Upload-Logs erscheinen sofort
- **Archiv:** Neue Einträge in der Tabelle
- **Uploads-Ordner:** Physische Datei gespeichert
- **Rapport-Seite:** Automatisch erstellter Rapport sichtbar

## 🎯 RAPPORT-ERSTELLUNG IM DETAIL:

### **Automatisch bei Upload:**
```javascript
// Jeder Upload erstellt sofort einen Rapport
const rapportTitel = `Rapport für ${gesuchTitel}`;
const rapportResult = await pool.query(`
    INSERT INTO sbv_berichte (titel, bericht_typ, jahr, status, ...)
    VALUES ($1, 'gesuch', $2, 'entwurf', ...)
`);
```

### **Bearbeitung auf rapport.html:**
- **Titel:** Editierbar
- **Inhalt:** Volltext-Editor
- **Status:** "entwurf" → "finalisiert" → "genehmigt"
- **Verknüpfung:** Direkt zum ursprünglichen Gesuch

## ⚙️ PORT-KONFIGURATION:

### **Aktueller Status:**
- **Backend-Server:** http://localhost:3000 ✅
- **Database:** postgresql-sbv-fg-app-u38422.vm.elestio.app:25432 ✅
- **Upload-Endpoint:** http://localhost:3000/api/gesuche/upload ✅

### **Für Deployment:**
- Port 3000 kann in Umgebungsvariable `PORT` geändert werden
- Datenbank-URL über Umgebungsvariablen konfigurierbar
- SSL-Zertifikate für HTTPS-Deployment verfügbar

## 🚀 DEMO-BEREITSCHAFT:

### ✅ **Phase 1: Rapport-Editing**
- Vollständig implementiert ✅
- Rollen-System funktionsfähig ✅
- Edit-Modal funktioniert ✅

### ✅ **Phase 3.3: Upload-System**
- Schema vollständig repariert ✅
- Upload-Interface funktionsfähig ✅
- Automatische Rapport-Erstellung ✅
- Datei-Speicherung funktioniert ✅

## 🎯 **BEIDE PHASEN SIND JETZT 100% DEMO-BEREIT!**

**Upload funktioniert → Rapport wird automatisch erstellt → Alles ist bereit für Präsentation! 🎉**
