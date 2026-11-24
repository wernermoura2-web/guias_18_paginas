const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('bpf-captacao-conducao-consolidado.js','utf8');
const model=JSON.parse(fs.readFileSync('equipe.html','utf8').match(/const BPF_PHRASES=(.*?);\n/)[1]);
class Node{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.style={};this.className='';this.classList={add:()=>{}};this.value='';this.hidden=false;}
 append(...nodes){for(const n of nodes){if(n&&typeof n==='object')n.parentElement=this;this.children.push(n);}}
 prepend(...nodes){for(const n of nodes)if(n&&typeof n==='object')n.parentElement=this;this.children.unshift(...nodes);}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 setAttribute(){} addEventListener(){} dispatchEvent(){} add(n){this.append(n);}
 querySelector(s){return walk(this).find(n=>n.tagName===s.toUpperCase())||null;}
 set textContent(t){this.caption=t;this.children=[];} get textContent(){return (this.caption||'')+this.children.map(n=>typeof n==='string'?n:n.textContent).join('');}
}
const walk=n=>[n,...n.children.filter(x=>x&&typeof x==='object').flatMap(walk)];
const values={},phraseName=(s,i)=>s.name+'_'+i;
const document={createElement:t=>new Node(t),head:new Node('head'),getElementById:()=>null};
const scopeLabel=(p,s)=>(p.page===0?'Captação ':p.page===1?'Condução ':'Reservatório ')+s.col;
const ctx=vm.createContext({BPF_PHRASES:model,document,values,bpfPhraseName:phraseName,bpfScopeLabel:scopeLabel,bpfAnswerLabel:v=>v==='1'?'Sim':v==='0'?'Não':'',bpfGroupNoteName:(p,r,f,a)=>p.page+r.code+f.id+a,bpfUnifiedOption:(r,e)=>e.phrase.option||e.phrase.text,bpfAttachNoteTools(){},bpfInstallIndividualNC(){},bpfPopNAForced:()=>false,bpfApplyPopF2NA(){},changed(){},recalc(){},Event:class{},Option:class extends Node{constructor(t,v){super('option');this.textContent=t;this.value=v;}}});
vm.runInContext(source+'\nthis.water=bpfWaterCheck;',ctx);const water=ctx.water;water.preparePhrases();
const target={'4.1.3':[0,2],'4.2.2':[0,1],'4.2.7':[1],'4.2.8':[0,1],'4.2.9':[0,1],'4.3.2':[0,1,2],'4.3.3':[0,1],'4.3.4':[0,1],'4.3.5':[1]};
let count=0;
for(const [code,ids] of Object.entries(target)){
 const page=model.find(p=>p.rows.some(r=>r.code===code)),row=page.rows.find(r=>r.code===code);
 for(const id of ids){
  const indices=code==='4.3.3'?(id===0?[0,1,6,3,4,5]:[2,7]):[id];
  const panel={id,label:'F'+(id+1),entries:row.scopes.flatMap(s=>indices.filter(i=>s.phrases[i]).map(i=>({scope:s,index:i,name:phraseName(s,i),phrase:s.phrases[i]})))};
  const card=new Node('fieldset');assert(water.render(card,page,row,panel));count++;
  const nodes=walk(card),radios=nodes.filter(n=>n.tagName==='INPUT'&&n.dataset.bpfCompactAnswer);
  assert.equal(radios.length,2*row.scopes.length,code+' F'+(id+1)+' seleções gerais');
  assert.equal(nodes.filter(n=>n.tagName==='DETAILS').length,0,code+' F'+(id+1)+' não deve recolher caixas');
  const info=nodes.filter(n=>Object.hasOwn(n.dataset,'bpfInfoBox'));assert.equal(info.length,1,code+' F'+(id+1)+' seção comum');
  const first=radios[0];first.checked=true;first.onchange();assert.equal(values[panel.entries[0].name],'1');
  const no=radios[row.scopes.length];no.checked=true;no.onchange();assert.equal(values[panel.entries[0].name],'0');
  assert.equal(first.checked,false,'Sim e Não exclusivos');
  const sharedSelect=walk(info[0]).find(n=>n.tagName==='SELECT'&&n.children.some(o=>o.value==='1')&&n.children.some(o=>o.value==='0'));
  if(sharedSelect){sharedSelect.value='1';sharedSelect.onchange();assert.equal(values[panel.entries[0].name],'0','informação geral não altera a avaliação da unidade');assert(values['BPF_LineInfo_'+page.page+'_'+code.replace(/\./g,'_')+'_F'+(id+1)],'informação registrada uma única vez');}
  if(code==='4.1.3'&&id===0){
   const select=walk(info[0]).find(n=>n.tagName==='SELECT'&&n.parentElement?.textContent.includes('Existe telemetria em linha?'));assert(select,'telemetria deve ter seletor Sim/Não');
   const line=select.parentElement,detail=walk(line).find(n=>n.className==='bpf-water-detail');assert(detail&&detail.hidden,'tipos fechados sem resposta');
   select.value='1';select.onchange();assert(line.textContent.includes('Existe telemetria em linha'));assert(!detail.hidden,'tipos abertos com Sim');
   select.value='0';select.onchange();assert(line.textContent.includes('Não existe telemetria em linha'));assert(detail.hidden,'tipos fechados com Não');
   assert.equal(values[panel.entries[0].name],'0','telemetria informativa não altera a avaliação');
  }
  if(code==='4.2.2'&&id===0){
   const selects=walk(info[0]).filter(n=>n.tagName==='SELECT'&&n.children.some(o=>o.value==='1')&&n.children.some(o=>o.value==='0'));
   assert.equal(selects.length,2,'certificado e declaração reunidos; nota fiscal separada');
   const [cert,nf]=selects;
   cert.value='';cert.onchange();assert(cert.parentElement.textContent.includes('Foi apresentado certificado / declaração de grau alimentício?'));
   nf.value='';nf.onchange();assert(nf.parentElement.textContent.includes('Foi apresentada a nota fiscal com as especificações do material?'));
   cert.value='0';cert.onchange();assert(cert.parentElement.textContent.includes('Não foi apresentado certificado / declaração de grau alimentício'));
   nf.value='1';nf.onchange();assert(nf.parentElement.textContent.includes('Foi apresentada a nota fiscal com as especificações do material'));
   const key='BPF_LineInfo_'+page.page+'_4_2_2_F1';
   values[key]=JSON.stringify({certificado:{answer:'0'},declaracao:{answer:'1'},'nota-fiscal':{answer:'0'}});
   const rebuilt=new Node('fieldset');water.render(rebuilt,page,row,panel);
   const migrated=walk(rebuilt).filter(n=>n.tagName==='SELECT'&&n.children.some(o=>o.value==='1')&&n.children.some(o=>o.value==='0'));
   assert.equal(migrated[0].value,'1','declaração apresentada conserva resposta positiva');
   assert.equal(migrated[1].value,'0','nota fiscal conserva resposta anterior');
  }
  if(code==='4.2.8'&&id===0){
   const select=walk(info[0]).find(n=>n.tagName==='SELECT'&&n.parentElement.textContent.includes('Realiza e registra a inspeção visual interna das tubulações?'));
   assert(select,'inspeção visual com seletor Sim/Não');
   select.value='1';select.onchange();assert(select.parentElement.textContent.includes('Realiza e registra a inspeção visual interna das tubulações'));
   select.value='0';select.onchange();assert(select.parentElement.textContent.includes('Não realiza e não registra a inspeção visual interna das tubulações'));
   assert(JSON.stringify(water.report(page,row,panel,values)).includes('Não realiza e não registra a inspeção visual interna das tubulações'));
   select.value='';select.onchange();assert(select.parentElement.textContent.includes('Realiza e registra a inspeção visual interna das tubulações?'));
  }
  if(code==='4.2.8'&&id===1){
   for(const caption of ['Possui registro de reparo das tubulações e conexões','Possui registros de passivação e/ou desincrustação']){
    const select=walk(info[0]).find(n=>n.tagName==='SELECT'&&n.parentElement.textContent.includes(caption));
    assert(select,caption+' — seletor Sim/Não');
    select.value='';select.onchange();assert(select.parentElement.textContent.includes(caption+'?'));
    select.value='1';select.onchange();assert(select.parentElement.textContent.includes(caption));
    select.value='0';select.onchange();const negative='Não '+caption.charAt(0).toLowerCase()+caption.slice(1);
    assert(select.parentElement.textContent.includes(negative));assert(JSON.stringify(water.report(page,row,panel,values)).includes(negative));
    select.value='';select.onchange();assert(select.parentElement.textContent.includes(caption+'?'));
   }
  }
  if(code!=='4.3.3'){water.apply(row,row.scopes[0],values);assert.equal(values[panel.entries[0].name],'0','recalcular mantém a escolha');}
  const report=water.report(page,row,panel,values);assert(report.some(r=>r.answer==='0'),code+' F'+(id+1)+' relatório NC');
  console.log(code,'F'+(id+1),'OK',radios.length,'seletores e uma seção comum');
 }
}
assert.equal(count,17);
