/* Reforça a apresentação dos critérios já existentes nos quatro F1.
   Não cria F adicionais, não altera redações legais, respostas ou pontuação. */
(()=>{'use strict';
 if(window.__bpfF1VisibleV59)return;
 window.__bpfF1VisibleV59=true;
 const CONTENT={
  '4.10.1':{
   title:'F1 — Implementação e documentação do controle de qualidade',
   items:['Implementação do controle de qualidade','Documentação do controle de qualidade (manual, POPs, métodos e registros)'],
   note:'No mesmo F1, confira a implementação e a documentação do controle de qualidade. São duas verificações, sem criar novo F.'
  },
  '4.11.1':{
   title:'F1 — Supervisão e capacitação periódica',
   items:['Supervisão dos manipuladores','Capacitação periódica dos manipuladores'],
   note:'No mesmo F1, confira a supervisão e os registros da capacitação periódica dos manipuladores.'
  },
  '4.11.3':{
   title:'F1 — Capacitação de 40 horas e curso há mais de 2 anos',
   items:['Capacitação de 40 horas — curso concluído há até 2 anos','Capacitação de 40 horas — curso concluído há mais de 2 anos (conferir atualização)'],
   note:'No mesmo F1, confira o curso de 40 horas e a data de conclusão. Para curso com mais de dois anos, verifique a atualização conforme o critério do Guia.'
  },
  '4.11.4':{
   title:'F1 — Certificados dos manipuladores e do responsável pela industrialização',
   items:[],
   note:'No mesmo F1, confira os certificados dos manipuladores em cada processo aplicável e o certificado do responsável pela industrialização.'
  }
 };
 const labels={
  'Implementação':'Implementação do controle de qualidade',
  'Documentação':'Documentação do controle de qualidade (manual, POPs, métodos e registros)',
  'Supervisão':'Supervisão dos manipuladores',
  'Capacitação':'Capacitação periódica dos manipuladores',
  'Curso de 40h com até 2 anos':'Capacitação de 40 horas — curso concluído há até 2 anos',
  'Curso de 40h com mais de 2 anos':'Capacitação de 40 horas — curso concluído há mais de 2 anos (conferir atualização)',
  'Certificado do responsável pela industrialização':'Certificado de capacitação do responsável pela industrialização (data, carga horária e conteúdo)'
 };
 function apply(){
  const editor=document.getElementById('bpf-editor');if(!editor)return;
  const code=(editor.querySelector('h2')?.textContent||'').match(/\b4\.\d{1,2}\.\d{1,2}\b/)?.[0];
  const cfg=CONTENT[code];if(!cfg)return;
  const card=editor.querySelector('fieldset.bpf-group');if(!card)return;
  const legend=card.querySelector(':scope > legend');
  if(legend&&!legend.textContent.startsWith(cfg.title)){
    const classes=legend.textContent.split(' — BPF/APPCC: ');
    legend.textContent=cfg.title+(classes.length>1?' — BPF/APPCC: '+classes.slice(1).join(' — BPF/APPCC: '):'');
  }
  for(const caption of card.querySelectorAll('.bpf-answer-item span')){
    const old=caption.textContent.trim();
    if(Object.prototype.hasOwnProperty.call(labels,old))caption.textContent=labels[old];
  }
  if(!card.querySelector('.bpf-f1-criteria-note')){
   const note=document.createElement('p');note.className='bpf-f1-criteria-note';
   note.textContent=cfg.note;note.style.cssText='color:#173e58;background:#e9f4fb;border-left:3px solid #1274a3;padding:9px 11px;font-size:14px;line-height:1.4;margin:10px 0;';
   const guide=card.querySelector('.bpf-group-description');
   if(guide)guide.insertAdjacentElement('afterend',note);else legend?.insertAdjacentElement('afterend',note);
  }
 }
 let scheduled=false;
 const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply();})};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{
  new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});
  apply();
 },{once:true});
 else{new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});apply();}
})();