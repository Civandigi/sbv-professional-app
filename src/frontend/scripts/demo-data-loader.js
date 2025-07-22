// Demo-Daten über lokales Backend laden
async function loadDemoData() {
    const baseUrl = 'http://localhost:3000';
    const token = sessionStorage.getItem('sbv_token');

    if (!token) {
        console.log('❌ Kein Token gefunden - bitte einloggen');
        return;
    }

    try {
        console.log('🚀 Lade Demo-Daten über Backend...');

        // Demo-Gesuche erstellen
        const demoGesuche = [
            {
                titel: 'TPA Modernisierung 2024',
                jahr: 2024,
                beschreibung: 'IT-Modernisierung für Teilprojekt A',
                fileName: 'TPA_Gesuch_2024.pdf'
            },
            {
                titel: 'TPB Digitalisierung 2024', 
                jahr: 2024,
                beschreibung: 'Digitalisierung für Teilprojekt B',
                fileName: 'TPB_Antrag_2024.pdf'
            },
            {
                titel: 'TPC Nachhaltigkeit 2025',
                jahr: 2025,
                beschreibung: 'Nachhaltigkeitsprojekt für Teilprojekt C',
                fileName: 'TPC_Gesuch_2025.pdf'
            },
            {
                titel: 'TPD Weiterbildung 2023',
                jahr: 2023,
                beschreibung: 'Personalentwicklung für Teilprojekt D',
                fileName: 'TPD_Gesuch_2023.pdf'
            },
            {
                titel: 'TPE Qualität 2024',
                jahr: 2024,
                beschreibung: 'Qualitätssicherung für Teilprojekt E',
                fileName: 'TPE_Antrag_2024.pdf'
            }
        ];

        // Gesuche erstellen (wenn noch nicht vorhanden)
        for (const gesuch of demoGesuche) {
            try {
                // Prüfe ob Gesuch bereits existiert
                const checkResponse = await fetch(`${baseUrl}/api/gesuche?titel=${encodeURIComponent(gesuch.titel)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (checkResponse.ok) {
                    const existingData = await checkResponse.json();
                    if (existingData.data && existingData.data.length > 0) {
                        console.log(`⏭️ Gesuch "${gesuch.titel}" existiert bereits`);
                        continue;
                    }
                }

                // Erstelle Demo-PDF-File (simuliert)
                const formData = new FormData();
                const demoFile = new Blob(['%PDF-1.4 Demo File Content'], { type: 'application/pdf' });
                formData.append('gesuch', demoFile, gesuch.fileName);
                formData.append('jahr', gesuch.jahr);
                formData.append('beschreibung', gesuch.beschreibung);

                console.log(`📄 Erstelle Gesuch: ${gesuch.titel}`);
                
            } catch (error) {
                console.warn(`⚠️ Fehler beim Erstellen von "${gesuch.titel}":`, error.message);
            }
        }

        console.log('✅ Demo-Daten Initialisierung abgeschlossen');
        
        // Lade Archiv neu
        if (typeof loadAvailableYears === 'function') {
            loadAvailableYears();
        }

    } catch (error) {
        console.error('❌ Fehler beim Laden der Demo-Daten:', error);
    }
}

// Sofort ausführen wenn Seite geladen
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(loadDemoData, 2000);
    });
} else {
    setTimeout(loadDemoData, 1000);
}
