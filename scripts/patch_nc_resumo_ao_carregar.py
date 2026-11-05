#!/usr/bin/env python3
"""Corrige atualização de listas resumidas ao abrir JSON antigo do Guia BPF."""
from pathlib import Path
import re

FN_START = "function bpfSyncNCLists(){"
FUNC_END = "\n}\n</script>"
OLD_SYNCH = " const next=PCCFinal.synchronize(values[field]||'',previous,current);values[field]=next.text;values.BPF_NCGenerated=JSON.stringify(next.generated);"
NEW_SYNCH = """ let priorText=String(values[field]||'').replace(/\\r\\n?/g,'\\n');
 for(const [id,original] of Object.entries(previous)){
  if(!Object.hasOwn(current,id)||typeof original!=='string'||original===current[id])continue;
  const old=original.replace(/\\r\\n?/g,'\\n'),at=priorText.indexOf(old);
  if(at<0)continue;
  priorText=priorText.slice(0,at)+current[id]+priorText.slice(at+old.length);
  previous[id]=current[id];
 }
 const next=PCCFinal.synchronize(priorText,previous,current);values[field]=next.text;values.BPF_NCGenerated=JSON.stringify(next.generated);"""
OLD_APPLY="if(v.BPF_PCCGenerated&&!v.BPF_NCGenerated)bpfSyncNCLists();"
NEW_APPLY="if(v.BPF_NCGenerated||BPF_PHRASES.some(p=>p.rows.some(r=>r.scopes.some(s=>s.phrases.some((_,i)=>v[bpfPhraseName(s,i)]==='0')))))bpfSyncNCLists();"

for filename in ('individual.html','equipe.html'):
    path=Path(filename)
    html=path.read_text(encoding='utf-8')
    i=html.index(FN_START)
    j=html.index(FUNC_END,i)+len("\n}")
    func=html[i:j]
    assert "group.lines.push('Frase '" in func, f"{filename}: falta texto resumido já aprovado"
    assert html.count("function bpfApplyAnswers(v){")==1, f"{filename}: função de resposta inválida"
    assert func.count(OLD_SYNCH)==1 or func.count(NEW_SYNCH)==1, f"{filename}: sincronização incompatível"
    assert html.count(OLD_APPLY)==1 or html.count(NEW_APPLY)==1, f"{filename}: disparo de atualização incompatível"
    if OLD_SYNCH in func:
        func=func.replace(OLD_SYNCH,NEW_SYNCH)
        html=html[:i]+func+html[j:]
    if OLD_APPLY in html:
        html=html.replace(OLD_APPLY,NEW_APPLY)
    assert html.count(NEW_APPLY)==1
    assert html.count(NEW_SYNCH)==1
    assert html.count("function bpfSyncPCCFinal(){")==1
    path.write_text(html, encoding='utf-8')
    print("ALTERADO",filename,"reconstrói as listas ao carregar JSON antigo; preserva textos manuais")

index=Path('index.html')
html=index.read_text(encoding='utf-8')
html,n=re.subn(r'href="((?:individual|equipe)\\.html\\?v=)[^"]+"',
               lambda m:'href="'+m.group(1)+'20261105-nc-resumo-corrigido"',html)
assert n==2,f'index: 2 links esperados; encontrados {n}'
index.write_text(html,encoding='utf-8')

sw=Path('sw-guia18.js')
js=sw.read_text(encoding='utf-8')
js,n=re.subn(r"const CACHE='guia18-menu-[^']+';",
             "const CACHE='guia18-menu-v12-bpf20261105-nc-resumo-corrigido';",js)
assert n==1
sw.write_text(js,encoding='utf-8')
print("URLs e cache da publicação atualizados.")
