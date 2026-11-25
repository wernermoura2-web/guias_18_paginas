const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('bpf-captacao-conducao-consolidado.js','utf8');
const model=JSON.parse(fs.readFileSync('equipe.html','utf8').match(/const BPF_PHRASES=(.*?);\n/)[1]);
class Node{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.style={};this.className='';this.classList={add:()=>{}};this.value='';this.hidden=false;}
 append(...nodes){for(const n of nodes){if(n&&typeof n==='object')n.parentElement=this;this.children.push(n);}}
 prepend(...nodes){for(const n of nodes)if(n&&typeof n==='object')n.parentElement=this;this.children.unshift(...nodes);}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 setAttribute(){} addEventListener(type,fn){(this.listeners??={})[type]??=[];this.listeners[type].push(fn);} dispatchEvent(event){for(const fn of this.listeners?.[event.type]||[])fn(event);} add(n){this.append(n);}
 querySelector(s){if(s==='[data-bpf-sanitizer-reception]')return walk(this).find(n=>Object.hasOwn(n.dataset,'bpfSanitizerReception'))||null;return walk(this).find(n=>n.tagName===s.toUpperCase())||null;}
 querySelectorAll(s){return walk(this).filter(n=>s.split(',').some(tag=>n.tagName===tag.toUpperCase()));}
 set textContent(t){this.caption=t;this.children=[];} get textContent(){return (this.caption||'')+this.children.map(n=>typeof n==='string'?n:n.textContent).join('');}
}
const walk=n=>[n,...n.children.filter(x=>x&&typeof x==='object').flatMap(walk)];
const values={},phraseName=(s,i)=>s.name+'_'+i;
const document={createElement:t=>new Node(t),head:new Node('head'),getElementById:()=>null};
const scopeLabel=(p,s)=>(p.page===0?'Captação ':p.page===1?'Condução ':'Reservatório ')+s.col;
const ctx=vm.createContext({BPF_PHRASES:model,document,values,bpfPhraseName:phraseName,bpfScopeLabel:scopeLabel,bpfAnswerLabel:v=>v==='1'?'Sim':v==='0'?'Não':'',bpfGroupNoteName:(p,r,f,a)=>p.page+r.code+f.id+a,bpfUnifiedOption:(r,e)=>e.phrase.option||e.phrase.text,bpfAttachNoteTools(){},bpfInstallIndividualNC(){},bpfPopNAForced:()=>false,bpfApplyPopF2NA(){},changed(){},recalc(){},Event:class{},Option:class extends Node{constructor(t,v){super('option');this.textContent=t;this.value=v;}}});
vm.runInContext(source+'\nthis.water=bpfWaterCheck;',ctx);const water=ctx.water;water.preparePhrases();
const target={'4.1.3':[0,2],'4.2.2':[0,1],'4.2.7':[1],'4.2.8':[0,1],'4.2.9':[0,1],'4.3.2':[0,1,2],'4.3.3':[0,1],'4.3.4':[0,1],'4.3.5':[1]};
let count=0;
for(const [code,ids] of Object.entries(target)){
 const page=model.find(p=>p.rows.some(r=>r.code===code)),row=page.rows.find(r=>r.code===code);
 for(const id of ids){
  const indices=code==='4.3.3'?(id===0?[0,1,6,3,4,5]:[2,7]):[id];
  const panel={id,label:'F'+(id+1),entries:row.scopes.flatMap(s=>indices.filter(i=>s.phrases[i]).map(i=>({scope:s,index:i,name:phraseName(s,i),phrase:s.phrases[i]})))};
  const card=new Node('fieldset');assert(water.render(card,page,row,panel));count++;
  const nodes=walk(card),radios=nodes.filter(n=>n.tagName==='INPUT'&&n.dataset.bpfCompactAnswer);
  assert.equal(radios.length,2*row.scopes.length,code+' F'+(id+1)+' seleções gerais');
  assert.equal(nodes.filter(n=>n.tagName==='DETAILS').length,0,code+' F'+(id+1)+' não deve recolher caixas');
  const info=nodes.filter(n=>Object.hasOwn(n.dataset,'bpfInfoBox'));assert.equal(info.length,1,code+' F'+(id+1)+' seção comum');
  const first=radios[0];first.checked=true;first.onchange();assert.equal(values[panel.entries[0].name],'1');
  const no=radios[row.scopes.length];no.checked=true;no.onchange();assert.equal(values[panel.entries[0].name],'0');
  assert.equal(first.checked,false,'Sim e Não exclusivos');
  const sharedSelect=walk(info[0]).find(n=>n.tagName==='SELECT'&&n.children.some(o=>o.value==='1')&&n.children.some(o=>o.value==='0'));
  if(sharedSelect){sharedSelect.value='1';sharedSelect.onchange();assert.equal(values[panel.entries[0].name],'0','informação geral não altera a avaliação da unidade');assert(values['BPF_LineInfo_'+page.page+'_'+code.replace(/\./g,'_')+'_F'+(id+1)],'informação registrada uma única vez');}
  if(code==='4.1.3'&&id===2){
   const selects=walk(info[0]).filter(n=>n.tagName==='SELECT');assert.equal(selects.length,3);
   assert(selects.every(s=>s.disabled));first.checked=true;first.onchange();assert(selects.every(s=>!s.disabled));
   for(const select of selects){select.value='';select.onchange();assert(select.parentElement.children[0].textContent.startsWith('Os registros incluem '));assert(select.parentElement.children[0].textContent.endsWith('?'));select.value='0';select.onchange();assert(select.parentElement.children[0].textContent.startsWith('Os registros não incluem '));}
   no.checked=true;no.onchange();assert(selects.every(s=>s.disabled));assert(!JSON.stringify(water.report(page,row,panel,values)).includes('Os registros não incluem'));
  }
  if(code==='4.1.3'&&id===0){
   const select=walk(info[0]).find(n=>n.tagName==='SELECT'&&n.parentElement?.textContent.includes('Existe telemetria em linha?'));assert(select,'telemetria deve ter seletor Sim/Não');
   const line=select.parentElement,detail=walk(line).find(n=>n.className==='bpf-water-detail');assert(detail&&detail.hidden,'tipos fechados sem resposta');
   select.value='1';select.onchange();assert(line.textContent.includes('Existe telemetria em linha'));assert(!detail.hidden,'tipos abertos com Sim');
   select.value='0';select.onchange();assert(line.textContent.includes('Não existe telemetria em linha'));assert(detail.hidden,'tipos fechados com Não');
   assert.equal(values[panel.entries[0].name],'0','telemetria informativa não altera a avaliação');
  }
  if(['4.2.2','4.3.2'].includes(code)&&id===0){
   const selects=walk(info[0]).filter(n=>n.tagName==='SELECT'&&n.children.some(o=>o.value==='1')&&n.children.some(o=>o.value==='0'));
   assert.equal(selects.length,2,'certificado e declaração reunidos; nota fiscal separada');
   const [cert,nf]=selects;
   cert.value='';cert.onchange();assert(cert.parentElement.textContent.includes('Foi apresentado certificado / declaração de grau alimentício?'));
   nf.value='';nf.onchange();assert(nf.parentElement.textContent.includes('Foi apresentada a nota fiscal com as especificações do material?'));
   cert.value='0';cert.onchange();assert(cert.parentElement.textContent.includes('Não foi apresentado certificado / declaração de grau alimentício'));
   nf.value='1';nf.onchange();assert(nf.parentElement.textContent.includes('Foi apresentada a nota fiscal com as especificações do material'));
   const key='BPF_LineInfo_'+page.page+'_'+code.replace(/\./g,'_')+'_F1';
   values[key]=JSON.stringify({certificado:{answer:'0'},declaracao:{answer:'1'},'nota-fiscal':{answer:'0'}});
   const rebuilt=new Node('fieldset');water.render(rebuilt,page,row,panel);
   const migrated=walk(rebuilt).filter(n=>n.tagName==='SELECT'&&n.children.some(o=>o.value==='1')&&n.children.some(o=>o.value==='0'));
   assert.equal(migrated[0].value,'1','declaração apresentada conserva resposta positiva');
   assert.equal(migrated[1].value,'0','nota fiscal conserva resposta anterior');
  }
  if(code==='4.3.2'&&id===2){
   const select=walk(info[0]).find(n=>n.tagName==='SELECT'&&n.parentElement.textContent.includes('O reservatório possui escotilha de vidro no teto para inspeção visual?'));
   assert(select,'escotilha deve ter seletor Sim/Não');
   select.value='1';select.onchange();assert(select.parentElement.textContent.includes('Reservatório com escotilha de vidro no teto para inspeção visual'));
   select.value='0';select.onchange();assert(select.parentElement.textContent.includes('Reservatório sem escotilha de vidro no teto para inspeção visual'));
   assert(JSON.stringify(water.report(page,row,panel,values)).includes('Reservatório sem escotilha de vidro no teto para inspeção visual'));
  }
  if(code==='4.2.8'&&id===0){
   const select=walk(info[0]).find(n=>n.tagName==='SELECT'&&n.parentElement.textContent.includes('Realiza e registra a inspeção visual interna das tubulações?'));
   assert(select,'inspeção visual com seletor Sim/Não');
   select.value='1';select.onchange();assert(select.parentElement.textContent.includes('Realiza e registra a inspeção visual interna das tubulações'));
   select.value='0';select.onchange();assert(select.parentElement.textContent.includes('Não realiza e não registra a inspeção visual interna das tubulações'));
   assert(JSON.stringify(water.report(page,row,panel,values)).includes('Não realiza e não registra a inspeção visual interna das tubulações'));
   select.value='';select.onchange();assert(select.parentElement.textContent.includes('Realiza e registra a inspeção visual interna das tubulações?'));
  }
  if(code==='4.2.8'&&id===1){
   for(const caption of ['Possui registro de reparo das tubulações e conexões','Possui registros de passivação e/ou desincrustação']){
    const select=walk(info[0]).find(n=>n.tagName==='SELECT'&&n.parentElement.textContent.includes(caption));
    assert(select,caption+' — seletor Sim/Não');
    select.value='';select.onchange();assert(select.parentElement.textContent.includes(caption+'?'));
    select.value='1';select.onchange();assert(select.parentElement.textContent.includes(caption));
    select.value='0';select.onchange();const negative='Não '+caption.charAt(0).toLowerCase()+caption.slice(1);
    assert(select.parentElement.textContent.includes(negative));assert(JSON.stringify(water.report(page,row,panel,values)).includes(negative));
    select.value='';select.onchange();assert(select.parentElement.textContent.includes(caption+'?'));
   }
  }
  if(id===1&&['4.2.8','4.3.4','4.3.5'].includes(code)){
   const questions=code==='4.3.5'?['Adota procedimento para recirculação do sanitizante no tanque','Existe telemetria em linha']:['Realiza a revisão das operações de higienização e adota as medidas corretivas necessárias'];
   for(const question of questions){
    const select=walk(info[0]).find(n=>n.tagName==='SELECT'&&n.parentElement.children[0]?.textContent.includes(question));
    assert(select,code+' '+question);
    select.value='';select.onchange();assert(select.parentElement.children[0].textContent.endsWith('?'));
    select.value='1';select.onchange();assert(!select.parentElement.children[0].textContent.endsWith('?'));
    select.value='0';select.onchange();assert(select.parentElement.children[0].textContent.startsWith('Não '));
    assert(JSON.stringify(water.report(page,row,panel,values)).includes(select.parentElement.children[0].textContent));
   }
  }
  if(id===1||id===2){
   for(const select of walk(info[0]).filter(n=>n.tagName==='SELECT'&&n.children.some(o=>o.value==='1'&&o.textContent==='Sim')&&n.children.some(o=>o.value==='0'&&o.textContent==='Não'))){
    const previous=select.value;select.value='';select.onchange();
    assert(select.parentElement.children[0].textContent.endsWith('?'),code+' F2 pergunta com interrogação');
    select.value='1';select.onchange();assert(!select.parentElement.children[0].textContent.endsWith('?'));
    select.value='0';select.onchange();assert(!select.parentElement.children[0].textContent.endsWith('?'));
    select.value=previous;select.onchange();
   }
  }
  if(code==='4.2.9'&&id===0){
   assert(!info[0].textContent.includes('Possui POP referente às operações de higienização da canalização'));
   assert.equal(walk(info[0]).filter(n=>n.tagName==='SELECT').length,1);
  }
  if(code==='4.3.4'&&id===0){
   const selects=walk(info[0]).filter(n=>n.tagName==='SELECT');
   assert.equal(selects.length,1,'apenas frequência, sem pergunta repetida');
   assert(info[0].textContent.includes('Frequência da inspeção visual interna'));
   assert(selects[0].disabled,'Não bloqueia frequência');
   first.checked=true;first.onchange();assert(!selects[0].disabled);
   selects[0].value='Mensal';selects[0].dispatchEvent({type:'change'});
   assert(JSON.stringify(water.report(page,row,panel,values)).includes('Frequência da inspeção visual interna: Mensal'));
   no.checked=true;no.onchange();assert(selects[0].disabled);
   assert(!JSON.stringify(water.report(page,row,panel,values)).includes('Frequência da inspeção visual interna: Mensal'));
  }
  if(code!=='4.3.3'){water.apply(row,row.scopes[0],values);assert.equal(values[panel.entries[0].name],'0','recalcular mantém a escolha');}
  const report=water.report(page,row,panel,values);assert(report.some(r=>r.answer==='0'),code+' F'+(id+1)+' relatório NC');
  console.log(code,'F'+(id+1),'OK',radios.length,'seletores e uma seção comum');
 }
}
assert.equal(count,17);
// Conferir todos os F configurados com múltiplas unidades: somente um quadro geral.
let audited=0;
for(const p of model)for(const r of p.rows.filter(r=>r.scopes.length>1))for(let id=0;id<r.phrases.length;id++){
 const cfg=water.get(r,id);if(!cfg||cfg.inline||r.code==='4.3.3')continue;
 const information=cfg.checks.filter(c=>c.informationOnly||cfg.separateInformation&&!c.scopeAnswer);if(!information.length)continue;
 const panel={id,label:'F'+(id+1),entries:r.scopes.filter(s=>s.phrases[id]).map(s=>({scope:s,index:id,name:phraseName(s,id),phrase:s.phrases[id]}))};
 if(!panel.entries.length)continue;
 const card=new Node('fieldset');assert(water.render(card,p,r,panel));
 const box=walk(card).filter(n=>Object.hasOwn(n.dataset,'bpfInfoBox'));assert.equal(box.length,1,r.code+' F'+(id+1));
 assert.equal(box[0].children.filter(n=>n.className?.startsWith('bpf-water-unit')).length,1,r.code+' F'+(id+1)+' tem de ter apenas um quadro de informações gerais');
 audited++;
}
console.log('Auditoria de informações gerais:',audited,'F com múltiplas unidades, sem repetição');
// Reprodução da foto: um grupo preenchido, outro vazio e um terceiro divergente.
const receptionPage=model.find(p=>p.page===6),receptionRow=receptionPage.rows.find(r=>r.code==='4.5.3');
const receptionPanel={id:1,label:'F2',entries:receptionRow.scopes.map(s=>({scope:s,index:1,name:phraseName(s,1),phrase:s.phrases[1]}))};
const [first,second,third]=receptionPanel.entries,oldField=(e,k)=>'BPF_Recepcao_'+e.name+'_'+k,commonKey='BPF_LineInfo_6_4_5_3_F2';
values[oldField(first,'Identificacao')]='1';values[oldField(first,'Validade')]='0';values[oldField(first,'Regularizacao')]='0';values[oldField(first,'Finalidade')]='0';
values[oldField(third,'Regularizacao')]='1';
ctx.bpfSyncObservation=()=>{};
const receptionCard=new Node('fieldset');water.renderReception(receptionCard,receptionPage,receptionRow,receptionPanel);water.renderReception(receptionCard,receptionPage,receptionRow,receptionPanel);
const selects=walk(receptionCard).filter(n=>n.tagName==='SELECT');assert.equal(selects.length,4,'Somente quatro perguntas de saneantes, mesmo com três grupos');
assert.deepEqual(selects.map(n=>n.value),['1','0','','0']);assert(receptionCard.textContent.includes('Respostas anteriores divergentes'));
selects[2].value='1';selects[2].onchange();assert.equal(JSON.parse(values[commonKey]).Regularizacao,'1');assert.equal(values[oldField(first,'Regularizacao')],'0');assert.equal(values[oldField(third,'Regularizacao')],'1');
assert.equal(water.receptionSummary(receptionPage,receptionRow,receptionPanel,values).length,4,'Relatório com uma única afirmação por pergunta');
selects[0].value='';selects[0].onchange();const reopened=new Node('fieldset');water.renderReception(reopened,receptionPage,receptionRow,receptionPanel);assert.equal(walk(reopened).filter(n=>n.tagName==='SELECT')[0].value,'','Limpeza explícita não deve restaurar resposta legada');
console.log('4.5.3 F2: quadro único, migração de respostas anteriores, divergência preservada e relatório sem repetição');
// Captação: respostas por unidade de uma versão antiga devem preencher o quadro geral
// mesmo se já houver um JSON parcial do quadro geral.
const capturePage=model.find(p=>p.page===0),captureRow=capturePage.rows.find(r=>r.code==='4.1.3'),capturePanel={id:0,label:'F1',entries:captureRow.scopes.map(s=>({scope:s,index:0,name:phraseName(s,0),phrase:s.phrases[0]}))};
const captureKey='BPF_LineInfo_0_4_1_3_F1',legacyKey='BPF_FWater_'+capturePanel.entries[0].name;
values[captureKey]=JSON.stringify({'pop-registros':{answer:'1'}});values[legacyKey]=JSON.stringify({filtro:{answer:'1',frequency:'Mensal'}});
const captured=new Node('fieldset');water.render(captured,capturePage,captureRow,capturePanel);
const captureBox=walk(captured).find(n=>Object.hasOwn(n.dataset,'bpfInfoBox'));
assert.equal(captureBox.children.filter(n=>n.className?.startsWith('bpf-water-unit')).length,1);
const filterSelect=walk(captureBox).find(n=>n.tagName==='SELECT'&&n.parentElement?.textContent.includes('Possui filtro de ar microbiológico no poço'));
assert(filterSelect&&filterSelect.value==='1','Resposta de filtro legada deve ser preservada no quadro geral parcial');
assert.equal(JSON.parse(values[legacyKey]).filtro.frequency,'Mensal');
console.log('4.1.3 F1: quadro único também com preenchimento antigo e parcial');
// 4.6.3 descartáveis: NA com identidade visual própria, sem obrigar informações
// complementares e sem apagar o que já havia sido registrado.
ctx.Event=class{constructor(type){this.type=type;}};
const rinsePage=model.find(p=>p.page===8),rinseRow=rinsePage.rows.find(r=>r.code==='4.6.3');
const rinsePanel={id:0,label:'F1',entries:rinseRow.scopes.map(s=>({scope:s,index:0,name:phraseName(s,0),phrase:s.phrases[0]}))};
const rinseKey='BPF_LineInfo_8_4_6_3_F1';
for(const e of rinsePanel.entries){delete values[e.name];delete values['BPF_FWater_'+e.name];}
values[rinseKey]=JSON.stringify({'embalagens-sopradas':{answer:'1'}});
const rinseCard=new Node('fieldset');water.render(rinseCard,rinsePage,rinseRow,rinsePanel);
const naControls=walk(rinseCard).filter(n=>n.dataset.bpfRinseNA),rinseInfo=walk(rinseCard).find(n=>Object.hasOwn(n.dataset,'bpfInfoBox'));
const rinseNotes=walk(rinseCard).filter(n=>n.tagName==='TEXTAREA'&&n.dataset.note).map(n=>n.parentElement);
assert.equal(naControls.length,3);assert(rinseCard.textContent.includes('Não se aplica (NA)'));assert(!rinseInfo.disabled);
naControls[0].checked=true;naControls[0].onchange();assert.equal(values[rinsePanel.entries[0].name],'2');assert(rinseInfo.disabled&&rinseNotes.every(n=>n.disabled));
assert(water.validateMandatory(rinsePage,rinseRow,[rinsePanel],rinseCard));
const yesBox=walk(rinseCard).find(n=>n.tagName==='FIELDSET'&&n.children[0]?.textContent==='F1 — Sim');
const yesControls=walk(yesBox).filter(n=>n.tagName==='INPUT');assert(yesControls[0].disabled&&!yesControls[0].checked);
yesControls[1].checked=true;yesControls[1].onchange();assert(!rinseInfo.disabled&&rinseNotes.every(n=>!n.disabled));
for(const input of naControls.slice(1)){input.checked=true;input.onchange();}
assert(rinseInfo.disabled);assert(water.report(rinsePage,rinseRow,rinsePanel,values).every(r=>r.answer==='2'));assert.equal(JSON.parse(values[rinseKey])['embalagens-sopradas'].answer,'1');
assert(water.validateMandatory(rinsePage,rinseRow,[rinsePanel],rinseCard));
naControls[1].checked=false;naControls[1].onchange();assert(!rinseInfo.disabled);assert.equal(values[rinsePanel.entries[1].name],'1');
console.log('4.6.3: NA por linha, bloqueio de OBS/NC e informações, reativação e relatório NA OK');
// Exercitar a regra real de confirmação e restauração por unidade.
const sw=fs.readFileSync('sw-guia18.js','utf8');
const popRule=sw.match(/const popRule=`<script>([\s\S]*?)<\/script>`;/)[1];
vm.runInContext(popRule,ctx);
const page=model.find(p=>p.page===1),row=page.rows.find(r=>r.code==='4.2.9');
const panels=[0,1].map(id=>({id,label:'F'+(id+1),entries:row.scopes.map(s=>({scope:s,index:id,name:phraseName(s,id),phrase:s.phrases[id]}))}));
const scope=row.scopes[0],other=row.scopes[1],f1=phraseName(scope,0),f2=phraseName(scope,1),flag=ctx.bpfPopAbsenceFlag(scope);
values[f1]='0';values[f2]='1';values[phraseName(other,1)]='1';values[flag]='';
assert(!ctx.bpfPopNAForced(row,scope,1,values),'Não no F1 não significa ausência confirmada');
values[flag]='1';ctx.bpfApplyPopF2NA(row,scope,values);
assert.equal(values[f2],'2');assert.equal(values[phraseName(other,1)],'1');
const card=new Node('fieldset');water.render(card,page,row,panels[1]);
const controls=walk(card).filter(n=>n.tagName==='INPUT'&&n.dataset.bpfCompactAnswer);
const na=walk(card).filter(n=>n.tagName==='INPUT'&&Object.hasOwn(n.dataset,'bpfPopNA'));
assert.equal(na.length,row.scopes.length);assert(na[0].checked&&na[0].disabled);assert(!na[1].checked);
for(const input of [controls[0],controls[row.scopes.length]])assert(input.disabled&&!input.checked);
assert(!controls[1].disabled);
values[flag]='';ctx.bpfApplyPopF2NA(row,scope,values);card.dispatchEvent({type:'bpf-f2-refresh'});
assert.equal(values[f2],'1');assert(controls[0].checked&&!controls[0].disabled);assert(!na[0].checked);
console.log('4.2.9 POP: NA automático, bloqueio por unidade e restauração OK');
ctx.document.createTextNode=t=>t;
const reservoirPage=model.find(p=>p.rows.some(r=>r.code==='4.3.6'));
const reservoirRow=reservoirPage.rows.find(r=>r.code==='4.3.6');
const reservoirPanel={id:0,label:'F1',entries:reservoirRow.scopes.map(s=>({scope:s,index:0,name:phraseName(s,0),phrase:s.phrases[0]}))};
const reservoirCard=new Node('fieldset');
for(const e of reservoirPanel.entries)values[e.name]='';
values.BPF_F_4_3_6_POP_DisponivelAtualizado='1';
water.renderReservoirPopInfo(reservoirCard,reservoirPage,reservoirRow,reservoirPanel);
const reservoirSelect=walk(reservoirCard).find(n=>n.tagName==='SELECT');
assert(!reservoirSelect.disabled&&reservoirSelect.value==='1');
values[reservoirPanel.entries[0].name]='0';reservoirCard.dispatchEvent({type:'change'});
assert(reservoirSelect.disabled&&reservoirSelect.value==='');
assert.equal(water.reservoirPopReport(reservoirPage,reservoirRow,reservoirPanel,values).length,0);
values[reservoirPanel.entries[0].name]='1';reservoirCard.dispatchEvent({type:'change'});
assert(!reservoirSelect.disabled&&reservoirSelect.value==='1');
console.log('4.3.6: outras informações desabilitadas no Não e reativadas no Sim');
ctx.confirm=()=>false;
// O quadro comum deixa de ser aplicável quando só há unidades sem POP avaliadas.
for(const s of row.scopes){values[phraseName(s,0)]='';values[ctx.bpfPopAbsenceFlag(s)]='';}
values[f1]='0';values[flag]='1';ctx.bpfApplyPopF2NA(row,scope,values);
const infoKey='BPF_LineInfo_1_4_2_9_F2';
values[infoKey]=JSON.stringify({saneantes:{answer:'1',products:{outros:{selected:true,name:'Exemplo'}}}});
const noPopCard=new Node('fieldset');water.render(noPopCard,page,row,panels[1]);
const noPopInfo=walk(noPopCard).find(n=>Object.hasOwn(n.dataset,'bpfInfoBox'));
assert(noPopInfo.textContent.includes('Quais são os sanitizantes (princípios ativos) descritos no POP'));
assert(walk(noPopInfo).filter(n=>n.tagName==='INPUT').every(n=>n.disabled&&!n.checked));
assert.equal(JSON.parse(values[infoKey]).saneantes.answer,'');
assert(!JSON.stringify(water.report(page,row,panels[1],values)).includes('Sanitizantes descritos no POP'));
values[phraseName(other,0)]='1';noPopCard.dispatchEvent({type:'bpf-f2-refresh'});
assert(walk(noPopInfo).filter(n=>n.tagName==='INPUT').every(n=>!n.disabled));
(async()=>{
 for(const p of model)for(const r of p.rows.filter(r=>['4.2.9','4.3.6','4.5.8','4.6.12'].includes(r.code))){
  const s=r.scopes[0],name=phraseName(s,0),k=ctx.bpfPopAbsenceFlag(s),box=new Node('fieldset');
  values[name]='';values[k]='';
  const update=ctx.bpfMountPopAbsence(box,{scope:s},r,p,box);
  const check=walk(box).find(n=>n.dataset.popAbsence===k);
  assert(check.parentElement.hidden);
  values[name]='0';update();assert(!check.parentElement.hidden&&!check.disabled);assert(!box.children[1].hidden);
  check.checked=true;await check.onchange();assert(!check.checked);assert.equal(values[k],'');
  ctx.confirm=()=>true;check.checked=true;await check.onchange();assert.equal(values[k],'1');
  for(const index of s.phrases.keys())if(ctx.bpfIsPopDependent(r,index))assert.equal(values[phraseName(s,index)],'2');
  ctx.confirm=()=>false;
 }
 console.log('POP: alerta visível, Cancelar e Confirmar testados nos quatro itens');
})().catch(e=>{console.error(e);process.exitCode=1;});
