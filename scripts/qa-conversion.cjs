const { chromium } = require('./runtime.cjs').dependency('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const prints = path.join(root, 'prints/revisao');
const results = [];
let browser;
async function test(name, run) {
  try { const detail = await run(); results.push({ name, passed: true, detail }); console.log('PASS', name); }
  catch (error) { results.push({ name, passed: false, error: error.stack }); console.log('FAIL', name, error.message); }
}
async function setup(width = 390, height = 844, configTransform) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', hasTouch: width < 768 });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.clock.install({ time: new Date('2026-11-03T17:41:00Z') });
  await context.addInitScript(() => localStorage.setItem('ceia-cookie-choice', 'accepted'));
  if (configTransform) await page.route('**/config.js', route => route.fulfill({ contentType: 'application/javascript', body: configTransform(fs.readFileSync(path.join(root, 'config.js'), 'utf8')) }));
  await page.goto('http://localhost:8765/?agora=2026-11-03T14%3A41%3A00-03%3A00', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__CEIA_DEBUG?.exit);
  return { context, page, errors };
}
async function atPlan(page) {
  await page.locator('.offer-copy').scrollIntoViewIfNeeded();
  await page.clock.runFor(100);
  await page.waitForFunction(() => __CEIA_DEBUG.exit().planVisible);
}
async function mouseOut(page) { await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseout', { clientY: -1, relatedTarget: null }))); }
(async () => {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CEIA_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  await test('Quantidades: 4–12, origem dos cálculos e mensagem para 13+', async () => {
    const { context, page, errors } = await setup();
    await page.locator('#tab-quantidades').click();
    assert.deepEqual(await page.locator('#people option').evaluateAll(ns => ns.map(n => n.value)), ['4','5','6','7','8','9','10','11','12','13']);
    for (const n of [5,7,9,11]) {
      await page.locator('#people').selectOption(String(n));
      assert.equal(await page.locator('#quantity-origin').textContent(), 'CÁLCULO PROPORCIONAL');
      assert.equal(await page.locator('#q-rice').textContent(), n * 60 + ' g');
    }
    await page.locator('#people').selectOption('13');
    assert(await page.locator('#quantity-more').isVisible());
    assert(!(await page.locator('.quantity-table').isVisible()));
    assert.equal(await page.locator('#quantity-more').textContent(), 'Multiplique a quantidade por pessoa. Forno, panelas e temperos pedem ajuste.');
    await page.screenshot({ path: path.join(prints, 'quantidades-13-ou-mais.png') });
    await page.locator('#people').selectOption('12'); assert(await page.locator('.quantity-table').isVisible());
    assert.deepEqual(errors, []); await context.close(); return { proportional: [5,7,9,11], above12: 'message only' };
  });
  for (const [width,height] of [[360,740],[390,844],[1280,800]]) {
    await test(`Pop-up B ${width}: 12 s no plano, FAQ, foco e fechar`, async () => {
      const { context, page, errors } = await setup(width,height);
      await atPlan(page); await page.clock.runFor(11000);
      assert(!(await page.locator('#exit-dialog').evaluate(e => e.open)));
      await page.clock.runFor(1100);
      assert(await page.locator('#exit-dialog').evaluate(e => e.open));
      assert.equal(await page.locator('#exit-title').textContent(), 'Ficou alguma dúvida?');
      assert.equal(await page.locator('#exit-dialog').getAttribute('data-variant'), 'B');
      for (const item of await page.locator('#popup-faq details').all()) {
        await item.locator('summary').click(); assert(await item.evaluate(e => e.open));
      }
      for (let n=0;n<12;n++) { await page.keyboard.press('Tab'); assert(await page.evaluate(() => !!document.activeElement.closest('#exit-dialog'))); }
      const rect = await page.locator('#exit-dialog').boundingBox(); if (width<768) assert(rect.height <= height * .85 + 1);
      await page.screenshot({ path: path.join(prints, `pop-up-b-${width}.png`) });
      await page.locator('#exit-dismiss').click(); assert(!(await page.locator('#exit-dialog').evaluate(e => e.open)));
      await page.clock.runFor(15000); assert(!(await page.locator('#exit-dialog').evaluate(e => e.open)));
      assert.deepEqual(errors, []); await context.close(); return { delay:12000, trappedFocus:true, sheetHeight:rect.height };
    });
  }
  await test('Pop-up: não abre no fim nem depois de clicar no checkout', async () => {
    for (const checkoutClick of [false,true]) {
      const { context, page } = await setup(1280,800);
      if (checkoutClick) {
        await page.locator('.plan-button').evaluate(a => { a.addEventListener('click', e => e.preventDefault()); a.click(); });
        await atPlan(page);
      } else { await page.locator('.footer').scrollIntoViewIfNeeded(); }
      await page.clock.runFor(30000); await mouseOut(page);
      assert(!(await page.locator('#exit-dialog').evaluate(e => e.open)));
      await context.close();
    }
    return { footerSuppressed:true, checkoutSuppressed:true };
  });
  await test('Mobile: fecha deslizando o handle e respeita uma vez por sessão', async () => {
    const { context, page } = await setup(); await atPlan(page); await page.clock.runFor(12100);
    const box = await page.locator('.drag-handle').boundingBox();
    await page.mouse.move(box.x + box.width/2, box.y + 2); await page.mouse.down();
    await page.mouse.move(box.x + box.width/2, box.y + 100, { steps:8 }); await page.mouse.up();
    assert(!(await page.locator('#exit-dialog').evaluate(e => e.open)));
    await page.reload({waitUntil:'networkidle'}); await page.waitForFunction(() => !!__CEIA_DEBUG.exit);
    await atPlan(page); await page.clock.runFor(13000); assert(!(await page.locator('#exit-dialog').evaluate(e=>e.open)));
    await context.close(); return {dragToClose:true,sessionPersisted:true};
  });
  await test('Poucos feedbacks: sem setas; desktop com três mantém setas visíveis', async () => {
    for (const count of [1,2,3]) {
      const {context,page} = await setup(1280,800,source => source.replace(/TESTIMONIALS:\s*\[[^\]]*\]/, `TESTIMONIALS: ${JSON.stringify(['./depoimentos/conversa-ceia.webp','./depoimentos/roberto.webp','./depoimentos/mariana.webp'].slice(0,count))}`));
      assert.equal(await page.locator('.feedback-item').count(), count);
      assert.equal(await page.locator('.carousel-controls').isVisible(), count >= 3);
      await context.close();
    }
    return {tested:[1,2,3]};
  });
  await test('Novo pixel: init correto, PageView, ViewContent e checkout sem envio real', async () => {
    const context = await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const page = await context.newPage();
    await page.route('**/config.js',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(root,'config.js'),'utf8').replace('ENABLE_PIXEL_IN_PREVIEW: false','ENABLE_PIXEL_IN_PREVIEW: true')}));
    await page.route('https://connect.facebook.net/**',route=>route.fulfill({contentType:'application/javascript',body:'/* QA intercepts Meta: no real events sent. */'}));
    await page.goto('http://localhost:8765/?utm_source=meta&fbclid=qa123',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>!!window.__CEIA_DEBUG);
    if(await page.locator('#cookie-accept').isVisible()) await page.locator('#cookie-accept').click();
    await page.locator('#plano').scrollIntoViewIfNeeded(); await page.waitForTimeout(150);
    await page.locator('.plan-button').evaluate(a=>{a.addEventListener('click',e=>e.preventDefault());a.click();});
    const queue=await page.evaluate(()=>fbq.queue.map(a=>Array.from(a)));
    assert(queue.some(x=>x[0]==='init'&&x[1]==='902695826167879'));
    for(const name of ['PageView','ViewContent','InitiateCheckout']) assert(queue.some(x=>x[0]==='track'&&x[1]===name));
    assert(!JSON.stringify(queue).includes('2429955871112248'));
    await context.close(); return {pixel:'902695826167879',events:['PageView','ViewContent','InitiateCheckout'],realEventsSent:false};
  });
  await browser.close();
  const report={passed:results.every(r=>r.passed),tests:results};
  fs.writeFileSync(path.join(root,'tests/reports/conversion.json'),JSON.stringify(report,null,2));
  if(!report.passed) process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;browser?.close()});
