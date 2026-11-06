#!/usr/bin/env python3
"""4.10.3 F4, F5, F6: resposta única Sim/Não sem checkbox redundante.
Mantém checkbox múltiplo nas análises dos F1-F3 e no laboratório do 4.10.2.
"""
from pathlib import Path
import subprocess, re, json, hashlib

version="20261106-4103-f456-sim-nao"

for filename in ("individual.html", "equipe.html"):
    path=Path(filename)
    html=path.read_text(encoding="utf-8")
    beg=html.index("function bpfOpenUnifiedPhrases(row,page){")
    end=html.index("function bpfOpenPhrases(row,page){",beg)
    editor=html[beg:end]
    before="row.code==='4.10.2'&&panel.id===1"
    assert editor.count(before)==4,(filename,"4.10.2 condition count",editor.count(before))
    condition="(row.code==='4.10.2'&&panel.id===1)||(row.code==='4.10.3'&&panel.id>=3)"
    editor=editor.replace(before,condition)

    # F4-F6 do not display a second checkbox for the sole criterion.
    # Selecting Sim or Não automatically sets the original F15, F16 or F17 answer.
    old="   ?'Contrato de terceirização: escolha Sim ou Não e registre a observação.'"
    new="   ?'Escolha Sim ou Não para esta verificação e registre a observação correspondente.'"
    assert editor.count(old)==1,(filename,"hint marker")
    editor=editor.replace(old,new)

    # For old saved files, ensure single-item group state is normalized on opening
    # only when a prior answer exists, preserving unassessed groups as unassessed.
    start="  if(answer&&!values[answerKey])values[answerKey]=answer;"
    replacement=start+"""
  if(((row.code==='4.10.2'&&panel.id===1)||(row.code==='4.10.3'&&panel.id>=3))&&answer&&!chosen.size){
   chosen.add(panel.entries[0].name);
   values[selectedKey]=JSON.stringify([...chosen]);
   bpfUnifiedApply(page,row,panel);
  }"""
    assert editor.count(start)==1,(filename,"old saved answer marker")
    editor=editor.replace(start,replacement)

    # Make the one-answer panel look deliberate without leaving the empty options column.
    assert editor.count("top.style.display='block';checkArea.style.display='none';")==1,(filename,"single answer layout")
    html=html[:beg]+editor+html[end:]

    assert html.count("function bpfOpenUnifiedPhrases(row,page){")==1
    assert html.count("function bpfPdfGeneralSplit(full,font,form,pdf){")==1
    assert html.count("async function bpfAppendCompactAnnex(pdf){")==1
    for token in ("function bpfOpenUnifiedPhrases(row,page){","function bpfAnnexRows(){"):
        pos=html.index(token)
        x=html.rfind("<script",0,pos)
        x=html.index(">",x)+1
        y=html.index("</script>",pos)
        chk=subprocess.run(["node","--check"],input=html[x:y],capture_output=True,text=True)
        assert chk.returncode==0,(filename,token,chk.stderr[:1000])

    marker="const BPF_PHRASES="
    off=html.index(marker)+len(marker)
    pages,_=json.JSONDecoder().raw_decode(html[off:])
    items=[r for pg in pages if pg["page"]==11 for r in pg["rows"] if r["code"]=="4.10.3"]
    assert len(items)==1 and len(items[0]["phrases"])==17
    assert "Cinco análises mensais terceirizadas de um lote envasado" in html
    assert "Cinco unidades analisadas de todos os lotes envasados" in html
    assert "if(page.page===1)return 'Condução '+scope.col;" in html
    assert "Higienização de tampas" in html

    path.write_text(html,encoding="utf-8")
    print("VALIDADO",filename,"4.10.3 F4 F5 F6 Sim/Não simples; grupo 4.10.2 F3 preservado; APPCC, OBS/NC, PDF preservados.")

p=Path("index.html")
s=p.read_text(encoding="utf-8")
s,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"#]+(#[^"]*)?"',
    lambda m:'href="'+m.group(1)+version+(m.group(2) or '')+'"',s)
assert n==4,n
assert s.count('#revisar-inspetores')==2,"Revisão deve abrir pelo link do menu inicial"
p.write_text(s,encoding="utf-8")

p=Path("sw-guia18.js")
s=p.read_text(encoding="utf-8")
s,n=re.subn(r"const CACHE='guia18-menu-[^']+';","const CACHE='guia18-menu-v22-bpf20261106-f456-radio';",s)
assert n==1,n
p.write_text(s,encoding="utf-8")
print("Versões Individual e Equipe e cache atualizados.")
