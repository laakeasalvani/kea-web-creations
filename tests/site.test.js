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

test('samePage treats / and /index.html as the same page, otherwise compares pathnames', function () {
  assert.equal(S.samePage('/index.html', '/index.html'), true);
  assert.equal(S.samePage('/', '/index.html'), true);
  assert.equal(S.samePage('/index.html', '/'), true);
  assert.equal(S.samePage('/', '/'), true);
  assert.equal(S.samePage('/index.html', '/pricing.html'), false);
  assert.equal(S.samePage('/pricing.html', '/pricing.html'), true);
  assert.equal(S.samePage('/pricing.html', '/policy.html'), false);
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

test('homepage plan preview prices match PLANS, including the visible text', function () {
  var html = H.read('index.html');
  var P = require('../pricing.js');
  P.PLANS.forEach(function (p) {
    var card = H.attrs(html, 'article').filter(function (a) { return a['data-plan'] === p.id; })[0];
    assert.ok(card, 'preview card for ' + p.id);
    assert.equal(Number(card['data-setup']), p.standardSetup, p.id + ' setup');
    assert.equal(Number(card['data-monthly']), p.monthly, p.id + ' monthly');

    var block = H.articleBlock(html, 'data-plan="' + p.id + '"');
    assert.ok(block, 'preview card markup for ' + p.id);
    assert.ok(block.indexOf(P.money(p.monthly) + '<small>/mo') !== -1,
      p.id + ' visible monthly price should read ' + P.money(p.monthly) + '/mo');
    assert.ok(block.indexOf('+ ' + P.money(p.standardSetup) + ' setup') !== -1,
      p.id + ' visible setup price should read + ' + P.money(p.standardSetup) + ' setup');
  });
});

test('pricing page has the shared essentials', function () {
  checkCommon('pricing.html', 'https://keawebcreations.com/pricing.html');
});

test('pricing plan cards match PLANS exactly, including the visible text', function () {
  var html = H.read('pricing.html');
  var P = require('../pricing.js');
  P.PLANS.forEach(function (p) {
    var card = H.attrs(html, 'article').filter(function (a) { return a.id === p.id; })[0];
    assert.ok(card, 'plan card #' + p.id);
    assert.equal(card['data-plan'], p.id);
    assert.equal(Number(card['data-setup']), p.standardSetup, p.id + ' standard setup');
    assert.equal(Number(card['data-founding']), p.foundingSetup, p.id + ' founding setup');
    assert.equal(Number(card['data-monthly']), p.monthly, p.id + ' monthly');
    assert.ok(html.indexOf('href="contact.html?plan=' + p.id + '"') !== -1, p.id + ' button');

    var block = H.articleBlock(html, 'data-plan="' + p.id + '"');
    assert.ok(block, 'plan card markup for ' + p.id);
    assert.ok(block.indexOf(P.money(p.monthly) + '<small>/mo') !== -1,
      p.id + ' visible monthly price should read ' + P.money(p.monthly) + '/mo');
    assert.ok(block.indexOf(P.money(p.standardSetup) + ' setup') !== -1,
      p.id + ' visible standard setup price should read ' + P.money(p.standardSetup) + ' setup');
    assert.ok(block.indexOf('founding ' + P.money(p.foundingSetup)) !== -1,
      p.id + ' visible founding setup price should read founding ' + P.money(p.foundingSetup));
  });
});

test('pricing page states the terms from the spec', function () {
  var html = H.read('pricing.html');
  ['id="website-only"', 'id="build"', 'id="calculator"', 'id="faq"', 'id="foundingBanner"', 'id="builder"',
   '$1,000 setup', '$50/mo', '90-day commitment', 'non-refundable', '30 minutes', '$50 an hour',
   'Not a ranking guarantee', 'customers who opted in', 'Google Ads management is coming soon',
   'This is an estimate, not a promise']
    .forEach(function (s) { assert.ok(html.indexOf(s) !== -1, 'pricing.html is missing: ' + s); });
});

test('calculator rest state shows the example result', function () {
  var html = H.read('pricing.html');
  assert.match(html, /id="calcMonthly">\$1,575</);
  assert.match(html, /id="calcYearly">\$18,900</);
  assert.match(html, /id="calcJobs">3\.5</);
});

test('contact page has the shared essentials', function () {
  checkCommon('contact.html', 'https://keawebcreations.com/contact.html');
});

test('contact form fields match what contact.js reads', function () {
  var html = H.read('contact.html');
  var names = H.attrs(html, 'input').concat(H.attrs(html, 'select'), H.attrs(html, 'textarea'))
    .map(function (a) { return a.name; }).filter(Boolean).sort();
  assert.deepEqual(names, ['business', 'company', 'consent', 'email', 'interest', 'message', 'name', 'phone', 'trade', 'website']);
  ['Free audit', 'Capture', 'Convert', 'Keep', 'Website only', 'Build my own plan', 'Not sure yet',
   'HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Landscaping', 'Reply STOP to opt out, HELP for help. Mobile numbers are never shared or sold.']
    .forEach(function (s) { assert.ok(html.indexOf(s) !== -1, 'contact.html missing: ' + s); });
  var scripts = H.attrs(html, 'script').map(function (s) { return s.src; }).filter(Boolean);
  assert.deepEqual(scripts, ['site.js', 'pricing.js', 'contact.js'], 'script order');
});

test('contact.js posts to the existing function', function () {
  assert.ok(H.read('contact.js').indexOf('https://us-west1-capturewithki-69dd3.cloudfunctions.net/keaInquiry') !== -1);
});

test('policy page has the shared essentials', function () {
  checkCommon('policy.html', 'https://keawebcreations.com/policy.html');
});

test('policy page states the approved terms', function () {
  var html = H.read('policy.html');
  ['id="plans-billing"', 'id="founding"', 'id="updates"', 'id="cancellation"', 'id="privacy"', 'id="texting"',
   'end of the current billing month', '90-day commitment', 'non-refundable', '30 minutes', '$50 an hour',
   'billed at cost', 'Always yours', 'Handed over to you', 'within 30 days', 'Stay with Kea',
   'Reply STOP to opt out, HELP for help. Mobile numbers are never shared or sold.']
    .forEach(function (s) { assert.ok(html.indexOf(s) !== -1, 'policy.html missing: ' + s); });
});

test('404 page is not indexed and works from any path', function () {
  var html = H.read('404.html');
  assert.ok(H.attrs(html, 'meta').some(function (m) { return m.name === 'robots' && m.content === 'noindex'; }));
  assert.equal(H.attrs(html, 'link').filter(function (l) { return l.rel === 'canonical'; }).length, 0);
  assert.ok(html.indexOf('href="/styles.css"') !== -1, 'root-absolute stylesheet');
  assert.ok(html.indexOf('src="/site.js"') !== -1, 'root-absolute script');
  assert.ok(html.indexOf('href="/contact.html?plan=audit"') !== -1);
});

test('every internal link and anchor resolves', function () {
  var pages = ['index.html', 'pricing.html', 'contact.html', 'policy.html', '404.html'];
  pages.forEach(function (page) {
    var html = H.read(page);
    H.attrs(html, 'a').concat(H.attrs(html, 'link')).forEach(function (a) {
      var href = a.href;
      if (!href || /^(https?:|mailto:|tel:)/.test(href)) return;
      var parts = href.replace(/^\//, '').split('#');
      var file = parts[0].split('?')[0] || page;
      var anchor = parts[1];
      assert.ok(H.exists(file), page + ' links to missing file ' + href);
      if (anchor) {
        assert.ok(H.read(file).indexOf('id="' + anchor + '"') !== -1, page + ' links to missing anchor ' + href);
      }
    });
    H.attrs(html, 'img').forEach(function (img) {
      assert.ok(H.exists(img.src.replace(/^\//, '')), page + ' uses missing image ' + img.src);
    });
  });
});

test('plan promises on both pages match PLANS', function () {
  var P = require('../pricing.js');
  ['index.html', 'pricing.html'].forEach(function (page) {
    var html = H.read(page);
    P.PLANS.forEach(function (p) {
      assert.ok(html.indexOf('>' + p.promise + '</p>') !== -1, page + ' shows the ' + p.id + ' promise');
    });
  });
});
