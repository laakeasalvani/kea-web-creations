/* ══════ KEA CONTACT — the audit request form ══════
   Posts to a Cloud Function that holds the Resend API key. The key can never
   live in this site: it is static and public. The function accepts only
   name, email, phone, website, interest and message, so business name, trade,
   picked services and texting consent are written into the message. */
(function (root) {
  var P = (typeof module === 'object' && module.exports) ? require('./pricing.js') : root.KeaPricing;
  var ENDPOINT = 'https://us-west1-capturewithki-69dd3.cloudfunctions.net/keaInquiry';
  var INTERESTS = {
    audit: 'Free audit', capture: 'Capture', convert: 'Convert', keep: 'Keep',
    website: 'Website only', custom: 'Build my own plan'
  };

  function prefillFromQuery(search) {
    var q = new URLSearchParams(search || '');
    var plan = q.get('plan');
    var services = String(q.get('services') || '').split(',')
      .map(function (id) { return P.serviceById(id); })
      .filter(function (s) { return s && !s.comingSoon; })
      .map(function (s) { return s.name; });
    return { interest: Object.prototype.hasOwnProperty.call(INTERESTS, plan) ? INTERESTS[plan] : '', services: services };
  }

  function clean(v) {
    return String(v === undefined || v === null ? '' : v).trim();
  }

  function composePayload(v) {
    var lines = [];
    if (clean(v.business)) lines.push('Business: ' + clean(v.business));
    if (clean(v.trade)) lines.push('Trade: ' + clean(v.trade));
    if (v.services && v.services.length) lines.push('Services picked: ' + v.services.join(', '));
    lines.push('Texting consent: ' + (v.consent ? 'Yes' : 'No'));
    var body = clean(v.message);
    return {
      name: clean(v.name),
      email: clean(v.email),
      phone: clean(v.phone),
      website: clean(v.website),
      interest: clean(v.interest).slice(0, 200),
      message: (lines.join('\n') + (body ? '\n\n' + body : '')).slice(0, 5000)
    };
  }

  var api = { prefillFromQuery: prefillFromQuery, composePayload: composePayload };
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  root.KeaContact = api;

  var f = document.querySelector('[data-form]');
  if (!f) return;

  var pre = prefillFromQuery(location.search);
  if (pre.interest) f.elements.interest.value = pre.interest;
  var picked = document.getElementById('picked');
  if (pre.services.length && picked) {
    picked.textContent = 'Services you picked: ' + pre.services.join(', ');
    picked.hidden = false;
  }

  var ok = f.querySelector('[data-ok]'), err = f.querySelector('[data-err]'),
      btn = f.querySelector('[type=submit]'), label = btn.textContent;
  /* Anything completed in under three seconds was completed by a script, and
     the function bins it silently. Reset after each send. */
  var renderedAt = Date.now();

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    ok.classList.remove('on'); err.classList.remove('on');
    btn.disabled = true; btn.textContent = 'Sending…';

    var d = new FormData(f);
    var payload = composePayload({
      name: d.get('name'), email: d.get('email'), phone: d.get('phone'), website: d.get('website'),
      interest: d.get('interest'), message: d.get('message'), business: d.get('business'),
      trade: d.get('trade'), consent: d.get('consent') === 'yes', services: pre.services
    });
    payload.renderedAt = renderedAt;
    payload.honeypot = d.get('company') || '';

    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (j) {
        if (!j || !j.ok) {
          var e2 = new Error(j && j.error ? j.error : ''); e2.fromServer = !!(j && j.error); throw e2;
        }
        ok.classList.add('on'); f.reset(); renderedAt = Date.now();
        if (pre.interest) f.elements.interest.value = pre.interest;
      })
      .catch(function (ex) {
        var msg = (ex && ex.fromServer && ex.message) ? ex.message : 'Something went wrong sending that.';
        err.textContent = msg + ' You can also email keawebcreations@gmail.com or call (808) 306-8792.';
        err.classList.add('on');
      })
      .then(function () { btn.disabled = false; btn.textContent = label; });
  });
})(this);
