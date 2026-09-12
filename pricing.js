/* ══════ KEA PRICING ══════
   ▼▼ YOUR PRICES LIVE HERE ▼▼  The pricing page builder, the plan suggestion
   and the calculator all read from this file. The plan cards in pricing.html
   repeat the plan prices as plain text so search engines can read them —
   if you change a plan price here, change it there too (the tests check).

   FOUNDING_SPOTS_LEFT: lower this by hand each time a founding client signs.
   At 0 the founding banner hides itself. */
(function (root) {
  var FOUNDING_SPOTS_LEFT = 5;

  var SERVICES = [
    { id: 'website', name: 'Website', icon: 'globe', setup: 1000, monthly: 50,
      desc: 'Built for your business, hosted, with 30 minutes of updates a month.' },
    { id: 'missed-call', name: 'Missed-call text-back', icon: 'phone', setup: 299, monthly: 149,
      desc: 'Every missed caller gets a text back in seconds, before they call the next company.' },
    { id: 'seo', name: 'Local SEO foundations', icon: 'search', setup: 150, monthly: 125,
      desc: 'Service and town keywords, on-page fixes and Google Business Profile optimization. Not a ranking guarantee.' },
    { id: 'campaigns', name: 'Email & SMS campaigns', icon: 'megaphone', setup: 150, monthly: 149,
      desc: 'Seasonal offers and reminders to past customers. Texts go only to customers who opted in.' },
    { id: 'dashboard', name: 'Leads dashboard', icon: 'grid', setup: 0, monthly: 109,
      desc: 'Every call, text and form in one inbox, with a mobile app.' },
    { id: 'calendar', name: 'Calendar booking', icon: 'calendar', setup: 0, monthly: 89,
      desc: 'Customers book estimates online, synced to your Google Calendar.' },
    { id: 'spam', name: 'Spam call screening', icon: 'shield', setup: 150, monthly: 75,
      desc: 'Robocalls filtered out before they reach your phone.' },
    { id: 'ads', name: 'Google Ads management', icon: 'chart', setup: 0, monthly: 0, comingSoon: true,
      desc: 'Coming soon.' }
  ];

  var PLANS = [
    { id: 'capture', name: 'Capture', promise: 'Every call and form caught and answered in seconds.',
      standardSetup: 750, foundingSetup: 400, monthly: 250,
      serviceIds: ['website', 'missed-call', 'dashboard'] },
    { id: 'convert', name: 'Convert', promise: 'Every lead followed up and booked for an estimate.',
      standardSetup: 1000, foundingSetup: 500, monthly: 400,
      serviceIds: ['website', 'missed-call', 'dashboard', 'calendar', 'seo'] },
    { id: 'keep', name: 'Keep', promise: 'Past customers come back for seasonal and repeat work.',
      standardSetup: 1500, foundingSetup: 750, monthly: 700,
      serviceIds: ['website', 'missed-call', 'dashboard', 'calendar', 'seo', 'campaigns', 'spam'] }
  ];

  function money(n) {
    return '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function serviceById(id) {
    for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i];
    return undefined;
  }

  function totals(ids) {
    var t = { setup: 0, monthly: 0 };
    (ids || []).forEach(function (id) {
      var s = serviceById(id);
      if (!s || s.comingSoon) return;
      t.setup += s.setup;
      t.monthly += s.monthly;
    });
    return t;
  }

  function bestPlanFor(ids) {
    var chosen = (ids || []).filter(function (id) {
      var s = serviceById(id);
      return s && !s.comingSoon;
    });
    if (!chosen.length) return null;
    var t = totals(chosen), best = null;
    PLANS.forEach(function (p) {
      var covers = chosen.every(function (id) { return p.serviceIds.indexOf(id) !== -1; });
      if (!covers || p.standardSetup >= t.setup || p.monthly >= t.monthly) return;
      if (!best || p.monthly < best.monthly) best = p;
    });
    if (!best) return null;
    return { plan: best, setupSaving: t.setup - best.standardSetup, monthlySaving: t.monthly - best.monthly };
  }

  function num(v) {
    var n = Number(v);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function leakEstimate(input) {
    var jobs = num(input.enquiries) * num(input.missedShare) * num(input.closeRate);
    var monthly = Math.round(jobs * num(input.jobValue));
    return { jobsLost: Math.round(jobs * 10) / 10, monthly: monthly, yearly: monthly * 12 };
  }

  function jobsToCover(planMonthly, jobValue) {
    var v = num(jobValue);
    if (!v) return null;
    return Math.max(1, Math.ceil(num(planMonthly) / v));
  }

  function coverLine(plan, jobValue) {
    var n = jobsToCover(plan.monthly, jobValue);
    var head = plan.name + ' is ' + money(plan.monthly) + '/mo';
    if (n === null) return head + '.';
    return head + ' — about ' + n + (n === 1 ? ' job a month covers it.' : ' jobs a month cover it.');
  }

  function sendHref(ids) {
    var ok = (ids || []).filter(function (id) {
      var s = serviceById(id);
      return s && !s.comingSoon;
    });
    return 'contact.html?plan=custom' + (ok.length ? '&services=' + ok.join(',') : '');
  }

  var api = {
    FOUNDING_SPOTS_LEFT: FOUNDING_SPOTS_LEFT, SERVICES: SERVICES, PLANS: PLANS,
    money: money, serviceById: serviceById, totals: totals, bestPlanFor: bestPlanFor,
    leakEstimate: leakEstimate, jobsToCover: jobsToCover, coverLine: coverLine, sendHref: sendHref
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KeaPricing = api;
})(this);

/* ══════ PRICING PAGE WIRING (browser only) ══════ */
(function (root) {
  if (typeof document === 'undefined' || !root.KeaPricing) return;
  var P = root.KeaPricing;

  function svg(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
      + 'stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }
  var ICONS = {
    globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>'),
    phone: svg('<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    megaphone: svg('<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1zM17 9a4 4 0 0 1 0 6"/>'),
    grid: svg('<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>'),
    calendar: svg('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4M9 15l2 2 4-4"/>'),
    shield: svg('<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="m9 9 6 6"/>'),
    chart: svg('<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3"/>')
  };

  /* ── Founding banner ── */
  var banner = document.getElementById('foundingBanner');
  if (banner) {
    if (P.FOUNDING_SPOTS_LEFT <= 0) {
      banner.hidden = true;
      document.querySelectorAll('.plan-setup span').forEach(function (s) { s.hidden = true; });
    } else {
      document.getElementById('foundingSpots').textContent = P.FOUNDING_SPOTS_LEFT;
    }
  }

  /* ── Build your own plan ── */
  var builder = document.getElementById('builder');
  if (builder) {
    var total = document.getElementById('builderTotal');
    var nudge = document.getElementById('builderNudge');
    var send = document.getElementById('builderSend');

    builder.innerHTML = P.SERVICES.map(function (s) {
      var price = s.comingSoon
        ? '<span class="row-soon">Coming soon</span>'
        : '<span class="row-mo">' + P.money(s.monthly) + '/mo</span>'
          + '<span class="row-setup">' + (s.setup ? '+ ' + P.money(s.setup) + ' setup' : 'No setup fee') + '</span>';
      return '<label class="row' + (s.comingSoon ? ' row--soon' : '') + '">'
        + '<input type="checkbox" value="' + s.id + '"' + (s.comingSoon ? ' disabled' : '') + '>'
        + '<span class="row-icon" aria-hidden="true">' + ICONS[s.icon] + '</span>'
        + '<span class="row-text"><strong>' + s.name + '</strong><span>' + (s.comingSoon ? '' : s.desc) + '</span></span>'
        + '<span class="row-price">' + price + '</span>'
        + '</label>';
    }).join('');

    var update = function () {
      var ids = [].slice.call(builder.querySelectorAll('input:checked')).map(function (i) { return i.value; });
      if (!ids.length) {
        total.textContent = 'Tick services above to see your total.';
        nudge.hidden = true;
        send.hidden = true;
        return;
      }
      var t = P.totals(ids);
      total.innerHTML = '<strong>' + P.money(t.monthly) + '/mo</strong> + ' + P.money(t.setup) + ' setup';
      var best = P.bestPlanFor(ids);
      if (best) {
        nudge.innerHTML = best.plan.name + ' includes all of this for ' + P.money(best.setupSaving)
          + ' less to set up and ' + P.money(best.monthlySaving) + '/mo less. '
          + '<a href="#' + best.plan.id + '">See ' + best.plan.name + ' →</a>';
        nudge.hidden = false;
      } else {
        nudge.hidden = true;
      }
      send.href = P.sendHref(ids);
      send.hidden = false;
    };
    builder.addEventListener('change', update);
  }

  /* ── Lead leak calculator ── */
  if (document.getElementById('calcEnquiries')) {
    var FIELDS = [
      { id: 'calcEnquiries', key: 'enquiries', scale: 1 },
      { id: 'calcMissed', key: 'missedShare', scale: 100 },
      { id: 'calcClose', key: 'closeRate', scale: 100 },
      { id: 'calcJob', key: 'jobValue', scale: 1 }
    ];
    var out = {
      jobs: document.getElementById('calcJobs'),
      monthly: document.getElementById('calcMonthly'),
      yearly: document.getElementById('calcYearly'),
      plans: document.getElementById('calcPlans')
    };
    var render = function () {
      var input = {};
      FIELDS.forEach(function (f) { input[f.key] = Number(document.getElementById(f.id + 'Num').value) / f.scale; });
      var r = P.leakEstimate(input);
      out.jobs.textContent = String(r.jobsLost);
      out.monthly.textContent = P.money(r.monthly);
      out.yearly.textContent = P.money(r.yearly);
      out.plans.innerHTML = P.PLANS.map(function (p) { return '<li>' + P.coverLine(p, input.jobValue) + '</li>'; }).join('');
    };
    FIELDS.forEach(function (f) {
      var range = document.getElementById(f.id), box = document.getElementById(f.id + 'Num');
      range.addEventListener('input', function () { box.value = range.value; render(); });
      box.addEventListener('input', function () { range.value = box.value; render(); });
    });
    render();
  }
})(this);
