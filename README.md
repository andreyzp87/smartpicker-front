# SmartPicker Frontend

SmartPicker is an Astro-based frontend for a smart home compatibility catalog. It renders static pages for devices, integrations, platforms, hubs, manufacturers, protocols, and categories using exported JSON data in `data/exports`.

The site is static-first, search-friendly, and deploys cleanly to Cloudflare Pages. Interactive experiences such as catalog filtering and search are handled with React islands fed by prerendered JSON endpoints.

## What This Project Does

- Renders browsable catalog pages for smart home entities
- Builds device detail pages with compatibility metadata
- Exposes prerendered machine-readable endpoints at `/catalog.json`, `/search.json`, and `/sitemap.xml`
- Supports local filesystem exports during development and remote export fetching when needed
- Deploys as a static site to Cloudflare Pages

## Stack

- Astro 6
- React 19 islands via `@astrojs/react`
- TypeScript
- Tailwind CSS v4
- Vite 7
- Cloudflare Pages + Wrangler

## Project Structure

```text
.
├── data/
│   └── exports/        # Source JSON contracts used to build the site
├── docs/               # Internal implementation notes
├── public/             # Static assets
├── src/
│   ├── components/     # Astro and React UI
│   ├── layouts/        # Shared page shells
│   ├── lib/            # Export readers, catalog/search payload builders, helpers
│   ├── pages/          # Astro routes and JSON/XML endpoints
│   └── styles/         # Global styles
├── astro.config.mjs
├── package.json
└── wrangler.jsonc
```

## Data Model

The app is driven by exported JSON files in `data/exports`, including:

- `products.json`
- `integrations.json`
- `platforms.json`
- `hubs.json`
- `manufacturers.json`
- `protocols.json`
- `categories.json`
- `site.json`
- `search.json`
- `sitemap.json`
- `types.ts`

At runtime, the site reads these exports through `src/lib/exports.ts`. The source can be:

- `local`: read from `data/exports`
- `remote`: fetched from `CMS_EXPORTS_URL`

## Getting Started

### Requirements

- Node.js `>=24.12.0`
- `pnpm` `10.33.0` or compatible

### Install

```sh
pnpm install
```

### Run Locally

```sh
pnpm dev
```

Open the local Astro server URL shown in the terminal.

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

```dotenv
PUBLIC_SITE_URL=https://smartpicker.io
EXPORTS_SOURCE=local
EXPORTS_DIR=./data/exports
CMS_EXPORTS_URL=
```

- `PUBLIC_SITE_URL` sets the canonical site URL used by Astro and sitemap generation
- `EXPORTS_SOURCE` chooses `local` or `remote` export loading
- `EXPORTS_DIR` points to the local export directory when using `local`
- `CMS_EXPORTS_URL` is required when `EXPORTS_SOURCE=remote`

## Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Astro development server |
| `pnpm build` | Build the production site into `dist/` |
| `pnpm preview` | Preview the production build locally |
| `pnpm cf:pages:dev` | Build and serve the site with Cloudflare Pages locally |
| `pnpm cf:pages:deploy` | Build and deploy `dist/` to Cloudflare Pages |
| `pnpm generate-types` | Regenerate Wrangler type definitions |
| `pnpm format` | Format the repository with Prettier |
| `pnpm format:check` | Check formatting without writing changes |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with autofixes |
| `pnpm check` | Run Astro and TypeScript checks |
| `pnpm validate` | Run format check, lint, Astro checks, and build |

## Key Routes

- `/` home page with featured catalog content
- `/devices` main filterable device catalog
- `/devices/[slug]` device detail pages
- `/integrations`, `/platforms`, `/hubs`, `/manufacturers`, `/protocols`, `/categories`
- `/catalog.json` prerendered catalog payload for the device browser
- `/search.json` prerendered global search payload
- `/sitemap.xml` sitemap output

## Architecture Notes

- `src/pages` contains the route layer
- `src/lib/catalog/server.ts` builds the filterable catalog payload from exports
- `src/lib/search/server.ts` builds the global search payload
- React islands power interactive UI, while Astro handles static rendering
- The build does not depend on live database queries in the page layer

## Deployment

This project is set up for Cloudflare Pages and outputs a static `dist/` directory.

Typical deployment flow:

```sh
pnpm build
pnpm cf:pages:deploy
```

`wrangler.jsonc` contains the Pages configuration, and `PUBLIC_SITE_URL` should match the deployed domain for correct canonical URLs and sitemap entries.
