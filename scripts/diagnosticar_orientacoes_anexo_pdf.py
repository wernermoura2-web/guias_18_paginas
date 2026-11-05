#!/usr/bin/env python3
from pathlib import Path
import re
s=Path("individual.html").read_text(encoding="utf-8")
for key in ("function bpfAnnexRows(){","async function bpfAppendCompactAnnex(pdf){","function bpfAppendCompactAnnex(pdf){","Orientação ao inspetor:","Orientação ao inspetor","phrase.guidance","Frases BPF"):
 i=s.find(key)
 print("KEY",repr(key),"pos",i,"count",s.count(key))
 if i>=0 and key in ("function bpfAnnexRows(){","async function bpfAppendCompactAnnex(pdf){","function bpfAppendCompactAnnex(pdf){"):
  print("CODE",s[i:i+8500])
for m in list(re.finditer("Orientação ao inspetor",s))[:5]:
 print("OCC",m.start(),repr(s[m.start()-180:m.start()+260]))
