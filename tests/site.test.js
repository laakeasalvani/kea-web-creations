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

var BANNED = ['Tier 1', 'Tier 2', 'Tier 3', 'portfolio', 'custom build',
  'steady stream', 'make waves', 'lorem', '[client'];
/* Old prices. Matched as whole amounts so "$400" does not trip "$40". */
var BANNED_PRICES = /\$(30|40)(?![\d,])/;

function checkCommon(file, canonical) {
  var html = H.read(file);
  var lower = html.toLowerCase();
  BANNED.forEach(function (b) {
    assert.equal(lower.indexOf(b.toLowerCase()), -1, file + ' contains banned text: ' + b);
  });
  assert.doesNotMatch(html, BANNED_PRICES, file + ' mentions an old $30/$40 price');
  assert.match(html, /<title>[^<]{10,}<\/title>/, file + ' needs a title');
  var metas = H.attrs(html, 'meta');
  var desc = metas.filter(function (m) { return m.name === 'description'; })[0];
  assert.ok(desc && desc.content.length >= 50, file + ' needs a meta description');
  var links = H.attrs(html, 'link');
  assert.ok(links.some(function (l) { return l.rel === 'stylesheet' && l.href === 'styles.css'; }), file + ' loads styles.css');
  assert.ok(H.attrs(html, 'script').some(function (s) { return s.src === 'site.js'; }), file + ' loads site.js');
  assert.ok(html.indexOf('href="tel:+18083068792"') !== -1, file + ' links the phone number');
  assert.ok(html.indexOf('(808) 306-8792') !== -1, file + ' shows the phone number');
  if (canonical) {
    assert.ok(links.some(function (l) { return l.rel === 'canonical' && l.href === canonical; }), file + ' canonical ' + canonical);
    var ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ld, file + ' needs JSON-LD');
    var data = JSON.parse(ld[1]);
    assert.equal(data['@type'], 'LocalBusiness');
    assert.equal(data.telephone, '+1-808-306-8792');
    assert.equal(data.address.addressLocality, 'Beaverton');
  }
  return html;
}

test('homepage has the shared essentials', function () {
  checkCommon('index.html', 'https://keawebcreations.com/');
});

test('homepage leads with the problem and the audit', function () {
  var html = H.read('index.html');
  assert.match(html, /<h1>Stop losing customers who already found you/);
  ['id="problem"', 'id="journey"', 'id="system"', 'id="plans"', 'id="work"', 'id="founder"', 'id="audit"']
    .forEach(function (id) { assert.ok(html.indexOf(id) !== -1, 'missing ' + id); });
  assert.ok(html.indexOf('href="contact.html?plan=audit"') !== -1, 'audit button links to the form');
  assert.equal(html.indexOf('#/'), -1, 'no hash-route links remain');
});

test('homepage plan preview prices match PLANS', function () {
  var html = H.read('index.html');
  var P = require('../pricing.js');
  P.PLANS.forEach(function (p) {
    var card = H.attrs(html, 'article').filter(function (a) { return a['data-plan'] === p.id; })[0];
    assert.ok(card, 'preview card for ' + p.id);
    assert.equal(Number(card['data-setup']), p.standardSetup, p.id + ' setup');
    assert.equal(Number(card['data-monthly']), p.monthly, p.id + ' monthly');
  });
});
