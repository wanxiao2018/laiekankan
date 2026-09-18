(function (root, factory) {
  const share = factory();
  if (typeof module === 'object' && module.exports) module.exports = share;
  else root.ShareTools = share;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function encode(value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function decode(value) {
    try {
      const normalized = String(value).replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (_) {
      return null;
    }
  }

  function readHash(hash) {
    const params = new URLSearchParams(String(hash || '').replace(/^#/, ''));
    const value = params.get('plan') || params.get('share');
    return value ? decode(value) : null;
  }

  function buildUrl(href, plan, cityId) {
    const url = new URL(href);
    url.searchParams.set('city', cityId);
    url.hash = 'plan=' + encode(plan);
    return url.toString();
  }

  function withoutShareHash(href) {
    const url = new URL(href);
    const plan = readHash(url.hash);
    if (plan) url.hash = '';
    return url.toString();
  }

  return { encode, decode, readHash, buildUrl, withoutShareHash };
});
