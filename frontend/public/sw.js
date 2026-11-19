const CACHE_NAME = 'conecta-cache-v2';
const RECURSOS_ESTATICOS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon.png',
  '/favicon.svg',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/favicon-96x96.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(RECURSOS_ESTATICOS).catch(() => {
        // En desarrollo algunos archivos pueden no estar precargados
      });
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET del mismo origen o fuentes
  if (event.request.method !== 'GET') return;

  // Ignorar llamadas a la API para que siempre sean dinámicas y frescas
  if (
    event.request.url.includes('/auth') ||
    event.request.url.includes('/publicaciones') ||
    event.request.url.includes('/usuarios') ||
    event.request.url.includes('/estadisticas')
  ) {
    return;
  }

  // Estrategia Network-First: obtener siempre los recursos frescos de la red si está disponible
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      }),
  );
});
