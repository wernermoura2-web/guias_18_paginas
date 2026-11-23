#!/usr/bin/env python3
"""Sincroniza as paginas legais 7-9 dos PDFs com a imagem exibida no HTML.
Nenhum campo, texto de observacao, item APPCC ou regra de risco e editado.
Os tres PDFs de distribuicao e os PDFs-base embutidos nos dois HTMLs
recebem exatamente os mesmos pixels das frases F do formulario atual.
"""
from __future__ import annotations
import base64
import io
import json
import re
import subprocess
import sys
import time
from pathlib import Path

import fitz
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
REVISION='bpf-frases-f-paridade-html-20261123-v30'
TARGETS=(
  'impressao/Guia_BPF_APPCC_Em_Branco_18_Paginas.pdf',
  'impressao/Guia_Editavel_em_Branco.pdf',
  'impressao/Guia_Editavel_Simplificado.pdf',
)
HTMLS=('individual.html','equipe.html')
EMBEDDED=re.compile(r'(const BPF_EMBEDDED_PDF=")([A-Za-z0-9+/=]+)(";)')


def capture():
    server=subprocess.Popen([sys.executable,'-m','http.server','8765','--bind','127.0.0.1'],
        cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.STDOUT)
    try:
        time.sleep(1)
        with sync_playwright() as playwright:
            browser=playwright.chromium.launch(headless=True,args=['--no-sandbox'])
            page=browser.new_page(viewport={'width':1280,'height':960})
            page.goto('http://127.0.0.1:8765/abrir-guia-corrigido.html?modo=equipe&v='+REVISION,
                wait_until='domcontentloaded',timeout=90000)
            def ready():
                return page.evaluate("""() => {
                    const d=document.querySelector('#formulario')?.contentDocument;
                    if(!d||!d.querySelector('#pages'))return false;
                    return [6,7,8].every(i=>{
                       const img=d.querySelector('#pages > .page[data-page="'+i+'"] img.bpf-legal-f-screen');
                       if(!img||!img.complete||!img.src.startsWith('data:image/png;base64,'))return false;
                       return img.dataset.bpfFPadraoV28==='1';
                    });
                }""")
            page.wait_for_function("""() => {
                const d=document.querySelector('#formulario')?.contentDocument;
                if(!d||!d.querySelector('#pages'))return false;
                return [6,7,8].every(i=>{
                    const img=d.querySelector('#pages > .page[data-page="'+i+'"] img.bpf-legal-f-screen');
                    return !!img&&img.complete&&img.src.startsWith('data:image/png;base64,')
                      &&img.dataset.bpfFPadraoV28==='1';
                });
            }""",timeout=80000)
            assert ready(), 'Camadas F incompletas'
            diagnostics=page.evaluate("""() => {
                const d=document.querySelector('#formulario').contentDocument;
                const diag=d.defaultView.BPFFrasesPadraoCompletoV28;
                return {pages:diag?.pages||[],rows:diag?.rows||[],errors:diag?.errors||[]};
            }""")
            assert not diagnostics['errors'],('Erros na tipografia',diagnostics['errors'])
            assert sorted(set(diagnostics['pages']))==[7,8,9],diagnostics['pages']
            assert len(diagnostics['rows'])>=25,('Frases desenhadas',len(diagnostics['rows']))
            print('Padronizacao completa:',len(diagnostics['rows']),'itens F verificados')
            entries=page.evaluate("""() => {
                const d=document.querySelector('#formulario').contentDocument;
                return [6,7,8].map(i=>{
                    const img=d.querySelector('#pages > .page[data-page="'+i+'"] img.bpf-legal-f-screen');
                    const g=d.defaultView.bpfLegalFGeometry?.[i];
                    if(!g)throw Error('Geometria F ausente: '+i);
                    const pct=key=>Number.parseFloat(img.style[key])/100;
                    return {page:i,data:img.src.split(',')[1],
                        left:pct('left'),top:pct('top'),
                        width:pct('width'),height:pct('height'),
                        expectedWidth:g.width,expectedHeight:g.height};
                });
            }""")
            browser.close()
        overlays=[]
        for entry in entries:
            raw=base64.b64decode(entry.pop('data'))
            assert raw.startswith(bytes.fromhex('89504e470d0a1a0a')), 'Camada legal nao e PNG'
            overlays.append((entry,raw))
            print('Camada HTML capturada: pagina',entry['page']+1,'bytes',len(raw))
        return overlays
    finally:
        server.terminate()
        try:server.wait(timeout=10)
        except subprocess.TimeoutExpired:server.kill()


