/* Correção pontual da imagem ORIGINAL do guia (não cria camada).
   Fonte: foto aprovada. Itens 4.6.6, 4.6.9 e 4.6.12.
   A imagem do cabeçalho, as bordas e as demais frases não são alteradas. */
(function(){
 'use strict';
 if(window.__BPFOriginalImagemAprovadaV19)return;
 window.__BPFOriginalImagemAprovadaV19=true;
 const output=new Map(),working=new Set();
 const baseWidth=1226,baseHeight=675;
 function yRow(g,layer,row){
  const top=g.height*layer.top/100;
  const height=g.height*layer.height/100;
  return (row.top-top)*baseHeight/height;
 }
 function repaint(original,page,g,layer){
  const canvas=document.createElement('canvas');
  canvas.width=original.naturalWidth||original.width;
  canvas.height=original.naturalHeight||original.height;
  if(canvas.width!==baseWidth||canvas.height!==baseHeight)return null;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)return null;
  ctx.drawImage(original,0,0);
  // Usar os próprios algarismos da imagem original, preservando fonte e antialiasing.
  const one={x:83,y:6},two={x:83,y:137};
  const digitWidth=13,digitHeight=20;
  const pasteDigit=(x,y,digit)=>{
   const p=digit==='1'?one:two;
   ctx.fillStyle='#ffffff';
   ctx.fillRect(Math.round(x),Math.round(y),digitWidth,digitHeight);
   ctx.drawImage(original,p.x,p.y,digitWidth,digitHeight,Math.round(x),Math.round(y),digitWidth,digitHeight);
  };
  const find=code=>g.rows.find(r=>r.active&&r.code===code);
  ctx.font='21px Arial, sans-serif';
  const xAfter=(prefix)=>67+ctx.measureText(prefix).width;
  const middle=page===7?find('4.6.6'):null;
  if(middle){
   const top=yRow(g,layer,middle);
   // 4.6.6: F1 = enxágue; F2 = testes indicadores.
   pasteDigit(83,top+7,'1');
   pasteDigit(xAfter('produtos químicos utilizados na higienização. ')+16,top+29,'2');
  }
  const transport=find('4.6.9');
  if(transport){
   const top=yRow(g,layer,transport);
   // 4.6.9: F1 = transporte imediato; F2 = proteção das esteiras.
   pasteDigit(83,top+7,'1');
   pasteDigit(xAfter('F2 — O transporte das embalagens da área de higienização para a sala de envase deve ser realizado imediatamente. ')+16,top+7,'2');
  }
  const pop=find('4.6.12');
  if(pop){
   const top=yRow(g,layer,pop);
   // 4.6.12: segundo marcador F3 -> F2.
   pasteDigit(xAfter('embalagens. ')+16,top+29,'2');
   // Suprimir apenas a anotação antiga [F2 — Disponibilidade e atualização do POP].
   // Texto legal termina em "... outras informações que se fizerem necessárias.".
   const endLegal=xAfter('higienização, temperatura e outras informações que se fizerem necessárias. ');
   ctx.fillStyle='#ffffff';
   ctx.fillRect(Math.max(0,Math.floor(endLegal)-1),Math.round(top+67),
    Math.max(1,canvas.width-Math.floor(endLegal)-16),21);
  }
  return canvas.toDataURL('image/png');
 }
 async function applyTo(image){
  if(!image||image.dataset.bpfImagemCorreta==='v19')return;
  const page=Number(image.closest('.page[data-page]')?.dataset.page);
  if(![7,8].includes(page))return;
  if(output.has(page)){image.src=output.get(page);image.dataset.bpfImagemCorreta='v19';return;}
  if(working.has(page))return;
  const g=window.bpfLegalFGeometry?.[page];
  // Geometria publicada para páginas de retornáveis e descartáveis.
  const layer={top:41.21219,height:30.63681};
  if(!g||!g.rows?.length)return;
  working.add(page);
  try{
   const original=new Image();
   original.src=image.currentSrc||image.src;
   await original.decode();
   const revised=repaint(original,page,g,layer);
   if(!revised)return;
   output.set(page,revised);
   for(const pageEl of document.querySelectorAll('#pages > .page[data-page="'+page+'"]')){
    const current=pageEl.querySelector('img.bpf-legal-f-screen');
    if(current){current.src=revised;current.dataset.bpfImagemCorreta='v19';}
   }
  }catch(error){console.warn('Não foi possível atualizar imagem legal F:',error);}
  finally{working.delete(page);}
 }
 let queued=false;
 function scan(){
  if(queued)return;
  queued=true;
  Promise.resolve().then(()=>{
   queued=false;
   document.querySelectorAll('#pages > .page[data-page] img.bpf-legal-f-screen').forEach(applyTo);
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});
 else scan();
 const host=document.getElementById('pages');
 if(host&&window.MutationObserver)new MutationObserver(scan).observe(host,{childList:true,subtree:true});
 window.bpfCorrigirImagemOriginalF=scan;
})();
