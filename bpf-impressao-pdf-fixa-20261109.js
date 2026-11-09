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
 function repairWidgetPages(pdf){
  // Alguns PDFs de origem conservam /P apontando para paginas antigas.
  // O pdf-lib exige que /P corresponda a pagina atual ao achatar formularios.
  var L=window.PDFLib, pageKey=L.PDFName.of('P');
  var pages=pdf.getPages(), repaired=0, seen=new Set();
  for(var i=0;i<pages.length;i++){
   var page=pages[i], refs=page.node.Annots();
   if(!refs||typeof refs.asArray!=='function')continue;
   for(var ref of refs.asArray()){
    var annot;
    try{annot=pdf.context.lookup(ref);}catch(e){continue;}
    if(!annot||typeof annot.get!=='function'||typeof annot.set!=='function')continue;
    var subtype=annot.get(L.PDFName.of('Subtype'));
    if(String(subtype)!=='/Widget')continue;
    var old=annot.get(pageKey);
    if(String(old)!==String(page.ref)){annot.set(pageKey,page.ref);repaired++;}
    seen.add(String(ref));
   }
  }
  // Evitar gerar um PDF corrompido: identificar campos cujos widgets nao
  // constam de nenhuma pagina, para manter o relatorio original intacto.
  var missing=[];
  try{
   for(var field of pdf.getForm().getFields()){
    var kids=field.acroField.Kids();
    var refs=kids&&typeof kids.asArray==='function'?kids.asArray():[field.ref];
    for(var ref of refs){
     if(ref&&!seen.has(String(ref)))missing.push(String(field.getName())+': '+String(ref));
    }
   }
  }catch(e){console.warn('Verificacao dos widgets:',e);}
  if(missing.length)console.warn('Widgets sem pagina no PDF de origem:',missing.slice(0,20));
  console.info('Impressao BPF: referencias de pagina corrigidas:',repaired);
  return repaired;
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
    repairWidgetPages(this);
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
