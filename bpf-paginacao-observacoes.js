/* Paginação das observações do controle da qualidade e das não conformidades. */
const bpfObservationContinuationTitle='OBSERVAÇÕES GERAIS DOS PROCESSOS — CONTINUAÇÃO';
const bpfNCTitle='OBSERVAÇÕES GERAIS — CONTINUAÇÃO DAS NÃO CONFORMIDADES';
const bpfOverflowPages=new Map();
let bpfCQObservationFlow={full:null,parts:['']};
let bpfNCObservationCache={full:null,parts:[]};

function bpfObservationLines(text,font,width,size){
 if(!text)return [];
 const lines=[];
 for(const paragraph of text.split('\n')){
  let line='';
  for(const word of paragraph.trim().split(/\s+/)){
   const candidate=line?line+' '+word:word;
   if(font.widthOfTextAtSize(candidate,size)<=width){line=candidate;continue;}
   if(line){lines.push(line);line='';}
   for(const character of word){
    if(line&&font.widthOfTextAtSize(line+character,size)>width){lines.push(line);line='';}
    line+=character;
   }
  }
  lines.push(line);
 }
 return lines;
}

function bpfIsNCEntry(line){
 return /^\s*\d+\.\s+(?:Frase\b|Considerando que a frase\b)/i.test(line);
}

function bpfIsNCDefinition(line){
 return /^\s*(?:BPF|APPCC|PCC|PPRO|PPR|PC|POP)\s+[—–-]\s+/i.test(line);
}

function bpfObservationParagraphs(text,spacing){
 const rows=[];
 const isNCRecord=line=>bpfIsNCEntry(line)||bpfIsNCDefinition(line);
 for(const line of text.split('\n')){
  let gap=0;
  if((spacing==='nc'&&isNCRecord(line))||(spacing==='cq'&&/^ITEM 4\.10\.\d+\b/i.test(line))){
   let previous=rows.length-1;
   while(previous>=0&&(!rows[previous].line.trim()||
    (spacing==='cq'&&/^-{4,}\s*$/.test(rows[previous].line))))previous--;
   const follows=spacing==='cq'?previous>=0:previous>=0&&isNCRecord(rows[previous].line);
   if(follows){rows.length=previous+1;gap=1/4;}
  }
  rows.push({line,gap});
 }
 return rows;
}

function bpfAppendNCObservationText(fragment,text,spacing='nc'){
 let spaced=false;
 for(const [index,{line,gap}] of bpfObservationParagraphs(text,spacing).entries()){
  if(gap){
   const divider=document.createElement('span');
   divider.className='bpf-nc-gap';
   divider.setAttribute('aria-hidden','true');
   fragment.append(divider);
   spaced=true;
  }else if(index)fragment.append(document.createTextNode('\n'));
  if(line)fragment.append(document.createTextNode(line));
 }
 return spaced;
}

function bpfPaginateObservation(text,firstRect,nextRect,size,font,spacing){
 const parts=[];
 let remaining=text;
 do{
  const [left,bottom,right,top]=parts.length?nextRect:firstRect;
  const width=right-left-16,maxLines=Math.max(1,Math.floor((top-bottom-16)/(size*1.35)));
  const fits=part=>{
   const content=part.trimEnd();
   if(!content)return true;
   const lines=bpfObservationParagraphs(content,spacing).reduce((total,{line,gap})=>
    total+Math.max(1,bpfObservationLines(line,font,width,size).length)+gap,0);
   return lines<=maxLines;
  };
  if(parts.length&&!remaining.trim()){parts[parts.length-1]+=remaining;break;}
  if(fits(remaining)){parts.push(remaining);break;}
  let lo=0,hi=remaining.length;
  while(lo<hi){
   const mid=Math.ceil((lo+hi)/2);
   if(fits(remaining.slice(0,mid)))lo=mid;else hi=mid-1;
  }
  let cut=Math.max(1,lo);
  if(!/\s/.test(remaining.charAt(cut-1))&&!/\s/.test(remaining.charAt(cut))){
   const separator=remaining.slice(0,cut).search(/\s(?=\S*$)/);
   if(separator>0&&cut-separator<28)cut=separator+1;
  }
  if(/[\uDC00-\uDFFF]/.test(remaining.charAt(cut)))cut=cut>1?cut-1:cut+1;
  parts.push(remaining.slice(0,cut));
  remaining=remaining.slice(cut);
 }while(remaining);
 return parts;
}

