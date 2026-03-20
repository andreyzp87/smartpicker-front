# SmartPicker Frontend

Astro frontend for `smartpicker.io`, built as a static site that can be deployed to Cloudflare Pages.

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

| Command                | Action                                                 |
| :--------------------- | :----------------------------------------------------- |
| `pnpm dev`             | Start the local Astro dev server                       |
| `pnpm build`           | Build the static production bundle                     |
| `pnpm preview`         | Preview the production build locally                   |
| `pnpm cf:pages:dev`    | Build the site and serve the static output with Pages  |
| `pnpm cf:pages:deploy` | Build the site and deploy it with Wrangler Pages       |
| `pnpm format`          | Format the repo with Prettier                          |
| `pnpm lint`            | Run ESLint across Astro, JS, and TS files              |
| `pnpm check`           | Run `astro check` for Astro and TypeScript diagnostics |
| `pnpm validate`        | Run formatting, linting, type checks, and build        |
| `pnpm generate-types`  | Regenerate Wrangler worker type definitions            |

## Notes

- The project now builds to a plain static `dist/` directory.
- `wrangler.jsonc` is configured for Cloudflare Pages using `pages_build_output_dir`.
- Create a Pages project once with `pnpm wrangler pages project create`, then use `pnpm cf:pages:deploy` for direct uploads.
- Sitemap generation is enabled and uses `PUBLIC_SITE_URL`.
