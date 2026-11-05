#!/usr/bin/env python3
"""4.11.2, 4.3.3 e 4.10.3: uma resposta Sim/Não por F agrupado, seleções múltiplas e OBS/NC única."""
from pathlib import Path
import json,re,subprocess,hashlib

UNIFIED_JS=r"""
function bpfUnifiedRow(row){return ['4.3.3','4.10.3','4.11.2'].includes(row.code);}
function bpfUnifiedKey(page,row,panel,kind){
 return 'BPF_FGroup'+kind+'_'+page.page+'_'+row.code.replace(/[^0-9a-z]/gi,'_')+'_G'+(panel.id+1);
}
function bpfUnifiedOtherKey(page,row,panel){return bpfUnifiedKey(page,row,panel,'Other');}
function bpfUnifiedSelection(page,row,panel){
 const raw=values[bpfUnifiedKey(page,row,panel,'Selected')];
 if(typeof raw==='string'&&raw){
  try{
   const parsed=JSON.parse(raw);
   if(Array.isArray(parsed))return parsed.filter(x=>panel.entries.some(e=>e.name===x));
  }catch(_){}
 }
 return panel.entries.filter(e=>['1','0'].includes(values[e.name])).map(e=>e.name);
}
function bpfUnifiedAnswer(page,row,panel){
 const raw=values[bpfUnifiedKey(page,row,panel,'Choice')];
 if(raw==='1'||raw==='0')return raw;
 const answers=[...new Set(panel.entries.filter(e=>['1','0'].includes(values[e.name])).map(e=>values[e.name]))];
 return answers.length===1?answers[0]:'';
}
function bpfUnifiedIsOther(row,panel,e){return row.code==='4.11.2'&&panel.id===1&&e.index===5;}
function bpfUnifiedOption(row,e){
 if(row.code==='4.11.2')return ['RT','Responsável legal','Proprietário','Químico','Biólogo','Outro'][e.index];
 if(row.code==='4.3.3')return [
   'Extravasor protegido por tela milimetrada',
   'Dispositivo inferior para esvaziamento e higienização',
   'Verificação e troca dos elementos filtrantes',
   'Filtro de ar microbiológico',
   'Válvula de retenção ou sifão',
   'Torneira específica para coleta'
 ][e.index];
 if(row.code==='4.10.3')return [
   'Coliformes totais','Escherichia coli','Enterococos',
   'Pseudomonas aeruginosa','Clostrídios sulfito redutores',
   'Clostridium perfringens','Bactérias heterotróficas',
   'Coliformes totais','Escherichia coli','Bactérias heterotróficas',
   'Coliformes totais','Escherichia coli','Pseudomonas aeruginosa','Bactérias heterotróficas',
   'Análise físico-química anual — RDC 717/2022',
   'Cinco unidades do mesmo lote envasado',
   'Demais análises e controles do requisito'
 ][e.index];
 return e.phrase.text;
}
function bpfInitUnifiedFields(data){
 for(const page of BPF_PHRASES)for(const row of page.rows){
  if(!bpfUnifiedRow(row))continue;
  for(const panel of bpfPanels(page,row)){
   for(const [kind,label] of [['Choice','resposta única'],['Selected','opções selecionadas']]){
    const key=bpfUnifiedKey(page,row,panel,kind);
    data.fields[key]={name:key,type:'/Tx',flags:0,label:row.code+' '+panel.label+' '+label,options:[],calc:'',phrasePage:page.page};
   }
   if(row.code==='4.11.2'&&panel.id===1){
    const key=bpfUnifiedOtherKey(page,row,panel);
    data.fields[key]={name:key,type:'/Tx',flags:0,label:'4.11.2 outro conselho profissional',options:[],calc:'',phrasePage:page.page};
   }
  }
 }
}
function bpfUnifiedApply(page,row,panel){
 const answer=bpfUnifiedAnswer(page,row,panel);
 const selected=new Set(bpfUnifiedSelection(page,row,panel));
 if(!['1','0'].includes(answer))return;
 const note=String(values[bpfGroupNoteName(page,row,panel,answer)]||'').trim();
 const other=String(values[bpfUnifiedOtherKey(page,row,panel)]||'').trim();
 for(const scope of row.scopes){
  const scopeEntries=panel.entries.filter(e=>e.scope.name===scope.name);
  const anySelected=scopeEntries.some(e=>selected.has(e.name));
  for(const e of scopeEntries){
   const checked=selected.has(e.name);
   values[e.name]=checked?answer:(anySelected?'2':'');
   const noteKey=bpfNoteName(e.scope,e.index);
   values[noteKey]=checked?(note+(bpfUnifiedIsOther(row,panel,e)&&other?(note?'\n':'')+'Outro: '+other:'')):'';
  }
 }
}
function bpfSyncUnifiedObservation(row,page){
 const name=BPF_OBSERVATION_FIELDS[page.page+'_'+row.code];if(!name)return;
 const entries=[];
 for(const panel of bpfPanels(page,row)){
  const answer=bpfUnifiedAnswer(page,row,panel),selected=new Set(bpfUnifiedSelection(page,row,panel));
  if(!['1','0'].includes(answer)||!selected.size)continue;
  const note=String(values[bpfGroupNoteName(page,row,panel,answer)]||'').replace(/\s+/g,' ').trim();
  const other=String(values[bpfUnifiedOtherKey(page,row,panel)]||'').replace(/\s+/g,' ').trim();
  if(answer==='1'&&!note&&!other)continue;
  const checks=panel.entries.filter(e=>selected.has(e.name)).map(e=>
   (row.scopes.length>1?bpfScopeLabel(page,e.scope)+': ':'')+bpfUnifiedOption(row,e));
  entries.push(panel.label+' — '+(answer==='1'?'Sim':'Não')+' ('+checks.join(', ')+')'+(note?'; '+(answer==='1'?'OBS: ':'NC: ')+note:'')+(other?'; Outro: '+other:''));
 }
 const key=bpfSummaryName(page,row),summary=entries.length?row.code+' '+entries.join('; ')+'.':'';
 values[name]=bpfMergeObservation(values[name]||'',row.code,values[key]||'',summary);
 values[key]=summary;
}
function bpfOpenUnifiedPhrases(row,page){
 if(!bpfDismissEditor())return;
 const panels=bpfPanels(page,row);
 bpfSeedGroupNotes(page,row,panels);
 const dlg=document.createElement('section');dlg.id='bpf-editor';dlg.className='bpf-editor';
 dlg.setAttribute('aria-label','Frases agrupadas do item '+row.code);
 const title=document.createElement('h2');title.textContent='Item '+row.code+' — Frases';dlg.append(title);
 const cssId='bpf-unified-group-css';
 if(!document.getElementById(cssId)){
  const style=document.createElement('style');style.id=cssId;
  style.textContent='#bpf-editor .bpf-unified-group{border:2px solid #7897ad;border-radius:10px;padding:14px;margin:18px 0 22px}#bpf-editor .bpf-unified-group>legend{font-weight:700;padding:0 8px;font-size:1.1rem}#bpf-editor .bpf-unified-top{display:grid;grid-template-columns:minmax(105px,145px) minmax(0,1fr);gap:12px;margin:10px 0}#bpf-editor .bpf-unified-status{display:flex;flex-direction:column;gap:13px;padding:14px 8px;border-right:1px solid #c8d4dc}#bpf-editor .bpf-unified-status label{display:flex;align-items:center;gap:9px;cursor:pointer;font-size:1rem}#bpf-editor .bpf-unified-status input{width:20px;height:20px;margin:0}#bpf-editor .bpf-unified-options{display:flex;flex-direction:column;gap:6px;padding:8px 0}#bpf-editor .bpf-unified-option{display:flex;align-items:flex-start;gap:8px;line-height:1.35;cursor:pointer}#bpf-editor .bpf-unified-option input[type=checkbox]{width:19px;height:19px;flex-shrink:0;margin:2px 0 0}#bpf-editor .bpf-unified-option small{color:#5b6770}#bpf-editor .bpf-unified-other{flex:1;min-width:110px;max-width:250px;padding:5px;font:inherit}#bpf-editor .bpf-unified-observation{display:block;font-weight:600;margin-top:10px}#bpf-editor .bpf-unified-observation textarea{display:block;margin-top:7px;width:100%;min-height:90px;box-sizing:border-box;padding:8px;resize:vertical;font-weight:400}#bpf-editor .bpf-unified-hint{font-size:.9rem;color:#4b606e;margin:8px 0}#bpf-editor .bpf-unified-clear{font-size:.82rem;padding:6px 10px;margin-top:10px}#bpf-editor .bpf-unified-legacy{color:#a14218;font-weight:600}#bpf-editor .bpf-unified-option-scope{font-weight:600;margin-top:8px}#bpf-editor .bpf-unified-guidance{margin-top:10px}#bpf-editor .bpf-unified-guidance p{margin:5px 0;line-height:1.4}@media(max-width:560px){#bpf-editor .bpf-unified-top{grid-template-columns:1fr;gap:6px}#bpf-editor .bpf-unified-status{flex-direction:row;border-right:0;border-bottom:1px solid #c8d4dc;padding:9px 0}}';
  document.head.append(style);
 }
 const content=document.createElement('div');dlg.append(content);
 for(const panel of panels){
  const card=document.createElement('fieldset');card.className='bpf-unified-group';
  const legend=document.createElement('legend');legend.textContent=panel.label;card.append(legend);
  const answers=[...new Set(panel.entries.map(e=>e.phrase.appcc))];
  const category=document.createElement('p');category.className='bpf-unified-hint';category.textContent='Classificação das verificações: '+answers.join(' / ');card.append(category);
  const top=document.createElement('div');top.className='bpf-unified-top';card.append(top);
  const radios=document.createElement('div');radios.className='bpf-unified-status';top.append(radios);
  const checkArea=document.createElement('div');checkArea.className='bpf-unified-options';top.append(checkArea);
  const noteLabel=document.createElement('label');noteLabel.className='bpf-unified-observation';
  const area=document.createElement('textarea');area.rows=4;
  noteLabel.append(area);card.append(noteLabel);
  const selectedKey=bpfUnifiedKey(page,row,panel,'Selected');
  const answerKey=bpfUnifiedKey(page,row,panel,'Choice');
  const oldSelected=bpfUnifiedSelection(page,row,panel);
  let chosen=new Set(oldSelected);
  let answer=bpfUnifiedAnswer(page,row,panel);
  if(!Object.hasOwn(values,selectedKey)||!values[selectedKey])values[selectedKey]=JSON.stringify([...chosen]);
  if(answer&&!values[answerKey])values[answerKey]=answer;
  const updateNote=()=>{
   if(answer==='0'){noteLabel.firstChild?.remove?.();noteLabel.textContent='NC — não conformidade do grupo';}
   else{noteLabel.textContent='OBS — observação única do grupo';}
   noteLabel.append(area);
   area.disabled=!answer;
   area.dataset.note=answer?bpfGroupNoteName(page,row,panel,answer):'';
   area.value=answer?String(values[area.dataset.note]||''):'';
  };
  for(const [key,label]of [['1','Sim'],['0','Não']]){
   const line=document.createElement('label'),radio=document.createElement('input');radio.type='radio';radio.name=answerKey;radio.value=key;radio.checked=answer===key;
   radio.onchange=()=>{
    if(!radio.checked)return;
    answer=key;values[answerKey]=answer;
    updateNote();
    bpfUnifiedApply(page,row,panel);
    changed();recalc();
   };
   line.append(radio,document.createTextNode(' '+label));radios.append(line);
  }
  let scopeLabel='';
  for(const e of panel.entries){
   if(row.scopes.length>1&&scopeLabel!==e.scope.name){
    scopeLabel=e.scope.name;
    const label=document.createElement('div');label.className='bpf-unified-option-scope';label.textContent=bpfScopeLabel(page,e.scope);checkArea.append(label);
   }
   const line=document.createElement('label');line.className='bpf-unified-option';
   const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.dataset.phrase=e.name;checkbox.checked=chosen.has(e.name);
   const caption=document.createElement('span');caption.textContent=bpfUnifiedOption(row,e);caption.title=e.phrase.text;
   checkbox.onchange=()=>{
    if(checkbox.checked)chosen.add(e.name);else chosen.delete(e.name);
    values[selectedKey]=JSON.stringify([...chosen]);
    bpfUnifiedApply(page,row,panel);
    changed();recalc();
   };
   line.append(checkbox,caption);
   if(bpfUnifiedIsOther(row,panel,e)){
    const other=document.createElement('input');other.type='text';other.className='bpf-unified-other';other.placeholder='Qual conselho?';other.setAttribute('aria-label','Identificação do outro conselho profissional');
    other.value=String(values[bpfUnifiedOtherKey(page,row,panel)]||'');other.disabled=!checkbox.checked;
    checkbox.onchange=()=>{
     if(checkbox.checked)chosen.add(e.name);else chosen.delete(e.name);
     other.disabled=!checkbox.checked;
     values[selectedKey]=JSON.stringify([...chosen]);
     bpfUnifiedApply(page,row,panel);changed();recalc();
    };
    other.oninput=()=>{values[bpfUnifiedOtherKey(page,row,panel)]=other.value;bpfUnifiedApply(page,row,panel);changed();};
    line.append(other);
   }
   checkArea.append(line);
  }
  area.oninput=()=>{if(!answer)return;values[bpfGroupNoteName(page,row,panel,answer)]=area.value;bpfUnifiedApply(page,row,panel);changed();};
  updateNote();
  const hint=document.createElement('p');hint.className='bpf-unified-hint';hint.textContent='Marque uma ou várias opções e atribua uma única resposta Sim ou Não ao grupo.';card.append(hint);
  const oldAnswers=[...new Set(panel.entries.filter(e=>['1','0'].includes(values[e.name])).map(e=>values[e.name]))];
  if(!answer&&oldAnswers.length>1){
   const legacy=document.createElement('p');legacy.className='bpf-unified-legacy';
   legacy.textContent='Este preenchimento antigo possui respostas diferentes dentro do mesmo grupo. Escolha Sim ou Não para consolidar; as respostas anteriores permanecem até a confirmação.';card.append(legacy);
  }
  const guidance=panel.entries.filter((e,i,a)=>e.phrase.guidance&&a.findIndex(x=>x.index===e.index)===i);
  if(guidance.length){
   const details=document.createElement('details');details.className='bpf-unified-guidance';
   const summary=document.createElement('summary');summary.textContent='Textos completos e orientações ao inspetor';details.append(summary);
   for(const e of guidance){
    const p=document.createElement('p');p.textContent='F'+(e.index+1)+' — '+e.phrase.text+' | Orientação: '+e.phrase.guidance;details.append(p);
   }card.append(details);
  }
  const clear=document.createElement('button');clear.type='button';clear.className='bpf-unified-clear';clear.textContent='Limpar avaliação deste F';
  clear.onclick=()=>{
   answer='';values[answerKey]='';chosen.clear();values[selectedKey]='[]';
   for(const e of panel.entries){values[e.name]='';values[bpfNoteName(e.scope,e.index)]='';}
   for(const inp of checkArea.querySelectorAll('input[type=checkbox]'))inp.checked=false;
   for(const inp of checkArea.querySelectorAll('input[type=text]'))inp.disabled=true;
   for(const inp of radios.querySelectorAll('input[type=radio]'))inp.checked=false;
   updateNote();changed();recalc();
  };
  card.append(clear);content.append(card);
 }
 dlg.bpfCommit=()=>{
  for(const panel of panels){
   const selected=bpfUnifiedSelection(page,row,panel);
   const answer=bpfUnifiedAnswer(page,row,panel);
   if(!selected.length&&!answer)continue;
   if(!selected.length||!['1','0'].includes(answer)){
    alert('Item '+row.code+' — '+panel.label+': marque as opções e escolha uma única resposta Sim ou Não.');return false;
   }
   if(row.code==='4.11.2'&&panel.id===1&&panel.entries.some(e=>e.index===5&&selected.includes(e.name))&&!String(values[bpfUnifiedOtherKey(page,row,panel)]||'').trim()){
    alert('Item 4.11.2 — F2: identifique o conselho profissional em Outro.');return false;
   }
   if(answer==='0'&&!String(values[bpfGroupNoteName(page,row,panel,'0')]||'').trim()){
    alert('Item '+row.code+' — '+panel.label+': descreva a não conformidade no campo NC.');return false;
   }
   bpfUnifiedApply(page,row,panel);
  }
  bpfSyncUnifiedObservation(row,page);bpfSyncPCCFinal();recalc();return true;
 };
 function finish(){if(!dlg.bpfCommit())return;if(dirty)document.querySelector('#status').textContent='Respostas mantidas no guia. Use Salvar arquivo para guardar o preenchimento.';dlg.remove();document.querySelector('.page.active .bpf-f[data-code="'+row.code+'"]')?.scrollIntoView({block:'center'});}
 function controls(){const bar=document.createElement('div');bar.className='bpf-editor-controls';for(const name of ['Salvar e fechar','Retornar']){const button=document.createElement('button');button.textContent=name;button.onclick=finish;bar.append(button);}return bar;}
 dlg.insertBefore(controls(),title);dlg.append(controls());host.after(dlg);dlg.scrollIntoView({block:'start',behavior:'instant'});
}
"""

