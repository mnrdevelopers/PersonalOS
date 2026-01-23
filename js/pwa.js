let deferredPrompt;

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('Service Worker registered');
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch((err) => console.log('Service Worker registration failed', err));
            
        // Handle controller change
        let refreshing;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            if (navigator.serviceWorker.controller) {
                showUpdateNotification();
            }
        });
    });
}

// Handle Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button if it exists
    const installBtn = document.getElementById('install-app-btn') || document.getElementById('install-btn');
    if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.classList.remove('d-none');
        
        // Use onclick to ensure we don't stack listeners if event fires multiple times
        installBtn.onclick = () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    deferredPrompt = null;
                    installBtn.classList.add('d-none');
                });
            }
        };
    }
});

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const installBtn = document.getElementById('install-app-btn') || document.getElementById('install-btn');
    if (installBtn) installBtn.classList.add('d-none');
});

function showUpdateNotification() {
    const toastElement = document.getElementById('update-toast');
    if (toastElement && !toastElement.classList.contains('show') && typeof bootstrap !== 'undefined') {
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        document.getElementById('reload-app-btn')?.addEventListener('click', () => window.location.reload());
    }
}

// iOS Detection
const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

if (isIos() && !isInStandaloneMode()) {
    const iosPrompt = document.getElementById('ios-install-prompt');
    if (iosPrompt) {
        iosPrompt.style.display = 'block';
        
        const closeBtn = document.getElementById('close-ios-install-prompt');
        if(closeBtn) {
            closeBtn.addEventListener('click', () => {
                iosPrompt.style.display = 'none';
            });
        }
    }
}
