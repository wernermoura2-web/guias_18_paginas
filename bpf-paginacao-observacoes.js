/* Paginação das observações do controle da qualidade e das não conformidades. */
const bpfObservationContinuationTitle='OBSERVAÇÕES GERAIS DOS PROCESSOS — CONTINUAÇÃO';
const bpfNCTitle='OBSERVAÇÕES GERAIS — CONTINUAÇÃO DAS NÃO CONFORMIDADES';
const bpfOverflowPages=new Map();
const bpfFinalConsiderationsField='CONSIDERAÇÕES FINAIS  AVALIAÇÃO DE RISCORow1';
const bpfFinalConsiderationsTitle='CONSIDERAÇÕES FINAIS / AVALIAÇÃO DE RISCO — CONTINUAÇÃO';
const bpfFinalConsiderationsSize=8;
const bpfFinalConsiderationsLeading=1.5;
const bpfFinalConsiderationsTitleGap=1;
let bpfFinalConsiderationsFlow={full:null,parts:[],font:null};
const bpfPdfObservationBlankLines=1;
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
 return /^\s*(?:BPF|APPCC|PCC|PPRO|PPR|PC|POP|4\.\d+)\s+[—–-]\s+/i.test(line);
}

function bpfIsFinalConsiderationTitle(line){
 return /^(?:Considerando o )?Item\s+\d+(?:\.\d+)*\b/.test(line.trim());
}

function bpfFinalConsiderationRows(text){
 return text.trimEnd().split('\n').flatMap((line,index,lines)=>{
  const title=bpfIsFinalConsiderationTitle(line);
  if(!line.trim()&&bpfIsFinalConsiderationTitle(lines[index+1]||''))return [];
  const label=line.match(/^(?:Perigo controlado|Constatação|Evidência objetiva(?: registrada)?|Requisito (?:legal )?avaliado|Dispositivo legal não cumprido|Conclusão da verificação)(?=\s*[·:])/i)?.[0]||'';
  return [{line,title,label,gap:title?bpfFinalConsiderationsTitleGap:0}];
 });
}

function bpfFinalWrappedRows(line,title,label,font,bold,width,size){
 if(!label)return bpfObservationLines(line,title?bold:font,width,size)
  .map(row=>({lead:'',rest:row}));
 const measure={widthOfTextAtSize(text,pt){
  if(label.startsWith(text))return bold.widthOfTextAtSize(text,pt);
  if(!text.startsWith(label))return font.widthOfTextAtSize(text,pt);
  return bold.widthOfTextAtSize(label,pt)+font.widthOfTextAtSize(text.slice(label.length),pt);
 }};
 return bpfObservationLines(line,measure,width,size).map((row,index)=>index===0&&row.startsWith(label)
  ?{lead:label,rest:row.slice(label.length)}
  :{lead:'',rest:row});
}

function bpfFinalConsiderationMeasure(rect,font,bold){
 const [left,bottom,right,top]=rect,size=bpfFinalConsiderationsSize;
 const width=right-left-16,leading=size*bpfFinalConsiderationsLeading;
 return {
  capacity:top-bottom-16-leading,
  height(text){
   if(!text.trim())return 0;
   return bpfFinalConsiderationRows(text).reduce((height,{line,title,label,gap})=>
    height+gap*size+Math.max(1,bpfFinalWrappedRows(line,title,label,font,bold,width,size).length)*leading,0);
  }
 };
}

