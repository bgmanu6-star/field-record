/* Field Record service worker – offline app shell + CDN library cache */
const VER='field-record-v12';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const CDN_HOSTS=['cdn.jsdelivr.net','www.gstatic.com','tessdata.projectnaptha.com','unpkg.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // network-first for the page so updates arrive, cache fallback offline
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(VER).then(c=>c.put(req,cp));return r}).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
    return;
  }
  if(CDN_HOSTS.includes(url.hostname)){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{const cp=r.clone();caches.open(VER).then(c=>c.put(req,cp));return r})));
  }
  // Firestore / auth traffic goes straight to network (Firestore SDK handles its own offline queue)
});
