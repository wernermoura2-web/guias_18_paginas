from pathlib import Path
import json
import re

CHANGES=json.loads(Path(__file__).with_name('bpf_docx_selected.json').read_text())
POP_ITEMS={'4.3.6','4.5.8','4.6.12'}
BY_CODE={}
for record in CHANGES:
    BY_CODE.setdefault(record['code'],[]).append(record)

def patch_phrases(code,phrases):
    if code=='4.6.12':
        # O F2 anterior já avaliava o conteúdo, que volta a ser identificado como F3.
        content=phrases[1].copy()
        phrases[1].update(text='Os Procedimentos Operacionais Padronizados referentes às operações de higienização das embalagens devem estar disponíveis e atualizados.',
                          guidance='Verificar se o POP de higienização de embalagens está disponível no local de execução e atualizado.',
                          fieldSuffix='DisponibilidadePOP',revision='revisaoWord36')
        phrases.append({**content,'fieldSuffix':2})
    if code=='4.6.10':
        # Manter as respostas sobre fechamento já registradas, agora no F4.
        closure=phrases[2].copy()
        phrases[2]['fieldSuffix']='DimensaoPassagem'
        phrases.append({**closure,'fieldSuffix':3})
    for record in BY_CODE[code]:
        index=record['f']-1
        if code=='4.7.5' and index==1:
            # A frase do Word reúne duas verificações que já têm controles próprios.
            continue
        new=index==len(phrases)
        if new:
            phrases.append({'appcc':record['appcc'],'allowNA':code in POP_ITEMS})
        phrase=phrases[index]
        replacement=record['text']
        if code=='4.6.12' and index==0:
            replacement,orientation=re.split(r'\s+Orientação ao inspetor\s*\n',replacement,maxsplit=1)
            phrase['guidance']=orientation
        if replacement!=phrase.get('text') or record.get('guidance'):
            phrase.update(text=replacement,revision='revisaoWord36')
        if record.get('guidance'):
            phrase.update(guidance=record['guidance'],appcc=record['appcc'])
    if code=='4.1.1':
        phrases[0]['guidance']='Verificar a integridade da pavimentação, a limpeza e a ausência de focos de insalubridade no entorno da casa de proteção.'
        phrases[1]['guidance']='Verificar o funcionamento da drenagem pluvial e a ausência de empoçamento ou sinais de infiltração.'

def patch(source):
    def change(old,new):
        nonlocal source
        assert source.count(old)==1,old
        source=source.replace(old,new)

    start=source.index('const BPF_PHRASES=')+len('const BPF_PHRASES=')
    data,n=json.JSONDecoder().raw_decode(source[start:])
    for page in data:
        for row in page['rows']:
            if row['code'] not in BY_CODE:continue
            for phrases in [row['phrases'],*(scope['phrases'] for scope in row['scopes'])]:
                patch_phrases(row['code'],phrases)
    source=source[:start]+json.dumps(data,ensure_ascii=False,separators=(',',':'))+source[start+n:]
    change("return index===1&&['4.2.9','4.3.6','4.5.8','4.6.12'].includes(row.code);",
           """const popItems=['4.3.6','4.5.8','4.6.12'];
 return (index===1&&(row.code==='4.2.9'||popItems.includes(row.code)))||(index===2&&popItems.includes(row.code));""")
    change("for(const index of (row.code==='4.5.8'?[0,1]:[1])){",
           "for(const index of scope.phrases.keys()){")
    change("else parts=range(0,max-1).map(i=>({label:'F'+(i+1),indices:[i],composite:false}));",
           """else parts=range(0,max-1).map(i=>{
  const part={label:'F'+(i+1),indices:[i],composite:false};
  if(row.code==='4.6.10'&&i>=2){part.storageId=i===2?3:2;part.exampleId=i;}
  if(row.code==='4.6.12'&&i>=1){part.storageId=i===1?2:1;part.exampleId=i;}
  return part;
 });""")
    change("const specific=BPF_FILL_EXAMPLES[code+'/'+((panel.storageId??panel.id)+1)]||BPF_FILL_EXAMPLES[code];",
           "const specific=BPF_FILL_EXAMPLES[code+'/'+((panel.exampleId??panel.storageId??panel.id)+1)]||BPF_FILL_EXAMPLES[code];")
    change('F2 — A antesala da sala de envase deve possuir:', 'F2 — A antessala da sala de envase deve possuir:')
    match=re.search(r'^const BPF_FILL_EXAMPLES=(.*);$',source,re.M)
    examples=json.loads(match[1])
    for record in CHANGES:
        if record.get('examples'):
            examples[f"{record['code']}/{record['f']}"]=record['examples']
    examples['4.6.12/2']=['O POP [identificação e revisão] estava atualizado e disponível para consulta na linha [identificação].','O POP de higienização de embalagens não estava disponível ou estava desatualizado na linha [identificação].']
    examples['4.1.1/1']=['Na captação [identificação], a área ao redor da casa de proteção estava pavimentada, limpa e livre de focos de insalubridade.','Na captação [identificação], observou-se [falha na pavimentação, sujidade ou foco de insalubridade] em [local], conforme [evidência].']
    examples['4.1.1/2']=['Na captação [identificação], a drenagem pluvial estava funcional, sem empoçamento nos pontos vistoriados.','Na captação [identificação], observou-se [falha na drenagem pluvial] em [local], conforme [evidência].']
    change(match[0],'const BPF_FILL_EXAMPLES='+json.dumps(examples,ensure_ascii=False,separators=(',',':'))+';')
    return source

for filename in ('individual.html','equipe.html'):
    path=Path(filename)
    path.write_text(patch(path.read_text(encoding='utf-8')),encoding='utf-8')
