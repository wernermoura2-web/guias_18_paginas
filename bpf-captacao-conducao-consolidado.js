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
    check('vazamento','Tubulação e/ou conexões sem vazamento'),
    check('abaulada','Tubulação sem abaulamento e/ou com suportes suficientes'),
    check('integra','Tubulação sem avarias e/ou lisa e íntegra'),
    check('corrosao','Tubulação e conexões sem corrosão'),
    check('emendas','Tubulações com emendas ou conexões sanitárias'),
    check('acessivel','Tubulação acessível em todo o percurso / trajeto e com ausência de mato')
   ]}
  },
  '4.3.4':{0:{checks:[
   check('inspecao-visual','Inspeção visual do reservatório na frequência definida pelo estabelecimento',{details:'inspection-frequency'})
  ]}},
  '4.3.2':{
   0:{alternatives:true,checks:[
    check('certificado','Certificado de grau alimentício'),
    check('declaracao','Declaração de grau alimentício'),
    check('nota-fiscal','Nota Fiscal do material')
   ]},
   1:{all:true,checks:[
    check('integro','Reservatório sem avarias e/ou liso e íntegro'),
    check('corrosao','Reservatório e conexões sem corrosão'),
    check('conexoes-nao-sanitarias','Reservatório com conexões não sanitárias',{negative:true})
   ]},
   2:{all:true,checks:[
    check('vazamento','Reservatório e/ou conexões com vazamento',{negative:true}),
    check('vincos-amassados','Reservatório com paredes com vincos ou amassadas',{negative:true}),
    check('escotilha-parede','Reservatório com escotilha na parede para acesso interno'),
    check('escotilha-teto','Reservatório com escotilha de vidro no teto para inspeção visual',{yesOnly:true})
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
    check('inspecao-visual','Realiza e registra inspeção visual interna das tubulações',{yesOnly:true})
   ]},
   1:{checks:[
    check('reparo','Possui registro de reparo das tubulações e conexões',{yesOnly:true}),
    check('passivacao','Registros de passivação e/ou desincrustação',{yesOnly:true}),
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
  try {
   const name=key(entry);
   const state=JSON.parse(data[name]||'null');
   if(state&&entry.index===1&&getConductionIntegrityEntry(entry)&&!state.integrityPositive){
    for(const id of ['vazamento','abaulada','emendas']){
     const check=state[id];
     if(check?.answer==='1'||check?.answer==='0')check.answer=check.answer==='1'?'0':'1';
    }
    state.integrityPositive=true;
    data[name]=JSON.stringify(state);
   }
   return state;
  }catch (_) { return null; }
 };
 function getConductionIntegrityEntry(entry){
  const row=BPF_PHRASES.find(page=>page.page===1)?.rows.find(row=>row.code==='4.2.2');
  return row?.scopes.some(scope=>scope.name===entry.scope.name);
 }
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
  if(!selected.length||(panel.all&&panel.checks.some(c=>!c.yesOnly&&!answered(c,state))))return '';
  if(panel.alternatives)return selected.some(c=>state[c.id].answer==='1')?'1':'0';
  return selected.some(c=>!c.yesOnly&&state[c.id].answer===(c.negative?'1':'0'))?'0':'1';
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
    case 'inspection-frequency': details=text(item.frequency)&&'Frequência da inspeção visual interna: '+text(item.frequency);break;
    case 'filter': details=text(item.frequency)&&'Frequência de troca: '+text(item.frequency);break;
    case 'measure': details=text(item.description);break;
   }
   return {id:c.id,answer:item.answer,details};
  });
 }

 function report(page,row,panel,data){
  const reservoir=row.code==='4.3.3'&&panel.id===0;
  const config=reservoir?{checks:panel.entries.filter(entry=>entry.scope===panel.entries[0]?.scope)
   .map(entry=>({id:entry.index,label:bpfUnifiedOption(row,entry)}))}:get(row,panel.id);
  if(!config)return [];
  const units=panel.entries.map(entry=>({
   entry,label:bpfScopeLabel(page,entry.scope),checks:reservoir?
    (['1','0'].includes(data[entry.name])?[{id:entry.index,answer:data[entry.name],details:''}]:[]):
    records(row,entry,data)
  }));
  if(!units.some(unit=>unit.checks.length))return [];
  return (reservoir?['1','0']:['1','0','2']).flatMap(answer=>{
   const checklist=[];
   for(const criterion of config.checks){
    const details=new Map();
    for(const unit of units){
     const check=unit.checks.find(check=>check.id===criterion.id&&check.answer===answer);
     if(!check)continue;
     if(!details.has(check.details))details.set(check.details,[]);
     details.get(check.details).push(unit.label);
    }
    if(details.size){
     const labels=[...details].map(([detail,labels])=>labels.join(', ')+(detail?' — '+detail:''));
     checklist.push(criterion.label+' ('+labels.join(' / ')+')');
    }
   }
   const selected=units.filter(({entry})=>data[entry.name]===answer);
   const legacy=reservoir?[]:selected.filter(unit=>!unit.checks.length);
   if(legacy.length)checklist.push('Avaliação geral ('+legacy.map(unit=>unit.label).join(', ')+')');
   const note=answer==='2'||(answer==='1'&&!selected.length)?'':text(data[bpfGroupNoteName(page,row,panel,answer)]);
   if(!checklist.length&&!(selected.length&&(answer!=='1'||note)))return [];
   return [{page,row,panel,answer,checklist,note,selected:selected.map(unit=>unit.entry)}];
  });
 }

 function summary(page,panel,report){
  return report.map(({answer,checklist,note,selected})=>{
   const labels=checklist.length?checklist:[selected.map(entry=>bpfScopeLabel(page,entry.scope)).join(', ')];
   return panel.label+' — '+bpfAnswerLabel(answer).toUpperCase()+' — '+labels.join(' | ')+
    (note?': '+bpfObservationMarker(answer,selected.length?selected:panel.entries)+note:'');
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
    const missing=config.all&&config.checks.find(c=>!c.yesOnly&&!answered(c,state));
    const detail=selected.find(c=>missingDetail(c,state[c.id]));
    const issue=missing||detail;
    if(!issue)continue;
    const section=content.querySelector('[data-water-entry="'+CSS.escape(entry.name)+'"]');
    if(section){
     section.open=true;
     section.scrollIntoView({block:'nearest'});
    }
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

 function fields(container,criterion,item,save,updates=[]){
  function field(label,value,update,options,rows=2){
   const row=element('label',label);
   row.className='bpf-water-field';
   const input=element(options?'select':'textarea');
   if(options)for(const option of ['Selecione',...options]){
    const choice=element('option',option);
    choice.value=option==='Selecione'?'':option;
    input.append(choice);
   }else{
    row.classList.add('bpf-water-text-field');
    input.rows=rows;
   }
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
     input.checked=item.answer==='1'&&!!product.selected;
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
      input.checked=item.answer==='1'&&!!product.selected;
      for(const e of extra)e.hidden=!input.checked;
      other.hidden=!input.checked||product.frequency!=='Outra';
     }
     input.onchange=()=>{
      product.selected=input.checked;
      item.answer=Object.values(item.products).some(p=>p.selected)?'1':'';
      save();
     };
     updates.push(update);
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
   case 'inspection-frequency': {
    const periods=['Mensal','Trimestral','Semestral','Outros'];
    const saved=item.frequency||'';
    const custom=!!saved&&!periods.includes(saved);
    let other;
    field('Frequência da inspeção visual interna',custom?'Outros':saved,value=>{
     other.hidden=value!=='Outros';
     item.frequency=value==='Outros'?other.querySelector('textarea').value:value;
     save();
    },periods);
    other=field('Outra frequência',custom?saved:'',value=>{item.frequency=value;save();});
    other.hidden=!custom;
    break;
   }
   case 'filter': {
    const saved=item.frequency||'';
    const custom=!!saved&&!frequencies.includes(saved);
    let other;
    field('Frequência de troca do filtro de ar microbiológico',custom?'Outra':saved,value=>{
     other.hidden=value!=='Outra';
     item.frequency=value==='Outra'?other.querySelector('textarea').value:value;
     save();
    },frequencies);
    other=field('Outra frequência de troca',custom?saved:'',value=>{item.frequency=value;save();});
    other.hidden=!custom;
    break;
   }
   case 'measure': field('Descreva a medida de controle',item.description,value=>{item.description=value;save();},null,4);break;
  }
 }

 function render(card,page,row,panel){
  const config=get(row,panel.id);
  if(!config)return false;
  const hint=element('p',config.all?'Responda às verificações com opções Sim e Não da unidade avaliada.':'Marque uma ou mais verificações por unidade.');
  hint.className='bpf-guidance';
  card.append(hint);
  if(!document.getElementById('bpf-water-css')){
   const style=element('style');
   style.id='bpf-water-css';
   style.textContent='#bpf-editor .bpf-water-grid{grid-template-columns:minmax(0,1fr)}.bpf-water-unit+.bpf-water-unit{margin-top:4px}.bpf-water-unit>summary{padding:8px 0;cursor:pointer;font-weight:700}.bpf-water-row{padding:5px 0}.bpf-water-caption{display:block;margin-bottom:4px}.bpf-water-choice{display:flex;align-items:flex-start;gap:8px;margin:4px 0}.bpf-water-choice input{flex:none}.bpf-water-detail{padding:6px 10px;margin-top:4px;background:#f2f7fa;border-radius:5px}.bpf-water-field{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:7px 0}.bpf-water-field select{font:inherit;max-width:100%;padding:5px}#bpf-editor .bpf-water-text-field{display:block}#bpf-editor .bpf-water-text-field textarea{display:block;width:100%;max-width:100%;min-height:3.5em;box-sizing:border-box;margin:6px 0 0;padding:8px;font:inherit;resize:vertical}.bpf-water-unit [hidden]{display:none!important}';
   document.head.append(style);
  }
  const answerGrid=element('div');
  answerGrid.className='bpf-answer-grid bpf-water-grid';
  card.append(answerGrid);
  const boxes=new Map();
  for(const [answer,heading] of [['1','Sim'],['0','Não']]){
   const box=element('fieldset');
   box.className='bpf-answer-box';
   box.append(element('legend',panel.label+' — '+heading));
   answerGrid.append(box);
   boxes.set(answer,box);
  }
  for(const entry of panel.entries){
   const previous=read(entry,values);
   const state=previous||(row.code==='4.2.2'&&panel.id===1?{integrityPositive:true}:{});
   const label=bpfScopeLabel(page,entry.scope);
   const legacy=previous?'':bpfAnswerLabel(values[entry.name]);
   const legacyLines=[];
   const rows=[];
   const save=()=>{
    for(const line of legacyLines)line.hidden=true;
    values[key(entry)]=JSON.stringify(state);
    values[entry.name]=result(config,state);
    if(!values[entry.name])values[entry.scope.name]='Off';
    refresh();
    changed();
    recalc();
   };
   const refresh=()=>{
    for(const control of rows)control();
   };
   for(const [answer,box] of boxes){
    const heading=answer==='1'?'Sim':'Não';
    const section=element('details');
    section.className='bpf-water-unit';
    section.dataset.waterEntry=entry.name;
    section.append(element('summary',label));
    const legacyLine=element('p',legacy?'Avaliação geral registrada: '+legacy+'.':'');
    legacyLine.hidden=!legacy;
    legacyLines.push(legacyLine);
    section.append(legacyLine);
    box.append(section);
    for(const criterion of config.checks){
     if(criterion.yesOnly&&answer==='0')continue;
     const item=state[criterion.id]??={};
     const line=element('div');
     line.className='bpf-water-row';
     section.append(line);
     if(criterion.details==='sanitizers'&&answer==='1'){
      const title=element('strong',criterion.label);
      title.className='bpf-water-caption';
      line.append(title);
      fields(line,criterion,item,save,rows);
      continue;
     }
     const control=element('label',criterion.label);
     control.className='bpf-water-choice';
     const input=element('input');
     input.type='checkbox';
     input.setAttribute('aria-label',label+' — '+criterion.label+' — '+heading);
     input.onchange=()=>{
      item.answer=input.checked?answer:'';
      if(criterion.details==='sanitizers'&&item.answer==='0'){
       for(const product of Object.values(item.products))product.selected=false;
      }
      if(criterion.id==='filtro'&&item.answer!=='1')delete state['registro-filtro'].answer;
      save();
     };
     control.prepend(input);
     line.append(control);
     const extra=element('div');
     extra.className='bpf-water-detail';
     if(criterion.details&&answer==='1')fields(extra,criterion,item,save);
     line.append(extra);
     rows.push(()=>{
      const enabled=active(criterion,state);
      input.checked=enabled&&item.answer===answer;
      input.disabled=!enabled;
      line.hidden=!enabled;
      extra.hidden=!enabled||item.answer!=='1'||answer!=='1'||!criterion.details;
     });
    }
   }
   refresh();
  }
  const grid=element('div');
  grid.className='bpf-answer-grid bpf-water-grid';
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
 return {get,init,apply,report,summary,validate,render};
})();

