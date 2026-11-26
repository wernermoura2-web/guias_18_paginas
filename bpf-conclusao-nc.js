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
 ['XXIX','Descumprimento das Boas Práticas — RDC nº 173/2006','o descumprimento dos requisitos de Boas Práticas da RDC nº 173/2006 constatado na inspeção'],
 ['XXIX','Presença de vetores e pragas urbanas','a presença de vetores ou pragas urbanas nas áreas de produção, em desacordo com os requisitos de controle integrado de pragas aplicáveis'],
 ['XXIX','Descumprimento dos padrões microbiológicos — IN Anvisa nº 161/2022','o descumprimento dos padrões microbiológicos aplicáveis previstos na IN Anvisa nº 161/2022, em conjunto com a RDC nº 724/2022, conforme resultado analítico identificado'],
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
 ['XXXI','Descumprimento de ato da autoridade sanitária','o descumprimento de determinação formal da autoridade sanitária competente'],
 ['IV','Insumo, embalagem ou saneante irregular','a utilização de insumo, embalagem ou saneante em desacordo com a legislação sanitária aplicável, identificando o produto e a irregularidade'],
 ['XXIX','Descumprimento de padrões de composição — RDC nº 717/2022','o descumprimento dos requisitos de composição e qualidade aplicáveis à água envasada, conforme o dispositivo e a evidência analítica identificados'],
 ['XXIX','Falha de controle de qualidade, amostragem ou medidas corretivas','o descumprimento dos requisitos sanitários de controle de qualidade, amostragem ou adoção e documentação de medidas corretivas, conforme a norma e o dispositivo especificados'],
 ['XXXI','Descumprimento de determinação de apreensão em depósito ou recolhimento','o descumprimento da determinação formal de apreensão em depósito ou recolhimento expedida pela autoridade sanitária competente'],
 ['V','Propaganda irregular','a divulgação de propaganda de produto sujeito à vigilância sanitária em desacordo com a legislação aplicável'],
 ['XXIII','Transporte irregular por empresa transportadora','o descumprimento de exigência sanitária aplicável à empresa de transporte, conforme o dispositivo e o fato especificados'],
 ['XXIV','Condições sanitárias do imóvel','o descumprimento de exigência sanitária relativa ao imóvel pelo proprietário ou possuidor legal, conforme o dispositivo e o fato especificados'],
 ['IV','Utilização de produto ou insumo sem registro na Anvisa','a utilização de produto ou insumo sem registro na Anvisa, quando legalmente exigido, identificando o produto, a irregularidade e a evidência constatada']
];
function savedInfractions(){try{const a=JSON.parse(state()?.[infractionsKey]||'[]');return Array.isArray(a)?a.filter(x=>x&&typeof x.fact==='string'&&infractions.some(p=>p[0]===x.inciso)):[];}catch(e){return [];}}
function infractionSentence(record){
 const fact=record.fact.trim().replace(/[.;]+$/,'');
 const item=String(record.item||'').trim(),basis=String(record.basis||'').trim();
 const references=[item?'item '+item+' do Guia de Avaliação de Risco':'',basis].filter(Boolean);
 return 'Considerando '+fact+(references.length?' ('+references.join('; ')+')':'')+', o que caracteriza a infração sanitária prevista no artigo 10, inciso '+record.inciso+', da Lei Federal nº 6.437/1977.';
}
// Suggestions are derived from the current inspection only. They are not
// findings of liability and never modify the inspector's stored selection.
function suggestedInfractions(){
 const data=state();if(!data||typeof BPF_PHRASES==='undefined')return [];
 const grouped=new Map();
 const add=(title,row,evidence,reason)=>{
  const preset=infractions.findIndex(p=>p[1]===title);if(preset<0)return;
  let entry=grouped.get(preset);if(!entry){entry={preset,title,inciso:infractions[preset][0],items:[],evidence:[],reason};grouped.set(preset,entry);}
  if(!entry.items.includes(row.code))entry.items.push(row.code);
  if(evidence&&!entry.evidence.some(e=>e.code===row.code&&e.text===evidence))entry.evidence.push({code:row.code,text:evidence});
 };
 for(const page of BPF_PHRASES){
  if(typeof bpfReservoirIsLinked==='function'&&bpfReservoirIsLinked(page.page))continue;
  if(typeof bpfReservoirExcluded==='function'&&bpfReservoirExcluded(page.page))continue;
  for(const row of page.rows){
   const code=row.code;
   const summary=String(data['BPF_Summary_'+page.page+'_'+code]||'').trim();
   const nc=row.scopes.some(s=>data[s.name]==='0'||s.phrases.some((_,i)=>typeof bpfPhraseName==='function'&&data[bpfPhraseName(s,i)]==='0'))||
    (typeof bpfPanels==='function'&&bpfPanels(page,row).some(p=>p.entries?.some(e=>data[e.name]==='0')||(p.checklist&&typeof bpfChecklistSelected==='function'&&bpfChecklistSelected(page,row,p,'0')?.length)));
   if(!nc)continue;
   const evidence=summary||'Item marcado como não conforme; conferir as evidências registradas no guia.';
   add('Descumprimento das Boas Práticas — RDC nº 173/2006',row,evidence,'Confira o requisito específico e a evidência de cada item.');
   if(code==='4.5.3'||code==='4.10.1'){
    if(/fora do prazo de validade|validade vencid[ao]|prazo de validade expirado|produto vencido|saneante vencido/i.test(summary))
     add('Uso de insumo ou saneante vencido',row,evidence,'Confirme o uso ou armazenamento irregular, distinguindo produto segregado e reprovado.');
    if(/não (?:está|estava) regularizado|sem registro|não possu[ií]a? registro|não possui registro|não regularizado/i.test(summary))
     add('Utilização de produto ou insumo sem registro na Anvisa',row,evidence,'Confirme a exigência legal de registro e a utilização; mera presença de produto reprovado não comprova uso.');
    if(/finalidade de uso.*não corresponde/i.test(summary))
     add('Insumo, embalagem ou saneante irregular',row,evidence,'Confirme o uso incompatível com a finalidade autorizada.');
   }
   if(/(?:sem licença sanitária|licença sanitária vencida|alvará sanitário vencido)/i.test(summary))
    add('Funcionamento irregular do estabelecimento',row,evidence,'Confira a exigência, a validade da licença e a situação de funcionamento.');
   if(/(?:rotulagem irregular|rótulo.{0,80}(?:em desacordo|incorreto|irregular))/i.test(summary))
    add('Rotulagem irregular',row,evidence,'Confira a identificação do rótulo e a norma infringida.');
   if(/(?:sem responsável técnico|não possui responsável técnico|responsável técnico não habilitado)/i.test(summary))
    add('Falta de assistência de responsável técnico habilitado',row,evidence,'Ausência durante a inspeção, isoladamente, não comprova falta de assistência técnica.');
   if(/(?:presença de (?:vetores|pragas)|constatad[ao]s? (?:vetores|pragas))/i.test(summary))
    add('Presença de vetores e pragas urbanas',row,evidence,'Confira a constatação e a exigência sanitária aplicável.');
   if(/(?:expost[oa]s? à venda|entregues? ao consumo).{0,100}(?:vencid[oa]s?|validade expirad[ao])/i.test(summary))
    add('Produto vencido exposto à venda ou entregue ao consumo',row,evidence,'Confirme a conduta específica prevista no inciso XVIII.');
   if(/descumprimento.{0,100}termo de interdição/i.test(summary))
    add('Descumprimento de Termo de Interdição',row,evidence,'Confira a vigência do termo e o ato de descumprimento.');
   if(/^4\.10\.[2346]$/.test(code))add('Descumprimento da Portaria SUVISA nº 4.325/2025',row,evidence,'Confira as obrigações aplicáveis e o dispositivo específico da Portaria.');
   if(/^4\.10\.[12346]$/.test(code))add('Falha de controle de qualidade, amostragem ou medidas corretivas',row,evidence,'Confira os registros, a exigência aplicável e a constatação.');
   if(code==='4.10.3'||code==='4.10.6'){
    if(/resultado.{0,80}(?:insatisfat[oó]rio|fora do padr[aã]o)|crescimento de col[oô]nias|crescimento microbiano|resultado.{0,80}positivo/i.test(summary))
     add('Descumprimento dos padrões microbiológicos — IN Anvisa nº 161/2022',row,evidence,'Verifique se há resultado analítico confirmado, identificação do lote e critério microbiológico aplicável. Indício presuntivo não basta por si só.');
   }
   if(code==='4.10.5')add('Descumprimento de padrões de composição — RDC nº 717/2022',row,evidence,'Diferencie ausência de laudo de composição comprovadamente fora do padrão.');
   if(/descumprimento.{0,100}termo de intimação/i.test(summary))add('Descumprimento de Termo de Intimação',row,evidence,'Confira o termo, a ciência, a obrigação e o prazo.');
  }
 }
 const manual=String(data[field]||'');
 if(/(?:descumprimento.{0,100}termo de intimação|não adequou.{0,140}prazo)/i.test(manual))
  add('Descumprimento de Termo de Intimação',{code:'Considerações finais'},manual,'Confira o termo, a ciência, as obrigações não cumpridas e o prazo.');
 return [...grouped.values()];
}
function openInfractions(){
 const dialog=document.createElement('dialog');dialog.style.cssText='width:min(94vw,780px);max-height:88vh;overflow:auto;padding:18px;border:1px solid #177693;border-radius:8px;color:#12324a;box-sizing:border-box;font:15px/1.4 Arial,sans-serif';
 const heading=document.createElement('h2');heading.textContent='Infrações sanitárias — Lei Federal nº 6.437/1977';
 const instruction=document.createElement('p');instruction.textContent='Marque as infrações constatadas, descreva os fatos, identifique a norma e o dispositivo e confira o enquadramento. BPF, padrões microbiológicos e demais exigências sanitárias: avalie o inciso XXIX, sem prejuízo de tipos específicos. Uso de insumo vencido: avalie o IV; produto vencido exposto à venda ou entregue ao consumo: XVIII. Interdição, apreensão e recolhimento são medidas sanitárias; o descumprimento de determinação formal pode se enquadrar no XXXI. Nenhuma infração é incluída automaticamente. Ao revisar e salvar uma seleção antiga, confira os incisos atualizados; o relatório anterior permanece inalterado até a confirmação.';
 const source=document.createElement('a');source.href='https://www.planalto.gov.br/ccivil_03/leis/l6437.htm';source.target='_blank';source.rel='noopener noreferrer';source.textContent='Consultar texto oficial da lei';
 const label=(caption,control)=>{const el=document.createElement('label');el.style.cssText='display:block;margin:10px 0';control.style.cssText='display:block;width:100%;box-sizing:border-box;padding:6px;margin-top:4px;font:inherit';el.append(document.createTextNode(caption),control);return el;};
 const list=document.createElement('div');const chosen=new Map(),controls=new Map();
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
  controls.set(i,{check,fact,item,basis,refresh,row});
  details.append(label('Fato constatado (edite o exemplo)',fact),label('Item do guia, quando aplicável',item),label('Norma, dispositivo ou número do termo',basis),preview);row.append(details);list.append(row);refresh();
 }
 const commit=button('Salvar e incluir no relatório',()=>{const data=state();if(!data)return;const records=[...chosen.values()];if(records.some(r=>!r.fact)){alert('Descreva todos os fatos selecionados.');return;}data[infractionsKey]=JSON.stringify(records);data[summaryKey]='Off';if(typeof changed==='function')changed();if(typeof sync==='function')sync();update();dialog.close();});
 const suggestions=document.createElement('section');
 const sh=document.createElement('h3');sh.textContent='Sugestões a partir do guia preenchido';suggestions.append(sh);
 const proposals=suggestedInfractions();
 if(!proposals.length){const p=document.createElement('p');p.textContent='Nenhuma sugestão baseada nos itens não conformes disponíveis. Você ainda pode selecionar uma modalidade abaixo.';suggestions.append(p);}
 for(const proposal of proposals){
  const card=document.createElement('details');card.style.cssText='padding:8px;margin:4px 0;background:#eef6fa;border:1px solid #b8ccd7;border-radius:5px';
  const title=document.createElement('summary');title.textContent=proposal.title+' — inciso '+proposal.inciso+' · '+proposal.items.join(', ');card.append(title);
  const reason=document.createElement('p');reason.textContent=proposal.reason;card.append(reason);
  for(const e of proposal.evidence){const p=document.createElement('p');p.style.whiteSpace='pre-wrap';p.textContent=e.code+': '+e.text;card.append(p);}
  card.append(button('Selecionar para revisão',()=>{
   const c=controls.get(proposal.preset);if(!c)return;
   if(!c.check.checked){c.check.checked=true;c.item.value=proposal.items.filter(x=>/^\d/.test(x)).join(', ');c.refresh();}
   c.row.scrollIntoView({block:'nearest'});c.fact.focus();
  }));suggestions.append(card);
 }
 dialog.append(heading,instruction,source,suggestions,list,button('Cancelar',()=>dialog.close()),commit);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();
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
const autoEditKey='BPF_ConclusaoTextosEditados';
const legacyArchiveKey='BPF_ConclusaoTextosEditadosHistorico';
function generatedText(records,checks){
 return [...records.map(infractionSentence),...sentences.filter((_,i)=>checks[i])].filter(Boolean);
}
// The legacy combined textarea stored appended manual observations by
// selection mask. Recover those observations before changing any selection,
// while retaining the original drafts as an audit/recovery copy.
function recoverLegacyManual(){
 const data=state();if(!data)return;
 let drafts;try{drafts=JSON.parse(data[autoEditKey]||'{}');}catch(e){return;}
 if(!drafts||typeof drafts!=='object'||Array.isArray(drafts)||!Object.keys(drafts).length)return;
 const additions=[];
 for(const [mask,draft] of Object.entries(drafts)){
  if(typeof draft!=='string'||!draft.trim())continue;
  let remainder=draft;
  const match=mask.match(/^v34:([01]+):(.*)$/s);
  if(match){try{
   const records=JSON.parse(match[2]);
   if(Array.isArray(records))for(const generated of generatedText(records,Array.from(match[1],x=>x==='1'))){
    remainder=remainder.split(generated).join('');
   }
  }catch(e){}}
  for(const part of remainder.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean)){
   if(!String(data[field]||'').includes(part)&&!additions.includes(part))additions.push(part);
  }
 }
 if(additions.length)data[field]=[String(data[field]||'').trimEnd(),...additions].filter(Boolean).join('\n\n');
 let archive={};try{archive=JSON.parse(data[legacyArchiveKey]||'{}')||{};}catch(e){}
 data[legacyArchiveKey]=JSON.stringify({...archive,...drafts});
 data[autoEditKey]='{}';
 if(typeof changed==='function')changed();
}
function automaticText(){
 return generatedText(savedInfractions(),selected()).join('\n\n');
}
function include(text){return [String(text||'').trimEnd(),automaticText()].filter(Boolean).join('\n\n');}
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
function saveManualConclusion(el){
 const data=state();if(!data)return;
 data[field]=el.value;
 el.bpfManual=el.value;
 if(typeof changed==='function')changed();
}
function update(){
 recoverLegacyManual();
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
     if(typeof changed==='function')changed();if(typeof sync==='function')sync();
    };
    label.append(input,document.createTextNode(sentence));box.append(label);
   });
   const infractionBar=document.createElement('div');infractionBar.style.cssText='display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin:3px 0';
   const preview=document.createElement('button');preview.type='button';preview.dataset.bpfConclusionInfractions='';preview.style.cssText='padding:2px 6px;border:1px solid #a9c6d8;border-radius:4px;background:white;color:#12324a;cursor:pointer;font:inherit';preview.onclick=openInfractions;
   const editTip=document.createElement('span');editTip.textContent='As observações digitadas são independentes das infrações selecionadas.';infractionBar.append(preview,editTip);box.prepend(infractionBar);
   page.append(box);
   const automatic=document.createElement('textarea');automatic.spellcheck=false;automatic.placeholder='Digite suas observações e medidas adotadas. Para editar infrações, use o botão acima.';automatic.oninput=()=>saveManualConclusion(automatic);automatic.dataset.bpfConclusionAutomatic='';automatic.setAttribute('aria-label','Observações e medidas adotadas — texto manual');automatic.style.cssText='position:absolute;z-index:2;box-sizing:border-box;padding:1px 3px;resize:none;overflow:hidden;scrollbar-width:none;white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid #9ab4c6;background:#f5fafc;color:black;font:1.344cqw/1.12 Arial,sans-serif';page.append(automatic);
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
 const manual=String(state()?.[field]||''),body=include(manual);
 if(automatic&&automatic.bpfManual!==manual){
  automatic.value=manual;automatic.bpfManual=manual;
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
window.bpfConclusaoNC={hasNC,include,field,infractionSentence,savedInfractions,recoverLegacyManual,suggestedInfractions,saveManualConclusion};
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
