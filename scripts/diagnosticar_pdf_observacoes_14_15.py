#!/usr/bin/env python3
"""Diagnóstico somente-leitura do PDF BPF: impressão e PDF editável."""
from pathlib import Path
import re
s=Path("individual.html").read_text(encoding="utf-8")
terms=["bpfObservationFontSize","PDFLib.PDFDocument","PDFLib.","#print","id=\"print\"","baixar-pdf","bpfPdf","PDF editável","Gerar PDF","downloadPdf","pdf.save","document.querySelector('#print')","@media print","function sync(){","function bpfGeneralFlow(full)"]
for term in terms:
 positions=[m.start() for m in re.finditer(re.escape(term),s)]
 print("COUNT",term,len(positions),"positions",positions[:15])
 for i in positions[:5]:
  if i<110000 or (12370000<i<12960000) or term=="bpfObservationFontSize":
   n=5000 if term in ("bpfObservationFontSize","PDFLib.PDFDocument","pdf.save","@media print","function bpfGeneralFlow(full)") else 950
   print("CONTEXT",term,i,repr(s[max(0,i-180):i+n]))
print("SCRIPTS FINAL")
for m in list(re.finditer(r'<script',s))[-9:]:
 i=m.start()
 print("SCRIPTPOS",i,repr(s[i:i+110]))
print("STYLE PRINT")
for m in list(re.finditer(r'@media print',s))[:4]:
 i=m.start()
 print("PRINT",i,repr(s[max(0,i-60):i+4800]))
