// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBnRKEd7Up3qbwC3mqCQhQLD2_Wd11rdzw",
  authDomain: "expiry-tracker-aadcc.firebaseapp.com",
  projectId: "expiry-tracker-aadcc",
  storageBucket: "expiry-tracker-aadcc.firebasestorage.app",
  messagingSenderId: "17745090137",
  appId: "1:17745090137:web:077f0c5e0e1eca1fd34348",
  measurementId: "G-ST64HBYQLD"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Enhanced background message handler
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message: ', payload);
    
    const notificationTitle = payload.data?.title || payload.notification?.title || 'Expiry Tracker';
    const notificationBody = payload.data?.body || payload.notification?.body || 'You have a new notification';
    const docId = payload.data?.docId || '';
    const docName = payload.data?.docName || '';
    const docType = payload.data?.docType || '';
    
    const notificationOptions = {
        body: notificationBody,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'expiry-tracker',
        requireInteraction: true,
        data: {
            docId: docId,
            docName: docName,
            docType: docType,
            page: payload.data?.page || 'documents.html',
            type: payload.data?.type || 'info',
            timestamp: new Date().toISOString()
        },
        actions: [
            {
                action: 'view',
                title: 'View Document'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Enhanced notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const targetPage = event.notification.data?.page || 'dashboard.html';
    const docId = event.notification.data?.docId;
    
    let targetUrl = targetPage;
    if (docId && targetPage === 'documents.html') {
        targetUrl = `${targetPage}#doc-${docId}`;
    }
    
    event.waitUntil(
        clients.matchAll({ 
            type: 'window',
            includeUncontrolled: true 
        }).then((clientList) => {
            // Check if app is already open
            for (const client of clientList) {
                if (client.url.includes(targetPage) && 'focus' in client) {
                    client.postMessage({
                        type: 'NOTIFICATION_CLICK',
                        data: event.notification.data
                    });
                    return client.focus();
                }
            }
            // Open new window
            return clients.openWindow(targetUrl);
        })
    );
});

// Handle notification actions
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed:', event.notification.tag);
});
