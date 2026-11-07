from pathlib import Path
import json
import re

F3 = 'A abertura de passagem deve permanecer fechada durante a paralisação do processo de envase.'
POP = 'Os POP devem conter informações sobre: natureza da superfície a ser higienizada, métodos de higienização, princípios ativos utilizados e sua concentração, tempo de contato dos agentes químicos e ou físicos utilizados na operação de higienização, temperatura e outras informações que se fizerem necessárias.'

def patch(source):
    def change(old, new):
        nonlocal source
        assert source.count(old)==1, old[:100]
        source=source.replace(old,new)
    if "['4.2.9','4.3.6','4.5.8','4.6.12']" in source:
        return source
    for match in reversed(list(re.finditer(r'\{"code":"4\.6\.(?:10|12)",',source))):
        row, length=json.JSONDecoder().raw_decode(source[match.start():])
        for phrases in [row['phrases'],*(s['phrases'] for s in row['scopes'])]:
            assert len(phrases)==2
            if row['code']=='4.6.10':
                assert phrases[1]['text'].endswith(' '+F3)
                phrases[1]['text']=phrases[1]['text'].removesuffix(' '+F3)
                phrases[1]['guidance']='Observar se as embalagens passam da área de higienização à sala de envase sem transporte manual.'
                phrases[1]['revision']='envase26'
                phrases.append({**phrases[1],'text':F3,'guidance':'Verificar se o dispositivo fecha a abertura durante as paradas do envase.'})
            else:
                assert phrases[0]['text'].endswith(' '+POP)
                phrases[0]['text']=phrases[0]['text'].removesuffix(' '+POP)
                phrases[1].update(text=POP,guidance=phrases[0]['guidance'],allowNA=True,revision='envase26')
                phrases[0].update(guidance='Verificar se há POP implementado para a higienização das embalagens na linha avaliada.',allowNA=False,revision='envase26')
        source=source[:match.start()]+json.dumps(row,ensure_ascii=False,separators=(',',':'))+source[match.start()+length:]
    change("+'_F'+(i+1)+'_V'+variant;", "+'_F'+(i+1)+'_V'+variant+(collection[0].phrase.revision?'_'+collection[0].phrase.revision:'');")
    change("return 'examples:'+page.page+':'+code+':'+(panel.id+1);","const revision=panel.entries[0]?.phrase.revision;return 'examples:'+page.page+':'+code+':'+(panel.id+1)+(revision?':'+revision:'');")
    change("['4.2.9','4.3.6','4.5.8']", "['4.2.9','4.3.6','4.5.8','4.6.12']")
    match=re.search(r'^const BPF_FILL_EXAMPLES=(.*);$',source,re.M)
    examples=json.loads(match[1])
    examples['4.6.10/3']=[
        'Durante a paralisação da linha [identificação], a abertura de passagem das embalagens permaneceu fechada.',
        examples['4.6.10/2'][1],
    ]
    examples['4.6.10/2']=[
        'Na linha [identificação], as embalagens foram transferidas até a sala de envase por [equipamento], sem transporte manual.',
        'Na linha [identificação], foi observado transporte manual das embalagens entre a higienização e a sala de envase em [local ou momento].',
    ]
    examples['4.6.12/2']=examples['4.6.12/1']
    examples['4.6.12/1']=[
        'Foi apresentado o POP [código e revisão], implementado na higienização das embalagens da linha [identificação].',
        'Não foi comprovada a implementação de POP de higienização das embalagens na linha [identificação], conforme [evidência].',
    ]
    change(match[0],'const BPF_FILL_EXAMPLES='+json.dumps(examples,ensure_ascii=False,separators=(',',':'))+';')
    return source

for name in ('equipe.html','individual.html'):
    path=Path(name)
    path.write_text(patch(path.read_text(encoding='utf-8')),encoding='utf-8')
for name in ('index.html','revisao-frases.html','sw-guia18.js'):
    path=Path(name)
    path.write_text(path.read_text().replace('20261107-pre-lavagem-v26','20261107-envase-pop-v27').replace('guia18-pre-lavagem-20261107-v26','guia18-envase-pop-20261107-v27'))
