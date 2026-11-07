from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CSS='''<style id="bpf-f-core-20261107">
@media screen{
.page>.bpf-item-code{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:42% 58%!important;gap:0!important;padding:0!important;z-index:50!important;isolation:isolate;visibility:visible!important;opacity:1!important;overflow:hidden!important}
.bpf-item-code>span{display:flex!important;align-items:center;justify-content:center;min-height:0;line-height:1;white-space:nowrap}
.page>.bpf-item-code>.bpf-f{position:relative!important;z-index:51!important;display:flex!important;align-items:center;justify-content:center;visibility:visible!important;opacity:1!important;box-sizing:border-box;width:100%!important;max-width:100%!important;height:100%!important;min-height:0!important;min-width:0!important;padding:0!important;line-height:1!important;align-self:stretch;background:#087aaa!important;color:#fff!important;border:1px solid #07577b!important;border-radius:2px!important}
.bpf-note-help{background:#edf5fa;border:1px solid #aac4d4;border-radius:6px;padding:9px;margin:8px 0;font:14px/1.4 Arial,sans-serif;color:#243f50;white-space:pre-wrap}
.bpf-note-tools{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:6px 0}.bpf-note-tools button{font:14px Arial;padding:7px 12px}.bpf-note-tools span{font:13px Arial;color:#405867}
}
</style>'''
HELP=r'''
// Instructions shown with each phrase observation; revisions travel in the guide JSON.
const BPF_NOTE_INSTRUCTION={text:'Orientações de preenchimento das observações das frases',guidance:'Registre as evidências verificadas para a frase ou as opções assinaladas: documentos e registros examinados, identificação, data, local, equipamento, lote ou amostra, quando pertinentes. Para Sim (OBS), descreva o que comprova o atendimento. Para Não (NC), descreva objetivamente a condição encontrada e o requisito não atendido, com a evidência correspondente. Para Não se aplica, quando permitido, justifique a não aplicabilidade. Em grupos, identifique a opção a que cada registro se refere. Utilize a orientação ao inspetor da respectiva frase para selecionar as verificações e evidências.'};
const bpfNoteInstructionEntry={key:'instructions:phrase-observations',page:0,code:'Observações',index:0,label:'Orientações gerais',scopes:[],appcc:'Preenchimento',original:{...BPF_NOTE_INSTRUCTION},refs:[BPF_NOTE_INSTRUCTION]};
BPF_INSPECTOR_ENTRIES.unshift(bpfNoteInstructionEntry);BPF_INSPECTOR_BY_KEY.set(bpfNoteInstructionEntry.key,bpfNoteInstructionEntry);
function bpfAttachNoteTools(area,parent,entries){
 const help=document.createElement('details');help.className='bpf-note-help';
 const summary=document.createElement('summary');summary.textContent='Como preencher esta observação';help.append(summary);
 const general=document.createElement('p');general.textContent=BPF_NOTE_INSTRUCTION.guidance;help.append(general);
 for(const text of [...new Set((entries||[]).map(e=>e.phrase.guidance).filter(Boolean))]){const p=document.createElement('p');p.textContent='Orientação ao inspetor: '+text;help.append(p);}
 parent.append(help);
 const tools=document.createElement('div');tools.className='bpf-note-tools';
 const paste=document.createElement('button');paste.type='button';paste.textContent='Colar';paste.setAttribute('aria-label','Colar no campo de observação');
 const status=document.createElement('span');status.setAttribute('role','status');
 paste.onclick=async()=>{
  if(area.disabled){status.textContent='Selecione Sim ou Não antes de colar.';return;}
  try{const text=await navigator.clipboard.readText();const start=area.selectionStart??area.value.length,end=area.selectionEnd??start;
   area.setRangeText(text,start,end,'end');area.dispatchEvent(new Event('input',{bubbles:true}));area.focus();status.textContent='Texto colado.';
  }catch(error){area.focus();status.textContent='Toque e mantenha pressionado o campo e escolha Colar, ou use Ctrl+V.';}
 };
 tools.append(paste,status);parent.append(tools);
}
'''
for name in ['individual.html','equipe.html']:
 p=ROOT/name;s=p.read_text()
 if 'bpf-f-core-20261107' not in s:s=s.replace('</head>',CSS+'</head>',1)
 if 'instructions:phrase-observations' not in s:
  marker='let bpfInspectorLastApplied=null,bpfInspectorLocalChecked=false;';assert marker in s;s=s.replace(marker,HELP+'\n'+marker,1)
  marker='noteLabel.append(area);card.append(noteLabel);';assert marker in s;s=s.replace(marker,marker+'bpfAttachNoteTools(area,card,panel.entries);',1)
  marker='label.append(area);box.append(label);';assert marker in s;s=s.replace(marker,marker+'bpfAttachNoteTools(area,box,panel.entries);',1)
  s=s.replace("const head=document.createElement('h3');head.textContent=(titles[entry.page]", "const head=document.createElement('h3');head.textContent=entry===bpfNoteInstructionEntry?entry.original.text:(titles[entry.page]",1)
  s=s.replace("for(const [field,titleText]of [['text','Texto da frase F'],['guidance','Orientação ao inspetor']])", "for(const [field,titleText]of (entry===bpfNoteInstructionEntry?[['guidance','Orientação de preenchimento']]:[['text','Texto da frase F'],['guidance','Orientação ao inspetor']]))",1)
  s=s.replace("restore.textContent='Restaurar original deste F';","restore.textContent=entry.key===bpfNoteInstructionEntry.key?'Restaurar orientação original':'Restaurar original deste F';")
 if 'bpf-review-open-button' not in s:
  marker='function bpfInspectorInstallMenu(){'
  assert marker in s
  s=s.replace(marker,marker+"""
 const button=document.createElement('button');button.type='button';button.id='bpf-review-open-button';button.textContent='Revisar frases dos inspetores';button.onclick=bpfInspectorOpenReview;
 document.querySelector('#print').after(button);
""",1)
 s=s.replace('20261107-obs-f4','20261107-obs-f5')
 # direct loading makes F sizing independent from a previously installed service worker
 if 'src="./interface-guia-amigavel.js' not in s:s=s.replace('</body>','<script src="./interface-guia-amigavel.js?v=20261107-obs-f5" defer></script></body>',1)
 p.write_text(s)
