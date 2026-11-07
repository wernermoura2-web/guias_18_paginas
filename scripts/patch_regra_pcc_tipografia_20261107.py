#!/usr/bin/env python3
"""Ajusta a tipografia da Regra PCC no PDF embutido e no fundo HTML."""
import base64,json,re
from pathlib import Path
import fitz
ROOT=Path(__file__).resolve().parents[1]
VER='20261107-pcc-regular-v3'
for mode in ['individual.html','equipe.html']:
 p=ROOT/mode;s=p.read_text(encoding='utf-8')
 m=re.search(r'const BPF_EMBEDDED_PDF="([^"]+)"',s);assert m,mode
 pdf=fitz.open(stream=base64.b64decode(m[1]),filetype='pdf')
 page=pdf[17];spans=[]
 for b in page.get_text('dict')['blocks']:
  for line in b.get('lines',[]):
   for span in line.get('spans',[]):
    if 'REGRA PCC' in span['text'].upper() or 'QUALQUER REQUISITO' in span['text'].upper():
     spans.append((span['text'],fitz.Rect(span['bbox'])))
 print(mode,'regra',[(t,tuple(round(x,1) for x in r)) for t,r in spans],flush=True)
 # O texto original pode estar rasterizado no fundo, sem spans pesquisáveis.
 # Corrigir diretamente a faixa vermelha da matriz, inclusive no PDF.
 box=fitz.Rect(115,202.5,410,222.4)
 page.draw_rect(box,fill=(0.879,0.298,0.286),color=None,overlay=True)
 lines=['REGRA PCC — NÃO ATENDIMENTO DE','QUALQUER REQUISITO CLASSIFICADO COMO PCC']
 size=6.8
 for j,line in enumerate(lines):
  w=fitz.get_text_length(line,fontname='helv',fontsize=size)
  page.insert_text((box.x0+(box.width-w)/2,box.y0+7.1+j*8.1),line,fontname='helv',fontsize=size,color=(0,0,0),overlay=True)
 assert page.get_text().count('REGRA PCC')>=1
 raw=base64.b64encode(pdf.tobytes(garbage=3,deflate=True)).decode()
 s=s[:m.start(1)]+raw+s[m.end(1):]
 m=re.search(r'const GUIDE_DATA\s*=\s*',s);assert m
 data,end=json.JSONDecoder().raw_decode(s[m.end():]);end+=m.end()
 pix=pdf[17].get_pixmap(matrix=fitz.Matrix(1.5,1.5),annots=False)
 data['backgrounds'][17]='data:image/jpeg;base64,'+base64.b64encode(pix.tobytes('jpeg',jpg_quality=87)).decode()
 s=s[:m.end()]+json.dumps(data,ensure_ascii=False,separators=(',',':'))+s[end:]
 s=s.replace('const bpfPccRuleFont=await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold)','const bpfPccRuleFont=await pdf.embedFont(PDFLib.StandardFonts.Helvetica)')
 s=s.replace('Math.min(7.4,510/bpfPccRuleFont.widthOfTextAtSize(bpfPccRuleText,7.4)*7.4)','Math.min(6.3,510/bpfPccRuleFont.widthOfTextAtSize(bpfPccRuleText,6.3)*6.3)')
 s=s.replace('font:bold 0.86cqw Arial,sans-serif','font:normal 0.72cqw Arial,sans-serif')
 p.write_text(s+'\n<!-- '+VER+' -->\n',encoding='utf-8')
 print(mode,'salvo',flush=True)
p=ROOT/'sw-guia18.js';s=p.read_text();s=re.sub(r"(const CACHE\s*=\s*['\"])[^'\"]+",lambda m:m[1]+'guia18-'+VER,s,count=1);p.write_text(s)
p=ROOT/'index.html';s=p.read_text();s=re.sub(r'(href="./(?:individual|equipe)\.html\?v=)[^"]+',lambda m:m[1]+VER,s);p.write_text(s)
