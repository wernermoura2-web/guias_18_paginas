/* Guia BPF: interface amigável e cache offline (06/11/2026). */
const CACHE='guia18-20261108-F1-subcriterios-restaurados-v59';
const ROOT=new URL('./',self.location.href);
const CORE=['./','./index.html','./manifest.webmanifest','./icon-bpf-appcc-192.png','./icon-bpf-appcc-512.png','./interface-guia-amigavel.js','./revisao-frases.html','./revisao-orientacoes-apoio.js','./bpf-revisao-frases-ativa-20261107.js','./bpf-substituicao-campos-20261108.js','./revisao-orientacoes-20261107.json'];
const IS_GUIDE=url=>/\/(?:equipe|individual)(?:_atualizado)?\.html$/i.test(url.pathname);
async function attachFriendlyMenu(response,url){
  if(!IS_GUIDE(url)||!response||!response.ok)return response;
  const original=await response.text();
  const tag='<script src="./interface-guia-amigavel.js?v=20261107-identidade-f21" defer></script>';
  let altered=(original.includes('interface-guia-amigavel.js')?original:original.replace(/<\/body\s*>/i,tag+'</body>')).replace(/interface-guia-amigavel\.js(?:\?v=[^\"'<> ]*)?/g,'interface-guia-amigavel.js?v=20261108-F1-formulario-v58');
  // Carregar revisão dos F antes do script que constrói os campos e as respostas.
  const anchor='</script><script>/* Shared by the browser forms and Acrobat.';
  const active='<script src="./bpf-revisao-frases-ativa-20261107.js?v=20261108-F1-subcriterios-restaurados-v59"></script>';
  if(!altered.includes('bpf-revisao-frases-ativa-20261107.js')){
    altered=altered.includes(anchor)
      ?altered.replace(anchor,'</script>'+active+'<script>/* Shared by the browser forms and Acrobat.')
      :altered.replace(/<\/body\s*>/i,active+'</body>');
  }
  altered=altered.replace(/bpf-revisao-frases-ativa-20261107\.js(?:\?v=[^"'<> ]*)?/g,'bpf-revisao-frases-ativa-20261107.js?v=20261108-F1-subcriterios-restaurados-v59');
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
