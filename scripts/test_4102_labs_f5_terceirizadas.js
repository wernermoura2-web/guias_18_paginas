#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class E{
 constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.checked=false;this.value='';this.style={};this.disabled=false;this.parentElement=null;this._text='';}
 set textContent(v){this._text=String(v);this.children=[];}
 get textContent(){return this._text;}
 append(...items){for(const v of items){if(v==null)continue;this.children.push(v);if(typeof v==='object')v.parentElement=this;}}
 setAttribute(k,v){this[k]=v;}
 insertBefore(v,before){const at=this.children.indexOf(before);if(at<0)this.append(v);else{this.children.splice(at,0,v);v.parentElement=this;}}
 querySelectorAll(q){
  const all=[];const visit=n=>{for(const c of n.children||[]){if(c&&typeof c==='object'){all.push(c);visit(c);}}};visit(this);
  if(q==='input[type=checkbox]')return all.filter(x=>x.tagName==='input'&&x.type==='checkbox');
  if(q==='input[type=radio]')return all.filter(x=>x.tagName==='input'&&x.type==='radio');
  if(q==='textarea')return all.filter(x=>x.tagName==='textarea');
  if(q==='input[type=text]')return all.filter(x=>x.tagName==='input'&&x.type==='text');
  return all;
 }
 querySelector(q){if(q.includes('textarea[data-note="'))return this.querySelectorAll('textarea').find(x=>q.includes(x.dataset.note))||null;return null;}
 scrollIntoView(){}
 focus(){}
 remove(){}
}
async function main(){
for(const filename of ['individual.html','equipe.html']){
 const html=fs.readFileSync(filename,'utf8');
 const cut=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert(i>=0&&j>i,filename+' missing '+a);return html.slice(i,j);};
 const helpers=cut('function bpfScopeLabel(page,scope){','function bpfOpenPhrases(row,page){');
 const editor=cut('function bpfOpenPhrases(row,page){','function bpfMountDescriptions(){');
 const init=cut('function bpfInitFields(data){','function bpfMergeObservation(');
 const sync=cut('function bpfSyncObservation(row,page){','function bpfDismissEditor(){');
 const make=(code,count)=>{const phrases=Array.from({length:count},(_,i)=>({
  text:'Requisito técnico '+(i+1),appcc:code==='4.10.2'?'PPR':'PC',
  guidance:'Orientação '+(i+1)
 }));return {code,phrases,scopes:[{col:1,name:'Teste_'+code,phrases}]};};
 const row=make('4.10.2',3),row4103=make('4.10.3',17);
 const page={page:11,rows:[row,row4103]};
 const values={};
 const host=new E('main');let dlg=null;host.after=x=>{dlg=x;};
 const doc={createElement:t=>new E(t),createTextNode:t=>String(t),getElementById:()=>null,head:new E('head'),querySelector:q=>q==='#status'?{textContent:''}:null};
 const alerts=[];
 const ctx={BPF_PHRASES:[page],values,host,document:doc,
  bpfPhraseName:(s,i)=>'BPF_F_'+s.name+'_'+(i+1),
  bpfNoteName:(s,i)=>'BPF_NOTE_'+s.name+'_'+(i+1),
  bpfSummaryName:(p,r)=>'BPF_SUM_'+p.page+'_'+r.code,
  bpfMergeObservation:(v,code,old,next)=>next,
  BPF_OBSERVATION_FIELDS:{'11_4.10.2':'OBS_LABS'},
  bpfDismissEditor:()=>true,bpfSyncPCCFinal:()=>{},changed:()=>{},recalc:()=>{},
  alert:m=>alerts.push(m),dirty:false
 };
 vm.createContext(ctx);
 vm.runInContext(helpers+'\n'+init+'\n'+sync+'\n'+editor,ctx,{timeout:8000});
 assert(ctx.bpfUnifiedRow(row));
 assert.equal(ctx.bpfPanels(page,row).length,2,filename+': 4.10.2 must be split in 2 groups');
 const p=ctx.bpfPanels(page,row);
 assert.equal(p[0].label,'F1 — Laboratório próprio e/ou terceirizado');
 assert.equal(p[1].label,'F3 — Contrato de terceirização');
 assert.equal(p[0].entries.length,2);
 assert.equal(p[1].entries.length,1);
 assert.equal(ctx.bpfUnifiedOption(row,p[0].entries[0]),'Laboratório próprio');
 assert.equal(ctx.bpfUnifiedOption(row,p[0].entries[1]),'Laboratório terceirizado');
 const fields={fields:{}};ctx.bpfInitFields(fields);
 assert(fields.fields.BPF_FGroupChoice_11_4_10_2_G1);
 assert(fields.fields.BPF_FGroupSelected_11_4_10_2_G1);
 assert(fields.fields.BPF_FGroupNote_11_4_10_2_G1_OBS);
 assert(fields.fields.BPF_FGroupNote_11_4_10_2_G2_NC);
 ctx.bpfOpenPhrases(row,page);
 const checks=dlg.querySelectorAll('input[type=checkbox]');
 const radios=dlg.querySelectorAll('input[type=radio]');
 const areas=dlg.querySelectorAll('textarea');
 assert.equal(checks.length,2,filename+': F1 must show two selectable laboratory types; F3 no checkboxes');
 assert.equal(radios.length,4,filename+': both F groups need one Sim/Não');
 assert.equal(areas.length,2,filename+': one observation per F group');
 assert(!dlg.children.some(x=>String(x.textContent).includes('Qualquer Não torna o item Não')),filename+': instructions not removed');
 const f1radio=radios.find(x=>x.name===ctx.bpfUnifiedKey(page,row,p[0],'Choice')&&x.value==='1');
 f1radio.checked=true;f1radio.onchange();
 assert.equal(checks.filter(c=>c.checked).length,0);
 checks[0].checked=true;checks[0].onchange();
 checks[1].checked=true;checks[1].onchange();
 assert.equal(values[p[0].entries[0].name],'1');
 assert.equal(values[p[0].entries[1].name],'1');
 assert.equal(JSON.parse(values[ctx.bpfUnifiedKey(page,row,p[0],'Selected')]).length,2);
 areas[0].value='Análises realizadas pelos dois laboratórios';areas[0].oninput();
 const f3radio=radios.find(x=>x.name===ctx.bpfUnifiedKey(page,row,p[1],'Choice')&&x.value==='0');
 f3radio.checked=true;f3radio.onchange();
 assert.equal(values[p[1].entries[0].name],'0',filename+': F3 radio must populate original F3');
 assert(!dlg.bpfCommit(),filename+': F3 Não requires NC');
 assert(alerts.some(t=>t.includes('campo NC')));
 areas[1].value='Contrato de terceirização não apresentado';areas[1].oninput();
 assert(dlg.bpfCommit(),filename+': 4.10.2 cannot be saved with both groups complete');
 assert(values.OBS_LABS.includes('Laboratório próprio'));
 assert(values.OBS_LABS.includes('Laboratório terceirizado'));
 assert(values.OBS_LABS.includes('NC: Contrato de terceirização não apresentado'));
 assert.equal(ctx.bpfUnifiedAnswer(page,row,p[0]),'1');
 assert.equal(ctx.bpfUnifiedAnswer(page,row,p[1]),'0');
 // Original F classifications and stored notes remain individual for calculations/PDF.
 assert.equal(values[ctx.bpfNoteName(row.scopes[0],2)],'Contrato de terceirização não apresentado');
 assert(html.includes("if(/^BPF_FGroup(?:Note|Choice|Selected|Other)_/.test(name))state[name]=value;"));
 ctx.bpfOpenPhrases(row,page);
 assert.equal(dlg.querySelectorAll('input[type=checkbox]').filter(x=>x.checked).length,2);
 assert.equal(dlg.querySelectorAll('input[type=radio]').filter(x=>x.checked).length,2);
 assert.equal(dlg.querySelectorAll('textarea').length,2);
 // F5 of 4.10.3 is now the corrected outsourced monthly analyses label.
 const g=ctx.bpfPanels(page,row4103);
 assert.equal(g[4].label,'F5 — Cinco análises mensais terceirizadas de um lote envasado');
 assert.equal(g[5].label,'F6 — Cinco unidades analisadas de todos os lotes envasados');
 assert.equal(ctx.bpfUnifiedOption(row4103,g[4].entries[0]),'Cinco análises mensais terceirizadas de um lote envasado');
 // PDF compact annex uses the same groups and prints one NC per group.
 const annex=cut('function bpfAnnexRows(){','</script><script>');
 const drawn=[];
 const fakePage={drawText:t=>drawn.push(String(t)),drawRectangle:()=>{}};
 const fakePdf={embedFont:async()=>({widthOfTextAtSize:(s,size)=>String(s).length*size*.45}),addPage:()=>fakePage};
 ctx.PDFLib={StandardFonts:{Helvetica:'Helvetica',HelveticaBold:'HelveticaBold'},rgb:()=>({})};
 doc.querySelector=q=>q==='#bpf-include-annex'?{checked:true}:q==='#status'?{textContent:''}:null;
 vm.runInContext(annex,ctx,{timeout:10000});
 const grp=ctx.bpfAnnexRows().filter(x=>x.row.code==='4.10.2');
 assert.equal(grp.length,2,filename+': PDF expects F1 and F3 groups');
 assert(grp.every(x=>x.grouped),filename+': PDF groups required');
 assert.equal(grp[0].entries.length,2);
 assert.equal(grp[1].entries.length,1);
 const count=await ctx.bpfAppendCompactAnnex(fakePdf);
 assert(count>0);
 const output=drawn.join(' ');
 assert(output.includes('Contrato de terceirização'));
 assert(output.includes('Laboratório próprio'));
 assert(output.includes('Laboratório terceirizado'));
 assert.equal(output.split('Contrato de terceirização não apresentado').length-1,1,filename+': NC duplicated');
 assert(!output.includes('Orientação ao inspetor'),filename+': inspector guidance leaks to PDF');
 console.log('TESTES OK',filename,': 4.10.2 F1 próprio/terceirizado e F3 Sim/Não; F5 terceirizadas; JSON, OBS/NC e anexo PDF validados.');
}
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
