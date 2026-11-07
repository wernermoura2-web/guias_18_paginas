"""Separar exemplos de OBS e NC no editor compartilhado pelos dois guias."""
from pathlib import Path
import json
import re


# Modelos anonimizados, adaptados dos descritores e dos guias preenchidos.
NC = {
    '4.1.1/1': 'Na captação [identificação], a drenagem pluvial apresentava acúmulo de vegetação em [trecho], conforme [evidência].',
    '4.2.2/2': 'Na condução [identificação], observou-se abaulamento da tubulação em [trecho], conforme [evidência].',
    '4.2.7/3': 'Não foi apresentado comprovante de capacitação do funcionário que realizou a higienização da condução [identificação] em [data].',
    '4.2.8/1': 'A condução [identificação] possui conexões desmontáveis com juntas em [trecho], mas não foi comprovada sua abertura para inspeção e higienização.',
    '4.2.9/2': 'O POP [código e revisão] da condução [identificação] omite [concentração, tempo de contato ou outro parâmetro ausente].',
    '4.3.3': 'No reservatório [identificação], não foi apresentado o registro da última troca do elemento filtrante ou não foi localizada a torneira de amostragem. Registre apenas a condição observada e a evidência correspondente.',
    '4.3.5/2': 'Não foram apresentados registros de higienização do reservatório [identificação] no período [período].',
    '4.3.5/3': 'Não foi apresentado comprovante de capacitação do funcionário responsável pela higienização do reservatório [identificação].',
    '4.5.3/1': 'Na recepção do lote [lote], foram encontradas bombonas de saneante sem rótulo de identificação, impedindo verificar [identidade ou validade].',
    '4.5.3/2': 'Foram encontradas unidades do lote [lote] de [insumo] fora da especificação [identificação] sem evidência de reprovação.',
    '4.5.6/2': 'Não foi apresentado registro datado e assinado da devolução dos garrafões reprovados em [data ou carga].',
    '4.5.8/1': 'O POP de recepção [código e revisão] não descreve os critérios de inspeção individual e reprovação dos garrafões retornáveis.',
    '4.6.3/1': 'Na linha [identificação], constatou-se que as embalagens de primeiro uso recebidas de [fornecedor ou lote] passaram ao envase sem o enxágue automático com solução desinfetante.',
    '4.6.4/1': 'Na linha [identificação], as escovas do equipamento de pré-lavagem apresentavam desgaste, conforme [evidência].',
    '4.6.5/2': 'O relatório de eficácia da lavadora [identificação] utiliza produtos ou concentrações diferentes dos empregados atualmente, conforme comparação com [registro ou observação].',
    '4.6.6/2': 'Não foram apresentados registros dos testes indicadores de ausência de resíduos de detergentes e saneantes na lavadora da linha [identificação], referentes a [data ou período].',
    '4.6.7/1': 'Na lavadora automática da linha [identificação], os bicos de enxágue estavam obstruídos e o jato de água não alcançava o fundo das embalagens.',
    '4.6.8/1': 'O saco de tampas em contato com a caixa de papelão foi levado à sala de envase [identificação] sem evidência de higienização externa.',
    '4.6.9/1': 'Na linha [identificação], o trecho de esteira entre a lavadora e a sala de envase estava descoberto em [local].',
    '4.6.10/2': 'Durante a paralisação da linha [identificação], a abertura de passagem das embalagens permaneceu aberta por ausência de dispositivo de fechamento.',
    '4.6.12/1': 'O POP [código e revisão] de higienização omite os cuidados para manipulação, transporte e armazenamento das tampas entre o estoque e a sala de envase [identificação].',
    '4.7.1/1': 'Na linha [identificação], observou-se intervenção manual para fechar as tampas durante a operação do tampador automático.',
    '4.7.2/1': 'Na sala de envase [identificação], a porta não ajustava aos batentes, deixando fresta em [local].',
    '4.7.2/2': 'Na sala de envase [identificação], observou-se sujidade no piso sob o maquinário, em [local ou momento].',
    '4.7.4/2': 'Na sala de envase [identificação], o ralo de [local] apresentava [ausência de sifão ou tampa, ou conexão inadequada na drenagem], conforme [evidência].',
    '4.7.8/2': 'Não foram apresentados os registros de desmonte e higienização de [equipamento] da linha [identificação] no período previsto em [POP].',
    '4.10.3/2': 'Para a captação [identificação], não foram apresentados resultados da análise semanal de bactérias heterotróficas no período [período].',
    '4.10.4/1': 'O plano de amostragem [identificação] não contempla [parâmetro] na [etapa ou ponto de coleta], conforme revisão de [data].',
    '4.10.4/2': 'O plano de amostragem prevê a análise de [parâmetro] em [ponto], mas não foram apresentados os registros de sua execução em [período].',
    '4.10.5/2': 'Não foi apresentado o laudo físico-químico do produto envasado [identificação], referente ao período [período].',
    '4.10.6/1': 'Após resultado insatisfatório para [parâmetro] na captação [identificação], a reanálise abrangeu [quantidade] amostra(s), abaixo do previsto no procedimento [código].',
}
SIM = {
    '4.6.6/2': 'Os registros de [data ou período] da linha [identificação] demonstraram, por teste indicador [método], a ausência de resíduos após o enxágue.',
    '4.7.8/2': 'Os registros de [data ou período] documentam o desmonte e a higienização de [equipamento] na frequência prevista no POP [código].',
    '4.10.4/1': 'O plano de amostragem [identificação] especifica pontos de coleta, número de amostras, parâmetros e frequências por etapa.',
    '4.10.4/2': 'Os registros de [período] demonstram a execução do plano para [parâmetros e pontos] e a avaliação pelos limites definidos.',
}

