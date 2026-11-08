/* Etiquetas APPCC por item — apresentação visual, sem alterar respostas ou classificação das frases. */
(function(){
'use strict';
if(window.__bpfEtiquetasAppccV1)return;
window.__bpfEtiquetasAppccV1=true;
const style=document.createElement('style');
style.textContent=`
.page .bpf-item-code{gap:.12cqw!important;background:#dceaf3!important;padding:.13cqw!important;overflow:hidden!important}
.page .bpf-item-code>.bpf-etiqueta-appcc{display:flex!important;align-items:center!important;justify-content:center!important;gap:.17cqw!important;width:100%!important;min-width:0!important;max-width:100%!important;height:1.28cqw!important;min-height:0!important;box-sizing:border-box!important;padding:0 .1cqw!important;border:.24cqw solid var(--bpf-criticidade)!important;border-radius:.6cqw!important;background:linear-gradient(135deg,#a9dafa 0%,#5bb0e9 70%,#2b8fcf 100%)!important;color:#000!important;white-space:nowrap!important;line-height:1!important;font:bold .62cqw/1 Arial,Helvetica,sans-serif!important;text-align:center!important;box-shadow:0 .08cqw .2cqw #16314625!important}
.page .bpf-etiqueta-appcc .bpf-numero{flex:0 0 auto;font-weight:800!important}
.page .bpf-etiqueta-appcc .bpf-separador{flex:0 0 auto;opacity:.75}
.page .bpf-etiqueta-appcc .bpf-siglas{flex:0 1 auto;min-width:0;font-size:inherit!important}
.page .bpf-item-code>.bpf-etiqueta-appcc.bpf-extensa{font-size:.47cqw!important;gap:.08cqw!important}
.page .bpf-item-code>.bpf-etiqueta-appcc.bpf-muito-extensa{font-size:.38cqw!important;gap:.04cqw!important}
.page .bpf-item-code>.bpf-f{flex-shrink:0!important;min-height:1.05cqw!important;max-height:1.3cqw!important;margin:0!important;padding:0!important}
@media print{
 .page .bpf-item-code>.bpf-etiqueta-appcc{print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important}
}
`;
document.head.appendChild(style);
const ranks={PPR:0,POP:0,PC:1,PPRO:1,PCC:2};
const borders=['#159a33','#e9b000','#ed1717'];
function aplicar(){
 if(typeof BPF_PHRASES==='undefined')return;
 const pages=document.querySelectorAll('#pages>.page');
 if(!pages.length)return;
 for(const data of BPF_PHRASES){
  const pg=pages[data.page];if(!pg)continue;
  const byCode=new Map(data.rows.map(row=>[row.code,row]));
  for(const cell of pg.querySelectorAll('.bpf-item-code')){
   const el=cell.querySelector(':scope > span');
   if(!el||el.classList.contains('bpf-etiqueta-appcc'))continue;
   const code=el.textContent.trim();
   const row=byCode.get(code);
   if(!row)continue;
   const cats=[...new Set((row.phrases||[]).map(f=>String(f.appcc||'').trim().toUpperCase()).filter(c=>Object.hasOwn(ranks,c)))];
   if(!cats.length)continue;
   cats.sort((a,b)=>ranks[b]-ranks[a]||['PCC','PPRO','PC','POP','PPR'].indexOf(a)-['PCC','PPRO','PC','POP','PPR'].indexOf(b));
   const grade=Math.max(...cats.map(c=>ranks[c]));
   el.classList.add('bpf-etiqueta-appcc');
   const label=cats.join(' + ');
   if((code+' '+label).length>16)el.classList.add('bpf-extensa');
   if((code+' '+label).length>24)el.classList.add('bpf-muito-extensa');
   el.style.setProperty('--bpf-criticidade',borders[grade]);
   el.title='Item '+code+' — '+cats.join(', ')+' — não conformidade '+['menor','maior','crítica'][grade]+'. A classificação de cada frase permanece individual.';
   const numero=document.createElement('span'),barra=document.createElement('span'),siglas=document.createElement('span');
   numero.className='bpf-numero';numero.textContent=code;
   barra.className='bpf-separador';barra.textContent='|';
   siglas.className='bpf-siglas';siglas.textContent=label;
   el.replaceChildren(numero,barra,siglas);
  }
 }
}
const boot=()=>{
 const host=document.getElementById('pages');
 if(!host)return;
 aplicar();
 const observer=new MutationObserver(()=>aplicar());
 observer.observe(host,{childList:true,subtree:true});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();