(() => {
'use strict';
if(window.bpfConclusaoNC)return;
const field='CONSIDERAÇÕES FINAIS  AVALIAÇÃO DE RISCORow1_2';
const sentences=[
 'O estabelecimento deverá sanar todas as não conformidades registradas no Guia de Avaliação de Risco Sanitário.',
 'A Vigilância Sanitária Municipal adotará as medidas sanitárias cabíveis.'
];
const selectionKey='BPF_ConclusaoFrasesSelecionadas';
const infractionsKey='BPF_ConclusaoInfracoes';
// Exemplos de enquadramento, não imputações automáticas. Fonte: art. 10 da
// Lei Federal 6.437/1977 (texto consolidado, Presidência da República).
const infractions=[
 ['I','Funcionamento irregular do estabelecimento','o funcionamento do estabelecimento sem licenciamento sanitário exigível'],
 ['IV','Uso de insumo ou saneante vencido','a utilização de produto com prazo de validade expirado, em desacordo com a legislação sanitária aplicável'],
 ['IV','Descumprimento das Boas Práticas — RDC nº 173/2006','o descumprimento dos requisitos de Boas Práticas da RDC nº 173/2006 constatado na inspeção'],
 ['IV','Presença de vetores e pragas urbanas','a presença de vetores ou pragas urbanas nas áreas de produção, em desacordo com os requisitos de controle integrado de pragas aplicáveis'],
 ['IV','Descumprimento dos padrões microbiológicos — IN Anvisa nº 161/2022','o descumprimento dos padrões microbiológicos aplicáveis previstos na IN Anvisa nº 161/2022, em conjunto com a RDC nº 724/2022, conforme resultado analítico identificado'],
 ['IV','Produção, armazenamento ou uso irregular','a produção ou o armazenamento de produtos em desacordo com a legislação sanitária aplicável'],
 ['X','Obstrução da fiscalização','o impedimento ou a dificuldade imposta à ação da fiscalização sanitária'],
 ['XV','Rotulagem irregular','a rotulagem de alimentos ou bebidas em desacordo com as normas sanitárias aplicáveis'],
 ['XVI','Alteração de processo sem autorização exigível','a alteração do processo de fabricação sujeito a controle sanitário sem a autorização exigível'],
 ['XVII','Reaproveitamento indevido de embalagens','o reaproveitamento de embalagens de saneantes para acondicionar alimentos ou bebidas'],
 ['XVIII','Produto vencido exposto à venda ou entregue ao consumo','a exposição à venda ou entrega ao consumo de produto com prazo de validade expirado'],
 ['XVIII','Alteração indevida de validade','a aposição de nova data de validade após o vencimento do produto'],
 ['XIX','Falta de assistência de responsável técnico habilitado','a industrialização de produtos de interesse sanitário sem assistência de responsável técnico legalmente habilitado'],
 ['XXVIII','Fraude, falsificação ou adulteração','a fraude, falsificação ou adulteração de produto de interesse sanitário'],
 ['XXIX','Descumprimento de outra norma sanitária','o descumprimento de norma legal ou regulamentar de proteção à saúde, devidamente identificada'],
 ['XXIX','Descumprimento da Portaria SUVISA nº 4.325/2025','o descumprimento de exigência sanitária prevista na Portaria SUVISA nº 4.325/2025, conforme o dispositivo e o fato especificados'],
 ['XXXI','Descumprimento de Termo de Interdição','o descumprimento do Termo de Interdição expedido pela autoridade sanitária competente'],
 ['XXXI','Descumprimento de Termo de Intimação','o descumprimento da determinação sanitária constante do Termo de Intimação'],
 ['XXXI','Descumprimento de ato da autoridade sanitária','o descumprimento de determinação formal da autoridade sanitária competente']
];
function savedInfractions(){try{const a=JSON.parse(state()?.[infractionsKey]||'[]');return Array.isArray(a)?a.filter(x=>x&&typeof x.fact==='string'&&infractions.some(p=>p[0]===x.inciso)):[];}catch(e){return [];}}
function infractionSentence(record){
 const fact=record.fact.trim().replace(/[.;]+$/,'');
 const item=String(record.item||'').trim(),basis=String(record.basis||'').trim();
 const references=[item?'item '+item+' do Guia de Avaliação de Risco':'',basis].filter(Boolean);
 return 'Considerando '+fact+(references.length?' ('+references.join('; ')+')':'')+', o que caracteriza a infração sanitária prevista no artigo 10, inciso '+record.inciso+', da Lei Federal nº 6.437/1977.';
}
function openInfractions(){
 const dialog=document.createElement('dialog');dialog.style.cssText='width:min(94vw,780px);max-height:88vh;overflow:auto;padding:18px;border:1px solid #177693;border-radius:8px;color:#12324a;box-sizing:border-box;font:15px/1.4 Arial,sans-serif';
 const heading=document.createElement('h2');heading.textContent='Infrações sanitárias — Lei Federal nº 6.437/1977';
 const instruction=document.createElement('p');instruction.textContent='Marque as infrações constatadas, descreva os fatos e confira o enquadramento. A interdição é medida sanitária, não uma infração por si só; o seu descumprimento pode se enquadrar no inciso XXXI. Para uso de insumo vencido, avalie o inciso IV; para exposição à venda ou entrega ao consumo de produto vencido, o XVIII. Nenhuma infração é incluída automaticamente.';
 const source=document.createElement('a');source.href='https://www.planalto.gov.br/ccivil_03/leis/l6437.htm';source.target='_blank';source.rel='noopener noreferrer';source.textContent='Consultar texto oficial da lei';
 const label=(caption,control)=>{const el=document.createElement('label');el.style.cssText='display:block;margin:10px 0';control.style.cssText='display:block;width:100%;box-sizing:border-box;padding:6px;margin-top:4px;font:inherit';el.append(document.createTextNode(caption),control);return el;};
 const list=document.createElement('div');const chosen=new Map();
 for(const r of savedInfractions()){const index=typeof r.preset==='string'?infractions.findIndex(p=>p[1]===r.preset):Number.isInteger(r.preset)?r.preset:infractions.findIndex(p=>p[0]===r.inciso);if(infractions[index])chosen.set(index,{...r,preset:infractions[index][1]});}
 const button=(caption,click)=>{const el=document.createElement('button');el.type='button';el.textContent=caption;el.style.cssText='padding:6px 10px;margin:4px;border:1px solid #a9c6d8;border-radius:5px;background:#eef6fa;color:#12324a;font:inherit;cursor:pointer';el.onclick=click;return el;};
 for(const [i,p] of infractions.entries()){
  const row=document.createElement('fieldset');row.style.cssText='margin:8px 0;padding:10px;border:1px solid #b8ccd7;border-radius:5px';
  const check=document.createElement('input');check.type='checkbox';check.checked=chosen.has(i);const caption=document.createElement('label');caption.style.cssText='display:flex;gap:8px;align-items:flex-start;font-weight:bold';caption.append(check,document.createTextNode(p[1]+' — inciso '+p[0]));row.append(caption);
  const details=document.createElement('div');details.hidden=!check.checked;
  const fact=document.createElement('textarea');fact.rows=3;fact.value=chosen.get(i)?.fact||p[2];
  const item=document.createElement('input');item.placeholder='Ex.: 4.5.3';item.value=chosen.get(i)?.item||'';
  const basis=document.createElement('input');basis.placeholder='Norma, dispositivo ou número do termo';basis.value=chosen.get(i)?.basis||'';
  const preview=document.createElement('p');preview.style.cssText='white-space:pre-wrap;padding:8px;background:#eef6fa;border:1px solid #b8ccd7';
  const refresh=()=>{const r={preset:p[1],inciso:p[0],fact:fact.value.trim(),item:item.value.trim(),basis:basis.value.trim()};if(check.checked)chosen.set(i,r);else chosen.delete(i);details.hidden=!check.checked;preview.textContent=r.fact?infractionSentence(r):'Descreva o fato constatado.';};
  check.onchange=refresh;for(const el of [fact,item,basis])el.oninput=refresh;
  details.append(label('Fato constatado (edite o exemplo)',fact),label('Item do guia, quando aplicável',item),label('Norma, dispositivo ou número do termo',basis),preview);row.append(details);list.append(row);refresh();
 }
 const commit=button('Salvar e incluir no relatório',()=>{const data=state();if(!data)return;const records=[...chosen.values()];if(records.some(r=>!r.fact)){alert('Descreva todos os fatos selecionados.');return;}data[infractionsKey]=JSON.stringify(records);data[summaryKey]='Off';if(typeof changed==='function')changed();if(typeof sync==='function')sync();update();dialog.close();});
 dialog.append(heading,instruction,source,list,button('Cancelar',()=>dialog.close()),commit);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();
}
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
 const inadequacoes=[],demais=[];
 for(const group of groups.values()){
  if(!group.assessed)continue;
  const list=[...group.topics],name=group.name.replace(/^(\d+(?:\.\d+)*)\s+/,'$1 — ');
  if(list.length)inadequacoes.push(name+': '+(list.length>1?list.slice(0,-1).join(', ')+' e '+list[list.length-1]:list[0])+'.');
  else demais.push(name+': nas verificações registradas, não foram assinaladas inadequações.');
 }
 return [...(inadequacoes.length?['Foram identificadas as seguintes inadequações nos processos:',...inadequacoes]:[]),...(demais.length?[inadequacoes.length?'Demais processos avaliados:':'Processos avaliados:',...demais]:[])];
}

function summarySelected(){
 return false;
}

function selected(){
 const data=state();
 try{const saved=JSON.parse(data?.[selectionKey]||'null');if(Array.isArray(saved))return sentences.map((_,i)=>saved.includes(i));}catch(e){}
 return sentences.map(()=>false);
}
function withoutSentences(text){
 return String(text||'').split(/\r?\n/).filter(line=>!sentences.includes(line.trim())).join('\n').trimEnd();
}
const autoEditKey='BPF_ConclusaoTextosEditados';
function autoMask(){return 'v34:'+selected().map(x=>x?'1':'0').join('')+':'+JSON.stringify(savedInfractions());}
function autoEdits(){try{return JSON.parse(state()?.[autoEditKey]||'{}')||{};}catch(e){return {};}}
function automaticText(){
 const edits=autoEdits(),mask=autoMask();
 if(typeof edits[mask]==='string')return edits[mask];
 const checks=selected();
 return [...savedInfractions().map(infractionSentence),...sentences.filter((_,i)=>checks[i])].filter(Boolean).join('\n\n');
}
function include(text){return [withoutSentences(text),automaticText()].filter(Boolean).join('\n\n');}
function fitConclusionText(element,pageWidth){
 if(!element||!element.clientWidth||!element.clientHeight)return 8*pageWidth/595.32;
 const max=8*pageWidth/595.32,min=.35*pageWidth/595.32;
 let size=max;element.style.fontSize=size+'px';
 element.style.overflow='hidden';element.style.scrollbarWidth='none';
 while(size>min&&(element.scrollHeight>element.clientHeight+1||element.scrollWidth>element.clientWidth+1)){
  size=Math.max(min,size-.25);element.style.fontSize=size+'px';
 }
 return size;
}
function saveCombinedConclusion(el){
 const data=state();if(!data)return;
 const text=el.value,oldManual=el.bpfManual||'',oldAuto=el.bpfAuto||'';
 let manual=text,auto='';
 if(oldAuto){
  const separator=oldManual?'\n\n':'';
  if(text.endsWith(separator+oldAuto)){manual=text.slice(0,text.length-separator.length-oldAuto.length);auto=oldAuto;}
  else if(oldManual&&text.startsWith(oldManual+separator)){manual=oldManual;auto=text.slice(oldManual.length+separator.length);}
  else if(!oldManual){manual='';auto=text;}
  else{
   const old=el.bpfPrevious||oldManual+separator+oldAuto;
   let prefix=0,suffix=0;
   while(prefix<old.length&&prefix<text.length&&old[prefix]===text[prefix])prefix++;
   while(suffix<old.length-prefix&&suffix<text.length-prefix&&old[old.length-1-suffix]===text[text.length-1-suffix])suffix++;
   const boundary=oldManual.length+separator.length;
   const cut=Math.max(0,Math.min(text.length,old.length-suffix<=boundary?boundary+text.length-old.length:prefix>=boundary?boundary:text.length-suffix));
   manual=text.slice(0,cut).replace(/\n{1,2}$/,'');auto=text.slice(cut);
  }
 }
 data[field]=manual;
 if(auto!==oldAuto){const edits=autoEdits();edits[autoMask()]=auto;data[autoEditKey]=JSON.stringify(edits);}
 el.bpfManual=manual;el.bpfAuto=auto;el.bpfPrevious=text;el.bpfModel=include(manual);
 if(typeof changed==='function')changed();
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
   box.style.cssText='position:absolute;z-index:6;left:7.4%;width:85%;bottom:100%;margin-bottom:6px;box-sizing:border-box;padding:.5% 1%;border:1px solid #b8ccd7;background:#f3f8fa;color:#153c52;font:clamp(6px,1.25cqw,14px)/1.25 Arial,sans-serif;white-space:normal;pointer-events:auto';
   box.setAttribute('role','group');box.setAttribute('aria-label','Frases de conclusão');
   const title=document.createElement('strong');title.textContent='Incluir no relatório:';box.append(title);
   sentences.forEach((sentence,i)=>{
    const label=document.createElement('label');label.style.cssText='display:flex;align-items:flex-start;gap:5px;margin:3px 0;cursor:pointer';
    const input=document.createElement('input');input.type='checkbox';input.dataset.bpfConclusionIndex=String(i);input.style.cssText='margin:0;flex:none';
    input.onchange=()=>{
     const data=state();if(!data)return;
     data[selectionKey]=JSON.stringify([...box.querySelectorAll('input[data-bpf-conclusion-index]:checked')].map(item=>Number(item.dataset.bpfConclusionIndex)));
     data[field]=withoutSentences(data[field]);
     if(typeof changed==='function')changed();if(typeof sync==='function')sync();
    };
    label.append(input,document.createTextNode(sentence));box.append(label);
   });
   const infractionBar=document.createElement('div');infractionBar.style.cssText='display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin:3px 0';
   const preview=document.createElement('button');preview.type='button';preview.dataset.bpfConclusionInfractions='';preview.style.cssText='padding:2px 6px;border:1px solid #a9c6d8;border-radius:4px;background:white;color:#12324a;cursor:pointer;font:inherit';preview.onclick=openInfractions;
   const restore=document.createElement('button');restore.type='button';restore.textContent='Restaurar texto automático';restore.style.cssText=preview.style.cssText;restore.onclick=()=>{const data=state();if(!data)return;const edits=autoEdits();delete edits[autoMask()];data[autoEditKey]=JSON.stringify(edits);if(typeof changed==='function')changed();update();};infractionBar.append(preview,restore);box.prepend(infractionBar);
   page.append(box);
   const automatic=document.createElement('textarea');automatic.spellcheck=false;automatic.placeholder='Digite ou edite as considerações finais';automatic.oninput=()=>saveCombinedConclusion(automatic);automatic.dataset.bpfConclusionAutomatic='';automatic.setAttribute('aria-label','Considerações finais / avaliação do risco');automatic.style.cssText='position:absolute;z-index:2;box-sizing:border-box;padding:1px 3px;resize:none;overflow:hidden;scrollbar-width:none;white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid #9ab4c6;background:#f5fafc;color:black;font:1.344cqw/1.12 Arial,sans-serif';page.append(automatic);
   const formatted=document.createElement('div');formatted.dataset.bpfConclusionFormatted='';formatted.tabIndex=0;formatted.setAttribute('role','button');formatted.setAttribute('aria-label','Editar considerações finais');formatted.style.cssText=automatic.style.cssText+';z-index:3;cursor:text';
   const edit=()=>{formatted.hidden=true;automatic.style.visibility='visible';automatic.focus();};formatted.onclick=edit;formatted.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();edit();}};
   automatic.onfocus=()=>{formatted.hidden=true;automatic.style.visibility='visible';};automatic.onblur=()=>{update();};page.append(formatted);
 }
 const checks=selected();
 box.querySelector('[data-bpf-conclusion-infractions]').textContent='Inserir infrações sanitárias ('+savedInfractions().length+')';
 for(const input of box.querySelectorAll('input[data-bpf-conclusion-index]'))input.checked=checks[Number(input.dataset.bpfConclusionIndex)];
 box.hidden=false;
 const automatic=page.querySelector('[data-bpf-conclusion-automatic]');
 const formatted=page.querySelector('[data-bpf-conclusion-formatted]');
 const editor=page.querySelector('textarea[data-field="'+CSS.escape(field)+'"]');
 const manual=withoutSentences(state()?.[field]),auto=automaticText(),body=include(manual);
 if(automatic&&automatic.bpfModel!==body){
  automatic.value=body;automatic.bpfManual=manual;automatic.bpfAuto=auto;automatic.bpfPrevious=body;automatic.bpfModel=body;
 }
 if(automatic&&editor){
  const [left,bottom,right,top]=widget.rect,[width,height]=widget.size;
  editor.style.display='none';
  Object.assign(automatic.style,{left:100*left/width+'%',width:100*(right-left)/width+'%',top:100*(height-top)/height+'%',height:100*(top-bottom)/height+'%'});
  if(formatted)Object.assign(formatted.style,{left:automatic.style.left,width:automatic.style.width,top:automatic.style.top,height:automatic.style.height});
 }
 if(page.classList.contains('active')){
  fitConclusionText(automatic,page.clientWidth);
  if(formatted){
   const editing=document.activeElement===automatic;formatted.hidden=editing;automatic.style.visibility=editing?'visible':'hidden';
   if(formatted.bpfText!==body){const fragment=document.createDocumentFragment();body.split('\n').forEach((line,i)=>{if(i)fragment.append(document.createTextNode('\n'));const prefix=line.match(/^Considerando\b/i)?.[0];if(prefix){const strong=document.createElement('strong');strong.textContent=prefix;fragment.append(strong,document.createTextNode(line.slice(prefix.length)));}else fragment.append(document.createTextNode(line));});formatted.replaceChildren(fragment);formatted.dataset.empty=body?'0':'1';formatted.bpfText=body;}
   let size=parseFloat(automatic.style.fontSize)||8*page.clientWidth/595.32;formatted.style.fontSize=size+'px';
   while(!editing&&size>.35*page.clientWidth/595.32&&formatted.scrollHeight>formatted.clientHeight+1){size=Math.max(.35*page.clientWidth/595.32,size-.25);formatted.style.fontSize=size+'px';}
  }
  const margin=(box.offsetHeight+12)+'px';
  if(page.style.marginTop!==margin)page.style.marginTop=margin;
 }
}
window.bpfConclusaoNC={hasNC,include,field,infractionSentence,savedInfractions};
function install(){
 let queued=false;
 function schedule(){
  if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;update()});}
 }
 const style=document.createElement('style');
 style.textContent='@media screen{[data-bpf-conclusion-formatted][data-empty="1"]::before{content:"Toque para editar as considerações finais";color:#607d8b}}@media print{[data-bpf-conclusao-nc],[data-bpf-conclusion-automatic]{display:none!important}[data-bpf-conclusion-formatted]{display:block!important;visibility:visible!important}.page{margin-top:0!important}}';
 document.head.append(style);
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
 window.addEventListener('resize',schedule);
 document.addEventListener('input',schedule,true);
 document.addEventListener('change',schedule,true);
 schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
