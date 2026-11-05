#!/usr/bin/env python3
"""Substituir interface F por quadros Sim/Não e caixas de seleção dos requisitos."""
from pathlib import Path
import re,subprocess

HELPERS=r"""
function bpfScopeLabel(page,scope){
 if(page.page<2)return 'Captação '+scope.col;
 if(page.page<6)return 'Reservatório '+scope.col;
 if(page.page===6)return ({1:'Garrafões retornáveis',2:'Embalagens descartáveis',3:'Rótulos',4:'Saneantes'})[scope.col];
 if(page.page<=10)return 'Linha '+scope.col;
 return 'Estabelecimento';
}
function bpfPanels(page,row){
 const max=Math.max(row.phrases.length,...row.scopes.map(s=>s.phrases.length));
 const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
 let parts;
 if(row.code==='4.3.3')parts=[{label:'F1 — Dispositivos do reservatório',indices:range(0,5),composite:true}];
 else if(row.code==='4.11.2')parts=[
   {label:'F1 — Responsabilidade pela industrialização',indices:range(0,2),composite:true},
   {label:'F2 — Habilitação nos conselhos profissionais',indices:range(3,5),composite:true}
 ];
 else if(row.code==='4.10.3')parts=[
   {label:'F1 — Produto acabado',indices:range(0,6),composite:true},
   {label:'F2 — Captação',indices:range(7,9),composite:true},
   {label:'F3 — Reservatório',indices:range(10,13),composite:true},
   {label:'F4 — Análise físico-química anual (RDC 717/2022)',indices:[14],composite:true},
   {label:'F5 — Cinco unidades do lote envasado',indices:[15],composite:true},
   {label:'F6 — Demais análises previstas no requisito',indices:[16],composite:true}
 ];
 else parts=range(0,max-1).map(i=>({label:'F'+(i+1),indices:[i],composite:false}));
 return parts.map((part,id)=>({
   ...part,id,
   entries:row.scopes.flatMap(scope=>part.indices.filter(i=>i<scope.phrases.length).map(i=>({scope,index:i,phrase:scope.phrases[i],name:bpfPhraseName(scope,i)})))
 }));
}
function bpfGroupNoteName(page,row,panel,answer){
 return 'BPF_FGroupNote_'+page.page+'_'+row.code.replace(/[^0-9a-z]/gi,'_')+'_G'+(panel.id+1)+'_'+(answer==='1'?'OBS':'NC');
}
function bpfInitGroupFields(data){
 for(const page of BPF_PHRASES)for(const row of page.rows)for(const panel of bpfPanels(page,row))for(const [answer,label] of [['1','OBS'],['0','NC']]){
   const key=bpfGroupNoteName(page,row,panel,answer);
   data.fields[key]={name:key,type:'/Tx',flags:4096,label:row.code+' '+panel.label+' '+label,options:[],calc:'',phrasePage:page.page};
 }
}
function bpfSeedGroupNotes(page,row,panels){
 for(const panel of panels)for(const answer of ['1','0']){
  const key=bpfGroupNoteName(page,row,panel,answer);
  if(String(values[key]||'').trim())continue;
  const oldNotes=panel.entries.filter(e=>values[e.name]===answer).map(e=>String(values[bpfNoteName(e.scope,e.index)]||'').trim()).filter(Boolean);
  const unique=[...new Set(oldNotes)];
  if(unique.length)values[key]=unique.length===1?unique[0]:unique.join('\n');
 }
}
"""

