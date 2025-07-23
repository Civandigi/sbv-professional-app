# 🔍 RAPPORT-SEITEN AUDIT - 23. Juli 2025

## 🎯 AUFTRAG
**Nutzeranfrage:** Audit der Rapport-Seite bezüglich Budget-Diskrepanzen für 2024
- **Problem:** Gesamtbudget zeigt CHF 125.000 für 2024  
- **Verdacht:** Möglicherweise Dummy-Daten, echtes Budget sollte höher sein
- **Kontext:** PDF-Gesuche mit Einzelprojekten wurden hochgeladen

## 🔍 AUDIT-ERGEBNISSE

### **1. SYSTEM-ARCHITEKTUR ANALYSE**

#### ✅ Implementierte Rapport-Funktionen:
- **Vollständiges Backend:** `rapport-integration.js` mit PostgreSQL-Support
- **Frontend:** `rapport.html` mit dynamischer Anzeige
- **API-Endpoints:** GET/POST/PUT/DELETE für Rapporte
- **Datenbank-Schema:** Komplett implementiert mit Templates
- **Upload-Integration:** Automatische Rapport-Erstellung bei Gesuch-Upload

#### 📊 Identifizierte Datenstrukturen:
1. **`sbv_berichte`** - Haupt-Berichte-Tabelle
2. **`rapporte`** - Detaillierte Rapport-Verwaltung  
3. **`sbv_teilprojekte`** - Projektspezifische Budgets
4. **`rapport_massnahmen`** - Maßnahmen pro Rapport
5. **`rapport_kpis`** - KPI-Tracking

### **2. BUDGET-DISKREPANZ ANALYSE**

#### ⚠️ IDENTIFIZIERTE PROBLEME:

**Problem A: Template vs. Echte Daten**
```sql
-- Template-Budgets (niedrig):
INSERT INTO teilprojekt_templates (teilprojekt, budget_standard) VALUES
('leitmedien', 45000),      -- CHF 45.000
('digitale-medien', 35000), -- CHF 35.000  
('social-media', 25000),    -- CHF 25.000
('messen', 20000);          -- CHF 20.000
-- TOTAL: CHF 125.000 ← HIER IST DAS PROBLEM!
```

**Problem B: Echte Teilprojekt-Budgets (hoch)**
```sql
-- Aus setup_teilprojekte_complete.js:
TP1 - Leitmedien: CHF 810.000
TP2 - Digitale Medien: CHF 675.000  
TP3 - Messen & Ausstellungen: CHF 540.000
TP4 - Events & Aktionen: CHF 945.000
TP5 - Schulprojekte: CHF 675.000
TP6 - Partnerprojekte: CHF 1.070.000
-- TOTAL: CHF 4.715.000 ← DAS SOLLTE ANGEZEIGT WERDEN!
```

### **3. ROOT CAUSE ANALYSIS**

#### 🎯 Hauptursache:
Das System verwendet **Template-Standardwerte** statt der **echten Teilprojekt-Budgets**:

```javascript
// In rapport-integration.js Zeile 196-201:
const templateResult = await client.query(
    'SELECT budget_standard FROM teilprojekt_templates WHERE teilprojekt = $1',
    [teilprojekt]
);
budgetBrutto = templateResult.rows[0]?.budget_standard || 0;
```

#### 🔄 Workflow-Problem:
1. **Gesuch wird hochgeladen** → PDF mit echten Budgets
2. **Teilprojekte werden erstellt** → Mit korrekten Budgets  
3. **Rapport wird erstellt** → Aber verwendet Template-Budgets (falsch!)
4. **Dashboard zeigt** → CHF 125.000 statt CHF 4.715.000

### **4. KONKRETE BEFUNDE**

#### 📈 Budget-Verteilung Template vs. Real:

| Teilprojekt | Template-Budget | Echtes Budget | Differenz |
|-------------|----------------|---------------|-----------|
| TP1 - Leitmedien | CHF 45.000 | CHF 810.000 | +CHF 765.000 |
| TP2 - Digitale Medien | CHF 35.000 | CHF 675.000 | +CHF 640.000 |
| TP3 - Messen | CHF 25.000 | CHF 540.000 | +CHF 515.000 |
| TP4 - Events | CHF 20.000 | CHF 945.000 | +CHF 925.000 |
| TP5 - Schulprojekte | - | CHF 675.000 | +CHF 675.000 |
| TP6 - Partnerprojekte | - | CHF 1.070.000 | +CHF 1.070.000 |
| **GESAMT** | **CHF 125.000** | **CHF 4.715.000** | **+CHF 4.590.000** |

#### 💥 KRITISCHE FESTSTELLUNG:
- **Angezeigtes Budget:** CHF 125.000 (Template)
- **Tatsächliches Budget:** CHF 4.715.000 (Teilprojekte)  
- **Fehlende Summe:** CHF 4.590.000 (97% fehlen!)

### **5. BETROFFENE KOMPONENTEN**

#### 🔧 Code-Stellen die repariert werden müssen:

1. **`rapport-integration.js`** - Budget-Loading Logik
2. **`rapport.html`** - Dashboard-Anzeige  
3. **`setup_teilprojekte_*.js`** - Template-Synchronisation
4. **Database Templates** - Budget-Standards aktualisieren

#### 📊 Frontend-Auswirkungen:
- **Dashboard:** Zeigt falsche Gesamtsummen
- **Rapport-Übersicht:** Falsche Budget-Vergleiche
- **KPI-Tracking:** Inkorrekte Zielerreichung
- **Export/Berichte:** Falsche Finanzdaten

### **6. LÖSUNGSANSÄTZE**

#### 🎯 Empfohlene Reparatur-Reihenfolge:

**Phase 1: Datenbank-Korrektur**
- Template-Budgets auf echte Werte aktualisieren
- Bestehende Rapporte mit korrekten Budgets verknüpfen

**Phase 2: Code-Anpassung**  
- Budget-Loading von Templates auf Teilprojekte umstellen
- Fallback-Logik für fehlende Teilprojekte

**Phase 3: Validierung**
- Alle 2024-Rapporte neu berechnen
- Dashboard-Summen überprüfen

## 🎯 FAZIT

### ✅ **AUDIT-BESTÄTIGUNG:**
Die Nutzerbeobachtung ist **100% korrekt**:
- Das System zeigt CHF 125.000 statt CHF 4.715.000 
- Dies sind veraltete Template-Werte, nicht die echten PDF-Budgets
- 97% des Budgets wird nicht korrekt angezeigt

### 🚨 **HANDLUNGSBEDARF:**
**KRITISCH** - Sofortige Korrektur erforderlich für:
1. Korrekte Finanzberichterstattung 
2. Ordnungsgemäße Budget-Überwachung
3. Genaue KPI-Berechnung
4. Vertrauensvolle Datenqualität

### 📋 **NÄCHSTE SCHRITTE:**
1. **Dringend:** Budget-Templates korrigieren
2. **Sofort:** Rapport-Budget-Logik reparieren  
3. **Validierung:** 2024-Daten neu berechnen
4. **Testing:** Vollständiger End-to-End Test

---
**Audit durchgeführt:** 23. Juli 2025  
**Schweregrad:** KRITISCH  
**Status:** REPARATUR ERFORDERLICH  
**Betroffene Jahre:** 2024, 2025  
**Datenintegrität:** KOMPROMITTIERT