function bpfPaginateFinalConsiderations(text,firstRect,nextRect,font,bold){
 if(!text.trim())return [''];
 const first=bpfFinalConsiderationMeasure(firstRect,font,bold);
 const next=bpfFinalConsiderationMeasure(nextRect,font,bold);
 const groups=[[]];
 const join=group=>group.join('');
 const fits=(measure,text)=>measure.height(text)<=measure.capacity;
 let measure=first;
 for(const block of text.split(/(?=^(?:Considerando o )?Item\s+\d+(?:\.\d+)*\b)/m).filter(Boolean)){
  const group=groups.at(-1);
  if(fits(measure,join(group)+block)){group.push(block);continue;}
  groups.push([]);
  measure=next;
  let rest=block;
  const title=block.split('\n')[0];
  const repeat=bpfIsFinalConsiderationTitle(title)&&next.height(title)<next.capacity/2?title+' — continuação\n':'';
  // Se um único item exceder uma A4 inteira, repetir seu título ao continuar.
  while(!fits(next,rest)){
   const cut=bpfObservationBreak(rest,part=>fits(next,part));
   groups.at(-1).push(rest.slice(0,cut));
   groups.push([]);
   rest=repeat+rest.slice(cut);
  }
  groups.at(-1).push(rest);
 }
 const last=groups.length-1;
 if(last>0&&next.height(join(groups[last]))<next.capacity/4){
  const prior=groups[last-1],tail=groups[last];
  const priorMeasure=last===1?first:next;
  if(fits(priorMeasure,join(prior)+join(tail))){
   prior.push(...tail);
   groups.pop();
  }else{
   while(prior.length>1&&next.height(join(tail))<next.capacity/4){
    const block=prior.at(-1);
    if(!fits(next,block+join(tail)))break;
    tail.unshift(prior.pop());
   }
  }
 }
 return groups.map(join);
}

function bpfObservationParagraphs(text,spacing){
 const rows=[];
 for(const line of text.split('\n')){
  const definition=spacing==='nc'&&bpfIsNCDefinition(line);
  const ncEntry=spacing==='nc'&&bpfIsNCEntry(line);
  const cqStart=spacing==='cq'&&/^\s*CONTINUAÇÃO DAS OBSERVAÇÕES\s+[—–-]\s+CONTROLE DA QUALIDADE\s*$/i.test(line);
  const cqEnd=spacing==='cq'&&/^\s*FIM DAS OBSERVAÇÕES DO CONTROLE DA QUALIDADE\s*$/i.test(line);
  const cqItem=spacing==='cq'&&/^\s*ITEM 4\.10\.\d+\b/i.test(line);
  let previous=rows.length-1;
  while(previous>=0&&!rows[previous].line.trim())previous--;
  if(cqItem){
   while(previous>=0&&(!rows[previous].line.trim()||/^-{4,}\s*$/.test(rows[previous].line)))previous--;
  }
  const before=rows[previous];
  let gap=0;
  if(definition)gap=before?.definition?1/3:1;
  else if(before?.definition&&line.trim())gap=1;
  else if(cqStart||before?.cqEnd&&line.trim())gap=1;
  else if(cqItem||before?.cqItem&&line.trim())gap=1/3;
  else if(ncEntry&&before&&bpfIsNCEntry(before.line))gap=1/4;
  if(gap)rows.length=previous+1;
  rows.push({line,gap,definition,cqItem,cqEnd});
 }
 let last=rows.length-1;
 while(last>=0&&!rows[last].line.trim())last--;
 if(last>=0&&(rows[last].cqEnd||rows[last].definition)){
  rows.length=last+1;
  rows.push({line:'',gap:0,definition:false});
 }
 return rows;
}

function bpfAppendNCObservationText(fragment,text,spacing='nc'){
 if(spacing==='final'){
  for(const {line,title,label,gap} of bpfFinalConsiderationRows(text)){
   const paragraph=document.createElement('div');
   if(label){
    const strong=document.createElement('strong');
    strong.textContent=label;
    paragraph.append(strong,document.createTextNode(line.slice(label.length)));
   }else paragraph.textContent=line||'\u00a0';
   paragraph.style.lineHeight=String(bpfFinalConsiderationsLeading);
   if(title){paragraph.style.fontWeight='bold';paragraph.style.paddingTop=gap+'em';}
   fragment.append(paragraph);
  }
  return true;
 }
 const rows=bpfObservationParagraphs(text,spacing);
 const formatted=rows.some(row=>row.gap||row.definition);
 if(!formatted){fragment.append(document.createTextNode(text));return false;}
 for(const {line,gap,definition} of rows){
  const paragraph=document.createElement('div');
  paragraph.textContent=line;
  if(!line.trim())paragraph.style.height='1.3em';
  if(gap)paragraph.style.paddingTop=(gap*1.3)+'em';
  if(definition)paragraph.style.lineHeight=String(1.3*4/3);
  fragment.append(paragraph);
 }
 return true;
}

