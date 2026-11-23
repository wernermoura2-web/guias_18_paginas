/* Renderiza as mesmas células da v31 usando o próprio pintor do HTML.
 * Ambiente de geração: @napi-rs/canvas e Liberation Sans (métrica Arial). */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createCanvas, loadImage, GlobalFonts} = require('@napi-rs/canvas');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const out = process.argv[2];
if (!out) throw Error('Informe a pasta temporária de saída');
for (const style of ['Regular','Bold']) {
  const file = ['liberation','liberation2'].map(dir=>`/usr/share/fonts/truetype/${dir}/LiberationSans-${style}.ttf`).find(p=>fs.existsSync(p));
  if (!file) throw Error('Liberation Sans não encontrada: '+style);
  if (!GlobalFonts.registerFromPath(file, 'Arial')) throw Error('Fonte não registrada: '+file);
}
const source = read('bpf-frases-legais-tela.js');
const layers = JSON.parse(source.match(/const layers=(.*);/)[1]);
const geometry = JSON.parse(source.match(/const geometry=(.*);/)[1]);
const BPF_PHRASES = JSON.parse(read('equipe.html').match(/const BPF_PHRASES=(.*?);\n/)[1]);
const window = {bpfLegalFGeometry: geometry};
const document = {readyState:'loading', addEventListener(){}, getElementById(){return null}};
const context = vm.createContext({window,document,BPF_PHRASES});
// Executar a preparação já presente no HTML; os dois itens com ordem própria
// são lidos diretamente dos textos legais das respectivas revisões.
const consolidated = read('bpf-captacao-conducao-consolidado.js');
const prepare = consolidated.slice(consolidated.indexOf(' function preparePhrases(){'), consolidated.indexOf(' const synchronizedItems='));
vm.runInContext('function ensure458FOrder(){} function ensure469FOrder(){}\n'+prepare+'\npreparePhrases();', context);
for (const file of ['bpf-recepcao-frases-v22.js','bpf-frases-imagem-v21.js']) vm.runInContext(read(file),context);
vm.runInContext(read('bpf-frases-f-padrao-completo-v28.js').replace(/\}\)\(\);\s*$/, 'window.paint=paint; window.configurations=configurations;})();'),context);
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const specs=[];
  for (const i of [6,7,8]) {
    const conf=window.configurations[i];
    const canvas=createCanvas(conf.width,conf.height), ctx=canvas.getContext('2d');
    ctx.drawImage(await loadImage(layers[i].src),0,0);
    for (const row of geometry[i].rows) window.paint(ctx,row,conf,geometry[i],i);
    const filename=`pagina-${i+1}.png`;
    fs.writeFileSync(path.join(out,filename),canvas.toBuffer('image/png'));
    const {left,top,width,height}=layers[i];
    specs.push({page:i,filename,left:left/100,top:top/100,width:width/100,height:height/100,expectedWidth:geometry[i].width,expectedHeight:geometry[i].height});
  }
  fs.writeFileSync(path.join(out,'specs.json'),JSON.stringify(specs));
  const rows=window.BPFFrasesPadraoCompletoV28.rows;
  if(rows.length!==25)throw Error('Esperados 25 itens; obtidos '+rows.length);
  console.log(JSON.stringify(rows,null,2));
})().catch(err=>{console.error(err);process.exitCode=1;});
