# Pacific Web Design Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single self-contained `index.html` file (CSS embedded, no external dependencies) that is the Pacific Web Design landing page, per `docs/superpowers/specs/2026-08-03-landing-page-design.md`.

**Architecture:** One HTML file, `<style>` block in `<head>`, one small `<script>` block at the bottom of `<body>` for the mobile nav toggle and scroll-reveal. No build step, no external assets — fonts either system-stack or a single `<link>` to Google Fonts (acceptable network dependency for typography only; page must still render with system fonts if that request fails).

**Tech Stack:** Plain HTML5, CSS3 (Grid/Flexbox, custom properties, `@keyframes`), vanilla JS (`IntersectionObserver`), no frameworks, no build tools.

## Global Constraints

- Single file: `index.html` at repo root.
- Fully responsive: mobile-first, breakpoints at ~640px and ~1024px.
- Contact links use `mailto:laakeasalvani@gmail.com` and `tel:8083068792` — no form backend, no third-party services.
- Color theme: deep teal/navy base, evergreen secondary, warm coral/sand accent for CTAs.
- Copy references Beaverton, Oregon / Pacific Northwest.
- Testimonials, portfolio, and bio content are placeholders, each wrapped in an HTML comment marking it as replaceable, e.g. `<!-- PLACEHOLDER: replace with real testimonial -->`.
- FAQ uses native `<details>`/`<summary>` (no JS required for it to function).
- Scroll-reveal must degrade gracefully: content is visible by default (not hidden) if JS never runs; JS only adds a transition-in effect.
- No automated test framework applies to this project (static markup/CSS). "Testing" for each task means: open the file directly in a browser and visually/functionally verify the listed behavior, and run `open index.html` / resize the window to check responsiveness, per task.

---

### Task 1: Base document, design tokens, sticky nav, hero

**Files:**
- Create: `index.html`

**Interfaces:**
- Produces: CSS custom properties on `:root` that all later tasks reuse: `--color-bg`, `--color-bg-alt`, `--color-primary` (deep teal/navy), `--color-secondary` (evergreen), `--color-accent` (coral/sand), `--color-text`, `--color-text-muted`, `--font-display`, `--font-body`, `--radius`, `--shadow`, `--container-width` (e.g. `1120px`), `--space-*` spacing scale (`--space-1` through `--space-8`).
- Produces: reusable classes later tasks rely on: `.container` (max-width + centered + horizontal padding), `.btn` / `.btn-primary` / `.btn-secondary` (CTA buttons), `.section` (vertical padding wrapper), `.section-title` / `.section-subtitle`, `.reveal` (initial state for scroll-reveal, opacity 1 by default so it's visible without JS, JS adds `.reveal-hidden` before animating to `.reveal-visible` — see Task 8 script).
- Produces: nav id/classes: `<nav class="nav">` with `.nav-toggle` (checkbox-driven or button-driven hamburger) and `.nav-links` that later tasks don't touch but must not break.

- [ ] **Step 1: Create `index.html` with doctype, head, meta tags, and CSS custom properties**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pacific Web Design | Websites That Work as Hard as You Do</title>
<meta name="description" content="Pacific Web Design builds custom websites for businesses in Beaverton, Oregon and beyond. Book a free consultation or get a quote today.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root {
  --color-bg: #f7faf9;
  --color-bg-alt: #ffffff;
  --color-primary: #0b3d45;
  --color-primary-light: #0f5964;
  --color-secondary: #1f6f4a;
  --color-accent: #ff8b5e;
  --color-accent-dark: #e5713f;
  --color-text: #10262a;
  --color-text-muted: #4c6167;
  --color-border: #dbe6e4;
  --font-display: 'Poppins', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --radius: 14px;
  --shadow: 0 10px 30px rgba(11, 61, 69, 0.12);
  --container-width: 1120px;
  --space-1: 0.5rem;
  --space-2: 1rem;
  --space-3: 1.5rem;
  --space-4: 2rem;
  --space-5: 3rem;
  --space-6: 4rem;
  --space-7: 6rem;
  --space-8: 8rem;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4 { font-family: var(--font-display); line-height: 1.15; }
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
.container {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 var(--space-3);
}
.section { padding: var(--space-7) 0; }
.section-title { font-size: clamp(1.75rem, 4vw, 2.5rem); margin-bottom: var(--space-2); }
.section-subtitle { color: var(--color-text-muted); max-width: 640px; margin-bottom: var(--space-5); font-size: 1.05rem; }
.section-header { text-align: center; }
.section-header .section-subtitle { margin-left: auto; margin-right: auto; }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.9rem 1.6rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.btn-primary {
  background: var(--color-accent);
  color: #fff;
  box-shadow: 0 8px 20px rgba(255, 139, 94, 0.35);
}
.btn-primary:hover { background: var(--color-accent-dark); transform: translateY(-2px); }
.btn-secondary {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.6);
  color: inherit;
}
.btn-secondary:hover { background: rgba(255, 255, 255, 0.12); transform: translateY(-2px); }
.reveal { opacity: 1; transform: none; }
.reveal-hidden { opacity: 0; transform: translateY(24px); }
.reveal-visible { opacity: 1; transform: none; transition: opacity 0.6s ease, transform 0.6s ease; }

