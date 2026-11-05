#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
for(const filename of ['individual.html','equipe.html']){
 const h=fs.readFileSync(filename,'utf8');
 const cut=(a,b)=>{const x=h.indexOf(a),y=h.indexOf(b,x+a.length);assert(x>=0&&y>x,filename+' markers '+a);return h.slice(x,y);};
 const helpers=cut('function bpfScopeLabel(page,scope){','function bpfOpenPhrases(row,page){');
 const ui=cut('function bpfOpenPhrases(row,page){','function bpfMountDescriptions(){');
 const sync=cut('function bpfSyncObservation(row,page){','function bpfDismissEditor(){');
 const init=cut('function bpfInitFields(data){','function bpfMergeObservation(');
 const makeRow=(code,count,scopes=1)=>{
  const texts=Array.from({length:count},(_,i)=>({text:'Requisito '+(i+1)+' do item '+code+'.',appcc:i%3===0?'PPRO':'PPR',guidance:'Orientação F'+(i+1)}));
  return {code,phrases:texts,scopes:Array.from({length:scopes},(_,i)=>({col:i+1,name:'G'+code+'_'+i,phrases:texts}))};
 };
 const row433=makeRow('4.3.3',6,4),row4103=makeRow('4.10.3',17,1),row4112=makeRow('4.11.2',6,1),row411=makeRow('4.1.1',2,4);
 const pages=[{page:2,rows:[row433]},{page:11,rows:[row4103]},{page:12,rows:[row4112]},{page:0,rows:[row411]}];
 const values={};
 class Element{
  constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.value='';this.type='';this.checked=false;this.textContent='';this.className='';this.style={};this.parentElement=null;}
  append(...children){for(const c of children){if(c===undefined)continue;this.children.push(c);if(c&&typeof c==='object')c.parentElement=this;}}
  insertBefore(node,before){const i=this.children.indexOf(before);if(i>=0){this.children.splice(i,0,node);node.parentElement=this;}else this.append(node);}
  setAttribute(k,v){this[k]=v;}
  querySelectorAll(query){const all=[];const recur=n=>{for(const child of n.children||[]){if(child instanceof Element){all.push(child);recur(child);}}};recur(this);if(query==='input[type=checkbox]')return all.filter(x=>x.tagName==='input'&&x.type==='checkbox');if(query==='textarea')return all.filter(x=>x.tagName==='textarea');return all;}
  querySelector(query){if(query.startsWith('textarea[data-note="')){const key=query.slice('textarea[data-note="'.length,-2);return this.querySelectorAll('textarea').find(x=>x.dataset.note===key)||null;}return null;}
  focus(){}
  remove(){}
  scrollIntoView(){}
 }
 const head=new Element('head'),host=new Element('main');let currentDlg=null;
 host.after=x=>{currentDlg=x;};
 const status={textContent:''};
 const document={
  createElement:tag=>new Element(tag),
  getElementById:()=>null,
  head,
  querySelector:q=>q==='#status'?status:null
 };
 const context={BPF_PHRASES:pages,values,document,host,Set,Map,JSON,Math,Array,Object,String,Number,
  bpfPhraseName:(s,i)=>'BPF_F_'+s.name+'_'+(i+1),
  bpfNoteName:(s,i)=>'BPF_Obs_'+s.name+'_'+(i+1),
  bpfSummaryName:(p,r)=>'BPF_Summary_'+p.page+'_'+r.code,
  bpfMergeObservation:(t,c,old,summary)=>summary,
  BPF_OBSERVATION_FIELDS:{'2_4.3.3':'OBSERVE433','11_4.10.3':'OBSERVE4103','12_4.11.2':'OBSERVE4112','0_4.1.1':'OBSERVE411'},
  bpfDismissEditor:()=>true,bpfSyncPCCFinal:()=>{},changed:()=>{},recalc:()=>{},alert:msg=>{throw Error('UI validation: '+msg)}
 };
 vm.createContext(context);
 vm.runInContext(helpers+'\n'+init+'\n'+sync+'\n'+ui,context,{timeout:4000});
 assert.equal(context.bpfPanels(pages[0],row433).length,1,filename+': 4.3.3 must be one composite group');
 assert.equal(context.bpfPanels(pages[1],row4103).length,6,filename+': 4.10.3 must be three analytical and three independent groups');
 assert.equal(context.bpfPanels(pages[2],row4112).length,2,filename+': 4.11.2 must be two composite groups');
 assert.equal(context.bpfPanels(pages[3],row411).length,2,filename+': original 4.1.1 must have F1 and F2');
 const initFields={fields:{}};context.bpfInitFields(initFields);
 assert('BPF_FGroupNote_12_4_11_2_G1_OBS' in initFields.fields);
 assert('BPF_FGroupNote_12_4_11_2_G2_NC' in initFields.fields);
 for(const [page,row]of [[pages[0],row433],[pages[1],row4103],[pages[2],row4112],[pages[3],row411]]){
  for(const panel of context.bpfPanels(page,row))for(const ans of ['1','0'])values[context.bpfGroupNoteName(page,row,panel,ans)]='';
  for(const s of row.scopes)for(let i=0;i<s.phrases.length;i++){values[context.bpfPhraseName(s,i)]='';values[context.bpfNoteName(s,i)]='';}
  context.bpfOpenPhrases(row,page);
  assert(currentDlg,filename+': editor did not open');
  assert(!currentDlg.children.some(e=>e.textContent?.includes('Qualquer Não torna o item Não')),filename+': filling instruction still displayed');
  const allBoxes=currentDlg.querySelectorAll('input[type=checkbox]');
  assert(allBoxes.length>0,filename+': missing checkboxes');
  // For each specialised group choose the first item as Sim, except first as Não.
  if(row===row411){
   const a=allBoxes.find(e=>e.dataset.answerName===context.bpfPhraseName(row.scopes[0],0)&&e.dataset.answer==='1');
   const b=allBoxes.find(e=>e.dataset.answerName===context.bpfPhraseName(row.scopes[0],0)&&e.dataset.answer==='0');
   a.checked=true;a.onchange();
   b.checked=true;b.onchange();
   assert.equal(values[a.dataset.answerName],'0',filename+': Sim/Não simultaneous status');
   assert(!a.checked&&b.checked,filename+': simultaneous Sim and Não checkboxes on same captação');
  }else{
   const panels=context.bpfPanels(page,row);
   for(const panel of panels){
    const a=allBoxes.find(e=>e.dataset.answerName===panel.entries[0].name&&e.dataset.answer==='1');
    assert(a,filename+': no first Sim choice');
    a.checked=true;a.onchange();
   }
   const key=context.bpfGroupNoteName(page,row,panels[0],'1');
   values[key]='OBS única para as análises selecionadas';
   currentDlg.bpfCommit();
   assert(String(values[context.bpfNoteName(panels[0].entries[0].scope,panels[0].entries[0].index)]).includes('OBS única'),filename+': collective OBS not propagated');
   assert(String(values[context.BPF_OBSERVATION_FIELDS[page.page+'_'+row.code]]).includes('OBS única'),filename+': general observation not generated');
  }
 }
 assert(h.includes("bpfPdfGeneralSplit(bpfGeneralFullText()"),filename+': PDF continuation lost');
 assert(h.includes("async function bpfAppendCompactAnnex(pdf){"),filename+': compact annex lost');
 console.log('TESTES OK',filename,'F selecionáveis, grupos 4.3.3/4.10.3/4.11.2, Sim/Não exclusivos, OBS coletiva, persistência e PDF preservados.');
}
