#!/usr/bin/env python3
"""Modelos de impressão a partir dos painéis F atuais e atualização do manual."""
from pathlib import Path
import base64, io, json, re, sys
from xml.sax.saxutils import escape
import fitz
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'impressao'
MODEL=json.loads(Path(sys.argv[1]).read_text())
REV='27/11/2026 — v84'
NOTICE='Outras informações incluem exigências de outras normas vigentes, informações complementares sobre os processos e procedimentos operacionais e práticas de excelência. Verifique cada informação durante a inspeção e marque Sim ou Não conforme constatado. Campos sem marcação não constam do relatório.'
NAVY=colors.HexColor('#16445d'); PALE=colors.HexColor('#e9f3f8'); LINE=colors.HexColor('#a8c0cd')
FONTPATH=Path('/usr/share/fonts/truetype/dejavu')
pdfmetrics.registerFont(TTFont('D',str(FONTPATH/'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('DB',str(FONTPATH/'DejaVuSans-Bold.ttf')))
pdfmetrics.registerFontFamily('D',normal='D',bold='DB',italic='D',boldItalic='DB')
TITLES={0:'4.1 Captação',1:'4.2 Condução',2:'4.3 Reservatórios',6:'4.5 Recepção de embalagens e insumos',7:'4.6 Higienização de retornáveis',8:'4.6 Higienização de descartáveis',9:'4.7 Envase de retornáveis',10:'4.7 Envase de descartáveis',11:'4.10 Controle da qualidade',12:'4.11 Responsáveis e manipuladores'}
INDICATORS=['Verde de bromocresol','Fenolftaleína','Azul de bromotimol','Ortotolidina','N,N-dietil-p-fenilenodiamina (DPD)','Trissulfonato de índigo','Kit específico para ácido peracético','Outros']
RESIDUES=['Acidez residual (saneantes ácidos)','Alcalinidade residual (soda cáustica e detergentes alcalinos)','Cloro residual (hipoclorito de sódio e detergentes clorados)','Ozônio residual','Ácido peracético residual','Outros — especificar']

def para(text,size=9,bold=False,fg=colors.black,space=3):
    return Paragraph(escape(str(text)).replace('\n','<br/>'),ParagraphStyle('p',fontName='DB' if bold else 'D',fontSize=size,leading=size*1.3,textColor=fg,spaceAfter=space))

def grid(rows,widths,header=True):
    t=Table(rows,colWidths=widths,repeatRows=1 if header else 0,hAlign='LEFT')
    t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),.45,LINE),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]+([('BACKGROUND',(0,0),(-1,0),PALE)] if header else [])))
    return t

def header(canvas,doc,title):
    w,h=A4;canvas.setFillColor(NAVY);canvas.rect(0,h-39,w,39,fill=1,stroke=0)
    canvas.setFillColor(colors.white);canvas.setFont('DB',9);canvas.drawString(32,h-16,'SES-RJ / SUVISA / COOVFA');canvas.setFont('D',8);canvas.drawString(32,h-30,title+' | '+REV)
    canvas.setFont('D',8);canvas.setFillColor(NAVY);canvas.drawRightString(w-32,22,f'Página {doc.page}')