/* Nav */
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(247, 250, 249, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
}
.nav .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-2);
  padding-bottom: var(--space-2);
}
.nav-logo { font-family: var(--font-display); font-weight: 700; font-size: 1.25rem; color: var(--color-primary); }
.nav-logo span { color: var(--color-accent); }
.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  list-style: none;
}
.nav-links a:not(.btn) {
  font-weight: 500;
  color: var(--color-text-muted);
}
.nav-links a:not(.btn):hover { color: var(--color-primary); }
.nav-toggle { display: none; }
.nav-toggle-label {
  display: none;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
}
.nav-toggle-label span { width: 26px; height: 3px; background: var(--color-primary); border-radius: 2px; }

@media (max-width: 1024px) {
  .nav-links {
    position: fixed;
    inset: 64px 0 0 0;
    background: var(--color-bg-alt);
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-4);
    gap: var(--space-3);
    transform: translateY(-120%);
    transition: transform 0.3s ease;
    border-bottom: 1px solid var(--color-border);
  }
  .nav-toggle:checked ~ .nav-links { transform: translateY(0); }
  .nav-toggle-label { display: flex; }
}

/* Hero */
.hero {
  position: relative;
  overflow: hidden;
  color: #fff;
  background: linear-gradient(120deg, var(--color-primary), var(--color-primary-light), var(--color-secondary));
  background-size: 200% 200%;
  animation: heroShift 12s ease infinite;
  padding: var(--space-8) 0 var(--space-7);
}
@keyframes heroShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.hero .container { position: relative; z-index: 1; max-width: 780px; text-align: center; margin: 0 auto; }
.hero-eyebrow {
  display: inline-block;
  background: rgba(255,255,255,0.15);
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  margin-bottom: var(--space-3);
}
.hero h1 { font-size: clamp(2.25rem, 6vw, 3.75rem); margin-bottom: var(--space-3); }
.hero p { font-size: 1.15rem; color: rgba(255,255,255,0.85); margin-bottom: var(--space-4); }
.hero-ctas { display: flex; flex-wrap: wrap; gap: var(--space-2); justify-content: center; }
</style>
</head>
<body>
<nav class="nav">
  <div class="container">
    <a href="#top" class="nav-logo">Pacific<span>Web</span>Design</a>
    <input type="checkbox" id="nav-toggle" class="nav-toggle">
    <label for="nav-toggle" class="nav-toggle-label" aria-label="Toggle menu"><span></span><span></span><span></span></label>
    <ul class="nav-links">
      <li><a href="#services">Services</a></li>
      <li><a href="#process">Process</a></li>
      <li><a href="#pricing">Pricing</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#faq">FAQ</a></li>
      <li><a class="btn btn-primary" href="mailto:laakeasalvani@gmail.com?subject=Quote%20Request%20-%20Pacific%20Web%20Design">Get a Quote</a></li>
    </ul>
  </div>
</nav>

<header class="hero" id="top">
  <div class="container">
    <span class="hero-eyebrow">Beaverton, Oregon &middot; Pacific Northwest</span>
    <h1>Websites that make people trust you before they even call.</h1>
    <p>I design and build custom websites for small businesses that are ready to look as good online as they are in person. Let's talk about yours.</p>
    <div class="hero-ctas">
      <a class="btn btn-primary" href="mailto:laakeasalvani@gmail.com?subject=Consultation%20Request%20-%20Pacific%20Web%20Design">Book a Free Consultation</a>
      <a class="btn btn-secondary" href="mailto:laakeasalvani@gmail.com?subject=Quote%20Request%20-%20Pacific%20Web%20Design">Get a Quote</a>
    </div>
  </div>
