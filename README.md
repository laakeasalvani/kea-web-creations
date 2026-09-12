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
node --test tests/*.test.js
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

## Contact form

The form on `contact.html` posts to a Cloud Function, `keaInquiry`:

    https://us-west1-capturewithki-69dd3.cloudfunctions.net/keaInquiry

The code for it lives in the **capturewithki** repo (`functions/lib/kea.js` and
the `keaInquiry` export in `functions/index.js`), not here. It is deployed to
that Firebase project because this site is static and public — a Resend API key
written into `index.html` would be readable by anyone. The two sites share
nothing else: separate Firestore collection (`keaInquiries`), separate inbox,
separate templates, separate rate-limit buckets.

What happens on submit: the function drops bot submissions silently (honeypot
plus a three-second fill-time check), validates, rate-limits by IP, saves the
enquiry to Firestore, emails **keawebcreations@gmail.com**, and sends the
visitor an auto-reply.

Two things to know:

- Emails are sent **from `hello@capturewithki.com`** with the display name
  "Kea Web Creations", because that is the only domain verified in Resend.
  Once a Kea domain is bought and verified, change `KEA_FROM` in
  `capturewithki/functions/lib/kea.js` and redeploy. That is the only edit.
- A new site origin must be added to `KEA_ORIGINS` in
  `capturewithki/functions/index.js`, or the browser blocks the request with a
  CORS error that never reaches the function logs — the form just appears to
  do nothing. `keawebcreations.com`, `www.keawebcreations.com` and the
  original `laakeasalvani.github.io` are all allowed today.

Redeploy after either change:

    cd ~/capturewithki && firebase deploy --only functions:keaInquiry

The function only stores `name`, `email`, `phone`, `website`, `interest` and `message`.
The audit form's extra fields — business name, trade, services picked in the pricing
builder, and texting consent — are written into the top of `message` by `contact.js`.
Posting from `localhost` is blocked by the origin allowlist; test real submissions on
the live site.

## Content to add when it exists

- **Google reviews:** add a reviews section to the homepage once at least 3 real reviews exist.
- **CaptureWithKi case study:** add after the 30–60 day pilot, with real before/after numbers.
- **Services, About and FAQ pages:** planned for the next release.
- **Phone number:** the site uses La'akea's personal number. Replace every
  `(808) 306-8792` / `tel:+18083068792` (and `telephone` in each page's JSON-LD) when the
  GoHighLevel number exists.
