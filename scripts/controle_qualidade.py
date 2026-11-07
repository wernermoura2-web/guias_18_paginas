from pathlib import Path
import json,re

PARAMS=['Coliformes totais','Escherichia coli','Enterococos','Pseudomonas aeruginosa','Esporos de clostrídios sulfito redutores','Esporos de Clostridium perfringens','Bactérias heterotróficas']
NEW=[('captação',2),('captação',3),('captação',4),('captação',5),('reservatório',2),('reservatório',4),('reservatório',5)]

def patch(s):
    def change(a,b):
        nonlocal s
        assert s.count(a)==1,(a[:100],s.count(a))
        s=s.replace(a,b)
    if 'function bpfCQFrequencyKey(' in s:return s
    match=re.search(r'\{"code":"4\.10\.3",',s)
    row,n=json.JSONDecoder().raw_decode(s[match.start():])
    for phrases in [row['phrases'],*(x['phrases'] for x in row['scopes'])]:
        for i,p in enumerate(phrases[:14]):
            p['option']=PARAMS[([0,1,6,0,1,3,6][i-7] if i>=7 else i)]
        for i,(location,index) in enumerate(NEW):
            p={'text':f"Verificar a análise de {PARAMS[index]} {'na' if location=='captação' else 'no'} {location}.",'guidance':'Conferir os registros e indicar a frequência observada para este parâmetro.','appcc':'PC','allowNA':False,'option':PARAMS[index],'fieldSuffix':f'CQ_{i+1}'}
            if i==0:phrases[14]=p
            else:phrases.append(p)
    s=s[:match.start()]+json.dumps(row,ensure_ascii=False,separators=(',',':'))+s[match.start()+n:]
    change("label:bpfGroupedF2(row)&&i>0?", "label:row.code==='4.10.2'&&i===2?'F2 — Contrato de terceirização':row.code==='4.10.3'?bpfCQReviewLabel(row,i):bpfGroupedF2(row)&&i>0?")
    change("  {label:'F3 — Contrato de terceirização',indices:[2],composite:false}", "  {label:'F2 — Contrato de terceirização',indices:[2],composite:false,allowNA:true}")
    change("""   {label:'F2 — Captação',indices:range(7,9),composite:true},
   {label:'F3 — Reservatório',indices:range(10,13),composite:true},
   {label:'F4 — Análise físico-química anual (RDC 717/2022)',indices:[14],composite:true},
   {label:'F5 — Cinco análises mensais terceirizadas de um lote envasado',indices:[15],composite:true},
   {label:'F6 — Cinco unidades analisadas de todos os lotes envasados',indices:[16],composite:true}""", """   {label:'F2 — Captação',indices:[7,8,14,17,18,19,9],composite:true,frequency:true},
   {label:'F3 — Reservatório',indices:[10,11,20,12,21,22,13],composite:true,frequency:true},
   {label:'F5 — Cinco análises mensais terceirizadas de um lote envasado',indices:[15],composite:true,storageId:4},
   {label:'F6 — Cinco unidades analisadas de todos os lotes envasados',indices:[16],composite:true,storageId:5}""")
    change("const a=scope.phrases.map((f,i)=>v[bpfPhraseName(scope,i)]||'');", "const a=scope.phrases.flatMap((f,i)=>{const answer=v[bpfPhraseName(scope,i)]||'';return !answer&&f.fieldSuffix?.startsWith('CQ_')?[]:[answer];});")
    change("const label=grouped&&i>0?", "const label=row.code==='4.10.3'?bpfCQReviewLabel(row,i).slice(1):row.code==='4.10.2'&&i===2?'2':grouped&&i>0?")
    change("p.textContent='F'+(e.index+1)+' — '+e.phrase.text+' | Orientação: '", "p.textContent=(row.code==='4.10.3'?bpfCQReviewLabel(row,e.index):row.code==='4.10.2'?'F'+(panel.id+1):'F'+(e.index+1))+' — '+e.phrase.text+' | Orientação: '")
    change("function bpfGroupNoteName(page,row,panel,answer){", """function bpfCQReviewLabel(row,index){
 const panel=bpfPanels({page:11},row).find(p=>p.indices?.includes(index));
 if(!panel)return 'F'+(index+1);
 return panel.label.split(' — ')[0]+(panel.indices.length>1?' — '+row.phrases[index].option:'');
}
function bpfCQFrequencyKey(entry){return 'BPF_CQ_Frequencia_'+entry.name;}
function bpfCQOption(row,panel,entry){
 const option=bpfUnifiedOption(row,entry);
 const freq=panel.frequency?values[bpfCQFrequencyKey(entry)]:'';
 return ['Diário','Semanal','Outro'].includes(freq)?option+' — '+freq:option;
}
function bpfAnswerLabel(answer){return ({'1':'Sim','0':'Não','2':'NA'})[answer]||'';}
function bpfGroupNoteName(page,row,panel,answer){""")
    s=s.replace("(panel.id+1)+(revision?", "((panel.storageId??panel.id)+1)+(revision?")
    s=s.replace("code+'/'+(panel.id+1)", "code+'/'+((panel.storageId??panel.id)+1)")
    change("+'_G'+(panel.id+1)+(panel.revision?", "+'_G'+((panel.storageId??panel.id)+1)+(panel.revision?")
    change("+'_G'+(panel.id+1);", "+'_G'+((panel.storageId??panel.id)+1);")
    change(" if(e.option)return e.option;", " if(e.option||e.phrase.option)return e.option||e.phrase.option;")
    change(""" if(row.code==='4.10.3')return [
   'Coliformes totais','Escherichia coli','Enterococos',
   'Pseudomonas aeruginosa','Clostrídios sulfito redutores',
   'Clostridium perfringens','Bactérias heterotróficas',
   'Coliformes totais','Escherichia coli','Bactérias heterotróficas',
   'Coliformes totais','Escherichia coli','Pseudomonas aeruginosa','Bactérias heterotróficas',
   'Análise físico-química anual — RDC 717/2022',
   'Cinco análises mensais terceirizadas de um lote envasado',
   'Cinco unidades analisadas de todos os lotes envasados'
 ][e.index];""",""" if(row.code==='4.10.3')return e.index===15?'Cinco análises mensais terceirizadas de um lote envasado':'Cinco unidades analisadas de todos os lotes envasados';""")
    change("""  for(const panel of bpfPanels(page,row)){
   for(const [kind,label]""","""  for(const panel of bpfPanels(page,row)){
   if(panel.frequency)for(const entry of panel.entries){
    const name=bpfCQFrequencyKey(entry);
    data.fields[name]={name,type:'/Tx',flags:0,label:'Frequência — '+entry.phrase.option,options:[],calc:'',phrasePage:page.page};
   }
   for(const [kind,label]""")
    change(" if(raw==='1'||raw==='0')return raw;", " if(raw==='1'||raw==='0'||(raw==='2'&&panel.allowNA))return raw;")
    change("return panel.entries.filter(e=>['1','0'].includes(values[e.name])).map", "return panel.entries.filter(e=>['1','0'].includes(values[e.name])||(panel.allowNA&&values[e.name]==='2')).map")
    change(" const answers=[...new Set(panel.entries.filter(e=>['1','0'].includes(values[e.name])).map(e=>values[e.name]))];", " const answers=[...new Set(panel.entries.map(e=>values[e.name]).filter(a=>['1','0'].includes(a)||(a==='2'&&panel.allowNA)))];")
    change(""" if(!['1','0'].includes(answer))return;
 const note=String(values[bpfGroupNoteName(page,row,panel,answer)]||'').trim();""",""" if(!bpfAnswerLabel(answer))return;
 const note=answer==='2'?'':String(values[bpfGroupNoteName(page,row,panel,answer)]||'').trim();""")
    assert s.count("if(!['1','0'].includes(answer)||!selected.size)continue;")==2
    s=s.replace("if(!['1','0'].includes(answer)||!selected.size)continue;", "if(!bpfAnswerLabel(answer)||!selected.size)continue;")
    s=s.replace("const note=String(values[bpfGroupNoteName(page,row,panel,answer)]||'').replace", "const note=String(answer==='2'?'':values[bpfGroupNoteName(page,row,panel,answer)]||'').replace")
    change("bpfScopeLabel(page,e.scope)+': ':'')+bpfUnifiedOption(row,e));","bpfScopeLabel(page,e.scope)+': ':'')+bpfCQOption(row,panel,e));")
    s=s.replace("(answer==='1'?'Sim':'Não')","bpfAnswerLabel(answer)")
    change("  for(const [key,label]of [['1','Sim'],['0','Não']]){","  const choices=[['1','Sim'],['0','Não']];if(panel.allowNA)choices.push(['2','NA']);\n  for(const [key,label]of choices){")
    change("   area.disabled=!answer;\n   area.dataset.note=answer?bpfGroupNoteName", "   area.disabled=!answer||answer==='2';\n   area.dataset.note=!area.disabled?bpfGroupNoteName")
    change("   area.value=answer?String(values[area.dataset.note]||''):'';", "   area.value=area.dataset.note?String(values[area.dataset.note]||''):'';")
    change("area.oninput=()=>{if(!answer)return;", "area.oninput=()=>{if(!answer||answer==='2')return;")
    change("   line.append(checkbox,caption);\n   if(bpfUnifiedIsOther", """   line.append(checkbox,caption);
   if(panel.frequency){
    const frequency=document.createElement('select');
    const key=bpfCQFrequencyKey(e);
    frequency.setAttribute('aria-label','Frequência — '+bpfUnifiedOption(row,e));
    for(const value of ['','Diário','Semanal','Outro']){
     const option=document.createElement('option');option.value=value;option.textContent=value||'Frequência';frequency.append(option);
    }
    frequency.value=values[key]||'';
    frequency.onchange=()=>{values[key]=frequency.value;changed();};
    const controls=document.createElement('div');controls.append(line,frequency);checkArea.append(controls);
    continue;
   }
   if(bpfUnifiedIsOther""")
    change("   ?'Escolha Sim ou Não para esta verificação e registre a observação correspondente.'", "   ?(panel.allowNA?'Escolha Sim, Não ou NA para esta verificação.':'Escolha Sim ou Não para esta verificação e registre a observação correspondente.')")
    change("   if(!selected.length||!['1','0'].includes(answer)){", "   if(!selected.length||!bpfAnswerLabel(answer)){")
    change("const scopeText=panel.composite&&row.scopes.length===1?'':bpfScopeLabel(page,entry.scope)+(panel.composite?' — ':'');", "const scopeText=page.page===11&&!panel.composite?bpfAnswerLabel(answer):panel.composite&&row.scopes.length===1?'':bpfScopeLabel(page,entry.scope)+(panel.composite?' — ':'');")
    change("const units=selected.map(e=>bpfSplitPanel", "const units=page.page===11?[]:selected.map(e=>bpfSplitPanel")
    change("entries.push(panel.label+' — '+label+' ('+units.join(', ')+')'+", "entries.push(panel.label+' — '+label+(units.length?' ('+units.join(', ')+')':'')+")
    change("const note=String(values[bpfGroupNoteName(page,row,panel,answer)]||'').trim();\n    const other=", "const note=answer==='2'?'':String(values[bpfGroupNoteName(page,row,panel,answer)]||'').trim();\n    const other=")
    change("answer==='1'?'Sim':'Não',bpfUnifiedOption(row,e)", "bpfAnswerLabel(answer),bpfCQOption(row,panel,e)")
    change("if(/^BPF_FGroup(?:Note|Choice|Selected|Other)_/.test(name))state[name]=value;", "if(/^BPF_FGroup(?:Note|Choice|Selected|Other)_|^BPF_CQ_Frequencia_/.test(name))state[name]=value;")
    change("if(answer==='1'&&!note&&!other)continue;", "if(answer==='1'&&!note&&!other&&!panel.frequency)continue;")
    change("   for(const inp of checkArea.querySelectorAll('input[type=text]'))inp.disabled=true;", """   for(const inp of checkArea.querySelectorAll('input[type=text]'))inp.disabled=true;
   if(panel.frequency){
    for(const e of panel.entries)values[bpfCQFrequencyKey(e)]='';
    for(const select of checkArea.querySelectorAll('select'))select.value='';
   }""")
    return s

for name in ('equipe.html','individual.html'):
    path=Path(name)
    path.write_text(patch(path.read_text(encoding='utf-8')),encoding='utf-8')
for name in ('index.html','revisao-frases.html','sw-guia18.js'):
    path=Path(name)
    path.write_text(path.read_text().replace('20261107-uniformes-v32','20261107-controle-qualidade-v33').replace('guia18-uniformes-20261107-v32','guia18-controle-qualidade-20261107-v33'))
