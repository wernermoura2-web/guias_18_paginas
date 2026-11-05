#!/usr/bin/env python3
"""Abreviar apenas as 3 listas de não conformidades das Observações Gerais BPF."""
from pathlib import Path
import re
import json

OLD = """  const source=page.page<2?values['fill_'+(scope.col+1)]:page.page<6?values['fill_'+page.page]:'';
  const unit=(page.page===6?({1:'Garrafões retornáveis',2:'Embalagens descartáveis',3:'Rótulos',4:'Saneantes'})[scope.col]:(page.page<2?'Captação ':page.page<6?'Reservatório ':'Linha ')+scope.col)+(source?' - '+source:'');
  group.lines.push(PCCFinal.statement({code:row.code},{cat:phrase.appcc},i,unit,titles[page.page]));"""

NEW = """  const unit=page.page<2?'Captação '+scope.col:page.page<6?'Reservatório '+scope.col:page.page===6?({1:'Garrafões retornáveis',2:'Embalagens descartáveis',3:'Rótulos',4:'Saneantes'})[scope.col]:page.page<=10?'Linha '+scope.col:'Estabelecimento';
  group.lines.push('Frase '+(i+1)+', do item '+row.code+', do processo '+titles[page.page]+', na unidade '+unit+', classificada como '+phrase.appcc);"""

PREFIX = "function bpfSyncNCLists(){"
ENDMARKER = "\n}\n</script>"
PHRASES = "const BPF_PHRASES="
SUFFIX = "20261105-nc-resumo-curto"

def validate_phrases(html, file):
    pos=html.index(PHRASES)+len(PHRASES)
    pages,_=json.JSONDecoder().raw_decode(html[pos:])
    r=[x for p in pages for x in p["rows"] if x["code"]=="4.3.5" and p["page"]==2]
    assert len(r)==1 and r[0]["scopes"][0]["phrases"][0]["appcc"]=="PCC", f"{file}: classificação 4.3.5 F1 mudou"
    r429=[x for p in pages for x in p["rows"] if x["code"]=="4.2.9"]
    assert len(r429)==1 and all(s["phrases"][1].get("allowNA") is True for s in r429[0]["scopes"]), f"{file}: F2 de 4.2.9 perdeu NA"
    r436=[x for p in pages for x in p["rows"] if x["code"]=="4.3.6"]
    assert len(r436)==4 and all(s["phrases"][1].get("allowNA") is True for r in r436 for s in r["scopes"]), f"{file}: F2 de 4.3.6 perdeu NA"
    r453=[x for p in pages for x in p["rows"] if x["code"]=="4.5.3"]
    assert len(r453)==1
    bycol={s["col"]:s for s in r453[0]["scopes"]}
    assert len(bycol[2]["phrases"])==len(bycol[3]["phrases"])==2 and len(bycol[4]["phrases"])==3, f"{file}: F3 da Recepção incorreta"

def patch(path):
    html=path.read_text(encoding="utf-8")
    assert html.count(PREFIX)==1, f"{path}: função de NC não única"
    i=html.index(PREFIX)
    j=html.index(ENDMARKER,i)+len("\n}")
    func=html[i:j]
    before,after=func.count(OLD),func.count(NEW)
    if before==1 and after==0:
        newfunc=func.replace(OLD,NEW)
        html=html[:i]+newfunc+html[j:]
        print(f"ALTERADO {path}: listas críticas, maiores e menores passaram ao formato resumido")
    elif before==0 and after==1:
        print(f"OK {path}: listas já estão resumidas")
    else:
        raise RuntimeError(f"{path}: trecho não localizado de modo seguro; antigo={before}, novo={after}")
    assert html.count(NEW)==1
    assert "function bpfSyncPCCFinal(){" in html and "PCCFinal.statement({code:row.code},{},i,unit,titles[page.page])" in html, f"{path}: considerações PCC não preservadas"
    validate_phrases(html,path)
    path.write_text(html,encoding="utf-8")

for fn in ("individual.html","equipe.html"):
    patch(Path(fn))

example="Frase 1, do item 4.3.5, do processo 4.3 Reservatórios da Captação 1, na unidade Reservatório 1, classificada como PCC"
print("EXEMPLO do novo formato:",example)
print("Considerações Finais PCC mantidas com o texto anterior; apenas OBS 1 abreviada.")

index=Path("index.html")
html=index.read_text(encoding="utf-8")
html,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"]+"',lambda m:'href="'+m.group(1)+SUFFIX+'"',html)
assert n==2,f"Index: esperados 2 links, encontrados {n}"
index.write_text(html,encoding="utf-8")
sw=Path("sw-guia18.js")
js=sw.read_text(encoding="utf-8")
js,n=re.subn(r"const CACHE='guia18-menu-[^']+';","const CACHE='guia18-menu-v11-bpf20261105-nc-resumo-curto';",js)
assert n==1,"Cache sem declaração única"
sw.write_text(js,encoding="utf-8")
print("Links e cache atualizados para os dois modos.")
