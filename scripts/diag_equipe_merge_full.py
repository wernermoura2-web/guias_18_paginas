from pathlib import Path
import re,json
h=Path('equipe.html').read_text(encoding='utf-8')
a=h.index('function cleanTeam18(');b=h.index('let team18=makeTeam18();',a);print('CLEAN_TEAM:',h[a:b])
a=h.index('const PROCESSES18=');b=h.index('const normalizeTeam18=',a);print('TEAM_SETUP:',h[a:b])
a=h.index('function showMergeTeam18(){');b=h.index('function showTeam18(){',a);print('MERGE_UI_AND_APPLY:',h[a:b])
a=h.index('function showTeam18(){');b=h.find('</script>',a);print('SHOW_TEAM:',h[a:min(b,a+9500)])
m='const GUIDE_DATA=';p=h.index(m)+len(m)
D,_=json.JSONDecoder().raw_decode(h[p:])
for n in ['RESPONSÁVEIS PELA INSPEÇÃORow1','obs_gerais_continuacao']:
 print('FIELD',n,D['fields'].get(n))
for k in D['fields']:
 if 'Photo' in k or 'Rotulo' in k or 'Foto' in k or 'Imagem' in k:
  if re.search('BPF_|Rotulo|Rotação|rotate|Rotation|Angle|Giro',k,re.I):
   print('PHOTO_FIELD',k,str(D['fields'][k])[:420])
