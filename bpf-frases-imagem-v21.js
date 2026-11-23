/* Padroniza F1, F2 e F3 em Arial regular preto, com tamanho-base igual, dentro da imagem e geometria original, sem alterar Observacoes Gerais.
   Sem recortar algarismos, sem elementos sobrepostos e sem mudar a geometria.
   Alinhado a foto aprovada: 4.6.6 F1/F2; 4.6.9 F1/F2; 4.6.12 F1/F2. */
(function(){
'use strict';
if(window.__bpfImagemFrasesV21)return;
window.__bpfImagemFrasesV21=true;
const IMAGE_WIDTH=1226,IMAGE_HEIGHT=675;
const LAYER_TOP_PERCENT=41.21219,LAYER_HEIGHT_PERCENT=30.63681;
const CHANGES={
 '4.6.6':[
  'O enxágue das embalagens retornadas para um novo ciclo de uso deve garantir a eliminação dos resíduos dos produtos químicos utilizados na higienização.',
  'A ausência desses resíduos deve ser comprovada por testes indicadores.'
 ],
 '4.6.9':[
  'O transporte das embalagens da área de higienização para a sala de envase deve ser realizado imediatamente.',
  'A saída do equipamento de higienização das embalagens deve estar posicionada próxima à sala de envase para evitar que as embalagens circulem em ambiente aberto. Quando não for possível, as esteiras devem ser protegidas por cobertura.'
 ],
 '4.6.12':[
  'Devem ser implementados Procedimentos Operacionais Padronizados-POP referentes às operações de higienização das embalagens.',
  'Os POP devem conter informações sobre: natureza da superfície a ser higienizada, métodos de higienização, princípios ativos utilizados e sua concentração, tempo de contato dos agentes químicos e ou físicos utilizados na operação de higienização, temperatura e outras informações que se fizerem necessárias.'
 ]
};
const cache=new Map(),busy=new Set(),status={version:'v21',painted:[],errors:[]};
window.BPFImagemFrasesOriginal=status;
status.frasesLegais=CHANGES;
function rowCoordinates(geometry,row){
 const top=geometry.height*LAYER_TOP_PERCENT/100;
 const height=geometry.height*LAYER_HEIGHT_PERCENT/100;
 return {
  start:(row.top-top)*IMAGE_HEIGHT/height,
  end:(row.bottom-top)*IMAGE_HEIGHT/height
 };
}
function wrapParagraph(ctx,text,width){
 const result=[],words=text.trim().split(/\s+/);
 let current='';
 for(const word of words){
  const candidate=current?current+' '+word:word;
  if(!current||ctx.measureText(candidate).width<=width){current=candidate;continue;}
  result.push(current);
  current=word;
 }
 if(current)result.push(current);
 return result;
}
function layout(ctx,code,width,height){
 const phrases=CHANGES[code];
 // F2 comecara na linha seguinte apenas em 4.6.9, como na imagem aprovada.
 const blocks=phrases.map((phrase,index)=>'F'+(index+1)+' — '+phrase);
 // O mesmo padrao tipografico para F1, F2 e F3, com quebra de linha entre frases.
 // O bitmap original utiliza Arial regular. Nunca ampliar nem aplicar negrito.
 for(let size=14;size>=11;size-=.25){
  ctx.font=size+'px Arial, Helvetica, sans-serif';
  const lines=blocks.flatMap(block=>wrapParagraph(ctx,block,width));
  const step=size*1.10;
  if(lines.length*step<=height-2.5){
   return {size,step,lines};
  }
 }
 const size=11;
 ctx.font=size+'px Arial, Helvetica, sans-serif';
 return {size,step:size*1.10,lines:blocks.flatMap(block=>wrapParagraph(ctx,block,width))};
}
function paintRow(ctx,geometry,source,code){
 const row=geometry.rows.find(r=>r.code===code&&r.active);
 if(!row)return null;
 const {start,end}=rowCoordinates(geometry,row),height=end-start;
 const left=67,right=IMAGE_WIDTH-3,width=right-left;
 const content=layout(ctx,code,width-4,height);
 const clearY=Math.ceil(start)+1,clearBottom=Math.floor(end)-1;
 if(clearBottom<=clearY)return null;
 ctx.fillStyle='#ffffff';
 ctx.fillRect(left-2,clearY,right-left+1,clearBottom-clearY);
 // Preto equivalente ao texto comum da arte original.
 ctx.fillStyle='#101010';
 ctx.font=content.size+'px Arial, Helvetica, sans-serif';
 ctx.textBaseline='top';
 const contentHeight=content.lines.length*content.step;
 const firstY=Math.max(clearY+(clearBottom-clearY-contentHeight)/2,clearY);
 for(let i=0;i<content.lines.length;i++){
  // Sem maxWidth: o navegador jamais comprime ou deforma os glifos.
  ctx.fillText(content.lines[i],left,firstY+i*content.step);
 }
 return {code,lines:content.lines.length,fontSize:content.size,rect:[left,clearY,right,clearBottom]};
}
function rebuild(original,page,geometry){
 const canvas=document.createElement('canvas');
 // Mesmas dimensões do bitmap original: não deslocar nem reduzir Observações Gerais.
 canvas.width=original.naturalWidth||original.width;
 canvas.height=original.naturalHeight||original.height;
 if(canvas.width!==IMAGE_WIDTH||canvas.height!==IMAGE_HEIGHT)throw Error('Dimensões inesperadas da imagem legal');
 const ctx=canvas.getContext('2d');
 if(!ctx)throw Error('Canvas indisponível');
 ctx.drawImage(original,0,0);
 const changed=[];
 for(const code of ['4.6.6','4.6.9','4.6.12']){
  if(page===8&&code==='4.6.6')continue;
  const item=paintRow(ctx,geometry,original,code);
  if(item)changed.push(item);
 }
 if(!changed.length)return null;
 status.painted.push({page,rows:changed});
 return canvas.toDataURL('image/png');
}
async function update(image){
 if(image?.dataset.bpfImagemF21==='1')return;
 const element=image?.closest('.page[data-page]');
 const page=Number(element?.dataset.page);
 if(page!==7&&page!==8)return;
 if(cache.has(page)){
  image.src=cache.get(page);
  image.dataset.bpfImagemF21='1';
  return;
 }
 if(busy.has(page))return;
 const geometry=window.bpfLegalFGeometry?.[page];
 if(!geometry?.rows?.length)return;
 busy.add(page);
 try{
  const source=new Image();
  source.src=image.getAttribute('src')||image.src;
  await source.decode();
  const revised=rebuild(source,page,geometry);
  if(!revised)return;
  cache.set(page,revised);
  for(const el of document.querySelectorAll('#pages > .page[data-page="'+page+'"] img.bpf-legal-f-screen')){
   el.src=revised;
   el.dataset.bpfImagemF21='1';
  }
 }catch(error){
  status.errors.push({page,message:String(error)});
  console.warn('Falha ao reconstruir frase legal no guia',error);
 }finally{busy.delete(page);}
}
let scheduled=false;
function scan(){
 if(scheduled)return;
 scheduled=true;
 Promise.resolve().then(()=>{
  scheduled=false;
  for(const img of document.querySelectorAll('#pages > .page[data-page] img.bpf-legal-f-screen'))void update(img);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});
else scan();
const host=document.getElementById('pages');
if(host&&window.MutationObserver)new MutationObserver(scan).observe(host,{childList:true,subtree:true});
window.bpfAtualizarFrasesImagem=scan;
})();