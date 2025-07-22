// SBV Navigation System - Professional Admin Interface
// Ersetzt alle Emojis durch professionelle SVG-Icons

// Store original dashboard content
let originalDashboardContent = '';

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation);
} else {
    initializeNavigation();
}

// Main navigation initializer
function initializeNavigation() {
    console.log('🚀 Initializing SBV Navigation System...');
    
    // Store original dashboard content on first load
    const pageContent = document.getElementById('page-content');
    if (pageContent && !originalDashboardContent) {
        originalDashboardContent = pageContent.innerHTML;
    }
    
    // Navigate to page function (global for onclick handlers)
    window.navigateTo = function(page) {
        console.log(`📱 Navigating to: ${page}`);
        
        // Update active navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('data-page') || link.getAttribute('href')?.substring(1);
            if (linkPage === page) {
                link.classList.remove('nav-link-inactive');
                link.classList.add('nav-link-active');
            } else {
                link.classList.remove('nav-link-active');
                link.classList.add('nav-link-inactive');
            }
        });
        
        // Load page content
        loadPageContent(page);
        
        // Update URL
        window.history.pushState({page: page}, '', `#${page}`);
    };
    
    // Setup navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    console.log(`📋 Found ${navLinks.length} navigation links`);
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Navigation link clicked:', this);
            
            // Update active states
            navLinks.forEach(l => {
                l.classList.remove('nav-link-active');
                l.classList.add('nav-link-inactive');
            });
            
            this.classList.remove('nav-link-inactive');
            this.classList.add('nav-link-active');
            
            // Get target page
            const page = this.getAttribute('data-page') || this.getAttribute('href')?.substring(1) || 'dashboard';
            console.log(`Loading page: ${page}`);
            
            // Load page content
            loadPageContent(page);
            
            // Update URL
            window.history.pushState({page: page}, '', `#${page}`);
        });
    });
    
    // Load initial page from URL hash or default to dashboard
    const initialPage = window.location.hash.substring(1) || 'dashboard';
    console.log(`Loading initial page: ${initialPage}`);
    loadPageContent(initialPage);
    updateActiveNav(initialPage);
}

// Content loader function
function loadPageContent(page) {
    const pageContent = document.getElementById('page-content');
    if (!pageContent) {
        console.error('❌ Cannot load page content - element not found');
        return;
    }
    
    console.log(`📄 Loading page: ${page}`);
    
    // For dashboard, restore original content
    if (page === 'dashboard') {
        pageContent.innerHTML = originalDashboardContent;
    } else {
        // For other pages, load iframe content
        const content = getPageContent(page);
        pageContent.innerHTML = content;
    }
    
    // Update page title
    document.title = `SBV Gesuch-Tool - ${getPageTitle(page)}`;
    
    // Initialize page-specific functionality
    initializePageFeatures(page);
    
    console.log(`✅ Page ${page} loaded successfully`);
}

// Update active navigation
function updateActiveNav(page) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page') || link.getAttribute('href')?.substring(1);
        if (linkPage === page) {
            link.classList.remove('nav-link-inactive');
            link.classList.add('nav-link-active');
        } else {
            link.classList.remove('nav-link-active');
            link.classList.add('nav-link-inactive');
        }
    });
}

// Handle browser back/forward
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page) {
        loadPageContent(event.state.page);
        updateActiveNav(event.state.page);
    }
});

