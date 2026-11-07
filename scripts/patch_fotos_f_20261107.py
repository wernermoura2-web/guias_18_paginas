import base64
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
RELEASE='20261107-fotos-f13'
W,H=595.32,841.92
MARGIN,GAP=18,6
WIDTH=(W-2*MARGIN-2*GAP)/3
CSS='''<style id="bpf-f-photo-style">
.bpf-f-photo-tools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 14px}
.bpf-f-photo-tools button{border:1px solid #1f627e;border-radius:8px;background:#e6f3fa;color:#163c50;font:600 15px Arial,sans-serif;min-height:44px;padding:8px 14px;cursor:pointer}
.bpf-f-photo-tools [role=status]{color:#334f60;font-size:14px}
#pages .bpf-photo-meta{font-size:clamp(8px,1.5cqw,13px)}
@media print{.bpf-f-photo-tools{display:none!important}}
</style>'''
JS=r"""
const BPF_PHOTO_PROCESS_CODES=['4.1','4.2','4.3','4.5','4.6','4.7','4.10','4.11'];
function bpfPhotoRank(process){
 const code=String(process||'').split(/\s/)[0];
 const index=BPF_PHOTO_PROCESS_CODES.indexOf(code);
 return index<0?BPF_PHOTO_PROCESS_CODES.length:index;
}
function bpfSortPhotos(v,pictures,lastSlot=''){
 const slots=TEAM18_PHOTO_SLOTS;
 const process=n=>'BPF_PhotoProcess_'+n,location=n=>'BPF_PhotoLocation_'+n;
 const entries=slots.filter(n=>pictures[n]).map((n,i)=>({n,i,data:pictures[n],process:v[process(n)]||'',location:v[location(n)]||''}));
 const destinations=slots.filter(n=>pictures[n]||!(v[process(n)]||v[location(n)]));
 entries.sort((a,b)=>bpfPhotoRank(a.process)-bpfPhotoRank(b.process)||(Number(a.n===lastSlot)-Number(b.n===lastSlot)||a.i-b.i));
 for(const n of destinations){delete pictures[n];v[process(n)]='';v[location(n)]='';}
 entries.forEach((entry,i)=>{
  const n=destinations[i];pictures[n]=entry.data;v[process(n)]=entry.process;v[location(n)]=entry.location;
 });
}
function bpfAddPhotoFromF(editor,row,page){
 const bar=document.createElement('div');bar.className='bpf-f-photo-tools';
 const button=document.createElement('button');button.type='button';button.textContent='Inserir foto';
 const status=document.createElement('span');status.setAttribute('role','status');
 button.onclick=()=>{
  if(!bpfFreePhotoSlot()){status.textContent='As 24 posições estão ocupadas. Libere uma posição nas páginas Fotos.';return;}
  const code=row.code.split('.').slice(0,2).join('.');
  const process=D.fields.BPF_PhotoProcess_Imagem1.options.find(option=>option.split(/\s/)[0]===code)||'';
  chooseImage('',{process,location:'Item '+row.code+' — '+titles[page.page].replace(/^4\.\d+\s+/,''),status});
 };
 bar.append(button,status);editor.append(bar);
}
function bpfFreePhotoSlot(){
 return TEAM18_PHOTO_SLOTS.find(n=>!images[n]&&!values['BPF_PhotoProcess_'+n]&&!values['BPF_PhotoLocation_'+n]);
}
"""
PDF_JS=r"""
function bpfPreparePhotoPdf(pdf,form,font){
 const color=PDFLib.rgb;
 const blue=color(.07,.23,.33),edge=color(.58,.67,.73),white=color(1,1,1);
 for(const i of [15,16]){
  const page=pdf.getPage(i),h=page.getHeight(),w=page.getWidth();
  for(const field of form.getFields()){
   if(!/^(?:BPF_Photo(?:Process|Location)_)?(?:Imagem|Foto_Extra_)(?:[1-9]|1[0-2])$/.test(field.getName()))continue;
   for(const widget of field.acroField.getWidgets()){
    const r=widget.getRectangle();
    widget.setNormalAppearance(pdf.context.register(pdf.context.flateStream('q Q',{Type:'XObject',Subtype:'Form',BBox:[0,0,r.width,r.height]})));
   }
   form.removeField(field);
  }
  page.drawRectangle({x:0,y:0,width:w,height:h,color:white});
  page.drawRectangle({x:18,y:h-74,width:w-36,height:43,color:color(.88,.93,.96)});
  page.drawText('GUIA ESTADUAL DE AVALIAÇÃO DO RISCO SANITÁRIO',{x:27,y:h-49,size:11,font,color:blue});
  page.drawText('Registro fotográfico '+(i-14)+' de 2',{x:27,y:h-64,size:9,font,color:blue});
  const fields=D.widgets.filter(w=>w.page===i);
  for(const widget of fields){
   const [x,y,x2,y2]=widget.rect,width=x2-x,height=y2-y,name=widget.name;
   if(TEAM18_PHOTO_SLOTS.includes(name)){
    page.drawRectangle({x,y,width,height,borderColor:edge,borderWidth:.6});
    page.drawText('Foto '+(TEAM18_PHOTO_SLOTS.indexOf(name)+1),{x:x+2,y:y2+2,size:7,font,color:blue});
   }else if(name.startsWith('BPF_Photo')){
    const field=form.createTextField(name);
    field.addToPage(page,{x,y,width,height,font,borderColor:edge,borderWidth:.5,textColor:blue,backgroundColor:white});
    field.setFontSize(8);field.setText(String(values[name]||''));
   }
  }
  page.drawText('Guia BPF — Registro fotográfico | Página '+(i+1),{x:18,y:30,size:8,font,color:blue});
 }
}
"""
# Remove os campos antigos antes de recriá-los, uma vez para as duas folhas.
PDF_JS=PDF_JS.replace(" for(const i of [15,16]){\n  const page=pdf.getPage(i),h=page.getHeight(),w=page.getWidth();\n  for(const field of form.getFields()){"," for(const field of form.getFields()){").replace("  }\n  page.drawRectangle({x:0"," }\n for(const i of [15,16]){\n  const page=pdf.getPage(i),h=page.getHeight(),w=page.getWidth();\n  page.drawRectangle({x:0",1)

