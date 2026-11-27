#!/usr/bin/env python3
"""Adiciona ao manual exemplos visuais de todos os processos, baseados no modelo atual."""
from pathlib import Path
import io
import fitz
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Image, PageBreak, Spacer
from atualizar_documentos_v84 import ROOT, MODEL, TITLES, NAVY, para, illustration, header

EXAMPLES={
 0:('4.1.3','F1','filtro','Confira os controles da captação e os registros disponíveis; confirme quais sanitizantes e ensaios são empregados.'),
 1:('4.2.2','F2','vazamentos','Verifique visualmente a canalização e confronte os achados com registros e documentos apresentados.'),
 2:('4.3.2','F3','vazamentos','Observe as condições dos reservatórios e conexões. Confira os registros dos procedimentos de higienização e revisão.'),
 6:('4.5.3','F2',None,'Examine a identificação, a validade, a regularização e a finalidade de uso dos saneantes na recepção.'),
 7:('4.6.6','F2','teste de arraste','Confira a demonstração dos ensaios de resíduos e os registros; quando houver teste, confira os indicadores associados ao resíduo.'),
 8:('4.6.10','F2','origem','Identifique a origem e o fluxo das garrafas. Preencha as perguntas condicionais que correspondem ao processo observado.'),
 9:('4.7.4','F1','pressão positiva','Confira o funcionamento das condições de proteção da sala de envase e a evidência apresentada.'),
 10:('4.7.8','F1','resíduo de saneante','Confira a higienização da envasadora e os registros dos controles complementares efetivamente utilizados.'),
 11:('4.10.4','F1',None,'Confronte o plano de amostragem com os documentos. Verifique se a análise mensal terceirizada está prevista.'),
 12:('4.11.1','F1',None,'Neste F, confira as verificações de supervisão e capacitação e registre evidências complementares em OBS ou NC; não existe um quadro separado de outras informações neste exemplo.'),
}

def get_questions(page,code,f,needle):
    if page==6:return ['O saneante está identificado?','O saneante está dentro do prazo de validade?','A finalidade de uso do saneante corresponde à utilização realizada?']
    if page==11:return ['O plano de amostragem prevê a análise mensal terceirizada?']
    if page==12:return ['Supervisão dos manipuladores','Capacitação periódica dos manipuladores']
    proc=next(p for p in MODEL if p['page']==page)
    row=next(r for r in proc['rows'] if r['code']==code)
    panel=next(x for x in row['panels'] if x['label'].split(' ')[0]==f)
    checks=panel['checks'];start=next(i for i,c in enumerate(checks) if needle.lower() in c['label'].lower())
    return [c['label'] for c in checks[start:start+3]]

def main():
    story=[]
    for page,(code,f,needle,description) in EXAMPLES.items():
        if story:story.append(PageBreak())
        title=TITLES[page];qs=get_questions(page,code,f,needle)
        lines=[('Exemplo didático - não representa uma inspeção real','text')]
        for i,q in enumerate(qs):
            if page==8:
                response=['Exemplo: adquiridas de terceiros','Exemplo: manual','Exemplo: Sim'][i]
            elif page==12:response=['Exemplo: Sim','Exemplo: Não'][i]
            else:response=['Exemplo: Sim','Exemplo: Não','Selecione (sem marcação)'][i]
            lines.extend([(q,'text'),(response,'text')])
        lines.append(('Apenas respostas efetivamente marcadas são incorporadas às informações do relatório.','text'))
        filename=f'processo-complementares-{page}-v84.png'
        illustration(filename,code+' '+f+' - '+('Verificações do F' if page==12 else 'Outras informações'),lines)
        imagepath=ROOT/'assets/manual'/filename;pix=fitz.Pixmap(str(imagepath))
        w=min(440,520*pix.width/pix.height);h=w*pix.height/pix.width
        story.extend([para(title,18,True,NAVY),para('Localize '+code+' '+f+' no guia',12,True,NAVY),para(description,11),Spacer(1,6),Image(str(imagepath),width=w,height=h),para('Figura ilustrativa da interação e do preenchimento. As respostas são fictícias.',9),para('Verifique o processo durante a inspeção. Para perguntas Sim/Não, a resposta gera texto afirmativo ou negativo; deixe sem marcação apenas quando não houver informação a registrar, sem inventar constatações.',10)])
    buf=io.BytesIO();label='MANUAL V84 - EXEMPLOS POR PROCESSO'
    SimpleDocTemplate(buf,pagesize=A4,leftMargin=38,rightMargin=38,topMargin=52,bottomMargin=38).build(story,onFirstPage=lambda c,d:header(c,d,label),onLaterPages=lambda c,d:header(c,d,label))
    path=ROOT/'Manual_de_Preenchimento_Guia_BPF_APPCC.pdf'
    with fitz.open(path) as doc,fitz.open(stream=buf.getvalue(),filetype='pdf') as supp:
        assert len(supp)==10
        old=[i for i,p in enumerate(doc) if label in p.get_text()]
        for i in reversed(old):doc.delete_page(i)
        doc.insert_pdf(supp,start_at=4);data=doc.tobytes(garbage=3,deflate=True)
    path.write_bytes(data)
    print('10 ilustrações e 10 páginas de exemplos adicionadas ao manual.')

if __name__=='__main__':main()
