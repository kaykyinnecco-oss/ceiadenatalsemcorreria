/* Calendar-only countdown. Classic script: no imports, build or countdown storage. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CeiaCalendar = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
'use strict';
const SAO_PAULO = 'America/Sao_Paulo';
const DAY_MS = 86400000;
const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SAO_PAULO, year: 'numeric', month: '2-digit', day: '2-digit',
});

function instant(value) {
  const result = value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (!Number.isFinite(result)) throw new TypeError('Invalid calendar instant.');
  return result;
}

function calendarDay(value) {
  const parts = Object.fromEntries(dateFormatter.formatToParts(new Date(instant(value)))
    .filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
}

function dayWord(number) { return number === 1 ? 'dia' : 'dias'; }

function splitCountdown(target, now = Date.now()) {
  const totalSeconds = Math.max(0, Math.floor((instant(target) - instant(now)) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor(totalSeconds / 3600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
    totalSeconds,
  };
}

/** Dates are classified by the São Paulo calendar, independently of device zone. */
function getCalendarState(now = Date.now(), config = {}) {
  const current = instant(now);
  const ceia = instant(config.ALVO_CEIA || '2026-12-24T20:00:00-03:00');
  const reveillon = instant(config.ALVO_REVEILLON || '2026-12-31T23:59:59-03:00');
  const today = calendarDay(current);
  const days = Math.max(0, Math.round((calendarDay(ceia) - today) / DAY_MS));
  const base = {
    phase: 'planning', label: `Faltam ${days} ${dayWord(days)} para a ceia`,
    shortLabel: 'Faltam', actionLabel: 'Quero meu plano', target: ceia, days,
  };

  if (current > reveillon) {
    return { ...base, phase: 'ended', label: 'Acesso imediato · 7 dias de garantia',
      shortLabel: '', target: null, days: 0 };
  }

  if (current >= ceia) {
    const remainingDays = Math.max(0, Math.round((calendarDay(reveillon) - today) / DAY_MS));
    return { ...base, phase: 'reveillon',
      label: remainingDays ? `Faltam ${remainingDays} ${dayWord(remainingDays)} para o Réveillon` : 'Hoje é o Réveillon!',
      shortLabel: 'Faltam', target: reveillon, days: remainingDays };
  }

  if (days === 0) {
    const clock = splitCountdown(ceia, current);
    const hh = String(clock.hours).padStart(2, '0');
    const mm = String(clock.minutes).padStart(2, '0');
    const ss = String(clock.seconds).padStart(2, '0');
    return { ...base, phase: 'today', label: `Hoje é a ceia! Faltam ${hh}:${mm}:${ss}`,
      shortLabel: 'Hoje', actionLabel: 'Ver plano do dia 24' };
  }

  if (days === 1) {
    return { ...base, phase: 'eve', label: 'Amanhã é a ceia: plano do dia 24, hora a hora' };
  }

  if (days <= 3) {
    return { ...base, phase: 'three-days', label: 'Ceia em 3 dias? Ainda dá tempo.' };
  }

  if (days <= 7) {
    return { ...base, phase: 'week', label: 'Última semana: hora de seguir o cronograma de 7 dias' };
  }

  if (days <= 14) {
    const untilSchedule = days - 7;
    return { ...base, phase: 'approaching',
      label: `Faltam ${days} dias · seu cronograma de 7 dias começa em ${untilSchedule} ${dayWord(untilSchedule)}` };
  }

  return base;
}

/** Explicit Vercel previews only; plain project.vercel.app remains production. */
function isPreviewHost(hostname = '') {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  if (['localhost', '127.0.0.1', '[::1]', '::1'].includes(host)) return true;
  if (!host.endsWith('.vercel.app')) return false;
  if (host.includes('-git-')) return true;
  return /^[a-z0-9-]+-[a-z0-9]{8,12}-[a-z0-9-]+\.vercel\.app$/.test(host);
}

