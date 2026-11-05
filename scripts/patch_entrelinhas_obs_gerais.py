#!/usr/bin/env python3
"""Ajustar entrelinhas e melhorar aproveitamento do espaço nas Observações Gerais."""
from pathlib import Path
import re
import subprocess

def replace_once(s, old, new, file):
    assert s.count(old)==1, f"{file}: esperado um único trecho {old[:90]!r}, encontrado {s.count(old)}"
    return s.replace(old,new,1)

for filename in ("individual.html","equipe.html"):
    p=Path(filename)
    s=p.read_text(encoding="utf-8")
    # Paginação no navegador: 1,20 de entrelinha (antes 1,25);
    # preservar palavras e ocupar a primeira página até a última linha disponível.
    beg=s.index("function bpfGeneralFlow(full){")
    end=s.index("function bpfSyncNCLists(){",beg)
    general=s[beg:end]
    general=replace_once(general,"probe.style.lineHeight='1.25';","probe.style.lineHeight='1.2';",filename)
    general=replace_once(general,"if(pos>=cut-150&&pos>0)cut=pos+1;","if(pos>0&&cut-pos<=28)cut=pos+1;",filename)
    s=s[:beg]+general+s[end:]

    # O texto na tela, assim como sua versão imprimível, usa a mesma entrelinha.
    s=replace_once(s,"el.style.fontSize=font+'px';el.style.lineHeight='1.25';",
                   "el.style.fontSize=font+'px';el.style.lineHeight='1.2';",filename)
    s=replace_once(s,"mirror.style.lineHeight='1.25';mirror.style.whiteSpace='pre-wrap'",
                   "mirror.style.lineHeight='1.2';mirror.style.whiteSpace='pre-wrap'",filename)

    # Paginação no PDF preenchível: o cálculo antigo de 1,50 era
    # excessivamente conservador; 1,32 e margens internas de 7 pontos
    # aproveitam mais área, sem eliminar o respiro entre linhas.
    beg=s.index("function bpfPdfGeneralSplit(full,font,form,pdf){")
    end=s.index("function bpfPdfAppendGeneralPages(pdf,form,font,flow){",beg)
    pdf=s[beg:end]
    pdf=replace_once(pdf,
      "return countLines(part,Math.max(25,box.width-18))*h*1.5<=Math.max(1,box.height-18);",
      "return countLines(part,Math.max(25,box.width-14))*h*1.32<=Math.max(1,box.height-14);",
      filename)
    pdf=replace_once(pdf,
      "if(boundary>0&&boundary>=cut-125)cut=boundary+1;",
      "if(boundary>0&&cut-boundary<=28)cut=boundary+1;",
      filename)
    s=s[:beg]+pdf+s[end:]

    # Garante que o PDF continua com a fonte legível de 9 pt, com todos
    # os caracteres e as páginas complementares preenchíveis.
    assert s.count("const size=9;")==1,(filename,"Tamanho da fonte PDF inesperado")
    assert s.count("const pdfFlow=bpfPdfGeneralSplit(bpfGeneralFullText(),observationFont,form,pdf);")==1
    assert s.count("function bpfPdfAppendGeneralPages(pdf,form,font,flow){")==1
    assert s.count("function bpfGeneralFlow(full){")==1
    assert s.count("const firstPart=full.slice(0,cut),secondPart=full.slice(cut);")==1
    for marker in ("function bpfGeneralFlow(full){","function bpfPdfGeneralSplit(full,font,form,pdf){","const D=GUIDE_DATA, values={}"):
        anchor=s.index(marker)
        start=s.rfind("<script",0,anchor)
        assert start>=0
        start=s.index(">",start)+1
        end=s.index("</script>",anchor)
        check=subprocess.run(["node","--check"],input=s[start:end],capture_output=True,text=True)
        assert check.returncode==0,(filename,marker,check.stderr[:1500])
    p.write_text(s,encoding="utf-8")
    print("VALIDADO",filename,": entrelinha 1,20 na tela, paginação PDF 1,32, aproveitamento maior e quebra próxima da última palavra.")

# Nova versão para contornar caches locais antigos.
p=Path("index.html")
s=p.read_text(encoding="utf-8")
s,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"]+"',
    lambda m:'href="'+m.group(1)+'20261105-observacoes-entrelinhas-v2"',s)
assert n==2,n
p.write_text(s,encoding="utf-8")

p=Path("sw-guia18.js")
s=p.read_text(encoding="utf-8")
s,n=re.subn(r"const CACHE='guia18-menu-[^']+';",
    "const CACHE='guia18-menu-v15-bpf20261105-obs-entrelinhas';",s)
assert n==1,n
p.write_text(s,encoding="utf-8")
print("URLs dos dois modos e cache atualizados; demais itens preservados.")
