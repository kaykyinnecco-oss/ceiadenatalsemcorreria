const {chromium}=require('./runtime.cjs').dependency('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(__dirname,'../prints/marquee'),base=process.env.CEIA_QA_URL||'https://ceiadenatalsemcorreria.vercel.app/';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CEIA_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),report=[];
try{for(const width of [360,390,1440]){
 const c=await browser.newContext({viewport:{width,height:width<768?844:900},reducedMotion:'no-preference'});
 await c.addInitScript(()=>{localStorage.setItem('ceia-cookie-choice','essential');sessionStorage.setItem('ceia-exit-shown','1');window.__qaPixel=[];window.fbq=(...args)=>__qaPixel.push(args);});
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));const response=await p.goto(base,{waitUntil:'networkidle'});assert.equal(response.status(),200);
 await p.waitForFunction(()=>document.querySelectorAll('#depoimentos [data-unique="true"]').length===5);
 const before=await p.locator('#time-cards').textContent();await p.waitForTimeout(2100);const after=await p.locator('#time-cards').textContent();assert.notEqual(before,after);
 await p.locator('#bar-button').click();assert.equal(await p.evaluate(()=>location.hash),'#plano');
 const order=await p.evaluate(()=>({feedbackAfterPlan:document.querySelector('#plano').nextElementSibling.id==='depoimentos',faqAfterFeedback:document.querySelector('#depoimentos').nextElementSibling.matches('.faq')}));assert(order.feedbackAfterPlan&&order.faqAfterFeedback);
 for(const target of ['#plano','.guarantee']){await p.locator(target).scrollIntoViewIfNeeded();await p.locator(target).evaluate(async e=>{await Promise.all([...e.querySelectorAll('img')].map(i=>{i.loading='eager';return i.decode()}))});}
 const details=await p.evaluate(()=>({brands:[...document.querySelectorAll('.payments-row')].map(e=>[...e.children].filter(t=>!t.hidden).map(t=>({brand:t.dataset.paymentBrand,height:t.getBoundingClientRect().height,top:t.getBoundingClientRect().top,loaded:t.querySelector('img').naturalWidth>0}))),seals:[...document.querySelectorAll('.guarantee-seal')].filter(e=>!e.closest('dialog')).every(e=>[...e.querySelectorAll('img')].some(i=>i.getClientRects().length&&i.naturalWidth>0)),overflow:document.documentElement.scrollWidth>innerWidth}));
 assert(!details.overflow);assert(details.seals);for(const row of details.brands){assert.equal(row.length,4);assert(row.every(t=>t.loaded&&Math.abs(t.top-row[0].top)<1));}
 await p.locator('#depoimentos').scrollIntoViewIfNeeded();await p.mouse.move(0,0);await p.locator('#depoimentos').evaluate(async e=>{await Promise.all([...e.querySelectorAll('img')].map(i=>{i.loading='eager';return i.decode()}))});
 const phase=await p.locator('#feedback-belt').evaluate(e=>e.getAnimations()[0]?.currentTime);await p.waitForTimeout(300);const phaseAfter=await p.locator('#feedback-belt').evaluate(e=>e.getAnimations()[0]?.currentTime);assert(phaseAfter>phase);
 await p.locator('#depoimentos').screenshot({path:path.join(out,`producao-feedbacks-${width}.png`),animations:'disabled',style:'.calendar-bar,.reading-progress,.skip-link{visibility:hidden!important}'});
 await p.locator('[data-unique="true"]').first().evaluate(e=>e.click());
 for(let i=0;i<5;i++){await p.locator('#feedback-full-image').evaluate(i=>i.decode());assert.equal(await p.locator('#feedback-full-image').evaluate(i=>i.naturalWidth),900);await p.locator('#feedback-lightbox-next').click();}
 await p.keyboard.press('Escape');assert(!(await p.locator('#feedback-dialog').evaluate(d=>d.open)));
 await p.locator('.feedback-cta').evaluate(el=>{el.addEventListener('click',e=>e.preventDefault());el.click()});
 const events=await p.evaluate(()=>__qaPixel.filter(e=>e[0]==='track').map(e=>e[1]));assert(events.includes('PageView')&&events.includes('ViewContent')&&events.includes('InitiateCheckout'));assert.deepEqual(errors,[]);
 report.push({width,url:p.url(),status:response.status(),...order,unique:5,clockTick:true,marqueeMoves:true,allFiveFullImages900:true,pixelInterceptedForQA:true,events,...details,errors});await c.close();}
fs.writeFileSync(path.join(out,'producao.json'),JSON.stringify({passed:true,base,report},null,2));console.log(JSON.stringify(report));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
