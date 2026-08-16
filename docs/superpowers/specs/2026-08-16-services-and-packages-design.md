# Kea Web Creations — One Service, Three Packages

**Date:** 2026-08-16
**Status:** Approved design, not yet implemented
**File touched:** `index.html`

## Decision

Kea sells **one** service: website design and development. Branding, Elevate Your
Online Presence and App Building are removed from the site entirely — pages, nav
links, footer links, form options and portfolio categories.

That service is sold as three fixed packages plus a monthly fee.

## The packages

### Tier 1 — $500 one-off + $50/month

- Up to 5 pages
- Works on phones
- Contact form
- Basic Google setup so the business can be found by name
- 2 rounds of changes during the build
- About 2 weeks
- **All edits after launch are billed at $30/hour**, from the first minute

### Tier 2 — $700–$1,000 one-off + $50/month

Everything in Tier 1, plus:

- Up to 8 pages
- A content management system: the owner logs in and edits their own text and images
- Private login, required to reach the editor
- A training session and a written guide
- 2 rounds of changes during the build
- About 3–4 weeks

### Tier 3 — $1,500–$2,000 one-off + $50/month

Everything in Tier 2, plus:

- An **owner dashboard** — the business sees and manages its own bookings, orders,
  enquiries and customer records
- **Accounts for the client's own customers** — the pattern built for CaptureWithKi,
  where each customer signs in to reach material meant only for them
- 3 rounds of changes during the build
- About 6–8 weeks
- Scoped per project, because "what the customers can do" varies enormously

### Add-on, no page of its own

A single line inside the packages: **logo and brand basics, quoted separately.**
No nav item, no service page — it exists only so a client who asks gets an answer.

## Prices as displayed

Exact figures, as given: `$500`, `$700–$1,000`, `$1,500–$2,000`. Not "from".

Noted for the record: a published range anchors most clients at the low end. This
was raised and the exact figures were chosen deliberately.

## The monthly fee

**$50/month on every tier, including Tier 1.**

Real cost to Kea is far lower — hosting is free, and the database and login system
sit inside free allowances at this scale. Cost is driven by stored images and
downloads, not by tier: a Tier 3 site for a trade business costs pennies, while a
photo-heavy Tier 2 site can cost real money.

**Fair-use cap:** 25 GB stored and 100 GB downloaded per month, anything beyond
billed at cost. Without this, one photo-heavy client absorbs the margin from
several others.

Because Tier 1 includes no edit allowance, the fee must state what it covers or it
reads as payment for nothing:

> Hosting and uptime · daily backups · security patches · domain renewal handled
> for you · your site stays online, and I am the one who fixes it if it breaks

## Terms to state on the page

These are the omissions that cost freelancers money:

- **Payment:** 50% to start, 50% before the site goes live. Nothing is handed over
  unpaid.
- **Timelines start when the content arrives**, not when the deposit clears — so a
  client's delay does not become a missed deadline.
- **The client supplies words and photos.** Copywriting is available as a paid
  add-on. This is where projects stall more than anywhere else.
- **Revisions beyond the included rounds** are billed at $30/hour.
- **If the monthly stops:** 30 days' notice, then the files are handed over and the
  client moves the site elsewhere.
- **Not included:** ongoing marketing, paid ads, photography, printed material.

## Ownership — a contradiction to fix

The homepage and the About page both currently promise:

> **You own everything** — source files, domain, hosting, all in your name

Kea now holds the hosting and bills for it, so this is false as written. Both
copies change to:

> **You own what matters** — your domain and all source files are in your name;
> I host and maintain the site so you never have to think about it

Appears twice: `index.html:443` (homepage) and `index.html:575` (About page).
Both must change together.

## Everything that has to change

| # | Location | Change |
|---|---|---|
| 1 | Desktop nav | Services dropdown removed; a single link to the Services page |
| 2 | Mobile drawer | Same |
| 3 | `#p-branding`, `#p-online-presence`, `#p-app-building` | Delete the three page sections |
| 4 | Homepage block 4, "Four Ways I Can Help" | Becomes the three packages — the natural fit now that there is one service |
| 5 | `#p-services` | Rebuilt as the full website service page carrying the tiers and terms |
| 6 | Hero subline | "Branding, websites, online visibility and custom apps…" no longer true; rewritten around websites and the location |
| 7 | Contact form `#f5` | Options reduced to the three tiers, a consultation, and "something else" |
| 8 | Footer services list | Four links become one |
| 9 | Portfolio `CATS` | Reduced to All, Website Development, App Development |
| 10 | FAQ timeline answer (`index.html:621`) | Mentions branding and apps; rewritten around the three tiers |
| 11 | `SERVICES` array in JS | Replaced by a `TIERS` array |
| 12 | Ownership promise, two copies | Reworded as above |

## Out of scope

- The footer's remaining "we" voice — flagged separately, not part of this change.
- Compressing `waves.mp4` (17 MB).
- The wave-driven hero text effect, still parked.
