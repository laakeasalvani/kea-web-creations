# Pacific Web Design — Landing Page

Single-file landing page for Pacific Web Design (`index.html`, CSS embedded, no build step).

## Preview locally

Open `index.html` directly in a browser, or serve it:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a new repository on GitHub (e.g. `pacific-web-design`), do **not** initialize it with a README.
2. Push this repo:

```bash
git remote add origin https://github.com/<your-username>/pacific-web-design.git
git branch -M main
git push -u origin main
```

3. On GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `root`**.
4. The site will be live at `https://<your-username>.github.io/pacific-web-design/`.

## Content to replace before launch

Search for `PLACEHOLDER` in `index.html` — this marks the bio, testimonial, and pricing content that should be swapped for real content.
