/* Same-origin app shell caching only. No user photos, imported files or external sites. */
const REVISION = '';
const CACHE = 'camera-archive-gallery-' + (REVISION || 'development');
const SHELL = ['./','./index.html','./studio.html','./learn.html','./styles.css','./studio.css','./src/film.mjs','./manifest.webmanifest','./studio.webmanifest','./icons/icon.svg','./icons/apple-touch-icon.png','./demo-scene.jpg',...['apollo-body','apollo-flag','apollo-boulder','leica-body','leica-context','leica-skegness','leica-exposure','rolleiflex-body','rolleiflex-context','rolleiflex-exposure','sx70-body','sx70-folded','sx70-context','sx70-exposure'].map(name=>'./collection/'+name+'.webp'),'./src/app.mjs','./src/body-controls.mjs','./src/collection.mjs',...['apollo','leica','rolleiflex','sx70'].map(id=>'./src/collection/'+id+'.mjs'),'./src/entrance.mjs','./src/learn.mjs','./src/guide.mjs','./src/illustrations.mjs','./src/site.mjs','./src/cameras.mjs','./src/exposure.mjs','./src/capture.mjs','./src/metadata.mjs','./src/render.mjs','./src/reseau.mjs','./src/state.mjs'];
const shellRequests = SHELL.map(url => {
  const versioned = REVISION && /\.(?:mjs|css)$/.test(url) ? url + '?v=' + REVISION : url;
  return new Request(versioned, {cache: 'reload'});
});
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(c => c.addAll(shellRequests)).then(()=>self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('camera-archive-gallery-') && k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const options = event.request.mode === 'navigate' ? {cache: 'no-cache'} : undefined;
  event.respondWith(fetch(event.request,options).then(response=>{
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
