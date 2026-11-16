/* Etiquetas APPCC sobre as linhas da TABELA SUPERIOR, que sao imagem do PDF.
   Usa a posicao das respostas do formulario para alinhar os numeros.
   Nao modifica frases, F, dados, calculos ou a area de AVALIACAO inferior. */
(function(){
'use strict';
if(window.__bpfEtiquetasSuperioresV69)return;
window.__bpfEtiquetasSuperioresV69=true;
window.__bpfLayoutRevision='20261109-padronizacao-v85';
const css=document.createElement('style');
css.id='bpf-etiquetas-superiores-v69';
css.textContent=`
.page .bpf-etiqueta-overlay-v69 {
 position:absolute!important;z-index:12!important;box-sizing:border-box!important;
 display:flex!important;align-items:center!important;justify-content:center!important;
 gap:.06cqw!important;border:.16cqw solid var(--bpf-borda)!important;
 border-radius:.43cqw!important;background:var(--bpf-fundo)!important;
 color:#000!important;font:800 1.025cqw/1.08 Arial,Helvetica,sans-serif!important;
 white-space:nowrap!important;overflow:hidden!important;
 text-align:center!important;pointer-events:auto!important;cursor:help!important;
 -webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;
}
.page .bpf-etiqueta-overlay-v69.bpf-longa{font-size:1.025cqw!important;gap:.06cqw!important}
.page .bpf-etiqueta-overlay-v69.bpf-extralonga{font-size:1.025cqw!important;gap:.06cqw!important}
.page .bpf-etiqueta-overlay-v69>span {color:#000!important}
/* Padrão tipográfico proporcional ao PDF: tamanho-base de 6,1 pt.
   Não aumentar fonte em etiquetas curtas; somente reduzir quando necessário. */
.page .bpf-etiqueta-overlay-v69>span {flex:0 0 auto!important;min-width:0!important}
.page .bpf-etiqueta-overlay-v69[data-etiqueta-id$="-4-5-3"] {letter-spacing:-.012em!important}
`;
css.textContent+=`
#bpf-resumo-frases{position:fixed;z-index:99890;box-sizing:border-box;width:min(355px,calc(100vw - 16px));
 max-height:calc(100dvh - 16px);overflow:auto;background:#fff;color:#182d38;padding:8px;
 border:1px solid #9cb1bd;border-radius:8px;box-shadow:0 5px 18px #17374835;font:13px/1.35 Arial,sans-serif}
#bpf-resumo-frases[hidden]{display:none}
#bpf-resumo-frases.bpf-aviso-botao{pointer-events:none}
#bpf-resumo-frases .bpf-resumo-item{display:block;padding:1px 2px 6px;font-size:13px}
#bpf-resumo-frases .bpf-resumo-quadro{padding:6px 8px;border:1px solid var(--bpf-borda);
 border-left-width:4px;background:var(--bpf-fundo);border-radius:4px}
#bpf-resumo-frases .bpf-resumo-quadro+.bpf-resumo-quadro{margin-top:5px}
#bpf-resumo-frases p{margin:3px 0 0}
@media print{#bpf-resumo-frases{display:none!important}}
`;
document.head.appendChild(css);

/* As etiquetas pertencem somente à tabela superior.
   Não modificar os botões F, a numeração nem o leiaute de suas células. */
// O componente F e o número do item são inteiramente controlados pelo guia original.
// Nenhum CSS deste complemento deve afetar .bpf-item-code, .bpf-f ou seus filhos.
const fixes=document.createElement('style');
fixes.id='bpf-layout-impressao-v72';
fixes.textContent=`
/* Na tela, reservar fisicamente a faixa superior para o numero
   (42%) e posicionar o botao F SOMENTE na faixa inferior (58%).
   A separacao absoluta evita que o F cubra a numeracao dos itens.
   Nao vale para PDF, nem altera frases/estado dos F. */
@media screen {
 #pages .page>.bpf-guide-footer{
   background:transparent!important;
   pointer-events:none;
 }
 #pages .page>button.overlay.action[data-field^="LIMPAR"]:not([data-field="LIMPAR TUDO"]){
   z-index:85;
   visibility:visible;
   opacity:1;
   pointer-events:auto;
 }
 #pages .page>.bpf-item-code {
   position:absolute!important;
   display:block!important;
   overflow:hidden!important;
   padding:0!important;
   isolation:isolate!important;
 }
 #pages .page>.bpf-item-code>span:not(.bpf-f) {
   position:absolute!important;
   top:0!important;left:0!important;
   width:100%!important;height:46%!important;
   box-sizing:border-box!important;
   display:flex!important;
   align-items:center!important;justify-content:center!important;
   visibility:visible!important;
   min-height:0!important;
   line-height:1!important;
   white-space:nowrap!important;
   z-index:5!important;
   background:#dceaf4!important;
   overflow:hidden!important;
 }
 #pages .page>.bpf-item-code>.bpf-f {
   position:absolute!important;
   top:49%!important;left:0!important;bottom:0!important;
   width:100%!important;height:51%!important;
   max-width:100%!important;
   box-sizing:border-box!important;
   min-height:0!important;
   margin:0!important;padding:0!important;
   display:flex!important;
   align-items:center!important;justify-content:center!important;
   visibility:visible!important;
   z-index:2!important;
   overflow:hidden!important;
 }
 #bpf-editor textarea {line-height:1.5!important;}
 #bpf-editor .bpf-guidance {line-height:1.5!important;}
}
@media print {
 #pages .page>.bpf-etiqueta-overlay-v69 {
   display:flex!important;visibility:visible!important;opacity:1!important;
   print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important;
 }
}
`;
document.head.appendChild(fixes);

/* Corrige impressão como PDF pelo navegador sem modificar os botões F. */
const printTextFix=document.createElement('style');
printTextFix.id='bpf-print-textos-v76';
printTextFix.textContent=`@media print {
 #pages>.page>.printable:not([style*="display: none"]){
   display:block!important;visibility:visible!important;opacity:1!important;
   white-space:pre-wrap!important;overflow-wrap:anywhere!important;word-break:break-word!important;
   color:#000!important;
 }
 #pages>.page>.text{display:none!important}
 #pages>.page>.background{visibility:visible!important;print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important}
}`;
document.head.appendChild(printTextFix);
window.addEventListener('beforeprint',()=>{try{if(typeof sync==='function')sync()}catch(err){console.warn('Preparação da impressão:',err)}}, {capture:true});

const rank={PPR:0,POP:0,PC:1,PPRO:1,PCC:2};
const outlines=['#159a33','#f0b400','#e91a20'];
const fills=['linear-gradient(110deg,#dbf7dc,#a9eeb5)','linear-gradient(110deg,#fff7bc,#ffe47a)','linear-gradient(110deg,#ffd6da,#ffa9b0)'];
const pageWidth=595.32;
const summaryTooltip=document.createElement('div');
summaryTooltip.id='bpf-resumo-frases';
summaryTooltip.setAttribute('role','tooltip');
summaryTooltip.hidden=true;
let summaryAnchor=null, summaryTimer, summaryPinned=false;

function shortPhrase(value){
 const text=String(value||'').replace(/\s+/g,' ').trim();
 if(text.length<=150)return text;
 const end=text.lastIndexOf(' ',147);
 return text.slice(0,end>112?end:147).replace(/[,:;]$/,'')+'…';
}

function summaryCards(data,row){
 const groups=new Map();
 for(const panel of bpfPanels(data,row)){
  const phrases=panel.entries.length?panel.entries.map(entry=>entry.phrase):
   (panel.indices||[panel.id]).map(i=>row.phrases[i]);
  for(const phrase of phrases){
   const category=String(phrase?.appcc||'').trim().toUpperCase();
   const text=shortPhrase(phrase?.text);
   if(!Object.hasOwn(rank,category)||!text)continue;
   const label='F'+(panel.id+1)+' · '+category;
   if(!groups.has(label))groups.set(label,{label,category,texts:new Set()});
   groups.get(label).texts.add(text);
  }
 }
 return groups.values();
}

function hideSummary(){
 clearTimeout(summaryTimer);
 if(summaryAnchor){
  summaryAnchor.removeAttribute('aria-describedby');
  if(summaryAnchor.hasAttribute('aria-expanded'))summaryAnchor.setAttribute('aria-expanded','false');
 }
 summaryAnchor=null;
 summaryPinned=false;
 summaryTooltip.hidden=true;
}
function scheduleHide(){
 if(summaryPinned)return;
 clearTimeout(summaryTimer);
 summaryTimer=setTimeout(hideSummary,190);
}
function positionSummary(){
 if(!summaryAnchor||summaryTooltip.hidden)return;
 const r=summaryAnchor.getBoundingClientRect(), viewport=window.visualViewport, gap=8;
 const left=viewport?.offsetLeft||0, top=viewport?.offsetTop||0;
 const viewWidth=viewport?.width||window.innerWidth, viewHeight=viewport?.height||window.innerHeight;
 const right=left+viewWidth, bottom=top+viewHeight;
 if(r.bottom<top||r.top>bottom||r.right<left||r.left>right){hideSummary();return;}
 const spaceLeft=r.left-left-2*gap, spaceRight=right-r.right-2*gap;
 const sideSpace=Math.max(spaceLeft,spaceRight);
 const width=Math.max(1,Math.min(355,viewWidth-2*gap,sideSpace>=155?sideSpace:Infinity));
 summaryTooltip.style.width=width+'px';
 summaryTooltip.style.maxHeight=Math.max(1,viewHeight-2*gap)+'px';
 const height=summaryTooltip.offsetHeight;
 const x=spaceRight>=width?r.right+gap:spaceLeft>=width?r.left-gap-width:r.left;
 summaryTooltip.style.left=Math.max(left+gap,Math.min(x,right-width-gap))+'px';
 summaryTooltip.style.top=Math.max(top+gap,Math.min(r.top,bottom-height-gap))+'px';
}

function openSummary(anchor){
 summaryAnchor=anchor;
 anchor.setAttribute('aria-describedby',summaryTooltip.id);
 summaryTooltip.hidden=false;
 positionSummary();
}
function showSummary(anchor,data,row,pin=false){
 clearTimeout(summaryTimer);
 if(summaryAnchor===anchor&&!summaryTooltip.hidden){
  if(pin&&summaryPinned){hideSummary();return;}
  if(pin)summaryPinned=true;
  positionSummary();
  return;
 }
 hideSummary();
 const cards=[...summaryCards(data,row)];
 if(!cards.length)return;
 if(!summaryTooltip.isConnected)document.body.append(summaryTooltip);
 const title=document.createElement('strong');
 title.className='bpf-resumo-item';
 title.textContent='Item '+row.code;
 summaryTooltip.classList.remove('bpf-aviso-botao');
 summaryTooltip.replaceChildren(title);
 for(const {label,category,texts} of cards){
  const box=document.createElement('div'),name=document.createElement('strong');
  box.className='bpf-resumo-quadro';
  box.style.setProperty('--bpf-borda',outlines[rank[category]]);
  box.style.setProperty('--bpf-fundo',fills[rank[category]]);
  name.textContent=label;
  box.append(name);
  for(const text of texts){
   const p=document.createElement('p');
   p.textContent=text;
   box.append(p);
  }
  summaryTooltip.append(box);
 }
 summaryPinned=pin;
 anchor.setAttribute('aria-expanded','true');
 openSummary(anchor);
}
const summaryTriggers=new WeakSet();
function addSummaryTrigger(anchor,data,row){
 if(!anchor||summaryTriggers.has(anchor))return;
 summaryTriggers.add(anchor);
 anchor.tabIndex=0;
 anchor.setAttribute('role','button');
 anchor.setAttribute('aria-controls',summaryTooltip.id);
 anchor.setAttribute('aria-expanded','false');
 anchor.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&!summaryPinned)showSummary(anchor,data,row);});
 anchor.addEventListener('pointerleave',scheduleHide);
 anchor.addEventListener('focus',()=>{if(anchor.matches(':focus-visible')&&!summaryPinned)showSummary(anchor,data,row);});
 anchor.addEventListener('blur',()=>{if(summaryAnchor===anchor&&!summaryPinned)hideSummary();});
 anchor.addEventListener('click',()=>showSummary(anchor,data,row,true));
 anchor.addEventListener('keydown',event=>{
  if(event.key==='Enter'||event.key===' '){
   event.preventDefault();
   showSummary(anchor,data,row,true);
  }
 });
}
const guidanceSelector='button.bpf-f, button.bpf-regra-pcc-botao';
function showButtonGuidance(button){
 clearTimeout(summaryTimer);
 if(summaryAnchor===button&&!summaryTooltip.hidden)return;
 hideSummary();
 button.removeAttribute('title');
 const isF=button.classList.contains('bpf-f');
 const title=document.createElement('strong'),message=document.createElement('p');
 title.className='bpf-resumo-item';
 title.textContent=isF?'F — Frases e verificações do item':'R — Regra de risco por PCC';
 message.textContent=isF
  ?'Abre as frases e orientações do item. Responda às verificações aplicáveis. Ao marcar Não, descreva a não conformidade. Registre observações quando necessário.'
  :'Abre a regra de risco dos Pontos Críticos de Controle. Use este botão para consulta. O preenchimento é feito no botão F de cada item.';
 if(!summaryTooltip.isConnected)document.body.append(summaryTooltip);
 summaryTooltip.classList.add('bpf-aviso-botao');
 summaryTooltip.replaceChildren(title,message);
 openSummary(button);
}
document.addEventListener('pointerover',event=>{
 if(event.pointerType==='touch'||summaryPinned)return;
 const button=event.target?.closest?.(guidanceSelector);
 if(button&&!button.contains(event.relatedTarget))showButtonGuidance(button);
});
document.addEventListener('pointerout',event=>{
 const button=event.target?.closest?.(guidanceSelector);
 if(button&&button===summaryAnchor&&!button.contains(event.relatedTarget))scheduleHide();
});
document.addEventListener('focusin',event=>{
 if(!summaryPinned&&event.target?.matches?.(guidanceSelector)&&event.target.matches(':focus-visible'))showButtonGuidance(event.target);
});
document.addEventListener('focusout',event=>{
 if(event.target===summaryAnchor&&!summaryPinned)hideSummary();
});
document.addEventListener('click',event=>{
 if(summaryAnchor&&!summaryAnchor.contains(event.target)&&!summaryTooltip.contains(event.target))hideSummary();
},true);
summaryTooltip.addEventListener('pointerenter',()=>clearTimeout(summaryTimer));
summaryTooltip.addEventListener('pointerleave',scheduleHide);
document.addEventListener('keydown',event=>{if(event.key==='Escape')hideSummary();});
window.addEventListener('scroll',positionSummary,{capture:true,passive:true});
window.addEventListener('resize',positionSummary,{passive:true});
window.visualViewport?.addEventListener('scroll',positionSummary,{passive:true});
window.visualViewport?.addEventListener('resize',positionSummary,{passive:true});
/* Ajustar as letras à área útil real da etiqueta, em vez de cqw
   relativo ao viewport, que fica pequeno ao ampliar o PDF no celular. */
