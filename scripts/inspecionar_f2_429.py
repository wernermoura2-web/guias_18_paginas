#!/usr/bin/env python3
"""Conferir F2 do item 4.2.9 antes da inclusão de Não se aplica."""
from pathlib import Path
import json
s=Path("individual.html").read_text(encoding="utf-8")
needle="const BPF_PHRASES="
start=s.index(needle)+len(needle)
obj,end=json.JSONDecoder().raw_decode(s[start:])
for page in obj:
 for row in page.get("rows",[]):
  if row.get("code") == "4.2.9":
   print("ITEM_429",json.dumps({"page":page.get("page"),"row":row},ensure_ascii=False)[:12000])
for term in ("function bpfOpenPhrases","function bpfPhraseName","function bpfApply", "Não se aplica","Não se aplica</","scope.phrases.forEach","phrase.appcc"):
 i=s.find(term)
 if i>=0:
  a=i-300 if i>300 else 0
  print("CODIGO",term,repr(s[a:i+16500 if term=="function bpfOpenPhrases" else i+2700]))
 else:
  print("AUSENTE",term)
