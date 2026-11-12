const CACHE_NAME = 'party1450-v22';
const PEER = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
const MUSIC = new Set(['./background-music.mp3', './battle-music.mp3'].map(path => new URL(path, self.location).href));
const ASSETS = ['./', './index.html', './spacebg.js', './game.js', './fight.js', './manifest.json', './icon-192.png', './icon-512.png', './background-music.mp3', './battle-music.mp3', PEER];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache =>
    Promise.all(ASSETS.map(u => cache.add(u).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k.startsWith('party1450-') && k !== CACHE_NAME).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function musicResponse(request, cache) {
  let response = await cache.match(request.url);
  if (!response) {
    response = await fetch(request.url);
    if (response.status !== 200) return response;
    await cache.put(request.url, response.clone());
  }
  const range = request.headers.get('range');
  if (!range) return response;
  const bytes = await response.arrayBuffer();
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  const size = bytes.byteLength;
  let start = 0, end = size - 1;
  if (match && (match[1] || match[2])) {
    if (!match[1]) start = Math.max(0, size - Number(match[2]));
    else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])); }
  } else start = size;
  if (start >= size || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  return new Response(bytes.slice(start, end + 1), { status: 206, headers: {
    'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes',
    'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1)
  } });
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname.endsWith('peerjs.com')) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (MUSIC.has(e.request.url)) {
      try { return await musicResponse(e.request, cache); }
      catch { return Response.error(); }
    }
    if (url.origin === location.origin) {
      try {
        const net = await fetch(e.request);
        if (net.status === 200) await cache.put(e.request, net.clone());
        return net;
      } catch {
        const cached = await cache.match(e.request);
        return cached || (e.request.mode === 'navigate' && await cache.match('./index.html')) || Response.error();
      }
    }
    const cached = await cache.match(e.request);
    if (cached) return cached;
    try {
      const net = await fetch(e.request);
      if (net.status === 200 && e.request.url === PEER) await cache.put(e.request, net.clone());
      return net;
    } catch { return Response.error(); }
  })());
});