def pdf_fields(pdf):
    return sum(sum(1 for _ in (page.widgets() or ())) for page in pdf)


def patch_pdf(data:bytes,overlays,reference:str):
    with fitz.open(stream=data,filetype='pdf') as pdf:
        if REVISION in (pdf.metadata.get('keywords') or ''):
            print('Ja revisado:',reference)
            return data
        assert len(pdf)>=9,(reference,'PDF sem as paginas legais')
        original_fields=pdf_fields(pdf)
        for spec,raw in overlays:
            page=pdf[spec['page']]
            width,height=page.rect.width,page.rect.height
            sx=width/spec['expectedWidth']
            sy=height/spec['expectedHeight']
            # Os guias em branco usam a pagina longa 4.6 em escala A4:
            # 595 x 918 pt -> aproximadamente 545 x 841 pt. A escala e uniforme.
            assert .7<sx<1.2 and abs(sx-sy)<.004,(
                reference,'geometria/escala incompativel com o HTML',spec['page']+1,
                (width,height),(spec['expectedWidth'],spec['expectedHeight']),sx,sy)
            rect=fitz.Rect(width*spec['left'],height*spec['top'],
                 width*(spec['left']+spec['width']),height*(spec['top']+spec['height']))
            assert rect.is_valid and not rect.is_empty
            page.insert_image(rect,stream=raw,keep_proportion=False,overlay=True)
        meta=dict(pdf.metadata)
        meta['keywords']=((meta.get('keywords') or '')+'; '+REVISION).strip('; ')
        pdf.set_metadata(meta)
        changed=pdf.tobytes(garbage=3,deflate=True,deflate_images=True)
        assert pdf_fields(pdf)==original_fields,(reference,'Campos de formulario alterados')
    with fitz.open(stream=changed,filetype='pdf') as check:
        assert len(check)>=9 and pdf_fields(check)==original_fields,(
            reference,'Campos editaveis nao preservados')
    return changed


def main():
    overlays=capture()
    changes={}
    for item in TARGETS:
        path=ROOT/item
        before=path.read_bytes()
        after=patch_pdf(before,overlays,item)
        if after!=before:changes[path]=after
        print('PDF',item,'antigo',len(before),'novo',len(after))
    for name in HTMLS:
        path=ROOT/name
        source=path.read_text(encoding='utf8')
        matches=list(EMBEDDED.finditer(source))
        assert len(matches)==1,(name,'PDF-base embutido nao localizado uma unica vez')
        match=matches[0]
        old=base64.b64decode(match.group(2))
        new=patch_pdf(old,overlays,name+':PDF-base')
        if old!=new:
            replacement=match.group(1)+base64.b64encode(new).decode('ascii')+match.group(3)
            revised=source[:match.start()]+replacement+source[match.end():]
            assert revised.count('const BPF_EMBEDDED_PDF=')==1
            changes[path]=revised.encode('utf8')
        print('HTML',name,'PDF-base',len(old),'->',len(new))
    for path,data in changes.items():
        path.write_bytes(data)
        print('ATUALIZADO',path.relative_to(ROOT),len(data))
    assert changes,'Nenhuma alteracao foi necessaria'
    print('OK:',len(changes),'arquivos sincronizados; paragrafos, formulas e formularios preservados')


if __name__=='__main__':
    main()
