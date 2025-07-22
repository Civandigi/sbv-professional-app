// Fix-Script für Datenbank-Referenzen
const fs = require('fs');
const path = require('path');

console.log('🔧 DATENBANK-REFERENZ-FIX WIRD AUSGEFÜHRT...\n');

// Zu bearbeitende Dateien
const targetFiles = [
    'src/backend/server.js',
    'src/backend/database.js',
    'src/backend/routes/rapport-routes.js'
];

// Backup-Ordner erstellen
const backupDir = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
fs.mkdirSync(backupDir, { recursive: true });

let totalChanges = 0;

// Regex-Pattern für Ersetzungen
const replacements = [
    // SQL Queries
    { from: /FROM\s+users\b/g, to: 'FROM sbv_benutzer' },
    { from: /INSERT\s+INTO\s+users\b/g, to: 'INSERT INTO sbv_benutzer' },
    { from: /UPDATE\s+users\b/g, to: 'UPDATE sbv_benutzer' },
    { from: /DELETE\s+FROM\s+users\b/g, to: 'DELETE FROM sbv_benutzer' },
    { from: /JOIN\s+users\b/g, to: 'JOIN sbv_benutzer' },
    { from: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?users\b/g, to: 'CREATE TABLE IF NOT EXISTS sbv_benutzer' },
    { from: /ALTER\s+TABLE\s+users\b/g, to: 'ALTER TABLE sbv_benutzer' },
    { from: /DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?users\b/g, to: 'DROP TABLE IF EXISTS sbv_benutzer' },
    
    // String Literale
    { from: /'users'/g, to: "'sbv_benutzer'" },
    { from: /"users"/g, to: '"sbv_benutzer"' },
    { from: /`users`/g, to: '`sbv_benutzer`' }
];

for (const filePath of targetFiles) {
    try {
        console.log(`\n📄 Bearbeite: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
            console.log(`   ⚠️ Datei nicht gefunden: ${filePath}`);
            continue;
        }

        // Backup erstellen
        const backupPath = path.join(backupDir, filePath.replace(/\//g, '-'));
        fs.copyFileSync(filePath, backupPath);
        console.log(`   ✅ Backup erstellt in: ${backupPath}`);

        // Datei lesen und Ersetzungen durchführen
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        for (const { from, to } of replacements) {
            content = content.replace(from, to);
        }

        if (content !== originalContent) {
            // Änderungen in Datei schreiben
            fs.writeFileSync(filePath, content, 'utf8');
            totalChanges++;
            console.log(`   ✅ Änderungen gespeichert`);
        } else {
            console.log(`   ℹ️ Keine Änderungen erforderlich`);
        }

    } catch (error) {
        console.error(`   ❌ Fehler bei ${filePath}:`, error.message);
    }
}

console.log('\n✅ DATENBANKFIX ABGESCHLOSSEN');
console.log(`📊 Statistik:`);
console.log(`   - Geänderte Dateien: ${totalChanges}`);
console.log(`   - Backup-Verzeichnis: ${backupDir}`);
console.log('\n💡 Bitte führen Sie folgende Schritte aus:');
console.log('   1. Überprüfen Sie die Änderungen');
console.log('   2. Führen Sie "npm start" aus');
console.log('   3. Testen Sie den Login');
