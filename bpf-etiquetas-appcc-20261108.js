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
 color:#000!important;font:800 .72cqw/1.1 Arial,Helvetica,sans-serif!important;
 white-space:nowrap!important;overflow:hidden!important;
 text-align:center!important;pointer-events:none!important;
 -webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;
}
.page .bpf-etiqueta-overlay-v69.bpf-longa{font-size:.59cqw!important;gap:.08cqw!important}
.page .bpf-etiqueta-overlay-v69.bpf-extralonga{font-size:.46cqw!important;gap:.05cqw!important}
.page .bpf-etiqueta-overlay-v69>span {color:#000!important}
`;
document.head.appendChild(css);

/* A identificacao APPCC fica somente na tabela superior.
   Nas linhas inferiores mantemos o botao F, sem a miniatura repetida. */
const fixes=document.createElement('style');
fixes.id='bpf-layout-impressao-v70';
fixes.textContent=`
/* Preservar integralmente o conjunto original número + botão F. */
@media screen {
 #bpf-editor textarea{min-height:13.5em!important;line-height:1.5!important;}
 #bpf-editor .bpf-guidance{line-height:1.5!important;padding-top:22.5px!important;padding-bottom:22.5px!important;}
}
@media print {
 #pages .page>.bpf-etiqueta-overlay-v69{display:flex!important;visibility:visible!important;opacity:1!important;print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important;}
}
`;
document.head.appendChild(fixes);

const rank={PPR:0,POP:0,PC:1,PPRO:1,PCC:2};
const outlines=['#159a33','#f0b400','#e91a20'];
const fills=['linear-gradient(110deg,#dbf7dc,#a9eeb5)','linear-gradient(110deg,#fff7bc,#ffe47a)','linear-gradient(110deg,#ffd6da,#ffa9b0)'];
const pageWidth=595.32;
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
   if(page.querySelector('[data-etiqueta-id="'+id+'"]'))continue;
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
   const left=87.2,width=65.1,badgeHeight=13.5;
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
   badge.append(number,divider,suffix);page.append(badge);
   diag.aplicadas++;
  }
 }
 window.__bpfEtiquetasDiagnosticoV69=diag;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
let count=0;const interval=setInterval(()=>{apply();if(++count>30)clearInterval(interval)},1000);
})();