#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class E{
 constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.checked=false;this.value='';this.className='';this.style={};this.disabled=false;this._text='';this.parentElement=null;}
 set textContent(t){this._text=String(t);this.children=[];}
 get textContent(){return this._text;}
 append(...xs){for(const x of xs){if(x==null)continue;this.children.push(x);if(typeof x==='object')x.parentElement=this;}}
 insertBefore(el,b){const idx=this.children.indexOf(b);if(idx>=0){this.children.splice(idx,0,el);el.parentElement=this;}else this.append(el);}
 setAttribute(k,v){this[k]=v;}
 querySelectorAll(query){
  const out=[];function visit(el){for(const x of el.children||[])if(typeof x==='object'){out.push(x);visit(x);}}visit(this);
  if(query==='input[type=checkbox]')return out.filter(x=>x.tagName==='input'&&x.type==='checkbox');
  if(query==='input[type=radio]')return out.filter(x=>x.tagName==='input'&&x.type==='radio');
  if(query==='input[type=text]')return out.filter(x=>x.tagName==='input'&&x.type==='text');
  if(query==='textarea')return out.filter(x=>x.tagName==='textarea');
  return out;
 }
 querySelector(q){return this.querySelectorAll('textarea').find(x=>q.includes(x.dataset.note))||null;}
 scrollIntoView(){}
 focus(){}
 remove(){}
}
for(const filename of ['individual.html','equipe.html']){
 const html=fs.readFileSync(filename,'utf8');
 const extract=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert(i>=0&&j>i,filename+' missing '+a);return html.slice(i,j);};
 const helper=extract('function bpfScopeLabel(page,scope){','function bpfOpenPhrases(row,page){');
 const editor=extract('function bpfOpenPhrases(row,page){','function bpfMountDescriptions(){');
 const init=extract('function bpfInitFields(data){','function bpfMergeObservation(');
 const sync=extract('function bpfSyncObservation(row,page){','function bpfDismissEditor(){');
 const mk=(code,count,scopes)=>{const phrases=Array.from({length:count},(_,i)=>({text:'Texto original da frase '+(i+1),guidance:'Orientação original '+(i+1),appcc:code==='4.3.3'&&(i===1||i===5)?'PPR':'PPRO'}));return {code,phrases,scopes:Array.from({length:scopes},(_,i)=>({col:i+1,name:'Test_'+code+'_'+i,phrases}))};};
 const r433=mk('4.3.3',6,4),r4103=mk('4.10.3',17,1),r4112=mk('4.11.2',6,1),r411=mk('4.1.1',2,4);
 const pages=[{page:2,rows:[r433]},{page:11,rows:[r4103]},{page:12,rows:[r4112]},{page:0,rows:[r411]}];
 const values={},host=new E('main'),status={textContent:''};let dialog=null,alerts=[];
 host.after=e=>{dialog=e;};
 const doc={
  createElement:tag=>new E(tag),
  createTextNode:txt=>String(txt),
  getElementById:()=>null,
  head:new E('head'),
  querySelector:s=>s==='#status'?status:null
 };
 const context={BPF_PHRASES:pages,values,document:doc,host,
  bpfPhraseName:(s,i)=>'BPF_F_'+s.name+'_'+(i+1),
  bpfNoteName:(s,i)=>'BPF_Obs_'+s.name+'_'+(i+1),
  bpfSummaryName:(p,r)=>'BPF_Summary_'+p.page+'_'+r.code,
  bpfMergeObservation:(t,c,prev,next)=>next,
  BPF_OBSERVATION_FIELDS:{'2_4.3.3':'OBS_433','11_4.10.3':'OBS_4103','12_4.11.2':'OBS_4112'},
  bpfDismissEditor:()=>true,bpfSyncPCCFinal:()=>{},changed:()=>{},recalc:()=>{},
  alert:msg=>alerts.push(msg),dirty:false
 };
 vm.createContext(context);
 vm.runInContext(helper+'\n'+init+'\n'+sync+'\n'+editor,context,{timeout:5000});
 assert.equal(context.bpfPanels(pages[2],r4112).length,2);
 assert.equal(context.bpfPanels(pages[1],r4103).length,6);
 assert.equal(context.bpfPanels(pages[0],r433).length,1);
 const d={fields:{}};context.bpfInitFields(d);
 assert(d.fields.BPF_FGroupChoice_12_4_11_2_G1);
 assert(d.fields.BPF_FGroupSelected_12_4_11_2_G2);
 assert(d.fields.BPF_FGroupOther_12_4_11_2_G2);
 assert(d.fields.BPF_FGroupNote_12_4_11_2_G1_OBS);

 const pg=pages[2],row=r4112,panels=context.bpfPanels(pg,row);
 context.bpfOpenPhrases(row,pg);
 assert(dialog&&dialog.querySelectorAll('input[type=radio]').length===4,filename+': one Sim and No per F expected');
 assert.equal(dialog.querySelectorAll('textarea').length,2,filename+': exactly one OBS/NC per group');
 assert.equal(dialog.querySelectorAll('input[type=checkbox]').length,6,filename+': original six options must remain');
 const checkboxes=dialog.querySelectorAll('input[type=checkbox]'),radios=dialog.querySelectorAll('input[type=radio]'),areas=dialog.querySelectorAll('textarea'),other=dialog.querySelectorAll('input[type=text]');
 assert.equal(other.length,1,filename+': missing Outro text field');
 assert.equal(other[0].disabled,true);
 assert(!dialog.children.some(x=>String(x.textContent).includes('Qualquer Não torna o item Não')));
 const choose=(panel,e,status)=>{
  const name=context.bpfUnifiedKey(pg,row,panel,'Choice');
  const radio=radios.find(x=>x.name===name&&x.value===status);
  assert(radio);radio.checked=true;radio.onchange();
  const c=checkboxes.find(x=>x.dataset.phrase===e.name);assert(c);
  c.checked=true;c.onchange();
 };
 choose(panels[0],panels[0].entries[0],'1');
 choose(panels[0],panels[0].entries[2],'1');
 assert.equal(radios[0].name,radios[1].name,filename+': group response radio mismatch');
 assert.equal(values[panels[0].entries[0].name],'1',filename+': group Sim not mapped to F1');
 assert.equal(values[panels[0].entries[1].name],'2',filename+': unchecked option not neutral');
 assert.equal(values[panels[0].entries[2].name],'1',filename+': group Sim not mapped to F3');
 areas[0].value='Observação coletiva sobre RT e proprietário';areas[0].oninput();

 choose(panels[1],panels[1].entries[4-3],'0'); // original F5: Biólogo
 choose(panels[1],panels[1].entries[5-3],'0'); // original F6: Outro
 assert.equal(other[0].disabled,false,filename+': other field not enabled');
 assert(!dialog.bpfCommit(),filename+': NC missing should prevent save');
 assert(alerts.some(s=>s.includes('campo NC')));
 other[0].value='Conselho profissional específico';other[0].oninput();
 areas[1].value='Faltou registro profissional';areas[1].oninput();
 assert(dialog.bpfCommit(),filename+': grouped save failed');
 assert.equal(values[panels[1].entries[2].name],'0');
 assert(values[context.bpfNoteName(panels[1].entries[2].scope,5)].includes('Outro: Conselho profissional específico'));
 assert(values.OBS_4112.includes('Observação coletiva sobre RT'));
 assert(values.OBS_4112.includes('NC: Faltou registro'));
 assert(values.OBS_4112.includes('Outro: Conselho profissional específico'));
 assert.equal(context.bpfUnifiedAnswer(pg,row,panels[0]),'1');
 assert.equal(context.bpfUnifiedAnswer(pg,row,panels[1]),'0');
 assert.equal(JSON.parse(values[context.bpfUnifiedKey(pg,row,panels[0],'Selected')]).length,2);
 context.bpfOpenPhrases(row,pg);
 assert.equal(dialog.querySelectorAll('input[type=checkbox]').filter(x=>x.checked).length,4,filename+': saved selection not restored');
 assert.equal(dialog.querySelectorAll('textarea').length,2);
 assert.equal(dialog.querySelectorAll('input[type=text]')[0].value,'Conselho profissional específico');
 assert.equal(context.bpfSyncObservation(row,pg),undefined);
 // The other grouped items are independent and retain original APPCC per checkbox.
 const examples=[[pages[0],r433,24],[pages[1],r4103,17]];
 for(const [page,r,n]of examples){
  context.bpfOpenPhrases(r,page);
  assert.equal(dialog.querySelectorAll('input[type=checkbox]').length,n,filename+': number of original options was changed '+r.code);
  assert.equal(dialog.querySelectorAll('input[type=radio]').length,context.bpfPanels(page,r).length*2);
  assert.equal(dialog.querySelectorAll('textarea').length,context.bpfPanels(page,r).length);
  const check=dialog.querySelectorAll('input[type=checkbox]')[0],rd=dialog.querySelectorAll('input[type=radio]')[0];
  check.checked=true;check.onchange();rd.checked=true;rd.onchange();
  const nKey=check.dataset.phrase;
  assert.equal(values[nKey],'1',filename+': mapped answer absent '+r.code);
  if(r===r4103){
   assert.equal(context.bpfPanels(page,r)[0].label,'F1 — Produto acabado');
   assert.equal(context.bpfPanels(page,r)[1].label,'F2 — Captação');
   assert.equal(context.bpfPanels(page,r)[2].label,'F3 — Reservatório');
  }
 }
 // In the PDF annex, one grouped note must appear only once.
 const annex=extract('function bpfAnnexRows(){','</script><script>');
 const pageDrawn=[];
 const fakePage={drawText:(s)=>pageDrawn.push(String(s)),drawRectangle:()=>{}};
 const fakePdf={embedFont:async()=>({widthOfTextAtSize:(s,z)=>String(s).length*z*.45}),addPage:()=>fakePage};
 context.PDFLib={StandardFonts:{Helvetica:'Helvetica',HelveticaBold:'HelveticaBold'},rgb:()=>({})};
 doc.querySelector=s=>s==='#bpf-include-annex'?{checked:true}:s==='#status'?status:null;
 vm.runInContext(annex,context,{timeout:7000});
 const annexRows=context.bpfAnnexRows();
 const rowGroup=annexRows.filter(x=>x.grouped&&x.row.code==='4.11.2');
 assert.equal(rowGroup.length,2,filename+': PDF needs two consolidated F groups');
 context.bpfAppendCompactAnnex(fakePdf).then(count=>{
  assert(count>0);
  const rendered=pageDrawn.join(' ');
  assert(rendered.includes('F1'),filename+': first group missing on PDF');
  assert(rendered.includes('F2'),filename+': second group missing on PDF');
  assert.equal(rendered.split('Faltou registro profissional').length-1,1,filename+': group NC duplicated on PDF');
  assert(!rendered.includes('Orientação ao inspetor'),filename+': inspector guidance leaked in annex');
  console.log('TESTES OK',filename,': 4.11.2 desenho, F1/F2 Sim/Não único, Outro, 4.3.3/4.10.3, OBS/NC e anexo consolidado.');
 }).catch(e=>{console.error(e);process.exitCode=1;});
 assert(html.includes("if(/^BPF_FGroup(?:Note|Choice|Selected|Other)_/.test(name))state[name]=value;"),filename+': group choices missing in PDF JSON');
}
