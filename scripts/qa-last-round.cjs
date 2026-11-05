const {chromium}=require('./runtime.cjs').dependency('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {audit}=require('./audit-feedbacks.cjs');
const root=path.resolve(__dirname,'..'),out=process.env.CEIA_FINAL_OUTPUT||path.join(root,'prints/ultima-rodada'),base=process.env.CEIA_QA_URL||'http://localhost:8765';
fs.mkdirSync(out,{recursive:true});const results=[];let browser;
const visibleImages=async page=>page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.getClientRects().length&&!i.closest('dialog:not([open])')).map(i=>{i.loading='eager';return i.decode();}));});
async function setup({width=390,height=844,reduced='reduce',cookies=true,suppress=true,clock=false,...options}={}){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:reduced,...options});
 await context.addInitScript(({cookies,suppress})=>{if(cookies)localStorage.setItem('ceia-cookie-choice','accepted');if(suppress)sessionStorage.setItem('ceia-exit-shown','1');window.__shifts=[];window.__shiftSources=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput){__shifts.push(e.value);__shiftSources.push({value:e.value,sources:e.sources.map(s=>s.node?.outerHTML.slice(0,150))});}})).observe({type:'layout-shift',buffered:true});},{cookies,suppress});
 const page=await context.newPage(),errors=[];page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));if(clock)await page.clock.install({time:new Date('2026-11-04T15:00:00Z')});
 await page.goto(base+'/?utm_source=teste&fbclid=abc',{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.__CEIA_DEBUG?.exit);return{context,page,errors};
}
function state(page){return page.evaluate(()=>__CEIA_DEBUG.carousel());}
async function test(name,run){if(process.env.CEIA_QA_ONLY&&!name.includes(process.env.CEIA_QA_ONLY))return;console.log('TEST',name);try{const details=await run();results.push({name,passed:true,details});fs.writeFileSync(path.join(out,'qa.json'),JSON.stringify({passed:true,results},null,2));console.log('PASS',name);}catch(e){results.push({name,passed:false,error:e.stack});fs.writeFileSync(path.join(out,'qa.json'),JSON.stringify({passed:false,results},null,2));throw e;}}
async function shape(page){return page.evaluate(()=>{
 const textCuts=[],small=[],touch=[],walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 const dialog=document.querySelector('dialog[open]');
 while(walker.nextNode()){
  const node=walker.currentNode,el=node.parentElement;if(!node.textContent.trim()||el.closest('script,style,svg,.sr-only,.offer-ribbon,dialog:not([open])')||!el.getClientRects().length||(dialog&&!dialog.contains(el)))continue;
  const s=getComputedStyle(el);if(s.visibility==='hidden')continue;
  if(innerWidth<768&&parseFloat(s.fontSize)<12)small.push({text:node.textContent.trim(),font:s.fontSize,element:el.outerHTML.slice(0,120)});
  if(el.closest('#inside-tabs,#feedback-window,.offer-ribbon'))continue;
  const range=document.createRange();range.selectNodeContents(node);
  for(const r of range.getClientRects()){
   if(r.width<1||r.height<1)continue;
   if(r.left<-.6||r.right>innerWidth+.6)textCuts.push({text:node.textContent.trim(),left:r.left,right:r.right});
   for(let ancestor=el;ancestor;ancestor=ancestor.parentElement){const st=getComputedStyle(ancestor),b=ancestor.getBoundingClientRect();if(st.overflowX==='hidden'&&(r.left<b.left-1||r.right>b.right+1))textCuts.push({text:node.textContent.trim(),ancestor:ancestor.className});}
  }
 }
 for(const el of document.querySelectorAll('a[href],button,summary,select')){
  if(!el.getClientRects().length||el.closest('dialog:not([open])')||el.classList.contains('skip-link')||(dialog&&!dialog.contains(el)))continue;
  const r=el.getBoundingClientRect();if(innerWidth<768&&(r.width<43.5||r.height<43.5))touch.push({text:el.textContent.trim().slice(0,45),class:el.className,w:r.width,h:r.height});
 }
 return{width:innerWidth,scrollWidth:document.documentElement.scrollWidth,textCuts,small,touch};
});}
async function capture(page,selector,name){await page.evaluate(()=>document.activeElement?.blur());const el=page.locator(selector);await el.scrollIntoViewIfNeeded();await el.screenshot({path:path.join(out,name),animations:'disabled',style:'.calendar-bar,.reading-progress,.skip-link,.cookie-banner{visibility:hidden!important}'});}
async function scrollFraction(page,fraction){await page.evaluate(n=>window.scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*n,behavior:'instant'}),fraction);await page.waitForTimeout(120);}
(async()=>{browser=await chromium.launch({headless:true,executablePath:process.env.CEIA_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 await test('01 Arquivos únicos e miniaturas leves',async()=>{const hashes=await audit();assert.equal(hashes.duplicateCount,0);hashes.files.forEach(f=>{assert(f.bytes<=25000);assert.equal(f.width,320);assert.equal(f.height,640);});const{context,page}=await setup();assert.equal(await page.locator('.feedback-card').count(),hashes.remaining);const src=await page.locator('.feedback-card img').evaluateAll(imgs=>imgs.map(i=>i.src));assert.equal(src.length,new Set(src).size);assert.equal(await page.locator('.feedback-set,[data-unique="false"],.feedback-dots').count(),0);assert.equal(await page.locator('#depoimentos button').count(),hashes.remaining);await context.close();return hashes;});
 await test('02 Layout móvel e desktop, tipografia e CLS',async()=>{
  const report=[];
  for(const[width,height]of [[360,740],[390,844],[412,915],[430,932],[1366,768],[1440,900]]){
   const{context,page,errors}=await setup({width,height,cookies:false});await visibleImages(page);
   const before=await shape(page);assert.equal(before.width,before.scrollWidth);assert.deepEqual(before.textCuts,[]);assert.deepEqual(before.small,[]);assert.deepEqual(before.touch,[]);
   const initial=await page.evaluate(()=>{const r=selector=>document.querySelector(selector).getBoundingClientRect().toJSON();return{hero:r('.hero h1'),button:r('.hero-copy>.button'),mockup:r('.hero-book'),cookies:r('#cookie-banner'),cls:__shifts.reduce((a,b)=>a+b,0),feedbackHeight:document.querySelector('#depoimentos').getBoundingClientRect().height};});
   assert(initial.cookies.top>=0&&initial.cookies.bottom<=height+1);assert(initial.cookies.top>=initial.button.bottom);assert.equal(initial.cls,0,JSON.stringify(await page.evaluate(()=>__shiftSources)));assert.equal(initial.feedbackHeight,width<768?440:520);
   if(width===390){assert(initial.button.bottom<height);assert(initial.mockup.top<height&&initial.mockup.bottom>initial.mockup.top);}
   await page.screenshot({path:path.join(out,`hero-${width}x${height}.png`),animations:'disabled'});await page.locator('#cookie-essential').click();
   for(const[name,selector]of [['plano','.offer-card'],['feedbacks','#depoimentos'],['rodape','.footer']])await capture(page,selector,`${name}-${width}x${height}.png`);
   const detail=await page.evaluate(()=>{const lineCount=el=>{const r=document.createRange();r.selectNodeContents(el);return new Set([...r.getClientRects()].filter(r=>r.width>0).map(r=>Math.round(r.top))).size;};return{heroLines:lineCount(document.querySelector('.hero h1')),planLines:lineCount(document.querySelector('#plano h2')),cardWidth:document.querySelector('.feedback-card').getBoundingClientRect().width,brands:[...document.querySelectorAll('.payments-row')].map(row=>[...row.querySelectorAll('.payment-tile')].filter(el=>!el.hidden).map(el=>({height:el.getBoundingClientRect().height,top:el.getBoundingClientRect().top}))),broken:[...document.images].filter(i=>i.getClientRects().length&&!i.closest('dialog')&&!i.naturalWidth).map(i=>i.src),cls:__shifts.reduce((a,b)=>a+b,0)};});
   assert(detail.heroLines<=3);assert(detail.planLines<=2);assert.equal(detail.cardWidth,width<768?150:190);assert.deepEqual(detail.broken,[]);assert.equal(detail.cls,0);assert.deepEqual(errors,[]);
   detail.brands.forEach(row=>{assert.equal(row.length,4);assert(row.every(r=>r.height===34&&Math.abs(r.top-row[0].top)<1));});report.push({width,height,initial,detail,typography:before});await context.close();
  }return report;
 });
 await test('03 Abas e quantidades reais',async()=>{const{context,page}=await setup();for(const tab of ['cardapios','quantidades','cronograma','compras','orcamento']){await page.locator('#tab-'+tab).click();await page.locator('#inside-image').evaluate(i=>i.decode());assert(await page.locator('#inside-image').evaluate(i=>i.naturalWidth>0));}await page.locator('#tab-quantidades').click();for(const n of [4,6,8,10,12]){await page.locator('#people').selectOption(String(n));assert.equal(await page.locator('#q-rice').textContent(),n*60+' g');}await page.locator('#people').selectOption('13');assert(await page.locator('#quantity-more').isVisible());await context.close();return{tabs:5,originalQuantities:true};});
 await test('04 Avanço 3,5 s, pausa, retomada, arrasto e retorno',async()=>{
  const{context,page}=await setup({reduced:'no-preference',hasTouch:true,clock:true});await page.locator('#depoimentos').scrollIntoViewIfNeeded();await page.mouse.move(2,2);
  await page.clock.runFor(3600);await page.waitForFunction(()=>Math.abs(document.querySelector('#feedback-window').scrollLeft-162)<2);const first=await page.locator('#feedback-window').evaluate(el=>el.scrollLeft);assert(first>100,'Avanço automático não ocorreu');
  await page.locator('#feedback-window').dispatchEvent('pointerdown',{pointerType:'touch',clientX:200});const paused=await page.locator('#feedback-window').evaluate(el=>el.scrollLeft);await page.clock.runFor(5000);assert.equal(await page.locator('#feedback-window').evaluate(el=>el.scrollLeft),paused);assert((await state(page)).paused);
  await page.locator('#feedback-window').dispatchEvent('pointerup',{pointerType:'touch'});await page.clock.runFor(3100);assert((await state(page)).active);await page.clock.runFor(3600);await page.waitForTimeout(700);assert.notEqual(await page.locator('#feedback-window').evaluate(el=>el.scrollLeft),paused);
  await page.locator('#feedback-window').dispatchEvent('pointerenter',{pointerType:'mouse'});assert((await state(page)).paused);await page.clock.runFor(4000);await page.locator('#feedback-window').dispatchEvent('pointerleave',{pointerType:'mouse'});await page.clock.runFor(3100);assert((await state(page)).active);
  await page.locator('#feedback-window').evaluate(el=>el.scrollTo({left:el.scrollWidth,behavior:'instant'}));await page.waitForTimeout(200);await page.clock.runFor(6800);await page.waitForTimeout(700);assert(await page.locator('#feedback-window').evaluate(el=>el.scrollLeft<3),'Último cartão não voltou ao primeiro');
  const rail=await page.locator('#feedback-window').boundingBox();await page.mouse.move(rail.x+270,rail.y+100);await page.mouse.down();await page.mouse.move(rail.x+130,rail.y+100,{steps:8});await page.mouse.up();await page.waitForFunction(()=>document.querySelector('#feedback-window').scrollLeft>30);assert(!(await page.locator('#feedback-dialog').evaluate(el=>el.open)));assert((await state(page)).paused);await page.mouse.move(2,2);await page.clock.runFor(3100);assert((await state(page)).active);
  await context.close();return{interval:3500,pause:true,resumeAfter:3000,wrap:true,realMouseDrag:true};
 });
 await test('05 Lightbox apenas com originais e carregamento sob demanda',async()=>{
  const{context,page}=await setup();const loaded=[];page.on('request',r=>{if(/\/assets\/feedbacks\/feedback-/.test(r.url()))loaded.push(r.url());});await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.__CEIA_DEBUG);assert.deepEqual(loaded,[]);
  await page.locator('.feedback-card').first().click();const seen=[];for(let i=0;i<5;i++){await page.locator('#feedback-full-image').evaluate(el=>el.decode());seen.push(await page.locator('#feedback-full-image').getAttribute('src'));await page.locator('#feedback-lightbox-next').click();}assert.equal(new Set(seen).size,5);assert.equal((await state(page)).galleryIndex,0);await page.keyboard.press('ArrowLeft');assert.equal((await state(page)).galleryIndex,4);await page.keyboard.press('Escape');assert(!(await page.locator('#feedback-dialog').evaluate(el=>el.open)));assert.equal(await page.locator('.feedback-card').count(),5);await context.close();return{initialFullRequests:0,uniqueFullImages:seen.length,keyboard:true};
 });
 await test('06 Reduced motion e conteúdo sem observador/JS',async()=>{
  const{context,page}=await setup({clock:true});await page.clock.runFor(11000);assert(!(await state(page)).active);assert.equal(await page.locator('#feedback-window').evaluate(el=>el.scrollLeft),0);await context.close();
  for(const mode of ['no-js','no-observer']){const c=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:mode!=='no-js'});if(mode==='no-observer')await c.addInitScript(()=>delete window.IntersectionObserver);const p=await c.newPage();await p.goto(base,{waitUntil:'networkidle'});assert.deepEqual(await p.locator('h1,h2,h3,.reveal,.faq-list details').evaluateAll(els=>els.filter(el=>el.getClientRects().length&&!el.closest('dialog')&&Number(getComputedStyle(el).opacity)!==1).map(el=>el.textContent)),[]);await c.close();}return{reducedMotion:true,withoutJS:true,withoutObserver:true};
 });
 await test('07 Pixel, checkout real com UTMs e bloqueio após clique',async()=>{
  const{context,page}=await setup({suppress:false,clock:true});const logs=[];page.on('console',m=>{if(m.text().startsWith('[Ceia Pixel]'))logs.push(m.text());});await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.__CEIA_DEBUG?.exit);assert(!(await page.locator('#exit-dialog').evaluate(el=>el.open)));
  await page.locator('.hero-copy>.button').click();await page.clock.runFor(1000);await page.waitForFunction(()=>__CEIA_DEBUG.getEvents().some(e=>e.event==='ViewContent'));
  await page.route('https://pay.cakto.com.br/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Destino do checkout em QA</title>'}));await page.locator('.plan-button').click();await page.waitForURL('https://pay.cakto.com.br/**');const checkout=new URL(page.url());assert.equal(checkout.searchParams.get('utm_source'),'teste');assert.equal(checkout.searchParams.get('fbclid'),'abc');assert(logs.some(t=>t.includes('PageView')));assert(logs.some(t=>t.includes('ViewContent')));assert(logs.some(t=>t.includes('InitiateCheckout')));
  await page.goto(base,{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.__CEIA_DEBUG?.exit);await page.clock.runFor(21000);await scrollFraction(page,.6);await page.evaluate(()=>document.dispatchEvent(new MouseEvent('mouseout',{clientY:-1,relatedTarget:null})));await page.evaluate(()=>window.scrollBy({top:-320,behavior:'instant'}));await page.clock.runFor(80);assert(!(await page.locator('#exit-dialog').evaluate(el=>el.open)));await context.close();return{checkout:checkout.href,logs,noPopupAfterCheckout:true};
 });
 await test('08 Pop-up desktop: gatilhos e uma vez por sessão',async()=>{
  const{context,page}=await setup({width:1366,height:768,suppress:false,clock:true});assert(!(await page.locator('#exit-dialog').evaluate(el=>el.open)));await page.clock.runFor(16000);assert(!(await page.locator('#exit-dialog').evaluate(el=>el.open)));await scrollFraction(page,.4);await page.evaluate(()=>document.dispatchEvent(new MouseEvent('mouseout',{clientY:-1,relatedTarget:null})));assert(await page.locator('#exit-dialog').evaluate(el=>el.open));await page.keyboard.press('Escape');await page.evaluate(()=>document.dispatchEvent(new MouseEvent('mouseout',{clientY:-1,relatedTarget:null})));assert(!(await page.locator('#exit-dialog').evaluate(el=>el.open)));assert.equal(await page.evaluate(()=>sessionStorage.getItem('ceia-exit-shown')),'1');await context.close();return{noInitialPopup:true,exitTrigger:true,once:true};
 });
 await test('09 Pop-up mobile e ajuste tipográfico dos dois painéis',async()=>{
  const report=[];
  for(const[width,height]of [[360,740],[390,844],[412,915],[430,932]]){
   const{context,page}=await setup({width,height});
   for(const variant of ['A','B']){
    await page.evaluate(variant=>{const d=document.querySelector('#exit-dialog');d.classList.toggle('variant-b',variant==='B');document.querySelector('#popup-benefits').hidden=variant==='B';document.querySelector('#popup-faq').hidden=variant!=='B';document.querySelector('#exit-title').textContent=variant==='B'?'Ficou alguma dúvida?':'Vai deixar a ceia para a véspera?';document.querySelector('#exit-text').textContent='Faltam 49 dias. Leve o plano pronto por R$ 19,99.';d.showModal();},variant);await visibleImages(page);await page.waitForTimeout(600);
    const typography=await shape(page);assert.deepEqual(typography.textCuts,[]);assert.deepEqual(typography.small,[]);assert.deepEqual(typography.touch,[]);const rect=await page.locator('#exit-dialog').boundingBox();assert(rect.x>=0&&rect.x+rect.width<=width);assert(rect.y>=0&&rect.y+rect.height<=height+1);await page.screenshot({path:path.join(out,`popup-${variant}-${width}.png`),animations:'disabled'});await page.keyboard.press('Escape');report.push({width,variant,rect,typography});
   }await context.close();
  }
  const{context,page}=await setup({suppress:false,clock:true,hasTouch:true});await page.clock.runFor(21000);await scrollFraction(page,.6);await page.clock.runFor(20);await page.evaluate(()=>window.scrollBy({top:-320,behavior:'instant'}));await page.clock.runFor(40);await page.waitForFunction(()=>document.querySelector('#exit-dialog').open);await page.keyboard.press('Escape');await page.evaluate(()=>window.scrollBy({top:-320,behavior:'instant'}));await page.clock.runFor(40);assert(!(await page.locator('#exit-dialog').evaluate(el=>el.open)));await context.close();return{report,mobileTrigger:true,once:true};
 });
 await test('10 Datas do relógio e auditoria dos links legais',async()=>{
  const{context,page}=await setup();const dates=[['2026-11-03T14:41:00-03:00','planning'],['2026-12-23T14:41:00-03:00','eve'],['2026-12-24T10:00:00-03:00','today'],['2026-12-24T21:00:00-03:00','reveillon'],['2027-01-02T10:00:00-03:00','ended']];
  for(const[date,phase]of dates){await page.goto(base+'/?agora='+encodeURIComponent(date),{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.__CEIA_DEBUG);assert.equal(await page.evaluate(()=>__CEIA_DEBUG.getState().phase),phase);}
  const legal=await page.evaluate(()=>({privacy:CEIA_CONFIG.PRIVACIDADE_URL,terms:CEIA_CONFIG.TERMOS_URL,cookies:document.querySelector('#cookie-settings').getAttribute('href'),businessHidden:document.querySelector('#business-details').hidden}));assert(legal.businessHidden);const pending=[];for(const[k,url]of Object.entries({Privacidade:legal.privacy,Termos:legal.terms,Cookies:legal.cookies})){if(!url){pending.push(k);continue;}const response=await page.request.get(new URL(url,base).href);assert.equal(response.status(),200);}await context.close();return{dates:5,legal,pending,note:'URLs vazias não são tratadas como páginas HTTP 200; nenhum texto jurídico foi criado.'};
 });
 console.log(JSON.stringify({passed:true,groups:results.length}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
