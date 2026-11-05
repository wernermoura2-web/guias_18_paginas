#!/usr/bin/env python3
"""Inspect row/scope structure of reception item 4.5.x for safely removing F3."""
import json
from pathlib import Path
h=Path("individual.html").read_text(encoding="utf-8")
marker="const BPF_PHRASES="
pages,_=json.JSONDecoder().raw_decode(h[h.index(marker)+len(marker):])
for page in pages:
 if page.get("page")!=6: continue
 for row in page["rows"]:
  print("ROW",row["code"],"rowphrases",len(row.get("phrases",[])))
  for sc in row["scopes"]:
   print(" SCOPE",sc["col"],sc["name"],"count",len(sc["phrases"]))
   for i,f in enumerate(sc["phrases"]):
    print("  F"+str(i+1),repr(f["text"][:155]),"NA",f.get("allowNA"))
