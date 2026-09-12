# Growth Repositioning Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-file, hash-routed Kea Web Creations site with a lean multi-page site (Home, Pricing, Contact, Policy, 404) that sells the Capture / Convert / Keep system to home service businesses.

**Architecture:** Plain static HTML pages on GitHub Pages with no build step. All CSS moves from `index.html` into `styles.css`; shared behaviour (nav drawer, scroll reveal, hero canvas fallback, FAQ toggles, legacy `#/` redirects) goes into `site.js`. Prices and pricing logic live once in `pricing.js`, written as pure functions that run in the browser *and* under Node so they can be unit tested; `contact.js` does the same for the form payload. Header and footer are copied as plain HTML into every page.

**Tech Stack:** HTML5, CSS custom properties, vanilla ES5-style JavaScript (matching the existing site), Node 24 built-in test runner (`node --test`) for logic and static-content tests. No npm dependencies.

**Spec:** `docs/superpowers/specs/2026-09-12-growth-repositioning-design.md`

## Global Constraints

- No build step, no npm packages. Tests use only `node:test`, `node:assert` and `node:fs`.
- Run all tests with: `node --test tests/` from the repo root.
- Keep the existing visual system: tokens in `:root` (`--bar:#16203D`, `--accent:#58B0A8`, `--accent-dk:#3E8E87`, `--ink:#1B2233`, `--soft:#5C6577`, `--sand:#F6F4F0`, `--line:#E5E1DA`), fonts Playfair Display / Poppins / Sacramento, the hanging "Kea." tile, `waves.mp4` hero.
- JavaScript style matches the current site: `var`, function expressions, IIFEs, no modules, no arrow functions.
- Phone is displayed as `(808) 306-8792` and linked as `tel:+18083068792`. Email `keawebcreations@gmail.com`.
- Contact form posts to `https://us-west1-capturewithki-69dd3.cloudfunctions.net/keaInquiry`. The function accepts only `name` (max 200), `email` (320), `phone` (50), `website` (300), `interest` (200), `message` (5000), plus `renderedAt` and `honeypot`. Nothing else is sent.
- Prices (verbatim from the spec): plans Capture $750 standard / $400 founding / $250/mo; Convert $1,000 / $500 / $400/mo; Keep $1,500 / $750 / $700/mo. Website only $1,000 + $50/mo. À la carte: Website $1,000 + $50/mo; Missed-call text-back $299 + $149/mo; Local SEO foundations $150 + $125/mo; Email & SMS campaigns $150 + $149/mo; Leads dashboard $0 + $109/mo; Calendar booking $0 + $89/mo; Spam call screening $150 + $75/mo; Google Ads management coming soon.
- Terms (verbatim): standard plans no contract, cancel any time, effective end of current billing month; founding clients 90-day commitment then month-to-month; setup non-refundable; 30 minutes of small updates a month, no rollover, extra time $50/hour, new pages and features quoted; normal texting and calling usage included, unusually high volume billed at cost.
- Banned anywhere in shipped HTML: `Tier 1`, `Tier 2`, `Tier 3`, the whole amounts `$30` and `$40` (not `$300`/`$400`), `portfolio` (case-insensitive), `custom build`, `steady stream`, `make waves`, `Lorem`, `[Client`. No invented reviews, logos, statistics or results.
- Copy never promises customers, rankings or revenue. The calculator is labelled an estimate. Past-customer texts are always described as going to customers who opted in.
- Every page except `404.html` has a unique `<title>`, `<meta name="description">`, `<link rel="canonical">` and `LocalBusiness` JSON-LD. `404.html` has `<meta name="robots" content="noindex">`.
- Work on branch `growth-repositioning`, never directly on `main`.

## File map

| File | Responsibility |
|---|---|
| `styles.css` | Every style rule for every page |
| `site.js` | Drawer, scroll reveal, hero video/canvas, FAQ accordions, footer year, `legacyTarget()` redirect for old `#/` links |
| `pricing.js` | `SERVICES`, `PLANS`, `FOUNDING_SPOTS_LEFT`, pure pricing/calculator functions; renders the builder, founding count and calculator when their elements exist |
| `contact.js` | `composePayload()`, `prefillFromQuery()`; wires the audit form |
| `index.html` | Homepage |
| `pricing.html` | Plans, founding banner, website only, terms, builder, calculator, FAQ |
| `contact.html` | Free lead-leak audit request form |
| `policy.html` | Terms, cancellation, privacy, texting consent |
| `404.html` | Not-found page |
| `tests/helpers.js` | Reads pages, extracts attributes, shared by tests |
| `tests/pricing.test.js` | Pricing and calculator logic |
| `tests/contact.test.js` | Form payload and query prefill |
| `tests/site.test.js` | Legacy redirects, meta tags, banned phrases, internal links, price consistency |
| `README.md` | Updated structure and content notes |

---

### Task 1: Branch, pricing data and pricing logic

**Files:**
- Create: `pricing.js`
- Create: `tests/pricing.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces (global `window.KeaPricing` in the browser, `module.exports` in Node):
  - `SERVICES`: array of `{id, name, desc, icon, setup, monthly, comingSoon?}`; ids `website`, `missed-call`, `seo`, `campaigns`, `dashboard`, `calendar`, `spam`, `ads`.
  - `PLANS`: array of `{id, name, promise, standardSetup, foundingSetup, monthly, serviceIds}`; ids `capture`, `convert`, `keep`.
  - `FOUNDING_SPOTS_LEFT`: number.
  - `money(n) -> string` e.g. `money(1299) === '$1,299'`.
  - `serviceById(id) -> service | undefined`.
  - `totals(ids: string[]) -> {setup: number, monthly: number}` (ignores unknown and coming-soon ids).
  - `bestPlanFor(ids: string[]) -> {plan, setupSaving, monthlySaving} | null`.
  - `leakEstimate({enquiries, missedShare, closeRate, jobValue}) -> {jobsLost, monthly, yearly}` (shares are fractions 0–1).
  - `jobsToCover(planMonthly, jobValue) -> number | null`.

- [ ] **Step 1: Create the branch and commit the approved spec and this plan**

```bash
git checkout -b growth-repositioning
git add docs/superpowers/specs/2026-09-12-growth-repositioning-design.md docs/superpowers/plans/2026-09-12-growth-repositioning.md
git commit -m "Add the growth repositioning spec and implementation plan"
```

Leave `docs/superpowers/plans/2026-08-04-github-username-migration.md` untracked; it is unrelated.

- [ ] **Step 2: Write the failing tests**

Create `tests/pricing.test.js`:

```js
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `node --test tests/`
Expected: FAIL with `Cannot find module '../pricing.js'`.

- [ ] **Step 4: Write `pricing.js` (data and pure functions only)**

```js
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
```

Note: the last line is a marker comment that Task 5 replaces with the page wiring. It is a plain comment and does nothing.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test tests/`
Expected: all 11 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add pricing.js tests/pricing.test.js
git commit -m "Add pricing data and tested pricing and calculator logic"
```

---

### Task 2: Shared stylesheet, shared script, test helpers

**Files:**
- Create: `styles.css`
- Create: `site.js`
- Create: `tests/helpers.js`
- Create: `tests/site.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `styles.css` base classes used by every later task: `.wrap .sec .sec--sand .sec--bar .center .kicker .sub .sec-head .dot .btn .btn--fill .btn--out .btn--white .more .bar .bar-in .nav .nav--r .nav-item .nav-link .nav-cta .tile .tile-script .tile-sub .burger .drawer .drawer-row .hero .hero-vid .hero-sub .hero-actions .down .page-banner .grid .g2 .g3 .split .box .box-img .box-body .checks .faq .faq-q .faq-a .form .f-row .field .ok .err .hp .note .dl .footer .footer-grid .f-links .f-tile .footer-bar .rv .rv.in`.
  - `site.js` global `window.KeaSite = {legacyTarget}`; in Node `module.exports = {legacyTarget}`.
  - `legacyTarget(hash: string) -> string | null`: maps an old `#/…` hash to a new URL, `null` if not a legacy hash.
  - `tests/helpers.js`: `read(file) -> string`, `exists(file) -> boolean`, `attrs(html, tag) -> Array<Object>` (attributes of every `<tag …>`), `ROOT` (repo root path).

- [ ] **Step 1: Write the failing tests**

Create `tests/helpers.js`:

```js
var fs = require('node:fs');
var path = require('node:path');

var ROOT = path.join(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

/* Returns one object per <tag ...> with its double-quoted attributes. */
function attrs(html, tag) {
  var out = [], re = new RegExp('<' + tag + '\\b([^>]*)>', 'gi'), m;
  while ((m = re.exec(html))) {
    var o = {}, a, ar = /([\w:-]+)="([^"]*)"/g;
    while ((a = ar.exec(m[1]))) o[a[1].toLowerCase()] = a[2];
    out.push(o);
  }
  return out;
}

module.exports = { ROOT: ROOT, read: read, exists: exists, attrs: attrs };
```

Create `tests/site.test.js`:

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/`
Expected: FAIL with `Cannot find module '../site.js'` (pricing tests still pass).

- [ ] **Step 3: Create `styles.css`**

This is today's CSS from `index.html` with retired components removed (dropdowns, flags, SPA page switching, case studies, before/after, logos, tools, testimonials, portfolio grid, tier cards, services accordion) and three small additions (`.nav-cta`, `.hero-actions`, JS-gated reveal). Page-specific blocks are appended by later tasks.

```css
/* ═══════════════════════════════════════════════════════════
   KEA WEB CREATIONS — shared styles
   --bar     = dark header / footer / banner background
   --accent  = logo tile, buttons, periods, highlights
   ═══════════════════════════════════════════════════════════ */
:root{
  --bar:#16203D;
  --bar-2:#1D2B4F;
  --accent:#58B0A8;
  --accent-dk:#3E8E87;

  --ink:#1B2233;
  --soft:#5C6577;
  --paper:#fff;
  --sand:#F6F4F0;
  --line:#E5E1DA;

  --serif:"Playfair Display",Georgia,serif;
  --sans:"Poppins",system-ui,sans-serif;
  --script:"Sacramento",cursive;

  --bar-h:84px;
  --tile-w:132px;
  --tile-h:150px;
  --pad:clamp(18px,4.5vw,56px);
  --maxw:1240px;
}

*{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);
  font-family:var(--sans);font-weight:300;font-size:16px;line-height:1.75;overflow-x:hidden}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit;background:none;border:none;cursor:pointer}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
/* .btn sets display, which would otherwise override the hidden attribute */
[hidden]{display:none!important}

h1,h2,h3{font-family:var(--serif);font-weight:500;margin:0;line-height:1.16;text-wrap:balance}
h1{font-size:clamp(2.1rem,4.4vw,3.3rem)}
h2{font-size:clamp(1.8rem,3.4vw,2.7rem)}
h3{font-size:clamp(1.15rem,1.8vw,1.45rem)}
h4,h5{font-family:var(--sans);margin:0}
p{margin:0 0 1.15em}
.dot{color:var(--accent)}

