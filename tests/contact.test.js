var test = require('node:test');
var assert = require('node:assert/strict');
var C = require('../contact.js');

test('prefillFromQuery maps plan ids to form interests', function () {
  assert.deepEqual(C.prefillFromQuery('?plan=audit'), { interest: 'Free audit', services: [] });
  assert.equal(C.prefillFromQuery('?plan=capture').interest, 'Capture');
  assert.equal(C.prefillFromQuery('?plan=convert').interest, 'Convert');
  assert.equal(C.prefillFromQuery('?plan=keep').interest, 'Keep');
  assert.equal(C.prefillFromQuery('?plan=website').interest, 'Website only');
  assert.equal(C.prefillFromQuery('?plan=custom').interest, 'Build my own plan');
  assert.deepEqual(C.prefillFromQuery(''), { interest: '', services: [] });
  assert.deepEqual(C.prefillFromQuery('?plan=<script>'), { interest: '', services: [] });
});

test('prefillFromQuery turns service ids into names and drops unknown ones', function () {
  assert.deepEqual(
    C.prefillFromQuery('?plan=custom&services=website,missed-call,ads,nope'),
    { interest: 'Build my own plan', services: ['Website', 'Missed-call text-back'] }
  );
});

test('composePayload sends only the fields the backend accepts', function () {
  var p = C.composePayload({ name: ' Sam ', email: 'sam@example.com', phone: '', website: '',
    interest: 'Convert', message: '', business: '', trade: '', consent: false, services: [] });
  assert.deepEqual(Object.keys(p).sort(), ['email', 'interest', 'message', 'name', 'phone', 'website']);
  assert.equal(p.name, 'Sam');
  assert.equal(p.message, 'Texting consent: No');
});

test('composePayload folds business, trade, services and consent into the message', function () {
  var p = C.composePayload({ name: 'Sam', email: 'sam@example.com', phone: '503-555-0100', website: 'samhvac.com',
    interest: 'Build my own plan', message: 'We miss calls in summer.', business: 'Sam HVAC', trade: 'HVAC',
    consent: true, services: ['Website', 'Missed-call text-back'] });
  assert.equal(p.message,
    'Business: Sam HVAC\nTrade: HVAC\nServices picked: Website, Missed-call text-back\nTexting consent: Yes\n\nWe miss calls in summer.');
});

test('composePayload respects the backend length limits', function () {
  var long = new Array(6001).join('x');
  var p = C.composePayload({ name: 'Sam', email: 'a@b.co', interest: long, message: long, services: [] });
  assert.equal(p.interest.length, 200);
  assert.equal(p.message.length, 5000);
});
