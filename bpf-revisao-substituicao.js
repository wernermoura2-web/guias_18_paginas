/* Revisão editorial do Guia Estadual BPF/APPCC — mantém a redação legal e as inspeções. */
(() => {
 'use strict';
 if (window.__BPF_REVISAO_94F_APLICADA__) return;
 window.__BPF_REVISAO_94F_APLICADA__ = true;
 const SRC = './revisao-orientacoes-20261107.json';
 const KO = ['item','codigo','code','itemCodigo','item_codigo','numeroItem','numero','nItem'];
 let db = null, mutationQueued = false;
 const status = {loaded:false, modelFields:0, editorFields:0, legalChanged:0, errors:[]};
 window.BPFRevisao94F = {status, get dados(){return db;}, atualizar:apply};
 const norm = v => String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
 const itemId = s => (String(s||'').match(/\b4\.\d{1,2}\.\d{1,2}\b/)||[])[0]||'';
 const fId = s => {const m=String(s||'').match(/\bF\s*([1-9][0-9]?)\b/i);return m?'F'+Number(m[1]):''};
 const special = new Set(['redacao original','texto legal','frase legal','requisito legal','legislacao']);
 function fieldValue(target, key, value, force=false){
   if(!target||typeof target!=='object'||typeof value!=='string'||!value)return false;
   if(force || Object.prototype.hasOwnProperty.call(target,key)){
     if(target[key]!==value){target[key]=value;status.modelFields++;return true;}
   }
   return false;
 }
 // Only an item FRAGMENT (F) is eligible for replacement. The item legal statement is never edited.
 function patchF(fragment, row, allowAdd=true){
   if(!fragment||typeof fragment!=='object'||!row)return;
   const descKeys=['texto','frase','descricao','descricaoFrase','textoFrase','enunciado','criterio','pergunta'];
   for(const key of descKeys)if(typeof fragment[key]==='string')fieldValue(fragment,key,row.desdobramento);
   const aliases={
     orientacao_inspetor:['orientacao','orientacaoInspetor','orientacao_inspetor','orientacoes','instrucao','orientacaoAoInspetor','inspectorGuidance'],
     obs_sim:['obsSim','observacaoSim','observacao_sim','exemploSim','exemplo_obs_sim','exemploObs','exemploOBS','orientacaoSim','simOrientacao'],
     nc_nao:['ncNao','obsNao','observacaoNao','observacao_nao','exemploNao','exemplo_nc_nao','exemploNC','orientacaoNao','naoOrientacao']
   };
   for(const [src,keys] of Object.entries(aliases)){
     let changed=false;
     for(const k of keys)changed=fieldValue(fragment,k,row[src])||changed;
     // Add a non-disruptive separate property only when the phrase model has guidance fields already.
     if(allowAdd&&!changed&&Object.keys(fragment).some(k=>/orienta|exemplo|observ|obs|nc/i.test(k))){
       const key={orientacao_inspetor:'orientacaoInspetor',obs_sim:'exemploObsSim',nc_nao:'exemploNcNao'}[src];
       fieldValue(fragment,key,row[src],true);
     }
   }
 }
 function findModels(){
   const objects=[];
   const add=(v)=>{if(v&&typeof v==='object'&&!objects.includes(v))objects.push(v)};
   for(const key of Object.getOwnPropertyNames(window)){
     if(!/^(guia|bpf|frase|phrases|revisao|guide|itens|config)/i.test(key))continue;
     try{add(window[key])}catch(e){}
   }
   try{if(typeof CFG!=='undefined')add(CFG)}catch(e){}
   try{if(typeof BPF_FRASES!=='undefined')add(BPF_FRASES)}catch(e){}
   try{if(typeof ITENS!=='undefined')add(ITENS)}catch(e){}
   try{if(typeof GUIA!=='undefined')add(GUIA)}catch(e){}
   return objects;
 }
 function patchModel(){
   if(!db)return;
   const all=new Map();for(const [item,rows] of Object.entries(db._itens))all.set(item,rows);
   const seen=new WeakSet();let count=0;
   function visit(obj, code='',depth=0, edge=''){
     if(!obj||typeof obj!=='object'||seen.has(obj)||depth>8||count>180000)return;
     seen.add(obj);count++;
     if(Array.isArray(obj)){
       if((/^(frases|fragments|subfrases|checks|verificacoes|questions)$/i).test(edge)&&all.has(code)){
         obj.forEach((phrase,i)=>{
           const id=fId(phrase?.f||phrase?.id||phrase?.codigo||'')||'F'+(i+1);
           const row=all.get(code)?.find(r=>r.f===id);
           if(row)patchF(phrase,row);
         });
       }
       for(const child of obj)visit(child,code,depth+1,'');return;
     }
     let actual=code;
     for(const k of KO)if(typeof obj[k]==='string'&&itemId(obj[k])){actual=itemId(obj[k]);break;}
     for(const [k,v] of Object.entries(obj)){
       // Never update the parent item's normative text or saved inspection answers.
       if(/^(a|answers|respostas|inspecoes|inspection|values|fields|dadosPreenchidos|observacoesGerais)$/i.test(k))continue;
       const nestedCode=itemId(k)||actual;
       if(v&&typeof v==='object')visit(v,nestedCode,depth+1,k);
     }
     const fragmentIndex=fId(obj.f||obj.fcode||obj.fraseNumero||'');
     if(fragmentIndex&&all.has(actual)&&Object.keys(obj).some(k=>/orienta|exemplo|descricaoFrase|textoFrase/i.test(k))){
       const row=all.get(actual).find(r=>r.f===fragmentIndex);
       if(row)patchF(obj,row,false);
     }
   }
   for(const model of findModels())visit(model);
 }
 function isEditable(node){return node&&['TEXTAREA','INPUT'].includes(node.tagName)&&!['checkbox','radio','hidden','file'].includes(node.type)}
 function locateLabel(el){
   const label=el.id&&document.querySelector('label[for="'+CSS.escape(el.id)+'"]');
   return norm([el.getAttribute('aria-label'),el.getAttribute('placeholder'),el.name,label?.textContent,el.previousElementSibling?.textContent,el.parentElement?.querySelector('label')?.textContent].join(' '));
 }
 function findEditor(){
   const dialogs=[...document.querySelectorAll('dialog,[role="dialog"],[aria-modal="true"],.modal,.modal-content')];
   return dialogs.filter(el=>el.getClientRects().length&&/revis[aã]o das frases|revisar frases dos inspetores|orienta[cç][oõ]es ao inspetor/i.test((el.querySelector('h1,h2,h3,h4')?.textContent||'')+' '+el.getAttribute('aria-label')));
 }
 function assign(field,value){
   if(!isEditable(field)||!value||field.value===value||field.readOnly||field.disabled)return false;
   field.value=value;
   field.dispatchEvent(new Event('input',{bubbles:true}));
   field.dispatchEvent(new Event('change',{bubbles:true}));
   status.editorFields++;return true;
 }
 function inferRow(field,editor){
   let el=field.parentElement,f='',code='';
   for(let n=0;el&&el!==editor&&n<10;el=el.parentElement,n++){
     const own=(el.querySelector(':scope > label,:scope > strong,:scope > summary,:scope > h4')?.textContent||'')+' '+(el.getAttribute('data-item')||'')+' '+(el.getAttribute('data-code')||'')+' '+(el.getAttribute('data-f')||'');
     f=f||fId(own);code=code||itemId(own);
     if(!f&&/^(tr|article)$/i.test(el.tagName))f=fId(el.innerText?.slice(0,300));
     if(!code&&/^(tr|article)$/i.test(el.tagName))code=itemId(el.innerText?.slice(0,300));
     if(code&&f)break;
   }
   return {code,f};
 }
 function patchEditors(){
   if(!db)return;
   for(const editor of findEditor()){
     for(const field of editor.querySelectorAll('textarea,input[type="text"]')){
       if(!isEditable(field))continue;
       const label=locateLabel(field);
       if([...special].some(k=>label.includes(k)))continue;
       const {code,f}=inferRow(field,editor);
       let row=db._itens[code]?.find(r=>r.f===f);
       if(!row)continue;
       let value='';
       if(/orientac|orienta|instru[cç]/.test(label))value=row.orientacao_inspetor;
       else if(/exemplo|modelo|obs\b|observac|conformidade/.test(label)&&/n[aã]o|negativ|nc\b/.test(label))value=row.nc_nao;
       else if(/exemplo|modelo|obs\b|observac|conformidade/.test(label)&&/sim|positiv/.test(label))value=row.obs_sim;
       else if(/frase|desdobramento|verificac|pergunta/.test(label))value=row.desdobramento;
       assign(field,value);
     }
   }
 }
 function glossary(){
   if(!db||document.querySelector('#bpf-definicoes-integradas'))return;
   const hub=document.querySelector('#bpf-ui-hub,.bpf-ui-hub,#bpf-revisao-painel .corpo');
   if(!hub)return;
   const details=document.createElement('details');details.id='bpf-definicoes-integradas';
   details.style.cssText='margin:12px 0;padding:12px 15px;border:1px solid #b8d0df;border-radius:12px;background:#f7fbff;color:#153f58';
   const summary=document.createElement('summary');summary.textContent='Definições adotadas — PPR, POP, PC, PPRO e PCC';
   summary.style.cssText='font-weight:700;cursor:pointer';details.append(summary);
   for(const [k,v] of Object.entries(db.definicoes)){const p=document.createElement('p');p.textContent=v;p.style.cssText='margin:12px 0;line-height:1.5;font-size:14px';details.append(p)}
   hub.append(details);
 }
 function apply(){if(!db)return;try{patchModel();patchEditors();glossary()}catch(e){status.errors.push(String(e).slice(0,200))}}
 const debounce=()=>{if(mutationQueued)return;mutationQueued=true;setTimeout(()=>{mutationQueued=false;apply()},250)};
 fetch(SRC,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{
   if(data.preservar_frases_legais!==true||!Array.isArray(data.verificacoes)||data.verificacoes.length!==94)throw Error('Arquivo de revisão inválido');
   data._itens=Object.groupBy?Object.groupBy(data.verificacoes,r=>r.item):data.verificacoes.reduce((o,r)=>((o[r.item]??=[]).push(r),o),{});
   db=data;status.loaded=true;apply();
   new MutationObserver(debounce).observe(document.documentElement,{subtree:true,childList:true});
   window.addEventListener('load',debounce);
 }).catch(e=>{status.errors.push('Carga: '+String(e).slice(0,200));});
})();