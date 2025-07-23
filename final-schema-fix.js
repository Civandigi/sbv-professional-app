/**
 * FINAL SCHEMA FIX - Komplette Reparatur für Upload-System
 * Fügt ALLE fehlenden Spalten hinzu, die der Backend-Code erwartet
 */

const { Client } = require('pg');

async function finalSchemaFix() {
    const client = new Client({
        host: 'postgresql-sbv-fg-app-u38422.vm.elestio.app',
        port: 25432,
        database: 'postgres',
        user: 'postgres',
        password: 'RvFb9djO-BpZC-JpFFB2su',
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Datenbankverbindung hergestellt');

        // 1. Überprüfung der aktuellen sbv_berichte Struktur
        console.log('\n📋 Aktuelle Struktur von sbv_berichte:');
        const currentColumns = await client.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'sbv_berichte'
            ORDER BY ordinal_position
        `);
        
        currentColumns.rows.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });

        // 2. Benötigte Spalten für Upload-System
        const requiredColumns = [
            { name: 'titel', type: 'TEXT', nullable: false },
            { name: 'bericht_typ', type: 'VARCHAR(50)', nullable: false },
            { name: 'jahr', type: 'INTEGER', nullable: false },
            { name: 'status', type: 'VARCHAR(50)', nullable: false },
            { name: 'gesuch_id', type: 'INTEGER', nullable: true },
            { name: 'erstellt_am', type: 'TIMESTAMP', nullable: false, default: 'NOW()' },
            { name: 'inhalt', type: 'TEXT', nullable: true },
            { name: 'erstellt_von', type: 'VARCHAR(255)', nullable: true }
        ];

        const existingColumnNames = currentColumns.rows.map(col => col.column_name);

        console.log('\n🔧 Fehlende Spalten werden hinzugefügt:');
        
        for (const column of requiredColumns) {
            if (!existingColumnNames.includes(column.name)) {
                console.log(`  ➕ Füge hinzu: ${column.name} (${column.type})`);
                
                let alterQuery = `ALTER TABLE sbv_berichte ADD COLUMN ${column.name} ${column.type}`;
                
                if (!column.nullable) {
                    if (column.default) {
                        alterQuery += ` DEFAULT ${column.default} NOT NULL`;
                    } else {
                        // Für NOT NULL Spalten ohne Default erst mit Default hinzufügen, dann Default entfernen
                        alterQuery += ` DEFAULT '' NOT NULL`;
                    }
                }

                await client.query(alterQuery);
                console.log(`    ✅ ${column.name} erfolgreich hinzugefügt`);

                // Default entfernen wenn es nur temporär war
                if (!column.nullable && !column.default && column.name !== 'erstellt_am') {
                    await client.query(`ALTER TABLE sbv_berichte ALTER COLUMN ${column.name} DROP DEFAULT`);
                    console.log(`    🔄 Temporärer Default für ${column.name} entfernt`);
                }
            } else {
                console.log(`  ✓ ${column.name} bereits vorhanden`);
            }
        }

        // 3. Überprüfung nach den Änderungen
        console.log('\n📋 Struktur nach Schema-Fix:');
        const updatedColumns = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'sbv_berichte'
            ORDER BY ordinal_position
        `);
        
        updatedColumns.rows.forEach(col => {
            const defaultInfo = col.column_default ? ` DEFAULT ${col.column_default}` : '';
            console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})${defaultInfo}`);
        });

        // 4. Test-Insert zur Überprüfung
        console.log('\n🧪 Test-Insert zur Überprüfung...');
        try {
            const testResult = await client.query(`
                INSERT INTO sbv_berichte (
                    titel, 
                    bericht_typ, 
                    jahr, 
                    status, 
                    gesuch_id,
                    erstellt_am,
                    inhalt,
                    erstellt_von
                ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
                RETURNING id, titel, bericht_typ
            `, [
                'Test Rapport',
                'rapport',
                2025,
                'entwurf',
                null,
                'Test Inhalt für Schema-Validierung',
                'Schema-Fix-Script'
            ]);
            
            console.log(`✅ Test-Insert erfolgreich: ID ${testResult.rows[0].id}`);
            
            // Test-Eintrag wieder löschen
            await client.query('DELETE FROM sbv_berichte WHERE id = $1', [testResult.rows[0].id]);
            console.log('🗑️ Test-Eintrag wieder entfernt');
            
        } catch (error) {
            console.error('❌ Test-Insert fehlgeschlagen:', error.message);
            throw error;
        }

        console.log('\n🎉 SCHEMA-FIX ERFOLGREICH ABGESCHLOSSEN!');
        console.log('💡 Das Upload-System sollte jetzt vollständig funktionieren.');

    } catch (error) {
        console.error('❌ Fehler beim Schema-Fix:', error);
        throw error;
    } finally {
        await client.end();
        console.log('🔌 Datenbankverbindung geschlossen');
    }
}

// Script ausführen
if (require.main === module) {
    finalSchemaFix()
        .then(() => {
            console.log('\n✅ Final Schema Fix abgeschlossen');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Final Schema Fix fehlgeschlagen:', error);
            process.exit(1);
        });
}

module.exports = { finalSchemaFix };
