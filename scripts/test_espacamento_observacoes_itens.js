#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
for(const file of ['individual.html','equipe.html']){
 const h=fs.readFileSync(file,'utf8');
 const begin=h.indexOf('function bpfSpaceItemObservations(text){');
 const end=h.indexOf('function bpfSyncObservation(row,page){',begin);
 assert(begin>=0&&end>begin,file+': generated observation helpers missing');
 const values={
  'OBSERVAÇÕES GERAISRow1_2':'4.2.7 C1/F2: Sim (Texto A); C2/F2: Sim (Texto A). 4.2.8 C1/F1: Não (NC: Texto B); C2/F1: Não (NC: Texto B). 4.2.9 C1/F1: Não (NC: Texto C).',
  'OBSERVAÇÕES GERAISRow1':'4.1.1 F1 — Sim (Captação 1): OBS: Inspeção concluída. 4.1.2 F1 — Não (Captação 1): NC: Problema.',
  'OBS 1':'OBSERVAÇÃO MANUAL SEM ALTERAÇÃO',
  'BPF_F_Group0_1':'0',
  'BPF_FGroupNote_2_4_3_3_G1_NC':'NC com texto que não deve mudar.'
 };
 const fieldNames={'1_4.2.7':'OBSERVAÇÕES GERAISRow1_2','1_4.2.8':'OBSERVAÇÕES GERAISRow1_2','1_4.2.9':'OBSERVAÇÕES GERAISRow1_2','0_4.1.1':'OBSERVAÇÕES GERAISRow1','0_4.1.2':'OBSERVAÇÕES GERAISRow1'};
 const before={...values};
 const c={BPF_OBSERVATION_FIELDS:fieldNames,values};
 vm.createContext(c);vm.runInContext(h.slice(begin,end),c,{timeout:4000});
 const checkSeparator=(value,a,b)=>{
   assert(value.includes(a+'\n\n'+b),file+': no blank line between '+a+' and '+b+' => '+value);
 };
 c.bpfSpaceProcessObservations();
 checkSeparator(values['OBSERVAÇÕES GERAISRow1_2'],'(Texto A).','4.2.8 C1/F1');
 checkSeparator(values['OBSERVAÇÕES GERAISRow1_2'],'(Texto B).','4.2.9 C1/F1');
 checkSeparator(values['OBSERVAÇÕES GERAISRow1'],'concluída.','4.1.2 F1');
 for(const key of ['OBSERVAÇÕES GERAISRow1','OBSERVAÇÕES GERAISRow1_2']){
  assert.equal(values[key].replace(/\s+/g,''),before[key].replace(/\s+/g,''),file+': actual observation words were changed');
  const first=values[key];c.bpfSpaceProcessObservations();assert.equal(values[key],first,file+': formatting is not idempotent');
 }
 assert.equal(values['OBS 1'],before['OBS 1'],'general notes must be preserved');
 assert.equal(values.BPF_F_Group0_1,'0','F answer changed');
 assert.equal(values.BPF_FGroupNote_2_4_3_3_G1_NC,before.BPF_FGroupNote_2_4_3_3_G1_NC,'F raw note changed');
 const saved="4.1.1 F1 — Sim (Captação 1): OBS: Inspeção concluída.";
 const newer="4.1.1 F1 — Não (Captação 1): NC: Insatisfatória.";
 const same="4.1.2 F1 — Não (Captação 1): NC: Problema.";
 const actual=c.bpfMergeObservation(saved+'\n\n'+same,'4.1.3','',"4.1.3 F1 — Sim (Captação 1): OBS: Documento correto.");
 assert(actual.includes(same+'\n\n4.1.3 F1'),file+': new item not separated by blank line');
 const revised=c.bpfMergeObservation(saved+'\n\n'+same+'\n\n'+newer,'4.1.1',newer,saved);
 assert.equal((revised.match(/4\.1\.1 F1 — Sim/g)||[]).length,1,file+': old summary duplicate');
 assert.equal((revised.match(/4\.1\.1 F1 — Não/g)||[]).length,0,file+': prior summary not removed');
 assert.equal(revised.replace(/\s+/g,'').replace(/4\.1\.1F1—Sim\(Captação1\):OBS:Inspeçãoconcluída\./g,''),same.replace(/\s+/g,''),file+': other item altered');
 assert(h.includes('function recalc(){bpfInspectorApplySaved();bpfApplyAnswers(values);bpfSpaceProcessObservations();'),file+': old JSON import not normalized');
 assert(h.includes("white-space:pre-wrap"),file+': printable line breaks not supported');
 assert(h.includes("full=String(full||'').replace(/\\r\\n?/g,'\\n')"),file+': PDF line breaks not carried through');
 assert(h.includes("for(const paragraph of part.split('\\n'))"),file+': PDF pagination does not measure blank lines');
 assert(h.includes("function bpfAnnexCompactRecords(source,index,records){"),file+': unification lost');
 assert(h.includes("function bpfInspectorOpenReview(){"),file+': inspector review lost');
 assert(h.includes("function bpfUnifiedRow(row){"),file+': F group UI lost');
 console.log('TESTES OK',file,': um espaço entre itens, original idêntico sem espaços, importação antiga, atualização de F, PDF e OBS/NC preservados.');
}
