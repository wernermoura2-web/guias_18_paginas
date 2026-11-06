#!/usr/bin/env python3
"""Corrigir apenas os títulos F5/F6 de 4.10.3 nos dois modos e no Anexo F."""
from pathlib import Path
import json,re,subprocess,hashlib

changes={
 "{label:'F5 — Cinco unidades do lote envasado',indices:[15],composite:true}":
 "{label:'F5 — Cinco análises mensais de um lote envasado',indices:[15],composite:true}",
 "{label:'F6 — Demais análises previstas no requisito',indices:[16],composite:true}":
 "{label:'F6 — Cinco unidades analisadas de todos os lotes envasados',indices:[16],composite:true}",
 "'Cinco unidades do mesmo lote envasado',":
 "'Cinco análises mensais de um lote envasado',",
 "'Demais análises e controles do requisito'":
 "'Cinco unidades analisadas de todos os lotes envasados'"
}
for file in ('individual.html','equipe.html'):
    path=Path(file)
    h=path.read_text(encoding='utf8')
    marker='const BPF_PHRASES='
    pos=h.index(marker)+len(marker)
    data,consumed=json.JSONDecoder().raw_decode(h[pos:])
    old_hash=hashlib.sha256(h[pos:pos+consumed].encode()).hexdigest()
    rows=[r for p in data if p['page']==11 for r in p['rows'] if r['code']=='4.10.3']
    assert len(rows)==1,(file,'item 4.10.3 não localizado')
    row=rows[0]
    assert len(row['phrases'])>=17,(file,'precisa haver 17 frases originais')
    for i in (15,16):
        print(file,'F original',i+1,repr(row['phrases'][i]['text'][:460]))
    assert 'mensalmente' in row['phrases'][15]['text'].lower() or 'mensais' in row['phrases'][15]['text'].lower(),(file,'frase original 16 não é mensal')
    assert 'lote' in row['phrases'][16]['text'].lower(),(file,'frase original 17 não se refere a lotes')
    for before,after in changes.items():
        if before in h:
            assert h.count(before)==1,(file,'localizações inesperadas',before,h.count(before))
            h=h.replace(before,after)
        else:
            assert h.count(after)==1,(file,'não encontra rótulo',before)
    for after in changes.values():
        assert h.count(after)==1,(file,'rótulo atualizado não único',after)
    pos=h.index(marker)+len(marker)
    _,consumed=json.JSONDecoder().raw_decode(h[pos:])
    assert hashlib.sha256(h[pos:pos+consumed].encode()).hexdigest()==old_hash,(file,'dados regulamentares originais alterados')
    for token in ('function bpfPanels(page,row){','function bpfUnifiedOption(row,e){','function bpfAnnexRows(){'):
        p=h.index(token);a=h.rfind('<script',0,p);a=h.index('>',a)+1;b=h.index('</script>',p)
        chk=subprocess.run(['node','--check'],input=h[a:b],text=True,capture_output=True)
        assert chk.returncode==0,(file,token,chk.stderr[:1000])
    path.write_text(h,encoding='utf8')
    print('VALIDADO',file,'4.10.3 F5 e F6 rotulados conforme periodicidade e amostragem por lote; JSON APPCC e PDF intactos.')

p=Path('index.html')
h=p.read_text(encoding='utf8')
h,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"]+"',lambda m:'href="'+m.group(1)+'20261105-f5-f6-analises-lotes"',h)
assert n==2,n
p.write_text(h,encoding='utf8')
p=Path('sw-guia18.js')
h=p.read_text(encoding='utf8')
h,n=re.subn(r"const CACHE='guia18-menu-[^']+';","const CACHE='guia18-menu-v20-bpf20261105-f5-f6-analises-lotes';",h)
assert n==1,n
p.write_text(h,encoding='utf8')
print('Cache e links atualizados para Individual e Equipe.')
