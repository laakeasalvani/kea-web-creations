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
