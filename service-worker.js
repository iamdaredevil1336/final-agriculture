const CACHE_NAME = 'agrisystem-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './crops.html',
  './seeds.html',
  './seasons.html',
  './soils.html',
  './prices.html',
  './login.html',
  './style.css',
  './manifest.json',
  './api.js',
  './auth.js',
  './main.js',
  './crops.js',
  './seeds.js',
  './seasons.js',
  './soils.js',
  './prices.js',
  './chatbot.js',
  './i18n.js',
  './tools.js',
  './advanced_tools.js',
  './crop_images.js',
  './dashboard.js',
  './data.js',
  './hindi_crop_data.js',
  './gujarati_crop_data.js',
  './translations/en.json',
  './translations/hi.json',
  './translations/gu.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Pre-caching offline assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[ServiceWorker] Some assets failed to pre-cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests
  if (req.method !== 'GET') return;

  // Handle API requests: Network-first with Cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, resClone));
          }
          return res;
        })
        .catch(() => {
          return caches.match(req).then(cached => {
            if (cached) return cached;
            return new Response(JSON.stringify({
              success: false,
              error: 'Offline mode: Cached data unavailable. Please check your internet connection.',
              offline: true
            }), {
              headers: { 'Content-Type': 'application/json; charset=utf-8' }
            });
          });
        })
    );
    return;
  }

  // Handle Images: Network-first to always serve updated authentic photos
  if (url.pathname.includes('/images/')) {
    event.respondWith(
      fetch(req).then(networkRes => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, resClone));
        }
        return networkRes;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Handle Static assets & Pages: Cache-first, then network fallback
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // Fetch update in background (stale-while-revalidate)
        fetch(req).then(networkRes => {
          if (networkRes && networkRes.status === 200) {
            caches.open(CACHE_NAME).then(c => c.put(req, networkRes));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then(networkRes => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, resClone));
        }
        return networkRes;
      }).catch(() => {
        // If navigation fails, return cached index.html
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
