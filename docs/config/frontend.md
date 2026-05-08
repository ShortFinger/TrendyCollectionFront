# TrendyCollectionFront — local development configuration

Repository: `TrendyCollectionFront/` (Vue + Vite).

## Dev server

| Setting | Value |
|---------|--------|
| Dev server port | **5173** (`vite.config.ts`) |
| Path alias | `@` → `src/` |

## API proxy (development only)

`vite.config.ts` proxies browser requests so the SPA can call backend APIs on localhost:

| Browser prefix | Proxied to |
|----------------|------------|
| `/admin-api` | `http://localhost:8081` (Admin API) |
| `/order-admin-api` | `http://localhost:8082` (Order Admin API) |

Production builds do not use this proxy; API base URLs come from deployment (CDN/hosting) configuration.

## Environment variables

The codebase uses almost no `import.meta.env` keys today (only `BASE_URL` for Vue Router history). If you add `.env` files later, keep secrets out of git and document variables here.

## Backend configuration index

For ports, Nacos, and Docker env for Java services, see the sibling backend repo:

`TrendyCollectionService/docs/config/README.md`  
(relative from this file: [`../../../TrendyCollectionService/docs/config/README.md`](../../../TrendyCollectionService/docs/config/README.md))
