/* Risco por PCC: valores numéricos/categorias separados do rótulo visual.
 * Um PCC NÃO torna ALTO o risco da linha/grupo, processo, matriz e estabelecimento.
 * O texto ALTO - PCC aparece nas células correspondentes, sem alterar F/NC/OBS.
 */
(function(){
'use strict';
if(window.__bpfPccLabelV98)return;
window.__bpfPccLabelV98=true;
const GROUPS=[
 {pages:[0],units:{0:['Dropdown1','Dropdown2','Dropdown3','Dropdown4']},
  finals:{0:'Dropdown5'},matrix:'Dropdown67',score:'Dropdown300',
  cells:{0:['Dropdown100','Dropdown101','Dropdown102','Dropdown103']}},
 {pages:[1],units:{1:['Dropdown6','Dropdown113','Dropdown8','Dropdown9']},
  finals:{1:'Dropdown10'},matrix:'Dropdown66',score:'Dropdown301',
  cells:{1:['Dropdown104','Dropdown105','Dropdown106','Dropdown107']}},
 {pages:[2,3,4,5],units:{
  2:['Dropdown11','Dropdown12','Dropdown13','Dropdown14'],
  3:['Dropdown16','Dropdown17','Dropdown18','Dropdown19'],
  4:['Dropdown21','Dropdown22','Dropdown23','Dropdown24'],
  5:['Dropdown26','Dropdown27','Dropdown28','Dropdown29']},
  finals:{2:'Dropdown15',3:'Dropdown20',4:'Dropdown25',5:'Dropdown30'},
  matrix:'Dropdown65',score:'Dropdown302',
  cells:{2:['Dropdown108','Dropdown109','Dropdown110','Dropdown111']}},
 {pages:[6],units:{6:['Dropdown31','Dropdown32','Dropdown33','Dropdown34']},
  finals:{6:'Dropdown35'},matrix:'Dropdown64',score:'Dropdown303',
  cells:{6:['Dropdown112','Dropdown116','Dropdown114','Dropdown115']}},
 {pages:[7,8],units:{
  7:['Dropdown36','Dropdown37','Dropdown38','Dropdown39'],
  8:['Dropdown41','Dropdown42','Dropdown43','Dropdown44']},
  finals:{7:'Dropdown40',8:'Dropdown45'},matrix:'Dropdown63',score:'Dropdown304',
  cells:{7:['Dropdown140','Dropdown141','Dropdown142','Dropdown143'],
         8:['Dropdown144','Dropdown145','Dropdown146','Dropdown147']}},
 {pages:[9,10],units:{
  9:['Dropdown46','Dropdown47','Dropdown48','Dropdown49'],
  10:['Dropdown51','Dropdown52','Dropdown53','Dropdown54']},
  finals:{9:'Dropdown50',10:'Dropdown55'},matrix:'Dropdown61',score:'Dropdown305',
  cells:{9:['Dropdown130','Dropdown131','Dropdown132','Dropdown133'],
         10:['Dropdown134','Dropdown135','Dropdown136','Dropdown137']}},
 {pages:[11],units:{},finals:{11:'Dropdown56'},
  matrix:'Dropdown60',score:'Dropdown306',cells:{}},
 {pages:[12],units:{},finals:{12:'Dropdown57'},
  matrix:'Dropdown62',score:'Dropdown307',cells:{}}
];
const CLASS='bpf-pcc-risk-label-v98';
let inRefresh=false,queued=false;

function sourceData(){
 try {
  if(typeof BPF_PHRASES==='undefined'||typeof bpfPhraseName!=='function')return null;
  const guide=window.Guia;
  if(!guide?.values||!guide?.data?.widgets)return null;
  return {guide,phrases:BPF_PHRASES,phraseName:bpfPhraseName};
 }catch(error){return null;}
}
function failures(data){
 const fail=new Map(),values=data.guide.values;
 for(const page of data.phrases){
  for(const row of (page.rows||[]))for(const scope of (row.scopes||[])){
   for(let index=0;index<(scope.phrases||[]).length;index++){
    if(String(scope.phrases[index]?.appcc||'').toUpperCase()!=='PCC')continue;
    if(String(values[data.phraseName(scope,index)]||'')!=='0')continue;
    const col=Number(scope.col);
    if(!Number.isInteger(col)||col<1||col>4)continue;
    if(!fail.has(page.page))fail.set(page.page,new Set());
    fail.get(page.page).add(col);
   }
  }
 }
 return fail;
}
function addLabel(active,data,field,pageIndex,label){
 const pages=document.getElementById('pages');
 const pageEl=pages?.children?.[pageIndex];
 if(!pageEl)return;
 const widget=data.guide.data.widgets.find(w=>w.page===pageIndex&&w.name===field);
 if(!widget?.rect||!widget?.size)return;
 const [x1,y1,x2,y2]=widget.rect,[W,H]=widget.size;
 if(!(W>0&&H>0&&x2>x1&&y2>y1))return;
 const key=pageIndex+':'+field;
 active.add(key);
 let element=null;
 for(const candidate of pageEl.querySelectorAll('.'+CLASS)){
  if(candidate.dataset.key===key){element=candidate;break;}
 }
 if(!element){
  element=document.createElement('span');
  element.className=CLASS;
  element.dataset.key=key;
  element.setAttribute('aria-label','Risco ALTO por PCC não atendido');
  element.title='ALTO RISCO — Ponto Crítico de Controle não atendido';
  element.style.cssText='position:absolute;display:flex;align-items:center;justify-content:center;'+
   'z-index:76;pointer-events:none;overflow:hidden;white-space:nowrap;'+
   'font-family:Arial,Helvetica,sans-serif;font-weight:700;color:#b01823;'+
   'background:#f4f7fd;text-align:center;letter-spacing:-0.2px;'+
   'font-size:clamp(8px,1.55cqw,12px);line-height:1;';
  pageEl.appendChild(element);
 }
 const inset=.8;
 element.style.left=((x1+inset)/W*100)+'%';
 element.style.top=((H-y2+inset)/H*100)+'%';
 element.style.width=((x2-x1-2*inset)/W*100)+'%';
 element.style.height=((y2-y1-2*inset)/H*100)+'%';
 if(x2-x1<48)element.style.fontSize='clamp(6px,1.0cqw,8px)';
 if(element.textContent!==label)element.textContent=label;
}
function refresh(){
 if(inRefresh)return;
 const data=sourceData();if(!data)return;
 inRefresh=true;
 try{
  const v=data.guide.values;
  const fail=failures(data);
  const active=new Set();
  let dirty=false;
  let anyProcessHigh=false;
  for(const group of GROUPS){
   let groupPCC=false;
   for(const pageNo of group.pages){
    const cols=fail.get(pageNo);
    if(!cols?.size)continue;
    groupPCC=true;
    for(const col of cols){
     const unit=group.units[pageNo]?.[col-1];
     if(unit){
      if(v[unit]!=='ALTO'){v[unit]='ALTO';dirty=true;}
      addLabel(active,data,unit,pageNo,'ALTO - PCC');
     }
     const matrixCell=group.cells[pageNo]?.[col-1];
     if(matrixCell&&v[matrixCell]!=='3'){v[matrixCell]='3';dirty=true;}
    }
    const final=group.finals[pageNo];
    if(final){
     if(v[final]!=='ALTO'){v[final]='ALTO';dirty=true;}
     addLabel(active,data,final,pageNo,'ALTO - PCC');
    }
   }
   if(groupPCC){
    if(v[group.matrix]!=='ALTO'){v[group.matrix]='ALTO';dirty=true;}
    if(v[group.score]!=='3'){v[group.score]='3';dirty=true;}
    addLabel(active,data,group.matrix,17,'ALTO - PCC');
   }
   if(v[group.matrix]==='ALTO')anyProcessHigh=true;
  }
  // Matriz 4.1–4.11: os codigos 1/2/3 representam a classificacao
  // efetiva, nunca o percentual bruto nem um valor deixado por versao antiga.
  // As alteracoes PCC realizadas acima permanecem prioritarias.
  const rankOf=x=>{const s=String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();return s.startsWith('ALTO')?3:s.startsWith('MEDIO')?2:s.startsWith('BAIXO')?1:0;};
  const labelOf=n=>n===3?'ALTO':n===2?'MÉDIO':n===1?'BAIXO':'';
  const numericOf=n=>n?String(n):'';
  const assign=(name,value)=>{if(name&&v[name]!==value){v[name]=value;dirty=true;}};
  anyProcessHigh=false;
  for(const group of GROUPS){
   let processRank=0;
   for(const pageNo of group.pages){
    let pageRank=0;
    for(const unit of group.units[pageNo]||[]){
     pageRank=Math.max(pageRank,rankOf(v[unit]));
    }
    const final=group.finals[pageNo];
    // Um processo com diversas linhas nunca pode ter risco inferior
    // ao da linha de maior risco.
    pageRank=Math.max(pageRank,rankOf(v[final]));
    if(pageRank&&final)assign(final,labelOf(pageRank));
    processRank=Math.max(processRank,pageRank);
    // Na matriz, cada coluna de captacao/reservatorio corresponde
    // ao risco da pagina da captacao, nao ao valor residual de outro calculo.
    const cells=group.cells[pageNo]||[];
    if(group.pages.length>1 && cells.length){
      for(const cell of cells)if(v[cell]!==undefined && v[cell]!=='')assign(cell,numericOf(pageRank));
    }
   }
   if(group.pages.length>1&&group.cells[group.pages[0]]?.length){
    // 4.3: quatro captacoes, cada uma representada por um indicador.
    for(let i=0;i<group.pages.length;i++){
      const pg=group.pages[i],cell=group.cells[group.pages[0]][i];
      const rank=rankOf(v[group.finals[pg]]);
      if(cell&&rank)assign(cell,numericOf(rank));
    }
   }else if(group.pages.length===1){
    const pg=group.pages[0],cells=group.cells[pg]||[],units=group.units[pg]||[];
    for(let i=0;i<cells.length;i++){
     const rank=rankOf(v[units[i]]);
     if(rank)assign(cells[i],numericOf(rank));
    }
   }
   // Os processos sem unidades (controle de qualidade e manipuladores) usam seu resultado calculado.
   if(!Object.keys(group.units).length)processRank=Math.max(processRank,rankOf(v[group.matrix]));
   if(processRank){
    assign(group.matrix,labelOf(processRank));
    assign(group.score,numericOf(processRank));
   }
   if(processRank===3)anyProcessHigh=true;
  }
  if(anyProcessHigh){
   if(v.Dropdown58!=='ALTO'){v.Dropdown58='ALTO';dirty=true;}
   if(v.Group279!=='2'){v.Group279='2';dirty=true;}
  }
  // Não criar identificações PCC em processos sem falha PCC; isso preserva a
  // classificação percentual normal e remove os rótulos ao corrigir o requisito.
  const host=document.getElementById('pages');
  for(const elem of host?.querySelectorAll('.'+CLASS)||[]){
   if(!active.has(elem.dataset.key))elem.remove();
  }
  if(dirty&&typeof window.sync==='function')window.sync();
 }catch(error){console.warn('Identificação PCC na matriz:',error);}
 finally{inRefresh=false;}
}
function schedule(){
 if(queued)return;
 queued=true;
 requestAnimationFrame(function(){queued=false;refresh();});
}
function wrapRecalc(){
 const original=window.recalc;
 if(typeof original!=='function'||original.__bpfPccRiskLabelV98)return;
 const wrapped=function(){
  const result=original.apply(this,arguments);
  schedule();
  return result;
 };
 wrapped.__bpfPccRiskLabelV98=true;
 window.recalc=wrapped;
 if(window.Guia?.recalc===original)window.Guia.recalc=wrapped;
}
function start(){
 wrapRecalc();
 schedule();
 document.addEventListener('change',schedule,true);
 document.addEventListener('input',schedule,true);
 document.addEventListener('click',schedule,true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
window.bpfAtualizarRotuloPCC=schedule;
})();