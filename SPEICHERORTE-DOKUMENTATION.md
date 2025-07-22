# 📁 SBV UPLOAD-SYSTEM - SPEICHERORTE DOKUMENTATION

## 🎯 DATEI-SPEICHERUNG (Physisch)

### 📍 Lokaler Speicherort:
```
c:\Users\Ivan\Desktop\retool\sbv-professional-app\uploads\
```

### 📝 Dateiname-Format:
```
{timestamp}-{random}.pdf
```
**Beispiele:**
- `1753201402743-922792725.pdf`
- `1753203080629-128438180.pdf`

### ⚙️ Konfiguration:
- **Max. Dateigröße**: 10MB
- **Erlaubte Formate**: Nur PDF
- **Automatische Ordner-Erstellung**: Ja

## 🗄️ DATENBANK-SPEICHERUNG

### 📍 PostgreSQL Server:
```
Host: postgresql-sbv-fg-app-u38422.vm.elestio.app
Port: 25432
Database: postgres
User: postgres
```

### 📊 Tabellen-Schema:

#### `sbv_gesuche` (Haupt-Gesuch-Daten):
```sql
CREATE TABLE sbv_gesuche (
    id SERIAL PRIMARY KEY,
    titel VARCHAR(255) NOT NULL,
    gesuch_typ VARCHAR(50) DEFAULT 'partner',
    jahr INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'eingereicht',
    eingereicht_am TIMESTAMP DEFAULT NOW(),
    uploaded_file VARCHAR(500),  -- Pfad zur physischen Datei
    beschreibung TEXT,
    file_size INTEGER,           -- Dateigröße in Bytes
    mime_type VARCHAR(100),      -- application/pdf
    antragsteller VARCHAR(255)   -- Name des Upload-Users
);
```

#### `sbv_berichte` (Automatisch generierte Rapporte):
```sql 
CREATE TABLE sbv_berichte (
    id SERIAL PRIMARY KEY,
    titel VARCHAR(255) NOT NULL,
    bericht_typ VARCHAR(50) DEFAULT 'rapport',
    jahr INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'entwurf',
    gesuch_id INTEGER REFERENCES sbv_gesuche(id),
    erstellt_am TIMESTAMP DEFAULT NOW(),
    inhalt TEXT,
    erstellt_von VARCHAR(255)
);
```

## 🔄 UPLOAD-PROZESS

### 1. Frontend-Upload:
```javascript
// Datei wird über FormData gesendet
const formData = new FormData();
formData.append('gesuch', file);       // PDF-Datei
formData.append('jahr', year);         // Jahr (z.B. 2024)
formData.append('beschreibung', desc); // Beschreibung
```

### 2. Backend-Verarbeitung:
```javascript
// Multer speichert Datei physisch
const filePath = req.file.path;        // ./uploads/timestamp-random.pdf
const fileName = req.file.originalname; // Original-Dateiname

// Datenbank-Eintrag wird erstellt
INSERT INTO sbv_gesuche (titel, jahr, uploaded_file, ...)
```

### 3. Automatische Rapport-Erstellung:
```javascript
// Für jedes hochgeladene Gesuch wird automatisch ein Rapport erstellt
INSERT INTO sbv_berichte (titel, gesuch_id, inhalt, ...)
```

## 🧪 DEBUGGING

### Terminal-Logs prüfen:
```bash
# Backend-Logs in Echtzeit
node src/backend/server.js
```

### Frontend-Console:
```javascript
// Test-Upload durchführen
testUpload(); // Automatisch geladen in archiv.html
```

### API-Endpoints:
- **Upload**: `POST /api/gesuche/upload`
- **Liste**: `GET /api/gesuche`
- **Details**: `GET /api/gesuche/:id`

## ⚡ SCHNELL-TESTS

### 1. Datei-Speicherung testen:
```cmd
dir "c:\Users\Ivan\Desktop\retool\sbv-professional-app\uploads\"
```

### 2. Datenbank-Verbindung testen:
```javascript
node test-db-connection.js
```

### 3. Upload-Endpoint testen:
```javascript
// In Browser Console (archiv.html):
testUpload();
```

## 🚨 HÄUFIGE PROBLEME

### Problem: "Port bereits in Verwendung"
```cmd
netstat -ano | findstr :3000
taskkill /f /pid [PID]
node src/backend/server.js
```

### Problem: "Uploads-Ordner nicht gefunden"
```javascript
// Backend erstellt automatisch, aber manuell:
mkdir uploads
```

### Problem: "Datei zu groß"
```javascript
// Aktuell: 10MB Limit
// In server.js: 
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
```

## 📊 AKTUELLE SPEICHER-STATISTIK

```bash
# Aktuell gespeicherte Dateien:
1753201402743-922792725.pdf (2.0 MB)
1753203080629-128438180.pdf (3.0 MB)

# Verfügbarer Speicher: Unbegrenzt (lokale Festplatte)
# Datenbankgröße: ~50MB (PostgreSQL Cloud)
```

## 🔐 SICHERHEIT

- **Authentifizierung**: JWT Token erforderlich
- **Berechtigung**: Nur Admin & Super Admin
- **Dateivalidierung**: Nur PDF, Max 10MB
- **Pfad-Sicherheit**: Keine Directory-Traversal möglich
