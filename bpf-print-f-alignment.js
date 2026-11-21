/* Ajuste dos F no PDF final. Repinta integralmente as células legais dos
   itens modificados, não somente o número da frase. */
(function(){
'use strict';
const watched=new Set(['4.5.3','4.6.6','4.6.9','4.6.12']);
const ascii=s=>String(s||'').replace(/[\u0000-\u001f]/g,' ').replace(/[\u2011\u2013]/g,'-').replace(/\s+/g,' ').trim();
function wrap(text,font,size,maxWidth){
 const words=ascii(text).split(' '),lines=[];let line='';
 for(const word of words){
  const trial=line?line+' '+word:word;
  if(font.widthOfTextAtSize(trial,size)<=maxWidth){line=trial;continue;}
  if(line)lines.push(line);
  if(font.widthOfTextAtSize(word,size)<=maxWidth){line=word;continue;}
  let segment='';
  for(const char of word){
   if(font.widthOfTextAtSize(segment+char,size)>maxWidth&&segment){lines.push(segment);segment='';}
   segment+=char;
  }
  line=segment;
 }
 if(line)lines.push(line);
 return lines;
}
function layout(text,font,width,height){
 for(let size=6.2;size>=3.1;size-=.2){
  const lines=wrap(text,font,size,width);
  if(lines.length*size*1.13<=height-1.3)return {size,lines};
 }
 const size=3.1,lines=wrap(text,font,size,width);
 return {size,lines:lines.slice(0,Math.max(1,Math.floor((height-1)/3.55)))};
}
function fractions(phrases){
 const values=phrases.map(p=>Math.max(60,ascii(p.text).length));
 const sum=values.reduce((a,b)=>a+b,0);
 return values.map(v=>Math.max(.19,v/sum));
}
async function bpfPrintCorrectedPhrases(pdf,sourcePages){
 if(!pdf||!sourcePages||typeof BPF_PHRASES==='undefined')return;
 const geometry=window.bpfLegalFGeometry||await fetch('./impressao/Frases_Legais_F_Geometria.json',{cache:'reload'}).then(r=>r.json());
 const font=await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
 const bold=await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
 const ink=PDFLib.rgb(.07,.19,.26),white=PDFLib.rgb(1,1,1),border=PDFLib.rgb(.36,.48,.55);
 const visible=new Set(pdf.getPages().map(p=>String(p.ref)));
 let count=0;
 for(const page of BPF_PHRASES)for(const row of page.rows||[]){
  if(!watched.has(row.code)||page.page>8)continue;
  const spec=geometry[page.page];
  const area=spec?.rows?.find(item=>item.active&&item.code===row.code);
  const target=sourcePages[page.page];
  if(!target||!area||!visible.has(String(target.ref)))continue;
  const phrases=row.phrases||[];
  if(!phrases.length)continue;
  const x0=spec.left,x1=spec.split,x2=spec.right,h=area.bottom-area.top;
  const y0=target.getHeight()-area.bottom;
  target.drawRectangle({x:x0+.3,y:y0+.35,width:x2-x0-.6,height:h-.7,color:white,borderColor:border,borderWidth:.35});
  target.drawLine({start:{x:x1,y:y0+.4},end:{x:x1,y:y0+h-.4},thickness:.35,color:border});
  const raw=fractions(phrases),total=raw.reduce((a,b)=>a+b,0);
  const portions=raw.map(f=>h*f/total);let used=0;
  for(let i=0;i<phrases.length;i++){
   const height=portions[i],base=y0+h-used-height;
   if(i>0)target.drawLine({start:{x:x0+.35,y:y0+h-used},end:{x:x2-.35,y:y0+h-used},thickness:.35,color:border});
   const name='F'+(i+1),fs=Math.min(6.2,Math.max(4.1,height*.62));
   target.drawText(name,{x:x0+(x1-x0-bold.widthOfTextAtSize(name,fs))/2,y:base+height/2-fs*.37,size:fs,font:bold,color:ink});
   const content=layout(phrases[i].text,font,x2-x1-6,height);
   const lineHeight=content.size*1.13;
   let baseline=base+height-(height-content.lines.length*lineHeight)/2-content.size;
   for(const line of content.lines){
    if(!line)continue;
    target.drawText(line,{x:x1+3,y:baseline,size:content.size,font,color:ink,maxWidth:x2-x1-5});
    baseline-=lineHeight;
   }
   used+=height;
  }
  count++;
 }
 window.BPF_PDF_F_CORRECTIONS={changedRows:count,version:'20261121-4-itens'};
}
window.bpfPrintCorrectedPhrases=bpfPrintCorrectedPhrases;
})();