def residue_sheet(size,ref):
    s=[para(ref+' — Quais são os resíduos avaliados? Quais são os indicadores utilizados?',size+1,True,NAVY),para('Marque os resíduos avaliados e, para cada um, assinale os números correspondentes aos indicadores efetivamente utilizados.',size)]
    rows=[[para('Resíduo avaliado',size,True),para('Indicadores (números)',size,True)]]
    for r in RESIDUES: rows.append([para('☐ '+r,size),para('☐1  ☐2  ☐3  ☐4  ☐5  ☐6  ☐7  ☐8',size)])
    s.append(grid(rows,[270,261]));s.append(para('  |  '.join(f'{i+1} — {name}' for i,name in enumerate(INDICATORS)),size))
    s.append(para('Outro resíduo / indicador: __________________________________________________',size))
    s.append(para('Se utilizar kit de ácido peracético: ☐ fita específica  ☐ comparador colorimétrico  ☐ fotômetro/colorímetro  ☐ DPD específico  ☐ titulação específica  ☐ outro: __________',size))
    s.append(para('Fabricante/modelo: ____________________   Faixa informada (mg/L): _______________',size))
    s.append(para('Registra o resultado? ☐ Sim  ☐ Não',size))
    s.append(para('Atenção: confira a especificidade, faixa e limitações do método. O guia digital apresenta alertas de compatibilidade. Indicador de pH não identifica especificamente o princípio ativo; ortotolidina não quantifica seletivamente ozônio. Não confunda teste qualitativo com quantitativo.',size,False,NAVY))
    return s

def extras(page,code,panel):
    label=panel['label'].split(' ')[0]
    if code=='4.5.3' and label=='F1':return ['Possui registro que comprova a inspeção no recebimento?','Comprovação: formulário; carimbo na NF; sistema; ficha de estoque; outros (especificar).']
    if code=='4.5.3' and label=='F2':return ['O saneante está identificado?','O saneante está dentro do prazo de validade?','O saneante está regularizado na ANVISA?','A finalidade de uso do saneante corresponde à utilização realizada?']
    if code=='4.3.3' and label=='F1':return ['Periodicidade de verificação/troca dos filtros por reservatório: __________']
    if code=='4.3.3' and label=='F2':return ['Há registro de verificação e troca dos elementos filtrantes?']
    if code=='4.3.2' and label=='F1':return ['É realizada mistura das águas de diferentes fontes?','Se houver mistura: está autorizada pela ANM?']
    if code=='4.10.4' and label=='F1':return ['O plano de amostragem prevê a análise mensal terceirizada?']
    if code=='4.10.4' and label=='F2':return ['O plano é executado conforme previsto?','Há limites de aceitação definidos?','A análise mensal terceirizada é executada, registrada e comparada aos limites?','Há limites internos de alerta e de ação para bactérias heterotróficas definidos?']
    if code in ['4.3.6','4.5.8','4.6.12'] and label=='F1':return ['O POP referente às operações avaliadas está disponível e atualizado?']
    return []

