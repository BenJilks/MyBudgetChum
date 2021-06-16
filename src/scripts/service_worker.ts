
self.addEventListener('install', (e: any) => 
{
    e.waitUntil(
        caches.open('fox-store').then(cache => cache.addAll(
        [
            '/index.html',
            '/spending.html',
            '/transaction_view.html',
            '/repeat.html',
            '/settings.html',
            '/index.js',
	    '/service_worker.js',
            '/spending.js',
            '/transaction_view.js',
            '/repeat.js',
            '/settings.js',
            '/index.css',
            '/spending.css',
            '/transaction_view.css',
            '/repeat.css',
            '/settings.css',
            '/favicon.png',
            '/icon_192.png',
            '/icon_512.png',
        ])),
    )
});

self.addEventListener('fetch', (e: any) => 
{
    console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then(response => response || fetch(e.request)),
    );
});
