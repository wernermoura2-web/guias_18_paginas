/* Guia BPF — cache offline e menu de importação único (06/11/2026). */
const CACHE='guia18-menu-v31-bpf20261106-importar-unico';
const ROOT=new URL('./',self.location.href);
const CORE=['./','./index.html','./manifest.webmanifest','./icon-bpf-192.png','./icon-bpf-512.png','./importar-processos-unico.js'];
const IS_TEAM=url=>/\/(?:equipe|equipe_atualizado)\.html$/i.test(url.pathname);
async function equipeComBotaoUnico(response,url){
  if(!IS_TEAM(url)||!response||!response.ok)return response;
  const html=await response.text();
  const tag='<script src="./importar-processos-unico.js?v=20261106-1" defer></script>';
  const altered=html.includes('importar-processos-unico.js')?html:html.replace(/<\/body\s*>/i,tag+'</body>');
  const headers=new Headers(response.headers);
  headers.delete('content-length');headers.delete('content-encoding');headers.delete('etag');
  headers.set('content-type','text/html; charset=utf-8');
  return new Response(altered,{status:response.status,statusText:response.statusText,headers});
}
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('guia18-menu-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(req);
      const output=await equipeComBotaoUnico(response,url);
      if(output.ok){const copy=output.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)));}
      return output;
    }catch(e){
      const cached=await caches.match(req,{ignoreSearch:true});
      return cached?equipeComBotaoUnico(cached,url):Response.error();
    }
  })());
});