MODELS = '''
const BPF_EXAMPLE_REVISIONS=new Map();
function bpfExampleKey(page,code,panel){return 'examples:'+page.page+':'+code+':'+(panel.id+1);}
for(const page of BPF_PHRASES)for(const row of page.rows)for(const panel of bpfPanels(page,row)){
 const key=bpfExampleKey(page,row.code,panel);
 const original={sim:bpfDefaultFillExample(row.code,panel,'1'),nao:bpfDefaultFillExample(row.code,panel,'0')};
 const example={...original};
 const entry={key,page:page.page,code:row.code,label:panel.label,scopes:[],original,refs:[example]};
 BPF_EXAMPLE_REVISIONS.set(key,example);
 BPF_INSPECTOR_ENTRIES.push(entry);BPF_INSPECTOR_BY_KEY.set(key,entry);
}
function bpfFillExample(page,code,panel,answer){
 if(answer!=='1'&&answer!=='0')return '';
 const example=BPF_EXAMPLE_REVISIONS.get(bpfExampleKey(page,code,panel));
 return example?.[answer==='1'?'sim':'nao']??bpfDefaultFillExample(code,panel,answer);
}
'''

def patch(source):
    def replace(before, after, count=1):
        nonlocal source
        if source.count(before) != count:
            raise ValueError(f'Expected {count} matches for {before[:90]!r}, found {source.count(before)}')
        source = source.replace(before, after)

    if 'const BPF_EXAMPLE_REVISIONS=' in source:
        return source
    match = re.search(r'^const BPF_FILL_EXAMPLES=(.*);$', source, re.M)
    examples = json.loads(match[1])
    for key in dict.fromkeys([*NC, *SIM]):
        code, _, _ = key.partition('/')
        example = examples.get(key) or examples.get(code) or ['', '']
        examples[key] = [SIM.get(key, example[0]), NC.get(key, example[1])]
    replace(match[0], 'const BPF_FILL_EXAMPLES='+json.dumps(examples, ensure_ascii=False, separators=(',', ':'))+';')
    replace("function bpfFillExample(code,panel,answer){", "function bpfDefaultFillExample(code,panel,answer){")
    replace("if(specific)return specific[answer==='1'?0:1];",
            "const text=specific?.[answer==='1'?0:1];\n if(text)return text;")
    replace('function bpfAttachNoteTools(area,parent,code,panel,getAnswer){',
            MODELS+'function bpfAttachNoteTools(area,parent,page,code,panel,getAnswer){')
    replace('bpfFillExample(code,panel,getAnswer())','bpfFillExample(page,code,panel,getAnswer())',2)
    replace("  example.textContent=text||", """  const answer=getAnswer();
  summary.textContent=answer==='1'?'Exemplo de preenchimento — Sim (OBS)':answer==='0'?'Exemplo de preenchimento — Não (NC)':'Exemplo de preenchimento';
  example.textContent=text||""")
    replace('bpfAttachNoteTools(area,card,row.code,panel','bpfAttachNoteTools(area,card,page,row.code,panel')
    replace('bpfAttachNoteTools(area,box,row.code,panel','bpfAttachNoteTools(area,box,page,row.code,panel')
    replace("""  if(typeof change.text!=='string'||typeof change.guidance!=='string')continue;
  if(change.text.length>10000||change.guidance.length>10000)continue;""",
            """  const fields=Object.keys(item.original);
  if(!fields.every(field=>typeof change[field]==='string'&&change[field].length<=10000))continue;""")
    replace("""  if(change.text!==item.original.text||change.guidance!==item.original.guidance)
   entries[key]={text:change.text,guidance:change.guidance};""",
            """  if(fields.some(field=>change[field]!==item.original[field]))
   entries[key]=Object.fromEntries(fields.map(field=>[field,change[field]]));""")
    replace('for(const target of item.refs){target.text=value.text;target.guidance=value.guidance;}',
            'for(const target of item.refs)Object.assign(target,value);')
    replace('if(candidate.text===item.original.text&&candidate.guidance===item.original.guidance)delete pending[item.key];',
            'if(Object.keys(item.original).every(field=>candidate[field]===item.original[field]))delete pending[item.key];')
    replace('e.original.text,e.original.guidance,actual(e).text,actual(e).guidance',
            '...Object.values(e.original),...Object.values(actual(e))')
    replace("const head=document.createElement('h3');head.textContent=entry===bpfNoteInstructionEntry?",
            """const isExample=entry.key.startsWith('examples:');
   const head=document.createElement('h3');head.textContent=isExample?(titles[entry.page]||'Processo')+' | Item '+entry.code+' | '+entry.label+' | Exemplos'+(pending[entry.key]?' | Revisado':''):entry===bpfNoteInstructionEntry?""")
    replace("for(const [field,titleText]of (entry===bpfNoteInstructionEntry?",
            """for(const [field,titleText]of (isExample?[['sim','Sim — Observação de conformidade'],['nao','Não — Não conformidade']]:entry===bpfNoteInstructionEntry?""")
    replace("'Restaurar orientação original':'Restaurar original deste F'",
            "'Restaurar orientação original':isExample?'Restaurar exemplos originais':'Restaurar original deste F'")
    replace('Edite o texto das frases F e as orientações utilizadas nas telas de inspeção.',
            'Edite o texto das frases F, as orientações e, separadamente, os exemplos de Sim (OBS) e Não (NC) usados na inspeção.')
    return source


if __name__ == '__main__':
    for name in ('individual.html','equipe.html'):
        path=Path(name)
        path.write_text(patch(path.read_text(encoding='utf-8')),encoding='utf-8')
