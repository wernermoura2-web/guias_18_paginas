/* GUIA BPF/APPCC: etiquetas somente nos números superiores. Não modifica F, respostas ou dados. */
(function(){
'use strict';
if(window.__bpfEtiquetasV66)return;
window.__bpfEtiquetasV66=true;
const css=document.createElement('style');
css.id='bpf-etiquetas-superiores-v66';
css.textContent=`
.page .bpf-etiqueta-superior-v66{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:.20cqw!important;box-sizing:border-box!important;max-width:96%!important;min-width:0!important;min-height:1.15cqw!important;padding:.12cqw .3cqw!important;margin:0 auto!important;border:.17cqw solid var(--bpf-cor)!important;border-radius:.43cqw!important;background:linear-gradient(110deg,#a4d6f3,#3d9bd8)!important;color:#000!important;font:800 .58cqw/1.1 Arial,Helvetica,sans-serif!important;white-space:nowrap!important;vertical-align:middle!important;text-align:center!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
.page .bpf-etiqueta-superior-v66.bpf-etiqueta-longa{font-size:.43cqw!important;gap:.10cqw!important;padding-inline:.12cqw!important}
.page .bpf-etiqueta-superior-v66.bpf-etiqueta-extra-longa{font-size:.34cqw!important;gap:.06cqw!important}
.page .bpf-etiqueta-superior-v66 *{color:#000!important}
`;
document.head.appendChild(css);
const ranks={PPR:0,POP:0,PC:1,PPRO:1,PCC:2};
const colors=['#159a33','#e9b000','#ed1717'];
const patt=/^4\.\d{1,2}\.\d{1,2}$/;
function apply(){
 const model=window.BPF_PHRASES;
 if(!Array.isArray(model))return;
 const pages=document.querySelectorAll('#pages>.page');
 model.forEach(data=>{
  const pg=pages[data.page];if(!pg)return;
  const rows=new Map((data.rows||[]).map(r=>[r.code,r]));
  const done=new Set([...pg.querySelectorAll('.bpf-etiqueta-superior-v66')].map(e=>e.dataset.item));
  const walker=document.createTreeWalker(pg,NodeFilter.SHOW_TEXT);
  const todo=[];let node;
  while((node=walker.nextNode())){
   const code=node.nodeValue.trim();
   if(!patt.test(code)||!rows.has(code)||done.has(code))continue;
   const parent=node.parentElement;
   if(!parent||parent.closest('.bpf-item-code,.bpf-f,.bpf-etiqueta-superior-v66,button,a,[role="button"],input,textarea,[contenteditable="true"]'))continue;
   // A tabela dos processos aparece antes do título AVALIAÇÃO.
   const cell=parent.closest('td,th');
   if(!cell)continue;
   if(cell.closest('.bpf-evaluation,.bpf-avaliacao,[class*="assessment"],[class*="avaliacao"]'))continue;
   const row=rows.get(code);
   const cats=[...new Set((row.phrases||[]).map(f=>String(f.appcc||'').trim().toUpperCase()).filter(k=>Object.prototype.hasOwnProperty.call(ranks,k)))];
   if(!cats.length)continue;
   const level=Math.max(...cats.map(k=>ranks[k]));
   todo.push({node,code,cats,level});
   done.add(code);
  }
  todo.forEach(({node,code,cats,level})=>{
   if(!node.isConnected)return;
   const label=cats.join(' e ');
   const badge=document.createElement('span');
   badge.className='bpf-etiqueta-superior-v66'+(label.length>9?' bpf-etiqueta-longa':'')+(label.length>16?' bpf-etiqueta-extra-longa':'');
   badge.dataset.item=code;
   badge.style.setProperty('--bpf-cor',colors[level]);
   badge.title=code+' — '+cats.join(', ')+' — NC '+['menor','maior','crítica'][level];
   const left=document.createElement('span'),sep=document.createElement('span'),right=document.createElement('span');
   left.textContent=code;sep.textContent='|';right.textContent=label;
   badge.append(left,sep,right);
   node.parentNode.replaceChild(badge,node);
  });
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
else apply();
let rounds=0;
const interval=setInterval(()=>{apply();if(++rounds>=45)clearInterval(interval)},1000);
})();