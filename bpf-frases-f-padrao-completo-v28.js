/* Padronizacao integral das frases legais F1/F2/F3 nas paginas
   7 (recepcao), 8 (retornaveis) e 9 (descartaveis) do Guia BPF/APPCC.
   Mantem as alturas, itens, respostas, calculos, textos e areas de observacao.
   Escreve somente dentro das celulas de texto das frases legais. */
(function(){
'use strict';
if(window.__bpfFrasesPadraoCompletoV28)return;
window.__bpfFrasesPadraoCompletoV28=true;
const configurations={
 6:{width:1226,height:443,top:34.93998,band:21.92409,prerequisite:'bpfRecepcaoF22'},
 7:{width:1226,height:675,top:41.21219,band:30.63681,prerequisite:'bpfImagemF21'},
 8:{width:1226,height:675,top:41.21219,band:30.63681,prerequisite:'bpfImagemF21'}
};
// Referência visual: primeira página (Captação), marcadores azul-escuro
// em negrito e texto preto regular, em parágrafo corrido.
const state={version:'20261123-v31-captacao',pages:[],rows:[],errors:[]};
window.BPFFrasesPadraoCompletoV28=state;
const busy=new WeakSet();
const normalize=t=>String(t||'').replace(/\s+/g,' ').trim();
function getModel(page){
 if(typeof BPF_PHRASES==='undefined'||!Array.isArray(BPF_PHRASES))return null;
 return BPF_PHRASES.find(item=>Number(item.page)===page)||null;
}
function phrases(page,code){
 if(page===6){
  const source=window.BPFRecepcaoFrasesV22?.frasesLegais?.[code];
  if(source){
   const parts=String(source).split(/(?=F[123]\s*[—–-])/).map(t=>normalize(t).replace(/^F[123]\s*[—–-]\s*/, '')).filter(Boolean);
   if(parts.length)return parts;
  }
 } else {
  const source=window.BPFImagemFrasesOriginal?.frasesLegais?.[code];
  if(Array.isArray(source)&&source.length)return source.map(normalize);
 }
 const original=getModel(page)?.rows?.find(r=>r.code===code);
 // A tabela de descartáveis mantém texto informativo nos itens NA 4.6.4-4.6.6.
 // Se a frase não existir no modelo dessa página, buscar a mesma redação na página de retornáveis.
 const row=original?.phrases?.length?original:(page===8?getModel(7)?.rows?.find(r=>r.code===code):null);
 if(!row||!Array.isArray(row.phrases)||!row.phrases.length)return null;
 return row.phrases.map(item=>normalize(item.text||item.texto)).filter(Boolean);
}
function font(ctx,size,marker){ctx.font=(marker?'700 ':'400 ')+size+'px Arial, Helvetica, "Liberation Sans", sans-serif';}
function fit(ctx,legal,width,height){
 const tokens=legal.flatMap((text,i)=>[{text:'F'+(i+1)+' —',marker:true},...normalize(text).split(' ').map(text=>({text,marker:false}))]);
 for(let size=21;size>=10;size-=.25){
  font(ctx,size,false);const space=ctx.measureText(' ').width,step=size*1.10;
  const lines=[];let line=[],used=0,valid=true;
  for(let i=0;i<tokens.length;i++){
   const token=tokens[i];
   font(ctx,size,token.marker);const w=ctx.measureText(token.text).width;
   if(w>width){valid=false;break;}
   // Não deixar um marcador isolado no fim da linha.
   let keep=w;
   if(token.marker&&tokens[i+1]){font(ctx,size,false);keep+=space+ctx.measureText(tokens[i+1].text).width;}
   if(line.length&&used+space+keep>width){lines.push(line);line=[];used=0;}
   const x=used+(line.length?space:0);line.push({...token,x});used=x+w;
  }
  if(line.length)lines.push(line);
  if(valid&&lines.length*step<=height-2)return {lines,size,step};
 }
 return null;
}
function rectFor(g,row,conf){
 const bandTop=g.height*conf.top/100,bandH=g.height*conf.band/100;
 return {top:(row.top-bandTop)*conf.height/bandH,
         bottom:(row.bottom-bandTop)*conf.height/bandH};
}
function paint(ctx,row,conf,g,index){
 const legal=phrases(index,row.code);
 if(!legal||!legal.length)throw Error('Frases ausentes para '+row.code+' na pagina '+(index+1));
 const {top,bottom}=rectFor(g,row,conf);
 const a=Math.ceil(top)+1,b=Math.floor(bottom)-1;
 const left=66,right=conf.width-3,width=right-left-9,height=b-a;
 if(height<8)throw Error('Altura invalida em '+row.code);
 const result=fit(ctx,legal,width,height);
 if(!result)throw Error('A frase do item '+row.code+' excede a area original');
 ctx.fillStyle='#fff';
 ctx.fillRect(left,a,right-left,height);
 ctx.textBaseline='top';
 const firstY=a+Math.max(0,(height-result.lines.length*result.step)/2);
 result.lines.forEach((line,i)=>line.forEach(token=>{
  font(ctx,result.size,token.marker);
  ctx.fillStyle=token.marker?'#073b61':'#101010';
  ctx.fillText(token.text,left+1+token.x,firstY+i*result.step);
 }));
 state.rows.push({page:index+1,item:row.code,frases:legal.length,fonte:result.size});
}
async function paintPage(img,index){
 if(img.dataset.bpfFPadraoV28==='1'||busy.has(img))return;
 const conf=configurations[index];
 if(!conf||img.dataset[conf.prerequisite]!=='1')return;
 const g=window.bpfLegalFGeometry?.[index];
 if(!g?.rows?.length||!getModel(index))return;
 busy.add(img);
 try{
  const source=new Image();
  source.src=img.getAttribute('src')||img.src;
  await source.decode();
  if((source.naturalWidth||source.width)!==conf.width ||
     (source.naturalHeight||source.height)!==conf.height)
   throw Error('Dimensoes da imagem original diferentes do Guia');
  const canvas=document.createElement('canvas');
  canvas.width=conf.width;canvas.height=conf.height;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw Error('Canvas indisponivel');
  ctx.drawImage(source,0,0);
  // A página de descartáveis também exibe frases impressas para três itens NA.
  // Elas estavam preservadas no bitmap original com fonte maior e desalinhada.
  const inactiveVisible=index===8?new Set(['4.6.4','4.6.5','4.6.6']):new Set();
  const rows=g.rows.filter(row=>row.active||inactiveVisible.has(row.code));
  if(!rows.length)throw Error('Sem linhas legais ativas');
  for(const row of rows){
   try{paint(ctx,row,conf,g,index)}
   catch(e){state.errors.push({page:index+1,item:row.code,error:String(e)});}
  }
  img.src=canvas.toDataURL('image/png');
  img.dataset.bpfFPadraoV28='1';
  state.pages.push(index+1);
 }catch(e){
  state.errors.push({page:index+1,error:String(e)});
  console.warn('Padronizacao F da pagina '+(index+1)+':',e);
 }finally{busy.delete(img);}
}
let pending=false;
function scan(){
 if(pending)return;pending=true;
 Promise.resolve().then(()=>{
  pending=false;
  for(const [key] of Object.entries(configurations)){
   const index=Number(key);
   const img=document.querySelector('#pages > .page[data-page="'+index+'"] img.bpf-legal-f-screen');
   if(img)void paintPage(img,index);
  }
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});
else scan();
const root=document.getElementById('pages')||document.body;
if(window.MutationObserver)new MutationObserver(scan).observe(root,{
 subtree:true,childList:true,attributes:true,
 attributeFilter:['src','data-bpf-recepcao-f22','data-bpf-imagem-f21']
});
window.bpfRevisarTodasFrasesF=scan;
})();