SYNC=r"""function bpfSyncObservation(row,page){
 const name=BPF_OBSERVATION_FIELDS[page.page+'_'+row.code];if(!name)return;
 const entries=[];
 for(const panel of bpfPanels(page,row)){
  for(const [answer,label] of [['1','Sim'],['0','Não'],['2','Não se aplica']]){
   if(answer==='2'&&panel.composite)continue;
   const selected=panel.entries.filter(e=>values[e.name]===answer);
   if(!selected.length)continue;
   const note=answer==='2'?'':String(values[bpfGroupNoteName(page,row,panel,answer)]||'').replace(/\s+/g,' ').trim();
   if(answer==='1'&&!note)continue;
   const units=selected.map(e=>panel.composite?'F'+(e.index+1)+' '+bpfScopeLabel(page,e.scope):bpfScopeLabel(page,e.scope));
   entries.push(panel.label+' — '+label+' ('+units.join(', ')+')'+(note?': '+(answer==='0'?'NC: ':'OBS: ')+note:''));
  }
 }
 const key=bpfSummaryName(page,row),summary=entries.length?row.code+' '+entries.join('; ')+'.':'';
 values[name]=bpfMergeObservation(values[name]||'',row.code,values[key]||'',summary);
 values[key]=summary;
}"""

EDITOR=r"""function bpfOpenPhrases(row,page){
 if(!bpfDismissEditor())return;
 const panels=bpfPanels(page,row);
 bpfSeedGroupNotes(page,row,panels);
 const dlg=document.createElement('section');dlg.id='bpf-editor';dlg.className='bpf-editor';
 dlg.setAttribute('aria-label','Frases do item '+row.code);
 const title=document.createElement('h2');title.textContent='Item '+row.code+' — Frases';dlg.append(title);
 const content=document.createElement('div');content.className='bpf-groups';dlg.append(content);
 const cssId='bpf-checkbox-groups-css';
 if(!document.getElementById(cssId)){
  const style=document.createElement('style');style.id=cssId;
  style.textContent='#bpf-editor .bpf-group{margin:18px 0 24px;padding:14px;border:2px solid #819eaf;border-radius:9px}#bpf-editor .bpf-group>legend{font-weight:bold;padding:0 8px}#bpf-editor .bpf-group-description{margin:8px 0 12px;line-height:1.42}#bpf-editor .bpf-answer-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}#bpf-editor .bpf-answer-box{padding:12px;border:1px solid #94a9b6;border-radius:8px;min-width:0}#bpf-editor .bpf-answer-box>legend{font-weight:bold;padding:0 6px}#bpf-editor .bpf-answer-item{display:flex;align-items:flex-start;gap:9px;padding:5px 0;line-height:1.35;cursor:pointer}#bpf-editor .bpf-answer-item input{width:19px;height:19px;flex-shrink:0;margin:1px 0 0}#bpf-editor .bpf-answer-box textarea{width:100%;min-height:85px;box-sizing:border-box;margin-top:7px;padding:8px;resize:vertical}#bpf-editor .bpf-answer-box .bpf-note-title{display:block;font-weight:bold;margin-top:12px}#bpf-editor .bpf-inspector-details{margin:10px 0;background:#f2f7fa;padding:8px;border-radius:6px}#bpf-editor .bpf-inspector-details p{font-size:14px;margin:8px 0}';
  document.head.append(style);
 }
 for(const panel of panels){
  const card=document.createElement('fieldset');card.className='bpf-group';
  const legend=document.createElement('legend');legend.textContent=panel.label+(panel.composite?' — caixas selecionáveis':' — BPF/APPCC: '+(panel.entries[0]?.phrase.appcc||''));card.append(legend);
  if(!panel.composite){
   const e=panel.entries[0];if(e){const p=document.createElement('p');p.className='bpf-group-description';p.textContent=e.phrase.text;card.append(p);}
  }
  const guidanceEntries=[...new Map(panel.entries.filter(e=>e.phrase.guidance).map(e=>[e.index,e])).values()];
  if(guidanceEntries.length){
   if(panel.composite){
    const details=document.createElement('details');details.className='bpf-inspector-details';
    const summary=document.createElement('summary');summary.textContent='Orientações ao inspetor';details.append(summary);
    for(const e of guidanceEntries){const p=document.createElement('p');p.textContent='F'+(e.index+1)+': '+e.phrase.guidance;details.append(p);}
    card.append(details);
   }else{
    const guide=document.createElement('p');guide.className='bpf-guidance';guide.textContent='Orientação ao inspetor: '+guidanceEntries[0].phrase.guidance;card.append(guide);
   }
  }
  const grid=document.createElement('div');grid.className='bpf-answer-grid';card.append(grid);
  const allowed=[['1','Sim','OBS — observação única das opções marcadas Sim'],['0','Não','NC — não conformidade das opções marcadas Não']];
  if(!panel.composite&&panel.entries.some(e=>e.phrase.allowNA||values[e.name]==='2'))allowed.push(['2','Não se aplica',null]);
  for(const [answer,heading,noteHeading] of allowed){
   const box=document.createElement('fieldset');box.className='bpf-answer-box';
   const header=document.createElement('legend');header.textContent=heading;box.append(header);
   for(const entry of panel.entries){
    if(answer==='2'&&!entry.phrase.allowNA&&values[entry.name]!=='2')continue;
    const label=document.createElement('label');label.className='bpf-answer-item';
    const input=document.createElement('input');input.type='checkbox';input.dataset.answerName=entry.name;input.dataset.answer=answer;
    input.checked=values[entry.name]===answer;
    const detail=panel.composite?'F'+(entry.index+1)+' — '+entry.phrase.text:'';
    const scopeText=panel.composite&&row.scopes.length===1?'':bpfScopeLabel(page,entry.scope)+(panel.composite?' — ':'');
    const caption=document.createElement('span');caption.textContent=scopeText+detail;
    input.onchange=()=>{
     values[entry.name]=input.checked?answer:values[entry.name]===answer?'':values[entry.name];
     for(const other of card.querySelectorAll('input[type=checkbox]'))if(other.dataset.answerName===entry.name)other.checked=values[entry.name]===other.dataset.answer;
     changed();recalc();
    };
    label.append(input,caption);box.append(label);
   }
   if(noteHeading){
    const label=document.createElement('label');label.className='bpf-note-title';label.textContent=noteHeading;
    const area=document.createElement('textarea');area.rows=4;area.dataset.note=bpfGroupNoteName(page,row,panel,answer);area.value=values[area.dataset.note]||'';
    area.oninput=()=>{values[area.dataset.note]=area.value;changed();};
    label.append(area);box.append(label);
   }
   grid.append(box);
  }
  content.append(card);
 }
 dlg.bpfCommit=()=>{
  const special=['4.3.3','4.10.3','4.11.2'].includes(row.code);
  if(special){
   for(const panel of panels){
    const selected=panel.entries.filter(e=>['1','0'].includes(values[e.name]));
    if(!selected.length){
     alert('Item '+row.code+' — '+panel.label+': selecione uma ou mais caixas em Sim ou Não antes de salvar.');
     return false;
    }
   }
   // Requisitos não selecionados são não avaliados; não viram NC.
   const scoped=new Set(row.scopes.filter(s=>s.phrases.some((_,i)=>['1','0'].includes(values[bpfPhraseName(s,i)]))).map(s=>s.name));
   for(const scope of row.scopes)if(scoped.has(scope.name))scope.phrases.forEach((_,i)=>{
    const n=bpfPhraseName(scope,i);if(!values[n])values[n]='2';
   });
  }else{
   for(const scope of row.scopes){
    const started=scope.phrases.some((_,i)=>values[bpfPhraseName(scope,i)]||String(values[bpfNoteName(scope,i)]||'').trim());
    if(!started)continue;
    const missing=scope.phrases.map((_,i)=>values[bpfPhraseName(scope,i)]?null:'F'+(i+1)).filter(Boolean);
    if(missing.length){alert('Item '+row.code+' — '+bpfScopeLabel(page,scope)+': avalie '+missing.join(', ')+' antes de salvar.');return false;}
   }
  }
  for(const panel of panels){
   const noSelected=panel.entries.some(e=>values[e.name]==='0');
   const noNote=String(values[bpfGroupNoteName(page,row,panel,'0')]||'').trim();
   if(noSelected&&!noNote){
    const area=content.querySelector('textarea[data-note="'+bpfGroupNoteName(page,row,panel,'0')+'"]');
    area?.focus();
    alert('Item '+row.code+' — '+panel.label+': descreva a NC das opções marcadas Não.');
    return false;
   }
  }
  // Mantém os campos individuais internos para cálculos, JSON antigo e Anexo F.
  for(const panel of panels)for(const e of panel.entries){
   const v=values[e.name];
   if(v==='1'||v==='0')values[bpfNoteName(e.scope,e.index)]=String(values[bpfGroupNoteName(page,row,panel,v)]||'');
   else if(v==='2')values[bpfNoteName(e.scope,e.index)]='';
  }
  bpfSyncObservation(row,page);bpfSyncPCCFinal();recalc();return true;
 };
 function finish(){if(!dlg.bpfCommit())return;if(dirty)document.querySelector('#status').textContent='Respostas mantidas no guia. Use Salvar arquivo para guardar o preenchimento.';dlg.remove();document.querySelector('.page.active .bpf-f[data-code="'+row.code+'"]')?.scrollIntoView({block:'center'});}
 function controls(){const bar=document.createElement('div');bar.className='bpf-editor-controls';for(const label of ['Salvar e fechar','Retornar']){const button=document.createElement('button');button.textContent=label;button.onclick=finish;bar.append(button);}return bar;}
 dlg.insertBefore(controls(),title);dlg.append(controls());host.after(dlg);dlg.scrollIntoView({block:'start',behavior:'instant'});
}"""

