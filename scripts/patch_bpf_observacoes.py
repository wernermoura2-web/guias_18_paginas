#!/usr/bin/env python3
"""Aplicar observações editáveis e ajuste automático do texto ao Guia BPF (individual/equipe)."""
from pathlib import Path

REPL = [
    (
        "el.readOnly=derived.has(w.name)||bpfObservationTargets.has(w.name);",
        "el.readOnly=derived.has(w.name);",
    ),
    (
        "el.setAttribute('aria-description','Observações preenchidas somente pelas frases F.');",
        "el.setAttribute('aria-description','Observações editáveis, com inserção automática das frases F.');",
    ),
    (
        "if(bpfObservationTargets.has(w.name))return;values[w.name]=el.value;",
        "values[w.name]=el.value;",
    ),
    (
        "if(Object.entries(BPF_OBSERVATION_FIELDS).some(([key,field])=>/^\\d+_/.test(key)&&Number(key.split('_')[0])<13&&field===name))f.enableReadOnly();",
        "if(Object.entries(BPF_OBSERVATION_FIELDS).some(([key,field])=>/^\\d+_/.test(key)&&Number(key.split('_')[0])<13&&field===name))f.disableReadOnly();",
    ),
    (
        """function fit(el){if(!el.classList.contains('text')||!el.clientHeight)return;let size=Math.min(14,Math.max(8,el.clientHeight*.55));el.style.fontSize=size+'px';while(size>5&&(el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2)){size-=.5;el.style.fontSize=size+'px'}const mirror=el.parentElement.querySelector('.printable[data-field="'+CSS.escape(el.dataset.field)+'"]');if(mirror)mirror.style.fontSize=(size/el.parentElement.clientWidth*100)+'cqw'}""",
        """function fit(el){if(!el.classList.contains('text')||!el.clientHeight)return;const observation=el.classList.contains('bpf-process-observation');let size=observation?Math.min(16,Math.max(9,el.clientHeight*.55)):Math.min(14,Math.max(8,el.clientHeight*.55));const minimum=observation?1.5:5;el.style.fontSize=size+'px';while(size>minimum&&(el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1)){size=Math.max(minimum,size-(observation?.25:.5));el.style.fontSize=size+'px'}const mirror=el.parentElement.querySelector('.printable[data-field="'+CSS.escape(el.dataset.field)+'"]');if(mirror)mirror.style.fontSize=(size/el.parentElement.clientWidth*100)+'cqw';if(observation)el.style.overflowY=el.scrollHeight>el.clientHeight+1?'auto':'hidden'}""",
    ),
]

for filename in ("individual.html", "equipe.html"):
    path = Path(filename)
    content = path.read_text(encoding="utf-8")
    for before, after in REPL:
        count = content.count(before)
        if count != 1:
            if count == 0 and content.count(after) == 1:
                continue
            raise RuntimeError(f"{filename}: substituição não encontrada ou ambígua ({count}): {before[:75]}")
        content = content.replace(before, after)
    path.write_text(content, encoding="utf-8")
    print(f"Atualizado {filename}: {len(content):,} caracteres")

index = Path("index.html")
html = index.read_text(encoding="utf-8")
html = html.replace("individual.html?v=20261105", "individual.html?v=20261105-observacoes")
html = html.replace("equipe.html?v=20261105", "equipe.html?v=20261105-observacoes")
html = html.replace(
    "Frases F, listas numeradas de não conformidades críticas, maiores e menores, e PDF preenchível",
    "Frases F, observações editáveis com texto ajustado automaticamente, listas numeradas de não conformidades críticas, maiores e menores, e PDF preenchível",
)
index.write_text(html, encoding="utf-8")

sw = Path("sw-guia18.js")
txt = sw.read_text(encoding="utf-8").replace(
    "guia18-menu-v4-bpf20261105", "guia18-menu-v5-bpf20261105obs"
)
sw.write_text(txt, encoding="utf-8")
print("Página inicial e cache atualizados")
