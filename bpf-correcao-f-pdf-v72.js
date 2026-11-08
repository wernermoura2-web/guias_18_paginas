/* Correcao v72: restaura identificadores dos F e inclui etiquetas da tabela superior
   no PDF preenchivel gerado pelo proprio guia. Nao altera frases, respostas ou calculos. */
(function(){
'use strict';
if(window.__bpfCorrecaoFPrintV72)return;
window.__bpfCorrecaoFPrintV72=true;
const style=document.createElement('style');
style.id='bpf-correcao-f-print-v72';
style.textContent=`
/* Restaurar a numeracao acima de cada botao F, sem mexer no clique ou nas respostas. */
#pages .page .bpf-item-code{
 display:flex!important;flex-direction:column!important;
 align-items:center!important;justify-content:center!important;
 overflow:hidden!important;gap:.06cqw!important;grid-template-rows:none!important;
}
#pages .page .bpf-item-code>span:first-child{
 display:block!important;visibility:visible!important;opacity:1!important;
 position:static!important;grid-row:auto!important;
 color:#102b43!important;background:transparent!important;
 font:700 1.06cqw/1 Arial,Helvetica,sans-serif!important;
 text-align:center!important;white-space:nowrap!important;
 flex:0 0 auto!important;
}
#pages .page .bpf-item-code>.bpf-f{
 display:block!important;position:static!important;grid-row:auto!important;
 margin:0!important;box-sizing:border-box!important;
 flex:0 0 54%!important;height:54%!important;min-height:0!important;
 max-height:54%!important;width:95%!important;max-width:95%!important;
 font-size:1.95cqw!important;line-height:1!important;padding:0!important;
 cursor:pointer!important;z-index:3!important;
}
#pages .page .bpf-item-code>img,
#pages .page .bpf-item-code>.bpf-etiqueta-overlay-v69{display:none!important}
@media print{
 #pages .page .bpf-item-code>span:first-child{display:block!important}
 #pages .page .bpf-item-code>.bpf-f{display:none!important}
}
`;
(document.head||document.documentElement).append(style);
const rank={POP:0,PPR:0,PC:1,PPRO:1,PCC:2};
const bg=[[.85,.97,.86],[1,.96,.74],[1,.83,.85]];
const edge=[[.09,.62,.19],[.94,.72,.03],[.91,.10,.13]];
function getRows(){
 if(typeof BPF_PHRASES==='undefined'||typeof GUIDE_DATA==='undefined'||!Array.isArray(GUIDE_DATA.widgets))return [];
 const widgets=new Map();
 for(const w of GUIDE_DATA.widgets){if(w.rect&&!widgets.has(w.page+'_'+w.name))widgets.set(w.page+'_'+w.name,w);}
 const found=[];
 for(const data of BPF_PHRASES){
  for(const row of data.rows||[]){
   let widget;
   for(const scope of row.scopes||[]){widget=widgets.get(data.page+'_'+scope.name);if(widget)break;}
   if(!widget)continue;
   const cats=[...new Set((row.scopes||[]).flatMap(sc=>(sc.phrases||[]).map(p=>String(p.appcc||'').toUpperCase().trim())).filter(v=>Object.hasOwn(rank,v)))];
   if(!cats.length)continue;
   cats.sort((a,b)=>rank[b]-rank[a]);
   found.push({page:data.page,code:row.code,widget,cats,grade:Math.max(...cats.map(c=>rank[c]))});
  }
 }
 return found;
}
async function addLabelsToPdf(pdf){
 if(pdf.__bpfAppccPdfLabelsV72)return;
 pdf.__bpfAppccPdfLabelsV72=true;
 const rows=getRows();if(!rows.length)return;
 const font=await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
 let count=0;
 for(const r of rows){
  const page=pdf.getPages()[r.page];if(!page)continue;
  const height=r.widget.size?.[1]||841.92,rect=r.widget.rect;
  const shift=page.getHeight()-height;
  const x=87.2,width=65.1,h=13.5;
  const cy=(rect[1]+rect[3])/2+shift;
  const y=cy-h/2;
  const [red,green,blue]=bg[r.grade], [er,eg,eb]=edge[r.grade];
  page.drawRectangle({x:x+.6,y:y+.8,width:width-1.2,height:h-1.6,color:PDFLib.rgb(red,green,blue),borderColor:PDFLib.rgb(er,eg,eb),borderWidth:1.2});
  const label=r.code+' | '+r.cats.join(' e ');
  let size=7;
  while(size>4.0&&font.widthOfTextAtSize(label,size)>width-4)size-=.2;
  page.drawText(label,{x:x+(width-font.widthOfTextAtSize(label,size))/2,y:cy-size*.34,size,font,color:PDFLib.rgb(0,0,0)});
  count++;
 }
 window.__bpfLastPdfLabelsV72=count;
}
function installPdfHook(){
 if(typeof PDFLib==='undefined'||!PDFLib.PDFDocument?.prototype)return false;
 const proto=PDFLib.PDFDocument.prototype;
 if(proto.__bpfPrintHookV72)return true;
 const original=proto.save;
 proto.save=async function(...args){
  try{await addLabelsToPdf(this);}catch(err){console.warn('Etiquetas no PDF:',err);}
  return original.apply(this,args);
 };
 proto.__bpfPrintHookV72=true;
 return true;
}
if(!installPdfHook()){
 let n=0;const t=setInterval(()=>{if(installPdfHook()||++n>20)clearInterval(t);},250);
}
})();
