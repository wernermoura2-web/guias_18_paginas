#!/usr/bin/env python3
"""PDF BPF: distribuir Observações Gerais de forma legível nas páginas 14, 15 e extras."""
from pathlib import Path
import re, subprocess

HELPERS = r"""
// PDF: use actual PDF field dimensions instead of browser viewport size.
// Preserve all characters: each part is an exact slice of the original text.
function bpfPdfGeneralSplit(full,font,form,pdf){
 full=String(full||'').replace(/\r\n?/g,'\n');
 const box1=form.getTextField('OBS 1').acroField.getWidgets()[0].getRectangle();
 const box2=form.getTextField('obs_gerais_continuacao').acroField.getWidgets()[0].getRectangle();
 const base=pdf.getPage(0), width=base.getWidth(),height=base.getHeight();
 const extraBox={width:width-100,height:height-166};
 const size=9;
 function countLines(part,usableWidth){
  if(!part)return 0;
  let count=0;
  for(const paragraph of part.split('\n')){
   if(!paragraph.trim()){count++;continue}
   let line='';
   for(const word of paragraph.trim().split(/\s+/)){
    const proposal=line?line+' '+word:word;
    if(font.widthOfTextAtSize(proposal,size)<=usableWidth){line=proposal;continue}
    if(line){count++;line=''}
    for(const character of word){
     if(line&&font.widthOfTextAtSize(line+character,size)>usableWidth){count++;line=''}
     line+=character;
    }
   }
   if(line)count++;
  }
  return count;
 }
 function fits(part,box){
  const h=font.heightAtSize(size,{descender:false});
  return countLines(part,Math.max(25,box.width-18))*h*1.5<=Math.max(1,box.height-18);
 }
 function take(remaining,box){
  if(!remaining)return ['', ''];
  if(fits(remaining,box))return [remaining,''];
  let low=0,high=remaining.length;
  while(low<high){
   const mid=Math.ceil((low+high)/2);
   if(fits(remaining.slice(0,mid),box))low=mid;
   else high=mid-1;
  }
  let cut=low;
  if(cut===0)throw Error('O campo do PDF não possui espaço para uma linha de observação.');
  const paragraph=remaining.lastIndexOf('\n',cut-1),space=remaining.lastIndexOf(' ',cut-1);
  const boundary=Math.max(paragraph,space);
  if(boundary>0&&boundary>=cut-125)cut=boundary+1;
  if(!fits(remaining.slice(0,cut),box))cut=low;
  return [remaining.slice(0,cut),remaining.slice(cut)];
 }
 let remaining=full,first,second;
 [first,remaining]=take(remaining,box1);
 [second,remaining]=take(remaining,box2);
 const extras=[];
 while(remaining){
  if(extras.length>=200)throw Error('Limite de 200 páginas complementares excedido.');
  let part;
  [part,remaining]=take(remaining,extraBox);
  extras.push(part);
 }
 const pieces=[first,second,...extras];
 if(pieces.join('')!==full)throw Error('A paginação do PDF não preservou o texto completo.');
 return {first,second,extras,size,full};
}
function bpfPdfAppendGeneralPages(pdf,form,font,flow){
 if(!flow.extras.length)return 0;
 const page0=pdf.getPage(0),width=page0.getWidth(),height=page0.getHeight();
 for(let i=0;i<flow.extras.length;i++){
  // Insert after page 15 (documents and continuation), before the original photos.
  const page=pdf.insertPage(15+i,[width,height]);
  page.drawText('CONTINUAÇÃO DAS OBSERVAÇÕES GERAIS',{x:50,y:height-58,size:14,font,color:PDFLib.rgb(0.08,0.22,0.35)});
  page.drawText('Texto complementar da avaliação sanitária — página adicional '+(i+1),{x:50,y:height-79,size:9,font,color:PDFLib.rgb(0.27,0.3,0.34)});
  const field=form.createTextField('BPF_ObsGerais_Extra_'+(i+1));
  field.enableMultiline();
  field.addToPage(page,{x:50,y:65,width:width-100,height:height-166,font,borderWidth:0,backgroundColor:PDFLib.rgb(1,1,1),textColor:PDFLib.rgb(0,0,0)});
  field.setText(flow.extras[i]);
  field.acroField.setDefaultAppearance('/Helv '+flow.size+' Tf 0 g');
  field.defaultUpdateAppearances(font);
  page.drawText('Guia BPF — Observações Gerais (continuação)',{x:50,y:37,size:8,font,color:PDFLib.rgb(0.35,0.35,0.35)});
 }
 return flow.extras.length;
}
"""

