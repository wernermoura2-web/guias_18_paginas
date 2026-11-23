#!/usr/bin/env python3
"""Relatório de verificação da correspondência entre páginas PDF e índices HTML.
Leitura apenas; não altera os PDFs nem os campos editáveis.
"""
import base64,json,re
from pathlib import Path
import fitz

root=Path(__file__).resolve().parents[1]
out=root/'diagnostico-f-paginas-20261123'
out.mkdir(exist_ok=True)
pdfs=[
 'impressao/Guia_BPF_APPCC_Em_Branco_18_Paginas.pdf',
 'impressao/Guia_Editavel_em_Branco.pdf',
 'impressao/Guia_Editavel_Simplificado.pdf'
]
report={}
for name in pdfs:
 with fitz.open(root/name) as pdf:
  assert 'bpf-frases-f-paridade-html-20261123-v29' in (pdf.metadata.get('keywords') or ''), 'PDF ainda não está na revisão v29: '+name
  pages=[]
  for i in range(3,min(10,len(pdf))):
   page=pdf[i]
   txt=page.get_text(sort=True)
   pix=page.get_pixmap(matrix=fitz.Matrix(.55,.55),alpha=False)
   # Padroniza páginas pequenas para inspeção visual via arquivo base64.
   key=Path(name).stem.replace('Guia_','')+'_'+str(i+1).zfill(2)
   (out/(key+'.png.b64')).write_text(base64.b64encode(pix.tobytes('png')).decode('ascii'))
   if i in (6,7,8):
    if i==6: clip=fitz.Rect(40,287,553,448)
    else: clip=fitz.Rect(38,355 if page.rect.width<550 else 372,
                         page.rect.width-10,615 if page.rect.width>550 else 567)
    crop=page.get_pixmap(matrix=fitz.Matrix(1.8,1.8),clip=clip,alpha=False)
    (out/(key+'.crop.png.b64')).write_text(base64.b64encode(crop.tobytes('png')).decode('ascii'))
   pages.append({
    'pdf_index':i,'page_one_based':i+1,
    'dimensions_pt':[round(page.rect.width,2),round(page.rect.height,2)],
    'text_sample':re.sub(r'\\s+',' ',txt[:600]),
    'tokens_found':[t for t in ['4.5.2','4.5.3','4.6.3','4.6.6','4.6.9','4.6.12'] if t in txt],
    'images':len(page.get_images(full=True)),
    'annotations':len(list(page.widgets() or [])),
    'preview_key':key+'.png.b64'
   })
  report[name]={'pages_total':len(pdf),'pages':pages,
                'pdf_keywords':(pdf.metadata.get('keywords') or '')}
(out/'mapeamento.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('Verificação registrada em diagnostico-f-paginas-20261123/mapeamento.json')
for name,info in report.items():
 print(name, 'total',info['pages_total'])
 for p in info['pages']:
  print(' ',p['page_one_based'],p['dimensions_pt'],p['tokens_found'],p['text_sample'][:90])
