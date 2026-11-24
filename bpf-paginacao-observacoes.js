/* Paginação das observações do controle da qualidade e das não conformidades. */
const bpfObservationContinuationTitle='OBSERVAÇÕES GERAIS DOS PROCESSOS — CONTINUAÇÃO';
const bpfNCTitle='OBSERVAÇÕES GERAIS — CONTINUAÇÃO DAS NÃO CONFORMIDADES';
const bpfOverflowPages=new Map();
const bpfFinalConsiderationsField='CONSIDERAÇÕES FINAIS  AVALIAÇÃO DE RISCORow1';
const bpfFinalConsiderationsTitle='CONSIDERAÇÕES FINAIS / AVALIAÇÃO DE RISCO — CONTINUAÇÃO';
const bpfFinalConsiderationsSize=8;
const bpfFinalConsiderationsLeading=1.5;
const bpfFinalConsiderationsTitleGap=1;
const bpfFinalConsiderationsParagraphGap=0.5;
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
function bpfConsiderationLabel(line){
 return line.match(/^(?:Considerando\b|(?:Perigo controlado|Constatação|Evidência objetiva(?: registrada)?|Requisito (?:legal )?avaliado|Dispositivo legal não cumprido|Conclusão da verificação)(?=\s*[·:]))/i)?.[0]||'';
}

