const CACHE_NAME = "inventario-v1.0.1"; // Actualizado para forzar nueva instalación
const urlsToCache = [
  "./",
  "./index.html"
  // Eliminados manifest.json y assets/iconos porque están incrustados en index.html
  // Si se externalizan, deben volver a añadirse aquí.
];

// Instalar SW
self.addEventListener("install", e => {
  console.log('Service Worker: Installing cache...');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache', error);
      })
  );
  self.skipWaiting(); // Activa el nuevo SW inmediatamente
});

// Activar SW
self.addEventListener("activate", e => {
  console.log('Service Worker: Activating...');
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(k => {
        if (k !== CACHE_NAME) {
          console.log('Service Worker: Deleting old cache', k);
          return caches.delete(k);
        }
        return null;
      }));
    }).then(() => {
      console.log('Service Worker: Activation complete.');
      return self.clients.claim(); // Toma control de las páginas existentes
    })
  );
});

// Interceptar requests
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      // Si el recurso está en caché, lo devuelve
      if (res) {
        return res;
      }
      // Si no está en caché, intenta obtenerlo de la red
      return fetch(e.request).catch(() => {
        // Opcional: devolver una página offline si la petición falla y no hay caché
        // if (e.request.mode === 'navigate') {
        //   return caches.match('/offline.html'); // Necesitarías crear un offline.html
        // }
        return new Response(null, { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});