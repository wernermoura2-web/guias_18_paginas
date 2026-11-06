/* Ajustes de interface do Guia BPF — apenas tela, sem alteração do formulário ou dos dados. */
(()=>{'use strict';
if(window.__BPF_MENU_COMPACTO_20261106)return;
window.__BPF_MENU_COMPACTO_20261106=true;
const CSS=`
@media screen {
  .bpf-f-destaque {
    display:inline-flex!important;align-items:center!important;justify-content:center!important;
    box-sizing:border-box!important;min-width:32px!important;min-height:34px!important;
    padding:3px 6px!important;border-radius:6px!important;
    background:#087aaa!important;color:#fff!important;border:2px solid #07577b!important;
    font-size:18px!important;font-weight:800!important;line-height:1!important;
    text-decoration:none!important;box-shadow:0 1px 3px #083e5940!important;
    opacity:1!important;cursor:pointer!important;
  }
  .bpf-f-destaque:focus-visible{outline:3px solid #e3a325!important;outline-offset:2px!important}
  .bpf-backup-detalhes{margin:12px 0!important;border:1px solid #cbdfe9!important;border-radius:12px!important;background:#f1f8fc!important}
  .bpf-backup-detalhes>summary{padding:13px 16px!important;color:#164960!important;font-weight:700!important;cursor:pointer!important;list-style-position:inside}
  .bpf-backup-detalhes[open]>summary{border-bottom:1px solid #d2e4ed!important}
  .bpf-backup-detalhes> :not(summary){margin:10px!important}
}
`;
const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);
const normalized=s=>String(s||'').replace(/\s+/g,' ').trim();
const actionText=el=>normalized(el.tagName==='INPUT'?el.value:el.textContent);
const matches=(el,needle)=>actionText(el).toLowerCase()===needle.toLowerCase();
const actions=()=>Array.from(document.querySelectorAll('button,a,[role="button"],input[type="button"],input[type="submit"]'));
const hideBlock=(start)=>{
  const candidates=Array.from(document.querySelectorAll('p,div,small,aside,section'))
    .filter(el=>{const t=normalized(el.textContent);return t.startsWith(start)&&t.length<1150&&!el.querySelector('button,input,textarea,select,a,img,canvas')});
  if(!candidates.length)return;
  candidates.sort((a,b)=>normalized(a.textContent).length-normalized(b.textContent).length);
  candidates[0].style.display='none';
};
function apply(){
  // Corrige somente o cabeçalho da interface, não o título impresso nos formulários.
  const heading=Array.from(document.querySelectorAll('header h1,header h2,h1,h2'))
    .find(el=>normalized(el.textContent)==='Guia Estadual de Avaliação do Risco Sanitário');
  if(heading)heading.textContent='Guia de Avaliação de Risco';
  hideBlock('Guia BPF para preenchimento no navegador.');
  hideBlock('Preencha os campos sobre o guia.');
  hideBlock('Envasadoras de Água Mineral · Revisão 6 · Formulário local para Chrome');
  const all=actions();
  // Retirar o comando solicitado, sem bloquear a inclusão de imagens nos campos do guia.
  for(const a of all){
    const t=actionText(a);
    if(t==='Remover imagem'){
      a.hidden=true;a.style.display='none';
    }
  }
  // Apenas no menu, manter a primeira ocorrência de cada comando.
  const save=all.find(a=>actionText(a)==='Salvar arquivo');
  let menuRoot=save?.parentElement;
  while(menuRoot&&menuRoot!==document.body){
    const t=normalized(menuRoot.textContent);
    if(t.includes('Imprimir / PDF')&&t.includes('Novo / limpar tudo'))break;
    menuRoot=menuRoot.parentElement;
  }
  if(menuRoot===document.body)menuRoot=null;
  const menuActions=menuRoot?all.filter(a=>menuRoot.contains(a)&&/^(Salvar arquivo|Abrir preenchimento|Imprimir\s*\/\s*PDF|Importar processos|Revisar frases dos inspetores|Novo\s*\/\s*limpar tudo)$/i.test(actionText(a))):[];
  const seen=new Set();
  for(const a of menuActions){const key=actionText(a).toLowerCase().replace(/\s+/g,' ');if(seen.has(key)){a.hidden=true;a.style.display='none'}else seen.add(key)}
  // Botão F nas páginas de processos: não altera comportamento nem estados SIM/NÃO.
  for(const el of all){
    if(actionText(el)!=='F')continue;
    if(el.classList.contains('bpf-f-destaque'))continue;
    el.classList.add('bpf-f-destaque');
    if(!el.hasAttribute('aria-label'))el.setAttribute('aria-label','Abrir frases do item');
    if(!el.hasAttribute('title'))el.setAttribute('title','Frases do item');
  }
  for(const el of document.querySelectorAll('input[type="button"][value="F"]'))el.classList.add('bpf-f-destaque');
  // Recolher a área extensa de cópias de segurança, preservando os comandos e os backups.
  const titles=Array.from(document.querySelectorAll('h2,h3,h4,strong,b,div,span'))
    .filter(el=>{const t=normalized(el.textContent);return t.startsWith('Cópia de segurança')&&t.length<110});
  for(const heading of titles){
    if(heading.closest('details.bpf-backup-detalhes'))continue;
    let candidate=heading.parentElement;
    while(candidate&&candidate!==document.body){
      const text=normalized(candidate.textContent);
      if(text.includes('Salvar cópia agora')&&text.includes('Recuperar preenchimento')&&text.length<5000)break;
      candidate=candidate.parentElement;
    }
    if(!candidate||candidate===document.body)continue;
    if(candidate.querySelector('details.bpf-backup-detalhes'))continue;
    const details=document.createElement('details');details.className='bpf-backup-detalhes';
    const summary=document.createElement('summary');summary.textContent='Cópias de segurança';
    candidate.parentNode.insertBefore(details,candidate);
    details.appendChild(summary);details.appendChild(candidate);
    break;
  }
}
let scheduled=false;
function queue(){if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;apply()},200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply();new MutationObserver(queue).observe(document.body,{subtree:true,childList:true})},{once:true});
else{apply();new MutationObserver(queue).observe(document.body,{subtree:true,childList:true})}
})();
