/* Loaded after first paint. One offer per session, no history/back-button interception. */
'use strict';
window.initCeiaPopup = ({ $, $$, C, store, reduced, openDialog, closeDialog }) => {
  const dialog = $('#exit-dialog'), visitStart = Date.now();
  let maxRead = 0, maxY = 0, lastY = scrollY, lastAt = Date.now(), frame = false, planTimer = null, planVisible = false;
  function nearEnd() {
    const length = document.documentElement.scrollHeight - innerHeight;
    return length <= 0 || scrollY / length >= .92 || scrollY + innerHeight >= $('.footer').offsetTop;
  }
  function available() {
    return !document.hidden && !nearEnd() && !store.get('sessionStorage', 'ceia-exit-shown') && !store.get('sessionStorage', 'ceia-checkout-clicked') && !document.querySelector('dialog[open]');
  }
  function eligible(mobile) {
    return Date.now() - visitStart >= (mobile ? 20000 : 15000) && maxRead >= (mobile ? .5 : .25) && available();
  }
  function openVariant(variant) {
    if (!available()) return false;
    clearTimeout(planTimer); planTimer = null;
    dialog.dataset.variant = variant; dialog.classList.toggle('variant-b', variant === 'B');
    $('#popup-benefits').hidden = variant === 'B'; $('#popup-faq').hidden = variant !== 'B';
    const state = window.ceiaClock.getState();
    $('#exit-title').textContent = variant === 'B' ? 'Ficou alguma dúvida?' : 'Vai deixar a ceia para a véspera?';
    $('#exit-text').textContent = variant === 'B' ? 'Seu plano completo por R$ 19,99.' : state.phase === 'ended' ? 'Leve o plano pronto por R$ 19,99.' : `Faltam ${state.days} dias. Leve o plano pronto por R$ 19,99.`;
    store.set('sessionStorage', 'ceia-exit-shown', '1');
    openDialog(dialog); return true;
  }
  function onScroll() {
    frame = false;
    const y = scrollY, now = Date.now(), length = document.documentElement.scrollHeight - innerHeight;
    maxRead = Math.max(maxRead, length > 0 ? Math.min(1, y / length) : 0); maxY = Math.max(maxY, y);
    if (innerWidth < 1000 && lastY - y > 95 && now - lastAt < 220 && (lastY - y) / Math.max(now - lastAt, 1) > .6 && eligible(true)) openVariant('A');
    lastY = y; lastAt = now;
  }
  addEventListener('scroll', () => { if (!frame) { frame = true; requestAnimationFrame(onScroll); } }, { passive: true });
  document.addEventListener('mouseout', e => { if (innerWidth >= 1000 && e.clientY <= 0 && !e.relatedTarget && eligible(false)) openVariant('A'); });
  function schedulePlan() {
    clearTimeout(planTimer); planTimer = null;
    if (planVisible && available()) planTimer = setTimeout(() => { if (planVisible && available()) openVariant('B'); }, 12000);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { planVisible = entries.some(e => e.isIntersecting); schedulePlan(); }, { threshold: .3 });
    observer.observe($('.offer-card'));
  }
  document.addEventListener('visibilitychange', schedulePlan);
  $$('.checkout').forEach(a => a.addEventListener('click', () => { clearTimeout(planTimer); planTimer = null; }));
  $('#exit-dismiss').addEventListener('click', () => closeDialog(dialog));
  // Drag the mobile handle down to dismiss; the sheet content keeps native scrolling.
  const handle = $('.drag-handle', dialog);
  let dragStart = null, dragDistance = 0;
  handle.addEventListener('pointerdown', e => { if (innerWidth >= 768) return; dragStart = e.clientY; dragDistance = 0; handle.setPointerCapture?.(e.pointerId); });
  handle.addEventListener('pointermove', e => { if (dragStart === null) return; dragDistance = Math.max(0, e.clientY - dragStart); if (!reduced) dialog.style.transform = `translateY(${dragDistance}px)`; });
  function endDrag() { if (dragStart === null) return; if (dragDistance >= 70) closeDialog(dialog); dialog.style.transform = ''; dragStart = null; dragDistance = 0; }
  handle.addEventListener('pointerup', endDrag); handle.addEventListener('pointercancel', endDrag);
  if (window.__CEIA_DEBUG) window.__CEIA_DEBUG.exit = () => ({ age: Date.now() - visitStart, maxRead, maxY, eligibleDesktop: eligible(false), eligibleMobile: eligible(true), planVisible, variant: dialog.dataset.variant || null });
};
