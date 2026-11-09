const CACHE_NAME = 'party1450-v14';
const PEER = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
const ASSETS = ['./', './index.html', './game.js', './fight.js', './manifest.json', PEER];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map((u) => cache.add(u).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // never cache PeerJS signalling traffic
  if (url.hostname.endsWith('peerjs.com')) return;
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const sameOrigin = url.origin === location.origin;
      if (sameOrigin) {
        try {
          const net = await fetch(e.request);
          if (net && net.ok) cache.put(e.request, net.clone());
          return net;
        } catch (err) {
          const cached = await cache.match(e.request);
          return cached || cache.match('./index.html');
        }
      }
      const cached = await cache.match(e.request);
      if (cached) return cached;
      try {
        const net = await fetch(e.request);
        if (net && net.ok && e.request.url === PEER) cache.put(e.request, net.clone());
        return net;
      } catch (err) {
        return cache.match('./index.html');
      }
    })()
  );
});
