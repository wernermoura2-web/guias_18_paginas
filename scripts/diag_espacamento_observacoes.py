#!/usr/bin/env python3
from pathlib import Path
import re
h=Path("individual.html").read_text(encoding="utf-8")
queries=[
 "function bpfMergeObservation(",
 "function bpfSyncObservation(row,page){",
 "function bpfSyncNCLists(){",
 "function bpfGeneralFullText(){",
 "function bpfPdfGeneralSplit(full,font,form,pdf){",
 "function bpfPdfGeneral",
 "function recalc(){",
 "function bpfSyncPCCFinal(){",
 "function bpfInitFields(data){",
 "function bpfAnnexRows(){",
 "function bpfAnnexCompactRecords(",
 "function bpfUnifiedOpen",
 "function bpfSyncUnifiedObservation(row,page){",
 "function bpfGroupNoteName(",
 "const BPF_OBSERVATION_FIELDS=",
 "const titles=",
 "className='text",
 "font-size:12px",
 "white-space:pre-wrap",
 "OBSERVAÇÕES GERAISRow1"
]
for q in queries:
 matches=list(re.finditer(re.escape(q),h))
 print('QUERY',q,'COUNT',len(matches))
 for m in matches[:2]:
  i=m.start()
  j=h.find('\nfunction ',i+len(q)) if q.startswith('function') else i+950
  if j<0:j=i+3500
  print('TEXT',q,repr(h[max(0,i-140):min(j,i+5000)]))
# key styles + PDF layout
for q in ['const obsFontSize','observations','OBSERVAÇÕES GERAIS','whiteSpace','pdf-lib','bpfGeneralFullText','bpfPdfGeneralSplit','bpfMergeObservation']:
 inds=[m.start() for m in re.finditer(re.escape(q),h)]
 print('KEY',q,'COUNT',len(inds),'positions',inds[-20:])
