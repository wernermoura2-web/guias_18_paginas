#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
for(const file of ['individual.html','equipe.html']){
 const html=fs.readFileSync(file,'utf8');
 const section=(start,end)=>{
  const i=html.indexOf(start);
  const j=html.indexOf(end,i+start.length);
  assert(i>=0&&j>i,file+' missing '+start);
  return html.slice(i,j);
 };
 const helpers=section('function bpfScopeLabel(page,scope){','function bpfPanels(page,row){');
 const observation=section('function bpfSyncObservation(row,page){','function bpfDismissEditor(){');
 const values={};
 const sandbox={
  values,
  bpfUnifiedRow:()=>false,
  bpfScopeLabel:null,
  BPF_OBSERVATION_FIELDS:{'1_4.2.2':'OBS_CONDUCAO','7_4.6.11':'OBS_RETORNAVEIS','8_4.6.12':'OBS_DESCARTAVEIS'},
  bpfSummaryName:(page,row)=>'Summary_'+page.page+'_'+row.code,
  bpfPhraseName:(s,i)=>'F_'+s.name+'_'+i,
  bpfNoteName:(s,i)=>'N_'+s.name+'_'+i,
  bpfMergeObservation:(text,code,previous,summary)=>summary
 };
 vm.createContext(sandbox);
 vm.runInContext(helpers+'\n'+observation,sandbox,{timeout:4000});
 const label=sandbox.bpfScopeLabel;
 for(let n=1;n<=4;n++){
  assert.equal(label({page:0},{col:n}),'Captação '+n,file+' changed Captação');
  assert.equal(label({page:1},{col:n}),'Condução '+n,file+' changed Condução');
  assert.equal(label({page:2},{col:n}),'Reservatório '+n);
  for(const page of [7,8]){
   assert.equal(label({page},{col:n}),n===4?'Higienização de tampas':'Linha '+n,file+': hygiene label '+page+' '+n);
  }
  assert.equal(label({page:9},{col:n}),'Linha '+n,file+' changed Envase retornáveis');
  assert.equal(label({page:10},{col:n}),'Linha '+n,file+' changed Envase descartáveis');
 }
 function checkObs(page,code,scopeNum,expected){
  const scope={col:scopeNum,name:'G_'+page+'_'+code,phrases:[{appcc:'POP'}]};
  const row={code,phrases:scope.phrases,scopes:[scope]};
  values[sandbox.bpfPhraseName(scope,0)]='0';
  values[sandbox.bpfNoteName(scope,0)]='Não conformidade de teste';
  sandbox.bpfSyncObservation(row,{page});
  const key=sandbox.BPF_OBSERVATION_FIELDS[page+'_'+code];
  const v=values[key];
  assert(v.includes(expected),file+': generated observation should include '+expected+' but is '+v);
  assert(!v.includes('Captação 4')||page===0,file+': old scope label remained');
  if(page===1)assert(!v.includes('Captação 2'),file+': condução contains incorrect captação');
  if(page===7||page===8)assert(!v.includes('Linha 4'),file+': tampas contains Linha 4');
 }
 checkObs(1,'4.2.2',2,'Condução 2');
 checkObs(7,'4.6.11',4,'Higienização de tampas');
 checkObs(8,'4.6.12',4,'Higienização de tampas');
 const finalPCC=section('function bpfSyncPCCFinal(){','function bpfGeneralFullText(){');
 const nc=section('function bpfSyncNCLists(){','function bpfInitFields(');
 const annex=section('function bpfAnnexRows(){','</script>');
 assert(finalPCC.includes('const unit=bpfScopeLabel(page,scope)'),file+': PCC still uses old labels');
 assert(nc.includes('const unit=bpfScopeLabel(page,scope)'),file+': NC still uses old labels');
 assert(annex.includes("bpfScopeLabel(source,r.scope)+' / F'"),file+': compact PDF still uses old labels');
 assert(!finalPCC.includes("page.page<2?'Captação '"),file+': captação still hardcoded in PCC');
 assert(!nc.includes("page.page<2?'Captação '"),file+': captação still hardcoded in NC');
 assert(!annex.includes("source.page<2?'Captação '"),file+': captação still hardcoded in PDF');
 assert(html.includes("async function bpfAppendCompactAnnex(pdf){"),file+': compact PDF removed');
 assert(html.includes("function bpfPdfGeneralSplit(full,font,form,pdf){"),file+': PDF overflow missing');
 assert(html.includes("function bpfOpenUnifiedPhrases(row,page){"),file+': custom F UI missing');
 console.log('TESTES OK',file,': Condução, Higienização de tampas (retornáveis/descartáveis), observações, PCC, NC, anexo PDF; captação/envase preservados');
}
