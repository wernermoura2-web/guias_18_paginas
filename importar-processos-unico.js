/* Guia BPF | evita duplicação do comando Importar processos no menu em equipe. */
(()=>{'use strict';
  if(window.__bpf_importar_processos_unico)return;
  window.__bpf_importar_processos_unico=true;
  const text=el=>String(el.tagName==='INPUT'?el.value:el.textContent||el.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim();
  const isDialog=el=>el.closest('dialog,[role="dialog"],[aria-modal="true"],.modal,.modal-content,.popup');
  function ajustar(){
    const botoes=Array.from(document.querySelectorAll('button,a,[role="button"],input[type="button"],input[type="submit"]'))
      .filter(el=>/^Importar processos(?:\s*[›»→])?$/i.test(text(el))&&!isDialog(el));
    if(botoes.length<2)return;
    const principal=botoes.find(el=>!el.dataset.bpfImportDuplicado&&el.getClientRects().length>0)||botoes.find(el=>!el.dataset.bpfImportDuplicado)||botoes[0];
    botoes.forEach(el=>{
      if(el===principal||el.dataset.bpfImportDuplicado)return;
      el.dataset.bpfImportDuplicado='1';
      el.hidden=true;
      el.style.setProperty('display','none','important');
      el.setAttribute('aria-hidden','true');
      el.tabIndex=-1;
    });
  }
  let pendente=false;
  function agendar(){if(pendente)return;pendente=true;setTimeout(()=>{pendente=false;ajustar()},100)}
  function iniciar(){ajustar();new MutationObserver(agendar).observe(document.body,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});else iniciar();
})();
