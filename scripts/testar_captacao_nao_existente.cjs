const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const worker={self:{location:{href:'https://example.test/guias/sw-guia18.js'},addEventListener(){}},URL,Response,Headers};
vm.createContext(worker);
vm.runInContext(fs.readFileSync('sw-guia18.js','utf8')+'\nthis.attach=attachFriendlyMenu;',worker);
(async()=>{
 for(const file of ['equipe.html','individual.html']){
  const html=await (await worker.attach(new Response(fs.readFileSync(file,'utf8')),new URL('https://example.test/guias/'+file))).text();
  const start=html.indexOf('function bpfCatchmentDeclared('),end=html.indexOf('function bpfReservoirHasSource(',start);
  assert(start>=0&&end>start);
  const status=html.match(/const bpfCatchmentStatuses=\{[^\n]+\};/)[0];
  const detect=html.match(/function bpfDetectCatchmentStatus\(text\)\{[^\n]+\}/)[0];
  const values={BPF_CatchmentStatus_1:'active',BPF_CatchmentStatus_4:'absent',fill_5:'Nome anterior'};
  const ctx=vm.createContext({values,BPF_RESERVOIR_PAGES:[2,3,4,5],bpfPhraseName:(scope,i)=>scope.name+'_'+i});
  vm.runInContext(html.slice(start,end)+'\n'+status+'\n'+detect,ctx);
  assert.equal(vm.runInContext('bpfCatchmentStatuses.absent',ctx),'Não existente');
  assert(ctx.bpfCatchmentUnavailable(4));assert(!ctx.bpfCatchmentDeclared(4));
  assert(!ctx.bpfCatchmentUnavailable(1));
  assert(ctx.bpfScopeUnavailable({page:0},{col:4}));assert(ctx.bpfScopeUnavailable({page:1},{col:4}));
  assert(ctx.bpfReservoirExcluded(5));
  assert(Array.from(ctx.bpfDetectCatchmentStatus('Não existente')).includes('absent'));
  const scope={name:'CampoTeste',phrases:[{}]};values.CampoTeste='1';values.CampoTeste_0='0';
  ctx.bpfClearInactiveCatchment(scope,values);assert.equal(values.CampoTeste,'Off');
  values.BPF_CatchmentStatus_4='active';assert(!ctx.bpfCatchmentUnavailable(4));ctx.bpfRestoreInactiveScope(scope,values);
  assert.equal(values.CampoTeste,'1');assert.equal(values.CampoTeste_0,'0');
  assert(html.includes('absent:"NÃO EXISTENTE"'));
  console.log(file+': situação, exclusão da avaliação, reservatório, reativação e PDF OK');
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