// Page content generator
function getPageContent(page) {
    const contents = {
        'dashboard': '', // Dashboard content is already in dashboard.html
        'gesuche': '<iframe src="pages/gesuche.html" style="width: 100%; height: 100vh; border: none; opacity: 0; transition: opacity 0.3s;" onload="this.style.opacity=1" title="SBV Gesuche - Kanban Board"></iframe>',
        'rapport': '<iframe src="pages/rapport.html" style="width: 100%; height: 100vh; border: none; opacity: 0; transition: opacity 0.3s;" onload="this.style.opacity=1" title="SBV Rapport - Verwaltung"></iframe>',
        'archiv': getArchivContent(),
        'berichte': '<iframe src="pages/berichte.html" style="width: 100%; height: calc(100vh - 200px); border: none; border-radius: 12px; opacity: 0; transition: opacity 0.3s;" onload="this.style.opacity=1" title="SBV Berichte - Retool Integration"></iframe>',
        'dokumente': '<iframe src="pages/dokumente.html" style="width: 100%; height: calc(100vh - 200px); border: none; border-radius: 12px; opacity: 0; transition: opacity 0.3s;" onload="this.style.opacity=1" title="SBV Dokumente - Retool Integration"></iframe>',
        'benutzerverwaltung': getBenutzerverwaltungContent(),
        'systemlogs': getSystemLogsContent(),
        'einstellungen': getSmartEinstellungenContent()
    };
    
    return contents[page] || '<div class="text-center py-12"><p class="text-gray-500">Seite nicht gefunden</p></div>';
}

function getDashboardContent() {
    // Return empty string - Dashboard content is already in dashboard.html
    return '';
}

// Smart Einstellungen - lädt die richtige Seite basierend auf Benutzerrolle
function getSmartEinstellungenContent() {
    // Prüfe Benutzerrolle aus Session Storage
    const storedUser = sessionStorage.getItem('sbv_benutzer');
    let userRole = 'user';
    
    if (storedUser) {
        try {
            const userInfo = JSON.parse(storedUser);
            userRole = userInfo.rolle || userInfo.role || 'user';
        } catch (e) {
            console.error('Fehler beim Parsen der Benutzerinformationen:', e);
        }
    }
    
    console.log('Smart Navigation: Benutzerrolle erkannt:', userRole);
    
    // Für Super-Admins und Admins: Lade die vollständige Admin-Zentrale
    if (userRole === 'super_admin' || userRole === 'admin') {
        console.log('Lade Admin-Zentrale für:', userRole);
        return '<iframe src="pages/admin-einstellungen.html" style="width: 100%; height: 100vh; border: none; opacity: 0; transition: opacity 0.3s;" onload="this.style.opacity=1" title="SBV Admin-Zentrale"></iframe>';
    }
    
    // Für normale Benutzer: Lade die Standard-Einstellungsseite
    console.log('Lade Standard-Einstellungen für:', userRole);
    return '<iframe src="pages/einstellungen.html" style="width: 100%; height: 100vh; border: none; opacity: 0; transition: opacity 0.3s;" onload="this.style.opacity=1" title="SBV Einstellungen"></iframe>';
}

