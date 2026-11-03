# Promptugraphy public website

The public publishing website for Promptugraphy. This is the Vercel entry point in the Empire Store repository. It uses the existing brand artwork and sends purchases to the two published Gumroad products. Gumroad provides payment processing, receipts, and private PDF delivery. The Medusa backend and the Empire owner workspace remain in their existing apps.

## Develop and check

From this directory:

```sh
node scripts/build.mjs
node scripts/check.mjs
node scripts/serve.mjs
```

Preview: http://127.0.0.1:4187

There are no package dependencies. Source content and shared page templates live in `scripts/build.mjs`; `samples.json` contains only the two selected public sample prompts. Styles, interactions, and optimized public artwork are in `assets/`. The build creates the ignored `dist/` directory.

The link check verifies page headings, internal links, assets, anchors, metadata, structured data, purchase destinations, and the absence of paid PDFs and environment files from public output.

## Publish on Vercel

Use `apps/website` as the Vercel project root. `vercel.json` defines the static build and security headers. Deploying this directory does not require the Medusa backend, payment keys, or database access.

```sh
vercel deploy --prod --yes --project promptugraphy --scope galibs-projects-38084c07
```

The primary website is https://promptugraphy.com, with www redirected to the primary address. https://promptugraphy.vercel.app remains available as a deployment address. Canonical links and the sitemap use the primary domain; set `SITE_URL` to override it and rebuild after changing it.

Namecheap keeps the domain registration and DNS. The web records are two `@` A records (`216.198.79.1`, `64.29.17.1`) and the `www` CNAME (`a6c3f88dec237e7a.vercel-dns-017.com.`). The existing Namecheap mail forwarding and MX/TXT records remain in place.

Do not copy the product PDFs, customer information, `.env` files, or the private catalog source into this application. Keep unfinished products out of the purchasable catalog.

## Design decisions

The site keeps Promptugraphy's warm paper, black, botanical artwork, and serif typography. The revised composition follows the owner's Second Brain references: precise grids and archival artwork, with sparse labels and varied section structures. Avoid adding an eyebrow and explanatory subtitle to every heading. The “welcome to my universe” direction belongs to the owner's separate personal website.
