/* Uniformiza a apresentacao dos titulos F1/F2/F3 no editor HTML.
   Nao altera perguntas, categorias APPCC, respostas, botoes, tabelas ou geometria do guia. */
(function(){
'use strict';
if(window.__bpfPadraoVisualF123_20261123)return;
window.__bpfPadraoVisualF123_20261123=true;
const css=document.createElement('style');
css.id='bpf-padrao-visual-f123-20261123';
css.textContent=`
@media screen {
 #bpf-editor fieldset.bpf-group>legend,
 #bpf-editor fieldset.bpf-unified-group>legend{
  font-family:Arial,Helvetica,sans-serif!important;
  font-size:15px!important;
  font-weight:600!important;
  line-height:1.3!important;
  color:#153c52!important;
  letter-spacing:normal!important;
  text-transform:none!important;
  text-shadow:none!important;
 }
 #bpf-editor .bpf-group-description,
 #bpf-editor .bpf-unified-group-description,
 #bpf-editor .bpf-answer-item>span {
  font-family:Arial,Helvetica,sans-serif!important;
  font-size:14px!important;
  font-weight:400!important;
  line-height:1.4!important;
  color:#172f3c!important;
  letter-spacing:normal!important;
 }
}
`;
(document.head||document.documentElement).appendChild(css);
document.documentElement.dataset.bpfF123Tipografia='uniforme-20261123';
})();