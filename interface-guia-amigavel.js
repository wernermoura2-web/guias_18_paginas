/* Interface simplificada do Guia BPF. Não altera dados, cálculos ou PDF. */
(()=>{'use strict';
 if(window.__BPF_UI_FRIENDLY_20261106)return;
 window.__BPF_UI_FRIENDLY_20261106=true;
 const inTeam=/(?:^|\/)equipe(?:_atualizado)?\.html$/i.test(location.pathname);
 const CSS=`
 @media screen{
  .bpf-ui-guide-header{background:linear-gradient(110deg,#123e57,#126a91)!important;color:#fff!important;padding:18px 19px!important}
  .bpf-ui-guide-header h1{font-size:clamp(22px,5vw,29px)!important;line-height:1.2!important;margin:0 0 5px!important;letter-spacing:-.4px!important}
  .bpf-ui-guide-header p{font-size:14px!important;line-height:1.35!important;margin:0!important;color:#e3f3fb!important}
  .bpf-ui-hub{box-sizing:border-box;margin:14px auto 20px;max-width:1040px;padding:18px;color:#183f52;background:linear-gradient(180deg,#fff,#f9fcfe);border:1px solid #cddfea;border-radius:18px;box-shadow:0 8px 24px #173e5512;font:inherit}
  .bpf-ui-hub *{box-sizing:border-box}
  .bpf-ui-hub h2{font-size:clamp(20px,4.6vw,24px);line-height:1.25;margin:0 0 15px;font-weight:750;letter-spacing:-.4px;color:#153b50}
  .bpf-ui-label{font-size:13px;font-weight:750;letter-spacing:.02em;color:#466474;margin-bottom:9px}
  .bpf-ui-process{background:#f1f7fb;border:1px solid #d9e9f1;border-radius:12px;padding:12px;margin-bottom:15px}
  .bpf-ui-processrow{display:flex;align-items:stretch;gap:8px}
  .bpf-ui-processrow select{flex:1;min-width:0;width:100%;max-width:100%;height:46px;min-height:46px;padding:0 10px;border:1px solid #afc8d8;border-radius:9px;background:#fff;color:#163c50;font:600 15px Arial,sans-serif}
  .bpf-ui-hub button{font-family:inherit;cursor:pointer;touch-action:manipulation}
  .bpf-ui-arrow{width:45px;min-width:45px;border:1px solid #bacfda;border-radius:9px;background:#fff;color:#145d83;font-size:25px;font-weight:650}
  .bpf-ui-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-bottom:15px}
  .bpf-ui-action{min-height:63px;border:1px solid #bdd4e1;border-radius:11px;padding:10px 9px;background:#fff;color:#19445c;font-size:14px;font-weight:700;text-align:center;line-height:1.25}
  .bpf-ui-action.primary{background:#087aaa;border-color:#087aaa;color:#fff}
  .bpf-ui-action:focus-visible,.bpf-ui-arrow:focus-visible,.bpf-ui-hub summary:focus-visible{outline:3px solid #f2ad35;outline-offset:2px}
  .bpf-ui-hub details{border:1px solid #d6e5ec;border-radius:12px;background:#fff;margin:9px 0 0;overflow:hidden}
  .bpf-ui-hub details[open]{background:#f9fcff}
  .bpf-ui-hub summary{cursor:pointer;padding:15px 15px;font-size:16px;font-weight:750;line-height:1.2;color:#15435c;display:flex;align-items:center;justify-content:space-between;gap:12px;list-style:none}
  .bpf-ui-hub summary::-webkit-details-marker{display:none}
  .bpf-ui-hub summary:after{content:'⌄';font-size:24px;line-height:.7;transform-origin:center;transition:transform .15s;color:#247da4}
  .bpf-ui-hub details[open]>summary:after{transform:rotate(180deg)}
  .bpf-ui-detail{padding:3px 13px 14px;border-top:1px solid #e2edf3;display:grid;gap:9px}
  .bpf-ui-detail .bpf-ui-action{width:100%;min-height:49px;font-size:15px;text-align:left;padding:12px 15px}
  .bpf-ui-hint{margin:0;font-size:13px;line-height:1.4;color:#537084}
  .bpf-ui-hub .bpf-ui-mini{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 0;color:#365768;font-size:14px}
  .bpf-ui-mini input[type=range]{flex:1;max-width:260px;accent-color:#087aaa}
  .bpf-ui-mini input[type=checkbox]{width:19px;height:19px;accent-color:#087aaa}
  .bpf-ui-original{display:none!important}
  .bpf-ui-backup{border:1px solid #cddfe8;border-radius:13px;padding:0;margin:14px 0;background:#f6fafd;overflow:hidden}
  .bpf-ui-backup>summary{padding:14px 17px;cursor:pointer;font-size:16px;font-weight:700;color:#184c66}
  .bpf-ui-backup>div{padding:12px 14px}
  .bpf-f-destaque{font-size:18px!important;font-weight:800!important;color:#fff!important;background:#087aaa!important;border:2px solid #07577b!important;border-radius:6px!important;min-height:33px!important;min-width:31px!important;text-decoration:none!important;opacity:1!important}
  @media(max-width:520px){
    .bpf-ui-hub{padding:13px 12px;margin:12px 9px 16px;border-radius:15px}
    .bpf-ui-actions{gap:7px}
    .bpf-ui-action{font-size:12.5px;padding:9px 6px;min-height:58px}
    .bpf-ui-detail .bpf-ui-action{font-size:15px}
  }
 }
 @media print{.bpf-ui-hub{display:none!important}}
 `;
 const style=document.createElement('style');style.textContent=CSS;document.head.appendChild(style);
 const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
 const label=el=>norm(el?.tagName==='INPUT'?el.value:(el?.textContent||el?.getAttribute?.('aria-label')||''));
 const actionSelector='button,a,[role="button"],input[type="button"],input[type="submit"]';
 function sourceControls(){return Array.from(document.querySelectorAll(actionSelector)).filter(el=>!el.closest('#bpf-ui-hub'))}
 function lookup(pattern,preferVisible=false){
   const matches=sourceControls().filter(el=>pattern.test(label(el))&&!el.closest('dialog,[role="dialog"],[aria-modal="true"]'));
   return (preferVisible?matches.find(el=>el.getClientRects().length>0&&!el.hidden):null)||matches[0]||null;
 }
 function mark(el){if(!el)return;el.classList.add('bpf-ui-original');el.setAttribute('data-bpf-source-control','1')}
 function makeButton(text,original,primary=false){
   if(!original)return null;
   const b=document.createElement('button');b.type='button';
   b.className='bpf-ui-action'+(primary?' primary':'');
   b.textContent=text;
   b.addEventListener('click',()=>{original.click()});
   mark(original);return b;
 }
 function hideIntro(){
  const starts=['Guia BPF para preenchimento no navegador.','Preencha os campos sobre o guia.','Guia em branco. Salve em arquivo antes de fechar.'];
  const candidates=Array.from(document.querySelectorAll('p,aside,small,div'));
  for(const start of starts){
   const el=candidates.filter(x=>{const t=norm(x.textContent);return t.startsWith(start)&&t.length<1150&&!x.querySelector('button,a,select,input,textarea,canvas,img')})
     .sort((a,b)=>a.textContent.length-b.textContent.length)[0];
   if(el)el.style.display='none';
  }
  const header=Array.from(document.querySelectorAll('header h1,h1,header h2'))
   .find(el=>norm(el.textContent)==='Guia Estadual de Avaliação do Risco Sanitário');
  if(header){header.textContent='Guia de Avaliação de Risco';header.closest('header')?.classList.add('bpf-ui-guide-header')}
  const subs=Array.from(document.querySelectorAll('header p,header small')).filter(el=>norm(el.textContent).includes('Formulário local para Chrome'));
  for(const p of subs)p.textContent='Envasadoras de água mineral';
 }
 function makeAccordion(title){
  const d=document.createElement('details');const s=document.createElement('summary');s.textContent=title;
  const content=document.createElement('div');content.className='bpf-ui-detail';d.append(s,content);
  return {details:d,content};
 }
 function makeNav(host,save){
  const options=Array.from(document.querySelectorAll('select')).filter(s=>s.options?.length>2&&!s.closest('#bpf-ui-hub'));
  const src=options.find(s=>Array.from(s.options).some(o=>/4\.[1-9]/.test(o.textContent)))||options[0];
  if(!src)return;
  const box=document.createElement('section');box.className='bpf-ui-process';
  const lbl=document.createElement('div');lbl.className='bpf-ui-label';lbl.textContent='PROCESSO';
  const row=document.createElement('div');row.className='bpf-ui-processrow';
  const mirror=document.createElement('select');mirror.setAttribute('aria-label','Selecionar processo');
  function sync(){mirror.innerHTML=src.innerHTML;mirror.value=src.value;if(mirror.selectedIndex<0)mirror.selectedIndex=src.selectedIndex}
  sync();
  mirror.addEventListener('change',()=>{
    src.value=mirror.value;src.dispatchEvent(new Event('input',{bubbles:true}));src.dispatchEvent(new Event('change',{bubbles:true}));
  });
  const srcbuttons=sourceControls().filter(el=>el!==save);
  const prev=srcbuttons.find(el=>/^(?:‹|❮|«|←|<|Anterior)$/i.test(label(el)));
  const next=srcbuttons.find(el=>/^(?:›|❯|»|→|>|Próximo)$/i.test(label(el)));
  const prevBtn=document.createElement('button');prevBtn.className='bpf-ui-arrow';prevBtn.type='button';prevBtn.textContent='‹';prevBtn.setAttribute('aria-label','Processo anterior');
  const nextBtn=prevBtn.cloneNode();nextBtn.textContent='›';nextBtn.setAttribute('aria-label','Próximo processo');
  prevBtn.addEventListener('click',()=>{if(prev)prev.click();else{src.selectedIndex=Math.max(0,src.selectedIndex-1);src.dispatchEvent(new Event('change',{bubbles:true}))}setTimeout(sync,80)});
  nextBtn.addEventListener('click',()=>{if(next)next.click();else{src.selectedIndex=Math.min(src.options.length-1,src.selectedIndex+1);src.dispatchEvent(new Event('change',{bubbles:true}))}setTimeout(sync,80)});
  row.append(prevBtn,mirror,nextBtn);box.append(lbl,row);host.appendChild(box);
  mark(src);if(prev)mark(prev);if(next)mark(next);
  src.addEventListener('change',()=>{setTimeout(sync,0)});
 }
 function wrapBackups(){
  if(document.querySelector('.bpf-ui-backup'))return;
  const headings=Array.from(document.querySelectorAll('h2,h3,h4,strong,b,div,span'))
   .filter(el=>norm(el.textContent).startsWith('Cópia de segurança')&&norm(el.textContent).length<110&&!el.closest('#bpf-ui-hub'));
  for(const h of headings){
   if(h.closest('details'))continue;
   let parent=h.parentElement;
   while(parent&&parent!==document.body){
     const t=norm(parent.textContent);
     if(t.includes('Salvar cópia agora')&&t.includes('Recuperar preenchimento')&&t.length<5500)break;
     parent=parent.parentElement;
   }
   if(!parent||parent===document.body||parent.closest('.bpf-ui-backup'))continue;
   const d=document.createElement('details');d.className='bpf-ui-backup';
   const summary=document.createElement('summary');summary.textContent='Cópias de segurança';
   const inner=document.createElement('div');parent.parentNode.insertBefore(d,parent);
   inner.appendChild(parent);d.append(summary,inner);break;
  }
 }
 function makeHub(){
  if(document.getElementById('bpf-ui-hub'))return true;
  const save=lookup(/^Salvar arquivo$/i),open=lookup(/^Abrir preenchimento$/i),pdf=lookup(/^Imprimir\s*\/\s*PDF$/i);
  if(!save||!open||!pdf)return false;
  const importBtn=lookup(/^Importar processos$/i);
  const teamBtn=lookup(/^(?:Trabalho em equipe|Configurar equipe)$/i);
  const revise=lookup(/^Revisar frases dos inspetores$/i);
  const reset=lookup(/^Novo\s*\/\s*(?:limpar tudo|importar tudo)$/i);
  const remove=lookup(/^Remover imagem$/i);
  const root=document.createElement('section');root.id='bpf-ui-hub';root.className='bpf-ui-hub';root.setAttribute('aria-label','Menu do Guia de Avaliação de Risco');
  const heading=document.createElement('h2');heading.textContent='Menu do guia';root.appendChild(heading);
  makeNav(root,save);
  const lbl=document.createElement('div');lbl.className='bpf-ui-label';lbl.textContent='ARQUIVOS E RELATÓRIOS';root.appendChild(lbl);
  const actions=document.createElement('div');actions.className='bpf-ui-actions';
  actions.append(makeButton('Salvar arquivo',save,true),makeButton('Abrir preenchimento',open),makeButton('Imprimir PDF',pdf));
  root.appendChild(actions);
  if(inTeam&&(teamBtn||importBtn)){
    const t=makeAccordion('Configurar equipe');
    if(teamBtn)t.content.appendChild(makeButton('Dados da equipe',teamBtn));
    if(importBtn){
      const b=makeButton('Importar processos',importBtn);
      t.content.appendChild(b);
      const hint=document.createElement('p');hint.className='bpf-ui-hint';
      hint.textContent='Importa apenas os processos selecionados de outro fiscal.';
      t.content.appendChild(hint);
    }
    root.appendChild(t.details);
  }
  const extra=makeAccordion('Mais opções');
  if(revise)extra.content.appendChild(makeButton('Revisar frases',revise));
  const annex=Array.from(document.querySelectorAll('input[type=checkbox]'))
    .find(el=>!el.closest('#bpf-ui-hub')&&/Anexar F ao PDF/i.test(norm(el.parentElement?.textContent)));
  if(annex){
    const row=document.createElement('label');row.className='bpf-ui-mini';
    const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=annex.checked;
    checkbox.addEventListener('change',()=>{if(annex.checked!==checkbox.checked)annex.click()});
    row.append(checkbox,document.createTextNode('Anexar frases F ao PDF'));extra.content.appendChild(row);
    if(annex.parentElement?.tagName==='LABEL')annex.parentElement.classList.add('bpf-ui-original');
  }
  const ranges=Array.from(document.querySelectorAll('input[type=range]')).filter(el=>!el.closest('#bpf-ui-hub'));
  const zoom=ranges.find(el=>/zoom/i.test(norm(el.parentElement?.textContent)))||ranges[0];
  if(zoom){
    const row=document.createElement('label');row.className='bpf-ui-mini';row.appendChild(document.createTextNode('Zoom'));
    const mirror=zoom.cloneNode();mirror.removeAttribute('id');mirror.value=zoom.value;
    mirror.addEventListener('input',()=>{zoom.value=mirror.value;zoom.dispatchEvent(new Event('input',{bubbles:true}));zoom.dispatchEvent(new Event('change',{bubbles:true}))});
    row.appendChild(mirror);extra.content.appendChild(row);
    if(zoom.parentElement?.tagName==='LABEL')zoom.parentElement.classList.add('bpf-ui-original');
    else mark(zoom);
  }
  if(reset)extra.content.appendChild(makeButton('Novo / limpar tudo',reset));
  if(extra.content.children.length)root.appendChild(extra.details);
  if(remove)mark(remove);
  // Esconder repetições de Importar processos sem esconder confirmação em diálogos.
  if(inTeam)sourceControls().filter(el=>/^Importar processos$/i.test(label(el))&&!el.closest('dialog,[role="dialog"],[aria-modal="true"]')).forEach(mark);
  const anchor=save.closest('nav,.toolbar,.controls,.actions')||save.parentElement;
  anchor.parentNode.insertBefore(root,anchor);
  // Recolher a barra antiga apenas quando ela contiver exclusivamente os controles duplicados.
  // Não esconder formulários, caixas de diálogo, tabelas ou campos da inspeção.
  let oldBar=save.parentElement;
  while(oldBar&&oldBar!==document.body&&(!oldBar.contains(open)||!oldBar.contains(pdf)))oldBar=oldBar.parentElement;
  if(oldBar&&oldBar!==document.body&&norm(oldBar.textContent).length<2500&&
     !oldBar.querySelector('dialog,table,canvas,textarea,[role="dialog"]')&&
     oldBar.querySelectorAll('input:not([type="button"]):not([type="checkbox"]):not([type="range"]),select').length<=2){
    oldBar.classList.add('bpf-ui-original');
  }
  return true;
 }
 function emphasizeF(){
  for(const el of sourceControls()){
   if(label(el)!=='F')continue;
   el.classList.add('bpf-f-destaque');
   if(!el.hasAttribute('aria-label'))el.setAttribute('aria-label','Abrir frases do item');
  }
 }
 let completed=false,queued=false;
 function apply(){hideIntro();if(!completed)completed=makeHub();wrapBackups();emphasizeF()}
 function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;apply()},220)}
 function start(){apply();new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