const measureCanvas=document.createElement('canvas');
const measureContext=measureCanvas.getContext('2d');
// Base idêntica à impressão: a etiqueta tem 65,1 pontos de largura.
const LABEL_WIDTH_PT=65.1, FONT_BASE_PT=6.1, TEXT_AREA_PT=59.1;
function fitBadge(badge){
 const children=Array.from(badge.children);
 if(children.length!==3)return;
 const w=badge.clientWidth;
 if(w<10||!measureContext)return;
 const label=children[0].textContent.trim()+' | '+children[2].textContent.trim();
 // Proporção fixa em todas as etiquetas; uma longa diminui apenas o
 // mínimo necessário. Isto evita fontes enormes em itens curtos.
 const basePx=w*FONT_BASE_PT/LABEL_WIDTH_PT;
 const available=w*TEXT_AREA_PT/LABEL_WIDTH_PT;
 let size=basePx;
 measureContext.font='800 '+size+'px Arial,Helvetica,sans-serif';
 const actual=measureContext.measureText(label).width;
 if(actual>available)size=size*available/actual;
 badge.style.setProperty('font-size',size.toFixed(2)+'px','important');
 badge.style.setProperty('gap',(w*.006).toFixed(2)+'px','important');
}
const numberedBackgrounds=new WeakSet();
function clearBackgroundNumber(bg,source){
 if(!bg||numberedBackgrounds.has(bg))return;
 numberedBackgrounds.add(bg);
 if(source===15||source===16){
  const prefix='data:image/svg+xml;base64,';
  if(!bg.src.startsWith(prefix))return;
  const oldSvg=atob(bg.src.slice(prefix.length));
  const svg=oldSvg.replace(/ \| P.{1,2}gina \d+(?=<\/text>)/,'');
  if(svg!==oldSvg)bg.src=prefix+btoa(svg);
  return;
 }
 if(!bg.src.startsWith('data:image/jpeg;'))return;
 const height=BPF_PAGE_HEIGHTS[source]||841.92;
 const [left,right,fromBottom,toBottom]=source===14?[522,579,29,16]:[492,553,66,53];
 const x1=100*left/pageWidth+'%',x2=100*right/pageWidth+'%';
 const y1=100*(height-fromBottom)/height+'%',y2=100*(height-toBottom)/height+'%';
 bg.style.clipPath='polygon(evenodd,0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,'+
  x1+' '+y1+','+x2+' '+y1+','+x2+' '+y2+','+x1+' '+y2+','+x1+' '+y1+')';
}
function syncPageNumbers(){
 if(typeof bpfPageOrder==='undefined')return;
 const pages=new Map(Array.from(document.querySelectorAll('#pages>.page'),page=>[Number(page.dataset.page),page]));
 bpfPageOrder.forEach((source,index)=>{
  const page=pages.get(source);
  if(!page)return;
  clearBackgroundNumber(page.querySelector('img.background'),source);
  let footer=page.querySelector('.bpf-guide-footer');
  if(!footer){
   footer=document.createElement('div');
   footer.className='bpf-guide-footer';
   page.append(footer);
  }
  if(source!==21){
   footer.style.right=source===14?'3.2%':'7.5%';
   footer.style.bottom=source===14?'1.6%':'5.6%';
  }
  const label='Página '+(index+1)+' de '+bpfPageOrder.length;
  if(footer.textContent!==label)footer.textContent=label;
 });
}
function apply(){
 syncPageNumbers();
 if(typeof BPF_PHRASES==='undefined'||!Array.isArray(BPF_PHRASES))return;
 if(typeof GUIDE_DATA==='undefined'||!Array.isArray(GUIDE_DATA.widgets))return;
 const pages=document.querySelectorAll('#pages>.page');
 if(!pages.length)return;
 const widgets=new Map();
 for(const w of GUIDE_DATA.widgets){
  const k=w.page+'_'+w.name;
  if(w.rect&&!widgets.has(k))widgets.set(k,w);
 }
 const diag={pages:pages.length,total:0,aplicadas:0,semCoordenadas:[]};
 for(const data of BPF_PHRASES){
  const page=Array.from(pages).find(el=>Number(el.dataset.page)===data.page);if(!page)continue;
  for(const row of data.rows){
   const id='bpf-etiqueta-superior-v69-'+data.page+'-'+row.code.replace(/\./g,'-');
   const existing=page.querySelector('[data-etiqueta-id="'+id+'"]');
   if(existing){fitBadge(existing);continue;}
   diag.total++;
   let widget=null;
   for(const scope of row.scopes||[]){
    widget=widgets.get(data.page+'_'+scope.name);
    if(widget)break;
   }
   if(!widget){diag.semCoordenadas.push(data.page+':'+row.code);continue}
   const cats=[...new Set((row.phrases||[]).map(p=>String(p.appcc||'').trim().toUpperCase()).filter(c=>Object.prototype.hasOwnProperty.call(rank,c)))];
   if(!cats.length)continue;
   cats.sort((a,b)=>rank[b]-rank[a]);
   const grade=Math.max(...cats.map(c=>rank[c]));
   const label=cats.join(' e ');
   // Coordenadas da primeira coluna de itens (pontos do PDF).
   // As respostas de cada linha determinam o alinhamento vertical exato.
   const height=widget.size?.[1]||841.92;
   const centerY=height-(widget.rect[1]+widget.rect[3])/2;
   const left=87.2,width=65.1,badgeHeight=15.2;
   const badge=document.createElement('span');
   badge.className='bpf-etiqueta-overlay-v69'+(label.length>=9?' bpf-longa':'')+(label.length>16?' bpf-extralonga':'');
   badge.dataset.etiquetaId=id;
   badge.style.left=(100*left/pageWidth)+'%';
   badge.style.width=(100*width/pageWidth)+'%';
   badge.style.top=(100*(centerY-badgeHeight/2)/height)+'%';
   badge.style.height=(100*badgeHeight/height)+'%';
   badge.style.setProperty('--bpf-borda',outlines[grade]);
   badge.style.setProperty('--bpf-fundo',fills[grade]);
   badge.setAttribute('aria-label','Resumo do item '+row.code+' — '+cats.join(', '));
   const number=document.createElement('span'),divider=document.createElement('span'),suffix=document.createElement('span');
   number.textContent=row.code;divider.textContent='|';suffix.textContent=label;
   badge.append(number,divider,suffix);page.append(badge);fitBadge(badge);
   addSummaryTrigger(badge,data,row);
   diag.aplicadas++;
  }
 }
 window.__bpfEtiquetasDiagnosticoV69=diag;
}
function initSummaries(){
 document.getElementById('nav')?.addEventListener('change',syncPageNumbers);
 apply();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initSummaries,{once:true});else initSummaries();
