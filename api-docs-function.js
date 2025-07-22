// SAUBERE API-DOKUMENTATIONS-FUNKTION
window.openApiDocs = function() {
    try {
        const apiWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes');
        
        if (!apiWindow) {
            alert('❌ Pop-up blockiert. Bitte Pop-ups erlauben.');
            return;
        }
        
        apiWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SBV API Dokumentation</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 30px; 
                        background: #f8f9fa; 
                    }
                    .container { 
                        max-width: 800px; 
                        margin: 0 auto; 
                        background: white; 
                        padding: 30px; 
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    h1 { 
                        color: #6BAF38; 
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .endpoint { 
                        background: #f5f5f5; 
                        padding: 15px; 
                        margin: 15px 0; 
                        border-left: 4px solid #6BAF38; 
                        border-radius: 4px;
                    }
                    .method {
                        font-weight: bold;
                        color: #007bff;
                        margin-right: 10px;
                    }
                    .info-box {
                        background: #e8f4f8;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 SBV Professional API</h1>
                    
                    <div class="info-box">
                        <p><strong>Base URL:</strong> http://localhost:3000/api</p>
                        <p><strong>Authentication:</strong> Bearer Token (JWT)</p>
                        <p><strong>Version:</strong> 1.0.0</p>
                    </div>
                    
                    <h2>📋 API Endpunkte:</h2>
                    
                    <div class="endpoint">
                        <span class="method">POST</span> /api/login
                        <br><em>Benutzeranmeldung</em>
                    </div>
                    
                    <div class="endpoint">
                        <span class="method">GET</span> /api/gesuche
                        <br><em>Gesuche abrufen</em>
                    </div>
                    
                    <div class="endpoint">
                        <span class="method">POST</span> /api/gesuche/upload
                        <br><em>PDF Upload (Super Admin)</em>
                    </div>
                    
                    <div class="endpoint">
                        <span class="method">POST</span> /api/rapport
                        <br><em>Rapport erstellen</em>
                    </div>
                    
                    <div class="endpoint">
                        <span class="method">GET</span> /api/users
                        <br><em>Benutzer abrufen</em>
                    </div>
                    
                    <div class="endpoint">
                        <span class="method">GET</span> /api/health
                        <br><em>Server Status</em>
                    </div>
                    
                    <p style="text-align: center; margin-top: 40px; color: #666;">
                        <em>SBV Professional API Dokumentation</em>
                    </p>
                </div>
            </body>
            </html>
        `);
        
        apiWindow.document.close();
        
    } catch (error) {
        alert('❌ Fehler: ' + error.message);
    }
};
