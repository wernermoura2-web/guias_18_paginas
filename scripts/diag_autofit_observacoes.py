#!/usr/bin/env python3
from pathlib import Path
import re,json
s=Path("individual.html").read_text(encoding='utf8')
terms=[
"function sync(){","function render","function draw","function printPDF","async function","document.querySelector('#printPDF')","getTextField(","pdfField", "function bpfPdfGeneralSplit", "function bpfGeneralFlow","OBS 1","OBSERVAÇÕES GERAISRow1","textarea","className='text'","className='printable'","style.fontSize","window.print()", "downloadPDF", "bpfPdf", "fontSize", "autoFont", "fit", "function bpfSyncNCLists()"
]
for term in terms:
 ms=[m.start() for m in re.finditer(re.escape(term),s)]
 print("TERM",term,"COUNT",len(ms),"START",ms[:6],"END",ms[-5:])
 for i in ms[:3] if len(ms)<15 else ms[-3:]:
  print("FRAGMENT",term,repr(s[max(0,i-300):min(len(s),i+950)]))
# JS function sync and PDFs excerpt
for st,en in [('function sync(){','function aggregate('),('async function exportPDF','</script>'),('function bpfGeneralFlow(','function bpfSyncNCLists(){')]:
 a=s.find(st);b=s.find(en,a+len(st)) if a>=0 else -1
 if a>=0:
  print("BLOCK",st,"SIZE",b-a)
  print(s[a:min(b if b>=0 else a+14000,a+14500)])
# list JS script boundaries near PDF code, CSS at beginning, and display widgets.
for i in [s.find("function sync(){"),s.find("function bpfPdfGeneralSplit("),s.find("bpfPdfGeneralSplit(bpfGeneralFullText(")]:
 if i>=0:
  print("NEAR",i,repr(s[max(0,i-400):i+3000]))
