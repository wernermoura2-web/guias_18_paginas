#!/usr/bin/env python3
"""Distribuir texto das Observações Gerais nas páginas 14 e 15 do Guia BPF."""
from pathlib import Path
import re
import subprocess

FLOW_JS=r"""
function bpfGeneralFullText(){
 const first=String(values['OBS 1']||''),second=String(values.obs_gerais_continuacao||'');
 let old={};try{old=JSON.parse(values.BPF_ObsGeneralFlow||'{}')}catch(e){}
 if(old.first===first&&old.second===second&&typeof old.full==='string')return old.full;
 if(!old.full&&first&&second&&!/\s$/.test(first)&&!/^\s/.test(second))return first+'\n\n'+second;
 return first+second;
}
function bpfGeneralFlow(full){
 if(!Object.hasOwn(values,'OBS 1')||!Object.hasOwn(values,'obs_gerais_continuacao'))return;
 full=String(full||'').replace(/\r\n?/g,'\n');
 const first=document.querySelector('textarea[data-field="OBS 1"]');
 const second=document.querySelector('textarea[data-field="obs_gerais_continuacao"]');
 if(!first||!second||!first.clientHeight||!second.clientHeight){
  values['OBS 1']=full;
  values.obs_gerais_continuacao='';
  return;
 }
 const dims=[first.clientWidth,first.clientHeight,second.clientWidth,second.clientHeight].join('x');
 let last={};try{last=JSON.parse(values.BPF_ObsGeneralFlow||'{}')}catch(e){}
 if(last.full===full&&last.first===values['OBS 1']&&last.second===values.obs_gerais_continuacao&&last.dims===dims)return;
 function tester(el){
  const probe=document.createElement('textarea');
  probe.className=el.className;
  probe.style.cssText='position:absolute!important;left:-20000px!important;top:0!important;visibility:hidden!important;pointer-events:none!important;resize:none!important;overflow:hidden!important;box-sizing:border-box!important';
  probe.style.width=el.clientWidth+'px';
  probe.style.height=el.clientHeight+'px';
  probe.style.padding=getComputedStyle(el).padding;
  probe.style.fontFamily=getComputedStyle(el).fontFamily;
  probe.style.fontWeight=getComputedStyle(el).fontWeight;
  probe.style.lineHeight='1.25';
  el.parentElement.appendChild(probe);
  return probe;
 }
 const a=tester(first),b=tester(second);
 function fit(t,part,font){
  t.style.fontSize=font+'px';
  t.value=part;
  return t.scrollHeight<=t.clientHeight+1&&t.scrollWidth<=t.clientWidth+1;
 }
 function partition(font){
  if(fit(a,full,font))return {first:full,second:'',ok:true,font:font};
  let low=0,high=full.length;
  while(low<high){
   const mid=Math.ceil((low+high)/2);
   if(fit(a,full.slice(0,mid),font))low=mid;else high=mid-1;
  }
  let cut=low;
  if(cut>0&&cut<full.length){
   const n=full.lastIndexOf('\n',cut-1),sp=full.lastIndexOf(' ',cut-1);
   const pos=Math.max(n,sp);
   if(pos>=cut-150&&pos>0)cut=pos+1;
  }
  const firstPart=full.slice(0,cut),secondPart=full.slice(cut);
  return {first:firstPart,second:secondPart,ok:fit(b,secondPart,font),font:font};
 }
 let result;
 try{
  for(const font of [11,10,9,8,7,6,5]){
   result=partition(font);
   if(result.ok)break;
  }
 }finally{a.remove();b.remove();}
 values['OBS 1']=result.first;
 values.obs_gerais_continuacao=result.second;
 values.BPF_ObsGeneralFlow=JSON.stringify({first:result.first,second:result.second,full:full,font:result.font,dims:dims,overflow:!result.ok});
 if(!result.ok){
  const status=document.querySelector('#status');
  if(status&&status.textContent.indexOf('excedem')<0)status.textContent='As Observações Gerais excedem o espaço das páginas 14 e 15. O conteúdo completo permanece no arquivo JSON; reduza o texto para impressão integral.';
 }
}
"""

