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

const summaryKey='BPF_ConclusaoSinteseProcessos';
const topics={
 '4.1.1':'condições da área externa e drenagem','4.1.2':'condições da casa de proteção e pontos de coleta','4.1.3':'higienização da captação e seus controles',
 '4.2.2':'materiais e conservação das canalizações','4.2.7':'higienização das canalizações e seus controles','4.2.8':'inspeção, desmonte e revisão da higienização','4.2.9':'procedimentos de higienização da condução',
 '4.3.2':'materiais e conservação dos reservatórios','4.3.3':'dispositivos e filtros dos reservatórios','4.3.4':'inspeção interna e revisão da higienização','4.3.5':'higienização dos reservatórios e seus controles','4.3.6':'procedimentos de higienização dos reservatórios',
 '4.5.2':'área de recepção','4.5.3':'inspeção dos insumos','4.5.4':'avaliação das embalagens retornáveis','4.5.6':'destinação de insumos reprovados','4.5.8':'procedimentos de recepção',
 '4.6.3':'higienização de embalagens de primeiro uso','4.6.4':'pré-lavagem das embalagens retornáveis','4.6.5':'limpeza e desinfecção das embalagens','4.6.6':'enxágue e controle de resíduos','4.6.7':'enxágue final','4.6.8':'higienização e manuseio das tampas','4.6.9':'transporte de embalagens higienizadas','4.6.10':'passagem das embalagens à sala de envase','4.6.11':'procedimentos e capacitação de funcionários','4.6.12':'POP de higienização das embalagens',
 '4.7.1':'envase e vedação das embalagens','4.7.2':'estrutura e condições da sala de envase','4.7.3':'adição de dióxido de carbono','4.7.4':'barreiras e condições ambientais','4.7.5':'acesso à sala e higiene das mãos','4.7.6':'uniformes','4.7.8':'higienização da sala e dos equipamentos',
 '4.10.1':'implementação e documentação do controle da qualidade','4.10.2':'capacidade laboratorial e contratação de análises','4.10.3':'verificações microbiológicas','4.10.4':'plano de amostragem','4.10.5':'composição e comprovação analítica','4.10.6':'medidas corretivas e registros','4.12.6':'documentação do dióxido de carbono',
 '4.11.1':'supervisão e capacitação dos manipuladores','4.11.2':'designação e habilitação profissional','4.11.3':'capacitação do responsável','4.11.4':'comprovação das capacitações'
};
function processSummary(){
 const data=state();
 if(!data||typeof BPF_PHRASES==='undefined'||typeof titles==='undefined')return [];
 const groups=new Map();
 for(const page of BPF_PHRASES){
  if(typeof bpfReservoirIsLinked==='function'&&bpfReservoirIsLinked(page.page))continue;
  const reservoir=page.page>=2&&page.page<=5;
  const name=reservoir?'4.3 Reservatórios':titles[page.page];
  if(!name)continue;
  let group=groups.get(name);
  if(!group){group={name,assessed:false,topics:new Set()};groups.set(name,group);}
  for(const row of page.rows){
   const answers=[];
   for(const scope of row.scopes){
    answers.push(data[scope.name]);
    if(typeof bpfPhraseName==='function')scope.phrases.forEach((_,i)=>answers.push(data[bpfPhraseName(scope,i)]));
   }
   if(typeof bpfPanels==='function')for(const panel of bpfPanels(page,row)){
    for(const entry of panel.entries||[])answers.push(data[entry.name]);
    if(panel.checklist&&typeof bpfChecklistSelected==='function')for(const answer of ['0','1'])if(bpfChecklistSelected(page,row,panel,answer)?.length)answers.push(answer);
   }
   if(answers.some(answer=>answer==='0'||answer==='1'))group.assessed=true;
   if(answers.includes('0'))group.topics.add(topics[row.code]||'requisitos avaliados no processo');
  }
 }
 return [...groups.values()].filter(group=>group.assessed).map(group=>{
  const list=[...group.topics],name=group.name.replace(/^(\d+(?:\.\d+)*)\s+/,'$1 — ');
  const phrase=list.length
   ?'Foram identificadas inadequações nos seguintes aspectos: '+(list.length>1?list.slice(0,-1).join(', ')+' e '+list[list.length-1]:list[0])+'.'
   :'Nas verificações registradas, não foram assinaladas inadequações.';
  return name+': '+phrase;
 });
}

