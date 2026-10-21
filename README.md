# Flowance

> Personal finance Sankey-diagram builder. Visualize how income flows into
> spendings and savings.

Modern dark-dashboard web app,
built with React + D3-Sankey. Multiple incomes, arbitrarily nested spending
categories, automatic Savings node, drag-to-reorder, currency selector,
German/English UI, SVG export, validation warnings.

## Tech

- **Vite + React 18 + TypeScript** — fast dev loop, typed components.
- **D3 / d3-sankey** — diagram layout & rendering.
- **Zustand** (persisted) — small, ergonomic state.
- **@dnd-kit** — accessible drag & drop.
- **react-i18next** — DE / EN runtime toggle.
- **Tailwind CSS** — utility styling on a custom design token palette.
- **Cloudflare Workers (static assets)** — production hosting at the edge.

## Local development

```bash
npm install
npm run dev          # http://localhost:5173
```

## Production build

```bash
npm run build        # outputs ./dist
npm run preview      # serve ./dist through the local Workers runtime on :8787
```

## Deployment (Cloudflare Workers)

Flowance is a purely static SPA, deployed as an assets-only Worker — no Worker
script runs, so requests are free and don't count toward the Workers free-plan
request quota.

- `wrangler.jsonc` — serves `./dist`, falls back to `index.html` for unknown
  paths (SPA routing).
- `public/_headers` — security headers + immutable caching for hashed
  `/assets/*`. Copied into `dist/` by Vite.

### From your machine

```bash
npx wrangler login   # once
npm run deploy       # build + wrangler deploy
# → https://flowance.<your-subdomain>.workers.dev
```

### From Git (auto-deploy on push)

In the Cloudflare dashboard: **Workers & Pages → Create → Import a repository**,
pick this repo, and set:

- **Build command**: `npm run build`
- **Deploy command**: `npx wrangler deploy`

### Custom domain

Workers & Pages → `flowance` → **Settings → Domains & Routes → Add → Custom
domain**. Keep the same hostname across migrations: entries live in
`localStorage`, which is bound to the origin.

## Data & privacy

- All entries live in your browser's `localStorage`. Nothing is sent anywhere.
- "Save" = **Export SVG**: produces a standalone, self-contained `.svg` you can
  archive, share, or embed.
- "Reset" restores the seed data; clearing browser storage wipes everything.

## Project layout

```
src/
  components/     UI: Toolbar, SidePanel, SankeyDiagram, SummaryBar
  store/          Zustand store (persisted nodes + settings)
  lib/            Pure helpers: sankey builder, SVG export, currency formatting
  i18n/           DE + EN translations
  types/          Domain types (flexible tree model)
  styles/         Tailwind + global CSS (grain overlay, scrollbars, components)
```

## License

MIT