for fn in ("individual.html","equipe.html"):
 p=Path(fn);s=p.read_text(encoding="utf-8")
 def substitute(start,end,replacement):
  global s
  assert s.count(start)==1,(fn,start,"count",s.count(start))
  i=s.index(start);j=s.find(end,i+len(start))
  assert j>i,(fn,"missing end",end)
  s=s[:i]+replacement+s[j:]
 # Insert helper functions and replace existing editor UI.
 substitute("function bpfOpenPhrases(row,page){","\nfunction bpfMountDescriptions(){",HELPERS+"\n"+EDITOR)
 substitute("function bpfSyncObservation(row,page){","\nfunction bpfDismissEditor(){",SYNC)
 # Initialize group note fields in JSON and in the standard values store.
 init="function bpfInitFields(data){"
 j=s.index(init);k=s.index("\nfunction bpfMergeObservation(",j)
 part=s[j:k].rstrip()
 if "bpfInitGroupFields(data);" not in part:
  assert part.endswith("}"),(fn,"init block malformed")
  part=part[:-1]+"bpfInitGroupFields(data);}"
  s=s[:j]+part+s[k:]
 assert "Qualquer Não torna o item Não. Sim exige" not in s,fn
 assert s.count("function bpfPanels(page,row){")==1
 assert s.count("function bpfSyncObservation(row,page){")==1
 assert s.count("function bpfOpenPhrases(row,page){")==1
 assert s.count("bpfInitGroupFields(data);")==1
 assert s.count("function bpfAppendCompactAnnex(pdf){")==1
 assert s.count("function bpfPdfGeneralSplit(full,font,form,pdf){")==1
 for marker in ["function bpfPanels(page,row){","function bpfInitFields(data){","const D=GUIDE_DATA, values={}"]:
  pos=s.index(marker);a=s.rfind("<script",0,pos);a=s.index(">",a)+1;b=s.index("</script>",pos)
  x=subprocess.run(["node","--check"],input=s[a:b],text=True,capture_output=True)
  assert x.returncode==0,(fn,marker,x.stderr[:1600])
 p.write_text(s,encoding="utf-8")
 print("VALIDADO",fn,"Checkbox por frase/unidade; grupos específicos 4.3.3 4.10.3 4.11.2; OBS e NC dentro dos quadros; cálculos e PDF preservados.")

p=Path("index.html")
s=p.read_text(encoding="utf-8")
s,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"]+"',lambda m:'href="'+m.group(1)+'20261105-f-grupos-sim-nao"',s)
assert n==2,n
p.write_text(s,encoding="utf-8")
p=Path("sw-guia18.js")
s=p.read_text(encoding="utf-8")
s,n=re.subn(r"const CACHE='guia18-menu-[^']+';","const CACHE='guia18-menu-v17-bpf20261105-f-grupos-sim-nao';",s)
assert n==1,n
p.write_text(s,encoding="utf-8")
print("Versão e cache atualizados.")
