# Kalavishva SEO + Vercel setup

## 1. Replace the domain

Search the project for:

`YOUR-DOMAIN.vercel.app`

Replace it with your actual deployed Vercel domain, for example:

`kalavishva.vercel.app`

If you later connect a custom domain, use the custom domain instead.

Files to update:
- `index.html`
- `public/robots.txt`
- `public/sitemap.xml`

## 2. Before deployment

Make sure these real image files exist:

- `public/logo.png`
- `public/hero-1.jpg`
- `public/hero-2.jpg`
- `public/hero-3.jpg`
- `public/hero-4.jpg`

Product images should be inside:

`public/products/`

## 3. Deploy to Vercel

Build locally first:

```bash
npm run build
```

If the build succeeds, push to GitHub and import the repository into Vercel.

Vercel settings for a normal Vite project:
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## 4. Google Search Console

After deployment:
1. Open Google Search Console.
2. Add your Vercel/custom domain.
3. Verify ownership.
4. Submit:

`https://YOUR-DOMAIN.vercel.app/sitemap.xml`

## 5. Important SEO notes

The site is a React SPA, so the primary SEO metadata is in `index.html`.
Keep the title and description natural and relevant.
Do not keyword-stuff the page.
Use descriptive product names and real product images.
When you add a product, use a useful product name and description in `src/data.js`.
