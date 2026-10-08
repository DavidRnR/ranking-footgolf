// Deletes caches left by the hand-written worker (footgolf-cache-v*) once Workbox takes its script URL.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith('footgolf-cache-')).map((key) => caches.delete(key))),
      ),
  );
});
