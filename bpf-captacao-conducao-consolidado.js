/* Verificações de Captação e Condução, registradas por unidade e frase. */
const bpfWaterCheck = (() => {
 const check = (id, label, options = {}) => ({id, label, ...options});
 const sanitizers = (label, options) => check('saneantes', label, {details:'sanitizers', ...options});
 const yes = (id, label, details) => check(id, label, {yesOnly:true, details});
 const controls = disinfection => [
  check('telemetria','Existe telemetria em linha',{yesOnly:true,confirmationOnly:true,details:'telemetry'}),
  yes('residuo','Após a desinfecção '+disinfection+', testa a ausência de resíduo de saneante na água após o enxágue','residue'),
  yes('microbiologia','Após a desinfecção '+disinfection+', testa a ausência de contaminação microbiológica'),
  yes('atp','Após a desinfecção '+disinfection+', faz teste de bioluminescência de ATP'),
  check('fluorescente','Após a desinfecção '+disinfection+', faz teste fluorescente?')
 ];
 const blownChecks = [
  check('uso-imediato','As embalagens sopradas são utilizadas imediatamente e sem contato manual?',{noLabel:'As embalagens sopradas não são utilizadas imediatamente e ocorre contato manual'}),
  yes('ar-sopro-filtrado','As pré-formas são sopradas com ar comprimido com filtro de ar microbiológico.'),
  yes('analise-ar-comprimido','O ar comprimido é coletado e enviado para análises microbiológicas.'),
  yes('transporte-ar-filtrado','As embalagens são movimentadas com sopradores de ar com filtro de ar microbiológico.')
 ].map(criterion=>({...criterion,section:'Embalagens sopradas no estabelecimento'}));
 const returnableRinse={simple:true,checks:[
  check('avaliacao-enxague','Avaliação do enxágue com solução desinfetante')
 ]};
 const disposableRinse={allowNA:true,separateInformation:true,exclusiveScopeAnswer:true,checks:[
  check('sim-descartaveis','Sim',{yesOnly:true,scopeAnswer:true}),
  check('nao-descartaveis','Não',{noOnly:true,scopeAnswer:true}),
  ...blownChecks,
  ...[
   check('concentracao','O enxágue com desinfetante das embalagens é feito na concentração adequada (validada)?'),
   check('bicos-pressao','Os bicos estão desobstruídos e a pressão dos jatos permite que a solução desinfetante alcance o fundo das garrafas?'),
   check('escoamento','O tempo após o enxágue é suficiente para o escoamento de toda a solução desinfetante?'),
   check('sanitizantes-embalagens','Sanitizantes utilizados para descontaminação ou desinfecção das embalagens',{
    yesOnly:true,details:'packaging-sanitizers',products:[['ozonio','Ozônio'],['outros','Outro']]
   }),
   check('telemetria-concentracao','Existe telemetria em linha da concentração do desinfetante utilizado para controlar e monitorar sua reposição.',{yesOnly:true})
  ].map(criterion=>({...criterion,section:'Enxágue com solução desinfetante'}))
 ]};
 const fillingMachine={inline:true,separateInformation:true,questionsInInformation:true,checks:[
  check('registros-desinfeccao-envasadora','Apresentou registros de descontaminação ou desinfecção da envasadora Automática?',{
   noLabel:'Não apresentou registros de descontaminação ou desinfecção da envasadora Automática'}),
  check('saneantes','Quais são os sanitizantes utilizados para descontaminação ou desinfecção de rotina da envasadora?',{
   details:'sanitizers',informationList:true,reportLabel:'Sanitizantes utilizados para descontaminação ou desinfecção de rotina da envasadora',frequencyOptional:true}),
  check('residuo','Após a desinfecção da envasadora, testa a ausência de resíduo de saneante na água após o enxágue?',{
   details:'residue',optionalDetails:true,tests:[['dpd','Fotômetro de bolso (DPD)'],['ortotolidina','Kit de gotas (Ortotolidina)'],['outros','Outro']]}),
  check('microbiologia','Após o enxágue da envasadora, testa a ausência de contaminação microbiológica?'),
  check('atp','Após o enxágue da envasadora, faz teste de bioluminescência de ATP?'),
  check('fluorescente','Após o enxágue da envasadora, faz teste fluorescente?')
 ]};
 const returnableInspection=checks=>({
  separateInformation:true,exclusiveScopeAnswer:true,questionsInInformation:true,
  checks:[
   check('sim-lavagem','Sim',{yesOnly:true,scopeAnswer:true}),
   check('nao-lavagem','Não',{noOnly:true,scopeAnswer:true}),
   ...checks
  ]
 });
 const prewashChecks=[
  check('rotulo','Faz a remoção do rótulo?'),
  check('sujidade-interna','Faz a remoção das sujidades da superfície interna?'),
  check('sujidade-externa','Faz a remoção das sujidades da superfície externa?')
 ];
 const surfaceChecks=[
  check('revestimento-piso','Revestimento do piso adequado?',{yesLabel:'O revestimento do piso é adequado',noLabel:'O revestimento do piso não é adequado'}),
  check('revestimento-parede','Revestimento da parede adequado?',{yesLabel:'O revestimento da parede é adequado',noLabel:'O revestimento da parede não é adequado'}),
  check('revestimento-teto','Revestimento do teto adequado?',{yesLabel:'O revestimento do teto é adequado',noLabel:'O revestimento do teto não é adequado'}),
  check('revestimento-porta','Revestimento da porta adequado?',{yesLabel:'O revestimento da porta é adequado',noLabel:'O revestimento da porta não é adequado'})
 ].map(criterion=>({...criterion,section:'Revestimentos lisos, de cor clara, impermeáveis e laváveis'}));
 const doorChecks=[
  check('fechamento-automatico','Possuem dispositivo de fechamento automático?',{yesLabel:'As portas possuem dispositivo de fechamento automático',noLabel:'As portas não possuem dispositivo de fechamento automático'}),
  check('ajuste-batentes','São ajustadas aos batentes?',{yesLabel:'As portas são ajustadas aos batentes',noLabel:'As portas não são ajustadas aos batentes'}),
  check('conservacao-portas','Estão em adequado estado de conservação?',{yesLabel:'As portas estão em adequado estado de conservação',noLabel:'As portas não estão em adequado estado de conservação'})
 ].map(criterion=>({...criterion,section:'Portas da antessala e sala de envase'}));
 const fillingChecks={
  '4.7.4':[
   check('inclinacao-piso','O piso possui inclinação suficiente para facilitar o escoamento de água?',{yesLabel:'O piso possui inclinação suficiente para facilitar o escoamento de água',noLabel:'O piso não possui inclinação suficiente para facilitar o escoamento de água'}),
   check('ralo-sifonado','A sala de envase possui ralo sifonado com tampa escamoteável?',{yesLabel:'A sala de envase possui ralo sifonado com tampa escamoteável',noLabel:'A sala de envase não possui ralo sifonado com tampa escamoteável'}),
   check('luminarias-protegidas','As luminárias da sala de envase são protegidas contra quebras?',{yesLabel:'As luminárias da sala de envase são protegidas contra quebras',noLabel:'As luminárias da sala de envase não são protegidas contra quebras'}),
   check('ventilacao','A sala de envase possui ventilação capaz de manter o ambiente livre de condensação de vapor de água?',{yesLabel:'A sala de envase possui ventilação capaz de manter o ambiente livre de condensação de vapor de água',noLabel:'A sala de envase não possui ventilação capaz de manter o ambiente livre de condensação de vapor de água'})
  ],
  '4.7.5':[
   check('lavatorio-exclusivo','Lavatório exclusivo para higiene das mãos?',{yesLabel:'O lavatório é exclusivo para higiene das mãos',noLabel:'O lavatório não é exclusivo para higiene das mãos'}),
   check('torneira','Lavatório com torneira acionada sem contato manual?',{yesLabel:'O lavatório possui torneira acionada sem contato manual',noLabel:'O lavatório não possui torneira acionada sem contato manual'}),
   check('sabonete','Lavatório com sabonete líquido inodoro?',{yesLabel:'O lavatório dispõe de sabonete líquido inodoro',noLabel:'O lavatório não dispõe de sabonete líquido inodoro'}),
   check('antisseptico','Lavatório com produto antisséptico?',{yesLabel:'O lavatório dispõe de produto antisséptico',noLabel:'O lavatório não dispõe de produto antisséptico'}),
   check('secagem','Sistema de secagem das mãos acionado sem contato manual?',{yesLabel:'O sistema de secagem das mãos é acionado sem contato manual',noLabel:'O sistema de secagem das mãos não é acionado sem contato manual'})
  ],
  '4.7.6':[
   check('uniforme-limpo','Utiliza uniformes limpos?',{yesLabel:'Utiliza uniformes limpos',noLabel:'Não utiliza uniformes limpos'}),
   check('troca-uniforme','Troca os uniformes diariamente?',{yesLabel:'Troca os uniformes diariamente',noLabel:'Não troca os uniformes diariamente'}),
   check('uniforme-exclusivo','Utiliza uniformes de uso exclusivo para essa área?',{yesLabel:'Utiliza uniformes de uso exclusivo para essa área',noLabel:'Não utiliza uniformes de uso exclusivo para essa área'})
  ],
 };
 const fillingF2Indices={'4.7.4':[4,1,2,3],'4.7.5':[1,4,2,5,3]};
 const panels = {
  '4.7.4':{1:returnableInspection(fillingChecks['4.7.4'])},
  '4.7.5':{1:returnableInspection(fillingChecks['4.7.5'])},
  '4.7.6':{0:returnableInspection(fillingChecks['4.7.6'])},
  '4.7.2':{0:returnableInspection([...surfaceChecks,...doorChecks])},
  '4.7.8':{0:fillingMachine},
  '4.6.3':{0:returnableRinse},
  '4.6.4':{0:returnableInspection(prewashChecks)},
  '4.6.5':{0:returnableInspection([
   check('relatorio-operacao-lavadora','Foi apresentado o relatório de avaliação das condições de operação do maquinário automático utilizado para limpeza e desinfecção de embalagens retornáveis?'),
   check('produtos-lavagem-desinfeccao','Quais são os produtos químicos utilizados para limpeza e desinfecção das embalagens?',{
    details:'packaging-sanitizers',informationList:true,reportLabel:'Produtos químicos utilizados para limpeza e desinfecção das embalagens',
    products:[
     ['detergente-clorado','Detergente alcalino clorado'],['soda-caustica','Soda cáustica'],
     ['hipoclorito-com-soda','Hipoclorito de sódio com Soda Cáustica'],['hipoclorito','Hipoclorito de sódio'],
     ['ozonio','Ozônio'],['outros','Outro']
    ]
   }),
   check('reposicao-produtos','A reposição dos produtos químicos é feita manualmente ou através de dosadora?',{
    answerLabels:{'1':'Manualmente','0':'Dosadora'}
   })
  ])},
  '4.1.3':{
   0:{separateInformation:true,checks:[
    check('higienizacao-adequada','Sim',{yesOnly:true,scopeAnswer:true}),
    sanitizers('Sanitizantes utilizados na descontaminação ou desinfecção de rotina do poço ou surgência',{yesOnly:true,frequencyOptional:true}),
    check('filtro','Possui filtro de ar microbiológico no poço (surgência apenas em drenos)',{details:'filter',yesOnly:true}),
    check('registro-filtro','Possui registro de troca do filtro de ar microbiológico',{requires:'filtro',yesOnly:true}),
    yes('pop-registros','O POP e os registros de limpeza e higienização estão disponíveis na casa de proteção'),
    ...controls('do poço ou surgência'),
    check('nao-captacao','Não',{noOnly:true,scopeAnswer:true})
   ]},
   2:{all:true,answerPrompts:{'1':'informe os registros de limpeza apresentados','0':'informe os registros de limpeza não apresentados'},checks:[
    check('externa','Área externa (pavimentação, calhas de drenagem, etc.)'),
    check('interior','Interior da casa de captação (piso, paredes, tubulações, etc.)'),
    check('captacao','Captação (poço ou surgência)')
   ]}
  },
  '4.2.2':{
   0:{separateInformation:true,informationHeading:'Outras observações',checks:[
    check('sim-conducao','Sim',{yesOnly:true,scopeAnswer:true}),
    check('nao-conducao','Não',{noOnly:true,scopeAnswer:true}),
    yes('certificado','Certificado de grau alimentício'),
    yes('declaracao','Declaração de grau alimentício'),
    yes('nota-fiscal','Nota Fiscal do material')
   ]},
   1:{all:true,checks:[
    check('vazamento','Tubulação e/ou conexões sem vazamento',{noLabel:"Tubulação e/ou conexões com vazamento"}),
    check('abaulada','Tubulação sem abaulamento e/ou com suportes suficientes',{noLabel:"Tubulação com abaulamento e/ou sem suportes adequados"}),
    check('integra','Tubulação sem avarias e/ou lisa e íntegra',{noLabel:"Tubulação com avarias e/ou sem superfície lisa e íntegra"}),
    check('corrosao','Tubulação e conexões sem corrosão',{noLabel:"Tubulação e/ou conexões com corrosão"}),
    check('emendas','Tubulações com emendas ou conexões sanitárias',{noLabel:"Tubulações sem emendas ou conexões sanitárias"}),
    check('acesso','Tubulação acessível e sem vegetação que impeça a inspeção',{noLabel:'Tubulação inacessível ou com vegetação que impeça a inspeção'})
   ]}
  },
  '4.6.8':{
   0:returnableInspection([
    check('declaracao','Possui declaração do fabricante de desinfecção do lote de tampas em uso?',{keepLabel:true}),
    check('analise-tampas-recebidas','É feita a análise microbiológica dos lotes das tampas recebidas com declaração de desinfecção?',{yesOnly:true,confirmationOnly:true}),
    check('dupla-embalagem','Os sacos com as tampas são enviados com embalagens primária e secundária?'),
    check('desinfeccao-envasadora','Faz a desinfecção das tampas na envasadora?'),
    check('retirada-envase','A embalagem secundária é retirada imediatamente antes do transporte para a sala de envase?',{section:'Sem Silo'}),
    check('armazenamento-primaria','Os sacos com apenas a embalagem primária são mantidos fora do piso e dos equipamentos da sala de envase?',{section:'Sem Silo'}),
    check('retirada-silo','A embalagem secundária é retirada imediatamente antes do transporte para o silo de transferência?',{section:'Com Silo'}),
    check('localizacao-silo','O silo está instalado em área adequada?',{section:'Com Silo'}),
    check('filtro-silo','O soprador do silo possui filtro de ar microbiológico?',{section:'Com Silo'}),
    check('transporte-silo','O silo utiliza transportador fechado ou protegido?',{section:'Com Silo'})
   ]),
   1:returnableInspection([
    check('desinfetante-tampas','As tampas são desinfetadas com desinfetantes adequados?',{
     details:'packaging-sanitizers',detailsOnNo:true,products:[['ozonio','Ozônio'],['outros','Outro']]
    }),
    check('ambiente-desinfeccao','O ambiente onde é feita a desinfecção é adequado?'),
    check('transporte-tampas-envase','As tampas desinfetadas são transportadas para a sala de envase em recipientes higienizados e com tampa?'),
    check('transporte-tampas-silo','As tampas desinfetadas são transportadas para o silo em recipientes higienizados e com tampa?'),
    check('analise-tampas','É feita a análise microbiológica dos lotes desinfetados de tampas?'),
    check('fora-silo','A desinfecção é realizada dentro do silo?'),
    check('fora-envase','A desinfecção é realizada na sala de envase ou na antessala?')
   ].map(criterion=>({...criterion,section:'Higienização de tampas'})))
  },
  '4.6.6':{
   0:returnableInspection([
    check('teste-arraste','O teste de arraste foi demonstrado?'),
    check('registros-residuos','Há registros dos testes de resíduos?'),
    ...[
     check('instrumento-adequado','O instrumento portátil é adequado ao desinfetante utilizado?'),
     check('enxague-final','O teste após o enxágue final indicou ausência de resíduos detectáveis pelo método utilizado?'),
     check('criterio-zero','O teste de arraste é adequado ao desinfetante utilizado e adota 0,0 mg/L como critério de aceitação, interpretado conforme o limite de detecção do método?',{
      yesLabel:'O teste de arraste é adequado ao desinfetante utilizado e adota 0,0 mg/L como critério de aceitação, interpretado conforme o limite de detecção do método',
      noLabel:'O teste de arraste não atende ao critério de adequação ao desinfetante utilizado e de aceitação a 0,0 mg/L, interpretado conforme o limite de detecção do método'
     })
    ].map(criterion=>({...criterion,hideWhenAllNo:['teste-arraste','registros-residuos']}))
   ]),
   1:returnableInspection([
    check('sem-acumulo-enxague','Os garrafões após o enxágue com água mineral natural saem sem acúmulo de água de enxágue no seu interior?'),
    check('bicos-pressao','Os bicos estão desobstruídos e a pressão dos jatos permite que a água de enxágue alcance o fundo das embalagens?')
   ])
  },
  '4.3.5':{0:{separateInformation:true,checks:[
   check('higienizacao-adequada','Sim',{yesOnly:true,scopeAnswer:true}),
   check('nao-reservatorio','Não',{noOnly:true,scopeAnswer:true}),
    sanitizers('Sanitizantes utilizados para descontaminação ou desinfecção de rotina do reservatório',{yesOnly:true,frequencyOptional:true}),
   check('recirculacao','Procedimento adotado para recirculação do sanitizante no tanque',{yesOnly:true,details:'recirculation'}),
   ...controls('do reservatório')
  ]}},
  '4.3.4':{0:{simple:true,checks:[
   check('inspecao-visual','Inspeção visual do reservatório')
  ]}},
  '4.3.2':{
   0:{separateInformation:true,checks:[
    check('sim-reservatorio','Sim',{yesOnly:true,scopeAnswer:true}),
    check('nao-reservatorio','Não',{noOnly:true,scopeAnswer:true}),
    yes('certificado','Certificado de grau alimentício'),
    yes('declaracao','Declaração de grau alimentício'),
    yes('nota-fiscal','Nota Fiscal do material')
   ]},
   1:{all:true,checks:[
    check('integro','Reservatório sem avarias e/ou liso e íntegro',{noLabel:'Reservatório com avarias e/ou sem superfície lisa e íntegra'}),
    check('corrosao','Reservatório e conexões sem corrosão',{noLabel:'Reservatório e/ou conexões com corrosão'}),
    check('conexoes-sanitarias','Reservatório com conexões sanitárias',{noLabel:'Reservatório sem conexões sanitárias'}),
    check('sem-vincos-amassados','Reservatório com paredes sem vincos ou amassados',{noLabel:'Reservatório com paredes com vincos ou amassados'})
   ]},
   2:{all:true,checks:[
    check('sem-vazamento','Reservatório e/ou conexões sem vazamento',{noLabel:'Reservatório e/ou conexões com vazamento'}),
    check('escotilha-parede','Reservatório com escotilha na parede para acesso interno',{noLabel:'Reservatório sem escotilha na parede para acesso interno'}),
    check('escotilha-teto','Reservatório com escotilha de vidro no teto para inspeção visual',{yesOnly:true,informationOnly:true,confirmationOnly:true})
   ]}
  },
  '4.2.7':{0:{separateInformation:true,checks:[
   check('higienizacao-adequada','Sim',{yesOnly:true,scopeAnswer:true}),
   check('nao-conducao','Não',{noOnly:true,scopeAnswer:true}),
   sanitizers('Sanitizantes utilizados na descontaminação ou desinfecção de rotina da condução',{yesOnly:true,frequencyOptional:true}),
   ...controls('da condução')
  ]}},
  '4.2.8':{
   0:{all:true,checks:[
    check('pop-desmonte','POP contempla o desmonte e a frequência',{noLabel:'O POP não contempla o desmonte e a frequência'}),
    check('registros-desmonte','Registros do desmonte e troca de componentes (o-ring)',{optional:true,noLabel:'Não possui registros de desmonte e troca de componentes (o-ring)'}),
    check('inspecao-visual','Realiza e registra inspeção visual interna das tubulações',{yesOnly:true})
   ]},
   1:{singleNo:true,checks:[
    yes('reparo','Possui registro de reparo das tubulações e conexões'),
    yes('passivacao','Possui registros de passivação e/ou desincrustação'),
    check('nao-conducao','Não',{noOnly:true,scopeAnswer:true}),
    check('pop-com-historico','O POP contempla histórico de revisão de operações de higienização?',{informationOnly:true})
   ]}
  },
  '4.2.9':{
   0:{all:true,checks:[
    check('pop-canalizacao','Possui POP referente às operações de higienização da canalização',{noLabel:'Não possui POP referente às operações de higienização da canalização'}),
    check('implementacao','A limpeza e a higienização são realizadas com os mesmos desinfetantes informados no POP',{noLabel:'A limpeza e a higienização não são realizadas com os mesmos desinfetantes informados no POP.'})
   ]},
   1:{separateInformation:true,informationHeading:'Outras observações',checks:[
    check('sim-conducao','Sim',{yesOnly:true,scopeAnswer:true}),
    check('nao-conducao','Não',{noOnly:true,scopeAnswer:true}),
    sanitizers('Sanitizantes utilizados para descontaminação ou desinfecção de rotina da condução',{yesOnly:true,frequencyOptional:true})
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
 function migrateReturnableWash(entry,state,data){
  const formerF2=bpfPhraseName(entry.scope,1);
  const disinfection=JSON.parse(data[key({name:formerF2})]||'null');
  const answers=[data[entry.name],data[formerF2]];
  const previous=answers.includes('0')?'0':answers.every(answer=>answer==='1')?'1':'';
  const current={...state,limpezaDesinfeccaoRetornaveis:true,
   'sim-lavagem':{answer:previous==='1'?'1':''},
   'nao-lavagem':{answer:previous==='0'?'0':''}
  };
  const report=disinfection?.['relatorio-operacao-lavadora'];
  if(report)current['relatorio-operacao-lavadora']=report;
  const recordedProducts=[state?.['produtos-limpeza'],disinfection?.['sanitizantes-desinfeccao']].filter(Boolean);
  const selected=Object.fromEntries(recordedProducts.flatMap(item=>Object.entries(item.products||{}).filter(([,value])=>value)));
  if(Object.keys(selected).length){
   const otherProduct=[...new Set(recordedProducts.filter(item=>item.products?.outros).map(item=>text(item.otherProduct)).filter(Boolean))].join('; ');
   current['produtos-lavagem-desinfeccao']={answer:'1',products:selected,otherProduct};
  }
  return current;
 }
 const read = (entry,data) => {
  try {
   const name=key(entry);
   let state=JSON.parse(data[name]||'null');
   if(entry.index===0&&entry.scope.phrases[0]?.revision==='limpezaDesinfeccaoRetornaveis'){
    return state?.limpezaDesinfeccaoRetornaveis?state:migrateReturnableWash(entry,state,data);
   }
   if(!state?.['sim-lavagem']&&!state?.['nao-lavagem']){
    const row=BPF_PHRASES.filter(page=>[7,8,9,10].includes(page.page)).flatMap(page=>page.rows)
     .find(row=>['4.6.4','4.6.6','4.6.8','4.7.2','4.7.4','4.7.5','4.7.6'].includes(row.code)&&
      row.scopes.some(scope=>scope.name===entry.scope.name));
    if(row&&panels[row.code][entry.index]){
     let previous=data[entry.name];
     const groupedIndices=entry.index===1?fillingF2Indices[row.code]:null;
     const priorChecks=entry.index===0?({'4.6.4':prewashChecks,'4.7.2':[...surfaceChecks,...doorChecks],'4.7.6':fillingChecks['4.7.6']})[row.code]:groupedIndices?fillingChecks[row.code]:null;
     if(priorChecks){
      const names=groupedIndices?groupedIndices.map(index=>bpfPhraseName(entry.scope,index)):bpfF1Checks(row,entry.scope).map(check=>check.name);
      // Older prewash forms stored the removed adhesive check in the second field.
      const old=(row.code==='4.6.4'?[names[0],names[2],names[3]]:names).map(name=>data[name]);
      state??={};
      for(const [i,criterion] of priorChecks.entries()){
       if(hasAnswer(old[i])&&!state[criterion.id])state[criterion.id]={answer:old[i]};
      }
      if(groupedIndices||!hasAnswer(previous))previous=old.includes('0')?'0':old.includes('1')?'1':previous;
     }
     if(row.code==='4.6.8'&&entry.index===1&&hasAnswer(state?.['transporte-tampas']?.answer)){
      const first=JSON.parse(data[key({name:bpfPhraseName(entry.scope,0)})]||'null');
      const destination=first?.route==='silo'?'transporte-tampas-silo':first?.route==='direto'?'transporte-tampas-envase':'';
      if(destination&&!state[destination])state[destination]=state['transporte-tampas'];
     }
     if(hasAnswer(previous)){
      const id=previous==='1'?'sim-lavagem':'nao-lavagem';
      state={...state,[id]:{answer:previous}};
     }
    }
   }
   if(entry.index===0&&!state?.['avaliacao-enxague']&&hasAnswer(data[entry.name])&&
      BPF_PHRASES.some(page=>page.page===7&&
       page.rows.some(row=>row.code==='4.6.3'&&row.scopes.some(scope=>scope.name===entry.scope.name)))){
    state={...state,'avaliacao-enxague':{answer:data[entry.name]}};
   }
   if(state?.['sim-descartaveis']?.answer==='1'&&state?.['nao-descartaveis']?.answer==='0'){
    state['sim-descartaveis'].answer='';
   }
   if(entry.index===0&&!state?.['sim-descartaveis']&&!state?.['nao-descartaveis']&&
      entry.scope.phrases?.[0]?.allowNA&&BPF_PHRASES.some(page=>page.page===8&&
       page.rows.some(row=>row.code==='4.6.3'&&row.scopes.some(scope=>scope.name===entry.scope.name)))){
    const previous=data[entry.name];
    if(previous==='1'||previous==='0'){
     const id=previous==='1'?'sim-descartaveis':'nao-descartaveis';
     state={...state,[id]:{answer:previous}};
    }
   }
   if(entry.index===1&&!state?.['sem-vincos-amassados']&&reservoirStructureEntry(entry)){
    const older=JSON.parse(data[key({name:bpfPhraseName(entry.scope,2)})]||'null');
    const previous=older?.['sem-vincos-amassados']?.answer;
    const legacy=older?.['vincos-amassados']?.answer;
    const answer=previous??({'1':'0','0':'1'}[legacy]);
    if(answer==='1'||answer==='0')state={...state,'sem-vincos-amassados':{answer}};
   }
   if(entry.index===0&&!state?.['nao-captacao']&&
      (state?['higienizacao-adequada','filtro','registro-filtro','pop-registros'].some(id=>state[id]?.answer==='0'):data[entry.name]==='0')&&
      BPF_PHRASES.some(page=>page.page===0&&page.rows.some(row=>row.code==='4.1.3'&&row.scopes.some(scope=>scope.name===entry.scope.name)))){
    return {...state,'nao-captacao':{answer:'0'}};
   }
   if(entry.index===0&&!state?.['sim-conducao']&&!state?.['nao-conducao']&&getConductionCheckEntry(entry)){
    const documents=['certificado','declaracao','nota-fiscal'].map(id=>state?.[id]?.answer);
    const previous=documents.includes('1')?'1':documents.includes('0')?'0':data[entry.name];
    if(previous==='1'||previous==='0'){
     const id=previous==='1'?'sim-conducao':'nao-conducao';
     return {...state,[id]:{answer:previous}};
    }
   }
   if(entry.index===0&&!state?.['nao-conducao']&&getConductionCheckEntry(entry,'4.2.7')){
    const previous=state?.['higienizacao-adequada']?.answer??data[entry.name];
    if(previous==='0')return {...state,'nao-conducao':{answer:'0'}};
    if(previous==='1'&&!state)return {'higienizacao-adequada':{answer:'1'}};
   }
   if(entry.index===1&&!state?.['sim-conducao']&&!state?.['nao-conducao']&&getConductionCheckEntry(entry,'4.2.9')){
    const previous=(data[entry.name+'_POP_NA_anterior']??data[entry.name])||state?.saneantes?.answer;
    if(previous==='1'||previous==='0'){
     const id=previous==='1'?'sim-conducao':'nao-conducao';
     return {...state,[id]:{answer:previous}};
    }
   }
   if(entry.index===1&&getConductionCheckEntry(entry,'4.2.8')){
    if(!state?.['nao-conducao']&&(data[entry.name]==='0'||state?.['historico-pop']?.answer==='0')){
     state={...state,'nao-conducao':{answer:'0'}};
    }
    if(state&&!state['pop-com-historico']){
     const negative=state['sem-historico-pop']?.answer;
     const previous=({'1':'0','0':'1'}[negative])??state['historico-pop']?.answer;
     if(previous==='1'||previous==='0')state={...state,'pop-com-historico':{answer:previous}};
    }
   }
   if((entry.index===0&&!state?.['sim-reservatorio']&&!state?.['nao-reservatorio']||
       entry.index===1&&state?.['conexoes-nao-sanitarias']&&!state['conexoes-sanitarias'])&&
      reservoirStructureEntry(entry)){
    if(entry.index===0){
     const documents=['certificado','declaracao','nota-fiscal'].map(id=>state?.[id]?.answer);
     const previous=documents.includes('1')?'1':documents.includes('0')?'0':data[entry.name];
     if(previous==='1'||previous==='0'){
      const id=previous==='1'?'sim-reservatorio':'nao-reservatorio';
      return {...state,[id]:{answer:previous}};
     }
    }else{
     const previous=state['conexoes-nao-sanitarias'].answer;
     if(previous==='0'||previous==='1')return {...state,'conexoes-sanitarias':{answer:previous==='0'?'1':'0'}};
    }
   }
   if(entry.index===0&&!state?.['nao-reservatorio']&&reservoirStructureEntry(entry,'4.3.5')){
    const previous=state?.['higienizacao-adequada']?.answer??data[entry.name];
    if(previous==='0')return {...state,'nao-reservatorio':{answer:'0'}};
    if(previous==='1'&&!state)return {'higienizacao-adequada':{answer:'1'}};
   }
   if(state&&entry.index===2&&!state['sem-vazamento']&&reservoirStructureEntry(entry)){
    const previous=state.vazamento?.answer;
    if(previous==='1'||previous==='0')state['sem-vazamento']={answer:previous==='1'?'0':'1'};
   }
   if(state&&entry.index===1&&getConductionCheckEntry(entry)&&!state.integrityPositive){
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
 function reservoirStructureEntry(entry,code='4.3.2'){
  const row=BPF_PHRASES.find(page=>page.page===2)?.rows.find(row=>row.code===code);
  return row?.scopes.some(scope=>scope.name===entry.scope.name);
 }
 function getConductionCheckEntry(entry,code='4.2.2'){
  const row=BPF_PHRASES.find(page=>page.page===1)?.rows.find(row=>row.code===code);
  return row?.scopes.some(scope=>scope.name===entry.scope.name);
 }
 const informationHeading=panel=>panel.informationHeading||'Outras informações';
 const isInformation=(panel,criterion)=>criterion.informationOnly||(panel.separateInformation&&!criterion.scopeAnswer);
 const informationQuestions=new Set([
  'filtro','registro-filtro','pop-registros','telemetria','residuo','microbiologia','atp','fluorescente',
  'certificado','declaracao','nota-fiscal','pop-com-historico','escotilha-teto',
  'uso-imediato','ar-sopro-filtrado','analise-ar-comprimido','transporte-ar-filtrado',
  'concentracao','bicos-pressao','escoamento','telemetria-concentracao'
 ]);
 const documentQuestions={
  certificado:'Foi apresentado certificado de grau alimentício?',
  declaracao:'Foi apresentada declaração de grau alimentício?',
  'nota-fiscal':'Foi apresentada nota fiscal do material?'
 };
 const negativeStatements={
  filtro:[/^Possui /,'Não possui '],
  'registro-filtro':[/^Possui /,'Não possui '],
  'pop-registros':[/ estão disponíveis/,' não estão disponíveis'],
  telemetria:[/^Existe /,'Não existe '],
  residuo:[/, testa /,', não testa '],
  microbiologia:[/, testa /,', não testa '],
  atp:[/, faz /,', não faz '],
  fluorescente:[/, faz /,', não faz '],
  certificado:[/^Foi apresentado /,'Não foi apresentado '],
  declaracao:[/^(Foi apresentada|Possui) /,(_,verb)=>'Não '+verb.charAt(0).toLowerCase()+verb.slice(1)+' '],
  'nota-fiscal':[/^Foi apresentada /,'Não foi apresentada '],
  'pop-com-historico':[/ contempla /,' não contempla '],
  'escotilha-teto':[/ com escotilha /,' sem escotilha '],
  'ar-sopro-filtrado':[/ são sopradas /,' não são sopradas '],
  'analise-ar-comprimido':[/ é coletado /,' não é coletado '],
  'transporte-ar-filtrado':[/ são movimentadas /,' não são movimentadas '],
  concentracao:[/ é feito /,' não é feito '],
  'bicos-pressao':[/ estão desobstruídos e a pressão dos jatos permite /,' estão obstruídos e/ou a pressão dos jatos não permite '],
  escoamento:[/ é suficiente /,' não é suficiente '],
  'telemetria-concentracao':[/^Existe /,'Não existe '],
  rotulo:[/^Faz /,'Não faz '],
  'sujidade-interna':[/^Faz /,'Não faz '],
  'sujidade-externa':[/^Faz /,'Não faz '],
  'higienizacao-envasadora':[/ descontaminada e higienizada /,' não foi descontaminada e/ou higienizada '],
  'relatorio-operacao-lavadora':[/^Foi apresentado /,'Não foi apresentado '],
  'dupla-embalagem':[/ são enviados /,' não são enviados '],
  'retirada-envase':[/ é retirada /,' não é retirada '],
  'armazenamento-primaria':[/ são mantidos /,' não são mantidos '],
  'retirada-silo':[/ é retirada /,' não é retirada '],
  'localizacao-silo':[/ está instalado /,' não está instalado '],
  'filtro-silo':[/ possui /,' não possui '],
  'ozonio-silo':[/ opera sem /,' opera com '],
  'transporte-silo':[/ utiliza /,' não utiliza '],
  'desinfetante-tampas':[/ são desinfetadas /,' não são desinfetadas '],
  'ambiente-desinfeccao':[/ é adequado$/,' não é adequado'],
  'desinfeccao-envasadora':[/^Faz /,'Não faz '],
  'analise-tampas-recebidas':[/^É feita /,'Não é feita '],
  'transporte-tampas-envase':[/ são transportadas /,' não são transportadas '],
  'transporte-tampas-silo':[/ são transportadas /,' não são transportadas '],
  'analise-tampas':[/^É feita /,'Não é feita '],
  'fora-silo':[/ é realizada /,' não é realizada '],
  'fora-envase':[/ é realizada /,' não é realizada '],
  'sem-acumulo-enxague':[/ saem sem /,' saem com '],
  'teste-arraste':[/ foi demonstrado$/,' não foi demonstrado'],
  'registros-residuos':[/^Há /,'Não há '],
  'instrumento-adequado':[/ é adequado /,' não é adequado '],
  'enxague-final':[/ indicou /,' não indicou ']
 };
 const isQuestion=criterion=>criterion.informationQuestion||/\?\s*$/.test(criterion.label);
 const hasAnswer=answer=>answer==='1'||answer==='0';
 const statementForAnswer=(criterion,answer)=>{
  if(criterion.answerLabels)return 'Reposição dos produtos químicos: '+criterion.answerLabels[answer];
  if(answer==='0'&&criterion.noLabel)return criterion.noLabel;
  const statement=(answer==='1'&&criterion.yesLabel)||criterion.label.trim().replace(/\?$/,'');
  if(answer!=='0')return statement;
  const rule=negativeStatements[criterion.id];
  if(!rule||!rule[0].test(statement))return 'Resposta Não: '+statement;
  return statement.replace(...rule);
 };
 const informationalPanels=[disposableRinse,returnableRinse,
  ...Object.values(panels).flatMap(phrases=>Object.values(phrases))];
 for(const panel of informationalPanels)for(const criterion of panel.checks){
  if(!isInformation(panel,criterion)||criterion.informationList||criterion.confirmationOnly||!(panel.questionsInInformation||informationQuestions.has(criterion.id)))continue;
  if(!criterion.keepLabel)criterion.label=documentQuestions[criterion.id]||criterion.label.replace(/[.?]$/,'')+'?';
  criterion.yesOnly=false;
  criterion.informationQuestion=true;
 }
 const answerLabel=(criterion,answer)=>answer==='0'?(criterion.noLabel||criterion.label):criterion.label;
 const active = (criterion,state) =>
  (!criterion.route||state.route===criterion.route)&&(!criterion.requires||state[criterion.requires]?.answer==='1')&&
  !criterion.hideWhenAllNo?.every(id=>state[id]?.answer==='0');
 const answered = (criterion,state) => active(criterion,state)&&
  ((!criterion.noOnly&&state[criterion.id]?.answer==='1')||(!criterion.yesOnly&&state[criterion.id]?.answer==='0'));
 const text = value => typeof value==='string'?value.trim():'';

 const capsDisinfected=(scope,data)=>read({scope,index:0,name:bpfPhraseName(scope,0)},data)
  ?.['desinfeccao-envasadora']?.answer==='1';
 const conductionF2=(row,index)=>row.code==='4.2.9'&&index===1;
 const panelEnabled=(row,entry,data)=>conductionF2(row,entry.index)
  ?!bpfPopNAForced(row,entry.scope,entry.index,data)
  :row.code!=='4.6.8'||entry.index!==1||capsDisinfected(entry.scope,data);

 function preparePhrases(){
  const phrase={
   text:'Quando a envasadora realiza a desinfecção das tampas, deve controlar o processo e proteger os lotes até o envase.',
   guidance:'Confira a adequação do desinfetante e da área de desinfecção, os registros de controle e os laudos microbiológicos por lote. Acompanhe o transporte das tampas em recipientes higienizados e fechados. Verifique se a desinfecção ocorre fora do silo e da área de envase.',
   appcc:'PCC',fieldSuffix:'CQ_DesinfeccaoTampas'
  };
  for(const page of BPF_PHRASES)for(const row of page.rows){
   if(page.page===7&&row.code==='4.6.6'){
    for(const phrases of [row.phrases,...row.scopes.map(scope=>scope.phrases)]){
     const [rinse,verification]=phrases;
     // Keep the original field names so saved answers follow their phrases.
     phrases.splice(0,2,{...verification,fieldSuffix:verification.fieldSuffix??2},{...rinse,fieldSuffix:rinse.fieldSuffix??1});
    }
   }
   if(page.page===7&&row.code==='4.6.5'){
    for(const phrases of [row.phrases,...row.scopes.map(scope=>scope.phrases)]){
     Object.assign(phrases[0],{
      text:'As embalagens retornadas para um novo ciclo de uso devem ser submetidas à limpeza e desinfecção em maquinário automático.',
      guidance:'Verifique se a limpeza e a desinfecção são realizadas em maquinário automático. Confira o relatório de avaliação, os produtos químicos utilizados e a forma de reposição.',
      appcc:'PCC',revision:'limpezaDesinfeccaoRetornaveis'
     });
     phrases.splice(1);
    }
   }
   if(row.code==='4.3.4'){
    for(const phrases of [row.phrases,...row.scopes.map(scope=>scope.phrases)]){
     phrases[0].text='Inspeção visual do reservatório.';
    }
   }
   if(row.code!=='4.6.8'||row.phrases.length!==1)continue;
   row.phrases.push({...phrase});
   for(const scope of row.scopes)scope.phrases.push({...phrase});
  }
 }
 const synchronizedItems=new Set(['4.1.3','4.2.2','4.2.7','4.2.8','4.2.9','4.3.2','4.3.5','4.6.3','4.6.4','4.6.5','4.6.6','4.6.8','4.7.2','4.7.4','4.7.5','4.7.6','4.7.8']);
 const visualFrequency={
  label:'Frequência da inspeção visual interna',
  guidance:'Selecione a frequência por reservatório ou deixe em branco.',
  details:'inspection-frequency'
 };
 function visualInspectionState(page,scope,data){
  const row=page.rows.find(item=>item.code==='4.3.4');
  const related=row?.scopes.find(item=>item.col===scope.col);
  const field=related&&key({name:bpfPhraseName(related,0)});
  let state={};
  try{state=JSON.parse(data[field]||'null')||{};}catch{}
  const details=state['inspecao-visual']??={};
  if(related&&!details.answer){
   const answer=data[bpfPhraseName(related,0)];
   if(['1','0'].includes(answer))details.answer=answer;
  }
  return {field,state,details};
 }
 function renderReservoirFrequency(card,page,row,panel){
  const section=element('fieldset');
  section.append(element('legend',visualFrequency.label));
  for(const scope of new Set(panel.entries.map(entry=>entry.scope))){
   const unit=element('details');
   unit.title=visualFrequency.guidance;
   unit.append(element('summary',bpfScopeLabel(page,scope)));
   const {field,state,details}=visualInspectionState(page,scope,values);
   fields(unit,visualFrequency,details,()=>{
    values[field]=JSON.stringify(state);
    changed();
   },[]);
   section.append(unit);
  }
  card.append(section);
 }
 function reservoirFrequencyAnnex(page,row,panel,data){
  const checklist=[];
  for(const scope of new Set(panel.entries.map(entry=>entry.scope))){
   const frequency=text(visualInspectionState(page,scope,data).details.frequency);
   if(frequency)checklist.push(bpfScopeLabel(page,scope)+' — '+frequency);
  }
  return checklist.length?[{page,row,panel,heading:visualFrequency.label,checklist,answer:'',note:''}]:[];
 }
 function registerReview(entries,byKey){
  for(const page of BPF_PHRASES)for(const row of page.rows){
   if(row.code==='4.3.3'){
    const key=page.page+':4.3.3:F1:frequencia-visual';
    const entry={key,page:page.page,code:row.code,index:0,label:'F1 — '+visualFrequency.label,scopes:[],
     appcc:row.phrases[0].appcc,original:{text:'Frequência da inspeção visual interna',guidance:'Selecione a frequência por reservatório ou deixe em branco.'},
     refs:[{set text(value){visualFrequency.label=value;},set guidance(value){visualFrequency.guidance=value;}}]};
    entries.push(entry);byKey.set(key,entry);
   }
   if(!synchronizedItems.has(row.code)&&row.code!=='4.3.4')continue;
   for(const panel of bpfPanels(page,row)){
    const config=get(row,panel.id);
    if(!config)continue;
    const index=panel.id;
    for(const criterion of config.checks){
     const key=[page.page,row.code,'F'+(index+1),'check',criterion.id].join(':');
     const mode=isInformation(config,criterion)?informationHeading(config)+(criterion.informationQuestion?' — '+(criterion.answerLabels?Object.values(criterion.answerLabels).join(' ou '):'Sim ou Não')+'.':'.'):criterion.yesOnly?'Marcação somente em Sim.':criterion.noOnly?'Marcação somente em Não.':criterion.optional?'Sim ou Não. Pode ficar em branco.':'Responda Sim ou Não quando aplicável.';
     const context=criterion.hideWhenAllNo?'Ocultada quando a demonstração do teste de arraste e a existência de registros estão ambas marcadas como Não.':criterion.route==='silo'?'Com silo.':criterion.route==='direto'?'Sem silo.':criterion.requires==='filtro'?'Exibida quando a presença do filtro está marcada Sim.':criterion.section||'';
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
     for(const [field,answer] of [['yesLabel','Sim'],['noLabel','Não']]){
      if(!criterion[field])continue;
      const variant={...entry,key:key+':'+field,label:entry.label+' — Redação '+answer,
       original:{text:criterion[field],guidance:'Redação exibida quando a resposta é '+answer+'.'},
       refs:[{set text(value){criterion[field]=value;},set guidance(value){criterion[answer==='Sim'?'yesGuidance':'noGuidance']=value;}}]};
      entries.push(variant);
      byKey.set(variant.key,variant);
     }
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

 const receptionChecks={
  '4.5.3':{
   0:{question:'Possui registro comprovando a inspeção no ato do recebimento?',caption:'Registro de inspeção no recebimento',detailsAnswer:'1'},
   2:{question:'O saneante conferido estava identificado, dentro da validade, regularizado na ANVISA e possui autorização para a finalidade de uso declarada?',caption:'Identificação, validade, regularização e finalidade de uso do saneante',detailsAnswer:'0'}
  },
  '4.5.4':{
   0:{question:'Os garrafões recebidos estão na validade (fotografe o fundo de todos os garrafões com fabricantes diferentes)?',caption:'Validade dos garrafões recebidos'}
  }
 };
 const receptionEvidence=['Formulário de recepção','Carimbo na nota fiscal','Sistema eletrônico','Ficha de estoque','Outro'];
 const receptionKey=(name,field)=>'BPF_Recepcao_'+name+'_'+field;

 function receptionRecords(page,row,panel,data){
  const check=receptionChecks[row.code]?.[panel.id];
  if(!check)return [];
  return panel.entries.flatMap(entry=>{
   const answer=data[receptionKey(entry.name,'Resposta')];
   if(!['1','0'].includes(answer))return [];
   const evidence=data[receptionKey(entry.name,'Comprovacao')];
   const details=String(data[receptionKey(entry.name,'Detalhes')]||'').replace(/\s+/g,' ').trim();
   const extra=answer!==check.detailsAnswer?'':panel.id===0
    ?[evidence,evidence==='Outro'?details:''].filter(Boolean).join(' — ')
    :details;
   return [bpfScopeLabel(page,entry.scope)+' — '+check.caption+': '+bpfAnswerLabel(answer)+(extra?' — '+extra:'')];
  });
 }

 function receptionSummary(page,row,panel,data){
  return receptionRecords(page,row,panel,data).map(record=>panel.label+' — '+record);
 }

 function receptionAnnex(page,row,panel,data){
  const checklist=receptionRecords(page,row,panel,data);
  return checklist.length?[{page,row,panel,heading:'Informações adicionais',checklist}]:[];
 }


 function renderReception(card,page,row,panel){
  const check=receptionChecks[row.code]?.[panel.id];
  if(!check||!panel.entries.length)return;
  const block=element('fieldset');
  block.className='bpf-answer-box';
  block.append(element('legend','Informações adicionais'));
  for(const entry of panel.entries){
   const unit=element('fieldset');
   unit.append(element('legend',bpfScopeLabel(page,entry.scope)));
   unit.append(element('p',check.question));
   const answerKey=receptionKey(entry.name,'Resposta');
   const evidenceKey=receptionKey(entry.name,'Comprovacao');
   const detailsKey=receptionKey(entry.name,'Detalhes');
   const followup=element('div');
   const area=element('textarea');
   area.rows=panel.id===0?2:5;
   area.value=values[detailsKey]||'';
   const detailLabel=element('label',panel.id===0?'Especifique a outra comprovação':
    'Informe o nome do produto, lote, validade, finalidade de uso, referência da regularização e divergência entre o rótulo encontrado e o documento apresentado.');
   detailLabel.append(area);
   const refresh=()=>{
    followup.hidden=values[answerKey]!==check.detailsAnswer;
    detailLabel.hidden=panel.id===0&&values[evidenceKey]!=='Outro';
   };
   const save=(key,value)=>{
    values[key]=value;
    refresh();
    bpfSyncObservation(row,page);
    changed();
   };
   for(const [answer,label] of [['1','Sim'],['0','Não']]){
    const choice=element('label',label);
    choice.style.marginRight='1rem';
    const input=element('input');
    input.type='radio';
    input.name=answerKey;
    input.value=answer;
    input.checked=values[answerKey]===answer;
    input.onchange=()=>save(answerKey,answer);
    choice.prepend(input);
    unit.append(choice);
   }
   if(check.detailsAnswer==='1'){
    const label=element('label','Comprovação');
    const select=element('select');
    for(const name of ['Selecione',...receptionEvidence]){
     const option=element('option',name);
     option.value=name==='Selecione'?'':name;
     select.append(option);
    }
    select.value=values[evidenceKey]||'';
    select.onchange=()=>save(evidenceKey,select.value);
    label.append(select);
    followup.append(label);
   }
   area.oninput=()=>save(detailsKey,area.value);
   followup.append(detailLabel);
   if(check.detailsAnswer)unit.append(followup);
   block.append(unit);
   refresh();
  }
  card.append(block);
 }

 function init(data){
  for(const page of BPF_PHRASES)for(const row of page.rows)for(const scope of row.scopes){
   for(const [position,check] of Object.entries(receptionChecks[row.code]||{})){
    const index=Number(position);
    if(!scope.phrases[index])continue;
    const fields=['Resposta'];
    if(check.detailsAnswer)fields.push('Detalhes');
    if(check.detailsAnswer==='1')fields.push('Comprovacao');
    for(const field of fields){
     const name=receptionKey(bpfPhraseName(scope,index),field);
     data.fields[name]={name,type:'/Tx',flags:0,label:row.code+' F'+(index+1)+' — '+field,options:[],calc:'',phrasePage:page.page};
    }
   }
   if(['4.6.4','4.7.2','4.7.6'].includes(row.code))for(const entry of bpfF1Checks(row,scope)){
    data.fields[entry.name]={name:entry.name,type:'/Ch',flags:0,label:entry.option,options:[],calc:'',phrasePage:page.page};
   }
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
  const selected=panel.checks.filter(c=>!isInformation(panel,c)&&answered(c,state));
  if(!selected.length||requiredChecks(panel,selected,state).some(c=>!answered(c,state)))return '';
  if(panel.alternatives)return selected.some(c=>state[c.id].answer==='1')?'1':'0';
  return selected.some(c=>!c.yesOnly&&state[c.id].answer===(c.negative?'1':'0'))?'0':'1';
 }

 function apply(row,scope,data){
  for(const entry of entriesFor(row,scope)){
   if(conductionF2(row,entry.index)){
    bpfApplyPopF2NA(row,scope,data);
    if(!panelEnabled(row,entry,data))continue;
   }
   const state=read(entry,data);
   if(!panelEnabled(row,entry,data)){
    data[entry.name]='';
   }else if(state||row.code==='4.7.8'){
    const config=get(row,entry.index);
    if(!config.inline)data[entry.name]=result(config,state);
    if(entry.index===1&&fillingF2Indices[row.code]){
     if(!data[key(entry)])data[key(entry)]=JSON.stringify(state);
     for(const index of fillingF2Indices[row.code])data[bpfPhraseName(scope,index)]=data[entry.name];
    }
    if(row.code==='4.7.8'){
     const legacy=state?.['higienizacao-envasadora'];
     if(legacy){
      if(!hasAnswer(data[entry.name])&&hasAnswer(legacy.answer))data[entry.name]=legacy.answer;
      delete state['higienizacao-envasadora'];
      data[key(entry)]=JSON.stringify(state);
     }
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
  const entries=config.inline?machineEntries(panel):panel.id===1&&fillingF2Indices[row.code]?panel.entries.filter(entry=>entry.index===1):panel.entries;
  const units=entries.map(entry=>({
   entry,label:bpfScopeLabel(page,entry.scope),checks:reservoir?
    (['1','0'].includes(data[entry.name])?[{id:entry.index,answer:data[entry.name],details:''}]:[]):
    records(row,entry,data)
  }));
  if(!units.some(unit=>unit.checks.length))return [];
  const responses=config.inline?[]:reservoir?['1','0']:['1','0','2'];
  const information=[];
  for(const criterion of config.checks.filter(check=>isInformation(config,check))){
   for(const answer of ['1','0']){
    const recorded=units.flatMap(unit=>unit.checks.filter(check=>check.id===criterion.id&&check.answer===answer)
     .map(check=>unit.label+(check.details?' — '+check.details:'')));
    if(recorded.length){
     const caption=criterion.informationQuestion?statementForAnswer(criterion,answer):criterion.informationList?(criterion.reportLabel||'Produtos químicos utilizados para limpeza das embalagens'):criterion.label;
     information.push((criterion.section?criterion.section+' · ':'')+caption+' ('+recorded.join(' / ')+')');
    }
   }
  }
  const report=responses.flatMap(answer=>{
   const checklist=[];
   for(const criterion of config.checks){
    if(isInformation(config,criterion))continue;
    const details=new Map();
    for(const unit of units){
     const check=unit.checks.find(check=>check.id===criterion.id&&check.answer===answer);
     if(!check)continue;
     if(!details.has(check.details))details.set(check.details,[]);
     details.get(check.details).push(unit.label);
    }
    if(details.size){
     const labels=[...details].map(([detail,labels])=>labels.join(', ')+(detail?' — '+detail:''));
     const caption=isQuestion(criterion)?statementForAnswer(criterion,answer):answerLabel(criterion,answer);
     checklist.push(caption+' ('+labels.join(' / ')+')');
    }
   }
   const selected=units.filter(({entry})=>data[entry.name]===answer);
   const legacy=reservoir?[]:selected.filter(unit=>!unit.checks.length);
   if(legacy.length)checklist.push('Avaliação geral ('+legacy.map(unit=>unit.label).join(', ')+')');
   const note=answer==='2'||(answer==='1'&&!selected.length)?'':text(data[bpfGroupNoteName(page,row,panel,answer)]);
   if(!checklist.length&&!(selected.length&&(answer!=='1'||note)))return [];
   return [{page,row,panel,answer,checklist,note,selected:selected.map(unit=>unit.entry)}];
  });
  if(information.length)report.push({page,row,panel,heading:informationHeading(config),checklist:information,note:'',selected:[]});
  return report;
 }

 function summary(page,panel,report){
  return report.map(({answer,heading,checklist,note,selected})=>{
   const labels=checklist.length?checklist:[selected.map(entry=>bpfScopeLabel(page,entry.scope)).join(', ')];
   return panel.label+' — '+(heading||bpfAnswerLabel(answer).toUpperCase())+' — '+labels.join(' | ')+
    (note?': '+bpfObservationMarker(answer,selected.length?selected:panel.entries)+note:'');
  });
 }

 function missingDetail(criterion,item){
  if(criterion.optionalDetails)return false;
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
     if(criterion.informationList)item.answer=Object.values(item.products).some(Boolean)?'1':'';
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
    const periods=['Mensal','Trimestral','Semestral','Anual','Outros'];
    const saved=item.frequency||'';
    const custom=!!saved&&!periods.includes(saved);
    let other;
    field(criterion.label,custom?'Outros':saved,value=>{
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
  if(panel.id===1&&fillingF2Indices[row.code])panel={...panel,entries:panel.entries.filter(entry=>entry.index===1)};
  if(row.code==='4.6.8'&&panel.id===1){
   card.dataset.bpfCapsF2='';
   card.hidden=!panel.entries.some(entry=>panelEnabled(row,entry,values));
  }
  const dependentF2=conductionF2(row,panel.id);
  if(dependentF2)card.dataset.bpfConductionF2='';
  if(page.page===7&&['4.6.5','4.6.6'].includes(row.code))card.append(element('p',row.phrases[panel.id].text));
  const hint=element('p',config.inline?'Registre as informações da envasadora por linha.':config.simple&&row.code==='4.6.3'?'Marque Sim ou Não para cada linha avaliada.':fillingChecks[row.code]?'Marque uma avaliação por linha e registre as verificações em Outras informações.':config.optional?'As verificações deste quadro podem ficar em branco. Marque as opções aplicáveis.':config.sectioned?'Em cada linha avaliada, responda a todas as perguntas com Sim e Não do quadro utilizado.':config.all?'Responda às verificações com opções Sim e Não da unidade avaliada.':'Marque uma ou mais verificações por unidade.');
  hint.className='bpf-guidance';
  card.append(hint);
  if(!document.getElementById('bpf-water-css')){
   const style=element('style');
   style.id='bpf-water-css';
   style.textContent='#bpf-editor .bpf-water-grid{grid-template-columns:minmax(0,1fr)}.bpf-water-unit+.bpf-water-unit{margin-top:4px}.bpf-water-unit.bpf-water-unit-direct{margin-top:0}.bpf-water-unit-direct .bpf-water-row{padding:0}.bpf-water-unit>summary{padding:8px 0;cursor:pointer;font-weight:700}.bpf-water-row{padding:5px 0}.bpf-water-caption{display:block;margin-bottom:4px}.bpf-water-choice{display:flex;align-items:flex-start;gap:8px;margin:4px 0}.bpf-water-choice input{flex:none}.bpf-water-detail{padding:6px 10px;margin-top:4px;background:#f2f7fa;border-radius:5px}.bpf-water-field{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:7px 0}.bpf-water-field select{font:inherit;max-width:100%;padding:5px}#bpf-editor .bpf-water-text-field{display:block}#bpf-editor .bpf-water-text-field textarea{display:block;width:100%;max-width:100%;min-height:3.5em;box-sizing:border-box;margin:6px 0 0;padding:8px;font:inherit;resize:vertical}.bpf-water-unit [hidden]{display:none!important}';
   document.head.append(style);
  }
  const answerGrid=element('div');
  answerGrid.className='bpf-answer-grid bpf-water-grid';
  card.append(answerGrid);
  const boxes=new Map();
  const sections=config.inline?[]:[['1','Sim'],['0','Não']];
  if(config.checks.some(criterion=>isInformation(config,criterion)))sections.push(['info',informationHeading(config)]);
  for(const [answer,heading] of sections){
   const box=element('fieldset');
   box.className='bpf-answer-box';
   const prompt=config.answerPrompts?.[answer];
   box.append(element('legend',(config.inline?'':panel.label+' — ')+heading+(prompt?' ('+prompt+')':'')));
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
    if(!config.inline){
     values[entry.name]=result(config,state);
     if(!values[entry.name])values[entry.scope.name]='Off';
    }
    refresh();
    if(config.inline||(row.code==='4.2.9'&&panel.id===0))apply(row,entry.scope,values);
    if(row.code==='4.2.9'&&panel.id===0){
     card.parentElement?.querySelector('[data-bpf-conduction-f2]')?.dispatchEvent(new Event('bpf-f2-refresh'));
    }
    if(row.code==='4.6.8'&&panel.id===0){
     const followup=card.parentElement?.querySelector('[data-bpf-caps-f2]');
     if(followup)followup.hidden=!row.scopes.some(scope=>capsDisinfected(scope,values));
    }
    changed();
    recalc();
   };
   const refresh=()=>{
    for(const control of rows)control();
   };
   if(dependentF2){
    const notice=element('p',label+' — Não se aplica (F1 marcado como Não).');
    answerGrid.prepend(notice);
    rows.push(()=>{notice.hidden=panelEnabled(row,entry,values);});
    card.addEventListener('bpf-f2-refresh',refresh);
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
   for(const [sectionType,box] of boxes){
    const information=sectionType==='info';
    const answer=information?'1':sectionType;
    const heading=information?informationHeading(config):answer==='1'?'Sim':'Não';
    const directChoice=config.simple||(config.separateInformation&&!information)||(config.singleNo&&answer==='0');
    const collapsed=!directChoice;
    const section=element(collapsed?'details':'div');
    section.className='bpf-water-unit'+(directChoice?' bpf-water-unit-direct':'');
    section.dataset.waterEntry=entry.name;
    if(collapsed)section.append(element('summary',label));
    const legacyLine=element('p',legacy?'Avaliação geral registrada: '+legacy+'.':'');
    legacyLine.hidden=!legacy;
    legacyLines.push(legacyLine);
    section.append(legacyLine);
    box.append(section);
    if(dependentF2)rows.push(()=>{section.hidden=!panelEnabled(row,entry,values);});
    const groups=new Map();
    for(const criterion of config.checks){
     if(information!==Boolean(isInformation(config,criterion)))continue;
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
     if((criterion.details==='sanitizers'&&!criterion.explicitAnswer||criterion.informationList)&&answer==='1'){
      const title=element('strong',criterion.label);
      title.className='bpf-water-caption';
      line.append(title);
      fields(line,criterion,item,save,rows);
      continue;
     }
     const caption=directChoice?label:criterion.scopeAnswer?heading+' — '+label:answerLabel(criterion,answer);
     const control=element('label');
     const captionNode=element('span');
     const displayCaption=value=>{
      const emphasisIndex=criterion.boldText?value.indexOf(criterion.boldText):-1;
      if(emphasisIndex<0)captionNode.textContent=value;
      else captionNode.replaceChildren(value.slice(0,emphasisIndex),element('strong',criterion.boldText),
       value.slice(emphasisIndex+criterion.boldText.length));
     };
     displayCaption(caption);
     control.append(captionNode);
     control.className=directChoice?'bpf-answer-item':'bpf-water-choice';
     const guidance=(answer==='0'?criterion.noGuidance:criterion.yesGuidance)||criterion.guidance;
     if(guidance)control.title=guidance;
     const input=element('input');
     input.type='checkbox';
     input.setAttribute('aria-label',directChoice||criterion.scopeAnswer?label+' — '+heading:label+' — '+caption+' — '+heading);
     input.onchange=()=>{
      item.answer=input.checked?answer:'';
      if(input.checked&&config.exclusiveScopeAnswer&&criterion.scopeAnswer){
       for(const other of config.checks){
        if(other.scopeAnswer&&other.id!==criterion.id&&state[other.id])state[other.id].answer='';
       }
      }
      if(criterion.details==='sanitizers'&&item.answer==='0'){
       for(const product of Object.values(item.products))product.selected=false;
      }
      if(criterion.id==='filtro'&&item.answer!=='1'&&state['registro-filtro'])delete state['registro-filtro'].answer;
      save();
     };
     control.prepend(input);
     if(information&&criterion.informationQuestion){
      const choices=element('div');
      choices.style.display='flex';
      choices.style.gap='1rem';
      const yesLabel=criterion.answerLabels?.['1']||'Sim';
      const noLabel=criterion.answerLabels?.['0']||'Não';
      const yesControl=element('label',yesLabel);
      const noControl=element('label',noLabel);
      const noInput=element('input');
      noInput.type='checkbox';
      yesControl.className=noControl.className='bpf-water-choice';
      noInput.onchange=()=>{
       item.answer=noInput.checked?'0':'';
       if(criterion.id==='filtro'&&state['registro-filtro'])delete state['registro-filtro'].answer;
       save();
      };
      yesControl.prepend(input);
      noControl.prepend(noInput);
      choices.append(yesControl,noControl);
      const prompt=element('div',caption);
      line.append(prompt,choices);
      rows.push(()=>{
       const wording=!criterion.answerLabels&&hasAnswer(item.answer)?statementForAnswer(criterion,item.answer):caption;
       prompt.textContent=wording;
       prompt.title=(item.answer==='1'?criterion.yesGuidance:item.answer==='0'?criterion.noGuidance:'')||criterion.guidance||'';
       input.setAttribute('aria-label',label+' — '+wording+' — '+yesLabel);
       noInput.setAttribute('aria-label',label+' — '+wording+' — '+noLabel);
       noInput.disabled=state.notApplicable||!active(criterion,state);
       noInput.checked=!noInput.disabled&&item.answer==='0';
      });
     }else line.append(control);
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
      if(!information&&isQuestion(criterion)&&!directChoice){
       const wording=enabled&&hasAnswer(item.answer)?statementForAnswer(criterion,answer):caption;
       displayCaption(wording);
       input.setAttribute('aria-label',label+' — '+wording+' — '+heading);
      }
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
   if(answer==='0')bpfInstallIndividualNC(area,card,page,row,panel,()=>true,()=>panel.entries.filter(e=>values[e.name]==='0').map(e=>({id:e.name,label:bpfScopeLabel(page,e.scope)})));
   grid.append(box);
  }
  card.append(grid);
  return true;
 }
 function renderMachine(card,page,row,panel){
  if(row.code!=='4.7.8'||panel.id!==0)return;
  const section=element('div');
  render(section,page,row,{...panel,label:'Envasadora Automática',entries:machineEntries(panel),machineDetails:true});
  card.append(section);
 }
 return {get,registerReview,renderMachine,renderReception,receptionSummary,receptionAnnex,preparePhrases,renderReservoirFrequency,reservoirFrequencyAnnex,capsExamples,init,apply,report,summary,validate,render};
})();

