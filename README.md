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
- **Nginx (Alpine)** — production static serving.

## Local development

```bash
npm install
npm run dev          # http://localhost:5173
```

## Production build

```bash
npm run build        # outputs ./dist
npm run preview      # serve dist locally on :4173
```

## Docker deployment

The repo ships a multi-stage `Dockerfile` and a hardened `docker-compose.yml`.

```bash
# Build & run app only (recommended default)
docker compose up -d --build
# → http://<host>:8080

# Build & run app + optional Cloudflare Tunnel reverse proxy
docker compose --profile cloudflared up -d --build

# Or build & run manually
docker build -t flowance:latest .
docker run -d --name flowance -p 8080:80 --restart unless-stopped flowance:latest
```

Change the host port by editing `ports:` in `docker-compose.yml`.

### Behind a reverse proxy (Traefik / Caddy / nginx)

The container listens on port `80` internally. Point your proxy at it; no
extra config needed (SPA routing is handled inside the container).

### Optional: Cloudflared reverse proxy

`docker-compose.yml` includes an optional `cloudflared` service behind the
`cloudflared` profile.

1. Create a Cloudflare Tunnel in Zero Trust and copy its token.
2. In Cloudflare, add a Public Hostname for your domain/subdomain and set:
  - **Type**: HTTP
  - **URL**: `http://flowance:80`
3. Create a `.env` file next to `docker-compose.yml`:

```bash
CLOUDFLARED_TUNNEL_TOKEN=<your_tunnel_token>
TZ=UTC
```

4. Start with the Cloudflared profile enabled:

```bash
docker compose --profile cloudflared up -d --build
```

Without the profile, only the `flowance` service starts.

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