def make_annex(path,compact):
    size=7.9 if compact else 9;story=[]
    for k,process in enumerate(MODEL):
        if k:story.append(PageBreak())
        page=process['page'];story.extend([para(TITLES[page],15,True,NAVY),para('Envasadora: ______________________________ Data: __________ Inspeção: __________',size),para('S = Sim | N = Não. NA = não se aplica, somente na avaliação principal de F que ofereça essa opção. '+NOTICE,size)])
        if page in [0,1]:story.append(para('Situação das unidades: 1 ______ 2 ______ 3 ______ 4 ______ (Ativa — envase / Inativa / Não existente / Água de serviço / Não informada). Na condução, usar a situação da captação correspondente.',size))
        if page==2:story.append(para('Captação de referência: ______. Reproduza a ficha para cada captação com reservatórios.',size))
        for row in process['rows']:
            for panel in row['panels']:
                title=row['code']+' · '+panel['label']+' · '+' / '.join(panel['classes']); parts=[para(title,size+1,True,NAVY)]
                for phrase in panel['phrases']:parts.append(para(phrase,size))
                units=panel['units']; choices='S / N'+(' / NA' if panel['allowNA'] else '')
                if panel['options'] and len(panel['options'])<25:
                    for option in panel['options']:parts.append(para('• '+option,size))
                # Um quadro por unidade, sem impor respostas a unidades não avaliadas.
                if units:parts.append(para('    '.join(f'{u}: ____' for u in units)+'   ('+choices+')',size))
                if panel.get('checklist'):parts.append(para('Opções: '+'   '.join('☐ '+x for x in panel['checklist']),size))
                parts.append(para('OBS / NC: ___________________________________________________________________',size))
                if not compact:parts.append(para('____________________________________________________________________________',size))
                story.append(KeepTogether(parts))
                checks=panel['checks'];other=extras(page,row['code'],panel)
                if checks or other:story.append(para(panel['heading']+' — preencha apenas os campos aplicáveis',size,True,NAVY))
                for c in checks:
                    if c.get('id','').startswith('avaliacao-') or c.get('id') in ['bpf-resposta-geral','higienizacao-adequada']:continue
                    text=c['label']
                    if c.get('requiresStoredBottles'):text='Se adquiridas de terceiros ou sopradas e armazenadas: '+text
                    if c.get('requires')=='transporte-posicionamento-automatico':text=('Se automática: ' if c.get('requiresAnswer')=='1' else 'Se manual: ')+text
                    if c.get('answerLabels'):text+=' — '+' / '.join(c['answerLabels'].values())
                    elif c.get('informationList') or c.get('details') in ['sanitizers','packaging-sanitizers']:text+=' — marque os produtos utilizados'
                    else: text+='  [ ] S  [ ] N'
                    story.append(para('• '+text,size))
                    if c.get('details') in ['sanitizers','packaging-sanitizers']:
                        pr=c.get('products') or [['','Hipoclorito de sódio'],['','Ozônio'],['','Ácido peracético'],['','Outros']]
                        story.append(para('  '.join('☐ '+v for _,v in pr)+'  | Periodicidade (se aplicável): __________',size))
                    elif c.get('details')=='residue':story.extend(residue_sheet(size,row['code']+' '+panel['label'].split(' ')[0]))
                    elif c.get('details') in ['filter','inspection-frequency','recirculation','measure','telemetry']:story.append(para('Detalhamento: ___________________________________________________________',size))
                for x in other:story.append(para('• '+x+'  [ ] S  [ ] N',size))
                story.append(Spacer(1,5 if compact else 9))
    title='Anexo F — resumo para impressão' if compact else 'Anexo F — ficha de preenchimento'
    SimpleDocTemplate(str(path),pagesize=A4,leftMargin=32,rightMargin=32,topMargin=51,bottomMargin=35,title=title,author='SES-RJ / SUVISA / COOVFA').build(story,onFirstPage=lambda c,d:header(c,d,title),onLaterPages=lambda c,d:header(c,d,title))
    with fitz.open(path) as d:print(path.name,len(d),'páginas');assert len(d)>10

def patch_guide(path):
    with fitz.open(path) as d:
        if 'v84-documentos-20261127' in (d.metadata.get('keywords') or ''):return
        before=[[(w.field_name,w.field_type,w.field_value) for w in p.widgets()] for p in d]
        for i,p in enumerate(d):
            if i>=13:continue
            y=p.rect.height-28
            if i in (0,1):
                text=('Situação (1–4): 1 ____  2 ____  3 ____  4 ____   | A = ativa; I = inativa; NE = não existente; S = água de serviço; NI = não informada' if i==0 else 'Condução: situação da captação correspondente — 1 ____  2 ____  3 ____  4 ____   | A / I / NE / S / NI')
                p.insert_text((43,y),text,fontsize=6.5,fontname='helv',color=(.12,.26,.35))
            p.insert_text((43,p.rect.height-15),'Revisão 27/11/2026 • Informações complementares: consultar Anexo F atualizado; preencher as aplicáveis.',fontsize=6.7,fontname='helv',color=(.12,.26,.35))
        meta=d.metadata;meta['keywords']=(meta.get('keywords') or '')+'; v84-documentos-20261127';d.set_metadata(meta)
        output=d.tobytes(garbage=3,deflate=True)
    with fitz.open(stream=output,filetype='pdf') as d:assert before==[[(w.field_name,w.field_type,w.field_value) for w in p.widgets()] for p in d]
    path.write_bytes(output);print(path.name,'campos preservados')

