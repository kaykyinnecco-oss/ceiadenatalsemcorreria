const {chromium}=require('./runtime.cjs').dependency('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'prints/ajustes-finais'),base=process.env.CEIA_QA_URL||'http://127.0.0.1:8765';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),report=[];
try{
for(const mode of ['notice','optin']){const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await c.newPage();
 if(mode==='optin')await p.route('**/config.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(root,'config.js'),'utf8').replace("CONSENT_MODE: 'notice'","CONSENT_MODE: 'optin'")}));
 await p.goto(base,{waitUntil:'networkidle'});await p.waitForFunction(()=>!!window.__CEIA_DEBUG);await p.locator('#cookie-essential').click();
 await p.locator('#plano').scrollIntoViewIfNeeded();await p.waitForTimeout(120);await p.locator('.plan-button').evaluate(el=>{el.addEventListener('click',e=>e.preventDefault());el.click()});
 let events=await p.evaluate(()=>__CEIA_DEBUG.getEvents().map(e=>e.event));
 if(mode==='notice')assert.deepEqual(events,['PageView','ViewContent','InitiateCheckout']);else{assert.deepEqual(events,[]);await p.locator('#cookie-settings').evaluate(e=>e.click());await p.locator('#cookie-accept').click();events=await p.evaluate(()=>__CEIA_DEBUG.getEvents().map(e=>e.event));assert.deepEqual(events,['PageView','ViewContent','InitiateCheckout']);}
 report.push({mode,events,passed:true});await c.close();}
// Local layout fixture, not a customer quote, never copied into /depoimentos.
for(const width of [390,1366]){const c=await browser.newContext({viewport:{width,height:844},reducedMotion:'no-preference'}),p=await c.newPage();
 await p.clock.install({time:new Date('2026-11-04T12:00:00Z')});
 await p.route('**/config.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(root,'config.js'),'utf8').replace('SHOW_TESTIMONIALS: false','SHOW_TESTIMONIALS: true').replace('TESTIMONIALS: []',"TESTIMONIALS: ['./depoimentos/qa-1.svg','./depoimentos/qa-2.svg','./depoimentos/qa-3.svg','./depoimentos/qa-4.svg','./depoimentos/qa-5.svg']")}));
 await p.route('**/depoimentos/qa-*.svg',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="887" height="1774"><rect width="887" height="1774" fill="#eee4cb"/><text x="70" y="200" fill="#183d32" font-size="64">TESTE DE LAYOUT</text><text x="70" y="300" font-size="36">Fixture local de QA</text></svg>'}));
 await p.goto(base,{waitUntil:'networkidle'});await p.waitForFunction(()=>!!window.__CEIA_DEBUG);await p.locator('#cookie-essential').click();await p.locator('#depoimentos').scrollIntoViewIfNeeded();
 assert.equal(await p.locator('.feedback-item').count(),5);await p.clock.runFor(5200);assert.equal((await p.evaluate(()=>__CEIA_DEBUG.carousel())).slide,1);
 await p.locator('#feedback-track').dispatchEvent('pointerdown');const before=await p.evaluate(()=>__CEIA_DEBUG.carousel());await p.clock.runFor(5200);assert.equal((await p.evaluate(()=>__CEIA_DEBUG.carousel())).slide,before.slide);assert((await p.evaluate(()=>__CEIA_DEBUG.carousel())).paused);
 await p.locator('#feedback-prev').evaluate(el=>el.click());await p.clock.runFor(800);await p.waitForTimeout(1200);
 const fit=await p.evaluate(()=>{const b=document.querySelector('#feedback-track').getBoundingClientRect();return[...document.querySelectorAll('.feedback-item')].map(el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right,full:r.left>=b.left-1&&r.right<=b.right+1,peek:r.left<b.right&&r.right>b.right}})});
 console.log('carousel-fit',width,JSON.stringify(fit));assert.equal(fit.filter(e=>e.full).length,width>=768?3:1);if(width<768)assert(fit.some(e=>e.peek));assert.equal(await p.locator('.feedback-phrase').count(),0);
 await p.locator('.ampliar').first().click();assert(await p.locator('#preview-dialog').evaluate(e=>e.open));await p.keyboard.press('Escape');assert(!(await p.locator('#preview-dialog').evaluate(e=>e.open)));
 await p.locator('#depoimentos').screenshot({path:path.join(out,`feedbacks-FIXTURE-NAO-PUBLICADA-${width}.png`),style:'.calendar-bar,.reading-progress{visibility:hidden!important}',animations:'disabled'});
 report.push({fixtureOnly:true,width,slides:5,visible:fit.filter(e=>e.full).length,autoAdvance:true,pause:true,lightbox:true});await c.close();}
fs.writeFileSync(path.join(out,'interactions.json'),JSON.stringify({passed:true,report},null,2));console.log(JSON.stringify(report));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
