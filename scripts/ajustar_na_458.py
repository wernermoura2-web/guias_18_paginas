from pathlib import Path
import json
import re

def patch(text):
    if "['4.2.9','4.3.6','4.5.8']" in text:
        return text
    match = re.search(r'\{"code":"4\.5\.8",', text)
    assert match
    row, length = json.JSONDecoder().raw_decode(text[match.start():])
    assert sorted(int(scope['col']) for scope in row['scopes']) == [1,2,3]
    for phrases in [row['phrases'], *(scope['phrases'] for scope in row['scopes'])]:
        assert len(phrases) == 2
        phrases[0]['allowNA'] = False
        phrases[1]['allowNA'] = True
    text = text[:match.start()] + json.dumps(row, ensure_ascii=False, separators=(',', ':')) + text[match.start()+length:]
    old = """function bpfAllowsDependentNA(row,entry,v){
 return entry.index!==1||!['4.2.9','4.3.6'].includes(row.code)||v[bpfPhraseName(entry.scope,0)]==='0';
}
function bpfNormalizeDependentNA(row,scope,v){
 const key=bpfPhraseName(scope,1);
 if(v[key]!=='2'||bpfAllowsDependentNA(row,{scope,index:1},v))return false;
 v[key]='';v[bpfNoteName(scope,1)]='';
 return true;
}"""
    new = """function bpfNARequiresF1No(row,index){
 return index===1&&['4.2.9','4.3.6','4.5.8'].includes(row.code);
}
function bpfAllowsDependentNA(row,entry,v){
 if(row.code==='4.5.8'&&entry.index===0)return false;
 return !bpfNARequiresF1No(row,entry.index)||v[bpfPhraseName(entry.scope,0)]==='0';
}
function bpfNormalizeDependentNA(row,scope,v){
 let cleared=false;
 for(const index of (row.code==='4.5.8'?[0,1]:[1])){
  const key=bpfPhraseName(scope,index);
  if(v[key]!=='2'||bpfAllowsDependentNA(row,{scope,index},v))continue;
  v[key]='';v[bpfNoteName(scope,index)]='';
  cleared=true;
 }
 return cleared;
}"""
    assert text.count(old)==1
    text=text.replace(old,new)
    return text.replace("panel.id===1&&['4.2.9','4.3.6'].includes(row.code)", "bpfNARequiresF1No(row,panel.id)")

for name in ('equipe.html','individual.html'):
    path=Path(name)
    path.write_text(patch(path.read_text(encoding='utf-8')), encoding='utf-8')
for name in ('index.html','revisao-frases.html','sw-guia18.js'):
    path=Path(name)
    path.write_text(path.read_text().replace('20261107-respostas-v24','20261107-recepcao-v25').replace('guia18-respostas-20261107-v24','guia18-recepcao-20261107-v25'))
