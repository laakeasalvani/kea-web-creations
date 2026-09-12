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

  var api = {
    FOUNDING_SPOTS_LEFT: FOUNDING_SPOTS_LEFT, SERVICES: SERVICES, PLANS: PLANS,
    money: money, serviceById: serviceById, totals: totals, bestPlanFor: bestPlanFor,
    leakEstimate: leakEstimate, jobsToCover: jobsToCover
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KeaPricing = api;
})(this);

/* DOM-WIRING-PLACEHOLDER-FOR-TASK-5 */
