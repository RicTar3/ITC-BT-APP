const CACHE_NAME = "itc-app-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./bt19-aprendizaje.html",
  "./consumo.html",
  "./IntensidadNom.html",
  "./ITC-BT-10.html",

  "./bt19-aprendizaje.js",
  "./consumo.js",
  "./IntensidadNom.js",
  "./ITC-BT-10.js",

  "./styles.css",
  "./snap.css"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
