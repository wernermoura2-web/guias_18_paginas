#!/usr/bin/env python3
from pathlib import Path
import re,json
html=Path("individual.html").read_text(encoding="utf-8")
for start,end in [
 ("function bpfOpenPhrases(row,page){","function bpfMountDescriptions(){"),
 ("function bpfSyncObservation(row,page){","function bpfOpenPhrases(row,page){"),
 ("function bpfInitFields(data){","function bpfSyncObservation(row,page){"),
 ("function bpfAnnexRows(){","</script><script>"),
 ("function bpfApplyAnswers(v){","function bpfOpenPhrases(row,page){")]:
 i=html.index(start)
 j=html.find(end,i+len(start))
 print('SECTION',start,repr(html[i:min(j,i+22000)]))
for term in ("oninput=()=>","bpfSyncObservation(row,page)","function bpfAggregateAnswers","bpfOpenPhrases(row","function bpfPdfAppendGeneralPages"):
 print('COUNTS',term,html.count(term))
for term in ("#bpf-editor","bpf-editor-controls","function bpfDismissEditor()","const RECOVERY_ADAPTER"):
 p=html.find(term)
 print('TOKEN',term,p,repr(html[max(0,p-160):p+420]))