</header>

</body>
</html>
```

- [ ] **Step 2: Open in browser and verify**

Run: `open index.html`
Expected: Page loads with sticky nav, gradient-animated hero, headline, and two CTA buttons visible. Resize the browser window below 1024px width — nav links should disappear and a 3-line hamburger icon should appear; clicking it should reveal the nav links.

- [ ] **Step 3: Commit**

```bash
cd ~/pacific-web-design
git add index.html
git commit -m "Add base document, design tokens, nav, and hero section"
```

---

### Task 2: Services and How It Works sections

**Files:**
- Modify: `index.html` (insert new `<section>`s after `</header>`, add corresponding CSS inside the existing `<style>` block before `</style>`)

**Interfaces:**
- Consumes: `.container`, `.section`, `.section-title`, `.section-subtitle`, `.section-header`, `.reveal` classes and `--color-*`/`--space-*` tokens from Task 1.
- Produces: `.card-grid`, `.card` (reused by Task 3's pricing cards and Task 4's testimonial cards — same visual language, so keep `.card` generic: white background, `var(--radius)`, `var(--shadow)`, padding `var(--space-4)`). Produces `.steps`, `.step` for the process section.

- [ ] **Step 1: Add CSS for cards and steps before `</style>`**

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-4);
}
.card {
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--space-4);
  box-shadow: var(--shadow);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.card:hover { transform: translateY(-6px); box-shadow: 0 16px 34px rgba(11, 61, 69, 0.18); }
.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(31, 111, 74, 0.12);
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  margin-bottom: var(--space-2);
}
.card h3 { margin-bottom: var(--space-1); font-size: 1.2rem; }
.card p { color: var(--color-text-muted); }

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
  counter-reset: step;
}
.step { position: relative; padding-top: var(--space-5); }
.step::before {
  counter-increment: step;
  content: counter(step);
  position: absolute;
  top: 0;
  left: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
}
.step h3 { margin-bottom: var(--space-1); font-size: 1.1rem; }
.step p { color: var(--color-text-muted); }
.section-alt { background: var(--color-bg-alt); }
```

- [ ] **Step 2: Insert Services and Process sections after `</header>` and before `</body>`**

```html
<main>
<section class="section" id="services">
  <div class="container">
    <div class="section-header reveal">
      <h2 class="section-title">What I Can Build For You</h2>
      <p class="section-subtitle" style="margin-left:auto;margin-right:auto;">Whether you're starting from scratch or need a fresh start, here's how I help.</p>
    </div>
    <div class="card-grid">
      <div class="card reveal">
        <div class="card-icon">&#128187;</div>
        <h3>Custom Business Websites</h3>
        <p>A site built around your business, not a generic template &mdash; designed to turn visitors into customers.</p>
      </div>
      <div class="card reveal">
        <div class="card-icon">&#10024;</div>
        <h3>Website Redesigns</h3>
        <p>Outdated or hard to use? I'll rebuild it with modern design, faster load times, and mobile-friendly layouts.</p>
      </div>
      <div class="card reveal">
        <div class="card-icon">&#128736;&#65039;</div>
        <h3>Ongoing Maintenance &amp; Support</h3>
        <p>Updates, fixes, and hosting help after launch, so your site keeps working while you run your business.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section-alt" id="process">
  <div class="container">
    <div class="section-header reveal">
      <h2 class="section-title">How It Works</h2>
      <p class="section-subtitle" style="margin-left:auto;margin-right:auto;">A simple, low-stress process from first email to launch day.</p>
    </div>
    <div class="steps">
      <div class="step reveal">
        <h3>Discover</h3>
        <p>We talk through your goals, your customers, and what your current site is missing.</p>
      </div>
      <div class="step reveal">
        <h3>Design</h3>
        <p>You'll see a real design of your site before any heavy building begins &mdash; no surprises.</p>
      </div>
      <div class="step reveal">
        <h3>Build</h3>
        <p>I build the site to be fast, responsive, and easy for you to update later.</p>
      </div>
      <div class="step reveal">
        <h3>Launch &amp; Support</h3>
        <p>We launch together, and I stay available for updates and questions after.</p>
      </div>
    </div>
  </div>
</section>
</main>
```

