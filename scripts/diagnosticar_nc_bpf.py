#!/usr/bin/env python3
"""Read-only diagnostic of concise nonconformity labeling inputs."""
import json,re
from pathlib import Path
s=Path("individual.html").read_text(encoding="utf-8")
needle="const BPF_PHRASES="
start=s.index(needle)+len(needle)
pages,_=json.JSONDecoder().raw_decode(s[start:])
for p in pages:
 r=p["rows"]
 if p["page"]<9:
  print("PAGE",p["page"],"row codes",[x["code"] for x in r][:5],"firstscope",r[0]["scopes"][0].get("col") if r[0].get("scopes") else None)
 if p["page"] in (2,3,4,5):
  row=[x for x in r if x["code"]=="4.3.5"]
  if row:
   print("4335",p["page"],"scopes",[(x["col"],x["name"],[(f.get("appcc"),f["text"][:45]) for f in x["phrases"]]) for x in row[0]["scopes"]])
for term in ("const titles=", "let titles=", "titles=", "function bpfSyncNCLists(){","function bpfSyncPCCFinal(){","function bpfSyncObservation(", "fill_2", "fill_3", "fill_4", "fill_5","const PCCFinal=", "statement:"):
 pos=s.find(term)
 print("CODE",term,pos,repr(s[max(0,pos-160):pos+2800]) if pos>=0 else "")
print("FILL SAMPLE",re.findall(r'.{0,100}fill_[2-5].{0,110}',s[:500000])[:15])
