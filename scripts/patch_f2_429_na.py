#!/usr/bin/env python3
"""Liberar NA apenas na F2 do item 4.2.9 (Condução), em ambos os modos."""
from pathlib import Path
import json

MARKER = "const BPF_PHRASES="
OLD_RENDER = "D.widgets.some(w=>w.name===scope.name&&String(w.state)==='2')?[['2','Não se aplica']]:[]"
NEW_RENDER = "(phrase.allowNA||D.widgets.some(w=>w.name===scope.name&&String(w.state)==='2'))?[['2','Não se aplica']]:[]"

def revise(path: Path):
    html = path.read_text(encoding='utf-8')
    assert html.count(MARKER) == 1, f"{path}: marcador BPF_PHRASES inesperado"
    start = html.index(MARKER) + len(MARKER)
    pages, consumed = json.JSONDecoder().raw_decode(html[start:])
    rows = [(p, r) for p in pages for r in p['rows'] if r['code'] == '4.2.9']
    assert len(rows) == 1 and rows[0][0]['page'] == 1, f"{path}: item 4.2.9 não localizado exclusivamente na página 2"
    row = rows[0][1]
    assert len(row['scopes']) == 4, f"{path}: esperadas quatro captações/conduções"
    for scope in row['scopes']:
        assert len(scope['phrases']) >= 2, f"{path}: F2 ausente em {scope['name']}"
        f1, f2 = scope['phrases'][:2]
        assert f1.get('allowNA') is False, f"{path}: F1 foi inesperadamente alterada"
        assert f2.get('allowNA') in (False, True), f"{path}: F2 possui propriedade inesperada"
        f2['allowNA'] = True
    assert len(row['phrases']) >= 2, f"{path}: F2 não existe na definição do item"
    assert row['phrases'][1].get('allowNA') in (None, False, True)
    row['phrases'][1]['allowNA'] = True

    new_json = json.dumps(pages, ensure_ascii=False, separators=(',', ':'))
    html = html[:start] + new_json + html[start+consumed:]
    old, new = html.count(OLD_RENDER), html.count(NEW_RENDER)
    if old == 1 and new == 0:
        html = html.replace(OLD_RENDER, NEW_RENDER)
    elif old == 0 and new == 1:
        pass
    else:
        raise RuntimeError(f"{path}: regra NA na tela incompatível ({old} antiga, {new} nova)")

    # Confirma que F2 aceita NA em todas as quatro posições e F1 não foi liberada.
    start = html.index(MARKER) + len(MARKER)
    check, _ = json.JSONDecoder().raw_decode(html[start:])
    target = [r for page in check for r in page['rows'] if r['code'] == '4.2.9']
    assert len(target) == 1
    assert all(s['phrases'][1]['allowNA'] is True and s['phrases'][0]['allowNA'] is False for s in target[0]['scopes'])
    assert html.count(NEW_RENDER) == 1
    path.write_text(html, encoding='utf-8')
    print(f"OK {path}: 4.2.9 F2 aceita Sim/Não/NA nas quatro posições; F1 inalterada.")

for filename in ('individual.html', 'equipe.html'):
    revise(Path(filename))

# Atualizar versão dos links sem modificar campos, respostas ou layout.
index = Path('index.html')
source = index.read_text(encoding='utf-8')
import re
source, count = re.subn(
    r'href="((?:individual|equipe)\.html\?v=)[^"]+"',
    lambda m: 'href="' + m.group(1) + '20261105-f2-429-na"',
    source
)
assert count == 2, f"Index: esperados 2 links, encontrados {count}"
index.write_text(source, encoding='utf-8')
sw = Path('sw-guia18.js')
source = sw.read_text(encoding='utf-8')
source, count = re.subn(
    r"const CACHE='guia18-menu-[^']+';",
    "const CACHE='guia18-menu-v8-bpf20261105-f2-429-na';",
    source
)
assert count == 1, "Service worker: declaração de cache não encontrada"
sw.write_text(source, encoding='utf-8')
print("Links e cache renovados.")