let count=0;const interval=setInterval(()=>{apply();observePages();if(++count>30)clearInterval(interval)},1000);
window.addEventListener('resize',()=>requestAnimationFrame(apply),{passive:true});
// As 22 páginas são alternadas no celular: recalcular a fonte quando cada
// página passa de oculta para visível (sem mudar os textos nem as respostas).
// O número fica inteiramente na faixa superior; inclusive nas linhas baixas.
function fitFNumbers(page){
 for(const cell of page.querySelectorAll('.bpf-item-code')){
  const number=Array.from(cell.children).find(n=>n.tagName==='SPAN'&&!n.classList.contains('bpf-f'));
  const h=cell.clientHeight,w=cell.clientWidth;
  if(!number||h<2||w<2)continue;
  const fs=Math.min(h*.31,w*.21,page.clientWidth*.014);
  number.style.setProperty('font-size',Math.max(2,fs).toFixed(2)+'px','important');
  number.style.setProperty('line-height','1','important');
 }
}
const observedPages=new WeakSet();
const pageObserver=new ResizeObserver(entries=>{
 for(const entry of entries){
   if(entry.contentRect.width>20){
     entry.target.querySelectorAll('.bpf-etiqueta-overlay-v69').forEach(fitBadge);
     fitFNumbers(entry.target);
   }
 }
});
function observePages(){
 document.querySelectorAll('#pages>.page').forEach(page=>{
   if(!observedPages.has(page)){
     observedPages.add(page);
     pageObserver.observe(page);
   }
 });
}
observePages();
document.querySelectorAll('#pages>.page').forEach(fitFNumbers);
window.addEventListener('resize',()=>document.querySelectorAll('#pages>.page').forEach(fitFNumbers),{passive:true});

