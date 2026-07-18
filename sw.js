const CACHE_NAME = 'personalos-v59';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './auth.html',
  './dashboard.html',
  './css/style.css',
  './css/auth.css',
  './css/pwa.css',
  './js/firebase-config.js',
  './js/auth.js',
  './js/dashboard.js',
  './js/pwa.js',
  './js/finance.js',
  './js/transactions.js',
  './js/habits.js',
  './js/reminders.js',
  './js/notifications.js',
  './js/groceries.js',
  './js/bank-accounts.js',
  './js/loans.js',
  './js/settings.js',
  './js/profile.js',
  './js/reports.js',
  './js/vehicles.js',
  './js/entertainment.js',
  './js/expiry.js',
  './js/cat-search-picker.js',
  './js/ai-assistant.js',
  './js/ai.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache assets individually so one failed CDN asset doesn't abort the entire install
      const results = await Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      );
      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          console.warn('[SW] Failed to cache:', ASSETS_TO_CACHE[i], result.reason);
        }
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only intercept HTTP GET requests
  if (!event.request.url.startsWith('http') || event.request.method !== 'GET') {
    return;
  }

  // Skip intercepting push notifications server and cloud databases
  const url = event.request.url;
  if (url.includes('/api/push/') || url.includes('firestore.googleapis.com') || url.includes('firebaseio.com')) {
    return;
  }

  // Network-first strategy: try network, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback response to avoid Service Worker TypeError
        return new Response('Network error and resource not cached.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      })
  );
});

// ─── PUSH NOTIFICATIONS HANDLERS ─────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch (err) {
    // Fallback if not JSON
    payload = {
      notification: {
        title: 'Personal OS Alert',
        body: event.data.text()
      }
    };
  }

  const notification = payload.notification || {};
  const title = notification.title || 'Personal OS';
  
  const options = {
    body: notification.body || '',
    icon: notification.icon || '/android-icons/android-launchericon-192-192.png',
    badge: notification.badge || '/android-icons/android-launchericon-72-72.png',
    image: notification.image || undefined,
    tag: notification.tag || 'personalos-alert',
    vibrate: notification.vibrate || [100, 50, 100],
    timestamp: notification.timestamp ? new Date(notification.timestamp).getTime() : Date.now(),
    data: notification.data || {},
    actions: notification.actions || [
      { action: 'open', title: 'Open Personal OS' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    silent: notification.silent || false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Look for already open windows and focus them
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        const clientUrl = new URL(client.url, self.location.origin).pathname + new URL(client.url, self.location.origin).hash;
        if (clientUrl === targetUrl || client.url === targetUrl || client.url.endsWith(targetUrl)) {
          return client.focus();
        }
      }
      
      // Otherwise open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});
