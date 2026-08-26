# Kea Web Creations

Single-file website for Kea Web Creations (`index.html`, CSS and JS embedded, no build step).

## Preview locally

Open `index.html` directly in a browser, or serve it:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

1. On GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `root`**.
2. The site is live at `https://keawebcreations.com` (custom domain, set by the
   `CNAME` file in the repo root). The old `https://laakeasalvani.github.io/kea-web-creations/`
   address still works and redirects there.

## Contact form

The form on `#/contact` posts to a Cloud Function, `keaInquiry`:

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

## Content to replace before launch

- Testimonials on the home page (`[Client name]` / `[Business name]`)
- Case studies and portfolio projects (currently `Project One`–`Project Sixteen`)
- Client logos (currently placeholder `Your Client` tiles)

`docs/` contains planning notes from an earlier iteration of this site and can be removed once no longer useful.
