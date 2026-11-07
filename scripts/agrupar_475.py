from pathlib import Path
import json,re

def patch(source):
    def change(old,new):
        nonlocal source
        assert source.count(old)==1,old[:130]
        source=source.replace(old,new)
    if 'function bpfGroupedF2(' in source:
        return source
    for match in reversed(list(re.finditer(r'\{"code":"4\.7\.5",',source))):
        row,n=json.JSONDecoder().raw_decode(source[match.start():])
        for phrases in [row['phrases'],*(s['phrases'] for s in row['scopes'])]:
            assert len(phrases)==5
            _,lavatory,soap,drying,_=phrases
            phrases[1]={**lavatory,'text':'Lavatório exclusivo para higiene das mãos.','guidance':'Verificar se o lavatório é de uso exclusivo para a higiene das mãos.','revision':'antesala30'}
            phrases[2]={**soap,'text':'Lavatório com sabonete líquido inodoro.','guidance':'Verificar disponibilidade, identificação e reposição do sabonete líquido inodoro.','revision':'antesala30'}
            phrases[3]={**drying,'text':'Sistema de secagem das mãos acionado sem contato manual.','revision':'antesala30'}
            phrases[4]={**lavatory,'text':'Lavatório com torneira acionada sem contato manual.','guidance':'Testar o acionamento da torneira sem contato manual.','fieldSuffix':'Torneira','revision':'antesala30'}
            phrases.append({**soap,'text':'Lavatório com produto antisséptico.','guidance':'Verificar disponibilidade, identificação e validade do produto antisséptico.','revision':'antesala30'})
        source=source[:match.start()]+json.dumps(row,ensure_ascii=False,separators=(',',':'))+source[match.start()+n:]
    change("function bpfPhraseName(scope,index){return 'BPF_F_'+scope.name+'_'+(index+1);}", "function bpfPhraseName(scope,index){return 'BPF_F_'+scope.name+'_'+(scope.phrases[index]?.fieldSuffix??index+1);}")
    change("function bpfNoteName(scope,index){return 'BPF_Obs_'+scope.name+'_'+(index+1);}", "function bpfNoteName(scope,index){return 'BPF_Obs_'+scope.name+'_'+(scope.phrases[index]?.fieldSuffix??index+1);}")
    change("label:row.code==='4.7.4'&&i>0?'F2 — Opção '+(i===4?1:i+1):'F'+(i+1),",
           "label:bpfGroupedF2(row)&&i>0?'F2 — Opção '+(bpfGroupedF2(row).indices.indexOf(i)+1):'F'+(i+1),")
    change("""function bpfSplitPanel(row,panel){
 return bpfDetailedF1(row,panel)||(row.code==='4.3.3'&&panel.id===0)||(row.code==='4.7.4'&&panel.id===1);
}""","""function bpfGroupedF2(row){
 if(row.code==='4.7.4')return {label:'F2 — Piso, ralo, luminárias e ventilação',indices:[4,1,2,3],composite:true,revision:'salaenvase29'};
 if(row.code==='4.7.5')return {label:'F2 — A antesala da sala de envase deve possuir:',indices:[1,4,2,5,3],composite:true,revision:'antesala30'};
}
function bpfSplitPanel(row,panel){
 return bpfDetailedF1(row,panel)||(row.code==='4.3.3'&&panel.id===0)||(panel.id===1&&!!bpfGroupedF2(row));
}""")
    change(""" else if(row.code==='4.7.4')parts=[
  {label:'F1',indices:[0],composite:false},
  {label:'F2 — Piso, ralo, luminárias e ventilação',indices:[4,1,2,3],composite:true,revision:'salaenvase29'}
 ];""",""" else if(bpfGroupedF2(row))parts=[{label:'F1',indices:[0],composite:false},bpfGroupedF2(row)];""")
    change("option:row.code==='4.7.4'&&id===1?", "option:bpfGroupedF2(row)&&id===1?")
    change("if(row.code==='4.7.4'&&panel.id===1){", "if(bpfGroupedF2(row)&&panel.id===1){")
    change("const missing=row.code==='4.7.4'?", "const missing=bpfGroupedF2(row)?")
    change("if(row.code==='4.7.4')for(const scope of row.scopes){", "if(bpfGroupedF2(row))for(const scope of row.scopes){")
    match=re.search(r'^const BPF_FILL_EXAMPLES=(.*);$',source,re.M)
    examples=json.loads(match[1]);examples.pop('4.7.5/5',None)
    change(match[0],'const BPF_FILL_EXAMPLES='+json.dumps(examples,ensure_ascii=False,separators=(',',':'))+';')
    return source

for name in ('equipe.html','individual.html'):
    path=Path(name)
    path.write_text(patch(path.read_text(encoding='utf-8')),encoding='utf-8')
for name in ('index.html','revisao-frases.html','sw-guia18.js'):
    path=Path(name)
    path.write_text(path.read_text().replace('20261107-classificacoes-v30','20261107-antesala-v31').replace('guia18-classificacoes-20261107-v30','guia18-antesala-20261107-v31'))