for name in ("individual.html","equipe.html"):
 path=Path(name)
 s=path.read_text(encoding="utf-8")
 marker="const BPF_PHRASES="
 pos=s.index(marker)+len(marker)
 _,count=json.JSONDecoder().raw_decode(s[pos:])
 old_json_hash=hashlib.sha256(s[pos:pos+count].encode()).hexdigest()
 start="function bpfOpenPhrases(row,page){"
 assert s.count(start)==1
 s=s.replace(start,UNIFIED_JS+"\n"+start+"\n if(bpfUnifiedRow(row))return bpfOpenUnifiedPhrases(row,page);",1)
 init_marker="bpfInitGroupFields(data);}"
 assert s.count(init_marker)==1,(name,'initializer')
 s=s.replace(init_marker,"bpfInitGroupFields(data);bpfInitUnifiedFields(data);}",1)
 sync_marker="function bpfSyncObservation(row,page){"
 assert s.count(sync_marker)==1
 s=s.replace(sync_marker,sync_marker+"\n if(bpfUnifiedRow(row))return bpfSyncUnifiedObservation(row,page);",1)
 state_marker="state._summaries={};"
 assert s.count(state_marker)==1
 s=s.replace(state_marker,"for(const [name,value]of Object.entries(values))if(/^BPF_FGroup(?:Note|Choice|Selected|Other)_/.test(name))state[name]=value;"+state_marker,1)

 # Turn specialised panel rows into one group in the compact PDF annex.
 a=s.index("function bpfAnnexRows(){")
 b=s.index("async function bpfAppendCompactAnnex(pdf){",a)
 old=s[a:b]
 assert "row.phrases.forEach" in old and "return result;" in old
 new=r"""function bpfAnnexRows(){
 const result=[];
 for(const page of BPF_PHRASES)for(const row of page.rows){
  if(bpfUnifiedRow(row)){
   for(const panel of bpfPanels(page,row)){
    const answer=bpfUnifiedAnswer(page,row,panel),selected=new Set(bpfUnifiedSelection(page,row,panel));
    if(!['1','0'].includes(answer)||!selected.size)continue;
    const entries=panel.entries.filter(e=>selected.has(e.name));
    const note=String(values[bpfGroupNoteName(page,row,panel,answer)]||'').trim();
    const other=row.code==='4.11.2'&&panel.id===1?String(values[bpfUnifiedOtherKey(page,row,panel)]||'').trim():'';
    result.push({page,row,grouped:true,panel,entries,answer,note,other});
   }
   continue;
  }
  row.phrases.forEach((phrase,i)=>{
   const records=row.scopes.filter(scope=>values[bpfPhraseName(scope,i)]||String(values[bpfNoteName(scope,i)]||'').trim()).map(scope=>({scope,answer:({'1':'Sim','0':'Não','2':'NA'})[values[bpfPhraseName(scope,i)]]||'',note:String(values[bpfNoteName(scope,i)]||'').trim()}));
   if(records.length)result.push({page,row,phrase,index:i,records});
  });
 }
 return result;
}
"""
 s=s[:a]+new+s[b:]
 annex_loop="for(const {page:source,row,phrase,index,records} of rows){ensure(90);text('Página '+(source.page+1)+' do guia | Item '+row.code+' | F'+(index+1)+' | BPF/APPCC: '+phrase.appcc,9,true);text(phrase.text);"
 assert s.count(annex_loop)==1,(name,'annex loop')
 newloop=r"""for(const item of rows){
  if(item.grouped){
   const {page:source,row,panel,entries,answer,note,other}=item;
   ensure(90);
   text('Página '+(source.page+1)+' | Item '+row.code+' | '+panel.label+' | Resultado: '+(answer==='1'?'Sim':'Não'),9,true);
   table(entries.map(e=>[(row.scopes.length>1?bpfScopeLabel(source,e.scope):'Grupo')+' / F'+(e.index+1),answer==='1'?'Sim':'Não',bpfUnifiedOption(row,e)]));
   if(note)text((answer==='1'?'OBS: ':'NC: ')+note,8.5);
   if(other)text('Outro conselho: '+other,8);
   continue;
  }
  const {page:source,row,phrase,index,records}=item;
  ensure(90);text('Página '+(source.page+1)+' do guia | Item '+row.code+' | F'+(index+1)+' | BPF/APPCC: '+phrase.appcc,9,true);text(phrase.text);"""
 s=s.replace(annex_loop,newloop,1)
 assert s.count("function bpfOpenUnifiedPhrases(row,page){")==1
 assert s.count("bpfInitUnifiedFields(data);")==1
 assert s.count("function bpfAnnexRows(){")==1
 assert "Qualquer Não torna o item Não. Sim exige" not in s
 assert s.count("function bpfPdfGeneralSplit(full,font,form,pdf){")==1
 pos=s.index(marker)+len(marker)
 _,count=json.JSONDecoder().raw_decode(s[pos:])
 assert hashlib.sha256(s[pos:pos+count].encode()).hexdigest()==old_json_hash,(name,'APPCC phrase data unexpectedly modified')
 for token in ("function bpfInitFields(data){","function bpfOpenPhrases(row,page){","function bpfAnnexRows(){","const D=GUIDE_DATA, values={}"):
  pos=s.index(token);start=s.rfind("<script",0,pos);start=s.index(">",start)+1;end=s.index("</script>",pos)
  result=subprocess.run(["node","--check"],input=s[start:end],text=True,capture_output=True)
  assert result.returncode==0,(name,token,result.stderr[:1200])
 path.write_text(s,encoding="utf-8")
 print("VALIDADO",name,": 4.11.2 F1 responsabilidade/F2 habilitação, 4.3.3 e 4.10.3 com resposta única, caixa Outro, observação única e PDF com grupos.")

p=Path("index.html")
s=p.read_text(encoding="utf-8")
s,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"]+"',lambda m:'href="'+m.group(1)+'20261105-f-resposta-unica-v2"',s)
assert n==2,n
p.write_text(s,encoding="utf-8")
p=Path("sw-guia18.js")
s=p.read_text(encoding="utf-8")
s,n=re.subn(r"const CACHE='guia18-menu-[^']+';","const CACHE='guia18-menu-v18-bpf20261105-f-resposta-unica';",s)
assert n==1,n
p.write_text(s,encoding="utf-8")
print("Links Individual/Equipe e cache revisados.")
