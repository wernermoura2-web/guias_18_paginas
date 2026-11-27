const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const PDFLib=require('pdf-lib');
const source=fs.readFileSync('sw-guia18.js','utf8');
const patch=source.match(/const helperTextFixed=helperText\.replace\([\s\S]*?\.join\('\s*\\n'\)\);/)[0];
const template=source.match(/const removeTemplateFieldsCode=(".*");/)[1];
const code=vm.runInNewContext(patch+'\nhelperTextFixed;', {helperText:' form.flatten({updateFieldAppearances:true});'});
const reconcile=JSON.parse(template);
(async()=>{
 for(const filename of ['Guia_18_Paginas_Editavel.pdf','Guia_18_Ampliado_22_Paginas_Editavel.pdf']){
  const pdf=await PDFLib.PDFDocument.load(fs.readFileSync(filename));
  const form=pdf.getForm();
  const isClear=f=>f instanceof PDFLib.PDFButton && /^LIMPAR(?:\s|$)/i.test(f.getName());
  const clear=form.getFields().filter(isClear);
  assert.equal(clear.length,15);
  const refs=new Set(clear.flatMap(f=>[String(f.ref),...f.acroField.getWidgets().map(w=>String(pdf.context.getObjectRef(w.dict)))]));
  const originalCount=form.getFields().length;
  const withoutFlatten=code.replace(' form.flatten({updateFieldAppearances:true});','');
  vm.runInNewContext(reconcile+'\n'+withoutFlatten,{pdf,form,PDFLib,console});
  assert.equal(form.getFields().filter(isClear).length,0);
  assert(form.getFields().length>0);
  assert(form.getFields().length<=originalCount-15);
  for(const page of pdf.getPages())for(const ref of page.node.Annots()?.asArray()||[])assert(!refs.has(String(ref)));
  console.log(filename+': 15 botões removidos; respostas preservadas.');
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
