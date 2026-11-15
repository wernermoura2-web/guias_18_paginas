/* Mantém os identificadores dos itens na impressão direta pelo navegador. */
(function(){
'use strict';
if(window.__bpfCorrecaoFPrintV72)return;
window.__bpfCorrecaoFPrintV72=true;
const style=document.createElement('style');
style.id='bpf-correcao-f-print-v72';
style.textContent=`
/* As faixas de numeração e botão F são controladas pelo complemento principal.
   NÃO sobrescrever display/position/flex das células nem do botão F. */
@media print {
 /* Preservar exatamente a apresentação anterior dos F no PDF. */
 #pages .page .bpf-item-code>span:first-child{display:block!important;visibility:visible!important}
 #pages .page .bpf-item-code>.bpf-f{display:none!important}
}
`;
(document.head||document.documentElement).append(style);
})();
