/* Teste de regressão: renderiza um PDF com texto já desenhado no início de OBS.
   Usa as camadas e geometria reais, PDFLib e canvas, sem navegador. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const PDFLib=require('pdf-lib');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'bpf-frases-legais-tela.js'),'utf8');
const layers=JSON.parse(source.match(/const layers=(.*);/)[1]);
const geometry=JSON.parse(source.match(/const geometry=(.*);/)[1]);
const out=process.argv[2];
if(!out)throw Error('Informe a pasta de teste');
(async()=>{
 const images={};
 for(const i of [6,7,8]){
  const layer=layers[i], img=await loadImage(layer.src);
  Object.assign(img,{style:Object.fromEntries(['left','top','width','height'].map(k=>[k,layer[k]+'%'])),dataset:{bpfRecepcaoF22:'1',bpfImagemF21:'1',bpfFPadraoV28:'1'},getAttribute:()=>layer.src});
  images[i]=img;
 }
 const pdf=await PDFLib.PDFDocument.create();
 const font=await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
 for(let i=0;i<9;i++){
  const g=geometry[i]||geometry[0];
  const sheet=pdf.addPage([g.width,g.height]);
  if(i<6)continue;
  // Texto começa exatamente onde inicia a caixa de observações real.
  sheet.drawText('INICIO DAS OBSERVACOES '+(i+1),{x:g.obs.left+2,y:g.height-g.obs.top-9,font,size:9});
  sheet.drawText('SEGUNDA LINHA PRESERVADA',{x:g.obs.left+2,y:g.height-g.obs.top-20,font,size:9});
 }
 pdf.__bpfPrintReport=true;
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'antes.pdf'),await pdf.save());
 const window={PDFLib,bpfLegalFGeometry:geometry,addEventListener(){}};
 const document={querySelector(selector){return images[Number(selector.match(/data-page="(\d+)"/)[1])]},createElement(){return createCanvas(1,1)},addEventListener(){}};
 const positions=[];
 for(const i of [6,7,8]){
  const page=pdf.getPages()[i], original=page.drawImage.bind(page);
  page.drawImage=(image,box)=>{
   const bottomFromTop=page.getHeight()-box.y;
   assert(bottomFromTop<=geometry[i].obs.top+1e-7);
   assert(bottomFromTop>geometry[i].rows.at(-1).bottom);
   positions.push({i,bottomFromTop,obsTop:geometry[i].obs.top});
   original(image,box);
  };
 }
 vm.runInNewContext(fs.readFileSync(path.join(root,'bpf-pdf-paridade-html-v27.js'),'utf8'),{window,document});
 fs.writeFileSync(path.join(out,'depois.pdf'),await pdf.save());
 assert.equal(positions.length,3);
 console.log(positions);
})().catch(err=>{console.error(err);process.exitCode=1});
