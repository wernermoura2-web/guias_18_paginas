#!/usr/bin/env python3
"""Menu para revisão de todas as frases F e orientações ao inspetor.

Mantém o texto original imutável, permite edições por processo/item/F,
restaura uma frase ou todas e exporta/importa revisões entre os modos.
"""
from pathlib import Path
import json,re,subprocess

MENU_JS=r"""
/* Revisão das frases dos inspetores: originais preservados e edições portáteis. */
const BPF_INSPECTOR_STORAGE='guia-bpf-revisao-inspetores-v1';
const BPF_INSPECTOR_ENTRIES=[];
const BPF_INSPECTOR_BY_KEY=new Map();
for(const page of BPF_PHRASES)for(const row of page.rows){
 const max=Math.max(row.phrases.length,...row.scopes.map(s=>s.phrases.length));
 for(let i=0;i<max;i++){
  const variants=new Map();
  for(const scope of row.scopes){
   const phrase=scope.phrases[i];if(!phrase)continue;
   const fingerprint=JSON.stringify([phrase.text||'',phrase.guidance||'']);
   if(!variants.has(fingerprint))variants.set(fingerprint,[]);
   variants.get(fingerprint).push({scope,phrase});
  }
  let k=0;
  for(const [fingerprint,collection]of variants){
   const [text,guidance]=JSON.parse(fingerprint),variant=++k;
   const key=page.page+'_'+row.code.replace(/[^0-9a-z]/gi,'_')+'_F'+(i+1)+'_V'+variant;
   const refs=collection.map(e=>e.phrase);
   const source=row.phrases[i];
   if(source&&String(source.text||'')===text&&String(source.guidance||'')===guidance)refs.push(source);
   const entry={key,page:page.page,code:row.code,index:i,label:'F'+(i+1),scopes:collection.map(e=>e.scope.col),
    appcc:collection[0].phrase.appcc||'',original:{text,guidance},refs};
   BPF_INSPECTOR_ENTRIES.push(entry);BPF_INSPECTOR_BY_KEY.set(key,entry);
  }
 }
}
let bpfInspectorLastApplied=null,bpfInspectorLocalChecked=false;
function bpfInspectorDecode(raw){
 if(!raw)return {};
 let data;try{data=JSON.parse(raw)}catch(e){return {}}
 if(!data||data.version!==1||!data.entries||typeof data.entries!=='object'||Array.isArray(data.entries))return {};
 const entries={};
 for(const [key,change]of Object.entries(data.entries)){
  const item=BPF_INSPECTOR_BY_KEY.get(key);
  if(!item||!change||typeof change!=='object')continue;
  if(typeof change.text!=='string'||typeof change.guidance!=='string')continue;
  if(change.text.length>10000||change.guidance.length>10000)continue;
  if(change.text!==item.original.text||change.guidance!==item.original.guidance)
   entries[key]={text:change.text,guidance:change.guidance};
 }
 return entries;
}
function bpfInspectorApplySaved(){
 if(!Object.hasOwn(values,'BPF_InspectorRevisions'))return;
 if(!bpfInspectorLocalChecked){
  bpfInspectorLocalChecked=true;
  if(!values.BPF_InspectorRevisions){
   try{const data=localStorage.getItem(BPF_INSPECTOR_STORAGE);if(data)values.BPF_InspectorRevisions=data}catch(e){}
  }
 }
 const raw=String(values.BPF_InspectorRevisions||'');
 if(raw===bpfInspectorLastApplied)return;
 const changes=bpfInspectorDecode(raw);
 for(const item of BPF_INSPECTOR_ENTRIES){
  const value=changes[item.key]||item.original;
  for(const target of item.refs){target.text=value.text;target.guidance=value.guidance;}
 }
 bpfInspectorLastApplied=raw;
}
function bpfInspectorPack(entries){
 return JSON.stringify({format:'guia-bpf-revisao-inspetores',version:1,entries});
}
function bpfInspectorApplyEntries(entries){
 const normalized=bpfInspectorDecode(bpfInspectorPack(entries));
 values.BPF_InspectorRevisions=Object.keys(normalized).length?bpfInspectorPack(normalized):'';
 bpfInspectorApplySaved();
 try{
  if(values.BPF_InspectorRevisions)localStorage.setItem(BPF_INSPECTOR_STORAGE,values.BPF_InspectorRevisions);
  else localStorage.removeItem(BPF_INSPECTOR_STORAGE);
 }catch(e){}
 return Object.keys(normalized).length;
}
function bpfInspectorOpenReview(){
 if(!bpfDismissEditor())return;
 bpfInspectorApplySaved();
 document.querySelector('#bpf-inspector-review')?.remove();
 const pending=bpfInspectorDecode(values.BPF_InspectorRevisions);
 const dlg=document.createElement('section');dlg.id='bpf-inspector-review';dlg.setAttribute('role','dialog');
 dlg.setAttribute('aria-modal','true');dlg.setAttribute('aria-label','Revisão das frases e orientações ao inspetor');
 const styleId='bpf-inspector-review-style';
 if(!document.getElementById(styleId)){
  const style=document.createElement('style');style.id=styleId;
  style.textContent='#bpf-inspector-review{position:fixed;inset:10px 2.5%;z-index:99999;overflow:auto;padding:18px 18px 28px;background:#f6fafc;color:#1b3645;border:2px solid #407693;border-radius:13px;box-shadow:0 0 0 200vmax #102d40b5;font:15px Arial,sans-serif;box-sizing:border-box}#bpf-inspector-review .bpf-review-actions{display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin:12px 0}#bpf-inspector-review button,#bpf-inspector-review select,#bpf-inspector-review input{font:inherit;padding:9px;border-radius:7px}#bpf-inspector-review button{background:#0b608c;color:white;border:0;cursor:pointer}#bpf-inspector-review .danger{background:#a64637}#bpf-inspector-review .secondary{background:#e9f0f4;color:#1b3645;border:1px solid #95aab7}#bpf-inspector-review .review-card{background:white;border:1px solid #c0d1dc;border-radius:10px;padding:14px;margin:14px 0}#bpf-inspector-review .review-card h3{margin:0 0 12px;font-size:16px}#bpf-inspector-review .review-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}#bpf-inspector-review .review-label{font-weight:700;margin:9px 0 5px}#bpf-inspector-review .review-original{white-space:pre-wrap;overflow-wrap:anywhere;min-height:54px;background:#edf4f8;border:1px solid #d1dce2;border-radius:6px;padding:9px;font-size:14px;line-height:1.4}#bpf-inspector-review textarea{display:block;width:100%;min-height:76px;resize:vertical;border:1px solid #a8bcc8;border-radius:6px;padding:9px;box-sizing:border-box;font:14px/1.4 Arial,sans-serif}#bpf-inspector-review .review-help{font-size:13px;color:#405867;line-height:1.45}#bpf-inspector-review .review-count{font-weight:600}#bpf-inspector-review .review-card .secondary{font-size:13px}#bpf-inspector-review .review-filter{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}#bpf-inspector-review .review-filter>*{min-width:180px;flex:1}#bpf-inspector-review input[type=checkbox]{min-width:auto;flex:none}body.bpf-review-open{overflow:hidden}@media(max-width:700px){#bpf-inspector-review{inset:3px;padding:12px}#bpf-inspector-review .review-cols{grid-template-columns:1fr}#bpf-inspector-review .review-filter>*{min-width:100%}}';
  document.head.appendChild(style);
 }
 const h=document.createElement('h2');h.textContent='Revisão das frases e orientações ao inspetor';dlg.append(h);
 const description=document.createElement('p');description.className='review-help';description.textContent='Edite o texto das frases F e as orientações utilizadas nas telas de inspeção. A versão original permanece disponível para comparação. As classificações APPCC, as respostas e os cálculos não são alterados. As orientações ao inspetor continuam fora do anexo PDF.';dlg.append(description);
 const top=document.createElement('div');top.className='bpf-review-actions';dlg.append(top);
 const count=document.createElement('span');count.className='review-count';top.append(count);
 const save=document.createElement('button');save.textContent='Salvar revisões';top.append(save);
 const download=document.createElement('button');download.textContent='Baixar revisões JSON';download.className='secondary';top.append(download);
 const upload=document.createElement('button');upload.textContent='Importar revisões';upload.className='secondary';top.append(upload);
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.style.display='none';dlg.append(input);
 const restoreAll=document.createElement('button');restoreAll.textContent='Retornar tudo ao original';restoreAll.className='danger';top.append(restoreAll);
 const cancel=document.createElement('button');cancel.textContent='Fechar';cancel.className='secondary';top.append(cancel);
 const filters=document.createElement('div');filters.className='review-filter';dlg.append(filters);
 const process=document.createElement('select');process.setAttribute('aria-label','Filtrar por processo');
 const all=document.createElement('option');all.value='';all.textContent='Todos os processos';process.append(all);
 const used=[...new Set(BPF_INSPECTOR_ENTRIES.map(e=>e.page))];
 for(const page of used){
  const opt=document.createElement('option');opt.value=String(page);opt.textContent=(page+1)+' — '+(titles[page]||'Processo '+page);
  process.append(opt);
 }
 process.value='0';filters.append(process);
 const find=document.createElement('input');find.type='search';find.placeholder='Buscar item, F ou texto';find.setAttribute('aria-label','Buscar frases');filters.append(find);
 const changedOnly=document.createElement('label');changedOnly.style.cssText='display:flex;align-items:center;gap:6px';const ck=document.createElement('input');ck.type='checkbox';changedOnly.append(ck,document.createTextNode('Somente alteradas'));filters.append(changedOnly);
 const list=document.createElement('div');dlg.append(list);
 function actual(item){return pending[item.key]||item.original;}
 function updateCount(){
  count.textContent=Object.keys(pending).length+' frase(s) revisada(s) de '+BPF_INSPECTOR_ENTRIES.length;
 }
 function update(item,field,value){
  const candidate={...actual(item),[field]:value};
  if(candidate.text===item.original.text&&candidate.guidance===item.original.guidance)delete pending[item.key];
  else pending[item.key]=candidate;
  updateCount();
 }
 function render(){
  list.replaceChildren();
  const keyword=find.value.trim().toLocaleLowerCase('pt-BR'),pageFilter=process.value;
  const filtered=BPF_INSPECTOR_ENTRIES.filter(e=>
   (!pageFilter||String(e.page)===pageFilter)&&(!ck.checked||!!pending[e.key])&&
   (!keyword||[e.code,e.label,titles[e.page]||'',e.original.text,e.original.guidance,actual(e).text,actual(e).guidance].some(x=>String(x).toLocaleLowerCase('pt-BR').includes(keyword))));
  const info=document.createElement('p');info.className='review-help';info.textContent=filtered.length+' frase(s) exibida(s). Escolha o processo ou busque o item para revisar todos os Fs.';list.append(info);
  for(const entry of filtered){
   const card=document.createElement('article');card.className='review-card';
   const head=document.createElement('h3');head.textContent=(titles[entry.page]||'Processo')+' | Item '+entry.code+' | '+entry.label+
    (entry.scopes.length>1?' — '+entry.scopes.map(x=>bpfScopeLabel({page:entry.page},{col:x})).join(', '):entry.scopes.length===1?' — '+bpfScopeLabel({page:entry.page},{col:entry.scopes[0]}):'')+
    ' | '+entry.appcc+(pending[entry.key]?' | Revisado':'');card.append(head);
   const cols=document.createElement('div');cols.className='review-cols';
   for(const [field,titleText]of [['text','Texto da frase F'],['guidance','Orientação ao inspetor']]){
    const left=document.createElement('section');
    const lo=document.createElement('p');lo.className='review-label';lo.textContent=titleText+' — ORIGINAL';left.append(lo);
    const orig=document.createElement('div');orig.className='review-original';orig.textContent=entry.original[field]||'(sem texto original)';left.append(orig);
    const right=document.createElement('section');
    const lc=document.createElement('p');lc.className='review-label';lc.textContent=titleText+' — EDITÁVEL';right.append(lc);
    const area=document.createElement('textarea');area.value=actual(entry)[field];area.setAttribute('aria-label',entry.code+' '+entry.label+' '+titleText);
    area.oninput=()=>{update(entry,field,area.value);head.textContent=head.textContent.replace(/\s*\|\s*Revisado$/,'')+(pending[entry.key]?' | Revisado':'');};
    right.append(area);cols.append(left,right);
   }
   card.append(cols);
   const restore=document.createElement('button');restore.type='button';restore.className='secondary';restore.textContent='Restaurar original deste F';
   restore.onclick=()=>{delete pending[entry.key];updateCount();render();};card.append(restore);
   list.append(card);
  }
  updateCount();
 }
 function close(){document.body.classList.remove('bpf-review-open');dlg.remove();}
 process.onchange=render;find.oninput=render;ck.onchange=render;
 save.onclick=()=>{
  const total=bpfInspectorApplyEntries(pending);
  changed();recalc();
  document.querySelector('#status').textContent=total+' revisões salvas. Use Salvar arquivo para guardar no JSON ou Baixar revisões JSON para compartilhar.';
  close();
 };
 cancel.onclick=()=>{
  if(JSON.stringify(pending)!==JSON.stringify(bpfInspectorDecode(values.BPF_InspectorRevisions))&&!confirm('Descartar as revisões ainda não salvas?'))return;
  close();
 };
 restoreAll.onclick=()=>{if(!confirm('Restaurar os textos originais de TODOS os Fs e orientações ao inspetor?'))return;for(const key of Object.keys(pending))delete pending[key];render();};
 download.onclick=()=>{
  const raw=bpfInspectorPack(bpfInspectorDecode(bpfInspectorPack(pending)));
  const blob=new Blob([raw],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='Guia_BPF_Revisao_Frases_Inspetores.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),8000);
 };
 upload.onclick=()=>input.click();
 input.onchange=async()=>{
  const file=input.files?.[0];if(!file)return;
  try{
   const raw=JSON.parse(await file.text());
   if(raw.format!=='guia-bpf-revisao-inspetores'||raw.version!==1||typeof raw.entries!=='object')throw Error('Formato incorreto');
   const imported=bpfInspectorDecode(JSON.stringify(raw));
   if(!confirm('Substituir as revisões em edição pelas '+Object.keys(imported).length+' revisões do arquivo?'))return;
   for(const key of Object.keys(pending))delete pending[key];
   Object.assign(pending,imported);render();
  }catch(e){alert('Arquivo de revisão inválido: '+e.message);}
  finally{input.value='';}
 };
 document.body.append(dlg);document.body.classList.add('bpf-review-open');render();dlg.scrollTop=0;
}
function bpfInspectorInstallMenu(){
 const existing=document.querySelector('#bpf-inspector-menu');
 if(existing)return;
 const button=document.createElement('button');button.type='button';button.id='bpf-inspector-menu';
 button.textContent='Revisar frases dos inspetores';button.title='Comparar versões originais, editar todos os Fs e restaurar textos';
 button.onclick=bpfInspectorOpenReview;
 const ref=document.querySelector('#save')||document.querySelector('#print');
 if(ref)ref.after(button);
 if(location.hash==='#revisar-inspetores')setTimeout(()=>button.click(),100);
}
"""
for filename in ("individual.html","equipe.html"):
 p=Path(filename)
 h=p.read_text(encoding="utf-8")
 assert h.count("function bpfInitFields(data){")==1,(filename,"init fields")
 assert h.count("function bpfMountDescriptions(){")==1,(filename,"mount")
 assert h.count("function recalc(){")==1,(filename,"recalc")
 assert h.count("function bpfInspectorOpenReview(){")==0,(filename,"already modified")
 # Inspector utilities placed before phrase field initialization. They use values at run time only.
 h=h.replace("function bpfInitFields(data){",MENU_JS+"\nfunction bpfInitFields(data){",1)
 h=h.replace("function bpfInitFields(data){data.fields.BPF_NCGenerated=",
    "function bpfInitFields(data){data.fields.BPF_InspectorRevisions={name:'BPF_InspectorRevisions',type:'/Tx',flags:0,label:'Revisões das frases e orientações ao inspetor',options:[],calc:''};data.fields.BPF_NCGenerated=",1)
 assert "data.fields.BPF_InspectorRevisions" in h
 h=h.replace("function recalc(){","function recalc(){bpfInspectorApplySaved();",1)
 h=h.replace("function bpfMountDescriptions(){","function bpfMountDescriptions(){bpfInspectorInstallMenu();",1)
 assert h.count("function bpfInspectorOpenReview(){")==1
 assert h.count("function bpfInspectorApplySaved(){")==1
 assert h.count("function bpfInspectorInstallMenu(){")==1
 assert h.count("function recalc(){bpfInspectorApplySaved();")==1
 assert h.count("function bpfMountDescriptions(){bpfInspectorInstallMenu();")==1
 assert h.count("data.fields.BPF_InspectorRevisions")==1
 assert h.count("function bpfPdfGeneralSplit(full,font,form,pdf){")==1
 assert h.count("async function bpfAppendCompactAnnex(pdf){")==1
 assert h.count("function bpfUnifiedRow(row){")==1
 # The official phrase collection must not be modified by the patch; user revisions are separate.
 marker="const BPF_PHRASES="
 pos=h.index(marker)+len(marker)
 data,_=json.JSONDecoder().raw_decode(h[pos:])
 assert len(data)>=13 and any(r["code"]=="4.10.3" for pg in data for r in pg["rows"])
 for token in ("function bpfInitFields(data){","function recalc(){","function bpfMountDescriptions(){"):
  at=h.index(token);start=h.rfind("<script",0,at);start=h.index(">",start)+1;end=h.index("</script>",at)
  r=subprocess.run(["node","--check"],input=h[start:end],text=True,capture_output=True)
  assert r.returncode==0,(filename,token,r.stderr[:1700])
 p.write_text(h,encoding="utf-8")
 print("VALIDADO",filename,"menu principal de revisão de todas as frases e orientações, originais, edições, retorno, JSON e uso nas telas F; PDF preservado.")