OLD_PDF_SETUP="observationNames=new Set([...Object.values(BPF_OBSERVATION_FIELDS),'CONSIDERAÇÕES FINAIS  AVALIAÇÃO DE RISCORow1_2','CONSIDERAÇÕES FINAIS  AVALIAÇÃO DE RISCORow1','OBS 1']);"
NEW_PDF_SETUP=OLD_PDF_SETUP+"\n const pdfFlow=bpfPdfGeneralSplit(bpfGeneralFullText(),observationFont,form,pdf);"
OLD_PDF_FIELD="const name=f.getName(),value=values[name];if(value===undefined)continue;"
NEW_PDF_FIELD="const name=f.getName(),value=name==='OBS 1'?pdfFlow.first:name==='obs_gerais_continuacao'?pdfFlow.second:values[name];if(value===undefined)continue;"
OLD_PDF_SIZE="const size=Math.min(...boxes.map(b=>bpfObservationFontSize(value,observationFont,Math.max(1,b.width-6),Math.max(1,b.height-6))));"
NEW_PDF_SIZE="const size=(name==='OBS 1'||name==='obs_gerais_continuacao')?pdfFlow.size:Math.min(...boxes.map(b=>bpfObservationFontSize(value,observationFont,Math.max(1,b.width-6),Math.max(1,b.height-6))));"
OLD_ANNEX="const annexCount=await bpfAppendCompactAnnex(pdf);"
NEW_ANNEX="const extraObsPages=bpfPdfAppendGeneralPages(pdf,form,observationFont,pdfFlow);const annexCount=await bpfAppendCompactAnnex(pdf);"
OLD_STATUS="status.textContent='PDF preenchível gerado'+(annexCount?' com anexo F compacto ('+annexCount+' página(s))':'')+'. Os campos do guia continuam editáveis.';"
NEW_STATUS="status.textContent='PDF preenchível gerado'+(extraObsPages?' com '+extraObsPages+' página(s) adicional(is) de Observações Gerais':'')+(annexCount?' e anexo F compacto ('+annexCount+' página(s))':'')+'. Texto integral distribuído entre páginas e campos editáveis.';"

for filename in ("individual.html","equipe.html"):
 p=Path(filename)
 h=p.read_text(encoding="utf-8")
 if "function bpfPdfGeneralSplit(full,font,form,pdf){" not in h:
  marker="// Start observations at 9 pt; shrink only when their wrapped text exceeds the box."
  assert h.count(marker)==1,(filename,"PDF code missing")
  h=h.replace(marker,HELPERS+"\n"+marker,1)
 for old,new in [(OLD_PDF_SETUP,NEW_PDF_SETUP),(OLD_PDF_FIELD,NEW_PDF_FIELD),(OLD_PDF_SIZE,NEW_PDF_SIZE),(OLD_ANNEX,NEW_ANNEX),(OLD_STATUS,NEW_STATUS)]:
  if h.count(new)==1:continue
  count=h.count(old)
  assert count==1,(filename,"old marker missing or repeated",old[:80],count)
  h=h.replace(old,new,1)
 assert h.count("const pdfFlow=bpfPdfGeneralSplit(bpfGeneralFullText(),observationFont,form,pdf);")==1
 assert h.count("const extraObsPages=bpfPdfAppendGeneralPages(pdf,form,observationFont,pdfFlow);")==1
 assert h.count("function bpfPdfGeneralSplit(full,font,form,pdf){")==1
 assert h.count("function bpfPdfAppendGeneralPages(pdf,form,font,flow){")==1
 p.write_text(h,encoding="utf-8")
 # Syntax-check final script containing PDF export and page extension, and key script (JSON).
 anchor="function bpfPdfGeneralSplit("
 i=h.index(anchor);start=h.rfind("<script",0,i);start=h.index(">",start)+1;end=h.index("</script>",i)
 a=subprocess.run(["node","--check"],input=h[start:end],text=True,capture_output=True)
 assert a.returncode==0,(filename,a.stderr[:1400])
 print("VALIDADO",filename,": PDF separa na página 14, abaixo dos documentos na 15 e cria campos editáveis em páginas extras, se necessários.")

p=Path("index.html")
h=p.read_text(encoding="utf-8")
h,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"]+"',lambda m:'href="'+m.group(1)+'20261105-pdf-fluxo-paginas"',h)
assert n==2,("expected 2 links",n)
p.write_text(h,encoding="utf-8")
p=Path("sw-guia18.js");h=p.read_text(encoding="utf-8")
h,n=re.subn(r"const CACHE='guia18-menu-[^']+';","const CACHE='guia18-menu-v14-bpf20261105-pdf-fluxo-paginas';",h)
assert n==1
p.write_text(h,encoding="utf-8")
print("Versões individuais e equipe preparadas para publicação.")
