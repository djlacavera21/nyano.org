const CACHE_NAME = 'nyano-site-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/img/nyano2.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/android-chrome-72x72.png',
  '/apple-touch-icon.png',
  '/safari-pinned-tab.svg',
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
});
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});