idx=Path("index.html")
h=idx.read_text(encoding="utf-8")
anchor='<section><h2>PDFs anteriores de referência</h2>'
assert h.count(anchor)==1,"Menu inicial não encontrado"
block='''<section id="revisao-inspetores"><h2>Revisão das frases e orientações ao inspetor</h2><p>Consulte cada frase F original e sua orientação, edite os textos e restaure a versão original quando necessário. As revisões podem ser exportadas em JSON, compartilhadas e importadas nos dois modos de uso, sem alterar a classificação APPCC.</p><a href="individual.html?v=20261106-revisao-frases-inspetores#revisar-inspetores">Revisar no modo individual</a><a href="equipe.html?v=20261106-revisao-frases-inspetores#revisar-inspetores">Revisar no modo equipe</a></section>'''
h=h.replace(anchor,block+anchor,1)
h,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"#]+"',lambda m:'href="'+m.group(1)+'20261106-revisao-frases-inspetores"',h)
assert n==2,("Link count expected 2 primary links",n)
assert h.count("#revisar-inspetores")==2,"Revisão deve ter links nos dois modos"
idx.write_text(h,encoding="utf-8")

sw=Path("sw-guia18.js")
s=sw.read_text(encoding="utf-8")
s,n=re.subn(r"const CACHE='guia18-menu-[^']+';","const CACHE='guia18-menu-v23-bpf20261106-revisao-frases';",s)
assert n==1
sw.write_text(s,encoding="utf-8")
print("Menu inicial, links e cache atualizados.")
