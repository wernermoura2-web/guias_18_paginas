from pathlib import Path

def patch(source):
    def change(old,new):
        nonlocal source
        assert source.count(old)==1,old[:130]
        source=source.replace(old,new)
    if 'Revestimento do piso' in source:
        return source
    change("""function bpfSplitF1(row){return row.code==='4.3.3'||row.code==='4.6.4';}
function bpfPrewashChecks(scope){
 return [
  '1) Remoção do rótulo',
  '2) Remoção dos resíduos da substância adesiva',
  '3) Remoção das sujidades da superfície interna',
  '4) Remoção das sujidades da superfície externa'
 ].map((option,i)=>({scope,index:0,phrase:scope.phrases[0],option,name:bpfPhraseName(scope,0)+'_PreLavagem_'+(i+1)}));
}""", """function bpfSplitF1(row,panel){return panel.id===0&&(row.code==='4.3.3'||bpfDetailedF1(row,panel));}
function bpfDetailedF1(row,panel){return panel.id===0&&['4.6.4','4.7.2'].includes(row.code);}
function bpfF1Checks(row,scope){
 const prewash=row.code==='4.6.4';
 const options=prewash?[
  '1) Remoção do rótulo',
  '2) Remoção dos resíduos da substância adesiva',
  '3) Remoção das sujidades da superfície interna',
  '4) Remoção das sujidades da superfície externa'
 ]:[
  '1) Revestimento do piso',
  '2) Revestimento da parede',
  '3) Revestimento do teto',
  '4) Revestimento da porta',
  '5) Dispositivo de fechamento automático da porta',
  '6) Ajuste da porta aos batentes',
  '7) Estado de conservação da porta'
 ];
 return options.map((option,i)=>({scope,index:0,phrase:scope.phrases[0],option,name:bpfPhraseName(scope,0)+(prewash?'_PreLavagem_':'_SalaEnvase_')+(i+1)}));
}""")
    change(" if(row.code!=='4.6.4')return panel.entries;", " if(!bpfDetailedF1(row,panel))return panel.entries;")
    change(" if(row.code==='4.6.4')return [{id:0,label:'F1 — Pré-lavagem',composite:true,entries:row.scopes.flatMap(bpfPrewashChecks)}];\n","")
    change(""" return parts.map((part,id)=>({
   ...part,id,
   entries:row.scopes.flatMap(scope=>part.indices.filter(i=>i<scope.phrases.length).map(i=>({scope,index:i,phrase:scope.phrases[i],name:bpfPhraseName(scope,i)})))
 }));""",""" return parts.map((part,id)=>{
  if(bpfDetailedF1(row,{id}))return {
   id,label:row.code==='4.6.4'?'F1 — Pré-lavagem':'F1 — Revestimentos e porta da sala de envase',
   composite:true,entries:row.scopes.flatMap(scope=>bpfF1Checks(row,scope))
  };
  return {
   ...part,id,
   entries:row.scopes.flatMap(scope=>part.indices.filter(i=>i<scope.phrases.length).map(i=>({scope,index:i,phrase:scope.phrases[i],name:bpfPhraseName(scope,i)})))
  };
 });""")
    change(""" for(const page of BPF_PHRASES)for(const row of page.rows){
  if(row.code!=='4.6.4')continue;
  for(const scope of row.scopes)for(const {name,option} of bpfPrewashChecks(scope)){
   data.fields[name]={name,type:'/Ch',flags:0,label:row.code+' F1 — '+option,options:['','1','0'],calc:'',phrasePage:page.page};
  }
 }
 for(const page of BPF_PHRASES)for(const row of page.rows)for(const panel of bpfPanels(page,row))for(const [answer,label] of [['1','OBS'],['0','NC']]){
   const key=bpfGroupNoteName(page,row,panel,answer);
   data.fields[key]={name:key,type:'/Tx',flags:4096,label:row.code+' '+panel.label+' '+label,options:[],calc:'',phrasePage:page.page};
 }""",""" for(const page of BPF_PHRASES)for(const row of page.rows)for(const panel of bpfPanels(page,row)){
  if(bpfDetailedF1(row,panel))for(const {name,option} of panel.entries){
   data.fields[name]={name,type:'/Ch',flags:0,label:row.code+' F1 — '+option,options:['','1','0'],calc:'',phrasePage:page.page};
  }
  for(const [answer,label] of [['1','OBS'],['0','NC']]){
   const key=bpfGroupNoteName(page,row,panel,answer);
   data.fields[key]={name:key,type:'/Tx',flags:4096,label:row.code+' '+panel.label+' '+label,options:[],calc:'',phrasePage:page.page};
  }
 }""")
    source=source.replace("bpfSplitF1(row)?","bpfSplitF1(row,panel)?")
    change("row.code!=='4.6.4'||values[bpfPhraseName(e.scope,0)]===answer","!bpfDetailedF1(row,panel)||values[bpfPhraseName(e.scope,0)]===answer")
    change(" if(row.code==='4.6.4')return e.option;", " if(e.option)return e.option;")
    change("if(!panel.composite||row.code==='4.6.4'){","if(!panel.composite||bpfDetailedF1(row,panel)){")
    change("if(panel.composite&&row.code!=='4.6.4'){","if(panel.composite&&!bpfDetailedF1(row,panel)){")
    change("  if(row.code==='4.6.4'){\n   const legacy=", "  if(bpfDetailedF1(row,panel)){\n   const legacy=")
    change("     if(row.code==='4.6.4'){\n      const assessed=", "     if(bpfDetailedF1(row,panel)){\n      const assessed=")
    change("if(row.code==='4.6.4'&&v!==values[bpfPhraseName(e.scope,0)])continue;", "if(bpfDetailedF1(row,panel)&&v!==values[bpfPhraseName(e.scope,0)])continue;")
    change("""  if(bpfSplitF1(row)){
   const panel=bpfPanels(page,row)[0];""", """  const firstPanel={id:0};
  if(bpfSplitF1(row,firstPanel)){
   const panel=bpfPanels(page,row)[0];""")
    change("""    result.push({page,row,grouped:true,panel,entries,answer,note});
   }
   continue;""", """    result.push({page,row,grouped:true,panel,entries,answer,note});
   }
   if(row.phrases.length===1||row.code==='4.3.3')continue;""")
    change("""  row.phrases.forEach((phrase,i)=>{
   const records=""","""  row.phrases.forEach((phrase,i)=>{
   if(i===0&&bpfDetailedF1(row,firstPanel))return;
   const records=""")
    change("(row.code==='4.6.4'?1:e.index+1)","(e.index+1)")
    return source

for name in ('equipe.html','individual.html'):
    path=Path(name)
    path.write_text(patch(path.read_text(encoding='utf-8')),encoding='utf-8')
for name in ('index.html','revisao-frases.html','sw-guia18.js'):
    path=Path(name)
    path.write_text(path.read_text().replace('20261107-envase-pop-v27','20261107-sala-envase-v28').replace('guia18-envase-pop-20261107-v27','guia18-sala-envase-20261107-v28'))