p=ROOT/'sw-guia18.js';s=p.read_text().replace('20261106-f3','20261107-obs-f4');p.write_text(s.replace('20261107-obs-f4','20261107-obs-f5'))
p=ROOT/'index.html';s=p.read_text().replace('20261106-f3','20261107-obs-f5').replace('20261107-obs-f4','20261107-obs-f5')
s=s.replace('href="./individual.html?v=20261107-obs-f5"', 'href="./individual.html?v=20261107-obs-f5#revisar-inspetores"')
p.write_text(s)
print('Updated both guides: core F layout, editable observation guidance and paste controls.')

# A orientação específica da frase já aparece antes dos campos. Preserve
# somente a instrução geral no auxílio de preenchimento da observação.
PASTE=r""" paste.onclick=async()=>{
  const fallback=message=>{
   status.textContent=message+' Toque e segure no campo e escolha Colar.';
   if(area.isConnected&&!area.disabled)area.focus();
  };
  status.textContent='';
  if(area.disabled){status.textContent='Selecione Sim ou Não antes de colar.';return;}
  const note=area.dataset.note;
  let text;
  try{text=await navigator.clipboard.readText();}
  catch(error){fallback('Colagem automática indisponível.');return;}
  if(!area.isConnected||area.disabled||area.dataset.note!==note)return;
  if(typeof text!=='string'||!text.trim()){fallback('O Chrome não disponibilizou o texto copiado.');return;}
  const start=area.selectionStart??area.value.length,end=area.selectionEnd??start;
  const inserted=text.replace(/\r\n?/g,'\n');
  const expected=area.value.slice(0,start)+inserted+area.value.slice(end);
  area.value=expected;
  area.setSelectionRange(start+inserted.length,start+inserted.length);
  area.dispatchEvent(new Event('input',{bubbles:true}));
  if(area.value!==expected){fallback('A observação não recebeu o texto.');return;}
  area.focus();
  status.textContent='Texto colado.';
 };
"""
for name in ['individual.html','equipe.html']:
 p=ROOT/name;s=p.read_text()
 s=s.replace('function bpfAttachNoteTools(area,parent,entries){','function bpfAttachNoteTools(area,parent){')
 s=s.replace('bpfAttachNoteTools(area,card,panel.entries)','bpfAttachNoteTools(area,card)').replace('bpfAttachNoteTools(area,box,panel.entries)','bpfAttachNoteTools(area,box)')
 prefix=' for(const text of [...new Set((entries||[]).map(e=>e.phrase.guidance)'
 s=''.join(line for line in s.splitlines(keepends=True) if not line.startswith(prefix))
 if 'const BPF_FILL_EXAMPLES=' in s:continue
 start=s.index(' paste.onclick=async()=>{',s.index('function bpfAttachNoteTools'))
 end=s.index(' tools.append(paste,status);',start)
 s=s[:start]+PASTE+s[end:]
 p.write_text(s)
