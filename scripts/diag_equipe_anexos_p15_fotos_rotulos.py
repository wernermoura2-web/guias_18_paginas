#!/usr/bin/env python3
from pathlib import Path
import re
h=Path('equipe.html').read_text(encoding='utf8')
def chunk(s,e,n=1):
 i=0
 for k in range(n):
  a=h.find(s,i)
  if a<0:break
  b=h.find(e,a+len(s))
  print('CHUNK',repr(s),'AT',a,'to',b,'LEN',b-a)
  print(h[a:b if b<a+20000 else a+20000][:20000])
  i=a+len(s)
chunk('const PROCESSES18=', 'const normalizeTeam18=')
chunk('function showMergeTeam18(){','function closeTeam18')
chunk('function showMergeTeam18(){','function applyMergeTeam18')
chunk('function applyMergeTeam18','const TEAM18')
chunk('function teamDownload18(','function parseValues18')
for x in ['function mergeTeam18','function commitTeam18','function mergeSelectedTeam18','function teamDownload18','team18.imports.push','TEAM18.preview','for(const [n,v]of Object.entries(incoming','Object.entries(images)','scope.pages.includes(w.page)']:
 pos=[m.start() for m in re.finditer(re.escape(x),h)]
 print('MARK',repr(x),'N',len(pos),'AT',pos[:12])
 for p in pos[-3:]:print('CTX',repr(h[max(0,p-300):p+1300]))
# Inspect actual parsed GUIDE_DATA field/widget metadata page indices
try:
 m='const GUIDE_DATA=';p=h.index(m)+len(m)
 import json
 guide,consumed=json.JSONDecoder().raw_decode(h[p:])
 print('GUIDE_DATA',len(guide['widgets']),len(guide['fields']))
 for page in [13,14,15,16,17,18,19,20,21]:
  wx=[w for w in guide['widgets'] if w.get('page')==page]
  print('PAGE',page+1,'WIDGETS',len(wx),'NAMES',[(w.get('name'),w.get('type')) for w in wx[:35]])
  for w in wx[:14]:
   f=guide['fields'].get(w['name'],{})
   print('FIELD',w['name'],str(f.get('label',''))[:160],f.get('type',''))
except Exception as e:print('GUIDE_PARSE_ERR',repr(e))