- [ ] **Step 3: Open in browser and verify**

Run: `open index.html`
Expected: Services section shows 3 cards in a row on desktop, stacking to 1 column on narrow/mobile widths. Process section shows 4 numbered steps, alternating background color from the section above it.

- [ ] **Step 4: Commit**

```bash
cd ~/pacific-web-design
git add index.html
git commit -m "Add services and how-it-works sections"
```

---

### Task 3: Pricing section

**Files:**
- Modify: `index.html` (insert `<section id="pricing">` inside `<main>`, after the process section; add pricing-specific CSS before `</style>`)

**Interfaces:**
- Consumes: `.card`, `.card-grid`, `.section`, `.btn-primary` from Tasks 1–2.
- Produces: `.price-card` (extends `.card`), `.price-card.featured`, `.price` , `.price-features` — not consumed elsewhere, but keep naming consistent since Task 4 will NOT reuse `.price-card` (testimonials get their own class).

- [ ] **Step 1: Add pricing CSS before `</style>`**

```css
.price-card { display: flex; flex-direction: column; text-align: left; }
.price-card.featured {
  border-color: var(--color-accent);
  box-shadow: 0 16px 34px rgba(255, 139, 94, 0.25);
  transform: scale(1.03);
}
.price-card .badge {
  align-self: flex-start;
  background: var(--color-accent);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  margin-bottom: var(--space-2);
}
.price { font-family: var(--font-display); font-size: 2.25rem; margin: var(--space-1) 0 var(--space-2); }
.price span { font-size: 1rem; font-family: var(--font-body); color: var(--color-text-muted); font-weight: 400; }
.price-features { list-style: none; margin: var(--space-3) 0; flex-grow: 1; }
.price-features li { padding: 0.4rem 0; color: var(--color-text-muted); }
.price-features li::before { content: "\2713"; color: var(--color-secondary); font-weight: 700; margin-right: 0.5rem; }
.price-card .btn { width: 100%; }
```

- [ ] **Step 2: Insert pricing section into `<main>` after the `#process` section**

```html
<section class="section" id="pricing">
  <div class="container">
    <div class="section-header reveal">
      <h2 class="section-title">Simple, Transparent Pricing</h2>
      <p class="section-subtitle" style="margin-left:auto;margin-right:auto;">Every project is a little different &mdash; these are starting points. You'll get an exact quote after we talk.</p>
    </div>
    <div class="card-grid">
      <div class="card price-card reveal">
        <h3>Starter</h3>
        <p class="price">$1,200<span>/ site</span></p>
        <ul class="price-features">
          <li>Up to 5 pages</li>
          <li>Mobile-friendly design</li>
          <li>Contact form &amp; map</li>
          <li>2 rounds of revisions</li>
        </ul>
        <a class="btn btn-primary" href="mailto:laakeasalvani@gmail.com?subject=Quote%20Request%20-%20Starter%20Package">Get a Quote</a>
      </div>
      <div class="card price-card featured reveal">
        <span class="badge">Most Popular</span>
        <h3>Business</h3>
        <p class="price">$2,800<span>/ site</span></p>
        <ul class="price-features">
          <li>Up to 12 pages</li>
          <li>Custom design &amp; branding</li>
          <li>Booking / quote request tools</li>
          <li>Basic SEO setup</li>
          <li>3 rounds of revisions</li>
        </ul>
        <a class="btn btn-primary" href="mailto:laakeasalvani@gmail.com?subject=Quote%20Request%20-%20Business%20Package">Get a Quote</a>
      </div>
      <div class="card price-card reveal">
        <h3>Ongoing Maintenance</h3>
        <p class="price">$150<span>/ month</span></p>
        <ul class="price-features">
          <li>Content updates</li>
          <li>Security &amp; software updates</li>
          <li>Uptime monitoring</li>
          <li>Priority email support</li>
        </ul>
        <a class="btn btn-primary" href="mailto:laakeasalvani@gmail.com?subject=Quote%20Request%20-%20Maintenance%20Plan">Get a Quote</a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Open in browser and verify**

Run: `open index.html`
Expected: 3 pricing cards render, the middle "Business" card is visually emphasized (badge, scaled up, colored border). Cards stack vertically on mobile widths with no overlap or overflow.

- [ ] **Step 4: Commit**

```bash
cd ~/pacific-web-design
git add index.html
git commit -m "Add pricing section"
```

---

### Task 4: About and Testimonials sections (with placeholders)

**Files:**
- Modify: `index.html` (insert `<section id="about">` and a testimonials `<section>` inside `<main>`, after pricing; add related CSS before `</style>`)

**Interfaces:**
- Consumes: `.section`, `.section-alt`, `.card`, `.card-grid` from Tasks 1–2.
- Produces: `.about-grid`, `.about-photo` (Task 4 only), `.testimonial-card` (extends `.card`, Task 4 only).

- [ ] **Step 1: Add About/testimonial CSS before `</style>`**

```css
.about-grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: var(--space-5);
  align-items: center;
}
.about-photo {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 700;
}
.about-copy h2 { margin-bottom: var(--space-2); }
.about-copy p { color: var(--color-text-muted); margin-bottom: var(--space-2); }
@media (max-width: 640px) {
  .about-grid { grid-template-columns: 1fr; text-align: center; }
  .about-photo { max-width: 180px; margin: 0 auto; }
}
.testimonial-card { font-style: italic; color: var(--color-text); }
.testimonial-card .stars { color: var(--color-accent); margin-bottom: var(--space-2); font-style: normal; }
.testimonial-card .attribution { margin-top: var(--space-3); font-style: normal; font-weight: 600; color: var(--color-text-muted); }
```

- [ ] **Step 2: Insert About and Testimonials sections into `<main>` after `#pricing`**

