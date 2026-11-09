/* Guia BPF: proteger impressão PDF contra caracteres sem representação WinAnsi.
   Apenas a cópia PDF é alterada; o preenchimento HTML/JSON permanece intacto. */
(function(){
'use strict';
function normalize(value){
 if(typeof value!=='string')return value;
 const map={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9',
 '⁰':'0','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','≤':'<=','≥':'>=','≠':'!=',
 '→':'->','←':'<-','↔':'<->','✓':'OK','✔':'OK','☑':'[X]','☐':'[ ]',
 'α':'alfa','β':'beta','γ':'gama','δ':'delta','Δ':'Delta','−':'-','‐':'-','‑':'-','‒':'-','―':'-',
 ' ':' ',' ':' ','​':'','⁠':''};
 const win=/^[\x20-\x7e\u00a0-\u00ff€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]$/u;
 let out='';
 for(const ch of value){
  if(ch==='\n'||ch==='\r'||ch==='\t'){out+=ch;continue;}
  if(win.test(ch)){out+=ch;continue;}
  let alt=map[ch];
  if(alt===undefined){
   alt=ch.normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
   if(alt===ch)alt='?';
   alt=[...alt].map(x=>win.test(x)?x:'?').join('');
  }
  out+=alt;
 }
 return out;
}
function install(){
 const Text=window.PDFLib&&window.PDFLib.PDFTextField;
 if(!Text||!Text.prototype)return false;
 const p=Text.prototype;
 if(p.__bpfPrintUnicodeSafe)return true;
 const set=p.setText,update=p.updateAppearances;
 p.setText=function(value){return set.call(this,normalize(value));};
 p.updateAppearances=function(font){
   const old=this.getText();
   if(typeof old==='string'){
     const safe=normalize(old);
     if(safe!==old)set.call(this,safe);
   }
   return update.apply(this,arguments);
 };
 p.__bpfPrintUnicodeSafe=true;
 return true;
}
install();
document.addEventListener('click',function(e){
 const el=e.target&&e.target.closest&&e.target.closest('button,[role="button"],a');
 if(el&&/^Imprimir\s*(?:\/\s*)?PDF$/i.test(String(el.textContent||'').trim()))install();
},true);
window.bpfPrintInstallWinAnsiGuard=install;
})();