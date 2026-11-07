#!/usr/bin/env python3
"""Ajustes aprovados de observações e matriz de risco nos dois modos BPF."""
import base64,io,json,re,tempfile
from pathlib import Path
import fitz
from pypdf import PdfReader,PdfWriter
from pypdf.generic import NameObject,TextStringObject
ROOT=Path(__file__).resolve().parents[1]
HEIGHTS={7:918.0132,8:918.0132,9:922.74,10:923.16}

def process_pdf(raw,tmp):
 source=tmp/'source.pdf';source.write_bytes(raw)
 # Update all displayed process legends as well as the statewide matrix.
 p=fitz.open(stream=raw,filetype='pdf')
 for page in list(p)[:13]:
  for old,new in [('51 - 75 %','50 - 75 %'),('0 - 50 %','0 a < 50 %')]:
   for rect in page.search_for(old):
    page.add_redact_annot(rect,fill=(.94,.94,.94));page.apply_redactions(images=0,graphics=0)
    page.insert_textbox(fitz.Rect(rect.x0-2,rect.y0,rect.x1+5,rect.y1+4),new,fontsize=6.3,align=1)
  for rect in page.search_for('76 - 99 %'):
   # Replace the risk cells below this heading, keeping their geometry.
   for x1,x2,label,fill in [(312,392,'1 BAIXO',(0,.78,.32)),(392,472,'2 MÉDIO',(1,.94,0))]:
    y=rect.y1+1;page.draw_rect(fitz.Rect(x1,y,x2,y+11),fill=fill,color=(.3,.3,.3),width=.3);page.insert_text((x1+25,y+8),label,fontsize=6.5)
 page=p[17];page.add_redact_annot(fitz.Rect(65,109,552,223),fill=(1,1,1));page.apply_redactions(images=0,graphics=0)
 for j,(label,risk,fill) in enumerate([('>75 a 100%','BAIXO',(.65,.84,.39)),('50 a 75%','MÉDIO',(1,.93,.27)),('0 a <50%','ALTO',(.88,.3,.28))]):
  y=109+j*38;page.draw_rect(fitz.Rect(65,y,100,y+38),color=(.25,.25,.25),fill=(.95,.96,.96),width=.4);page.insert_textbox(fitz.Rect(66,y+13,99,y+34),label,fontsize=6.2,align=1)
  for col in range(8):
   x=100+col*41.38;page.draw_rect(fitz.Rect(x,y,x+41.38,y+38),color=(.25,.25,.25),fill=fill,width=.4);page.insert_textbox(fitz.Rect(x+1,y+13,x+40,y+34),risk,fontsize=7,align=1)
  page.draw_rect(fitz.Rect(439,y,552,y+38),color=(.25,.25,.25),fill=fill,width=.4);page.insert_textbox(fitz.Rect(440,y+13,551,y+34),risk,fontsize=8,align=1)
 # Reuse the validated geometry operation, on these current template bytes.
 p.save(tmp/'matrix.pdf')
 r=PdfReader(tmp/'matrix.pdf');w=PdfWriter();w.clone_document_from_reader(r)
 for obj in w._objects:
  if not isinstance(obj,dict) or '/JS' not in obj:continue
  js=obj['/JS'].get_object();txt=js.get_data().decode('latin1') if hasattr(js,'get_data') else str(js)
  txt=fix_calc(txt)
  obj[NameObject('/JS')]=TextStringObject(txt)
 with source.open('wb') as f:w.write(f)
 # Geometry implementation is kept below for deterministic HTML/PDF parity.
 return resize_pdf(source,tmp)

def fix_calc(txt):
 if 'ALTO' not in txt or 'isNaN(valor)' not in txt:return txt
 pos=txt.rfind('if (isNaN(valor))')
 if pos<0:return txt
 return txt[:pos]+'''if (isNaN(valor)) {event.value="";} else if(valor<50){event.value="ALTO";if(typeof campo!=="undefined")campo.strokeColor=color.red;} else if(valor<=75){event.value="MÉDIO";if(typeof campo!=="undefined")campo.strokeColor=color.yellow;} else {event.value="BAIXO";if(typeof campo!=="undefined")campo.strokeColor=color.green;}'''