for name in ['individual.html','equipe.html','index.html','sw-guia18.js']:
 p=ROOT/name;p.write_text(p.read_text().replace('20261107-obs-f5','20261107-obs-f6'))

# O ditado nativo do teclado continua funcionando no próprio textarea.
import re
for name in ['individual.html','equipe.html']:
 p=ROOT/name;s=p.read_text()
 if 'const SpeechEngine=' in s:
  s,n=re.subn(r"const SpeechEngine=.*?(?=const host=document.querySelector\('#pages'\);)",'',s,flags=re.S)
  assert n==1
  mic_start=s.index("if(el.tagName==='TEXTAREA'&&!el.readOnly&&/OBSERV/i.test(f.label)&&!/ATENDIDO|RISCO/i.test(f.label)){const mic=")
  mic_end=s.index("el.style.paddingRight='36px';}",mic_start)+len("el.style.paddingRight='36px';}")
  s=s[:mic_start]+s[mic_end:]
  s=re.sub(r'(?m)^[ \t]*(?:stopSpeech|cancelSpeech)\(\);[ \t]*\n','',s)
  s=s.replace('stopSpeech();','').replace('cancelSpeech();','')
  s=re.sub(r'\.mic(?:\.listening|:disabled)?\{[^{}]*\}','',s)
  s=s.replace(',.help,.mic{display:none!important}',',.help{display:none!important}')
 assert 'Ditar neste campo' not in s and 'SpeechRecognition' not in s
 p.write_text(s)
for name in ['individual.html','equipe.html','index.html','sw-guia18.js']:
 p=ROOT/name;p.write_text(p.read_text().replace('20261107-obs-f6','20261107-obs-f7'))

# Área de toque ampla e ícone legível, sem rótulo visual repetido.
ICON_STYLE='''<style id="bpf-note-paste-icon-style">
@media screen{
#bpf-editor .bpf-note-tools{gap:10px;margin:8px 0 10px}
#bpf-editor .bpf-note-tools .bpf-note-paste{display:inline-grid;place-items:center;flex:0 0 auto;width:44px;height:44px;box-sizing:border-box;padding:0;border:1px solid #9dbfce;border-radius:10px;background:#eef7fb;color:#0e5473;cursor:pointer}
#bpf-editor .bpf-note-paste svg{display:block;width:22px;height:22px;pointer-events:none}
#bpf-editor .bpf-note-tools .bpf-note-paste:hover{background:#deeff7;border-color:#5996b0}
#bpf-editor .bpf-note-tools .bpf-note-paste:active{background:#cae5f1}
#bpf-editor .bpf-note-paste:focus-visible{outline:2px solid #0e5473;outline-offset:2px}
#bpf-editor .bpf-note-tools span{flex:1 1 180px;line-height:1.35}
#bpf-editor .bpf-note-tools span:empty{display:none}
}
</style>'''
ICON_JS="""paste.className='bpf-note-paste';paste.title='Colar texto';paste.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="8" y="2" width="8" height="5" rx="2"/><path d="M8 12h8m-8 4h5"/></svg>';"""
for name in ['individual.html','equipe.html']:
 p=ROOT/name;s=p.read_text()
 if 'bpf-note-paste-icon-style' not in s:
  assert "paste.textContent='Colar';" in s
  s=s.replace('</head>',ICON_STYLE+'</head>',1).replace("paste.textContent='Colar';",ICON_JS,1)
  s=s.replace(' parent.append(help);','',1).replace(' tools.append(paste,status);parent.append(tools);',' tools.append(paste,status);parent.append(tools,help);',1)
 p.write_text(s)
for name in ['individual.html','equipe.html','index.html','sw-guia18.js']:
 p=ROOT/name;p.write_text(p.read_text().replace('20261107-obs-f7','20261107-obs-f8'))

