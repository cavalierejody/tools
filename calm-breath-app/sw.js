// ─── 4-7-8 Respirazione · Service Worker ───────────────────────────────────
// Strategy: Cache-First for shell assets, Network-First fallback to cache
// for external resources (Google Fonts, Tailwind CDN).

const CACHE_VERSION = 'v1.0.0';
const SHELL_CACHE   = `478-shell-${CACHE_VERSION}`;
const FONT_CACHE    = `478-fonts-${CACHE_VERSION}`;

// Assets that MUST be cached for full offline support
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32x32.png'
];

// External origins we want to cache opportunistically
const CACHEABLE_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdn.tailwindcss.com'
];

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())   // activate immediately
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('478-') && k !== SHELL_CACHE && k !== FONT_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())  // take control of existing tabs
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Same-origin shell assets → Cache-First
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  // External fonts / Tailwind → Network-First, fall back to cache
  if (CACHEABLE_ORIGINS.some(o => request.url.startsWith(o))) {
    event.respondWith(networkFirstWithCache(request, FONT_CACHE));
    return;
  }

  // Everything else → plain network (analytics, etc.)
  // No caching for unknown origins.
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Cache-First: serve from cache; on miss, fetch & store. */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // If fetch fails and there's nothing in cache, return a bare offline page.
    return new Response(
      '<html><body style="font-family:sans-serif;text-align:center;padding:2rem">' +
      '<h2>Offline</h2><p>Riapri l\'app quando sei di nuovo online.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/** Network-First: try network; on failure, serve from cache. */
async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response('', { status: 503 });
  }
}

// ─── Background Sync stub (future-proof) ─────────────────────────────────────
self.addEventListener('sync', () => {
  // Nothing to sync — app is fully self-contained.
});

// ─── Push Notification stub (optional future feature) ────────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '4-7-8 Respirazione', {
      body: data.body || 'È ora di respirare.',
      icon: './icons/icon-192x192.png',
      badge: './icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: { url: './' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || './'));
});
