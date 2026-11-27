from pathlib import Path
import io
import fitz
from reportlab.platypus import SimpleDocTemplate, Image
from reportlab.lib.pagesizes import A4
from atualizar_documentos_v84 import ROOT, OUT, para, NAVY, header

path=ROOT/'Manual_de_Preenchimento_Guia_BPF_APPCC.pdf'
with fitz.open(OUT/'Anexo_F_20_Paginas_Retrato.pdf') as annex:
    pix=annex[1].get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False)
    pix.save(ROOT/'assets/manual/anexo-f-v85.png')
    count=len(annex)
with fitz.open(path) as doc:
    # Preserve as páginas e ilustrações anteriores, corrigindo somente os nomes obsoletos.
    replacements=[('Imprimir Anexo em Branco','Imprimir Anexo F'),('Anexo F de 20 páginas','Anexo F de campo'),('Anexo F com observações de 20 páginas','Anexo F para preenchimento')]
    for page in doc:
        edits=[]
        for old,new in replacements:
            for rect in page.search_for(old):
                # Apenas correspondências completas, sem atingir quebras de linha.
                if old.casefold() not in page.get_textbox(rect).replace('\n',' ').casefold():continue
                edits.append((rect,new));page.add_redact_annot(rect,fill=(1,1,1))
        if edits:
            page.apply_redactions(images=0,graphics=0)
            for rect,new in edits:
                size=min(rect.height*.75,fitz.get_text_length(new,fontname='helv',fontsize=1)**-1*rect.width)
                page.insert_text((rect.x0,rect.y1-rect.height*.2),new,fontname='helv',fontsize=size,color=(.1,.17,.22))
    old=[i for i,p in enumerate(doc) if 'ANEXO F V85 - FORMULÁRIO DE CAMPO' in p.get_text()]
    for i in reversed(old):doc.delete_page(i)
    buf=io.BytesIO();title='ANEXO F V85 - FORMULÁRIO DE CAMPO'
    story=[para('Novo Anexo F para preencher',17,True,NAVY),para(f'No menu Mais opções, selecione Imprimir Anexo F para preencher. O formulário de {count} páginas é organizado por processo e item. A opção resumida foi retirada. Imprima apenas as páginas pertinentes à inspeção ou capacitação.',10),para('Leia a frase, marque Sim ou Não por unidade e registre OBS ou NC. As perguntas complementares aparecem depois da avaliação; leia a orientação antes de responder.',10),Image(str(ROOT/'assets/manual/anexo-f-v85.png'),width=370,height=370*pix.height/pix.width),para('Exemplo de página do formulário em branco, com pautas próprias para preenchimento manuscrito.',9)]
    SimpleDocTemplate(buf,pagesize=A4,leftMargin=38,rightMargin=38,topMargin=52,bottomMargin=38).build(story,onFirstPage=lambda c,d:header(c,d,title),onLaterPages=lambda c,d:header(c,d,title))
    with fitz.open(stream=buf.getvalue(),filetype='pdf') as supp:doc.insert_pdf(supp,start_at=2)
    meta=doc.metadata;meta['keywords']='v85 — 27/11/2026';doc.set_metadata(meta)
    data=doc.tobytes(garbage=3,deflate=True)
path.write_bytes(data)
