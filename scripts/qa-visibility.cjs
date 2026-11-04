const {chromium}=require('./runtime.cjs').dependency('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.CEIA_VISIBILITY_OUTPUT||path.resolve(__dirname,'../prints/visibilidade');fs.mkdirSync(out,{recursive:true});
const base=process.env.CEIA_QA_URL||'http://localhost:8765';
async function contentState(page){return page.evaluate(()=>{
 const nodes=[...document.querySelectorAll('h1,h2,h3,.reveal,.benefit-item,.faq-list details')].filter(el=>el.getClientRects().length&&!el.closest('dialog'));
 const faded=nodes.filter(el=>{for(let p=el;p;p=p.parentElement){const s=getComputedStyle(p);if(Number(s.opacity)<1||s.visibility==='hidden')return true;}return false;}).map(el=>el.textContent.trim().slice(0,75));
 return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,checked:nodes.length,faded};
});}
async function loadImages(page){await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.getClientRects().length&&!i.closest('dialog')).map(i=>{i.loading='eager';return i.decode();}));});}
async function fastScroll(page){const size=await page.evaluate(()=>({height:document.scrollingElement.scrollHeight,step:innerHeight*1.7}));for(let y=0;y<size.height;y+=size.step){await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(16);}await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CEIA_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),report=[];
 try{
 for(const [width,height] of [[360,740],[390,844],[1440,900]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'});
  await context.addInitScript(()=>{localStorage.setItem('ceia-cookie-choice','accepted');sessionStorage.setItem('ceia-exit-shown','1');});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.__CEIA_DEBUG);await loadImages(page);await fastScroll(page);
  const fast=await contentState(page);assert.deepEqual(fast.faded,[]);assert.equal(fast.width,fast.scrollWidth);
  await page.screenshot({path:path.join(out,`pagina-inteira-${width}x${height}.png`),fullPage:true});
  const tabs=[];
  for(const key of ['cardapios','quantidades','cronograma','compras','orcamento']){
   await page.locator('#tab-'+key).click();await page.locator('#inside-image').evaluate(i=>i.decode());
   const size=await page.locator('#inside-image').evaluate(i=>({tab:i.src,naturalWidth:i.naturalWidth,ratio:i.offsetWidth/document.querySelector('#inside-panel').offsetWidth}));
   assert(size.naturalWidth>0);if(width>=768)assert(size.ratio>=.55,JSON.stringify(size));tabs.push(size);
  }
  await page.locator('#tab-cardapios').click();
  await page.evaluate(()=>document.activeElement?.blur());
  const captureStyle=await page.addStyleTag({content:'.calendar-bar,.reading-progress,.skip-link,.cookie-banner{visibility:hidden!important}'});
  for(const [name,selector] of [['plano','.offer-card'],['feedback','#depoimentos'],['kit','#inside-panel']]){const el=page.locator(selector);await el.scrollIntoViewIfNeeded();await el.screenshot({path:path.join(out,`${name}-${width}x${height}.png`)});}
  await captureStyle.evaluate(el=>el.remove());
  const detail=await page.evaluate(()=>({thumbs:[...document.querySelectorAll('.benefit-visual>img')].map(i=>({width:i.width,height:i.height,cssWidth:getComputedStyle(i).width,cssHeight:getComputedStyle(i).height,loaded:i.naturalWidth>0})),title:document.querySelector('#depoimentos h2').textContent,compact:document.querySelector('#depoimentos').classList.contains('feedbacks-compact'),controls:getComputedStyle(document.querySelector('.carousel-controls')).display,pix:[...document.querySelectorAll('[data-payment-brand="pix"] img')].map(i=>({src:i.getAttribute('src'),width:i.width,loaded:i.naturalWidth>0})),broken:[...document.images].filter(i=>i.getClientRects().length&&!i.closest('dialog')&&!i.naturalWidth).map(i=>i.src)}));
  assert.deepEqual(detail.broken,[]);assert(detail.thumbs.every(i=>i.cssWidth==='56px'&&i.cssHeight==='72px'&&i.loaded));assert(detail.pix.every(i=>i.width===170&&i.loaded));assert(detail.compact);assert.equal(detail.title,'Feedback de quem já recebeu');assert.equal(detail.controls,'none');assert.deepEqual(errors,[]);
  report.push({mode:'normal',viewport:{width,height},fast,detail,tabs,errors});await context.close();
 }
 for(const mode of ['no-js','silent-observer','no-observer']){
  const context=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:mode!=='no-js',reducedMotion:'no-preference'});
  if(mode!=='no-js')await context.addInitScript(mode=>{localStorage.setItem('ceia-cookie-choice','accepted');sessionStorage.setItem('ceia-exit-shown','1');if(mode==='no-observer')delete window.IntersectionObserver;else{window.__silentObservers=[];window.IntersectionObserver=class{constructor(){this.nodes=[];this.disconnected=false;window.__silentObservers.push(this);}observe(n){this.nodes.push(n)}unobserve(){}disconnect(){this.disconnected=true}}}},mode);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'networkidle'});await loadImages(page);await fastScroll(page);await page.waitForTimeout(1650);
  const state=await contentState(page);assert.deepEqual(state.faded,[]);assert.equal(state.width,state.scrollWidth);assert.deepEqual(errors,[]);
  if(mode==='silent-observer')assert(await page.evaluate(()=>window.__silentObservers.filter(o=>o.disconnected).length>=2));
  await page.screenshot({path:path.join(out,`pagina-inteira-${mode}-390x844.png`),fullPage:true});report.push({mode,state,errors});await context.close();
 }
 for(const count of [0,1,2,3]){
  const context=await browser.newContext({viewport:{width:390,height:844}});await context.addInitScript(()=>{sessionStorage.setItem('ceia-exit-shown','1');});const page=await context.newPage();
  await page.route('**/config.js',async route=>{const response=await route.fetch();const body=(await response.text()).replace(/TESTIMONIALS:\s*\[[^\]]*\]/,()=>`TESTIMONIALS:${JSON.stringify(Array(count).fill('./depoimentos/feedback-03.webp'))}`);await route.fulfill({response,body});});
  await page.goto(base,{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.__CEIA_DEBUG);
  assert.equal(await page.locator('#depoimentos').isVisible(),count>0);assert.equal(await page.locator('.feedback-item').count(),count);
  if(count){assert.equal(await page.locator('#depoimentos').evaluate(el=>el.classList.contains('feedbacks-compact')),count<3);assert.equal(await page.locator('#depoimentos h2').textContent(),count===1?'Feedback de quem já recebeu':'Feedbacks de quem já recebeu');assert.equal(await page.locator('.feedback-phrase').count(),count<3?1:0);if(count<3)assert.equal(await page.locator('.carousel-controls').isVisible(),false);}
  report.push({fixturePrints:count,passed:true});await context.close();
 }
 fs.writeFileSync(path.join(out,'verificacao.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report.map(r=>({mode:r.mode||'fixture',viewport:r.viewport,prints:r.fixturePrints,passed:true}))));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
