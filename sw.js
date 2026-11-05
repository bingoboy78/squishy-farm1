'use strict';
const ROOT=new URL('./',self.location.href).href;
const PREFIX='squishy-farm:'+ROOT+':';
const CACHE=PREFIX+'2026-11-05-v3-bonus';
const FILES=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png'];
const URLS=FILES.map(p=>new URL(p,ROOT).href);
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(URLS.map(url=>new Request(url,{cache:'reload'})))));
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
 })());
});
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||!request.url.startsWith(ROOT))return;
 if(request.mode==='navigate'){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),3500);
   try{
    const response=await fetch(request,{signal:controller.signal,cache:'no-store'});
    if(response.ok)return response;
    return await cache.match(new URL('index.html',ROOT).href)||response;
   }catch{return await cache.match(new URL('index.html',ROOT).href)||Response.error();}
   finally{clearTimeout(timeout);}
  })());return;
 }
 if(URLS.includes(url.href))event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
});
