const assert = require('node:assert/strict');
const test = require('node:test');
const calendar = require('../calendar.js');
const config = { ALVO_CEIA: '2026-12-24T20:00:00-03:00', ALVO_REVEILLON: '2026-12-31T23:59:59-03:00' };
const cases = [
  ['03/11 14:41', '2026-11-03T14:41:00-03:00', 'planning', [51, 5, 19, 0]],
  ['23/12 14:41', '2026-12-23T14:41:00-03:00', 'eve', [1, 5, 19, 0]],
  ['24/12 10h', '2026-12-24T10:00:00-03:00', 'today', [0, 10, 0, 0]],
  ['24/12 21h', '2026-12-24T21:00:00-03:00', 'reveillon', [7, 2, 59, 59]],
];
for (const [name, date, phase, expected] of cases) test(name, () => {
  const state = calendar.getCalendarState(Date.parse(date), config);
  const c = calendar.splitCountdown(state.target, Date.parse(date));
  assert.equal(state.phase, phase);
  assert.deepEqual([c.days, c.hours, c.minutes, c.seconds], expected);
  assert.equal(c.totalSeconds, Math.floor((state.target - Date.parse(date)) / 1000));
});
test('Seconds and minutes remain live', () => {
  const c = calendar.splitCountdown(config.ALVO_CEIA, Date.parse('2026-11-03T14:41:37-03:00'));
  assert.deepEqual([c.days, c.hours, c.minutes, c.seconds], [51, 5, 18, 23]);
});
test('Date.now is read on each call, without frozen timestamps', () => {
  const original = Date.now;
  try {
    Date.now = () => Date.parse('2026-11-03T14:41:00-03:00');
    const first = calendar.splitCountdown(config.ALVO_CEIA);
    Date.now = () => Date.parse('2026-11-03T14:41:01-03:00');
    assert.equal(calendar.splitCountdown(config.ALVO_CEIA).totalSeconds, first.totalSeconds - 1);
  } finally { Date.now = original; }
});
test('After the holidays, no countdown or offer expiry exists', () => {
  const state = calendar.getCalendarState(Date.parse('2027-01-02T10:00:00-03:00'), config);
  assert.equal(state.phase, 'ended'); assert.equal(state.target, null);
  assert.equal(state.label, 'Acesso imediato · 7 dias de garantia');
});
test('HEAD rejects absent, malformed and non-HTTP dates', () => {
  const sent = Date.parse('2026-11-03T17:41:00Z');
  for (const value of [null, undefined, '', 'not-a-date', 'NaN']) assert.equal(calendar.serverTimeOffset(value, sent, sent + 10, 'https:'), null);
  assert.equal(calendar.serverTimeOffset('Tue, 03 Nov 2026 17:41:00 GMT', sent, sent + 10, 'file:'), null);
  assert.equal(calendar.serverTimeOffset('Tue, 03 Nov 2026 17:41:00 GMT', sent, sent + 10, 'https:'), -5);
});
test('Preview simulation is limited to local and explicit preview hosts', () => {
  const query = '?agora=2026-12-24T21:00:00-03:00';
  assert.equal(calendar.parsePreviewNow(query, 'ceia.vercel.app'), null);
  assert.equal(calendar.parsePreviewNow(query, 'loja.com.br'), null);
  assert.equal(calendar.parsePreviewNow(query, 'localhost'), Date.parse('2026-12-24T21:00:00-03:00'));
  assert.equal(calendar.parsePreviewNow(query, 'ceia-git-preview-time.vercel.app'), Date.parse('2026-12-24T21:00:00-03:00'));
});
test('file:// mount never issues HEAD and survives absent DOM', () => {
  let requests = 0;
  const controller = calendar.mountClock(config, { location: { protocol: 'file:', search: '', hostname: '', href: 'file:///index.html' },
    fetch: () => { requests++; return Promise.reject(new Error('must not fetch')); },
    setInterval: () => 1, clearInterval() {} });
  assert.equal(requests, 0); assert.equal(controller.getTimeSource(), 'device'); controller.destroy();
});
test('Immediate first render and running seconds with reduced motion', () => {
  const original = Date.now;
  let current = Date.parse('2026-11-03T14:41:37-03:00'), tick;
  const units = ['days', 'hours', 'minutes', 'seconds'];
  const nodes = units.map(() => ({ textContent: '', classList: {
    add() { throw new Error('Reduced motion must not animate'); },
    remove() { throw new Error('Reduced motion must not animate'); },
  } }));
  const doc = { hidden: false, querySelector: () => null, addEventListener() {}, removeEventListener() {},
    querySelectorAll: () => units.map((unit, i) => ({ dataset: { unit }, querySelector: () => nodes[i] })) };
  try {
    Date.now = () => current;
    const controller = calendar.mountClock(config, { document: doc,
      location: { protocol: 'https:', search: '', hostname: 'loja.com.br', href: 'https://loja.com.br/' },
      matchMedia: () => ({ matches: true }), setInterval(fn) { tick = fn; return 1; }, clearInterval() {} });
    assert.deepEqual(nodes.map(n => n.textContent), ['51', '05', '18', '23']);
    current += 1000; tick();
    assert.deepEqual(nodes.map(n => n.textContent), ['51', '05', '18', '22']);
    controller.destroy();
  } finally { Date.now = original; }
});
