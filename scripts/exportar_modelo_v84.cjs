/* Modelo dos campos complementares, diretamente da lógica atual do guia. */
const fs=require('node:fs'),vm=require('node:vm');
const model=JSON.parse(fs.readFileSync('equipe.html','utf8').match(/const BPF_PHRASES=(.*?);\n/)[1]);
const script=fs.readFileSync('bpf-captacao-conducao-consolidado.js','utf8');
const ctx=vm.createContext({BPF_PHRASES:model});
vm.runInContext(script+'\nthis.water=bpfWaterCheck;',ctx);
ctx.water.preparePhrases();
const sw=vm.createContext({URL,Response,Headers,self:{location:{href:'https://example.test/sw-guia18.js'},addEventListener(){}}});
vm.runInContext(fs.readFileSync('sw-guia18.js','utf8'),sw);
(async()=>{
const html=await (await sw.attachFriendlyMenu(new Response(fs.readFileSync('equipe.html','utf8')),new URL('https://example.test/equipe.html'))).text();
for(const name of ['bpfPhraseName','bpfScopeLabel','bpfGroupedF2','bpfDetailedF1','bpfF1Checks','bpfPanelClasses','bpfPanels']){
 const start=html.indexOf('function '+name+'('),end=html.indexOf('\nfunction ',start+1);
 if(start<0||end<0)throw Error('Função ausente: '+name);
 vm.runInContext(html.slice(start,end),ctx);
}
const panels=model.filter(p=>![3,4,5].includes(p.page)).map(page=>({page:page.page,rows:page.rows.map(row=>({code:row.code,panels:ctx.bpfPanels(page,row).map(panel=>{const c=ctx.water.get(row,panel.id);return {label:panel.label,classes:ctx.bpfPanelClasses(row,panel),allowNA:panel.allowNA||panel.entries.some(e=>e.phrase.allowNA),phrases:[...new Set(panel.entries.map(e=>e.phrase.text))],options:[...new Set(panel.entries.map(e=>e.option||e.phrase.option).filter(Boolean))],units:[...new Set(panel.entries.map(e=>ctx.bpfScopeLabel(page,e.scope)))],checklist:panel.checklist,checks:c?.checks.filter(q=>!q.scopeAnswer)||[],heading:c?.informationHeading||'Outras informações'};})}))}));
fs.writeFileSync(process.argv[2],JSON.stringify(panels,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