function bpfObservationScreenFont(size){
 const ctx=document.createElement('canvas').getContext('2d');
 if(ctx)ctx.font=size+'px Arial';
 return {widthOfTextAtSize(text){return ctx?ctx.measureText(text).width:text.length*size*.6;}};
}

function bpfRunNCObservationFlow(full){
 full=String(full||'').replace(/\r\n?/g,'\n');
 if(full!==bpfNCObservationCache.full){
  bpfNCObservationCache={full,parts:bpfPaginateObservation(full,bpfNCFirstRect,bpfNCPageRect,BPF_NC_FONT_SIZE,bpfObservationScreenFont(BPF_NC_FONT_SIZE),'nc')};
 }
 const [first='',second='',...extra]=bpfNCObservationCache.parts;
 values['OBS 1']=first;
 values[BPF_NC_CONTINUATION]=second;
 const serialized=JSON.stringify({field:BPF_NC_CONTINUATION,first,second,extra,full,font:BPF_NC_FONT_SIZE});
 if(values.BPF_ObsGeneralFlow!==serialized)values.BPF_ObsGeneralFlow=serialized;
}

function bpfObservationPageId(kind,offset){
 // Intervalo reservado entre a continuação original e as páginas extras de fotos.
 return 22-1/(2+offset*2+(kind==='cq'?1:0));
}

function bpfMakeObservationOverflowPage(id,title){
 const page=document.createElement('section');page.className='page';page.dataset.page=id;
 page.style.aspectRatio=bpfNCPageSize.join(' / ');
 const bg=document.createElement('img');bg.className='background';bg.src=bpfNCBackground;bg.alt='';
 const header=document.createElement('div');header.className='bpf-nc-continuation-title';header.textContent=title;
 const body=document.createElement('div');body.className='overlay printable bpf-overflow-observation';
 place(body,{rect:bpfNCPageRect,size:bpfNCPageSize});
 body.style.fontSize=(BPF_NC_FONT_SIZE/595.32*100)+'cqw';
 page.append(bg,header,body);
 return page;
}

function bpfReconcileObservationPages(){
 const full=String(values.obs_gerais_continuacao||'').replace(/\r\n?/g,'\n');
 const rect=D.widgets.find(widget=>widget.name==='obs_gerais_continuacao')?.rect;
 if(rect&&full!==bpfCQObservationFlow.full){
  bpfCQObservationFlow={full,parts:bpfPaginateObservation(full,rect,bpfNCPageRect,BPF_CQ_FONT_SIZE,bpfObservationScreenFont(BPF_CQ_FONT_SIZE),'cq')};
 }
 const groups=[
  {anchor:13,kind:'nc',title:bpfNCTitle,parts:bpfNCObservationCache.parts.slice(1)},
  {anchor:14,kind:'cq',title:bpfObservationContinuationTitle,parts:bpfCQObservationFlow.parts.slice(1)}
 ];
 const next=new Map();
 for(const {anchor,kind,title,parts} of groups){
  for(const [offset,text] of parts.entries()){
   const id=kind==='nc'&&offset===0?bpfNCPageIndex:bpfObservationPageId(kind,offset);
   next.set(id,{anchor,title,text,spacing:kind});
  }
 }
 let changed=false;
 for(const id of bpfOverflowPages.keys()){
  if(next.has(id))continue;
  const index=bpfPageOrder.indexOf(id);
  if(index>=0)bpfPageOrder.splice(index,1);
  bpfSheets[id].remove();
  if(id!==bpfNCPageIndex)delete bpfSheets[id];
  changed=true;
 }
 if(!next.has(bpfNCPageIndex)&&bpfPageOrder.includes(bpfNCPageIndex)){
  bpfPageOrder.splice(bpfPageOrder.indexOf(bpfNCPageIndex),1);
  bpfSheets[bpfNCPageIndex].remove();
  changed=true;
 }
 const previous=new Map();
 for(const [id,{anchor,title,text,spacing}] of next){
  const page=bpfSheets[id]??=bpfMakeObservationOverflowPage(id,title);
  const predecessor=previous.get(anchor)??anchor;
  if(!bpfPageOrder.includes(id)){
   const index=bpfPageOrder.indexOf(predecessor)+1;
   const following=bpfPageOrder[index];
   host.insertBefore(page,bpfSheets[following]||null);
   bpfPageOrder.splice(index,0,id);
   changed=true;
  }
  previous.set(anchor,id);
  const body=page.querySelector('.bpf-overflow-observation');
  if(body&&body.bpfRenderedObservation!==text){
   bpfRenderNCObservation(body,text,spacing);
   body.removeAttribute('aria-hidden');
  }
 }
 bpfOverflowPages.clear();
 for(const [id,record] of next)bpfOverflowPages.set(id,record);
 if(changed)bpfRefreshPhotoNavigation();
}

