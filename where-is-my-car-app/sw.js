const CACHE_PREFIX = 'whereismycar-';
const CACHE_NAME = 'whereismycar-v1.6';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// Install: pre-cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for local assets, network-first for navigation to Google Maps
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // Let Google Maps requests pass through (no cache)
  if (url.hostname.includes('google.com')) {
    return; // browser handles it normally
  }

  if (url.origin !== self.location.origin) return;

  // Cache-first strategy for our own assets
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => cache.match(request)).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        // Cache new valid responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(error => {
        // Offline fallback: return index.html for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('./index.html', { cacheName: CACHE_NAME });
        }
        throw error;
      });
    })
  );
});

self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
