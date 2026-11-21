/* 4.5.8 — ordem confirmada na página F:
   F1: POP; F2: inspeção individual após 'sobre:';
   F3: destino final das embalagens.
   Ajusta a apresentação dos painéis sem trocar chaves de resposta/observação. */
(function(){
'use strict';
if(window.__bpf458F2F3V26)return;
window.__bpf458F2F3V26=true;
const normal=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const phraseText=p=>normal(p?.text||p?.texto||p?.phrase?.text||p?.phrase?.texto||'');
const panelText=(p,row)=>{
 const texts=[p?.label,p?.text,p?.texto];
 for(const e of p?.entries||[]){
  texts.push(e?.text,e?.texto,e?.phrase?.text,e?.phrase?.texto);
  if(e?.scope?.phrases&&Number.isInteger(e.index))texts.push(e.scope.phrases[e.index]?.text,e.scope.phrases[e.index]?.texto);
 }
 for(const i of p?.indices||[])for(const scope of row?.scopes||[])texts.push(scope.phrases?.[i]?.text,scope.phrases?.[i]?.texto);
 return normal(texts.filter(Boolean).join(' '));
};
const isInspection=t=>/inspecao individual|aceitacao e reprovacao/.test(t);
const isDestination=t=>/destino final das embalagens/.test(t);
let wrapped=false,corrected=0,lastCheck='';
function install(){
 const fn=window.bpfPanels;
 if(typeof fn!=='function'||fn.__bpf458v26)return false;
 const replacement=function(page,row){
  const panels=fn.apply(this,arguments);
  if(row?.code!=='4.5.8'||!Array.isArray(panels)||panels.length<3)return panels;
  const inspect=panels.find((p,i)=>i>0&&isInspection(panelText(p,row)));
  const destiny=panels.find((p,i)=>i>0&&isDestination(panelText(p,row)));
  if(!inspect||!destiny||inspect===destiny){lastCheck='4.5.8: não localizados ambos os painéis';return panels;}
  const others=panels.filter((p,i)=>i>0&&p!==inspect&&p!==destiny);
  const relabel=(p,n)=>({...p,label:'F'+n+String(p.label||'').replace(/^F\d+/,'')});
  corrected++;
  lastCheck='F2 inspeção; F3 destino final';
  return [panels[0],relabel(inspect,2),relabel(destiny,3),...others];
 };
 replacement.__bpf458v26=true;
 window.bpfPanels=replacement;wrapped=true;return true;
}
function run(){install();window.BPF458Correcao={versao:'20261121-v26',get ativo(){return wrapped},get correcoes(){return corrected},get diagnostico(){return lastCheck},executar:run};document.documentElement.dataset.bpf458='f2-inspecao-f3-destino-v26';}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.addEventListener('load',run,{once:true});
})();
