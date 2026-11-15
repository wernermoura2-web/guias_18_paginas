(function(){
'use strict';
if(window.__bpfSampling404)return;
window.__bpfSampling404=true;
const checks=[["F1","mensal_plano","Análise mensal terceirizada prevista no plano, quando aplicável",true],["F2","execucao","Execução do plano conforme previsto",false],["F2","aceitacao","Limites de aceitação definidos",false],["F2","mensal_registro","Análise mensal terceirizada executada, registrada e comparada aos limites",true],["F2","heterotroficas","Limites internos de alerta e de ação para bactérias heterotróficas definidos",false]];
const key=id=>'BPF_Sampling_4104_'+id;
const revised=new Map(),guidance=new Map();
const captionFor=label=>revised.get(label)||label;
window.bpfSamplingCaption404=captionFor;
window.bpfInitSampling404=(data)=>{for(const [,id,label] of checks){const name=key(id);data.fields[name]={name,type:'/Tx',flags:0,label,options:[],calc:'',phrasePage:11};}};
window.bpfRegisterSamplingReview404=(entries,byKey,pages)=>{
 for(const page of pages)if(page.rows.some(row=>row.code==='4.10.4')){
  for(const [f,id,label] of checks){
   const entry={key:page.page+':4.10.4:'+f+':amostragem:'+id,page:page.page,code:'4.10.4',
    index:Number(f[1])-1,label:f+' — '+label,scopes:[],appcc:'PPRO',
    original:{text:label,guidance:'Verificação do plano de amostragem e de seus registros.'},
    refs:[{set text(value){revised.set(label,value);},set guidance(value){guidance.set(label,value);}}]};
   entries.push(entry);
   byKey.set(entry.key,entry);
  }
 }
};
const data=()=>window.Guia?.values||(typeof values==='object'?values:null);
function refresh(){
 const editor=document.getElementById('bpf-editor');
 if(!editor||!/\b4\.10\.4\b/.test(editor.querySelector('h2')?.textContent||''))return;
 for(const card of editor.querySelectorAll('fieldset.bpf-group')){
   const f=card.querySelector(':scope > legend')?.textContent.trim().match(/^F[12]\b/)?.[0];
   if(f!=='F1'||card.querySelector('[data-sampling-criteria]'))continue;
   const anchor=card.querySelector('.bpf-group-description')||card.querySelector('legend');
   const area=document.createElement('div');
   area.dataset.samplingCriteria=f;
   area.style.cssText='padding:10px;margin:10px 0;background:#eef5f8';
   for(const [,id,label,na] of checks.filter(item=>item[0]===f)){
     const row=document.createElement('label');
     row.style.cssText='display:flex;justify-content:space-between;gap:8px;align-items:center;margin:6px 0';
     const caption=document.createElement('span');caption.textContent=captionFor(label);caption.title=guidance.get(label)||'';
     const input=document.createElement('select');
     for(const [value,name] of [['','Selecione'],['1','Sim'],['0','Não'],...(na?[['2','NA']]:[])]){
       const option=document.createElement('option');option.value=value;option.textContent=name;input.append(option);
     }
     input.value=data()?.[key(id)]||'';
     input.addEventListener('change',()=>{
       const state=data();if(!state)return;
       state[key(id)]=input.value;
       window.Guia?.recalc?.();
       const notes=[...card.querySelectorAll('textarea')];
       const notifier=notes[0]||card.querySelector('input[data-answer-name]');
       notifier?.dispatchEvent(new Event('change',{bubbles:true}));
     });
     row.append(caption,input);area.append(row);
   }
   anchor?.after(area);

 }
}
function install(){
 const observer=new MutationObserver(refresh);
 observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('focus',refresh);
 refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();

window.bpfSamplingAnnex404=(page,row,panels,state)=>{
 const result=[];
 for(const panel of panels){
  const f='F'+(panel.id+1);
  const itemChecks=checks.filter(([group])=>group===f);
  const checklist=panel.checklist;
  const selected=checklist?Object.fromEntries(['1','0'].map(answer=>[
   answer,bpfChecklistSelected(page,row,panel,answer,state)
  ])):{};
  const storedAnswers=itemChecks.map(([,id,label])=>{
   const answer=f==='F2'&&checklist
    ?['0','1'].find(value=>selected[value].includes(label))||
      (id==='mensal_registro'&&state[key(id)]==='2'?'2':'')
    :state[key(id)];
   return [label,answer];
  });
  for(const answer of ['1','0','2']){
   const marked=storedAnswers.filter(([,value])=>value===answer).map(([label])=>captionFor(label));
   const entry=panel.entries[0];
   const overall=entry&&state[entry.name];
   if(f==='F1'&&answer!=='2'){
    const references=selected[answer]||[];
    const other=String(state[bpfChecklistKey(page,row,panel,'Other',answer)]||'').trim();
    marked.unshift(...references.map(reference=>reference==='Outros'&&other?'Outros: '+other:reference));
   }
   if(f==='F1'&&overall===answer&&!marked.length){
    marked.push('Avaliação geral registrada — '+bpfAnswerLabel(answer));
   }
   if(f==='F2'&&overall===answer&&!storedAnswers.some(([,value])=>['1','0'].includes(value))){
    marked.unshift('Avaliação geral registrada — '+bpfAnswerLabel(answer));
   }
   if(!marked.length)continue;
   const note=overall===answer||checklist&&answer!=='2'
    ?String(state[bpfGroupNoteName(page,row,panel,answer)]||
      (overall===answer&&entry?state[bpfNoteName(entry.scope,entry.index)]:'')||'').trim():'';
   result.push({page,row,panel,checklist:marked,answer,note});
  }
 }
 return result;
};
})();
