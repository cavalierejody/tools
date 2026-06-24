// ── 6min · Service Worker ───────────────────────────────────────────────────
// Cache-First con Network Fallback.
// IMPORTANTE: manifest.json NON viene mai cachato — deve essere sempre fresco
// così il browser legge subito il nome corretto al momento dell'install prompt.

const CACHE_NAME = '6min-v2';

// Shell dell'app da pre-cachare (NO manifest.json)
const PRECACHE = [
  './index.html',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// CDN esterne — network-first con fallback cache
const CDN_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com'
];

// Risorse mai da cachare (sempre fresche)
const NEVER_CACHE = [
  'manifest.json'  // matchato via endsWith, la querystring viene ignorata
];

function isCDN(url) {
  return CDN_HOSTS.some(h => url.hostname.includes(h));
}

function isNeverCache(url) {
  return NEVER_CACHE.some(f => url.pathname.endsWith(f));
}

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ── Activate: pulizia vecchie cache ─────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // manifest.json — sempre dalla rete, mai dalla cache
  if (isNeverCache(url)) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  if (isCDN(url)) {
    // Network-first per CDN (font, librerie)
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Cache-first + stale-while-revalidate per risorse locali
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) {
          fetch(request).then(fresh => {
            if (fresh && fresh.status === 200) {
              caches.open(CACHE_NAME).then(c => c.put(request, fresh));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(request).then(response => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return response;
        });
      })
    );
  }
});