.wrap{max-width:var(--maxw);margin:0 auto;padding-inline:var(--pad)}
.sec{padding-block:clamp(56px,7.5vw,104px)}
.sec--sand{background:var(--sand)}
.sec--bar{background:var(--bar);color:#fff}
.sec--bar h2{color:#fff}
.sec--bar .sub{color:rgba(255,255,255,.72)}
.center{text-align:center}
.center .sub{margin-inline:auto}
.kicker{font-family:var(--sans);font-size:.7rem;font-weight:600;letter-spacing:.22em;
  text-transform:uppercase;color:var(--accent);display:block;margin-bottom:14px}
.sub{color:var(--soft);font-size:1.02rem;max-width:66ch;font-weight:300}
.sec-head{margin-bottom:clamp(30px,4vw,52px)}
.sec-head h2{margin-bottom:14px}

/* ── BUTTONS ── */
.btn{display:inline-block;padding:18px 40px;font-family:var(--sans);font-weight:500;
  font-size:.82rem;letter-spacing:.13em;text-transform:uppercase;transition:background .25s,color .25s,border-color .25s}
.btn--fill{background:var(--accent);color:#fff}
.btn--fill:hover{background:var(--accent-dk)}
.btn--out{border:1px solid var(--accent);color:var(--accent)}
.btn--out:hover{background:var(--accent);color:#fff}
.btn--white{border:1px solid rgba(255,255,255,.8);color:#fff}
.btn--white:hover{background:#fff;color:var(--bar)}
.more{display:inline-block;font-family:var(--sans);font-weight:500;font-size:.78rem;
  letter-spacing:.1em;text-transform:uppercase;color:var(--accent);transition:letter-spacing .2s}
.more:hover{letter-spacing:.16em}

/* ══════ HEADER ══════ */
.bar{position:fixed;inset:0 0 auto;height:var(--bar-h);background:var(--bar);z-index:400}
.bar-in{max-width:1560px;margin:0 auto;height:100%;padding-inline:var(--pad);
  display:flex;align-items:center;justify-content:space-between;gap:12px}
.nav{display:flex;align-items:center;gap:clamp(10px,2.6vw,46px);flex:1}
.nav--r{justify-content:flex-end}
.nav-item{position:relative}
.nav-link{display:flex;align-items:center;gap:8px;padding:30px 0;color:#fff;
  font-family:var(--sans);font-weight:400;font-size:.86rem;letter-spacing:.06em;
  text-transform:uppercase;white-space:nowrap;transition:color .2s}
.nav-link:hover,.nav-link.on{color:var(--accent)}
.nav-cta{padding:12px 22px;font-size:.74rem;white-space:nowrap}

.tile{position:absolute;left:50%;top:0;transform:translateX(-50%);
  width:var(--tile-w);height:var(--tile-h);background:var(--accent);z-index:2;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
  transition:background .25s}
.tile:hover{background:var(--accent-dk)}
.tile-script{font-family:var(--script);font-size:3.5rem;color:#fff;line-height:.85;
  transform:rotate(-4deg);text-shadow:0 1px 6px rgba(0,0,0,.14)}
.tile-sub{font-family:var(--sans);font-weight:500;font-size:.44rem;letter-spacing:.28em;
  text-transform:uppercase;color:rgba(255,255,255,.94);margin-top:8px}

.burger{display:none;width:42px;height:42px;position:relative}
.burger span{position:absolute;left:9px;right:9px;height:2px;background:#fff;transition:.3s}
.burger span:nth-child(1){top:14px}.burger span:nth-child(2){top:20px}.burger span:nth-child(3){top:26px}
.burger.on span:nth-child(1){top:20px;transform:rotate(45deg)}
.burger.on span:nth-child(2){opacity:0}
.burger.on span:nth-child(3){top:20px;transform:rotate(-45deg)}

.drawer{position:fixed;inset:var(--bar-h) 0 0;background:var(--bar);z-index:390;overflow-y:auto;
  padding:12px var(--pad) 60px;transform:translateX(102%);transition:transform .34s cubic-bezier(.5,0,.2,1)}
.drawer.on{transform:none}
.drawer-row{display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left;
  padding:18px 0;border-bottom:1px solid rgba(255,255,255,.14);color:#fff;
  font-family:var(--sans);font-weight:400;font-size:.95rem;letter-spacing:.07em;text-transform:uppercase}

/* ══════ HERO ══════ */
.hero{position:relative;min-height:min(100svh,860px);display:flex;align-items:center;
  background:var(--bar) url('shots/hero-poster.jpg') center/cover no-repeat;
  justify-content:center;overflow:hidden;text-align:center;padding-bottom:80px}
#wave,.hero-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.hero-vid{display:none}
.hero-vid.on{display:block}
.hero::after{content:"";position:absolute;inset:0;z-index:1;
  background:linear-gradient(180deg,rgba(22,32,61,.72),rgba(22,32,61,.46) 45%,rgba(22,32,61,.78))}
.hero .wrap{position:relative;z-index:2;color:#fff;padding-top:calc(var(--bar-h) + 60px)}
.hero h1{font-family:var(--serif);font-weight:400;color:#fff;
  font-size:clamp(2.3rem,6vw,4.6rem);line-height:1.12;letter-spacing:-.005em;max-width:18ch;margin-inline:auto;
  text-shadow:0 2px 26px rgba(0,0,0,.34);margin-bottom:clamp(22px,3vw,34px)}
.hero .hero-sub{font-family:var(--sans);font-weight:300;font-size:clamp(.96rem,1.4vw,1.14rem);
  color:rgba(255,255,255,.92);max-width:58ch;margin:0 auto 40px;line-height:1.7}
.hero-actions{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
.down{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);z-index:3;
  width:40px;height:40px;border:1px solid rgba(255,255,255,.6);border-radius:50%;
  display:grid;place-items:center;color:#fff;animation:bob 2.2s ease-in-out infinite}
.down::before{content:"";width:9px;height:9px;border-right:1.6px solid;border-bottom:1.6px solid;
  transform:translateY(-2px) rotate(45deg)}
@keyframes bob{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,8px)}}

/* ══════ INNER PAGE BANNER ══════ */
.page-banner{background:var(--bar);color:#fff;text-align:center;
  padding:calc(var(--bar-h) + clamp(52px,7vw,96px)) 0 clamp(52px,7vw,96px)}
.page-banner h1{color:#fff}
.page-banner .sub{color:rgba(255,255,255,.74);margin:16px auto 0}

/* ══════ GRIDS / CARDS ══════ */
.grid{display:grid;gap:clamp(18px,2.4vw,30px)}
.g2{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.g3{grid-template-columns:repeat(auto-fit,minmax(270px,1fr))}
.split{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,76px);align-items:center}

.box{background:#fff;border:1px solid var(--line);display:flex;flex-direction:column;overflow:hidden;
  transition:box-shadow .3s,transform .3s}
.box:hover{box-shadow:0 18px 42px rgba(27,34,51,.14);transform:translateY(-4px)}
.box-img{aspect-ratio:16/9;position:relative;overflow:hidden;background:var(--sand)}
.box-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .55s}
.box:hover .box-img img{transform:scale(1.06)}
.box-body{padding:26px 26px 30px;display:flex;flex-direction:column;flex:1}
.box-body h3{margin-bottom:12px}
.box-body p{color:var(--soft);font-size:.92rem;flex:1}
.box-body .more{margin-top:16px;align-self:flex-start}

.checks{list-style:none;padding:0;margin:0}
.checks li{position:relative;padding:14px 0 14px 34px;border-bottom:1px solid var(--line);
  color:var(--soft);font-size:.94rem}
.checks li::before{content:"";position:absolute;left:2px;top:22px;width:13px;height:7px;
  border-left:2px solid var(--accent);border-bottom:2px solid var(--accent);transform:rotate(-45deg)}
.checks li strong{color:var(--ink);font-weight:500}

/* ══════ FAQ ══════ */
.faq{border-bottom:1px solid var(--line)}
.faq-q{display:flex;justify-content:space-between;align-items:center;gap:18px;width:100%;
  text-align:left;padding:22px 0;font-family:var(--serif);font-weight:500;font-size:1.08rem}
.faq-q span:last-child{color:var(--accent);font-size:1.4rem;transition:transform .3s;flex-shrink:0;font-family:var(--sans)}
.faq-q.on span:last-child{transform:rotate(45deg)}
.faq-a{max-height:0;overflow:hidden;transition:max-height .38s ease}
.faq-a.on{max-height:520px}
.faq-a p{color:var(--soft);font-size:.93rem;padding-bottom:20px;margin:0}

/* ══════ FORM ══════ */
.form{display:grid;gap:16px}
.f-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.field label{display:block;font-size:.68rem;font-weight:500;letter-spacing:.15em;
  text-transform:uppercase;color:var(--soft);margin-bottom:7px}
.field input,.field textarea,.field select{width:100%;border:1px solid var(--line);background:#fff;
  padding:13px 15px;font:inherit;font-size:.93rem;color:var(--ink);transition:border-color .2s}
.field input:focus,.field textarea:focus,.field select:focus{border-color:var(--accent);outline:none}
.field textarea{min-height:140px;resize:vertical}
.ok{display:none;padding:14px 16px;background:var(--accent);color:#fff;font-size:.82rem;font-weight:500}
.ok.on{display:block}
.err{display:none;padding:14px 16px;background:#FCE9E6;border-left:2px solid #C0392B;
  color:#8E2C22;font-size:.82rem;font-weight:500;line-height:1.6}
.err.on{display:block}
/* Honeypot: off-screen rather than display:none — some bots skip hidden fields. */
.hp{position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden}
.form button[disabled]{opacity:.55;cursor:progress}
.note{font-size:.79rem;color:var(--soft)}
.dl{margin:0}
.dl div{display:flex;gap:16px;padding:16px 0;border-bottom:1px solid var(--line)}
.dl dt{font-size:.67rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;
  color:var(--accent);width:92px;flex-shrink:0;padding-top:3px}
.dl dd{margin:0;color:var(--soft);font-size:.93rem}
.dl dd a:hover{color:var(--accent)}

/* ══════ FOOTER ══════ */
.footer{background:var(--bar);color:rgba(255,255,255,.7);padding-top:clamp(50px,6vw,84px);font-size:.9rem;font-weight:300}
.footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:clamp(26px,3.6vw,48px);padding-bottom:44px}
.footer h5{font-family:var(--sans);font-weight:600;font-size:.74rem;letter-spacing:.18em;
  text-transform:uppercase;color:#fff;margin-bottom:18px}
.footer a:hover{color:var(--accent)}
.f-links{list-style:none;padding:0;margin:0;display:grid;gap:9px}
.f-links a{transition:padding-left .2s,color .2s}
.f-links a:hover{padding-left:5px}
.f-tile{width:96px;height:110px;background:var(--accent);display:flex;flex-direction:column;
  align-items:center;justify-content:center;margin-bottom:20px}
.f-tile .tile-script{font-size:2.5rem}
.f-tile .tile-sub{font-size:.36rem;margin-top:6px}
.footer-bar{border-top:1px solid rgba(255,255,255,.13);padding-block:22px;display:flex;
  justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:.77rem}
.footer-bar p{margin:0}

/* Reveal is only armed when JavaScript is running, so content never stays hidden. */
.js .rv{opacity:0;transform:translateY(22px);transition:opacity .65s ease,transform .65s ease}
.js .rv.in{opacity:1;transform:none}

@media(max-width:1180px){
  .nav{display:none}
  .burger{display:block}
  .footer-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:760px){
  :root{--bar-h:70px;--tile-w:96px;--tile-h:108px}
  .tile-script{font-size:2.5rem}
  .tile-sub{font-size:.36rem;letter-spacing:.22em}
  .split{grid-template-columns:1fr}
  .f-row{grid-template-columns:1fr}
  .footer-grid{grid-template-columns:1fr;gap:34px}
  .dl div{flex-direction:column;gap:5px}
  .btn{padding:16px 30px;font-size:.76rem}
}
@media(prefers-reduced-motion:reduce){
  *{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
  .js .rv{opacity:1;transform:none}
}

/* PAGE-STYLES-APPENDED-BELOW */
```

- [ ] **Step 4: Create `site.js`**

```js
/* ══════ KEA SITE — shared behaviour for every page ══════ */
(function (root) {
  /* Old single-page links looked like keawebcreations.com/#/contact.
     Anything still pointing there lands on the matching new page. */
  var LEGACY = {
    home: 'index.html', services: 'pricing.html', about: 'index.html#founder',
    faq: 'pricing.html#faq', policy: 'policy.html', contact: 'contact.html',
    portfolio: 'index.html#work'
  };

  function legacyTarget(hash) {
    if (!hash || hash.indexOf('#/') !== 0) return null;
    var key = hash.slice(2).split(/[/?#]/)[0];
    return LEGACY[key] || 'index.html';
  }

  var api = { legacyTarget: legacyTarget };
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  root.KeaSite = api;

  var target = legacyTarget(location.hash);
  if (target) { location.replace(target); return; }

  /* ── Hero: play the video; fall back to the drawn waves if it is missing ── */
  (function () {
    var cv = document.getElementById('wave'); if (!cv) return;
    var vid = document.getElementById('heroVid');
    if (vid && vid.getAttribute('src')) { vid.classList.add('on'); cv.style.display = 'none'; return; }
    var ctx = cv.getContext('2d'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var w, h, dpr;
    function size() { dpr = Math.min(devicePixelRatio || 1, 2); w = cv.offsetWidth; h = cv.offsetHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    var L = [
      { a: .055, l: .0016, s: .00022, y: .58, c: '22,32,61', o: .9, h: .4 },
      { a: .048, l: .0022, s: .00034, y: .66, c: '29,43,79', o: .9, h: .55 },
      { a: .040, l: .0030, s: .00048, y: .74, c: '38,72,92', o: .8, h: .7 },
      { a: .030, l: .0042, s: .00068, y: .83, c: '62,142,135', o: .6, h: .9 },
      { a: .020, l: .0058, s: .00094, y: .91, c: '88,176,168', o: .35, h: 1.1 }
    ];
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#101833'); g.addColorStop(.5, '#1B2C4A'); g.addColorStop(1, '#2E6A6B');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      L.forEach(function (v, i) {
        function yAt(x) { return h * v.y + Math.sin(x * v.l + t * v.s) * (h * v.a)
          + Math.sin(x * v.l * 2.3 + t * v.s * 1.7) * (h * v.a * v.h * .38)
          + Math.sin(x * v.l * .55 - t * v.s * .8) * (h * v.a * .3); }
        ctx.beginPath(); ctx.moveTo(0, h);
        for (var x = 0; x <= w; x += 4) ctx.lineTo(x, yAt(x));
        ctx.lineTo(w, h); ctx.closePath();
        ctx.fillStyle = 'rgba(' + v.c + ',' + v.o + ')'; ctx.fill();
        if (i >= 3) { ctx.beginPath();
          for (var x2 = 0; x2 <= w; x2 += 4) { if (x2 === 0) ctx.moveTo(x2, yAt(x2)); else ctx.lineTo(x2, yAt(x2)); }
          ctx.strokeStyle = 'rgba(224,248,244,' + (i === 4 ? .4 : .18) + ')'; ctx.lineWidth = 1.2; ctx.stroke(); }
      });
    }
    if (reduce) { draw(0); return; }
    var r;
    function loop(n) { draw(n); r = requestAnimationFrame(loop); }
    loop(0);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(r); else loop(performance.now());
    });
  })();

  /* ── Mobile drawer ── */
  (function () {
    var burger = document.getElementById('burger'), drawer = document.getElementById('drawer');
    if (!burger || !drawer) return;
    function shut() { drawer.classList.remove('on'); burger.classList.remove('on');
      burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
    burger.addEventListener('click', function () {
      var o = drawer.classList.toggle('on');
      burger.classList.toggle('on', o);
      burger.setAttribute('aria-expanded', o ? 'true' : 'false');
      document.body.style.overflow = o ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', shut); });
  })();

  /* ── Scroll reveal ── */
  (function () {
    var els = document.querySelectorAll('.rv');
    if (!('IntersectionObserver' in root)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .1 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ── FAQ accordions ── */
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.setAttribute('aria-expanded', 'false');
    q.addEventListener('click', function () {
      var open = q.classList.toggle('on');
      q.nextElementSibling.classList.toggle('on', open);
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ── Footer year ── */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})(this);
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test tests/`
Expected: all pricing tests and the 3 site tests PASS.

- [ ] **Step 6: Commit**

```bash
git add styles.css site.js tests/helpers.js tests/site.test.js
git commit -m "Move shared styles and behaviour into styles.css and site.js"
```

---

### Task 3: Homepage

**Files:**
- Modify (full rewrite): `index.html`
- Modify: `styles.css` (append homepage block at the end)
- Modify: `tests/site.test.js` (append tests)

**Interfaces:**
- Consumes: `styles.css` base classes and `site.js` from Task 2.
- Produces:
  - The **shared header, drawer and footer markup** below. Tasks 4, 6 and 7 copy it verbatim, changing only which `.nav-link` carries `class="nav-link on"`.
  - Homepage anchors used by other pages and by `legacyTarget`: `#work`, `#founder`, `#audit`.
  - Test helpers `checkCommon(file, canonical)` and `BANNED` in `tests/site.test.js`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/site.test.js`:

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/`
Expected: the three new homepage tests FAIL (the old `index.html` has no stylesheet link, contains `Tier 1`, has no `data-plan` cards).

- [ ] **Step 3: Rewrite `index.html`**

Replace the whole file with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Kea Web Creations — Websites &amp; Follow-Up Systems for Home Service Businesses</title>
<meta name="description" content="Stop losing customers who already found you. Websites, missed-call text-back and automatic follow-up for home service businesses in Beaverton and the Pacific Northwest.">
<link rel="canonical" href="https://keawebcreations.com/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Sacramento&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
<script>document.documentElement.className += ' js';</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"LocalBusiness","name":"Kea Web Creations","url":"https://keawebcreations.com/","telephone":"+1-808-306-8792","email":"keawebcreations@gmail.com","address":{"@type":"PostalAddress","addressLocality":"Beaverton","addressRegion":"OR","addressCountry":"US"},"areaServed":"Pacific Northwest"}
</script>
</head>
<body>

<!-- ══════════ HEADER (shared — copy to every page, move class "on") ══════════ -->
<header class="bar">
  <div class="bar-in">
    <nav class="nav" aria-label="Main left">
      <a class="nav-link on" href="index.html">Home</a>
      <a class="nav-link" href="pricing.html">Pricing</a>
    </nav>

    <a class="tile" href="index.html" aria-label="Kea Web Creations home">
      <span class="tile-script">Kea.</span>
      <span class="tile-sub">Web Creations</span>
    </a>

    <nav class="nav nav--r" aria-label="Main right">
      <a class="nav-link" href="contact.html">Contact</a>
      <a class="btn btn--fill nav-cta" href="contact.html?plan=audit">Get a free audit</a>
    </nav>

    <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span><span></span></button>
  </div>
</header>

<div class="drawer" id="drawer">
  <a class="drawer-row" href="index.html">Home</a>
  <a class="drawer-row" href="pricing.html">Pricing</a>
  <a class="drawer-row" href="contact.html">Contact</a>
  <a class="btn btn--fill" href="contact.html?plan=audit" style="margin-top:28px">Get a free audit</a>
</div>
<!-- ══════════ END HEADER ══════════ -->

<main>

  <!-- 1. HERO -->
  <div class="hero">
    <video class="hero-vid" id="heroVid" autoplay muted loop playsinline preload="auto"
           poster="shots/hero-poster.jpg" src="waves.mp4"></video>
    <canvas id="wave" aria-hidden="true"></canvas>
    <div class="wrap">
      <h1>Stop losing customers who already found you<span class="dot">.</span></h1>
      <p class="hero-sub">Websites and follow-up systems for home service businesses in Beaverton and the Pacific Northwest — so every call, form and estimate request gets answered, followed up and booked.</p>
      <div class="hero-actions">
        <a class="btn btn--fill" href="contact.html?plan=audit">Get a free lead-leak audit</a>
        <a class="btn btn--white" href="pricing.html">See plans</a>
      </div>
    </div>
    <a class="down" href="#problem" aria-label="Scroll down"></a>
  </div>

  <!-- 2. THE PROBLEM -->
  <section class="sec" id="problem">
    <div class="wrap">
      <div class="sec-head rv">
        <span class="kicker">The problem</span>
        <h2>You're on a job when the phone rings<span class="dot">.</span></h2>
        <p class="sub">The work is out there. The leaks are in what happens after someone reaches out.</p>
      </div>
      <div class="grid g3">
        <div class="leak rv">
          <h3>Missed calls</h3>
          <p>You can't answer from a ladder. If nobody picks up, the next company on the list is one tap away.</p>
        </div>
        <div class="leak rv">
          <h3>Estimate requests that go quiet</h3>
          <p>A form comes in at 9pm. By the time you reply, they've booked whoever answered first.</p>
        </div>
        <div class="leak rv">
          <h3>Customers who forget you</h3>
          <p>You did great work last spring. This spring, they can't remember your name.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 3. LEAD JOURNEY COMPARISON -->
  <section class="sec sec--sand" id="journey">
    <div class="wrap">
      <div class="sec-head center rv">
        <span class="kicker">Same homeowner, two outcomes</span>
        <h2>A website alone doesn't answer the phone<span class="dot">.</span></h2>
      </div>
      <div class="journey">
        <div class="path path--lose rv">
          <h3>Without a system</h3>
          <ol>
            <li>Searches “AC repair near me” and finds you</li>
            <li>Calls while you're on a roof</li>
            <li>Gets your voicemail</li>
            <li>Calls the next company</li>
          </ol>
          <p class="path-end">Job lost</p>
        </div>
        <div class="path path--win rv">
          <h3>With the Kea system</h3>
          <ol>
            <li>Searches “AC repair near me” and finds you</li>
            <li>Calls while you're on a roof</li>
            <li>Gets a text back in seconds</li>
            <li>Books an estimate from the text</li>
            <li>Gets a reminder the day before</li>
            <li>Is asked for a review after the job</li>
            <li>Gets a tune-up reminder next spring</li>
          </ol>
          <p class="path-end">Repeat customer</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 4. THE KEA SYSTEM -->
  <section class="sec" id="system">
    <div class="wrap">
      <div class="sec-head rv">
        <span class="kicker">The Kea system</span>
        <h2>Three stages. One system<span class="dot">.</span></h2>
        <p class="sub">Each plan adds the next stage. It runs automatically, and every lead lands in one inbox on your phone.</p>
      </div>
      <div class="grid g3">
        <div class="stage rv">
          <span class="stage-num">Stage 1</span>
          <h3>Capture</h3>
          <p class="stage-promise">Every call and form caught and answered in seconds.</p>
          <p>Lead forms, missed-call text-back and one inbox with a mobile app.</p>
          <a class="more" href="pricing.html#capture">See Capture →</a>
        </div>
        <div class="stage rv">
          <span class="stage-num">Stage 2</span>
          <h3>Convert</h3>
          <p class="stage-promise">Every lead followed up and booked for an estimate.</p>
          <p>Automatic follow-up, online estimate booking and review requests after every job.</p>
          <a class="more" href="pricing.html#convert">See Convert →</a>
        </div>
        <div class="stage rv">
          <span class="stage-num">Stage 3</span>
          <h3>Keep</h3>
          <p class="stage-promise">Past customers come back for seasonal and repeat work.</p>
          <p>Seasonal reminders, past-customer campaigns and referral follow-ups.</p>
          <a class="more" href="pricing.html#keep">See Keep →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- 5. PLANS PREVIEW — prices must match PLANS in pricing.js (tests check) -->
  <section class="sec sec--sand" id="plans">
    <div class="wrap">
      <div class="sec-head center rv">
        <span class="kicker">Pricing</span>
        <h2>Simple monthly plans<span class="dot">.</span></h2>
        <p class="sub">No contract on standard plans. Founding pricing for the first five home service businesses.</p>
      </div>
      <div class="grid g3">
        <article class="plan-mini rv" data-plan="capture" data-setup="750" data-monthly="250">
          <h3>Capture</h3>
          <p class="plan-promise">Every call and form caught and answered in seconds.</p>
          <p class="plan-price">$250<small>/mo</small></p>
          <p class="plan-setup">+ $750 setup</p>
          <ul class="checks">
            <li>Website built for your business</li>
            <li>Missed-call text-back</li>
            <li>One leads inbox with a mobile app</li>
          </ul>
          <a class="btn btn--out" href="pricing.html#capture">See Capture</a>
        </article>
        <article class="plan-mini plan-mini--hot rv" data-plan="convert" data-setup="1000" data-monthly="400">
          <span class="tag">Most popular</span>
          <h3>Convert</h3>
          <p class="plan-promise">Every lead followed up and booked for an estimate.</p>
          <p class="plan-price">$400<small>/mo</small></p>
          <p class="plan-setup">+ $1,000 setup</p>
          <ul class="checks">
            <li>Everything in Capture</li>
            <li>Automatic follow-up and estimate booking</li>
            <li>Review requests after every job</li>
          </ul>
          <a class="btn btn--fill" href="pricing.html#convert">See Convert</a>
        </article>
        <article class="plan-mini rv" data-plan="keep" data-setup="1500" data-monthly="700">
          <h3>Keep</h3>
          <p class="plan-promise">Past customers come back for seasonal and repeat work.</p>
          <p class="plan-price">$700<small>/mo</small></p>
          <p class="plan-setup">+ $1,500 setup</p>
          <ul class="checks">
            <li>Everything in Convert</li>
            <li>Seasonal reminders and past-customer campaigns</li>
            <li>Referral follow-ups and priority support</li>
          </ul>
          <a class="btn btn--out" href="pricing.html#keep">See Keep</a>
        </article>
      </div>
      <p class="center" style="margin-top:34px"><a class="more" href="pricing.html">Compare plans or build your own →</a></p>
    </div>
  </section>

  <!-- 6. PROOF — real sites only. Reviews and case studies are added when real ones exist. -->
  <section class="sec" id="work">
    <div class="wrap">
      <div class="sec-head rv">
        <span class="kicker">The work</span>
        <h2>Sites I've built<span class="dot">.</span></h2>
        <p class="sub">Real sites, live right now.</p>
      </div>
      <div class="grid g3">
        <a class="box rv" href="https://capturewithki.com" target="_blank" rel="noopener">
          <div class="box-img"><img src="shots/capturewithki.jpg" alt="Homepage of CaptureWithKi" loading="lazy"></div>
          <div class="box-body"><h3>CaptureWithKi</h3>
            <p>A photography site with a custom client-gallery system — private galleries, self-serve delivery, and galleries that tidy themselves up after each shoot.</p>
            <span class="more">Visit the site →</span></div>
        </a>
        <a class="box rv" href="https://rosie-rowe.mykajabi.com/" target="_blank" rel="noopener">
          <div class="box-img"><img src="shots/ldah.jpg" alt="Homepage of LDAH Hawaiʻi" loading="lazy"></div>
          <div class="box-body"><h3>LDAH Hawaiʻi</h3>
            <p>A certification program training IEP advocates through Bronze, Silver and Gold tiers, with a built-in accessibility toolbar for read-aloud, contrast and text sizing.</p>
            <span class="more">Visit the site →</span></div>
        </a>
        <a class="box rv" href="https://laakeasalvani.github.io/madebyhaaans/" target="_blank" rel="noopener">
          <div class="box-img"><img src="shots/madebyhaaans.jpg" alt="Homepage of madebyhaaans" loading="lazy"></div>
          <div class="box-body"><h3>madebyhaaans</h3>
            <p>A one-page site for a home baker in Kakaʻako, Honolulu — a scrolling flavour picker, take-and-bake instructions, and ordering that hands straight off to Instagram.</p>
            <span class="more">Visit the site →</span></div>
        </a>
      </div>
    </div>
  </section>

  <!-- 7. FOUNDER -->
  <section class="sec sec--sand" id="founder">
    <div class="wrap split">
      <div class="founder-photo rv"><img src="images/laakea.jpg" alt="La'akea Salvani, founder of Kea Web Creations" loading="lazy"></div>
      <div class="rv">
        <span class="kicker">Who you'll deal with</span>
        <h2>When you call, you reach me<span class="dot">.</span></h2>
        <p class="sub" style="margin-top:18px">Kea Web Creations is one person: me, La'akea. I build your website, set up your system and answer when something needs fixing. No account managers, no ticket queue.</p>
        <p class="sub">I'm based in Beaverton, Oregon, and work with home service businesses across the Pacific Northwest.</p>
        <ul class="checks">
          <li><strong>Straight pricing</strong> — setup and monthly prices are on the page</li>
          <li><strong>Your accounts stay yours</strong> — domain, Google profile, website files and contacts</li>
          <li><strong>Local and reachable</strong> — same time zone, replies within one business day</li>
        </ul>
        <a class="btn btn--out" href="tel:+18083068792" style="margin-top:26px">Call (808) 306-8792</a>
      </div>
    </div>
  </section>

  <!-- 8. AUDIT CTA -->
  <section class="sec sec--bar" id="audit">
    <div class="wrap split" style="align-items:start">
      <div class="rv">
        <span class="kicker">Free lead-leak audit</span>
        <h2>Find out where you're losing customers<span class="dot">.</span></h2>
        <p class="sub" style="margin-top:18px">I'll check the places enquiries slip away and send you what I find. No pitch, no obligation.</p>
        <a class="btn btn--fill" href="contact.html?plan=audit" style="margin-top:14px">Get my free audit</a>
      </div>
      <ul class="audit-list rv">
        <li>How easy it is to contact you from your website</li>
        <li>Your Google Business Profile</li>
        <li>What happens when someone calls after hours</li>
        <li>How fast an enquiry gets a reply</li>
        <li>Your reviews, and how you ask for them</li>
      </ul>
    </div>
  </section>

</main>

<!-- ══════════ FOOTER (shared — copy to every page) ══════════ -->
<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="f-tile" href="index.html" aria-label="Kea Web Creations home">
          <span class="tile-script">Kea.</span><span class="tile-sub">Web Creations</span>
        </a>
        <p>Beaverton, Oregon<br>Serving home service businesses across the Pacific Northwest</p>
        <p><a href="tel:+18083068792">(808) 306-8792</a><br><a href="mailto:keawebcreations@gmail.com">keawebcreations@gmail.com</a></p>
        <a class="btn btn--fill" href="contact.html?plan=audit" style="margin-top:8px">Get a free audit</a>
      </div>
      <div><h5>Pages</h5><ul class="f-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="pricing.html">Pricing</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="policy.html">Policy</a></li></ul></div>
      <div><h5>The Kea system</h5><ul class="f-links">
        <li><a href="pricing.html#capture">Capture</a></li>
        <li><a href="pricing.html#convert">Convert</a></li>
        <li><a href="pricing.html#keep">Keep</a></li>
        <li><a href="pricing.html#build">Build your own plan</a></li></ul></div>
    </div>
    <div class="footer-bar">
      <p>Kea Web Creations © <span id="yr"></span> All rights reserved</p>
      <p>Beaverton, Oregon</p>
    </div>
  </div>
</footer>
<!-- ══════════ END FOOTER ══════════ -->

<script src="site.js"></script>
</body>
</html>
```

- [ ] **Step 4: Append the homepage styles to `styles.css`**

Add at the end of `styles.css`, below `/* PAGE-STYLES-APPENDED-BELOW */`:

```css
/* ══════ HOME ══════ */
.leak{border-top:2px solid var(--accent);padding-top:22px}
.leak h3{margin-bottom:10px}
.leak p{color:var(--soft);font-size:.95rem;margin:0}

.journey{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(18px,2.4vw,30px);align-items:start}
.path{background:#fff;border:1px solid var(--line);padding:clamp(24px,3vw,36px)}
.path h3{margin-bottom:18px}
.path ol{list-style:none;margin:0;padding:0;counter-reset:step}
.path li{counter-increment:step;position:relative;padding:10px 0 10px 40px;border-bottom:1px solid var(--line);
  color:var(--soft);font-size:.93rem}
.path li::before{content:counter(step);position:absolute;left:0;top:10px;width:26px;height:26px;border-radius:50%;
  display:grid;place-items:center;font-size:.72rem;font-weight:600;background:var(--sand);color:var(--ink)}
.path-end{margin:18px 0 0;font-family:var(--sans);font-weight:600;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase}
.path--lose .path-end{color:#A5432F}
.path--win{border-color:var(--accent)}
.path--win li::before{background:var(--accent);color:#fff}
.path--win .path-end{color:var(--accent-dk)}

.stage{background:#fff;border:1px solid var(--line);padding:clamp(24px,3vw,34px);display:flex;flex-direction:column}
.stage-num{font-size:.68rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:10px}
.stage h3{margin-bottom:10px}
.stage-promise{font-family:var(--serif);font-size:1.08rem;color:var(--ink);line-height:1.5}
.stage p{color:var(--soft);font-size:.92rem}
.stage .more{margin-top:auto}

.plan-mini{position:relative;background:#fff;border:1px solid var(--line);padding:clamp(26px,3vw,36px);display:flex;flex-direction:column}
.plan-mini--hot{border:2px solid var(--accent)}
.plan-mini h3{margin-bottom:8px}
.plan-promise{color:var(--soft);font-size:.93rem;min-height:3.2em}
.plan-price{font-family:var(--serif);font-size:clamp(2rem,3vw,2.5rem);line-height:1;margin:6px 0 6px;font-variant-numeric:tabular-nums}
.plan-price small{font-family:var(--sans);font-size:.9rem;color:var(--soft);margin-left:4px}
.plan-setup{color:var(--soft);font-size:.86rem;margin-bottom:16px;font-variant-numeric:tabular-nums}
.plan-mini .checks{margin-bottom:24px;flex:1}
.plan-mini .btn{align-self:flex-start}
.tag{position:absolute;top:-13px;left:clamp(26px,3vw,36px);background:var(--accent);color:#fff;
  font-size:.64rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;padding:5px 12px}

.founder-photo{aspect-ratio:4/5;position:relative;overflow:hidden;background:var(--bar)}
.founder-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}

.audit-list{list-style:none;margin:0;padding:0}
.audit-list li{position:relative;padding:16px 0 16px 34px;border-bottom:1px solid rgba(255,255,255,.16);
  color:rgba(255,255,255,.88);font-size:.96rem}
.audit-list li::before{content:"";position:absolute;left:2px;top:24px;width:13px;height:7px;
  border-left:2px solid var(--accent);border-bottom:2px solid var(--accent);transform:rotate(-45deg)}

@media(max-width:760px){
  .journey{grid-template-columns:1fr}
  .plan-promise{min-height:0}
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test tests/`
Expected: all tests PASS.

- [ ] **Step 6: Check it in the browser**

Start the preview server named `kea-web-creations` from `.claude/launch.json` (port 4321) and open `http://localhost:4321/`. Confirm: the waves video plays behind the hero; the header shows Home · Pricing · tile · Contact · Get a free audit; at 375px wide the burger opens the drawer; `http://localhost:4321/#/contact` redirects to `contact.html` (404 until Task 6 — the redirect itself is what is being checked); no console errors.

- [ ] **Step 7: Commit**

```bash
git add index.html styles.css tests/site.test.js
git commit -m "Rebuild the homepage around losing leads and the Kea system"
```

---

### Task 4: Pricing page — plans, founding offer, website only, terms, FAQ

**Files:**
- Create: `pricing.html`
- Modify: `styles.css` (append pricing block)
- Modify: `tests/site.test.js` (append tests)

**Interfaces:**
- Consumes: shared header/footer markup from Task 3 (with `class="nav-link on"` moved to Pricing), `checkCommon` and `BANNED` from Task 3, `PLANS` from Task 1.
- Produces, for Task 5:
  - `#foundingBanner` containing `<span id="foundingSpots">5</span>`.
  - `#builder` (empty container), `#builderTotal`, `#builderNudge`, `#builderSend` (an `<a>`).
  - Calculator inputs `#calcEnquiries`, `#calcMissed`, `#calcClose`, `#calcJob` (each `type="range"`) with paired number inputs `#calcEnquiriesNum`, `#calcMissedNum`, `#calcCloseNum`, `#calcJobNum`; outputs `#calcJobs`, `#calcMonthly`, `#calcYearly`, `#calcPlans` (a `<ul>`).
  - Anchors `#capture`, `#convert`, `#keep`, `#website-only`, `#build`, `#calculator`, `#faq`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/site.test.js`:

```js
test('pricing page has the shared essentials', function () {
  checkCommon('pricing.html', 'https://keawebcreations.com/pricing.html');
});

test('pricing plan cards match PLANS exactly', function () {
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/`
Expected: the four new pricing tests FAIL with `ENOENT` for `pricing.html`.

- [ ] **Step 3: Create `pricing.html`**

Copy `<head>` from `index.html` and change only the title, description and canonical; copy the header, drawer and footer blocks verbatim from `index.html`, moving `class="nav-link on"` from Home to Pricing. The JSON-LD `url` stays `https://keawebcreations.com/`. Full file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Pricing — Capture, Convert &amp; Keep Plans | Kea Web Creations</title>
<meta name="description" content="Monthly plans for home service businesses: a website, missed-call text-back, automatic follow-up, estimate booking and past-customer campaigns. No contract on standard plans.">
<link rel="canonical" href="https://keawebcreations.com/pricing.html">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Sacramento&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
<script>document.documentElement.className += ' js';</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"LocalBusiness","name":"Kea Web Creations","url":"https://keawebcreations.com/","telephone":"+1-808-306-8792","email":"keawebcreations@gmail.com","address":{"@type":"PostalAddress","addressLocality":"Beaverton","addressRegion":"OR","addressCountry":"US"},"areaServed":"Pacific Northwest"}
</script>
</head>
<body>

<!-- ══════════ HEADER (shared) ══════════ -->
<header class="bar">
  <div class="bar-in">
    <nav class="nav" aria-label="Main left">
      <a class="nav-link" href="index.html">Home</a>
      <a class="nav-link on" href="pricing.html">Pricing</a>
    </nav>

    <a class="tile" href="index.html" aria-label="Kea Web Creations home">
      <span class="tile-script">Kea.</span>
      <span class="tile-sub">Web Creations</span>
    </a>

    <nav class="nav nav--r" aria-label="Main right">
      <a class="nav-link" href="contact.html">Contact</a>
      <a class="btn btn--fill nav-cta" href="contact.html?plan=audit">Get a free audit</a>
    </nav>

    <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span><span></span></button>
  </div>
</header>

<div class="drawer" id="drawer">
  <a class="drawer-row" href="index.html">Home</a>
  <a class="drawer-row" href="pricing.html">Pricing</a>
  <a class="drawer-row" href="contact.html">Contact</a>
  <a class="btn btn--fill" href="contact.html?plan=audit" style="margin-top:28px">Get a free audit</a>
</div>
<!-- ══════════ END HEADER ══════════ -->

<main>

  <div class="page-banner">
    <div class="wrap">
      <h1>Simple pricing for home service businesses<span class="dot">.</span></h1>
      <p class="sub">Every plan includes a website built for your business. The difference is how much of the follow-up runs for you.</p>
    </div>
  </div>

  <!-- FOUNDING OFFER — pricing.js hides this when FOUNDING_SPOTS_LEFT is 0 -->
  <div class="founding" id="foundingBanner">
    <div class="wrap founding-in">
      <p><strong>Founding clients:</strong> the first five home service businesses get founding setup pricing in exchange for a 90-day commitment and permission to share their before-and-after numbers.</p>
      <p class="founding-count"><span id="foundingSpots">5</span> of 5 spots left</p>
    </div>
  </div>

  <!-- PLANS — prices must match PLANS in pricing.js (tests check) -->
  <section class="sec" id="plans">
    <div class="wrap">
      <div class="plans">
        <article class="plan rv" id="capture" data-plan="capture" data-setup="750" data-founding="400" data-monthly="250">
          <span class="plan-stage">Stage 1</span>
          <h2 class="plan-name">Capture</h2>
          <p class="plan-promise">Every call and form caught and answered in seconds.</p>
          <p class="plan-price">$250<small>/mo</small></p>
          <p class="plan-setup">$750 setup <span>· founding $400</span></p>
          <ul class="checks">
            <li>Website built for your business, hosting, and 30 minutes of updates a month</li>
            <li>Lead forms and one leads inbox with a mobile app</li>
            <li>Missed-call text-back</li>
            <li>Google Business Profile setup</li>
          </ul>
          <a class="btn btn--out" href="contact.html?plan=capture">Start with Capture</a>
        </article>

        <article class="plan plan--hot rv" id="convert" data-plan="convert" data-setup="1000" data-founding="500" data-monthly="400">
          <span class="tag">Most popular</span>
          <span class="plan-stage">Stage 2</span>
          <h2 class="plan-name">Convert</h2>
          <p class="plan-promise">Every lead followed up and booked for an estimate.</p>
          <p class="plan-price">$400<small>/mo</small></p>
          <p class="plan-setup">$1,000 setup <span>· founding $500</span></p>
          <ul class="checks">
            <li><strong>Everything in Capture</strong></li>
            <li>Automatic follow-up for new leads by text and email</li>
            <li>Online estimate booking calendar</li>
            <li>Automatic Google review requests</li>
            <li>Local SEO foundations</li>
            <li>Monthly results report</li>
          </ul>
          <a class="btn btn--fill" href="contact.html?plan=convert">Start with Convert</a>
        </article>

        <article class="plan rv" id="keep" data-plan="keep" data-setup="1500" data-founding="750" data-monthly="700">
          <span class="plan-stage">Stage 3</span>
          <h2 class="plan-name">Keep</h2>
          <p class="plan-promise">Past customers come back for seasonal and repeat work.</p>
          <p class="plan-price">$700<small>/mo</small></p>
          <p class="plan-setup">$1,500 setup <span>· founding $750</span></p>
          <ul class="checks">
            <li><strong>Everything in Convert</strong></li>
            <li>Past-customer campaigns by email, and by text to customers who opted in</li>
            <li>Seasonal maintenance reminders</li>
            <li>Referral follow-ups</li>
            <li>Automatic review replies and website chat</li>
            <li>Spam call screening</li>
            <li>Priority support and a quarterly strategy call</li>
          </ul>
          <a class="btn btn--out" href="contact.html?plan=keep">Start with Keep</a>
        </article>
      </div>

      <p class="fineprint">Google Ads management is coming soon as an add-on.</p>

      <div class="website-only rv" id="website-only">
        <div>
          <span class="kicker">Just need a website?</span>
          <h3>Website only — $1,000 setup + $50/mo</h3>
          <p>A website built for your business, hosting, and 30 minutes of updates a month. Capture costs less to set up than a website alone — and answers your missed calls.</p>
        </div>
        <a class="btn btn--out" href="contact.html?plan=website">Ask about a website</a>
      </div>

      <ul class="terms">
        <li>No contract on standard plans</li>
        <li>Setup fees are non-refundable</li>
        <li>30 minutes of updates every month</li>
        <li>Your domain, website and contacts stay yours</li>
      </ul>
    </div>
  </section>

  <!-- BUILD YOUR OWN PLAN — rows are rendered by pricing.js from SERVICES -->
  <section class="sec sec--sand" id="build">
    <div class="wrap">
      <div class="sec-head rv">
        <span class="kicker">Build your own plan</span>
        <h2>Only need one or two pieces<span class="dot">?</span></h2>
        <p class="sub">These are standalone prices. If you need two or more services, a plan above almost always costs less and includes more — follow-up, review requests, reminders and reports aren't sold on their own.</p>
      </div>
      <div class="builder">
        <div class="builder-head">
          <p>Tick what you need and the total updates as you go.</p>
        </div>
        <div id="builder"></div>
        <noscript><p class="builder-empty">Turn on JavaScript to build a plan, or <a href="contact.html">ask me for prices</a>.</p></noscript>
        <div class="builder-foot">
          <p class="builder-total" id="builderTotal" aria-live="polite">Tick services above to see your total.</p>
          <p class="builder-nudge" id="builderNudge" hidden></p>
          <a class="btn btn--fill" id="builderSend" href="contact.html?plan=custom" hidden>Send me this plan</a>
        </div>
      </div>
    </div>
  </section>

  <!-- LEAD LEAK CALCULATOR -->
  <section class="sec" id="calculator">
    <div class="wrap split" style="align-items:start">
      <div class="rv">
        <span class="kicker">Lead leak calculator</span>
        <h2>What are missed leads costing you<span class="dot">?</span></h2>
        <p class="sub" style="margin-top:18px">Example numbers — change them to yours. This is an estimate, not a promise.</p>
        <div class="calc">
          <div class="calc-row">
            <label for="calcEnquiries">Calls and forms per month</label>
            <div class="calc-inputs">
              <input type="range" id="calcEnquiries" min="0" max="300" step="1" value="40">
              <input type="number" id="calcEnquiriesNum" min="0" max="10000" step="1" value="40" aria-label="Calls and forms per month">
            </div>
          </div>
          <div class="calc-row">
            <label for="calcMissed">Share missed or answered too slowly (%)</label>
            <div class="calc-inputs">
              <input type="range" id="calcMissed" min="0" max="100" step="1" value="25">
              <input type="number" id="calcMissedNum" min="0" max="100" step="1" value="25" aria-label="Share missed or answered too slowly, percent">
            </div>
          </div>
          <div class="calc-row">
            <label for="calcClose">Share of answered enquiries that become jobs (%)</label>
            <div class="calc-inputs">
              <input type="range" id="calcClose" min="0" max="100" step="1" value="35">
              <input type="number" id="calcCloseNum" min="0" max="100" step="1" value="35" aria-label="Share of answered enquiries that become jobs, percent">
            </div>
          </div>
          <div class="calc-row">
            <label for="calcJob">Average job value ($)</label>
            <div class="calc-inputs">
              <input type="range" id="calcJob" min="0" max="5000" step="25" value="450">
              <input type="number" id="calcJobNum" min="0" max="100000" step="25" value="450" aria-label="Average job value in dollars">
            </div>
          </div>
        </div>
      </div>
      <div class="calc-out rv" aria-live="polite">
        <p class="calc-label">Estimated jobs lost each month</p>
        <p class="calc-big" id="calcJobs">3.5</p>
        <p class="calc-label">Estimated revenue lost</p>
        <p class="calc-big"><span id="calcMonthly">$1,575</span><small>/mo</small></p>
        <p class="calc-year"><span id="calcYearly">$18,900</span> a year</p>
        <ul class="calc-plans" id="calcPlans">
          <li>Capture is $250/mo — about 1 job a month covers it.</li>
          <li>Convert is $400/mo — about 1 job a month covers it.</li>
          <li>Keep is $700/mo — about 2 jobs a month cover it.</li>
        </ul>
        <p class="calc-formula">Calls and forms × share missed × share that become jobs × job value</p>
      </div>
    </div>
  </section>

  <!-- PRICING FAQ -->
  <section class="sec sec--sand" id="faq">
    <div class="wrap" style="max-width:880px">
      <div class="sec-head center rv"><span class="kicker">Questions</span><h2>Before you ask<span class="dot">.</span></h2></div>
      <div class="faq"><button class="faq-q">What does the setup fee cover? <span>+</span></button>
        <div class="faq-a"><p>Building your website, setting up your leads inbox and texting number, installing the automations for your plan, registering your business for texting with the phone carriers, testing everything end to end, and a walkthrough call before launch.</p></div></div>
      <div class="faq"><button class="faq-q">What's the difference between standard and founding pricing? <span>+</span></button>
        <div class="faq-a"><p>The first five home service businesses pay the founding setup fee in exchange for a 90-day commitment and permission to share their before-and-after numbers. After those spots are gone, standard pricing applies with no commitment. The monthly price is the same either way.</p></div></div>
      <div class="faq"><button class="faq-q">Are texts and calls included? <span>+</span></button>
        <div class="faq-a"><p>Normal texting and calling for your business is included in your monthly price. If your volume is unusually high — large text campaigns, for example — the extra is billed at cost, and you'll hear from me before it is.</p></div></div>
      <div class="faq"><button class="faq-q">How long does setup take? <span>+</span></button>
        <div class="faq-a"><p>It depends mostly on how quickly I get your content and account access, and you'll get a timeline before you pay. Texting registration with the carriers usually takes from a few days to a few weeks; texting features switch on as soon as it's approved.</p></div></div>
      <div class="faq"><button class="faq-q">What counts as an update? <span>+</span></button>
        <div class="faq-a"><p>Each month includes 30 minutes of small updates — hours, prices, phone numbers, photos and text changes. Unused time doesn't roll over. Time past 30 minutes is $50 an hour, and new pages or features are quoted before any work starts.</p></div></div>
      <div class="faq"><button class="faq-q">What happens if I cancel? <span>+</span></button>
        <div class="faq-a"><p>Standard plans have no contract: cancel any time and it takes effect at the end of that billing month. Your domain, Google Business Profile, reviews and website files are yours, your contacts are exported to you, and you can move your texting number within 30 days. <a class="more" href="policy.html#cancellation">Full cancellation details →</a></p></div></div>
      <div class="faq"><button class="faq-q">Will Local SEO get me to the top of Google? <span>+</span></button>
        <div class="faq-a"><p>Not a ranking guarantee — nobody can honestly promise one. Local SEO foundations covers the work that helps you show up: service and town keywords, on-page fixes, Google Business Profile optimization and ongoing site improvements.</p></div></div>
      <div class="faq"><button class="faq-q">Do the plans bring me new leads? <span>+</span></button>
        <div class="faq-a"><p>The plans make sure the leads you already get are answered, followed up and brought back. Google Ads management is coming soon for businesses that want more leads on top.</p></div></div>
    </div>
  </section>

  <section class="sec sec--bar center">
    <div class="wrap">
      <h2>Not sure which plan fits<span class="dot">?</span></h2>
      <p class="sub" style="margin:16px auto 30px">Start with a free lead-leak audit. I'll show you where enquiries slip away, and which plan — if any — fixes it.</p>
      <a class="btn btn--fill" href="contact.html?plan=audit">Get my free audit</a>
    </div>
  </section>

</main>

<!-- ══════════ FOOTER (shared) — copy verbatim from index.html ══════════ -->
<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="f-tile" href="index.html" aria-label="Kea Web Creations home">
          <span class="tile-script">Kea.</span><span class="tile-sub">Web Creations</span>
        </a>
        <p>Beaverton, Oregon<br>Serving home service businesses across the Pacific Northwest</p>
        <p><a href="tel:+18083068792">(808) 306-8792</a><br><a href="mailto:keawebcreations@gmail.com">keawebcreations@gmail.com</a></p>
        <a class="btn btn--fill" href="contact.html?plan=audit" style="margin-top:8px">Get a free audit</a>
      </div>
      <div><h5>Pages</h5><ul class="f-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="pricing.html">Pricing</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="policy.html">Policy</a></li></ul></div>
      <div><h5>The Kea system</h5><ul class="f-links">
        <li><a href="pricing.html#capture">Capture</a></li>
        <li><a href="pricing.html#convert">Convert</a></li>
        <li><a href="pricing.html#keep">Keep</a></li>
        <li><a href="pricing.html#build">Build your own plan</a></li></ul></div>
    </div>
    <div class="footer-bar">
      <p>Kea Web Creations © <span id="yr"></span> All rights reserved</p>
      <p>Beaverton, Oregon</p>
    </div>
  </div>
</footer>

<script src="site.js"></script>
<script src="pricing.js"></script>
</body>
</html>
```

- [ ] **Step 4: Append pricing styles to `styles.css`**

```css
/* ══════ PRICING ══════ */
.founding{background:var(--sand);border-bottom:1px solid var(--line)}
.founding-in{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 30px;padding-block:18px}
.founding p{margin:0;font-size:.92rem;color:var(--ink);max-width:80ch}
.founding strong{font-weight:600}
.founding-count{font-weight:600;color:var(--accent-dk);white-space:nowrap;font-variant-numeric:tabular-nums}

.plans{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(18px,2.4vw,28px);align-items:stretch}
.plan{position:relative;background:#fff;border:1px solid var(--line);padding:clamp(28px,3vw,38px);display:flex;flex-direction:column;scroll-margin-top:calc(var(--bar-h) + 70px)}
.plan--hot{border:2px solid var(--accent)}
.plan-stage{font-size:.68rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:8px}
.plan-name{font-size:clamp(1.6rem,2.4vw,2rem);margin-bottom:8px}
.plan .plan-promise{min-height:3.2em}
.plan .plan-setup span{color:var(--soft);opacity:.85}
.plan .checks{flex:1;margin-bottom:26px}
.plan .checks li{font-size:.9rem}
.plan .btn{align-self:flex-start}
.fineprint{margin-top:22px;text-align:center;color:var(--soft);font-size:.88rem;font-style:italic}

.website-only{margin-top:clamp(30px,4vw,48px);border:1px solid var(--line);padding:clamp(22px,3vw,32px);
  display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px}
.website-only h3{margin-bottom:8px}
.website-only p{color:var(--soft);font-size:.93rem;margin:0;max-width:62ch}

.terms{list-style:none;padding:0;margin:clamp(26px,3vw,36px) 0 0;display:flex;flex-wrap:wrap;justify-content:center;gap:10px 28px}
.terms li{position:relative;padding-left:22px;font-size:.86rem;color:var(--soft)}
.terms li::before{content:"";position:absolute;left:2px;top:8px;width:10px;height:5px;
  border-left:1.8px solid var(--accent);border-bottom:1.8px solid var(--accent);transform:rotate(-45deg)}

@media(max-width:980px){
  .plans{grid-template-columns:1fr;max-width:560px;margin-inline:auto}
  .plan .plan-promise{min-height:0}
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test tests/`
Expected: all tests PASS.

- [ ] **Step 6: Check it in the browser**

Open `http://localhost:4321/pricing.html`. Confirm: three plan cards side by side on desktop and stacked at 375px; Convert has the teal border and "Most popular" tag; the founding banner and website-only card read correctly; FAQ items open and close. The builder area is empty and the calculator shows its static example until Task 5 — that is expected.

- [ ] **Step 7: Commit**

```bash
git add pricing.html styles.css tests/site.test.js
git commit -m "Add the pricing page with plans, founding offer, terms and FAQ"
```

---

### Task 5: Plan builder, founding count and lead leak calculator

**Files:**
- Modify: `pricing.js` (add two pure functions; replace the `/* DOM-WIRING-PLACEHOLDER-FOR-TASK-5 */` marker with page wiring)
- Modify: `tests/pricing.test.js` (append tests)
- Modify: `styles.css` (append builder and calculator block)

**Interfaces:**
- Consumes: everything `pricing.js` exports (Task 1); element ids listed under Task 4 "Produces".
- Produces (added to `KeaPricing`):
  - `coverLine(plan, jobValue) -> string` e.g. `'Capture is $250/mo — about 1 job a month covers it.'`
  - `sendHref(ids: string[]) -> string` e.g. `'contact.html?plan=custom&services=website,seo'`. Task 6 parses this.

- [ ] **Step 1: Write the failing tests**

Append to `tests/pricing.test.js`:

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/`
Expected: FAIL with `P.coverLine is not a function` and `P.sendHref is not a function`.

- [ ] **Step 3: Add the pure functions to `pricing.js`**

Inside the first IIFE, directly above `var api = {`, add:

```js
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
```

and replace the `var api = {…};` statement with:

```js
  var api = {
    FOUNDING_SPOTS_LEFT: FOUNDING_SPOTS_LEFT, SERVICES: SERVICES, PLANS: PLANS,
    money: money, serviceById: serviceById, totals: totals, bestPlanFor: bestPlanFor,
    leakEstimate: leakEstimate, jobsToCover: jobsToCover, coverLine: coverLine, sendHref: sendHref
  };
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/`
Expected: all tests PASS.

- [ ] **Step 5: Replace the DOM marker in `pricing.js` with the page wiring**

Replace the line `/* DOM-WIRING-PLACEHOLDER-FOR-TASK-5 */` with:

```js
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
```

- [ ] **Step 6: Append builder and calculator styles to `styles.css`**

```css
/* ══════ BUILDER ══════ */
.builder{background:#fff;border:1px solid var(--line)}
.builder-head{padding:22px clamp(18px,3vw,32px);border-bottom:1px solid var(--line)}
.builder-head p{margin:0;color:var(--soft);font-size:.92rem}
.row{display:grid;grid-template-columns:auto 44px minmax(0,1fr) auto;align-items:center;gap:16px;
  padding:18px clamp(18px,3vw,32px);border-bottom:1px solid var(--line);cursor:pointer;transition:background .18s}
.row:hover{background:var(--sand)}
.row input{width:20px;height:20px;accent-color:var(--accent-dk);margin:0;cursor:pointer}
.row-icon{width:44px;height:44px;display:grid;place-items:center;background:var(--sand);color:var(--accent-dk)}
.row-icon svg{width:22px;height:22px}
.row-text strong{display:block;font-weight:500;color:var(--ink)}
.row-text span{display:block;color:var(--soft);font-size:.86rem;line-height:1.55}
.row-price{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.row-mo{display:block;font-weight:600;color:var(--ink)}
.row-setup{display:block;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--soft)}
.row-soon{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--soft)}
.row--soon{cursor:default;opacity:.55}
.row--soon:hover{background:transparent}
.row input:checked ~ .row-text strong{color:var(--accent-dk)}
.builder-foot{padding:22px clamp(18px,3vw,32px);display:grid;gap:14px;justify-items:start}
.builder-total{margin:0;font-size:1.02rem;font-variant-numeric:tabular-nums}
.builder-total strong{font-weight:600;font-size:1.3rem}
.builder-nudge{margin:0;padding:12px 16px;background:#E3F1EF;color:var(--ink);font-size:.92rem}
.builder-nudge a{color:var(--accent-dk);font-weight:500;text-decoration:underline}
.builder-empty{padding:22px clamp(18px,3vw,32px);margin:0}

/* ══════ CALCULATOR ══════ */
.calc{display:grid;gap:22px;margin-top:10px}
.calc-row label{display:block;font-size:.8rem;font-weight:500;color:var(--ink);margin-bottom:8px}
.calc-inputs{display:grid;grid-template-columns:minmax(0,1fr) 96px;gap:14px;align-items:center}
.calc-inputs input[type=range]{width:100%;accent-color:var(--accent-dk)}
.calc-inputs input[type=number]{width:100%;border:1px solid var(--line);padding:9px 10px;font:inherit;font-size:.92rem;
  font-variant-numeric:tabular-nums}
.calc-out{background:var(--bar);color:#fff;padding:clamp(26px,3vw,40px)}
.calc-label{margin:0;font-size:.7rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.66)}
.calc-big{font-family:var(--serif);font-size:clamp(2.2rem,4vw,3.2rem);line-height:1.1;margin:6px 0 20px;font-variant-numeric:tabular-nums}
.calc-big small{font-family:var(--sans);font-size:1rem;color:rgba(255,255,255,.7);margin-left:4px}
.calc-year{margin:-12px 0 22px;color:rgba(255,255,255,.8);font-variant-numeric:tabular-nums}
.calc-plans{list-style:none;margin:0 0 20px;padding:18px 0 0;border-top:1px solid rgba(255,255,255,.16);display:grid;gap:8px}
.calc-plans li{font-size:.9rem;color:rgba(255,255,255,.88)}
.calc-formula{margin:0;font-size:.76rem;color:rgba(255,255,255,.55)}

@media(max-width:640px){
  .row{grid-template-columns:auto minmax(0,1fr);row-gap:8px}
  .row-icon{display:none}
  .row-price{grid-column:2;text-align:left}
}
```

- [ ] **Step 7: Check it in the browser**

Reload `http://localhost:4321/pricing.html` and check each of these by hand:
1. Eight rows render with icons; Google Ads is greyed out and cannot be ticked.
2. Tick Website + Missed-call text-back + Leads dashboard: total reads **$308/mo + $1,299 setup**; nudge reads "Capture includes all of this for $549 less to set up and $58/mo less."
3. Also tick Calendar booking + Local SEO foundations: **$522/mo + $1,449 setup**, nudge names Convert ($449 / $122).
4. Also tick Email & SMS campaigns + Spam call screening: **$746/mo + $1,749 setup**, nudge names Keep ($249 / $46).
5. Untick everything except Missed-call text-back: no nudge; "Send me this plan" links to `contact.html?plan=custom&services=missed-call`.
6. Calculator loads showing 3.5 jobs, $1,575/mo, $18,900 a year; dragging a slider updates its number box and the results; typing in a number box moves the slider.
7. Temporarily set `FOUNDING_SPOTS_LEFT = 0`, reload: banner and "· founding" notes disappear. Set it back to `5`.
8. 375px width: rows stack without horizontal scroll. No console errors.

- [ ] **Step 8: Commit**

```bash
git add pricing.js tests/pricing.test.js styles.css
git commit -m "Add the build-your-own plan builder and lead leak calculator"
```

---

### Task 6: Contact page — free lead-leak audit request

**Files:**
- Create: `contact.js`
- Create: `contact.html`
- Create: `tests/contact.test.js`
- Modify: `styles.css` (append contact block)
- Modify: `tests/site.test.js` (append tests)

**Interfaces:**
- Consumes: `KeaPricing.serviceById` (Task 1); links produced by `sendHref` (Task 5) and plan buttons (`?plan=audit|capture|convert|keep|website|custom`); shared header/footer (Task 3).
- Produces:
  - `KeaContact.prefillFromQuery(search: string) -> {interest: string, services: string[]}` (service *names*).
  - `KeaContact.composePayload(values) -> {name, email, phone, website, interest, message}` where `values` is `{name, email, phone, website, interest, message, business, trade, consent: boolean, services: string[]}`.
  - `CONSENT_TEXT` sentence `Reply STOP to opt out, HELP for help. Mobile numbers are never shared or sold.` which Task 7 repeats in `policy.html`.

- [ ] **Step 1: Write the failing tests**

Create `tests/contact.test.js`:

```js
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
```

Append to `tests/site.test.js`:

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/`
Expected: FAIL with `Cannot find module '../contact.js'` and `ENOENT` for `contact.html`.

- [ ] **Step 3: Create `contact.js`**

```js
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
```

- [ ] **Step 4: Run the contact logic tests**

Run: `node --test tests/contact.test.js`
Expected: all 5 tests PASS. (`tests/site.test.js` still fails until Step 5.)

- [ ] **Step 5: Create `contact.html`**

Same `<head>` pattern as `pricing.html` with this title, description and canonical; header with `class="nav-link on"` on Contact; footer verbatim from `index.html`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Free Lead-Leak Audit — Contact Kea Web Creations</title>
<meta name="description" content="Get a free lead-leak audit for your home service business. See where calls, forms and estimate requests slip away. Beaverton, Oregon.">
<link rel="canonical" href="https://keawebcreations.com/contact.html">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Sacramento&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
<script>document.documentElement.className += ' js';</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"LocalBusiness","name":"Kea Web Creations","url":"https://keawebcreations.com/","telephone":"+1-808-306-8792","email":"keawebcreations@gmail.com","address":{"@type":"PostalAddress","addressLocality":"Beaverton","addressRegion":"OR","addressCountry":"US"},"areaServed":"Pacific Northwest"}
</script>
</head>
<body>

<!-- ══════════ HEADER (shared) ══════════ -->
<header class="bar">
  <div class="bar-in">
    <nav class="nav" aria-label="Main left">
      <a class="nav-link" href="index.html">Home</a>
      <a class="nav-link" href="pricing.html">Pricing</a>
    </nav>

    <a class="tile" href="index.html" aria-label="Kea Web Creations home">
      <span class="tile-script">Kea.</span>
      <span class="tile-sub">Web Creations</span>
    </a>

    <nav class="nav nav--r" aria-label="Main right">
      <a class="nav-link on" href="contact.html">Contact</a>
      <a class="btn btn--fill nav-cta" href="contact.html?plan=audit">Get a free audit</a>
    </nav>

    <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span><span></span></button>
  </div>
</header>

<div class="drawer" id="drawer">
  <a class="drawer-row" href="index.html">Home</a>
  <a class="drawer-row" href="pricing.html">Pricing</a>
  <a class="drawer-row" href="contact.html">Contact</a>
  <a class="btn btn--fill" href="contact.html?plan=audit" style="margin-top:28px">Get a free audit</a>
</div>
<!-- ══════════ END HEADER ══════════ -->

<main>

  <div class="page-banner">
    <div class="wrap">
      <h1>Get a free lead-leak audit<span class="dot">.</span></h1>
      <p class="sub">Tell me about your business. I'll check where enquiries slip away and reply within one business day.</p>
    </div>
  </div>

  <section class="sec">
    <div class="wrap split" style="align-items:start">
      <div class="rv">
        <span class="kicker">What the audit checks</span>
        <h2>Five places leads leak<span class="dot">.</span></h2>
        <ul class="checks" style="margin-top:22px">
          <li>How easy it is to contact you from your website</li>
          <li>Your Google Business Profile</li>
          <li>What happens when someone calls after hours</li>
          <li>How fast an enquiry gets a reply</li>
          <li>Your reviews, and how you ask for them</li>
        </ul>
        <dl class="dl" style="margin-top:34px">
          <div><dt>Phone</dt><dd><a href="tel:+18083068792">(808) 306-8792</a></dd></div>
          <div><dt>Email</dt><dd><a href="mailto:keawebcreations@gmail.com">keawebcreations@gmail.com</a></dd></div>
          <div><dt>Based in</dt><dd>Beaverton, Oregon<br>Serving home service businesses across the Pacific Northwest</dd></div>
          <div><dt>Hours</dt><dd>Monday–Friday, 9am–5pm PT</dd></div>
        </dl>
      </div>

      <div class="form-card rv">
        <h3 style="margin-bottom:20px">Request your audit</h3>
        <form class="form" data-form novalidate>
          <div class="f-row">
            <div class="field"><label for="f-name">Your name *</label><input id="f-name" name="name" autocomplete="name" required></div>
            <div class="field"><label for="f-business">Business name</label><input id="f-business" name="business" autocomplete="organization"></div>
          </div>
          <div class="f-row">
            <div class="field"><label for="f-email">Email *</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
            <div class="field"><label for="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" autocomplete="tel"></div>
          </div>
          <div class="f-row">
            <div class="field"><label for="f-trade">Your trade</label>
              <select id="f-trade" name="trade">
                <option value="">Choose one</option>
                <option>HVAC</option><option>Plumbing</option><option>Electrical</option>
                <option>Roofing</option><option>Landscaping</option><option>Other</option>
              </select></div>
            <div class="field"><label for="f-website">Current website</label><input id="f-website" name="website" placeholder="yourbusiness.com"></div>
          </div>
          <div class="field"><label for="f-interest">I'm interested in</label>
            <select id="f-interest" name="interest">
              <option>Free audit</option><option>Capture</option><option>Convert</option><option>Keep</option>
              <option>Website only</option><option>Build my own plan</option><option>Not sure yet</option>
            </select></div>
          <p class="picked" id="picked" hidden></p>
          <div class="field"><label for="f-message">Anything I should know?</label>
            <textarea id="f-message" name="message" placeholder="How do most customers reach you today? What gets missed?"></textarea></div>
          <label class="consent" for="f-consent">
            <input id="f-consent" name="consent" type="checkbox" value="yes">
            <span>Optional: I agree to receive texts from Kea Web Creations about my enquiry. Message frequency varies. Message and data rates may apply. Reply STOP to opt out, HELP for help. Mobile numbers are never shared or sold. <a href="policy.html#texting">Texting policy</a></span>
          </label>
          <!-- Honeypot. Invisible to people; anything that arrives with it filled in is discarded server-side. -->
          <div class="hp" aria-hidden="true"><label for="f-company">Company</label><input id="f-company" name="company" type="text" tabindex="-1" autocomplete="off"></div>
          <button class="btn btn--fill" type="submit">Get my free audit</button>
          <div class="ok" data-ok role="status">Thanks — got it. I'll reply within one business day.</div>
          <div class="err" data-err role="alert"></div>
        </form>
      </div>
    </div>
  </section>

</main>

<!-- ══════════ FOOTER (shared) — copy verbatim from index.html ══════════ -->
<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="f-tile" href="index.html" aria-label="Kea Web Creations home">
          <span class="tile-script">Kea.</span><span class="tile-sub">Web Creations</span>
        </a>
        <p>Beaverton, Oregon<br>Serving home service businesses across the Pacific Northwest</p>
        <p><a href="tel:+18083068792">(808) 306-8792</a><br><a href="mailto:keawebcreations@gmail.com">keawebcreations@gmail.com</a></p>
        <a class="btn btn--fill" href="contact.html?plan=audit" style="margin-top:8px">Get a free audit</a>
      </div>
      <div><h5>Pages</h5><ul class="f-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="pricing.html">Pricing</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="policy.html">Policy</a></li></ul></div>
      <div><h5>The Kea system</h5><ul class="f-links">
        <li><a href="pricing.html#capture">Capture</a></li>
        <li><a href="pricing.html#convert">Convert</a></li>
        <li><a href="pricing.html#keep">Keep</a></li>
        <li><a href="pricing.html#build">Build your own plan</a></li></ul></div>
    </div>
    <div class="footer-bar">
      <p>Kea Web Creations © <span id="yr"></span> All rights reserved</p>
      <p>Beaverton, Oregon</p>
    </div>
  </div>
</footer>

<script src="site.js"></script>
<script src="pricing.js"></script>
<script src="contact.js"></script>
</body>
</html>
```

Note: `novalidate` is set so the browser's native bubbles don't block the server's friendlier messages; the backend already validates name and email.

- [ ] **Step 6: Append contact styles to `styles.css`**

```css
/* ══════ CONTACT ══════ */
.form-card{background:var(--sand);padding:clamp(24px,3vw,36px);border:1px solid var(--line)}
.picked{margin:0;padding:12px 16px;background:#E3F1EF;font-size:.88rem;color:var(--ink)}
.consent{display:grid;grid-template-columns:20px minmax(0,1fr);gap:12px;align-items:start;font-size:.78rem;line-height:1.6;color:var(--soft);cursor:pointer}
.consent input{width:18px;height:18px;margin:2px 0 0;accent-color:var(--accent-dk)}
.consent a{color:var(--accent-dk);text-decoration:underline}
```

- [ ] **Step 7: Run all tests**

Run: `node --test tests/`
Expected: all tests PASS.

- [ ] **Step 8: Check it in the browser, including one real submission**

1. Open `http://localhost:4321/contact.html?plan=convert` — "I'm interested in" shows Convert.
2. Open `http://localhost:4321/contact.html?plan=custom&services=website,seo` — shows "Services you picked: Website, Local SEO foundations".
3. From `pricing.html`, click every plan button and "Send me this plan"; each lands with the right selection.
4. Submit once for real from `http://localhost:4321/contact.html?plan=custom&services=website,seo`, waiting more than 3 seconds before sending, with business "Test HVAC", trade HVAC, consent ticked. Expected: green confirmation. Note: `localhost:4321` is not in the function's `KEA_ORIGINS` allowlist, so a CORS failure (red message with the email/phone fallback) is the expected local result. In that case do not change the backend — the real submission check happens on the deployed site in Task 8.
5. Submit with an empty name: the server's "Please add your name." message appears with the fallback line.
6. 375px width: fields stack. No console errors other than the expected CORS one.

- [ ] **Step 9: Commit**

```bash
git add contact.js contact.html tests/contact.test.js tests/site.test.js styles.css
git commit -m "Add the free lead-leak audit request page"
```

---

### Task 7: Policy page and 404 page

**Files:**
- Create: `policy.html`
- Create: `404.html`
- Modify: `styles.css` (append policy block)
- Modify: `tests/site.test.js` (append tests)

**Interfaces:**
- Consumes: shared header/footer (Task 3), `checkCommon` (Task 3), consent sentence (Task 6).
- Produces: anchors `policy.html#cancellation` and `policy.html#texting` (linked from Tasks 4 and 6).

- [ ] **Step 1: Write the failing tests**

Append to `tests/site.test.js`:

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/`
Expected: the three new tests FAIL with `ENOENT`.

- [ ] **Step 3: Create `policy.html`**

Same `<head>` pattern with the title, description and canonical below. Header with no `.nav-link` marked `on` (Policy is not in the header). Footer verbatim from `index.html`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Policy — Terms, Cancellation, Privacy &amp; Texting | Kea Web Creations</title>
<meta name="description" content="How Kea Web Creations plans, billing, updates and cancellation work, what you keep if you leave, how enquiry information is used, and texting consent.">
<link rel="canonical" href="https://keawebcreations.com/policy.html">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Sacramento&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
<script>document.documentElement.className += ' js';</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"LocalBusiness","name":"Kea Web Creations","url":"https://keawebcreations.com/","telephone":"+1-808-306-8792","email":"keawebcreations@gmail.com","address":{"@type":"PostalAddress","addressLocality":"Beaverton","addressRegion":"OR","addressCountry":"US"},"areaServed":"Pacific Northwest"}
</script>
</head>
<body>

<!-- ══════════ HEADER (shared) ══════════ -->
<header class="bar">
  <div class="bar-in">
    <nav class="nav" aria-label="Main left">
      <a class="nav-link" href="index.html">Home</a>
      <a class="nav-link" href="pricing.html">Pricing</a>
    </nav>

    <a class="tile" href="index.html" aria-label="Kea Web Creations home">
      <span class="tile-script">Kea.</span>
      <span class="tile-sub">Web Creations</span>
    </a>

    <nav class="nav nav--r" aria-label="Main right">
      <a class="nav-link" href="contact.html">Contact</a>
      <a class="btn btn--fill nav-cta" href="contact.html?plan=audit">Get a free audit</a>
    </nav>

    <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span><span></span></button>
  </div>
</header>

<div class="drawer" id="drawer">
  <a class="drawer-row" href="index.html">Home</a>
  <a class="drawer-row" href="pricing.html">Pricing</a>
  <a class="drawer-row" href="contact.html">Contact</a>
  <a class="btn btn--fill" href="contact.html?plan=audit" style="margin-top:28px">Get a free audit</a>
</div>
<!-- ══════════ END HEADER ══════════ -->

<main>

  <div class="page-banner">
    <div class="wrap">
      <h1>Policy<span class="dot">.</span></h1>
      <p class="sub">How plans, billing and cancellation work, what stays yours, and how your information is used.</p>
    </div>
  </div>

  <section class="sec">
    <div class="wrap policy">

      <div class="policy-block" id="plans-billing">
        <h2>Plans and billing</h2>
        <p>Plans are billed monthly, plus a one-time setup fee. Standard plans have no contract: you can cancel any time, and cancellation takes effect at the end of the current billing month.</p>
        <p>Setup fees are non-refundable. They pay for work already done — building your website, setting up your system and registering your texting number.</p>
        <p>Normal texting and calling usage is included in your monthly price. Unusually high volume, such as large text campaigns, is billed at cost, and you'll hear from me before it is.</p>
        <p>Not included: ad spend, photography and copywriting. Copywriting can be quoted separately.</p>
      </div>

      <div class="policy-block" id="founding">
        <h2>Founding clients</h2>
        <p>The first five home service businesses pay the founding setup fee. In exchange, they agree to a 90-day commitment, after which the plan continues month-to-month, and give permission to share their before-and-after numbers. The monthly price is the same as the standard plan.</p>
      </div>

      <div class="policy-block" id="updates">
        <h2>Website updates</h2>
        <p>Every plan, and website-only hosting, includes 30 minutes of small updates a month: hours, prices, phone numbers, photos and text changes. Unused time doesn't roll over.</p>
        <p>Time past 30 minutes is $50 an hour. New pages, redesigns, new features and new integrations are quoted before any work starts.</p>
      </div>

      <div class="policy-block" id="cancellation">
        <h2>If you cancel</h2>
        <div class="policy-table">
          <table>
            <thead><tr><th>What</th><th>What happens</th></tr></thead>
            <tbody>
              <tr><td>Domain, Google Business Profile, Google reviews</td><td>Always yours — they live in your own accounts, and Kea is only added as a manager</td></tr>
              <tr><td>Website files and content</td><td>Handed over to you</td></tr>
              <tr><td>Contacts and conversation history</td><td>Exported to you on request within 30 days</td></tr>
              <tr><td>Business texting number</td><td>You can move it to another provider within 30 days; after that it is released</td></tr>
              <tr><td>Workflows, automations and templates</td><td>Stay with Kea — they are part of the Kea system</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="policy-block" id="privacy">
        <h2>Privacy</h2>
        <p>The contact form collects your name, email, phone number, business name, trade, website and message. It is used only to reply to your enquiry and to prepare your audit. It is stored securely, emailed to keawebcreations@gmail.com, and never sold, rented or shared with third parties for their marketing.</p>
        <p>Ask at any time and your information is deleted: email keawebcreations@gmail.com.</p>
      </div>

      <div class="policy-block" id="texting">
        <h2>Texting</h2>
        <p>If you tick the texting box on the contact form, you agree to receive texts from Kea Web Creations about your enquiry. Message frequency varies. Message and data rates may apply. Reply STOP to opt out, HELP for help. Mobile numbers are never shared or sold.</p>
        <p>Ticking the box is optional and is not a condition of any purchase.</p>
      </div>

    </div>
  </section>

</main>

<!-- ══════════ FOOTER (shared) — copy verbatim from index.html ══════════ -->
<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="f-tile" href="index.html" aria-label="Kea Web Creations home">
          <span class="tile-script">Kea.</span><span class="tile-sub">Web Creations</span>
        </a>
        <p>Beaverton, Oregon<br>Serving home service businesses across the Pacific Northwest</p>
        <p><a href="tel:+18083068792">(808) 306-8792</a><br><a href="mailto:keawebcreations@gmail.com">keawebcreations@gmail.com</a></p>
        <a class="btn btn--fill" href="contact.html?plan=audit" style="margin-top:8px">Get a free audit</a>
      </div>
      <div><h5>Pages</h5><ul class="f-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="pricing.html">Pricing</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="policy.html">Policy</a></li></ul></div>
      <div><h5>The Kea system</h5><ul class="f-links">
        <li><a href="pricing.html#capture">Capture</a></li>
        <li><a href="pricing.html#convert">Convert</a></li>
        <li><a href="pricing.html#keep">Keep</a></li>
        <li><a href="pricing.html#build">Build your own plan</a></li></ul></div>
    </div>
    <div class="footer-bar">
      <p>Kea Web Creations © <span id="yr"></span> All rights reserved</p>
      <p>Beaverton, Oregon</p>
    </div>
  </div>
</footer>

<script src="site.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create `404.html`**

GitHub Pages serves this file for any missing path, including nested ones like `/old/page`, so every URL in it is root-absolute.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Page not found — Kea Web Creations</title>
<meta name="description" content="This page doesn't exist. Head back to Kea Web Creations to see plans or request a free lead-leak audit.">
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Sacramento&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
<script>document.documentElement.className += ' js';</script>
</head>
<body>

<header class="bar">
  <div class="bar-in">
    <nav class="nav" aria-label="Main left">
      <a class="nav-link" href="/index.html">Home</a>
      <a class="nav-link" href="/pricing.html">Pricing</a>
    </nav>
    <a class="tile" href="/index.html" aria-label="Kea Web Creations home">
      <span class="tile-script">Kea.</span>
      <span class="tile-sub">Web Creations</span>
    </a>
    <nav class="nav nav--r" aria-label="Main right">
      <a class="nav-link" href="/contact.html">Contact</a>
      <a class="btn btn--fill nav-cta" href="/contact.html?plan=audit">Get a free audit</a>
    </nav>
    <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span><span></span></button>
  </div>
</header>

<div class="drawer" id="drawer">
  <a class="drawer-row" href="/index.html">Home</a>
  <a class="drawer-row" href="/pricing.html">Pricing</a>
  <a class="drawer-row" href="/contact.html">Contact</a>
  <a class="btn btn--fill" href="/contact.html?plan=audit" style="margin-top:28px">Get a free audit</a>
</div>

<main>
  <div class="page-banner">
    <div class="wrap">
      <h1>That page isn't here<span class="dot">.</span></h1>
      <p class="sub">It may have moved when the site was rebuilt. Try one of these instead.</p>
      <p style="margin-top:30px;display:flex;flex-wrap:wrap;gap:14px;justify-content:center">
        <a class="btn btn--fill" href="/index.html">Go to the homepage</a>
        <a class="btn btn--white" href="/pricing.html">See plans</a>
        <a class="btn btn--white" href="/contact.html?plan=audit">Get a free audit</a>
      </p>
      <p class="sub" style="margin-top:24px">Or call <a href="tel:+18083068792">(808) 306-8792</a>.</p>
    </div>
  </div>
</main>

<script src="/site.js"></script>
</body>
</html>
```

- [ ] **Step 5: Append policy styles to `styles.css`**

```css
/* ══════ POLICY ══════ */
.policy{max-width:820px}
.policy-block{margin-bottom:clamp(34px,4vw,48px);scroll-margin-top:calc(var(--bar-h) + 30px)}
.policy-block h2{font-size:clamp(1.4rem,2.4vw,1.8rem);margin-bottom:14px}
.policy-block p{color:var(--soft);font-size:.97rem;max-width:68ch}
.policy-table{overflow-x:auto;border:1px solid var(--line)}
.policy-table table{border-collapse:collapse;width:100%;min-width:520px;font-size:.92rem}
.policy-table th,.policy-table td{text-align:left;vertical-align:top;padding:14px 16px;border-bottom:1px solid var(--line)}
.policy-table th{font-size:.68rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--soft);background:var(--sand)}
.policy-table td:first-child{font-weight:500;color:var(--ink);width:40%}
.policy-table td{color:var(--soft)}
.policy-table tr:last-child td{border-bottom:0}
```

- [ ] **Step 6: Run all tests**

Run: `node --test tests/`
Expected: all tests PASS.

- [ ] **Step 7: Check it in the browser**

Open `http://localhost:4321/policy.html`, `policy.html#cancellation` and `policy.html#texting` — each anchor lands below the fixed header. Open `http://localhost:4321/404.html` — styled correctly. (The local Python server does not serve `404.html` for missing paths; GitHub Pages does.) 375px width: the cancellation table scrolls inside its own box, the page does not scroll sideways.

- [ ] **Step 8: Commit**

```bash
git add policy.html 404.html styles.css tests/site.test.js
git commit -m "Add the policy and not-found pages"
```

---

### Task 8: Link check, README, full verification

**Files:**
- Modify: `tests/site.test.js` (append link test)
- Modify: `README.md`

**Interfaces:**
- Consumes: every page and anchor from Tasks 3–7.
- Produces: a branch ready for review and merge.

- [ ] **Step 1: Write the link test**

Append to `tests/site.test.js`:

```js
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
```

- [ ] **Step 2: Run it**

Run: `node --test tests/`
Expected: PASS. If it fails, the message names the page and the broken href; fix the href in that page (not the test) and re-run.

- [ ] **Step 3: Rewrite the top of `README.md`**

Replace everything from the start of the file up to (not including) the `## Contact form` heading with:

~~~markdown
# Kea Web Creations

Static site for Kea Web Creations: websites and follow-up systems for home service
businesses. Plain HTML, CSS and JavaScript — no build step.

## Structure

| File | What it is |
|---|---|
| `index.html` | Homepage |
| `pricing.html` | Plans, founding offer, website only, build-your-own plan, lead leak calculator, FAQ |
| `contact.html` | Free lead-leak audit request form |
| `policy.html` | Terms, cancellation, privacy, texting consent |
| `404.html` | Not-found page (served by GitHub Pages for missing paths) |
| `styles.css` | All styles |
| `site.js` | Menu drawer, scroll reveal, hero video, FAQ accordions, redirects for old `#/` links |
| `pricing.js` | **All prices** and the pricing/calculator logic |
| `contact.js` | Contact form behaviour |
| `tests/` | Node tests for prices, the calculator, the form and every page |

The header and footer are copied into each page. Change one, change them all.

## Changing prices

1. Edit `SERVICES` or `PLANS` in `pricing.js`.
2. If a **plan** price changed, update the matching card in `pricing.html` (the
   `data-setup`, `data-founding`, `data-monthly` attributes and the visible text) and
   the preview card in `index.html`, plus the example lines under the calculator.
3. Run the tests — they fail if the pages and `pricing.js` disagree.

When a founding client signs, lower `FOUNDING_SPOTS_LEFT` in `pricing.js`. At `0` the
founding banner and founding prices disappear.

## Tests

```bash
node --test tests/
```

## Preview locally

```bash
python3 -m http.server 4321
```

Then visit `http://localhost:4321`.

## Publish with GitHub Pages

1. On GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `root`**.
2. The site is live at `https://keawebcreations.com` (custom domain, set by the
   `CNAME` file in the repo root).

~~~

Then, in the `## Contact form` section, change `The form on \`#/contact\` posts to` to `The form on \`contact.html\` posts to`, and add this paragraph at the end of that section:

```markdown
The function only stores `name`, `email`, `phone`, `website`, `interest` and `message`.
The audit form's extra fields — business name, trade, services picked in the pricing
builder, and texting consent — are written into the top of `message` by `contact.js`.
Posting from `localhost` is blocked by the origin allowlist; test real submissions on
the live site.
```

Finally, replace the `## Content to replace before launch` section and everything after it with:

```markdown
## Content to add when it exists

- **Google reviews:** add a reviews section to the homepage once at least 3 real reviews exist.
- **CaptureWithKi case study:** add after the 30–60 day pilot, with real before/after numbers.
- **Services, About and FAQ pages:** planned for the next release.
- **Phone number:** the site uses La'akea's personal number. Replace every
  `(808) 306-8792` / `tel:+18083068792` (and `telephone` in each page's JSON-LD) when the
  GoHighLevel number exists.
```

- [ ] **Step 4: Full browser verification**

With the preview server running, go through every item and note any failure:

1. `http://localhost:4321/` — hero video, all eight homepage sections, every button.
2. Old links: `/#/home`, `/#/services`, `/#/about`, `/#/faq`, `/#/policy`, `/#/contact`, `/#/portfolio` each land on the page and section in Task 2's `legacyTarget` test.
3. `pricing.html` — the eight builder checks from Task 5 Step 7.
4. `contact.html` — the prefill checks from Task 6 Step 8.
5. `policy.html` anchors and `404.html`.
6. Each page at 375px and 1280px: no horizontal scroll, drawer works, text readable.
7. Keyboard only on `pricing.html`: Tab reaches every builder checkbox and calculator input with a visible focus ring; Space ticks a checkbox.
8. With the OS set to reduce motion: no bobbing arrow, content visible without scrolling animation.
9. Console: no errors on any page (except the expected CORS error when submitting from localhost).
10. Search every file for leftovers: `grep -rniE "tier [123]|portfolio|steady stream|make waves" --include=*.html --include=*.js .` returns nothing outside `site.js`'s legacy map and `tests/`.

Take one desktop screenshot of the homepage hero and one of the pricing builder with services ticked, to share with La'akea.

- [ ] **Step 5: Run all tests one last time**

Run: `node --test tests/`
Expected: every test PASS, 0 failures.

- [ ] **Step 6: Commit**

```bash
git add tests/site.test.js README.md
git commit -m "Check every internal link and document the new site structure"
```

- [ ] **Step 7: Hand off for merge — do not merge or push without La'akea's go-ahead**

Merging to `main` publishes the site to keawebcreations.com immediately. Use superpowers:finishing-a-development-branch. After La'akea approves and it is live, submit one real audit request on `https://keawebcreations.com/contact.html?plan=custom&services=website,seo` and confirm the email at keawebcreations@gmail.com contains the business, trade, services and consent lines, and that the auto-reply arrives.

---

## Spec coverage

| Spec requirement | Task |
|---|---|
| Positioning, homepage sections 1–8, problem-first hero, audit CTA | 3 |
| No invented proof; reviews and case study hidden | 3, 8 (README) |
| Real pages, shared CSS/JS, canonical, JSON-LD, old-link redirects | 2, 3, 4, 6, 7 |
| Lean launch nav (Home · Pricing · Contact + audit button, Policy in footer) | 3 |
| Plans with outcome headlines, standard + founding setup, monthly | 1, 4 |
| Founding banner with hand-updated spots, hides at 0 | 4, 5 |
| Website only $1,000 + $50/mo card | 4 |
| Build your own plan, Google Ads disabled, live totals, nudge rule, send link | 1, 5 |
| Lead leak calculator with example values, estimate label, formula, plan lines | 1, 4, 5 |
| Terms: no contract, founding 90 days, non-refundable setup, 30 min updates, $50/hour, usage at cost | 4, 7 |
| Cancellation ownership table | 7 |
| Local SEO foundations definition, AI in the background, opted-in texts wording | 1, 4 |
| Pricing FAQ topics | 4 |
| Audit request form, fields, trade list, interest list, consent checkbox, prefill, payload within backend limits, no backend change | 6 |
| Policy page with consent wording | 7 |
| Phone (808) 306-8792 on every page | 3–7 (tested in `checkCommon`) |
| Verification list | 5, 6, 7, 8 |
| Out of scope (Services/About/FAQ pages, GoHighLevel swap, ads, case study) | not built; noted in README |

