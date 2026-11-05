#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

async function main(){
 for(const filename of ['individual.html','equipe.html']){
  const html=fs.readFileSync(filename,'utf8');
  const libStart=html.indexOf('<script>!function(t,e)');
  assert(libStart>=0,filename+': pdf-lib incorporado não encontrado');
  const libJS=html.slice(libStart+8,html.indexOf('</script>',libStart));
  const library={};const context={exports:library,module:{exports:library},Buffer,Uint8Array,ArrayBuffer,TextEncoder,TextDecoder,atob,btoa,setTimeout,clearTimeout};
  vm.createContext(context);
  vm.runInContext(libJS,context,{timeout:20000});
  const PDFLib=context.module.exports;
  assert.equal(typeof PDFLib.PDFDocument.load,'function',filename+': pdf-lib indisponível');
  const marker='const BPF_EMBEDDED_PDF="';
  const b64start=html.indexOf(marker)+marker.length;
  assert(b64start>marker.length);
  const b64end=html.indexOf('"',b64start);
  const pdf=await PDFLib.PDFDocument.load(Buffer.from(html.slice(b64start,b64end),'base64'));
  const form=pdf.getForm();
  const first=form.getTextField('OBS 1');
  const second=form.getTextField('obs_gerais_continuacao');
  assert(first&&second,filename+': campos reais das páginas 14 e 15 ausentes');

  const j=html.indexOf('function bpfPdfGeneralSplit(full,font,form,pdf){');
  const k=html.indexOf('// Start observations at 9 pt',j);
  assert(j>=0&&k>j,filename+': funções de PDF não inseridas');
  // Use the same VM realm as pdf-lib: PDFPage.insertPage validates Array identity.
  context.PDFLib=PDFLib;context.console=console;
  vm.runInContext(html.slice(j,k),context,{timeout:15000});
  // Compare against the former conservative fit: 1.50 line-height, 18pt insets.
  const oldCode=html.slice(j,k)
    .replace('function bpfPdfGeneralSplit(full,font,form,pdf){','function bpfPdfBaselineSplit(full,font,form,pdf){')
    .replace('return countLines(part,Math.max(25,box.width-14))*h*1.32<=Math.max(1,box.height-14);',
             'return countLines(part,Math.max(25,box.width-18))*h*1.5<=Math.max(1,box.height-18);')
    .replace('if(boundary>0&&cut-boundary<=28)cut=boundary+1;',
             'if(boundary>0&&boundary>=cut-125)cut=boundary+1;');
  assert(!oldCode.includes("function bpfPdfGeneralSplit(full,font,form,pdf){"),filename+': baseline not isolated');
  vm.runInContext(oldCode,context,{timeout:15000});
  const run=context;
  const font=await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
  const cases=[
   {name:'curto',text:'Observações gerais da inspeção sanitária.'},
   {name:'páginas 14 e 15',text:Array.from({length:90},(_,i)=>'Não conformidade '+(i+1)+'; frase 1; item 4.3.5; Reservatórios da Captação 1.').join('\n')},
   {name:'páginas adicionais',text:Array.from({length:900},(_,i)=>'Não conformidade '+(i+1)+'; frase 1; item 4.3.5; Reservatórios da Captação 1.').join('\n')}
  ];
  for(const c of cases){
   const flow=run.bpfPdfGeneralSplit(c.text,font,form,pdf);
   const baseline=run.bpfPdfBaselineSplit(c.text,font,form,pdf);
   assert.equal([flow.first,flow.second,...flow.extras].join(''),c.text,filename+': perdeu conteúdo: '+c.name);
   if(c.name!=='curto'){
    assert(flow.first.length>baseline.first.length,filename+': o ajuste não aproveitou mais a primeira página');
    console.log('APROVEITAMENTO DA PAGINA 14',filename,c.name,'antes',baseline.first.length,'depois',flow.first.length);
   }
   if(c.name==='curto')assert.equal(flow.extras.length,0);
   if(c.name==='páginas 14 e 15'){assert(flow.second.length>0,filename+': não preencheu a continuação da página 15');assert.equal(flow.extras.length,0,filename+': criou páginas além das duas previstas');}
   if(c.name==='páginas adicionais')assert(flow.extras.length>0,filename+': não criou páginas extras');
   console.log('DIVISÃO OK',filename,c.name,'chars primeira',flow.first.length,'segunda',flow.second.length,'extras',flow.extras.length);
  }
  const flow=run.bpfPdfGeneralSplit(cases[2].text,font,form,pdf);
  first.enableMultiline();first.setText(flow.first);first.acroField.setDefaultAppearance('/Helv 9 Tf 0 g');first.defaultUpdateAppearances(font);
  second.enableMultiline();second.setText(flow.second);second.acroField.setDefaultAppearance('/Helv 9 Tf 0 g');second.defaultUpdateAppearances(font);
  const originalCount=pdf.getPageCount();
  console.log('TAMANHO PDF ORIGINAL',filename,pdf.getPage(0).getSize(),pdf.getPageCount());
  const extraCount=run.bpfPdfAppendGeneralPages(pdf,form,font,flow);
  assert.equal(extraCount,flow.extras.length);
  assert.equal(pdf.getPageCount(),originalCount+extraCount);
  const bytes=await pdf.save();
  const reloaded=await PDFLib.PDFDocument.load(bytes);
  const loadedForm=reloaded.getForm();
  const full=[
   loadedForm.getTextField('OBS 1').getText(),
   loadedForm.getTextField('obs_gerais_continuacao').getText(),
   ...Array.from({length:extraCount},(_,i)=>loadedForm.getTextField('BPF_ObsGerais_Extra_'+(i+1)).getText())
  ].join('');
  assert.equal(full,cases[2].text,filename+': texto integral não recuperado do PDF editável');
  console.log('PDF REAL OK',filename,'páginas originais',originalCount,'adicionais',extraCount,'total',reloaded.getPageCount());
 }
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
