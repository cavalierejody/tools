/* Service worker per "Bianca o Nera" — offline cache-first.
   Versione: 2.0
   Strategia: cache-first per tutti gli asset statici, fallback shell per navigazione.
   Aggiorna CACHE_VERSION per forzare il refresh dell'utente dopo ogni deploy. */

const CACHE_VERSION = "caselle-v2";
const STATIC_CACHE = CACHE_VERSION + "-static";
const RUNTIME_CACHE = CACHE_VERSION + "-runtime";

const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-192-maskable.png",
  "./icons/icon-512-maskable.png"
];

/* ---- Install: precache tutti gli asset critici ---- */
self.addEventListener("install", (event) => {
  self.skipWaiting(); // attiva subito il nuovo SW
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch((err) => console.warn("[SW] Precache parziale:", err))
  );
});

/* ---- Activate: elimina cache vecchie ---- */
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const allKeys = await caches.keys();
    const toDelete = allKeys.filter(
      (key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE
    );
    await Promise.all(toDelete.map((key) => caches.delete(key)));
    // Prendi controllo di tutti i client già aperti senza reload
    await self.clients.claim();
  })());
});

/* ---- Fetch: cache-first con fallback rete ---- */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Ignora richieste non-GET e cross-origin
  if (req.method !== "GET") return;
  if (!req.url.startsWith(self.location.origin)) return;

  event.respondWith((async () => {
    // 1. Cerca in cache statica prima (asset precachati)
    const staticHit = await caches.match(req, { cacheName: STATIC_CACHE, ignoreSearch: true });
    if (staticHit) return staticHit;

    // 2. Cerca in cache runtime (asset caricati dinamicamente)
    const runtimeHit = await caches.match(req, { cacheName: RUNTIME_CACHE, ignoreSearch: true });
    if (runtimeHit) return runtimeHit;

    // 3. Rete → metti in cache runtime per uso futuro
    try {
      const networkRes = await fetch(req);
      if (networkRes && networkRes.status === 200) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, networkRes.clone());
      }
      return networkRes;
    } catch (err) {
      // 4. Offline fallback: per navigazione restituisci la shell dell'app
      if (req.mode === "navigate") {
        const shell =
          (await caches.match("./index.html", { cacheName: STATIC_CACHE })) ||
          (await caches.match("./",           { cacheName: STATIC_CACHE }));
        if (shell) return shell;
      }
      throw err;
    }
  })());
});

/* ---- Message: supporto skipWaiting da UI ---- */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
