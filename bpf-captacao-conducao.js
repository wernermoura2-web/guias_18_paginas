/* Verificações de Captação e Condução, registradas por unidade e frase. */
const bpfWaterCheck = (() => {
 const check = (id, label, options = {}) => ({id, label, ...options});
 const sanitizers = label => check('saneantes', label, {details:'sanitizers'});
 const yes = (id, label, details) => check(id, label, {yesOnly:true, details});
 const controls = (disinfection, water) => [
  yes('telemetria','Existe telemetria em linha','telemetry'),
  yes('residuo','Após a desinfecção '+disinfection+', testa a ausência de resíduo de saneante na água após o enxágue','residue'),
  yes('microbiologia','Após a desinfecção '+disinfection+', testa a ausência de contaminação microbiológica'),
  yes('atp','Após a desinfecção '+disinfection+', faz teste fluorescente / ATP'),
  yes('medida','Adota outra medida de controle adicional ao perigo identificado de contaminação microbiológica ou química da água '+water,'measure')
 ];
 const panels = {
  '4.1.3':{
   0:{checks:[
    sanitizers('Sanitizantes utilizados na descontaminação ou desinfecção de rotina do poço ou surgência'),
    check('filtro','Possui filtro de ar microbiológico no poço (surgência apenas em drenos)',{details:'filter'}),
    check('registro-filtro','Possui registro de troca do filtro de ar microbiológico',{requires:'filtro'}),
    check('pop-registros','O POP e os registros de limpeza e higienização estão disponíveis na casa de proteção'),
    ...controls('do poço ou surgência','captada')
   ]},
   2:{all:true,checks:[
    check('externa','Área externa (pavimentação, calhas de drenagem, etc.)'),
    check('interior','Interior da casa de captação (piso, paredes, tubulações, etc.)'),
    check('captacao','Captação (poço ou surgência)')
   ]}
  },
  '4.2.2':{
   0:{alternatives:true,checks:[
    check('certificado','Certificado de grau alimentício'),
    check('declaracao','Declaração de grau alimentício'),
    check('nota-fiscal','Nota Fiscal do material')
   ]},
   1:{all:true,checks:[
    check('vazamento','Tubulação e/ou conexões com vazamento',{negative:true}),
    check('abaulada','Tubulação abaulada e/ou com suportes insuficientes',{negative:true}),
    check('integra','Tubulação sem avarias e/ou lisa e íntegra'),
    check('corrosao','Tubulação e conexões sem corrosão'),
    check('emendas','Tubulações com emendas ou conexões não sanitárias',{negative:true}),
    check('acessivel','Tubulação acessível em todo o percurso / trajeto e com ausência de mato')
   ]}
  },
  '4.2.7':{0:{checks:[
   sanitizers('Sanitizantes utilizados na descontaminação ou desinfecção de rotina da condução'),
   ...controls('da condução','conduzida')
  ]}},
  '4.2.8':{
   0:{all:true,checks:[
    check('pop-desmonte','POP contempla o desmonte e a frequência'),
    check('registros-desmonte','Registros do desmonte, troca de componentes (o-ring) e higienização posterior'),
    check('inspecao-visual','Realiza e registra inspeção visual interna das tubulações')
   ]},
   1:{checks:[
    check('reparo','Possui registro de reparo das tubulações e conexões'),
    check('passivacao','Registros de passivação e/ou desincrustação'),
    check('historico-pop','POP contempla o histórico de revisão de operações de higienização')
   ]}
  },
  '4.2.9':{
   0:{all:true,checks:[
    check('pop-canalizacao','Possui POP referente às operações de higienização da canalização'),
    check('implementacao','A limpeza e a higienização são realizadas conforme o POP, com os mesmos desinfetantes, concentrações e formas de aplicação')
   ]},
   1:{all:true,checks:[
    check('saneantes-poco','Sanitizantes utilizados na descontaminação ou desinfecção de rotina do poço ou surgência',{details:'sanitizers'}),
    check('saneantes-casa','Sanitizantes utilizados na descontaminação ou desinfecção de rotina da casa de proteção e área externa',{details:'sanitizers'})
   ]}
  }
 };
 const products = [['hipoclorito','Hipoclorito de sódio'],['ozonio','Ozônio'],['peracetico','Ácido peracético'],['outros','Outros']];
 const frequencies = ['Semanal','Mensal','Trimestral','Semestral','Anual','Outra'];
 const telemetry = [['ph','pH'],['temperatura','Temperatura'],['condutividade','Condutividade (condutivímetro)']];
 const tests = [['telemetria','Telemetria'],['indicador','Teste com indicador'],['outros','Outros']];
 const get = (row,index) => panels[row.code]?.[index];
 const key = entry => 'BPF_FWater_'+entry.name;
 const entriesFor = (row,scope) => Object.keys(panels[row.code]||{}).map(Number).map(index=>({scope,index,name:bpfPhraseName(scope,index)}));
 const read = (entry,data) => {
  try { return JSON.parse(data[key(entry)]||'null'); }
  catch (_) { return null; }
 };
 const active = (criterion,state) => !criterion.requires||state[criterion.requires]?.answer==='1';
 const answered = (criterion,state) => active(criterion,state)&&
  (state[criterion.id]?.answer==='1'||(!criterion.yesOnly&&state[criterion.id]?.answer==='0'));
 const text = value => typeof value==='string'?value.trim():'';

 function init(data){
  for(const page of BPF_PHRASES)for(const row of page.rows)for(const scope of row.scopes){
   for(const entry of entriesFor(row,scope)){
    const name=key(entry);
    data.fields[name]={name,type:'/Tx',flags:0,label:row.code+' F'+(entry.index+1)+' — '+bpfScopeLabel(page,scope)+' — verificações',options:[],calc:'',phrasePage:page.page};
   }
  }
 }

 function result(panel,state){
  const selected=panel.checks.filter(c=>answered(c,state));
  if(!selected.length||(panel.all&&selected.length!==panel.checks.length))return '';
  if(panel.alternatives)return selected.some(c=>state[c.id].answer==='1')?'1':'0';
  return selected.some(c=>state[c.id].answer===(c.negative?'1':'0'))?'0':'1';
 }

 function apply(row,scope,data){
  for(const entry of entriesFor(row,scope)){
   const state=read(entry,data);
   if(state)data[entry.name]=result(get(row,entry.index),state);
  }
 }

 function records(row,entry,data){
  const state=read(entry,data);
  if(!state)return [];
  return get(row,entry.index).checks.filter(c=>answered(c,state)).map(c=>{
   const item=state[c.id];
   let details='';
   if(item.answer==='1')switch(c.details){
    case 'sanitizers':
     details=products.filter(([id])=>item.products?.[id]?.selected).map(([id,label])=>{
      const product=item.products[id];
      return (id==='outros'?text(product.name)||label:label)+
       (product.frequency?' — '+(product.frequency==='Outra'?text(product.otherFrequency)||'Outra':product.frequency):'');
     }).join(', ');
     break;
    case 'telemetry':
     details=telemetry.filter(([id])=>item.parameters?.[id]).map(([,label])=>label).join(', ');
     break;
    case 'residue':
     details=[item.recorded==='1'?'Registra o resultado':item.recorded==='0'?'Não registra o resultado':'',
      ...tests.filter(([id])=>item.tests?.[id]).map(([id,label])=>id==='outros'?text(item.otherTest)||label:label)
     ].filter(Boolean).join(', ');
     break;
    case 'filter': details=text(item.frequency)&&'Frequência de troca: '+text(item.frequency);break;
    case 'measure': details=text(item.description);break;
   }
   return {answer:item.answer,label:c.label+(details?' ('+details+')':'')};
  });
 }

 function summary(page,row,panel,data){
  return panel.entries.flatMap(entry=>{
   const checks=records(row,entry,data);
   return checks.length?[panel.label+' — '+bpfScopeLabel(page,entry.scope)+' — '+
    checks.map(c=>bpfAnswerLabel(c.answer)+' — '+c.label).join(' / ')]:[];
  });
 }

 function annex(row,index,recordsForUnits,data){
  return recordsForUnits.map(record=>{
   const checks=records(row,{scope:record.scope,index,name:bpfPhraseName(record.scope,index)},data);
   const note=checks.map(c=>bpfAnswerLabel(c.answer)+' — '+c.label).join('\n');
   return note?{...record,note:[note,record.note].filter(Boolean).join('\n')}:record;
  });
 }

 function missingDetail(criterion,item){
  if(item.answer!=='1')return false;
  switch(criterion.details){
   case 'sanitizers': {
    const selected=products.filter(([id])=>item.products?.[id]?.selected);
    return !selected.length||selected.some(([id])=>{
     const p=item.products[id];
     return !p.frequency||(id==='outros'&&!text(p.name))||(p.frequency==='Outra'&&!text(p.otherFrequency));
    });
   }
   case 'telemetry': return !telemetry.some(([id])=>item.parameters?.[id]);
   case 'residue': return !item.recorded||!tests.some(([id])=>item.tests?.[id])||(item.tests.outros&&!text(item.otherTest));
   case 'filter': return !text(item.frequency);
   case 'measure': return !text(item.description);
   default: return false;
  }
 }

 function validate(page,row,panels,content){
  for(const panel of panels){
   const config=get(row,panel.id);
   if(!config)continue;
   for(const entry of panel.entries){
    const state=read(entry,values);
    if(!state)continue;
    const selected=config.checks.filter(c=>answered(c,state));
    if(!selected.length)continue;
    const missing=config.all&&config.checks.find(c=>!answered(c,state));
    const detail=selected.find(c=>missingDetail(c,state[c.id]));
    const issue=missing||detail;
    if(!issue)continue;
    const section=content.querySelector('[data-water-entry="'+CSS.escape(entry.name)+'"]');
    if(section)section.open=true;
    alert('Item '+row.code+' — '+panel.label+' — '+bpfScopeLabel(page,entry.scope)+': '+(missing?'responda':'complete os dados de')+' “'+issue.label+'”.');
    return false;
   }
  }
  return true;
 }

 function element(tag,caption){
  const node=document.createElement(tag);
  if(caption)node.textContent=caption;
  return node;
 }

 function fields(container,criterion,item,save){
  function field(label,value,update,options){
   const row=element('label',label);
   row.className='bpf-water-field';
   const input=element(options?'select':'input');
   if(options)for(const option of ['Selecione',...options]){
    const choice=element('option',option);
    choice.value=option==='Selecione'?'':option;
    input.append(choice);
   }else input.type='text';
   input.value=value||'';
   input.addEventListener(options?'change':'input',()=>update(input.value));
   row.append(input);
   container.append(row);
   return row;
  }

  function options(entries,values,onToggle){
   for(const [id,label] of entries){
    const row=element('label',label);
    row.className='bpf-water-choice';
    const input=element('input');
    input.type='checkbox';
    input.checked=!!values[id];
    input.onchange=()=>onToggle(id,input.checked);
    row.prepend(input);
    container.append(row);
   }
  }

  switch(criterion.details){
   case 'sanitizers':
    item.products??={};
    for(const [id,label] of products){
     const product=item.products[id]??={};
     const row=element('label',label);
     row.className='bpf-water-choice';
     const input=element('input');
     input.type='checkbox';
     input.checked=!!product.selected;
     row.prepend(input);
     container.append(row);
     const extra=[];
     if(id==='outros')extra.push(field('Outro sanitizante',product.name,value=>{product.name=value;save();}));
     extra.push(field('Periodicidade — '+label,product.frequency,value=>{
      product.frequency=value;
      update();
      save();
     },frequencies));
     const other=field('Outra periodicidade — '+label,product.otherFrequency,value=>{product.otherFrequency=value;save();});
     function update(){
      for(const e of extra)e.hidden=!product.selected;
      other.hidden=!product.selected||product.frequency!=='Outra';
     }
     input.onchange=()=>{product.selected=input.checked;update();save();};
     update();
    }
    break;
   case 'telemetry':
    item.parameters??={};
    options(telemetry,item.parameters,(id,selected)=>{item.parameters[id]=selected;save();});
    break;
   case 'residue': {
    const record=field('Registra o resultado',item.recorded==='1'?'Sim':item.recorded==='0'?'Não':'',value=>{
     item.recorded=value==='Sim'?'1':value==='Não'?'0':'';
     save();
    },['Sim','Não']);
    record.classList.add('bpf-water-record');
    item.tests??={};
    let other;
    options(tests,item.tests,(id,selected)=>{
     item.tests[id]=selected;
     other.hidden=!item.tests.outros;
     save();
    });
    other=field('Outro teste',item.otherTest,value=>{item.otherTest=value;save();});
    other.hidden=!item.tests.outros;
    break;
   }
   case 'filter': field('Frequência de troca do filtro de ar microbiológico',item.frequency,value=>{item.frequency=value;save();});break;
   case 'measure': field('Descreva a medida de controle',item.description,value=>{item.description=value;save();});break;
  }
 }

 function render(card,page,row,panel){
  const config=get(row,panel.id);
  if(!config)return false;
  const hint=element('p',config.all?'Responda Sim ou Não em todas as verificações da unidade avaliada.':'Marque uma ou mais verificações por unidade.');
  hint.className='bpf-guidance';
  card.append(hint);
  if(!document.getElementById('bpf-water-css')){
   const style=element('style');
   style.id='bpf-water-css';
   style.textContent='.bpf-water-unit{margin:10px 0;padding:10px;border:1px solid #94a9b6;border-radius:7px}.bpf-water-unit>summary{cursor:pointer;font-weight:700}.bpf-water-row{padding:9px 0;border-bottom:1px solid #d5e0e7}.bpf-water-caption{display:block;margin-bottom:4px}.bpf-water-choice{display:inline-flex;align-items:center;gap:5px;margin:4px 16px 4px 0}.bpf-water-detail{padding:6px 10px;margin-top:4px;background:#f2f7fa;border-radius:5px}.bpf-water-field{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:7px 0}.bpf-water-field input,.bpf-water-field select{font:inherit;max-width:100%;padding:5px}.bpf-water-unit [hidden]{display:none!important}';
   document.head.append(style);
  }
  for(const entry of panel.entries){
   const previous=read(entry,values);
   const state=previous||{};
   const section=element('details');
   section.className='bpf-water-unit';
   section.dataset.waterEntry=entry.name;
   const summary=element('summary');
   section.append(summary);
   section.open=entry===panel.entries[0];
   const label=bpfScopeLabel(page,entry.scope);
   const legacy=previous?'':bpfAnswerLabel(values[entry.name]);
   const legacyLine=element('p',legacy?'Avaliação geral registrada: '+legacy+'.':'');
   legacyLine.hidden=!legacy;
   section.append(legacyLine);
   const rows=[];
   const save=()=>{
    legacyLine.hidden=true;
    values[key(entry)]=JSON.stringify(state);
    values[entry.name]=result(config,state);
    if(!values[entry.name])values[entry.scope.name]='Off';
    refresh();
    changed();
    recalc();
   };
   const refresh=()=>{
    const assessment=bpfAnswerLabel(values[entry.name]);
    summary.textContent=label+(assessment?' — '+assessment:'');
    for(const {criterion,item,line,extra,buttons} of rows){
     const enabled=active(criterion,state);
     for(const [answer,button] of buttons){
      button.checked=enabled&&item.answer===answer;
      button.disabled=!enabled;
     }
     line.hidden=!enabled;
     extra.hidden=!enabled||item.answer!=='1'||!criterion.details;
    }
   };
   for(const criterion of config.checks){
    const item=state[criterion.id]??={};
    const line=element('div');
    line.className='bpf-water-row';
    const caption=element('strong',criterion.label);
    caption.className='bpf-water-caption';
    line.append(caption);
    const buttons=new Map();
    for(const [answer,caption] of [['1','Sim'],['0','Não']]){
     if(criterion.yesOnly&&answer==='0')continue;
     const control=element('label',caption);
     control.className='bpf-water-choice';
     const input=element('input');
     input.type='checkbox';
     input.setAttribute('aria-label',criterion.label+' — '+caption);
     input.onchange=()=>{
      item.answer=input.checked?answer:'';
      if(criterion.id==='filtro'&&item.answer!=='1')delete state['registro-filtro'].answer;
      save();
     };
     control.prepend(input);
     line.append(control);
     buttons.set(answer,input);
    }
    const extra=element('div');
    extra.className='bpf-water-detail';
    if(criterion.details)fields(extra,criterion,item,save);
    line.append(extra);
    section.append(line);
    rows.push({criterion,item,line,extra,buttons});
   }
   refresh();
   card.append(section);
  }
  const grid=element('div');
  grid.className='bpf-answer-grid';
  for(const [answer,heading] of [['1','OBS — observação'],['0','NC — não conformidade']]){
   const box=element('fieldset');
   box.className='bpf-answer-box';
   box.append(element('legend',heading));
   const area=element('textarea');
   area.rows=4;
   area.setAttribute('aria-label',heading+' — '+panel.label);
   area.dataset.note=bpfGroupNoteName(page,row,panel,answer);
   area.value=values[area.dataset.note]||'';
   area.oninput=()=>{values[area.dataset.note]=area.value;changed();};
   box.append(area);
   bpfAttachNoteTools(area,box,page,row.code,panel,()=>answer);
   grid.append(box);
  }
  card.append(grid);
  return true;
 }
 return {get,init,apply,summary,annex,validate,render};
})();
