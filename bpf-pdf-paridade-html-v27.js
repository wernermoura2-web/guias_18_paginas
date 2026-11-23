/* Paridade das frases F do PDF com a camada visual aprovada no HTML.
   Paginas originais: 7 (recepcao), 8 (retornaveis), 9 (descartaveis).
   Nao modifica respostas, campos, matriz, altura ou observacoes gerais. */
(function(){
'use strict';
if(window.__bpfPdfHtmlParidadeV27)return;
window.__bpfPdfHtmlParidadeV27=true;
const indices=[6,7,8];
const status={version:'20261123-v32-observacoes',aplicadas:[],erro:null};
window.BPFPdfHtmlParidade=status;
function readSource(index){
 const img=document.querySelector('#pages > .page[data-page="'+index+'"] img.bpf-legal-f-screen');
 if(!img)throw Error('Camada de frases F nao encontrada na pagina '+(index+1));
 if(index===6&&img.dataset.bpfRecepcaoF22!=='1')
  throw Error('A revisao F2/F3 da recepcao ainda nao foi carregada.');
 if((index===7||index===8)&&img.dataset.bpfImagemF21!=='1')
  throw Error('A revisao de tipografia das embalagens ainda nao foi carregada.');
 if(img.dataset.bpfFPadraoV28!=='1')
  throw Error('A padronizacao completa F1/F2/F3 da pagina '+(index+1)+' ainda nao terminou.');
 const source=img.getAttribute('src')||'';
 if(!source.startsWith('data:image/png;base64,'))
  throw Error('A imagem das frases F da pagina '+(index+1)+' nao esta pronta.');
 const measure=key=>{
  const n=Number.parseFloat(img.style[key]);
  if(!Number.isFinite(n)||n<0||n>100)throw Error('Medida invalida: '+key);
  return n/100;
 };
 const left=measure('left'),top=measure('top'),width=measure('width'),height=measure('height');
 // A imagem original inclui uma faixa branca abaixo do cabeçalho de OBS.
 // No HTML ela fica atrás do textarea; no PDF, save() é chamado depois de
 // desenhar as observações. Recortar essa faixa evita ocultar as primeiras linhas.
 const geometry=window.bpfLegalFGeometry?.[index];
 const obsTop=geometry?.obs?.top/geometry?.height;
 const lastRow=geometry?.rows?.at(-1)?.bottom/geometry?.height;
 if(!Number.isFinite(obsTop)||!Number.isFinite(lastRow)||obsTop<=lastRow||obsTop<=top||obsTop>=top+height)
  throw Error('Limite das observacoes invalido na pagina '+(index+1));
 const iw=img.naturalWidth,ih=img.naturalHeight;
 if(!iw||!ih||!img.complete)throw Error('Imagem das frases F ainda nao carregada.');
 // Arredondar para baixo: nenhum pixel da camada deve entrar na área do texto.
 const cropHeight=Math.floor((obsTop-top)*ih/height);
 if(cropHeight<1||cropHeight>=ih||top+height*cropHeight/ih<=lastRow)
  throw Error('Recorte das frases F invalido na pagina '+(index+1));
 const canvas=document.createElement('canvas');
 canvas.width=iw;canvas.height=cropHeight;
 const ctx=canvas.getContext('2d');
 if(!ctx)throw Error('Nao foi possivel recortar a camada F.');
 ctx.drawImage(img,0,0,iw,cropHeight,0,0,iw,cropHeight);
 return {src:canvas.toDataURL('image/png'),left,top,width,height:height*cropHeight/ih,obsTop};
}
async function synchronize(pdf){
 const pages=pdf.getPages();
 if(pages.length<9)return;
 const hasGuide=pdf.__bpfPrintReport===true || !!pdf.getForm().getFieldMaybe('BPF_State');
 if(!hasGuide)return;
 if(pdf.__bpfParidadeF28)return;
 const order=(typeof bpfPageOrder!=='undefined'&&Array.isArray(bpfPageOrder))?bpfPageOrder:null;
 const sources=indices.map(index=>({index,...readSource(index)}));
 for(const source of sources){
  const targetIndex=order?order.indexOf(source.index):source.index;
  // Paginas omitidas no relatorio nao recebem camadas sobre outras paginas.
  if(targetIndex<0)continue;
  const sheet=pages[targetIndex];
  if(!sheet)throw Error('Pagina ausente no PDF: '+(source.index+1));
  const w=sheet.getWidth(),h=sheet.getHeight();
  const image=await pdf.embedPng(source.src);
  const box={x:w*source.left,y:h*(1-source.top-source.height),width:w*source.width,height:h*source.height};
  if(box.y<0||box.x<0||box.x+box.width>w+.2||box.y+box.height>h+.2)
   throw Error('Posicao da camada F fora da pagina '+(source.index+1));
  if(source.top+source.height>source.obsTop+1e-9)
   throw Error('Camada F invadindo observacoes na pagina '+(source.index+1));
  sheet.drawImage(image,box);
  status.aplicadas.push({pagina:source.index+1,paginaNoPDF:targetIndex+1,largura:Math.round(box.width),altura:Math.round(box.height)});
 }
 pdf.__bpfParidadeF28=true;
}
function install(){
 const p=window.PDFLib?.PDFDocument?.prototype;
 if(!p||typeof p.save!=='function')return false;
 if(p.save.__bpfHtmlF27)return true;
 const original=p.save;
 const wrap=async function(...args){
  try{await synchronize(this)}
  catch(e){status.erro=String(e);throw Error('Paridade visual F: '+String(e.message||e));}
  return original.apply(this,args);
 };
 wrap.__bpfHtmlF27=true;
 p.save=wrap;
 return true;
}
if(!install())document.addEventListener('DOMContentLoaded',install,{once:true});
window.addEventListener('load',install,{once:true});
})();
