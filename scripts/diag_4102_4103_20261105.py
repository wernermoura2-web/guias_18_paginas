import json
from pathlib import Path
h=Path('individual.html').read_text(encoding='utf-8')
m='const BPF_PHRASES='
p,_=json.JSONDecoder().raw_decode(h[h.index(m)+len(m):])
for page in p:
 for r in page['rows']:
  if r['code'] in ('4.10.2','4.10.3','4.10.4','4.3.3','4.11.2'):
   print('ITEM',r['code'],'PAGE',page['page'],'SCOPES',len(r['scopes']),'PHRASES',len(r['phrases']))
   for i,f in enumerate(r['phrases']):
    print(' F',i+1,'appcc',f.get('appcc'),'text',repr(f.get('text','')[:260]))
   print('SCOPE_TEXTS',[(s['col'],s['name'],len(s['phrases'])) for s in r['scopes']])
   if r['scopes']:
    print('FIRST_SCOPE',[(i+1,f.get('appcc'),f.get('text','')[:90]) for i,f in enumerate(r['scopes'][0]['phrases'])])
