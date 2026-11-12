/* Fotos de F avaliados SIM ou NÃO nas páginas de fotos. SIM não exige OBS; NÃO exige NC. */
(function(){
'use strict';
if(window.__bpfFotosFSimNao20261109)return;
if(typeof bpfAddPhotoFromF!=='function'||typeof bpfPanels!=='function')return;
window.__bpfFotosFSimNao20261109=true;
const css=document.createElement('style');
css.textContent='#bpf-editor .bpf-nc-photo{margin:12px 0;padding:12px;border:1px solid #bfd5e1;border-left:4px solid #be303d;border-radius:8px;background:#f2f8fc;display:flex;flex-wrap:wrap;gap:8px;align-items:end}#bpf-editor .bpf-nc-photo label{flex:1 1 250px;color:#17445c;font-size:14px;font-weight:700}#bpf-editor .bpf-nc-photo select{display:block;margin-top:5px;width:100%;min-height:40px;background:white;border:1px solid #a9c5d5;border-radius:5px;font:inherit;padding:6px}#bpf-editor .bpf-nc-photo button{min-height:40px;background:#0a7199;color:white;border:0;border-radius:6px;font-weight:750;padding:8px 14px;cursor:pointer}#bpf-editor .bpf-nc-photo button:disabled{opacity:.5}#bpf-editor .bpf-nc-photo [role=status]{flex:1 1 100%;font-size:13px;color:#39566a}@media print{#bpf-editor .bpf-nc-photo{display:none!important}}';
document.head.append(css);
function eligible(page,row){
 const out=[],keys=new Set();
 for(const panel of bpfPanels(page,row)){
  const entries=panel.entries||[];
  const nc=String(values[bpfGroupNoteName(page,row,panel,'0')]||'').trim();
  const answered=entries.filter(e=>values[e.name]==='1'||values[e.name]==='0')
    .map(e=>({entry:e,answer:values[e.name]}));
  // F agrupados: a resposta única e as opções selecionadas são persistidas
  // separadamente das verificações individuais.
  if(!answered.length&&typeof bpfUnifiedAnswer==='function'&&typeof bpfUnifiedSelection==='function'){
   const answer=bpfUnifiedAnswer(page,row,panel);
   if(answer==='1'||answer==='0'){
    const selected=new Set(bpfUnifiedSelection(page,row,panel));
    for(const e of entries)if(selected.has(e.name))answered.push({entry:e,answer});
   }
  }
  // Critérios selecionáveis que utilizam a estrutura de checklist do guia.
  if(!answered.length&&panel.checklist&&typeof bpfChecklistSelected==='function'){
   for(const answer of ['1','0']){
    const selected=bpfChecklistSelected(page,row,panel,answer);
    if(Array.isArray(selected)&&selected.length&&entries.length)
      answered.push({entry:entries[0],answer});
   }
  }
  const f=row.code==='4.10.3'&&panel.id>=3?'F'+(panel.id+2):
   (String(panel.label||'').match(/^F\\d+/)?.[0]||'F'+(panel.id+1));
  for(const item of answered){
   const answer=item.answer;
   // A foto de SIM é permitida mesmo sem OBS; a de NÃO só após a NC.
   if(answer==='0'&&!nc)continue;
   const unit=typeof bpfScopeLabel==='function'?
     bpfScopeLabel(page,item.entry.scope):'Estabelecimento';
   const result=answer==='1'?'SIM':'NÃO';
   const id=f+'|'+unit+'|'+result;
   if(keys.has(id))continue;
   keys.add(id);
   out.push({id,f,unit,result,answer});
  }
 }
 return out;
}
window.bpfAddPhotoFromF=function(editor,row,page){
 const bar=document.createElement('div');bar.className='bpf-f-photo-tools bpf-nc-photo';
 const label=document.createElement('label');label.textContent='Foto do F (SIM ou NÃO):';
 const select=document.createElement('select');select.setAttribute('aria-label','Selecionar F, resultado e linha ou grupo');label.append(select);
 const button=document.createElement('button');button.type='button';button.textContent='Anexar fotos do F';
 const status=document.createElement('span');status.setAttribute('role','status');
 bar.append(label,button,status);editor.append(bar);
 let list=[];
 function refresh(){
  const previous=select.value;list=eligible(page,row);select.replaceChildren();
  for(const item of list){const option=document.createElement('option');option.value=item.id;option.textContent=item.f+' — '+item.unit+' — '+item.result;select.append(option);}
  if(list.some(item=>item.id===previous))select.value=previous;
  button.disabled=!list.length;
  status.textContent=list.length?'Selecione uma ou mais fotos. Todas serão identificadas pelo processo, F, linha/grupo e resultado selecionados. SIM não exige OBS; NÃO exige NC.':'Marque SIM ou NÃO no F. Para foto de NÃO, preencha também a NC.';
 }
 button.onclick=()=>{
  refresh();
  const picked=list.find(item=>item.id===select.value)||list[0];if(!picked)return;
  const processCode=row.code.split('.').slice(0,2).join('.');
  const options=D.fields?.BPF_PhotoProcess_Imagem1?.options||[];
  const process=options.find(option=>option.split(/\s/)[0]===processCode)||processCode;
  chooseImage('',{process,location:('Item '+row.code+' — '+picked.f+' — '+picked.unit+' — '+picked.result).slice(0,120),status});
 };
 editor.addEventListener('input',()=>requestAnimationFrame(refresh));
 editor.addEventListener('change',()=>requestAnimationFrame(refresh));
 refresh();
};
})();
