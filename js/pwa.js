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
            
        // Handle controller change — guard with refreshing flag so notification fires only once
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            refreshing = true;
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

// ─── Web Push VAPID Notification Controller ───────────────────────────────────

function getPushServerUrl() {
    return (localStorage.getItem('pushServerUrl') || 'http://localhost:3001').replace(/\/$/, '');
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function getDeviceMetadata() {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let platform = "Unknown Platform";
    
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    
    if (ua.includes("Windows")) platform = "Windows";
    else if (ua.includes("Macintosh") || ua.includes("Mac OS")) platform = "macOS";
    else if (ua.includes("Android")) platform = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) platform = "iOS";
    else if (ua.includes("Linux")) platform = "Linux";
    
    return {
        deviceName: `${platform} - ${browser}`,
        browser,
        platform
    };
}

window.checkPushSupport = function() {
    return ('serviceWorker' in navigator) && ('PushManager' in window);
};

window.getPushStatus = async function() {
    if (!window.checkPushSupport()) return 'unsupported';
    
    const permission = Notification.permission;
    if (permission === 'denied') return 'denied';
    if (permission === 'default') return 'default';
    
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return subscription ? 'subscribed' : 'granted_but_unsubscribed';
    } catch (err) {
        console.error('[PushPWA] Error checking push subscription:', err);
        return 'error';
    }
};

window.subscribeToPush = async function() {
    if (!window.checkPushSupport()) {
        throw new Error('Push notifications not supported in this browser.');
    }

    // Ask permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        throw new Error('Notification permission denied.');
    }

    const registration = await navigator.serviceWorker.ready;
    
    // Fetch VAPID public key from server
    const serverUrl = getPushServerUrl();
    const response = await fetch(`${serverUrl}/api/push/vapid-public-key`);
    if (!response.ok) {
        throw new Error(`Failed to fetch VAPID public key from notification server (HTTP ${response.status})`);
    }
    const { publicKey } = await response.json();
    if (!publicKey) {
        throw new Error('No public key returned by server.');
    }

    // Subscribe browser push manager
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    // Send subscription to backend with token authentication
    const user = firebase.auth().currentUser;
    if (!user) {
        throw new Error('User not logged in.');
    }
    const idToken = await user.getIdToken();
    const metadata = getDeviceMetadata();

    const saveResponse = await fetch(`${serverUrl}/api/push/subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
            subscription,
            metadata
        })
    });

    if (!saveResponse.ok) {
        const errData = await saveResponse.json();
        throw new Error(errData.error || 'Failed to save subscription in backend.');
    }

    console.log('[PushPWA] Successfully subscribed to Push notifications.');
    
    // Trigger local state updates if in Settings page
    if (window.updatePushSettingsUI) {
        window.updatePushSettingsUI();
    }
    
    return await saveResponse.json();
};

window.unsubscribeFromPush = async function() {
    if (!window.checkPushSupport()) return;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
            const endpoint = subscription.endpoint;
            await subscription.unsubscribe();

            // Notify server
            const user = firebase.auth().currentUser;
            if (user) {
                const idToken = await user.getIdToken();
                const serverUrl = getPushServerUrl();
                await fetch(`${serverUrl}/api/push/unsubscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({ endpoint })
                });
            }
        }
        
        console.log('[PushPWA] Successfully unsubscribed from Push.');
        if (window.updatePushSettingsUI) {
            window.updatePushSettingsUI();
        }
    } catch (err) {
        console.error('[PushPWA] Error unsubscribing:', err);
        throw err;
    }
};

// Automatic subscription sync
firebase.auth().onAuthStateChanged(async (user) => {
    if (user && window.checkPushSupport() && Notification.permission === 'granted') {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            // If permission is granted but browser doesn't have an active subscription, re-subscribe
            if (!subscription) {
                console.log('[PushPWA] Permission is granted but no subscription found. Auto-subscribing...');
                await window.subscribeToPush();
            }
        } catch (err) {
            console.warn('[PushPWA] Auto-subscription sync failed:', err.message);
        }
    }
});