#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');

class Node {
 constructor(tag) {
  this.tagName=tag;this.children=[];this.style={};this.dataset={};this.value='';this.checked=false;
  this._text='';this.id='';this.className='';this.parentElement=null;this.scrollTop=0;
 }
 get textContent(){return this._text}
 set textContent(s){this._text=String(s);this.children=[]}
 append(...children){for(const c of children){if(c==null)continue;this.children.push(c);if(typeof c==='object')c.parentElement=this;}}
 appendChild(c){this.append(c);return c}
 replaceChildren(...cs){this.children=[];this.append(...cs)}
 setAttribute(k,v){this[k]=v}
 remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(x=>x!==this);this.parentElement=null}
 after(c){if(this.parentElement){const i=this.parentElement.children.indexOf(this);this.parentElement.children.splice(i+1,0,c);c.parentElement=this}}
 click(){this.onclick?.()}
 querySelectorAll(selector){
  const all=[];function walk(n){for(const c of n.children||[]){if(typeof c==='object'){all.push(c);walk(c)}}}walk(this);
  if(selector==='textarea')return all.filter(x=>x.tagName==='textarea');
  if(selector==='article')return all.filter(x=>x.tagName==='article');
  if(selector==='button')return all.filter(x=>x.tagName==='button');
  return all;
 }
 querySelector(query){
  if(query==='#bpf-inspector-review')return this.querySelectorAll('article').find(x=>x.id===query.slice(1))||null;
  return null;
 }
}
async function test(file){
 const html=fs.readFileSync(file,'utf8');
 assert(html.includes('const BPF_PHRASES='));
 const helperStart=html.indexOf('/* Revisão das frases dos inspetores:');
 const helperEnd=html.indexOf('function bpfInitFields(data){',helperStart);
 assert(helperStart>=0&&helperEnd>helperStart,file+': helper script missing');
 const original=()=>({text:'Frase oficial original.',guidance:'Conferir integridade e documentação original.',appcc:'PPRO'});
 const ph1=original(),ph2=original(),rowphrase=original();
 const different={text:'Outra frase original.',guidance:'Outra orientação de inspeção.',appcc:'PPR'};
 const scopes=[{col:1,name:'Group1',phrases:[ph1]},{col:2,name:'Group2',phrases:[ph2]}];
 const row={code:'4.1.1',phrases:[rowphrase],scopes};
 const other={code:'4.2.2',phrases:[different],scopes:[{col:1,name:'Group3',phrases:[different]}]};
 const pages=[{page:0,rows:[row]},{page:1,rows:[other]}];
 const values={BPF_InspectorRevisions:''};
 const store=new Map(),storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 const body=new Node('body'),head=new Node('head');
 const save=new Node('button');save.id='save';body.append(save);
 const status=new Node('div');status.id='status';body.append(status);
 const doc={
  body,head,
  createElement:k=>new Node(k),createTextNode:t=>String(t),
  getElementById:k=>{
   const items=[head,body,...head.children,...body.children];
   return items.find(x=>x.id===k)||null;
  },
  querySelector:k=>{
   if(k==='#save')return save;
   if(k==='#status')return status;
   if(k==='#bpf-inspector-review')return body.children.find(x=>x.id==='bpf-inspector-review')||null;
   return null;
  }
 };
 const ctx={BPF_PHRASES:pages,values,localStorage:storage,document:doc,
   location:{hash:''},titles:['4.1 Captação','4.2 Condução'],
   bpfDismissEditor:()=>true,bpfScopeLabel:(p,s)=>'Unidade '+s.col,
   changed:()=>{},recalc:()=>ctx.bpfInspectorApplySaved(),
   confirm:()=>true,alert:s=>{throw Error('Unexpected alert: '+s)},
   Blob,setTimeout:()=>0,URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}}
 };
 vm.createContext(ctx);
 vm.runInContext(html.slice(helperStart,helperEnd),ctx,{timeout:8000});
 const entries=vm.runInContext('BPF_INSPECTOR_ENTRIES',ctx);
 assert.equal(entries.length,2,file+': repeated captações should share same original F');
 const cap=entries.find(x=>x.page===0);
 assert.equal(cap.refs.length,3,file+': must update both scopes and shared row original');
 assert.equal(cap.original.text,'Frase oficial original.');
 assert.equal(cap.original.guidance,'Conferir integridade e documentação original.');
 const newText='Texto revisado do item 4.1.1 F1',newGuidance='Verificar os registros da inspeção revisados.';
 const total=ctx.bpfInspectorApplyEntries({[cap.key]:{text:newText,guidance:newGuidance}});
 assert.equal(total,1);
 assert.equal(ph1.text,newText);assert.equal(ph2.text,newText);assert.equal(rowphrase.text,newText);
 assert.equal(ph1.guidance,newGuidance);assert.equal(ph2.guidance,newGuidance);
 assert.equal(JSON.parse(values.BPF_InspectorRevisions).entries[cap.key].text,newText);
 assert(store.size===1);
 const before=values.BPF_InspectorRevisions;
 // Roundtrip in another session/inspection JSON: unchanged stable key, original preserved.
 ctx.bpfInspectorApplyEntries({});
 assert.equal(ph1.text,'Frase oficial original.');assert.equal(ph2.guidance,'Conferir integridade e documentação original.');
 values.BPF_InspectorRevisions=before;ctx.bpfInspectorApplySaved();
 assert.equal(ph1.text,newText);
 assert.equal(ph2.guidance,newGuidance);
 assert.equal(different.text,'Outra frase original.',file+': unrelated item changed');
 // Main menu: original+editable, restore one, restore all, Save + import/export.
 ctx.bpfInspectorInstallMenu();
 const button=body.children.find(x=>x.id==='bpf-inspector-menu');
 assert(button,file+': menu missing');
 button.click();
 const dialog=body.children.find(x=>x.id==='bpf-inspector-review');
 assert(dialog,file+': revision dialog missing');
 const boxes=dialog.querySelectorAll('textarea');
 assert.equal(boxes.length,2,file+': must show original/edited pair for phrase and guidance');
 assert.equal(boxes[0].value,newText);
 assert.equal(boxes[1].value,newGuidance);
 assert(dialog.textContent===''||typeof dialog.textContent==='string');
 assert(dialog.querySelectorAll('button').some(b=>b.textContent==='Restaurar original deste F'));
 assert(dialog.querySelectorAll('button').some(b=>b.textContent==='Retornar tudo ao original'));
 assert(dialog.querySelectorAll('button').some(b=>b.textContent==='Baixar revisões JSON'));
 assert(dialog.querySelectorAll('button').some(b=>b.textContent==='Importar revisões'));
 boxes[0].value='Edição nova do item';boxes[0].oninput();
 boxes[1].value='Nova orientação ao inspetor';boxes[1].oninput();
 const saveRevision=dialog.querySelectorAll('button').find(b=>b.textContent==='Salvar revisões');
 saveRevision.click();
 assert.equal(ph1.text,'Edição nova do item');assert.equal(ph1.guidance,'Nova orientação ao inspetor');
 assert(JSON.parse(values.BPF_InspectorRevisions).entries[cap.key],file+': revised values not saved');
 assert(!body.children.some(x=>x.id==='bpf-inspector-review'),file+': dialog did not close');
 // Restoring all must remove stored override and restore normative original.
 button.click();
 const next=body.children.find(x=>x.id==='bpf-inspector-review');
 next.querySelectorAll('button').find(b=>b.textContent==='Retornar tudo ao original').click();
 next.querySelectorAll('button').find(b=>b.textContent==='Salvar revisões').click();
 assert.equal(ph1.text,'Frase oficial original.');
 assert.equal(ph2.guidance,'Conferir integridade e documentação original.');
 assert.equal(values.BPF_InspectorRevisions,'');
 assert.equal(store.size,0);
 assert(html.includes('data.fields.BPF_InspectorRevisions='),file+': JSON does not store review edits');
 assert(html.includes('function recalc(){bpfInspectorApplySaved();'),file+': JSON reload does not reapply review');
 assert(html.includes('function bpfMountDescriptions(){bpfInspectorInstallMenu();'),file+': toolbar menu missing');
 assert(html.includes('async function bpfAppendCompactAnnex(pdf){'),file+': PDF annex missing');
 assert(!html.includes("if(phrase.guidance)text('Orientação ao inspetor: '+phrase.guidance"),file+': inspector guidance leaked into PDF');
 assert(html.includes("function bpfPdfGeneralSplit(full,font,form,pdf){"),file+': PDF pagination changed');
 console.log('TESTES OK',file,': menu principal, versões originais, edições, restauração, JSON local, anexo PDF preservado.');
}
(async()=>{for(const file of ['individual.html','equipe.html'])await test(file)})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
