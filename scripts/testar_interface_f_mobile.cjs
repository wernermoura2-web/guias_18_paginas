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
   await page.waitForFunction(()=>typeof bpfOpenPhrases==='function'&&typeof bpfWaterCheck!=='undefined');
   for(const code of ['4.3.4','4.6.12','4.7.8']){
    await page.evaluate(code=>{document.querySelector('#bpf-editor')?.remove();const p=BPF_PHRASES.find(p=>p.rows.some(r=>r.code===code));bpfOpenPhrases(p.rows.find(r=>r.code===code),p);},code);
    const editor=page.locator('#bpf-editor');await editor.waitFor();
    const geometry=await editor.evaluate(el=>({width:el.getBoundingClientRect().width,client:el.clientWidth,scroll:el.scrollWidth,position:getComputedStyle(el).position,columns:getComputedStyle(el.querySelector('.bpf-answer-grid,.bpf-unified-top')).gridTemplateColumns,button:el.querySelector('.bpf-editor-controls:last-child button').getBoundingClientRect().toJSON()}));
    assert.equal(geometry.position,'fixed');assert(geometry.width<=375);assert(geometry.scroll<=geometry.client+1);assert(geometry.button.height>=44&&geometry.button.bottom<=812);
    console.log(mode,code,'mobile 375px OK');
   }
   await page.setViewportSize({width:1280,height:900});
   assert.equal(await page.locator('#bpf-editor').evaluate(el=>getComputedStyle(el).position),'static');
   await page.emulateMedia({media:'print'});assert.equal(await page.locator('#bpf-editor').evaluate(el=>getComputedStyle(el).display),'none');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
