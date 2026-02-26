const CACHE_NAME = 'personalos-v13';
const ASSETS_TO_CACHE = [
  '/',
  '/auth.html',
  '/dashboard.html',
  '/css/style.css',
  '/css/auth.css',
  '/js/firebase-config.js',
  '/js/auth.js',
  '/js/dashboard.js',
  '/js/finance.js',
  '/js/entertainment.js',
  '/js/transactions.js',
  '/js/loans.js',
  '/js/profile.js',
  '/js/reports.js',
  '/js/goals.js',
  '/js/reminders.js',
  '/js/habits.js',
  '/js/memories.js',
  '/js/settings.js',
  '/js/expiry.js',
  '/js/vehicles.js',
  '/js/notifications.js',
  '/js/groceries.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
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
  // Network First Strategy
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
      .catch(() => {
        return caches.match(event.request);
      })
  );
});







