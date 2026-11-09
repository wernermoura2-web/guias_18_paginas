/* OBS livre do F sem resposta SIM: texto separado do resultado e da matriz.
   Complementa as rotinas nativas; não muda as respostas, a exigência de NC ou o cálculo. */
(function(){
'use strict';
if(window.__bpfObsLivresV91)return;
window.__bpfObsLivresV91=true;
const trim=value=>String(value==null?'':value).replace(/\s+/g,' ').trim();

function independentObservation(row,page){
 if(typeof bpfPanels!=='function'||typeof bpfGroupNoteName!=='function'||
    typeof bpfSummaryName!=='function'||typeof bpfMergeObservation!=='function'||
    typeof BPF_OBSERVATION_FIELDS==='undefined')return;
 const field=BPF_OBSERVATION_FIELDS[page.page+'_'+row.code];
 if(!field)return;
 const summaryKey=bpfSummaryName(page,row);
 const previous=String(values[summaryKey]||'');
 const extra=[];
 for(const panel of bpfPanels(page,row)){
  const note=trim(values[bpfGroupNoteName(page,row,panel,'1')]);
  if(!note)continue;
  const hasAnswer=(panel.entries||[]).some(e=>['1','0','2'].includes(values[e.name]));
  let unified=false;
  if(typeof bpfUnifiedAnswer==='function'){
   try{unified=['1','0'].includes(bpfUnifiedAnswer(page,row,panel));}catch(e){}
  }
  let checklist=false;
  if(panel.checklist&&typeof bpfChecklistSelected==='function'){
   try{checklist=['1','0'].some(a=>bpfChecklistSelected(page,row,panel,a)?.length>0);}catch(e){}
  }
  if(hasAnswer||unified||checklist)continue;
  const categories=[...new Set((panel.entries||[]).map(e=>trim(e.phrase?.appcc)).filter(Boolean))];
  const cls=categories.length?' ('+categories.join(' / ')+')':'';
  extra.push(panel.label+' — OBS'+cls+': '+note);
 }
 if(!extra.length)return;
 const base=previous.trim().replace(/\.$/,'');
 const summary=[base,...extra].filter(Boolean).join('; ').replace(/\.+$/,'')+'.';
 values[field]=bpfMergeObservation(String(values[field]||''),row.code,previous,summary);
 values[summaryKey]=summary;
}
function install(){
 if(typeof bpfSyncObservation!=='function')return false;
 if(bpfSyncObservation.__bpfObsLivresV91)return true;
 const original=bpfSyncObservation;
 const enhanced=function(row,page){
  const value=original.apply(this,arguments);
  try{independentObservation(row,page);}
  catch(e){console.warn('OBS livre do F:',e);}
  return value;
 };
 enhanced.__bpfObsLivresV91=true;
 bpfSyncObservation=enhanced;
 return true;
}
if(!install()){
 let retries=0;
 const timer=setInterval(()=>{if(install()||++retries>30)clearInterval(timer);},250);
}
})();