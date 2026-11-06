#!/usr/bin/env python3
"""Inspecionar menus, orientação/F e persistência JSON sem alterar o Guia."""
from pathlib import Path
import json,re
s=Path("individual.html").read_text(encoding="utf8")
print("HTML_SIZE",len(s))
for token in [
 "const D=GUIDE_DATA","bpfInitFields(D);","function bpfInitFields(data){","function bpfOpenPhrases(row,page){",
 "function bpfOpenUnifiedPhrases(row,page){","function bpfApplyAnswers(v){","function sync(){",
 "function bpfMountDescriptions(){","function bpfInitGroupFields(data){",
 "function bpfPdfGeneralSplit(full,font,form,pdf){","document.querySelector('#save')","document.querySelector('#open')",
 "document.querySelector('#load')","document.querySelector('#new')","function parseJson","JSON.stringify(state",
 "function saveFile","const state=","const state =","const state={","state._summaries={};",
 "bpf-f'","bpf-f\"","Orientação ao inspetor:","guidance.textContent","const BPF_PHRASES=",
 "function bpfSyncPCCFinal(){","function bpfAnnexRows(){"
]:
 occurrences=[m.start() for m in re.finditer(re.escape(token),s)]
 print("TOKEN",repr(token),"COUNT",len(occurrences),"AT",occurrences[:8])
 for i in occurrences[:2]:
  n=4600 if token in ["function bpfApplyAnswers(v){","function bpfInitFields(data){","function bpfMountDescriptions(){","function bpfOpenPhrases(row,page){","document.querySelector('#save')","const state=","const state={","state._summaries={};"] else 1200
  print("CONTENT",token,repr(s[max(0,i-350):i+n]))
print("MENU START",repr(s[120000:122800]))
print("BODY LAST",repr(s[-14500:])[:14500])