def resize_pdf(source,tmp):
 from pypdf import Transformation
 from pypdf.generic import ArrayObject,FloatObject
 from reportlab.pdfgen import canvas
 path=source;r=PdfReader(path);w=PdfWriter();w.clone_document_from_reader(r)
 for idx,factor in [(7,1.69),(8,1.69),(9,1.5),(10,1.5)]:
  p=w.pages[idx];W=float(p.mediabox.width);H=float(p.mediabox.height)
  target=next(a.get_object() for a in p['/Annots'] if a.get_object().get('/T')==f'OBSERVAÇÕES GERAISRow1_{idx+1}')
  rect=[float(v) for v in target['/Rect']];delta=(rect[3]-rect[1])*(factor-1)
  p.add_transformation(Transformation().translate(0,delta));p.mediabox.upper_right=(W,H+delta);p.cropbox.upper_right=(W,H+delta)
  for a in p['/Annots']:
   o=a.get_object();v=[float(x) for x in o['/Rect']];o[NameObject('/Rect')]=ArrayObject([FloatObject(v[0]),FloatObject(v[1]+(0 if o is target else delta)),FloatObject(v[2]),FloatObject(v[3]+delta)])
  # Extend blank observation box and move only the footer down.
  b=io.BytesIO();c=canvas.Canvas(b,pagesize=(W,H+delta));c.setFillColorRGB(1,1,1);c.rect(0,0,W,rect[1]+delta+2,fill=1,stroke=0)
  c.setStrokeColorRGB(.25,.25,.25);c.setLineWidth(.4);c.line(42.55,rect[1]-1,552,rect[1]-1);c.line(42.55,rect[1]-1,42.55,rect[3]+delta);c.line(552,rect[1]-1,552,rect[3]+delta);c.save();p.merge_page(PdfReader(b).pages[0])
  # Restore the original footer at its original distance from the new lower edge.
  footer=PdfReader(path).pages[idx];footer.pop(NameObject('/Annots'),None);footer.cropbox.lower_left=(0,0);footer.cropbox.upper_right=(W,rect[1]-4);p.merge_page(footer)
  
 out=tmp/'resized.pdf'
 with out.open('wb') as f:w.write(f)
 
 # Redistribute the CQ rows: 4.10.1 gains exactly the height released by 4.12.6.
 r2=PdfReader(out);w2=PdfWriter();w2.clone_document_from_reader(r2);pg=w2.pages[11];H=float(pg.mediabox.height)
 oldtop=[127.1,185.2,243.0,300.8,358.6,416.4,474.2,532.1];delta=56.04*.5
 newtop=[oldtop[0]]+[v+delta for v in oldtop[1:7]]+[oldtop[7]]
 for a in pg['/Annots']:
  o=a.get_object();v=[float(x) for x in o['/Rect']];top=H-v[3];bottom=H-v[1]
  if o.get('/T')=='OBSERVAÇÕES4101':v[1]-=delta
  elif o.get('/T')=='OBSERVAÇÕES4126':v[3]-=delta
  elif 128<=top and bottom<=532 and v[0]>=85:
   shift=delta/2 if top<185 or top>=474 else delta;v[1]-=shift;v[3]-=shift
  o[NameObject('/Rect')]=ArrayObject([FloatObject(t) for t in v])
 b=io.BytesIO();c=canvas.Canvas(b,pagesize=(595.32,H));c.setFillColorRGB(1,1,1);c.rect(86.6,H-532.1,465.4,405,stroke=0,fill=1)
 for i,code in enumerate(['4.10.1','4.10.2','4.10.3','4.10.4','4.10.5','4.10.6','4.12.6']):
  top,bot=newtop[i],newtop[i+1];c.setLineWidth(.4);c.setStrokeColorRGB(.3,.3,.3)
  for x1,x2,fill in [(86.6,153,(.87,.93,.96)),(153,472.3,(1,1,1)),(472.3,552,(1,1,1))]:
   c.setFillColorRGB(*fill);c.rect(x1,H-bot,x2-x1,bot-top,stroke=1,fill=1)
  c.setFillColorRGB(0,0,0);c.setFont('Helvetica',6.5);c.drawCentredString(119.8,H-(top+bot)/2-2,code)
  c.setFont('Helvetica',6.5)
  if i<6:
   c.drawString(493,H-(top+bot)/2-2,'SIM');c.drawString(527,H-(top+bot)/2-2,'NÃO')
  else:
   c.drawString(485,H-(top+bot)/2-2,'SIM');c.drawString(510,H-(top+bot)/2-2,'NÃO');c.drawString(537,H-(top+bot)/2-2,'NA')
 c.save();pg.merge_page(PdfReader(b).pages[0])
 with out.open('wb') as f:w2.write(f)
 return out.read_bytes()