# Exemplos adaptados dos guias BPF preenchidos; campos variáveis são marcados
# para revisão no local. Para itens sem registro útil, modelos do requisito.
EXAMPLES = {
 '4.1.1/1': ['Na captação [identificação], a pavimentação ao redor da casa de proteção estava íntegra e a drenagem funcionava, sem empoçamento nos pontos vistoriados.', 'Na captação [identificação], observou-se [trinca na pavimentação ou falha na drenagem] em [local], com [evidência].'],
 '4.1.1/2': ['O entorno da captação [identificação] estava limpo e sem focos de insalubridade nos pontos vistoriados.', 'No entorno da captação [identificação], observou-se [sujidade ou foco de insalubridade] em [local].'],
 '4.1.2/1': ['A casa de proteção da captação [identificação] estava limpa, com a porta vedada e as aberturas protegidas.', 'Na casa de proteção da captação [identificação], não havia borracha de vedação no entorno da porta [local].'],
 '4.1.2/2': ['Foi identificada torneira para coleta de amostra no início da canalização da captação [identificação].', 'Não foi identificada torneira para coleta de amostra no início da canalização da captação [identificação].'],
 '4.1.3/1': ['A limpeza da casa é realizada [frequência], e a do poço [frequência], com [produto e concentração], conforme [POP ou registro].', 'A limpeza e a desinfecção de [instalação ou equipamento] não foram comprovadas para o período [período].'],
 '4.1.3/2': ['Foi apresentado certificado de capacitação do funcionário [função], emitido em [data], com carga horária de [horas].', 'Não foi apresentado comprovante de capacitação para quem realiza a higienização da captação [identificação].'],
 '4.1.3/3': ['Foram apresentados registros de limpeza e desinfecção da captação [identificação], com data e responsável pela execução.', 'Não foram apresentados os registros de limpeza e desinfecção da captação [identificação] referentes a [período].'],
 '4.2.2/1': ['Foi apresentada documentação de adequação ao contato com alimentos para [material e trecho da canalização], referência [documento].', 'Não foi apresentado certificado de grau alimentício da tubulação de [material] no trecho [local]. A documentação apresentada cobre apenas [componente].'],
 '4.2.2/2': ['As superfícies internas verificadas em [trecho] estavam íntegras e sem irregularidades visíveis.', 'No trecho [local], foi observada [irregularidade, corrosão ou dano] na superfície em contato com a água.'],
 '4.2.7/1': ['A higienização de [trecho] foi demonstrada conforme [procedimento], com [método e frequência].', 'A higienização de [trecho] foi realizada sem [etapa ou condição prevista], conforme [evidência].'],
 '4.2.7/2': ['Foram apresentadas planilhas com os registros das operações de higienização da canalização referentes a [período].', 'Não foram apresentados registros de higienização da canalização [identificação] no período [período].'],
 '4.2.8/1': ['O desmonte do trecho [identificação] é previsto a cada [frequência] e consta no registro de [data].', 'Não foi realizado o desmonte do trecho [identificação], embora aplicável, conforme [registro ou relato].'],
 '4.2.9': ['Foi apresentado o POP de higienização da canalização [código e revisão], com [método e parâmetros verificados].', 'Não foi apresentado POP de higienização para a canalização [identificação], nem registros da operação.'],
 '4.3.2/1': ['O reservatório [identificação] é de aço inoxidável [especificação], conforme [documento verificado].', 'Não foi apresentada comprovação de adequação ao contato com alimentos para [superfície] do reservatório [identificação].'],
 '4.3.2/2': ['O reservatório [identificação] apresentava superfícies íntegras nos pontos vistoriados.', 'Foi observado vazamento na união da tubulação de saída do reservatório [identificação], no trecho para [destino].'],
 '4.3.3': ['No reservatório [identificação], verificou-se [dispositivo selecionado] em [local], conforme [inspeção visual ou registro].', 'No reservatório [identificação], foi constatado [dispositivo ausente ou irregular]. Evidência: [descrição ou documento].'],
 '4.3.4': ['A inspeção visual do reservatório [identificação] foi registrada em [data], conforme POP [código].', 'Não foi apresentado registro da inspeção visual do reservatório [identificação] no intervalo previsto em [POP].'],
 '4.3.5/1': ['O reservatório [identificação] é higienizado a cada [frequência], com [método, produto e tempo de contato].', 'A frequência de higienização observada para o reservatório [identificação] foi de [frequência], embora o procedimento preveja [frequência].'],
 '4.3.5/2': ['Foram apresentados registros individualizados da higienização do reservatório [identificação] referentes a [período].', 'Os registros indicam higienização a cada [intervalo], mas a execução verificada ocorreu a cada [intervalo].'],
 '4.3.6': ['O POP de higienização do reservatório [código] estava disponível para consulta no local [identificação].', 'O POP [código] não estava disponível em [local], conforme verificado durante a inspeção.'],
 '4.5.2': ['A recepção dos garrafões retornados ocorre em [local], separado da recepção de [demais insumos].', 'A recepção de garrafões retornados e de [insumo] ocorre no mesmo espaço [local], conforme constatado na inspeção.'],
 '4.5.3': ['A inspeção de recebimento de [insumo] foi registrada em [data], com identificação do lote e critérios de aceitação.', 'Foi apresentada ficha de estoque de [insumo], mas não o registro de inspeção na recepção do lote [identificação].'],
 '4.5.4': ['Os garrafões foram avaliados individualmente no recebimento; os que apresentavam [defeito] foram segregados.', 'No recebimento, foi observado garrafão com [defeito] sem segregação, em [local].'],
 '4.5.6': ['O destino do insumo reprovado [lote] foi registrado em [documento], datado e assinado pelo responsável.', 'Foi informada a devolução do insumo reprovado [lote], mas não foi apresentado registro da devolução.'],
 '4.5.8': ['Foi apresentado o POP de recepção [código], que define a destinação de [embalagem reprovada].', 'O POP de recepção [código] não descreve o destino final de [embalagem ou insumo reprovado].'],
 '4.6.4': ['Antes da higienização automática, foi observada a pré-lavagem dos garrafões, com remoção de [sujidade] por [método].', 'Foram observados garrafões com [sujidade] encaminhados à higienização automática sem pré-lavagem.'],
 '4.6.12': ['Foi apresentado o POP de higienização de embalagens [código], com [parâmetros verificados] e registros de execução.', 'O POP de higienização de embalagens [código] não descrevia [etapa ou parâmetro observado].'],
 '4.7.2/2': ['A sala de envase estava limpa e conservada nos pontos vistoriados. O POP de higienização [código] foi apresentado.', 'Na sala de envase, observou-se [sujidade ou dano] em [superfície e local], conforme [evidência].'],
 '4.7.5/1': ['O acesso à sala de envase ocorre pela antesala [identificação]. A porta fechava e ajustava ao batente.', 'A mola da porta da antesala estava [condição] e a porta não ajustava ao batente, conforme verificado em [local].'],
 '4.7.5/2': ['A torneira do lavatório exclusivo da antesala foi acionada por pedal, sem contato manual, durante o teste.', 'A torneira do lavatório da antesala exigia acionamento manual ou apresentou [falha observada].'],
 '4.7.5/5': ['A higiene das mãos foi observada no lavatório exclusivo da antesala, conforme o POP [código].', 'O POP de higiene das mãos foi apresentado, mas verificou-se [etapa não executada] na antesala, em [momento].'],
 '4.10.1': ['Foram verificados registros de pH, condutividade e temperatura na fonte [identificação] referentes a [período].', 'Não foram apresentados registros de [parâmetro] na fonte [identificação] para o período [período].'],
 '4.10.2/2': ['Foi apresentado contrato vigente de análises terceirizadas [referência], com escopo e condições de coleta e transporte.', 'Foram apresentados comprovantes de serviços laboratoriais, mas não o contrato vigente de terceirização das análises.'],
 '4.10.3/1': ['O laudo [número e data] do lote [identificação] registrou [resultado] para [parâmetro verificado].', 'O laudo [número e data] do lote [identificação] registrou [resultado não conforme] para [parâmetro].'],
 '4.10.3/2': ['Foram apresentados resultados semanais de [parâmetro] para a captação [identificação], no período [período].', 'Não foram apresentados resultados semanais de [parâmetro] para a captação [identificação] no período [período].'],
 '4.10.3/3': ['Foram apresentados resultados semanais de [parâmetro] para o reservatório [identificação], no período [período].', 'Não foram apresentados resultados semanais de [parâmetro] para o reservatório [identificação] no período [período].'],
 '4.10.3/4': ['Foi apresentado laudo físico-químico anual [número e data] do produto [identificação], com [parâmetros verificados].', 'Não foi apresentado laudo físico-químico anual para o produto [identificação] referente a [período].'],
 '4.10.3/5': ['O laudo [número] documenta cinco amostras do mesmo lote [identificação], encaminhadas ao laboratório terceirizado em [mês].', 'Para [mês], o laudo [número] não comprovou a análise terceirizada de cinco amostras de um mesmo lote.'],
 '4.10.3/6': ['Os registros de [período] comprovam cinco unidades analisadas do lote [identificação], abrangendo início, meio e término do envase.', 'Para o lote [identificação], o registro mostrou [quantidade] unidades analisadas ou ausência de amostras de [etapa do envase].'],
 '4.10.5': ['Foi apresentado o laudo [número e data] do produto [identificação] e a documentação da fonte correspondente [referência].', 'Não foi apresentado [laudo do produto ou laudo da fonte] para [identificação].'],
 '4.10.6': ['Foi apresentado registro da ação corretiva adotada em [data] para o desvio [descrição], com [evidência de execução].', 'Foi constatado o desvio [descrição], mas não foram apresentadas evidências das medidas corretivas adotadas.'],
 '4.11.2': ['A responsabilidade foi comprovada por [documento de designação ou habilitação], vigente em [data].', 'Não foi apresentada comprovação de [designação ou habilitação profissional] para [atividade selecionada].'],
 '4.11.4': ['Foram apresentados certificados de capacitação dos manipuladores, com [data, carga horária e conteúdo].', 'Não foram apresentados os certificados de capacitação de [equipe ou função] referentes a [período].'],
}
import json
for code, number in {'4.2.9':1,'4.3.4':1,'4.3.6':2,'4.5.3':1,'4.5.6':2,'4.5.8':2,'4.6.12':1,'4.10.5':2,'4.10.6':2}.items():
 EXAMPLES[f'{code}/{number}']=EXAMPLES.pop(code)

