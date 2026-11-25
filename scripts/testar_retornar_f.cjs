const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ctx=vm.createContext({URL,Response,Headers,self:{location:{href:'https://example.test/sw-guia18.js'},addEventListener(){}}});
vm.runInContext(fs.readFileSync(path.join(root,'sw-guia18.js'),'utf8'),ctx);
(async()=>{
 for(const mode of ['individual','equipe']){
  const html=await (await ctx.attachFriendlyMenu(new Response(fs.readFileSync(path.join(root,mode+'.html'),'utf8')),new URL('https://example.test/'+mode+'.html'))).text();
  assert.equal((html.match(/const bpfOriginalEdit=bpfSnapshotEditor\(\);/g)||[]).length,2);
  assert.equal((html.match(/button\.textContent\.trim\(\)==='Retornar'\?\(\)=>bpfCancelEditor\(dlg,bpfOriginalEdit,row\):finish/g)||[]).length,2);
  assert.equal((html.match(/dlg\.remove\(\);window\.GuiaRecovery\?\.schedule\?\.\(\);document\.querySelector\('\.page\.active \.bpf-f/g)||[]).length,2);
  assert(/function checkpoint\((?:force=false)?\)\{if\(document.querySelector\("#bpf-editor"\)\)return Promise.resolve\(\);/.test(html));
  assert(html.includes('if(!encoded||photoEditor?.bpfCancelled)continue;'));
  const fn=html.match(/function bpfSnapshotEditor\(\)\{[\s\S]*?(?=function bpfDismissEditor\(\))/)[0];
  const controls=html.match(/function controls\(\)\{const bar=document\.createElement\('div'\);bar\.className='bpf-editor-controls';[^\n]+/g);
  assert.equal(controls.length,2);
  for(const source of controls){
   let syncs=0,schedules=0,commits=0;const status={textContent:''};
   const editor={isConnected:true,remove(){this.isConnected=false;},bpfCommit(){commits++;return true;}};
   const sandbox=vm.createContext({values:{note:'Texto original',answer:'1'},images:{photo:'original'},dirty:false,dlg:editor,row:{code:'4.2.2'},
    bpfApplyLoadedPhotoPages(){},sync(){syncs++;},window:{GuiaRecovery:{schedule(){schedules++;}}},
    document:{activeElement:{blur(){}},querySelector:s=>s==='#status'?status:null,createElement:()=>({children:[],append(el){this.children.push(el);}})}});
   vm.runInContext(fn+'\nconst bpfOriginalEdit=bpfSnapshotEditor();\nfunction finish(){dlg.bpfCommit();dlg.remove();}\n'+source,sandbox);
   vm.runInContext("values.note='Correção';values.answer='0';values.newField='draft';images.photo='nova';images.extra='draft';dirty=true;controls().children[1].onclick();",sandbox);
   assert.equal(commits,0);assert.equal(editor.isConnected,false);assert.equal(editor.bpfCancelled,true);
   assert.equal(sandbox.values.note,'Texto original');assert.equal(sandbox.values.answer,'1');assert(!Object.hasOwn(sandbox.values,'newField'));
   assert.equal(sandbox.images.photo,'original');assert(!Object.hasOwn(sandbox.images,'extra'));assert.equal(sandbox.dirty,false);
   assert.equal(syncs,1);assert.equal(schedules,1);assert(status.textContent.includes('Alterações descartadas'));
   editor.isConnected=true;vm.runInContext("values.note='Confirmado';controls().children[0].onclick();",sandbox);
   assert.equal(commits,1);assert.equal(sandbox.values.note,'Confirmado');
  }
  console.log(mode,'F comum e agrupado: cancelar restaura texto, resposta e fotos; salvar confirma; checkpoint protegido.');
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
