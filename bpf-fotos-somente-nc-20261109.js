/* Fotos dos F: só NC (NÃO + justificativa), nas páginas de fotos do guia. */
(function(){
'use strict';
if(window.__bpfFotosFSoNC20261109)return;
if(typeof bpfAddPhotoFromF!=='function'||typeof bpfPanels!=='function')return;
window.__bpfFotosFSoNC20261109=true;
const css=document.createElement('style');
css.textContent='#bpf-editor .bpf-nc-photo{margin:12px 0;padding:12px;border:1px solid #bfd5e1;border-left:4px solid #be303d;border-radius:8px;background:#f2f8fc;display:flex;flex-wrap:wrap;gap:8px;align-items:end}#bpf-editor .bpf-nc-photo label{flex:1 1 250px;color:#17445c;font-size:14px;font-weight:700}#bpf-editor .bpf-nc-photo select{display:block;margin-top:5px;width:100%;min-height:40px;background:white;border:1px solid #a9c5d5;border-radius:5px;font:inherit;padding:6px}#bpf-editor .bpf-nc-photo button{min-height:40px;background:#0a7199;color:white;border:0;border-radius:6px;font-weight:750;padding:8px 14px;cursor:pointer}#bpf-editor .bpf-nc-photo button:disabled{opacity:.5}#bpf-editor .bpf-nc-photo [role=status]{flex:1 1 100%;font-size:13px;color:#39566a}@media print{#bpf-editor .bpf-nc-photo{display:none!important}}';
document.head.append(css);
function eligible(page,row){
 const out=[],keys=new Set();
 for(const panel of bpfPanels(page,row)){
  const note=String(values[bpfGroupNoteName(page,row,panel,'0')]||'').trim();
  if(!note)continue;
  let failed=(panel.entries||[]).filter(e=>values[e.name]==='0');
  if(!failed.length&&typeof bpfUnifiedAnswer==='function'&&bpfUnifiedAnswer(page,row,panel)==='0'&&typeof bpfUnifiedSelection==='function'){
   const selected=new Set(bpfUnifiedSelection(page,row,panel));
   failed=(panel.entries||[]).filter(e=>selected.has(e.name));
  }
  if(!failed.length&&panel.checklist&&typeof bpfChecklistSelected==='function'&&bpfChecklistSelected(page,row,panel,'0').length)failed=(panel.entries||[]).slice(0,1);
  for(const entry of failed){
   const f='F'+((panel.storageId??panel.id)+1);
   const unit=typeof bpfScopeLabel==='function'?bpfScopeLabel(page,entry.scope):'Estabelecimento';
   const id=f+'|'+unit;
   if(keys.has(id))continue;
   keys.add(id);out.push({id,f,unit});
  }
 }
 return out;
}
window.bpfAddPhotoFromF=function(editor,row,page){
 const bar=document.createElement('div');bar.className='bpf-f-photo-tools bpf-nc-photo';
 const label=document.createElement('label');label.textContent='Foto de não conformidade (NÃO):';
 const select=document.createElement('select');select.setAttribute('aria-label','Selecionar F e unidade com NC');label.append(select);
 const button=document.createElement('button');button.type='button';button.textContent='Anexar foto da NC';
 const status=document.createElement('span');status.setAttribute('role','status');
 bar.append(label,button,status);editor.append(bar);
 let list=[];
 function refresh(){
  const previous=select.value;list=eligible(page,row);select.replaceChildren();
  for(const item of list){const option=document.createElement('option');option.value=item.id;option.textContent=item.f+' — '+item.unit;select.append(option);}
  if(list.some(item=>item.id===previous))select.value=previous;
  button.disabled=!list.length;
  status.textContent=list.length?'A foto será identificada por processo, item F e unidade e incluída nas páginas 16–17.':'Disponível somente após marcar NÃO e preencher a NC do F.';
 }
 button.onclick=()=>{
  refresh();
  const picked=list.find(item=>item.id===select.value)||list[0];if(!picked)return;
  if(typeof bpfFreePhotoSlot!=='function'||!bpfFreePhotoSlot()){status.textContent='Os 24 espaços fotográficos estão ocupados.';return;}
  const processCode=row.code.split('.').slice(0,2).join('.');
  const options=D.fields?.BPF_PhotoProcess_Imagem1?.options||[];
  const process=options.find(option=>option.split(/\s/)[0]===processCode)||processCode;
  chooseImage('',{process,location:('Item '+row.code+' — '+picked.f+' — '+picked.unit+' — NC').slice(0,120),status});
 };
 editor.addEventListener('input',()=>requestAnimationFrame(refresh));
 editor.addEventListener('change',()=>requestAnimationFrame(refresh));
 refresh();
};
})();
