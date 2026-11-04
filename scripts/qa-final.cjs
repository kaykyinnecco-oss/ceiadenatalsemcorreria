const {chromium}=require('./runtime.cjs').dependency('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'prints/ajustes-finais');fs.mkdirSync(out,{recursive:true});
const base=process.env.CEIA_QA_URL||'http://127.0.0.1:8765';
const sizes=[[360,740],[390,844],[412,915],[768,1024],[1366,768],[1440,900],[360,600],[1366,600]];

// Every composed mockup is checked against EVERY clipping ancestor, on each axis.
// A deliberately peeking carousel neighbour is not treated as a full slide.
async function auditCuts(page){return page.evaluate(()=>{
 const selector='.hero-scene .device,.hero-scene .paper,.hero-scene .book,.hero-scene .floating,.solution-preview .paper,.inside-document,.bonus-book,.offer-book,.offer-bonus-covers img,.benefit-visual img,.verification-badge,.guarantee-seal,.popup-tablet,.popup-book';
 const cuts=[],checked=[];const dialog=document.querySelector('dialog[open]');
 for(const el of document.querySelectorAll(selector)){
  if(!el.getClientRects().length||el.closest('dialog:not([open])')||(dialog&&!dialog.contains(el)))continue;
  const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;checked.push(el.className.baseVal||el.className||el.tagName);
  for(let a=el.parentElement;a;a=a.parentElement){const s=getComputedStyle(a),b=a.getBoundingClientRect();
   const x=s.overflowX!=='visible',y=s.overflowY!=='visible';
   if((x&&(r.left<b.left-1||r.right>b.right+1))||(y&&(r.top<b.top-1||r.bottom>b.bottom+1)))cuts.push({element:el.outerHTML.slice(0,150),ancestor:a.className,x,y,rect:r.toJSON(),clip:b.toJSON()});
  }
 }
 return{checked:checked.length,cuts};
});}
async function images(page){await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.getClientRects().length&&!i.closest('dialog:not([open])')).map(i=>{i.loading='eager';return i.decode()}))});}
async function screenshot(page,sel,file){const el=page.locator(sel);await el.scrollIntoViewIfNeeded();await page.waitForTimeout(80);await el.screenshot({path:path.join(out,file),animations:'disabled',style:'.calendar-bar,.reading-progress,.skip-link{visibility:hidden!important}'});}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CEIA_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});const report=[];
 try{
 for(const[width,height]of sizes){const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});await context.addInitScript(()=>{
  sessionStorage.setItem('ceia-exit-shown','1');window.__shifts=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)__shifts.push(e.value)})).observe({type:'layout-shift',buffered:true});
 });const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.__CEIA_DEBUG);await images(page);await page.screenshot({path:path.join(out,`hero-cookies-${width}x${height}.png`)});
 const initial=await page.evaluate(()=>{const b=document.querySelector('#cookie-banner').getBoundingClientRect(),c=document.querySelector('.hero-copy>.button').getBoundingClientRect();return{bannerHeight:b.height,overlap:b.left<c.right&&b.right>c.left&&b.top<c.bottom&&b.bottom>c.top,initialCLS:__shifts.reduce((a,b)=>a+b,0)}});
 await page.locator('.price').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 initial.priceOverlap=await page.evaluate(()=>{const b=document.querySelector('#cookie-banner').getBoundingClientRect(),p=document.querySelector('.price').getBoundingClientRect();return b.top<p.bottom&&b.bottom>p.top});
 await page.locator('#cookie-essential').click();
 await screenshot(page,'.offer-card',`plano-${width}x${height}.png`);await screenshot(page,'.guarantee',`garantia-${width}x${height}.png`);await screenshot(page,'.footer',`rodape-${width}x${height}.png`);
 await screenshot(page,'#inside-panel',`cardapios-${width}x${height}.png`);
 for(const key of ['cardapios','quantidades','cronograma','compras','orcamento']){await page.locator('#tab-'+key).click();await page.waitForFunction(()=>{const i=document.querySelector('#inside-image');return i.complete&&i.naturalWidth>0});}
 const metrics=await page.evaluate(()=>{const box=s=>document.querySelector(s).getBoundingClientRect().toJSON();return{width:innerWidth,scrollWidth:document.documentElement.scrollWidth,card:box('.offer-card'),rows:document.querySelectorAll('.benefit-item').length,broken:[...document.images].filter(i=>i.getClientRects().length&&!i.closest('dialog:not([open])')&&!i.naturalWidth).map(i=>i.src),brands:[...document.querySelectorAll('.payments-row')].map(row=>[...row.children].filter(e=>!e.hidden).map(el=>({y:el.getBoundingClientRect().y,h:el.getBoundingClientRect().height}))),slides:document.querySelectorAll('.feedback-item').length,feedbackHidden:document.querySelector('#depoimentos').hidden,businessHidden:document.querySelector('#business-details').hidden,cls:__shifts.reduce((a,b)=>a+b,0)}});
 const cuts=await auditCuts(page);const popup=[];
 for(const variant of ['A','B']){await page.evaluate(v=>{const d=document.querySelector('#exit-dialog');d.classList.toggle('variant-b',v==='B');document.querySelector('#popup-benefits').hidden=v==='B';document.querySelector('#popup-faq').hidden=v!=='B';document.querySelector('#exit-title').textContent=v==='B'?'Ficou alguma dúvida?':'Vai deixar a ceia para a véspera?';document.querySelector('#exit-text').textContent='Faltam 50 dias. Leve o plano pronto por R$ 19,99.';d.showModal()},variant);await images(page);const m=await page.locator('#exit-dialog').evaluate(e=>({height:e.getBoundingClientRect().height,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight}));const a=await auditCuts(page);popup.push({variant,...m,...a});await page.screenshot({path:path.join(out,`popup-${variant}-${width}x${height}.png`)});await page.evaluate(()=>document.querySelector('#exit-dialog').close());}
 report.push({viewport:[width,height],...initial,...metrics,...cuts,popup,errors});console.log(JSON.stringify(report.at(-1)));
 await context.close();}
 // Seal at three physical sizes, including the automatic small-size arc suppression.
 {const c=await browser.newContext({viewport:{width:600,height:300},reducedMotion:'reduce'}),p=await c.newPage();await p.goto(base,{waitUntil:'networkidle'});await p.evaluate(()=>{const s=document.querySelector('.guarantee-seal:not(.mini)').outerHTML;document.body.innerHTML='<div id="seal-sizes" style="display:flex;align-items:center;gap:36px;padding:24px">'+[160,96,44].map(n=>`<div>${s.replace('class="guarantee-seal "',`class="guarantee-seal" style="width:${n}px;height:${n}px"`)}<p style="text-align:center">${n} px</p></div>`).join('')+'</div>'});await p.screenshot({path:path.join(out,'selos-160-96-44.png')});await c.close();}
 // Privacy rule wins over the request to publish all attachments.
 const files=fs.existsSync(path.join(root,'depoimentos'))?fs.readdirSync(path.join(root,'depoimentos')).filter(n=>/\.webp$/i.test(n)):[];
 for(const r of report){assert.equal(r.width,r.scrollWidth);assert.equal(r.rows,6);assert.deepEqual(r.broken,[]);assert.deepEqual(r.errors,[]);assert.deepEqual(r.cuts,[]);assert.equal(r.slides,files.length);assert(r.feedbackHidden);assert(!r.overlap);assert(!r.priceOverlap);assert(r.bannerHeight<= (r.width>=768?48:76));if(r.width>=1024)assert(r.card.height<=640);if(r.width===390)assert(r.card.height<=1250);for(const brands of r.brands){assert.equal(brands.length,4);assert(brands.every(b=>Math.abs(b.y-brands[0].y)<1));}for(const p of r.popup){assert.deepEqual(p.cuts,[]);assert(p.scrollHeight<=p.clientHeight+1);assert(p.height<=Math.min(r.viewport[1]*.9,620)+1);}}
 fs.writeFileSync(path.join(out,'layout.json'),JSON.stringify({passed:true,files,report},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
module.exports={auditCuts};