function getEinstellungenContent() {
    return `
        <div class="bg-[var(--color-card-background)] rounded-2xl shadow-sm p-6">
            <h2 class="text-xl font-bold text-[var(--color-text-primary)] mb-6">
                <svg class="inline w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                </svg>
                Einstellungen
            </h2>
            <p class="text-[var(--color-text-secondary)] mb-6">Passen Sie Ihre Systemeinstellungen an.</p>
            
            <div class="space-y-6">
                <div class="p-4 bg-gray-50 rounded-lg">
                    <h3 class="font-medium text-gray-900 mb-2">
                        <svg class="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H6.9C4.29 7 2.4 8.79 2.4 11.5S4.29 16 6.9 16h4v-1.9H6.9c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9.1-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V16h4c2.61 0 4.5-1.79 4.5-4.5S19.71 7 17.1 7z"/>
                        </svg>
                        Retool Integration
                    </h3>
                    <p class="text-gray-600 text-sm mb-3">Status der Retool-Komponenten</p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Gesuche.rsx - Aktiv</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Rapport.rsx - Aktiv</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>HTML Editor - Verfügbar</span>
                        </div>
                    </div>
                </div>
                
                <div class="p-4 bg-gray-50 rounded-lg">
                    <h3 class="font-medium text-gray-900 mb-2">
                        <svg class="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20,18C20,21.63 16.79,22.87 12,22.87C7.21,22.87 4,21.63 4,18V6C4,2.37 7.21,1.13 12,1.13C16.79,1.13 20,2.37 20,6V18Z"/>
                        </svg>
                        Datenbankverbindung
                    </h3>
                    <p class="text-gray-600 text-sm mb-3">PostgreSQL-Verbindungsstatus</p>
                    <div class="flex items-center gap-2 text-sm">
                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>postgresql-sbv-fg-app-u38422.vm.elestio.app:25432 - Verbunden</span>
                    </div>
                </div>
                
                <div class="p-4 bg-gray-50 rounded-lg">
                    <h3 class="font-medium text-gray-900 mb-2">
                        <svg class="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21A7,7 0 0,1 14,26H10A7,7 0 0,1 3,19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
                        </svg>
                        Design-System
                    </h3>
                    <p class="text-gray-600 text-sm mb-3">Swiss Corporate Design Konfiguration</p>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <label class="block text-gray-700">Schriftart:</label>
                            <select class="mt-1 block w-full border-gray-300 rounded-md">
                                <option selected>Plus Jakarta Sans</option>
                                <option>Inter</option>
                                <option>System Font</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-700">Theme:</label>
                            <select class="mt-1 block w-full border-gray-300 rounded-md">
                                <option selected>Swiss Corporate</option>
                                <option>Modern</option>
                                <option>Minimal</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Super Admin: Benutzerverwaltung Content
function getBenutzerverwaltungContent() {
    return `
        <div class="bg-[var(--color-card-background)] rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 style="font-size: 1.875rem; font-weight: 700; color: #111827; margin-bottom: 2rem;">
                    <svg class="inline w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        <circle cx="18" cy="8" r="2"/>
                        <path d="M18 12.5c-1.16 0-2.16.41-3 1.15.85.73 1.84 1.35 3 1.35s2.15-.62 3-1.35c-.84-.74-1.84-1.15-3-1.15z"/>
                    </svg>
                    Benutzerverwaltung
                </h2>
                <button class="bg-[var(--color-light-blue)] text-[var(--color-black)] px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors">
                    + Neuer Benutzer
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border-l-4 border-[var(--color-light-blue)]">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-[var(--color-light-blue)] rounded-full flex items-center justify-center">
                                <svg class="w-6 h-6 text-[var(--color-black)]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M5,3C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19H5V5H12V3H5M17.78,4C17.61,4 17.43,4.07 17.3,4.2L16.08,5.41L18.58,7.91L19.8,6.7C20.06,6.44 20.06,6 19.8,5.75L18.25,4.2C18.12,4.07 17.95,4 17.78,4M15.37,6.12L8,13.5V16H10.5L17.87,8.62L15.37,6.12Z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-gray-900">Super Admin - Digitale Rakete</h3>
                                <p class="text-sm text-gray-600">superadmin@digitale-rakete.ch</p>
                                <span class="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                                    Super Administrator
                                </span>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-500">Letzter Login: Heute</p>
                            <p class="text-xs text-green-600">Aktiv</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-4 rounded-lg border">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-gray-900">Demo User</h3>
                                <p class="text-sm text-gray-600">demo@sbv-app.ch</p>
                                <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                                    Bearbeiter
                                </span>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button class="text-blue-600 hover:text-blue-800">Bearbeiten</button>
                            <button class="text-red-600 hover:text-red-800">Deaktivieren</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-blue-900 mb-2">Gesamte Benutzer</h3>
                    <p class="text-2xl font-bold text-blue-600">2</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-green-900 mb-2">Aktive Benutzer</h3>
                    <p class="text-2xl font-bold text-green-600">2</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-purple-900 mb-2">Administratoren</h3>
                    <p class="text-2xl font-bold text-purple-600">1</p>
                </div>
            </div>
        </div>
    `;
}

// Super Admin: System Logs Content
function getSystemLogsContent() {
    return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div class="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h2 style="font-size: 1.875rem; font-weight: 700; color: #111827; margin-bottom: 2rem;">System-Logs</h2>
                    <p class="text-gray-600">Systemaktivitäten und Datenbankverbindungen - Super Admin Zugriff</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-right">
                        <div class="text-sm text-gray-500">Datenbankstatus</div>
                        <div class="text-sm font-semibold text-green-600">● Verbunden</div>
                    </div>
                    <button class="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                        Aktualisieren
                    </button>
                </div>
            </div>
            
            <!-- Database Connection Status -->
            <div class="p-6 border-b border-gray-200 bg-gray-50">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Datenbankverbindung</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span class="text-gray-600">Host:</span>
                        <span class="font-mono text-gray-900 ml-2">postgresql-sbv-fg-app-u38422.vm.elestio.app</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Port:</span>
                        <span class="font-mono text-gray-900 ml-2">25432</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Status:</span>
                        <span class="text-green-600 font-semibold ml-2">Aktiv</span>
                    </div>
                </div>
            </div>
            
            <!-- System Logs Table -->
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="py-3 px-6 font-semibold text-gray-600 uppercase tracking-wider text-xs">Zeit</th>
                            <th class="py-3 px-6 font-semibold text-gray-600 uppercase tracking-wider text-xs">Level</th>
                            <th class="py-3 px-6 font-semibold text-gray-600 uppercase tracking-wider text-xs">Benutzer</th>
                            <th class="py-3 px-6 font-semibold text-gray-600 uppercase tracking-wider text-xs">Aktion</th>
                            <th class="py-3 px-6 font-semibold text-gray-600 uppercase tracking-wider text-xs">Details</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr class="hover:bg-gray-50">
                            <td class="py-3 px-6 font-mono text-xs text-gray-500">2025-07-22 07:40:23</td>
                            <td class="py-3 px-6"><span class="text-blue-600 font-semibold">INFO</span></td>
                            <td class="py-3 px-6 text-gray-900">System</td>
                            <td class="py-3 px-6 text-gray-900">Server gestartet</td>
                            <td class="py-3 px-6 font-mono text-xs text-gray-500">Port 3000</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="py-3 px-6 font-mono text-xs text-gray-500">2025-07-22 07:40:23</td>
                            <td class="py-3 px-6"><span class="text-green-600 font-semibold">SUCCESS</span></td>
                            <td class="py-3 px-6 text-gray-900">Database</td>
                            <td class="py-3 px-6 text-gray-900">PostgreSQL verbunden</td>
                            <td class="py-3 px-6 font-mono text-xs text-gray-500">postgresql-sbv-fg-app-u38422.vm.elestio.app:25432</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="py-3 px-6 font-mono text-xs text-gray-500">2025-07-22 07:35:14</td>
                            <td class="py-3 px-6"><span class="text-blue-600 font-semibold">INFO</span></td>
                            <td class="py-3 px-6 text-gray-900">superadmin@digitale-rakete.ch</td>
                            <td class="py-3 px-6 text-gray-900">Login erfolgreich</td>
                            <td class="py-3 px-6 font-mono text-xs text-gray-500">IP: 127.0.0.1</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="py-3 px-6 font-mono text-xs text-gray-500">2025-07-22 07:30:42</td>
                            <td class="py-3 px-6"><span class="text-blue-600 font-semibold">INFO</span></td>
                            <td class="py-3 px-6 text-gray-900">superadmin@digitale-rakete.ch</td>
                            <td class="py-3 px-6 text-gray-900">Einstellungen aktualisiert</td>
                            <td class="py-3 px-6 font-mono text-xs text-gray-500">Session Timeout geändert</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="py-3 px-6 font-mono text-xs text-gray-500">2025-07-22 07:25:18</td>
                            <td class="py-3 px-6"><span class="text-amber-600 font-semibold">WARNING</span></td>
                            <td class="py-3 px-6 text-gray-900">user@sbv.ch</td>
                            <td class="py-3 px-6 text-gray-900">Login-Versuch fehlgeschlagen</td>
                            <td class="py-3 px-6 font-mono text-xs text-gray-500">Falsches Passwort</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="py-3 px-6 font-mono text-xs text-gray-500">2025-07-22 06:00:00</td>
                            <td class="py-3 px-6"><span class="text-green-600 font-semibold">SUCCESS</span></td>
                            <td class="py-3 px-6 text-gray-900">System</td>
                            <td class="py-3 px-6 text-gray-900">Backup erstellt</td>
                            <td class="py-3 px-6 font-mono text-xs text-gray-500">Automatisches Backup</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Statistics Summary -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-green-600">147</p>
                <p class="text-sm text-gray-700">Erfolgreiche Logins</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-red-600">2</p>
                <p class="text-sm text-gray-700">Fehlgeschlagene Logins</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-blue-600">1,234</p>
                <p class="text-sm text-gray-700">API-Aufrufe heute</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-amber-600">0</p>
                <p class="text-sm text-gray-700">System-Warnungen</p>
            </div>
        </div>
    `;
}

