#!/usr/bin/env python3
"""Investigação, somente leitura, dos campos das Observações Gerais."""
from pathlib import Path
import re
s=Path('individual.html').read_text(encoding='utf-8')
markers=[
 ('PCCFINAL', 'const PCCFinal='),
 ('PCCFINAL2', 'PCCFinal='),
 ('SYNCNC', 'function bpfSyncNCLists(){'),
 ('SYNC_PCC', 'function bpfSyncPCCFinal(){'),
 ('AGG', 'function bpfAggregateAnswers('),
 ('APPLY', 'function bpfApplyAnswers('),
 ('SAVE', 'function bpfOpenPhrases('),
 ('OBS_GERAL', '"OBS 1":'),
 ('NCGenerated', 'BPF_NCGenerated'),
 ('RECALC', 'function recalc('),
 ('CHANGED', 'function changed('),
 ('BPF_MOUNT', 'bpfMountDescriptions()'),
]
for name,mark in markers:
 i=s.find(mark)
 if i<0:
  print('MISS',name,mark)
  continue
 limit=7800 if name in ('PCCFINAL','PCCFINAL2','SAVE','SYNCNC','RECALC') else 3600
 print('SECTION',name,'pos',i,'count',s.count(mark),repr(s[max(0,i-120):i+limit]))
for term in ("OBS 1","BPF_NCGenerated","PCCFinal.synchronize","bpfSyncNCLists()","BPF_PCCGenerated", "OBSERVAÇÕES GERAIS"):
 print('COUNT',repr(term),s.count(term))
for m in list(re.finditer('OBS 1',s))[:12]:
 i=m.start()
 print('OCCUR_OBS1',i,repr(s[max(0,i-190):i+190]))