def patch_file(path,tmp):
 s=path.read_text()
 if 'bpf-dimensoes-20261106-v1' in s:return
 m=re.search(r'const GUIDE_DATA\s*=\s*',s);data,end=json.JSONDecoder().raw_decode(s[m.end():]);end+=m.end()
 raw=base64.b64decode(re.search(r'const BPF_EMBEDDED_PDF="([^"]+)"',s)[1]);original=fitz.open(stream=raw,filetype='pdf');newraw=process_pdf(raw,tmp);pdf=fitz.open(stream=newraw,filetype='pdf')
 heights={i:pdf[i].rect.height for i in range(len(pdf))}
 for widget in data['widgets']:
  i=widget['page'];v=widget['rect'];delta=heights[i]-original[i].rect.height
  if i in [7,8,9,10]:
   widget['rect']=[v[0],v[1]+(0 if widget['name']==f'OBSERVAÇÕES GERAISRow1_{i+1}' else delta),v[2],v[3]+delta];widget['size'][1]=heights[i]
  elif i==11:
   top=original[i].rect.height-v[3];bottom=original[i].rect.height-v[1];d=28.02
   if widget['name']=='OBSERVAÇÕES4101':widget['rect'][1]-=d
   elif widget['name']=='OBSERVAÇÕES4126':widget['rect'][3]-=d
   elif 128<=top and bottom<=532 and v[0]>=85:
    shift=d/2 if top<185 or top>=474 else d;widget['rect'][1]-=shift;widget['rect'][3]-=shift
 for field in data['fields'].values():field['calc']=fix_calc(field.get('calc',''))
 for i in [*range(13),17]:
  pix=pdf[i].get_pixmap(matrix=fitz.Matrix(1.5,1.5),annots=False);data['backgrounds'][i]='data:image/jpeg;base64,'+base64.b64encode(pix.tobytes('jpeg',jpg_quality=85)).decode()
 s=s[:m.end()]+json.dumps(data,ensure_ascii=False,separators=(',',':'))+s[end:]
 s=re.sub(r'const BPF_EMBEDDED_PDF="[^"]+"','const BPF_EMBEDDED_PDF="'+base64.b64encode(newraw).decode()+'"',s)
 # Page coordinates remain in PDF points; enlarged pages need their own denominator.
 config='const BPF_PAGE_HEIGHTS='+json.dumps(heights)+'; // bpf-dimensoes-20261106-v1\n'
 s=s.replace('const D=GUIDE_DATA, values={}',config+'const D=GUIDE_DATA, values={}',1)
 s=s.replace("page.dataset.page=i;","page.dataset.page=i;page.style.aspectRatio='595.32 / '+BPF_PAGE_HEIGHTS[i];",1)
 s=s.replace('100*bounds.top/841.92','100*bounds.top/BPF_PAGE_HEIGHTS[data.page]').replace('100*(bounds.bottom-bounds.top)/841.92','100*(bounds.bottom-bounds.top)/BPF_PAGE_HEIGHTS[data.page]')
 s=s.replace('100*info.top/841.89','100*info.top/BPF_PAGE_HEIGHTS[info.page]').replace('100*info.height/841.89','100*info.height/BPF_PAGE_HEIGHTS[info.page]')
 s=s.replace("/valor < 100/.test(s)?(p<100?'ALTO':'BAIXO'):(p<=50?'ALTO':p<=75?'MÉDIO':'BAIXO')","(p<50?'ALTO':p<=75?'MÉDIO':'BAIXO')")
 # Every phrase is available when the annex is requested, even in a blank guide.
 s=s.replace("row.scopes.filter(scope=>scope.phrases[i]&&(values[bpfPhraseName(scope,i)]||String(values[bpfNoteName(scope,i)]||'').trim()))","row.scopes.filter(scope=>scope.phrases[i])")
 s=s.replace('Somente frases preenchidas.','Todas as frases, inclusive sem resposta.')
 path.write_text(s)
 (tmp/(path.stem+'.pdf')).write_bytes(newraw)
 print(path.name,'updated',len(newraw), 'PDF bytes')

def main():
 with tempfile.TemporaryDirectory() as name:
  tmp=Path(name)
  for file in ['individual.html','equipe.html']:patch_file(ROOT/file,tmp)
 sw=ROOT/'sw-guia18.js'
 if sw.exists():
  s=sw.read_text();s=re.sub(r"(const CACHE[^=]*=\s*['\"])([^'\"]+)",lambda m:m[1]+m[2].split('-dimensoes-')[0]+'-dimensoes-20261106-v1',s,count=1);sw.write_text(s)
if __name__=='__main__':main()
