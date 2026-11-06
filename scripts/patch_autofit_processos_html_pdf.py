#!/usr/bin/env python3
"""Autoajuste completo de Observações Gerais dos processos em HTML e PDF.
Os campos dos processos NÃO geram páginas extras; OBS 1/continuação conserva
o algoritmo existente, inclusive listas de NC críticas, maiores e menores.
"""
from pathlib import Path
import re,json,subprocess,hashlib

CSS="""<style id="bpf-autofit-process-css">
.text.bpf-process-observation,
.printable[data-field^="OBSERVAÇÕES GERAISRow1"]{
 white-space:pre-wrap;
 overflow-wrap:anywhere;
 word-break:break-word;
 line-height:1.14;
}
@media print{
 .printable[data-field^="OBSERVAÇÕES GERAISRow1"]{
  white-space:pre-wrap!important;
  overflow-wrap:anywhere!important;
  word-break:break-word!important;
 }
}
</style>"""

FITTER=r"""function bpfFitProcessObservation(el){
 // Medir texto visível no HTML e na cópia usada pela impressão do navegador.
 // Não retira caracteres, não altera values e não cria páginas.
 const mirror=el.parentElement.querySelector('.printable[data-field="'+CSS.escape(el.dataset.field)+'"]');
 const hostWidth=Math.max(1,el.parentElement.clientWidth);
 const minimum=.35,maximum=16;
 el.style.overflowWrap='anywhere';
 el.style.wordBreak='break-word';
 el.style.whiteSpace='pre-wrap';
 el.style.lineHeight='1.14';
 if(mirror){
  mirror.textContent=el.value;
  mirror.style.whiteSpace='pre-wrap';
  mirror.style.overflowWrap='anywhere';
  mirror.style.wordBreak='break-word';
  mirror.style.lineHeight='1.14';
 }
 function fits(size){
  el.style.fontSize=size+'px';
  const onScreen=el.scrollHeight<=el.clientHeight+1&&el.scrollWidth<=el.clientWidth+1;
  if(!mirror||!mirror.parentElement||!el.clientWidth)return onScreen;
  mirror.style.fontSize=(size/hostWidth*100)+'cqw';
  const previousDisplay=mirror.style.display;
  const previousVisibility=mirror.style.visibility;
  const previousPointerEvents=mirror.style.pointerEvents;
  mirror.style.display='block';
  mirror.style.visibility='hidden';
  mirror.style.pointerEvents='none';
  const printed=!mirror.clientHeight||!mirror.clientWidth||
   (mirror.scrollHeight<=mirror.clientHeight+1&&mirror.scrollWidth<=mirror.clientWidth+1);
  mirror.style.display=previousDisplay;
  mirror.style.visibility=previousVisibility;
  mirror.style.pointerEvents=previousPointerEvents;
  return onScreen&&printed;
 }
 let low=minimum,high=maximum;
 if(fits(high)){
  el.style.overflowY='hidden';return;
 }
 const canFit=fits(low);
 if(canFit){
  for(let i=0;i<13;i++){
   const mid=(low+high)/2;
   if(fits(mid))low=mid;else high=mid;
  }
 }else{
  // Se nem a fonte mínima couber, manter a barra de rolagem na edição:
  // nenhuma observação é apagada ou cortada silenciosamente.
  low=minimum;
 }
 const size=Math.max(minimum,Math.floor(low*20)/20);
 el.style.fontSize=size+'px';
 if(mirror)mirror.style.fontSize=(size/hostWidth*100)+'cqw';
 el.style.overflowY=canFit?'hidden':'auto';
}"""

