// Service Worker for MarketPulse PWA
// Strategy: Network-first for pages, Cache-first for static assets

const CACHE_VERSION = 'v3';
const CACHE_NAME = `marketpulse-${CACHE_VERSION}`;

const STATIC_ASSETS = [
    '/manifest.json',
    '/icons/icon-192.svg',
    '/icons/icon-512.svg',
];

// Install: pre-cache critical static files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate: remove old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch: Network-first with cache fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Only handle GET requests
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Skip: cross-origin, API calls, Firebase, Ngrok, Firestore
    if (
        url.origin !== self.location.origin ||
        url.pathname.startsWith('/api/') ||
        url.hostname.includes('firebaseio') ||
        url.hostname.includes('googleapis') ||
        url.hostname.includes('ngrok')
    ) {
        return;
    }

    // Static assets (JS, CSS, images, fonts): Cache-first
    if (
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.startsWith('/icons/') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.webp') ||
        url.pathname.endsWith('.woff2')
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((resp) => {
                    if (resp.ok) {
                        const clone = resp.clone();
                        caches.open(CACHE_NAME).then((c) => c.put(request, clone));
                    }
                    return resp;
                });
            })
        );
        return;
    }

    // Pages: Network-first, fallback to cache, then offline page
    event.respondWith(
        fetch(request)
            .then((resp) => {
                if (resp.ok) {
                    const clone = resp.clone();
                    caches.open(CACHE_NAME).then((c) => c.put(request, clone));
                }
                return resp;
            })
            .catch(() => {
                return caches.match(request);
            })
    );
});
