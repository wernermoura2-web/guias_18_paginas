#!/usr/bin/env node
'use strict';
// Executa a lógica real de atualização da lista extraída de ambos os HTML.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

for(const filename of ['individual.html','equipe.html']){
 const src=fs.readFileSync(filename,'utf8');
 function slice(start,end) {
  const i=src.indexOf(start);
  assert(i>=0,filename+': marcador inicial ausente '+start);
  const j=src.indexOf(end,i+start.length);
  assert(j>=0,filename+': marcador final ausente '+end);
  return src.slice(i,j);
 }
 const parts=[
  slice('var PCCFinal=(function(){','\n\nfunction bpfSyncPCCFinal(){'),
  slice('function bpfSyncNCLists(){','\n}\n</script>')+'\n}',
  slice('function bpfApplyAnswers(v){','\nfunction bpfOpenPhrases(')
 ];
 const mockPages=[{page:2,rows:[{code:'4.3.5',scopes:[
   {col:1,name:'TestG1',phrases:[{appcc:'PCC'},{appcc:'PPRO'},{appcc:'POP'}]}
 ]}]}];
 const titles=['','','4.3 Reservatórios da Captação 1'];
 const old=[
  'NÃO CONFORMIDADES CRÍTICAS (PCC) — Total: 1\n1. Considerando que a frase 1, do item 4.3.5, do processo 4.3 Reservatórios da Captação 1, na unidade Reservatório 1, classificada como PCC, apresentou resultado insatisfatório.',
  'NÃO CONFORMIDADES MAIORES (PPRO e PC) — Total: 1\n1. Considerando que a frase 2, do item 4.3.5, do processo 4.3 Reservatórios da Captação 1, na unidade Reservatório 1, classificada como PPRO, apresentou resultado insatisfatório.',
  'NÃO CONFORMIDADES MENORES (POP e PPR) — Total: 1\n1. Considerando que a frase 3, do item 4.3.5, do processo 4.3 Reservatórios da Captação 1, na unidade Reservatório 1, classificada como POP, apresentou resultado insatisfatório.'
 ];
 function context(values){
  const sandbox={
   values,
   BPF_PHRASES:mockPages,titles,
   bpfPhraseName:(scope,i)=>'BPF_F_'+scope.name+'_'+(i+1),
   bpfAggregateAnswers:()=>null
  };
  vm.createContext(sandbox);
  vm.runInContext(parts.join('\n'),sandbox,{timeout:8000});
  return sandbox;
 }
 const entries={BPF_F_TestG1_1:'0',BPF_F_TestG1_2:'0',BPF_F_TestG1_3:'0'};
 const values={
   'OBS 1':old.join('\n\n')+'\n\nOBSERVAÇÃO MANUAL DO INSPETOR: verificar evidências.',
   BPF_NCGenerated:JSON.stringify({criticas:old[0],maiores:old[1],menores:old[2]}),
   ...entries
 };
 const sandbox=context(values);
 sandbox.bpfApplyAnswers(values);
 const txt=values['OBS 1'];
 assert(txt.includes('Frase 1, do item 4.3.5, do processo 4.3 Reservatórios da Captação 1, na unidade Reservatório 1, classificada como PCC'),filename+': resumo PCC não atualizado');
 assert(txt.includes('classificada como PPRO'),filename+': resumo maior não atualizado');
 assert(txt.includes('classificada como POP'),filename+': resumo menor não atualizado');
 assert(!txt.includes('Considerando que a frase'),filename+': conteúdo longo anterior ainda no campo');
 assert(txt.includes('OBSERVAÇÃO MANUAL DO INSPETOR: verificar evidências.'),filename+': anotação manual perdida');
 assert(Object.keys(JSON.parse(values.BPF_NCGenerated)).length===3,filename+': metadados incorretos');
 sandbox.bpfApplyAnswers(values);
 assert.equal(values['OBS 1'],txt,filename+': regeneração duplicou ou alterou seções');
 const fresh={'OBS 1':'OBSERVAÇÃO PRÓPRIA',...entries};
 const freshSandbox=context(fresh);
 freshSandbox.bpfApplyAnswers(fresh);
 assert(fresh['OBS 1'].includes('Frase 1, do item 4.3.5'),filename+': nova lista não gerada');
 assert(fresh['OBS 1'].includes('OBSERVAÇÃO PRÓPRIA'),filename+': observação própria foi perdida');
 const blank={'OBS 1':'Texto sem registro de NC'};
 const blankSandbox=context(blank);
 blankSandbox.bpfApplyAnswers(blank);
 assert.equal(blank['OBS 1'],'Texto sem registro de NC',filename+': guia em branco alterado');
 console.log('TESTES OK',filename,': JSON antigo migrado; textos manuais mantidos; novas listas resumidas; sem duplicação.');
}
