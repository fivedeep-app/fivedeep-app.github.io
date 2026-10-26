// Caches the app so it opens in the gym with no signal.
// Bump VERSION whenever you change index.html so phones pick up the update.
const VERSION = "five-deep-v28";
const FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => {
  // cache: "reload" skips the browser's 10-minute page cache so a new version never stores old files
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // For the app's own files, always check GitHub for a newer copy (a quick "not modified" if nothing changed)
  const own = new URL(e.request.url).origin === self.location.origin;
  const req = own ? new Request(e.request.url, { cache: "no-cache" }) : e.request;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
