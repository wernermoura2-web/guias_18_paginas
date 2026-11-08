/* Etiquetas de APPCC: somente os números na tabela superior dos processos. */
(function(){
'use strict';
if(window.__bpfEtiquetasSuperioresV65)return;
window.__bpfEtiquetasSuperioresV65=true;
const style=document.createElement('style');
style.textContent=`
.page .bpf-etiqueta-superior{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:.18cqw!important;vertical-align:middle!important;max-width:98%!important;box-sizing:border-box!important;margin:0 auto!important;padding:.08cqw .22cqw!important;border:.17cqw solid var(--bpf-cor)!important;border-radius:.38cqw!important;background:linear-gradient(120deg,#a6d5f3,#4ba5de)!important;color:#000!important;font:800 .59cqw/1.15 Arial,Helvetica,sans-serif!important;white-space:nowrap!important;text-align:center!important;print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important}
.page .bpf-etiqueta-superior .bpf-badge-numero,.page .bpf-etiqueta-superior .bpf-badge-siglas{color:#000!important}
.page .bpf-etiqueta-superior.bpf-longa{font-size:.46cqw!important;gap:.09cqw!important}
.page .bpf-etiqueta-superior.bpf-extra-longa{font-size:.35cqw!important;gap:.05cqw!important}
`;
document.head.appendChild(style);
const levels={PPR:0,POP:0,PC:1,PPRO:1,PCC:2}, colors=['#159a33','#e9b000','#ed1717'];
const regex=/^4\.\d{1,2}\.\d{1,2}$/;
function apply(){
 if(typeof BPF_PHRASES==='undefined'||!Array.isArray(BPF_PHRASES))return;
 const pages=document.querySelectorAll('#pages>.page');
 if(!pages.length)return;
 BPF_PHRASES.forEach((data)=>{
  const page=pages[data.page];if(!page)return;
  const rows=new Map((data.rows||[]).map(row=>[row.code,row]));
  const done=new Set([...page.querySelectorAll('.bpf-etiqueta-superior')].map(n=>n.dataset.code));
  // Procurar somente texto exato do número, evitando etiquetas da área AVALIAÇÃO.
  const walker=document.createTreeWalker(page,NodeFilter.SHOW_TEXT);
  const candidates=[];let node;
  while((node=walker.nextNode())){
   const code=(node.nodeValue||'').trim();
   if(!regex.test(code)||done.has(code)||!rows.has(code))continue;
   const parent=node.parentElement;
   if(!parent||parent.closest('.bpf-item-code,.bpf-etiqueta-superior,button,a,[role="button"],.bpf-f'))continue;
   candidates.push({node,code});
   done.add(code);
  }
  for(const {node,code} of candidates){
   const row=rows.get(code);
   const cats=[...new Set((row.phrases||[]).map(p=>String(p.appcc||'').trim().toUpperCase()).filter(c=>Object.prototype.hasOwnProperty.call(levels,c)))];
   if(!cats.length)continue;
   cats.sort((a,b)=>levels[b]-levels[a]);
   const grade=Math.max(...cats.map(c=>levels[c]));
   const label=cats.join(' + ');
   const badge=document.createElement('span');
   badge.className='bpf-etiqueta-superior'+(label.length>9?' bpf-longa':'')+(label.length>16?' bpf-extra-longa':'');
   badge.dataset.code=code;
   badge.style.setProperty('--bpf-cor',colors[grade]);
   badge.title=code+' — '+cats.join(', ')+' — não conformidade '+['menor','maior','crítica'][grade];
   const left=document.createElement('span'),right=document.createElement('span'),sep=document.createElement('span');
   left.className='bpf-badge-numero';left.textContent=code;
   sep.textContent='|';
   right.className='bpf-badge-siglas';right.textContent=label;
   badge.append(left,sep,right);
   node.parentNode.replaceChild(badge,node);
  }
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
let n=0;const id=setInterval(()=>{apply();if(++n>45)clearInterval(id)},1000);
})();