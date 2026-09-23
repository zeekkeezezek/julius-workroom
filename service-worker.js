const CACHE_NAME='julius-workroom-v1-5-1-manual-work-log';
const APP_SHELL=[
  './','./index.html','./manifest.json','./firebase-config.js','./cloud-sync.js?v=1.5.1','./schema.js?v=1.5.1','./work-ui.js?v=1.5.1',
  './assets/julius/01_neutral.png','./assets/julius/02_smile.png','./assets/julius/03_focused.png',
  './assets/julius/04_concerned.png','./assets/julius/05_blushing.png','./assets/julius/06_happy.png',
  './assets/icons/icon-180.png','./assets/icons/icon-192.png','./assets/icons/icon-512.png',
  './assets/icons/nav/home.svg','./assets/icons/nav/folder.svg','./assets/icons/nav/calendar.svg',
  './assets/icons/nav/activity.svg','./assets/icons/nav/book-open.svg','./assets/icons/nav/more-horizontal.svg'
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
