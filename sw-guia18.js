/* Guia BPF - cache offline + ajustes compactos de interface (06/11/2026) */
const CACHE='guia18-menu-v29-bpf20261106-compacto';
const ROOT=new URL('./',self.location.href);
const CORE=['./','./index.html','./manifest.webmanifest','./icon-bpf-192.png','./icon-bpf-512.png','./menu-bpf-compacto.js'];
const IS_GUIDE=url=>/\/(?:individual|equipe)\.html$/i.test(url.pathname);
async function patchGuide(response,url){
  if(!IS_GUIDE(url)||!response||!response.ok)return response;
  const original=await response.text();
  const script='<script src="./menu-bpf-compacto.js?v=20261106-menu1" defer></script>';
  const patched=original.includes('menu-bpf-compacto.js')?original:original.replace(/<\/body\s*>/i,script+'</body>');
  const headers=new Headers(response.headers);
  headers.delete('content-length');headers.delete('content-encoding');headers.delete('etag');
  headers.set('content-type','text/html; charset=utf-8');
  return new Response(patched,{status:response.status,statusText:response.statusText,headers});
}
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('guia18-menu-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
  event.respondWith((async()=>{
    try{
      const network=await fetch(request);
      const response=await patchGuide(network,url);
      if(response.ok){
        const copy=response.clone();
        event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));
      }
      return response;
    }catch(error){
      const cached=await caches.match(request,{ignoreSearch:true});
      return cached?patchGuide(cached,url):Response.error();
    }
  })());
});
