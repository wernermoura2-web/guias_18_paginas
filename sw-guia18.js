/* Guia BPF: interface amigável e cache offline (06/11/2026). */
const CACHE='guia18-20261109-obs-class-v91';
const ROOT=new URL('./',self.location.href);
const CORE=['./','./index.html','./manifest.webmanifest','./icon-bpf-appcc-192.png','./icon-bpf-appcc-512.png','./interface-guia-amigavel.js','./revisao-frases.html','./abrir-guia-corrigido.html','./revisao-orientacoes-apoio.js','./bpf-revisao-frases-ativa-20261107.js','./bpf-substituicao-campos-20261108.js','./bpf-f1-correcao-direta-20261108.js','./revisao-orientacoes-20261107.json','./bpf-f1-opcoes-visiveis.js','./individual_atualizado.html','./equipe_atualizado.html','./bpf-etiquetas-appcc-20261108.js','./bpf-correcao-f-pdf-v72.js','./bpf-fotos-somente-nc-20261109.js'];
const IS_GUIDE=url=>/\/(?:equipe|individual)(?:_atualizado)?\.html$/i.test(url.pathname);
async function attachFriendlyMenu(response,url){
  if(!IS_GUIDE(url)||!response||!response.ok)return response;
  const original=await response.text();
  const tag='<script src="./interface-guia-amigavel.js?v=20261107-identidade-f21" defer></script>';
  let altered=(original.includes('interface-guia-amigavel.js')?original:original.replace(/<\/body\s*>/i,tag+'</body>')).replace(/interface-guia-amigavel\.js(?:\?v=[^\"'<> ]*)?/g,'interface-guia-amigavel.js?v=20261109-export-completo-nc-v86');
  // Carregar revisão dos F antes do script que constrói os campos e as respostas.
  const anchor='</script><script>/* Shared by the browser forms and Acrobat.';
  const active='<script src="./bpf-revisao-frases-ativa-20261107.js?v=20261108-f1-nativo-v58"></script>';
  if(!altered.includes('bpf-revisao-frases-ativa-20261107.js')){
    altered=altered.includes(anchor)
      ?altered.replace(anchor,'</script>'+active+'<script>/* Shared by the browser forms and Acrobat.')
      :altered.replace(/<\/body\s*>/i,active+'</body>');
  }
  altered=altered.replace(/bpf-revisao-frases-ativa-20261107\.js(?:\?v=[^"'<> ]*)?/g,'bpf-revisao-frases-ativa-20261107.js?v=20261108-F1-subcriterios-restaurados-v59');
  // Corrigir rótulos das verificações existentes dentro de F1 (nenhuma nova frase F).
  // A descrição legal de cada item e as respostas salvas permanecem inalteradas.
  const F1_LABELS=[
    ["'4.10.1':['Implementação','Documentação']","'4.10.1':['Implementação do controle de qualidade','Documentação do controle de qualidade (manual, POPs, métodos e registros)']"],
    ["'4.11.1':['Supervisão','Capacitação']","'4.11.1':['Supervisão dos manipuladores','Capacitação periódica dos manipuladores']"],
    ["'4.11.3':['Curso de 40h com até 2 anos','Curso de 40h com mais de 2 anos']","'4.11.3':['Capacitação de 40 horas — curso concluído há até 2 anos','Capacitação de 40 horas — curso concluído há mais de 2 anos (conferir atualização)']"],
    ["'Certificado do responsável pela industrialização'","'Certificado de capacitação do responsável pela industrialização (data, carga horária e conteúdo)'"],
    ["'4.10.1':'F1 — Controle de qualidade'","'4.10.1':'F1 — Implementação e documentação do controle de qualidade'"],
    ["'4.11.1':'F1 — Supervisão e Capacitação'","'4.11.1':'F1 — Supervisão e capacitação periódica'"],
    ["'4.11.3':'F1 — Curso de capacitação'","'4.11.3':'F1 — Capacitação de 40 horas e curso há mais de 2 anos'"],
    ["'4.11.4':'F1 — Certificados de capacitação'","'4.11.4':'F1 — Certificados dos manipuladores e do responsável pela industrialização'"]
  ];
  for(const [before,after] of F1_LABELS)if(altered.includes(before))altered=altered.replace(before,after);
  const direct='<script defer src="./bpf-f1-correcao-direta-20261108.js?v=20261108-direto-v60"></script>';
  if(!altered.includes('bpf-f1-correcao-direta-20261108.js'))altered=altered.replace(/<\/head\s*>/i,direct+'</head>');
  // Garantia visual: opções selecionáveis dentro dos F1, também após reabrir o editor.
  const f1Visible='<script src="./bpf-f1-opcoes-visiveis.js?v=20261107-F1-visivel-v59" defer></script>';
  if(!altered.includes('bpf-f1-opcoes-visiveis.js'))altered=altered.replace(/<\/body\s*>/i,f1Visible+'</body>');

  // Aplicar também aos acessos diretos equipe.html / individual.html:
  // navegador e PDF editável devem receber o mesmo complemento.
  const upperTag='<script defer src="./bpf-etiquetas-appcc-20261108.js?v=20261109-export-completo-nc-v86"></script>';
  const fFixTag='<script defer src="./bpf-correcao-f-pdf-v72.js?v=20261109-export-completo-nc-v86"></script>';
  if(!altered.includes('bpf-etiquetas-appcc-20261108.js'))altered=altered.replace('</body>',upperTag+'</body>');
  if(!altered.includes('bpf-correcao-f-pdf-v72.js'))altered=altered.replace('</body>',fFixTag+'</body>');
  // Normalizar também URLs já inseridas ou recuperadas do cache anterior.
  altered=altered.replace(/bpf-etiquetas-appcc-20261108\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-etiquetas-appcc-20261108.js?v=20261109-export-completo-nc-v86');
  altered=altered.replace(/bpf-correcao-f-pdf-v72\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-correcao-f-pdf-v72.js?v=20261109-export-completo-nc-v86');
  // Em ambos os modos, fotos nos F com SIM ou NÃO: SIM dispensa OBS; NÃO exige NC.
  const photoTag='<script defer src="./bpf-fotos-somente-nc-20261109.js?v=20261109-fotos-sim-nao-v90"></script>';
  if(!altered.includes('bpf-fotos-somente-nc-20261109.js'))altered=altered.replace(/<\/body\s*>/i,photoTag+'</body>');
  altered=altered.replace(/bpf-fotos-somente-nc-20261109\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-fotos-somente-nc-20261109.js?v=20261109-fotos-sim-nao-v90');

  // v91: SIM com OBS mantém prefixo SIM; sem marcação, somente OBS; classificação sem BPF/APPCC.
  // O texto OBS pode ser digitado antes de marcar SIM.
  const OBS_F_PATCHES=[["entries.push(panel.label+' — '+bpfAnswerLabel(answer)+' ('+options.join(', ')+')'+(note?': '+bpfObservationMarker(answer,panel.entries)+note:''));","if(answer==='1'){\n     if(note)entries.push(panel.label+' — SIM ('+options.join(', ')+') — '+bpfObservationMarker(answer,panel.entries)+note);\n    }else entries.push(panel.label+' — '+bpfAnswerLabel(answer)+' ('+options.join(', ')+')'+(note?': '+bpfObservationMarker(answer,panel.entries)+note:''));"],["entries.push(panel.label+' — '+label+(units.length?' ('+units.join(', ')+')':'')+(note?': '+bpfObservationMarker(answer,selected)+note:''));","if(answer==='1'){\n    if(note)entries.push(panel.label+' — SIM'+(units.length?' ('+units.join(', ')+')':'')+' — '+bpfObservationMarker(answer,selected)+note);\n   }else entries.push(panel.label+' — '+label+(units.length?' ('+units.join(', ')+')':'')+(note?': '+bpfObservationMarker(answer,selected)+note:''));"],["entries.push(panel.label+' — '+bpfAnswerLabel(answer)+' ('+checks.join(', ')+')'+(note?'; '+bpfObservationMarker(answer,matched)+note:'')+(other?'; Outro: '+other:''));","if(answer==='1'){\n   if(note)entries.push(panel.label+' — SIM ('+checks.join(', ')+')'+(note?'; '+bpfObservationMarker(answer,matched)+note:'')+(other?'; Outro: '+other:''));\n  }else entries.push(panel.label+' — '+bpfAnswerLabel(answer)+' ('+checks.join(', ')+')'+(note?'; '+bpfObservationMarker(answer,matched)+note:'')+(other?'; Outro: '+other:''));"],["area.disabled=!answer||answer==='2';","area.disabled=answer==='2';"],["area.dataset.note=!area.disabled?bpfGroupNoteName(page,row,panel,answer):'';","area.dataset.note=!area.disabled?bpfGroupNoteName(page,row,panel,answer==='0'?'0':'1'):'';"],["area.oninput=()=>{if(!answer||answer==='2')return;values[bpfGroupNoteName(page,row,panel,answer)]=area.value;bpfUnifiedApply(page,row,panel);changed();};","area.oninput=()=>{if(answer==='2')return;values[bpfGroupNoteName(page,row,panel,answer==='0'?'0':'1')]=area.value;bpfUnifiedApply(page,row,panel);changed();};"],["'OBS — observação única das opções marcadas Sim'","'OBS — observação livre do F (opcional)'"],["area.value=answer?String(values[area.dataset.note]||''):'';","area.value=!area.disabled?String(values[area.dataset.note]||''):'';"],["(classes.length?' (BPF/APPCC: '+classes.join(' / ')+')':'')","(classes.length?' ('+classes.join(' / ')+')':'')"]];
  // Evitar reaplicar o patch ao HTML já transformado e recuperado do cache offline.
  if(!altered.includes('bpf-obs-f-v91')&&!altered.includes(OBS_F_PATCHES[0][1])){
    let obsFApplied=0;
    for(const [source,target] of OBS_F_PATCHES){
      if(altered.includes(source)){altered=altered.replace(source,target);obsFApplied++;}
    }
    if(obsFApplied===OBS_F_PATCHES.length)
      altered=altered.replace(/<\/head\s*>/i,'<meta name="bpf-obs-f-v91" content="1"></head>');
    else console.warn('OBS do F: ',obsFApplied,'de',OBS_F_PATCHES.length,'ajustes aplicados');
  }
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
