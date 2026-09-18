const test = require('node:test');
const assert = require('node:assert/strict');
const share = require('./share.js');

test('share payload survives UTF-8 URL-safe encoding', () => {
  const plan = { version: 1, city: 'spb', title: '我的彼得堡 · 俄罗斯博物馆', days: [{ title: '慢慢走', places: ['hermitage'] }] };
  assert.deepEqual(share.decode(share.encode(plan)), plan);
  assert.match(share.encode(plan), /^[A-Za-z0-9_-]+$/);
});

test('shared URL preserves the city and can be read from its hash', () => {
  const plan = { version: 1, city: 'moscow', days: [] };
  const url = share.buildUrl('https://example.github.io/russia/', plan, 'moscow');
  assert.equal(new URL(url).searchParams.get('city'), 'moscow');
  assert.deepEqual(share.readHash(new URL(url).hash), plan);
  assert.equal(share.withoutShareHash(url), 'https://example.github.io/russia/?city=moscow');
});

test('invalid share payloads are ignored', () => {
  assert.equal(share.decode('not-a-plan'), null);
  assert.equal(share.readHash('#top'), null);
});
