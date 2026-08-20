const CACHE_NAME='julius-workroom-v1-2-1-configured';
const APP_SHELL=[
  './','./index.html','./manifest.json','./firebase-config.js','./cloud-sync.js',
  './assets/julius/normal.png','./assets/julius/soft.png','./assets/julius/stern.png','./assets/julius/think.png',
  './assets/icons/icon-180.png','./assets/icons/icon-192.png','./assets/icons/icon-512.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('julius-workroom-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{let copy=response.clone();caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy));return response}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response&&response.status===200&&response.type==='basic'){let copy=response.clone();caches.open(CACHE_NAME).then(c=>c.put(event.request,copy))}return response})))
});
