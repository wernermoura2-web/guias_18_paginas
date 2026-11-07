from pathlib import Path
for name in ('individual.html','equipe.html'):
    p=Path(name)
    s=p.read_text(encoding='utf-8')
    old="const BPF_MATRIX_PCC_TEXT='Regra PCC — Não atendimento de qualquer requisito classificado como PCC';"
    new="const BPF_MATRIX_PCC_TEXT='REGRA PCC — NÃO ATENDIMENTO DE\\nQUALQUER REQUISITO CLASSIFICADO COMO PCC';"
    assert s.count(old)==1
    s=s.replace(old,new)
    old="color:#fff;font:bold .94cqw Arial,sans-serif;text-align:center;white-space:nowrap"
    assert s.count(old)==1
    s=s.replace(old,"color:#000;font:bold 1.45cqw/1.02 Arial,sans-serif;text-align:center;white-space:pre-line")
    old=""" const pccSize=Math.min(7.4,(bandWidth-9)/pccBold.widthOfTextAtSize(BPF_MATRIX_PCC_TEXT,1));
 pccPage.drawText(BPF_MATRIX_PCC_TEXT,{x:left+(bandWidth-pccBold.widthOfTextAtSize(BPF_MATRIX_PCC_TEXT,pccSize))/2,y:height-bottom+half/2-pccSize*.35,size:pccSize,font:pccBold,color:PDFLib.rgb(1,1,1)});"""
    assert s.count(old)==1
    s=s.replace(old,""" const pccLines=BPF_MATRIX_PCC_TEXT.split('\\n');
 const pccSize=Math.min(9,(bandWidth-9)/Math.max(...pccLines.map(line=>pccBold.widthOfTextAtSize(line,1))));
 pccLines.forEach((line,i)=>{
  const x=left+(bandWidth-pccBold.widthOfTextAtSize(line,pccSize))/2;
  const y=height-bottom+half/2+(0.5-i)*pccSize-pccSize*.34;
  pccPage.drawText(line,{x,y,size:pccSize,font:pccBold,color:PDFLib.rgb(0,0,0)});
 });""")
    p.write_text(s,encoding='utf-8')
for name in ('index.html','revisao-frases.html','sw-guia18.js'):
    p=Path(name)
    p.write_text(p.read_text().replace('20261107-matriz-revisao-v34','20261107-regra-pcc-v35').replace('guia18-matriz-revisao-20261107-v34','guia18-regra-pcc-20261107-v35'))
test=Path('scripts/test_pcc_alto_risco_20261107.cjs')
test.write_text(test.read_text().replace("s.includes(\"pccPage.drawText(BPF_MATRIX_PCC_TEXT\")","s.includes(\"pccPage.drawText(line\")&&s.includes(\"BPF_MATRIX_PCC_TEXT.split\")"))
