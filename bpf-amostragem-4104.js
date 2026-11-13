(function(){
'use strict';
if(window.__bpfSampling404)return;
window.__bpfSampling404=true;
const phrases={"F1":{"title":"Elaboração do plano de amostragem","text":"O estabelecimento possui plano de amostragem que especifica o número de amostras, os locais de coleta, os parâmetros analíticos e a frequência nas etapas avaliadas?","guide":"Confira os pontos, o número de amostras, os parâmetros e a frequência. Quando aplicável, verifique se o plano prevê análise mensal terceirizada e identifica produto ou lote, número de amostras, ponto de coleta e parâmetros.","obs":"O plano [versão/data] especifica as coletas e prevê a análise mensal terceirizada de [produto/lote].","nc":"O plano não identifica [ponto, frequência, parâmetro ou número de amostras] ou não prevê a análise mensal terceirizada quando aplicável."},"F2":{"title":"Execução do plano e limites de aceitação","text":"O estabelecimento executa o plano de amostragem conforme previsto e tem definidos os limites de aceitação aplicáveis aos parâmetros analisados?","guide":"Compare coletas e laudos com o plano. Confira os limites de aceitação no plano ou em documento vinculado. Quando aplicável, verifique a execução mensal terceirizada e o registro em planilha ou sistema de data, ponto, produto/lote, laboratório, laudo, parâmetro, resultado, unidade e comparação com o limite. Para bactérias heterotróficas, confira separadamente os limites internos de alerta e de ação por ponto monitorado.","obs":"Os laudos de [meses] foram vinculados aos lotes amostrados e os resultados foram comparados aos limites identificados.","nc":"Não foi apresentado laudo terceirizado de [mês], ou o registro não indica o limite de aceitação para [parâmetro]."}};
const checks=[["F1","mensal_plano","Análise mensal terceirizada prevista no plano, quando aplicável",true],["F2","execucao","Execução do plano conforme previsto",false],["F2","aceitacao","Limites de aceitação definidos",false],["F2","mensal_registro","Análise mensal terceirizada executada, registrada e comparada aos limites",true],["F2","heterotroficas","Limites internos de alerta e de ação para bactérias heterotróficas definidos",false]];
const key=id=>'BPF_Sampling_4104_'+id;
const data=()=>window.Guia?.values||(typeof values==='object'?values:null);
function refresh(){
 const editor=document.getElementById('bpf-editor');
 if(!editor||!/\b4\.10\.4\b/.test(editor.querySelector('h2')?.textContent||''))return;
 for(const card of editor.querySelectorAll('fieldset.bpf-group')){
   const f=card.querySelector(':scope > legend')?.textContent.trim().match(/^F[12]\b/)?.[0];
   if(f!=='F1'||card.querySelector('[data-sampling-criteria]'))continue;
   const anchor=card.querySelector('.bpf-group-description')||card.querySelector('legend');
   const area=document.createElement('div');
   area.dataset.samplingCriteria=f;
   area.style.cssText='padding:10px;margin:10px 0;background:#eef5f8';
   for(const [,id,label,na] of checks.filter(item=>item[0]===f)){
     const row=document.createElement('label');
     row.style.cssText='display:flex;justify-content:space-between;gap:8px;align-items:center;margin:6px 0';
     const caption=document.createElement('span');caption.textContent=label;
     const input=document.createElement('select');
     for(const [value,name] of [['','Selecione'],['1','Sim'],['0','Não'],...(na?[['2','NA']]:[])]){
       const option=document.createElement('option');option.value=value;option.textContent=name;input.append(option);
     }
     input.value=data()?.[key(id)]||'';
     input.addEventListener('change',()=>{
       const state=data();if(!state)return;
       state[key(id)]=input.value;
       window.Guia?.recalc?.();
       const notes=[...card.querySelectorAll('textarea')];
       const notifier=notes[0]||card.querySelector('input[data-answer-name]');
       notifier?.dispatchEvent(new Event('change',{bubbles:true}));
     });
     row.append(caption,input);area.append(row);
   }
   anchor?.after(area);

 }
}
function install(){
 const observer=new MutationObserver(refresh);
 observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('focus',refresh);
 refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();

window.bpfPrintSampling404=async function(pdf){
 const annexEnabled=[...document.querySelectorAll('input[type=checkbox]')].some(el=>el.checked&&/anexar.*(?:frases|F).*pdf/i.test(el.parentElement?.textContent||''));
 if(!annexEnabled)return;
 const fonts=[await pdf.embedFont(PDFLib.StandardFonts.Helvetica),await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold)];
 const page=pdf.addPage([595.28,841.89]);
 let y=799;
 function add(text,size,bold=false){
   const font=fonts[Number(bold)];
   let row='';
   for(const word of text.split(/\s+/)){
     const next=row?row+' '+word:word;
     if(row&&font.widthOfTextAtSize(next,size)>521){page.drawText(row,{x:37,y,font,size});y-=size+4;row=word;}
     else row=next;
   }
   if(row){page.drawText(row,{x:37,y,font,size});y-=size+4;}
 }
 add('4.10.4 — Plano de amostragem',17,true);
 add('Anexo de frases F · Controle da Qualidade',11);
 y-=12;
 for(const f of ['F1','F2']){
   const p=phrases[f];
   add(f+' — '+p.title+' (PPRO)',13,true);
   add(p.text,10);
   add('Orientação ao inspetor: '+p.guide,10);
   y-=7;
   for(const [,id,label] of checks.filter(item=>item[0]===f)){
     const state=data();
     let answer=state?.[key(id)];
     if(f==='F2'&&typeof BPF_PHRASES!=='undefined'&&typeof bpfPanels==='function'){
       const page=BPF_PHRASES.find(p=>p.rows.some(r=>r.code==='4.10.4'));
       const item=page?.rows.find(r=>r.code==='4.10.4');
       const panel=item&&bpfPanels(page,item).find(p=>p.id===1);
       if(panel?.checklist?.includes(label))answer=['0','1'].find(value=>
         bpfChecklistSelected(page,item,panel,value,state).includes(label)
       )||(id==='mensal_registro'&&answer==='2'?'2':'');
     }
     const result={'1':'Sim','0':'Não','2':'NA'}[answer]||'Em branco';
     add(label+' — '+result,10);
   }
   y-=7;
   add('OBS — Exemplo: '+p.obs,10);
   add('NC — Exemplo: '+p.nc,10);
   y-=18;
 }
};
})();