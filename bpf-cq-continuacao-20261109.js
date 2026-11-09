/* Transferência reversível de observações 4.10.1–4.10.6 para continuação. */
(function(){
'use strict';
if(window.__CQ108)return;window.__CQ108=true;
const ids=['4.10.1','4.10.2','4.10.3','4.10.4','4.10.5','4.10.6'];
const names=ids.map(x=>'OBSERVAÇÕES'+x.replaceAll('.','').slice(0,4));
const key=i=>'BPF_CQ_Continuar_'+ids[i].replaceAll('.','_');
const original=i=>'BPF_CQ_Original_'+ids[i].replaceAll('.','_');
const start='CONTINUAÇÃO DAS OBSERVAÇÕES — CONTROLE DA QUALIDADE';
const oldStart='[INÍCIO DAS OBSERVAÇÕES TRANSFERIDAS DO CONTROLE DA QUALIDADE]';
const oldEnd='[FIM DAS OBSERVAÇÕES TRANSFERIDAS DO CONTROLE DA QUALIDADE]';
const end='FIM DAS OBSERVAÇÕES DO CONTROLE DA QUALIDADE';
function valuesRef(){return window.Guia?.values||window.values;}
function moved(v,i){return v[key(i)]==='1';}
function removeBlock(s){s=String(s||'');for(const [first,last] of [[start,end],[oldStart,oldEnd]]){let a=s.indexOf(first),b=s.indexOf(last,a+first.length);if(a>=0&&b>a)s=(s.slice(0,a)+s.slice(b+last.length)).trim();}return s;}
// A página 15 é a de índice 14 (contagem interna começa em zero).
// Não usar obs_gerais_continuacao como destino: ele está na página 14.
function destination(){
 const widgets=window.Guia?.data?.widgets||[];
 const list=widgets.filter(w=>w.page===14&&w.rect&&w.size);
 const exact=list.find(w=>w.name==='BPF_ObsGeneralFlow');
 if(exact)return exact.name;
 // Campo de texto maior situado ABAIXO da tabela de documentos.
 const candidates=list.filter(w=>{
  const name=String(w.name||'');
  const [x1,y1,x2,y2]=w.rect;
  const width=x2-x1,height=y2-y1,H=w.size[1];
  return width>180&&height>90&&(y1+y2)/2<H*.58&&
    !/imagem|foto|r[oó]tulo|document|situacao|atende|risco/i.test(name);
 }).sort((a,b)=>(b.rect[2]-b.rect[0])*(b.rect[3]-b.rect[1])-
                 (a.rect[2]-a.rect[0])*(a.rect[3]-a.rect[1]));
 return candidates[0]?.name||null;
}
function update(){
 const v=valuesRef();if(!v)return;
 const target=destination();
 // Não transferir para a página errada caso o campo da página 15 não seja localizado.
 if(!target){console.warn('CQ: campo de continuação da página 15 não encontrado');return;}
 const parts=[];
 for(let i=0;i<ids.length;i++){
  if(moved(v,i)){
   const current=String(v[names[i]]||'');
   if(current&&!current.startsWith('Ver observações na continuação'))v[original(i)]=current;
   const text=String(v[original(i)]||'');
   if(text)parts.push('ITEM '+ids[i]+' — OBSERVAÇÕES\\n'+text);
   v[names[i]]='Ver observações na continuação — item '+ids[i]+'.';
  }else if(v[original(i)]!==undefined){
   if(String(v[names[i]]||'').startsWith('Ver observações na continuação'))
    v[names[i]]=v[original(i)];
  }
 }
 // Limpar apenas o bloco automático da página 14, sem tocar nos documentos.
 const old=String(v.obs_gerais_continuacao||'');
 const cleaned=removeBlock(old);
 if(old!==cleaned)v.obs_gerais_continuacao=cleaned;
 const previousTarget=String(v[target]||'');
 const base=removeBlock(previousTarget);
 const block=parts.length?start+'\\n\\n'+parts.join('\\n\\n')+'\\n\\n'+end:'';
 const next=[base,block].filter(Boolean).join('\\n\\n');
 if(previousTarget!==next)v[target]=next;
}
function toggle(i){
 const v=valuesRef();if(!v)return;
 if(!moved(v,i)){v[original(i)]=v[names[i]]||'';v[key(i)]='1';}
 else {v[key(i)]='0';v[names[i]]=v[original(i)]||'';}
 update();
 try{if(typeof changed==='function')changed();}catch(e){console.warn('CQ:',e);}
 queueMicrotask(()=>{update();paint();});
}
const className='bpf-cq-transfer-v108';
function paint(){
 const v=valuesRef(),guide=window.Guia;
 const page=document.getElementById('pages')?.children?.[11];
 if(!v||!page||!guide?.data?.widgets)return;
 for(let i=0;i<ids.length;i++){
  const w=guide.data.widgets.find(w=>w.page===11&&w.name===names[i]&&w.rect&&w.size);
  if(!w)continue;
  let btn=page.querySelector('button.'+className+'[data-i="'+i+'"]');
  if(!btn){btn=document.createElement('button');btn.className=className;btn.type='button';btn.dataset.i=String(i);btn.onclick=e=>{e.preventDefault();e.stopPropagation();toggle(i);};page.append(btn);}
  const [,y1,x2,y2]=w.rect,[W,H]=w.size;
  btn.style.left=((x2+5)/W*100)+'%';
  btn.style.top=((H-y2+(y2-y1)*.67)/H*100)+'%';
  btn.style.width=(Math.min(95,Math.max(52,W-x2-7))/W*100)+'%';
  btn.textContent=moved(v,i)?'↩ Voltar':'→ Continuar';
  btn.title=moved(v,i)?'Voltar observação do item '+ids[i]+' à tabela':'Transferir observação do item '+ids[i]+' para a continuação';
  btn.setAttribute('aria-pressed',String(moved(v,i)));
 }
}
const css=document.createElement('style');
css.textContent='.'+className+'{position:absolute;z-index:80;padding:1px 2px;min-height:12px;font:700 clamp(6px,.9cqw,9px)/1.1 Arial,sans-serif;white-space:normal;text-align:center;color:#145578;background:#eef7fb;border:1px solid #216789;border-radius:3px;cursor:pointer;box-sizing:border-box}.'+className+'[aria-pressed=true]{background:#d9edf4}@media print{.'+className+'{display:none!important}}';
document.head.append(css);
function sync(){update();paint();}
function init(){
 sync();
 const pages=document.getElementById('pages');
 if(pages)new MutationObserver(()=>queueMicrotask(sync)).observe(pages,{childList:true,subtree:false});
 document.addEventListener('click',e=>{
  if(e.target?.closest?.('.'+className))return;
  const b=e.target?.closest?.('button,a,[role=button]');
  if(b&&/Imprimir\s*PDF|Salvar arquivo/i.test(b.textContent||''))sync();
 },true);
 window.addEventListener('beforeprint',sync);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.bpfCQTransferSync=sync;
})();