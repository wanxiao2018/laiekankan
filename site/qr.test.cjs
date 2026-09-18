const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const vm = require('vm');

function loadQr() {
  const context = {};
  vm.runInNewContext(fs.readFileSync(__dirname + '/qr.js', 'utf8'), context);
  return context.QRCode;
}

test('local QR renderer draws an encoded share URL without network access', () => {
  const qr = loadQr();
  const darkModules = [];
  const colors = [];
  const canvas = {
    width: 220,
    height: 220,
    style: {},
    getContext() {
      return {
        set fillStyle(value) { colors.push(value); },
        get fillStyle() { return colors.at(-1); },
        imageSmoothingEnabled: true,
        fillRect(...args) { darkModules.push(args); }
      };
    }
  };
  let error;
  qr.toCanvas(canvas, 'https://example.github.io/russia/#plan=abc123', { width: 220, margin: 2, errorCorrectionLevel: 'M' }, value => { error = value; });
  assert.equal(error, null);
  assert.equal(canvas.width, 220);
  assert.equal(canvas.height, 220);
  assert.ok(darkModules.length > 100);
  assert.deepEqual(colors.slice(0, 2), ['#faf7ee', '#26352d']);
});
