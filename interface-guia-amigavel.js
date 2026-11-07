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
  .bpf-item-code{display:grid!important;grid-template-columns:minmax(0,1fr);grid-template-rows:42% 58%;justify-content:stretch!important;align-items:stretch!important;gap:0!important;padding:0!important;z-index:20!important;isolation:isolate;visibility:visible!important;opacity:1!important}
  .bpf-item-code>span{display:flex;align-items:center;justify-content:center;min-height:0;line-height:1;white-space:nowrap}
  .bpf-item-code>.bpf-f{position:relative;z-index:21!important;display:flex!important;align-items:center;justify-content:center;visibility:visible!important;opacity:1!important;box-sizing:border-box;width:100%!important;height:100%!important;min-height:0!important;min-width:0!important;padding:0!important;line-height:1!important;align-self:stretch}
  .bpf-f-destaque{font-weight:800!important;color:#fff!important;background:#087aaa!important;border:1px solid #07577b!important;border-radius:3px!important;text-decoration:none!important;opacity:1!important}
  /* bpf-f-dimensoes-20261106-v3: o tamanho da letra segue a altura real do item. */
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
  if(oldBar&&oldBar!==document.body&&!oldBar.contains(root)&&norm(oldBar.textContent).length<2500&&
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


/* BPF_PCC_DUAS_NATUREZAS_20261107_REV4: justificativa sanitária visível no HTML e no PDF.
   A regra de classificação automática PCC já é calculada no formulário principal. */
(()=>{'use strict';
 if(window.__BPF_PCC_DUAS_NATUREZAS_20261107)return;
 window.__BPF_PCC_DUAS_NATUREZAS_20261107=true;
 const general=[
  'REGRA PCC: O não cumprimento da higienização prevista em qualquer item classificado como PCC torna automaticamente o processo de ALTO RISCO, independentemente da pontuação.',
  'Justificativa: falta de controle do perigo de contaminação microbiológica da água.'
 ];
 const embalagem=[
  'REGRA PCC: O não cumprimento da higienização prevista em qualquer item classificado como PCC torna automaticamente o processo de ALTO RISCO, independentemente da pontuação.',
  'Justificativa: perigo de contaminação microbiológica da água e de contaminação química por resíduos de saneantes e detergentes, quando não comprovada sua eliminação após o enxágue das embalagens higienizadas ou desinfetadas.'
 ];
 const matriz=[...general];
 const riscoFinal={0:'Dropdown5',1:'Dropdown10',2:'Dropdown15',3:'Dropdown20',4:'Dropdown25',5:'Dropdown30',6:'Dropdown35',7:'Dropdown40',8:'Dropdown45',9:'Dropdown50',10:'Dropdown55',11:'Dropdown56',12:'Dropdown57'};
 const areas=[];
 function linesFor(page){return page===7||page===8?embalagem:general;}
 function start(){
  const host=document.getElementById('pages'),data=window.Guia?.data;
  if(!host||!data?.widgets||host.children.length<18)return;
  const existing=document.getElementById('bpf-regra-pcc-matriz');
  if(existing){
   existing.replaceChildren(...matriz.map(s=>{const d=document.createElement('div');d.textContent=s;return d;}));
   existing.style.cssText='position:absolute;left:5.8%;top:63.60%;width:88.4%;height:2.65%;font:bold 0.96cqw Arial,sans-serif;line-height:1.08;text-align:center;white-space:normal;color:#a11414;pointer-events:none;z-index:8';
  }
  for(const [pageText,name]of Object.entries(riscoFinal)){
   const page=+pageText,widget=data.widgets.find(w=>w.page===page&&w.name===name);
   if(!widget||host.children[page].querySelector('.bpf-nota-pcc-2-perigos'))continue;
   const top=widget.size[1]-widget.rect[1]+3;
   areas.push({page,top});
   const note=document.createElement('div');
   note.className='bpf-nota-pcc-2-perigos';
   note.replaceChildren(...linesFor(page).map(s=>{const d=document.createElement('div');d.textContent=s;return d;}));
   note.style.cssText='position:absolute;left:5.8%;top:'+(100*top/widget.size[1])+'%;width:88.4%;height:'+(100*19/widget.size[1])+'%;font:bold 0.96cqw Arial,sans-serif;line-height:1.08;text-align:center;white-space:normal;color:#a11414;pointer-events:none;z-index:8';
   host.children[page].append(note);
  }
 }
 function installPdfPatch(){
  const lib=window.PDFLib;if(!lib?.PDFDocument?.load||lib.PDFDocument.load.__bpfPccTwoHazards)return;
  const oldLoad=lib.PDFDocument.load;
  async function newLoad(...args){
   const pdf=await oldLoad.apply(this,args);
   if(pdf.getPageCount()<22)return pdf;
   const originalPages=pdf.getPages().slice(0,18); // Mantém a matriz no lugar mesmo com páginas extras.
   let added=false;
   const oldSave=pdf.save.bind(pdf);
   pdf.save=async function(...options){
    if(!added){
     added=true;
     const font=await pdf.embedFont(lib.StandardFonts.HelveticaBold);
     const red=lib.rgb(0.56,0.07,0.07);
     function put(page,lines,top){
      const maxWidth=523,standardSize=7.2;
      for(let i=0;i<lines.length;i++){
       const line=lines[i];
       const width=font.widthOfTextAtSize(line,standardSize);
       const size=Math.min(standardSize,standardSize*maxWidth/width);
       page.drawText(line,{x:36,y:page.getHeight()-top-7-i*9.1,size,font,color:red});
      }
     }
     const pageMatriz=originalPages[17];
     // Substitui a nota antiga, desenhada pelo HTML, pela explicação dos dois perigos.
     pageMatriz.drawRectangle({x:36,y:282,width:523,height:22,color:lib.rgb(1,1,1)});
     put(pageMatriz,matriz,539);
     for(const {page,top}of areas)put(originalPages[page],linesFor(page),top);
    }
    return oldSave(...options);
   };
   return pdf;
  }
  newLoad.__bpfPccTwoHazards=true;
  lib.PDFDocument.load=newLoad;
 }
 function installGeneralRiskCount(){
  // Classificação do estabelecimento: mantém a contagem aprovada dos oito processos.
  const previous=window.recalc;
  if(typeof previous!=='function'||previous.__bpfCount8Processes)return;
  function corrected(...args){
   const result=previous.apply(this,args);
   const v=window.Guia?.values;
   if(v){
    const fields=['Dropdown60','Dropdown61','Dropdown62','Dropdown63','Dropdown64','Dropdown65','Dropdown66','Dropdown67'];
    const levels=fields.map(field=>v[field]);
    const altos=levels.filter(level=>level==='ALTO').length;
    v.Dropdown58=levels.every(level=>!level)?'':altos>=6?'ALTO':altos>=4?'MÉDIO':'BAIXO';
    v.Group279=v.Dropdown58==='BAIXO'?'0':v.Dropdown58==='MÉDIO'?'1':v.Dropdown58==='ALTO'?'2':'Off';
    if(typeof window.sync==='function')window.sync();
   }
   return result;
  }
  corrected.__bpfCount8Processes=true;
  window.recalc=corrected;
  if(window.Guia)window.Guia.recalc=corrected;
 }
 installGeneralRiskCount();
 document.addEventListener('click',e=>{if(e.target.closest?.('#print'))installPdfPatch();},true);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