```html
<section class="section" id="about">
  <div class="container">
    <div class="about-grid reveal">
      <div class="about-photo">PWD</div>
      <div class="about-copy">
        <h2 class="section-title">Hi, I'm the person who'll actually build your site.</h2>
        <!-- PLACEHOLDER: replace with real bio -->
        <p>I'm a web designer and developer based in Beaverton, Oregon, focused on helping small businesses in the Pacific Northwest get a website they're proud to send people to. No outsourcing, no templates pretending to be custom &mdash; you work directly with me from the first email to launch day and beyond.</p>
        <p>I care about the same things you do: your site loading fast, looking great on a phone, and actually bringing you customers.</p>
        <!-- END PLACEHOLDER -->
      </div>
    </div>
  </div>
</section>

<section class="section section-alt" id="testimonials">
  <div class="container">
    <div class="section-header reveal">
      <h2 class="section-title">What Clients Say</h2>
    </div>
    <div class="card-grid">
      <!-- PLACEHOLDER: replace with real testimonial -->
      <div class="card testimonial-card reveal">
        <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p>"Our new site brought in more inquiries in the first month than the old one did all year. The whole process was easy and fast."</p>
        <p class="attribution">&mdash; Sample Client, Local Business Owner</p>
      </div>
      <!-- END PLACEHOLDER -->
      <!-- PLACEHOLDER: replace with real testimonial -->
      <div class="card testimonial-card reveal">
        <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p>"I finally have a site that looks as professional as my business actually is. Communication was great the whole way through."</p>
        <p class="attribution">&mdash; Sample Client, Service Provider</p>
      </div>
      <!-- END PLACEHOLDER -->
      <!-- PLACEHOLDER: replace with real testimonial -->
      <div class="card testimonial-card reveal">
        <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p>"Quick responses, fair pricing, and the site works perfectly on mobile, which is most of our traffic."</p>
        <p class="attribution">&mdash; Sample Client, Retail Shop Owner</p>
      </div>
      <!-- END PLACEHOLDER -->
    </div>
  </div>
</section>
```

- [ ] **Step 3: Open in browser and verify**

Run: `open index.html`
Expected: About section shows a two-column layout (photo placeholder + bio text) on desktop that stacks to one column on mobile. Testimonials render as 3 cards in the alternating-background section. Placeholder comments are present and easy to find with `grep PLACEHOLDER index.html`.

- [ ] **Step 4: Commit**

```bash
cd ~/pacific-web-design
git add index.html
git commit -m "Add about and testimonials sections with placeholder content"
```

---

### Task 5: FAQ, final CTA banner, footer

**Files:**
- Modify: `index.html` (insert `<section id="faq">`, a CTA banner `<section>`, and a `<footer>` inside/after `<main>`; add related CSS before `</style>`)

