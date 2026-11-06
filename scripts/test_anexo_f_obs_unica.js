#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
async function main(){
 for(const filename of ['individual.html','equipe.html']){
  const html=fs.readFileSync(filename,'utf8');
  const start=html.indexOf('function bpfAnnexCompactRecords(source,index,records){');
  const end=html.indexOf('</script>',start);
  assert(start>=0&&end>start,filename+': helper do Anexo F não encontrado');
  const annex=html.slice(start,end);
  assert(annex.includes('table(bpfAnnexCompactRecords(source,index,records));'),filename+': renderização não agrupa as observações');
  const note='NC_COLETIVA_CAPTACOES_412';
  const scopes=Array.from({length:4},(_,i)=>({col:i+1,name:'G_'+(i+1),phrases:[
   {text:'A captação deve manter a integridade e a proteção da entrada de água.',appcc:'PPR'},
   {text:'Deve possuir torneira própria para coleta.',appcc:'PPR'}
  ]}));
  const row={code:'4.1.2',phrases:scopes[0].phrases,scopes};
  const values={ENVASADORA:'Inspeção Teste',DATA:'06/11/2026'};
  for(let i=0;i<4;i++){
   const scope=scopes[i];
   values['BPF_F_'+scope.name+'_1']=i<3?'0':'1';
   values['BPF_Obs_'+scope.name+'_1']=i<3?note:'OBS_CAPTACAO_4';
   values['BPF_F_'+scope.name+'_2']='1';
   values['BPF_Obs_'+scope.name+'_2']='';
  }
  const drawn=[];
  const page={drawText:str=>drawn.push(String(str)),drawRectangle:()=>{}};
  const pdf={
   embedFont:async()=>({widthOfTextAtSize:(s,size)=>String(s).length*size*.5}),
   addPage:()=>page
  };
  const context={
   BPF_PHRASES:[{page:0,rows:[row]}],values,
   bpfUnifiedRow:()=>false,
   bpfScopeLabel:(p,s)=>'Captação '+s.col,
   bpfPhraseName:(s,i)=>'BPF_F_'+s.name+'_'+(i+1),
   bpfNoteName:(s,i)=>'BPF_Obs_'+s.name+'_'+(i+1),
   document:{querySelector:()=>({checked:true})},
   PDFLib:{StandardFonts:{Helvetica:'Helvetica',HelveticaBold:'HelveticaBold'},rgb:()=>({})}
  };
  vm.createContext(context);
  vm.runInContext(annex,context,{timeout:6000});
  const raw=[
   {scope:scopes[0],answer:'Não',note},
   {scope:scopes[1],answer:'Não',note},
   {scope:scopes[2],answer:'Não',note}
  ];
  const result=context.bpfAnnexCompactRecords({page:0},0,raw);
  assert.equal(result.length,1,filename+': deveria ser UMA NC para as três captações');
  assert.equal(result[0][1],'Não');
  assert.equal(result[0][2],note);
  for(let n=1;n<=3;n++)assert(result[0][0].includes('Captação '+n),filename+': faltou Captação '+n);
  const mixed=context.bpfAnnexCompactRecords({page:0},0,raw.concat({scope:scopes[3],answer:'Sim',note:'OBS_CAPTACAO_4'}));
  assert.equal(mixed.length,2,filename+': Não/Sim devem continuar separados');
  const divergent=context.bpfAnnexCompactRecords({page:0},0,raw.concat({scope:scopes[3],answer:'Não',note:'NC_DIFERENTE'}));
  assert.equal(divergent.length,2,filename+': NC diferentes não podem ser apagadas');
  const rows=context.bpfAnnexRows();
  assert.equal(rows.length,2,filename+': Frases F1 e F2 do item 4.1.2 foram alteradas');
  const pages=await context.bpfAppendCompactAnnex(pdf);
  assert(pages>=1,filename+': anexo não gerado');
  const rendered=drawn.join(' ');
  assert.equal(rendered.split(note).length-1,1,filename+': NC aparece repetida no PDF');
  assert.equal(rendered.split('OBS_CAPTACAO_4').length-1,1,filename+': OBS aparece repetida no PDF');
  assert(rendered.includes('Captação 1')&&rendered.includes('Captação 2')&&rendered.includes('Captação 3')&&rendered.includes('Captação 4'),filename+': unidades não constam do PDF');
  assert(rendered.includes('Não')&&rendered.includes('Sim'),filename+': classificação da avaliação faltou');
  assert(!rendered.includes('Orientação ao inspetor'),filename+': orientação não pode ir para o anexo');
  assert(html.includes('function bpfInspectorOpenReview(){'),filename+': menu de revisão sumiu');
  assert(html.includes('function bpfPdfGeneralSplit(full,font,form,pdf){'),filename+': divisão das observações sumiu');
  console.log('TESTES OK',filename,': 4.1.2 F1 captações 1–3 = UMA NC, Captação 4 = UMA OBS, grupos independentes, PDF sem repetição nem perda.');
 }
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
