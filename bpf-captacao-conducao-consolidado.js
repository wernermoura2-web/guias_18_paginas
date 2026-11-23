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
 ] .map(criterion=>({...criterion,requires:'embalagens-sopradas',section:'Embalagens sopradas no estabelecimento'}));
 const returnableRinse={simple:true,checks:[
  check('avaliacao-enxague','Avaliação do enxágue com solução desinfetante')
 ]};
 const disposableRinse={allowNA:true,separateInformation:true,exclusiveScopeAnswer:true,checks:[
  check('sim-descartaveis','Sim',{yesOnly:true,scopeAnswer:true}),
  check('nao-descartaveis','Não',{noOnly:true,scopeAnswer:true}),
  check('embalagens-sopradas','As embalagens são sopradas no estabelecimento?',{informationOnly:true,informationQuestion:true,requiredInfo:true,yesLabel:'As embalagens são sopradas no estabelecimento',noLabel:'As embalagens não são sopradas no estabelecimento'}),
  ...blownChecks,
  ...[
   check('bicos-pressao','Os bicos estão desobstruídos e a pressão dos jatos permite que a solução desinfetante alcance o fundo das garrafas?'),
   check('sanitizantes-embalagens','Sanitizantes utilizados para descontaminação ou desinfecção das embalagens',{
    yesOnly:true,details:'packaging-sanitizers',products:[['ozonio','Ozônio'],['outros','Outro']]
   }),
   check('telemetria-concentracao','Existe telemetria em linha da concentração do desinfetante utilizado para controlar e monitorar sua reposição.',{yesOnly:true})
  ] .map(criterion=>({...criterion,requiresAnyRinseYes:true,section:'Enxágue com solução desinfetante'}))
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
   check('secagem','Sistema de secagem das mãos acionado sem contato manual?',{yesLabel:'O sistema de secagem das mãos é acionado sem contato manual',noLabel:'O sistema de secagem das mãos não é acionado sem contato manual'}),
   check('cartaz-lavagem-maos','Possui cartaz com as orientações para a correta lavagem das mãos?',{yesLabel:'Possui cartaz com as orientações para a correta lavagem das mãos',noLabel:'Não possui cartaz com as orientações para a correta lavagem das mãos'})
  ],
  '4.7.6':[
   check('uniforme-limpo','Utiliza uniformes limpos?',{yesLabel:'Utiliza uniformes limpos',noLabel:'Não utiliza uniformes limpos'}),
   check('troca-uniforme','Troca os uniformes diariamente?',{yesLabel:'Troca os uniformes diariamente',noLabel:'Não troca os uniformes diariamente'}),
   check('uniforme-exclusivo','Utiliza uniformes de uso exclusivo para essa área?',{yesLabel:'Utiliza uniformes de uso exclusivo para essa área',noLabel:'Não utiliza uniformes de uso exclusivo para essa área'})
  ],
 };
 const fillingF2Indices={'4.7.4':[4,1,2,3],'4.7.5':[1,4,2,5,3]};
 const panels = {
  '4.7.4':{0:{simple:true,questionsInInformation:true,checks:[
   check('avaliacao-contaminacao-envase','Medidas para minimizar o risco de contaminação na sala de envase'),
   check('pressao-positiva','A sala de envase dispõe de sistema de pressão positiva?',{informationOnly:true,informationQuestion:true,yesLabel:'A sala de envase dispõe de sistema de pressão positiva',noLabel:'A sala de envase não dispõe de sistema de pressão positiva'}),
   check('pressao-positiva-funciona','A pressão positiva da sala de envase está funcionando de verdade para barrar a entrada de ar externo pelas aberturas?',{informationOnly:true,informationQuestion:true,requires:'pressao-positiva',yesLabel:'A pressão positiva da sala de envase está funcionando para barrar a entrada de ar externo pelas aberturas',noLabel:'A pressão positiva da sala de envase não está funcionando para barrar a entrada de ar externo pelas aberturas'}),
   check('filtro-ar-externo','Utiliza filtro para captar o ar externo e possui registro de verificação e troca?',{informationOnly:true,informationQuestion:true,requires:'pressao-positiva',yesLabel:'Utiliza filtro para captar o ar externo e possui registro de verificação e troca',noLabel:'Não utiliza filtro para captar o ar externo e/ou não possui registro de verificação e troca',details:'measure',detailLabel:'Qual o filtro utilizado?',optionalDetails:true})
  ]},1:returnableInspection([])},
  '4.7.5':{0:{simple:true,questionsInInformation:true,informationHeading:'Outras observações',checks:[
   check('avaliacao-acesso-envase','Avaliação do acesso à sala de envase'),
   check('barreira-paramentacao','Possui barreira para paramentação e é adotado um fluxo de passagem para acesso à sala de envase com cuidados higiênicos?',{informationOnly:true,informationQuestion:true,yesLabel:'Possui barreira para paramentação e é adotado um fluxo de passagem para acesso à sala de envase com cuidados higiênicos',noLabel:'Não possui barreira para paramentação e/ou não é adotado um fluxo de passagem para acesso à sala de envase com cuidados higiênicos'})
  ]},1:returnableInspection(fillingChecks['4.7.5'])},
  '4.7.6':{0:returnableInspection(fillingChecks['4.7.6'])},
  '4.7.2':{0:{simple:true,checks:[check('higiene-conservacao-sala','Higiene e conservação da sala de envase')]},1:returnableInspection([...surfaceChecks,...doorChecks])},
  '4.7.8':{0:fillingMachine},
  '4.6.3':{0:returnableRinse},
  '4.6.7':{0:{simple:true,questionsInInformation:true,checks:[
   check('avaliacao-enxague-final','Avaliação do enxágue final'),
   check('enxague-ozonizado','O enxágue é realizado com água mineral natural ozonizada?',{informationOnly:true,informationQuestion:true,requiredInfo:true,yesLabel:'O enxágue é realizado com água mineral natural ozonizada',noLabel:'O enxágue não é realizado com água mineral natural ozonizada'}),
   check('residual-ozonizado','Após o enxágue as garrafas plásticas ficam com um volume residual de água ozonizada?',{informationOnly:true,informationQuestion:true,requires:'enxague-ozonizado',yesLabel:'Após o enxágue as garrafas plásticas ficam com um volume residual de água ozonizada',noLabel:'Após o enxágue as garrafas plásticas não ficam com um volume residual de água ozonizada'})
  ]}},
  '4.6.10':{1:{simple:true,questionsInInformation:true,checks:[
   check('avaliacao-transporte','Avaliação do transporte das embalagens para a sala de envase'),
   check('transporte-manual-ar-filtrado','As embalagens colocadas manualmente, em transportadores aéreos para entrada na sala de envase, são movimentadas com sopradores de ar com filtro de ar microbiológico?',{informationOnly:true,informationQuestion:true,yesLabel:'As embalagens colocadas manualmente em transportadores aéreos para entrada na sala de envase são movimentadas com sopradores de ar com filtro de ar microbiológico',noLabel:'As embalagens colocadas manualmente em transportadores aéreos para entrada na sala de envase não são movimentadas com sopradores de ar com filtro de ar microbiológico'}),
   check('pia-higiene-maos-transporte','No local existe pia para lavagem das mãos com recursos para higiene e instruções para correta lavagem?',{informationOnly:true,informationQuestion:true,yesLabel:'No local existe pia para lavagem das mãos com recursos para higiene e instruções para correta lavagem',noLabel:'No local não existe pia para lavagem das mãos com recursos para higiene e instruções para correta lavagem'})
  ]}},
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
    check('analise-tampas-recebidas','É feita análise microbiológica dos lotes das tampas recebidas?',{yesLabel:'É feita análise microbiológica dos lotes das tampas recebidas',noLabel:'Não é feita análise microbiológica dos lotes das tampas recebidas'}),
    check('dupla-embalagem','Os sacos com as tampas são enviados com embalagens primária e secundária?'),
    check('desinfeccao-envasadora','Faz a desinfecção das tampas no estabelecimento?',{requiredInfo:true}),
    check('retirada-envase','A embalagem secundária é retirada imediatamente antes do transporte para a sala de envase?',{route:'direto',section:'Tampas transportadas para a tampadora sem auxílio de silo externo'}),
    check('armazenamento-primaria','Os sacos com apenas a embalagem primária são mantidos fora do piso e dos equipamentos da sala de envase?',{route:'direto',section:'Tampas transportadas para a tampadora sem auxílio de silo externo'}),
    check('retirada-silo','A embalagem secundária é retirada imediatamente antes do transporte para o silo de transferência?',{route:'silo',section:'Silo externo com um alimentador de tampas por taliscas ou transporte pneumático'}),
    check('localizacao-silo','O silo está instalado em área adequada?',{route:'silo',section:'Silo externo com um alimentador de tampas por taliscas ou transporte pneumático'}),
    check('filtro-silo','O soprador do silo possui filtro de ar microbiológico?',{route:'silo',section:'Silo externo com um alimentador de tampas por taliscas ou transporte pneumático'}),
    check('transporte-silo','O silo utiliza transportador fechado ou protegido?',{route:'silo',section:'Silo externo com um alimentador de tampas por taliscas ou transporte pneumático'}),
    check('transporte-pneumatico-silo','O silo utiliza transporte pneumático por ar comprimido ou soprado?',{route:'silo',section:'Silo externo com um alimentador de tampas por taliscas ou transporte pneumático',yesLabel:'O silo utiliza transporte pneumático por ar comprimido ou soprado',noLabel:'O silo não utiliza transporte pneumático por ar comprimido ou soprado'}),
    check('higiene-mangote-silo','O mangote utilizado está em boas condições de higiene e existe registro de sua higienização?',{route:'silo',requires:'transporte-pneumatico-silo',section:'Silo externo com um alimentador de tampas por taliscas ou transporte pneumático',yesLabel:'O mangote utilizado está em boas condições de higiene e existe registro de sua higienização',noLabel:'O mangote utilizado não está em boas condições de higiene e/ou não existe registro de sua higienização'}),
    check('transporte-taliscas-silo','O silo utiliza transporte por taliscas / anteparos?',{route:'silo',section:'Silo externo com um alimentador de tampas por taliscas ou transporte pneumático',yesLabel:'O silo utiliza transporte por taliscas / anteparos',noLabel:'O silo não utiliza transporte por taliscas / anteparos'})
   ]),
   1:returnableInspection([
    check('ambiente-desinfeccao','O ambiente onde é feita a desinfecção é adequado?'),
    check('transporte-tampas-envase','As tampas desinfetadas são transportadas para a sala de envase em recipientes higienizados e com tampa?',{route:'direto'}),
    check('transporte-tampas-silo','As tampas desinfetadas são transportadas para o silo em recipientes higienizados e com tampa?',{route:'silo'}),
    check('analise-tampas','É feita a análise microbiológica dos lotes desinfetados de tampas?'),
    check('fora-silo','A desinfecção é realizada dentro do silo?',{route:'silo'}),
    check('fora-envase','A desinfecção é realizada na sala de envase ou na antessala?')
   ].map(criterion=>({...criterion,section:'Higienização de tampas'})))
  },
  '4.6.6':{
   0:returnableInspection([
    check('sem-acumulo-enxague','Os garrafões após o enxágue com água mineral natural saem sem acúmulo de água de enxágue no seu interior?'),
    check('bicos-pressao','Os bicos estão desobstruídos e a pressão dos jatos permite que a água de enxágue alcance o fundo das embalagens?')
   ]),
   1:returnableInspection([
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
   ])
  },
  '4.3.5':{1:{separateInformation:true,checks:[
   check('higienizacao-adequada','Sim',{yesOnly:true,scopeAnswer:true}),
   check('nao-reservatorio','Não',{noOnly:true,scopeAnswer:true}),
    sanitizers('Sanitizantes utilizados para descontaminação ou desinfecção de rotina do reservatório',{yesOnly:true,frequencyOptional:true}),
   check('recirculacao','Procedimento adotado para recirculação do sanitizante no tanque',{yesOnly:true,details:'recirculation'}),
   ...controls('do reservatório')
  ]}},
  '4.3.4':{
   0:{simple:true,checks:[
    check('inspecao-visual','Inspeção visual do reservatório')
   ]},
   1:{simple:true,questionsInInformation:true,checks:[
    check('revisao-higienizacao','Revisão das operações de higienização e adoção das medidas corretivas necessárias'),
    check('pop-registro-revisoes','O POP prevê o registro das revisões das operações de higienização?',{informationOnly:true,informationQuestion:true,yesLabel:'O POP prevê o registro das revisões das operações de higienização',noLabel:'O POP não prevê o registro das revisões das operações de higienização'})
   ]}
  },
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
  '4.2.7':{1:{separateInformation:true,checks:[
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
 // Os 17 F solicitados: resposta por unidade, informações uma vez por F.
 const compactWaterPanels={
  '4.1.3':[0,2], '4.2.2':[0,1], '4.2.7':[1], '4.2.8':[0,1],
  '4.2.9':[0,1], '4.3.2':[0,1,2], '4.3.3':[0,1],
  '4.3.4':[0,1], '4.3.5':[1]
 };
 const compactWater=(row,index)=>compactWaterPanels[row.code]?.includes(index);
 const compactAnswerId='bpf-resposta-geral';
 const compactConfigCache=new WeakMap();
 function get(row,index){
  if(row.code==='4.3.3'&&compactWater(row,index))return {compactWater:true,compositeReservoir:true,optional:true,checks:[]};
  const config=row.code==='4.6.3'&&index===0&&row.scopes.some(scope=>scope.phrases[0]?.allowNA)
   ?disposableRinse:panels[row.code]?.[index];
  if(row.code==='4.6.7'&&index===0&&config)return {...config,allowNA:row.scopes.some(scope=>scope.phrases[0]?.allowNA)};
  if(config&&compactWater(row,index)){
   if(compactConfigCache.has(config))return compactConfigCache.get(config);
   const original=synchronizedItems.has(row.code)?{...config,optional:true}:config;
   const info=config.checks.filter(c=>!c.scopeAnswer).map(c=>({ ...c, informationOnly:true,
    informationQuestion:!c.yesOnly&&!c.noOnly&&!c.informationList&&!c.confirmationOnly,
    ...(row.code==='4.3.4'&&index===0&&c.id==='inspecao-visual'?{details:'inspection-frequency',optionalDetails:true}: {})
   }));
   const compact={...original,compactWater:true,original,optional:true,simple:true,separateInformation:true,
    informationHeading:'Outras informações',answerPrompts:null,checks:[check(compactAnswerId,'Avaliação geral',{scopeAnswer:true}),...info]};
   compactConfigCache.set(config,compact);return compact;
  }
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
 function capsTransportRoute(scope,data){
  try{const state=JSON.parse(data[key({name:bpfPhraseName(scope,0)})]||'null');return ['direto','silo'].includes(state?.route)?state.route:'';}catch(_){return '';}
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
     const priorChecks=row.code==='4.7.2'?(entry.index===1?[...surfaceChecks,...doorChecks]:null):entry.index===0?({'4.6.4':prewashChecks,'4.7.6':fillingChecks['4.7.6']})[row.code]:groupedIndices?fillingChecks[row.code]:null;
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
   if(entry.index===1&&!state?.['nao-conducao']&&getConductionCheckEntry(entry,'4.2.7')){
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
   if(entry.index===1&&!state?.['nao-reservatorio']&&reservoirStructureEntry(entry,'4.3.5')){
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
   if(entry.index===1&&state&&BPF_PHRASES.some(page=>page.rows.some(row=>row.code==='4.6.8'&&row.scopes.some(scope=>scope.name===entry.scope.name))))state.route=capsTransportRoute(entry.scope,data);
   return state;
  }catch (_) { return null; }
 };
 function reservoirStructureEntry(entry,code='4.3.2'){
  return BPF_PHRASES.some(page=>page.page>=2&&page.page<=5&&page.rows.some(row=>row.code===code&&row.scopes.some(scope=>scope.name===entry.scope.name)));
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
  (!criterion.requiresAnyRinseYes||state.bpfAnyRinseYes===true)&&(!criterion.route||state.route===criterion.route)&&(!criterion.requires||state[criterion.requires]?.answer==='1')&&
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

 // A ordem é fixada no próprio formulário F, sem sobreposição visual
 // e sem renomear os campos usados por respostas, OBS/NC e anexos.
 function ensure469FOrder(row){
  if(row?.code!=='4.6.9')return false;
  let changed=false;
  for(const phrases of [row.phrases,...(row.scopes||[]).map(scope=>scope.phrases)]){
   if(!Array.isArray(phrases)||phrases.length<2)continue;
   const transport=phrases.find(phrase=>/transporte das embalagens da área de higienização para a sala de envase/i.test(phrase?.text||''));
   const protection=phrases.find(phrase=>/saída do equipamento de higienização das embalagens/i.test(phrase?.text||''));
   if(!transport||!protection)continue;
   // Antigo F2 passa a F1; antigo F1 passa a F2.
   // Manter os nomes dos campos originais preserva respostas anteriores.
   transport.fieldSuffix??=2;
   protection.fieldSuffix??=1;
   if(phrases[0]!==transport||phrases[1]!==protection){
    phrases.splice(0,2,transport,protection);
    changed=true;
   }
  }
  return changed;
 }
 // F2 de 4.5.8: inspeção/aceitação/reprovação; F3: destino final.
 // A associação com respostas antigas permanece nos fieldSuffix originais.
 function ensure458FOrder(row){
  if(row?.code!=='4.5.8')return false;
  let changed=false;
  for(const phrases of [row.phrases,...(row.scopes||[]).map(s=>s.phrases)]){
   if(!Array.isArray(phrases)||phrases.length<3)continue;
   const inspection=phrases.find(p=>/inspeção individual, aceitação e reprovação de embalagens/i.test(p?.text||''));
   const destination=phrases.find(p=>/destino final das embalagens reprovadas/i.test(p?.text||''));
   if(!inspection||!destination||inspection===destination)continue;
   inspection.fieldSuffix??=3;
   destination.fieldSuffix??=2;
   if(phrases[1]!==inspection||phrases[2]!==destination){
    phrases.splice(1,2,inspection,destination);
    changed=true;
   }
  }
  return changed;
 }
 function preparePhrases(){
  const phrase={
   text:'Quando a envasadora realiza a desinfecção das tampas, deve controlar o processo e proteger os lotes até o envase.',
   guidance:'Confira a adequação do desinfetante e da área de desinfecção, os registros de controle e os laudos microbiológicos por lote. Acompanhe o transporte das tampas em recipientes higienizados e fechados. Verifique se a desinfecção ocorre fora do silo e da área de envase.',
   appcc:'PCC',fieldSuffix:'CQ_DesinfeccaoTampas'
  };
  for(const page of BPF_PHRASES)for(const row of page.rows){
   if(page.page===6&&row.code==='4.5.8')ensure458FOrder(row);
   if(row.code==='4.6.12'){
    // F2 original passa a informação única do F1; F3 original vira F2.
    for(const phrases of [row.phrases,...row.scopes.map(scope=>scope.phrases)]){
     if(phrases.length<3)continue;
     const [main,availability,contents]=phrases;
     phrases.splice(0,3,main,{...contents,fieldSuffix:contents.fieldSuffix??3});
    }
   }
   if(row.code==='4.6.9')ensure469FOrder(row);
   if(row.code==='4.3.6'){
    for(const phrases of [row.phrases,...row.scopes.map(scope=>scope.phrases)]){
     if(phrases.length!==3)continue;
     const [first,availability,contents]=phrases;
     phrases.splice(0,3,first,{...contents,fieldSuffix:contents.fieldSuffix??3});
    }
   }
   if(page.page===6&&row.code==='4.5.3'){
    // Inversão F2/F3. Manter os identificadores originais para conservar
    // respostas, evidências e observações já preenchidas.
    for(const phrases of [row.phrases,...row.scopes.map(scope=>scope.phrases)]){
     const [inspection,rejection,sanitizers]=phrases;
     if(!sanitizers)continue;
     phrases.splice(0,3,inspection,
      {...sanitizers,fieldSuffix:sanitizers.fieldSuffix??3},
      {...rejection,fieldSuffix:rejection.fieldSuffix??2});
    }
   }
   if(page.page>=2&&page.page<=5&&row.code==='4.3.5'){
    for(const phrases of [row.phrases,...row.scopes.map(scope=>scope.phrases)]){
     const [hygiene,records,training]=phrases;
     if(!training)continue;
     phrases.splice(0,3,{...training,fieldSuffix:training.fieldSuffix??3},{...hygiene,fieldSuffix:hygiene.fieldSuffix??1},{...records,fieldSuffix:records.fieldSuffix??2});
    }
   }
   if(page.page===1&&row.code==='4.2.7'){
    for(const phrases of [row.phrases,...row.scopes.map(scope=>scope.phrases)]){
     const [hygiene,records,training]=phrases;
     if(!training)continue;
     // Keep field suffixes: old answers, observations and Water data stay linked.
     phrases.splice(0,3,{...training,fieldSuffix:training.fieldSuffix??3},{...hygiene,fieldSuffix:hygiene.fieldSuffix??1},{...records,fieldSuffix:records.fieldSuffix??2});
    }
   }
   if([9,10].includes(page.page)&&row.code==='4.7.2'){
    for(const phrases of [row.phrases,...row.scopes.map(scope=>scope.phrases)]){
     const [first,second]=phrases;if(!second)continue;
     phrases.splice(0,2,{...second,fieldSuffix:second.fieldSuffix??2},{...first,fieldSuffix:first.fieldSuffix??1});
    }
   }
   if([7,8].includes(page.page)&&row.code==='4.6.11'){
    for(const phrases of [row.phrases,...row.scopes.map(scope=>scope.phrases)]){
     const [first,second]=phrases;if(!second)continue;
     phrases.splice(0,2,{...second,fieldSuffix:second.fieldSuffix??2},{...first,fieldSuffix:first.fieldSuffix??1});
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
   if(row.code==='4.3.3'){
    for(const phrases of [row.phrases,...row.scopes.map(scope=>scope.phrases)]){
     if(phrases.length!==6)continue;
     const original=phrases[2];
     phrases[2]={...original,text:'Os elementos filtrantes são verificados e trocados na frequência definida pelo estabelecimento industrial.',option:'Verificação e troca dos elementos filtrantes na frequência definida'};
     phrases.push({...original,revision:undefined,fieldSuffix:'PresencaFiltroSaida',text:'Possui filtros na saída dos reservatórios.',option:'Possui filtros na saída dos reservatórios.',guidance:'Verificar a existência de filtros na saída do reservatório.'});
     phrases.push({...original,revision:undefined,fieldSuffix:'RegistrosFiltros',text:'São mantidos os registros de verificação e troca dos elementos filtrantes.',option:'Existência de registros de verificação e troca dos elementos filtrantes',guidance:'Verificar a existência dos registros de verificação e troca.'});
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
  guidance:'Selecione a frequência geral ou deixe em branco.',
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
  section.dataset.bpfInfoBox='';
  section.append(element('legend',visualFrequency.label));
  for(const scope of new Set(panel.entries.map(entry=>entry.scope))){
   const unit=element('details');
   unit.dataset.bpfInfoReview='';
   unit.dataset.bpfInfoEntries=JSON.stringify([...panel.entries.filter(entry=>entry.scope===scope).map(entry=>entry.name),scope.name]);
   unit.addEventListener('toggle',()=>{if(unit.open)unit.dataset.bpfInfoVisited='1';});
   unit.title=visualFrequency.guidance;
   unit.append(element('summary',bpfScopeLabel(page,scope)));
   enableHoverUnit(unit);
   const {field,state,details}=visualInspectionState(page,scope,values);
   fields(unit,visualFrequency,details,()=>{
    values[field]=JSON.stringify(state);
    changed();
   },[]);
   section.append(unit);
  }
  card.append(section);
 }
 const reservoirFilterKey=scope=>'BPF_ReservoirFilterInfo_'+scope.name;
 const filterQuestions=[
  ['manometro','O filtro possui manômetro de pressão?','O filtro possui manômetro de pressão','O filtro não possui manômetro de pressão'],
  ['torneira','Possui torneira para coleta de amostra?','O filtro possui torneira para coleta de amostra','O filtro não possui torneira para coleta de amostra'],
  ['microbiologia','Faz análise microbiológica do filtro?','É realizada análise microbiológica do filtro','Não é realizada análise microbiológica do filtro']
 ];
 const filterMedia=['Areia','Quartzo','Polipropileno','Malhas e mantas filtrantes','Outros'];
 function reservoirFilterRead(scope,data){try{return JSON.parse(data[reservoirFilterKey(scope)]||'{}')||{};}catch{return {};}}
 // 4.3.3 possui diversos índices internos por F. A escolha geral é por
 // reservatório; os antigos requisitos continuam disponíveis como informação.
 function compactReservoirState(page,row,panel,data){
  const field=sharedLineKey(page,row,panel);
  if(data[field])try{return JSON.parse(data[field]);}catch(_){}
  const state={checks:{},filters:{},legacy:{},decisions:{}};
  for(const e of panel.entries)if(hasAnswer(data[e.name]))state.legacy[e.name]=data[e.name];
  for(const i of new Set(panel.entries.map(e=>e.index))){
   const seen=[...new Set(panel.entries.filter(e=>e.index===i).map(e=>data[e.name]).filter(hasAnswer))];
   if(seen.length===1)state.checks[i]=seen[0];
  }
  if(panel.id===1){
   const old=[...new Set(panel.entries.map(e=>e.scope))].map(scope=>reservoirFilterRead(scope,data));
   for(const [id] of filterQuestions){const seen=[...new Set(old.map(x=>x[id]).filter(hasAnswer))];if(seen.length===1)state.filters[id]=seen[0];}
   const media=[...new Set(old.map(x=>JSON.stringify(x.media||[])).filter(x=>x!=='[]'))];if(media.length===1)state.filters.media=JSON.parse(media[0]);
   const other=[...new Set(old.map(x=>x.other).filter(Boolean))];if(other.length===1)state.filters.other=other[0];
  }
  return state;
 }
 function compactReservoirDecision(entries,data){
  const answers=entries.map(e=>data[e.name]);
  return answers.includes('0')?'0':answers.includes('1')?'1':'';
 }
 function renderCompactReservoir(card,page,row,panel){
  const state=compactReservoirState(page,row,panel,values),field=sharedLineKey(page,row,panel);
  state.checks??={};state.filters??={};state.decisions??={};
  const scopes=[...new Set(panel.entries.map(e=>e.scope))];
  const save=()=>{values[field]=JSON.stringify(state);changed();recalc();};
  const grid=element('div');grid.className='bpf-answer-grid bpf-water-grid';grid.style.gridTemplateColumns='minmax(0,1fr)';const controls=[];
  for(const [value,heading] of [['1','Sim'],['0','Não']]){
   const box=element('fieldset');box.className='bpf-answer-box';box.append(element('legend',panel.label+' — '+heading));
   for(const scope of scopes){
    const entries=panel.entries.filter(e=>e.scope===scope),label=element('label',bpfScopeLabel(page,scope)),input=element('input');
    label.className='bpf-answer-item';input.type='checkbox';input.dataset.bpfCompactAnswer=value;input.checked=compactReservoirDecision(entries,values)===value;
    controls.push(()=>{input.checked=compactReservoirDecision(entries,values)===value;});
    input.onchange=()=>{const selected=input.checked?value:'';state.decisions[scope.name]=selected;for(const e of entries)values[e.name]=selected;for(const update of controls)update();save();};label.prepend(input);box.append(label);
   }
   grid.append(box);
  }
  const info=element('fieldset');info.className='bpf-answer-box';info.dataset.bpfInfoBox='';info.append(element('legend',panel.label+' — Outras informações'));
  const ask=(caption,target,id)=>{const label=element('label',caption),select=element('select');label.style.cssText='display:block;margin:10px 0';select.style.cssText='display:block;margin:5px 0;padding:5px;font:inherit';for(const [v,t] of [['','Selecione'],['1','Sim'],['0','Não']])select.add(new Option(t,v));select.value=target[id]||'';select.onchange=()=>{target[id]=select.value;save();};label.append(select);info.append(label);};
  for(const i of new Set(panel.entries.map(e=>e.index))){const e=panel.entries.find(e=>e.index===i);ask(bpfUnifiedOption(row,e),state.checks,i);}
  if(panel.id===1){
   for(const [id,caption] of filterQuestions)ask(caption,state.filters,id);
   info.append(element('strong','Qual o elemento filtrante utilizado?'));state.filters.media??=[];
   const other=element('label','Especifique o outro elemento filtrante'),area=element('textarea');area.rows=2;area.value=state.filters.other||'';other.append(area);area.oninput=()=>{state.filters.other=area.value;save();};
   const refresh=()=>{other.hidden=!state.filters.media.includes('Outros');};
   for(const media of filterMedia){const label=element('label',media),input=element('input');label.className='bpf-water-choice';input.type='checkbox';input.checked=state.filters.media.includes(media);input.onchange=()=>{state.filters.media=input.checked?[...new Set([...state.filters.media,media])]:state.filters.media.filter(x=>x!==media);refresh();save();};label.prepend(input);info.append(label);}
   info.append(other);refresh();
  }
  grid.append(info);card.append(grid);
  const notes=element('div');notes.className='bpf-answer-grid bpf-water-grid';notes.style.gridTemplateColumns='minmax(0,1fr)';
  for(const [answer,heading] of [['1','OBS — observação'],['0','NC — não conformidade']]){const box=element('fieldset');box.className='bpf-answer-box';box.append(element('legend',heading));const area=element('textarea');area.rows=4;area.dataset.note=bpfGroupNoteName(page,row,panel,answer);area.value=values[area.dataset.note]||'';area.oninput=()=>{values[area.dataset.note]=area.value;changed();};box.append(area);bpfAttachNoteTools(area,box,page,row.code,panel,()=>answer);bpfInstallIndividualNC(area,card,page,row,panel,()=>answer,()=>scopes.filter(s=>compactReservoirDecision(panel.entries.filter(e=>e.scope===s),values)===answer).map(s=>({id:panel.entries.find(e=>e.scope===s).name,label:bpfScopeLabel(page,s)})));notes.append(box);}
  card.append(notes);return true;
 }
 function compactReservoirReport(page,row,panel,data){
  const state=compactReservoirState(page,row,panel,data),scopes=[...new Set(panel.entries.map(e=>e.scope))];
  const report=[];
  for(const answer of ['1','0']){const selected=scopes.filter(s=>compactReservoirDecision(panel.entries.filter(e=>e.scope===s),data)===answer);if(!selected.length)continue;const note=text(data[bpfGroupNoteName(page,row,panel,answer)]);report.push({page,row,panel,answer,checklist:selected.map(s=>bpfScopeLabel(page,s)),note,selected:panel.entries.filter(e=>selected.includes(e.scope))});}
  const info=[];
  for(const i of new Set(panel.entries.map(e=>e.index))){const e=panel.entries.find(e=>e.index===i),a=state.checks?.[i];if(hasAnswer(a))info.push(bpfUnifiedOption(row,e)+': '+(a==='1'?'Sim':'Não'));else for(const value of ['1','0']){const old=panel.entries.filter(x=>x.index===i&&state.legacy?.[x.name]===value);if(old.length)info.push(bpfUnifiedOption(row,e)+': '+(value==='1'?'Sim':'Não')+' ('+old.map(x=>bpfScopeLabel(page,x.scope)).join(', ')+')');}}
  if(panel.id===1){const filters=state.filters||{};for(const [id,caption,yes,no] of filterQuestions){if(hasAnswer(filters[id]))info.push(filters[id]==='1'?yes:no);}if(filters.media?.length)info.push('Elemento filtrante utilizado: '+filters.media.map(m=>m==='Outros'&&filters.other?filters.other:m).join(', '));if(!Object.keys(filters).some(k=>k!=='media'||filters.media.length))info.push(...reservoirFilterReport(page,panel,data));}
  if(info.length)report.push({page,row,panel,heading:'Outras informações',checklist:info,note:'',selected:[]});return report;
 }
 function renderReservoirFilterInfo(card,page,row,panel){
  if(row.code!=='4.3.3'||panel.id!==1)return;
  const box=element('fieldset');box.className='bpf-answer-box';box.dataset.bpfInfoBox='';box.append(element('legend','F2 — Outras observações'));
  for(const scope of new Set(panel.entries.map(e=>e.scope))){
   const unit=element('details');unit.className='bpf-water-unit';unit.dataset.bpfInfoReview='';unit.dataset.bpfInfoEntries=JSON.stringify(panel.entries.filter(e=>e.scope===scope).map(e=>e.name));
   unit.addEventListener('toggle',()=>{if(unit.open)unit.dataset.bpfInfoVisited='1';});
   unit.append(element('summary',bpfScopeLabel(page,scope)));enableHoverUnit(unit);
   const state=reservoirFilterRead(scope,values);state.media??=[];
   const save=()=>{values[reservoirFilterKey(scope)]=JSON.stringify(state);changed();};
   const ask=(key,caption,yes,no)=>{const label=element('label');const wording=element('span',caption);label.append(wording);label.style.cssText='display:block;margin:12px 0';const select=element('select');select.style.cssText='display:block;margin:6px 0;padding:5px';for(const [v,t] of [['','Selecione'],['1','Sim'],['0','Não']])select.add(new Option(t,v));select.value=state[key]||'';const refresh=()=>{wording.textContent=select.value==='1'?yes:select.value==='0'?no:caption;};select.onchange=()=>{state[key]=select.value;refresh();save();};refresh();label.append(select);unit.append(label);};
   ask(...filterQuestions[0]);unit.append(element('strong','Qual o elemento filtrante utilizado?'));
   const other=element('label','Especifique o outro elemento filtrante');other.style.cssText='display:block;margin:8px 0';const area=element('textarea');area.rows=2;area.style.cssText='display:block;width:100%;margin-top:5px';area.value=state.other||'';area.oninput=()=>{state.other=area.value;save();};other.append(area);
   const refresh=()=>{other.hidden=!state.media.includes('Outros');other.style.display=other.hidden?'none':'block';};
   for(const media of filterMedia){const label=element('label',media);label.style.cssText='display:block;margin:8px 0';const check=element('input');check.type='checkbox';check.checked=state.media.includes(media);check.onchange=()=>{state.media=check.checked?[...new Set([...state.media,media])]:state.media.filter(x=>x!==media);refresh();save();};label.prepend(check);unit.append(label);}
   unit.append(other);refresh();ask(...filterQuestions[1]);ask(...filterQuestions[2]);box.append(unit);
  }
  card.append(box);
 }

 const packagingPopKey='BPF_F_4_6_12_POP_DisponivelAtualizado';
 // Uma resposta por PROCESSO (retornáveis e descartáveis), nunca por linha.
 // A chave antiga, única para os dois processos, permanece como legado.
 const packagingPopPageKey=page=>packagingPopKey+'_Pagina_'+page.page;
 // Antigo F2: frase única, sem seleção de linha, incorporada ao F1.
 const packagingPopQuestion='Os Procedimentos Operacionais Padronizados referentes às operações de higienização das embalagens devem estar disponíveis e atualizados.';
 const packagingPopStatement=a=>a==='1'?'Os Procedimentos Operacionais Padronizados de higienização das embalagens estão disponíveis e atualizados.':'Os Procedimentos Operacionais Padronizados de higienização das embalagens não estão disponíveis ou estão desatualizados.';
 function packagingLegacyKey(scope){
  const copy={...scope,phrases:scope.phrases.slice()};
  copy.phrases[1]={...(copy.phrases[1]||{}),fieldSuffix:2};
  return bpfPhraseName(copy,1);
 }
 function packagingPopAnswer(page,row,data){
  const ownKey=packagingPopPageKey(page);
  if(data[ownKey]==='1'||data[ownKey]==='0')return data[ownKey];
  if(Object.prototype.hasOwnProperty.call(data,ownKey))return '';
  // Compatibilidade com arquivos de inspeção da versão anterior.
  if(data[packagingPopKey]==='1'||data[packagingPopKey]==='0')return data[packagingPopKey];
  if(Object.prototype.hasOwnProperty.call(data,packagingPopKey))return '';
  const legacy=row.scopes.map(scope=>data[packagingLegacyKey(scope)]).filter(a=>a==='1'||a==='0');
  return legacy.length===row.scopes.length&&legacy.every(a=>a===legacy[0])?legacy[0]:'';
 }
 function renderPackagingPopInfo(card,page,row,panel){
  if(row.code!=='4.6.12'||panel.id!==0)return false;
  // O F2 original pertence agora ao F1. Um único controle para o item
  // inteiro, nunca um controle por Linha 1, Linha 2 ou outras linhas.
  let box=card.querySelector?.('[data-bpf-packaging-pop-global]');
  if(box){card.append(box);return true;}
  box=element('fieldset');
  box.className='bpf-answer-box';
  box.dataset.bpfInfoBox='';
  box.dataset.bpfPackagingPopGlobal='1';
  box.append(element('legend','F1 — Outras informações'));
  const label=element('label'),wording=element('span',packagingPopQuestion),select=element('select');
  label.style.cssText='display:block;margin:10px 0;line-height:1.3';
  select.style.cssText='display:block;margin:5px 0 0;padding:5px';
  select.setAttribute('aria-label','4.6.12 — Disponibilidade e atualização do POP de higienização das embalagens');
  for(const [v,t] of [['','Selecione'],['1','Sim'],['0','Não']])select.add(new Option(t,v));
  const refresh=()=>{wording.textContent=select.value?packagingPopStatement(select.value):packagingPopQuestion;};
  select.value=packagingPopAnswer(page,row,values);
  select.onchange=()=>{
   values[packagingPopPageKey(page)]=select.value;
   refresh();
   bpfSyncObservation(row,page);
   changed();
   window.GuiaRecovery?.schedule?.();
  };
  refresh();
  label.append(wording,select);
  box.append(label);
  card.append(box);
  return true;
 }
 function packagingPopReport(page,row,panel,data){
  if(row.code!=='4.6.12'||panel.id!==0)return [];
  const answer=packagingPopAnswer(page,row,data);
  return !answer?[]:[{page,row,panel,heading:'Outras informações',checklist:[packagingPopStatement(answer)],answer:'',note:'',selected:[]}];
 }
 const popAvailabilityKey='BPF_F_4_3_6_POP_DisponivelAtualizado';
 const popAvailabilityLegacyKey=scope=>'BPF_F_'+scope.name+'_2';
 const popAvailabilityQuestion='O POP referente à higienização do reservatório está disponível e atualizado?';
 const popAvailabilityStatement=answer=>answer==='1'?'O POP referente à higienização do reservatório está disponível e atualizado':'O POP referente à higienização do reservatório não está disponível e/ou não está atualizado';
 function popAvailabilityAnswer(data,panel){
  if(data[popAvailabilityKey]==='1'||data[popAvailabilityKey]==='0')return data[popAvailabilityKey];
  // Uma resposta global explicitamente limpa não deve reutilizar dados anteriores.
  if(Object.prototype.hasOwnProperty.call(data,popAvailabilityKey))return '';
  // Compatibilidade: somente aproveitar respostas antigas se TODOS os reservatórios
  // anteriormente avaliados apresentarem o mesmo resultado.
  const legacy=panel.entries.map(({scope})=>data[popAvailabilityLegacyKey(scope)]);
  return legacy.length&&legacy.every(answer=>answer==='1')?'1':
   legacy.length&&legacy.every(answer=>answer==='0')?'0':'';
 }
 function renderReservoirPopInfo(card,page,row,panel){
  if(row.code!=='4.3.6'||panel.id!==0)return;
  const box=element('fieldset');box.className='bpf-answer-box';box.dataset.bpfInfoBox='';
  box.append(element('legend','F1 — Outras informações'));
  // A disponibilidade e atualização do POP é uma informação única, independente
  // dos blocos Reservatório 1–4, sem repetição da pergunta.
  const label=element('label'),wording=element('span',popAvailabilityQuestion),select=element('select');
  label.style.cssText='display:block;margin:10px 0';
  select.style.cssText='display:block;margin:6px 0;padding:5px';
  for(const [v,t] of [['','Selecione'],['1','Sim'],['0','Não']])select.add(new Option(t,v));
  select.value=popAvailabilityAnswer(values,panel);
  const refresh=()=>{wording.textContent=select.value?popAvailabilityStatement(select.value):popAvailabilityQuestion;};
  select.onchange=()=>{values[popAvailabilityKey]=select.value;refresh();changed();};
  refresh();label.append(wording,select);box.append(label);card.append(box);
 }
 function reservoirPopReport(page,row,panel,data){
  if(row.code!=='4.3.6'||panel.id!==0)return [];
  const checklist=[],answer=popAvailabilityAnswer(data,panel);
  if(answer)checklist.push(popAvailabilityStatement(answer));
  const former={...panel,storageId:1};
  for(const value of ['1','0']){const note=String(data[bpfGroupNoteName(page,row,former,value)]||'').trim();if(note&&checklist.length)checklist.push('Registro anterior — '+note);}
  return checklist.length?[{page,row,panel,heading:'Outras informações',checklist,answer:'',note:'',selected:[]}]:[];
 }
 function reservoirFilterReport(page,panel,data){
  const scopes=[...new Set(panel.entries.map(e=>e.scope))],result=[];
  const group=(caption,answer,selected)=>{if(selected.length)result.push(caption+': '+answer+' ('+selected.map(scope=>bpfScopeLabel(page,scope)).join(', ')+')');};
  for(const [key,caption,yes,no] of filterQuestions)for(const value of ['1','0']){
   const matching=scopes.filter(scope=>reservoirFilterRead(scope,data)[key]===value);
   if(matching.length)result.push((value==='1'?yes:no)+' ('+matching.map(scope=>bpfScopeLabel(page,scope)).join(', ')+')');
  }
  const materials=new Map();for(const scope of scopes){const state=reservoirFilterRead(scope,data);for(const media of state.media||[]){const label=media==='Outros'?'Outros'+(state.other?' — '+state.other.trim():''):media;if(!materials.has(label))materials.set(label,[]);materials.get(label).push(scope);}}
  for(const [label,selected] of materials)group('Elemento filtrante utilizado',label,selected);
  return result;
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
   if(row.code==='4.3.4'){
    const key=page.page+':4.3.4:F1:frequencia-visual';
    const entry={key,page:page.page,code:row.code,index:0,label:'F1 — '+visualFrequency.label,scopes:[],
     appcc:row.phrases[0].appcc,original:{text:'Frequência da inspeção visual interna',guidance:'Selecione a frequência por reservatório ou deixe em branco.'},
     refs:[{set text(value){visualFrequency.label=value;},set guidance(value){visualFrequency.guidance=value;}}]};
    entries.push(entry);byKey.set(key,entry);
   }
   if(!synchronizedItems.has(row.code)&&!['4.3.4','4.6.10','4.6.7'].includes(row.code))continue;
   for(const panel of bpfPanels(page,row)){
    const config=get(row,panel.id);
    if(!config)continue;
    const index=panel.id;
    for(const criterion of config.checks){
     const key=[page.page,row.code,'F'+(index+1),'check',criterion.id].join(':');
     if(criterion.id===compactAnswerId)continue;
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
   0:{question:'Possui registro comprovando a inspeção no ato do recebimento?',caption:'Registro de inspeção no recebimento',yes:'Possui registro que comprova a inspeção no recebimento',no:'Não possui registro que comprova a inspeção no recebimento',detailsAnswer:'1'},
   1:{question:'O saneante conferido estava identificado, dentro da validade, regularizado na ANVISA e possui autorização para a finalidade de uso declarada?',caption:'Identificação, validade, regularização e finalidade de uso do saneante',yes:'O saneante conferido atende aos requisitos de identificação, validade, regularização e finalidade de uso',no:'O saneante conferido não atende a um ou mais requisitos de identificação, validade, regularização e finalidade de uso',detailsAnswer:'0'}
  },
  '4.5.4':{
   0:{question:'Os garrafões recebidos estão na validade (fotografe o fundo de todos os garrafões com fabricantes diferentes)?',caption:'Validade dos garrafões recebidos',yes:'Os garrafões recebidos estão dentro da validade',no:'Há garrafões recebidos fora da validade'}
  }
 };
 const receptionEvidence=['Formulário de recepção','Carimbo na nota fiscal','Sistema eletrônico','Ficha de estoque','Outro'];
 const receptionKey=(name,field)=>'BPF_Recepcao_'+name+'_'+field;

 function groupedReception(row,panel){return row.code==='4.5.3'&&panel.id===0;}
 function receptionGroupedRecords(page,row,panel,data){
  const check=receptionChecks[row.code][panel.id],groups=new Map();
  for(const entry of panel.entries){
   const answer=data[receptionKey(entry.name,'Resposta')];if(!['1','0'].includes(answer))continue;
   const evidence=answer==='1'?String(data[receptionKey(entry.name,'Comprovacao')]||''):'';
   const details=evidence==='Outro'?String(data[receptionKey(entry.name,'Detalhes')]||'').trim():'';
   const key=JSON.stringify([answer,evidence,details]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(bpfScopeLabel(page,entry.scope));
  }
  return [...groups].map(([key,labels])=>{const [answer,evidence,details]=JSON.parse(key);return (answer==='1'?check.yes:check.no)+' ('+labels.join(', ')+')'+(evidence?' — '+evidence:'')+(details?' — '+details:'');});
 }
 function receptionRecords(page,row,panel,data){
  if(groupedReception(row,panel))return receptionGroupedRecords(page,row,panel,data);
  if(sanitizerReception(row,panel))return sanitizerReceptionRecords(page,row,panel,data);
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
   return [bpfScopeLabel(page,entry.scope)+' — '+(answer==='1'?check.yes:check.no)+(extra?' — '+extra:'')];
  });
 }

 function receptionSummary(page,row,panel,data){
  return receptionRecords(page,row,panel,data).map(record=>panel.label+' — '+record);
 }

 function receptionAnnex(page,row,panel,data){
  const checklist=receptionRecords(page,row,panel,data);
  return checklist.length?[{page,row,panel,heading:'Informações adicionais',checklist}]:[];
 }


 function renderGroupedReception(card,page,row,panel){
  const block=element('fieldset');block.className='bpf-answer-box';block.append(element('legend','Informações adicionais'));
  const check=receptionChecks[row.code][panel.id],question=element('p',check.question);block.append(question);
  const read=(entry,key)=>String(values[receptionKey(entry.name,key)]||'');
  const selected=new Set(panel.entries.filter(e=>read(e,'Resposta')==='1').map(e=>e.name));
  const common=(entries,key)=>{const vals=[...new Set(entries.map(e=>read(e,key)))];return vals.length===1?vals[0]:'';};
  const initial=panel.entries.filter(e=>selected.has(e.name));
  let evidence=common(initial,'Comprovacao'),details=common(initial.filter(e=>read(e,'Comprovacao')==='Outro'),'Detalhes');
  const persist=()=>{bpfSyncObservation(row,page);changed();};
  const write=(entry,key,value)=>{values[receptionKey(entry.name,key)]=value;};
  const saveCommon=()=>{for(const entry of panel.entries.filter(e=>selected.has(e.name))){write(entry,'Resposta','1');write(entry,'Comprovacao',evidence);write(entry,'Detalhes',evidence==='Outro'?details:'');}persist();};
  for(const entry of panel.entries){const label=element('label',bpfScopeLabel(page,entry.scope));label.style.cssText='display:block;margin:9px 0';const input=element('input');input.type='checkbox';input.checked=selected.has(entry.name);input.onchange=()=>{
   if(input.checked){selected.add(entry.name);write(entry,'Resposta','1');write(entry,'Comprovacao',evidence);write(entry,'Detalhes',evidence==='Outro'?details:'');}
   else{selected.delete(entry.name);for(const key of ['Resposta','Comprovacao','Detalhes'])write(entry,key,'');if(!selected.size){evidence='';details='';select.value='';area.value='';}}
   refresh();persist();
  };label.prepend(input);block.append(label);}
  const followup=element('div');const label=element('label','Comprovação');label.style.display='block';const select=element('select');select.style.cssText='display:block;margin:6px 0;padding:5px';for(const name of ['Selecione',...receptionEvidence])select.add(new Option(name,name==='Selecione'?'':name));select.value=evidence;select.onchange=()=>{evidence=select.value;if(evidence!=='Outro')details=area.value='';refresh();saveCommon();};label.append(select);followup.append(label);
  const other=element('label','Especifique a outra comprovação');const area=element('textarea');area.rows=2;area.style.cssText='display:block;width:100%;margin-top:6px';area.value=details;area.oninput=()=>{details=area.value;saveCommon();};other.append(area);followup.append(other);block.append(followup);
  const refresh=()=>{const visible=selected.size>0;followup.hidden=!visible;followup.style.display=visible?'block':'none';other.hidden=!visible||evidence!=='Outro';other.style.display=other.hidden?'none':'block';area.disabled=other.hidden;question.textContent=visible?check.yes:check.question;};
  refresh();card.append(block);
 }
 const sanitizerReceptionQuestions=[
  ['Identificacao','O saneante está identificado?','O saneante está identificado','O saneante não está identificado'],
  ['Validade','O saneante está dentro do prazo de validade?','O saneante está dentro do prazo de validade','O saneante está fora do prazo de validade'],
  ['Regularizacao','O saneante está regularizado na ANVISA?','O saneante está regularizado na ANVISA','O saneante não está regularizado na ANVISA'],
  ['Finalidade','A finalidade de uso do saneante corresponde à utilização realizada?','A finalidade de uso do saneante corresponde à utilização realizada','A finalidade de uso do saneante não corresponde à utilização realizada']
 ];
 function sanitizerReception(row,panel){return row.code==='4.5.3'&&panel.id===1;}
 function sanitizerReceptionRecords(page,row,panel,data){
  return panel.entries.flatMap(entry=>{
   const result=sanitizerReceptionQuestions.flatMap(([key,question,yes,no])=>{const answer=data[receptionKey(entry.name,key)];return ['1','0'].includes(answer)?[(answer==='1'?yes:no)+' ('+bpfScopeLabel(page,entry.scope)+')']:[];});
   if(result.length)return result;
   const legacy=data[receptionKey(entry.name,'Resposta')],check=receptionChecks[row.code][panel.id];
   return ['1','0'].includes(legacy)?[(legacy==='1'?check.yes:check.no)+' ('+bpfScopeLabel(page,entry.scope)+' — registro anterior)']:[]; 
  });
 }
 function renderSanitizerReception(card,page,row,panel){
  const block=element('fieldset');block.className='bpf-answer-box';block.append(element('legend','Informações adicionais — Saneantes'));
  for(const entry of panel.entries)for(const [key,question,yes,no] of sanitizerReceptionQuestions){
   const field=receptionKey(entry.name,key),label=element('label');label.style.cssText='display:block;margin:4px 0 6px;line-height:1.25';
   const prompt=element('span',question);label.append(prompt);
   const select=element('select');select.style.cssText='display:block;margin:2px 0 0;padding:3px 5px';for(const [v,t] of [['','Selecione'],['1','Sim'],['0','Não']])select.add(new Option(t,v));
   select.value=values[field]||'';
   const refresh=()=>{prompt.textContent=select.value==='1'?yes:select.value==='0'?no:question;};
   select.onchange=()=>{values[field]=select.value;bpfSyncObservation(row,page);changed();refresh();};
   refresh();label.append(select);block.append(label);
  }
  card.append(block);
 }
 function renderReception(card,page,row,panel){
  if(groupedReception(row,panel)){renderGroupedReception(card,page,row,panel);return;}
  if(sanitizerReception(row,panel)){renderSanitizerReception(card,page,row,panel);return;}
  const check=receptionChecks[row.code]?.[panel.id];
  if(!check||!panel.entries.length)return;
  const block=element('fieldset');
  block.className='bpf-answer-box';
  block.append(element('legend','Informações adicionais'));
  for(const entry of panel.entries){
   const unit=element('fieldset');
   unit.append(element('legend',bpfScopeLabel(page,entry.scope)));
   const question=element('p',check.question);unit.append(question);
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
    question.textContent=values[answerKey]==='1'?check.yes:values[answerKey]==='0'?check.no:check.question;
    followup.hidden=values[answerKey]!==check.detailsAnswer;
    detailLabel.hidden=panel.id===0&&values[evidenceKey]!=='Outro';
    detailLabel.style.display=detailLabel.hidden?'none':'';
    area.disabled=detailLabel.hidden;
   };
   const save=(key,value)=>{
    values[key]=value;
    refresh();
    bpfSyncObservation(row,page);
    changed();
   };
   const answerSelect=element('select');answerSelect.style.cssText='display:block;margin:6px 0;padding:5px';for(const [v,t] of [['','Selecione'],['1','Sim'],['0','Não']])answerSelect.add(new Option(t,v));answerSelect.value=values[answerKey]||'';answerSelect.onchange=()=>save(answerKey,answerSelect.value);unit.append(answerSelect);
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
   for(const id of compactWaterPanels[row.code]||[]){const name=sharedLineKey(page,row,{id});data.fields[name]={name,type:'/Tx',flags:0,label:row.code+' F'+(id+1)+' — Outras informações gerais',options:[],calc:'',phrasePage:page.page};}
   if(row.code==='4.6.12'){
    const name=packagingPopPageKey(page);
    data.fields[name]={name,type:'/Ch',flags:0,label:'4.6.12 F1 — Disponibilidade e atualização do POP (informação única por processo)',options:['','1','0'],calc:'',phrasePage:page.page};
    // Continuar reconhecendo respostas únicas gravadas nas versões anteriores.
    data.fields[packagingPopKey]??={name:packagingPopKey,type:'/Ch',flags:0,label:'4.6.12 — Resposta geral anterior do POP',options:['','1','0'],calc:'',phrasePage:page.page};
   }
   if(row.code==='4.3.6'){
    data.fields[popAvailabilityKey]={name:popAvailabilityKey,type:'/Ch',flags:0,label:'4.3.6 F1 — Disponibilidade e atualização do POP (informação geral)',options:['','1','0'],calc:'',phrasePage:page.page};
    const name=popAvailabilityLegacyKey(scope);data.fields[name]={name,type:'/Ch',flags:0,label:'4.3.6 F1 — Resposta anterior por reservatório (legado)',options:['','1','0','2'],calc:'',phrasePage:page.page};
    const note='BPF_Obs_'+scope.name+'_2';data.fields[note]={name:note,type:'/Tx',flags:4096,label:'4.3.6 F1 — Registro anterior do POP',options:[],calc:'',phrasePage:page.page};
    for(const answer of ['1','0']){const n=bpfGroupNoteName(page,row,{id:0,storageId:1},answer);data.fields[n]={name:n,type:'/Tx',flags:4096,label:'4.3.6 F1 — Registro anterior do POP',options:[],calc:'',phrasePage:page.page};}
   }
   if(['4.6.4','4.6.5','4.6.6','4.6.7','4.6.10','4.7.2','4.7.4','4.7.5','4.7.6','4.7.8'].includes(row.code)||row.code==='4.6.3'&&scope.phrases[0]?.allowNA){for(const id of ['4.6.6','4.7.5'].includes(row.code)?[0,1]:['4.6.10','4.7.2'].includes(row.code)?[1]:[0]){const name=sharedLineKey(page,row,{id});data.fields[name]={name,type:'/Tx',flags:0,label:row.code+' F'+(id+1)+' — Outras informações gerais',options:[],calc:'',phrasePage:page.page};}}
   if(row.code==='4.3.3'){const name=reservoirFilterKey(scope);data.fields[name]={name,type:'/Tx',flags:0,label:'4.3.3 F2 — Outras observações dos filtros',options:[],calc:'',phrasePage:page.page};}
   for(const [position,check] of Object.entries(receptionChecks[row.code]||{})){
    const index=Number(position);
    if(!scope.phrases[index])continue;
    const fields=['Resposta'];
    if(row.code==='4.5.3'&&index===1)fields.push(...sanitizerReceptionQuestions.map(q=>q[0]));
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
  if(panel.compactWater){
   if(Object.prototype.hasOwnProperty.call(state,compactAnswerId))return hasAnswer(state[compactAnswerId]?.answer)?state[compactAnswerId].answer:'';
   return panel.original?result(panel.original,state):'';
  }
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

 const sharedLineInfo=(row,panel)=>compactWater(row,panel.id)||(row.code==='4.7.2'&&panel.id===1)||(row.code==='4.7.4'&&panel.id===0)||(row.code==='4.7.5'&&[0,1].includes(panel.id))||(row.code==='4.6.10'&&panel.id===1)||(row.code==='4.6.7'&&panel.id===0)||(row.code==='4.6.3'&&panel.id===0&&row.scopes.some(scope=>scope.phrases[0]?.allowNA))||(row.code==='4.6.6'&&[0,1].includes(panel.id))||(panel.id===0&&['4.6.4','4.6.5','4.7.6','4.7.8'].includes(row.code));
 // As informações continuam associadas aos seus F de origem, sem remapear índices.
 const sharedLineKey=(page,row,panel)=>'BPF_LineInfo_'+page.page+'_'+row.code.replace(/\./g,'_')+'_F'+(panel.id+1);
 function sharedLineState(page,row,panel,data){
  if(panel.id===1&&fillingF2Indices[row.code])panel={...panel,entries:panel.entries.filter(entry=>entry.index===1)};
  const name=sharedLineKey(page,row,panel),raw=data[name];
  const addGate=state=>{if(row.code==='4.6.3')state.bpfAnyRinseYes=panel.entries.some(entry=>data[entry.name]==='1');return state;};
  if(raw){try{
   const state=addGate(JSON.parse(raw)||{}),conflicts=[];
   if(compactWater(row,panel.id))for(const c of get(row,panel.id).checks.filter(c=>isInformation(get(row,panel.id),c))){
    if(answered(c,state))continue;
    const recorded=panel.entries.map(e=>read(e,data)).filter(v=>v&&answered(c,v)).map(v=>JSON.stringify(v[c.id]));
    if(new Set(recorded).size>1)conflicts.push(c.id);
   }
   return {state,conflicts};
  }catch(_){}}
  const config=get(row,panel.id),state={},conflicts=[];
  for(const c of config.checks.filter(c=>isInformation(config,c))){
   const recorded=panel.entries.map(e=>read(e,data)).filter(v=>v&&(row.code==='4.6.3'?hasAnswer(v[c.id]?.answer):answered(c,v))).map(v=>v[c.id]);
   const distinct=[...new Set(recorded.map(item=>JSON.stringify(item)))];
   if(distinct.length===1)state[c.id]=JSON.parse(distinct[0]);else if(distinct.length>1)conflicts.push(c.id);
  }
  return {state:addGate(state),conflicts};
 }
 function records(row,entry,data,override){
  const config=get(row,entry.index);
  let state=override??read(entry,data);
  if(!override&&config?.compactWater&&!config.compositeReservoir&&hasAnswer(data[entry.name])&&!state?.[compactAnswerId])state={...state,[compactAnswerId]:{answer:data[entry.name]}};
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
    case 'inspection-frequency': details=text(item.frequency)&&'Frequência: '+text(item.frequency);break;
    case 'recirculation': details=text(item.procedure);break;
    case 'measure': details=text(item.description);break;
   }
   return {id:c.id,answer:item.answer,details};
  });
 }

 function report(page,row,panel,data){
  if(row.code==='4.3.3'&&compactWater(row,panel.id))return compactReservoirReport(page,row,panel,data);
  const reservoir=row.code==='4.3.3';
  const config=reservoir?{informationHeading:panel.id===1?'Outras observações':'Outras informações',checks:panel.entries.filter(entry=>entry.scope===panel.entries[0]?.scope)
   .map(entry=>({id:entry.index,label:bpfUnifiedOption(row,entry)}))}:get(row,panel.id);
  if(!config)return [];
  const entries=config.inline?machineEntries(panel):panel.id===1&&fillingF2Indices[row.code]?panel.entries.filter(entry=>entry.index===1):panel.entries;
  const units=entries.map(entry=>({
   entry,label:bpfScopeLabel(page,entry.scope),checks:reservoir?
    (['1','0'].includes(data[entry.name])?[{id:entry.index,answer:data[entry.name],details:''}]:[]):
    records(row,entry,data)
  }));
  const mixing=row.code==='4.3.2'&&panel.id===0&&typeof bpfReservoirMixReport==='function'?bpfReservoirMixReport(page,data):[];
  const supplemental=row.code==='4.3.3'&&panel.id===1?reservoirFilterReport(page,panel,data):row.code==='4.3.4'&&panel.id===0&&!compactWater(row,panel.id)?reservoirFrequencyAnnex(page,row,panel,data).flatMap(item=>item.checklist.map(v=>visualFrequency.label+': '+v)):[];
  const capRoutes=row.code==='4.6.8'&&panel.id===0?[...new Set(entries.map(entry=>capsTransportRoute(entry.scope,data)).filter(Boolean))].map(route=>route==='silo'?'Tampas transportadas com auxílio de silo externo':'Tampas transportadas para a tampadora sem auxílio de silo externo'):[];
  const joint=sharedLineInfo(row,panel)&&entries.length?sharedLineState(page,row,panel,data):null;
  const jointRecords=joint?records(row,entries[0],data,joint.state):[];
  if(!units.some(unit=>unit.checks.length)&&!mixing.length&&!supplemental.length&&!jointRecords.length&&!capRoutes.length)return [];
  const responses=config.inline?[]:reservoir?['1','0']:['1','0','2'];
  const information=[...mixing,...supplemental,...capRoutes];
  if(row.code==='4.3.4'&&panel.id===0&&joint?.state?.['inspecao-visual']?.frequency&&!hasAnswer(joint.state['inspecao-visual'].answer))information.push(visualFrequency.label+': '+joint.state['inspecao-visual'].frequency);
  for(const criterion of config.checks.filter(check=>isInformation(config,check))){
   for(const answer of ['1','0']){
    const shared=joint&&!joint.conflicts.includes(criterion.id);
    if(shared){
     const match=jointRecords.find(check=>check.id===criterion.id&&check.answer===answer);
     if(match){const caption=criterion.informationList?(criterion.reportLabel||criterion.label):isQuestion(criterion)?statementForAnswer(criterion,answer):criterion.label;information.push((criterion.section?criterion.section+' · ':'')+caption+(match.details?' — '+match.details:''));}
     continue;
    }
    const recorded=units.flatMap(unit=>unit.checks.filter(check=>check.id===criterion.id&&check.answer===answer)
     .map(check=>unit.label+(check.details?' — '+check.details:'')));
    if(recorded.length){
     const caption=criterion.informationList?(criterion.reportLabel||'Produtos químicos utilizados para limpeza das embalagens'):isQuestion(criterion)?statementForAnswer(criterion,answer):criterion.label;
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

 function validateMandatory(page,row,panels,content){
  if(row.code==='4.6.7'){const panel=panels.find(p=>p.id===0);if(!panel||!panel.entries.length||panel.entries.every(e=>values[e.name]==='2'||read(e,values)?.notApplicable))return true;const state=sharedLineState(page,row,panel,values).state;if(!hasAnswer(state['enxague-ozonizado']?.answer)){const control=content.querySelector('[data-bpf-required-info="enxague-ozonizado"]');alert('ATENÇÃO — Resposta obrigatória: informe se o enxágue é realizado com água mineral natural ozonizada.');control?.scrollIntoView({block:'center'});control?.focus();return false;}return true;}
  if(row.code==='4.6.3'){const panel=panels.find(p=>p.id===0);if(panel&&sharedLineInfo(row,panel)&&!hasAnswer(sharedLineState(page,row,panel,values).state['embalagens-sopradas']?.answer)){const control=content.querySelector('[data-bpf-required-info="embalagens-sopradas"]');alert('ATENÇÃO — Resposta obrigatória: informe se as embalagens são sopradas no estabelecimento.');control?.scrollIntoView({block:'center'});control?.focus();return false;}return true;}
  if(row.code!=='4.6.8')return true;
  const panel=panels.find(p=>p.id===0);if(!panel)return true;
  for(const entry of panel.entries){
   const state=read(entry,values);
   const missingDisinfection=!hasAnswer(state?.['desinfeccao-envasadora']?.answer);
   const missingRoute=!['direto','silo'].includes(state?.route);
   if(!missingDisinfection&&!missingRoute)continue;
   const control=content.querySelector(missingDisinfection?'[data-bpf-required-info="desinfeccao-envasadora"]':'[data-bpf-required-info="transporte-tampas"]');
   const unit=control?.closest('details');if(unit)unit.open=true;
   alert(missingDisinfection?'ATENÇÃO — Resposta obrigatória: informe se a desinfecção das tampas é realizada no estabelecimento. Selecione Sim ou Não antes de sair do item 4.6.8.':'ATENÇÃO — Resposta obrigatória: informe como as tampas são transportadas para a tampadora (com ou sem silo externo) antes de sair do item 4.6.8.');
   control?.scrollIntoView({block:'center'});control?.focus();return false;
  }
  return true;
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
    field(criterion.id==='inspecao-visual'?visualFrequency.label:criterion.label,custom?'Outros':saved,value=>{
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
   case 'measure': field(criterion.detailLabel||'Descreva a medida de controle',item.description,value=>{item.description=value;save();},null,4);break;
  }
 }



 function showFillPointerTip(event,summary){
  let tip=document.getElementById('bpf-fill-pointer-tip');
  if(!tip){
   tip=document.createElement('div');tip.id='bpf-fill-pointer-tip';tip.textContent='Clique para preencher';
   tip.setAttribute('aria-hidden','true');
   tip.style.cssText='position:fixed;z-index:2147483647;pointer-events:none;white-space:nowrap;padding:6px 10px;border-radius:5px;background:#ffcf59;color:#302000;font:700 13px Arial,sans-serif;border:1px solid #ad740d;box-shadow:0 2px 7px #0003';
   document.body.append(tip);
  }
  tip.bpfOwner=summary;tip.hidden=false;
  const left=Math.max(4,Math.min(event.clientX+15,window.innerWidth-tip.offsetWidth-4));
  const top=event.clientY+19+tip.offsetHeight>window.innerHeight?event.clientY-tip.offsetHeight-10:event.clientY+19;
  tip.style.left=left+'px';tip.style.top=Math.max(4,top)+'px';
 }
 function hideFillPointerTip(summary){
  const tip=document.getElementById('bpf-fill-pointer-tip');
  if(tip&&tip.bpfOwner===summary){tip.hidden=true;tip.bpfOwner=null;}
 }
 function enableHoverUnit(section){
  const summary=section.querySelector('summary');
  if(!summary)return;
  let openTimer,closeTimer,preview=false,pinned=section.open,answered=false;
  const mouse=e=>e.pointerType==='mouse'&&window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  section.bpfKeepAnsweredOpen=(legacyAnswer=false)=>{
   if(section.hidden)return;
   const checked=[...section.querySelectorAll('input[type="checkbox"]:checked,input[type="radio"]:checked')].some(input=>!input.disabled&&!input.closest('[hidden]'));
   const filled=[...section.querySelectorAll('textarea,select,input[type="text"],input[type="number"]')].some(input=>!input.disabled&&!input.closest('[hidden]')&&String(input.value||'').trim());
   answered=Boolean(checked||filled||legacyAnswer);
   if(!answered)return;
   clearTimeout(openTimer);clearTimeout(closeTimer);preview=false;pinned=true;section.open=true;hideFillPointerTip(summary);
  };

  summary.style.cursor='pointer';
  summary.removeAttribute('title');
  summary.addEventListener('pointermove',event=>{if(mouse(event)&&!pinned)showFillPointerTip(event,summary);else hideFillPointerTip(summary);});
  summary.addEventListener('pointerleave',()=>hideFillPointerTip(summary));
  summary.addEventListener('pointerenter',event=>{
   if(!mouse(event))return;
   if(!pinned)showFillPointerTip(event,summary);
   clearTimeout(closeTimer);clearTimeout(openTimer);
   if(section.open)return;
   openTimer=setTimeout(()=>{if(!section.isConnected||section.hidden||section.open)return;preview=true;section.open=true;},180);
  });
  section.addEventListener('pointerenter',event=>{if(mouse(event))clearTimeout(closeTimer);});
  section.addEventListener('pointerleave',event=>{
   if(!mouse(event))return;
   clearTimeout(openTimer);clearTimeout(closeTimer);
   closeTimer=setTimeout(()=>{if(preview&&!pinned){preview=false;section.open=false;}},260);
  });
  summary.addEventListener('click',event=>{
   hideFillPointerTip(summary);
   clearTimeout(openTimer);clearTimeout(closeTimer);
   if(answered&&section.open){event.preventDefault();return;}
   if(preview&&section.open&&!pinned){event.preventDefault();preview=false;pinned=true;return;}
   pinned=!section.open;preview=false;
  });
  section.addEventListener('pointerdown',event=>{
   if(event.target.closest('summary')===summary)return;
   if(section.open){pinned=true;preview=false;clearTimeout(closeTimer);}
  });
  section.addEventListener('focusin',event=>{
   if(event.target===summary)return;
   if(section.open){pinned=true;preview=false;clearTimeout(closeTimer);}
  });
 }
 function render(card,page,row,panel){
  if(row.code==='4.3.3'&&compactWater(row,panel.id))return renderCompactReservoir(card,page,row,panel);
  // A antiga frase F2 do 4.6.12 deve surgir mesmo sem verificações
  // complementares configuradas para o F1.
  if(row.code==='4.6.12'&&panel.id===0)renderPackagingPopInfo(card,page,row,panel);
  const config=get(row,panel.id);
  if(!config||config.inline&&!panel.machineDetails)return false;
  if(panel.id===1&&fillingF2Indices[row.code])panel={...panel,entries:panel.entries.filter(entry=>entry.index===1)};
  if(row.code==='4.6.8'&&panel.id===1){
   card.dataset.bpfCapsF2='';
   card.hidden=!panel.entries.some(entry=>panelEnabled(row,entry,values));
  }
  if(['4.7.4','4.7.5'].includes(row.code)&&panel.id===1){
   const original=String(row.description||'').replace(/\s+/g,' ').trim();
   const start=original.indexOf(row.code==='4.7.4'?'A sala de envase deve possuir':'A antesala da sala de envase deve possuir');
   const phrase=start>=0?original.slice(start):original;
   if(phrase){const previous=card.querySelector('.bpf-group-description');if(previous)previous.textContent=phrase;else{const p=element('p',phrase);p.className='bpf-group-description';card.append(p);}}
  }
  const dependentF2=conductionF2(row,panel.id);
  if(dependentF2)card.dataset.bpfConductionF2='';
  if(page.page===7&&['4.6.5','4.6.6'].includes(row.code)){const phrase=row.phrases[panel.id]?.text;if(phrase&&![...card.querySelectorAll('p')].some(p=>p.textContent.trim()===phrase.trim()))card.append(element('p',phrase));}
  const hasOtherInfo=config.checks.some(criterion=>isInformation(config,criterion));
  const baseHint=config.inline?'Registre as informações da envasadora por linha.':hasOtherInfo?'Marque Sim ou Não conforme a avaliação de cada unidade.':config.sectioned?'Em cada unidade avaliada, responda às verificações aplicáveis.':config.all?'Responda às verificações com opções Sim e Não da unidade avaliada.':'Marque as opções aplicáveis à unidade avaliada.';
  const hint=element('p',baseHint+(hasOtherInfo?' Somente os campos de “'+informationHeading(config)+'” podem ficar em branco quando não aplicáveis.':''));
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
  const capsF1=row.code==='4.6.8'&&[0,1].includes(panel.id);
  const sections=config.inline?[]:[['1','Sim'],['0','Não']];
  if(config.checks.some(criterion=>isInformation(config,criterion)))sections.push(['info',informationHeading(config)]);
  for(const [answer,heading] of sections){
   if(capsF1&&answer==='0'){boxes.set('0',boxes.get('1'));continue;}
   const box=element('fieldset');
   box.className='bpf-answer-box';
   if(answer==='info')box.dataset.bpfInfoBox='';
   const prompt=config.answerPrompts?.[answer];
   box.append(element('legend',(config.inline?'':panel.label+' — ')+(capsF1&&answer==='1'?'Higienização de tampas':heading)+(prompt?' ('+prompt+')':'')));
   answerGrid.append(box);
   boxes.set(answer,box);
   if(answer==='info'&&row.code==='4.3.2'&&panel.id===0&&typeof bpfReservoirMixPage==='function'&&page.page===bpfReservoirMixPage()){
    const section=element('div');section.style.cssText='padding:12px;background:#e8f3fa;border:1px solid #83a8bf;border-radius:6px;margin:8px 0';
    section.append(element('strong','Mistura das fontes — avaliação geral'));
    const question=(caption,key,yes,no)=>{const label=element('label');const wording=element('span',caption);label.append(wording);label.style.cssText='display:block;margin:10px 0';const select=element('select');select.style.cssText='display:block;padding:6px;margin:5px 0;font:inherit';for(const [v,t] of [['','Selecione'],['1','Sim'],['0','Não']])select.add(new Option(t,v));select.value=values[key]||'';label.append(select);section.append(label);return {label,select,update:()=>{wording.textContent=select.value==='1'?yes:select.value==='0'?no:caption;}};};
    const first=question('É realizada a mistura das águas de diferentes fontes?','BPF_ReservoirMix_Resposta','É realizada a mistura das águas de diferentes fontes','Não é realizada a mistura das águas de diferentes fontes');
    const second=question('A mistura das fontes está autorizada pela ANM?','BPF_ReservoirMix_ANM','A mistura das fontes está autorizada pela ANM','A mistura das fontes não está autorizada pela ANM');
    const refresh=()=>{first.update();second.update();const visible=first.select.value==='1';second.label.hidden=!visible;second.label.style.display=visible?'block':'none';second.select.disabled=!visible;};refresh();
    first.select.onchange=()=>{values.BPF_ReservoirMix_Resposta=first.select.value;if(first.select.value!=='1'){values.BPF_ReservoirMix_ANM='';second.select.value='';}refresh();changed();};
    second.select.onchange=()=>{values.BPF_ReservoirMix_ANM=second.select.value;refresh();changed();};
    box.append(section);
   }
  }
  const joint=sharedLineInfo(row,panel)?sharedLineState(page,row,panel,values):null;
  const naBox=config.allowNA?element('div'):null;if(naBox){naBox.style.cssText='display:flex;flex-direction:column;gap:2px;margin:2px 0;padding:0';answerGrid.prepend(naBox);}
  for(const entry of panel.entries){
   const previous=read(entry,values);
   const existingAnswer=values[entry.name];
   const state=previous||(config.simple&&['1','0'].includes(existingAnswer)
    ? {[config.checks[0].id]:{answer:existingAnswer}} : null)||(row.code==='4.2.2'&&panel.id===1?{integrityPositive:true}:{});
   if(config.compactWater&&hasAnswer(existingAnswer)&&!state[compactAnswerId])state[compactAnswerId]={answer:existingAnswer};
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
    if(row.code==='4.6.3'&&joint)card.dispatchEvent(new Event('bpf-rinse-yes-refresh'));
    if(config.inline||(row.code==='4.2.9'&&panel.id===0))apply(row,entry.scope,values);
    if(row.code==='4.2.9'&&panel.id===0){
     card.parentElement?.querySelector('[data-bpf-conduction-f2]')?.dispatchEvent(new Event('bpf-f2-refresh'));
    }
    if(row.code==='4.6.8'&&panel.id===0){
     const followup=card.parentElement?.querySelector('[data-bpf-caps-f2]');
     if(followup){followup.hidden=!row.scopes.some(scope=>capsDisinfected(scope,values));followup.dispatchEvent(new Event('bpf-caps-f2-refresh'));}
    }
    changed();
    recalc();
   };
   const refresh=()=>{
    if(row.code==='4.6.3'&&joint)joint.state.bpfAnyRinseYes=panel.entries.some(e=>values[e.name]==='1');
    if(row.code==='4.6.8'&&panel.id===1)state.route=capsTransportRoute(entry.scope,values);
    for(const control of rows)control();
   };
   if(row.code==='4.6.8'&&panel.id===1)card.addEventListener('bpf-caps-f2-refresh',refresh);
   if(row.code==='4.6.3'&&joint)card.addEventListener('bpf-rinse-yes-refresh',refresh);
   if(dependentF2){
    const notice=element('p',label+' — Não se aplica (ausência do POP indicada no F1).');
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
    control.style.cssText='display:flex;align-items:center;gap:6px;margin:2px 0;padding:0';naBox.append(control);
   }
   const entryState=state,entrySave=save;
   for(const [sectionType,box] of boxes){
    const information=sectionType==='info';
    const general=information&&Boolean(joint);
    if(general&&entry!==panel.entries[0])continue;
    const state=general?joint.state:entryState;
    const save=general?()=>{values[sharedLineKey(page,row,panel)]=JSON.stringify(state);refresh();changed();recalc();if(row.code==='4.2.9'&&panel.id===0)card.parentElement?.querySelector('[data-bpf-conduction-f2]')?.dispatchEvent(new Event('bpf-f2-refresh'));}:entrySave;
    const answer=information?'1':sectionType;
    const heading=information?informationHeading(config):answer==='1'?'Sim':'Não';
    const directChoice=(config.simple&&!information)||(config.separateInformation&&!information)||(config.singleNo&&answer==='0');
    const collapsed=!directChoice&&!general;
    const section=element(collapsed?'details':'div');
    section.className='bpf-water-unit'+(directChoice?' bpf-water-unit-direct':'');
    section.dataset.waterEntry=entry.name;
    if(information&&collapsed){section.dataset.bpfInfoReview='';section.addEventListener('toggle',()=>{if(section.open)section.dataset.bpfInfoVisited='1';});}
    if(collapsed){section.append(element('summary',label));enableHoverUnit(section);}
    const legacyLine=element('p',legacy?'Avaliação geral registrada: '+legacy+'.':'');
    legacyLine.hidden=!legacy||general;
    legacyLines.push(legacyLine);
    section.append(legacyLine);
    if(general&&joint.conflicts.length)section.append(element('p','Há informações anteriores diferentes entre '+(config.compactWater?'unidades':'linhas')+'. Revise as respostas do quadro geral. Os registros anteriores permanecem no arquivo.'));
    box.append(section);
    if(dependentF2)rows.push(()=>{section.hidden=general? !panel.entries.some(e=>panelEnabled(row,e,values)):!panelEnabled(row,entry,values);});
    const groups=new Map();let routeInput=null;
    for(const criterion of config.checks){
     if(information!==Boolean(isInformation(config,criterion)))continue;
     if((criterion.yesOnly&&answer==='0')||(criterion.noOnly&&answer==='1'))continue;
     if(information&&row.code==='4.6.8'&&panel.id===0&&criterion.route&&!routeInput){
      const choice=element('label','Como as tampas são transportadas para a tampadora?');choice.style.cssText='display:block;margin:12px 0;font-weight:bold';
      routeInput=element('select');routeInput.style.cssText='display:block;margin:6px 0;padding:6px;font:inherit;width:100%';
      for(const [v,t] of [['','Selecione'],['direto','Sem auxílio de silo externo'],['silo','Com silo externo']])routeInput.add(new Option(t,v));
      routeInput.dataset.bpfRequiredInfo='transporte-tampas';routeInput.setAttribute('aria-required','true');
      const routeAlert=element('p','ATENÇÃO — resposta obrigatória. Selecione com ou sem silo externo.');routeAlert.style.cssText='margin:6px 0;padding:8px;background:#fff2cb;border-left:4px solid #c47b13;color:#462f00;font-weight:bold';
      const updateRouteAlert=()=>{routeAlert.hidden=['direto','silo'].includes(state.route);routeAlert.style.display=routeAlert.hidden?'none':'block';};
      routeInput.value=state.route||'';routeInput.onchange=()=>{state.route=routeInput.value;updateRouteAlert();save();};choice.append(routeInput,routeAlert);section.append(choice);updateRouteAlert();
     }
     const item=state[criterion.id]??={};
     const line=element('div');
     line.className='bpf-water-row';
     if(criterion.section&&!groups.has(criterion.section)){
      const group=element('fieldset');
      group.append(element('legend',criterion.section));
      groups.set(criterion.section,group);
      section.append(group);
      if(['4.6.3','4.6.8'].includes(row.code))rows.push(()=>{group.hidden=!config.checks.some(c=>c.section===criterion.section&&Boolean(isInformation(config,c))===information&&active(c,state));});
     }
     (groups.get(criterion.section)||section).append(line);
     if((criterion.details==='sanitizers'&&!criterion.explicitAnswer||criterion.informationList)&&answer==='1'){
      const title=element('strong',criterion.label);
      title.className='bpf-water-caption';
      line.append(title);
      fields(line,criterion,item,save,rows);
      continue;
     }
     const caption=capsF1&&!information&&criterion.scopeAnswer?heading:directChoice?label:criterion.scopeAnswer?heading+' — '+label:answerLabel(criterion,answer);
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
     input.type=capsF1&&!information&&criterion.scopeAnswer?'radio':'checkbox';
     if(config.compactWater&&!information)input.dataset.bpfCompactAnswer=answer;
     if(input.type==='radio'){input.name='BPF_CapsResposta_'+panel.id+'_'+entry.name;input.value=answer;}
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
      const prompt=element('div',caption);
      const select=element('select');select.style.cssText='display:block;margin:6px 0;padding:5px;font:inherit';
      for(const [v,t] of [['','Selecione'],['1',criterion.answerLabels?.['1']||'Sim'],['0',criterion.answerLabels?.['0']||'Não']])select.add(new Option(t,v));
      select.onchange=()=>{item.answer=select.value;if(criterion.id==='filtro'&&state['registro-filtro'])delete state['registro-filtro'].answer;save();};
      line.append(prompt,select);
      const requiredAlert=criterion.requiredInfo?element('p','ATENÇÃO — resposta obrigatória. Selecione Sim ou Não.'):null;
      if(requiredAlert){requiredAlert.style.cssText='margin:6px 0;padding:8px;background:#fff2cb;border-left:4px solid #c47b13;color:#462f00;font-weight:bold';line.append(requiredAlert);select.dataset.bpfRequiredInfo=criterion.id;select.setAttribute('aria-required','true');}
      rows.push(()=>{
       const wording=!criterion.answerLabels&&hasAnswer(item.answer)?statementForAnswer(criterion,item.answer):caption;
       prompt.textContent=wording;
       prompt.title=(item.answer==='1'?criterion.yesGuidance:item.answer==='0'?criterion.noGuidance:'')||criterion.guidance||'';
       select.setAttribute('aria-label',label+' — '+wording);
       select.disabled=state.notApplicable||!active(criterion,state);
       select.value=hasAnswer(item.answer)?item.answer:'';
       if(requiredAlert){requiredAlert.hidden=hasAnswer(item.answer);requiredAlert.style.display=requiredAlert.hidden?'none':'block';}
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
      extra.hidden=!enabled||(!information||criterion.details!=='inspection-frequency')&&item.answer!==answer||!showDetails;
     });
    }
    if(collapsed)rows.push(()=>section.bpfKeepAnsweredOpen(!information&&!legacyLine.hidden&&Boolean(legacy)&&existingAnswer===sectionType));
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
   bpfInstallIndividualNC(area,card,page,row,panel,()=>answer,()=>panel.entries.filter(e=>values[e.name]===answer).map(e=>({id:e.name,label:bpfScopeLabel(page,e.scope)})));
   grid.append(box);
  }
  card.append(grid);
  if(row.code==='4.3.4'&&panel.id===0&&!config.compactWater)renderReservoirFrequency(card,page,row,panel);
  return true;
 }
 function renderMachine(card,page,row,panel){
  if(row.code!=='4.7.8'||panel.id!==0)return;
  const section=element('div');
  render(section,page,row,{...panel,label:'Envasadora Automática',entries:machineEntries(panel),machineDetails:true});
  card.append(section);
 }
 return {get,registerReview,renderMachine,renderReception,receptionSummary,receptionAnnex,preparePhrases,ensure469FOrder,ensure458FOrder,renderReservoirFrequency,renderReservoirFilterInfo,renderReservoirPopInfo,reservoirPopReport,renderPackagingPopInfo,packagingPopReport,reservoirFrequencyAnnex,capsExamples,init,apply,report,summary,validate,validateMandatory,render,enableHoverUnit};
})();


