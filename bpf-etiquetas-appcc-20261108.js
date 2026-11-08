/* Etiquetas APPCC sobre as linhas da TABELA SUPERIOR, que sao imagem do PDF.
   Usa a posicao das respostas do formulario para alinhar os numeros.
   Nao modifica frases, F, dados, calculos ou a area de AVALIACAO inferior. */
(function(){
'use strict';
if(window.__bpfEtiquetasSuperioresV69)return;
window.__bpfEtiquetasSuperioresV69=true;
const css=document.createElement('style');
css.id='bpf-etiquetas-superiores-v69';
css.textContent=`
.page .bpf-etiqueta-overlay-v69 {
 position:absolute!important;z-index:12!important;box-sizing:border-box!important;
 display:flex!important;align-items:center!important;justify-content:center!important;
 gap:.17cqw!important;border:.19cqw solid var(--bpf-borda)!important;
 border-radius:.43cqw!important;background:var(--bpf-fundo)!important;
 color:#000!important;font:900 1.9cqw/1.08 Arial,Helvetica,sans-serif!important;
 white-space:nowrap!important;overflow:hidden!important;
 text-align:center!important;pointer-events:none!important;
 -webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;
}
.page .bpf-etiqueta-overlay-v69.bpf-longa{font-size:1.48cqw!important;gap:.08cqw!important}
.page .bpf-etiqueta-overlay-v69.bpf-extralonga{font-size:1.15cqw!important;gap:.05cqw!important}
.page .bpf-etiqueta-overlay-v69>span {color:#000!important}
/* Fonte geral restaurada ao padrão das etiquetas da versão de referência.
   Somente o 4.5.3 recebe redução discreta pelo ajuste JS de largura. */
.page .bpf-etiqueta-overlay-v69>span {flex:0 0 auto!important;min-width:0!important}
.page .bpf-etiqueta-overlay-v69[data-etiqueta-id$="-4-5-3"] {letter-spacing:-.012em!important}
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
   width:100%!important;height:42%!important;
   box-sizing:border-box!important;
   display:flex!important;
   align-items:center!important;justify-content:center!important;
   visibility:visible!important;
   min-height:0!important;
   line-height:1!important;
   white-space:nowrap!important;
   z-index:1!important;
 }
 #pages .page>.bpf-item-code>.bpf-f {
   position:absolute!important;
   top:42%!important;left:0!important;bottom:0!important;
   width:100%!important;height:58%!important;
   max-width:100%!important;
   box-sizing:border-box!important;
   min-height:0!important;
   margin:0!important;padding:0!important;
   display:flex!important;
   align-items:center!important;justify-content:center!important;
   visibility:visible!important;
   z-index:2!important;
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
/* Ajustar as letras à área útil real da etiqueta, em vez de cqw
   relativo ao viewport, que fica pequeno ao ampliar o PDF no celular. */
const measureCanvas=document.createElement('canvas');
const measureContext=measureCanvas.getContext('2d');
function fitBadge(badge){
 const children=Array.from(badge.children);
 if(children.length!==3)return;
 const w=badge.clientWidth,h=badge.clientHeight;
 if(w<10||h<5||!measureContext)return;
 const available=Math.max(1,w-Math.max(4,w*.075));
 const label=children.map(el=>el.textContent.trim()).join('');
 const is453=badge.dataset.etiquetaId?.endsWith('-4-5-3');
 let lo=3,hi=Math.min(h*.78,18);
 for(let n=0;n<17;n++){
   const mid=(lo+hi)/2;
   measureContext.font='900 '+mid+'px Arial,Helvetica,sans-serif';
   if(measureContext.measureText(label).width <= available)lo=mid;
   else hi=mid;
 }
 // Só o 4.5.3 recebe redução sutil, com margem para as três classes.
 const size=is453?lo*.92:lo;
 badge.style.setProperty('font-size',size.toFixed(2)+'px','important');
 badge.style.setProperty('gap','0px','important');
}
function apply(){
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
  const page=pages[data.page];if(!page)continue;
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
   badge.title='Item '+row.code+' — '+cats.join(', ')+' — não conformidade '+['menor','maior','crítica'][grade];
   const number=document.createElement('span'),divider=document.createElement('span'),suffix=document.createElement('span');
   number.textContent=row.code;divider.textContent='|';suffix.textContent=label;
   badge.append(number,divider,suffix);page.append(badge);fitBadge(badge);
   diag.aplicadas++;
  }
 }
 window.__bpfEtiquetasDiagnosticoV69=diag;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
let count=0;const interval=setInterval(()=>{apply();if(++count>30)clearInterval(interval)},1000);
window.addEventListener('resize',()=>requestAnimationFrame(apply),{passive:true});
// As 22 páginas são alternadas no celular: recalcular a fonte quando cada
// página passa de oculta para visível (sem mudar os textos nem as respostas).
const observedPages=new WeakSet();
const pageObserver=new ResizeObserver(entries=>{
 for(const entry of entries){
   if(entry.contentRect.width>20){
     entry.target.querySelectorAll('.bpf-etiqueta-overlay-v69').forEach(fitBadge);
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


// As etiquetas desenhadas na tela não entram automaticamente no PDF editável:
// o exportador usa o modelo PDF incorporado. Aplicar as mesmas classificações
// ao documento efetivamente salvo, sem alterar os F ou os campos editáveis.
(function prepareEditablePdfOverlay(){
 const Lib=window.PDFLib;
 if(!Lib?.PDFDocument||window.__bpfPdfOverlayV72)return;
 window.__bpfPdfOverlayV72=true;
 const oldSave=Lib.PDFDocument.prototype.save;
 Lib.PDFDocument.prototype.save=async function(options){
  if(!this.__bpfStampedV72&&this.getPageCount()>=22){
   this.__bpfStampedV72=true;
   try{
    const font=await this.embedFont(Lib.StandardFonts.HelveticaBold);
    const byScope=new Map();
    for(const w of GUIDE_DATA.widgets||[]){
     if(w.rect&&!byScope.has(w.page+'_'+w.name))byScope.set(w.page+'_'+w.name,w);
    }
    const bg=[Lib.rgb(.86,.96,.87),Lib.rgb(1,.95,.71),Lib.rgb(1,.85,.86)];
    const bd=[Lib.rgb(.09,.61,.20),Lib.rgb(.94,.67,.02),Lib.rgb(.91,.08,.12)];
    let count=0;
    for(const data of BPF_PHRASES||[]){
     if(data.page>=this.getPageCount())continue;
     const page=this.getPage(data.page);
     for(const row of data.rows||[]){
      const widget=(row.scopes||[]).map(scope=>byScope.get(data.page+'_'+scope.name)).find(Boolean);
      if(!widget)continue;
      const cats=[...new Set((row.phrases||[]).map(p=>String(p.appcc||'').trim().toUpperCase()).filter(c=>Object.hasOwnProperty.call(rank,c)))];
      if(!cats.length)continue;
      cats.sort((a,b)=>rank[b]-rank[a]);
      const grade=Math.max(...cats.map(c=>rank[c]));
      const label=row.code+'  |  '+cats.join(' e ');
      const width=65.1, height=15.2, x=87.2;
      const y=(widget.rect[1]+widget.rect[3])/2-height/2;
      const size=Math.max(3,Math.min(9.6,(width-4)/font.widthOfTextAtSize(label,1)));
      page.drawRectangle({x,y,width,height,color:bg[grade],borderColor:bd[grade],borderWidth:1});
      const textSize=size; // sem redução extra na etiqueta do PDF
      page.drawText(label,{x:x+(width-font.widthOfTextAtSize(label,textSize))/2,y:y+(height-textSize)/2+.65,size:textSize,font,color:Lib.rgb(0,0,0)});
      count++;
     }
    }
    console.info('Classificações APPCC incluídas no PDF:',count);
   }catch(err){console.error('Falha ao inserir as classificações no PDF',err);}
  }
  return oldSave.call(this,options);
 };
})();
})();