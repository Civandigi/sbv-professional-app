# PowerShell Script zur Ausfuehrung des Rapport-Schemas in PostgreSQL

Write-Host "Ausfuehrung des Rapport-Schema in PostgreSQL..." -ForegroundColor Cyan

# Datenbankverbindungsparameter (aus server.js)
$env:PGHOST = "postgresql-sbv-gesuche-team.d.elest.io"
$env:PGPORT = "5432"
$env:PGDATABASE = "sbv_gesuche_db"
$env:PGUSER = "root"
$env:PGPASSWORD = "H8vF2pT9qN3xK7mR4nL6sA1dG5jQ8wE2"

# Pfad zum Schema-File
$schemaFile = "c:\Users\Ivan\Desktop\retool\sbv-professional-app\docs\database\rapport-schema-postgresql.sql"

Write-Host "Schema-File: $schemaFile" -ForegroundColor Yellow

if (-not (Test-Path $schemaFile)) {
    Write-Error "Schema-File nicht gefunden: $schemaFile"
    exit 1
}

Write-Host "Verbindung zur Datenbank..." -ForegroundColor Yellow
Write-Host "Host: $env:PGHOST" -ForegroundColor Gray
Write-Host "Database: $env:PGDATABASE" -ForegroundColor Gray

try {
    # Ausfuehrung des Schemas mit psql
    Write-Host "Fuehre Rapport-Schema aus..." -ForegroundColor Green
    
    # Direkter SQL-Befehl mit Credentials
    $connectionString = "host=$env:PGHOST port=$env:PGPORT dbname=$env:PGDATABASE user=$env:PGUSER password=$env:PGPASSWORD"
    
    # Teste erst die Verbindung
    $testQuery = "SELECT version();"
    $testResult = psql -c $testQuery "postgresql://$env:PGUSER:$env:PGPASSWORD@$env:PGHOST:$env:PGPORT/$env:PGDATABASE" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Verbindung erfolgreich!" -ForegroundColor Green
        
        # Fuehre Schema aus
        $output = psql -f $schemaFile "postgresql://$env:PGUSER:$env:PGPASSWORD@$env:PGHOST:$env:PGPORT/$env:PGDATABASE" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Rapport-Schema erfolgreich ausgefuehrt!" -ForegroundColor Green
            Write-Host "Tabellen erstellt:" -ForegroundColor Cyan
            Write-Host "- rapporte (Haupt-Rapporte)" -ForegroundColor White
            Write-Host "- rapport_massnahmen (Massnahmen)" -ForegroundColor White  
            Write-Host "- rapport_kpis (Key Performance Indicators)" -ForegroundColor White
            Write-Host "- rapport_anhaenge (Datei-Anhaenge)" -ForegroundColor White
            Write-Host "- rapport_templates (Vorlagen)" -ForegroundColor White
            Write-Host "- rapport_audit_log (Aenderungsprotokoll)" -ForegroundColor White
            Write-Host ""
            Write-Host "Demo-Daten eingefuegt fuer 2024" -ForegroundColor Green
        } else {
            Write-Error "Fehler beim Ausfuehren des Schemas:"
            Write-Error $output
            exit 1
        }
    } else {
        Write-Error "Fehler bei der Datenbankverbindung:"
        Write-Error $testResult
        exit 1
    }
    
} catch {
    Write-Error "Fehler bei der Datenbankverbindung: $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-Host "Rapport-System Backend Integration abgeschlossen!" -ForegroundColor Green
Write-Host "Naechste Schritte:" -ForegroundColor Cyan
Write-Host "1. Server testen: node src/backend/server.js" -ForegroundColor White
Write-Host "2. API testen: http://localhost:3000/api/rapporte" -ForegroundColor White
Write-Host "3. Frontend testen: Rapport-Seite oeffnen" -ForegroundColor White
