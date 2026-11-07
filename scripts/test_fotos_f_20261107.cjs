const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
(async()=>{
for(const file of ['individual.html','equipe.html']){
 const s=fs.readFileSync(file,'utf8');
 const D=JSON.parse(s.match(/const GUIDE_DATA\s*=\s*(\{.*?\});/s)[1]);
 const slots=D.widgets.filter(x=>[15,16].includes(x.page)&&/^(?:Imagem|Foto_Extra_)\d+$/.test(x.name)).map(x=>x.name);
 assert.equal(slots.length,24);
 const values={}, pictures={Imagem1:'conducao',Imagem2:'captacao1',Foto_Extra_12:'captacao2'};
 for(const [n,p]of Object.entries({Imagem1:'4.2 Condução',Imagem2:'4.1 Captação',Foto_Extra_12:'4.1 Captação'})){values['BPF_PhotoProcess_'+n]=p;values['BPF_PhotoLocation_'+n]=pictures[n];}
 const context={D,TEAM18_PHOTO_SLOTS:slots,values,console,setTimeout,clearTimeout,Uint8Array,ArrayBuffer};
 vm.createContext(context);
 const scripts=[...s.matchAll(/<script(?=[\s>])[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
 for(const js of scripts)if(js.trim())new vm.Script(js);
 const lib=scripts.find(x=>x.includes('Z_STREAM_END'));assert(lib);vm.runInContext(lib,context);
 vm.runInContext(s.slice(s.indexOf('const BPF_GALLERY_SLOTS='),s.indexOf('let bpfPhotoContext=')),context);
 context.bpfSortPhotos(values,pictures,'Foto_Extra_12');
 assert.deepEqual(slots.slice(0,3).map(n=>pictures[n]),['captacao1','captacao2','conducao']);
 assert.equal(values.BPF_PhotoLocation_Imagem1,'captacao1');
 vm.runInContext(s.slice(s.indexOf('function bpfPreparePhotoPdf('),s.indexOf('async function bpfExportEditable()')),context);
 const libPDF=context.PDFLib, bytes=Buffer.from(s.match(/const BPF_EMBEDDED_PDF="([^"]+)"/)[1],'base64');
 const pdf=await libPDF.PDFDocument.load(new Uint8Array(bytes)),font=await pdf.embedFont(libPDF.StandardFonts.Helvetica),form=pdf.getForm();
 context.bpfPreparePhotoPdf(pdf,form,font);
 assert.equal(form.getFields().filter(f=>f.getName().startsWith('BPF_Photo')).length,48);
 assert.equal(pdf.getPageCount(),22);
 const generated=await pdf.save();assert(generated.length>1000);
 console.log(file+': ordem, 24 fotos, 48 legendas e exportação PDF conferidas.');
}
})().catch(e=>{console.error(e);process.exitCode=1});
