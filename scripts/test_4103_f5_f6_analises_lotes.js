#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
for(const file of ['individual.html','equipe.html']){
 const src=fs.readFileSync(file,'utf8');
 const cut=(start,end)=>{
  const i=src.indexOf(start),j=src.indexOf(end,i+start.length);
  assert(i>=0&&j>i,file+': marcador ausente '+start);
  return src.slice(i,j);
 };
 const panels=cut('function bpfPanels(page,row){','function bpfGroupNoteName(');
 const option=cut('function bpfUnifiedOption(row,e){','function bpfInitUnifiedFields(');
 const context={bpfPhraseName:(scope,i)=>scope.name+'_'+i};
 vm.createContext(context);
 vm.runInContext(panels+'\n'+option,context,{timeout:4000});
 const phrases=Array.from({length:17},(_,i)=>({text:'Frase '+(i+1),appcc:'PC'}));
 const row={code:'4.10.3',phrases,scopes:[{col:1,name:'Laboratorio',phrases}]};
 const all=context.bpfPanels({page:11},row);
 assert.equal(all.length,6);
 assert.equal(all[4].entries[0].index,15,file+': F5 apontando para a frase errada');
 assert.equal(all[5].entries[0].index,16,file+': F6 apontando para a frase errada');
 assert.equal(all[4].label,'F5 — Cinco análises mensais de um lote envasado');
 assert.equal(all[5].label,'F6 — Cinco unidades analisadas de todos os lotes envasados');
 assert.equal(context.bpfUnifiedOption(row,all[4].entries[0]),'Cinco análises mensais de um lote envasado');
 assert.equal(context.bpfUnifiedOption(row,all[5].entries[0]),'Cinco unidades analisadas de todos os lotes envasados');
 assert(src.includes('const {page:source,row,panel,entries,answer,note,other}=item'),file+': PDF não renderiza grupos F');
 assert(src.includes("bpfUnifiedOption(row,e)"),file+': anexo PDF não usa opção atualizada');
 assert(src.includes('function bpfPdfGeneralSplit(full,font,form,pdf){'),file+': divisão de PDF ausente');
 console.log('TESTES OK',file,'F5 mensal de um lote; F6 cinco unidades em todos os lotes; mesmo anexo PDF; 17 frases preservadas.');
}