OLD_FIT="""function fit(el){if(!el.classList.contains('text')||!el.clientHeight)return;
 if(el.dataset.field==='OBS 1'||el.dataset.field==='obs_gerais_continuacao'){
  let font=9;try{font=Number(JSON.parse(values.BPF_ObsGeneralFlow||'{}').font)||9}catch(e){}
  el.style.fontSize=font+'px';el.style.lineHeight='1.2';
  const mirror=el.parentElement.querySelector('.printable[data-field="'+CSS.escape(el.dataset.field)+'"]');
  if(mirror){mirror.style.fontSize=(font/el.parentElement.clientWidth*100)+'cqw';mirror.style.lineHeight='1.2';mirror.style.whiteSpace='pre-wrap'}
  el.style.overflowY=el.scrollHeight>el.clientHeight+1?'auto':'hidden';return;
 }const observation=el.classList.contains('bpf-process-observation');let size=observation?Math.min(16,Math.max(9,el.clientHeight*.55)):Math.min(14,Math.max(8,el.clientHeight*.55));const minimum=observation?1.5:5;el.style.fontSize=size+'px';while(size>minimum&&(el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1)){size=Math.max(minimum,size-(observation?.25:.5));el.style.fontSize=size+'px'}const mirror=el.parentElement.querySelector('.printable[data-field="'+CSS.escape(el.dataset.field)+'"]');if(mirror)mirror.style.fontSize=(size/el.parentElement.clientWidth*100)+'cqw';if(observation)el.style.overflowY=el.scrollHeight>el.clientHeight+1?'auto':'hidden'}"""

NEW_FIT="""function fit(el){if(!el.classList.contains('text')||!el.clientHeight)return;
 if(el.dataset.field==='OBS 1'||el.dataset.field==='obs_gerais_continuacao'){
  let font=9;try{font=Number(JSON.parse(values.BPF_ObsGeneralFlow||'{}').font)||9}catch(e){}
  el.style.fontSize=font+'px';el.style.lineHeight='1.2';
  const mirror=el.parentElement.querySelector('.printable[data-field="'+CSS.escape(el.dataset.field)+'"]');
  if(mirror){mirror.style.fontSize=(font/el.parentElement.clientWidth*100)+'cqw';mirror.style.lineHeight='1.2';mirror.style.whiteSpace='pre-wrap'}
  el.style.overflowY=el.scrollHeight>el.clientHeight+1?'auto':'hidden';return;
 }
 if(el.classList.contains('bpf-process-observation')){
  bpfFitProcessObservation(el);
  return;
 }
 let size=Math.min(14,Math.max(8,el.clientHeight*.55));const minimum=5;
 el.style.fontSize=size+'px';
 while(size>minimum&&(el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1)){
  size=Math.max(minimum,size-.5);el.style.fontSize=size+'px';
 }
 const mirror=el.parentElement.querySelector('.printable[data-field="'+CSS.escape(el.dataset.field)+'"]');
 if(mirror)mirror.style.fontSize=(size/el.parentElement.clientWidth*100)+'cqw';
}"""

PDF_FITTER=r"""// Tipografia adaptativa das observações: preserva todas as linhas no espaço do processo.
// Não usa paginação adicional, exclusiva das listas NC em OBS 1.
function bpfObservationFontSize(text,font,width,height){
 const content=String(text||'').replace(/\r\n?/g,'\n');
 if(!content)return 9;
 const usableWidth=Math.max(1,width-2),usableHeight=Math.max(1,height-2);
 function linesAt(size){
  let count=0;
  for(const para of content.split('\n')){
   if(!para.trim()){count++;continue;}
   let line='';
   for(const word of para.trim().split(/\s+/)){
    const candidate=line?line+' '+word:word;
    if(font.widthOfTextAtSize(candidate,size)<=usableWidth){
     line=candidate;continue;
    }
    if(line){count++;line='';}
    // Palavras extensas/URLs não podem ultrapassar a borda do campo.
    for(const char of word){
     if(line&&font.widthOfTextAtSize(line+char,size)>usableWidth){
      count++;line='';
     }
     line+=char;
    }
   }
   if(line)count++;
  }
  return Math.max(count,1);
 }
 function fits(size){
  return linesAt(size)*font.heightAtSize(size,{descender:false})*1.26<=usableHeight;
 }
 if(fits(9))return 9;
 const minimum=.25;
 if(!fits(minimum))throw Error('O texto de observações do processo é extenso demais para o espaço fixo do PDF, mesmo com redução extrema da fonte. O conteúdo permanece salvo no guia; revise-o antes de gerar o PDF.');
 let low=minimum,high=9;
 for(let n=0;n<14;n++){
  const mid=(low+high)/2;
  if(fits(mid))low=mid;else high=mid;
 }
 return Math.max(minimum,Math.floor(low*20)/20);
}
"""

