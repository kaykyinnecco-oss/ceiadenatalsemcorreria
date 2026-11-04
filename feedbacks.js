/* Marquee sem dependências. Somente os cinco prints fornecidos, sem legendas. */
'use strict';
window.initCeiaFeedbacks = ({ C, openDialog, closeDialog }) => {
  const section = document.querySelector('#depoimentos');
  const viewport = document.querySelector('#feedback-window');
  const belt = document.querySelector('#feedback-belt');
  const dialog = document.querySelector('#feedback-dialog');
  const fullImage = document.querySelector('#feedback-full-image');
  fullImage.loading = 'lazy';
  const items = C.SHOW_TESTIMONIALS ? (C.TESTIMONIALS || []) : [];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const speed = Math.max(1, Number(C.FEEDBACK_SPEED) || 35);
  const reasons = new Set();
  const failedThumbs = new Set();
  let unavailable = false;
  let stride = 0, repeats = 1, cardWidth = 119, galleryIndex = 0;
  let resumeTimer, resizeFrame, nativeMode = false, signature = '', uniqueButtons = [], keyboardMode = false, touchHeld = false;
  const getAnimation = () => belt.getAnimations().find(a => a.animationName === 'feedback-marquee');
  const phase = () => stride ? ((Number(getAnimation()?.currentTime || 0) * speed / 1000) % stride) : 0;
  const animated = () => items.length >= 4 && !motion.matches;
  const syncPause = () => belt.classList.toggle('is-paused', reasons.size > 0);
  const pause = reason => { reasons.add(reason); syncPause(); };
  const unpause = reason => { reasons.delete(reason); syncPause(); };

  if (!items.length) {
    section.remove(); dialog.remove();
    return { getState: () => ({ count: 0, clones: 0, active: false, paused: true }) };
  }
  section.hidden = false;
  section.querySelector('h2').textContent = items.length === 1 ? 'Feedback de quem já recebeu' : 'Feedbacks de quem já recebeu';

  function finishNative() {
    // Compensa o scroll nativo na fase da animação antes de zerar scrollLeft.
    // Assim a retomada mostra os mesmos pixels, sem retornar ao primeiro cartão.
    const animation = getAnimation();
    if (nativeMode && animation) {
      const offset = (phase() + viewport.scrollLeft) % stride;
      viewport.style.scrollSnapType = 'none';
      viewport.scrollTo({ left: 0, behavior: 'instant' });
      animation.currentTime = offset / speed * 1000;
    }
    nativeMode = false;
    unpause('touch'); unpause('manual');
  }
  function resumeLater() {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { if (!touchHeld && !reasons.has('focus') && !reasons.has('lightbox')) finishNative(); }, 3000);
  }
  function startNative() {
    clearTimeout(resumeTimer); touchHeld = true; pause('touch');
    if (animated() && !nativeMode) {
      nativeMode = true;
      viewport.style.scrollSnapType = 'none';
      // Um ciclo inteiro é visualmente idêntico e libera arrasto nos dois sentidos.
      viewport.scrollTo({ left: stride, behavior: 'instant' });
    }
  }
  function showImage(index) {
    galleryIndex = (index + items.length) % items.length;
    const item = items[galleryIndex];
    fullImage.width = item.fullWidth; fullImage.height = item.fullHeight;
    fullImage.src = item.full;
    dialog.scrollTop = 0;
    document.querySelector('#feedback-position').textContent = `${galleryIndex + 1} / ${items.length}`;
  }
  function openImage(index) {
    clearTimeout(resumeTimer); pause('lightbox');
    showImage(index);
    // O retorno de foco vai ao cartão original, nunca a uma cópia aria-hidden.
    uniqueButtons[index]?.focus({ preventScroll: true });
    openDialog(dialog);
  }
  function card(item, index, original) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'feedback-card';
    button.dataset.feedbackIndex = index;
    button.dataset.unique = String(original);
    if (!original) { button.tabIndex = -1; button.setAttribute('aria-hidden', 'true'); }
    button.setAttribute('aria-label', `Ampliar feedback ${index + 1}`);
    const img = document.createElement('img');
    img.src = item.thumb; img.width = item.width; img.height = item.height;
    img.alt = 'Conversa de WhatsApp com feedback de cliente';
    img.loading = 'lazy'; img.decoding = 'async'; img.draggable = false;
    if (original) img.addEventListener('error', () => {
      failedThumbs.add(index);
      if (failedThumbs.size === items.length) {
        unavailable = true; clearTimeout(resumeTimer);
        belt.classList.remove('is-marquee'); belt.replaceChildren(); uniqueButtons = [];
        section.remove(); dialog.remove();
      }
    });
    button.appendChild(img);
    button.addEventListener('click', () => openImage(index));
    if (original) uniqueButtons[index] = button;
    return button;
  }
  function build() {
    if (unavailable) return;
    const desktop = matchMedia('(min-width:768px)').matches;
    cardWidth = desktop ? 138 : 119;
    repeats = animated() ? Math.max(1, Math.ceil(innerWidth / (items.length * (cardWidth + 12)))) : 1;
    const nextSignature = [desktop, repeats, animated()].join('/');
    if (signature === nextSignature) return;
    signature = nextSignature;
    clearTimeout(resumeTimer); nativeMode = false; touchHeld = false; reasons.delete('touch'); reasons.delete('manual');
    belt.classList.remove('is-marquee'); belt.replaceChildren(); uniqueButtons = [];
    stride = repeats * items.length * (cardWidth + 12);
    belt.style.setProperty('--feedback-cycle', `${stride}px`);
    belt.style.setProperty('--feedback-duration', `${stride / speed}s`);
    section.style.setProperty('--feedback-speed', speed);
    section.classList.toggle('feedback-static', items.length < 4);
    viewport.style.scrollSnapType = animated() ? 'none' : 'x proximity';
    viewport.scrollTo({ left: 0, behavior: 'instant' });
    // Três grupos permitem arrastar para ambos os lados sem uma lacuna.
    const groups = animated() ? 3 : 1;
    for (let group = 0; group < groups; group++) {
      const set = document.createElement('div'); set.className = 'feedback-set';
      if (group) set.setAttribute('aria-hidden', 'true');
      for (let copy = 0; copy < repeats; copy++) {
        items.forEach((item, index) => set.appendChild(card(item, index, group === 0 && copy === 0)));
      }
      belt.appendChild(set);
    }
    belt.classList.toggle('is-marquee', animated()); syncPause();
  }
  viewport.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') pause('hover'); });
  viewport.addEventListener('pointerleave', () => unpause('hover'));
  viewport.addEventListener('pointerdown', startNative, { passive: true });
  function endTouch() { touchHeld = false; if (nativeMode || reasons.has('touch')) { viewport.style.scrollSnapType = 'x proximity'; resumeLater(); } }
  viewport.addEventListener('pointerup', endTouch, { passive: true });
  viewport.addEventListener('pointercancel', endTouch, { passive: true });
  viewport.addEventListener('touchstart', startNative, { passive: true });
  viewport.addEventListener('touchend', endTouch, { passive: true });
  viewport.addEventListener('touchcancel', endTouch, { passive: true });
  viewport.addEventListener('scroll', () => { if (nativeMode && !touchHeld && !reasons.has('lightbox')) resumeLater(); }, { passive: true });
  document.addEventListener('keydown', e => { if (e.key === 'Tab') keyboardMode = true; });
  document.addEventListener('pointerdown', () => { keyboardMode = false; unpause('focus'); }, { passive: true });
  viewport.addEventListener('focusin', e => {
    if (!keyboardMode) return;
    pause('focus');
    const animation = getAnimation();
    if (animation) {
      animation.currentTime = 0; nativeMode = true;
      viewport.style.scrollSnapType = 'none';
      viewport.scrollTo({ left: Number(e.target.dataset.feedbackIndex || 0) * (cardWidth + 12), behavior: 'instant' });
    }
  });
  viewport.addEventListener('focusout', e => {
    if (!viewport.contains(e.relatedTarget)) { if (nativeMode) { pause('manual'); resumeLater(); } unpause('focus'); }
  });
  document.addEventListener('visibilitychange', () => document.hidden ? pause('hidden') : unpause('hidden'));
  document.querySelector('#feedback-lightbox-prev').addEventListener('click', () => showImage(galleryIndex - 1));
  document.querySelector('#feedback-lightbox-next').addEventListener('click', () => showImage(galleryIndex + 1));
  document.querySelector('#feedback-lightbox-prev').hidden = items.length < 2;
  document.querySelector('#feedback-lightbox-next').hidden = items.length < 2;
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showImage(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1)); }
  });
  dialog.addEventListener('close', () => {
    pause('manual');
    const animation = getAnimation(); if (animation) animation.currentTime = 0;
    viewport.style.scrollSnapType = 'none';
    viewport.scrollTo({ left: galleryIndex * (cardWidth + 12), behavior: 'instant' });
    nativeMode = !!animation;
    unpause('lightbox'); uniqueButtons[galleryIndex]?.focus({ preventScroll: true }); resumeLater();
  });
  const change = () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(build); };
  addEventListener('resize', change); motion.addEventListener('change', () => { signature = ''; change(); });
  build();
  return { getState: () => ({
    count: unavailable ? 0 : items.length, unique: uniqueButtons.length,
    clones: belt.querySelectorAll('[data-unique="false"]').length,
    active: !unavailable && animated(), paused: reasons.size > 0, reasons: [...reasons],
    stride, duration: stride / speed * 1000, speed, phase: phase(), nativeMode,
    galleryIndex, galleryOpen: dialog.open,
  }) };
};
