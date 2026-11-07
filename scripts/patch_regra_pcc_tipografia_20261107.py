import json
import re
import subprocess
from pathlib import Path

REFERENCE='fcebe31e57a125c7e9781c163df59414f430a61d'
PDF=r'(const BPF_EMBEDDED_PDF=")([^"]+)(")'
DATA=r'const GUIDE_DATA\s*=\s*'
MATRIX=17

def guide_data(source):
    start=re.search(DATA,source).end()
    data,length=json.JSONDecoder().raw_decode(source[start:])
    return data,start,start+length

for filename in ('individual.html','equipe.html'):
    path=Path(filename)
    current=path.read_text(encoding='utf-8')
    if 'font:normal 1.15cqw/1.08 Arial,sans-serif' in current:
        continue
    reference=subprocess.check_output(['git','show',f'{REFERENCE}:{filename}'],encoding='utf-8')
    original_pdf=re.search(PDF,reference)[2]
    current,count=re.subn(PDF,lambda m:m[1]+original_pdf+m[3],current)
    assert count==1,filename

    data,start,end=guide_data(current)
    original_data,_,_=guide_data(reference)
    data['backgrounds'][MATRIX]=original_data['backgrounds'][MATRIX]
    current=current[:start]+json.dumps(data,ensure_ascii=False,separators=(',',':'))+current[end:]

    for old,new in [
        ('font:bold 1.45cqw/1.02 Arial,sans-serif','font:normal 1.15cqw/1.08 Arial,sans-serif'),
        ('const pccPage=pdf.getPage(17),pccBold=await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);',
         'const pccPage=pdf.getPage(17);'),
        ('Math.min(9,(bandWidth-9)/','Math.min(6.9,(bandWidth-9)/'),
    ]:
        assert current.count(old)==1,(filename,old)
        current=current.replace(old,new)
    current=current.replace('pccBold.widthOfTextAtSize(line,','observationFont.widthOfTextAtSize(line,')
    current=current.replace('size:pccSize,font:pccBold,','size:pccSize,font:observationFont,')
    current=re.sub(r'\s*<!-- 20261107-pcc-regular-v[23] -->\s*','\n',current)
    path.write_text(current.rstrip()+chr(10),encoding='utf-8')
