# SmartPicker Frontend

Astro frontend for `smartpicker.io`, currently targeting Node deployment with Tailwind and React available where needed.

## Setup

```sh
pnpm install
pnpm dev
```

Local environment defaults live in `.env`, and the tracked template is `.env.example`.

## Environment

```dotenv
PUBLIC_SITE_URL=https://smartpicker.io
EXPORTS_SOURCE=local
EXPORTS_DIR=./data/exports
CMS_EXPORTS_URL=
```

- `PUBLIC_SITE_URL` powers the Astro `site` setting for canonical URLs and sitemap generation.
- `EXPORTS_SOURCE=local` reads JSON exports from the filesystem during development.
- `CMS_EXPORTS_URL` is only needed when `EXPORTS_SOURCE=remote`.

## Project Structure

```text
/
├── data/
├── docs/
├── public/
├── src/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   └── styles/
└── package.json
```

## Commands

| Command               | Action                                                 |
| :-------------------- | :----------------------------------------------------- |
| `pnpm dev`            | Start the local Astro dev server                       |
| `pnpm build`          | Build the Node-targeted production bundle              |
| `pnpm preview`        | Preview the production build locally                   |
| `pnpm format`         | Format the repo with Prettier                          |
| `pnpm lint`           | Run ESLint across Astro, JS, and TS files              |
| `pnpm check`          | Run `astro check` for Astro and TypeScript diagnostics |
| `pnpm validate`       | Run formatting, linting, type checks, and build        |
| `pnpm generate-types` | Regenerate Wrangler worker type definitions            |

## Notes

- The project is configured for Node deployment for now.
- Sitemap generation is enabled and uses `PUBLIC_SITE_URL`.