**Interfaces:**
- Consumes: `.section`, `.container`, `.btn-primary`, `.btn-secondary`, `--color-*` tokens.
- Produces: `.faq-list`, `.faq-item` (styled `<details>`), `.cta-banner`, `.footer`, `.footer-grid` — not consumed by earlier tasks.

- [ ] **Step 1: Add FAQ/CTA/footer CSS before `</style>`**

```css
.faq-list { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-2); }
.faq-item {
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--space-3);
}
.faq-item summary {
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-display);
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: "+"; font-size: 1.4rem; color: var(--color-accent); }
.faq-item[open] summary::after { content: "\2212"; }
.faq-item p { color: var(--color-text-muted); margin-top: var(--space-2); }

.cta-banner {
  background: linear-gradient(120deg, var(--color-primary), var(--color-secondary));
  color: #fff;
  text-align: center;
  padding: var(--space-6) 0;
}
.cta-banner h2 { font-size: clamp(1.75rem, 4vw, 2.5rem); margin-bottom: var(--space-2); }
.cta-banner p { color: rgba(255,255,255,0.85); margin-bottom: var(--space-4); }
.cta-banner .hero-ctas { display: flex; flex-wrap: wrap; gap: var(--space-2); justify-content: center; }

.footer { background: var(--color-primary); color: rgba(255,255,255,0.8); padding: var(--space-6) 0 var(--space-4); }
.footer-grid { display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-4); }
.footer-brand { font-family: var(--font-display); font-weight: 700; font-size: 1.25rem; color: #fff; margin-bottom: var(--space-1); }
.footer-contact a { display: block; margin-bottom: var(--space-1); color: rgba(255,255,255,0.85); }
.footer-contact a:hover { color: var(--color-accent); }
.footer-bottom { text-align: center; font-size: 0.85rem; color: rgba(255,255,255,0.6); border-top: 1px solid rgba(255,255,255,0.15); padding-top: var(--space-3); }
```

- [ ] **Step 2: Insert FAQ section into `<main>` after `#testimonials`, then add CTA banner and footer after `</main>`**

```html
<section class="section" id="faq">
  <div class="container">
    <div class="section-header reveal">
      <h2 class="section-title">Common Questions</h2>
    </div>
    <div class="faq-list reveal">
      <details class="faq-item">
        <summary>How long does a project usually take?</summary>
        <p>Most business websites take 2&ndash;4 weeks from our first conversation to launch, depending on scope and how quickly I get content and feedback from you.</p>
      </details>
      <details class="faq-item">
        <summary>What does a project actually cost?</summary>
        <p>Most sites fall between the Starter and Business packages above. After we talk about what you need, I'll give you one clear, upfront price &mdash; no surprise invoices.</p>
      </details>
      <details class="faq-item">
        <summary>What do you need from me to get started?</summary>
        <p>Just a rough idea of your business, any existing branding (logo, colors, photos), and 20&ndash;30 minutes for an initial call. I'll guide you through the rest.</p>
      </details>
      <details class="faq-item">
        <summary>Do I own the website after it's built?</summary>
        <p>Yes. Once the project is paid in full, the site and its content are yours. Ongoing maintenance is optional, not required.</p>
      </details>
    </div>
  </div>
</section>
</main>

<section class="cta-banner">
  <div class="container">
    <h2>Ready to see what your business could look like online?</h2>
    <p>Let's talk about your project &mdash; no pressure, no obligation.</p>
    <div class="hero-ctas">
      <a class="btn btn-primary" href="mailto:laakeasalvani@gmail.com?subject=Consultation%20Request%20-%20Pacific%20Web%20Design">Book a Free Consultation</a>
      <a class="btn btn-secondary" href="mailto:laakeasalvani@gmail.com?subject=Quote%20Request%20-%20Pacific%20Web%20Design">Get a Quote</a>
    </div>
  </div>
</section>

<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">Pacific Web Design</div>
        <p>Beaverton, Oregon &middot; Serving the Pacific Northwest</p>
      </div>
      <div class="footer-contact">
        <a href="mailto:laakeasalvani@gmail.com">laakeasalvani@gmail.com</a>
        <a href="tel:8083068792">(808) 306-8792</a>
      </div>
    </div>
    <div class="footer-bottom">&copy; 2026 Pacific Web Design. All rights reserved.</div>
  </div>
</footer>
```

