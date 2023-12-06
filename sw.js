const cacheName = 'testbricks-v3';

const cachedFiles = [
    './',
    'icon.png',
    'index.html',
    'sw.js',
    'manifest.json',
    'src/main.js',
    'src/components/BlockHeap.js',
    'src/components/Controls.js',
    'src/components/Display.js',
    'src/components/Status.js',
    'src/components/TestBricks.js',
    'src/game/blocks.js',
    'src/game/board.js',
    'src/game/game.js',
    'src/lib/proxy.js',
];

const addFilesToCache = async () => {
    const cache = await caches.open(cacheName);
    return cache.addAll(cachedFiles);
};

const removeStaleCaches = async () => {
    const keys = await caches.keys();
    const staleKeys = keys.filter((key) => key !== cacheName);

    return Promise.all(staleKeys.map((key) => caches.delete(key)));
}

const fetchFromNetwork = async (cache, event) => {
    const networkResponse = await fetch(event.request);
    cache.put(event.request, networkResponse.clone());

    return networkResponse;
};

const fetchFromCacheFirst = async (event) => {
    const cache = await caches.open(cacheName);
    const response = await cache.match(event.request);

    if (response && !navigator.onLine) {
        return response;
    }

    return fetchFromNetwork(cache, event);
};

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => event.waitUntil(removeStaleCaches()));

self.addEventListener('fetch', (event) => event.respondWith(fetchFromCacheFirst(event)));
