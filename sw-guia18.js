/* Guia BPF: interface amigável e cache offline (06/11/2026). */
const CACHE='guia18-pcc-R-celulas-padrao-F-20261107-v19';
const ROOT=new URL('./',self.location.href);
const CORE=['./','./index.html','./manifest.webmanifest','./icon-bpf-appcc-192.png','./icon-bpf-appcc-512.png','./interface-guia-amigavel.js'];
const IS_GUIDE=url=>/\/(?:equipe|individual)(?:_atualizado)?\.html$/i.test(url.pathname);
async function attachFriendlyMenu(response,url){
  if(!IS_GUIDE(url)||!response||!response.ok)return response;
  const original=await response.text();
  const tag='<script src="./interface-guia-amigavel.js?v=20261107-identidade-f21" defer></script>';
  const altered=(original.includes('interface-guia-amigavel.js')?original:original.replace(/<\/body\s*>/i,tag+'</body>')).replace(/interface-guia-amigavel\.js(?:\?v=[^\"'<> ]*)?/g,'interface-guia-amigavel.js?v=20261107-R-padrao-F-v19');
  const headers=new Headers(response.headers);
  headers.delete('content-length');headers.delete('content-encoding');headers.delete('etag');
  headers.set('content-type','text/html; charset=utf-8');
  return new Response(altered,{status:response.status,statusText:response.statusText,headers});
}
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE.map(path=>new Request(new URL(path,ROOT),{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('guia18-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 event.respondWith((async()=>{
  try{
   const isHtml=req.mode==='navigate'||IS_GUIDE(url)||url.pathname===ROOT.pathname||url.pathname.endsWith('/index.html');
   const response=await fetch(req,isHtml?{cache:'reload'}:undefined);
   const page=await attachFriendlyMenu(response,url);
   if(page.ok){const copy=page.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)));}
   return page;
  }catch(e){
   const cached=await caches.match(req,{ignoreSearch:true});
   return cached?attachFriendlyMenu(cached,url):Response.error();
  }
 })());
});
