const CACHE_NAME = 'mfc-portal-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A simple pass-through fetch handler is required by some browsers to qualify as a PWA
  event.respondWith(fetch(event.request).catch(() => {
    // Return offline fallback if needed
  }));
});
