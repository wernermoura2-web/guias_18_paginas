#!/usr/bin/env python3
"""Padroniza os nomes das quatro colunas de recepção do Guia BPF nos dois modos."""
from pathlib import Path

old = "if(page.page===6)return ({1:'Garrafão retornável',2:'Embalagem descartável',3:'Rótulo',4:'Saneante'})[n]||'Avaliação do item';"
new = "if(page.page===6)return ({1:'Garrafões retornáveis',2:'Embalagens descartáveis',3:'Rótulos',4:'Saneantes'})[n]||'Avaliação do item';"
for filename in ('individual.html', 'equipe.html'):
    path=Path(filename)
    data=path.read_text(encoding='utf-8')
    before=data.count(old)
    after=data.count(new)
    if before==1 and after==0:
        data=data.replace(old,new)
        path.write_text(data,encoding='utf-8')
        print(f'{filename}: recepção corrigida nos quatro grupos de F e anexo.')
    elif before==0 and after==1:
        print(f'{filename}: já atualizado.')
    else:
        raise SystemExit(f'{filename}: padrão da recepção incompatível: {before} / {after}')

index=Path('index.html')
html=index.read_text(encoding='utf-8')
html=html.replace('individual.html?v=20261105-publicado-final','individual.html?v=20261105-recepcao4')
html=html.replace('equipe.html?v=20261105-publicado-final','equipe.html?v=20261105-recepcao4')
if 'Quatro categorias da recepção:' not in html:
    html=html.replace('<p>Escolha como irá preencher o Guia.', '<p><strong>Quatro categorias da recepção:</strong> garrafões retornáveis, embalagens descartáveis, rótulos e saneantes, também na tela das frases F e no anexo.</p><p>Escolha como irá preencher o Guia.')
index.write_text(html,encoding='utf-8')

cache=Path('sw-guia18.js')
s=cache.read_text(encoding='utf-8')
s=s.replace('guia18-menu-v6-bpf20261105-publicado-final','guia18-menu-v7-bpf20261105-recepcao4')
cache.write_text(s,encoding='utf-8')
print('Página inicial e cache revisados.')