function bpfObservationPageMeasure(rect,size,font,spacing){
 const [left,bottom,right,top]=rect;
 const width=right-left-16,capacity=Math.max(1,(top-bottom-16)/(size*1.35)-bpfPdfObservationBlankLines);
 function height(text){
  const content=text.trimEnd();
  if(!content)return 0;
  return bpfObservationParagraphs(content,spacing).reduce((total,{line,gap,definition})=>{
   const count=Math.max(1,bpfObservationLines(line,font,width,size).length);
   const heading=spacing==='nc'&&/^NÃO CONFORMIDADES (?:CRÍTICAS|MAIORES|MENORES)\b/.test(line);
   return total+count+gap+(definition?count/3:0)+(heading ? .85 : 0);
  },0);
 }
 return {capacity,height};
}

function bpfObservationBreak(text,accept){
 let lo=0,hi=text.length;
 while(lo<hi){
  const mid=Math.ceil((lo+hi)/2);
  if(accept(text.slice(0,mid)))lo=mid;else hi=mid-1;
 }
 let cut=Math.max(1,lo);
 if(!/\s/.test(text.charAt(cut-1))&&!/\s/.test(text.charAt(cut))){
  const separator=text.slice(0,cut).search(/\s(?=\S*$)/);
  if(separator>0&&cut-separator<28)cut=separator+1;
 }
 if(/[\uDC00-\uDFFF]/.test(text.charAt(cut)))cut=cut>1?cut-1:cut+1;
 return cut;
}

function bpfPaginateObservation(text,firstRect,nextRect,size,font,spacing){
 const parts=[];
 let remaining=text;
 const first=bpfObservationPageMeasure(firstRect,size,font,spacing);
 const next=bpfObservationPageMeasure(nextRect,size,font,spacing);
 do{
  const {height,capacity}=parts.length?next:first;
  if(parts.length&&!remaining.trim()){parts[parts.length-1]+=remaining;break;}
  if(height(remaining)<=capacity){parts.push(remaining);break;}
  const cut=bpfObservationBreak(remaining,part=>height(part)<=capacity);
  parts.push(remaining.slice(0,cut));
  remaining=remaining.slice(cut);
 }while(remaining);

 const last=parts.length-1;
 if(last>0&&next.height(parts[last])<=next.capacity/4){
  const previous=last===1?first:next;
  const combined=parts[last-1]+parts[last];
  const used=previous.height(combined);
  if(used<=previous.capacity)parts.splice(last-1,2,combined);
  else{
   const balanced=used*previous.capacity/(previous.capacity+next.capacity);
   const goal=spacing==='final'?Math.max(1,Math.min(balanced,used-next.capacity/4-1)):balanced;
   const cut=bpfObservationBreak(combined,part=>previous.height(part)<=goal);
   const left=combined.slice(0,cut),right=combined.slice(cut);
   if(next.height(right)>next.capacity/4&&next.height(right)<=next.capacity){
    parts.splice(last-1,2,left,right);
   }
  }
 }
 return parts;
}

