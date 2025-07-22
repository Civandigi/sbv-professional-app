/**
 * SBV Enhanced Upload System
 * - Intelligente Jahreserkennung
 * - PDF-Datenextraktion 
 * - Automatische Formular-Vorausfüllung
 */

// Erweiterte Jahr-Management-Funktionen
class SBVYearManager {
    constructor() {
        this.currentYear = new Date().getFullYear();
        this.yearRange = this.generateYearRange();
    }

    generateYearRange() {
        const startYear = 2020;
        const endYear = this.currentYear + 5; // 5 Jahre in die Zukunft
        const years = [];
        
        for (let year = endYear; year >= startYear; year--) {
            years.push(year);
        }
        return years;
    }

    // Erweitere alle Jahr-Dropdowns im System
    enhanceYearDropdowns() {
        const yearSelectors = [
            'uploadYear',
            'working-year', 
            'jahrFilter',
            'yearFilter',
            'reportYear'
        ];

        yearSelectors.forEach(selectorId => {
            const select = document.getElementById(selectorId);
            if (select) {
                this.populateYearDropdown(select);
            }
        });
    }

    populateYearDropdown(selectElement, selectedYear = null) {
        // Behalte den ersten Option-Wert bei (z.B. "Alle Jahre")
        const firstOption = selectElement.querySelector('option[value=""]');
        selectElement.innerHTML = '';
        
        if (firstOption) {
            selectElement.appendChild(firstOption);
        }

        this.yearRange.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            
            // Setze Default-Auswahl
            if (selectedYear && year == selectedYear) {
                option.selected = true;
            } else if (!selectedYear && year === this.currentYear) {
                option.selected = true;
            }
            
            selectElement.appendChild(option);
        });
    }

    // Intelligente Jahr-Extraktion aus PDF-Namen
    extractYearFromFilename(filename) {
        const yearPattern = /20(\d{2})/g;
        const matches = filename.match(yearPattern);
        
        if (matches) {
            // Nehme das erste gefundene Jahr
            const detectedYear = parseInt(matches[0]);
            console.log('📅 Jahr aus Dateiname extrahiert:', detectedYear, 'aus', filename);
            return detectedYear;
        }
        return this.currentYear;
    }
}

// PDF Data Extraction System
class SBVPDFExtractor {
    constructor() {
        this.extractedData = {};
    }

    // Simuliere PDF-Datenextraktion (später mit echter AI-Integration)
    async extractDataFromPDF(file) {
        console.log('🔍 Extrahiere Daten aus PDF:', file.name);
        
        // Intelligente Datenextraktion basierend auf Dateiname
        const extractedData = {
            jahr: null,
            titel: null,
            beschreibung: null,
            antragsteller: null,
            typ: 'partner'
        };

        // Jahr aus Dateiname extrahieren
        const yearManager = new SBVYearManager();
        extractedData.jahr = yearManager.extractYearFromFilename(file.name);

        // Titel aus Dateiname ableiten
        extractedData.titel = file.name
            .replace('.pdf', '')
            .replace(/[-_]/g, ' ')
            .replace(/\d{4}/g, '') // Jahre entfernen
            .replace(/\s+/g, ' ')
            .trim();

        // Typ basierend auf Dateiname bestimmen
        const filename = file.name.toLowerCase();
        if (filename.includes('gesuch')) {
            extractedData.typ = 'partner';
        } else if (filename.includes('rapport') || filename.includes('bericht')) {
            extractedData.typ = 'rapport';
        }

        // Auto-Beschreibung generieren
        extractedData.beschreibung = `Hochgeladen am ${new Date().toLocaleDateString('de-DE')} - ${extractedData.titel}`;

        console.log('✅ Extrahierte Daten:', extractedData);
        this.extractedData = extractedData;
        return extractedData;
    }

