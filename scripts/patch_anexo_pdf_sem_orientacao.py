#!/usr/bin/env python3
"""Remove apenas a orientação ao inspetor do Anexo F compacto do PDF, em ambos os modos."""
from pathlib import Path
import re
import subprocess

ANNEX_START="async function bpfAppendCompactAnnex(pdf){"
ANNEX_END="\n</script>"
REMOVE="if(phrase.guidance)text('Orientação ao inspetor: '+phrase.guidance,7.8);"
VERSAO="20261105-anexo-f-sem-orientacoes"

for fn in ("individual.html","equipe.html"):
    path=Path(fn)
    html=path.read_text(encoding="utf-8")
    assert html.count(ANNEX_START)==1,f"{fn}: função do anexo não única"
    i=html.index(ANNEX_START)
    j=html.index(ANNEX_END,i)
    annex=html[i:j]
    if REMOVE in annex:
        assert annex.count(REMOVE)==1,f"{fn}: texto a retirar não único"
        annex=annex.replace(REMOVE,"",1)
        html=html[:i]+annex+html[j:]
    assert REMOVE not in annex, f"{fn}: a orientação ainda consta no anexo"
    assert "text(phrase.text)" in annex and "table(records.map" in annex,f"{fn}: frases ou respostas foram afetadas"
    assert "if(phrase.guidance){const guidance=document.createElement('p')" in html, f"{fn}: orientação na tela do botão F alterada"
    assert html.count("function bpfPdfGeneralSplit(full,font,form,pdf){")==1,f"{fn}: divisão do PDF removida"
    assert html.count("function bpfPdfAppendGeneralPages(pdf,form,font,flow){")==1,f"{fn}: continuação de observações removida"
    # Validate the short script with the actual export routine.
    start=html.rfind("<script",0,i)
    start=html.index(">",start)+1
    end=html.index("</script>",i)
    p=subprocess.run(["node","--check"],input=html[start:end],capture_output=True,text=True)
    assert p.returncode==0,(fn,p.stderr[:1200])
    path.write_text(html,encoding="utf-8")
    print("VALIDADO",fn,"Anexo F PDF sem orientação ao inspetor; textos dos itens, observações e botão F preservados")

index=Path("index.html")
html=index.read_text(encoding="utf-8")
html,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"]+"',lambda m:'href="'+m.group(1)+VERSAO+'"',html)
assert n==2,f"Esperados 2 links versionados, encontrados {n}"
index.write_text(html,encoding="utf-8")

sw=Path("sw-guia18.js")
html=sw.read_text(encoding="utf-8")
html,n=re.subn(r"const CACHE='guia18-menu-[^']+';","const CACHE='guia18-menu-v16-bpf20261105-anexo-sem-orientacoes';",html)
assert n==1,"Cache único não encontrado"
sw.write_text(html,encoding="utf-8")
print("Links e cache atualizados nos dois modos.")
