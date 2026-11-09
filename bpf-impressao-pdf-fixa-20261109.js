/* Guia BPF: somente IMPRIMIR PDF produz relatorio fechado.
   O PDF EM BRANCO e os dados do HTML permanecem editaveis.
   Achatamento real dos formularios pelo pdf-lib, sem mascaras visuais.
 */
(function(){
 'use strict';
 if(window.__BPF_PRINT_FLATTEN_V99)return;
 window.__BPF_PRINT_FLATTEN_V99=true;
 var printTicket=0,originalSave=null;

 function isPrintButton(el){
  if(!el||!el.closest)return false;
  var node=el.closest('button,[role="button"],a');
  if(!node)return false;
  var label=String(node.textContent||'').replace(/\s+/g,' ').trim();
  return /^Imprimir\s*(?:\/\s*)?PDF$/i.test(label);
 }
 function setRiskBeforePrint(){
  try{
   if(typeof window.Guia?.recalc==='function')window.Guia.recalc();
   var v=window.Guia?.values;if(!v)return;
   var fields=['Dropdown60','Dropdown61','Dropdown62','Dropdown63','Dropdown64','Dropdown65','Dropdown66','Dropdown67'];
   var high=fields.some(function(k){return /^ALTO/i.test(String(v[k]||''));});
   if(high){v.Dropdown58='ALTO';v.Group279='2';}
   if(typeof window.sync==='function')window.sync();
  }catch(e){console.warn('Impressao: risco nao sincronizado:',e);}
 }
 function install(){
  var Pdf=window.PDFLib?.PDFDocument;
  if(!Pdf?.prototype||typeof Pdf.prototype.save!=='function')return false;
  if(Pdf.prototype.save.__BPF_PRINT_FLATTEN_V99)return true;
  originalSave=Pdf.prototype.save;
  var wrapped=async function(){
   var chosen=printTicket;
   if(!chosen||Date.now()-chosen>180000)return originalSave.apply(this,arguments);
   printTicket=0;
   try{
    var form=this.getForm();
    // Transforma as aparencias dos campos em conteudo fixo das paginas.
    // Fotos/rotulos ja desenhados no PDF permanecem na pagina.
    form.flatten({updateFieldAppearances:true});
    // Remover scripts embarcados para impedir que o documento impresso
    // altere percentuais, risco, radio do grupo ou qualquer resposta.
    try{
     var Names=window.PDFLib.PDFName;
     var namesRef=this.catalog.get(Names.of('Names'));
     if(namesRef){
      var names=this.context.lookup(namesRef);
      if(names&&typeof names.delete==='function')names.delete(Names.of('JavaScript'));
     }
    }catch(ignore){}
    this.setTitle('Guia BPF/APPCC - Relatorio de inspecao - somente leitura');
    this.setSubject('PDF de impressao: resultados e anexos fixos, sem campos editaveis.');
   }catch(err){
    // Nunca produzir, sob o nome de 'impresso', uma versao interativa
    // que possa transformar ALTO em MEDIO quando o leitor recalcular.
    alert('Nao foi possivel fechar o PDF para impressao. O relatorio editavel nao sera gerado: '+err);
    throw err;
   }
   return originalSave.apply(this,arguments);
  };
  wrapped.__BPF_PRINT_FLATTEN_V99=true;
  Pdf.prototype.save=wrapped;
  return true;
 }
 document.addEventListener('click',function(event){
  if(!isPrintButton(event.target))return;
  setRiskBeforePrint();
  if(!install()){
   event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
   alert('A biblioteca PDF ainda nao esta disponivel. Aguarde o carregamento do guia e tente novamente.');
   return;
  }
  printTicket=Date.now();
 },true);
 if(!install()){
  document.addEventListener('DOMContentLoaded',install,{once:true});
 }
})();
