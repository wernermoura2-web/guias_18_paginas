from pathlib import Path
import re,json
s=Path('individual.html').read_text('utf-8')
for beginning,end in [('function fit(el){','function sync(){'),('function bpfObservationFontSize(','async function bpfExportEditable(){'),('async function bpfExportEditable(){','document.querySelector(\'#print\').onclick=bpfExportEditable'),('function bpfGeneralFlow(full){','function bpfSyncNCLists(){')]:
 a=s.find(beginning);b=s.find(end,a+len(beginning))
 if a>=0:
  txt=s[a:b] if b>a else s[a:a+8000]
  print('EXTRACT',beginning,'LEN',len(txt),repr(txt[:12500]))
for mark in ['function fit(','function fitText','function fitTextArea','function bpfObservationFontSize(','function syncLinked','function renderText','function setFont']:
 inds=[m.start() for m in re.finditer(re.escape(mark),s)];print('MARK',mark,'COUNT',len(inds),'AT',inds[:10])
 for a in inds[-2:]:print('TEXT',repr(s[max(0,a-100):a+1950]))
# only observation widgets, dimensions
idx=s.index('const GUIDE_DATA=')+len('const GUIDE_DATA=')
D,num=json.JSONDecoder().raw_decode(s[idx:])
for name in ['OBSERVAÇÕES GERAISRow1','OBSERVAÇÕES GERAISRow1_2','OBSERVAÇÕES GERAISRow1_3','OBSERVAÇÕES GERAISRow1_8','OBSERVAÇÕES GERAISRow1_10','OBSERVAÇÕES GERAISRow1_12','OBS 1','obs_gerais_continuacao','CONSIDERAÇÕES FINAIS  AVALIAÇÃO DE RISCORow1']:
 field=D['fields'].get(name);wi=[w for w in D['widgets'] if w['name']==name];print('BOX',name,repr(field)[:240],[(w['page'],w['rect']) for w in wi])
print('HTMLSTYLES',repr(s[s.index('<style>'):s.index('</style>')])[:11500])
