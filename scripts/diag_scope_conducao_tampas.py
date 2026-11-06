#!/usr/bin/env python3
from pathlib import Path
import re, json
h=Path('individual.html').read_text(encoding='utf-8')
k='const BPF_PHRASES='
pages,_=json.JSONDecoder().raw_decode(h[h.index(k)+len(k):])
for p in pages:
 codes=[r['code'] for r in p['rows']]
 print('PAGE',p['page'],'CODES',','.join(codes[:5]),'...',','.join(codes[-5:]),'COUNT',len(codes))
 for r in p['rows']:
  if r['code'] in ('4.2.2','4.6.8','4.6.11','4.6.12','4.7.1'):
   print(' TARGET',p['page'],r['code'],[(s['col'],s['name']) for s in r['scopes']])
for regex in (r'\b(?:const|let|var)\s+titles\s*=',r'\b(?:const|let|var)\s+titles\s*=\s*\[',r'page\.page\s*<\s*2',r'page\.page\s*<=?\s*10',r'source\.page\s*<\s*2',r'Linha\s*[\'"]\s*\+\s*scope\.col'):
 print('PATTERN',regex)
 pos=[m.start() for m in re.finditer(regex,h)]
 print('COUNT',len(pos),'POSITIONS',pos[:35])
 for i in pos[:20]:print(' CONTEXT',repr(h[max(0,i-175):i+450]))