// Get page titles
function getPageTitle(page) {
    const titles = {
        'dashboard': 'Dashboard',
        'gesuche': 'Gesuche verwalten',
        'rapport': 'Rapport',
        'archiv': 'Archiv',
        'berichte': 'Berichte & Analysen',
        'dokumente': 'Dokumente verwalten',
        'benutzerverwaltung': 'Benutzerverwaltung',
        'systemlogs': 'System-Logs',
        'einstellungen': 'Einstellungen'
    };
    return titles[page] || 'Unbekannte Seite';
}

// Initialize page-specific features
function initializePageFeatures(page) {
    console.log(`Initializing features for page: ${page}`);
    
    switch(page) {
        case 'dashboard':
            // Dashboard-specific initialization
            break;
        case 'gesuche':
            console.log('Initializing Gesuche page with Retool integration');
            break;
        case 'berichte':
            console.log('Initializing Berichte page with AI features');
            break;
        case 'dokumente':
            console.log('Initializing Dokumente page');
            break;
        case 'benutzerverwaltung':
            console.log('Initializing Benutzerverwaltung page - Super Admin only');
            break;
        case 'archiv':
            console.log('Initializing Archiv page with upload functionality');
            // Load archive data after page is rendered
            setTimeout(loadArchivData, 100);
            break;
        case 'systemlogs':
            console.log('Initializing System Logs page - Super Admin only');
            break;
        case 'einstellungen':
            console.log('Initializing Einstellungen page');
            break;
        default:
            console.log('Unknown page:', page);
    }
}