def illustration(name,title,lines):
    # Imagem explicativa fiel às opções do HTML, não fotografia de inspeção.
    def wrap(t):
        out=[];line=''
        for word in t.replace('—','-').split():
            candidate=(line+' '+word).strip()
            if fitz.get_text_length(candidate,fontname='helv',fontsize=10.3)>385 and line:out.append(line);line=word
            else:line=candidate
        if line:out.append(line)
        return out
    blocks=[(wrap(t),kind) for t,kind in lines];heights=[max(30,15*len(ls)+14) for ls,_ in blocks]
    doc=fitz.open();p=doc.new_page(width=440,height=60+sum(h+6 for h in heights));p.draw_rect(p.rect,fill=(.94,.97,.98),color=None)
    p.insert_text((16,25),title,fontsize=13,fontname='hebo',color=(.07,.29,.40));y=40
    for (ls,kind),h in zip(blocks,heights):
        col=(1,.93,.90) if kind=='alert' else (1,1,1)
        p.draw_rect(fitz.Rect(14,y,426,y+h),fill=col,color=(.70,.80,.85),width=.6)
        for i,line in enumerate(ls):p.insert_text((24,y+15+i*15),line,fontsize=10.3,fontname='helv',color=(.08,.20,.29))
        y+=h+6
    p.get_pixmap(matrix=fitz.Matrix(2,2)).save(ROOT/'assets/manual'/name)

