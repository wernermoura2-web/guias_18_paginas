/* Correção final do item 4.5.3 — F2 saneantes e F3 reprovação.
   Aplicada depois de todos os revisores, sem apagar respostas ou observações. */
(function(){
'use strict';
if(window.__bpf453CorrectionV9){window.BPF453Correcao?.executar?.();return;}
window.__bpf453CorrectionV9=true;
const SANEANTES='Os produtos saneantes devem estar regularizados no órgão competente.';
const REPROVACAO='Quando as especificações previamente determinadas não forem atendidas, os insumos devem ser reprovados.';
const saneante=p=>/produtos saneantes devem estar regularizados/i.test(String(p?.text||''));
const reprovado=p=>/especificaç(?:ões|oes) previamente determinadas|insumos devem ser reprovados/i.test(String(p?.text||''));
function repair(phrases){
 if(!Array.isArray(phrases)||phrases.length<3)return false;
 if(reprovado(phrases[1])&&saneante(phrases[2])){
  const f2=phrases[1],f3=phrases[2];
  phrases.splice(1,2,
   {...f3,fieldSuffix:f3.fieldSuffix??3},
   {...f2,fieldSuffix:f2.fieldSuffix??2});
 }
 const f2=phrases[1],f3=phrases[2];
 const changed=f2.text!==SANEANTES||f3.text!==REPROVACAO||f2.appcc!=='PPR'||f3.appcc!=='PPRO';
 f2.text=SANEANTES;f2.appcc='PPR';
 f3.text=REPROVACAO;f3.appcc='PPRO';
 return changed;
}
function replaceVisible(root){
 if(!root||!root.ownerDocument&&root.nodeType!==9)return;
 const doc=root.ownerDocument||root;
 const walker=doc.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  if(node.parentElement?.closest('script,style,textarea'))continue;
  const previous=node.nodeValue||'';
  if(!previous.includes('F2')&&!previous.includes('F3'))continue;
  const current=previous
   .replace(/\bF3\s*[—–-]\s*Os produtos saneantes devem estar regularizados no órgão competente\.?/g,'F2 — '+SANEANTES)
   .replace(/\bF2\s*[—–-]\s*Quando as especificações previamente determinadas não forem atendidas, os insumos devem ser reprovados\.?/g,'F3 — '+REPROVACAO);
  if(current!==previous)node.nodeValue=current;
 }
}
function run(root){
 let fixed=0;
 if(typeof BPF_PHRASES!=='undefined'&&Array.isArray(BPF_PHRASES)){
  for(const page of BPF_PHRASES)for(const row of page.rows||[]){
   if(row.code!=='4.5.3')continue;
   if(repair(row.phrases))fixed++;
   for(const scope of row.scopes||[])if(repair(scope.phrases))fixed++;
  }
 }
 replaceVisible(root||document.body);
 document.documentElement.dataset.bpf453='f2-saneantes-f3-reprovacao-v9';
 window.BPF453Correcao={versao:'20261121-v9',frasesAjustadas:fixed,f2:SANEANTES,f3:REPROVACAO,executar:()=>run(document.body)};
}
function start(){
 run(document.body);
 if(window.MutationObserver){
  const observer=new MutationObserver(records=>{
   for(const record of records)for(const node of record.addedNodes){
    if(node.nodeType===1)run(node);
   }
  });
  observer.observe(document.body,{childList:true,subtree:true});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
