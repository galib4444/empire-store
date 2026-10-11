# Store boilerplate

A self-hosted online store: storefront, admin, orders, customers and discounts in one place. Built on [Medusa](https://medusajs.com) (the store engine and admin) and Next.js (the website). It sells digital downloads out of the box and can sell physical goods later.

Everything specific to one business lives in `brand/<name>/`. The first brand is Promptugraphy.

## What is where

```
apps/backend/      Medusa server and admin (http://localhost:9000/app)
apps/storefront/   The website buyers see (http://localhost:8000)
brand/<name>/      One folder per brand: brand.json (name, colors, fonts, catalog) and logo
brand/.active      The name of the brand in use
```

## Run it locally

Needs Node 22+, pnpm and PostgreSQL.

```bash
pnpm install
createdb store_boilerplate

cd apps/backend
cp .env.template .env            # then set DATABASE_URL and BRAND_ASSETS_DIR
pnpm exec medusa db:migrate      # creates tables and sets up the store from brand.json
pnpm exec medusa user -e you@example.com -p <password>
pnpm exec medusa exec ./src/scripts/seed-brand.ts   # loads the catalog

cd ../..
pnpm run dev
```

The storefront also needs `apps/storefront/.env.local` with `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`. Copy the key from the admin under Settings > Publishable API Keys.

## How digital delivery works

1. Checkout is the standard Medusa flow. A digital product has no shipping profile, so there is no delivery step.
2. When an order is placed, a subscriber records which digital products were bought and sends an email with download links.
3. Buyer files are stored in a private folder that is not served over the web. A download link is a signed token that names one purchase and one file and expires (7 days by email, 1 hour on a page). `GET /downloads/:token` checks it and streams the file.
4. Buyers get fresh links on the order confirmation page and, when signed in, under Account > Library.
5. Each download is logged in `digital_product_download`.

The files you sell are never committed: `brand.json` names them by path, and they are read from `BRAND_ASSETS_DIR`.

## Start a new brand

1. Copy `brand/promptugraphy/` to `brand/<new-name>/` and edit `brand.json`: name, tagline, contact email, theme colors and fonts, home page copy, selling region and catalog.
2. Put the new name in `brand/.active` (or set the `BRAND` environment variable).
3. Point `BRAND_ASSETS_DIR` at the folder with that brand's product files and images.
4. Create a fresh database and run the migrate and seed commands above.

To restyle the storefront, change `theme` in `brand.json`. The colors and fonts flow into CSS variables (`apps/storefront/src/lib/brand.ts` and the end of `src/styles/globals.css`).

## Not done yet

- Stripe payments (the store currently uses Medusa's built-in manual payment for testing). When adding Stripe, set it to capture payment immediately; otherwise payments stay "authorized" while the buyer already has the file.
- Orders show "Not fulfilled" in the admin even after the download email goes out. Delivery is tracked in `digital_product_order.status` (`sent` once emailed) but not shown on the order page yet.
- Real email sending (emails are logged to the console)
- Production file storage (an S3-compatible bucket)
- CRM extras: customer notes, tags, timeline
- Discount codes, the "new edition" email, the overview dashboard
- Tax rates are 0 until set in the admin under Settings > Tax Regions

## Credits

The digital product module started from Medusa's official example, `medusajs/examples/digital-product` (MIT). The scaffold is Medusa's DTC starter (MIT).
