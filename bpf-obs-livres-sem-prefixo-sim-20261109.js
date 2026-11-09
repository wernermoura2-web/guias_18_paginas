/* Guia BPF/APPCC: a OBS é livre; a marcação SIM permanece separada.
   Não alterar as respostas, os critérios APPCC nem as regras de NC. */
(function(){
 'use strict';
 if(window.__bpfObsLivresSemPrefixoSimV1)return;
 window.__bpfObsLivresSemPrefixoSimV1=true;

 function asText(value){return String(value==null?'':value);}
 // Remove apenas a palavra de status "Sim" dos REGISTROS DE OBS.
 // Mantém F, grupo/linha, classificação APPCC e texto fornecido.
 function withoutSimPrefix(summary){
  return asText(summary).replace(
   /(\bF\d+\s*[—–-]\s*)Sim\s*\(([^)]*)\)\s*[:;]\s*(OBS(?:\s*\(([^)]*)\))?\s*:\s*)/gi,
   function(match,prefix,group,marker,meta){
    return prefix+'OBS ('+group+')'+(meta?' ('+meta+')':'')+': ';
   }
  );
 }

 function wrapSync(){
  if(typeof bpfSyncObservation!=='function')return false;
  if(bpfSyncObservation.__bpfObsSemSimV1)return true;
  const original=bpfSyncObservation;
  const patched=function(row,page){
   const result=original.apply(this,arguments);
   try{
    if(typeof bpfSummaryName!=='function'||typeof BPF_OBSERVATION_FIELDS==='undefined'||typeof bpfMergeObservation!=='function')return result;
    const summaryKey=bpfSummaryName(page,row);
    const oldSummary=asText(values[summaryKey]);
    const clean=withoutSimPrefix(oldSummary);
    if(clean===oldSummary)return result;
    const outputField=BPF_OBSERVATION_FIELDS[page.page+'_'+row.code];
    if(outputField){
     values[outputField]=bpfMergeObservation(
      asText(values[outputField]),row.code,oldSummary,clean
     );
    }
    values[summaryKey]=clean;
   }catch(e){console.warn('Falha ao formatar OBS do F:',e);}
   return result;
  };
  patched.__bpfObsSemSimV1=true;
  bpfSyncObservation=patched;
  return true;
 }

 // Nos F agrupados, permitir escrever OBS antes da marcação SIM;
 // somente a seleção formal de SIM/NÃO define conformidade e risco.
 function enableUnmarkedObs(){
  const editor=document.getElementById('bpf-editor');
  if(!editor)return;
  const code=(editor.querySelector('h2')?.textContent||'').match(/\b4\.\d{1,2}\.\d{1,2}\b/)?.[0];
  if(!code||typeof BPF_PHRASES==='undefined'||typeof bpfPanels!=='function'||typeof bpfGroupNoteName!=='function')return;
  const page=BPF_PHRASES.find(p=>(p.rows||[]).some(r=>r.code===code));
  if(!page)return;
  const row=page.rows.find(r=>r.code===code);
  const panels=bpfPanels(page,row);
  const cards=editor.querySelectorAll('fieldset.bpf-unified-group');
  cards.forEach((card,index)=>{
   const panel=panels[index],area=card.querySelector('textarea');
   if(!panel||!area)return;
   if(area.dataset.bpfFreeObsAttached!=='1'){
    area.dataset.bpfFreeObsAttached='1';
    area.addEventListener('input',()=>{
     if(card.querySelector('.bpf-unified-status input[type=radio]:checked'))return;
     try{
      const key=bpfGroupNoteName(page,row,panel,'1');
      values[key]=area.value;
      if(typeof changed==='function')changed();
     }catch(e){console.warn('Não foi possível registrar OBS:',e);}
    },true);
   }
   if(!card.querySelector('.bpf-unified-status input[type=radio]:checked')){
    const key=bpfGroupNoteName(page,row,panel,'1');
    if(area.disabled||!area.dataset.note){
     area.disabled=false;
     area.dataset.note=key;
     area.value=asText(values[key]);
     area.placeholder='OBS opcional — a avaliação SIM/NÃO é feita nas opções acima';
    }
   }
  });
 }

 function boot(){
  wrapSync();
  enableUnmarkedObs();
  const observer=new MutationObserver(()=>{wrapSync();enableUnmarkedObs();});
  observer.observe(document.body,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})();
