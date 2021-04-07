const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/index.js',
  '/db.js',
  '/styles.css',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
  // 'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

//fetch 
self.addEventListener("fetch", function(event){
  if (event.request.url.includes("/api/")){
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request)
        .then(response => {
          if (response.status === 200){
            cache.put(event.request.url, response.clone())
          }
          return response
        })
        .catch(err => {
          return cache.match(event.request)
        })
      }).catch(err => console.log(err))
    )
    return
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>{
      return cache.match(event.request).then(response => {
        return response || fetch(event.request)
      })
    })
  )
})

