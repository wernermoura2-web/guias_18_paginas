/* Verificações de Captação e Condução, registradas por unidade e frase. */
const bpfWaterCheck = (() => {
 const check = (id, label, options = {}) => ({id, label, ...options});
 const sanitizers = (label, options) => check('saneantes', label, {details:'sanitizers', ...options});
 const yes = (id, label, details) => check(id, label, {yesOnly:true, details});
 const controls = (disinfection, water) => [
  yes('telemetria','Existe telemetria em linha','telemetry'),
  yes('residuo','Após a desinfecção '+disinfection+', testa a ausência de resíduo de saneante na água após o enxágue','residue'),
  yes('microbiologia','Após a desinfecção '+disinfection+', testa a ausência de contaminação microbiológica'),
  yes('atp','Após a desinfecção '+disinfection+', faz teste fluorescente / ATP'),
  ...(water?[yes('medida','Adota outra medida de controle adicional ao perigo identificado de contaminação microbiológica ou química da água '+water,'measure')]:[])
 ];
 const adequateHygiene = check('higienizacao-adequada','A rotina de limpeza informada encontra-se em conformidade com as instruções apresentadas');
 const blownChecks = [
  check('uso-imediato','As embalagens sopradas são utilizadas imediatamente, sem contato manual?'),
  yes('ar-sopro-filtrado','As pré-formas são sopradas com ar comprimido com filtro de ar microbiológico.'),
  yes('analise-ar-comprimido','O ar comprimido é coletado e enviado para análises microbiológicas.'),
  yes('transporte-ar-filtrado','As embalagens são movimentadas com sopradores de ar com filtro de ar microbiológico.')
 ].map(criterion=>({...criterion,section:'Embalagens sopradas no estabelecimento'}));
 function rinsePanel(disposable){
  const rinseChecks=[
   check('concentracao','O enxágue com desinfetante das embalagens é feito na concentração adequada?'),
   check('bicos-pressao','Os bicos estão desobstruídos e a pressão dos jatos permite que a solução desinfetante alcance o fundo das garrafas?'),
   ...(disposable?[check('escoamento','O tempo após o enxágue é suficiente para o escoamento de toda a solução desinfetante?')]:[]),
   check('sanitizantes-embalagens','Sanitizantes utilizados para descontaminação ou desinfecção das embalagens',{
    yesOnly:true,details:'packaging-sanitizers',
    products:disposable?[
     ['ozonio','Ozônio'],['outros','Outro']
    ]:[
     ['detergente-clorado','Detergente alcalino clorado'],['hipoclorito-com-sodio','Hipoclorito de sódio com Soda Cáustica'],
     ['hipoclorito','Hipoclorito de sódio'],['ozonio','Ozônio'],['outros','Outro']
    ]
   }),
   yes('telemetria-concentracao','Existe telemetria em linha da concentração do desinfetante utilizado para controlar e monitorar sua reposição.')
  ].map(criterion=>({...criterion,section:'Enxágue com solução desinfetante'}));
  return {sectioned:true,allowNA:disposable,checks:disposable?[...blownChecks,...rinseChecks]:rinseChecks};
 }
 const returnableRinse=rinsePanel(false), disposableRinse=rinsePanel(true);
 const fillingMachine={all:true,inline:true,checks:[
  check('higienizacao-envasadora','Envasadora Automática descontaminada e higienizada adequadamente?',{boldText:'Envasadora Automática'}),
  check('registros-desinfeccao-envasadora','Registros de descontaminação ou desinfecção da envasadora Automática',{boldText:'Automática'}),
  check('saneantes','Sanitizantes utilizados para descontaminação ou desinfecção de rotina da envasadora',{yesOnly:true,details:'sanitizers',explicitAnswer:true,frequencyOptional:true}),
  {...yes('residuo','Após a desinfecção da envasadora, testa a ausência de resíduo de saneante na água após o enxágue?','residue'),
   tests:[['dpd','Fotômetro de bolso (DPD)'],['ortotolidina','Kit de gotas (Ortotolidina)'],['outros','Outro']]},
  yes('microbiologia','Após o enxágue da envasadora, testa a ausência de contaminação microbiológica?'),
  yes('atp','Após o enxágue da envasadora, faz teste fluorescente / ATP?'),
  yes('medida','Adota outra medida de controle para o perigo identificado de contaminação microbiológica ou química da água envasada?','measure')
 ]};
 const panels = {
  '4.7.8':{0:fillingMachine},
  '4.6.3':{0:returnableRinse},
  '4.6.5':{
   0:{all:true,checks:[
    check('concentracao-limpeza','O enxágue com produto químico para limpeza das embalagens no primeiro estágio da lavadora é feito na concentração adequada?'),
    check('bicos-limpeza','Os bicos estão desobstruídos e a pressão dos jatos permite que a solução de limpeza alcance o fundo das garrafas?'),
    check('produtos-limpeza','Os produtos químicos utilizados para limpeza das embalagens são adequados?',{
     details:'packaging-sanitizers',detailsOnNo:true,
     products:[['detergente-clorado','Detergente alcalino clorado'],['soda-caustica','Soda cáustica'],['outros','Outro']]
    }),
    yes('telemetria-limpeza','Existe telemetria em linha da concentração do produto químico utilizado para controlar e monitorar sua reposição.')
   ]},
   1:{all:true,checks:[
    yes('desinfeccao-primeiro-estagio','O enxágue com desinfetante das embalagens é feito junto com o primeiro estágio de limpeza?'),
    check('concentracao-desinfetante','O enxágue com desinfetante das embalagens é feito na concentração adequada?'),
    check('bicos-desinfetante','Os bicos estão desobstruídos e a pressão dos jatos permite que a solução desinfetante alcance o fundo das garrafas?'),
    check('sanitizantes-desinfeccao','Sanitizantes utilizados para descontaminação ou desinfecção das embalagens adequados',{
     details:'packaging-sanitizers',detailsOnNo:true,
     products:[['hipoclorito-com-soda','Hipoclorito de sódio com Soda Cáustica'],['hipoclorito','Hipoclorito de sódio'],['ozonio','Ozônio'],['outros','Outro']]
    }),
    check('relatorio-operacao-lavadora','Foi apresentado o relatório de avaliação das condições de operação do maquinário automático utilizado para limpeza e desinfecção de embalagens retornáveis?'),
    check('relatorio-operacao-atualizado','O relatório de avaliação das condições de operação está atualizado com os desinfetantes e as concentrações utilizadas?',{requires:'relatorio-operacao-lavadora'}),
    yes('telemetria-desinfetante','Existe telemetria em linha da concentração do desinfetante utilizado para controlar e monitorar sua reposição.')
   ]}
  },
  '4.1.3':{
   0:{negativePerScope:true,checks:[
    {...adequateHygiene,yesOnly:true},
    sanitizers('Sanitizantes utilizados na descontaminação ou desinfecção de rotina do poço ou surgência',{yesOnly:true}),
    check('filtro','Possui filtro de ar microbiológico no poço (surgência apenas em drenos)',{details:'filter',yesOnly:true}),
    check('registro-filtro','Possui registro de troca do filtro de ar microbiológico',{requires:'filtro',yesOnly:true}),
    yes('pop-registros','O POP e os registros de limpeza e higienização estão disponíveis na casa de proteção'),
    ...controls('do poço ou surgência'),
    check('nao-captacao','Não',{noOnly:true})
   ]},
   2:{all:true,answerPrompts:{'1':'informe os registros de limpeza apresentados','0':'informe os registros de limpeza não apresentados'},checks:[
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
  '4.6.8':{
   0:{all:true,capRoute:true,checks:[
    check('declaracao','Possui declaração do fabricante de desinfecção do lote de tampas em uso?'),
    yes('analise-tampas-recebidas','É feita a análise microbiológica dos lotes das tampas recebidas com declaração de desinfecção?'),
    check('dupla-embalagem','Os sacos com as tampas são enviados com embalagens primária e secundária?'),
    check('retirada-envase','A embalagem secundária é retirada imediatamente antes do transporte para a sala de envase?',{route:'direto'}),
    check('armazenamento-primaria','Os sacos com apenas a embalagem primária são mantidos fora do piso e dos equipamentos?',{route:'direto'}),
    check('retirada-silo','A embalagem secundária é retirada imediatamente antes do transporte para o silo de transferência?',{route:'silo'}),
    check('localizacao-silo','O silo está instalado em área adequada?',{route:'silo'}),
    check('filtro-silo','O soprador do silo possui filtro de ar microbiológico?',{route:'silo'}),
    check('ozonio-silo','O silo opera sem aplicação de ozônio?',{route:'silo',noOnly:true}),
    check('transporte-silo','O silo utiliza transportador fechado ou protegido?',{route:'silo'}),
    yes('desinfeccao-envasadora','Faz a desinfecção das tampas na envasadora.')
   ]},
   1:{all:true,checks:[
    check('desinfetante-tampas','As tampas são desinfetadas com desinfetantes adequados?',{
     details:'packaging-sanitizers',detailsOnNo:true,products:[['ozonio','Ozônio'],['outros','Outro']]
    }),
    check('ambiente-desinfeccao','O ambiente onde é feita a desinfecção é adequado?'),
    check('transporte-tampas','As tampas desinfetadas são transportadas para a sala de envase ou para o silo em recipientes higienizados e com tampa?'),
    check('analise-tampas','É feita a análise microbiológica dos lotes desinfetados de tampas?'),
    check('fora-silo','A desinfecção é realizada dentro do silo?',{noOnly:true}),
    check('fora-envase','A desinfecção é realizada na sala de envase ou na antessala?',{noOnly:true})
   ]}
  },
  '4.6.6':{
   0:{all:true,checks:[
    check('eliminacao-residuos','O enxágue das embalagens retornadas para um novo ciclo de uso garante a eliminação dos resíduos dos produtos químicos utilizados na higienização?'),
    check('bicos-pressao','Os bicos estão desobstruídos e a pressão dos jatos permite que a água de enxágue alcance o fundo das embalagens?'),
    check('escoamento','O tempo após o enxágue é suficiente para o escoamento de toda a água de enxágue?')
   ]},
   1:{all:true,checks:[
    check('teste-arraste','O teste de arraste foi demonstrado?'),
    check('registros-residuos','Há registros dos testes de resíduos?'),
    check('instrumento-adequado','O instrumento portátil é adequado ao desinfetante utilizado?'),
    check('enxague-final','O teste após o enxágue final indicou ausência de resíduos detectáveis pelo método utilizado?'),
    yes('criterio-zero','O teste de arraste é adequado ao desinfetante utilizado e adota 0,0 mg/L como critério de aceitação, interpretado conforme o limite de detecção do método.')
   ]}
  },
  '4.3.5':{0:{all:true,checks:[
   adequateHygiene,
    sanitizers('Sanitizantes utilizados para descontaminação ou desinfecção de rotina do reservatório',{yesOnly:true,frequencyOptional:true}),
   check('recirculacao','Procedimento adotado para recirculação do sanitizante no tanque',{yesOnly:true,details:'recirculation'}),
   ...controls('do reservatório','armazenada')
  ]}},
  '4.3.4':{0:{simple:true,checks:[
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
   adequateHygiene,
    sanitizers('Sanitizantes utilizados na descontaminação ou desinfecção de rotina da condução',{yesOnly:true,frequencyOptional:true}),
   ...controls('da condução','conduzida')
  ]}},
  '4.2.8':{
   0:{all:true,checks:[
    check('pop-desmonte','POP contempla o desmonte e a frequência'),
    check('registros-desmonte','Registros do desmonte, troca de componentes (o-ring) e higienização posterior',{optional:true}),
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
    sanitizers('Sanitizantes utilizados para descontaminação ou desinfecção de rotina da condução',{yesOnly:true})
   ]}
  }
 };
 const products = [['hipoclorito','Hipoclorito de sódio'],['ozonio','Ozônio'],['peracetico','Ácido peracético'],['outros','Outros']];
 const frequencies = ['Semanal','Mensal','Trimestral','Semestral','Anual','Outra'];
 const telemetry = [['ph','pH'],['temperatura','Temperatura'],['condutividade','Condutividade (condutivímetro)']];
 const recirculation = [
  'Tanque CIP para preparo do sanitizante com bomba para recirculação e spray ball',
  'Preparo do sanitizante no próprio tanque com bomba para recirculação e spray ball',
  'Outro'
 ];
 const tests = [['telemetria','Telemetria'],['indicador','Teste com indicador'],['outros','Outros']];
 function get(row,index){
  const config=row.code==='4.6.3'&&index===0&&row.scopes.some(scope=>scope.phrases[0]?.allowNA)
   ?disposableRinse:panels[row.code]?.[index];
  return config&&synchronizedItems.has(row.code)?{...config,optional:true}:config;
 }
 const key = entry => 'BPF_FWater_'+entry.name;
 const machineEntries=panel=>panel.entries.filter(entry=>entry.name.endsWith('_EnvasadoraAutomatica'));
 const entriesFor = (row,scope) => row.code==='4.7.8'?bpfF1Checks(row,scope).filter(entry=>entry.name.endsWith('_EnvasadoraAutomatica')):Object.keys(panels[row.code]||{}).map(Number).map(index=>({scope,index,name:bpfPhraseName(scope,index)}));
 const read = (entry,data) => {
  try {
   const name=key(entry);
   const state=JSON.parse(data[name]||'null');
   if(entry.index===0&&!state?.['nao-captacao']&&
      (state?['higienizacao-adequada','filtro','registro-filtro','pop-registros'].some(id=>state[id]?.answer==='0'):data[entry.name]==='0')&&
      BPF_PHRASES.some(page=>page.page===0&&page.rows.some(row=>row.code==='4.1.3'&&row.scopes.some(scope=>scope.name===entry.scope.name)))){
    return {...state,'nao-captacao':{answer:'0'}};
   }
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
 const active = (criterion,state) =>
  (!criterion.route||state.route===criterion.route)&&(!criterion.requires||state[criterion.requires]?.answer==='1');
 const answered = (criterion,state) => active(criterion,state)&&
  ((!criterion.noOnly&&state[criterion.id]?.answer==='1')||(!criterion.yesOnly&&state[criterion.id]?.answer==='0'));
 const text = value => typeof value==='string'?value.trim():'';

 const capsDisinfected=(scope,data)=>read({scope,index:0,name:bpfPhraseName(scope,0)},data)
  ?.['desinfeccao-envasadora']?.answer==='1';
 const panelEnabled=(row,entry,data)=>row.code!=='4.6.8'||entry.index!==1||capsDisinfected(entry.scope,data);

 function prepareCaps(){
  const phrase={
   text:'Quando a envasadora realiza a desinfecção das tampas, deve controlar o processo e proteger os lotes até o envase.',
   guidance:'Confira a adequação do desinfetante e da área de desinfecção, os registros de controle e os laudos microbiológicos por lote. Acompanhe o transporte das tampas em recipientes higienizados e fechados. Verifique se a desinfecção ocorre fora do silo e da área de envase.',
   appcc:'PCC',fieldSuffix:'CQ_DesinfeccaoTampas'
  };
  for(const page of BPF_PHRASES)for(const row of page.rows){
   if(row.code!=='4.6.8'||row.phrases.length!==1)continue;
   row.phrases.push({...phrase});
   for(const scope of row.scopes)scope.phrases.push({...phrase});
  }
 }
 const synchronizedItems=new Set(['4.1.3','4.2.2','4.2.7','4.2.8','4.2.9','4.3.2','4.3.5','4.6.3','4.6.5','4.6.6','4.6.8','4.7.8']);
 function registerReview(entries,byKey){
  for(const page of BPF_PHRASES)for(const row of page.rows){
   if(!synchronizedItems.has(row.code))continue;
   for(const panel of bpfPanels(page,row)){
    const config=get(row,panel.id);
    if(!config)continue;
    const index=panel.id;
    for(const criterion of config.checks){
     const key=[page.page,row.code,'F'+(index+1),'check',criterion.id].join(':');
     const mode=criterion.yesOnly?'Marcação somente em Sim.':criterion.noOnly?'Marcação somente em Não.':criterion.optional?'Sim ou Não. Pode ficar em branco.':'Responda Sim ou Não quando aplicável.';
     const context=criterion.route==='silo'?'Com silo.':criterion.route==='direto'?'Sem silo.':criterion.requires==='relatorio-operacao-lavadora'?'Exibida quando a apresentação do relatório está marcada Sim.':criterion.requires==='filtro'?'Exibida quando a presença do filtro está marcada Sim.':criterion.section||'';
     const optionalDetails=criterion.details==='filter'?'A frequência de troca pode ficar em branco.':
      criterion.frequencyOptional?'A periodicidade pode ficar em branco.':'';
     criterion.guidance=[mode,context,config.optional&&!criterion.optional?'A verificação pode ficar em branco.':'',
      optionalDetails].filter(Boolean).join(' ');
     const ref={
      set text(value){criterion.label=value;},
      set guidance(value){criterion.guidance=value;}
     };
     const entry={key,page:page.page,code:row.code,index,
      label:'F'+(index+1)+' — '+(config.inline?'Envasadora Automática · ':'')+criterion.label,
      scopes:[],appcc:row.phrases[index].appcc||'',original:{text:criterion.label,guidance:criterion.guidance},refs:[ref]};
     entries.push(entry);
     byKey.set(key,entry);
    }
   }
  }
 }
 function capsExamples(examples){
  examples['4.6.8/2']=[
   'A envasadora desinfetou as tampas do lote [identificação] em [local], utilizando [produto]. O lote foi transportado em recipiente higienizado e fechado. Foi apresentado o laudo microbiológico [identificação/data].',
   'Para o lote de tampas [identificação], constatou-se [desvio na desinfecção, no ambiente ou no transporte, ou ausência da análise microbiológica]. A evidência foi [descrever].'
  ];
 }

 function init(data){
  for(const page of BPF_PHRASES)for(const row of page.rows)for(const scope of row.scopes){
   for(const entry of entriesFor(row,scope)){
    const name=key(entry);
    data.fields[name]={name,type:'/Tx',flags:0,label:row.code+' F'+(entry.index+1)+' — '+bpfScopeLabel(page,scope)+' — verificações',options:[],calc:'',phrasePage:page.page};
   }
  }
 }

 function requiredChecks(panel,selected,state){
  if(panel.optional)return [];
  if(panel.sectioned)return panel.checks.filter(c=>!c.yesOnly&&selected.some(item=>item.section===c.section));
  return panel.all?panel.checks.filter(c=>!c.yesOnly&&!c.noOnly&&!c.optional&&active(c,state)):[];
 }

 function result(panel,state){
  if(panel.allowNA&&state.notApplicable)return '2';
  const selected=panel.checks.filter(c=>answered(c,state));
  if(!selected.length||(panel.capRoute&&!panel.optional&&!state.route)||requiredChecks(panel,selected,state).some(c=>!answered(c,state)))return '';
  if(panel.alternatives)return selected.some(c=>state[c.id].answer==='1')?'1':'0';
  return selected.some(c=>!c.yesOnly&&state[c.id].answer===(c.negative?'1':'0'))?'0':'1';
 }

 function apply(row,scope,data){
  for(const entry of entriesFor(row,scope)){
   const state=read(entry,data);
   if(!panelEnabled(row,entry,data)){
    data[entry.name]='';
   }else if(state){
    data[entry.name]=result(get(row,entry.index),state);
    if(row.code==='4.7.8'){
     const answers=bpfF1Checks(row,scope).map(check=>data[check.name]);
     const answer=answers.includes('0')?'0':answers.every(value=>value==='1')?'1':'';
     data[bpfPhraseName(scope,0)]=answer;
     if(!answer)data[scope.name]='Off';
    }
   }
  }
 }

 function records(row,entry,data){
  const state=read(entry,data);
  if(!state||!panelEnabled(row,entry,data))return [];
  if(state.notApplicable&&get(row,entry.index).allowNA)return [];
  return get(row,entry.index).checks.filter(c=>answered(c,state)).map(c=>{
   const item=state[c.id];
   let details='';
   if(item.answer==='1'||(c.detailsOnNo&&item.answer==='0'))switch(c.details){
    case 'sanitizers':
     details=products.filter(([id])=>item.products?.[id]?.selected).map(([id,label])=>{
      const product=item.products[id];
      return (id==='outros'?text(product.name)||label:label)+
       (product.frequency?' — '+(product.frequency==='Outra'?text(product.otherFrequency)||'Outra':product.frequency):'');
     }).join(', ');
     break;
    case 'packaging-sanitizers':
     details= c.products.filter(([id])=>item.products?.[id]).map(([id,label])=>
      id==='outros'?text(item.otherProduct)||label:label).join(', ');
     break;
    case 'telemetry':
     details=telemetry.filter(([id])=>item.parameters?.[id]).map(([,label])=>label).join(', ');
     break;
    case 'residue':
     details=[item.recorded==='1'?'Registra o resultado':item.recorded==='0'?'Não registra o resultado':'',
      ...(c.tests||tests).filter(([id])=>item.tests?.[id]).map(([id,label])=>id==='outros'?text(item.otherTest)||label:label)
     ].filter(Boolean).join(', ');
     break;
    case 'inspection-frequency': details=text(item.frequency)&&'Frequência da inspeção visual interna: '+text(item.frequency);break;
    case 'filter': details=text(item.frequency)&&'Frequência de troca: '+text(item.frequency);break;
    case 'recirculation': details=text(item.procedure);break;
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
  const units=(config.inline?machineEntries(panel):panel.entries).map(entry=>({
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
   if(config.capRoute&&checklist.length){
    const routes=units.filter(unit=>unit.checks.some(check=>check.answer===answer)).map(unit=>{
     const route=read(unit.entry,data)?.route;
     return route?unit.label+' — '+(route==='silo'?'Com silo':'Sem silo'):'';
    }).filter(Boolean);
    if(routes.length)checklist.unshift('Transporte das tampas: '+routes.join(' / '));
   }
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
  if(item.answer!=='1')return !!(criterion.detailsOnNo&&item.answer==='0'&&item.products?.outros&&!text(item.otherProduct));
  switch(criterion.details){
   case 'sanitizers': {
    const selected=products.filter(([id])=>item.products?.[id]?.selected);
    return !selected.length||selected.some(([id])=>{
     const p=item.products[id];
     return (!criterion.frequencyOptional&&!p.frequency)||(id==='outros'&&!text(p.name))||(p.frequency==='Outra'&&!text(p.otherFrequency));
    });
   }
   case 'packaging-sanitizers':
    return !criterion.products.some(([id])=>item.products?.[id])||(item.products?.outros&&!text(item.otherProduct));
   case 'telemetry': return !telemetry.some(([id])=>item.parameters?.[id]);
   case 'residue': return !item.recorded||!(criterion.tests||tests).some(([id])=>item.tests?.[id])||(item.tests.outros&&!text(item.otherTest));
   case 'recirculation': return !recirculation.includes(item.procedure);
   case 'measure': return !text(item.description);
   default: return false;
  }
 }

 function validate(page,row,panels,content){
  for(const panel of panels){
   const config=get(row,panel.id);
   if(!config||config.optional)continue;
   for(const entry of config.inline?machineEntries(panel):panel.entries){
    const state=read(entry,values);
    if(!panelEnabled(row,entry,values)||(config.allowNA&&state?.notApplicable))continue;
    const selected=state?config.checks.filter(c=>answered(c,state)):[];
    const requiredF2=row.code==='4.6.8'&&panel.id===1;
    if(!selected.length&&!requiredF2)continue;
    if(config.capRoute&&!state.route){
     alert('Item 4.6.8 — F1: selecione se a transferência das tampas utiliza silo.');
     return false;
    }
    const missing=requiredChecks(config,selected,state||{}).find(c=>!state||!answered(c,state));
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

  function options(entries,values,onToggle,sync=false){
   for(const [id,label] of entries){
    const row=element('label',label);
    row.className='bpf-water-choice';
    const input=element('input');
    input.type='checkbox';
    input.checked=!!values[id];
    if(sync)updates.push(()=>{input.checked=!!values[id];});
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
      if(!criterion.explicitAnswer)item.answer=Object.values(item.products).some(p=>p.selected)?'1':'';
      save();
     };
     updates.push(update);
    }
    break;
   case 'packaging-sanitizers': {
    item.products??={};
    options(criterion.products,item.products,(id,selected)=>{
     item.products[id]=selected;
     save();
    },true);
    const other=field('Identifique o outro produto',item.otherProduct,value=>{item.otherProduct=value;save();});
    const input=other.querySelector('textarea');
    updates.push(()=>{
     other.hidden=!item.products.outros;
     const value=item.otherProduct||'';
     if(input.value!==value)input.value=value;
    });
    break;
   }
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
    options(criterion.tests||tests,item.tests,(id,selected)=>{
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
   case 'recirculation':
    field('Procedimento de recirculação',item.procedure,value=>{item.procedure=value;save();},recirculation);
    break;
   case 'measure': field('Descreva a medida de controle',item.description,value=>{item.description=value;save();},null,4);break;
  }
 }

 function render(card,page,row,panel){
  const config=get(row,panel.id);
  if(!config||config.inline&&!panel.machineDetails)return false;
  if(row.code==='4.6.8'&&panel.id===1){
   card.dataset.bpfCapsF2='';
   card.hidden=!panel.entries.some(entry=>panelEnabled(row,entry,values));
  }
  const hint=element('p',config.optional?'As verificações deste quadro podem ficar em branco. Marque as opções aplicáveis.':config.sectioned?'Em cada linha avaliada, responda a todas as perguntas com Sim e Não do quadro utilizado.':config.all?'Responda às verificações com opções Sim e Não da unidade avaliada.':'Marque uma ou mais verificações por unidade.');
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
   const prompt=config.answerPrompts?.[answer];
   box.append(element('legend',panel.label+' — '+heading+(prompt?' ('+prompt+')':'')));
   answerGrid.append(box);
   boxes.set(answer,box);
  }
  for(const entry of panel.entries){
   const previous=read(entry,values);
   const existingAnswer=values[entry.name];
   const state=previous||(config.simple&&['1','0'].includes(existingAnswer)
    ? {[config.checks[0].id]:{answer:existingAnswer}} : null)||(row.code==='4.2.2'&&panel.id===1?{integrityPositive:true}:{});
   const label=bpfScopeLabel(page,entry.scope);
   if(config.allowNA&&existingAnswer==='2'&&!previous)state.notApplicable=true;
   const legacy=previous||config.simple?'':bpfAnswerLabel(existingAnswer);
   const legacyLines=[];
   const rows=[];
   const save=()=>{
    for(const line of legacyLines)line.hidden=true;
    values[key(entry)]=JSON.stringify(state);
    values[entry.name]=result(config,state);
    if(!values[entry.name])values[entry.scope.name]='Off';
    refresh();
    if(config.inline)apply(row,entry.scope,values);
    if(config.capRoute){
     const followup=card.parentElement?.querySelector('[data-bpf-caps-f2]');
     if(followup)followup.hidden=!capsDisinfected(entry.scope,values);
    }
    changed();
    recalc();
   };
   const refresh=()=>{
    for(const control of rows)control();
   };
   if(config.capRoute){
    const label=element('label','Transporte das tampas');
    const route=element('select');
    for(const [value,caption] of [['','Selecione'],['direto','Sem silo'],['silo','Com silo']]){
     const option=element('option',caption);
     option.value=value;
     route.append(option);
    }
    route.value=state.route||'';
    route.onchange=()=>{state.route=route.value;save();};
    label.append(route);
    answerGrid.prepend(label);
   }
   if(config.allowNA){
    const control=element('label',label+' — Não se aplica (copos descartáveis)');
    control.className='bpf-water-choice';
    const input=element('input');
    input.type='checkbox';
    input.checked=!!state.notApplicable;
    input.onchange=()=>{state.notApplicable=input.checked;save();};
    control.prepend(input);
    answerGrid.prepend(control);
   }
   for(const [answer,box] of boxes){
    const heading=answer==='1'?'Sim':'Não';
    const directChoice=config.simple||(config.negativePerScope&&answer==='0');
    const section=element(directChoice?'div':'details');
    section.className='bpf-water-unit';
    section.dataset.waterEntry=entry.name;
    if(!directChoice)section.append(element('summary',label));
    const legacyLine=element('p',legacy?'Avaliação geral registrada: '+legacy+'.':'');
    legacyLine.hidden=!legacy;
    legacyLines.push(legacyLine);
    section.append(legacyLine);
    box.append(section);
    const groups=new Map();
    for(const criterion of config.checks){
     if((criterion.yesOnly&&answer==='0')||(criterion.noOnly&&answer==='1'))continue;
     const item=state[criterion.id]??={};
     const line=element('div');
     line.className='bpf-water-row';
     if(criterion.section&&!groups.has(criterion.section)){
      const group=element('fieldset');
      group.append(element('legend',criterion.section));
      groups.set(criterion.section,group);
      section.append(group);
     }
     (groups.get(criterion.section)||section).append(line);
     if(criterion.details==='sanitizers'&&!criterion.explicitAnswer&&answer==='1'){
      const title=element('strong',criterion.label);
      title.className='bpf-water-caption';
      line.append(title);
      fields(line,criterion,item,save,rows);
      continue;
     }
     const caption=directChoice?label:criterion.label;
     const control=element('label');
     const emphasisIndex=criterion.boldText?caption.indexOf(criterion.boldText):-1;
     if(emphasisIndex>=0){
      control.append(caption.slice(0,emphasisIndex),element('strong',criterion.boldText),
       caption.slice(emphasisIndex+criterion.boldText.length));
     }else{
      control.textContent=caption;
     }
     control.className='bpf-water-choice';
     if(criterion.guidance)control.title=criterion.guidance;
     const input=element('input');
     input.type='checkbox';
     input.setAttribute('aria-label',directChoice?label+' — '+heading:label+' — '+criterion.label+' — '+heading);
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
     const showDetails=criterion.details&&(answer==='1'||criterion.detailsOnNo);
     if(showDetails)fields(extra,criterion,item,save,rows);
     line.append(extra);
     rows.push(()=>{
      const enabled=!state.notApplicable&&active(criterion,state);
      input.checked=enabled&&item.answer===answer;
      input.disabled=!enabled;
      line.hidden=!enabled;
      extra.hidden=!enabled||item.answer!==answer||!showDetails;
     });
    }
   }
   refresh();
  }
  if(config.inline)return true;
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
 function renderMachine(card,page,row,panel){
  if(row.code!=='4.7.8'||panel.id!==0)return;
  const section=element('fieldset');
  section.className='bpf-answer-box';
  section.append(element('legend','Envasadora Automática'));
  render(section,page,row,{...panel,label:'Envasadora Automática',entries:machineEntries(panel),machineDetails:true});
  card.append(section);
 }
 return {get,registerReview,renderMachine,prepareCaps,capsExamples,init,apply,report,summary,validate,render};
})();

