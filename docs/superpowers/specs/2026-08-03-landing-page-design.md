# Pacific Web Design — Landing Page Design

Date: 2026-08-03

## Purpose

A single-page marketing site for "Pacific Web Design," a website-building
service run by the user, based in Beaverton, Oregon (Pacific Northwest). The
page exists to:

1. Get visitors to book a consultation.
2. Get visitors to request a quote.
3. Build enough confidence that the user is the right person to build their
   website that visitors take one of the two actions above.

## Constraints

- Delivered as a single static HTML file with embedded CSS (and minimal
  vanilla JS for interactions). No build step, no backend — must be
  publishable by dropping the file onto any static host (GitHub Pages, etc.).
- Fully responsive: phone, tablet, desktop.
- No third-party services (no Calendly, no form backend). All conversion
  actions use `mailto:` and `tel:` links.
- Contact info: `laakeasalvani@gmail.com`, `808-306-8792`.
- Testimonials/portfolio content is not final yet — must be placeholder
  content that is obviously fake-but-plausible and trivially findable/
  replaceable (HTML comments marking each block).

## Visual Direction

- Theme: coastal / Pacific Northwest. Deep teal/navy gradient base, evergreen
  secondary accent, warm coral/sand as a pop accent color for CTAs.
- Typography: bold modern display font for headlines (system-safe stack or a
  single embedded/linked Google Font), clean sans-serif body font.
- Motion: subtle animated gradient in the hero, scroll-reveal on section
  entry, hover micro-interactions on buttons/cards. Kept lightweight (CSS
  transitions/`@keyframes` + a small IntersectionObserver script) — no
  animation libraries.
- No literal clipart/stock wave images; motifs are gradient/shape based to
  keep the single-file constraint easy and load instant.

## Page Structure (single scroll, in order)

1. **Sticky nav** — logo/wordmark "Pacific Web Design", links to each section
   (Services, Process, Pricing, About, FAQ), a prominent "Get a Quote" button.
   Collapses to a hamburger menu on mobile.
2. **Hero** — headline + subheadline establishing the value prop, two CTA
   buttons ("Book a Consultation" / "Get a Quote"), both `mailto:` links with
   pre-filled subject lines distinguishing intent.
3. **Services** — 3 cards: Custom Business Websites, Website Redesigns,
   Ongoing Maintenance & Support. Short description each.
4. **How It Works** — 3–4 step process (e.g. Discover → Design → Build →
   Launch/Support) to make the engagement feel low-risk and well-run.
5. **Pricing** — 3 tiers (Starter / Business / Ongoing Maintenance) each with
   a "starting at $X" price, a short feature list, and a CTA. Prices are
   placeholder numbers clearly marked for the user to adjust.
6. **About** — short bio section, placeholder body copy marked for
   replacement, mentions Beaverton, OR / Pacific Northwest.
7. **Testimonials** — 2–3 placeholder testimonial cards, clearly marked with
   HTML comments for later replacement with real quotes.
8. **FAQ** — accordion-style, addresses common objections (timeline, cost
   range, what's needed to get started, ownership of the site after launch).
9. **Final CTA banner** — repeats both CTAs before the footer.
10. **Footer** — contact info (email as `mailto:`, phone as `tel:`), location,
    copyright line.

## Interaction / Responsiveness Notes

- Layout via CSS Grid/Flexbox with mobile-first media queries; breakpoints at
  roughly 640px and 1024px.
- Hamburger nav toggle implemented with a checkbox or small JS snippet, no
  dependencies.
- FAQ accordion via `<details>`/`<summary>` for zero-JS accessibility, styled
  to match the theme.
- Scroll-reveal via IntersectionObserver adding a class that triggers a CSS
  transition; must degrade gracefully (content visible by default) if JS is
  disabled.

## Out of Scope

- Real testimonials, portfolio images, and bio copy (placeholders only).
- Any backend, form submission service, or analytics.
- Multi-page site / routing.
- SEO meta beyond basic `<title>`/`<meta description>` tags.

## Delivery

- Single file: `index.html` at repo root (ready for GitHub Pages).
- Git repo initialized locally at `~/pacific-web-design`; user will create
  the GitHub repo and push manually (gh CLI not installed, Homebrew not
  installed — user opted to skip installing them).
