from pathlib import Path

def patch(s):
    def change(old,new):
        nonlocal s
        assert s.count(old)==1,old[:100]
        s=s.replace(old,new)
    if "'UniformesEnvase'" in s:
        return s
    change("['4.6.4','4.7.2'].includes(row.code)", "['4.6.4','4.7.2','4.7.6'].includes(row.code)")
    change(" const prewash=row.code==='4.6.4';\n const options=prewash?[", """ const prewash=row.code==='4.6.4';
 const uniforms=row.code==='4.7.6';
 const options=uniforms?[
  '1) Utilizar uniformes limpos',
  '2) Trocar os uniformes diariamente',
  '3) Utilizar uniformes de uso exclusivo para essa área'
 ]:prewash?[""")
    change(" return options.map((option,i)=>({scope,index:0,phrase:scope.phrases[0],option,name:bpfPhraseName(scope,0)+(prewash?'_PreLavagem_':'_SalaEnvase_')+(i+1)}));",
           """ const suffix=uniforms?'UniformesEnvase':prewash?'PreLavagem':'SalaEnvase';
 return options.map((option,i)=>({scope,index:0,phrase:scope.phrases[0],option,name:bpfPhraseName(scope,0)+'_'+suffix+'_'+(i+1)}));""")
    change("id,label:row.code==='4.6.4'?'F1 — Pré-lavagem':'F1 — Revestimentos e porta da sala de envase',",
           "id,label:({'4.6.4':'F1 — Pré-lavagem','4.7.2':'F1 — Revestimentos e porta da sala de envase','4.7.6':'F1 — Uniformes da sala de envase'})[row.code],")
    change("  for(const row of data.rows){const bounds=BPF_ITEM_CELLS", """  for(const row of data.rows){
   if(data.page===9&&row.code==='4.7.3')continue;
   const bounds=BPF_ITEM_CELLS""")
    return s

for name in ('equipe.html','individual.html'):
    path=Path(name)
    path.write_text(patch(path.read_text(encoding='utf-8')),encoding='utf-8')
for name in ('index.html','revisao-frases.html','sw-guia18.js'):
    path=Path(name)
    path.write_text(path.read_text().replace('20261107-antesala-v31','20261107-uniformes-v32').replace('guia18-antesala-20261107-v31','guia18-uniformes-20261107-v32'))
