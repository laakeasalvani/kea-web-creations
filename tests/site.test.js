var test = require('node:test');
var assert = require('node:assert/strict');
var S = require('../site.js');
var H = require('./helpers.js');

test('legacyTarget maps every old hash route', function () {
  assert.equal(S.legacyTarget('#/home'), 'index.html');
  assert.equal(S.legacyTarget('#/services'), 'pricing.html');
  assert.equal(S.legacyTarget('#/about'), 'index.html#founder');
  assert.equal(S.legacyTarget('#/faq'), 'pricing.html#faq');
  assert.equal(S.legacyTarget('#/policy'), 'policy.html');
  assert.equal(S.legacyTarget('#/contact'), 'contact.html');
  assert.equal(S.legacyTarget('#/portfolio'), 'index.html#work');
});

test('legacyTarget sends unknown old routes home and ignores normal anchors', function () {
  assert.equal(S.legacyTarget('#/branding'), 'index.html');
  assert.equal(S.legacyTarget('#work'), null);
  assert.equal(S.legacyTarget(''), null);
});

test('styles.css keeps the brand tokens and drops retired components', function () {
  var css = H.read('styles.css');
  ['--bar:#16203D', '--accent:#58B0A8', '--accent-dk:#3E8E87', '--sand:#F6F4F0'].forEach(function (t) {
    assert.ok(css.indexOf(t) !== -1, 'missing token ' + t);
  });
  ['.tiers', '.pf{', '.logos', '.quote', '.dropdown', '.flags'].forEach(function (c) {
    assert.equal(css.indexOf(c), -1, 'retired rule still present: ' + c);
  });
});
