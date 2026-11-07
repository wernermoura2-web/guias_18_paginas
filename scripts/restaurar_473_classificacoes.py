from pathlib import Path
import json,re

def patch(source):
    def change(old,new):
        nonlocal source
        assert source.count(old)==1,old[:130]
        source=source.replace(old,new)
    if 'function bpfPanelClasses(' in source:
        return source
    count=0
    for match in reversed(list(re.finditer(r'\{"code":"4\.7\.3",',source))):
        row,n=json.JSONDecoder().raw_decode(source[match.start():])
        if row['scopes']:
            continue
        count+=1
        row['scopes']=[{
            'name':f'EnvaseRet_CO2_L{line}','col':line,'observationOnly':True,
            'phrases':[{**row['phrases'][0],'allowNA':True}],
        } for line in range(1,5)]
        source=source[:match.start()]+json.dumps(row,ensure_ascii=False,separators=(',',':'))+source[match.start()+n:]
    assert count==1
    change("if(a!==null||cleared)v[s.name]=a??'Off';", "if(!s.observationOnly&&(a!==null||cleared))v[s.name]=a??'Off';")
    change("function bpfPanels(page,row){", """function bpfPanelClasses(row,panel){
 const phrases=panel.entries.length?panel.entries.map(e=>e.phrase):[row.phrases[panel.indices?.[0]??panel.id]];
 return [...new Set(phrases.map(phrase=>phrase?.appcc).filter(Boolean))];
}
function bpfPanels(page,row){""")
    change("""  const legend=document.createElement('legend');legend.textContent=panel.label;card.append(legend);""",
           """  const legend=document.createElement('legend');
  const classes=bpfPanelClasses(row,panel);
  legend.textContent=panel.label+(classes.length?' — BPF/APPCC: '+classes.join(' / '):'');card.append(legend);""")
    change("""  const legend=document.createElement('legend');legend.textContent=panel.label+(panel.composite?' — caixas selecionáveis':' — BPF/APPCC: '+(panel.entries[0]?.phrase.appcc||''));card.append(legend);""",
           """  const legend=document.createElement('legend');
  const classes=bpfPanelClasses(row,panel);
  legend.textContent=panel.label+(classes.length?' — BPF/APPCC: '+classes.join(' / '):'');card.append(legend);""")
    return source

for name in ('equipe.html','individual.html'):
    path=Path(name)
    path.write_text(patch(path.read_text(encoding='utf-8')),encoding='utf-8')
for name in ('index.html','revisao-frases.html','sw-guia18.js'):
    path=Path(name)
    path.write_text(path.read_text().replace('20261107-estrutura-envase-v29','20261107-classificacoes-v30').replace('guia18-estrutura-envase-20261107-v29','guia18-classificacoes-20261107-v30'))
