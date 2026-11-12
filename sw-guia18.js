/* Guia BPF: interface amigável e cache offline (06/11/2026). */
const CACHE='guia18-20261112-paginacao-v113-1';
const ROOT=new URL('./',self.location.href);
const CORE=['./','./index.html','./manifest.webmanifest','./icon-bpf-appcc-192.png','./icon-bpf-appcc-512.png','./interface-guia-amigavel.js','./revisao-frases.html','./abrir-guia-corrigido.html','./revisao-orientacoes-apoio.js','./bpf-revisao-frases-ativa-20261107.js','./bpf-substituicao-campos-20261108.js','./bpf-f1-correcao-direta-20261108.js','./revisao-orientacoes-20261107.json','./bpf-f1-opcoes-visiveis.js','./individual_atualizado.html','./equipe_atualizado.html','./bpf-etiquetas-appcc-20261108.js','./bpf-correcao-f-pdf-v72.js','./bpf-fotos-somente-nc-20261109.js','./bpf-obs-livres-sem-prefixo-sim-20261109.js','./bpf-pcc-rotulos-risco-20261109.js','./bpf-impressao-unicode-compat-20261109.js','./bpf-cq-continuacao-20261109.js'];
const IS_GUIDE=url=>/\/(?:equipe|individual)(?:_atualizado)?\.html$/i.test(url.pathname);
async function attachFriendlyMenu(response,url){
  if(!IS_GUIDE(url)||!response||!response.ok)return response;
  const original=await response.text();
  const tag='<script src="./interface-guia-amigavel.js?v=20261107-identidade-f21" defer></script>';
  let altered=(original.includes('interface-guia-amigavel.js')?original:original.replace(/<\/body\s*>/i,tag+'</body>')).replace(/interface-guia-amigavel\.js(?:\?v=[^\"'<> ]*)?/g,'interface-guia-amigavel.js?v=20261112-paginacao-v113');
  // Carregar revisão dos F antes do script que constrói os campos e as respostas.
  const anchor='</script><script>/* Shared by the browser forms and Acrobat.';
  const active='<script src="./bpf-revisao-frases-ativa-20261107.js?v=20261108-f1-nativo-v58"></script>';
  if(!altered.includes('bpf-revisao-frases-ativa-20261107.js')){
    altered=altered.includes(anchor)
      ?altered.replace(anchor,'</script>'+active+'<script>/* Shared by the browser forms and Acrobat.')
      :altered.replace(/<\/body\s*>/i,active+'</body>');
  }
  altered=altered.replace(/bpf-revisao-frases-ativa-20261107\.js(?:\?v=[^"'<> ]*)?/g,'bpf-revisao-frases-ativa-20261107.js?v=20261108-F1-subcriterios-restaurados-v59');
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
  const photoTag='<script defer src="./bpf-fotos-somente-nc-20261109.js?v=20261109-fotos-sim-nao-v90"></script>';
  if(!altered.includes('bpf-fotos-somente-nc-20261109.js'))altered=altered.replace(/<\/body\s*>/i,photoTag+'</body>');
  altered=altered.replace(/bpf-fotos-somente-nc-20261109\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-fotos-somente-nc-20261109.js?v=20261109-fotos-sim-nao-v90');

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
  const obsTag='<script defer src="./bpf-obs-livres-sem-prefixo-sim-20261109.js?v=20261112-paginacao-v113"></script>';
  if(!altered.includes('bpf-obs-livres-sem-prefixo-sim-20261109.js'))
    altered=altered.replace(/<\/body\s*>/i,obsTag+'</body>');
  altered=altered.replace(/bpf-obs-livres-sem-prefixo-sim-20261109\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-obs-livres-sem-prefixo-sim-20261109.js?v=20261112-paginacao-v113');
  // O cálculo original do guia foi preservado; retirar o interceptor de valores que impedia abertura.
  // Identificação visual explícita "ALTO - PCC" nas células de risco,
  // sem mudar o valor de cálculo dos campos de seleção.
  const pccTag='<script defer src="./bpf-pcc-rotulos-risco-20261109.js?v=20261112-paginacao-v113"></script>';
  if(!altered.includes('bpf-pcc-rotulos-risco-20261109.js'))
    altered=altered.replace(/<\/body\s*>/i,pccTag+'</body>');
  altered=altered.replace(/bpf-pcc-rotulos-risco-20261109\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-pcc-rotulos-risco-20261109.js?v=20261112-paginacao-v113');
  // Relatório de inspeção impresso: congelar os campos (inclusive SIM/NÃO)
  // e evitar recálculo posterior pelo Foxit ou outros leitores.
  // O botão de PDF EM BRANCO permanece independente e editável.
  const exportMarker='bpf-relatorio-final-estatico-v100';
  if(!altered.includes(exportMarker)){
    const helperText="/* bpf-relatorio-final-estatico-v100 */\n\n// BPF: exportação final (somente relatório impresso, nunca o modelo em branco).\nfunction bpfPrintPrepareRisk(){\n const map=[\n  {p:[0],u:{0:['Dropdown1','Dropdown2','Dropdown3','Dropdown4']},f:{0:'Dropdown5'},m:'Dropdown67',s:'Dropdown300'},\n  {p:[1],u:{1:['Dropdown6','Dropdown113','Dropdown8','Dropdown9']},f:{1:'Dropdown10'},m:'Dropdown66',s:'Dropdown301'},\n  {p:[2,3,4,5],u:{2:['Dropdown11','Dropdown12','Dropdown13','Dropdown14'],3:['Dropdown16','Dropdown17','Dropdown18','Dropdown19'],4:['Dropdown21','Dropdown22','Dropdown23','Dropdown24'],5:['Dropdown26','Dropdown27','Dropdown28','Dropdown29']},f:{2:'Dropdown15',3:'Dropdown20',4:'Dropdown25',5:'Dropdown30'},m:'Dropdown65',s:'Dropdown302'},\n  {p:[6],u:{6:['Dropdown31','Dropdown32','Dropdown33','Dropdown34']},f:{6:'Dropdown35'},m:'Dropdown64',s:'Dropdown303'},\n  {p:[7,8],u:{7:['Dropdown36','Dropdown37','Dropdown38','Dropdown39'],8:['Dropdown41','Dropdown42','Dropdown43','Dropdown44']},f:{7:'Dropdown40',8:'Dropdown45'},m:'Dropdown63',s:'Dropdown304'},\n  {p:[9,10],u:{9:['Dropdown46','Dropdown47','Dropdown48','Dropdown49'],10:['Dropdown51','Dropdown52','Dropdown53','Dropdown54']},f:{9:'Dropdown50',10:'Dropdown55'},m:'Dropdown61',s:'Dropdown305'},\n  {p:[11],u:{},f:{11:'Dropdown56'},m:'Dropdown60',s:'Dropdown306'},\n  {p:[12],u:{},f:{12:'Dropdown57'},m:'Dropdown62',s:'Dropdown307'}\n ];\n const failed=new Map();\n for(const page of BPF_PHRASES)for(const row of (page.rows||[]))for(const scope of (row.scopes||[])){\n  for(let i=0;i<(scope.phrases||[]).length;i++){\n   if(String(scope.phrases[i]?.appcc||'').toUpperCase()!=='PCC')continue;\n   if(String(values[bpfPhraseName(scope,i)]||'')!=='0')continue;\n   const col=Number(scope.col);if(!Number.isInteger(col)||col<1||col>4)continue;\n   if(!failed.has(page.page))failed.set(page.page,new Set());\n   failed.get(page.page).add(col);\n  }\n }\n const labels=[];\n for(const g of map){\n  let isPcc=false;\n  for(const p of g.p){\n   const cols=failed.get(p);if(!cols||!cols.size)continue;\n   isPcc=true;\n   for(const col of cols){\n    const unit=g.u[p]?.[col-1];\n    if(unit){values[unit]='ALTO';labels.push({page:p,name:unit});}\n   }\n   const final=g.f[p];\n   if(final){values[final]='ALTO';labels.push({page:p,name:final});}\n  }\n  if(isPcc){\n   values[g.m]='ALTO';values[g.s]='3';\n   labels.push({page:17,name:g.m});\n  }\n }\n const groups=['Dropdown60','Dropdown61','Dropdown62','Dropdown63','Dropdown64','Dropdown65','Dropdown66','Dropdown67'];\n const anyHigh=groups.some(field=>values[field]==='ALTO');\n if(anyHigh){\n  values.Dropdown58='ALTO';\n  values.Group279='2'; // Grupo 3 é a opção PDF de estado \"2\".\n }\n return labels;\n}\nfunction bpfPrintFinalizePdf(pdf,form,font,labels){\n // O campo BPF_State contém o JSON de recuperação (milhares de caracteres)\n // numa caixa invisível de 1 pt. Remover do relatório antes de achatar evita\n // demora ou falhas de aparência, sem perder as respostas já exibidas.\n const temporaryState=form.getFieldMaybe('BPF_State');\n if(temporaryState)form.removeField(temporaryState);\n // Transformar as respostas e imagens em elementos fixos da página.\n form.flatten({updateFieldAppearances:true});\n const ink=PDFLib.rgb(.64,.055,.09),background=PDFLib.rgb(.95,.97,.99);\n for(const {page,name} of labels){\n  const w=D.widgets.find(item=>item.page===page&&item.name===name);\n  if(!w||!w.rect)continue;\n  const docPage=pdf.getPage(page>=14?page+1:page);\n  const h=docPage.getHeight();\n  const delta=h-w.size[1];\n  const [x1,y1,x2,y2]=w.rect;\n  const width=x2-x1,height=y2-y1;\n  if(width<28||height<8)continue;\n  const text='ALTO - PCC';\n  const size=Math.min(8.5,Math.max(4.2,(width-5)/font.widthOfTextAtSize(text,1)));\n  // Corresponde à coordenada do widget, inclusive nas páginas ampliadas.\n  const top=w.size[1]-y2;\n  const y=h-top-height;\n  docPage.drawRectangle({x:x1+.35,y:y+.35,width:width-.7,height:height-.7,color:background});\n  docPage.drawText(text,{x:x1+(width-font.widthOfTextAtSize(text,size))/2,y:y+(height-size)/2+.8,size,font,color:ink});\n }\n const N=PDFLib.PDFName;\n for(const key of ['Names','OpenAction','AA','AcroForm'])pdf.catalog.delete(N.of(key));\n for(const page of pdf.getPages()){\n  page.node.delete(N.of('AA'));\n  const annotations=page.node.Annots();\n  if(!annotations)continue;\n  for(let i=annotations.size()-1;i>=0;i--){\n   if(!pdf.context.lookup(annotations.get(i)))annotations.remove(i);\n  }\n }\n}\n";
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
        '\n bpfPrintFinalizePdf(pdf,form,observationFont,bpfPrintPccLabels);\n'+beforeSave);
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
  // Corrigir o HTML fonte sem alterar as frases ou as respostas de outras linhas.
  // F1 de 4.5.8 aceita NA exclusivamente para garrafões retornáveis.
  const naF158="if((row.code==='4.5.8'&&entry.index===0)||";
  const naF158Fixed="if((row.code==='4.5.8'&&entry.index===0&&Number(entry.scope.col)!==1)||";
  altered=altered.replace(naF158,naF158Fixed);
  const naRender="if(answer==='2'&&!entry.phrase.allowNA&&values[entry.name]!=='2')continue;";
  altered=altered.replace(naRender,
    "if(answer==='2'&&!entry.phrase.allowNA&&values[entry.name]!=='2'&&!(row.code==='4.5.8'&&entry.index===0&&Number(entry.scope.col)===1))continue;");
  // Se F1 de retornáveis está NA, o item inteiro dessa coluna é NA na matriz.
  const agg="  if(!s.observationOnly&&(a!==null||cleared))v[s.name]=a??'Off';";
  altered=altered.replace(agg,
    "  if(!s.observationOnly&&(a!==null||cleared))v[s.name]=(r.code==='4.5.8'&&Number(s.col)===1&&v[bpfPhraseName(s,0)]==='2')?'2':(a??'Off');");
  // O número 1/2/3 deve refletir exatamente BAIXO/MÉDIO/ALTO de cada processo.
  const riskAnchor=" bpfOverridePCCRisk();\n const levels=";
  const riskText=" bpfOverridePCCRisk();\n for(const cfg of BPF_PCC_RISK_MAP){const grade=String(values[cfg.matrix]||'').toUpperCase();values[cfg.score]=grade.startsWith('ALTO')?'3':grade.startsWith('MÉDIO')||grade.startsWith('MEDIO')?'2':grade.startsWith('BAIXO')?'1':'';}\n const levels=";
  altered=altered.replace(riskAnchor,riskText);
  // Controle de Qualidade: botão opcional para transferir observações extensas
  // dos itens 4.10.1–4.10.6 para a página de continuação.
  const cqTransfer='<script defer src="./bpf-cq-continuacao-20261109.js?v=20261112-paginacao-v113"></script>';
  if(!altered.includes('bpf-cq-continuacao-20261109.js'))
    altered=altered.replace(/<\/body\s*>/i,cqTransfer+'</body>');
  altered=altered.replace(/bpf-cq-continuacao-20261109\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-cq-continuacao-20261109.js?v=20261112-paginacao-v113');
  // Complemento da impressão: proteger também o acesso direto aos formulários.
  const printUnicodeTag='<script defer src="./bpf-impressao-unicode-compat-20261109.js?v=20261112-paginacao-v113"></script>';
  if(!altered.includes('bpf-impressao-unicode-compat-20261109.js'))
    altered=altered.replace(/<\/body\s*>/i,printUnicodeTag+'</body>');
  altered=altered.replace(/bpf-impressao-unicode-compat-20261109\.js(?:\?v=[^"'<> ]*)?/g,
    'bpf-impressao-unicode-compat-20261109.js?v=20261112-paginacao-v113');
  // Item 4.5.8: NA no F1 de garrafoes retornaveis implica NA no item inteiro.
  // Preservar selecoes de descartaveis, rotulos e saneantes.
  const bpfNA458Guard="if((row.code==='4.5.8'&&entry.index===0)||(['4.3.6','4.6.12'].includes(row.code)&&entry.index===1))return false;";
  const bpfNA458Rule="if((row.code==='4.5.8'&&entry.index===0&&Number(entry.scope.col)!==1)||(['4.3.6','4.6.12'].includes(row.code)&&entry.index===1))return false;";
  const bpfNA458Dep="return !bpfNARequiresF1No(row,entry.index)||v[bpfPhraseName(entry.scope,0)]==='0';";
  const bpfNA458DepFix="return !bpfNARequiresF1No(row,entry.index)||v[bpfPhraseName(entry.scope,0)]==='0'||(row.code==='4.5.8'&&Number(entry.scope.col)===1&&v[bpfPhraseName(entry.scope,0)]==='2');";
  const bpfNA458Change="values[entry.name]=input.checked?answer:values[entry.name]===answer?'':values[entry.name];";
  const bpfNA458ChangeFix=bpfNA458Change+"\n     if(row.code==='4.5.8'&&page.page===6&&Number(entry.scope.col)===1&&entry.index===0){\n       const first=values[entry.name];\n       for(let j=1;j<entry.scope.phrases.length;j++){\n         const key=bpfPhraseName(entry.scope,j);\n         if(first==='2'){values[key]='2';values[bpfNoteName(entry.scope,j)]='';}\n         else if(values[key]==='2'){values[key]='';values[bpfNoteName(entry.scope,j)]='';}\n       }\n       if(first==='2')values[bpfNoteName(entry.scope,0)]='';\n     }";
  if(altered.includes(bpfNA458Guard)&&altered.includes(bpfNA458Dep)&&altered.includes(bpfNA458Change)){
    altered=altered.replace(bpfNA458Guard,bpfNA458Rule)
                   .replace(bpfNA458Dep,bpfNA458DepFix)
                   .replace(bpfNA458Change,bpfNA458ChangeFix);
    const na458Script='<script>/* 4.5.8 F1 NA - garrafoes retornaveis */\n'+
      '(function(){try{for(const p of BPF_PHRASES){if(p.page!==6)continue;'+
      'for(const r of p.rows){if(r.code!=="4.5.8")continue;'+
      'for(const s of r.scopes){if(Number(s.col)===1&&s.phrases[0])s.phrases[0].allowNA=true;}}}'+
      '}catch(e){console.warn("4.5.8 NA:",e);}})();</script>';
    altered=altered.replace(/<\/body\s*>/i,na458Script+'</body>');
  }else console.warn('4.5.8: trecho do formulario nao localizado; nenhuma alteracao NA aplicada.');
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
