var test = require('node:test');
var assert = require('node:assert/strict');
var P = require('../pricing.js');

test('money formats whole dollars with commas', function () {
  assert.equal(P.money(0), '$0');
  assert.equal(P.money(50), '$50');
  assert.equal(P.money(1299), '$1,299');
  assert.equal(P.money(18900), '$18,900');
});

test('services carry the spec prices', function () {
  var expect = {
    website: [1000, 50], 'missed-call': [299, 149], seo: [150, 125], campaigns: [150, 149],
    dashboard: [0, 109], calendar: [0, 89], spam: [150, 75]
  };
  Object.keys(expect).forEach(function (id) {
    var s = P.serviceById(id);
    assert.ok(s, id + ' exists');
    assert.deepEqual([s.setup, s.monthly], expect[id], id);
  });
  assert.equal(P.serviceById('ads').comingSoon, true);
});

test('plans carry the spec prices', function () {
  var byId = {};
  P.PLANS.forEach(function (p) { byId[p.id] = p; });
  assert.deepEqual([byId.capture.standardSetup, byId.capture.foundingSetup, byId.capture.monthly], [750, 400, 250]);
  assert.deepEqual([byId.convert.standardSetup, byId.convert.foundingSetup, byId.convert.monthly], [1000, 500, 400]);
  assert.deepEqual([byId.keep.standardSetup, byId.keep.foundingSetup, byId.keep.monthly], [1500, 750, 700]);
});

test('each plan bought separately matches the spec table', function () {
  var byId = {};
  P.PLANS.forEach(function (p) { byId[p.id] = p; });
  assert.deepEqual(P.totals(byId.capture.serviceIds), { setup: 1299, monthly: 308 });
  assert.deepEqual(P.totals(byId.convert.serviceIds), { setup: 1449, monthly: 522 });
  assert.deepEqual(P.totals(byId.keep.serviceIds), { setup: 1749, monthly: 746 });
});

test('totals ignores unknown and coming-soon services', function () {
  assert.deepEqual(P.totals([]), { setup: 0, monthly: 0 });
  assert.deepEqual(P.totals(['ads', 'nope', 'calendar']), { setup: 0, monthly: 89 });
});

test('bestPlanFor suggests the cheapest plan that covers the selection and beats it on both prices', function () {
  var r = P.bestPlanFor(['website', 'missed-call', 'dashboard']);
  assert.equal(r.plan.id, 'capture');
  assert.equal(r.setupSaving, 549);
  assert.equal(r.monthlySaving, 58);

  r = P.bestPlanFor(['website', 'missed-call', 'dashboard', 'calendar', 'seo']);
  assert.equal(r.plan.id, 'convert');
  assert.equal(r.setupSaving, 449);
  assert.equal(r.monthlySaving, 122);

  r = P.bestPlanFor(['website', 'missed-call', 'dashboard', 'calendar', 'seo', 'campaigns', 'spam']);
  assert.equal(r.plan.id, 'keep');
  assert.equal(r.setupSaving, 249);
  assert.equal(r.monthlySaving, 46);
});

test('bestPlanFor returns null when no plan is cheaper on both setup and monthly', function () {
  assert.equal(P.bestPlanFor([]), null);
  assert.equal(P.bestPlanFor(['missed-call']), null);          // $299 setup beats every plan setup
  assert.equal(P.bestPlanFor(['website']), null);               // $50/mo beats every plan monthly
  assert.equal(P.bestPlanFor(['website', 'missed-call']), null); // $199/mo is below Capture's $250
});

test('leakEstimate uses enquiries x missed share x close rate x job value', function () {
  assert.deepEqual(
    P.leakEstimate({ enquiries: 40, missedShare: 0.25, closeRate: 0.35, jobValue: 450 }),
    { jobsLost: 3.5, monthly: 1575, yearly: 18900 }
  );
  assert.deepEqual(
    P.leakEstimate({ enquiries: 0, missedShare: 0.25, closeRate: 0.35, jobValue: 450 }),
    { jobsLost: 0, monthly: 0, yearly: 0 }
  );
});

test('leakEstimate treats negative or non-numeric input as zero', function () {
  assert.deepEqual(
    P.leakEstimate({ enquiries: -5, missedShare: 'x', closeRate: 0.35, jobValue: 450 }),
    { jobsLost: 0, monthly: 0, yearly: 0 }
  );
});

test('jobsToCover rounds up and needs a positive job value', function () {
  assert.equal(P.jobsToCover(250, 450), 1);
  assert.equal(P.jobsToCover(400, 150), 3);
  assert.equal(P.jobsToCover(700, 700), 1);
  assert.equal(P.jobsToCover(250, 0), null);
});

test('founding spots is a whole number between 0 and 5', function () {
  assert.ok(Number.isInteger(P.FOUNDING_SPOTS_LEFT));
  assert.ok(P.FOUNDING_SPOTS_LEFT >= 0 && P.FOUNDING_SPOTS_LEFT <= 5);
});

test('coverLine matches the static rest state on the pricing page', function () {
  var byId = {};
  P.PLANS.forEach(function (p) { byId[p.id] = p; });
  assert.equal(P.coverLine(byId.capture, 450), 'Capture is $250/mo — about 1 job a month covers it.');
  assert.equal(P.coverLine(byId.convert, 450), 'Convert is $400/mo — about 1 job a month covers it.');
  assert.equal(P.coverLine(byId.keep, 450), 'Keep is $700/mo — about 2 jobs a month cover it.');
});

test('coverLine without a job value states the price only', function () {
  assert.equal(P.coverLine(P.PLANS[0], 0), 'Capture is $250/mo.');
});

test('sendHref lists only real, available services', function () {
  assert.equal(P.sendHref(['website', 'seo']), 'contact.html?plan=custom&services=website,seo');
  assert.equal(P.sendHref(['ads', 'nope', 'spam']), 'contact.html?plan=custom&services=spam');
  assert.equal(P.sendHref([]), 'contact.html?plan=custom');
});

test('the pricing page rest state matches coverLine output', function () {
  var html = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'pricing.html'), 'utf8');
  P.PLANS.forEach(function (p) {
    assert.ok(html.indexOf('<li>' + P.coverLine(p, 450) + '</li>') !== -1, 'static line for ' + p.id);
  });
});
