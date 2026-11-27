from pathlib import Path
import fitz, io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Image, Spacer
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

root=Path(__file__).resolve().parents[1]; target=root/'assets/manual/importacao-direta-v86.png'
navy=(.07,.26,.36); muted=(.16,.30,.37)
doc=fitz.open(); p=doc.new_page(width=350,height=575); p.draw_rect(p.rect,fill=(.95,.97,.98),color=None)
def text(y,s,size=10,bold=False,x=18):p.insert_text((x,y),s,fontsize=size,fontname='hebo' if bold else 'helv',color=navy if bold else muted)
def card(y,h,fill=(1,1,1)):p.draw_rect(fitz.Rect(12,y,338,y+h),fill=fill,color=(.76,.84,.88),width=.7)
text(23,'Importar arquivos de colegas',16,True);text(41,'SEM CÓDIGO  •  EXEMPLO DIDÁTICO',9,True)
card(52,80);text(70,'Seu guia: Envasadora Exemplo | 27/11/2026',9);text(85,'Recebido: Envasadora Exemplo | 27/11/2026',9);p.draw_rect(fitz.Rect(18,97,30,109),color=navy,width=1);text(106,'Confirmo que pertence à mesma inspeção.',10,x=37)
card(141,118);text(160,'4.2 - Condução',13,True);text(178,'8 novos campos · 0 divergências',11);text(197,'Ver dados e diferenças (8)',10,True);card(209,33,(.92,.97,.98));text(230,'Acrescentar informações novas',11,True)
card(268,178);text(287,'4.6 - Higienização',13,True);text(305,'5 novos campos · 1 divergência',11);card(315,59,(1,.96,.86));text(332,'Seu guia: Sim',10,True);text(348,'Arquivo do colega: Não',10,True);text(362,'Revise a evidência antes de substituir.',9);card(385,34,(.92,.97,.98));text(406,'Não importar este processo',11,True)
card(456,61);text(476,'Fotos e rótulos recebidos',12,True);text(493,'Selecione os anexos que deseja incorporar.',10)
p.draw_rect(fitz.Rect(12,532,338,565),fill=(.03,.42,.59),color=None);p.insert_text((29,553),'Incorporar selecionados',fontsize=13,fontname='hebo',color=(1,1,1));p.get_pixmap(matrix=fitz.Matrix(2,2),alpha=False).save(target);doc.close()

pdf=root/'Manual_de_Preenchimento_Guia_BPF_APPCC.pdf';buf=io.BytesIO();blue=colors.HexColor('#16445d')
pdfmetrics.registerFont(TTFont('V86Body','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('V86Bold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFontFamily('V86Body',normal='V86Body',bold='V86Bold',italic='V86Body',boldItalic='V86Bold')
def para(s,size=10,bold=False):return Paragraph(s,ParagraphStyle('p',fontName='V86Bold' if bold else 'V86Body',fontSize=size,leading=size*1.3,spaceAfter=6,textColor=blue if bold else colors.black))
story=[para('Trabalho em grupo - importação direta sem código',18,True),para('Cada pessoa pode iniciar seu guia individualmente no celular, tablet ou computador. Preencha a mesma envasadora e data, avalie os processos atribuídos e envie o JSON salvo ao responsável pela consolidação.'),para('1. Salve uma cópia do guia atual. 2. Toque em <b>Importar arquivos de colegas (sem código)</b>. 3. Escolha os JSONs recebidos e confirme a inspeção. 4. Abra a comparação de dados de cada processo e selecione o que deseja incorporar.'),Image(str(target),width=225,height=225*575/350),para('Quando não houver divergências, acrescente as informações novas. Se houver conflito, compare o preenchimento e mantenha o seu processo ou autorize a substituição integral, após examinar os campos que serão apagados. Selecione também documentos e anexos pertinentes.'),para('5. Confirme a incorporação, confira a matriz de risco e salve o JSON consolidado. O método com código de equipe permanece disponível.',10,True)]
story.insert(2,para('Identificação preservada: envasadora, endereço e data são sempre os do guia de quem recebe. Os dados do colega servem somente para conferência e nunca substituem nem preenchem esses campos.',10,True))
SimpleDocTemplate(buf,pagesize=A4,leftMargin=42,rightMargin=42,topMargin=40,bottomMargin=35,title='Importação direta sem código').build(story)
with fitz.open(pdf) as original,fitz.open(stream=buf.getvalue(),filetype='pdf') as supplement:
    assert len(supplement)==1
    previous=[i for i,p in enumerate(original) if 'Trabalho em grupo - importação direta sem código' in ' '.join(p.get_text().split())]
    for i in reversed(previous):original.delete_page(i)
    original.insert_pdf(supplement,start_at=1);meta=original.metadata;meta['keywords']='v86 - importação direta';original.set_metadata(meta);data=original.tobytes(garbage=3,deflate=True)
pdf.write_bytes(data)
