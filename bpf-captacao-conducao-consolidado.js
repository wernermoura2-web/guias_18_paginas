/* Verificações de Captação e Condução, registradas por unidade e frase. */
const bpfWaterCheck = (() => {
 const check = (id, label, options = {}) => ({id, label, ...options});
 const sanitizers = (label, options) => check('saneantes', label, {details:'sanitizers', ...options});
 const yes = (id, label, details) => check(id, label, {yesOnly:true, details});
 const controls = disinfection => [
  yes('telemetria','Existe telemetria em linha','telemetry'),
  yes('residuo','Após a desinfecção '+disinfection+', testa a ausência de resíduo de saneante na água após o enxágue','residue'),
  yes('microbiologia','Após a desinfecção '+disinfection+', testa a ausência de contaminação microbiológica'),
  yes('atp','Após a desinfecção '+disinfection+', faz teste fluorescente / ATP')
 ];
 const blownChecks = [
  check('uso-imediato','As embalagens sopradas são utilizadas imediatamente, sem contato manual?'),
  yes('ar-sopro-filtrado','As pré-formas são sopradas com ar comprimido com filtro de ar microbiológico.'),
  yes('analise-ar-comprimido','O ar comprimido é coletado e enviado para análises microbiológicas.'),
  yes('transporte-ar-filtrado','As embalagens são movimentadas com sopradores de ar com filtro de ar microbiológico.')
 ].map(criterion=>({...criterion,section:'Embalagens sopradas no estabelecimento'}));
 function rinsePanel(disposable){
  const rinseChecks=[
   ...(disposable
    ?[check('concentracao','O enxágue com desinfetante das embalagens é feito na concentração adequada (validada)?')]
    :[check('enxague-automatico','O enxágue é realizado em equipamento automático e com uso de desinfetante?')]),
   check('bicos-pressao','Os bicos estão desobstruídos e a pressão dos jatos permite que a solução desinfetante alcance o fundo das garrafas?'),
   ...(disposable?[check('escoamento','O tempo após o enxágue é suficiente para o escoamento de toda a solução desinfetante?')]:[]),
   check('sanitizantes-embalagens','Sanitizantes utilizados para descontaminação ou desinfecção das embalagens',{
    yesOnly:true,informationOnly:!disposable,details:'packaging-sanitizers',
    products:disposable?[
     ['ozonio','Ozônio'],['outros','Outro']
    ]:[
     ['detergente-clorado','Detergente alcalino clorado'],['hipoclorito-com-sodio','Hipoclorito de sódio com Soda Cáustica'],
     ['hipoclorito','Hipoclorito de sódio'],['ozonio','Ozônio'],['outros','Outro']
    ]
   }),
   check('telemetria-concentracao','Existe telemetria em linha da concentração do desinfetante utilizado para controlar e monitorar sua reposição.',{yesOnly:true,informationOnly:!disposable})
  ].map(criterion=>({...criterion,section:'Enxágue com solução desinfetante'}));
  return disposable?{allowNA:true,separateInformation:true,checks:[
   check('sim-descartaveis','Sim',{yesOnly:true,scopeAnswer:true}),
   check('nao-descartaveis','Não',{noOnly:true,scopeAnswer:true}),
   ...blownChecks,...rinseChecks
  ]}:{sectioned:true,checks:rinseChecks};
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
   0:{separateInformation:true,checks:[
    check('higienizacao-adequada','Sim',{yesOnly:true,scopeAnswer:true}),
    sanitizers('Sanitizantes utilizados na descontaminação ou desinfecção de rotina do poço ou surgência',{yesOnly:true}),
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
    check('emendas','Tubulações com emendas ou conexões sanitárias',{noLabel:"Tubulações sem emendas ou conexões sanitárias"})
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
  '4.3.5':{0:{separateInformation:true,checks:[
   check('higienizacao-adequada','Sim',{yesOnly:true,scopeAnswer:true}),
   check('nao-reservatorio','Não',{noOnly:true,scopeAnswer:true}),
    sanitizers('Sanitizantes utilizados para descontaminação ou desinfecção de rotina do reservatório',{yesOnly:true,frequencyOptional:true}),
   check('recirculacao','Procedimento adotado para recirculação do sanitizante no tanque',{yesOnly:true,details:'recirculation'}),
   ...controls('do reservatório')
  ]}},
  '4.3.4':{0:{simple:true,checks:[
   check('inspecao-visual','Inspeção visual do reservatório na frequência definida pelo estabelecimento',{details:'inspection-frequency'})
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
    check('escotilha-teto','Reservatório com escotilha de vidro no teto para inspeção visual',{yesOnly:true,informationOnly:true})
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
 const read = (entry,data) => {
  try {
   const name=key(entry);
   let state=JSON.parse(data[name]||'null');
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
  'filtro','registro-filtro','pop-registros','telemetria','residuo','microbiologia','atp',
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
  certificado:[/^Foi apresentado /,'Não foi apresentado '],
  declaracao:[/^(Foi apresentada|Possui) /,(_,verb)=>'Não '+verb.charAt(0).toLowerCase()+verb.slice(1)+' '],
  'nota-fiscal':[/^Foi apresentada /,'Não foi apresentada '],
  'pop-com-historico':[/ contempla /,' não contempla '],
  'escotilha-teto':[/ com escotilha /,' sem escotilha '],
  'uso-imediato':[/ são utilizadas /,' não são utilizadas '],
  'ar-sopro-filtrado':[/ são sopradas /,' não são sopradas '],
  'analise-ar-comprimido':[/ é coletado /,' não é coletado '],
  'transporte-ar-filtrado':[/ são movimentadas /,' não são movimentadas '],
  concentracao:[/ é feito /,' não é feito '],
  'bicos-pressao':[/ estão desobstruídos e a pressão dos jatos permite /,' estão obstruídos e/ou a pressão dos jatos não permite '],
  escoamento:[/ é suficiente /,' não é suficiente '],
  'telemetria-concentracao':[/^Existe /,'Não existe '],
  'enxague-automatico':[/ é realizado /,' não é realizado '],
  'higienizacao-envasadora':[/ descontaminada e higienizada /,' não foi descontaminada e/ou higienizada '],
  'concentracao-limpeza':[/ é feito /,' não é feito '],
  'bicos-limpeza':[/ estão desobstruídos e a pressão dos jatos permite /,' estão obstruídos e/ou a pressão dos jatos não permite '],
  'produtos-limpeza':[/ são adequados$/,' não são adequados'],
  'desinfeccao-primeiro-estagio':[/ é feito /,' não é feito '],
  'concentracao-desinfetante':[/ é feito /,' não é feito '],
  'bicos-desinfetante':[/ estão desobstruídos e a pressão dos jatos permite /,' estão obstruídos e/ou a pressão dos jatos não permite '],
  'relatorio-operacao-lavadora':[/^Foi apresentado /,'Não foi apresentado '],
  'relatorio-operacao-atualizado':[/ está atualizado /,' não está atualizado '],
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
  'transporte-tampas':[/ são transportadas /,' não são transportadas '],
  'analise-tampas':[/^É feita /,'Não é feita '],
  'fora-silo':[/ é realizada /,' não é realizada '],
  'fora-envase':[/ é realizada /,' não é realizada '],
  'eliminacao-residuos':[/ garante /,' não garante '],
  'teste-arraste':[/ foi demonstrado$/,' não foi demonstrado'],
  'registros-residuos':[/^Há /,'Não há '],
  'instrumento-adequado':[/ é adequado /,' não é adequado '],
  'enxague-final':[/ indicou /,' não indicou ']
 };
 const isQuestion=criterion=>criterion.informationQuestion||/\?\s*$/.test(criterion.label);
 const hasAnswer=answer=>answer==='1'||answer==='0';
 const statementForAnswer=(criterion,answer)=>{
  if(answer==='0'&&criterion.noLabel)return criterion.noLabel;
  const statement=criterion.label.trim().replace(/\?$/,'');
  if(answer!=='0')return statement;
  const rule=negativeStatements[criterion.id];
  if(!rule||!rule[0].test(statement))return 'Resposta Não: '+statement;
  return statement.replace(...rule);
 };
 const informationalPanels=[disposableRinse,returnableRinse,
  ...Object.values(panels).flatMap(phrases=>Object.values(phrases))];
 for(const panel of informationalPanels)for(const criterion of panel.checks){
  if(!isInformation(panel,criterion)||!informationQuestions.has(criterion.id))continue;
  criterion.label=documentQuestions[criterion.id]||criterion.label.replace(/[.?]$/,'')+'?';
  criterion.yesOnly=false;
  criterion.informationQuestion=true;
 }
 const answerLabel=(criterion,answer)=>answer==='0'?(criterion.noLabel||criterion.label):criterion.label;
 const active = (criterion,state) =>
  (!criterion.route||state.route===criterion.route)&&(!criterion.requires||state[criterion.requires]?.answer==='1');
 const answered = (criterion,state) => active(criterion,state)&&
  ((!criterion.noOnly&&state[criterion.id]?.answer==='1')||(!criterion.yesOnly&&state[criterion.id]?.answer==='0'));
 const text = value => typeof value==='string'?value.trim():'';

 const capsDisinfected=(scope,data)=>read({scope,index:0,name:bpfPhraseName(scope,0)},data)
  ?.['desinfeccao-envasadora']?.answer==='1';
 const conductionF2=(row,index)=>row.code==='4.2.9'&&index===1;
 const panelEnabled=(row,entry,data)=>conductionF2(row,entry.index)
  ?!bpfPopNAForced(row,entry.scope,entry.index,data)
  :row.code!=='4.6.8'||entry.index!==1||capsDisinfected(entry.scope,data);

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
     const mode=isInformation(config,criterion)?informationHeading(config)+(criterion.informationQuestion?' — Sim ou Não.':'.'):criterion.yesOnly?'Marcação somente em Sim.':criterion.noOnly?'Marcação somente em Não.':criterion.optional?'Sim ou Não. Pode ficar em branco.':'Responda Sim ou Não quando aplicável.';
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
  const selected=panel.checks.filter(c=>!isInformation(panel,c)&&answered(c,state));
  if(!selected.length||(panel.capRoute&&!panel.optional&&!state.route)||requiredChecks(panel,selected,state).some(c=>!answered(c,state)))return '';
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
  const responses=reservoir?['1','0']:['1','0','2'];
  const information=[];
  for(const criterion of config.checks.filter(check=>isInformation(config,check))){
   for(const answer of ['1','0']){
    const recorded=units.flatMap(unit=>unit.checks.filter(check=>check.id===criterion.id&&check.answer===answer)
     .map(check=>unit.label+(check.details?' — '+check.details:'')));
    if(recorded.length){
     const caption=criterion.informationQuestion?statementForAnswer(criterion,answer):criterion.label;
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
   if(config.capRoute&&checklist.length){
    const routes=units.filter(unit=>unit.checks.some(check=>check.answer===answer)).map(unit=>{
     const route=read(unit.entry,data)?.route;
     return route?unit.label+' — '+(route==='silo'?'Com silo':'Sem silo'):'';
    }).filter(Boolean);
    if(routes.length)checklist.unshift('Transporte das tampas: '+routes.join(' / '));
   }
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
  const dependentF2=conductionF2(row,panel.id);
  if(dependentF2)card.dataset.bpfConductionF2='';
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
  const sections=[['1','Sim'],['0','Não']];
  if(config.checks.some(criterion=>isInformation(config,criterion)))sections.push(['info',informationHeading(config)]);
  for(const [answer,heading] of sections){
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
    if(config.inline||(row.code==='4.2.9'&&panel.id===0))apply(row,entry.scope,values);
    if(row.code==='4.2.9'&&panel.id===0){
     card.parentElement?.querySelector('[data-bpf-conduction-f2]')?.dispatchEvent(new Event('bpf-f2-refresh'));
    }
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
   if(dependentF2){
    const notice=element('p',label+' — Não se aplica (F1 marcado como Não).');
    answerGrid.prepend(notice);
    rows.push(()=>{notice.hidden=panelEnabled(row,entry,values);});
    card.addEventListener('bpf-f2-refresh',refresh);
   }
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
   for(const [sectionType,box] of boxes){
    const information=sectionType==='info';
    const answer=information?'1':sectionType;
    const heading=information?informationHeading(config):answer==='1'?'Sim':'Não';
    const directChoice=config.simple||(config.separateInformation&&!information)||(config.singleNo&&answer==='0');
    const section=element(directChoice?'div':'details');
    section.className='bpf-water-unit';
    section.dataset.waterEntry=entry.name;
    if(!directChoice)section.append(element('summary',label));
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
     if(criterion.details==='sanitizers'&&!criterion.explicitAnswer&&answer==='1'){
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
     control.className='bpf-water-choice';
     if(criterion.guidance)control.title=criterion.guidance;
     const input=element('input');
     input.type='checkbox';
     input.setAttribute('aria-label',directChoice||criterion.scopeAnswer?label+' — '+heading:label+' — '+caption+' — '+heading);
     input.onchange=()=>{
      item.answer=input.checked?answer:'';
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
      const yesControl=element('label','Sim');
      const noControl=element('label','Não');
      const noInput=element('input');
      noInput.type='checkbox';
      yesControl.className=noControl.className='bpf-water-choice';
      input.setAttribute('aria-label',label+' — '+caption+' — Sim');
      noInput.setAttribute('aria-label',label+' — '+caption+' — Não');
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
       const wording=hasAnswer(item.answer)?statementForAnswer(criterion,item.answer):caption;
       prompt.textContent=wording;
       input.setAttribute('aria-label',label+' — '+wording+' — Sim');
       noInput.setAttribute('aria-label',label+' — '+wording+' — Não');
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

