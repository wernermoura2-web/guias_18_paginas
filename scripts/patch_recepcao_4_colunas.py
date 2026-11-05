#!/usr/bin/env python3
"""Identificar as quatro categorias somente na Recepção (página 7) do Guia BPF."""
from pathlib import Path
import re

old = "const unit=(page.page<2?'Captação ':page.page<6?'Reservatório ':'Linha ')+scope.col+(source?' - '+source:'');"
new = "const unit=(page.page===6?({1:'Garrafões retornáveis',2:'Embalagens descartáveis',3:'Rótulos',4:'Saneantes'})[scope.col]:(page.page<2?'Captação ':page.page<6?'Reservatório ':'Linha ')+scope.col)+(source?' - '+source:'');"

for name in ('individual.html','equipe.html'):
    path=Path(name)
    source=path.read_text(encoding='utf-8')
    count_old=source.count(old)
    count_new=source.count(new)
    print(name,'rótulos antigos',count_old,'rótulos novos',count_new)
    for match in re.finditer(re.escape("'Linha '"),source[:500000]):
        i=match.start()
        print('CONTEXTO_LINHA',name,repr(source[max(0,i-140):i+175]))
    if count_old==2:
        source=source.replace(old,new)
        path.write_text(source,encoding='utf-8')
        print(name,'recepção atualizada em NC críticas, maiores e menores e considerações PCC')
    elif count_old==0 and count_new==2:
        print(name,'recepção já corrigida')
    else:
        raise RuntimeError(name+': marcador de contexto incompatível; nenhuma alteração publicada')

path=Path('index.html')
source=path.read_text(encoding='utf-8')
source, count=re.subn(
    r'href="((?:individual|equipe)\.html\?v=)[^"]+"',
    lambda m:'href="'+m.group(1)+'20261105-recepcao4"',
    source
)
if count != 2:
    raise RuntimeError('Página inicial: esperados dois links, encontrados '+str(count))
if 'Recepção: garrafões retornáveis' not in source:
    source=source.replace('<p>Escolha como irá preencher o Guia.',
        '<p><strong>Recepção:</strong> garrafões retornáveis, embalagens descartáveis, rótulos e saneantes, também identificados nos registros de não conformidades.</p><p>Escolha como irá preencher o Guia.')
path.write_text(source,encoding='utf-8')

path=Path('sw-guia18.js')
source=path.read_text(encoding='utf-8')
source, count=re.subn(r"const CACHE='guia18-menu-[^']+';",
    "const CACHE='guia18-menu-v7-bpf20261105-recepcao4';",source)
if count != 1: raise RuntimeError('Cache não localizado')
path.write_text(source,encoding='utf-8')
print('Página inicial e cache revisados. Envase preservado.')