    // Formular mit extrahierten Daten vorausfüllen
    populateForm(data) {
        const mapping = {
            'uploadYear': data.jahr,
            'uploadDescription': data.beschreibung,
            'gesuchTitel': data.titel
        };

        Object.entries(mapping).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field && value) {
                field.value = value;
                console.log('📝 Feld gefüllt:', fieldId, '=', value);
            }
        });
    }
}

// Enhanced Upload Handler
class SBVUploadEnhancer {
    constructor() {
        this.yearManager = new SBVYearManager();
        this.pdfExtractor = new SBVPDFExtractor();
        this.init();
    }

    init() {
        // Erweitere Jahr-Dropdowns bei Seiten-Load
        this.yearManager.enhanceYearDropdowns();
        
        // Füge File-Change-Handler hinzu
        this.attachFileChangeHandlers();
        
        console.log('🚀 SBV Upload Enhancer initialisiert');
    }

    attachFileChangeHandlers() {
        const fileInputs = ['gesuchFile', 'uploadFile'];
        
        fileInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('change', (e) => this.handleFileChange(e));
            }
        });
    }

    async handleFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        console.log('📎 Datei ausgewählt:', file.name, 'Größe:', file.size);

        // Extrahiere Daten aus PDF
        try {
            const extractedData = await this.pdfExtractor.extractDataFromPDF(file);
            
            // Aktualisiere Jahr-Dropdown mit erkanntem Jahr
            const yearSelect = document.getElementById('uploadYear');
            if (yearSelect && extractedData.jahr) {
                yearSelect.value = extractedData.jahr;
            }

            // Fülle Formular vor
            this.pdfExtractor.populateForm(extractedData);

            // Zeige Extraktion-Preview
            this.showExtractionPreview(extractedData);

        } catch (error) {
            console.error('❌ Fehler bei Datenextraktion:', error);
        }
    }

    showExtractionPreview(data) {
        // Erstelle Preview-Modal oder Info-Box
        const preview = document.createElement('div');
        preview.className = 'extraction-preview bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4';
        preview.innerHTML = `
            <h5 class="font-semibold text-blue-800 mb-2">🤖 Automatisch erkannte Daten:</h5>
            <ul class="text-sm text-blue-700 space-y-1">
                <li><strong>Jahr:</strong> ${data.jahr}</li>
                <li><strong>Titel:</strong> ${data.titel}</li>
                <li><strong>Typ:</strong> ${data.typ}</li>
                <li><strong>Beschreibung:</strong> ${data.beschreibung}</li>
            </ul>
            <p class="text-xs text-blue-600 mt-2">Bitte überprüfen und bei Bedarf anpassen.</p>
        `;

        // Füge Preview unter Datei-Input hinzu
        const fileInput = document.getElementById('gesuchFile');
        if (fileInput) {
            const existingPreview = fileInput.parentNode.querySelector('.extraction-preview');
            if (existingPreview) {
                existingPreview.remove();
            }
            fileInput.parentNode.appendChild(preview);
        }
    }
}

// Jahr-Fix für bestehende Uploads
class SBVYearFixer {
    static async fixYearMismatch() {
        try {
            const response = await fetch('/api/debug/fix-years', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('sbv_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            if (result.success) {
                console.log('✅ Jahr-Mismatches behoben:', result.fixedCount);
                alert(`${result.fixedCount} Jahr-Mismatches wurden behoben!`);
            }
        } catch (error) {
            console.error('❌ Fehler beim Jahr-Fix:', error);
        }
    }
}

// Auto-Init bei DOM-Ready
document.addEventListener('DOMContentLoaded', () => {
    // Kleine Verzögerung um sicherzustellen, dass alle Elemente geladen sind
    setTimeout(() => {
        window.sbvUploadEnhancer = new SBVUploadEnhancer();
    }, 500);
});

// Export für globale Nutzung
window.SBVYearManager = SBVYearManager;
window.SBVPDFExtractor = SBVPDFExtractor;
window.SBVUploadEnhancer = SBVUploadEnhancer;
window.SBVYearFixer = SBVYearFixer;
