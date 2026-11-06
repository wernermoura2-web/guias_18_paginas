#!/usr/bin/env python3
"""Corrige escopos da Condução e da Higienização de tampas em todos os resumos e Anexo F."""
from pathlib import Path
import re, subprocess, json

SCOPE_OLD="""function bpfScopeLabel(page,scope){
 if(page.page<2)return 'Captação '+scope.col;
 if(page.page<6)return 'Reservatório '+scope.col;
 if(page.page===6)return ({1:'Garrafões retornáveis',2:'Embalagens descartáveis',3:'Rótulos',4:'Saneantes'})[scope.col];
 if(page.page<=10)return 'Linha '+scope.col;
 return 'Estabelecimento';
}"""
SCOPE_NEW="""function bpfScopeLabel(page,scope){
 if(page.page===0)return 'Captação '+scope.col;
 if(page.page===1)return 'Condução '+scope.col;
 if(page.page<6)return 'Reservatório '+scope.col;
 if(page.page===6)return ({1:'Garrafões retornáveis',2:'Embalagens descartáveis',3:'Rótulos',4:'Saneantes'})[scope.col];
 if((page.page===7||page.page===8)&&Number(scope.col)===4)return 'Higienização de tampas';
 if(page.page<=10)return 'Linha '+scope.col;
 return 'Estabelecimento';
}"""
PCC_OLD="const unit=(page.page===6?({1:'Garrafões retornáveis',2:'Embalagens descartáveis',3:'Rótulos',4:'Saneantes'})[scope.col]:(page.page<2?'Captação ':page.page<6?'Reservatório ':'Linha ')+scope.col)+(source?' - '+source:'');"
PCC_NEW="const unit=bpfScopeLabel(page,scope)+(source?' - '+source:'');"
NC_OLD="const unit=page.page<2?'Captação '+scope.col:page.page<6?'Reservatório '+scope.col:page.page===6?({1:'Garrafões retornáveis',2:'Embalagens descartáveis',3:'Rótulos',4:'Saneantes'})[scope.col]:page.page<=10?'Linha '+scope.col:'Estabelecimento';"
NC_NEW="const unit=bpfScopeLabel(page,scope);"
ANNEX_OLD="(source.page<2?'Captação ':source.page<6?'Reservatório ':'Linha ')+r.scope.col+' / F'+(index+1)"
ANNEX_NEW="bpfScopeLabel(source,r.scope)+' / F'+(index+1)"
OBS_OLD="const unit=(page.page<2?'C':page.page<6?'R':'L')+scope.col;"
OBS_NEW="const unit=bpfScopeLabel(page,scope);"

def replace_one(h,old,new,filename):
 if h.count(new)==1 and h.count(old)==0: return h
 assert h.count(old)==1,(filename,"marcador esperado uma vez",old[:130],h.count(old))
 return h.replace(old,new,1)

for filename in ("individual.html","equipe.html"):
 p=Path(filename)
 h=p.read_text(encoding="utf-8")
 marker="const BPF_PHRASES="
 pos=h.index(marker)+len(marker)
 pages,_=json.JSONDecoder().raw_decode(h[pos:])
 assert [r["code"] for pg in pages if pg["page"]==1 for r in pg["rows"]]==["4.2.2","4.2.7","4.2.8","4.2.9"],filename
 for page in (7,8):
  rs=[r for pg in pages if pg["page"]==page for r in pg["rows"]]
  assert rs and any(r["code"]=="4.6.11" for r in rs),filename
  assert all(any(int(s["col"])==4 for s in r["scopes"]) for r in rs if r["code"] in ("4.6.11","4.6.12")),filename
 # Do not modify norm text, phrase identifiers, saved answers, or APPCC category.
 before=json.dumps(pages,ensure_ascii=False,sort_keys=True)
 for old,new in ((SCOPE_OLD,SCOPE_NEW),(PCC_OLD,PCC_NEW),(NC_OLD,NC_NEW),(ANNEX_OLD,ANNEX_NEW),(OBS_OLD,OBS_NEW)):
  h=replace_one(h,old,new,filename)
 assert h.count(SCOPE_NEW)==1
 assert h.count(PCC_NEW)==1
 assert h.count(NC_NEW)==1
 assert h.count(ANNEX_NEW)==1
 assert h.count(OBS_NEW)==1
 pos=h.index(marker)+len(marker)
 afterpages,_=json.JSONDecoder().raw_decode(h[pos:])
 assert json.dumps(afterpages,ensure_ascii=False,sort_keys=True)==before,filename
 for term in ("function bpfScopeLabel(page,scope){","function bpfSyncPCCFinal(){","function bpfSyncNCLists(){","function bpfAnnexRows(){","function bpfOpenPhrases(row,page){"):
  i=h.index(term)
  a=h.rfind("<script",0,i)
  a=h.index(">",a)+1
  b=h.index("</script>",i)
  check=subprocess.run(["node","--check"],input=h[a:b],text=True,capture_output=True)
  assert check.returncode==0,(filename,term,check.stderr[:1600])
 p.write_text(h,encoding="utf-8")
 print("VALIDADO",filename,": Condução 1–4 no processo 4.2; Higienização de tampas na unidade 4 de 4.6 retornáveis/descartáveis; telas F, OBS/NC, PCC e anexo PDF; dados originais preservados.")

p=Path("index.html")
h=p.read_text(encoding="utf-8")
h,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"]+"',lambda m:'href="'+m.group(1)+'20261105-conducao-tampas-correcao"',h)
assert n==2,n
p.write_text(h,encoding="utf-8")
p=Path("sw-guia18.js")
s=p.read_text(encoding="utf-8")
s,n=re.subn(r"const CACHE='guia18-menu-[^']+';","const CACHE='guia18-menu-v19-bpf20261105-conducao-tampas';",s)
assert n==1,n
p.write_text(s,encoding="utf-8")
print("Links e cache dos dois modos atualizados.")