for name in ['individual.html','equipe.html']:
 path=ROOT/name;s=path.read_text()
 if 'const BPF_PHOTO_PROCESS_CODES=' not in s:
  start=s.index('const GUIDE_DATA=')+len('const GUIDE_DATA=')
  d,length=json.JSONDecoder().raw_decode(s[start:])
  d['widgets']=[w for w in d['widgets'] if w['page'] not in (15,16)]
  for p,family in [(15,'Imagem'),(16,'Foto_Extra_')]:
   svg=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><rect width="{W}" height="{H}" fill="white"/><rect x="18" y="31" width="{W-36}" height="43" fill="#e0edf5"/><g fill="#123a54" font-family="Arial,sans-serif"><text x="27" y="49" font-size="11" font-weight="bold">GUIA ESTADUAL DE AVALIAÇÃO DO RISCO SANITÁRIO</text><text x="27" y="64" font-size="9">Registro fotográfico {p-14} de 2</text>']
   for i in range(12):
    n=family+str(i+1);x=MARGIN+(i%3)*(WIDTH+GAP);top=97+(i//3)*171
    if i>=6:
     for pre in ('','BPF_PhotoProcess_','BPF_PhotoLocation_'):
      d['fields'][pre+n]={**d['fields'][pre+family+'1'],'name':pre+n}
      if not pre:d['fields'][n]['label']=n
    boxes=[(n,top,133),('BPF_PhotoProcess_'+n,top+136,13),('BPF_PhotoLocation_'+n,top+151,14)]
    for field,y,h in boxes:
     d['widgets'].append({'name':field,'page':p,'rect':[round(x,3),round(H-y-h,3),round(x+WIDTH,3),round(H-y,3)],'size':[W,H]})
    svg.append(f'<text x="{x+2}" y="{top-2}" font-size="7">Foto {(p-15)*12+i+1}</text><rect x="{x}" y="{top}" width="{WIDTH}" height="133" fill="white" stroke="#94aab6" stroke-width=".6"/>')
   svg.append(f'<text x="18" y="{H-30}" font-size="8">Guia BPF — Registro fotográfico | Página {p+1}</text></g></svg>')
   d['backgrounds'][p]='data:image/svg+xml;base64,'+base64.b64encode(''.join(svg).encode()).decode()
  d['widgets'].sort(key=lambda w:w['page'])
  s=s[:start]+json.dumps(d,ensure_ascii=False,separators=(',',':'))+s[start+length:]
  s=s.replace('</head>',CSS+'</head>',1)
  needle="const title=document.createElement('h2');title.textContent='Item '+row.code+' — Frases';dlg.append(title);"
  assert s.count(needle)==2
  s=s.replace(needle,needle+'bpfAddPhotoFromF(dlg,row,page);')
  s=s.replace('function chooseImage(n){',JS+"\nlet bpfPhotoContext=null;\nfunction chooseImage(n,photo=null){bpfPhotoContext=photo;",1)
  s=s.replace("const file=e.target.files[0];if(!file)return;const n=e.target.dataset.target;", "const file=e.target.files[0],photo=bpfPhotoContext;bpfPhotoContext=null;if(!file)return;\n const target=e.target.dataset.target;",1)
  needle="images[n]=canvas.toDataURL('image/jpeg',.85);bitmap.close();changed();sync()"
  assert needle in s
  s=s.replace(needle,"""const n=photo?bpfFreePhotoSlot():target;if(!n){bitmap.close();if(photo)photo.status.textContent='Não há posições livres nas páginas Fotos.';return;}
  images[n]=canvas.toDataURL('image/jpeg',.85);bitmap.close();
  if(photo){values['BPF_PhotoProcess_'+n]=photo.process;values['BPF_PhotoLocation_'+n]=photo.location;bpfSortPhotos(values,images,n);photo.status.textContent='Foto inserida nas páginas Fotos.';}
  else if(TEAM18_PHOTO_SLOTS.includes(n))bpfSortPhotos(values,images,n);
  changed();sync()""",1)
  assert 'const file=e.target.files[0],photo=bpfPhotoContext' in s
  s=s.replace('/^(Imagem[1-6]|Foto_Extra_[1-6])$/','/^(?:Imagem|Foto_Extra_)(?:[1-9]|1[0-2])$/',1)
  s=s.replace("el.dataset.field=w.name;el.dataset.widget=i;", "if(w.name.startsWith('BPF_Photo'))el.classList.add('bpf-photo-meta');el.dataset.field=w.name;el.dataset.widget=i;",1)
  s=s.replace('async function bpfExportEditable(){',PDF_JS+'\nasync function bpfExportEditable(){',1)
  needle=' const pdfFlow=bpfPdfGeneralSplit(bpfGeneralFullText(),observationFont,form,pdf);'
  assert needle in s
  s=s.replace(needle,' bpfPreparePhotoPdf(pdf,form,observationFont);\n'+needle,1)
  s=s.replace(" const stats=mergeTeamExtras18(next,nextImages,view.incoming,extras,view.file);"," const stats=mergeTeamExtras18(next,nextImages,view.incoming,extras,view.file);if(extras.includes('photos'))bpfSortPhotos(next,nextImages);",1)
 path.write_text(s.replace('20261107-calendario-f12',RELEASE))
for name in ['index.html','sw-guia18.js','individual_atualizado.html','equipe_atualizado.html']:
 path=ROOT/name;path.write_text(path.read_text().replace('20261107-calendario-f12',RELEASE))

# Limpe referências antigas de widgets e deixe respiro entre as linhas.
FINAL='20261107-fotos-f14'
for name in ['individual.html','equipe.html']:
 path=ROOT/name;s=path.read_text()
 if 'const BPF_PHOTO_LAYOUT_V2=' not in s:
  start=s.index('const GUIDE_DATA=')+len('const GUIDE_DATA=')
  d,length=json.JSONDecoder().raw_decode(s[start:])
  for widget in d['widgets']:
   if widget['page'] not in (15,16):continue
   if widget['name'].startswith('BPF_Photo'):
    widget['rect'][1]+=6;widget['rect'][3]+=6
   else:widget['rect'][1]+=6
  for page in (15,16):
   pre,enc=d['backgrounds'][page].split(',',1)
   svg=base64.b64decode(enc).decode().replace('height="133"','height="127"')
   d['backgrounds'][page]=pre+','+base64.b64encode(svg.encode()).decode()
  s=s[:start]+json.dumps(d,ensure_ascii=False,separators=(',',':'))+s[start+length:]
  old="function bpfPreparePhotoPdf(pdf,form,font){"
  s=s.replace(old,"const BPF_PHOTO_LAYOUT_V2=true;\n"+old,1)
  needle='  page.drawRectangle({x:0,y:0,width:w,height:h,color:white});'
  assert needle in s
  s=s.replace(needle,"  page.node.set(PDFLib.PDFName.of('Annots'),pdf.context.obj([]));\n"+needle,1)
 path.write_text(s.replace(RELEASE,FINAL))
for name in ['index.html','sw-guia18.js','individual_atualizado.html','equipe_atualizado.html']:
 path=ROOT/name;path.write_text(path.read_text().replace(RELEASE,FINAL))

PHOTO_CONTROLS_CSS='''<style id="bpf-photo-controls-style">
@media screen{
#pages .bpf-gallery-picture{padding:0;overflow:hidden}
#pages .bpf-gallery-picture img{position:absolute;inset:0;width:100%;height:100%;max-width:none;max-height:none;object-fit:contain;object-position:center}
#pages .bpf-gallery-control{z-index:4;background:transparent!important;border:0!important;box-shadow:none!important;color:#132d3f;padding:0;text-align:right;font:700 clamp(10px,1.52cqw,14px)/1.1 Arial,sans-serif;text-shadow:0 0 2px white,0 0 4px white,-1px -1px 0 white,1px 1px 0 white;cursor:pointer}
#pages .bpf-gallery-remove{text-align:left}
#pages .bpf-gallery-control:focus-visible{outline:2px solid #176080;outline-offset:-2px}
#pages .bpf-gallery-control[hidden]{display:none!important}
}
@media print{.bpf-gallery-control{display:none!important}}
</style>'''
PHOTO_CONTROL_JS=r"""
function bpfRefreshGalleryControls(){
 for(const button of host.querySelectorAll('[data-bpf-gallery-slot]'))button.hidden=!images[button.dataset.bpfGallerySlot];
}
function bpfRemoveGalleryPhoto(name){
 if(!images[name])return;
 delete images[name];
 values['BPF_PhotoProcess_'+name]='';values['BPF_PhotoLocation_'+name]='';
 bpfSortPhotos(values,images);changed();sync();
}
"""
for name in ['individual.html','equipe.html']:
 path=ROOT/name;s=path.read_text()
 if 'id="bpf-photo-controls-style"' not in s:
  s=s.replace('</head>',PHOTO_CONTROLS_CSS+'</head>',1)
  needle="el.textContent='Adicionar imagem';el.dataset.image=w.name;"
  assert s.count(needle)==1
  s=s.replace(needle,needle+"if(w.page===15||w.page===16)el.classList.add('bpf-gallery-picture');",1)
  old="el.append(img);const span=document.createElement('span');span.textContent='Trocar imagem';el.append(span)"
  s=s.replace(old,"el.append(img);if(!el.classList.contains('bpf-gallery-picture')){const span=document.createElement('span');span.textContent='Trocar imagem';el.append(span)}",1)
  needle=" document.querySelector('#diagnostic').textContent="
  assert s.count(needle)==1
  s=s.replace(needle,' bpfRefreshGalleryControls();\n'+needle,1)
  s=s.replace('function sync(){',PHOTO_CONTROL_JS+'\nfunction sync(){',1)
  s=s.replace(' if(!images[name])return;button.disabled=true;', ' const original=images[name];if(!original)return;button.disabled=true;',1)
  s=s.replace('image.src=images[name];await image.decode();','image.src=original;await image.decode();if(images[name]!==original)return;',1)
  old=" const [x1,y1,x2,y2]=widget.rect;place(button,{...widget,rect:[x2-64,y2-17,x2-2,y2-2]});host.children[widget.page].append(button);"
  new=""" const [x1,y1,x2,y2]=widget.rect;
 const sheet=host.children[widget.page];
 if(widget.page===15||widget.page===16){
  button.classList.add('bpf-gallery-control');button.dataset.bpfGallerySlot=widget.name;
  place(button,{...widget,rect:[x2-82,y2-25,x2-4,y2-2]});
  const remove=document.createElement('button');remove.type='button';remove.className='overlay bpf-gallery-control bpf-gallery-remove';remove.textContent='Retirar foto';
  remove.setAttribute('aria-label','Retirar foto '+widget.name);remove.dataset.bpfGallerySlot=widget.name;remove.onclick=()=>bpfRemoveGalleryPhoto(widget.name);
  place(remove,{...widget,rect:[x1+4,y1+2,x1+88,y1+25]});
  sheet.append(remove);
 }else place(button,{...widget,rect:[x2-64,y2-17,x2-2,y2-2]});
 sheet.append(button);"""
  assert s.count(old)==1
  s=s.replace(old,new,1)
  needle="document.head.append(photoStyle);"
  s=s.replace(needle,needle+'bpfRefreshGalleryControls();',1)
 path.write_text(s.replace(FINAL,'20261107-fotos-f15'))
for name in ['index.html','sw-guia18.js','individual_atualizado.html','equipe_atualizado.html']:
 path=ROOT/name;path.write_text(path.read_text().replace(FINAL,'20261107-fotos-f15'))
