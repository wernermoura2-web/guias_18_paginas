/* 4.5.8 — correção da ordem dos F na página de frases.
   F1: POP; F2: inspeção individual/aceitação/reprovação;
   F3: destino final das embalagens reprovadas.
   Mantém cada objeto de frase, seus identificadores e informações vinculadas. */
(function(){
'use strict';
if(window.__bpf458F2F3V24)return;
window.__bpf458F2F3V24=true;
const isDestino=p=>/destino final das embalagens|embalagens reprovadas e outras informações/i.test(String(p?.text||p?.texto||''));
const isInspecao=p=>/inspeção individual|inspecao individual|aceitação e reprovação|aceitacao e reprovacao/i.test(String(p?.text||p?.texto||''));
let changes=0;
function fixPhrases(phrases){
 if(!Array.isArray(phrases)||phrases.length<3)return;
 const a=phrases.findIndex((p,i)=>i>0&&isInspecao(p));
 const b=phrases.findIndex((p,i)=>i>0&&isDestino(p));
 if(a<0||b<0||a===b)return;
 if(a!==1||b!==2){
  const inspection=phrases[a],destination=phrases[b];
  phrases[1]=inspection;phrases[2]=destination;
  changes++;
 }
}
function fixData(){
 try{
  if(typeof BPF_PHRASES==='undefined'||!Array.isArray(BPF_PHRASES))return;
  for(const page of BPF_PHRASES){
   for(const row of page.rows||[]){
    if(row.code!=='4.5.8')continue;
    fixPhrases(row.phrases);
    for(const scope of row.scopes||[])fixPhrases(scope.phrases);
   }
  }
 }catch(e){console.warn('4.5.8: erro na atualização das frases',e);}
 document.documentElement.dataset.bpf458='f2-inspecao-f3-destino-v24';
 window.BPF458Correcao={versao:'20261121-v24',alteracoes:changes,executar:fixData};
}
function patchPanels(){
 const original=window.bpfPanels;
 if(typeof original!=='function'||original.__bpf458v24)return;
 const replacement=function(page,row){
  const panels=original.apply(this,arguments);
  if(row?.code!=='4.5.8'||!Array.isArray(panels)||panels.length<3)return panels;
  const inspection=panels.find((p,i)=>i>0&&isInspecao(p));
  const destination=panels.find((p,i)=>i>0&&isDestino(p));
  if(inspection&&destination){
   const rest=panels.filter((p,i)=>i!==0&&p!==inspection&&p!==destination);
   return [panels[0],{...inspection,label:'F2'+String(inspection.label||'').replace(/^F\d+/,'')},{...destination,label:'F3'+String(destination.label||'').replace(/^F\d+/,'')},...rest];
  }
  return panels;
 };
 replacement.__bpf458v24=true;
 window.bpfPanels=replacement;
}
function execute(){fixData();patchPanels();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',execute,{once:true});
else execute();
})();
