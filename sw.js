const CACHE_NAME = 'matchday-pwa-v7';
const URLS_A_GUARDAR = [
    './',
    './index.html',
    './detalle.html',
    './styles.css',
    './datos.js',
    './partidos-extra.js',
    './config.js',
    './en-vivo.js',
    './app.js',
    './detalle.js',
    './manifest.json',
    './logo.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(URLS_A_GUARDAR))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Red primero; guarda copia de lo que se descarga (incluye los escudos de /escudos)
// para que la app funcione sin internet. ignoreSearch: detalle.html?id=3 usa detalle.html.
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (new URL(event.request.url).origin !== location.origin) return;   // API, banderas y escudos externos: el navegador los maneja
    event.respondWith(
        fetch(event.request)
            .then(resp => {
                if (resp.ok && new URL(event.request.url).origin === location.origin) {
                    const copia = resp.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, copia));
                }
                return resp;
            })
            .catch(() => caches.match(event.request, { ignoreSearch: true }))
    );
});
