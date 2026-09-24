const CACHE='mff-shell-v20-final';
const SHELL=[
  './index.html','./shell.css','./config.js','./data-safety.js',
  './money/index.html','./money/daily.html','./money/monthly.html',
  './bookshelf/index.html','./profile/index.html','./settings/index.html',
  './portfolio/index.html','./portfolio/dashboard.html','./portfolio/auth-open.js',
  './portfolio/manifest.json','./manifest.json'
];
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    for(const u of SHELL){try{await c.add(u);}catch(_){}}
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin!==location.origin || e.request.method!=='GET')return;
  e.respondWith((async()=>{
    try{
      const r=await fetch(e.request);
      if(r.ok){const c=await caches.open(CACHE);c.put(e.request,r.clone()).catch(()=>{});}
      return r;
    }catch(_){
      const hit=await caches.match(e.request);if(hit)return hit;
      throw _;
    }
  })());
});
