#!/usr/bin/env python3
from pathlib import Path
import re,json
s=Path('individual.html').read_text(encoding='utf-8')
print('HTML bytes',len(s))
for term in ['const D=','const D =','var D=','var D =','const values=', 'function sync(){','function fit(', 'function recalc(){','const observationNames=', 'OBSERVAÇÕES GERAIS', 'doc_legal_1_situacao', 'BPF_OBSERVATION_FIELDS']:
 i=s.find(term)
 print('LOC',repr(term),i,'count',s.count(term),repr(s[max(0,i-180):i+2500] if i>=0 else ''))
for name in ['const D=', 'const D =']:
 if name in s:
  st=s.index(name)+len(name)
  try:
   d,end=json.JSONDecoder().raw_decode(s[st:])
   print('Dkeys',list(d.keys()),'data_len',end)
   widgets=d.get('widgets',[])
   print('p13p14-WIDGETS',json.dumps([{**w,'label':d.get('fields',{}).get(w['name'],{}).get('label',''),'flags':d.get('fields',{}).get(w['name'],{}).get('flags')} for w in widgets if w.get('page') in (13,14)],ensure_ascii=False)[:23000])
   print('OBS-FIELDS',json.dumps({k:v for k,v in d.get('fields',{}).items() if any(t in k.upper() for t in ['OBS','DOCUMENT','CONTINUAÇÃO'])},ensure_ascii=False)[:5000])
  except Exception as e: print('DECODE ERROR',repr(e))

print('### INSPECAO ESPECIFICA ###')
for term in ('const GUIDE_DATA=', 'var GUIDE_DATA=', 'obs_gerais_continuacao','BPF_OBSERVATION_FIELDS[\'continuacao\']', 'OBS 1', 'function syncLinked(', 'window.print()', 'function exportPdf('):
 p=0
 for n in range(6):
  i=s.find(term,p)
  if i<0:break
  print('TERM',repr(term),'nth',n,'pos',i,'ctx',repr(s[max(0,i-210):i+520]))
  p=i+len(term)
start=s.index('const GUIDE_DATA=')+len('const GUIDE_DATA=')
try:
 data,length=json.JSONDecoder().raw_decode(s[start:])
 print('GUIDE DATA KEYS',list(data.keys()),length)
 widgets=data.get('widgets',[])
 fields=data.get('fields',{})
 for pg in (13,14):
  w=[{**x,'label':fields.get(x.get('name'),{}).get('label'),'flags':fields.get(x.get('name'),{}).get('flags')} for x in widgets if x.get('page')==pg]
  print('PAGE_WIDGETS',pg,json.dumps(w,ensure_ascii=False)[:28000])
 print('TARGET_FIELDS',json.dumps({k:fields[k] for k in fields if k in ('OBS 1','obs_gerais_continuacao') or 'OBSERVA' in k.upper() and 'GERAIS' not in k.upper()},ensure_ascii=False)[:3000])
except Exception as e:print('GUIDE JSON ERROR',repr(e))
