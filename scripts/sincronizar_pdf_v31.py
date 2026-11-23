#!/usr/bin/env python3
"""Aplica as camadas v31 aos três PDFs de distribuição, preservando AcroForms."""
from pathlib import Path
import base64
import json
import re
import sys
import fitz

ROOT = Path(__file__).resolve().parents[1]
TARGETS = ('Guia_BPF_APPCC_Em_Branco_18_Paginas.pdf',
           'Guia_Editavel_em_Branco.pdf', 'Guia_Editavel_Simplificado.pdf')
REVISION = 'bpf-frases-f-paridade-html-20261123-v31'

def widgets(doc):
    return [(i,w.field_name,w.field_type,w.field_value,tuple(w.rect),w.field_flags)
            for i,p in enumerate(doc) for w in p.widgets() or ()]

def patch_bytes(data, label, specs, assets, render=True):
    with fitz.open(stream=data,filetype='pdf') as doc:
        if REVISION in (doc.metadata.get('keywords') or ''):
            return data
        before = widgets(doc)
        pages = len(doc)
        for s in specs:
            p=doc[s['page']]
            w,h=p.rect.width,p.rect.height
            assert abs(w/s['expectedWidth']-h/s['expectedHeight'])<.004
            r=fitz.Rect(w*s['left'],h*s['top'],w*(s['left']+s['width']),h*(s['top']+s['height']))
            p.insert_image(r,filename=str(assets/s['filename']),keep_proportion=False,overlay=True)
        meta=dict(doc.metadata)
        meta['keywords']=((meta.get('keywords') or '')+'; '+REVISION).strip('; ')
        doc.set_metadata(meta)
        output=doc.tobytes(garbage=3,deflate=True,deflate_images=True)
    with fitz.open(stream=output,filetype='pdf') as check:
        assert len(check)==pages and widgets(check)==before, f'Campos alterados: {label}'
        if render:
            for s in specs:
                check[s['page']].get_pixmap(matrix=fitz.Matrix(1.5,1.5),annots=True).save(assets/f'{Path(label).stem}-{s["page"]+1}.png')
    print(f'{label}: {pages} páginas, {len(before)} campos preservados')
    return output

def main():
    assets=Path(sys.argv[1])
    specs=json.loads((assets/'specs.json').read_text())
    for target in TARGETS:
        p=ROOT/'impressao'/target
        p.write_bytes(patch_bytes(p.read_bytes(),target,specs,assets))
    blank=ROOT/'impressao'/TARGETS[0]
    blank.with_suffix('.pdf.b64').write_bytes(base64.b64encode(blank.read_bytes()))
    embedded=re.compile(r'(const BPF_EMBEDDED_PDF=")([A-Za-z0-9+/=]+)(";)')
    for name in ('equipe.html','individual.html'):
        p=ROOT/name
        source=p.read_text(encoding='utf-8')
        match=embedded.search(source)
        assert match and len(list(embedded.finditer(source)))==1
        pdf=patch_bytes(base64.b64decode(match.group(2)),name,specs,assets,render=False)
        p.write_text(source[:match.start(2)]+base64.b64encode(pdf).decode('ascii')+source[match.end(2):],encoding='utf-8')

if __name__=='__main__':
    main()
