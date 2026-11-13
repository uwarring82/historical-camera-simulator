/* Same-origin app shell caching only. No user photos, imported files or external sites. */
const CACHE = 'camera-archive-v0.2.0';
const SHELL = ['./','./index.html','./studio.html','./learn.html','./styles.css','./manifest.webmanifest','./icons/icon.svg','./icons/apple-touch-icon.png','./demo-scene.svg','./demo-scene.png','./src/app.mjs','./src/entrance.mjs','./src/learn.mjs','./src/guide.mjs','./src/illustrations.mjs','./src/site.mjs','./src/cameras.mjs','./src/exposure.mjs','./src/capture.mjs','./src/metadata.mjs','./src/render.mjs','./src/reseau.mjs','./src/state.mjs'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok && new URL(event.request.url).pathname.startsWith(new URL(self.registration.scope).pathname)){
      const copy=response.clone(); event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,copy)));
    }
    return response;
  }).catch(async()=>{
    const cached = await caches.match(event.request);
    if (cached) return cached;
    // Guide chapters and camera selections live in the URL query. Reuse their shell offline.
    if (event.request.mode === 'navigate') {
      const url = new URL(event.request.url); url.search = ''; url.hash = '';
      const shell = await caches.match(url.href);
      if (shell) return shell;
    }
    return Response.error();
  }));
});
