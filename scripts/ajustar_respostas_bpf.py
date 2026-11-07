from pathlib import Path

def patch(source):
    def change(before, after):
        nonlocal source
        assert source.count(before) == 1, before[:100]
        source = source.replace(before, after)

    if 'function bpfAllowsDependentNA(' in source:
        return source
    change("['4.3.3','4.10.2','4.10.3','4.11.2'].includes(row.code)", "['4.10.2','4.10.3','4.11.2'].includes(row.code)")
    change("  if(!bpfUnifiedRow(row))continue;", "  if(!bpfUnifiedRow(row)&&row.code!=='4.3.3')continue;")
    change("function bpfApplyAnswers(v){", """function bpfAllowsDependentNA(row,entry,v){
 return entry.index!==1||!['4.2.9','4.3.6'].includes(row.code)||v[bpfPhraseName(entry.scope,0)]==='0';
}
function bpfNormalizeDependentNA(row,scope,v){
 const key=bpfPhraseName(scope,1);
 if(v[key]!=='2'||bpfAllowsDependentNA(row,{scope,index:1},v))return false;
 v[key]='';v[bpfNoteName(scope,1)]='';
 return true;
}
function bpfMigrateReservoirAnswers(page,row,v){
 const panel=bpfPanels(page,row)[0];
 const choiceKey=bpfUnifiedKey(page,row,panel,'Choice'),selectedKey=bpfUnifiedKey(page,row,panel,'Selected');
 const answer=v[choiceKey];
 if(answer!=='1'&&answer!=='0')return;
 let selected=[];
 try{const parsed=JSON.parse(v[selectedKey]);if(Array.isArray(parsed))selected=parsed;}catch(_){}
 if(!panel.entries.some(e=>['1','0'].includes(v[e.name]))){
  const matched=panel.entries.filter(e=>selected.includes(e.name));
  for(const entry of panel.entries){
   if(!matched.some(e=>e.scope.name===entry.scope.name))continue;
   v[entry.name]=selected.includes(entry.name)?answer:'2';
  }
 }
 v[choiceKey]='';v[selectedKey]='';
}
function bpfApplyAnswers(v){""")
    change("for(const p of BPF_PHRASES)for(const r of p.rows)for(const s of r.scopes){const a=bpfAggregateAnswers(v,s);if(a!==null)v[s.name]=a;}", """for(const p of BPF_PHRASES)for(const r of p.rows){
 if(r.code==='4.3.3'){
  const prefix='_'+p.page+'_4_3_3_G1';
  if(v['BPF_FGroupChoice'+prefix])bpfMigrateReservoirAnswers(p,r,v);
 }
 let corrected=false;
 for(const s of r.scopes){
  const cleared=bpfNormalizeDependentNA(r,s,v);
  const a=bpfAggregateAnswers(v,s);
  if(a!==null||cleared)v[s.name]=a??'Off';
  corrected=corrected||cleared;
 }
 if(corrected&&v===values)bpfSyncObservation(r,p);
}""")
    # Keep the two answer columns and the one original set of device IDs and notes.
    change("header.textContent=heading;box.append(header);", "header.textContent=row.code==='4.3.3'?'F1 — '+heading:heading;box.append(header);")
    change("    input.checked=values[entry.name]===answer;\n    const detail=panel.composite?", """    input.checked=values[entry.name]===answer;
    if(answer==='2')input.disabled=!bpfAllowsDependentNA(row,entry,values);
    const detail=row.code==='4.3.3'?bpfUnifiedOption(row,entry):panel.composite?""")
    change("""     for(const other of card.querySelectorAll('input[type=checkbox]'))if(other.dataset.answerName===entry.name)other.checked=values[entry.name]===other.dataset.answer;
     changed();recalc();""", """     if(row.code==='4.3.3'&&!entry.scope.phrases.some((_,i)=>['1','0'].includes(values[bpfPhraseName(entry.scope,i)]))){
      entry.scope.phrases.forEach((_,i)=>{values[bpfPhraseName(entry.scope,i)]='';});
      values[entry.scope.name]='Off';
     }
     changed();recalc();
     for(const other of content.querySelectorAll('input[type=checkbox]'))other.checked=values[other.dataset.answerName]===other.dataset.answer;
     for(const {control,entry:naEntry} of dependentNA)control.disabled=!bpfAllowsDependentNA(row,naEntry,values);""")
    change(" const cssId='bpf-checkbox-groups-css';"," const dependentNA=[];\n const cssId='bpf-checkbox-groups-css';")
    change("    if(answer==='2')input.disabled=!bpfAllowsDependentNA(row,entry,values);", """    if(answer==='2'){
     input.disabled=!bpfAllowsDependentNA(row,entry,values);
     dependentNA.push({control:input,entry});
    }""")
    change("   for(const entry of panel.entries){\n    if(answer==='2'", """   if(answer==='2'&&panel.id===1&&['4.2.9','4.3.6'].includes(row.code)){
    const hint=document.createElement('p');hint.textContent='Disponível quando o F1 da mesma unidade estiver marcado como Não.';box.append(hint);
   }
   for(const entry of panel.entries){
    if(answer==='2'""")
    change("   else if(v==='2')values[bpfNoteName(e.scope,e.index)]='';",
           "   else if(v==='2'||row.code==='4.3.3')values[bpfNoteName(e.scope,e.index)]='';")
    change("const units=selected.map(e=>panel.composite?", "const units=selected.map(e=>row.code==='4.3.3'?bpfScopeLabel(page,e.scope)+': '+bpfUnifiedOption(row,e):panel.composite?")
    change("""   const scoped=new Set(row.scopes.filter(s=>s.phrases.some((_,i)=>['1','0'].includes(values[bpfPhraseName(s,i)]))).map(s=>s.name));
   for(const scope of row.scopes)if(scoped.has(scope.name))scope.phrases.forEach((_,i)=>{
    const n=bpfPhraseName(scope,i);if(!values[n])values[n]='2';
   });""", """   for(const scope of row.scopes){
    const assessed=scope.phrases.some((_,i)=>['1','0'].includes(values[bpfPhraseName(scope,i)]));
    scope.phrases.forEach((_,i)=>{
     const n=bpfPhraseName(scope,i);
     if(!['1','0'].includes(values[n]))values[n]=assessed?'2':'';
    });
   }""")
    # Preserve the compact annex and print a separate group for each answer.
    change(""" for(const page of BPF_PHRASES)for(const row of page.rows){
  if(bpfUnifiedRow(row)){
   for(const panel of bpfPanels(page,row)){""", """ for(const page of BPF_PHRASES)for(const row of page.rows){
  if(row.code==='4.3.3'){
   const panel=bpfPanels(page,row)[0];
   for(const answer of ['1','0']){
    const entries=panel.entries.filter(e=>values[e.name]===answer);
    if(!entries.length)continue;
    const note=String(values[bpfGroupNoteName(page,row,panel,answer)]||'').trim();
    result.push({page,row,grouped:true,panel,entries,answer,note});
   }
   continue;
  }
  if(bpfUnifiedRow(row)){
   for(const panel of bpfPanels(page,row)){""")
    return source

for name in ('equipe.html','individual.html'):
    path=Path(name)
    path.write_text(patch(path.read_text(encoding='utf-8')),encoding='utf-8')
for name in ('index.html','revisao-frases.html'):
    path=Path(name)
    path.write_text(path.read_text().replace('20261107-R-ampliado-v23','20261107-respostas-v24'))
p=Path('sw-guia18.js')
p.write_text(p.read_text().replace('guia18-R-ampliado-20261107-v23','guia18-respostas-20261107-v24'))
