/* Corrige os marcadores F2/F3 diretamente nos pixels da imagem interna
   da recepção, preservando o tamanho, a borda, as demais frases e Observações Gerais.
   4.5.3: F1 inspeção; F2 saneantes; F3 reprovação.
   4.5.8: F1 POP; F2 inspeção individual; F3 destino final. */
(function(){
'use strict';
if(window.__bpfRecepcaoFrasesV22)return;
window.__bpfRecepcaoFrasesV22=true;
const LAYER={top:34.93998,height:21.92409};
const WIDTH=1226,HEIGHT=443;
const LEGAL={
'4.5.3':'F1 — Os insumos devem ser submetidos à inspeção no ato da recepção. F2 — Os produtos saneantes devem estar regularizados no órgão competente. F3 — Quando as especificações previamente determinadas não forem atendidas, os insumos devem ser reprovados.',
'4.5.8':'F1 — Devem ser implementados Procedimentos Operacionais Padronizados-POP referentes à operação de recepção das embalagens. Os POP devem conter informações sobre: F2 — inspeção individual, aceitação e reprovação de embalagens, F3 — destino final das embalagens reprovadas e outras informações que se fizerem necessárias.'
};
const result={version:'20261121-recepcao-v22',rows:[],errors:[]},busy=new WeakSet();
window.BPFRecepcaoFrasesV22=result;
result.frasesLegais=LEGAL;
function coords(g,row){
 const y0=g.height*LAYER.top/100,h=g.height*LAYER.height/100;
 return {top:(row.top-y0)*HEIGHT/h,bottom:(row.bottom-y0)*HEIGHT/h};
}
function wrap(ctx,text,max){
 const words=text.split(/\s+/),arr=[];let line='';
 for(const word of words){
  const candidate=line?line+' '+word:word;
  if(line&&ctx.measureText(candidate).width>max){arr.push(line);line=word;}
  else line=candidate;
 }
 if(line)arr.push(line);
 return arr;
}
function redraw(ctx,g,code){
 const row=g.rows?.find(r=>r.active&&r.code===code);
 if(!row)return null;
 const rect=coords(g,row),left=66,right=WIDTH-3;
 const y1=Math.ceil(rect.top)+1,y2=Math.floor(rect.bottom)-1;
 if(y2<=y1)return null;
 let fit=null;
 // Arial regular preto, base de 14 px, igual aos outros F do Guia, sem negrito ou compressão.
 for(let size=14;size>=11;size-=.25){
  ctx.font=size+'px Arial, Helvetica, sans-serif';
  const lines=LEGAL[code].split(/(?=F[123]\s*—)/).map(s=>s.trim()).filter(Boolean).flatMap(part=>wrap(ctx,part,right-left-5)),step=size*1.10;
  if(lines.length*step<=y2-y1-2){
   fit={size,lines,step};break;
  }
 }
 if(!fit)throw Error('Texto não cabe na célula original do '+code);
 // Esta pintura altera somente o conteúdo da célula; a altura das linhas e
 // a área de Observações Gerais permanecem idênticas à imagem de origem.
 ctx.fillStyle='#ffffff';
 ctx.fillRect(left-2,y1,right-left+2,y2-y1);
 ctx.fillStyle='#101010';
 ctx.font=fit.size+'px Arial, Helvetica, sans-serif';
 ctx.textBaseline='top';
 const startY=y1+Math.max(0,(y2-y1-fit.lines.length*fit.step)/2);
 fit.lines.forEach((line,i)=>ctx.fillText(line,left,startY+i*fit.step));
 return {code,font:fit.size,lines:fit.lines.length,rowTop:y1,rowBottom:y2};
}
async function update(img){
 if(img.dataset.bpfRecepcaoF22==='1'||busy.has(img))return;
 const page=Number(img.closest('.page[data-page]')?.dataset.page);
 if(page!==6)return;
 const g=window.bpfLegalFGeometry?.[page];
 if(!g?.rows?.length)return;
 busy.add(img);
 try{
  const original=new Image();
  original.src=img.getAttribute('src')||img.src;
  await original.decode();
  const canvas=document.createElement('canvas');
  canvas.width=original.naturalWidth||original.width;
  canvas.height=original.naturalHeight||original.height;
  if(canvas.width!==WIDTH||canvas.height!==HEIGHT)throw Error('Imagem original com tamanho inesperado');
  const ctx=canvas.getContext('2d');
  if(!ctx)throw Error('Canvas indisponível');
  ctx.drawImage(original,0,0);
  const rows=[];
  for(const code of ['4.5.3','4.5.8']){
   const res=redraw(ctx,g,code);
   if(res)rows.push(res);
  }
  if(rows.length!==2)throw Error('As duas células não foram encontradas');
  const updated=canvas.toDataURL('image/png');
  img.dataset.bpfRecepcaoF22='1';
  img.src=updated;
  result.rows=rows;
 }catch(error){
  result.errors.push(String(error));
  console.warn('Erro ao atualizar a imagem legal da recepção:',error);
 }finally{busy.delete(img);}
}
let scheduled=false;
function scan(){
 if(scheduled)return;
 scheduled=true;
 Promise.resolve().then(()=>{
  scheduled=false;
  for(const img of document.querySelectorAll('#pages > .page[data-page="6"] img.bpf-legal-f-screen'))void update(img);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});
else scan();
const root=document.getElementById('pages');
if(root&&window.MutationObserver)new MutationObserver(scan).observe(root,{childList:true,subtree:true});
window.bpfRefreshRecepcaoFrases=scan;
})();