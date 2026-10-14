# Empire Store

Empire Store is a reusable, self-hosted commerce foundation for businesses in The Empire. The intention is to build the store engine once, then adapt its branding and catalog for each new business without rebuilding checkout, accounts, order management, or digital delivery.

The first business is **Promptugraphy**, selling downloadable PDF products. This repository holds the store's code and public brand configuration. Product files, credentials, and customer data stay outside GitHub.

## What this project is meant to become

A minimal storefront and a central admin for products, customers, orders, payments, promotions, and customer relationships. Medusa supplies the commerce engine; Next.js supplies the website. Stripe handles payments, Resend sends transactional emails, and S3-compatible storage holds uploaded files in production.

Each brand gets its own configuration and deployment/database. Changing the active brand changes the store's identity; it does not partition an existing database. Create a fresh database for a new business. The storefront can be redesigned without replacing the commerce engine.

Digital downloads are the first supported product type. Medusa also supports physical products; a physical-goods launch still needs shipping profiles, shipping methods, inventory, and fulfillment configuration.

## Implemented

- Brand-driven name, logo, colors, fonts, home page copy, selling region, and catalog.
- Products, cart, digital checkout without shipping, customer accounts, order confirmation, and a customer download library.
- Private PDF delivery through signed, expiring links. Downloads require captured payment (or a free order); canceled or refunded orders lose access. Partial refunds conservatively revoke all digital files on that order.
- Download logging and automatic digital fulfillment, shown as delivered in the admin. Physical items in a mixed order remain independently fulfillable.
- Stripe integration with immediate capture and webhook support. Existing regions can be switched from manual payments with the setup script below.
- Resend email delivery with HTML and plain-text download messages, retry protection, and an admin action to send fresh links. Without keys, development emails go to the console.
- Local development storage and configurable S3-compatible production storage.
- Private customer notes and tags, a timeline of notes/orders, and net lifetime spend by currency in the customer admin.
- A store overview page with 30-day orders and revenue, customer/product counts, pending download emails, and integration status. Revenue excludes cancellations and subtracts refunds. Large stores show when figures cover only the latest 1,000 orders.
- An explicit newsletter preference in Account > Profile. Subscribers join a customer group; opting out removes them. Purchasing does not subscribe a buyer.
- An idempotent setup script for a 20% 72-hour launch code and a 15% code restricted to signed-in newsletter subscribers.

## Repository layout

```text
apps/backend/       Medusa API, workflows, digital-product and CRM modules, admin
apps/storefront/    Next.js customer website
brand/<name>/       brand.json and public logos for each business
brand/.active       Active brand folder name (or set BRAND)
docs/deployment.md  Production setup and remaining account settings
```

The Promptugraphy catalog publishes The Deliberate Day and The Deliberate Focus. Other catalog entries are drafts until their launch assets are ready.

## Run locally

Requires Node 22.22+, pnpm 12.11.2, and PostgreSQL 15+. On this Mac, PostgreSQL 16 is installed through Homebrew.

```bash
pnpm install --frozen-lockfile
createdb store_boilerplate
cd apps/backend
cp .env.template .env
```

Set `DATABASE_URL`, `BRAND_ASSETS_DIR`, `JWT_SECRET`, and `COOKIE_SECRET` in the local backend environment. Generate secrets with `openssl rand -hex 32`; use different values for each secret. Existing local environments can be kept.

```bash
pnpm exec medusa db:migrate
pnpm exec medusa user -e you@example.com -p '<choose-password>'
pnpm exec medusa exec ./src/scripts/seed-brand.ts
```

Copy `apps/storefront/.env.template` to `.env.local`, then set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` from Admin > Settings > Publishable API Keys.

```bash
# From the repository root
pnpm run dev
```

Shop: <http://localhost:8000/us>. Admin: <http://localhost:9000/app>.

## Your seller dashboard

Open <http://localhost:9000/app> and sign in with your Medusa admin account. The customer website and the seller dashboard have separate addresses and logins.

- **Store overview** (<http://localhost:9000/app/store-overview>): orders, revenue, customer/product counts, and integration status.
- **Products / Digital products**: manage the catalog and upload downloadable files.
- **Orders**: manage payments, refunds, fulfillment, and the digital delivery widget's resend action.
- **Customers**: open a customer to see private notes, tags, lifetime spend, and their timeline.
- **Promotions**: manage launch and subscriber discounts.

## Local test payments

In development, manual payment is authorized at checkout. Capture the test payment in the admin before expecting a download; authorization alone grants no file access.

## Enable payments and email

Add `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET` to the backend environment, and Stripe's public key as `NEXT_PUBLIC_STRIPE_KEY` in the storefront. Restart the backend, then run:

```bash
cd apps/backend
pnpm exec medusa exec ./src/scripts/configure-payments.ts
```

This switches the active brand's existing region to Stripe only. The backend's Stripe provider captures payment immediately. Configure the webhook endpoint and events in [the deployment guide](docs/deployment.md).

Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to enable real download emails. The sender must belong to a verified Resend domain. The delivery widget distinguishes console logging from provider acceptance; acceptance is not proof that an email arrived in the inbox.

## Configure launch promotions

Set `LAUNCH_STARTS_AT` to the actual launch date/time (ISO 8601), then run:

```bash
cd apps/backend
pnpm exec medusa exec ./src/scripts/seed-promotions.ts
```

Defaults: `LAUNCH20`, 20% for 72 hours; `SUBSCRIBER15`, 15% for members of the Newsletter subscribers group. Override the code names with the environment variables in `.env.template`. Re-running keeps existing promotions, including their dates and values. Manage changes in Admin > Promotions. Customers must sign in to use the subscriber offer.

## Create another brand

1. Copy `brand/promptugraphy/` to `brand/<new-name>/`.
2. Edit `brand.json` and replace its logos, catalog paths, and public contact details.
3. Set `BRAND=<new-name>` or update `brand/.active`.
4. Create a new database and set `BRAND_ASSETS_DIR` to that business's private product assets.
5. Run migrations and the brand seed against that new database.

Product files are uploaded to private storage; product images are public. Do not place paid files in the storefront's `public/` folder, expose the private upload directory, or commit them.

## Verify changes

```bash
cd apps/backend
pnpm run lint
pnpm exec tsc --noEmit
pnpm run test:unit

# With the local development servers running, manual payments and console email:
pnpm exec medusa exec ./src/scripts/verify-store.ts

cd ../storefront
pnpm run lint
pnpm exec tsc --noEmit
pnpm run build
```

The local API verification creates a checkout, captures its manual payment, downloads a file, checks fulfillment and CRM, verifies newsletter consent and promotion eligibility, then refunds the order and verifies access is revoked. It removes its temporary promotions and leaves a clearly identified refunded test order/customer for auditing. It refuses to run against a production URL or with external providers configured.

## Launch settings still needed

The code does not create external accounts or deploy itself. Going live requires Stripe keys/webhooks, a verified email domain and Resend key, an appropriately private S3 bucket, PostgreSQL/Redis hosting, backend/storefront hosting, HTTPS, DNS, and the store's tax configuration. See [docs/deployment.md](docs/deployment.md).

Optional future extensions include external newsletter-platform sync, automated new-edition announcements, and additional CRM automation. The existing newsletter consent and file-version data provide their starting points.

## Credits

Based on Medusa's MIT-licensed DTC starter and official digital-product example. Medusa supplies the commerce engine; this project adds reusable branding, private delivery, and the business tools described above.
