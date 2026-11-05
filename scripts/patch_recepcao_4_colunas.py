#!/usr/bin/env python3
"""Atualizar categorias da recepção sem alterar os demais processos."""
import re
from pathlib import Path
pat = re.compile(r"if\s*\(\s*page\.page\s*===\s*6\s*\)\s*return\s*[^;\n]+;")
replacement = "if(page.page===6)return ({1:'Garrafões retornáveis',2:'Embalagens descartáveis',3:'Rótulos',4:'Saneantes'})[n]||'Avaliação do item';"
for name in ('individual.html','equipe.html'):
    p=Path(name)
    s=p.read_text(encoding='utf-8')
    matches=pat.findall(s)
    print('DIAGNOSTICO',name,'bytes',len(s),'match',len(matches))
    for term in ('bpfScopeLabel','page.page===6','Garrafão retornável','Garrafões retornáveis','LINHA 1'):
        i=s.find(term)
        print('TERMO',term,'count',s.count(term),'pos',i,'ctx',repr(s[max(i-75,0):i+200]) if i>=0 else '')
    if len(matches)!=1:
        raise SystemExit('Estrutura incompatível: procurar outra posição da recepção.')
    s=pat.sub(lambda _:replacement,s,count=1)
    p.write_text(s,encoding='utf-8')

p=Path('index.html')
s=p.read_text(encoding='utf-8')
s,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"]+"',lambda m:'href="'+m.group(1)+'20261105-recepcao4"',s)
if n!=2: raise SystemExit('Links: esperados 2, obtidos '+str(n))
if 'Quatro categorias da recepção:' not in s:
    s=s.replace('<p>Escolha como irá preencher o Guia.','<p><strong>Quatro categorias da recepção:</strong> garrafões retornáveis, embalagens descartáveis, rótulos e saneantes.</p><p>Escolha como irá preencher o Guia.')
p.write_text(s,encoding='utf-8')

p=Path('sw-guia18.js')
s=p.read_text(encoding='utf-8')
s,n=re.subn(r"const CACHE='guia18-menu-[^']+';", "const CACHE='guia18-menu-v7-bpf20261105-recepcao4';",s)
if n!=1: raise SystemExit('Cache não localizado')
p.write_text(s,encoding='utf-8')
print('Campos e links atualizados.')
