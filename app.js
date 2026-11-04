/* Site estático: sem imports, sem dependências e com caminhos relativos. */
(() => {
  'use strict';
  const C = window.CEIA_CONFIG;
  window.ceiaClock = window.CeiaCalendar.mountClock(C);
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => [...root.querySelectorAll(q)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preview = CeiaCalendar.isPreviewHost(location.hostname);
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const store = { get(type, key) { try { return window[type].getItem(key); } catch { return null; } }, set(type, key, value) { try { window[type].setItem(key, value); } catch { /* Navegação privada. */ } } };
  const relativePage = page => `./assets/pages/${page}.webp`;
  const croppedPages = { 'kit-09':550, 'kit-10':435, 'kit-12':550, 'kit-15':550, 'kit-19':680, 'kit-21':650, 'kit-28':650 };
  $$('[data-payment-brand]').forEach(tile => { tile.hidden = !(C.PAYMENT_BRANDS || ['pix']).includes(tile.dataset.paymentBrand); });
  const events = [];
  let consent = store.get('localStorage', 'ceia-cookie-choice');
  let pixelReady = false;
  let viewContentSent = false;
  const pixelID = String(C.PIXEL_META || '').trim();
  const checkout = new URL(C.CHECKOUT, location.href);
  new URLSearchParams(location.search).forEach((value, key) => { if (/^utm_/i.test(key) || key === 'fbclid') checkout.searchParams.set(key, value); });
  $$('.checkout').forEach(a => a.href = checkout.href);
  $$('[data-price]').forEach(el => el.textContent = money.format(C.PRECO).replace('R$', '').trim());
  $$('[data-support]').forEach(el => { el.href = `mailto:${C.SUPORTE}`; el.textContent = C.SUPORTE; });
  if (C.RAZAO_SOCIAL || C.CNPJ) { $('#business-details').hidden = false; $('#business-details').textContent = [C.RAZAO_SOCIAL, C.CNPJ && `CNPJ ${C.CNPJ}`].filter(Boolean).join(' · '); }

  function bootPixel() {
    if (pixelReady || !pixelID) return;
    pixelReady = true;
    if (preview && !C.ENABLE_PIXEL_IN_PREVIEW) return;
    if (!window.fbq) {
      const fbq = window.fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      window._fbq = fbq; fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
      const script = document.createElement('script'); script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.appendChild(script);
    }
    window.fbq('init', pixelID);
  }
  function track(name, data = {}) {
    if (!pixelID) return;
    // PageView ocorre ao carregar, independentemente do banner/aceite.
    // Uma recusa explícita interrompe os eventos posteriores.
    if (name !== 'PageView' && consent === 'essential') return;
    bootPixel(); events.push({ event: name, data });
    if (preview) console.log('[Ceia Pixel]', name, data);
    if (!preview || C.ENABLE_PIXEL_IN_PREVIEW) window.fbq?.('track', name, data);
  }
  if (!pixelID) console.warn('[Ceia Pixel] ID em branco: nenhum evento será disparado.');
  else requestAnimationFrame(() => requestAnimationFrame(() => track('PageView')));
  $$('.checkout').forEach(a => a.addEventListener('click', () => {
    store.set('sessionStorage', 'ceia-checkout-clicked', '1');
    track('InitiateCheckout', { content_name: 'Ceia de Natal Sem Correria · Kit completo', value: C.PRECO, currency: 'BRL', num_items: 1 });
  }));

  // O primeiro frame entrega o hero e o relógio; as interações entram em seguida.
  // Checkout e PageView já estão ativos acima.
  function initializeUI() {
  let focusBeforeDialog;
  function openDialog(dialog) { if (document.querySelector('dialog[open]')) return; focusBeforeDialog = document.activeElement; dialog.showModal(); document.body.classList.add('dialog-open'); $('.dialog-close', dialog).focus({ preventScroll: true }); }
  function closeDialog(dialog) { dialog.close(); document.body.classList.remove('dialog-open'); focusBeforeDialog?.focus({ preventScroll: true }); }
  function openPreview(src, title) { $('#preview-image').src = src; $('#preview-image').alt = title; $('#preview-title').textContent = title; openDialog($('#preview-dialog')); }
  $$('dialog').forEach(dialog => {
    $('.dialog-close', dialog).addEventListener('click', () => closeDialog(dialog));
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = $$('a[href], button:not([disabled]), summary, input, select, [tabindex="0"]', dialog).filter(el => el.getClientRects().length);
      const index = controls.indexOf(document.activeElement);
      if (index < 0 || (event.shiftKey && index === 0) || (!event.shiftKey && index === controls.length - 1)) {
        event.preventDefault(); controls[event.shiftKey ? controls.length - 1 : 0]?.focus();
      }
    });
    dialog.addEventListener('click', event => { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(dialog); });
    dialog.addEventListener('cancel', () => { document.body.classList.remove('dialog-open'); focusBeforeDialog?.focus({ preventScroll: true }); });
  });
  $$('.open-preview').forEach(button => button.addEventListener('click', () => openPreview(relativePage(button.dataset.page), button.dataset.title)));

  function animateSwitch(node) { if (reduced) return; node.classList.remove('switch-enter'); requestAnimationFrame(() => node.classList.add('switch-enter')); }
  const tabs = {
    cardapios: { phrase: '3 ceias prontas. Escolha uma.', page: 'kit-09', floating: '3 cardápios' },
    quantidades: { phrase: 'Escolha os convidados e veja a conta.', page: 'kit-19', floating: '4 pessoas ou mais' },
    cronograma: { phrase: 'A ordem do forno, sem improviso.', page: 'kit-10', floating: 'Plano do dia 24' },
    compras: { phrase: 'Leve pronta ao mercado.', page: 'kit-22', floating: 'Lista pronta' },
    orcamento: { phrase: 'Quanto gastar. Quem faz o quê.', page: 'kit-28', floating: 'Tarefas divididas' },
  };
  let activeTab = 'cardapios';
  function showPage(page, title) {
    $('#inside-image').width = croppedPages[page] ? 640 : 720;
    $('#inside-image').height = croppedPages[page] || 1019;
    $('#inside-image').src = croppedPages[page] ? `./assets/previews/${page}.webp` : relativePage(page); $('#inside-image').alt = `Página real: ${title}`;
    $('#inside-enlarge').dataset.page = page; $('#inside-enlarge').dataset.title = title;
    animateSwitch($('#inside-image'));
  }
  function showTab(key) {
    const data = tabs[key]; if (!data) return;
    activeTab = key;
    $$('#inside-tabs button').forEach(button => { const selected = button.dataset.tab === key; button.setAttribute('aria-selected', selected); button.tabIndex = selected ? 0 : -1; if (selected) button.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'instant' : 'smooth' }); });
    $('#inside-panel').setAttribute('aria-labelledby', `tab-${key}`);
    $('#inside-number').textContent = String(Object.keys(tabs).indexOf(key) + 1).padStart(2, '0');
    $('#inside-phrase').textContent = data.phrase; $('#inside-float').textContent = data.floating;
    $('#menu-choices').hidden = key !== 'cardapios'; $('#quantity-demo').hidden = key !== 'quantidades';
    if (key === 'cardapios') $$('#menu-choices button').forEach(b => b.setAttribute('aria-pressed', b.dataset.menu === 'tradicional'));
    showPage(data.page, data.phrase);
  }
  $$('#inside-tabs button').forEach(button => button.addEventListener('click', () => showTab(button.dataset.tab)));
  $('#inside-tabs').addEventListener('keydown', event => {
    const buttons = $$('#inside-tabs button'); const index = buttons.indexOf(document.activeElement); let next;
    if (index < 0) return;
    if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
    if (event.key === 'Home') next = 0; if (event.key === 'End') next = buttons.length - 1;
    if (next !== undefined) { event.preventDefault(); buttons[next].focus(); showTab(buttons[next].dataset.tab); }
  });
  const menus = { tradicional: 'kit-09', economico: 'kit-12', pratico: 'kit-15' };
  $$('#menu-choices button').forEach(button => button.addEventListener('click', () => { $$('#menu-choices button').forEach(b => b.setAttribute('aria-pressed', b === button)); showPage(menus[button.dataset.menu], `Cardápio ${button.textContent}`); }));
  const quantities = { 4: ['1,4 kg', '240 g', '360 g'], 6: ['2,1 kg', '360 g', '540 g'], 8: ['2,8 kg', '480 g', '720 g'], 10: ['3,5 kg', '600 g', '900 g'], 12: ['4,2 kg', '720 g', '1.080 g'] };
  $('#people').addEventListener('change', event => {
    const n = Number(event.target.value), more = n >= 13;
    $('.quantity-table').hidden = more; $('#quantity-more').hidden = !more;
    $('#quantity-origin').textContent = more ? 'GRUPOS MAIORES' : quantities[n] ? 'TABELA DO KIT' : 'CÁLCULO PROPORCIONAL';
    if (more) return;
    const values = quantities[n] || [
      (n * .35).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' kg',
      (n * 60).toLocaleString('pt-BR') + ' g',
      (n * 90).toLocaleString('pt-BR') + ' g'
    ];
    ['#q-chicken', '#q-rice', '#q-veg'].forEach((selector, i) => $(selector).textContent = values[i]);
    animateSwitch($('.quantity-table'));
  });
  if (C.ENTREGA_CONFIRMADA) $$('.faq-answer p')[3].textContent = C.ENTREGA_CONFIRMADA;
  if (C.ORIENTACAO_13_CONFIRMADA) $$('.faq-answer p')[0].textContent = 'Sim. A tabela cobre 4 a 12 pessoas; para mais, multiplique. Forno e panelas pedem ajuste.';
  // Deslizar o mockup também navega pelas abas; não depende de hover.
  let tabTouchX;
  $('#inside-panel').addEventListener('touchstart', e => { tabTouchX = e.touches[0].clientX; }, { passive: true });
  $('#inside-panel').addEventListener('touchend', e => { if (tabTouchX === undefined || e.target.closest('select,button')) return; const dx = e.changedTouches[0].clientX - tabTouchX; if (Math.abs(dx) > 65) { const keys = Object.keys(tabs); const next = (keys.indexOf(activeTab) + (dx < 0 ? 1 : -1) + keys.length) % keys.length; showTab(keys[next]); } tabTouchX = undefined; }, { passive: true });

  // Cada print fornecido aparece uma vez, sem duplicar relatos.
  const trackEl = $('#feedback-track');
  let slide = 0, carouselTimer = null, carouselPaused = false;
  const feedbacks = C.SHOW_TESTIMONIALS ? (C.TESTIMONIALS || []) : [];
  let loadedFeedbacks = 0;
  function moveCarousel(direction) {
    if (feedbacks.length < 2) return;
    slide = (slide + direction + feedbacks.length) % feedbacks.length;
    const item = trackEl.children[slide];
    trackEl.scrollTo({ left: item.offsetLeft - trackEl.offsetLeft, behavior: reduced ? 'instant' : 'smooth' });
  }
  function pauseCarousel() { carouselPaused = true; clearInterval(carouselTimer); carouselTimer = null; }
  function startCarousel() { if (reduced || carouselPaused || document.hidden || feedbacks.length < 2 || carouselTimer) return; carouselTimer = setInterval(() => moveCarousel(1), 5000); }
  if (feedbacks.length) {
    $('#depoimentos').hidden = false; trackEl.classList.toggle('single', feedbacks.length === 1);
    const compactFeedback = feedbacks.length < 3;
    $('#depoimentos').classList.toggle('feedbacks-compact', compactFeedback);
    $('#depoimentos h2').textContent = feedbacks.length === 1 ? 'Feedback de quem já recebeu' : 'Feedbacks de quem já recebeu';
    if (compactFeedback) {
      const phrase = document.createElement('p'); phrase.className = 'feedback-phrase';
      phrase.textContent = 'Mais clareza para organizar a ceia.';
      $('#depoimentos .wrap').appendChild(phrase);
    }
    $('.carousel-controls').hidden = feedbacks.length < 3;
    $('#feedback-prev').disabled = feedbacks.length < 3; $('#feedback-next').disabled = feedbacks.length < 3;
    feedbacks.forEach((src, i) => {
      const item = document.createElement('article'); item.className = 'feedback-item';
      const img = document.createElement('img'); img.src = src.startsWith('./') ? src : `./${src}`; img.alt = 'Conversa de WhatsApp com feedback de cliente'; img.loading = 'lazy'; img.decoding = 'async'; img.width = 887; img.height = 1774;
      const button = document.createElement('button'); button.className = 'ampliar'; button.textContent = 'Ampliar'; button.setAttribute('aria-label', `Ampliar feedback ${i + 1}`); button.addEventListener('click', () => { pauseCarousel(); openPreview(img.src, 'Feedback sobre o kit'); });
      img.addEventListener('load', () => { loadedFeedbacks++; });
      img.addEventListener('error', () => { item.hidden = true; if (![...trackEl.children].some(el => !el.hidden)) $('#depoimentos').hidden = true; });
      item.append(img, button); trackEl.appendChild(item);
    });
    $('#feedback-prev').addEventListener('click', () => { pauseCarousel(); moveCarousel(-1); }); $('#feedback-next').addEventListener('click', () => { pauseCarousel(); moveCarousel(1); });
    trackEl.addEventListener('pointerdown', pauseCarousel, { passive: true }); trackEl.addEventListener('touchstart', pauseCarousel, { passive: true }); trackEl.addEventListener('focusin', pauseCarousel);
    trackEl.addEventListener('keydown', e => { if (['ArrowRight', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); pauseCarousel(); moveCarousel(e.key === 'ArrowRight' ? 1 : -1); } });
    startCarousel();
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInterval(carouselTimer); carouselTimer = null; } else startCarousel(); });

  // Progresso e parallax usam um único frame por rolagem.
  let scrollFrame = false;
  const parallax = $$('.parallax');
  function onScroll() {
    scrollFrame = false;
    const y = scrollY, length = document.documentElement.scrollHeight - innerHeight;
    $('#reading-progress').style.transform = 'scaleX(' + (length > 0 ? Math.min(1, y / length) : 0) + ')';
    if (!reduced && y < 1000) parallax.forEach(el => el.style.setProperty('--parallax-y', Math.min(y, 900) * Number(el.dataset.parallax) + 'px'));
  }
  addEventListener('scroll', () => { if (!scrollFrame) { scrollFrame = true; requestAnimationFrame(onScroll); } }, { passive: true });
  const popupScript = document.createElement('script');
  popupScript.src = './popup.js'; popupScript.async = true;
  popupScript.onload = () => window.initCeiaPopup({ $, $$, C, store, reduced, openDialog, closeDialog });
  document.head.appendChild(popupScript);

  // Revelação e count-up só nos dois números dos cartões do hero.
  function initializeMotion() {
    document.body.classList.add('motion-ready');
    if ('IntersectionObserver' in window && !reduced) {
      // Conteúdo visível por padrão, inclusive sem JS. Entradas nunca esmaecem texto.
      const entrances = new Set();
      let entrancesExpired = false;
      function enter(el, frames, options) {
        if (entrancesExpired) return;
        const animation = el.animate(frames, options); entrances.add(animation);
        animation.finished.then(() => entrances.delete(animation), () => entrances.delete(animation));
      }
      const reveal = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { enter(e.target,[{transform:'translateY(18px)'},{transform:'translateY(0)'}],{duration:550,delay:Number(e.target.dataset.revealDelay||0),easing:'cubic-bezier(.2,.7,.3,1)',fill:'backwards'}); reveal.unobserve(e.target); } }), { threshold: .05 });
      $$('.reveal').forEach((el, i) => { el.dataset.revealDelay = String((i % 3) * 55); reveal.observe(el); });
      const count = new IntersectionObserver(entries => entries.forEach(e => { if (!e.isIntersecting) return; count.unobserve(e.target); const target = Number(e.target.dataset.count), start = performance.now(); function frame(t) { const p = Math.min(1, (t - start) / 650), value=String(Math.max(1, Math.round(target * (1 - (1 - p) ** 3)))); if(e.target.textContent!==value)e.target.textContent=value; if (p < 1) requestAnimationFrame(frame); } requestAnimationFrame(frame); }), { threshold: .4 });
      $$('[data-count]').forEach(el => count.observe(el));
      const seals = new IntersectionObserver(entries => entries.forEach(e => { if (!e.isIntersecting) return; e.target.classList.add('stamped'); seals.unobserve(e.target); }), { threshold: .5 });
      $$('.guarantee-seal').forEach(el => seals.observe(el));
      const benefitObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$('.benefit-item', entry.target).forEach((row, index) => {
          enter(row,[{transform:'translateY(12px)'},{transform:'translateY(0)'}], {duration:450,delay:index*60,easing:'cubic-bezier(.2,.7,.3,1)',fill:'backwards'});
          enter($('.verification-badge', row),[{transform:'scale(1.4)'},{transform:'scale(.94)',offset:.72},{transform:'scale(1)'}], {duration:550,delay:index*60,easing:'cubic-bezier(.2,.7,.3,1)',fill:'backwards'});
        });
        benefitObserver.unobserve(entry.target);
      }), {threshold:.1});
      const benefitList = $('.benefit-list'); if (benefitList) benefitObserver.observe(benefitList);
      // Watchdog independente das notificações: nenhuma entrada fica pendente após 1,5 s.
      setTimeout(() => {
        entrancesExpired = true; reveal.disconnect(); benefitObserver.disconnect();
        entrances.forEach(animation => animation.cancel()); entrances.clear();
      }, 1500);
    }
  }
  $('.hero-book img').decode().catch(() => {}).then(() => requestAnimationFrame(() => requestAnimationFrame(initializeMotion)));
  if ('IntersectionObserver' in window) {
    const planObserver = new IntersectionObserver(entries => { if (!entries.some(e => e.isIntersecting)) return; if (!viewContentSent && consent !== 'essential') { track('ViewContent', { content_name: 'Ceia de Natal Sem Correria', value: C.PRECO, currency: 'BRL' }); viewContentSent = true; } planObserver.disconnect(); }, { threshold: .15 }); planObserver.observe($('#plano'));
  }
  if (!reduced) $$('.tilt').forEach(el => {
    function tilt(event) { const r = el.getBoundingClientRect(); el.style.setProperty('--tilt-x', `${-(event.clientY - r.top - r.height / 2) / r.height * 4}deg`); el.style.setProperty('--tilt-y', `${(event.clientX - r.left - r.width / 2) / r.width * 4}deg`); el.classList.add('is-tilting'); }
    el.addEventListener('pointermove', tilt, { passive: true }); el.addEventListener('pointerdown', tilt, { passive: true });
    ['pointerleave', 'pointerup', 'pointercancel'].forEach(type => el.addEventListener(type, () => el.classList.remove('is-tilting')));
  });
  $$('.faq-list details').forEach(details => $('summary', details).addEventListener('click', e => { if (!details.open || reduced) return; e.preventDefault(); $('.faq-answer', details).animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-5px)' }], { duration: 150 }).finished.then(() => { details.open = false; }); }));

  $('#cookie-banner').hidden = !!consent;
  function chooseCookies(value) { consent = value; store.set('localStorage', 'ceia-cookie-choice', value); $('#cookie-banner').hidden = true; if (pixelReady && (!preview || C.ENABLE_PIXEL_IN_PREVIEW)) window.fbq?.('consent', value === 'accepted' ? 'grant' : 'revoke'); }
  $('#cookie-accept').addEventListener('click', () => chooseCookies('accepted')); $('#cookie-essential').addEventListener('click', () => chooseCookies('essential')); $('#cookie-settings').addEventListener('click', () => { $('#cookie-banner').hidden = false; $('#cookie-essential').focus(); });
  const privacy = `<p>Para informações sobre privacidade, fale com <a href="mailto:${C.SUPORTE}">${C.SUPORTE}</a>.</p><p>O Meta Pixel mede visitas, visualizações do plano e cliques de checkout. PageView ocorre ao carregar. “Só essenciais” interrompe eventos posteriores. Sua escolha é salva neste navegador.</p><p>Parâmetros de campanha utm_* e fbclid são repassados ao checkout da Cakto. Pagamentos e dados da compra são tratados no checkout.</p>`;
  const terms = `<p>Kit digital em PDF: material principal, Mesa de Natal Encantadora e Réveillon Sem Correria. Versões digital e para imprimir.</p><p>${money.format(C.PRECO)} em pagamento único. Acesso após confirmação do pagamento. Reembolso integral em 7 dias, conforme art. 49 do CDC.</p><p>Quantidades e tempos são estimativas. Cardápios não adaptados a restrições. Imagens ilustrativas.</p>`;
  $$('[data-legal]').forEach(button => button.addEventListener('click', () => { const type = button.dataset.legal; const url = type === 'privacy' ? C.PRIVACIDADE_URL : C.TERMOS_URL; if (url) { location.href = url; return; } $('#legal-title').textContent = type === 'privacy' ? 'Privacidade' : 'Termos'; $('#legal-content').innerHTML = type === 'privacy' ? privacy : terms; openDialog($('#legal-dialog')); }));

  if (preview) window.__CEIA_DEBUG = { getEvents: () => [...events], getState: () => ceiaClock.getState(), getTimeSource: () => ceiaClock.getTimeSource(), showTab, quantities, checkoutURL: checkout.href, carousel: () => ({ count: feedbacks.length, slide, paused: carouselPaused, active: !!carouselTimer, loaded: loadedFeedbacks }) };
  }
  requestAnimationFrame(() => requestAnimationFrame(initializeUI));
})();
