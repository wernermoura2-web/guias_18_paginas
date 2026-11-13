/* Guia BPF: interface amigável e cache offline (06/11/2026). */
const CACHE='guia18-20261113-amostragem-4104';
const ROOT=new URL('./',self.location.href);
const CORE=['./','./index.html','./manifest.webmanifest','./icon-bpf-appcc-192.png','./icon-bpf-appcc-512.png','./interface-guia-amigavel.js','./revisao-frases.html','./abrir-guia-corrigido.html','./revisao-orientacoes-apoio.js','./bpf-revisao-frases-ativa-20261107.js','./bpf-substituicao-campos-20261108.js','./bpf-f1-correcao-direta-20261108.js','./revisao-orientacoes-20261107.json','./bpf-f1-opcoes-visiveis.js','./individual_atualizado.html','./equipe_atualizado.html','./bpf-etiquetas-appcc-20261108.js','./bpf-correcao-f-pdf-v72.js','./bpf-fotos-somente-nc-20261109.js','./bpf-obs-livres-sem-prefixo-sim-20261109.js','./bpf-pcc-rotulos-risco-20261109.js','./bpf-impressao-unicode-compat-20261109.js','./bpf-cq-continuacao-20261109.js'];
CORE.push('./bpf-amostragem-4104.js');
const IS_GUIDE=url=>/\/(?:equipe|individual)(?:_atualizado)?\.html$/i.test(url.pathname);
async function attachFriendlyMenu(response,url){
  if(!IS_GUIDE(url)||!response||!response.ok)return response;
  const original=await response.text();
  const tag='<script src="./interface-guia-amigavel.js?v=20261113-amostragem-4104" defer></script>';
  let altered=(original.includes('interface-guia-amigavel.js')?original:original.replace(/<\/body\s*>/i,tag+'</body>')).replace(/interface-guia-amigavel\.js(?:\?v=[^\"'<> ]*)?/g,'interface-guia-amigavel.js?v=20261113-amostragem-4104');
  // Atualizar o padrão da recuperação em equipe sem sobrescrever a preferência salva.
  if(/\/equipe\.html$/i.test(url.pathname)){
    altered=altered.replace('let minutes=5;try', 'let minutes=1;try')
                   .replace('Intervalo padrão: 5 minutos.', 'Intervalo padrão: 1 minuto.');
  }
  // Carregar revisão dos F antes do script que constrói os campos e as respostas.
  const anchor='</script><script>/* Shared by the browser forms and Acrobat.';
  const active='<script src="./bpf-revisao-frases-ativa-20261107.js?v=20261108-f1-nativo-v58"></script>';
  if(!altered.includes('bpf-revisao-frases-ativa-20261107.js')){
    altered=altered.includes(anchor)
      ?altered.replace(anchor,'</script>'+active+'<script>/* Shared by the browser forms and Acrobat.')
      :altered.replace(/<\/body\s*>/i,active+'</body>');
  }
  altered=altered.replace(/bpf-revisao-frases-ativa-20261107\.js(?:\?v=[^"'<> ]*)?/g,'bpf-revisao-frases-ativa-20261107.js?v=20261113-amostragem-4104');
  // Corrigir rótulos das verificações existentes dentro de F1 (nenhuma nova frase F).
  // A descrição legal de cada item e as respostas salvas permanecem inalteradas.
  const F1_LABELS=[
    ["'4.10.1':['Implementação','Documentação']","'4.10.1':['Implementação do controle de qualidade','Documentação do controle de qualidade (manual, POPs, métodos e registros)']"],
    ["'4.11.1':['Supervisão','Capacitação']","'4.11.1':['Supervisão dos manipuladores','Capacitação periódica dos manipuladores']"],
    ["'4.11.3':['Curso de 40h com até 2 anos','Curso de 40h com mais de 2 anos']","'4.11.3':['Capacitação de 40 horas — curso concluído há até 2 anos','Capacitação de 40 horas — curso concluído há mais de 2 anos (conferir atualização)']"],
    ["'Certificado do responsável pela industrialização'","'Certificado de capacitação do responsável pela industrialização (data, carga horária e conteúdo)'"],
    ["'4.10.1':'F1 — Controle de qualidade'","'4.10.1':'F1 — Implementação e documentação do controle de qualidade'"],
    ["'4.11.1':'F1 — Supervisão e Capacitação'","'4.11.1':'F1 — Supervisão e capacitação periódica'"],
    ["'4.11.3':'F1 — Curso de capacitação'","'4.11.3':'F1 — Capacitação de 40 horas e curso há mais de 2 anos'"],
    ["'4.11.4':'F1 — Certificados de capacitação'","'4.11.4':'F1 — Certificados dos manipuladores e do responsável pela industrialização'"]
  ];
  for(const [before,after] of F1_LABELS)if(altered.includes(before))altered=altered.replace(before,after);
  const direct='<script defer src="./bpf-f1-correcao-direta-20261108.js?v=20261108-direto-v60"></script>';
  if(!altered.includes('bpf-f1-correcao-direta-20261108.js'))altered=altered.replace(/<\/head\s*>/i,direct+'</head>');
  // Garantia visual: opções selecionáveis dentro dos F1, também após reabrir o editor.
  const f1Visible='<script src="./bpf-f1-opcoes-visiveis.js?v=20261107-F1-visivel-v59" defer></script>';
  if(!altered.includes('bpf-f1-opcoes-visiveis.js'))altered=altered.replace(/<\/body\s*>/i,f1Visible+'</body>');

  // Aplicar também aos acessos diretos equipe.html / individual.html:
  // navegador e PDF editável devem receber o mesmo complemento.
  const upperTag='<script defer src="./bpf-etiquetas-appcc-20261108.js?v=20261109-export-completo-nc-v86"></script>';
  const fFixTag='<script defer src="./bpf-correcao-f-pdf-v72.js?v=20261109-export-completo-nc-v86"></script>';
  if(!altered.includes('bpf-etiquetas-appcc-20261108.js'))altered=altered.replace('</body>',upperTag+'</body>');
  if(!altered.includes('bpf-correcao-f-pdf-v72.js'))altered=altered.replace('</body>',fFixTag+'</body>');
  // Normalizar também URLs já inseridas ou recuperadas do cache anterior.
  altered=altered.replace(/bpf-etiquetas-appcc-20261108\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-etiquetas-appcc-20261108.js?v=20261109-export-completo-nc-v86');
  altered=altered.replace(/bpf-correcao-f-pdf-v72\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-correcao-f-pdf-v72.js?v=20261109-export-completo-nc-v86');
  // Em ambos os modos, fotos nos F com SIM ou NÃO: SIM dispensa OBS; NÃO exige NC.
  const photoTag='<script defer src="./bpf-fotos-somente-nc-20261109.js?v=20261112-retomada-v130"></script>';
  if(!altered.includes('bpf-fotos-somente-nc-20261109.js'))altered=altered.replace(/<\/body\s*>/i,photoTag+'</body>');
  altered=altered.replace(/bpf-fotos-somente-nc-20261109\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-fotos-somente-nc-20261109.js?v=20261112-retomada-v130');

  // v91: SIM com OBS mantém prefixo SIM; sem marcação, somente OBS; classificação sem BPF/APPCC.
  // O texto OBS pode ser digitado antes de marcar SIM.
  const OBS_F_PATCHES=[["entries.push(panel.label+' — '+bpfAnswerLabel(answer)+' ('+options.join(', ')+')'+(note?': '+bpfObservationMarker(answer,panel.entries)+note:''));","if(answer==='1'){\n     if(note)entries.push(panel.label+' — SIM ('+options.join(', ')+') — '+bpfObservationMarker(answer,panel.entries)+note);\n    }else entries.push(panel.label+' — '+bpfAnswerLabel(answer)+' ('+options.join(', ')+')'+(note?': '+bpfObservationMarker(answer,panel.entries)+note:''));"],["entries.push(panel.label+' — '+label+(units.length?' ('+units.join(', ')+')':'')+(note?': '+bpfObservationMarker(answer,selected)+note:''));","if(answer==='1'){\n    if(note)entries.push(panel.label+' — SIM'+(units.length?' ('+units.join(', ')+')':'')+' — '+bpfObservationMarker(answer,selected)+note);\n   }else entries.push(panel.label+' — '+label+(units.length?' ('+units.join(', ')+')':'')+(note?': '+bpfObservationMarker(answer,selected)+note:''));"],["entries.push(panel.label+' — '+bpfAnswerLabel(answer)+' ('+checks.join(', ')+')'+(note?'; '+bpfObservationMarker(answer,matched)+note:'')+(other?'; Outro: '+other:''));","if(answer==='1'){\n   if(note)entries.push(panel.label+' — SIM ('+checks.join(', ')+')'+(note?'; '+bpfObservationMarker(answer,matched)+note:'')+(other?'; Outro: '+other:''));\n  }else entries.push(panel.label+' — '+bpfAnswerLabel(answer)+' ('+checks.join(', ')+')'+(note?'; '+bpfObservationMarker(answer,matched)+note:'')+(other?'; Outro: '+other:''));"],["area.disabled=!answer||answer==='2';","area.disabled=answer==='2';"],["area.dataset.note=!area.disabled?bpfGroupNoteName(page,row,panel,answer):'';","area.dataset.note=!area.disabled?bpfGroupNoteName(page,row,panel,answer==='0'?'0':'1'):'';"],["area.oninput=()=>{if(!answer||answer==='2')return;values[bpfGroupNoteName(page,row,panel,answer)]=area.value;bpfUnifiedApply(page,row,panel);changed();};","area.oninput=()=>{if(answer==='2')return;values[bpfGroupNoteName(page,row,panel,answer==='0'?'0':'1')]=area.value;bpfUnifiedApply(page,row,panel);changed();};"],["'OBS — observação única das opções marcadas Sim'","'OBS — observação livre do F (opcional)'"],["area.value=answer?String(values[area.dataset.note]||''):'';","area.value=!area.disabled?String(values[area.dataset.note]||''):'';"],["(classes.length?' (BPF/APPCC: '+classes.join(' / ')+')':'')","(classes.length?' ('+classes.join(' / ')+')':'')"]];
  // Evitar reaplicar o patch ao HTML já transformado e recuperado do cache offline.
  if(!altered.includes('bpf-obs-f-v91')&&!altered.includes(OBS_F_PATCHES[0][1])){
    let obsFApplied=0;
    for(const [source,target] of OBS_F_PATCHES){
      if(altered.includes(source)){altered=altered.replace(source,target);obsFApplied++;}
    }
    if(obsFApplied===OBS_F_PATCHES.length)
      altered=altered.replace(/<\/head\s*>/i,'<meta name="bpf-obs-f-v91" content="1"></head>');
    else console.warn('OBS do F: ',obsFApplied,'de',OBS_F_PATCHES.length,'ajustes aplicados');
  }
  // Registrar OBS do quadro SIM sem prefixo SIM mesmo quando NÃO/NC está marcado.
  // Preservar a resposta, a NC e a classificação da frase (PPR/PC/PPRO/PCC).
  const obsTag='<script defer src="./bpf-obs-livres-sem-prefixo-sim-20261109.js?v=20261112-retomada-v130"></script>';
  if(!altered.includes('bpf-obs-livres-sem-prefixo-sim-20261109.js'))
    altered=altered.replace(/<\/body\s*>/i,obsTag+'</body>');
  altered=altered.replace(/bpf-obs-livres-sem-prefixo-sim-20261109\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-obs-livres-sem-prefixo-sim-20261109.js?v=20261112-retomada-v130');
  // O cálculo original do guia foi preservado; retirar o interceptor de valores que impedia abertura.
  // Identificação visual explícita "ALTO - PCC" nas células de risco,
  // sem mudar o valor de cálculo dos campos de seleção.
  const pccTag='<script defer src="./bpf-pcc-rotulos-risco-20261109.js?v=20261112-retomada-v130"></script>';
  if(!altered.includes('bpf-pcc-rotulos-risco-20261109.js'))
    altered=altered.replace(/<\/body\s*>/i,pccTag+'</body>');
  altered=altered.replace(/bpf-pcc-rotulos-risco-20261109\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-pcc-rotulos-risco-20261109.js?v=20261112-retomada-v130');
  // Relatório de inspeção impresso: congelar os campos (inclusive SIM/NÃO)
  // e evitar recálculo posterior pelo Foxit ou outros leitores.
  // O botão de PDF EM BRANCO permanece independente e editável.
  const exportMarker='bpf-relatorio-final-estatico-v100';
  if(!altered.includes(exportMarker)){
    const helperText="/* bpf-relatorio-final-estatico-v100 */\n\n// BPF: exportação final (somente relatório impresso, nunca o modelo em branco).\nfunction bpfPrintPrepareRisk(){\n const map=[\n  {p:[0],u:{0:['Dropdown1','Dropdown2','Dropdown3','Dropdown4']},f:{0:'Dropdown5'},m:'Dropdown67',s:'Dropdown300'},\n  {p:[1],u:{1:['Dropdown6','Dropdown113','Dropdown8','Dropdown9']},f:{1:'Dropdown10'},m:'Dropdown66',s:'Dropdown301'},\n  {p:[2,3,4,5],u:{2:['Dropdown11','Dropdown12','Dropdown13','Dropdown14'],3:['Dropdown16','Dropdown17','Dropdown18','Dropdown19'],4:['Dropdown21','Dropdown22','Dropdown23','Dropdown24'],5:['Dropdown26','Dropdown27','Dropdown28','Dropdown29']},f:{2:'Dropdown15',3:'Dropdown20',4:'Dropdown25',5:'Dropdown30'},m:'Dropdown65',s:'Dropdown302'},\n  {p:[6],u:{6:['Dropdown31','Dropdown32','Dropdown33','Dropdown34']},f:{6:'Dropdown35'},m:'Dropdown64',s:'Dropdown303'},\n  {p:[7,8],u:{7:['Dropdown36','Dropdown37','Dropdown38','Dropdown39'],8:['Dropdown41','Dropdown42','Dropdown43','Dropdown44']},f:{7:'Dropdown40',8:'Dropdown45'},m:'Dropdown63',s:'Dropdown304'},\n  {p:[9,10],u:{9:['Dropdown46','Dropdown47','Dropdown48','Dropdown49'],10:['Dropdown51','Dropdown52','Dropdown53','Dropdown54']},f:{9:'Dropdown50',10:'Dropdown55'},m:'Dropdown61',s:'Dropdown305'},\n  {p:[11],u:{},f:{11:'Dropdown56'},m:'Dropdown60',s:'Dropdown306'},\n  {p:[12],u:{},f:{12:'Dropdown57'},m:'Dropdown62',s:'Dropdown307'}\n ];\n const failed=new Map();\n for(const page of BPF_PHRASES)for(const row of (page.rows||[]))for(const scope of (row.scopes||[])){\n  for(let i=0;i<(scope.phrases||[]).length;i++){\n   if(String(scope.phrases[i]?.appcc||'').toUpperCase()!=='PCC')continue;\n   if(String(values[bpfPhraseName(scope,i)]||'')!=='0')continue;\n   const col=Number(scope.col);if(!Number.isInteger(col)||col<1||col>4)continue;\n   if(!failed.has(page.page))failed.set(page.page,new Set());\n   failed.get(page.page).add(col);\n  }\n }\n const labels=[];\n for(const g of map){\n  let isPcc=false;\n  for(const p of g.p){\n   const cols=failed.get(p);if(!cols||!cols.size)continue;\n   isPcc=true;\n   for(const col of cols){\n    const unit=g.u[p]?.[col-1];\n    if(unit){values[unit]='ALTO';labels.push({page:p,name:unit});}\n   }\n   const final=g.f[p];\n   if(final){values[final]='ALTO';labels.push({page:p,name:final});}\n  }\n  if(isPcc){\n   values[g.m]='ALTO';values[g.s]='3';\n   labels.push({page:17,name:g.m});\n  }\n }\n const groups=['Dropdown60','Dropdown61','Dropdown62','Dropdown63','Dropdown64','Dropdown65','Dropdown66','Dropdown67'];\n const anyHigh=groups.some(field=>values[field]==='ALTO');\n if(anyHigh){\n  values.Dropdown58='ALTO';\n  values.Group279='2'; // Grupo 3 é a opção PDF de estado \"2\".\n }\n return labels;\n}\nfunction bpfPrintFinalizePdf(pdf,form,font,labels){\n // O campo BPF_State contém o JSON de recuperação (milhares de caracteres)\n // numa caixa invisível de 1 pt. Remover do relatório antes de achatar evita\n // demora ou falhas de aparência, sem perder as respostas já exibidas.\n const temporaryState=form.getFieldMaybe('BPF_State');\n if(temporaryState)form.removeField(temporaryState);\n // Transformar as respostas e imagens em elementos fixos da página.\n form.flatten({updateFieldAppearances:true});\n const ink=PDFLib.rgb(.64,.055,.09),background=PDFLib.rgb(.95,.97,.99);\n for(const {page,name} of labels){\n  const w=D.widgets.find(item=>item.page===page&&item.name===name);\n  if(!w||!w.rect)continue;\n  const docPage=pdf.getPage(bpfPageOrder.indexOf(page));\n  const h=docPage.getHeight();\n  const delta=h-w.size[1];\n  const [x1,y1,x2,y2]=w.rect;\n  const width=x2-x1,height=y2-y1;\n  if(width<28||height<8)continue;\n  const text='ALTO - PCC';\n  const size=Math.min(8.5,Math.max(4.2,(width-5)/font.widthOfTextAtSize(text,1)));\n  // Corresponde à coordenada do widget, inclusive nas páginas ampliadas.\n  const top=w.size[1]-y2;\n  const y=h-top-height;\n  docPage.drawRectangle({x:x1+.35,y:y+.35,width:width-.7,height:height-.7,color:background});\n  docPage.drawText(text,{x:x1+(width-font.widthOfTextAtSize(text,size))/2,y:y+(height-size)/2+.8,size,font,color:ink});\n }\n const N=PDFLib.PDFName;\n for(const key of ['Names','OpenAction','AA','AcroForm'])pdf.catalog.delete(N.of(key));\n for(const page of pdf.getPages()){\n  page.node.delete(N.of('AA'));\n  const annotations=page.node.Annots();\n  if(!annotations)continue;\n  for(let i=annotations.size()-1;i>=0;i--){\n   if(!pdf.context.lookup(annotations.get(i)))annotations.remove(i);\n  }\n }\n}\n";
    const removeTemplateFieldsCode="/* Reconciliar widgets de formulario com as paginas efetivas do PDF.\n   Remove apenas widgets sem anotacao em pagina e corrige /P dos restantes.\n   Evita PDFRef invalida no pdf-lib flatten (impressao final). */\nfunction bpfPrintExcludeTemplateFields(pdf,form){\n const N=PDFLib.PDFName, key=N.of('P'), pageByAnnot=new Map();\n for(const page of pdf.getPages()){\n  const annots=page.node.Annots();if(!annots)continue;\n  for(let i=0;i<annots.size();i++){\n   const ref=annots.get(i);\n   if(!ref)continue;\n   pageByAnnot.set(String(ref),page.ref);\n   try{\n    const dict=pdf.context.lookup(ref);\n    if(dict&&typeof dict.set==='function'&&String(dict.get(N.of('Subtype')))==='/Widget')\n      dict.set(key,page.ref);\n   }catch(e){console.warn('Anotacao inacessivel:',String(ref),e);}\n  }\n }\n let excluded=0,repaired=0,kept=0;\n for(const field of [...form.getFields()]){\n  const widgets=field.acroField.getWidgets();\n  if(!widgets.length)continue;\n  const kids=field.acroField.Kids();\n  let active=0;\n  for(let index=widgets.length-1;index>=0;index--){\n   const widget=widgets[index];\n   const ref=pdf.context.getObjectRef(widget.dict)||(!kids?field.ref:null);\n   const pageRef=ref&&pageByAnnot.get(String(ref));\n   if(pageRef){\n    if(String(widget.P())!==String(pageRef)){widget.dict.set(key,pageRef);repaired++;}\n    active++;kept++;continue;\n   }\n   // Widget de formulario modelo F sem representacao nas 22 paginas finais.\n   if(kids&&typeof kids.remove==='function'&&index<kids.size()){\n    kids.remove(index);\n    if(ref)pdf.context.delete(ref);\n    excluded++;\n   }\n  }\n  if(!active){\n   form.acroForm.removeField(field.acroField);\n   pdf.context.delete(field.ref);\n   if(!kids)excluded++;\n  }\n }\n console.info('Impressao final: widgets preservados',kept,\n              'referencias corrigidas',repaired,'widgets temporarios excluidos',excluded);\n}\n";
    const compatCode="\n/* Compatibilidade com fontes PDF StandardFonts/WinAnsi.\n   A adaptação ocorre somente na cópia que está sendo exportada; não altera\n   os valores originais do HTML/JSON guardados na inspeção. */\nfunction bpfPrintNormalizeWinAnsi(value){\n if(typeof value!=='string')return value;\n const map={\n  '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9',\n  '⁰':'0','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9',\n  'ₐ':'a','ₑ':'e','ₕ':'h','ᵢ':'i','ₙ':'n','ₒ':'o','ₓ':'x',\n  '≤':'<=','≥':'>=','≠':'!=','−':'-','∑':'SOMA','√':'raiz',\n  '→':'->','←':'<-','↔':'<->','✓':'OK','✔':'OK','☑':'[X]','☐':'[ ]',\n  'α':'alfa','β':'beta','γ':'gama','δ':'delta','Δ':'Delta',\n  '∞':'infinito','∈':'em','∉':'fora','∧':'e','∨':'ou',\n  '‐':'-','‑':'-','‒':'-','―':'-','⁻':'-','⁄':'/',\n  ' ':' ',' ':' ',' ':' ','​':'','⁠':'','\\u00ad':''\n };\n const winAnsi=/^[\\x20-\\x7e\\u00a0-\\u00ff€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]$/u;\n let out='';\n for(const ch of value){\n  if(ch==='\\n'||ch==='\\r'||ch==='\\t'){out+=ch;continue;}\n  if(winAnsi.test(ch)){out+=ch;continue;}\n  let replacement=map[ch];\n  if(replacement===undefined){\n   replacement=ch.normalize('NFKD').replace(/[\\u0300-\\u036f]/g,'');\n   if(replacement===ch)replacement='?';\n   replacement=[...replacement].map(c=>winAnsi.test(c)?c:'?').join('');\n  }\n  out+=replacement;\n }\n return out;\n}\nfunction bpfPrintInstallWinAnsiGuard(){\n const Text=window.PDFLib&&PDFLib.PDFTextField;\n if(!Text||!Text.prototype)return;\n const proto=Text.prototype;\n if(proto.__bpfPrintUnicodeSafe)return;\n const originalSet=proto.setText,originalUpdate=proto.updateAppearances;\n proto.setText=function(value){\n  return originalSet.call(this,bpfPrintNormalizeWinAnsi(value));\n };\n proto.updateAppearances=function(font){\n  const before=this.getText();\n  if(typeof before==='string'){\n   const safe=bpfPrintNormalizeWinAnsi(before);\n   if(safe!==before)originalSet.call(this,safe);\n  }\n  return originalUpdate.apply(this,arguments);\n };\n proto.__bpfPrintUnicodeSafe=true;\n}\n";
    const exportDefinition='async function bpfExportEditable(){';
    const beforeSave=' const bytes=await pdf.save();';
    const fillPreparation=' bpfPreparePhotoPdf(pdf,form,observationFont);';
    const oldDownload="a.download='Guia_BPF_Inspecao_Editavel.pdf'";
    const oldStatus="status.textContent='PDF preenchível gerado'";
    if(altered.includes(exportDefinition)&&altered.includes(beforeSave)&&altered.includes(fillPreparation)){
      const helperTextFixed=helperText.replace(' form.flatten({updateFieldAppearances:true});',' bpfPrintExcludeTemplateFields(pdf,form);\\n form.flatten({updateFieldAppearances:true});'.replace('\\n','\n'));
      altered=altered.replace(exportDefinition,removeTemplateFieldsCode+'\n'+helperTextFixed+'\n'+compatCode+'\n'+exportDefinition+' bpfPrintInstallWinAnsiGuard();');
      altered=altered.replace(fillPreparation,fillPreparation+
        '\n const bpfPrintPccLabels=bpfPrintPrepareRisk();');
      altered=altered.replace(beforeSave,
        '\n bpfPrintFinalizePdf(pdf,form,observationFont,bpfPrintPccLabels);\n if(window.bpfPrintSampling404)await window.bpfPrintSampling404(pdf);\n'+beforeSave);
      altered=altered.replace(oldDownload,
        "a.download='Guia_BPF_Relatorio_Inspecao_FINAL.pdf'");
      altered=altered.replace(oldStatus,"status.textContent='PDF final não editável gerado'");
      altered=altered.replace("status.textContent='Preparando PDF preenchível…'","status.textContent='Preparando PDF final de impressão…'");
      altered=altered.replace("'. Texto integral distribuído entre páginas e campos editáveis.'",
        "'. Relatório final sem campos editáveis ou recálculo automático.'");
    } else {
      console.error('Não foi possível ativar exportação PDF final: modelo alterado inesperadamente.');
    }
  }
  // O PDF identifica as caixas de classificação pelos estados 0/1/2.
  const radioExport="else if(f.getOptions().includes(value))f.select(value);";
  if(!altered.includes("else if(name==='Group279')")){
    altered=altered.replace(radioExport,`else if(name==='Group279'){
      const state=f.acroField.getOnValues().find(option=>option.decodeText()===value);
      if(state)f.acroField.setValue(state);
    }`+radioExport);
  }
  // Corrigir o HTML fonte sem alterar as frases ou as respostas de outras linhas.
  // Configurar a opção antes da criação dos campos e do primeiro cálculo.
  const inspectorScript='<script src="./bpf-revisao-frases-ativa-20261107.js';
  const na458Setup=`<script>
  {
    const retornaveis = BPF_PHRASES.find(page => page.page === 6)?.rows
      .find(row => row.code === '4.5.8')?.scopes.find(scope => Number(scope.col) === 1);
    if(retornaveis?.phrases[0])retornaveis.phrases[0].allowNA=true;
  }
  </script>`;
  altered=altered.replace(inspectorScript,na458Setup+inspectorScript);
  const dependentNA="function bpfAllowsDependentNA(row,entry,v){";
  altered=altered.replace(dependentNA,dependentNA+`
 if(row.code==='4.5.8'&&Number(entry.scope.col)===1&&entry.index<3)
  return entry.scope.phrases[entry.index]?.allowNA===true;`);
  const naHint="hint.textContent='Disponível quando o F1 da mesma unidade estiver marcado como Não.';";
  altered=altered.replace(naHint,
    "hint.textContent=row.code==='4.5.8'?'Nas demais colunas, o NA depende de o F1 da mesma coluna estar marcado como Não.':'Disponível quando o F1 da mesma unidade estiver marcado como Não.';");
  // A matriz usa NA para o item de retornáveis quando o F1 estiver marcado NA.
  const agg="  if(!s.observationOnly&&(a!==null||cleared))v[s.name]=a??'Off';";
  altered=altered.replace(agg,
    "  if(!s.observationOnly&&(a!==null||cleared))v[s.name]=(r.code==='4.5.8'&&Number(s.col)===1&&v[bpfPhraseName(s,0)]==='2')?'2':(a??'Off');");
  // O número 1/2/3 deve refletir exatamente BAIXO/MÉDIO/ALTO de cada processo.
  const riskAnchor=" bpfOverridePCCRisk();\n const levels=";
  const riskText=" bpfOverridePCCRisk();\n for(const cfg of BPF_PCC_RISK_MAP){const grade=String(values[cfg.matrix]||'').toUpperCase();values[cfg.score]=grade.startsWith('ALTO')?'3':grade.startsWith('MÉDIO')||grade.startsWith('MEDIO')?'2':grade.startsWith('BAIXO')?'1':'';}\n const levels=";
  altered=altered.replace(riskAnchor,riskText);
  // Controle de Qualidade: botão opcional para transferir observações extensas
  // dos itens 4.10.1–4.10.6 para a página de continuação.
  const cqTransfer='<script defer src="./bpf-cq-continuacao-20261109.js?v=20261112-retomada-v130"></script>';
  if(!altered.includes('bpf-cq-continuacao-20261109.js'))
    altered=altered.replace(/<\/body\s*>/i,cqTransfer+'</body>');
  altered=altered.replace(/bpf-cq-continuacao-20261109\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-cq-continuacao-20261109.js?v=20261112-retomada-v130');
  // Complemento da impressão: proteger também o acesso direto aos formulários.
  const printUnicodeTag='<script defer src="./bpf-impressao-unicode-compat-20261109.js?v=20261112-retomada-v130"></script>';
  if(!altered.includes('bpf-impressao-unicode-compat-20261109.js'))
    altered=altered.replace(/<\/body\s*>/i,printUnicodeTag+'</body>');
  altered=altered.replace(/bpf-impressao-unicode-compat-20261109\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-impressao-unicode-compat-20261109.js?v=20261112-retomada-v130');
  // As páginas adicionais usam Foto_Pagina_ para os espaços de foto.
  altered=altered.replaceAll('Imagem|Foto_Extra_|Rotulo_Extra_|Rotulo_Pagina_',
    'Imagem|Foto_Extra_|Foto_Pagina_|Rotulo_Extra_|Rotulo_Pagina_');
  // Comparar os resumos com o mesmo espaçamento aplicado ao quadro do processo.
  const mergeObservation=/function bpfMergeObservation\(text,code,previous,summary\)\{[\s\S]*?\n\}/;
  altered=altered.replace(mergeObservation,`function bpfMergeObservation(text,code,previous,summary){
 const start='[Frases '+code+']',end='[/Frases '+code+']',a=text.indexOf(start);
 if(a>=0){const b=text.indexOf(end,a);if(b>=0)text=text.slice(0,a)+text.slice(b+end.length);}
 text=bpfSpaceItemObservations(text).trimEnd();
 previous=bpfSpaceItemObservations(previous).trim();
 summary=bpfSpaceItemObservations(summary).trim();
 const index=previous?text.indexOf(previous):-1;
 if(index>=0){
  const before=text.slice(0,index),after=text.slice(index+previous.length);
  if(summary)return before+summary+after;
  return [before.trimEnd(),after.trimStart()].filter(Boolean).join('\\n\\n');
 }
 if(!summary||text.includes(summary))return text;
 return [text,summary].filter(Boolean).join('\\n\\n');
}`);
  // O guia conserva os formulários vazios para que possam ser restaurados.
  if(!altered.includes('const BPF_RESERVOIR_PAGES=')){
    const reservoirField="const BPF_PHOTO_PAGE_FIELD=";
    altered=altered.replace(reservoirField,`const BPF_RESERVOIR_PAGES=[2,3,4,5];
const BPF_HIDDEN_RESERVOIRS='BPF_HiddenReservoirPages';
D.fields[BPF_HIDDEN_RESERVOIRS]={name:BPF_HIDDEN_RESERVOIRS,type:'/Tx',flags:0,label:'Páginas de reservatórios excluídas',options:[],calc:''};
`+reservoirField);
    const galleryUpdate='function bpfUpdateDeleteGalleryPage(){';
    altered=altered.replace(galleryUpdate,`const restoreReservoirPages=document.createElement('button');
restoreReservoirPages.type='button';
restoreReservoirPages.textContent='Restaurar páginas de reservatórios';
restoreReservoirPages.onclick=()=>{
 values[BPF_HIDDEN_RESERVOIRS]='';
 changed();
 sync();
};
galleryActions.append(restoreReservoirPages);
const reservoirFields=new Map(BPF_RESERVOIR_PAGES.map(id=>[id,new Set([
 ...D.widgets.filter(w=>w.page===id).map(w=>w.name),
 ...Object.keys(D.fields).filter(name=>D.fields[name].phrasePage===id)
])]));
function bpfReservoirPageEmpty(id){
 for(const name of reservoirFields.get(id)){
  const field=D.fields[name];
  if(images[name])return false;
  if(derived.has(name)||field.calc||(field.type==='/Btn'&&(field.flags&65536)))continue;
  const value=String(values[name]??'').trim();
  if(value&&value!=='Off'&&value!=='[]')return false;
 }
 return true;
}
function bpfReservoirHasSource(id){
 const column=id-2;
 if([sourceFields[column],'fill_'+(6+column),'fill_'+(10+column)].some(name=>String(values[name]??'').trim()))return true;
 const catchment=BPF_PHRASES.find(page=>page.page===0);
 return catchment.rows.some(row=>row.scopes.some(scope=>Number(scope.col)===column+1&&
  (['0','1'].includes(values[scope.name])||scope.phrases.some((_,index)=>['0','1'].includes(values[bpfPhraseName(scope,index)])))));
}
function bpfReservoirCanHide(id){
 return bpfReservoirPageEmpty(id)&&!bpfReservoirHasSource(id);
}
function bpfReconcileReservoirPages(){
 const saved=new Set(String(values[BPF_HIDDEN_RESERVOIRS]||'').split(',').map(Number));
 const hidden=BPF_RESERVOIR_PAGES.filter(id=>saved.has(id)&&bpfReservoirCanHide(id));
 values[BPF_HIDDEN_RESERVOIRS]=hidden.join(',');
 let updated=false;
 for(const id of BPF_RESERVOIR_PAGES){
  const index=bpfPageOrder.indexOf(id);
  if(hidden.includes(id)&&index>=0){
   bpfSheets[id].remove();
   bpfPageOrder.splice(index,1);
   updated=true;
  }else if(!hidden.includes(id)&&index<0){
   const next=[...BPF_RESERVOIR_PAGES,6].find(page=>page>id&&bpfPageOrder.includes(page));
   bpfPageOrder.splice(bpfPageOrder.indexOf(next),0,id);
   host.insertBefore(bpfSheets[id],bpfSheets[next]);
   updated=true;
  }
 }
 if(updated)bpfRefreshPhotoNavigation();
 restoreReservoirPages.hidden=!hidden.length;
}
`+galleryUpdate+`
 bpfReconcileReservoirPages();
 const reservoir=Number(nav.value);
 if(BPF_RESERVOIR_PAGES.includes(reservoir)){
  deleteGalleryPage.hidden=!bpfReservoirCanHide(reservoir);
  deleteGalleryPage.textContent='Excluir página vazia de reservatórios';
  deleteGalleryPage.onclick=()=>{
   if(!bpfReservoirCanHide(reservoir)||!confirm('Excluir esta página vazia de reservatórios do guia e do PDF impresso?'))return;
   values[BPF_HIDDEN_RESERVOIRS]=[values[BPF_HIDDEN_RESERVOIRS],reservoir].filter(Boolean).join(',');
   nav.value=String(bpfPageOrder[bpfPageOrder.indexOf(reservoir)-1]);
   changed();
   sync();
  };
  return;
 }
`);
    altered=altered.replace("const option=document.querySelector('#nav').options[2+i];if(option)option.textContent=(i+3)+'. 4.3",
      "const option=[...document.querySelector('#nav').options].find(o=>Number(o.value)===2+i);if(option)option.textContent=(bpfPageOrder.indexOf(2+i)+1)+'. 4.3");
    altered=altered.replace("if(index<14)footer.classList.add('bpf-renumbered-base');",
      "if(id>=0&&id<14)footer.classList.add('bpf-renumbered-base');");
    altered=altered.replace("const number='Página 15 de '+bpfPageOrder.length",
      "const number='Página '+(bpfPageOrder.indexOf(bpfNCPageIndex)+1)+' de '+bpfPageOrder.length");
    altered=altered.replace("text(page,'Página '+(i+1)+' de '+total,w-96,58,70,7);",
      "if(bpfPageOrder.includes(i))text(page,'Página '+(bpfPageOrder.indexOf(i)+1)+' de '+total,w-96,58,70,7);");
    altered=altered.replace('for(const source of [20,19,16,15]){',
      'for(const source of [20,19,16,15,...BPF_RESERVOIR_PAGES.slice().reverse()]){');
    altered=altered.replace('pdf.removePage(source+1);',`pdf.removePage(source<14?source:source+1);
  pdf.pageCache.invalidate();`);
  }
  // Seleção múltipla somente ao anexar fotos a um F.
  const picker=/let bpfPhotoContext=null;[\s\S]*?\n\};(?=\ndocument.querySelector\('#removeImage'\))/;
  altered=altered.replace(picker,`let bpfPhotoContext=null;
let bpfImageImportBusy=false;
function chooseImage(name,photo=null){
 if(bpfImageImportBusy)return;
 bpfPhotoContext=photo;
 const input=document.querySelector('#imageInput');
 input.multiple=Boolean(photo);
 input.dataset.target=name;
 input.value='';
 input.click();
}
async function bpfEncodeSelectedImage(file,crop){
 const bitmap=await createImageBitmap(file);
 try{
  const rect=crop?await bpfCropLabel(bitmap):[0,0,bitmap.width,bitmap.height];
  if(!rect)return null;
  const [x,y,width,height]=rect;
  const scale=Math.min(1,1600/Math.max(width,height));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(width*scale));
  canvas.height=Math.max(1,Math.round(height*scale));
  const context=canvas.getContext('2d');
  context.fillStyle='white';
  context.fillRect(0,0,canvas.width,canvas.height);
  context.drawImage(bitmap,x,y,width,height,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/jpeg',.85);
 }finally{bitmap.close();}
}
document.querySelector('#imageInput').onchange=async event=>{
 const photo=bpfPhotoContext,input=event.target,target=input.dataset.target;
 bpfPhotoContext=null;
 const files=Array.from(input.files).slice(0,photo?undefined:1);
 if(!files.length||bpfImageImportBusy)return;
 bpfImageImportBusy=true;
 const crop=/^(?:Imagem[1-3]_af_image|Rotulo_Pagina_[23]_[1-3]|Rotulo_Extra_\\d+_[1-3])$/.test(target);
 let added=0,failed=0;
 try{
  if(photo)photo.status.textContent='Inserindo '+files.length+' foto(s)…';
  for(const file of files){
   try{
    const encoded=await bpfEncodeSelectedImage(file,crop);
    if(!encoded)continue;
    const slot=photo?bpfAllocatePhotoSlot():target;
    if(!slot)throw new Error('Não há espaço para a foto.');
    images[slot]=encoded;
    if(photo){
     values['BPF_PhotoProcess_'+slot]=photo.process;
     values['BPF_PhotoLocation_'+slot]=photo.location;
    }
    added++;
   }catch(err){
    failed++;
    if(!photo)alert('Não foi possível abrir a imagem. Use JPG ou PNG.');
   }
  }
  if(added){changed();sync();}
  if(photo)photo.status.textContent=added+' foto(s) inserida(s) nas páginas Fotos.'+(failed?' '+failed+' arquivo(s) não puderam ser inseridos.':'');
 }finally{bpfImageImportBusy=false;}
};`);
  if(/\/equipe\.html$/i.test(url.pathname)&&!altered.includes('function scheduleRecovery18()')){
    const changed='function changed(){dirty=true;';
    altered=altered.replace(changed,changed+"window.GuiaRecovery?.schedule();");
    altered=altered.replace("bpfSyncObservation(row,page);bpfSyncPCCFinal();recalc();return true;",
      "bpfSyncObservation(row,page);bpfSyncPCCFinal();recalc();window.GuiaRecovery?.schedule();return true;");
    altered=altered.replace("dirty=true;recalc();sync();\n  document.querySelector('#teamModal18')",
      "dirty=true;recalc();sync();window.GuiaRecovery?.schedule();\n  document.querySelector('#teamModal18')");
    altered=altered.replace("team18=cleanTeam18(data.team18)||makeTeam18();recalc();dirty=false;",
      "team18=cleanTeam18(data.team18)||makeTeam18();recalc();dirty=false;window.GuiaRecovery?.schedule();");
    altered=altered.replace("let db,baseline=JSON.stringify(A.snapshot()),queue=Promise.resolve(),paused=false,failed=false;",
      `let db,baseline=JSON.stringify(A.snapshot()),queue=Promise.resolve(),paused=false,failed=false;
let recoveryEdited=false,recoveryTimer,recoveryStarting=true;
function scheduleRecovery18(){
 recoveryEdited=true;
 clearTimeout(recoveryTimer);
 recoveryTimer=setTimeout(()=>checkpoint(),3000);
}
document.querySelector('#jsonInput').addEventListener('change',event=>{
 if(event.target.files.length)recoveryEdited=true;
},true);`);
    altered=altered.replace('if(!db||paused)return Promise.resolve();const body=A.snapshot()',
      'if(!db||paused||recoveryStarting||(!force&&!recoveryEdited))return queue;const body=A.snapshot()');
    altered=altered.replace("recover.onclick=async()=>{if(!confirm(", "recover.onclick=async()=>{recoveryEdited=true;if(!confirm(");
    const oldStartup=/const rows=\(await request\(s=>s\.getAll\(\)\)\)\.filter\(r=>r\.family===A\.family\);status\(rows\.length\?'Há '\+rows\.length\+[^\n]*?(?=\};\}catch\(e\))/;
    altered=altered.replace(oldStartup,`try{
 const rows=(await request(s=>s.getAll())).filter(r=>r.family===A.family).sort((a,b)=>b.at.localeCompare(a.at));
 if(recoveryEdited||dirty||document.querySelector('#bpf-editor,#teamModal18,#recoveryModal')){
  status('Cópia automática disponível. Use Recuperar preenchimento para abrir outra inspeção.');
  return;
 }
 const latest=rows[0];
 if(!latest){
  baseline=JSON.stringify(A.snapshot());
  status('Cópia automática disponível neste aparelho.');
  return;
 }
 paused=true;
 await A.restore(latest.body);
 baseline=JSON.stringify(A.snapshot());
 dirty=false;
 const message='Inspeção retomada: '+latest.label+' · cópia de '+new Date(latest.at).toLocaleString('pt-BR')+'.';
 status(message);
 document.querySelector('#status').textContent=message;
}catch(e){
 status('Não foi possível retomar a inspeção automaticamente. Use Recuperar preenchimento ou abra seu JSON.');
}finally{
 paused=false;
 recoveryStarting=false;
 if(recoveryEdited){
  clearTimeout(recoveryTimer);
  recoveryTimer=setTimeout(()=>checkpoint(),3000);
 }
}`);
    altered=altered.replace("window.GuiaRecovery={checkpoint,list,get failed()",
      "window.GuiaRecovery={checkpoint,list,schedule:scheduleRecovery18,get failed()");
  }
  const samplingTag='<script defer src="./bpf-amostragem-4104.js?v=20261113-amostragem-4104"></script>';
  if(!altered.includes('bpf-amostragem-4104.js'))altered=altered.replace(/<\/body\s*>/i,samplingTag+'</body>');
  const headers=new Headers(response.headers);
  headers.delete('content-length');headers.delete('content-encoding');headers.delete('etag');
  headers.set('content-type','text/html; charset=utf-8');
  return new Response(altered,{status:response.status,statusText:response.statusText,headers});
}
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE.map(path=>new Request(new URL(path,ROOT),{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('guia18-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 event.respondWith((async()=>{
  try{
   const isHtml=req.mode==='navigate'||IS_GUIDE(url)||url.pathname===ROOT.pathname||url.pathname.endsWith('/index.html');
   const response=await fetch(req,isHtml?{cache:'reload'}:undefined);
   const page=await attachFriendlyMenu(response,url);
   if(page.ok){const copy=page.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)));}
   return page;
  }catch(e){
   const cached=await caches.match(req,{ignoreSearch:true});
   return cached?attachFriendlyMenu(cached,url):Response.error();
  }
 })());
});
