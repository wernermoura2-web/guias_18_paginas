#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class El{
 constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.checked=false;this.value='';this.type='';this.style={};this.disabled=false;this._txt='';}
 set textContent(v){this._txt=String(v);this.children=[];}
 get textContent(){return this._txt;}
 append(...cs){for(const c of cs)if(c!=null){this.children.push(c);if(typeof c==='object')c.parentElement=this;}}
 insertBefore(c,at){const i=this.children.indexOf(at);if(i<0)this.append(c);else{this.children.splice(i,0,c);c.parentElement=this;}}
 setAttribute(k,v){this[k]=v;}
 querySelectorAll(q){
  const all=[];
  const walk=(n)=>{for(const c of n.children||[])if(typeof c==='object'){all.push(c);walk(c);}};
  walk(this);
  if(q==='input[type=checkbox]')return all.filter(x=>x.tagName==='input'&&x.type==='checkbox');
  if(q==='input[type=radio]')return all.filter(x=>x.tagName==='input'&&x.type==='radio');
  if(q==='input[type=text]')return all.filter(x=>x.tagName==='input'&&x.type==='text');
  if(q==='textarea')return all.filter(x=>x.tagName==='textarea');
  return all;
 }
 querySelector(q){return this.querySelectorAll('textarea').find(x=>q.includes(x.dataset.note))||null;}
 scrollIntoView(){}
 remove(){}
 focus(){}
}
async function run(){
for(const file of ['individual.html','equipe.html']){
 const h=fs.readFileSync(file,'utf8');
 const cut=(a,b)=>{const i=h.indexOf(a),j=h.indexOf(b,i+a.length);assert(i>=0&&j>i,file+': missing '+a);return h.slice(i,j);};
 const helpers=cut('function bpfScopeLabel(page,scope){','function bpfOpenPhrases(row,page){');
 const editor=cut('function bpfOpenPhrases(row,page){','function bpfMountDescriptions(){');
 const init=cut('function bpfInitFields(data){','function bpfMergeObservation(');
 const sync=cut('function bpfSyncObservation(row,page){','function bpfDismissEditor(){');
 const phrases=Array.from({length:17},(_,i)=>({text:'Frase original '+(i+1),appcc:'PC',guidance:'Orientação original '+i}));
 const row={code:'4.10.3',phrases,scopes:[{col:1,name:'Grupo202',phrases}]};
 const page={page:11,rows:[row]},values={},alerts=[];
 const host=new El('main');let dialog=null;host.after=e=>dialog=e;
 const doc={createElement:e=>new El(e),createTextNode:v=>String(v),getElementById:()=>null,head:new El('head'),querySelector:q=>q==='#status'?{textContent:''}:null};
 const ctx={BPF_PHRASES:[page],values,host,document:doc,
  bpfPhraseName:(s,i)=>'BPF_F_'+s.name+'_'+(i+1),
  bpfNoteName:(s,i)=>'BPF_Note_'+s.name+'_'+(i+1),
  bpfSummaryName:(p,r)=>'Summary_'+p.page+'_'+r.code,
  bpfMergeObservation:(t,code,previous,current)=>current,
  BPF_OBSERVATION_FIELDS:{'11_4.10.3':'OBS_CQ'},
  bpfDismissEditor:()=>true,bpfSyncPCCFinal:()=>{},changed:()=>{},recalc:()=>{},
  alert:v=>alerts.push(v),dirty:false
 };
 vm.createContext(ctx);vm.runInContext(helpers+'\n'+init+'\n'+sync+'\n'+editor,ctx,{timeout:6000});
 assert.equal(ctx.bpfPanels(page,row).length,6,file+': expected 6 groups');
 const labels=ctx.bpfPanels(page,row).map(p=>p.label);
 assert(labels[3].includes('RDC 717'));
 assert(labels[4].includes('Cinco análises mensais terceirizadas'));
 assert(labels[5].includes('Cinco unidades analisadas de todos os lotes'));
 ctx.bpfOpenPhrases(row,page);
 const checks=dialog.querySelectorAll('input[type=checkbox]');
 const radios=dialog.querySelectorAll('input[type=radio]');
 const notes=dialog.querySelectorAll('textarea');
 assert.equal(checks.length,14,file+': F4-F6 must not show redundant checkboxes');
 assert.equal(radios.length,12,file+': F1-F6 must all have Sim and Não radios');
 assert.equal(notes.length,6,file+': each of 6 groups requires one observation');
 const panels=ctx.bpfPanels(page,row);
 for(let n=3;n<=5;n++){
   const panel=panels[n], key=ctx.bpfUnifiedKey(page,row,panel,'Choice');
   const radio=radios.find(x=>x.name===key&&x.value===(n===4?'0':'1'));
   assert(radio,file+': missing normal radio F'+(n+1));radio.checked=true;radio.onchange();
   const original=panel.entries[0].name;
   assert.equal(values[original],n===4?'0':'1',file+': original answer not set by radio F'+(n+1));
   const selected=JSON.parse(values[ctx.bpfUnifiedKey(page,row,panel,'Selected')]);
   assert.equal(selected.length,1);
   assert.equal(selected[0],original);
 }
 assert(!dialog.bpfCommit(),file+': NC missing must prevent save');
 assert(alerts.some(x=>x.includes('campo NC')),file+': missing NC alert');
 const f5note=notes[4];f5note.value='Análise mensal terceirizada não comprovada';f5note.oninput();
 assert(dialog.bpfCommit(),file+': save after NC entered failed');
 assert(values.OBS_CQ.includes('F5 — Cinco análises mensais terceirizadas de um lote envasado'));
 assert(values.OBS_CQ.includes('NC: Análise mensal terceirizada não comprovada'));
 assert.equal(values[ctx.bpfNoteName(row.scopes[0],15)],'Análise mensal terceirizada não comprovada');
 ctx.bpfOpenPhrases(row,page);
 assert.equal(dialog.querySelectorAll('input[type=checkbox]').length,14,file+': checkbox reappeared on reopening');
 assert.equal(dialog.querySelectorAll('input[type=radio]').filter(x=>x.checked).length,3,file+': missing saved radios');
 assert.equal(dialog.querySelectorAll('textarea')[4].value,'Análise mensal terceirizada não comprovada');
 const annex=cut('function bpfAnnexRows(){','</script><script>');
 const drawn=[],fakePage={drawText:s=>drawn.push(String(s)),drawRectangle:()=>{}};
 const fakePdf={embedFont:async()=>({widthOfTextAtSize:(s,size)=>String(s).length*size*.45}),addPage:()=>fakePage};
 ctx.PDFLib={StandardFonts:{Helvetica:'Helvetica',HelveticaBold:'HelveticaBold'},rgb:()=>({})};
 doc.querySelector=q=>q==='#bpf-include-annex'?{checked:true}:q==='#status'?{textContent:''}:null;
 vm.runInContext(annex,ctx,{timeout:6000});
 const groups=ctx.bpfAnnexRows().filter(x=>x.grouped&&x.row.code==='4.10.3');
 assert.equal(groups.length,3,file+': anexo should include F4, F5 and F6 as individual sections');
 const pages=await ctx.bpfAppendCompactAnnex(fakePdf);
 assert(pages>=1);
 const pdfText=drawn.join(' ');
 assert(pdfText.includes('Cinco análises mensais terceirizadas'));
 assert(pdfText.includes('Cinco unidades analisadas de todos os lotes'));
 assert.equal(pdfText.split('Análise mensal terceirizada não comprovada').length-1,1,file+': NC repeated in PDF');
 assert(!pdfText.includes('Orientação ao inspetor'),file+': inspector orientation should not print');
 console.log('TESTES OK',file,'4.10.3 F4, F5, F6 apenas Sim/Não, OBS/NC e PDF intactos; F1-F3 com 14 opções.');
}
}
run().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
