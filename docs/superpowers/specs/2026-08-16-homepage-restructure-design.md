# Kea Web Creations — Homepage Restructure

**Date:** 2026-08-16
**Status:** Approved design, not yet implemented
**File touched:** `index.html` (single-file site)

## Problem

The homepage carries eleven blocks. A visitor must scroll past all of them to reach a
single call to action. Three specific faults:

1. **The work is shown three times.** "Check Our Latest Work" (portfolio strip),
   "Before & After", and "Case Studies" all say *look at what I made*.
2. **Trust is proved twice.** A client-logo wall and a testimonials block sit
   back to back.
3. **Two blocks sit too deep for a homepage.** "Tech Tools We Use" and
   "Monthly Retainers" matter only after a visitor has decided they like the studio.

Two further problems surfaced while reading the file:

- **The content is invented.** 16 placeholder projects (`WORK`), 4 placeholder case
  studies (`CASES`), and 12 placeholder client logos (`LOGOS`) ship as if real.
- **The voice contradicts itself.** The nav says "About Me" and "Book a Private
  Consultation"; the hero and intro say "we". The site cannot decide whether Kea is
  a person or an agency.

## Strategy

Two differentiators, chosen deliberately:

- **The site is the proof.** The homepage demonstrates craft rather than claiming it.
  Signature motion lives in the hero.
- **Founder-led.** First person throughout. A named, photographed person you deal
  with directly. An agency cannot copy this.

The primary path is **work first, ask later**. The hero pushes a visitor toward the
work, not toward a contact form.

## Structure

Five blocks, down from eleven.

### 1. Hero

Keep `waves.mp4`, the layout, and the type treatment.

| Element | Change |
|---|---|
| Headline | "We Make Your Business Impossible to Overlook." → **"Websites That Make Waves."** |
| Subline | Reworded — must not repeat "make waves"; carries service keywords and location |
| Button | "Let's Get Started Today" → **"See the Work"**, scrolling to block 2 rather than routing to `#/contact` |

Subline copy:

> Branding, websites, online visibility and custom apps for small businesses in
> Beaverton and across the Pacific Northwest.

This preserves the four service keywords and adds the location, both of which the
page needs for local search once the services block moves lower.

The hero is also where the wave-driven text effect will live. Specified separately —
see Follow-up work.

### 2. The Work

The new centerpiece, placed directly after the hero.

- Three to five **real** projects as large cards with real screenshots.
- **Each card links to the live site and opens in a new tab.** Today every portfolio
  tile routes to `#/contact`, which discards the strongest asset on the site. A
  clickable, working site is stronger proof than any testimonial.
- Caption per card: business name, one line on what was built.
- A quiet "See all work →" link to the Portfolio page beneath the grid.
- No category filters here. Filters belong on the Portfolio page, and with five
  projects they are close to pointless there too.

Flagship project: **capturewithki.com** — a live client site with client galleries,
a CMS, Firebase functions and automatic cleanup. It demonstrates both Website
Design & Development and App Building in one piece of work.

### 3. Who I Am

Photo, and copy that already exists on the About page but that almost nobody reaches.

Lift verbatim:

> A one-person studio. You talk to the person who does the work, every time, from
> the first email to the last invoice.

> Agencies sell you the senior team and staff the project with juniors. I can't do
> that — there's only me.

Bring up the four checkmarks from the About page as well: straight pricing, you own
everything, built to be handed over, local and awake. These are concrete promises,
which outperform adjectives.

Ends with "More about how I work →" to `#/about`.

Placed after the work on purpose: a visitor has just been impressed, and the natural
next question is *who made this?*

### 4. What I Do

The four existing services — Branding, Elevate Your Online Presence, Website Design
& Development, App Building — condensed from large boxes with placeholder artwork
and full paragraphs down to a compact row: name, one line, link to the existing
service page.

Sits low deliberately, but must stay on the page. It is what makes the studio
findable in searches such as "web designer Beaverton".

### 5. Let's Talk

The ask, finally. Copy lifted from the About page:

> Thirty minutes, no pitch. Bring the messy version of the idea.

One button.

## Removals

| Block | Disposition |
|---|---|
| Before & After | Delete |
| Case Studies | Merged into The Work; delete the `CASES` array |
| Tech Tools We Use | Move to the Services page |
| Monthly Retainers | **Delete.** Dropped entirely, not moved |
| Clients We Have Served | Delete; the 12 logos are invented |
| Testimonials | Delete; no real testimonials exist |

Fabricated client logos are the single riskiest thing on the site — a visitor who
recognises a named business that was never a client loses all trust at once.

## Data changes

- `WORK` — replace 16 invented projects with the real 3–5. Each entry needs
  `img:'shots/<name>.jpg'` (the field is already supported) plus a live URL.
- `CATS` — remove **Photography** and **Video**. Kea sells branding, online
  presence, websites and apps; photography is a client's industry, not a service
  line. Remaining: All, Branding, Logo & Identity, Website Development,
  App Development, Online Presence.
- `CASES` — delete.
- `LOGOS` — delete.
- Retainer grid (`retGrid`) — delete.
- Portfolio tile links — change from `#/contact` to the project's live URL,
  `target="_blank" rel="noopener"`.

## Voice

Convert the homepage from "we" to "I" throughout. The intro paragraph beginning
"Kea Web Creations was built on a passion for design…" is the main offender and
gets rewritten as part of block 3.

## Content required from Laakea

Cannot be invented. For each of the 3–5 real projects:

- Business name
- Live URL
- Screenshot
- One sentence describing what was built

Plus one photo of himself for block 3.

## Follow-up work, out of scope here

- **Wave-driven hero text effect.** Measured against `waves.mp4`: the clip runs
  8.34s and loops; a bright foam edge climbs from the bottom of the frame to near
  the top across the loop, then resets. The foam line is well defined against dark
  water and can be tracked to drive text visibility. The clip washes *up* only —
  there is no wash back down. Needs its own design pass.
- **Portfolio page filters.** With five projects, reconsider whether filters earn
  their place at all.
