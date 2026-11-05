#!/usr/bin/env python3
"""Retirar F3 de embalagens descartáveis e rótulos no item 4.5.3 da Recepção."""
import json
import re
from pathlib import Path

MARKER="const BPF_PHRASES="
COLUNAS={2:"embalagens descartáveis",3:"rótulos"}

def ajustar(path):
    html=path.read_text(encoding="utf-8")
    assert html.count(MARKER)==1, f"{path}: estrutura BPF_PHRASES inesperada"
    start=html.index(MARKER)+len(MARKER)
    pages,length=json.JSONDecoder().raw_decode(html[start:])
    rows=[(p,r) for p in pages for r in p["rows"] if r["code"]=="4.5.3"]
    assert len(rows)==1 and rows[0][0]["page"]==6, f"{path}: item 4.5.3 de Recepção não encontrado unicamente"
    row=rows[0][1]
    scopes={s["col"]:s for s in row["scopes"]}
    assert set(scopes)=={2,3,4}, f"{path}: colunas inesperadas: {sorted(scopes)}"
    assert len(row["phrases"])==3, f"{path}: definição normativa original de F3 deve permanecer"
    assert "saneante" in row["phrases"][2]["text"].lower(), f"{path}: a F3 da definição geral não se refere a saneantes"
    assert len(scopes[4]["phrases"])==3, f"{path}: F3 dos saneantes deve ser preservada"
    assert "saneante" in scopes[4]["phrases"][2]["text"].lower(), f"{path}: F3 dos saneantes incorreta"
    originals=[]
    for col,label in COLUNAS.items():
        scope=scopes[col]
        fs=scope["phrases"]
        assert len(fs) in (2,3), f"{path}: número inesperado de frases em {label}"
        if len(fs)==3:
            assert "saneante" in fs[2]["text"].lower(), f"{path}: F3 não era a frase de saneantes em {label}"
            originals.append((col,fs[2]["text"]))
            del fs[2]
        assert len(fs)==2, f"{path}: F3 ainda presente em {label}"
    html=html[:start]+json.dumps(pages,ensure_ascii=False,separators=(",",":"))+html[start+length:]
    check,_=json.JSONDecoder().raw_decode(html[html.index(MARKER)+len(MARKER):])
    match=[r for p in check for r in p["rows"] if r["code"]=="4.5.3"]
    assert len(match)==1
    final={s["col"]:s for s in match[0]["scopes"]}
    assert len(final[2]["phrases"])==len(final[3]["phrases"])==2
    assert len(final[4]["phrases"])==3 and len(match[0]["phrases"])==3
    path.write_text(html,encoding="utf-8")
    print(f"VALIDADO {path}: 4.5.3 F3 removida de descartáveis e rótulos; F3 de saneantes preservada; {len(originals)} exclusões")

for mode in ("individual.html","equipe.html"):
    ajustar(Path(mode))

index=Path("index.html")
content=index.read_text(encoding="utf-8")
content,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"]+"',
                    lambda m:'href="'+m.group(1)+'20261105-recepcao-f3"',content)
assert n==2,f"Index: esperados 2 links; encontrados {n}"
index.write_text(content,encoding="utf-8")
sw=Path("sw-guia18.js")
content=sw.read_text(encoding="utf-8")
content,n=re.subn(r"const CACHE='guia18-menu-[^']+';",
                  "const CACHE='guia18-menu-v10-bpf20261105-recepcao-f3';",content)
assert n==1, "Cache não identificado"
sw.write_text(content,encoding="utf-8")
print("Links de ambos os modos e cache atualizados; outros itens preservados.")
