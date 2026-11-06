#!/usr/bin/env python3
"""4.10.2: F1 Laboratório próprio/terceirizado Sim/Não único; F3 contrato Sim/Não normal.
4.10.3: F5 análises terceirizadas mensais de um lote envasado.
"""
from pathlib import Path
import json,re,subprocess,hashlib

def once(source,old,new,file):
    if old in source:
        assert source.count(old)==1,(file,'marcador repetido',old[:100],source.count(old))
        return source.replace(old,new,1)
    assert source.count(new)==1,(file,'marcador ausente',old[:120])
    return source

for name in ("individual.html","equipe.html"):
    p=Path(name)
    h=p.read_text(encoding="utf-8")
    k="const BPF_PHRASES="
    i=h.index(k)+len(k)
    pages,n=json.JSONDecoder().raw_decode(h[i:])
    orig=hashlib.sha256(h[i:i+n].encode()).hexdigest()
    item4102=[r for pg in pages if pg['page']==11 for r in pg['rows'] if r['code']=='4.10.2']
    assert len(item4102)==1 and len(item4102[0]['phrases'])==3,(name,'frases 4.10.2')
    # Preserve the original laboratory requirements and the individual APPCC risk classes.
    assert len(item4102[0]['scopes'])==1 and all(f.get('appcc')=='PPR' for f in item4102[0]['phrases'])
    # Existing single-answer F engine.
    h=once(h,
       "function bpfUnifiedRow(row){return ['4.3.3','4.10.3','4.11.2'].includes(row.code);}",
       "function bpfUnifiedRow(row){return ['4.3.3','4.10.2','4.10.3','4.11.2'].includes(row.code);}",name)
    h=once(h,
       " else if(row.code==='4.11.2')parts=[",
       " else if(row.code==='4.10.2')parts=[\n"
       "   {label:'F1 — Laboratório próprio e/ou terceirizado',indices:[0,1],composite:true},\n"
       "   {label:'F3 — Contrato de terceirização',indices:[2],composite:false}\n"
       " ];\n"
       " else if(row.code==='4.11.2')parts=[",name)
    h=once(h,
       "function bpfUnifiedOption(row,e){\n if(row.code==='4.11.2')",
       "function bpfUnifiedOption(row,e){\n"
       " if(row.code==='4.10.2')return ['Laboratório próprio','Laboratório terceirizado','Contrato de terceirização'][e.index];\n"
       " if(row.code==='4.11.2')",name)

    # Label F5 must visibly state "terceirizadas" in form and compact PDF.
    h=once(h,
       "{label:'F5 — Cinco análises mensais de um lote envasado',indices:[15],composite:true}",
       "{label:'F5 — Cinco análises mensais terceirizadas de um lote envasado',indices:[15],composite:true}",name)
    h=once(h,
       "'Cinco análises mensais de um lote envasado',",
       "'Cinco análises mensais terceirizadas de um lote envasado',",name)

    # Scope fixes from earlier releases must stay in place.
    assert "if(page.page===1)return 'Condução '+scope.col;" in h,(name,'correção Condução ausente')
    assert "return 'Higienização de tampas';" in h,(name,'correção Tampas ausente')
    # Make F3 a single ordinary Sim/Não radio, without a checkbox to choose the contract.
    open_key="function bpfOpenUnifiedPhrases(row,page){"
    open_end="function bpfOpenPhrases(row,page){"
    start=h.index(open_key);end=h.index(open_end,start)
    editor=h[start:end]
    editor=once(editor,
      "  const checkArea=document.createElement('div');checkArea.className='bpf-unified-options';top.append(checkArea);",
      "  const checkArea=document.createElement('div');checkArea.className='bpf-unified-options';top.append(checkArea);\n"
      "  if(row.code==='4.10.2'&&panel.id===1){\n"
      "   top.style.display='block';checkArea.style.display='none';\n"
      "   radios.style.flexDirection='row';radios.style.borderRight='0';radios.style.gap='24px';\n"
      "  }",name)
    editor=once(editor,
      "    answer=key;values[answerKey]=answer;\n    updateNote();",
      "    answer=key;values[answerKey]=answer;\n"
      "    if(row.code==='4.10.2'&&panel.id===1){\n"
      "     chosen=new Set([panel.entries[0].name]);\n"
      "     values[selectedKey]=JSON.stringify([...chosen]);\n"
      "    }\n"
      "    updateNote();",name)
    editor=once(editor,
      "  for(const e of panel.entries){\n   if(row.scopes.length>1&&scopeLabel!==e.scope.name){",
      "  for(const e of (row.code==='4.10.2'&&panel.id===1?[]:panel.entries)){\n"
      "   if(row.scopes.length>1&&scopeLabel!==e.scope.name){",name)
    editor=once(editor,
      "hint.textContent='Marque uma ou várias opções e atribua uma única resposta Sim ou Não ao grupo.';",
      "hint.textContent=(row.code==='4.10.2'&&panel.id===1)\n"
      "   ?'Contrato de terceirização: escolha Sim ou Não e registre a observação.'\n"
      "   :'Marque uma ou várias opções e atribua uma única resposta Sim ou Não ao grupo.';",name)
    h=h[:start]+editor+h[end:]

    pos=h.index(k)+len(k)
    _,new_n=json.JSONDecoder().raw_decode(h[pos:])
    assert hashlib.sha256(h[pos:pos+new_n].encode()).hexdigest()==orig,(name,'BPF_PHRASES alterado')
    assert h.count("function bpfUnifiedRow(row){")==1
    assert h.count("if(row.code==='4.10.2')parts=[")==1
    assert h.count("Cinco análises mensais terceirizadas de um lote envasado")==2
    assert h.count("function bpfPdfGeneralSplit(full,font,form,pdf){")==1
    assert h.count("async function bpfAppendCompactAnnex(pdf){")==1
    assert h.count("function bpfAnnexRows(){")==1
    for token in ('function bpfPanels(page,row){','function bpfUnifiedOption(row,e){',
                  'function bpfOpenUnifiedPhrases(row,page){','function bpfAnnexRows(){'):
       at=h.index(token)
       a=h.rfind('<script',0,at);a=h.index('>',a)+1;b=h.index('</script>',at)
       check=subprocess.run(['node','--check'],input=h[a:b],text=True,capture_output=True)
       assert check.returncode==0,(name,token,check.stderr[:900])
    p.write_text(h,encoding="utf-8")
    print('VALIDADO',name,'4.10.2 F1 próprio e/ou terceirizado Sim/Não único, F3 contrato Sim/Não sem caixa; 4.10.3 F5 terceirizadas; PDF e riscos preservados.')

p=Path('index.html')
h=p.read_text(encoding='utf-8')
h,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"]+"',
            lambda m:'href="'+m.group(1)+'20261105-4102-laboratorios-4103-f5-terceirizadas"',h)
assert n==2,n
p.write_text(h,encoding='utf-8')
p=Path('sw-guia18.js')
h=p.read_text(encoding='utf-8')
h,n=re.subn(r"const CACHE='guia18-menu-[^']+';",
            "const CACHE='guia18-menu-v21-bpf20261105-4102-labs-f5-terceirizadas';",h)
assert n==1,n
p.write_text(h,encoding='utf-8')
print('URLs e cache atualizados para os dois modos.')
