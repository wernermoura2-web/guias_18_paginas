from pathlib import Path
import re

for filename in ('individual.html', 'equipe.html'):
    path = Path(filename)
    source = path.read_text(encoding='utf-8')
    if 'Definições nas Observações Gerais — originais' in source:
        continue
    source, count = re.subn(r'^const BPF_NC_DEFINITION_ENTRIES=.*?^\}\);\n', '', source, count=1, flags=re.M|re.S)
    assert count == 1
    source, count = re.subn(r"^  if\(key\.startsWith\('definitions:nc:'\).*?\n", '', source, count=1, flags=re.M)
    assert count == 1
    begin = source.index('  definitions.replaceChildren();')
    end = source.index('  list.replaceChildren();', begin)
    source = source[:begin]+source[end:]
    anchor = " const definitions=document.createElement('section');definitions.className='review-card';dlg.append(definitions);"
    assert source.count(anchor) == 1
    source = source.replace(anchor, anchor+"""
 const definitionsHeading=document.createElement('h3');definitionsHeading.textContent='Definições nas Observações Gerais — originais';definitions.append(definitionsHeading);
 const definitionsHelp=document.createElement('p');definitionsHelp.className='review-help';definitionsHelp.textContent='Textos de referência exibidos no início dos blocos de não conformidades.';definitions.append(definitionsHelp);
 for(const [code,definition] of Object.entries(BPF_NC_DEFINITIONS)){
  const label=document.createElement('h4');label.className='review-label';label.textContent=code;
  const text=document.createElement('p');text.className='review-original';text.textContent=definition.text;
  definitions.append(label,text);
 }""")
    assert source.count('!BPF_NC_DEFINITION_ENTRIES.includes(e)&&') == 1
    source = source.replace('!BPF_NC_DEFINITION_ENTRIES.includes(e)&&','')
    path.write_text(source, encoding='utf-8')

for filename,old,new in [
    ('index.html','20261107-revisao-obs-nc-v1','20261107-definicoes-originais-v1'),
    ('revisao-frases.html','20261107-revisao-obs-nc-v1','20261107-definicoes-originais-v1'),
    ('sw-guia18.js','guia18-revisao-obs-nc-20261107-v21','guia18-definicoes-originais-20261107-v22'),
]:
    path = Path(filename)
    source = path.read_text(encoding='utf-8')
    assert old in source or new in source
    path.write_text(source.replace(old,new), encoding='utf-8')
