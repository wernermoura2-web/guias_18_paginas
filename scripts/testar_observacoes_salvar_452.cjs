const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ctx=vm.createContext({URL,Response,Headers,self:{location:{href:'https://example.test/sw-guia18.js'},addEventListener(){}}});
vm.runInContext(fs.readFileSync(path.join(root,'sw-guia18.js'),'utf8'),ctx);
(async()=>{
 for(const mode of ['individual','equipe']){
  const h=await (await ctx.attachFriendlyMenu(new Response(fs.readFileSync(path.join(root,mode+'.html'),'utf8')),new URL('https://example.test/'+mode+'.html'))).text();
  const field='OBSERVAÇÕES GERAIS';
  const first='4.5.2 F1 — Não se aplica (Garrafões retornáveis).';
  const other='4.5.3 F1 — SIM: Planilha de registro.\nNF-e de devolução do produto reprovado; F2 — Não (Saneantes).';
  const third='4.5.4 F1 — Não se aplica (Garrafões retornáveis).';
  const values={'BPF_Summary_6_4.5.2':first,'BPF_Summary_6_4.5.3':other,'BPF_Summary_6_4.5.4':third};
  const sandbox=vm.createContext({values,BPF_OBSERVATION_FIELDS:{'6_4.5.2':field,'6_4.5.3':field,'6_4.5.4':field},bpfSingleBlankObservationFields:new Set()});
  vm.runInContext(h.slice(h.indexOf('function bpfSpaceItemObservations('),h.indexOf('function bpfObservationMarker(')),sandbox);
  // Simulate an inspection with multiline F notes and already duplicated continuations.
  const manual='Observação manual que não deve desaparecer.';
  let text=[first,other,third,manual,...Array(100).fill(other.split('\n')[1]),...Array(100).fill(other)].join('\n');
  text=sandbox.bpfFormatProcessObservation(text,field);
  assert.equal(text.split('NF-e de devolução').length-1,1);
  assert.equal(text.split('4.5.3 F1').length-1,1);
  assert(text.includes(manual));
  const original=text;
  for(let i=0;i<50;i++){
   text=sandbox.bpfMergeObservation(text,'4.5.2',first,first);
   text=sandbox.bpfFormatProcessObservation(text,field);
  }
  assert.equal(text,original);
  const update='4.5.3 F1 — SIM: Novo registro.\nNova nota em outro parágrafo.';
  text=sandbox.bpfMergeObservation(text,'4.5.3',other,update);
  values['BPF_Summary_6_4.5.3']=update;
  text=sandbox.bpfFormatProcessObservation(text,field);
  assert(!text.includes('NF-e de devolução'));
  assert.equal(text.split('Nova nota em outro parágrafo.').length-1,1);
  assert(text.includes(first)&&text.includes(third)&&text.includes(manual));
  console.log(mode+': recuperação de 200 cópias, 50 salvamentos de 4.5.2 e preservação de outros itens OK');
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
