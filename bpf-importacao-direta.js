/* Consolidação de guias independentes. O código de equipe continua funcionando separadamente. */
(()=>{'use strict';
 const has=v=>typeof v==='string'&&v.trim()!==''&&v!=='Off';
 const norm=v=>String(v||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').toLowerCase();
 function compareIdentity(current,incoming,dateISO){
  const warnings=[];
  for(const name of ['ENVASADORA','DATA']){
   const convert=name==='DATA'?v=>dateISO(v)||norm(v):norm;
   if(has(current[name])&&has(incoming[name])&&convert(current[name])!==convert(incoming[name]))throw Error('A identificação diverge: '+name+'. Não é possível incorporar dados de outra inspeção.');
   if(!has(current[name])||!has(incoming[name]))warnings.push(name+' não informado em um dos arquivos.');
  }
  if(has(current['ENDEREÇO'])&&has(incoming['ENDEREÇO'])&&norm(current['ENDEREÇO'])!==norm(incoming['ENDEREÇO']))warnings.push('O endereço está escrito de forma diferente. Confira se é o mesmo estabelecimento.');
  return warnings;
 }
 function diffFields(current,incoming,names){
  return [...new Set(names)].filter(n=>has(incoming[n])&&current[n]!==incoming[n]).map(n=>({name:n,current:current[n]||'',incoming:incoming[n],conflict:has(current[n])}));
 }
 function applyFields(target,incoming,names,decision){
  if(decision==='skip')return;
  names=names.filter(n=>!['ENVASADORA','ENDEREÇO','DATA'].includes(n));
  const changes=diffFields(target,incoming,names);
  if(decision==='add'&&changes.some(x=>x.conflict))throw Error('Há divergências. Revise antes de escolher a versão recebida.');
  if(decision==='replace')for(const n of names)target[n]=incoming[n];
  else if(decision==='add')for(const x of changes)target[x.name]=x.incoming;
  else throw Error('Escolha de importação inválida.');
 }
 const core={has,norm,compareIdentity,diffFields,applyFields};
 if(typeof module!=='undefined'&&module.exports){module.exports=core;return;}
 if(window.BPFDirectImport)return;
 const active={queue:[],modal:null,busy:false};
 const make=(tag,text,attrs={})=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);return el;};
 function processFields(code){
  const pages=PROCESSES18[code].pages;
  return [...new Set([...(scopedFields18[code]||[]),...Object.keys(D.fields).filter(n=>pages.includes(D.fields[n].phrasePage))])].filter(n=>D.fields[n]&&!derived.has(n)&&!['ENVASADORA','ENDEREÇO','DATA'].includes(n)&&!(D.fields[n].type==='/Btn'&&D.fields[n].flags&65536)&&!/ATENDIDO|RISCO/i.test(D.fields[n].label||''));
 }
 function validImage(v){return typeof v==='string'&&/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=\s]+$/.test(v);}
 function galleryKind(n){if(BPF_GALLERY_SLOTS.includes(n)||bpfExtraPhotoPage(n))return 'photos';if(BPF_LABEL_SLOTS.includes(n)||/^Rotulo_Pagina_3_[1-3]$/.test(n)||bpfExtraLabelPage(n))return 'labels';return '';}
 function importGallery(next,pictures,incoming,kind,selected){
  const g=BPF_GALLERIES[kind];let count=bpfReadGalleryPages(kind,next,pictures),slots=bpfGallerySlotNames(count,kind),added=0;
  for(const name of selected){const data=incoming.images[name];if(galleryKind(name)!==kind||!validImage(data))continue;
   const prefixes=kind==='photos'?BPF_PHOTO_META:[];
   if(slots.some(n=>pictures[n]===data&&prefixes.every(p=>(next[p+n]||'')===(incoming.values[p+name]||''))))continue;
   let slot=slots.find(n=>!pictures[n]&&prefixes.every(p=>!has(next[p+n])));
   while(!slot){count++;if(count>100)throw Error('Quantidade de páginas de anexos acima do limite de conferência.');slots=bpfGallerySlotNames(count,kind);slot=slots.find(n=>!pictures[n]&&prefixes.every(p=>!has(next[p+n])));}
   pictures[slot]=data;for(const prefix of prefixes)if(has(incoming.values[prefix+name]))next[prefix+slot]=incoming.values[prefix+name];added++;
  }
  next[g.field]=String(count);return added;
 }
 const status=text=>{const el=document.querySelector('#status');if(el)el.textContent=text;};
 function close(){active.modal?.remove();active.modal=null;active.busy=false;active.queue=[];}
 function skip(){active.modal?.remove();active.modal=null;active.busy=false;nextFile();}
 const picker=make('input',undefined,{type:'file',accept:'.json,application/json',multiple:'',hidden:''});
 picker.onchange=()=>{if(active.busy||active.modal)return;active.queue=[...picker.files];picker.value='';nextFile();};document.body.append(picker);
 const css=make('style',`#bpf-direct-import{position:fixed;inset:0;background:#102c3c99;z-index:20000;overflow:auto;padding:12px;box-sizing:border-box;font:16px/1.45 Arial,sans-serif;color:#183f52}#bpf-direct-import .direct-box{margin:0 auto;max-width:760px;background:#fff;border-radius:16px;padding:16px;box-shadow:0 8px 24px #163e5530}#bpf-direct-import h2{margin:0 0 12px;font-size:21px}#bpf-direct-import p{margin:8px 0}#bpf-direct-import .direct-card{border:1px solid #c9dce5;border-radius:12px;padding:12px;margin:12px 0;overflow-wrap:anywhere}#bpf-direct-import .direct-card h3{font-size:16px;margin:0 0 8px}#bpf-direct-import select,#bpf-direct-import button{box-sizing:border-box;min-height:44px;max-width:100%;font:inherit;padding:8px 12px;border:1px solid #afc9d7;border-radius:8px;background:white;color:#183f52}#bpf-direct-import select{display:block;width:100%;margin:8px 0}#bpf-direct-import summary{cursor:pointer;padding:8px 0;font-weight:700}#bpf-direct-import .direct-diff{border-top:1px solid #dce9ef;padding:8px 0}#bpf-direct-import .direct-diff strong{display:block}#bpf-direct-import pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;margin:4px 0}#bpf-direct-import .direct-warn{background:#fff3d9;border-left:4px solid #d49a26;padding:8px 12px}#bpf-direct-import label{display:flex;gap:8px;align-items:center;min-height:44px}#bpf-direct-import input[type=checkbox]{width:20px;height:20px;flex:none}#bpf-direct-import .direct-actions{position:sticky;bottom:0;display:flex;flex-wrap:wrap;gap:8px;padding:12px 0 0;background:white;border-top:1px solid #dce9ef}#bpf-direct-import .direct-primary{background:#087aaa;color:white;font-weight:700;flex:1}#bpf-direct-import img{width:66px;height:66px;object-fit:contain}#bpf-direct-import .direct-image{border-top:1px solid #dce9ef;padding:4px 0}`);document.head.append(css);
 function showDiff(parent,diffs){
  const d=make('details');d.append(make('summary','Ver dados e diferenças ('+diffs.length+')'));
  for(const x of diffs){const box=make('div',undefined,{class:'direct-diff'});const title=D.fields[x.name]?.label||x.name;
   box.append(make('strong',title+(x.conflict?' — divergência':'')),make('p','Seu guia:'),make('pre',has(x.current)?x.current:'(em branco)'),make('p','Arquivo do colega:'),make('pre',x.incoming));d.append(box);}
  parent.append(d);
 }
 function card(title){const el=make('section',undefined,{class:'direct-card'});el.append(make('h3',title));return el;}
 function choice(label,selected){const el=make('label');const input=make('input',undefined,{type:'checkbox'});input.checked=selected;el.append(input,document.createTextNode(label));return {el,input};}
 function checkSources(before,next,incoming,selected){
  const changed=sourceFields.some(n=>norm(before[n])!==norm(next[n]));
  if(changed)for(const p of ['4.2','4.3'])if(!selected.includes(p)&&processFields(p).some(n=>has(before[n])))throw Error('A identificação das captações mudou. Confira os vínculos de Condução/Reservatórios antes de importar a Captação.');
  if(selected.some(p=>p==='4.2'||p==='4.3'))for(const n of sourceFields)if(norm(incoming[n])!==norm(next[n]))throw Error('A posição ou o nome das fontes diverge. Confira a identificação das captações nos dois guias antes de importar Condução/Reservatórios.');
 }
 async function nextFile(){
  const file=active.queue.shift();if(!file)return;active.busy=true;
  try{
   document.activeElement?.blur();const raw=JSON.parse(await file.text());
   if(raw.format!=='guia-rev6-chrome'||raw.version!==1||!raw.values||typeof raw.values!=='object'||Array.isArray(raw.values))throw Error('Selecione um JSON de preenchimento salvo pelo Guia BPF/APPCC.');
   const incoming={values:parseValues18(raw.values),images:Object.fromEntries(Object.entries(raw.images||{}).filter(([n,v])=>galleryKind(n)&&validImage(v)))};
   const warnings=compareIdentity(values,incoming.values,bpfDateToISO),hash=await hashTeam18(await file.text());
   render(file,incoming,warnings,hash,snapshotTeam18());
  }catch(err){alert(file.name+': '+err.message);active.busy=false;nextFile();}
 }
 function render(file,incoming,warnings,hash,base){
  const modal=make('div',undefined,{id:'bpf-direct-import',role:'dialog','aria-modal':'true','aria-label':'Importação direta de arquivos'}),box=make('div',undefined,{class:'direct-box'});
  active.modal=modal;modal.append(box);document.body.append(modal);
  box.append(make('h2','Importar arquivos de colegas'),make('p','Arquivo: '+file.name),make('p','Seu guia: '+(values.ENVASADORA||'(não informada)')+' · '+(values.DATA||'(sem data)')+' · '+(values['ENDEREÇO']||'(sem endereço)')),make('p','Recebido: '+(incoming.values.ENVASADORA||'(não informada)')+' · '+(incoming.values.DATA||'(sem data)')+' · '+(incoming.values['ENDEREÇO']||'(sem endereço)')),make('p','A envasadora, o endereço e a data do seu guia serão preservados. A identificação recebida serve somente para conferência. O código da equipe não é necessário. Nenhuma alteração será feita até você confirmar.'));
  if(warnings.length)box.append(make('p',warnings.join(' '),{class:'direct-warn'}));
  const confirm=choice('Confirmo que este arquivo pertence à mesma inspeção.',false);box.append(confirm.el);
  const selections=[];
  for(const [code,meta]of Object.entries(PROCESSES18)){
   const names=processFields(code),diffs=diffFields(values,incoming.values,names);if(!diffs.length)continue;
   const conflicts=diffs.filter(x=>x.conflict).length,c=card(code+' — '+meta.label),select=make('select',undefined,{'aria-label':'Importação de '+meta.label});
   c.append(make('p',`${diffs.length-conflicts} novos campos · ${conflicts} divergências`));
   const opt=(value,label)=>{const o=make('option',label,{value});select.append(o);};opt('skip','Não importar este processo');
   if(!conflicts){opt('add','Acrescentar informações novas');select.value='add';}
   else{c.append(make('p','Há campos preenchidos de forma diferente. Compare as versões; a substituição abrange o processo inteiro e pode apagar campos que o colega deixou em branco.',{class:'direct-warn'}));opt('replace','Usar a versão recebida (substituir processo inteiro)');}
   const cleared=conflicts?names.filter(n=>has(values[n])&&!has(incoming.values[n])).map(n=>({name:n,current:values[n],incoming:'(em branco — seria apagado na substituição)',conflict:true})):[];
   showDiff(c,[...diffs,...cleared]);c.append(select);box.append(c);selections.push({code,names,select});
  }
  const docNames=Object.keys(D.fields).filter(n=>/^doc_legal_\d+_(situacao|atende|observacao)$/.test(n)),docDiff=diffFields(values,incoming.values,docNames),docChoices=[];
  if(docDiff.length){const c=card('Documentos legais e regulatórios');for(const x of docDiff){const ch=choice(D.fields[x.name]?.label||x.name,!x.conflict);c.append(ch.el);showDiff(c,[x]);docChoices.push({x,input:ch.input});}box.append(c);}
  const photoChoices=[];for(const kind of ['photos','labels']){const names=Object.keys(incoming.images).filter(n=>galleryKind(n)===kind);if(!names.length)continue;const c=card(kind==='photos'?'Fotos recebidas':'Rótulos recebidos');for(const n of names){const ch=choice(incoming.values['BPF_PhotoLocation_'+n]||n,true);ch.el.className='direct-image';const img=make('img',undefined,{src:incoming.images[n],alt:'Anexo recebido',loading:'lazy'});ch.el.append(img);c.append(ch.el);photoChoices.push({kind,name:n,input:ch.input});}box.append(c);}
  const respField='RESPONSÁVEIS PELA INSPEÇÃORow1',receivedResp=incoming.values[respField];let resp=null;
  if(has(receivedResp)&&receivedResp!==values[respField]){const c=card('Responsáveis pela inspeção');c.append(make('pre',receivedResp));resp=choice('Acrescentar os responsáveis para conferência',true);c.append(resp.el);box.append(c);}
  const error=make('p',undefined,{role:'alert',class:'direct-warn'});error.hidden=true;box.append(error);
  const footer=make('div',undefined,{class:'direct-actions'}),backup=make('button','Salvar cópia do meu guia',{type:'button'}),apply=make('button','Incorporar selecionados',{type:'button',class:'direct-primary'}),ignore=make('button','Ignorar arquivo',{type:'button'}),cancel=make('button','Fechar',{type:'button'});
  backup.onclick=()=>teamDownload18(values,images,'Guia_Antes_Importacao_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json');ignore.onclick=skip;cancel.onclick=close;footer.append(backup,apply,ignore,cancel);box.append(footer);
  apply.onclick=()=>{try{
   if(!confirm.input.checked)throw Error('Confirme que os arquivos são da mesma inspeção.');
   if(snapshotTeam18()!==base)throw Error('O guia foi alterado desde a prévia. Feche e reabra o arquivo para conferir.');
   compareIdentity(values,incoming.values,bpfDateToISO);
   const next={...values},pics={...images},selected=selections.filter(x=>x.select.value!=='skip');
   for(const x of selected)applyFields(next,incoming.values,x.names,x.select.value);
   checkSources(values,next,incoming.values,selected.map(x=>x.code));
   const extras=[];for(const {x,input}of docChoices)if(input.checked){next[x.name]=x.incoming;extras.push('documents');}
   for(const kind of ['photos','labels'])if(importGallery(next,pics,incoming,kind,photoChoices.filter(x=>x.kind===kind&&x.input.checked).map(x=>x.name)))extras.push(kind);
   if(resp?.input.checked){const old=String(next[respField]||'').trim();const existing=new Set(old.split(/\r?\n/).map(norm));const fresh=String(receivedResp).split(/\r?\n/).filter(x=>norm(x)&&!existing.has(norm(x)));if(fresh.length){next[respField]=[old,'[IMPORTADO PARA CONFERÊNCIA — '+file.name.replace(/[\r\n]/g,' ')+']',...fresh].filter(Boolean).join('\n');extras.push('inspectors');}}
   if(!selected.length&&!extras.length)throw Error('Selecione ao menos um processo ou informação nova.');
   const previous=JSON.parse(base);
   try{bpfApplyLoadedPhotoPages(next,pics);Object.assign(values,next);Object.assign(images,pics);recalc();sync();}
   catch(err){bpfApplyLoadedPhotoPages(previous.values,previous.images);for(const k of Object.keys(values))if(!Object.hasOwn(previous.values,k))delete values[k];for(const k of Object.keys(images))if(!Object.hasOwn(previous.images,k))delete images[k];Object.assign(values,previous.values);Object.assign(images,previous.images);recalc();sync();throw err;}
   team18.imports.push({hash,file:file.name,at:new Date().toISOString(),processes:[...selected.map(x=>x.code),...new Set(extras)]});team18.imports=team18.imports.slice(-200);dirty=true;window.GuiaRecovery?.schedule?.();
   status('Arquivo incorporado: '+file.name+'. Confira as observações, os resultados e a matriz de risco. Salve o JSON consolidado.');skip();
  }catch(err){error.textContent=err.message;error.hidden=false;error.scrollIntoView({block:'center'});}};
  active.busy=false;
 }
 window.BPFDirectImport={open(){if(!active.modal&&!active.busy)picker.click();},core};
})();
