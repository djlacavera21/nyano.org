const CACHE_NAME = 'nyano-site-v2';
const OFFLINE_URL = '/offline.html';
const ASSETS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/css/styles.css',
  '/img/nyano2.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/android-chrome-72x72.png',
  '/apple-touch-icon.png',
  '/safari-pinned-tab.svg',
  '/js/price.js',
  '/js/network.js',
  '/js/offline.js',
  '/css/Ubuntu-Title.woff2',
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for same-origin resources
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() =>
        caches
          .match(event.request)
          .then((res) => res || caches.match(OFFLINE_URL)),
      ),
  );
});
