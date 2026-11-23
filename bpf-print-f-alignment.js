/* Padronização da tipografia F1/F2/F3 no PDF gerado pelo Guia.
   Altera somente a apresentação das células de frases legais dos itens
   com correções recentes; não modifica respostas, cálculos ou observações. */
(function(){
'use strict';
if(window.__bpfPrintFPadrao20261123)return;
window.__bpfPrintFPadrao20261123=true;
const watched=new Set(['4.5.3','4.6.6','4.6.9','4.6.12']);
const normal=s=>String(s||'').replace(/[\u0000-\u001f]/g,' ').replace(/[\u2011\u2013\u2014]/g,'-').replace(/\s+/g,' ').trim();
function wrap(text,font,size,maxWidth){
 const words=normal(text).split(' '),lines=[];let line='';
 for(const word of words){
  const trial=line?line+' '+word:word;
  if(font.widthOfTextAtSize(trial,size)<=maxWidth){line=trial;continue;}
  if(line)lines.push(line);
  if(font.widthOfTextAtSize(word,size)<=maxWidth){line=word;continue;}
  let segment='';
  for(const char of word){
   if(segment&&font.widthOfTextAtSize(segment+char,size)>maxWidth){lines.push(segment);segment='';}
   segment+=char;
  }
  line=segment;
 }
 if(line)lines.push(line);
 return lines;
}
function layout(phrases,font,width,height){
 // Cada F começa em nova linha e todos usam o MESMO tamanho e cor.
 // Evita subdivisões verticais que reduziam desproporcionalmente o F2/F3.
 for(let size=5.9;size>=4.5;size-=.1){
  const lines=phrases.flatMap((p,i)=>wrap('F'+(i+1)+' - '+normal(p.text),font,size,width));
  const step=size*1.10;
  if(lines.length*step<=height-1.6)return {size,step,lines};
 }
 // Nunca truncar frases legais: não repintar caso a área seja insuficiente.
 return null;
}
async function bpfPrintCorrectedPhrases(pdf,sourcePages){
 if(!pdf||!sourcePages||typeof BPF_PHRASES==='undefined')return;
 const geometry=window.bpfLegalFGeometry||await fetch('./impressao/Frases_Legais_F_Geometria.json',{cache:'reload'}).then(r=>r.json());
 const font=await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
 const ink=PDFLib.rgb(.06,.06,.06),white=PDFLib.rgb(1,1,1),border=PDFLib.rgb(.36,.48,.55);
 const visible=new Set(pdf.getPages().map(p=>String(p.ref)));
 let changed=0,skipped=[];
 for(const page of BPF_PHRASES)for(const row of page.rows||[]){
  if(!watched.has(row.code)||page.page>8)continue;
  const spec=geometry[page.page];
  const area=spec?.rows?.find(item=>item.active&&item.code===row.code);
  const target=sourcePages[page.page];
  if(!target||!area||!visible.has(String(target.ref)))continue;
  const phrases=row.phrases||[];
  if(!phrases.length)continue;
  const x0=spec.left,x1=spec.split,x2=spec.right,h=area.bottom-area.top;
  const fitted=layout(phrases,font,x2-x1-6,h);
  if(!fitted){skipped.push(page.page+':'+row.code);continue;}
  const y0=target.getHeight()-area.bottom;
  target.drawRectangle({x:x0+.3,y:y0+.35,width:x2-x0-.6,height:h-.7,color:white,borderColor:border,borderWidth:.35});
  target.drawLine({start:{x:x1,y:y0+.4},end:{x:x1,y:y0+h-.4},thickness:.35,color:border});
  const codeSize=5.5;
  target.drawText(row.code,{x:x0+(x1-x0-font.widthOfTextAtSize(row.code,codeSize))/2,
   y:y0+h/2-codeSize*.38,size:codeSize,font,color:ink});
  let baseline=y0+h-(h-fitted.lines.length*fitted.step)/2-fitted.size;
  for(const line of fitted.lines){
   if(line)target.drawText(line,{x:x1+3,y:baseline,size:fitted.size,font,color:ink,maxWidth:x2-x1-5});
   baseline-=fitted.step;
  }
  changed++;
 }
 window.BPF_PDF_F_CORRECTIONS={changedRows:changed,notRepainted:skipped,version:'20261123-f123-uniforme'};
}
window.bpfPrintCorrectedPhrases=bpfPrintCorrectedPhrases;
})();