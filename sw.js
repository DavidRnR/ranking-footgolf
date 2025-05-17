const CACHE_NAME = 'footgolf-cache-v1';
const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_z4_nPfXouAPBrb5eP2u5JqNXsg1aQedaRk25l36isMLJy21nPlxeKE1GvOX75MFp5sCLXjc6BegJ/pub?output=csv';

const urlsToCache = [
  './',
  './index.html',
  './css/base.css',
  './css/responsive.css',
  './js/main.js',
  './js/components/ThemeMode.js',
  './js/components/Search.js',
  './js/components/Table.js',
  './js/components/SwitchView.js',
  './js/components/PlayersList.js',
  './js/components/Accordion.js',
  './js/services/rankingService.js',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-192-maskable.png',
  './assets/icons/icon-512-maskable.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192.webp',
  './assets/icons/icon-512.webp',
  './assets/icons/icon-192-maskable.webp',
  './assets/icons/icon-512-maskable.webp',
  './assets/icons/apple-touch-icon.webp',
  './assets/icons/favicon.ico',
  './assets/images/logo.png',
  './assets/images/logo-ln.png',
  './assets/images/logo-liga1.png',
  './assets/images/logo-copa-republica.png',
  './assets/images/logo-copa-republica.webp',
  './assets/images/logo-liga1.webp',
  './assets/images/logo-ln.webp',
  './assets/images/logo.webp',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/outfit/v11/QGYvz_MVcBeNP4NJtEtq.woff2',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(urlsToCache);
    }),
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        }),
      ),
    ),
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Special handling for the Google Sheets URL
  if (event.request.url === SHEET_URL) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200) {
            throw new Error('Network response was not ok');
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch((error) =>
          // If network fails, try to serve from cache
          caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cached response, throw the original error
            throw error;
          }),
        ),
    );
    return;
  }

  // For all other requests, use a cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    }),
  );
});
