# Console

> Your dashboard for web3.storage

Upload files & manage your spaces from your browser.

## Getting Started

To use the production site visit https://console.web3.storage

To contribute and customize console:

```bash
# First-time setup
cp .env.tpl .env
pnpm install

# Run dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying [`src/app/page.tsx`](src/app/page.tsx). The page auto-updates as you edit the file.

### Payment Info

Normally, a new account must first add payment information through Stripe. You can skip this by setting in your `.env`:

```ini
NEXT_PUBLIC_DISABLE_PLAN_GATE=false
```

You can also go through the Stripe flow if you wish, [using a Stripe test card](https://docs.stripe.com/testing#use-test-cards).

### Using an alternate w3up service

By default, this app connects to https://staging.up.web3.storage. To use an alternate service, specify the service URL and DID in your .env, like:

```ini
NEXT_PUBLIC_W3UP_SERVICE_URL=https://your.w3up.service
NEXT_PUBLIC_W3UP_SERVICE_DID=did:your-service-did
```

If you are using `w3infra`, the service URL will be displayed as the `UploadApiStack`'s `ApiEndpoint` output once `npm start` has successfully set up your development environment.

<p style="text-align:center;padding-top:2rem">⁂</p>