EXAMPLE_JS=r"""
const BPF_FILL_EXAMPLES=__EXAMPLES__;
function bpfFillExample(code,panel,answer){
 if(answer!=='1'&&answer!=='0')return '';
 const specific=BPF_FILL_EXAMPLES[code+'/'+(panel.id+1)]||BPF_FILL_EXAMPLES[code];
 if(specific)return specific[answer==='1'?0:1];
 const label=code+' — '+panel.label.split(' — ')[0];
 if(answer==='1')return 'No item '+label+', verificou-se [condição observada] em [local, equipamento ou lote]. O atendimento foi comprovado por [evidência, identificação e data].';
 return 'No item '+label+', constatou-se [requisito não atendido] em [local, equipamento ou lote]. Evidência: [descreva o fato observado ou o documento que demonstra o desvio].';
}
function bpfAttachNoteTools(area,parent,code,panel,getAnswer){
 const help=document.createElement('details');help.className='bpf-note-help';
 const summary=document.createElement('summary');summary.textContent='Exemplo de preenchimento';
 const example=document.createElement('p');
 const hint=document.createElement('small');hint.textContent='Adapte o exemplo ao que foi verificado e substitua os trechos entre colchetes.';
 help.append(summary,example,hint);
 const tools=document.createElement('div');tools.className='bpf-note-tools';
 const paste=document.createElement('button');paste.type='button';__ICON__
 paste.title='Inserir exemplo completo';paste.setAttribute('aria-label','Inserir exemplo completo na observação');
 const status=document.createElement('span');status.setAttribute('role','status');
 const refresh=()=>{
  const text=bpfFillExample(code,panel,getAnswer());
  example.textContent=text||'Selecione Sim ou Não para ver o exemplo correspondente.';
  hint.hidden=!text;paste.disabled=!text;
  status.textContent='';
 };
 paste.onclick=()=>{
  const text=bpfFillExample(code,panel,getAnswer());
  if(!text||area.disabled)return;
  const current=area.value;
  const start=area.selectionStart??current.length,end=area.selectionEnd??start;
  const append=start===end&&current.length>0;
  const from=append?current.length:start,to=append?current.length:end;
  const insert=(append?'\n':'')+text;
  const next=current.slice(0,from)+insert+current.slice(to);
  area.value=next;
  area.setSelectionRange(from+insert.length,from+insert.length);
  area.dispatchEvent(new Event('input',{bubbles:true}));
  area.focus();
  status.textContent=area.value===next?'Exemplo inserido.':'';
 };
 tools.append(paste,status);parent.append(tools,help);
 refresh();return refresh;
}
""".replace('__EXAMPLES__',json.dumps(EXAMPLES,ensure_ascii=False)).replace('__ICON__',ICON_JS)
for name in ['individual.html','equipe.html']:
 p=ROOT/name;s=p.read_text()
 if 'const BPF_FILL_EXAMPLES=' not in s:
  start=s.index('function bpfAttachNoteTools(')
  end=s.index('let bpfInspectorLastApplied',start)
  s=s[:start]+EXAMPLE_JS+s[end:]
  s=s.replace('noteLabel.append(area);card.append(noteLabel);bpfAttachNoteTools(area,card);','noteLabel.append(area);card.append(noteLabel);',1)
  needle='let answer=bpfUnifiedAnswer(page,row,panel);'
  assert needle in s
  s=s.replace(needle,needle+'\n  const refreshExample=bpfAttachNoteTools(area,card,row.code,panel,()=>answer);',1)
  needle="area.value=answer?String(values[area.dataset.note]||''):'';"
  assert needle in s
  s=s.replace(needle,needle+'\n   refreshExample();',1)
  s=s.replace('bpfAttachNoteTools(area,box);','bpfAttachNoteTools(area,box,row.code,panel,()=>answer);',1)
 p.write_text(s)
