// ── Fasce di Allenamento · Service Worker ──────────────────────────────────
// Strategia: Cache-First con Network Fallback.
// Alla prima visita pre-cachiamo tutte le risorse statiche.
// Nelle visite successive serviamo dalla cache; tentiamo la rete in background
// (stale-while-revalidate per assets, network-first per CDN).

const CACHE_NAME = '6min-v1';

// Risorse locali da pre-cachare (shell dell'app)
const PRECACHE = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// CDN esterne — tentiamo la rete, fallback alla cache
const CDN_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com'
];

function isCDN(url) {
  return CDN_HOSTS.some(h => url.hostname.includes(h));
}

// ── Install: pre-cacha la shell ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ── Activate: pulizia vecchie cache ─────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch ────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo GET
  if (request.method !== 'GET') return;

  if (isCDN(url)) {
    // Network-first per risorse CDN (font, librerie)
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
    // Cache-first per risorse locali (shell, icone, html)
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) {
          // Aggiorna in background (stale-while-revalidate)
          fetch(request).then(fresh => {
            if (fresh && fresh.status === 200) {
              caches.open(CACHE_NAME).then(c => c.put(request, fresh));
            }
          }).catch(() => {});
          return cached;
        }
        // Non in cache: prova la rete e salva
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