OLD_SYNC_1="let priorText=String(values[field]||'').replace(/\\r\\n?/g,'\\n');"
NEW_SYNC_1="let priorText=bpfGeneralFullText().replace(/\\r\\n?/g,'\\n');"
OLD_SYNC_2="const next=PCCFinal.synchronize(priorText,previous,current);values[field]=next.text;values.BPF_NCGenerated=JSON.stringify(next.generated);"
NEW_SYNC_2="const next=PCCFinal.synchronize(priorText,previous,current);bpfGeneralFlow(next.text);values.BPF_NCGenerated=JSON.stringify(next.generated);"
OLD_RUNTIME="bpfInitFields(D);\nBPF_OBSERVATION_FIELDS['continuacao']='obs_gerais_continuacao';"
NEW_RUNTIME="""bpfInitFields(D);
D.fields.BPF_ObsGeneralFlow={name:'BPF_ObsGeneralFlow',type:'/Tx',flags:0,label:'Controle do fluxo de observações entre as páginas 14 e 15',options:[],calc:''};
BPF_OBSERVATION_FIELDS['continuacao']='obs_gerais_continuacao';"""
OLD_RENDER="function sync(){for(let i=0;i<4;i++)values[conductions[i]]=values[sourceFields[i]];syncLinked();"
NEW_RENDER="function sync(){bpfGeneralFlow(bpfGeneralFullText());for(let i=0;i<4;i++)values[conductions[i]]=values[sourceFields[i]];syncLinked();"
OLD_FIT="function fit(el){if(!el.classList.contains('text')||!el.clientHeight)return;"
NEW_FIT="""function fit(el){if(!el.classList.contains('text')||!el.clientHeight)return;
 if(el.dataset.field==='OBS 1'||el.dataset.field==='obs_gerais_continuacao'){
  let font=9;try{font=Number(JSON.parse(values.BPF_ObsGeneralFlow||'{}').font)||9}catch(e){}
  el.style.fontSize=font+'px';el.style.lineHeight='1.25';
  const mirror=el.parentElement.querySelector('.printable[data-field="'+CSS.escape(el.dataset.field)+'"]');
  if(mirror){mirror.style.fontSize=(font/el.parentElement.clientWidth*100)+'cqw';mirror.style.lineHeight='1.25';mirror.style.whiteSpace='pre-wrap'}
  el.style.overflowY=el.scrollHeight>el.clientHeight+1?'auto':'hidden';return;
 }"""

for filename in ("individual.html","equipe.html"):
    path=Path(filename)
    html=path.read_text(encoding="utf-8")
    assert html.count("function bpfSyncNCLists(){")==1
    assert html.count("function sync(){")==1
    assert html.count("function fit(el){")==1
    if "function bpfGeneralFlow(full){" not in html:
        html=html.replace("function bpfSyncNCLists(){",FLOW_JS+"\nfunction bpfSyncNCLists(){",1)
    for old,new in [(OLD_SYNC_1,NEW_SYNC_1),(OLD_SYNC_2,NEW_SYNC_2),(OLD_RUNTIME,NEW_RUNTIME),(OLD_RENDER,NEW_RENDER),(OLD_FIT,NEW_FIT)]:
        if html.count(old)==1:
            html=html.replace(old,new,1)
        elif html.count(new)!=1:
            raise RuntimeError(f"{filename}: marcador inesperado: {old[:75]}")
    for token in (NEW_SYNC_1,NEW_SYNC_2,NEW_RUNTIME,NEW_RENDER,NEW_FIT,"function bpfGeneralFlow(full){"):
        assert html.count(token)==1, f"{filename}: alteração não localizada unicamente: {token[:40]}"
    assert html.count('obs_gerais_continuacao')>5
    path.write_text(html,encoding="utf-8")
    # Verificação sintática do trecho que implementa o fluxo e do roteiro principal.
    for marker in ["function bpfGeneralFullText(){","const D=GUIDE_DATA, values={}"]:
        p=html.index(marker)
        opening=html.rfind("<script",0,p)
        start=html.index(">",opening)+1
        end=html.index("</script>",p)
        js=html[start:end]
        result=subprocess.run(["node","--check"],input=js,text=True,capture_output=True)
        assert result.returncode==0, f"{filename} erro JS: {result.stderr[:1200]}"
    print("VALIDADO",filename,": distribuição por conteúdo e espaço real das páginas 14/15, edição JSON e PDF em dois campos.")

p=Path("index.html")
html=p.read_text(encoding="utf-8")
html,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"]+"',
    lambda m:'href="'+m.group(1)+'20261105-observacoes-14-15"',html)
assert n==2,f"Index contém {n} links, esperados 2"
p.write_text(html,encoding="utf-8")
p=Path("sw-guia18.js")
js=p.read_text(encoding="utf-8")
js,n=re.subn(r"const CACHE='guia18-menu-[^']+';","const CACHE='guia18-menu-v13-bpf20261105-observacoes-14-15';",js)
assert n==1
p.write_text(js,encoding="utf-8")
print("Links individual/equipe e cache atualizados.")
