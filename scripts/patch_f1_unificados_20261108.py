#!/usr/bin/env python3
"""Corrigir rótulos dos critérios F1 diretamente nas páginas publicadas.
Preserva a redação legal (BPF_PHRASES[].rows[].description), respostas e número de F.
Idempotente; usa somente substituições restritas aos blocos de interface.
"""
import json
from pathlib import Path

FILES = ("individual.html", "equipe.html")
F1_OPTIONS = [
    ("'4.10.1':['Implementação','Documentação'],",
     "'4.10.1':['Implementação do controle de qualidade','Documentação do controle de qualidade'],"),
    ("'4.11.1':['Supervisão','Capacitação'],",
     "'4.11.1':['Supervisão dos manipuladores','Capacitação periódica dos manipuladores'],"),
    ("'4.11.3':['Curso de 40h com até 2 anos','Curso de 40h com mais de 2 anos'],",
     "'4.11.3':['Capacitação de 40 horas — curso concluído há até 2 anos','Capacitação de 40 horas — curso concluído há mais de 2 anos'],"),
    ("'Certificado do responsável pela industrialização'",
     "'Certificado de capacitação do responsável pela industrialização'"),
]
F1_HEADINGS = [
    ("'4.10.1':'F1 — Controle de qualidade'",
     "'4.10.1':'F1 — Implementação e documentação do controle de qualidade'"),
    ("'4.11.1':'F1 — Supervisão e Capacitação'",
     "'4.11.1':'F1 — Supervisão e capacitação periódica dos manipuladores'"),
    ("'4.11.3':'F1 — Curso de capacitação'",
     "'4.11.3':'F1 — Capacitação de 40 horas e curso com mais de 2 anos'"),
    ("'4.11.4':'F1 — Certificados de capacitação'",
     "'4.11.4':'F1 — Certificados dos manipuladores e do responsável pela industrialização'"),
]
TAG = '<script src="./bpf-revisao-frases-ativa-20261107.js?v=20261108-f1-nativo-v58"></script>'
ANCHOR = '</script><script>/* Shared by the browser forms and Acrobat.'

def model(html):
    prefix = 'const BPF_PHRASES='
    pos = html.index(prefix) + len(prefix)
    end = html.index(';\n</script>', pos)
    return json.loads(html[pos:end])

def replace_in_block(src, block_start, block_end, old, new):
    a = src.index(block_start)
    b = src.index(block_end, a + len(block_start))
    block = src[a:b]
    if block.count(new) == 1 and old not in block:
        return src
    if block.count(old) != 1:
        raise AssertionError(f"Não localizou ocorrência única em {block_start}: {old}")
    return src[:a] + block.replace(old, new, 1) + src[b:]

for filename in FILES:
    path = Path(filename)
    before = path.read_text(encoding="utf-8")
    baseline = model(before)
    src = before
    for old, new in F1_OPTIONS:
        src = replace_in_block(src, "function bpfF1Checks(row,scope)", "function bpfPanelRecords", old, new)
    for old, new in F1_HEADINGS:
        src = replace_in_block(src, "function bpfPanels(page,row)", "function bpfUnifiedOption", old, new)
    if TAG not in src:
        if src.count(ANCHOR) != 1:
            # Se o script existir em outra versão, basta a revisão dos rótulos.
            if 'src="./bpf-revisao-frases-ativa-20261107.js?' not in src:
                raise AssertionError("Não foi possível localizar a posição de carregamento da revisão.")
        else:
            src = src.replace(ANCHOR, "</script>" + TAG + "<script>/* Shared by the browser forms and Acrobat.", 1)
    assert model(src) == baseline, f"Conteúdo legal ou frases F alteradas em {filename}"
    for code in ("4.10.1","4.11.1","4.11.3","4.11.4"):
        rows = [row for page in model(src) for row in page["rows"] if row["code"]==code]
        assert rows and all(len(row["phrases"]) == 1 and all(len(scope["phrases"])==1 for scope in row["scopes"]) for row in rows), code
    for _, new in F1_OPTIONS+F1_HEADINGS:
        assert new in src, f"Falta em {filename}: {new}"
    if src != before:
        path.write_text(src, encoding="utf-8")
    print(f"{filename}: opções e títulos F1 conferidos; 4 itens com um F1; textos legais intactos; {len(src)} caracteres")