function bpfObservationScreenFont(size,bold=false){
 const ctx=document.createElement('canvas').getContext('2d');
 if(ctx)ctx.font=(bold?'bold ':'')+size+'px Arial';
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

function bpfRenderFinalConsiderationsText(el,text){
 if(el.bpfRenderedObservation===text)return;
 el.bpfRenderedObservation=text;
 const fragment=document.createDocumentFragment();
 const generated=Object.entries(bpfFinalRead('BPF_PCCGenerated',{}));
 const fieldText=String(values[bpfFinalConsiderationsField]||'');
 for(const rawBlock of text.split(/(?=^(?:Considerando o )?Item\s+\d+(?:\.\d+)*\b)/m)){
  const block=rawBlock.trimEnd();
  if(!block)continue;
  const newline=block.indexOf('\n');
  const hasTitle=bpfIsFinalConsiderationTitle(block.split('\n',1)[0]);
  const heading=hasTitle?block.split('\n',1)[0]:'';
  const body=hasTitle?(newline<0?'':block.slice(newline+1)):block;
  if(heading)bpfAppendNCObservationText(fragment,heading,'final');
  const record=generated.find(([,item])=>item.split('\n',1)[0]===heading.replace(/ — continuação$/,''));
  const original=record?record[1].split('\n').slice(1).join('\n'):fieldText;
  const start=body?original.indexOf(body):0;
  const editor=document.createElement('div');
  bpfAppendNCObservationText(editor,body,'final');
  if(start>=0){
   editor.className='bpf-final-inline-edit';
   editor.contentEditable='plaintext-only';
   editor.setAttribute('role','textbox');
   editor.setAttribute('aria-multiline','true');
   editor.setAttribute('aria-label',heading||'Considerações finais');
   editor.onblur=()=>{
    const edited=editor.innerText.replace(/\r\n?/g,'\n').trimEnd();
    const revised=original.slice(0,start)+edited+original.slice(start+body.length);
    if(edited===body)return;
    if(record){
     const edits=bpfFinalRead('BPF_FinalConsideracoesEdicoes',{});
     edits[record[0]]=revised;
     values.BPF_FinalConsideracoesEdicoes=JSON.stringify(edits);
    }else values[bpfFinalConsiderationsField]=revised;
    bpfSyncPCCFinal();changed();
    el.bpfRenderedObservation=null;
    sync();
   };
  }
  fragment.append(editor);
 }
 el.replaceChildren(fragment);
}

function bpfRenderFinalConsiderationsField(el){
 const fontSize=(bpfFinalConsiderationsSize/595.32*100)+'cqw';
 if(el.tagName==='TEXTAREA'){
  el.classList.add('bpf-final-edit-area');
  if(el.value!==values[bpfFinalConsiderationsField])el.value=values[bpfFinalConsiderationsField]||'';
  el.style.fontSize=fontSize;
  el.style.lineHeight=String(bpfFinalConsiderationsLeading);
  return;
 }
 el.classList.add('bpf-final-first-page','bpf-overflow-observation');
 el.style.fontSize=fontSize;
 bpfRenderFinalConsiderationsText(el,bpfFinalConsiderationsFlow.parts[0]||'');
 el.removeAttribute('aria-hidden');
 el.onclick=()=>{if(!bpfFinalConsiderationsFlow.full)el.parentElement.querySelector('.bpf-final-edit-area')?.focus();};
}

function bpfObservationPageId(kind,offset){
 // Intervalo reservado entre a continuação original e as páginas extras de fotos.
 if(kind==='final')return 21+1/(2+offset);
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

function bpfReconcileObservationPages(finalFont,finalBold){
 bpfMountNCView();
 if(typeof bpfRefreshFinalConsiderationsSelector==='function')bpfRefreshFinalConsiderationsSelector();
 const full=String(values.obs_gerais_continuacao||'').replace(/\r\n?/g,'\n');
 const rect=D.widgets.find(widget=>widget.name==='obs_gerais_continuacao')?.rect;
 if(rect&&full!==bpfCQObservationFlow.full){
  bpfCQObservationFlow={full,parts:bpfPaginateObservation(full,rect,bpfNCPageRect,BPF_CQ_FONT_SIZE,bpfObservationScreenFont(BPF_CQ_FONT_SIZE),'cq')};
 }
 const finalText=String(values[bpfFinalConsiderationsField]||'').replace(/\r\n?/g,'\n');
 const finalRect=D.widgets.find(widget=>widget.name===bpfFinalConsiderationsField)?.rect;
 if(finalRect&&(finalText!==bpfFinalConsiderationsFlow.full||finalFont&&finalFont!==bpfFinalConsiderationsFlow.font)){
  const normalize=finalFont?(window.bpfNormalizePdfText||(typeof bpfPrintNormalizeWinAnsi==='function'?bpfPrintNormalizeWinAnsi:String)):String;
  const measuringFont=finalFont||bpfObservationScreenFont(bpfFinalConsiderationsSize);
  bpfFinalConsiderationsFlow={full:finalText,font:finalFont||null,
   parts:bpfPaginateFinalConsiderations(normalize(finalText),finalRect,bpfNCPageRect,measuringFont,finalBold||bpfObservationScreenFont(bpfFinalConsiderationsSize,true))};
 }
 const groups=[
  {anchor:13,kind:'nc',title:bpfNCTitle,parts:bpfNCObservationCache.parts.slice(1)},
  {anchor:14,kind:'cq',title:bpfObservationContinuationTitle,parts:bpfCQObservationFlow.parts.slice(1)},
  {anchor:17,kind:'final',title:bpfFinalConsiderationsTitle,parts:bpfFinalConsiderationsFlow.parts.slice(1)}
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
  if(body&&spacing==='final')body.style.fontSize=(bpfFinalConsiderationsSize/595.32*100)+'cqw';
  if(body&&body.bpfRenderedObservation!==text){
   if(spacing==='final')bpfRenderFinalConsiderationsText(body,text);
   else bpfRenderNCObservation(body,text,spacing);
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

function bpfPrintProcessObservations(pdf,form,font,normalize,black){
 for(const name of bpfObservationTargets){
  const field=form.getFieldMaybe(name);
  if(!field)continue;
  const source=D.widgets.find(widget=>widget.name===name);
  if(!source)continue;
  const body=String(values[name]||'').trimEnd();
  // A referência fica no início do quadro de observações da avaliação original.
  const caption=typeof bpfReservoirSharedLabel==='function'&&source.page>=2&&source.page<=5?bpfReservoirSharedLabel(source.page):'';
  const prefix=caption?'Compartilhamento dos reservatórios: '+caption:'';
  const text=normalize(prefix&&!body.startsWith(prefix)?[prefix,body].filter(Boolean).join('\n\n'):body);
  const page=pdf.getPage(source.page);
  for(const widget of field.acroField.getWidgets()){
   const {x,y,width,height}=widget.getRectangle();
   if(!text)continue;
   const usableWidth=Math.max(1,width-6),usableHeight=Math.max(1,height-6);
   const leading=size=>size*1.25;
   const wrap=size=>bpfObservationLines(text,font,usableWidth,size);
   const fits=size=>(wrap(size).length+bpfPdfObservationBlankLines)*leading(size)<=usableHeight;
   let size=9;
   if(!fits(size)){
    let low=.25,high=size;
    if(!fits(low))throw Error('Observações extensas demais para imprimir com a folga de '+bpfPdfObservationBlankLines+' linha(s): '+name);
    for(let n=0;n<15;n++){
     const mid=(low+high)/2;
     if(fits(mid))low=mid;else high=mid;
    }
    size=low;
   }
   const top=y+height-3;
   wrap(size).forEach((row,i)=>page.drawText(row,{x:x+3,y:top-size-i*leading(size),size,font,color:black}));
  }
  form.removeField(field);
 }
}

async function bpfPDFWithObservationOverflows(pdf,form,font){
 const bold=await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
 bpfReconcileObservationPages(font,bold);
 const finalPage=pdf.getPage(17);
 const finalField=form.getFieldMaybe(bpfFinalConsiderationsField);
 const finalBox=finalField?.acroField.getWidgets()[0]?.getRectangle();
 for(const field of form.getFields()){
  if(/^Rotulo_Pagina_3_/.test(field.getName()))form.removeField(field);
 }
 pdf.removePage(bpfNCPageIndex);
 const ink=PDFLib.rgb(.08,.22,.35),white=PDFLib.rgb(1,1,1),black=PDFLib.rgb(0,0,0);
 const blue=PDFLib.rgb(221/255,235/255,246/255);
 const template=bpfOverflowPages.size?await pdf.embedJpg(bpfNCBackground):null;
 const normalize=window.bpfNormalizePdfText||(typeof bpfPrintNormalizeWinAnsi==='function'?bpfPrintNormalizeWinAnsi:String);
 bpfPrintProcessObservations(pdf,form,font,normalize,black);
 const draw=(page,rect,text,size,spacing)=>{
  const content=normalize(text.trimEnd());
  const [x,,right,top]=rect,leading=size*(spacing==='final'?bpfFinalConsiderationsLeading:1.35);
  let y=top-7-size;
  const rows=spacing==='final'?bpfFinalConsiderationRows(content):bpfObservationParagraphs(content,spacing);
  for(const {line,gap,definition,title,label} of rows){
   y-=gap*(spacing==='final'?size:leading);
   if(spacing==='nc'&&/^NÃO CONFORMIDADES (?:CRÍTICAS|MAIORES|MENORES)\b/.test(line))y-=.85*leading;
   const lineFont=title?bold:font;
   const wrapped=spacing==='final'?bpfFinalWrappedRows(line,title,label,font,bold,right-x-16,size)
    :bpfObservationLines(line,lineFont,right-x-16,size).map(rest=>({lead:'',rest}));
   for(const {lead,rest} of wrapped){
    if(definition)y-=leading/3;
    const start=x+7;
    if(lead)page.drawText(lead,{x:start,y,size,font:bold,color:black});
    page.drawText(rest,{x:start+(lead?bold.widthOfTextAtSize(lead,size):0),y,size,font:lineFont,color:black});
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
  draw(page,bpfNCPageRect,text,spacing==='final'?bpfFinalConsiderationsSize:BPF_NC_FONT_SIZE,spacing);
 }
 if(finalField&&finalBox){
  form.removeField(finalField);
  const {x,y,width,height}=finalBox;
  draw(finalPage,[x,y,x+width,y+height],bpfFinalConsiderationsFlow.parts[0]||'',bpfFinalConsiderationsSize,'final');
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

/* Visualização independente da paginação e dos dados de impressão. */
const bpfNCViewGroups=[
 ['criticas','Críticas',['PCC']],
 ['maiores','Maiores',['PPRO','PC']],
 ['menores','Menores',['POP','PPR']]
];
const bpfNCViewSelected=new Set(bpfNCViewGroups.map(group=>group[0]));
function bpfNCViewRecords(){
 let generated={};
 try{generated=JSON.parse(values.BPF_NCFullGenerated||values.BPF_NCGenerated||'{}')||{};}catch(e){}
 return bpfNCViewGroups.map(([id,title,codes])=>{
  const raw=String(generated[id]||'').replace(/\r\n?/g,'\n');
  const total=Number(raw.match(/Total:\s*(\d+)/i)?.[1]||0);
  const parts=raw.split(/\n\s*\n/);
  return {id,title,codes,total,details:parts.slice(2).join('\n\n').trim()||'Nenhuma não conformidade registrada.'};
 });
}
function bpfOpenNCView(){
 const existing=document.getElementById('bpf-nc-view-dialog');
 if(existing)return;
 const dialog=document.createElement('dialog');
 dialog.id='bpf-nc-view-dialog';
 dialog.style.cssText='width:min(94vw,1000px);max-width:94vw;max-height:88vh;overflow:auto;padding:22px;border:2px solid #177693;border-radius:12px;background:white;color:#12324a;box-sizing:border-box;font:16px Arial,sans-serif';
 const header=document.createElement('h2');header.textContent='Não conformidades — visualização por classe';header.style.margin='0 0 10px';
 const instruction=document.createElement('p');instruction.textContent='Selecione as classes que deseja visualizar. Os totais e as definições permanecem visíveis.';instruction.style.margin='0 0 16px';
 const columns=document.createElement('div');columns.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:12px';
 const details=document.createElement('div');details.style.marginTop='18px';
 const records=bpfNCViewRecords(), panels=new Map();
 function refresh(){
  for(const [id,panel] of panels)panel.hidden=!bpfNCViewSelected.has(id);
  empty.hidden=bpfNCViewSelected.size!==0;
 }
 for(const record of records){
  const col=document.createElement('section');col.style.cssText='border:1px solid #a9c6d8;border-radius:8px;background:#eef6fa;padding:12px';
  const label=document.createElement('label');label.style.cssText='display:flex;gap:8px;align-items:center;font-weight:bold;cursor:pointer';
  const check=document.createElement('input');check.type='checkbox';check.checked=bpfNCViewSelected.has(record.id);
  check.onchange=()=>{if(check.checked)bpfNCViewSelected.add(record.id);else bpfNCViewSelected.delete(record.id);refresh();};
  label.append(check,document.createTextNode(record.title+' — Total: '+record.total));
  col.append(label);
  for(const code of record.codes){
   const def=document.createElement('p');def.style.cssText='margin:10px 0 0;font-size:14px;line-height:1.45';
   def.textContent=code+' — '+String(BPF_NC_DEFINITIONS[code]?.text||'');col.append(def);
  }
  columns.append(col);
  const panel=document.createElement('section');panel.style.cssText='border-top:1px solid #a9c6d8;padding-top:10px;margin-top:12px';
  const title=document.createElement('h3');title.textContent='Não conformidades '+record.title.toLowerCase()+' — '+record.total;title.style.margin='0 0 8px';
  const body=document.createElement('div');body.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5';body.textContent=record.details;
  panel.append(title,body);details.append(panel);panels.set(record.id,panel);
 }
 const empty=document.createElement('p');empty.textContent='Nenhuma classe selecionada.';details.append(empty);
 const close=document.createElement('button');close.type='button';close.textContent='Fechar';close.style.cssText='display:block;margin:18px 0 0 auto;padding:10px 18px;border:1px solid #a9c6d8;border-radius:5px;background:#eef6fa;color:#12324a;cursor:pointer';close.onclick=()=>dialog.close();
 dialog.append(header,instruction,columns,details,close);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);refresh();dialog.showModal();
}
function bpfNCListVisibility(){
 try{const saved=JSON.parse(values.BPF_NCListVisibility||'null');if(Array.isArray(saved))return saved;}catch(e){}
 return bpfNCViewGroups.map(group=>group[0]);
}
const quantKey='BPF_ConclusaoQuantitativoProcessos';
function quantitativeSelected(){return values[quantKey]==='On';}
function processQuantitative(){
 const data=values;
 if(!data||typeof BPF_PHRASES==='undefined'||typeof titles==='undefined'||typeof bpfPhraseName!=='function')return [];
 const groups=new Map();
 for(const page of BPF_PHRASES){
  if(typeof bpfReservoirIsLinked==='function'&&bpfReservoirIsLinked(page.page))continue;
  const name=page.page>=2&&page.page<=5?'4.3 Reservatórios':titles[page.page];
  if(!name)continue;
  for(const row of page.rows)for(const scope of row.scopes)scope.phrases.forEach((phrase,i)=>{
   if(data[bpfPhraseName(scope,i)]!=='0'||!['PCC','PPRO','PC','POP','PPR'].includes(phrase.appcc))return;
   let group=groups.get(name);if(!group){group=new Map();groups.set(name,group);}
   group.set(phrase.appcc,(group.get(phrase.appcc)||0)+1);
  });
 }
 return [...groups].map(([name,counts])=>{
  const total=[...counts.values()].reduce((sum,n)=>sum+n,0);
  const categories=['PCC','PPRO','PC','POP','PPR'].filter(code=>counts.has(code)).map(code=>counts.get(code)+' '+code).join(', ');
  return name.replace(/^(\d+(?:\.\d+)*)\s+/,'$1 — ')+': '+total+' '+(total===1?'não conformidade':'não conformidades')+' ('+categories+').';
 });
}



const quantTextKey='BPF_NCQuantitativoTextoEditado';
function bpfQuantitativeText(){
 const edited=values[quantTextKey];
 return typeof edited==='string'&&edited.trim()?edited.trim():processQuantitative().join('\n')||'Nenhuma não conformidade registrada.';
}
function bpfEditQuantitative(){
 const dialog=document.createElement('dialog');dialog.style.cssText='width:min(95vw,850px);max-height:90vh;overflow:auto;padding:20px;border:1px solid #177693;border-radius:8px;color:#12324a';
 const heading=document.createElement('h2');heading.textContent='Editar quantitativo de NC por processo';
 const note=document.createElement('p');note.textContent='O texto editado será mantido no relatório. Para voltar à contagem automática, utilize Restaurar automático.';
 const editor=document.createElement('textarea');editor.value=bpfQuantitativeText();editor.setAttribute('aria-label','Texto do quantitativo');editor.style.cssText='display:block;width:100%;height:42vh;min-height:160px;font:15px/1.4 Arial,sans-serif;padding:8px;box-sizing:border-box';
 const actions=document.createElement('div');actions.style.cssText='display:flex;gap:8px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap';
 const button=(label,onclick)=>{const el=document.createElement('button');el.type='button';el.textContent=label;el.onclick=onclick;return el;};
 const commit=restore=>{
  if(restore)delete values[quantTextKey];else values[quantTextKey]=editor.value.trim();
  values[quantKey]='On';bpfSyncNCLists();changed();sync();dialog.close();
 };
 actions.append(button('Cancelar',()=>dialog.close()),button('Restaurar automático',()=>commit(true)),button('Salvar texto',()=>commit(false)));
 dialog.append(heading,note,editor,actions);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();editor.focus();
}

function bpfMountNCView(){
 const page=bpfSheets[13];if(!page)return;
 let bar=page.querySelector('.bpf-nc-list-controls');
 if(!bar){
  bar=document.createElement('div');bar.className='bpf-nc-list-controls';
  bar.style.cssText='position:absolute;right:2%;top:0.6%;z-index:10;display:flex;align-items:center;gap:5px;flex-wrap:wrap;padding:4px 6px;border:1px solid #8cb4c9;border-radius:5px;background:#eef6fa;color:#12324a;font-size:clamp(10px,1.45cqw,14px);font-weight:bold';
  const title=document.createElement('span');title.textContent='Mostrar listas de NC:';bar.append(title);
  for(const [id,name] of bpfNCViewGroups){
   const input=document.createElement('input');input.type='checkbox';input.dataset.ncList=id;input.style.margin='0 3px 0 0';
   const label=document.createElement('label');label.style.cssText='white-space:nowrap;cursor:pointer';label.append(input,document.createTextNode(name));
   input.onchange=()=>{
    values.BPF_NCListVisibility=JSON.stringify([...bar.querySelectorAll('input[data-nc-list]:checked')].map(el=>el.dataset.ncList));
    bpfSyncNCLists();changed();sync();
   };
   bar.append(label);
  }
  const button=document.createElement('button');button.type='button';button.textContent='Visualizar NC';button.style.cssText='padding:3px 6px;border:1px solid #8cb4c9;border-radius:4px;background:white;color:#12324a;font:inherit;cursor:pointer';
  button.onclick=bpfOpenNCView;bar.append(button);
  const quantLabel=document.createElement('label');quantLabel.style.cssText='flex-basis:100%;display:flex;align-items:center;gap:5px;cursor:pointer';
  const quantInput=document.createElement('input');quantInput.type='checkbox';quantInput.dataset.ncQuantitative='';quantInput.style.margin='0';
  quantInput.onchange=()=>{values[quantKey]=quantInput.checked?'On':'Off';bpfSyncNCLists();changed();sync();};
  quantLabel.append(quantInput,document.createTextNode('Incluir quantitativo de NC por processo'));
  const edit=document.createElement('button');edit.type='button';edit.textContent='Editar quantitativo';edit.style.cssText=button.style.cssText;edit.onclick=bpfEditQuantitative;quantLabel.append(edit);bar.append(quantLabel);
  page.append(bar);
  const style=document.createElement('style');style.textContent='@media print{.bpf-nc-list-controls,#bpf-nc-view-dialog{display:none!important}}';document.head.append(style);
 }
 const selected=bpfNCListVisibility();
 bar.querySelector('[data-nc-quantitative]').checked=quantitativeSelected();
 for(const input of bar.querySelectorAll('input[data-nc-list]'))input.checked=selected.includes(input.dataset.ncList);
}
