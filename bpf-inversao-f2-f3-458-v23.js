/* 4.5.8 — inversão solicitada na página F:
   F2 recebe o conteúdo do antigo F3 (destino final);
   F3 recebe o conteúdo do antigo F2 (inspeção individual).
   Preserva os objetos e dados relacionados às frases. */
(function(){
'use strict';
if(window.__bpf458F2F3V25)return;
window.__bpf458F2F3V25=true;
const text=p=>String(p?.text||p?.texto||p?.label||'');
const isDestino=p=>/destino final das embalagens|embalagens reprovadas e outras informações/i.test(text(p));
const isInspecao=p=>/inspeção individual|inspecao individual|aceitação e reprovação|aceitacao e reprovacao/i.test(text(p));
let changes=0;
function fixPhrases(phrases){
 if(!Array.isArray(phrases)||phrases.length<3)return;
 const a=phrases.findIndex((p,i)=>i>0&&isDestino(p));
 const b=phrases.findIndex((p,i)=>i>0&&isInspecao(p));
 if(a<0||b<0||a===b)return;
 if(a!==1||b!==2){
  const destino=phrases[a],inspecao=phrases[b];
  phrases[1]=destino;phrases[2]=inspecao;
  changes++;
 }
}
function fixData(){
 try{
  if(typeof BPF_PHRASES==='undefined'||!Array.isArray(BPF_PHRASES))return;
  for(const page of BPF_PHRASES)for(const row of page.rows||[]){
   if(row.code!=='4.5.8')continue;
   fixPhrases(row.phrases);
   for(const scope of row.scopes||[])fixPhrases(scope.phrases);
  }
 }catch(e){console.warn('4.5.8: falha na inversão',e);}
 document.documentElement.dataset.bpf458='f2-destino-f3-inspecao-v25';
 window.BPF458Correcao={versao:'20261121-v25',alteracoes:changes,executar:fixData};
}
function patchPanels(){
 const original=window.bpfPanels;
 if(typeof original!=='function'||original.__bpf458v25)return;
 const replacement=function(){
  const panels=original.apply(this,arguments),row=arguments[1];
  if(row?.code!=='4.5.8'||!Array.isArray(panels)||panels.length<3)return panels;
  const destino=panels.find((p,i)=>i>0&&isDestino(p));
  const inspecao=panels.find((p,i)=>i>0&&isInspecao(p));
  if(!destino||!inspecao||destino===inspecao)return panels;
  const other=panels.filter((p,i)=>i!==0&&p!==destino&&p!==inspecao);
  return [panels[0],{...destino,label:'F2'+String(destino.label||'').replace(/^F[0-9]+/,'')},{...inspecao,label:'F3'+String(inspecao.label||'').replace(/^F[0-9]+/,'')},...other];
 };
 replacement.__bpf458v25=true;window.bpfPanels=replacement;
}
function execute(){fixData();patchPanels();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',execute,{once:true});
else execute();
})();
