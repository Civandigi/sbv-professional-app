# 🚀 SBV Professional App - Sofort-Deployment

## 🎯 **In 10 Minuten live!**

### **Schritt 1: Railway CLI installieren**
```powershell
npm install -g @railway/cli
```

### **Schritt 2: Railway Login**
```powershell
railway login
```
(Browser öffnet sich für Authentifizierung)

### **Schritt 3: Automatisches Deployment**
```powershell
# Im Projektverzeichnis ausführen:
.\deploy-railway.ps1
```

### **Schritt 4: App testen**
Nach dem Deployment erhalten Sie eine URL wie:
`https://sbv-professional-app-production.railway.app`

### **🔑 Login-Daten:**
- **Admin:** superadmin@digitale-rakete.ch / admin2025
- **Demo:** demo@sbv-app.ch / demo2025

---

## 🛠 **Manuelle Schritte (falls Skript nicht funktioniert)**

```powershell
# 1. Projekt initialisieren
railway init sbv-professional-app

# 2. PostgreSQL hinzufügen
railway add postgresql

# 3. Environment Variables setzen
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="sbv-railway-secret-2025"

# 4. Deploy ausführen
railway deploy

# 5. Status prüfen
railway status
```

---

## 🔧 **Nach dem Deployment**

### **URLs überprüfen:**
```powershell
railway status
```

### **Logs anzeigen:**
```powershell
railway logs --tail
```

### **Domain hinzufügen (optional):**
```powershell
railway domain add sbv-app.ihre-domain.ch
```

---

## 📱 **App-Features testen**

1. **Dashboard:** Basis-Übersicht
2. **Gesuche:** Kanban-Board (Retool)
3. **Rapport:** Budget-Übersicht (CHF 4.41M)
4. **Archiv:** File-Upload funktionalität
5. **Admin:** Benutzerverwaltung (nur Super Admin)

---

## 🆘 **Troubleshooting**

### **Database Connection Error:**
```powershell
railway variables set DATABASE_URL [postgresql-url]
railway deploy
```

### **File Upload Probleme:**
```powershell
railway volume create uploads --mount-path /app/uploads
railway deploy
```

### **App startet nicht:**
```powershell
railway logs
# Prüfen Sie die Fehlermeldungen
```

---

## ✅ **Erfolgsmeldung**

Nach erfolgreichem Deployment sehen Sie:
```
✅ Deployment completed!
🌐 Your app is available at: https://[projekt-name].railway.app
```

**🎉 Ihre SBV Professional App ist jetzt live und bereit für Tests!**
