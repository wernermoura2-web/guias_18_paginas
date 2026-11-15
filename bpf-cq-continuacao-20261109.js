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
function reference(i){return 'Ver observações na continuação — item '+ids[i]+'.';}
function actualText(value,i){
 const text=String(value||'').trim();
 return text===reference(i)?'':text;
}
const starts=[start,oldStart],ends=[end,oldEnd];
function strip(value){
 let s=String(value||'');
 for(let k=0;k<starts.length;k++){
  let n=0;
  while(n++<30){
   const i=s.indexOf(starts[k]);if(i<0)break;
   const j=s.indexOf(ends[k],i+starts[k].length);
   if(j<0)break;
   s=(s.slice(0,i)+s.slice(j+ends[k].length)).trim();
  }
 }
 return s;
}
function block(){
 const v=valuesRef();if(!v)return '';
 let lines=[];
 for(let i=0;i<ids.length;i++){
  if(!moved(v,i))continue;
  const value=actualText(v[original(i)],i);
  if(value)lines.push('ITEM '+ids[i]+' — OBSERVAÇÕES\n'+value);
 }
 return lines.length?start+'\n'+'----------------------------------------\n\n'+lines.join('\n\n----------------------------------------\n\n')+'\n\n'+end:'';
}
window.bpfCQTransferBlock=block;
window.bpfCQStrip=strip;
function update(){
 const v=valuesRef();if(!v)return;
 for(let i=0;i<ids.length;i++){
  const current=actualText(v[names[i]],i),saved=actualText(v[original(i)],i);
  if(moved(v,i)){
   if(!saved&&current)v[original(i)]=current;
   v[names[i]]=reference(i);
  }else if(v[names[i]]===reference(i)&&saved){
   v[names[i]]=saved;
  }
 }
}
function toggle(i){
 const v=valuesRef();if(!v)return;
 if(!moved(v,i)){
  const current=actualText(v[names[i]],i);
  if(!current)return;
  v[original(i)]=current;
  v[key(i)]='1';
 }else{
  v[key(i)]='0';
  v[names[i]]=actualText(v[original(i)],i);
 }
 if(typeof changed==='function')changed();
 window.Guia?.recalc();
}
const className='bpf-cq-transfer-v108';
function paint(){
 const v=valuesRef(),guide=window.Guia;
 const page=document.querySelector('#pages .page[data-page="11"]');
 if(!v||!page||!guide?.data?.widgets)return;
 const resultColumn=guide.data.widgets.find(w=>w.page===11&&w.name==='fill_10_7'&&w.rect);
 if(!resultColumn)return;
 const [columnLeft,,columnRight]=resultColumn.rect;
 const horizontalInset=2, bottomInset=2, buttonHeight=19;
 for(let i=0;i<ids.length;i++){
  const w=guide.data.widgets.find(w=>w.page===11&&w.name===names[i]&&w.rect&&w.size);
  if(!w)continue;
  let btn=page.querySelector('button.'+className+'[data-i="'+i+'"]');
  if(!btn){btn=document.createElement('button');btn.className=className;btn.type='button';btn.dataset.i=String(i);btn.onclick=e=>{e.preventDefault();e.stopPropagation();toggle(i);};page.append(btn);}
  const [,rowBottom]=w.rect,[W,H]=w.size;
  btn.style.left=((columnLeft+horizontalInset)/W*100)+'%';
  btn.style.top=((H-rowBottom-bottomInset-buttonHeight)/H*100)+'%';
  btn.style.width=((columnRight-columnLeft-2*horizontalInset)/W*100)+'%';
  btn.style.height=(buttonHeight/H*100)+'%';
  btn.textContent=moved(v,i)?'↩ Voltar':'→ Continuar';
  btn.title=moved(v,i)?'Voltar observação do item '+ids[i]+' à tabela':'Transferir observação do item '+ids[i]+' para a continuação';
  btn.setAttribute('aria-pressed',String(moved(v,i)));
 }
}
const css=document.createElement('style');
css.textContent='.'+className+'{position:absolute;z-index:80;padding:0 1px;display:grid;place-items:center;font:700 clamp(7px,1.7cqw,15px)/1 Arial,sans-serif;white-space:nowrap;text-align:center;color:#145578;background:#eef7fb;border:1px solid #216789;border-radius:3px;cursor:pointer;box-sizing:border-box}.'+className+'[aria-pressed=true]{background:#d9edf4}@media print{.'+className+'{display:none!important}}';
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
window.bpfCQTransferSync=sync;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();