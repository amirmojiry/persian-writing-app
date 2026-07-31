import { readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const files = await collectFiles(dist.pathname);
const assets = files.map((file) => relative(dist.pathname, file).split(sep).join('/')).filter((file) => file !== 'sw.js').map((file) => `./${file}`).sort();
const source = `const CACHE_NAME = 'persian-writing-app-v0.2.0';\nconst PRECACHE = ${JSON.stringify(assets, null, 2)};\nself.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))); self.skipWaiting(); });\nself.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))); self.clients.claim(); });\nself.addEventListener('fetch', (event) => { if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return; event.respondWith(caches.match(event.request).then((cached) => cached ?? fetch(event.request).then((response) => { if (response.ok) { const copy = response.clone(); void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)); } return response; }).catch(async () => { if (event.request.mode === 'navigate') return (await caches.match('./index.html')) ?? Response.error(); return Response.error(); }))); });\n`;
await writeFile(new URL('../dist/sw.js', import.meta.url), source);
console.log(`Generated offline service worker with ${assets.length} precached files.`);
async function collectFiles(directory) { const entries = await readdir(directory, { withFileTypes: true }); const nested = await Promise.all(entries.map(async (entry) => { const path = join(directory, entry.name); return entry.isDirectory() ? collectFiles(path) : [path]; })); return nested.flat(); }
