const CACHE_NAME = 'marketpulse-v1';
const STATIC_ASSETS = [
    '/',
    '/news',
    '/prices',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET and API calls
    if (request.method !== 'GET' || request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, clone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(request);
            })
    );
});