// Archiv Content with Upload Functionality
function getArchivContent() {
    return `
        <div class="container mx-auto px-6 py-8">
            <div class="flex justify-between items-center mb-8">
                <h1 style="font-size: 1.875rem; font-weight: 700; color: #111827; margin-bottom: 2rem;">Archiv</h1>
                <button onclick="showUploadModal()" class="bg-[var(--color-green)] hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                    Gesuch hochladen
                </button>
            </div>

            <!-- Statistiken -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Gesamtarchiv</p>
                            <p class="text-2xl font-bold text-gray-900" id="stats-total">2,341</p>
                        </div>
                        <div class="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Dieses Jahr</p>
                            <p class="text-2xl font-bold text-gray-900" id="stats-year">487</p>
                        </div>
                        <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Genehmigt</p>
                            <p class="text-2xl font-bold text-gray-900" id="stats-approved">89%</p>
                        </div>
                        <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Speicherplatz</p>
                            <p class="text-2xl font-bold text-gray-900" id="stats-storage">3.2 GB</p>
                        </div>
                        <div class="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Such- und Filterbereich -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="col-span-2">
                        <input type="text" id="searchInput" placeholder="Suche nach Gesuch, Antragsteller, Projekt..." 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent">
                    </div>
                    <select id="filterYear" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent">
                        <option>Alle Jahre</option>
                        <option>2025</option>
                        <option>2024</option>
                        <option>2023</option>
                        <option>2022</option>
                    </select>
                    <select id="filterStatus" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent">
                        <option>Alle Status</option>
                        <option>Genehmigt</option>
                        <option>Abgelehnt</option>
                        <option>In Bearbeitung</option>
                    </select>
                </div>
            </div>

            <!-- Archiv-Tabelle -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gesuch-Nr.</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titel</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Antragsteller</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="archivTable" class="bg-white divide-y divide-gray-200">
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#2025-001</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Erneuerung Melkstand Hof Müller</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Hans Müller</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">15.01.2025</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Genehmigt
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button class="text-blue-600 hover:text-blue-900 mr-3">Ansehen</button>
                                    <button class="text-gray-600 hover:text-gray-900">Download</button>
                                </td>
                            </tr>
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#2025-002</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Solarpanels Scheune</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Anna Schmidt</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">18.01.2025</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        In Bearbeitung
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button class="text-blue-600 hover:text-blue-900 mr-3">Ansehen</button>
                                    <button class="text-gray-600 hover:text-gray-900">Download</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Upload Modal -->
        <div id="uploadModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Gesuch hochladen</h3>
                    
                    <form id="uploadForm" onsubmit="handleGesuchUpload(event)">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">PDF-Datei</label>
                            <input type="file" id="pdfFile" name="pdfFile" accept=".pdf" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]">
                            <p class="text-xs text-gray-500 mt-1">Nur PDF-Dateien bis 10MB</p>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Jahr</label>
                            <select id="jahr" name="jahr" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]">
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                            </select>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
                            <textarea id="beschreibung" name="beschreibung" rows="3"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]"
                                      placeholder="Kurze Beschreibung des Gesuchs..."></textarea>
                        </div>
                        
                        <div class="flex justify-end gap-3">
                            <button type="button" onclick="closeUploadModal()"
                                    class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                                Abbrechen
                            </button>
                            <button type="submit"
                                    class="px-4 py-2 bg-[var(--color-green)] text-white rounded-md hover:bg-green-700">
                                Hochladen
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Upload-Funktionen
function showUploadModal() {
    document.getElementById('uploadModal').classList.remove('hidden');
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.add('hidden');
    document.getElementById('uploadForm').reset();
}

async function handleGesuchUpload(event) {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Wird hochgeladen...';
    
    try {
        const fileInput = document.getElementById('pdfFile');
        const file = fileInput.files[0];
        const jahr = document.getElementById('jahr').value;
        const beschreibung = document.getElementById('beschreibung').value;
        
        if (!file || file.type !== 'application/pdf') {
            alert('Bitte wählen Sie eine PDF-Datei aus.');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('Die Datei ist zu groß. Maximale Größe: 10MB');
            return;
        }
        
        const formData = new FormData();
        formData.append('gesuch', file);
        formData.append('jahr', jahr);
        formData.append('beschreibung', beschreibung);
        
        const token = sessionStorage.getItem('sbv_token');
        if (!token) {
            alert('Sie sind nicht angemeldet. Bitte melden Sie sich erneut an.');
            window.location.href = '/login.html';
            return;
        }
        
        const response = await fetch('/api/gesuche/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert(`✅ Gesuch erfolgreich hochgeladen!\n\n📄 Gesuch-ID: ${result.data.gesuch.id}\n📊 Rapport automatisch erstellt: ${result.data.rapport.id}\n📁 Datei: ${result.data.fileName}`);
            closeUploadModal();
            loadArchivData(); // Refresh data
        } else {
            alert(`❌ Fehler beim Hochladen: ${result.message}`);
        }
    } catch (error) {
        console.error('Upload-Fehler:', error);
        alert('❌ Fehler beim Hochladen der Datei: ' + error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Load archive data from API
async function loadArchivData() {
    try {
        const token = sessionStorage.getItem('sbv_token');
        const response = await fetch('/api/gesuche', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            updateArchivTable(result.data);
            updateArchivStats(result.data);
        }
    } catch (error) {
        console.error('Fehler beim Laden der Archiv-Daten:', error);
    }
}

// Update archive table with real data
function updateArchivTable(gesuche) {
    const tableBody = document.getElementById('archivTable');
    if (!tableBody || !gesuche) return;
    
    tableBody.innerHTML = gesuche.map(gesuch => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${gesuch.jahr}-${gesuch.id.toString().padStart(3, '0')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${gesuch.titel}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${gesuch.antragsteller || 'Unbekannt'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${new Date(gesuch.eingereicht_am).toLocaleDateString('de-CH')}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(gesuch.status)}">
                    ${getStatusText(gesuch.status)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewGesuch(${gesuch.id})" class="text-blue-600 hover:text-blue-900 mr-3">Ansehen</button>
                ${gesuch.uploaded_file ? `<button onclick="downloadGesuch(${gesuch.id})" class="text-gray-600 hover:text-gray-900">Download</button>` : ''}
            </td>
        </tr>
    `).join('');
}

