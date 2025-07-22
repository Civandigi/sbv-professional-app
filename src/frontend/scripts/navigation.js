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
        'archiv': '<iframe src="pages/archiv.html" style="width: 100%; height: 100vh; border: none; opacity: 0; transition: opacity 0.3s;" onload="this.style.opacity=1" title="SBV Archiv - Jahresarchive"></iframe>',
        'berichte': '<iframe src="pages/berichte.html" style="width: 100%; height: calc(100vh - 200px); border: none; border-radius: 12px; opacity: 0; transition: opacity 0.3s;" onload="this.style.opacity=1" title="SBV Berichte - Retool Integration"></iframe>',
        'dokumente': '<iframe src="pages/dokumente.html" style="width: 100%; height: calc(100vh - 200px); border: none; border-radius: 12px; opacity: 0; transition: opacity 0.3s;" onload="this.style.opacity=1" title="SBV Dokumente - Retool Integration"></iframe>',
        'benutzerverwaltung': getBenutzerverwaltungContent(),
        'systemlogs': getSystemLogsContent(),
        'einstellungen': getEinstellungenContent()
    };
    
    return contents[page] || '<div class="text-center py-12"><p class="text-gray-500">Seite nicht gefunden</p></div>';
}

function getDashboardContent() {
    // Return empty string - Dashboard content is already in dashboard.html
    return '';
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
                <h2 class="text-xl font-bold text-[var(--color-text-primary)]">
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
        <div class="bg-[var(--color-card-background)] rounded-2xl shadow-sm p-6">
            <h2 class="text-xl font-bold text-[var(--color-text-primary)] mb-6">
                <svg class="inline w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                System-Logs
            </h2>
            
            <div class="mb-4 flex gap-2">
                <select class="border rounded-lg px-3 py-2">
                    <option>Alle Logs</option>
                    <option>Login-Aktivitäten</option>
                    <option>System-Fehler</option>
                    <option>Datenbank-Operationen</option>
                </select>
                <button class="bg-[var(--color-light-blue)] text-[var(--color-black)] px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors">
                    Aktualisieren
                </button>
            </div>
            
            <div class="space-y-2 max-h-96 overflow-y-auto">
                <div class="bg-green-50 p-3 rounded border-l-4 border-green-400">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-medium text-green-800">
                                <svg class="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                Erfolgreiche Anmeldung
                            </p>
                            <p class="text-sm text-green-600">Benutzer: superadmin@digitale-rakete.ch</p>
                        </div>
                        <span class="text-xs text-green-500">Heute, 14:30</span>
                    </div>
                </div>
                
                <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-medium text-blue-800">
                                <svg class="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20,18C20,21.63 16.79,22.87 12,22.87C7.21,22.87 4,21.63 4,18V6C4,2.37 7.21,1.13 12,1.13C16.79,1.13 20,2.37 20,6V18Z"/>
                                </svg>
                                Datenbankverbindung hergestellt
                            </p>
                            <p class="text-sm text-blue-600">PostgreSQL: postgresql-sbv-fg-app-u38422.vm.elestio.app</p>
                        </div>
                        <span class="text-xs text-blue-500">Heute, 14:28</span>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-3 rounded border-l-4 border-gray-400">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-medium text-gray-800">
                                <svg class="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,14L6.5,9.5L7.91,8.09L11,11.18L16.59,5.59L18,7L11,14Z"/>
                                </svg>
                                Server gestartet
                            </p>
                            <p class="text-sm text-gray-600">Port: 3000, Environment: development</p>
                        </div>
                        <span class="text-xs text-gray-500">Heute, 14:28</span>
                    </div>
                </div>
                
                <div class="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-medium text-purple-800">
                                <svg class="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                                </svg>
                                Dashboard-Statistiken abgerufen
                            </p>
                            <p class="text-sm text-purple-600">API: /api/dashboard/stats</p>
                        </div>
                        <span class="text-xs text-purple-500">Heute, 14:25</span>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-green-50 p-4 rounded-lg text-center">
                    <p class="text-2xl font-bold text-green-600">147</p>
                    <p class="text-sm text-green-800">Erfolgreiche Logins</p>
                </div>
                <div class="bg-red-50 p-4 rounded-lg text-center">
                    <p class="text-2xl font-bold text-red-600">2</p>
                    <p class="text-sm text-red-800">Fehlgeschlagene Logins</p>
                </div>
                <div class="bg-blue-50 p-4 rounded-lg text-center">
                    <p class="text-2xl font-bold text-blue-600">1,234</p>
                    <p class="text-sm text-blue-800">API-Aufrufe heute</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg text-center">
                    <p class="text-2xl font-bold text-yellow-600">0</p>
                    <p class="text-sm text-yellow-800">System-Warnungen</p>
                </div>
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

// Export functions to global scope for dashboard.html
window.getPageContent = getPageContent;
window.getPageTitle = getPageTitle;
