const {chromium}=require('./runtime.cjs').dependency('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.CEIA_DETAILS_OUTPUT||path.join(root,'prints/detalhes');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CEIA_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const report=[];
 for(const [width,height]of [[360,740],[390,844],[1440,900]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  await context.addInitScript(()=>{localStorage.setItem('ceia-cookie-choice','accepted');sessionStorage.setItem('ceia-exit-shown','1')});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:8765/?agora=2026-11-03T14%3A41%3A00-03%3A00',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>!!window.__CEIA_DEBUG);await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>document.activeElement?.blur());
  await page.addStyleTag({content:'.calendar-bar,.reading-progress,.skip-link,.cookie-banner{visibility:hidden!important}'});
  for(const [name,selector]of [['plano','.offer-card'],['feedbacks','#depoimentos'],['rodape','.footer'],['garantia','.guarantee'],['bonus','.bonuses']]){
   const section=page.locator(selector);await section.scrollIntoViewIfNeeded();
   await section.locator('img:visible').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
   await section.screenshot({path:path.join(out,`${name}-${width}x${height}.png`)});
  }
  for(const tab of ['cardapios','quantidades','cronograma','compras','orcamento']){await page.locator('#tab-'+tab).click();await page.locator('#inside-image').evaluate(i=>i.decode());assert(await page.locator('#inside-image').evaluate(i=>i.naturalWidth>0));}
  for(const menu of ['tradicional','economico','pratico']){await page.locator('#tab-cardapios').click();await page.locator('[data-menu='+menu+']').click();await page.locator('#inside-image').evaluate(i=>i.decode());}
  const data=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,images:[...document.images].filter(i=>i.getClientRects().length&&i.getAttribute('src')&&!i.closest('dialog')).map(i=>({src:i.getAttribute('src'),loaded:i.naturalWidth>0})),benefits:document.querySelectorAll('.benefit-item').length,feedbacks:document.querySelectorAll('.feedback-item').length,businessVisible:!document.querySelector('#business-details').hidden}));
  assert.equal(data.width,data.scrollWidth);assert.equal(data.benefits,7);assert.equal(data.feedbacks,1);assert.deepEqual(errors,[]);assert(data.images.every(i=>i.loaded));
  // Test all four supplied official assets without announcing unconfirmed card acceptance in production.
  await page.locator('.offer-copy').scrollIntoViewIfNeeded();
  await page.evaluate(()=>document.querySelectorAll('[data-payment-brand]').forEach(tile=>tile.hidden=false));
  await page.locator('.offer-copy .payment-tile img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  const row=await page.locator('.offer-copy .payments-row').evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth,rects:[...el.children].map(c=>c.getBoundingClientRect().toJSON()),logos:[...el.querySelectorAll('img')].map(i=>({alt:i.alt,loaded:i.naturalWidth>0}))}));
  assert(row.rects.every(r=>Math.abs(r.top-row.rects[0].top)<1));assert(row.logos.every(i=>i.loaded));assert(row.scrollWidth<=row.width+1);
  await page.locator('.offer-copy .payments-row').screenshot({path:path.join(out,`marcas-layout-quatro-${width}.png`)});
  report.push({...data,errors,allFourMarksFixture:row});await context.close();
 }
 await browser.close();fs.writeFileSync(path.join(out,'viewports.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report.map(r=>({width:r.width,scrollWidth:r.scrollWidth,benefits:r.benefits,feedbacks:r.feedbacks,businessVisible:r.businessVisible,allMarksFit:r.allFourMarksFixture.scrollWidth<=r.allFourMarksFixture.width+1}))));
})().catch(e=>{console.error(e);process.exitCode=1});
