// PWA Installation and Service Worker Registration
class PWAHelper {
    constructor() {
        this.deferredPrompt = null;
        this.isIOS = this.detectIOS();
        this.isStandalone = this.detectStandalone();
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupMetaTags();
        this.setupThemeColor();
    }

    // Detect iOS devices
    detectIOS() {
        return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    }

    // Detect if app is running in standalone mode
    detectStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }

    // Register Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('SW registered: ', registration);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('SW update found!');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

            } catch (error) {
                console.log('SW registration failed: ', error);
            }
        }
    }

    // Handle install prompt
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPromotion();
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.deferredPrompt = null;
            this.hideInstallPromotion();
        });
    }

    // Show install promotion
    showInstallPromotion() {
        // Only show if not already installed and not on iOS (which has different install flow)
        if (!this.isStandalone && !this.isIOS) {
            this.createInstallButton();
        } else if (this.isIOS && !this.isStandalone) {
            this.showIOSInstallInstructions();
        }
    }

    // Create install button for Android/Desktop
    createInstallButton() {
        // Check if button already exists
        if (document.getElementById('pwa-install-btn')) return;

        const installBtn = document.createElement('button');
        installBtn.id = 'pwa-install-btn';
        installBtn.className = 'pwa-install-btn';
        installBtn.innerHTML = `
            <i class="fas fa-download"></i>
            Install App
        `;
        
        installBtn.addEventListener('click', () => this.installApp());
        
        document.body.appendChild(installBtn);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.hideInstallPromotion();
        }, 10000);
    }

    // Show iOS install instructions
    showIOSInstallInstructions() {
        // Check if instructions already exist
        if (document.getElementById('ios-install-help')) return;

        const iosHelp = document.createElement('div');
        iosHelp.id = 'ios-install-help';
        iosHelp.className = 'ios-install-help';
        iosHelp.innerHTML = `
            <div class="ios-install-content">
                <h3>Install Expiry Tracker</h3>
                <p>Tap <i class="fas fa-share"></i> then "Add to Home Screen"</p>
                <button class="btn" id="close-ios-help">Got it</button>
            </div>
        `;
        
        document.body.appendChild(iosHelp);
        
        document.getElementById('close-ios-help').addEventListener('click', () => {
            iosHelp.remove();
        });
    }

    // Hide install promotion
    hideInstallPromotion() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    // Trigger app installation
    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            
            this.deferredPrompt = null;
            this.hideInstallPromotion();
        }
    }

    // Setup meta tags for PWA
    setupMetaTags() {
        // Viewport meta tag (should already be in HTML)
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
            document.head.appendChild(viewport);
        }

        // Theme color meta tag
        const themeColor = document.createElement('meta');
        themeColor.name = 'theme-color';
        themeColor.content = '#6366f1';
        document.head.appendChild(themeColor);

        // Apple specific meta tags
        if (this.isIOS) {
            const appleMobileWebAppCapable = document.createElement('meta');
            appleMobileWebAppCapable.name = 'apple-mobile-web-app-capable';
            appleMobileWebAppCapable.content = 'yes';
            document.head.appendChild(appleMobileWebAppCapable);

            const appleMobileWebAppStatusBar = document.createElement('meta');
            appleMobileWebAppStatusBar.name = 'apple-mobile-web-app-status-bar-style';
            appleMobileWebAppStatusBar.content = 'black-translucent';
            document.head.appendChild(appleMobileWebAppStatusBar);

            const appleTouchIcon = document.createElement('link');
            appleTouchIcon.rel = 'apple-touch-icon';
            appleTouchIcon.href = '/icons/icon-192x192.png';
            document.head.appendChild(appleTouchIcon);

            // Splash screens (simplified - in production you'd want all sizes)
            const splashScreen = document.createElement('link');
            splashScreen.rel = 'apple-touch-startup-image';
            splashScreen.href = '/splash.png';
            document.head.appendChild(splashScreen);
        }
    }

    // Update theme color dynamically
    setupThemeColor() {
        // Update theme color meta tag when theme changes
        const observer = new MutationObserver(() => {
            const themeColorMeta = document.querySelector('meta[name="theme-color"]');
            if (themeColorMeta) {
                themeColorMeta.content = '#6366f1';
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // Show update notification
    showUpdateNotification() {
        const updateNotification = document.createElement('div');
        updateNotification.className = 'pwa-update-notification';
        updateNotification.innerHTML = `
            <div class="pwa-update-content">
                <p>New version available!</p>
                <button class="btn" id="pwa-update-btn">Update</button>
            </div>
        `;

        document.body.appendChild(updateNotification);

        document.getElementById('pwa-update-btn').addEventListener('click', () => {
            window.location.reload();
        });
    }

    // Check connection status
    setupConnectionMonitoring() {
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', this.updateConnectionStatus);
        }

        window.addEventListener('online', () => {
            this.showToast('Back online', 'success');
        });

        window.addEventListener('offline', () => {
            this.showToast('You are offline', 'warning');
        });
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `pwa-toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize PWA
const pwa = new PWAHelper();

// Export for global access
window.PWAHelper = pwa;
