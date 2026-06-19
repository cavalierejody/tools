/* Service worker per "Bianca o Nera" — offline cache-first.
   Va servito dalla stessa cartella dell'HTML (http/https; non funziona da file://). */
const CACHE = "casella-v1";
const ASSETS = ["./", "./index.html"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  e.respondWith((async () => {
    // cache-first: l'app è statica e autosufficiente
    const cached = await caches.match(req, { ignoreSearch: true });
    if (cached) return cached;

    try {
      const res = await fetch(req);
      if (res && res.status === 200 && req.url.startsWith(self.location.origin)) {
        const c = await caches.open(CACHE);
        c.put(req, res.clone());
      }
      return res;
    } catch (err) {
      // offline: per una navigazione, restituisci la shell dell'app
      if (req.mode === "navigate") {
        const shell = (await caches.match("./")) || (await caches.match("./index.html"));
        if (shell) return shell;
      }
      throw err;
    }
  })());
});