function bpfObservationPDFSourceIndex(source){
 return source+[...bpfOverflowPages.values()].filter(page=>page.anchor<source).length;
}

async function bpfPDFWithObservationOverflows(pdf,form,font){
 for(const field of form.getFields()){
  if(/^Rotulo_Pagina_3_/.test(field.getName()))form.removeField(field);
 }
 pdf.removePage(bpfNCPageIndex);
 const ink=PDFLib.rgb(.08,.22,.35),white=PDFLib.rgb(1,1,1),black=PDFLib.rgb(0,0,0);
 const blue=PDFLib.rgb(221/255,235/255,246/255);
 const bold=await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
 const template=bpfOverflowPages.size?await pdf.embedJpg(bpfNCBackground):null;
 const normalize=window.bpfNormalizePdfText||(typeof bpfPrintNormalizeWinAnsi==='function'?bpfPrintNormalizeWinAnsi:String);
 const draw=(page,rect,text,size,spacing)=>{
  const content=normalize(text.trimEnd());
  const [x,,right,top]=rect,leading=size*1.35;
  let y=top-7-size;
  for(const {line,gap} of bpfObservationParagraphs(content,spacing)){
   y-=gap*leading;
   const wrapped=bpfObservationLines(line,font,right-x-14,size);
   for(const row of wrapped){
    page.drawText(row,{x:x+7,y,size,font,color:ink});
    y-=leading;
   }
   if(!wrapped.length)y-=leading;
  }
 };
 let offset=0;
 for(const [id,{anchor,title,text,spacing}] of bpfOverflowPages){
  const [width,height]=bpfNCPageSize;
  const page=pdf.insertPage(anchor+(++offset),bpfNCPageSize);
  page.drawImage(template,{x:0,y:0,width,height});
  page.drawRectangle({x:45,y:height-112,width:505,height:23,color:blue});
  const titleSize=8.5;
  page.drawText(title,{x:(width-bold.widthOfTextAtSize(title,titleSize))/2,y:height-104,size:titleSize,font:bold,color:black});
  page.drawRectangle({x:460,y:52,width:width-460,height:26,color:white});
  const number='Página '+(bpfPageOrder.indexOf(id)+1)+' de '+bpfPageOrder.length;
  page.drawText(number,{x:550-font.widthOfTextAtSize(number,7),y:58,size:7,font,color:black});
  draw(page,bpfNCPageRect,text,BPF_NC_FONT_SIZE,spacing);
 }
 form.removeField(form.getTextField('OBS 1'));
 draw(pdf.getPage(13),bpfNCFirstRect,String(values['OBS 1']||''),BPF_NC_FONT_SIZE,'nc');
 const docPage=pdf.getPage(bpfObservationPDFSourceIndex(14));
 bpfPdfLegalDocuments(docPage,form,font,bold,ink);
 const documents=form.getTextField('obs_gerais_continuacao');
 const box=documents.acroField.getWidgets()[0].getRectangle();
 form.removeField(documents);
 draw(docPage,[box.x,box.y,box.x+box.width,box.y+box.height],bpfCQObservationFlow.parts[0],BPF_CQ_FONT_SIZE,'cq');
 for(let source=14;source<=20;source++){
  if(!bpfPageOrder.includes(source))continue;
  const page=pdf.getPage(bpfObservationPDFSourceIndex(source)),w=page.getWidth(),h=page.getHeight();
  if(source===14)page.drawRectangle({x:465,y:h-832,width:w-465,height:24,color:white});
  else if(source!==15&&source!==16)page.drawRectangle({x:460,y:h-790,width:w-460,height:22,color:white});
  const label='Página '+(bpfPageOrder.indexOf(source)+1)+' de '+bpfPageOrder.length;
  page.drawText(label,{x:w-22-font.widthOfTextAtSize(label,8),y:source===14?20:h-784,size:8,font,color:ink});
 }
}