function bpfFinalConsiderationRows(text){
 return text.trimEnd().split('\n').flatMap((line,index,lines)=>{
  const title=bpfIsFinalConsiderationTitle(line);
  if(!line.trim()&&bpfIsFinalConsiderationTitle(lines[index+1]||''))return [];
  const label=title?'':bpfConsiderationLabel(line);
  return [{line,title,label,gap:title?bpfFinalConsiderationsTitleGap:0,scale:line.trim()?1:bpfFinalConsiderationsParagraphGap}];
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
   return bpfFinalConsiderationRows(text).reduce((height,{line,title,label,gap,scale})=>
    height+gap*size+Math.max(1,bpfFinalWrappedRows(line,title,label,font,bold,width,size).length)*leading*scale,0);
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
  let rest=block;
  // Aproveitar a capacidade restante da própria matriz antes de criar uma
  // página de continuação, inclusive se o primeiro parágrafo for muito longo.
  const existing=join(group);
  const firstWord=rest.match(/^\s*\S+/)?.[0]||'';
  if(firstWord&&fits(measure,existing+firstWord)){
   const cut=bpfObservationBreak(rest,part=>fits(measure,existing+part));
   if(cut>0&&fits(measure,existing+rest.slice(0,cut))){
    group.push(rest.slice(0,cut));
    rest=rest.slice(cut);
   }
  }
  groups.push([]);
  measure=next;
  // Continuar o texto sem duplicar cabeçalhos: os offsets devem permanecer fiéis ao original.
  while(!fits(next,rest)){
   const cut=bpfObservationBreak(rest,part=>fits(next,part));
   groups.at(-1).push(rest.slice(0,cut));
   groups.push([]);
   rest=rest.slice(cut);
  }
  groups.at(-1).push(rest);
 }
 // Não rebalancear o texto para uma página posterior: o início e o máximo
 // de conteúdo que couber permanecem na matriz.
 return groups.map(join);
}

function bpfObservationParagraphs(text,spacing){
 const rows=[];
 for(const line of text.split('\n')){
  const definition=spacing==='nc'&&bpfIsNCDefinition(line);
  const title=spacing==='nc'&&bpfIsFinalConsiderationTitle(line);
  const label=spacing==='nc'&&!title?bpfConsiderationLabel(line):'';
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
  else if(title)gap=.65;
  else if(cqStart||before?.cqEnd&&line.trim())gap=1;
  else if(cqItem||before?.cqItem&&line.trim())gap=1/3;
  else if(ncEntry&&before&&bpfIsNCEntry(before.line))gap=1/4;
  if(gap)rows.length=previous+1;
  rows.push({line,gap,definition,cqItem,cqEnd,title,label});
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
  for(const {line,title,label,gap,scale} of bpfFinalConsiderationRows(text)){
   const paragraph=document.createElement('div');
   if(label){
    const strong=document.createElement('strong');
    strong.textContent=label;
    paragraph.append(strong,document.createTextNode(line.slice(label.length)));
   }else paragraph.textContent=line||'\u00a0';
   paragraph.style.lineHeight=String(bpfFinalConsiderationsLeading);
   if(!line.trim())paragraph.style.height=(bpfFinalConsiderationsLeading*scale)+'em';
   if(title){paragraph.style.fontWeight='bold';paragraph.style.paddingTop=gap+'em';}
   fragment.append(paragraph);
  }
  return true;
 }
 const rows=bpfObservationParagraphs(text,spacing);
 const formatted=rows.some(row=>row.gap||row.definition||row.title||row.label);
 if(!formatted){fragment.append(document.createTextNode(text));return false;}
 for(const {line,gap,definition,title,label} of rows){
  const paragraph=document.createElement('div');
  if(label){const strong=document.createElement('strong');strong.textContent=label;paragraph.append(strong,document.createTextNode(line.slice(label.length)));}else paragraph.textContent=line;
  if(title)paragraph.style.fontWeight='bold';
  if(!line.trim())paragraph.style.height='1.3em';
  if(gap)paragraph.style.paddingTop=(gap*1.3)+'em';
  if(definition)paragraph.style.lineHeight=String(1.3*4/3);
  fragment.append(paragraph);
 }
 return true;
}

function bpfObservationPageMeasure(rect,size,font,spacing,bold=font){
 const [left,bottom,right,top]=rect;
 const width=right-left-16,capacity=Math.max(1,(top-bottom-16)/(size*1.35)-bpfPdfObservationBlankLines);
 function height(text){
  const content=text.trimEnd();
  if(!content)return 0;
  return bpfObservationParagraphs(content,spacing).reduce((total,{line,gap,definition,title,label})=>{
   const count=Math.max(1,bpfFinalWrappedRows(line,title,label,font,bold,width,size).length);
   const heading=spacing==='nc'&&/^(?:NÃO CONFORMIDADES (?:CRÍTICAS|MAIORES|MENORES)\b|QUANTITATIVO DE NÃO CONFORMIDADES POR PROCESSO$)/.test(line);
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

function bpfPaginateObservation(text,firstRect,nextRect,size,font,spacing,bold=font){
 const parts=[];
 let remaining=text;
 const first=bpfObservationPageMeasure(firstRect,size,font,spacing,bold);
 const next=bpfObservationPageMeasure(nextRect,size,font,spacing,bold);
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

function bpfRunNCObservationFlow(full,pdfFont=null,pdfBold=null){
 full=String(full||'').replace(/\r\n?/g,'\n');
 if(full!==bpfNCObservationCache.full||pdfFont!==(bpfNCObservationCache.font||null)){
  const normalize=window.bpfNormalizePdfText||(typeof bpfPrintNormalizeWinAnsi==='function'?bpfPrintNormalizeWinAnsi:String);
  const measure=f=>({widthOfTextAtSize:(t,s)=>f.widthOfTextAtSize(normalize(t),s)});
  const normal=pdfFont?measure(pdfFont):bpfObservationScreenFont(BPF_NC_FONT_SIZE);
  const bold=pdfBold?measure(pdfBold):bpfObservationScreenFont(BPF_NC_FONT_SIZE,true);
  bpfNCObservationCache={full,font:pdfFont,parts:bpfPaginateObservation(full,bpfNCFirstRect,bpfNCPageRect,BPF_NC_FONT_SIZE,normal,'nc',bold)};
 }
 const [first='',second='',...extra]=bpfNCObservationCache.parts;
 values['OBS 1']=first;
 values[BPF_NC_CONTINUATION]=second;
 const serialized=JSON.stringify({field:BPF_NC_CONTINUATION,first,second,extra,full,font:BPF_NC_FONT_SIZE});
 if(values.BPF_ObsGeneralFlow!==serialized)values.BPF_ObsGeneralFlow=serialized;
}

// Mapear cada trecho à sua frase gerada, inclusive quando a paginação a divide.
function bpfFinalInlineSegments(full,generated,offset,length){
 const end=offset+length,ranges=[];let cursor=0;
 for(const [id,original] of Object.entries(generated)){
  if(typeof original!=='string'||!original)continue;
  const start=full.indexOf(original,cursor);if(start<0)continue;
  if(start>cursor)ranges.push({start:cursor,end:start,id:null});
  ranges.push({start,end:start+original.length,id,original});cursor=start+original.length;
 }
 if(cursor<full.length)ranges.push({start:cursor,end:full.length,id:null});
 if(!full.length)return [{start:0,end:0,id:null,text:'',relative:0}];
 return ranges.flatMap(range=>{
  const start=Math.max(offset,range.start),stop=Math.min(end,range.end);
  return stop>start?[{...range,start,end:stop,relative:start-range.start,text:full.slice(start,stop)}]:[];
 });
}

function bpfCommitFinalInlineEdit(segment,edited){
 if(edited===segment.text)return false;
 if(segment.id){
  const suggestions=bpfFinalRead('BPF_FinalConsideracoesSugestoes',{}),edits=bpfFinalRead('BPF_FinalConsideracoesTextos',{}),base=suggestions[segment.id]??edits[segment.id]?.base;
  const generated=bpfFinalRead('BPF_PCCGenerated',{}),original=generated[segment.id];
  if(typeof base==='string'&&original===segment.original){
   const text=(original.slice(0,segment.relative)+edited+original.slice(segment.relative+segment.text.length)).trim();
   if(!text){const hidden=new Set(bpfFinalRead('BPF_FinalConsideracoesOcultas',[]));hidden.add(segment.id);values.BPF_FinalConsideracoesOcultas=JSON.stringify([...hidden]);delete edits[segment.id];}
   else edits[segment.id]={base,text};
   values.BPF_FinalConsideracoesTextos=JSON.stringify(edits);return true;
  }
  return false;
 }
 const full=String(values[bpfFinalConsiderationsField]||'');
 if(full.slice(segment.start,segment.end)!==segment.text)return false;
 values[bpfFinalConsiderationsField]=full.slice(0,segment.start)+edited+full.slice(segment.end);return true;
}

function bpfRenderFinalConsiderationsText(el,text,offset=0){
 if(el.bpfRenderedObservation===text&&el.bpfRenderedOffset===offset)return;
 if(el.contains(document.activeElement)&&document.activeElement?.isContentEditable)return;
 el.bpfRenderedObservation=text;el.bpfRenderedOffset=offset;
 el.style.lineHeight=String(bpfFinalConsiderationsLeading);el.style.cursor='text';
 const fragment=document.createDocumentFragment();
 const generated=bpfFinalRead('BPF_PCCGenerated',{}),full=String(values[bpfFinalConsiderationsField]||'');
 const segments=bpfFinalInlineSegments(full,generated,offset,text.length).flatMap(segment=>{
  let at=0;return segment.text.split(/(\n[ \t]*\n)/).flatMap(part=>{const begin=at;at+=part.length;if(!part&&segment.text)return[];return [{...segment,text:part,start:segment.start+begin,end:segment.start+at,relative:segment.relative+begin}];});
 });
 for(const segment of segments){
  if(/^\n[ \t]*\n$/.test(segment.text)){
   const gap=document.createElement('span');gap.style.cssText='display:block;height:'+(bpfFinalConsiderationsLeading*bpfFinalConsiderationsParagraphGap)+'em';gap.setAttribute('aria-hidden','true');fragment.append(gap);continue;
  }
  // Separadores permanecem visíveis, sem criar campos de edição vazios.
  if(!segment.id&&segment.text&&!segment.text.trim()){fragment.append(document.createTextNode(segment.text));continue;}
  const editor=document.createElement('span');editor.className='bpf-final-inline-edit';
  editor.contentEditable='plaintext-only';editor.setAttribute('role','textbox');editor.setAttribute('aria-multiline','true');editor.setAttribute('aria-label','Editar consideração diretamente no guia');
  if(!segment.text){editor.style.display='block';editor.style.minHeight='2em';}
  const lines=segment.text.split('\n');
  lines.forEach((line,i)=>{if(i)editor.append(document.createTextNode('\n'));const label=bpfIsFinalConsiderationTitle(line)?line:bpfConsiderationLabel(line);if(label){const strong=document.createElement('strong');strong.textContent=label;editor.append(strong,document.createTextNode(line.slice(label.length)));}else editor.append(document.createTextNode(line));});
  editor.onblur=()=>{
   const edited=editor.innerText.replace(/\r\n?/g,'\n');
   if(!bpfCommitFinalInlineEdit(segment,edited))return;
   bpfSyncPCCFinal();changed();el.bpfRenderedObservation=null;sync();
  };
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
 el.onclick=()=>{if(!bpfFinalConsiderationsFlow.full)el.querySelector('.bpf-final-inline-edit')?.focus();};
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
   next.set(id,{anchor,title,text,spacing:kind,offset:kind==='final'?bpfFinalConsiderationsFlow.parts.slice(0,offset+1).reduce((n,part)=>n+part.length,0):0});
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
 for(const [id,{anchor,title,text,spacing,offset}] of next){
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
  if(body&&(body.bpfRenderedObservation!==text||spacing==='final'&&body.bpfRenderedOffset!==offset)){
   if(spacing==='final')bpfRenderFinalConsiderationsText(body,text,offset);
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
 bpfRunNCObservationFlow(bpfGeneralFullText(),font,bold);
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
  for(const {line,gap,definition,title,label,scale=1} of rows){
   y-=gap*(spacing==='final'?size:leading);
   if(spacing==='nc'&&/^(?:NÃO CONFORMIDADES (?:CRÍTICAS|MAIORES|MENORES)\b|QUANTITATIVO DE NÃO CONFORMIDADES POR PROCESSO$)/.test(line))y-=.85*leading;
   const lineFont=title?bold:font;
   const wrapped=bpfFinalWrappedRows(line,title,label,font,bold,right-x-16,size);
   for(const {lead,rest} of wrapped){
    if(definition)y-=leading/3;
    const start=x+7;
    if(lead)page.drawText(lead,{x:start,y,size,font:bold,color:black});
    page.drawText(rest,{x:start+(lead?bold.widthOfTextAtSize(lead,size):0),y,size,font:lineFont,color:black});
    y-=leading*scale;
   }
   if(!wrapped.length)y-=leading*scale;
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

// O relatório de inspeção é estático; o campo de conclusão continua
// editável no HTML, mas no PDF a palavra inicial pode ter fonte distinta.
async function bpfPrintConclusionFormatted(pdf,form,font,sourcePages,cfg){
 const field=form.getFieldMaybe(cfg.field);if(!field)return;
 const widget=field.acroField.getWidgets()[0],meta=D.widgets.find(w=>w.name===cfg.field);
 if(!widget||!meta||!sourcePages?.[meta.page])return;
 const page=sourcePages[meta.page],{x,y,width,height}=widget.getRectangle();
 const normalize=window.bpfNormalizePdfText||(typeof bpfPrintNormalizeWinAnsi==='function'?bpfPrintNormalizeWinAnsi:String);
 const text=normalize(cfg.include(values[cfg.field]));
 const bold=await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
 const wrap=size=>text.split('\n').flatMap(line=>bpfFinalWrappedRows(line,false,bpfConsiderationLabel(line),font,bold,width-12,size));
 let size=8;while(size>.35&&wrap(size).length*size*1.3>height-12)size=Math.max(.35,size-.25);
 const black=PDFLib.rgb(0,0,0);
 for(const [i,{lead,rest}] of wrap(size).entries()){
  const baseline=y+height-6-size-i*size*1.3;
  if(lead)page.drawText(lead,{x:x+6,y:baseline,size,font:bold,color:black});
  if(rest)page.drawText(rest,{x:x+6+(lead?bold.widthOfTextAtSize(lead,size):0),y:baseline,size,font,color:black});
 }
 form.removeField(field);
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
 return [];
}
const bpfNCConsiderandosClasses=['PCC','PPRO','PC','POP','PPR'];
function bpfNCConsiderandosVisibility(){
 try{const saved=JSON.parse(values.BPF_NCConsiderandosVisibility||'null');if(Array.isArray(saved))return bpfNCConsiderandosClasses.filter(code=>saved.includes(code));}catch(e){}
 return [];
}
function bpfNCCondensationEligible(groups,category=''){
 return groups.filter(group=>group.entries.length>1&&(!category||group.category===category));
}
function bpfNCCondensationSet(groups,settings,checked,category=''){
 for(const group of bpfNCCondensationEligible(groups,category))settings[group.key]=checked;
}
function bpfOpenNCCondensation(){
 const groups=bpfNCDetalhesCatalogo(),settings=bpfFinalRead('BPF_NCDetalhesFormato',{}),edits=bpfFinalRead('BPF_NCDetalhesEdicoes',{}),hidden=new Set(bpfFinalRead('BPF_NCDetalhesOcultos',[]));
 const dialog=document.createElement('dialog');dialog.style.cssText='width:min(94vw,780px);max-height:88vh;overflow:auto;padding:16px;box-sizing:border-box;border:1px solid #177693;border-radius:8px;background:white;color:#12324a;font:15px/1.4 Arial,sans-serif';
 const heading=document.createElement('h2');heading.textContent='Condensar descrições de não conformidades';
 const help=document.createElement('p');help.textContent='Escolha quais itens deseja condensar. As unidades e evidências distintas serão mantidas. Edite a descrição se necessário; o texto revisado será preservado. Apague o texto inteiro para retirá-lo e use Recolocar para restaurar a sugestão.';
 const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.style.cssText='padding:7px 10px;margin:4px;border:1px solid #a9c6d8;border-radius:5px;background:#eef6fa;color:#12324a;font:inherit';b.onclick=fn;return b;};
 dialog.append(heading,help);
 const renderers=[],bulkControls=[],processSections=new Map();
 const bulk=document.createElement('fieldset');bulk.style.cssText='margin:8px 0;padding:10px;border:1px solid #b8ccd7;border-radius:5px';
 const bulkLegend=document.createElement('legend');bulkLegend.textContent='Condensar por classificação';bulkLegend.style.fontWeight='bold';bulk.append(bulkLegend);
 const refreshBulk=()=>{for(const {input,category} of bulkControls){const eligible=bpfNCCondensationEligible(groups,category),count=eligible.filter(g=>settings[g.key]).length;input.disabled=!eligible.length;input.checked=eligible.length>0&&count===eligible.length;input.indeterminate=count>0&&count<eligible.length;}};
 for(const category of ['',...bpfNCConsiderandosClasses]){
  const label=document.createElement('label');label.style.cssText='display:inline-flex;align-items:center;gap:4px;margin:5px 12px 5px 0;font-weight:bold';
  const input=document.createElement('input');input.type='checkbox';input.setAttribute('aria-label',category?'Condensar '+category:'Condensar todos os itens');label.append(input,document.createTextNode(category||'Todos os itens'));bulk.append(label);bulkControls.push({input,category});
  input.onchange=()=>{renderers.forEach(r=>r.capture());bpfNCCondensationSet(groups,settings,input.checked,category);renderers.forEach(r=>r.refresh());refreshBulk();};
 }
 dialog.append(bulk);
 const processNames={'4.1':'Captação','4.2':'Condução','4.3':'Reservatórios','4.5':'Recepção de insumos','4.6':'Higienização de embalagens e tampas','4.7':'Envase','4.10':'Controle de qualidade','4.11':'Responsabilidade e capacitação'};
 for(const group of groups){
  const processCode=group.code.split('.').slice(0,2).join('.');
  let section=processSections.get(processCode);
  if(!section){
   const details=document.createElement('details');details.style.cssText='margin:8px 0;border:1px solid #b8ccd7;border-radius:5px;background:#f5f9fb';
   const summary=document.createElement('summary');summary.style.cssText='padding:10px;cursor:pointer;font-weight:bold';const count=groups.filter(g=>g.code.split('.').slice(0,2).join('.')===processCode).length;summary.textContent=processCode+' — '+(processNames[processCode]||group.entries[0]?.process||'Processo')+' ('+count+' '+(count===1?'item':'itens')+')';details.append(summary);
   section={details,items:[]};processSections.set(processCode,section);dialog.append(details);
   details.addEventListener('toggle',()=>{if(details.open)for(const item of section.items)item.mount();});
  }
  const box=document.createElement('fieldset');box.style.cssText='margin:10px 0;padding:10px;border:1px solid #b8ccd7;border-radius:5px';
  const legend=document.createElement('legend');legend.textContent='Item '+group.code+' · F'+(group.index+1)+' ('+group.category+')';box.append(legend);
  const groupId='grupo:'+group.key,check=document.createElement('input');check.type='checkbox';check.checked=!!settings[group.key];check.disabled=group.entries.length<2;
  const label=document.createElement('label');label.append(check,document.createTextNode(' Condensar '+group.entries.length+' constatação(ões)'));box.append(label);
  const body=document.createElement('div');box.append(body);let pending=[];
  const capture=()=>{for(const {id,area,base} of pending){const value=area.value.trim();if(value===base)continue;if(!value){hidden.add(id);delete edits[id];}else{hidden.delete(id);edits[id]=value;}}};
  const render=()=>{
   body.replaceChildren();pending=[];
   const grouped=!!settings[group.key]&&group.entries.length>1;
   const records=grouped||typeof edits[groupId]==='string'? [{id:groupId,text:bpfNCCondensar(group,group.entries.map(e=>({...e,text:edits[e.id]||e.text})))}]:group.entries;
   for(const record of records){const area=document.createElement('textarea');area.rows=5;area.style.cssText='display:block;width:100%;box-sizing:border-box;margin:6px 0;padding:6px;font:inherit';area.setAttribute('aria-label','Descrição da não conformidade');const base=hidden.has(record.id)?'':edits[record.id]||record.text;area.value=base;pending.push({id:record.id,area,base});body.append(area,button('Recolocar sugestão',()=>{hidden.delete(record.id);delete edits[record.id];area.value=record.text;pending.find(p=>p.id===record.id).base=record.text;}));}
  };
  let mounted=false;
  const mount=()=>{if(mounted)return;mounted=true;check.checked=!!settings[group.key];render();};
  const refresh=()=>{check.checked=!!settings[group.key];if(mounted)render();};
  check.onchange=()=>{capture();settings[group.key]=check.checked;render();refreshBulk();};renderers.push({capture,refresh});section.items.push({mount});section.details.append(box);
 }
 refreshBulk();
 if(!groups.length){const p=document.createElement('p');p.textContent='Nenhuma não conformidade registrada.';dialog.append(p);}
 const actions=document.createElement('div');actions.style.cssText='position:sticky;bottom:0;background:white;padding:6px 0';
 actions.append(button('Salvar',()=>{renderers.forEach(r=>r.capture());values.BPF_NCDetalhesFormato=JSON.stringify(settings);values.BPF_NCDetalhesEdicoes=JSON.stringify(edits);values.BPF_NCDetalhesOcultos=JSON.stringify([...hidden]);bpfSyncNCLists();changed();sync();dialog.close();}),button('Cancelar',()=>dialog.close()));dialog.append(actions);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();
}
const quantKey='BPF_ConclusaoQuantitativoProcessos';
function quantitativeSelected(){return values[quantKey]!=='Off';}
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
  const reasons=document.createElement('div');reasons.style.cssText='flex-basis:100%;display:flex;align-items:center;gap:6px;flex-wrap:wrap';
  const reasonTitle=document.createElement('span');reasonTitle.textContent='Mostrar considerações detalhadas:';reasons.append(reasonTitle);
  for(const code of bpfNCConsiderandosClasses){
   const input=document.createElement('input');input.type='checkbox';input.dataset.ncConsiderando=code;input.style.margin='0 3px 0 0';
   const label=document.createElement('label');label.style.cssText='white-space:nowrap;cursor:pointer';label.append(input,document.createTextNode(code));
   input.onchange=()=>{values.BPF_NCConsiderandosVisibility=JSON.stringify([...reasons.querySelectorAll('[data-nc-considerando]:checked')].map(el=>el.dataset.ncConsiderando));bpfSyncNCLists();changed();sync();};reasons.append(label);
  }
  bar.append(reasons);
  const condense=document.createElement('button');condense.type='button';condense.textContent='Condensar / editar descrições';condense.style.cssText=button.style.cssText;condense.onclick=bpfOpenNCCondensation;reasons.append(condense);
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
 const considerations=bpfNCConsiderandosVisibility();
 for(const input of bar.querySelectorAll('input[data-nc-considerando]'))input.checked=considerations.includes(input.dataset.ncConsiderando);
}
