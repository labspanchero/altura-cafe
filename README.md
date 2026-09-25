# hello-world-next-app

A minimal **Next.js** starter deployed on [**Webflow Cloud**](https://webflow.com/cloud).

This is the vanilla variant — it's the exact output of `npx create-next-app@latest`, styled with a branded landing page and a few doc links to get you going.

> Looking for the variant with Cloudflare bindings (D1, R2, KV)?
> See [`hello-world-next-app-bindings`](https://github.com/Webflow-Examples/hello-world-next-app-bindings).

[![Deploy to Webflow](https://webflow.com/img/deploy-dark.svg)](https://webflow.com/dashboard/cloud/deploy?repo=https://github.com/Webflow-Examples/hello-world-next-app)

## Quickstart

```bash
# Install
npm install

# Run locally
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm start
```

## Deploy to Webflow Cloud

1. Fork this repo (or click **Use this template**).
2. In your Webflow site, open **Apps → Webflow Cloud → Create new app**.
3. Connect your GitHub account and select this repository.
4. Pick a mount path (e.g. `/next`) and click **Deploy**.

Full walkthrough: <https://developers.webflow.com/webflow-cloud/quickstart>.

## What's included

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4
- Branded landing page with links to the Webflow Cloud docs
- Zero extra deps beyond the framework

## Customizing

The landing page lives in `src/app/page.tsx`. Styles are in
`src/app/globals.css` under the `wf-*` prefix. Swap in your own content,
routes, and APIs — everything below `src/app` is yours.

## Learn more

- [Webflow Cloud docs](https://developers.webflow.com/webflow-cloud)
- [Next.js on Webflow Cloud](https://developers.webflow.com/webflow-cloud/frameworks/next-js)
- [Next.js documentation](https://nextjs.org/docs)

---

Built with Next.js · Deployed on Webflow Cloud.