function parsePreviewNow(search = '', hostname = '') {
  if (!isPreviewHost(hostname)) return null;
  const value = new URLSearchParams(search).get('agora');
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function serverTimeOffset(dateHeader, sentAt, receivedAt, protocol) {
  if (!/^https?:$/.test(protocol || '') || typeof dateHeader !== 'string' || !dateHeader.trim()) return null;
  const remote = Date.parse(dateHeader);
  if (!Number.isFinite(remote) || !Number.isFinite(sentAt) || !Number.isFinite(receivedAt) || receivedAt < sentAt) return null;
  return remote - (sentAt + receivedAt) / 2;
}

/** Call immediately after the bar markup so the first painted digits are real. */
function mountClock(config = {}, environment = root) {
  const doc = environment.document;
  const location = environment.location || { protocol: '', search: '', hostname: '', href: '' };
  const query = selector => doc && doc.querySelector ? doc.querySelector(selector) : null;
  const bar = query('#calendar-bar'), cards = query('#time-cards'), link = query('#calendar-link');
  const prefix = query('#clock-prefix'), accessible = query('#clock-accessible');
  const message = query('#bar-state-message'), button = query('#bar-button');
  const assurance = query('.bar-assurance'), dateLabel = query('.bar-date-label');
  const digitNodes = new Map();
  if (doc && doc.querySelectorAll) doc.querySelectorAll('#time-cards .time-card[data-unit]').forEach(card => digitNodes.set(card.dataset.unit, card.querySelector('b')));
  const reduced = !!(environment.matchMedia && environment.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const previewNow = parsePreviewNow(location.search, location.hostname);
  let offset = previewNow === null ? 0 : previewNow - Date.now();
  let source = previewNow === null ? 'device' : 'preview';
  let interval = null, lastMinute = '', destroyed = false;
  const timers = environment.setInterval ? environment : root;
  const clockNow = () => Date.now() + offset;
  const getState = () => getCalendarState(clockNow(), config);
  const setText = (node, text) => { if (node && node.textContent !== text) node.textContent = text; };

  function render() {
    if (destroyed) return null;
    const now = clockNow(), state = getCalendarState(now, config);
    const countdown = state.target === null ? null : splitCountdown(state.target, now);
    if (bar) {
      bar.dataset.phase = state.phase;
      bar.classList.toggle('calendar-done', !countdown);
      // Keep every unit visible even on the day of the ceia.
      bar.classList.remove('today', 'clock-pending'); bar.title = state.label;
    }
    if (cards) cards.hidden = !countdown;
    if (link) link.hidden = !countdown;
    if (button) { button.hidden = !countdown; setText(button, 'Quero meu plano'); }
    setText(assurance, 'Acesso imediato · 7 dias de garantia');
    setText(prefix, 'Faltam');
    setText(dateLabel, state.phase === 'reveillon' ? 'para o Réveillon' : 'para a ceia');
    const phaseMessage = message || query('#bar-state-message');
    setText(phaseMessage, state.label);
    if (countdown) digitNodes.forEach((node, unit) => {
      if (!node) return;
      const value = String(countdown[unit]).padStart(2, '0');
      if (node.textContent !== value) {
        const hadValue = node.textContent !== '';
        node.textContent = value;
        if (hadValue && !reduced) {
          node.classList.remove('flip');
          const raf = environment.requestAnimationFrame || (fn => fn());
          raf(() => { if (!destroyed) node.classList.add('flip'); });
        }
      }
    });
    const minute = `${state.phase}:${Math.floor(now / 60000)}`;
    if (minute !== lastMinute) {
      const text = countdown
        ? `Faltam ${countdown.days} dias, ${countdown.hours} horas e ${countdown.minutes} minutos para ${state.phase === 'reveillon' ? 'o Réveillon' : 'a ceia de Natal'}. ${state.label.replace(/\d{2}:\d{2}:\d{2}/g, '')}`
        : state.label;
      if (accessible) accessible.textContent = text;
      lastMinute = minute;
    }
    return { state, countdown };
  }
  function start() { if (destroyed || interval !== null || (doc && doc.hidden)) return; render(); interval = timers.setInterval(render, 1000); }
  function visibility() {
    if (doc && doc.hidden) { if (interval !== null) timers.clearInterval(interval); interval = null; }
    else start();
  }
  async function synchronize() {
    if (previewNow !== null || !/^https?:$/.test(location.protocol) || typeof environment.fetch !== 'function') return;
    const sent = Date.now();
    try {
      const options = { method: 'HEAD', cache: 'no-store' };
      if (environment.AbortSignal && environment.AbortSignal.timeout) options.signal = environment.AbortSignal.timeout(4000);
      const response = await environment.fetch(location.href.split('#')[0], options);
      const received = Date.now();
      if (!response.ok) return;
      const proposed = serverTimeOffset(response.headers.get('Date'), sent, received, location.protocol);
      if (proposed !== null && !destroyed) { offset = proposed; source = 'server'; render(); }
    } catch { /* Device time continues; invalid responses never mutate the offset. */ }
  }
  render(); start();
  if (doc && doc.addEventListener) {
    doc.addEventListener('visibilitychange', visibility);
    // The inline mount precedes the remaining page markup.
    doc.addEventListener('DOMContentLoaded', render, { once: true });
  }
  synchronize();
  return { render, getState, getTimeSource: () => source,
    destroy() { destroyed = true; if (interval !== null) timers.clearInterval(interval); interval = null; if (doc && doc.removeEventListener) { doc.removeEventListener('visibilitychange', visibility); doc.removeEventListener('DOMContentLoaded', render); } } };
}
return { splitCountdown, getCalendarState, isPreviewHost, parsePreviewNow, serverTimeOffset, mountClock };
});
