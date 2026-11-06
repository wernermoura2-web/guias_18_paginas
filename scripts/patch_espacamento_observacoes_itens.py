#!/usr/bin/env python3
"""Separar observações de itens com uma linha em branco nos guias Individual e Equipe.
Ajusta apenas quebras de linha; mantém conteúdo e vinculação das frases F.
"""
from pathlib import Path
import re,subprocess,json

OLD="""function bpfMergeObservation(text,code,previous,summary){const start='[Frases '+code+']',end='[/Frases '+code+']',a=text.indexOf(start);if(a>=0){const b=text.indexOf(end,a);if(b>=0)text=text.slice(0,a)+text.slice(b+end.length);}if(previous){const i=text.indexOf(previous);if(i>=0)text=text.slice(0,i)+text.slice(i+previous.length);}text=text.trimEnd();return text+(summary?(text?' ':'')+summary:'');}"""

NEW=r"""function bpfSpaceItemObservations(text){
 // Espaço pequeno: somente UMA linha vazia entre itens, sem editar as palavras.
 // Reconhece os resumos antigos (4.2.7 C1/F2) e os novos (4.2.7 F2 —).
 return String(text??'').replace(/\r\n?/g,'\n')
  .replace(/([.;)])[\t ]+(?=4\.\d{1,2}\.\d{1,2}\s+(?:[CRL]\d+\/F\d+|F\d+\s*[—–-]))/g,'$1\n\n');
}
function bpfSpaceProcessObservations(){
 // Executa após importação de JSON antigo e antes de desenhar as páginas do guia.
 // Não mistura itens, categorias APPCC, notas individuais nem conteúdo de usuário.
 for(const name of new Set(Object.values(BPF_OBSERVATION_FIELDS))){
  if(typeof values[name]==='string'&&values[name])
   values[name]=bpfSpaceItemObservations(values[name]);
 }
}
function bpfMergeObservation(text,code,previous,summary){
 const start='[Frases '+code+']',end='[/Frases '+code+']',a=text.indexOf(start);
 if(a>=0){const b=text.indexOf(end,a);if(b>=0)text=text.slice(0,a)+text.slice(b+end.length);}
 if(previous){const i=text.indexOf(previous);if(i>=0)text=text.slice(0,i)+text.slice(i+previous.length);}
 text=bpfSpaceItemObservations(text).trimEnd();
 return text+(summary?(text?'\n\n':'')+summary:'');
}"""

old_recalc="function recalc(){bpfInspectorApplySaved();bpfApplyAnswers(values);"
new_recalc="function recalc(){bpfInspectorApplySaved();bpfApplyAnswers(values);bpfSpaceProcessObservations();"

for file in ("individual.html","equipe.html"):
    p=Path(file)
    html=p.read_text(encoding="utf-8")
    assert html.count(OLD)==1,(file,'old merge function missing')
    assert html.count(old_recalc)==1,(file,'recalc init missing')
    original_marker="const BPF_PHRASES="
    pos=html.index(original_marker)+len(original_marker)
    original,_=json.JSONDecoder().raw_decode(html[pos:])
    html=html.replace(OLD,NEW,1).replace(old_recalc,new_recalc,1)
    assert html.count("function bpfSpaceItemObservations(text){")==1
    assert html.count("function bpfSpaceProcessObservations(){")==1
    assert html.count("function bpfMergeObservation(text,code,previous,summary){")==1
    assert html.count(new_recalc)==1
    assert html.count("function bpfPdfGeneralSplit(full,font,form,pdf){")==1
    assert html.count("async function bpfAppendCompactAnnex(pdf){")==1
    assert html.count("function bpfInspectorOpenReview(){")==1
    assert html.count("function bpfSyncNCLists(){")==1
    assert html.count("function bpfSyncUnifiedObservation(row,page){")==1
    pos=html.index(original_marker)+len(original_marker)
    after,_=json.JSONDecoder().raw_decode(html[pos:])
    assert after==original,(file,'phrases unexpectedly modified')
    for start in ("function bpfSpaceItemObservations(text){","function recalc(){","function bpfPdfGeneralSplit(full,font,form,pdf){"):
        at=html.index(start)
        left=html.rfind("<script",0,at)
        left=html.index(">",left)+1
        right=html.index("</script>",at)
        check=subprocess.run(["node","--check"],input=html[left:right],capture_output=True,text=True)
        assert check.returncode==0,(file,start,check.stderr[:1200])
    p.write_text(html,encoding="utf-8")
    print("VALIDADO",file,"observações separadas por UMA linha em branco por item; textos, APPCC, importação e PDF preservados.")

idx=Path("index.html")
html=idx.read_text(encoding="utf-8")
html,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"#]+(#[^"]*)?"',
 lambda m:'href="'+m.group(1)+'20261106-observacoes-espacamento-itens'+(m.group(2) or '')+'"',html)
assert n==3,(n,"esperados dois modos e uma revisao")
idx.write_text(html,encoding="utf-8")

sw=Path("sw-guia18.js")
code=sw.read_text(encoding="utf-8")
code,n=re.subn(r"const CACHE='guia18-menu-[^']+';","const CACHE='guia18-menu-v27-bpf20261106-obs-espacamento';",code)
assert n==1,n
sw.write_text(code,encoding="utf-8")
print("Links do menu unico e cache atualizados.")
