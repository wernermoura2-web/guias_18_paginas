from pathlib import Path

def patch(source):
    def change(before, after):
        nonlocal source
        assert source.count(before) == 1, before[:100]
        source = source.replace(before, after)

    if 'function bpfPrewashChecks(' in source:
        return source
    change("function bpfPanels(page,row){", """function bpfSplitF1(row){return row.code==='4.3.3'||row.code==='4.6.4';}
function bpfPrewashChecks(scope){
 return [
  '1) Remoção do rótulo',
  '2) Remoção dos resíduos da substância adesiva',
  '3) Remoção das sujidades da superfície interna',
  '4) Remoção das sujidades da superfície externa'
 ].map((option,i)=>({scope,index:0,phrase:scope.phrases[0],option,name:bpfPhraseName(scope,0)+'_PreLavagem_'+(i+1)}));
}
function bpfPanelRecords(row,panel){
 if(row.code!=='4.6.4')return panel.entries;
 // Registros anteriores à divisão informam apenas o resultado geral do F1.
 const legacy=row.scopes.filter(scope=>!panel.entries.some(e=>e.scope===scope&&values[e.name])).map(scope=>({
  scope,index:0,phrase:scope.phrases[0],name:bpfPhraseName(scope,0),option:'Avaliação geral do F1 (registro anterior)'
 }));
 return [...panel.entries,...legacy];
}
function bpfPanels(page,row){
 if(row.code==='4.6.4')return [{id:0,label:'F1 — Pré-lavagem',composite:true,entries:row.scopes.flatMap(bpfPrewashChecks)}];""")
    change("""function bpfInitGroupFields(data){
 for(const page of BPF_PHRASES)""", """function bpfInitGroupFields(data){
 for(const page of BPF_PHRASES)for(const row of page.rows){
  if(row.code!=='4.6.4')continue;
  for(const scope of row.scopes)for(const {name,option} of bpfPrewashChecks(scope)){
   data.fields[name]={name,type:'/Ch',flags:0,label:row.code+' F1 — '+option,options:['','1','0'],calc:'',phrasePage:page.page};
  }
 }
 for(const page of BPF_PHRASES)""")
    change("const oldNotes=panel.entries.filter(e=>values[e.name]===answer)", "const oldNotes=bpfPanelRecords(row,panel).filter(e=>values[e.name]===answer&&(row.code!=='4.6.4'||values[bpfPhraseName(e.scope,0)]===answer))")
    change("const selected=panel.entries.filter(e=>values[e.name]===answer);", "const selected=bpfPanelRecords(row,panel).filter(e=>values[e.name]===answer);")
    change("const units=selected.map(e=>row.code==='4.3.3'?", "const units=selected.map(e=>bpfSplitF1(row)?")
    change("function bpfUnifiedOption(row,e){", "function bpfUnifiedOption(row,e){\n if(row.code==='4.6.4')return e.option;")
    change("if(!panel.composite){\n   const e=panel.entries[0];", "if(!panel.composite||row.code==='4.6.4'){\n   const e=panel.entries[0];")
    change("""  if(guidanceEntries.length){
   if(panel.composite){""","""  if(guidanceEntries.length){
   if(panel.composite&&row.code!=='4.6.4'){""")
    change("header.textContent=row.code==='4.3.3'?", "header.textContent=bpfSplitF1(row)?")
    change("const detail=row.code==='4.3.3'?", "const detail=bpfSplitF1(row)?")
    change("""     if(row.code==='4.3.3'&&!entry.scope.phrases.some""", """     if(row.code==='4.6.4'){
      const assessed=panel.entries.filter(e=>e.scope===entry.scope).map(e=>values[e.name]);
      const result=assessed.includes('0')?'0':assessed.includes('1')?'1':'';
      values[bpfPhraseName(entry.scope,0)]=result;
      if(!result){values[entry.scope.name]='Off';values[bpfNoteName(entry.scope,0)]='';}
     }
     if(row.code==='4.3.3'&&!entry.scope.phrases.some""")
    change("const noSelected=panel.entries.some(e=>values[e.name]==='0');", "const noSelected=bpfPanelRecords(row,panel).some(e=>values[e.name]==='0');")
    change("""  for(const panel of panels)for(const e of panel.entries){
   const v=values[e.name];""", """  for(const panel of panels)for(const e of bpfPanelRecords(row,panel)){
   const v=values[e.name];
   if(row.code==='4.6.4'&&v!==values[bpfPhraseName(e.scope,0)])continue;""")
    change("""  if(row.code==='4.3.3'){
   const panel=bpfPanels(page,row)[0];
   for(const answer of ['1','0']){
    const entries=panel.entries.filter""", """  if(bpfSplitF1(row)){
   const panel=bpfPanels(page,row)[0];
   for(const answer of ['1','0']){
    const entries=bpfPanelRecords(row,panel).filter""")
    change("""   table(entries.map(e=>[(row.scopes.length>1?bpfScopeLabel(source,e.scope):'Grupo')+' / F'+(e.index+1),""", """   table(entries.map(e=>[(row.scopes.length>1?bpfScopeLabel(source,e.scope):'Grupo')+' / F'+(row.code==='4.6.4'?1:e.index+1),""")
    # Show old general responses without assigning them to any of the four checks.
    change("""  const grid=document.createElement('div');grid.className='bpf-answer-grid';card.append(grid);""", """  if(row.code==='4.6.4'){
   const legacy=bpfPanelRecords(row,panel).filter(e=>e.name===bpfPhraseName(e.scope,0)&&['1','0'].includes(values[e.name]));
   if(legacy.length){
    const info=document.createElement('p');info.className='bpf-guidance';
    info.textContent='Avaliação geral já registrada: '+legacy.map(e=>bpfScopeLabel(page,e.scope)+' — '+(values[e.name]==='1'?'Sim':'Não')).join('; ')+'. Ao selecionar uma verificação, a avaliação da linha passa a usar as marcações detalhadas.';
    card.append(info);
   }
  }
  const grid=document.createElement('div');grid.className='bpf-answer-grid';card.append(grid);""")
    return source

for name in ('equipe.html','individual.html'):
    path=Path(name)
    path.write_text(patch(path.read_text(encoding='utf-8')),encoding='utf-8')
for name in ('index.html','revisao-frases.html','sw-guia18.js'):
    path=Path(name)
    path.write_text(path.read_text().replace('20261107-recepcao-v25','20261107-pre-lavagem-v26').replace('guia18-recepcao-20261107-v25','guia18-pre-lavagem-20261107-v26'))
