const CACHE_NAME = 'persian-writing-app-v0.2.0';
const PRECACHE = [
  "./assets/index-C0pu6hZb.css",
  "./assets/index-DeC4KJqc.js",
  "./icon.svg",
  "./index.html",
  "./manifest.webmanifest"
];
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))); self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))); self.clients.claim(); });
self.addEventListener('fetch', (event) => { if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return; event.respondWith(caches.match(event.request).then((cached) => cached ?? fetch(event.request).then((response) => { if (response.ok) { const copy = response.clone(); void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)); } return response; }).catch(async () => { if (event.request.mode === 'navigate') return (await caches.match('./index.html')) ?? Response.error(); return Response.error(); }))); });
