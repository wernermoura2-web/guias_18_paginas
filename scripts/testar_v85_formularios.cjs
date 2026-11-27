const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const ctx=vm.createContext({URL,Response,Headers,self:{location:{href:'https://example.test/sw-guia18.js'},addEventListener(){}}});
vm.runInContext(fs.readFileSync(path.join(root,'sw-guia18.js'),'utf8'),ctx);
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  for(const mode of ['individual','equipe']){
   const html=await (await ctx.attachFriendlyMenu(new Response(fs.readFileSync(path.join(root,mode+'.html'),'utf8')),new URL('https://example.test/'+mode+'.html'))).text();
   const page=await browser.newPage({viewport:{width:375,height:812},serviceWorkers:'block'});
   await page.route('https://example.test/**',async route=>{
    const name=new URL(route.request().url()).pathname.slice(1),file=path.resolve(root,name);
    if(name===mode+'.html')return route.fulfill({contentType:'text/html',body:html});
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});
    return route.fulfill({path:file});
   });
   await page.goto('https://example.test/'+mode+'.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>typeof bpfOpenPhrases==='function'&&typeof bpfWaterCheck!=='undefined'&&document.querySelector('#bpf-ui-hub'));
   assert.equal(await page.getByText('Imprimir Anexo F resumido',{exact:true}).count(),0);
   assert.equal(await page.getByText('Imprimir Anexo F para preencher',{exact:true}).count(),1);
   for(const code of ['4.1.3','4.2.2','4.3.6','4.5.3','4.6.12','4.7.8']){
    await page.evaluate(code=>{document.querySelector('#bpf-editor')?.remove();const p=BPF_PHRASES.find(p=>p.rows.some(r=>r.code===code));bpfOpenPhrases(p.rows.find(r=>r.code===code),p);},code);
    const editor=page.locator('#bpf-editor');await editor.waitFor();
    await page.waitForFunction(()=>Array.from(document.querySelectorAll('#bpf-editor [data-bpf-info-box]')).every(b=>b.previousElementSibling?.hasAttribute('data-bpf-complementary-notice')));
    const result=await editor.evaluate(el=>({boxes:el.querySelectorAll('[data-bpf-info-box]').length,notices:el.querySelectorAll('[data-bpf-complementary-notice]').length,top:el.querySelector('h2')?.nextElementSibling?.hasAttribute('data-bpf-complementary-notice')}));
    assert.equal(result.boxes,result.notices);assert.equal(result.top,false);
    if(code==='4.1.3'){assert(result.boxes>0);if(mode==='equipe'){
      const notice=editor.locator('[data-bpf-complementary-notice]').first();await notice.evaluate(el=>el.scrollIntoView({block:'center'}));await page.screenshot({path:path.join(root,'assets/manual/aviso-complementares-v85.png')});
    }}
    console.log(mode,code,result);
   }
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