Note: this step moves the closing `</main>` tag to just after the FAQ section (it was previously left open after Task 4's testimonials section) — the CTA banner and footer sit outside `<main>`.

- [ ] **Step 3: Open in browser and verify**

Run: `open index.html`
Expected: FAQ items expand/collapse on click (native `<details>` behavior, works with JS disabled). CTA banner renders with gradient background and both buttons. Footer shows business name, location, working `mailto:`/`tel:` links, and copyright line. Full-page scroll from top to bottom shows no layout gaps or overlapping sections at 375px, 768px, and 1440px widths.

- [ ] **Step 4: Commit**

```bash
cd ~/pacific-web-design
git add index.html
git commit -m "Add FAQ, final CTA banner, and footer"
```

---

### Task 6: Scroll-reveal script and cross-device polish pass

**Files:**
- Modify: `index.html` (add `<script>` before `</body>`; adjust `.reveal`/`.reveal-hidden`/`.reveal-visible` usage if needed; fix any spacing/overflow issues found during manual QA)

**Interfaces:**
- Consumes: `.reveal` class already applied to section headers/cards/steps throughout the document (Tasks 1&ndash;5); `.reveal-hidden`/`.reveal-visible` CSS defined in Task 1.

- [ ] **Step 1: Add the scroll-reveal script before `</body>`**

```html
<script>
  (function () {
    var targets = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || targets.length === 0) return;

    targets.forEach(function (el) { el.classList.add('reveal-hidden'); });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-hidden');
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach(function (el) { observer.observe(el); });
  })();
</script>
```

- [ ] **Step 2: Verify graceful degradation**

Manually confirm in the script: elements only get `.reveal-hidden` added via JS after the `IntersectionObserver` feature check passes, so if JS fails to run at all, elements keep their default `.reveal` (opacity 1) styling and remain visible. Open `index.html`, open devtools, disable JavaScript, reload &mdash; all sections must still be fully visible immediately.

- [ ] **Step 3: Cross-device QA pass**

Run: `open index.html`, then in the browser devtools use responsive/device mode to check at minimum: 375px (mobile), 768px (tablet), 1440px (desktop) widths.
Expected checklist:
- Nav hamburger works on mobile/tablet, full nav shows on desktop.
- No horizontal scrollbar at any width.
- Hero, cards, pricing, about, testimonials, FAQ, CTA banner, and footer all render without overlapping text or clipped content.
- All buttons/links are tappable (no overlapping hit areas) on mobile.
- Scrolling down triggers the fade/slide-in effect on section headers and cards once, without flicker.
Fix any issues found directly in the CSS from Tasks 1&ndash;5 before proceeding.

- [ ] **Step 4: Commit**

```bash
cd ~/pacific-web-design
git add index.html
git commit -m "Add scroll-reveal script and polish responsive layout"
```

---

### Task 7: README and GitHub push instructions

**Files:**
- Create: `README.md`

**Interfaces:**
- None (documentation only).

- [ ] **Step 1: Create `README.md`**

```markdown
# Pacific Web Design — Landing Page

Single-file landing page for Pacific Web Design (`index.html`, CSS embedded, no build step).

## Preview locally

Open `index.html` directly in a browser, or serve it:

\`\`\`bash
python3 -m http.server 8000
\`\`\`

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a new repository on GitHub (e.g. `pacific-web-design`), do **not** initialize it with a README.
2. Push this repo:

\`\`\`bash
git remote add origin https://github.com/<your-username>/pacific-web-design.git
git branch -M main
git push -u origin main
\`\`\`

3. On GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `root`**.
4. The site will be live at `https://<your-username>.github.io/pacific-web-design/`.

## Content to replace before launch

Search for `PLACEHOLDER` in `index.html` — this marks the bio and testimonial content that should be swapped for real content.
```

- [ ] **Step 2: Commit**

```bash
cd ~/pacific-web-design
git add README.md
git commit -m "Add README with local preview and GitHub Pages instructions"
```

---

## Final Verification

- [ ] Open `index.html` one more time end-to-end at mobile/tablet/desktop widths and click every nav link, CTA button, and FAQ item to confirm they all work.
- [ ] Run `grep -n "PLACEHOLDER" index.html` and confirm the output lists exactly the bio and 3 testimonial blocks.
- [ ] Confirm `git log --oneline` shows one commit per task and `git status` is clean.