def manual():
    illustration('aviso-complementares-v84.png','Item 4.6.6 - Frases',[(NOTICE.replace('•','-'),'text'),('Selecione: Sim / Não','text')])
    illustration('residuos-alerta-v84.png','Quais são os resíduos avaliados?',[(r,'text') for r in RESIDUES]+[('Cloro residual: Fenolftaleína selecionada','text'),('ATENÇÃO: indicador não indicado para o resíduo selecionado. Confira a adequação do método.','alert')])
    illustration('residuos-kit-v84.png','Ácido peracético residual', [('Kit específico para ácido peracético','text'),('Qual é o método do kit? Fita reagente específica / Comparador / Fotômetro / DPD específico / Titulação / Outro','text'),('Identificação do kit (fabricante e modelo): __________','text'),('Faixa de medição informada pelo fabricante (mg/L): __________','text')])
    buf=io.BytesIO();story=[para('Atualização de 27/11/2026 — Informações complementares',18,True,NAVY),para(NOTICE,11),para('Como responder',13,True,NAVY),para('Abra o F do item. Responda a avaliação principal por unidade. Em Outras informações, preencha cada questão aplicável com base na inspeção, registros e informações fornecidas pela empresa. É parte da atuação e da capacitação do inspetor verificar as informações do processo durante a inspeção. Marque Sim ou Não conforme constatado. Sim gera frase afirmativa; Não gera frase negativa. Campos sem marcação não aparecem nas Observações Gerais nem no Anexo F do relatório.',11),para('Exigências de outras normas e práticas de excelência',13,True,NAVY),para('Verifique as exigências aplicáveis da Resolução ANM 193/2024 e de outras normas vigentes. Testes de fluorescência e bioluminescência de ATP podem constituir práticas de excelência; sua avaliação depende do processo e dos controles efetivamente utilizados. Não confunda a falta de uma prática facultativa com uma infração legal.',11),Image(str(ROOT/'assets/manual/aviso-complementares-v84.png'),width=410,height=410*fitz.Pixmap(str(ROOT/'assets/manual/aviso-complementares-v84.png')).height/fitz.Pixmap(str(ROOT/'assets/manual/aviso-complementares-v84.png')).width),para('Figura ilustrativa — aviso e opções de resposta.',9),PageBreak(),para('Avaliação de resíduos de sanitizantes',18,True,NAVY),para('Nos itens com teste de arraste ou pesquisa de resíduos após enxágue, confirme a informação e selecione todos os resíduos avaliados. Em cada grupo aberto, marque os indicadores efetivamente empregados. Selecione Outro quando necessário e identifique o método. Confira os alertas; só registre com base em evidência. Resultados e observações aparecem no relatório para as respostas efetivamente registradas.',11),para('Exemplo: cloro residual e fenolftaleína',13,True,NAVY),Image(str(ROOT/'assets/manual/residuos-alerta-v84.png'),width=340,height=340*fitz.Pixmap(str(ROOT/'assets/manual/residuos-alerta-v84.png')).height/fitz.Pixmap(str(ROOT/'assets/manual/residuos-alerta-v84.png')).width),para('Figura ilustrativa — escolha do resíduo e alerta de inadequação.',9),PageBreak(),para('Kit específico para ácido peracético',18,True,NAVY),para('Ao selecionar este kit, registre o método, fabricante e modelo e a faixa de medição fornecida pelo fabricante. O método deve ser adequado ao resíduo e à finalidade da avaliação. Não presuma ausência de resíduo ou concentração sem evidência. Confira a adequação do indicador e limitações de método.',11),Image(str(ROOT/'assets/manual/residuos-kit-v84.png'),width=400,height=400*fitz.Pixmap(str(ROOT/'assets/manual/residuos-kit-v84.png')).height/fitz.Pixmap(str(ROOT/'assets/manual/residuos-kit-v84.png')).width),para('Figura ilustrativa — detalhamento do kit e método.',9),para('Documentos atualizados',13,True,NAVY),para('O guia impresso em branco e o editável preservam os quadros de avaliação. O Anexo F em branco e o resumo de frases foram sincronizados com os campos atuais. O relatório PDF final é somente leitura e não contém botões Limpar, inclusive na matriz de risco e nas páginas finais. Para registrar uma cópia editável da inspeção, mantenha o JSON salvo.',11)]
    SimpleDocTemplate(buf,pagesize=A4,leftMargin=38,rightMargin=38,topMargin=52,bottomMargin=38).build(story,onFirstPage=lambda c,d:header(c,d,'Manual de preenchimento — atualização'),onLaterPages=lambda c,d:header(c,d,'Manual de preenchimento — atualização'))
    path=ROOT/'Manual_de_Preenchimento_Guia_BPF_APPCC.pdf'
    with fitz.open(path) as original,fitz.open(stream=buf.getvalue(),filetype='pdf') as supplement:
        # Regeneração idempotente: remover apenas as páginas de atualização v84.
        if 'v84' in (original.metadata.get('keywords') or ''):
            old=[i for i,p in enumerate(original) if 'Manual de preenchimento — atualização | 27/11/2026 — v84' in p.get_text()]
            for i in reversed(old):original.delete_page(i)
        original.insert_pdf(supplement,start_at=1);original.set_metadata({**original.metadata,'keywords':'v84 — 27/11/2026'});data=original.tobytes(garbage=3,deflate=True)
    path.write_bytes(data)

if __name__=='__main__':
    for name in ['Guia_BPF_APPCC_Em_Branco_18_Paginas.pdf','Guia_Editavel_em_Branco.pdf','Guia_Editavel_Simplificado.pdf']:patch_guide(OUT/name)
    make_annex(OUT/'Anexo_F_20_Paginas_Retrato.pdf',False)
    make_annex(OUT/'Anexo_Resumido_Frases_BPF_APPCC.pdf',True)
    for name in ['Guia_BPF_APPCC_Em_Branco_18_Paginas.pdf','Anexo_F_20_Paginas_Retrato.pdf','Anexo_Resumido_Frases_BPF_APPCC.pdf']:
        path=OUT/name;path.with_suffix('.pdf.b64').write_bytes(base64.b64encode(path.read_bytes()))
    manual()
