/* OBS livre do F sem resposta SIM: texto separado do resultado e da matriz.
   Complementa as rotinas nativas; não muda as respostas, a exigência de NC ou o cálculo. */
(function(){
'use strict';
if(window.__bpfObsLivresV93)return;
window.__bpfObsLivresV93=true;
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
  // A OBS do quadro SIM também deve ser registrada quando NÃO foi marcado.
  // Bloquear a OBS separada somente se existir algum SIM efetivamente marcado,
  // pois neste caso a rotina normal já a inclui com o prefixo SIM.
  const hasSim=(panel.entries||[]).some(e=>values[e.name]==='1');
  let unifiedSim=false;
  if(typeof bpfUnifiedAnswer==='function'){
   try{unifiedSim=bpfUnifiedAnswer(page,row,panel)==='1';}catch(e){}
  }
  let checklistSim=false;
  if(panel.checklist&&typeof bpfChecklistSelected==='function'){
   try{checklistSim=(bpfChecklistSelected(page,row,panel,'1')||[]).length>0;}catch(e){}
  }
  if(hasSim||unifiedSim||checklistSim)continue;
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
 if(bpfSyncObservation.__bpfObsLivresV93)return true;
 const original=bpfSyncObservation;
 const enhanced=function(row,page){
  const value=original.apply(this,arguments);
  try{independentObservation(row,page);}
  catch(e){console.warn('OBS livre do F:',e);}
  return value;
 };
 enhanced.__bpfObsLivresV93=true;
 bpfSyncObservation=enhanced;
 return true;
}
if(!install()){
 let retries=0;
 const timer=setInterval(()=>{if(install()||++retries>30)clearInterval(timer);},250);
}
})();