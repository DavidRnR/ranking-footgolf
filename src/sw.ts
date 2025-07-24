// Determine base path dynamically
const getBasePath = () => {
  // For GitHub Pages, use the repository name from the environment
  if (typeof process !== 'undefined' && process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
    return `/${repoName}/`;
  }
  // For local development, use root
  return '/';
};

const BASE_PATH = getBasePath();
const CACHE_NAME = 'footgolf-cache-v1.4';
const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_z4_nPfXouAPBrb5eP2u5JqNXsg1aQedaRk25l36isMLJy21nPlxeKE1GvOX75MFp5sCLXjc6BegJ/pub?output=csv';

// Cache the main app shell with dynamic base path
const urlsToCache = [
  `${BASE_PATH}`,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}assets/icons/icon-192.png`,
  `${BASE_PATH}assets/icons/icon-512.png`,
  `${BASE_PATH}assets/icons/icon-192-maskable.png`,
  `${BASE_PATH}assets/icons/icon-512-maskable.png`,
  `${BASE_PATH}assets/icons/apple-touch-icon.png`,
  `${BASE_PATH}assets/icons/icon-192.webp`,
  `${BASE_PATH}assets/icons/icon-512.webp`,
  `${BASE_PATH}assets/icons/icon-192-maskable.webp`,
  `${BASE_PATH}assets/icons/icon-512-maskable.webp`,
  `${BASE_PATH}assets/icons/apple-touch-icon.webp`,
  `${BASE_PATH}assets/icons/favicon.ico`,
  `${BASE_PATH}assets/images/logo.png`,
  `${BASE_PATH}assets/images/logo-ln.png`,
  `${BASE_PATH}assets/images/logo-liga1.png`,
  `${BASE_PATH}assets/images/logo-copa-republica.png`,
  `${BASE_PATH}assets/images/logo-copa-republica.webp`,
  `${BASE_PATH}assets/images/logo-liga1.webp`,
  `${BASE_PATH}assets/images/logo-ln.webp`,
  `${BASE_PATH}assets/images/logo.webp`,
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/outfit/v11/QGYvz_MVcBeNP4NJtEtq.woff2',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  (event as ExtendableEvent).waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(urlsToCache);
    }),
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  (event as ExtendableEvent).waitUntil(
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
  const fetchEvent = event as FetchEvent;
  // Special handling for the Google Sheets URL
  if (fetchEvent.request.url === SHEET_URL) {
    fetchEvent.respondWith(
      fetch(fetchEvent.request)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200) {
            throw new Error('Network response was not ok');
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(fetchEvent.request, responseToCache);
          });

          return response;
        })
        .catch((error) =>
          // If network fails, try to serve from cache
          caches.match(fetchEvent.request).then((cachedResponse) => {
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
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(fetchEvent.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cache all successful responses (including hashed JS/CSS files)
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(fetchEvent.request, responseToCache);
        });

        return response;
      });
    }),
  );
});