// Update archive statistics
function updateArchivStats(gesuche) {
    if (!gesuche) return;
    
    const currentYear = new Date().getFullYear();
    const thisYearGesuche = gesuche.filter(g => g.jahr === currentYear);
    const approvedGesuche = gesuche.filter(g => g.status === 'genehmigt');
    
    document.getElementById('stats-total').textContent = gesuche.length.toLocaleString();
    document.getElementById('stats-year').textContent = thisYearGesuche.length.toLocaleString();
    document.getElementById('stats-approved').textContent = `${Math.round((approvedGesuche.length / gesuche.length) * 100)}%`;
}

// Helper functions
function getStatusClass(status) {
    switch(status) {
        case 'genehmigt': return 'bg-green-100 text-green-800';
        case 'abgelehnt': return 'bg-red-100 text-red-800';
        case 'eingereicht': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'genehmigt': return 'Genehmigt';
        case 'abgelehnt': return 'Abgelehnt';
        case 'eingereicht': return 'In Bearbeitung';
        default: return 'Unbekannt';
    }
}

function viewGesuch(id) {
    // TODO: Implement gesuch detail view
    alert(`Gesuch ${id} anzeigen - Feature wird noch implementiert`);
}

function downloadGesuch(id) {
    // TODO: Implement file download
    const token = sessionStorage.getItem('sbv_token');
    window.open(`/api/gesuche/${id}/download?token=${token}`, '_blank');
}

// Export functions to global scope for dashboard.html
window.getPageContent = getPageContent;
window.getPageTitle = getPageTitle;

// Token-Expiry Check für automatischen Logout
function checkTokenExpiry() {
    const token = sessionStorage.getItem('sbv_token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 < Date.now()) {
                console.log('Token abgelaufen - Automatischer Logout');
                sessionStorage.removeItem('sbv_token');
                sessionStorage.removeItem('sbv_benutzer');
                window.location.href = '/login.html';
            }
        } catch (e) {
            console.error('Token-Prüfung fehlgeschlagen:', e);
            sessionStorage.removeItem('sbv_token');
            sessionStorage.removeItem('sbv_benutzer');
            window.location.href = '/login.html';
        }
    }
}

// Prüfe Token-Gültigkeit alle 5 Minuten
setInterval(checkTokenExpiry, 5 * 60 * 1000);

// Initiale Token-Prüfung beim Seitenaufruf
document.addEventListener('DOMContentLoaded', checkTokenExpiry);