for name in ('individual.html','equipe.html'):
 p=Path(name)
 s=p.read_text(encoding='utf8')
 assert s.count(OLD_FIT)==1,(name,'fitting old not found',s.count(OLD_FIT))
 a=s.index('function bpfObservationFontSize(text,font,width,height){')
 b=s.index('async function bpfExportEditable(){',a)
 original_pdf_fit=s[a:b]
 assert original_pdf_fit.count("const normalized=String(text||'')")==1,name
 # Sensitive functions must remain byte-exact.
 old_split=s[s.index('function bpfPdfGeneralSplit(full,font,form,pdf){'):s.index('function bpfPdfAppendGeneralPages(',s.index('function bpfPdfGeneralSplit('))]
 old_nc=s[s.index('function bpfSyncNCLists(){'):s.index('</script>',s.index('function bpfSyncNCLists(){'))]
 s=s.replace(OLD_FIT,FITTER+'\n'+NEW_FIT,1)
 s=s[:s.index('function bpfObservationFontSize(text,font,width,height){')]+PDF_FITTER+'\n'+s[s.index('async function bpfExportEditable(){'):]
 assert s.count('</head>')==1
 s=s.replace('</head>',CSS+'</head>',1)
 assert s.count('function bpfFitProcessObservation(el){')==1
 assert s.count('function bpfObservationFontSize(text,font,width,height){')==1
 assert s.count('function bpfPdfGeneralSplit(full,font,form,pdf){')==1
 assert s.count('function bpfPdfAppendGeneralPages(')==1
 assert s.count('function bpfSyncNCLists(){')==1
 assert s.count('async function bpfExportEditable(){')==1
 assert s.count('style id="bpf-autofit-process-css"')==1
 new_split=s[s.index('function bpfPdfGeneralSplit(full,font,form,pdf){'):s.index('function bpfPdfAppendGeneralPages(',s.index('function bpfPdfGeneralSplit('))]
 new_nc=s[s.index('function bpfSyncNCLists(){'):s.index('</script>',s.index('function bpfSyncNCLists(){'))]
 assert old_split==new_split,(name,'NC original PDF continuation changed')
 assert old_nc==new_nc,(name,'NC summary changed')
 for fragment in ['function bpfFitProcessObservation(el){','function fit(el){','function bpfObservationFontSize(text,font,width,height){','async function bpfExportEditable(){']:
  i=s.index(fragment);a=s.rfind('<script',0,i);a=s.index('>',a)+1;b=s.index('</script>',i)
  check=subprocess.run(['node','--check'],input=s[a:b],text=True,capture_output=True)
  assert check.returncode==0,(name,fragment,check.stderr[:1500])
 p.write_text(s,encoding='utf8')
 print('VALIDADO',name,': observações dos processos em HTML e PDF ajustadas por medição; sem páginas extras; NC críticas/maiores/menores com continuação original.')

idx=Path('index.html')
s=idx.read_text('utf8')
s,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"#]+(#[^"]*)?"',
 lambda m:'href="'+m.group(1)+'20261106-autofit-processos-html-pdf'+(m.group(2) or '')+'"',s)
assert n==3,n
idx.write_text(s,encoding='utf8')
sw=Path('sw-guia18.js')
s=sw.read_text('utf8')
s,n=re.subn(r"const CACHE='guia18-menu-[^']+';","const CACHE='guia18-menu-v28-bpf20261106-autofit-processos';",s)
assert n==1,n
sw.write_text(s,encoding='utf8')
print('Atualizados os dois links e cache do menu inicial.')
