/* Complemento editorial ao Guia BPF/APPCC: NÃO altera as redações legais nem as respostas do formulário. */
(() => {
  'use strict';
  const URL_DADOS = './revisao-orientacoes-20261107.json';
  const style = document.createElement('style');
  style.textContent = `
    #bpf-revisao-referencia{position:fixed;right:12px;bottom:12px;z-index:2147483600;border:0;
      padding:12px 16px;border-radius:12px;background:#0b4a77;color:#fff;font:700 14px Arial,sans-serif;
      box-shadow:0 4px 18px #082d4c66;cursor:pointer}
    #bpf-revisao-painel[hidden]{display:none!important}
    #bpf-revisao-painel{position:fixed;inset:0;z-index:2147483601;background:#0c263ca3;
      display:flex;justify-content:center;align-items:center;padding:12px;font:15px Arial,sans-serif;color:#143c55}
    #bpf-revisao-painel .painel{background:#f7fbfe;border-radius:16px;width:min(98vw,1100px);
      max-height:96vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 8px 30px #102b4e66}
    #bpf-revisao-painel header{background:#0b4a77;color:#fff;padding:14px 18px;display:flex;justify-content:space-between;gap:12px;align-items:center}
    #bpf-revisao-painel h2{font-size:20px;margin:0}
    #bpf-revisao-painel .corpo{padding:16px;overflow:auto}
    #bpf-revisao-painel .filtros{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:10px 0 14px}
    #bpf-revisao-painel input{font:inherit;max-width:100%;flex:1;min-width:175px;padding:10px;border:1px solid #a9c6d5;border-radius:8px}
    #bpf-revisao-painel button{font:inherit;border:1px solid #9dbbcf;border-radius:8px;padding:8px 11px;cursor:pointer;background:#fff;color:#0b4a77}
    #bpf-revisao-painel header button{background:#fff;color:#0b4a77;font-weight:700}
    #bpf-revisao-painel details{background:#fff;border:1px solid #cbdce7;border-radius:11px;padding:11px 13px;margin-bottom:10px}
    #bpf-revisao-painel details>summary{font-weight:700;cursor:pointer}
    #bpf-revisao-painel article{background:#fff;border:1px solid #cbdce7;border-radius:12px;margin-bottom:12px;padding:14px}
    #bpf-revisao-painel article h3{margin:0 0 10px;font-size:16px;color:#0c3f6c}
    #bpf-revisao-painel article p{line-height:1.5;margin:8px 0;white-space:pre-wrap}
    #bpf-revisao-painel article strong{color:#0b4a77}
    #bpf-revisao-painel .aviso{font-size:13px;color:#456378}
    #bpf-revisao-painel a{color:#0b4a77}
    @media print{#bpf-revisao-referencia,#bpf-revisao-painel{display:none!important}}
  `;
  document.head.append(style);
  const button = document.createElement('button'); button.id='bpf-revisao-referencia';
  button.type='button';button.textContent='Orientações e exemplos revisados';button.setAttribute('aria-haspopup','dialog');
  const screen = document.createElement('div');screen.id='bpf-revisao-painel';screen.hidden=true;
  screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');screen.setAttribute('aria-label','Orientações e exemplos revisados');
  screen.innerHTML='<div class="painel"><header><h2>Orientações e exemplos revisados</h2><button type="button" id="bpf-revisao-fechar">Fechar</button></header><div class="corpo"><p class="aviso">Este complemento mantém as frases legais originais intactas. Conteúdo: desdobramentos F, orientações, exemplos de OBS (SIM) e NC (NÃO).</p><details open><summary>Definições BPF/APPCC</summary><div id="bpf-definicoes"></div></details><div class="filtros"><input id="bpf-revisao-busca" aria-label="Pesquisar código ou conteúdo" placeholder="Pesquisar item (ex.: 4.10.6), F, palavra-chave…"><a href="./revisao-orientacoes-20261107.json" download>Baixar dados de revisão (JSON)</a></div><p id="bpf-contagem" class="aviso"></p><div id="bpf-entradas"></div></div></div>';
  const escapeHTML=s=>String(s||'').replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  let dataset=null;
  let debounce;
  const render=(term='')=>{
    if(!dataset)return;
    const q=term.toLocaleLowerCase('pt-BR').trim();
    const found=dataset.verificacoes.filter(row=>[row.item,row.f,row.descricao_F,row.desdobramento,row.orientacao_inspetor,row.obs_sim,row.nc_nao].join(' ').toLocaleLowerCase('pt-BR').includes(q));
    document.getElementById('bpf-contagem').textContent=found.length+' de '+dataset.verificacoes.length+' desdobramentos F • '+new Set(found.map(x=>x.item)).size+' itens';
    const container=document.getElementById('bpf-entradas');container.replaceChildren();
    const fragment=document.createDocumentFragment();
    for(const r of found){
      const article=document.createElement('article');
      article.innerHTML=`<h3>Item ${escapeHTML(r.item)} · ${escapeHTML(r.f)} · ${escapeHTML(r.descricao_F)} · ${escapeHTML(r.classificacao_appcc)}</h3>
      <p><strong>Desdobramento para verificação:</strong> ${escapeHTML(r.desdobramento)}</p>
      <p><strong>Orientação ao inspetor:</strong> ${escapeHTML(r.orientacao_inspetor)}</p>
      <p><strong>Exemplo de OBS — SIM:</strong> ${escapeHTML(r.obs_sim)}</p>
      <p><strong>Exemplo de NC — NÃO:</strong> ${escapeHTML(r.nc_nao)}</p>`;
      fragment.appendChild(article);
    }
    container.appendChild(fragment);
  };
  const open=async()=>{
    screen.hidden=false;button.setAttribute('aria-expanded','true');
    if(!dataset) {
      try{
        const result=await fetch(URL_DADOS,{cache:'no-store'});
        if(!result.ok)throw new Error('HTTP '+result.status);
        const data=await result.json();
        if(data.preservar_frases_legais!==true||!Array.isArray(data.verificacoes))throw new Error('Formato incompatível');
        dataset=data;
        const defs=document.getElementById('bpf-definicoes');defs.replaceChildren();
        Object.entries(data.definicoes||{}).forEach(([code,definition])=>{const p=document.createElement('p');p.textContent=definition;defs.appendChild(p)});
        render();
      }catch(e){document.getElementById('bpf-contagem').textContent='Não foi possível carregar a revisão: '+e.message}
    }
    document.getElementById('bpf-revisao-busca').focus();
  };
  const close=()=>{screen.hidden=true;button.setAttribute('aria-expanded','false');button.focus()};
  button.onclick=open;screen.querySelector('#bpf-revisao-fechar').onclick=close;
  screen.addEventListener('click',e=>{if(e.target===screen)close()});
  document.addEventListener('keydown',e=>{if(!screen.hidden&&e.key==='Escape')close()});
  screen.querySelector('input').addEventListener('input',e=>{clearTimeout(debounce);debounce=setTimeout(()=>render(e.target.value),120)});
  document.body.append(button,screen);
})();