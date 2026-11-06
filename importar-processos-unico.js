/* Guia BPF: um único botão Importar processos no menu em equipe. */
(()=>{'use strict';
 if(window.__bpf_importar_processos_unico_v2)return;
 window.__bpf_importar_processos_unico_v2=true;
 const normalize=t=>String(t||'').replace(/\s+/g,' ').trim();
 const label=el=>normalize(el.tagName==='INPUT'?el.value:el.textContent||el.getAttribute('aria-label'));
 const actionSelector='button,a,[role="button"],input[type="button"],input[type="submit"]';
 const inDialog=el=>!!el.closest('dialog,[role="dialog"],[aria-modal="true"],.modal,.modal-content,.popup');
 const visible=el=>el.getClientRects().length>0&&!el.hidden&&getComputedStyle(el).display!=='none';
 function distance(a,b){
   if(!a||!b)return 100000;
   const map=new Map();let n=a,i=0;
   while(n&&i<24){map.set(n,i++);n=n.parentElement}
   n=b;i=0;
   while(n&&i<24){if(map.has(n))return i+map.get(n);n=n.parentElement;i++}
   return 100000;
 }
 function update(){
   const controls=Array.from(document.querySelectorAll(actionSelector));
   const imports=controls.filter(el=>/^Importar processos(?:\s*[›»→])?$/i.test(label(el))&&!inDialog(el));
   if(imports.length<2)return;
   const save=controls.find(el=>/^Salvar arquivo$/i.test(label(el))&&!inDialog(el));
   const candidates=imports.filter(el=>el.dataset.bpfImportDuplicado!=='1');
   const ordered=(candidates.length?candidates:imports).slice().sort((a,b)=>{
     const da=distance(a,save),db=distance(b,save);
     if(da!==db)return da-db;
     return Number(visible(b))-Number(visible(a));
   });
   const main=ordered[0];
   for(const el of imports){
     if(el===main)continue;
     el.dataset.bpfImportDuplicado='1';
     el.hidden=true;
     el.style.setProperty('display','none','important');
     el.setAttribute('aria-hidden','true');
     el.tabIndex=-1;
   }
 }
 let queued=false;
 function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;update()},100)}
 function start(){update();new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
