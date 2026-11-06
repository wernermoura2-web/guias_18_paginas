#!/usr/bin/env python3
"""Agrupa a mesma OBS/NC por frase, avaliação e conteúdo no Anexo F do PDF.

Evita repetir 3 ou 4 vezes a mesma observação para várias captações,
reservatórios e linhas, sem apagar observações diferentes.
"""
from pathlib import Path
import re,subprocess,json

HELPER=r"""function bpfAnnexCompactRecords(source,index,records){
 const groups=new Map();
 for(const record of records){
  const answer=String(record.answer||'Sem resposta');
  const note=String(record.note||'').trim();
  // Unidades com mesma resposta e mesmo texto possuem UMA observação coletiva.
  // Mantém separadas as OBS/NC divergentes e as respostas Sim/Não/NA.
  const key=JSON.stringify([answer,note.replace(/\s+/g,' ')]);
  if(!groups.has(key))groups.set(key,{answer,note,units:[]});
  groups.get(key).units.push(bpfScopeLabel(source,record.scope));
 }
 return [...groups.values()].map(group=>[
  group.units.join(', ')+' / F'+(index+1),
  group.answer,
  group.note
 ]);
}
"""
for filename in ('individual.html','equipe.html'):
    path=Path(filename)
    html=path.read_text(encoding='utf-8')
    assert html.count('function bpfAnnexRows(){')==1,(filename,'annex missing')
    assert html.count('async function bpfAppendCompactAnnex(pdf){')==1,(filename,'renderer missing')
    old_count=html.count('function bpfAnnexCompactRecords(source,index,records){')
    if not old_count:
        html=html.replace('function bpfAnnexRows(){',HELPER+'\nfunction bpfAnnexRows(){',1)
    else:
        assert old_count==1,(filename,'duplicate compact helper')
    a=html.index('async function bpfAppendCompactAnnex(pdf){')
    b=html.index('</script>',a)
    annex=html[a:b]
    pattern=re.compile(r'table\(records\.map\(r=>\[[^\n]{0,800}\]\)\);')
    matches=list(pattern.finditer(annex))
    expected='table(bpfAnnexCompactRecords(source,index,records));'
    if len(matches)==1:
        print('FORMATO ANTERIOR',filename,matches[0].group(0))
        annex=pattern.sub(expected,annex,count=1)
        html=html[:a]+annex+html[b:]
    else:
        assert not matches and annex.count(expected)==1,(filename,'cannot locate records table',len(matches),annex[-1300:])
    assert html.count(expected)==1,(filename,'one compact call')
    assert html.count('function bpfAnnexCompactRecords(source,index,records){')==1
    assert html.count('async function bpfAppendCompactAnnex(pdf){')==1
    assert html.count('function bpfPdfGeneralSplit(full,font,form,pdf){')==1
    assert html.count('function bpfInspectorOpenReview(){')==1
    assert html.count("function bpfUnifiedRow(row){")==1
    pos=html.index('const BPF_PHRASES=')+len('const BPF_PHRASES=')
    pages,_=json.JSONDecoder().raw_decode(html[pos:])
    assert any(r['code']=='4.1.2' for pg in pages for r in pg['rows'])
    for token in ('function bpfAnnexCompactRecords(source,index,records){','async function bpfAppendCompactAnnex(pdf){'):
        x=html.index(token);start=html.rfind('<script',0,x);start=html.index('>',start)+1;end=html.index('</script>',x)
        check=subprocess.run(['node','--check'],input=html[start:end],capture_output=True,text=True)
        assert check.returncode==0,(filename,token,check.stderr[:1400])
    path.write_text(html,encoding='utf-8')
    print('VALIDADO',filename,'Anexo F com OBS/NC única para captações com a mesma resposta e observação; textos divergentes preservados.')

idx=Path('index.html')
html=idx.read_text(encoding='utf-8')
html,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"#]+(#[^"]*)?"',
    lambda m:'href="'+m.group(1)+'20261106-anexo-f-obs-unica'+(m.group(2) or '')+'"',html)
assert n==4,(n,'expected two modes + two revision-menu links')
assert html.count('#revisar-inspetores')==2
idx.write_text(html,encoding='utf-8')

sw=Path('sw-guia18.js')
s=sw.read_text(encoding='utf-8')
s,n=re.subn(r"const CACHE='guia18-menu-[^']+';","const CACHE='guia18-menu-v24-bpf20261106-anexo-obs-unica';",s)
assert n==1,n
sw.write_text(s,encoding='utf-8')
print('URLs Individual/Equipe e acesso à revisão preservados; cache renovado.')
