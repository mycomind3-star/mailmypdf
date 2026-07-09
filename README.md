ProofPost is a Next.js app for sending formal letters and keeping a clean proof packet for each paid order.
Each paid order exposes a proof packet download that bundles the original PDF, a receipt, and the order timeline.
Orders also store a proof level so the archive matches the selected letter type.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_APP_URL` to your local or deployed URL.
3. For live Stripe checkout and live order storage, set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. For Lob fulfillment, set:
   - `LOB_API_KEY`
   - `LOB_MODE` (`test` is recommended for sandbox testing; `live` uses production Lob)
   - `LOB_WEBHOOK_SECRET`
   - `AUTO_SUBMIT_TO_LOB` (`true` to auto-submit paid orders, `false` for manual submission)
5. Point your Lob webhook subscription at:
   - `https://<your-app>/api/public/lob-webhook`
   - `https://<your-app>/api/webhooks/lob` also works as an alias
6. For Lob’s webhook debugger, use the fixed secret `secret` when verifying test events.
7. For transactional email, optionally set:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`

## Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run lint` - run ESLint

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
