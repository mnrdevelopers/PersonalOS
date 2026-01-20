let deferredPrompt;

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((reg) => console.log('Service Worker registered'))
            .catch((err) => console.log('Service Worker registration failed', err));
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
        
        installBtn.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
            });
        });
    }
});

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