// Os índices de origem só são válidos no modelo inicial. As referências PDF
// continuam apontando para as mesmas páginas depois das alterações da montagem.
window.bpfStampReportItemLabels=async function(pdf,sourcePages){
 const lib=window.PDFLib;
 const retained=new Set(pdf.getPages().map(page=>page.ref));
 const widgets=new Map();
 for(const widget of GUIDE_DATA.widgets){
  const key=widget.page+'_'+widget.name;
  if(widget.rect&&!widgets.has(key))widgets.set(key,widget);
 }
 const font=await pdf.embedFont(lib.StandardFonts.HelveticaBold);
 const bg=[lib.rgb(.86,.96,.87),lib.rgb(1,.95,.71),lib.rgb(1,.85,.86)];
 const bd=[lib.rgb(.09,.61,.20),lib.rgb(.94,.67,.02),lib.rgb(.91,.08,.12)];
 for(const source of BPF_PHRASES){
  const page=sourcePages[source.page];
  if(!page||!retained.has(page.ref))continue;
  for(const row of source.rows){
   const widget=row.scopes.map(scope=>widgets.get(source.page+'_'+scope.name)).find(Boolean);
   if(!widget)continue;
   const categories=[...new Set(row.phrases.map(phrase=>String(phrase.appcc||'').trim().toUpperCase())
    .filter(category=>Object.hasOwn(rank,category)))];
   if(!categories.length)continue;
   categories.sort((a,b)=>rank[b]-rank[a]);
   const grade=rank[categories[0]];
   const label=row.code+' | '+categories.join(' e ');
   const x=87.2,width=65.1,height=15.2;
   const centerY=(widget.rect[1]+widget.rect[3])/2+page.getHeight()-widget.size[1];
   const y=centerY-height/2;
   const size=Math.min(FONT_BASE_PT,(width-6)/font.widthOfTextAtSize(label,1));
   page.drawRectangle({x,y,width,height,color:bg[grade],borderColor:bd[grade],borderWidth:1});
   page.drawText(label,{x:x+(width-font.widthOfTextAtSize(label,size))/2,
    y:centerY-size/2+.65,size,font,color:lib.rgb(0,0,0)});
  }
 }
};
})();
