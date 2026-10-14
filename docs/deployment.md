# Deploying Empire Store

Deploy a backend, storefront, PostgreSQL database, Redis instance, and S3-compatible file store for each brand. This guide describes setup; no infrastructure is provisioned by the repository.

## Backend configuration

Set `NODE_ENV=production`. Copy the variable names from `apps/backend/.env.template` into your hosting platform's secret settings. Production startup rejects missing payment/email/storage settings, short signing secrets, and an HTTP backend URL.

- Set the database and Redis URLs. Redis is used for events, workflow execution, and distributed locks.
- Set distinct random `JWT_SECRET` and `COOKIE_SECRET` values of at least 32 characters, plus an `AUTH_MFA_ENCRYPTION_KEY` for admin MFA. Optionally set a separate `DOWNLOAD_TOKEN_SECRET`.
- Set `MEDUSA_BACKEND_URL` to the public HTTPS API URL.
- Set `STORE_CORS`, `ADMIN_CORS`, and `AUTH_CORS` to the exact HTTPS origins that need access.
- Set `BRAND_DIR` to the absolute deployed `brand/` directory. Include that directory in the deployed artifact; compiled backend files alone do not contain the brand configuration.
- Set `BRAND` to the deployed brand name.
- Make the private source catalog available at `BRAND_ASSETS_DIR` when running the initial brand seed. Do not expose this directory over HTTP.

Install dependencies with `pnpm install --frozen-lockfile`. Build the backend from `apps/backend` with `pnpm run build`, apply `pnpm exec medusa db:migrate`, and follow [Medusa's deployment instructions](https://docs.medusajs.com/learn/deployment/general) for running the generated `.medusa/server` app. Copy the selected brand folder to the runtime image or mount it at `BRAND_DIR`.

Use a process supervisor or hosting platform restart policy. Keep the API and worker running; the default shared mode can run both in one instance. Back up PostgreSQL and object storage.

## Stripe

Use test keys until checkout passes with Stripe test cards. Set backend `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET`, and storefront `NEXT_PUBLIC_STRIPE_KEY`.

Register this webhook endpoint in Stripe:

```text
https://<backend-host>/hooks/payment/stripe_stripe
```

Listen to `payment_intent.amount_capturable_updated`, `payment_intent.succeeded`, `payment_intent.payment_failed`, and `payment_intent.partially_funded`. The provider is configured with `capture: true`.

Run `src/scripts/configure-payments.ts` after adding keys. This removes manual payment from the active region. Confirm that the storefront offers Stripe and that a successful test purchase has captured payment before its file is available. See [Medusa's Stripe provider documentation](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe).

## Resend

Verify your sending domain in Resend and add its requested DNS records. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`. Restart the backend, place a test order, and confirm the email arrives with usable links. The admin can resend fresh links after payment capture. See [Medusa's notification integration guide](https://docs.medusajs.com/resources/integrations/guides/resend).

## S3-compatible storage

Set `FILE_PROVIDER=s3`, then configure `S3_FILE_URL`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, and `S3_BUCKET`. Set `S3_ENDPOINT` for a compatible provider and `S3_FORCE_PATH_STYLE=true` when required. The default object prefix is `store/`.

The Medusa S3 provider uses public access for product images and private access for paid files. Choose a bucket/provider that honors object-level access controls. Do not add a bucket-wide public-read policy: that can override private access and expose paid PDFs. Public images must remain accessible while anonymous requests to paid files return 403/404. A CDN or public bucket configuration that serves every object is unsuitable for mixed public/private files.

Changing the provider does not migrate existing local files. For a fresh production database, seed the catalog with S3 already configured. For an existing production database, migrate its files and update their file records with a separately verified migration before changing providers.

See [Medusa's S3 provider documentation](https://docs.medusajs.com/resources/infrastructure-modules/file/s3). Confirm privacy with an actual uploaded paid file before launching.

## Storefront, DNS, and store settings

Set the storefront's publishable Medusa key, backend HTTPS URL, public website URL, default region, Stripe public key, brand name, and absolute `BRAND_DIR`. The public key must be linked to the sales channel containing the catalog.

Build the storefront with the backend reachable. Run it as a Next.js production app. Point the chosen domain to its hosting platform and the API subdomain to the backend. Enable HTTPS for both, update CORS, and configure public contact/help links in `brand.json`.

Set the store's applicable tax rates in Admin > Settings > Tax Regions. The repository does not decide tax obligations or create tax registrations. Set the actual launch time before creating the launch promotion.

Before opening sales, verify a full Stripe test checkout, email receipt, account library, guest download, digital fulfillment, refund access revocation, and anonymous private-file denial. Switch to live keys only after this passes; configure the matching live webhook secret.

## External dependencies

Stripe, Resend, storage, hosting, DNS, and tax settings require the owner's account access and values. No live keys or credentials belong in GitHub. The implementation can be built and reviewed before those accounts are connected.
