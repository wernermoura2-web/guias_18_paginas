(() => {
'use strict';
if(window.bpfConclusaoNC)return;
const field='CONSIDERAÇÕES FINAIS  AVALIAÇÃO DE RISCORow1_2';
const sentences=[
 'O estabelecimento deverá sanar todas as não conformidades registradas no Guia de Avaliação de Risco Sanitário.',
 'A Vigilância Sanitária Municipal adotará as medidas sanitárias cabíveis.'
];
const selectionKey='BPF_ConclusaoFrasesSelecionadas';
const state=()=>window.Guia?.values||(typeof values==='object'?values:null);
function hasNC(){
 const data=state();
 if(!data||typeof BPF_PHRASES==='undefined')return false;
 return BPF_PHRASES.some(page=>(typeof bpfReservoirIsLinked!=='function'||!bpfReservoirIsLinked(page.page))&&page.rows.some(row=>{
   if(row.scopes.some(scope=>data[scope.name]==='0'||scope.phrases.some((_,i)=>typeof bpfPhraseName==='function'&&data[bpfPhraseName(scope,i)]==='0')))return true;
   if(typeof bpfPanels!=='function')return false;
   return bpfPanels(page,row).some(panel=>
    panel.entries?.some(entry=>data[entry.name]==='0')||
    (panel.checklist&&typeof bpfChecklistSelected==='function'&&bpfChecklistSelected(page,row,panel,'0')?.length));
 }));
}
function selected(){
 const data=state();
 try{const saved=JSON.parse(data?.[selectionKey]||'null');if(Array.isArray(saved))return sentences.map((_,i)=>saved.includes(i));}catch(e){}
 const current=String(data?.[field]||'');
 return sentences.map(sentence=>hasNC()||current.includes(sentence));
}
function withoutSentences(text){
 return String(text||'').split(/\r?\n/).filter(line=>!sentences.includes(line.trim())).join('\n').trimEnd();
}
function include(text){
 const original=withoutSentences(text), checks=selected();
 return [original,...sentences.filter((_,i)=>checks[i])].filter(Boolean).join('\n\n');
}
function update(){
 const host=document.querySelector('#pages');
 const data=window.Guia?.data||(typeof GUIDE_DATA==='object'?GUIDE_DATA:null);
 if(!host||!data?.widgets)return;
 const widget=data.widgets.find(w=>w.name===field);
 if(!widget)return;
 const page=host.querySelector('.page[data-page="'+widget.page+'"]');
 if(!page)return;
 let box=page.querySelector('[data-bpf-conclusao-nc]');
 if(!box){
   box=document.createElement('aside');
   box.dataset.bpfConclusaoNc='';
   box.style.cssText='position:absolute;z-index:6;left:7.4%;width:85%;top:36.6%;box-sizing:border-box;padding:.5% 1%;border:1px solid #b8ccd7;background:#f3f8fa;color:#153c52;font:clamp(6px,1.25cqw,14px)/1.25 Arial,sans-serif;white-space:normal;pointer-events:auto';
   box.setAttribute('role','group');box.setAttribute('aria-label','Frases de conclusão');
   const title=document.createElement('strong');title.textContent='Incluir no relatório:';box.append(title);
   sentences.forEach((sentence,i)=>{
    const label=document.createElement('label');label.style.cssText='display:flex;align-items:flex-start;gap:5px;margin:3px 0;cursor:pointer';
    const input=document.createElement('input');input.type='checkbox';input.dataset.bpfConclusionIndex=String(i);input.style.cssText='margin:0;flex:none';
    input.onchange=()=>{
     const data=state();if(!data)return;
     data[selectionKey]=JSON.stringify([...box.querySelectorAll('input:checked')].map(item=>Number(item.dataset.bpfConclusionIndex)));
     data[field]=withoutSentences(data[field]);
     if(typeof changed==='function')changed();if(typeof sync==='function')sync();
    };
    label.append(input,document.createTextNode(sentence));box.append(label);
   });
   page.append(box);
 }
 const checks=selected();
 for(const input of box.querySelectorAll('input[data-bpf-conclusion-index]'))input.checked=checks[Number(input.dataset.bpfConclusionIndex)];
 box.hidden=false;
}
window.bpfConclusaoNC={hasNC,include,field};
function install(){
 let queued=false;
 function schedule(){
  if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;update()});}
 }
 const style=document.createElement('style');
 style.textContent='@media print{[data-bpf-conclusao-nc]{display:none!important}}';
 document.head.append(style);
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('input',schedule,true);
 document.addEventListener('change',schedule,true);
 schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();