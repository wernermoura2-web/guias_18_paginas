from pathlib import Path
import json,re

SLOPE='O piso deve possuir inclinação suficiente para facilitar o escoamento de água.'

def patch(source):
    def change(old,new):
        nonlocal source
        assert source.count(old)==1,old[:130]
        source=source.replace(old,new)
    if 'function bpfSplitPanel(' in source:
        return source
    for match in reversed(list(re.finditer(r'\{"code":"4\.7\.4",',source))):
        row,n=json.JSONDecoder().raw_decode(source[match.start():])
        for phrases in [row['phrases'],*(scope['phrases'] for scope in row['scopes'])]:
            original=phrases[0]
            assert original['text'].endswith(' '+SLOPE)
            phrases.append({**original,'text':SLOPE})
            original['text']=original['text'].removesuffix(' '+SLOPE)
            original['guidance']='Verificar as medidas adotadas na sala de envase para minimizar o risco de contaminação.'
            original['revision']='salaenvase29'
        source=source[:match.start()]+json.dumps(row,ensure_ascii=False,separators=(',',':'))+source[match.start()+n:]
    change("function bpfSplitF1(row,panel){return panel.id===0&&(row.code==='4.3.3'||bpfDetailedF1(row,panel));}",
           """function bpfSplitPanel(row,panel){
 return bpfDetailedF1(row,panel)||(row.code==='4.3.3'&&panel.id===0)||(row.code==='4.7.4'&&panel.id===1);
}""")
    source=source.replace('bpfSplitF1(row,panel)','bpfSplitPanel(row,panel)')
    change(""" else if(row.code==='4.10.2')parts=[""", """ else if(row.code==='4.7.4')parts=[
  {label:'F1',indices:[0],composite:false},
  {label:'F2 — Piso, ralo, luminárias e ventilação',indices:[4,1,2,3],composite:true,revision:'salaenvase29'}
 ];
 else if(row.code==='4.10.2')parts=[""")
    change("map(i=>({scope,index:i,phrase:scope.phrases[i],name:bpfPhraseName(scope,i)})))",
           "map((i)=>({scope,index:i,phrase:scope.phrases[i],name:bpfPhraseName(scope,i),option:row.code==='4.7.4'&&id===1?(part.indices.indexOf(i)+1)+') '+scope.phrases[i].text:undefined})))")
    change("index:i,label:'F'+(i+1),scopes:", "index:i,label:row.code==='4.7.4'&&i>0?'F2 — Opção '+(i===4?1:i+1):'F'+(i+1),scopes:")
    change("const revision=panel.entries[0]?.phrase.revision;", "const revision=panel.revision||panel.entries[0]?.phrase.revision;")
    change("+'_G'+(panel.id+1)+'_'+(answer==='1'?'OBS':'NC');", "+'_G'+(panel.id+1)+(panel.revision?'_'+panel.revision:'')+'_'+(answer==='1'?'OBS':'NC');")
    change("""  if(!panel.composite||bpfDetailedF1(row,panel)){
   const e=panel.entries[0];if(e){const p=document.createElement('p');p.className='bpf-group-description';p.textContent=e.phrase.text;card.append(p);}
  }
  const guidanceEntries=[...new Map(panel.entries.filter(e=>e.phrase.guidance).map(e=>[e.index,e])).values()];""", """  const entry=panel.entries[0];
  const phrase=entry?.phrase||row.phrases[panel.indices?.[0]??panel.id];
  if(phrase&&(!panel.composite||bpfDetailedF1(row,panel))){
   const p=document.createElement('p');p.className='bpf-group-description';p.textContent=phrase.text;card.append(p);
  }
  const guidanceEntries=entry?[...new Map(panel.entries.filter(e=>e.phrase.guidance).map(e=>[e.index,e])).values()]:
   (phrase?.guidance?[{index:panel.id,phrase}]:[]);""")
    change("p.textContent='F'+(e.index+1)+': '+e.phrase.guidance;details.append(p);",
           "p.textContent=(e.option||'F'+(e.index+1))+': '+e.phrase.guidance;details.append(p);")
    change("  const grid=document.createElement('div');grid.className='bpf-answer-grid';card.append(grid);", """  if(!entry){content.append(card);continue;}
  const grid=document.createElement('div');grid.className='bpf-answer-grid';card.append(grid);""")
    change("bpfSplitPanel(row,panel)?'F1 — '+heading:heading", "bpfSplitPanel(row,panel)?'F'+(panel.id+1)+' — '+heading:heading")
    change("     if(row.code==='4.3.3'&&!entry.scope.phrases.some", """     if(row.code==='4.7.4'&&panel.id===1){
      const checks=panel.entries.filter(e=>e.scope===entry.scope);
      if(!checks.some(e=>['1','0'].includes(values[e.name])))for(const e of checks){
       values[e.name]='';values[bpfNoteName(e.scope,e.index)]='';
      }
     }
     if(row.code==='4.3.3'&&!entry.scope.phrases.some""")
    change("""    const missing=scope.phrases.map((_,i)=>values[bpfPhraseName(scope,i)]?null:'F'+(i+1)).filter(Boolean);""",
           """    const missing=row.code==='4.7.4'?
     panels.filter(panel=>!panel.entries.some(e=>e.scope===scope&&['1','0'].includes(values[e.name]))).map(panel=>'F'+(panel.id+1)):
     scope.phrases.map((_,i)=>values[bpfPhraseName(scope,i)]?null:'F'+(i+1)).filter(Boolean);""")
    change("""  // Mantém os campos individuais internos para cálculos, JSON antigo e Anexo F.
  for(const panel of panels)""", """  if(row.code==='4.7.4')for(const scope of row.scopes){
   const checks=panels[1].entries.filter(e=>e.scope===scope);
   if(checks.some(e=>['1','0'].includes(values[e.name])))for(const e of checks)if(!values[e.name])values[e.name]='2';
  }
  // Mantém os campos individuais internos para cálculos, JSON antigo e Anexo F.
  for(const panel of panels)""")
    change("""  const firstPanel={id:0};
  if(bpfSplitF1(row,firstPanel)){
   const panel=bpfPanels(page,row)[0];""", """  const groupedPanels=bpfPanels(page,row).filter(panel=>bpfSplitPanel(row,panel));
  for(const panel of groupedPanels){""")
    change("   if(row.phrases.length===1||row.code==='4.3.3')continue;\n  }", "  }\n  if(row.code==='4.3.3')continue;")
    change("if(i===0&&bpfDetailedF1(row,firstPanel))return;", "if(groupedPanels.some(panel=>panel.entries.some(e=>e.index===i)))return;")
    change("+' / F'+(e.index+1),answer==='1'?'Sim':'Não',bpfUnifiedOption(row,e)", "+' / F'+(e.option?panel.id+1:e.index+1),answer==='1'?'Sim':'Não',bpfUnifiedOption(row,e)")
    return source

for name in ('equipe.html','individual.html'):
    path=Path(name)
    path.write_text(patch(path.read_text(encoding='utf-8')),encoding='utf-8')
for name in ('index.html','revisao-frases.html','sw-guia18.js'):
    path=Path(name)
    path.write_text(path.read_text().replace('20261107-sala-envase-v28','20261107-estrutura-envase-v29').replace('guia18-sala-envase-20261107-v28','guia18-estrutura-envase-20261107-v29'))
