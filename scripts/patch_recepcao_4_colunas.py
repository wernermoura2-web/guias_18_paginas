#!/usr/bin/env python3
"""Padroniza os quatro cabeçalhos da recepção em ambos os modos do Guia BPF."""
import re
from pathlib import Path

pattern = re.compile(r"if\s*\(\s*page\.page\s*===\s*6\s*\)\s*return\s*[^;\n]+;")
replacement = "if(page.page===6)return ({1:'Garrafões retornáveis',2:'Embalagens descartáveis',3:'Rótulos',4:'Saneantes'})[n]||'Avaliação do item';"
for filename in ('individual.html', 'equipe.html'):
    file=Path(filename)
    source=file.read_text(encoding='utf-8')
    matches=pattern.findall(source)
    if len(matches)!=1:
        print(filename, 'trechos de bpfScopeLabel encontrados:', len(matches))
        raise SystemExit('Erro: padrão não localizado ou ambíguo.')
    source=pattern.sub(lambda _: replacement, source, count=1)
    file.write_text(source, encoding='utf-8')
    print(filename, ': nomes da recepção padronizados nas frases F e anexos.')

file=Path('index.html')
html=file.read_text(encoding='utf-8')
html,count=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"]+"',lambda m:'href="'+m.group(1)+'20261105-recepcao4"',html)
if count!=2:
    raise SystemExit(f'Página inicial: links esperados 2, obtidos {count}')
if 'Quatro categorias da recepção:' not in html:
    html=html.replace('<p>Escolha como irá preencher o Guia.', '<p><strong>Quatro categorias da recepção:</strong> garrafões retornáveis, embalagens descartáveis, rótulos e saneantes, também na tela das frases F e no anexo.</p><p>Escolha como irá preencher o Guia.')
file.write_text(html,encoding='utf-8')

file=Path('sw-guia18.js')
sw=file.read_text(encoding='utf-8')
sw,count=re.subn(r"const CACHE='guia18-menu-[^']+';", "const CACHE='guia18-menu-v7-bpf20261105-recepcao4';",sw)
if count!=1: raise SystemExit('Cache: declaração não encontrada')
file.write_text(sw,encoding='utf-8')
print('Links da página inicial e cache atualizados.')