const quantKey='BPF_ConclusaoQuantitativoProcessos';
function quantitativeSelected(){return state()?.[quantKey]==='On';}
function processQuantitative(){
 const data=state();
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

function summarySelected(){
 return state()?.[summaryKey]!=='Off';
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
 return [original,(summarySelected()?processSummary().join('\n'):''),(quantitativeSelected()?processQuantitative().join('\n'):''),...sentences.filter((_,i)=>checks[i])].filter(Boolean).join('\n\n');
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
   const summaryLabel=document.createElement('label');summaryLabel.style.cssText='display:flex;align-items:center;gap:5px;margin:3px 0;cursor:pointer';
   const summaryInput=document.createElement('input');summaryInput.type='checkbox';summaryInput.dataset.bpfConclusionSummary='';summaryInput.style.margin='0';
   summaryInput.onchange=()=>{const data=state();if(!data)return;data[summaryKey]=summaryInput.checked?'On':'Off';if(typeof changed==='function')changed();};
   summaryLabel.append(summaryInput,document.createTextNode('Incluir síntese por processo'));
   const preview=document.createElement('button');preview.type='button';preview.textContent='Ver síntese';preview.style.cssText='margin-left:auto;padding:2px 6px;border:1px solid #a9c6d8;border-radius:4px;background:white;color:#12324a;cursor:pointer;font:inherit';
   preview.onclick=()=>{
    const dialog=document.createElement('dialog');dialog.style.cssText='width:min(92vw,760px);max-height:85vh;overflow:auto;padding:20px;border:1px solid #177693;border-radius:8px;color:#12324a';
    const heading=document.createElement('h2');heading.textContent='Síntese geral dos processos';
    const body=document.createElement('div');body.style.cssText='white-space:pre-wrap;line-height:1.5';body.textContent=processSummary().join('\n\n')||'Nenhum processo avaliado.';
    const close=document.createElement('button');close.type='button';close.textContent='Fechar';close.onclick=()=>dialog.close();
    dialog.append(heading,body,close);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();
   };
   summaryLabel.append(preview);box.prepend(summaryLabel);
   const quantLabel=document.createElement('label');quantLabel.style.cssText='display:flex;align-items:center;gap:5px;margin:3px 0;cursor:pointer';
   const quantInput=document.createElement('input');quantInput.type='checkbox';quantInput.dataset.bpfConclusionQuantitative='';quantInput.style.margin='0';
   quantInput.onchange=()=>{const data=state();if(!data)return;data[quantKey]=quantInput.checked?'On':'Off';if(typeof changed==='function')changed();};
   quantLabel.append(quantInput,document.createTextNode('Incluir quantitativo de NC por processo'));
   const quantPreview=document.createElement('button');quantPreview.type='button';quantPreview.textContent='Ver quantitativo';quantPreview.style.cssText=preview.style.cssText;
   quantPreview.onclick=()=>{
    const dialog=document.createElement('dialog');dialog.style.cssText='width:min(92vw,760px);max-height:85vh;overflow:auto;padding:20px;border:1px solid #177693;border-radius:8px;color:#12324a';
    const heading=document.createElement('h2');heading.textContent='Quantitativo de não conformidades por processo';
    const body=document.createElement('div');body.style.cssText='white-space:pre-wrap;line-height:1.5';body.textContent=processQuantitative().join('\n')||'Nenhuma não conformidade registrada.';
    const close=document.createElement('button');close.type='button';close.textContent='Fechar';close.onclick=()=>dialog.close();
    dialog.append(heading,body,close);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();
   };
   quantLabel.append(quantPreview);summaryLabel.after(quantLabel);
   page.append(box);
 }
 const checks=selected();
 box.querySelector('[data-bpf-conclusion-summary]').checked=summarySelected();
 box.querySelector('[data-bpf-conclusion-quantitative]').checked=quantitativeSelected();
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