for name in ['individual.html','equipe.html','index.html','sw-guia18.js']:
 p=ROOT/name;p.write_text(p.read_text().replace('20261107-obs-f8','20261107-obs-f9'))

# Revalide HTML ao navegar, inclusive pelos atalhos de versões anteriores.
# Preserve o acesso offline e não recarregue formulários já abertos.
RELEASE='20261107-obs-f10'
for name in ['individual.html','equipe.html','index.html','sw-guia18.js']:
 p=ROOT/name;s=p.read_text().replace('20261107-obs-f9',RELEASE)
 if name=='sw-guia18.js':
  s=s.replace('const response=await fetch(req);',"const isHtml=req.mode==='navigate'||IS_GUIDE(url)||url.pathname===ROOT.pathname||url.pathname.endsWith('/index.html');\n   const response=await fetch(req,isHtml?{cache:'reload'}:undefined);")
  s=s.replace('c.addAll(CORE)',"c.addAll(CORE.map(path=>new Request(new URL(path,ROOT),{cache:'reload'})))")
 elif name in ('individual.html','equipe.html') and 'id="bpf-update-worker"' not in s:
  s=s.replace('</body>',"""<script id="bpf-update-worker">
if('serviceWorker' in navigator && location.protocol==='https:'){
 navigator.serviceWorker.register('./sw-guia18.js',{scope:'./',updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
}
</script></body>""",1)
 p.write_text(s)
