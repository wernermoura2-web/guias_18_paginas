#!/usr/bin/env node
/* Teste da regra PCC na classificacao automatica: dois modos. */
const fs=require('fs'),vm=require('vm'),assert=require('assert');
for(const filename of ['individual.html','equipe.html']){
 const s=fs.readFileSync(filename,'utf8');
 const p=s.indexOf('const BPF_PHRASES=')+'const BPF_PHRASES='.length;
 const phrases=JSON.parse(s.slice(p,s.indexOf('];',p)+1));
 const g=s.indexOf('const GUIDE_DATA=')+'const GUIDE_DATA='.length;
 const data=JSON.parse(s.slice(g,s.indexOf(';</script>',g)));
 const a=s.indexOf('const BPF_PCC_RISK_MAP='),b=s.indexOf('function recalc(){',a);
 assert(a>=0&&b>a,filename+' helper');
 assert(s.includes(' bpfOverridePCCRisk();\n const levels='),filename+' recalc em tempo real');
 assert(s.includes("pccPage.drawText(line")&&s.includes("BPF_MATRIX_PCC_TEXT.split"),filename+' PDF');
 assert(s.includes("bpf-faixa-pcc-matriz"),filename+' matriz na tela');
 const source=s.slice(a,b);
 function run(pageNum,answer,expectedGroup,expectedScore,expectedPage){
  const page=phrases.find(x=>x.page===pageNum);
  let found;
  for(const row of page.rows)for(const scope of row.scopes)
   for(let i=0;i<scope.phrases.length;i++)
    if(scope.phrases[i].appcc==='PCC'&&!found)found={scope,i};
  assert(found,filename+' pagina '+pageNum+' sem PCC');
  const values={};
  values['BPF_F_'+found.scope.name+'_'+(found.i+1)]=answer;
  values[expectedGroup]='BAIXO';values[expectedScore]='1';
  const context={BPF_PHRASES:phrases,D:data,values,bpfPhraseName:(scope,i)=>'BPF_F_'+scope.name+'_'+(i+1)};
  vm.createContext(context);vm.runInContext(source+';this.applyPCC=bpfOverridePCCRisk;',context,{timeout:3000});
  context.applyPCC();
  assert.equal(values[expectedGroup],answer==='0'?'ALTO':'BAIXO',filename+' agrupado '+pageNum);
  assert.equal(values[expectedScore],answer==='0'?'3':'1',filename+' matriz '+pageNum);
  if(answer==='0')assert.equal(values[expectedPage],'ALTO',filename+' pagina '+pageNum);
 }
 for(const [page,group,score,final] of [
  [0,'Dropdown67','Dropdown300','Dropdown5'],
  [1,'Dropdown66','Dropdown301','Dropdown10'],
  [2,'Dropdown65','Dropdown302','Dropdown15'],
  [7,'Dropdown63','Dropdown304','Dropdown40'],
  [9,'Dropdown61','Dropdown305','Dropdown50']
 ]){
  run(page,'0',group,score,final);run(page,'1',group,score,final);
 }
 console.log(filename+': regra PCC validada em 5 paginas, modos SIM e NAO.');
}
