#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
for(const filename of ['individual.html','equipe.html']){
 const html=fs.readFileSync(filename,'utf8');
 const read=(begin,end)=>{const i=html.indexOf(begin),j=html.indexOf(end,i+begin.length);assert(i>=0&&j>i,filename+': missing '+begin);return html.slice(i,j)};
 const htmlFit=read('function bpfFitProcessObservation(el){','function sync(){');
 const pdfFit=read('function bpfObservationFontSize(text,font,width,height){','async function bpfExportEditable(){');
 const context={CSS:{escape:s=>s},values:{BPF_ObsGeneralFlow:JSON.stringify({font:9})}};
 vm.createContext(context);
 vm.runInContext(htmlFit+'\n'+pdfFit,context,{timeout:5000});
 const fakeArea=(text,width,height,kind='text')=>{
   const area={
     value:text,dataset:{field:'OBSERVAÇÕES GERAISRow1_7'},style:{},clientWidth:width,clientHeight:height,
     classList:{contains:x=>x===kind||x==='bpf-process-observation'},
     get scrollHeight(){
       const size=parseFloat(this.style.fontSize)||16;
       const charsPerLine=Math.max(1,Math.floor((this.clientWidth-7)/(size*.52)));
       const lines=text.split('\n').reduce((n,p)=>n+Math.max(1,Math.ceil(p.length/charsPerLine)),0);
       return lines*size*1.14+2;
     },
     get scrollWidth(){return this.clientWidth;}
   };
   const mirror={
     style:{},clientWidth:width,clientHeight:height,textContent:'',
     get scrollHeight(){
       const size=parseFloat(this.style.fontSize)/100*width||16;
       const charsPerLine=Math.max(1,Math.floor((this.clientWidth-7)/(size*.52)));
       return this.textContent.split('\n').reduce((n,p)=>n+Math.max(1,Math.ceil(p.length/charsPerLine)),0)*size*1.14+2;
     },
     get scrollWidth(){return this.clientWidth;},
     parentElement:area
   };
   area.parentElement={clientWidth:width,querySelector:()=>mirror};
   return {area,mirror};
 };
 const value='4.2.2 F1 — Não (Condução 1): NC: '+('O registro não foi apresentado e a avaliação sanitária exige revisão. ').repeat(15)+'\n\n4.2.7 F1 — Sim: OBS: '+('Registro de higienização. ').repeat(10);
 const {area,mirror}=fakeArea(value,480,110);
 context.bpfFitProcessObservation(area);
 assert(area.style.fontSize.endsWith('px'),filename+': HTML font not set');
 const fontSize=parseFloat(area.style.fontSize);
 assert(fontSize>0&&fontSize<16,filename+': HTML font must shrink');
 assert(area.scrollHeight<=area.clientHeight+1,filename+': HTML observation clipped after fitting');
 assert(mirror.scrollHeight<=mirror.clientHeight+1,filename+': printable observation clipped after fitting');
 assert.equal(mirror.textContent,value,filename+': HTML copy changed observation text');
 assert(area.style.whiteSpace==='pre-wrap'&&area.style.overflowWrap==='anywhere');
 assert(!mirror.style.display,filename+': mirror hidden state must be restored');
 const tiny=fakeArea('curto',480,110);
 context.bpfFitProcessObservation(tiny.area);
 assert.equal(parseFloat(tiny.area.style.fontSize),16);
 const huge=fakeArea('A'.repeat(45000),300,30);
 context.bpfFitProcessObservation(huge.area);
 assert.equal(huge.area.style.overflowY,'auto',filename+': impossible HTML content should remain accessible');

 // PDF process fields must fit exactly on original page and shrink as needed.
 const font={widthOfTextAtSize:(t,size)=>String(t).length*size*.52,heightAtSize:size=>size};
 assert.equal(context.bpfObservationFontSize('Texto breve',font,500,150),9);
 const processNote='Item 4.2.2: '+('Não apresentou os controles e registros exigidos pela legislação sanitária. ').repeat(70);
 const pdfSize=context.bpfObservationFontSize(processNote,font,494,120);
 assert(pdfSize>0.25&&pdfSize<9,filename+': PDF font should shrink and remain positive');
 assert.equal(processNote.includes('legislação sanitária'),true);
 assert.throws(()=>context.bpfObservationFontSize('A'.repeat(2e6),font,20,1),/extenso demais/,filename+': too much text must fail clearly, never clip silently');
 assert(html.includes("name==='OBS 1'||name==='obs_gerais_continuacao')?pdfFlow.size:"),filename+': general NC flow must remain distinct from process font');
 assert(html.includes('const extraObsPages=bpfPdfAppendGeneralPages(pdf,form,observationFont,pdfFlow)'),filename+': NC continuation must remain');
 assert(!pdfFit.includes('pdf.insertPage(')&&!pdfFit.includes('pdf.addPage('),filename+': process PDF must not add pages');
 assert(html.includes('const mirror=el.parentElement.querySelector('),filename+': missing print mirror');
 assert(html.includes('function bpfSyncNCLists(){'),filename+': NC lists removed');
 assert(html.includes('function bpfAnnexCompactRecords(source,index,records){'),filename+': unification of equal notes removed');
 assert(html.includes('function bpfSpaceProcessObservations(){'),filename+': spacing between items removed');
 console.log('TESTES OK',filename+': fonte HTML/PDF ajustada ao campo; texto íntegro, sem recorte ou páginas extras nos processos; NC com continuação original.');
}