for name in ['individual_atualizado.html','equipe_atualizado.html']:
 p=ROOT/name;s=p.read_text().replace('20261105-publicado-final',RELEASE);p.write_text(s)

REQUIRED_STYLE='''<style id="bpf-required-fields-style">
@media screen{
.bpf-required-alert{box-sizing:border-box;max-width:1040px;margin:12px auto;padding:12px 16px;border:1px solid #c05f4d;border-left-width:5px;border-radius:8px;background:#fff4f0;color:#74271b;line-height:1.4}
.bpf-required-alert ul{margin:6px 0 0;padding-left:22px}
#pages [data-bpf-missing]{outline:2px solid #b03024!important;outline-offset:-2px;background-color:#fff0e8!important}
}
@media print{.bpf-required-alert{display:none!important}}
</style>'''
REQUIRED_JS=r"""
function bpfMissingIdentification(page,v){
 const nonempty=n=>String(v[n]??'').trim()!==''&&v[n]!=='Off'&&v[n]!=='/Off';
 const checked=n=>['1','0','2'].includes(String(v[n]));
 const evaluated=(column)=>{
  const model=BPF_PHRASES.find(p=>p.page===page);
  return !!model?.rows.some(r=>r.scopes.some(s=>Number(s.col)===column&&(checked(s.name)||s.phrases.some((_,i)=>checked(bpfPhraseName(s,i))))));
 };
 const missing=[];
 const add=(name,label,valid=nonempty(name))=>{if(!valid)missing.push({name,label});};
 if(page===0){
  for(const [name,label] of [['ENVASADORA','Envasadora'],['ENDEREÇO','Endereço'],['DATA','Data']])add(name,label);
  const columns=[1,2,3,4].map(i=>({i,type:'Group'+i,name:'fill_'+(i+1),brands:'fill_'+(i+5),flow:'fill_'+(i+9)}));
  const active=columns.filter(c=>[c.type,c.name,c.brands,c.flow].some(nonempty)||evaluated(c.i));
  for(const c of active.length?active:[columns[0]]){
   const label='Captação '+c.i+' — ';
   add(c.type,label+'tipo (poço ou surgência)',['Escolha1','Escolha2'].includes(v[c.type]));
   add(c.name,label+'nome');
   add(c.brands,label+'marcas envasadas');
   add(c.flow,label+'vazão (m³/h)');
  }
 }else if(page>=2&&page<=5){
  for(let col=1;col<=4;col++){
   const n=(page-2)*4+col,suffix=n===1?'':'_'+n;
   const code='RESERVATÓRIOCÓD DO EQUIP'+suffix,capacity='RESERVATÓRIOCAPACIDADE m 3'+suffix;
   if(nonempty(code)||nonempty(capacity)||evaluated(col)){
    add(code,'Reservatório '+col+' — código do equipamento');
    add(capacity,'Reservatório '+col+' — capacidade (m³)');
   }
  }
 }
 return missing;
}
const bpfRequiredAlert=document.createElement('div');
bpfRequiredAlert.className='bpf-required-alert';bpfRequiredAlert.setAttribute('role','alert');bpfRequiredAlert.hidden=true;
host.before(bpfRequiredAlert);
let bpfShownPage=Number(nav.value)||0;
function bpfClearMissingFields(){
 for(const field of host.querySelectorAll('[data-bpf-missing]')){delete field.dataset.bpfMissing;field.removeAttribute('aria-invalid');}
 bpfRequiredAlert.hidden=true;bpfRequiredAlert.replaceChildren();
}
function bpfDisplayMissingFields(page,missing){
 bpfClearMissingFields();
 if(!missing.length)return [];
 const title=document.createElement('strong');
 title.textContent='Preencha os campos obrigatórios antes de avançar:';
 const list=document.createElement('ul'),marked=[];
 for(const {name,label} of missing){
  const item=document.createElement('li');item.textContent=label;list.append(item);
  for(const field of host.children[page].querySelectorAll('[data-field="'+CSS.escape(name)+'"]:not(.printable)')){
   field.dataset.bpfMissing='';field.setAttribute('aria-invalid','true');marked.push(field);
  }
 }
 bpfRequiredAlert.append(title,list);bpfRequiredAlert.hidden=false;
 return marked;
}
function show(){
 const to=Number(nav.value);
 if(to>bpfShownPage){
  const missing=bpfMissingIdentification(bpfShownPage,values);
  if(missing.length){
   nav.value=String(bpfShownPage);
   const fields=bpfDisplayMissingFields(bpfShownPage,missing);
   alert('Preencha os campos obrigatórios antes de avançar:\n\n'+missing.map(x=>'• '+x.label).join('\n'));
   fields[0]?.focus({preventScroll:true});
   fields[0]?.scrollIntoView({block:'center',inline:'nearest'});
   return;
  }
 }
 bpfShownPage=to;bpfClearMissingFields();
 for(const [i,p] of [...host.children].entries())p.classList.toggle('active',i===to);
 requestAnimationFrame(()=>{sync()});
}
host.addEventListener('input',()=>{
 if(!bpfRequiredAlert.hidden)bpfDisplayMissingFields(bpfShownPage,bpfMissingIdentification(bpfShownPage,values));
});
nav.onchange=show;
"""
for name in ['individual.html','equipe.html']:
 p=ROOT/name;s=p.read_text()
 if 'function bpfMissingIdentification(' not in s:
  s=s.replace('</head>',REQUIRED_STYLE+'</head>',1)
  old="function show(){for(const [i,p]of [...host.children].entries())p.classList.toggle('active',i===Number(nav.value));requestAnimationFrame(()=>{sync()})}nav.onchange=show;"
  assert s.count(old)==1
  s=s.replace(old,REQUIRED_JS,1)
 p.write_text(s)
for name in ['individual.html','equipe.html','index.html','sw-guia18.js','individual_atualizado.html','equipe_atualizado.html']:
 p=ROOT/name;p.write_text(p.read_text().replace('20261107-obs-f10','20261107-obrigatorios-f11'))
