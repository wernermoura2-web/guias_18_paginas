#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
async function main(){
 for(const filename of ['individual.html','equipe.html']){
  const html=fs.readFileSync(filename,'utf8');
  const start=html.indexOf('function bpfAnnexRows(){');
  const end=html.indexOf('</script>',start);
  assert(start>=0&&end>start,filename+': anexo PDF não encontrado');
  const annex=html.slice(start,end);
  assert(!annex.includes("text('Orientação ao inspetor:"),filename+': orientação ainda aparece no anexo');
  assert(html.includes("guidance.textContent='Orientação ao inspetor: '+phrase.guidance"),filename+': orientação desapareceu da tela do F');
  const drawn=[];
  const page={
   drawText:(str)=>drawn.push(String(str)),
   drawRectangle:()=>{}
  };
  const pdf={
   embedFont:async(which)=>({widthOfTextAtSize:(s,size)=>String(s).length*size*.5}),
   addPage:()=>page
  };
  const context={
   BPF_PHRASES:[{page:2,rows:[{code:'4.3.5',phrases:[{text:'A higienização do reservatório foi avaliada.',guidance:'ORIENTACAO_SECRETA_NAO_IMPRIMIR',appcc:'PCC'}],scopes:[{col:1,name:'ReservatorioTeste'}]}]}],
   values:{ENVASADORA:'Teste de ensaio',DATA:'05/11/2026',BPF_F_ReservatorioTeste_1:'0',BPF_Obs_ReservatorioTeste_1:'Observação registrada pelo fiscal'},
   bpfPhraseName:(s,i)=>'BPF_F_'+s.name+'_'+(i+1),
   bpfNoteName:(s,i)=>'BPF_Obs_'+s.name+'_'+(i+1),
   document:{querySelector:()=>({checked:true})},
   PDFLib:{StandardFonts:{Helvetica:'Helvetica',HelveticaBold:'HelveticaBold'},rgb:()=>({})}
  };
  vm.createContext(context);
  vm.runInContext(annex,context,{timeout:6000});
  const pages=await context.bpfAppendCompactAnnex(pdf);
  assert(pages>=1,filename+': anexo não criado');
  const out=drawn.join(' ');
  assert(out.includes('A higienização do reservatório foi avaliada.'),filename+': frase do item não impressa');
  assert(out.includes('Observação registrada pelo fiscal'),filename+': observação do fiscal ausente');
  assert(out.includes('PCC'),filename+': classificação ausente');
  assert(!out.includes('ORIENTACAO_SECRETA_NAO_IMPRIMIR'),filename+': orientação do inspetor presente no PDF');
  assert(!out.includes('Orientação ao inspetor:'),filename+': título orientação presente no PDF');
  console.log('TESTE OK',filename,': anexo gerado sem orientação, contendo frase, classificação e observação; botão F mantido.');
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
