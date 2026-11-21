/* Item 4.5.8: inverter F2 e F3 somente na página das frases F.
   F2 = inspeção individual, aceitação e reprovação das embalagens.
   F3 = destino final das embalagens reprovadas.
   Preserva IDs, respostas, observações, exemplos e chaves de JSON
   vinculados às frases originais, inclusive em registros existentes. */
(function(){
'use strict';
if(window.__bpf458F2F3V23)return;
const original=window.bpfPanels;
if(typeof original!=='function')return;
window.bpfPanels=function(page,row){
 const panels=original.apply(this,arguments);
 if(row?.code!=='4.5.8'||Number(page?.page)!==6||!Array.isArray(panels)||panels.length<3)return panels;
 const f2=panels[1],f3=panels[2];
 if(typeof f2?.label!=='string'||typeof f3?.label!=='string'||!f2.label.startsWith('F2')||!f3.label.startsWith('F3'))return panels;
 return [panels[0],
  {...f3,label:'F2'+f3.label.slice(2)},
  {...f2,label:'F3'+f2.label.slice(2)},
  ...panels.slice(3)];
};
window.__bpf458F2F3V23=true;
})();
