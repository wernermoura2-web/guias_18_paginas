#!/usr/bin/env python3
"""Disponibiliza a resposta NA somente na F2 do item 4.3.6, individual e equipe."""
import json
import re
from pathlib import Path

MARKER = "const BPF_PHRASES="
RENDER_NA = "(phrase.allowNA||D.widgets.some(w=>w.name===scope.name&&String(w.state)==='2'))"

def update_form(path):
    html=path.read_text(encoding="utf-8")
    assert html.count(MARKER)==1, f"{path}: definição das frases ausente ou duplicada"
    assert html.count(RENDER_NA)==1, f"{path}: interface não possui regra para exibir NA por frase"
    start=html.index(MARKER)+len(MARKER)
    pages, consumed=json.JSONDecoder().raw_decode(html[start:])
    matches=[(p,r) for p in pages for r in p.get("rows",[]) if r.get("code")=="4.3.6"]
    print(path, "item 4.3.6 encontrado em:", [(p.get("page"),len(r.get("scopes",[]))) for p,r in matches])
    assert len(matches)==4 and {p.get("page") for p,r in matches}=={2,3,4,5}, f"{path}: esperadas quatro páginas de Reservatórios"
    assert all(len(r.get("scopes",[]))==4 and len(r.get("phrases",[]))>=2 for p,r in matches), f"{path}: estrutura dos indicadores 4.3.6 inesperada"

    # Verifica que a correção anterior (4.2.9 F2) é preservada.
    prior=[r for p in pages for r in p.get("rows",[]) if r.get("code")=="4.2.9"]
    assert len(prior)==1 and all(s["phrases"][1].get("allowNA") is True for s in prior[0]["scopes"]), f"{path}: correção 4.2.9 não localizada"

    # A mudança se limita à segunda frase; F1, F3 e demais indicadores são mantidos.
    for page,row in matches:
        for scope in row["scopes"]:
            assert len(scope["phrases"])>=2, f"{path}: F2 ausente em {scope.get('name')}"
            phrase=scope["phrases"][1]
            assert phrase.get("allowNA") in (None, False, True), f"{path}: propriedade NA inesperada"
            phrase["allowNA"]=True
        row["phrases"][1]["allowNA"]=True

    replaced=json.dumps(pages, ensure_ascii=False,separators=(",",":"))
    html=html[:start]+replaced+html[start+consumed:]

    # Releitura independente antes de gravar.
    revised,_=json.JSONDecoder().raw_decode(html[html.index(MARKER)+len(MARKER):])
    target=[r for p in revised for r in p["rows"] if r.get("code")=="4.3.6"]
    assert len(target)==4
    assert all(s["phrases"][1].get("allowNA") is True for r in target for s in r["scopes"])
    assert all(r["phrases"][1].get("allowNA") is True for r in target)
    assert all(s["phrases"][1].get("allowNA") is True for p in revised for r in p["rows"] if r["code"]=="4.2.9" for s in r["scopes"])
    assert html.count(RENDER_NA)==1
    path.write_text(html,encoding="utf-8")
    print("OK",path,"4.3.6 F2 aceita Sim, Não, NA nas",len(matches),"páginas de Reservatórios e",sum(len(r["scopes"]) for p,r in matches),"posições; F1 e demais frases mantidas.")

for filename in ("individual.html","equipe.html"):
    update_form(Path(filename))

p=Path("index.html")
source=p.read_text(encoding="utf-8")
source,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"]+"',
    lambda m:'href="'+m.group(1)+'20261105-f2-436-na"',source)
assert n==2, f"Esperados dois links atualizados, encontrados {n}"
p.write_text(source,encoding="utf-8")

p=Path("sw-guia18.js")
source=p.read_text(encoding="utf-8")
source,n=re.subn(r"const CACHE='guia18-menu-[^']+';",
    "const CACHE='guia18-menu-v9-bpf20261105-f2-436-na';",source)
assert n==1, "Declaração de cache não encontrada"
p.write_text(source,encoding="utf-8")
print("Links e cache renovados; PDF, layout e dados preservados.")
