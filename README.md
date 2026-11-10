# Islam Sayed Portfolio

TanStack Start portfolio site with React, file-based routes, Tailwind CSS 4, and SSR-ready Vite configuration.

## Run locally

Use Node.js 22.20.0 (pinned in `.node-version`; minimum 22.12.0).

```bash
npm install
npm run dev
```

Routes:

- `/` — portfolio home
- `/work` — all portfolio projects
- `/work/$projectid` — project details (for example `/work/couponz-souq`)
- `/reviews` — all client reviews
- `/about` — about and skills
- `/for-designers` — coming soon page

Dashboard routes share the main domain: `/login`, `/dashboard`, `/dashboard/account`, and admin-only `/dashboard/users` and `/dashboard/work` (portfolio CRUD, drafts, publishing, and display order). No dashboard subdomain is required. See [Dashboard setup](docs/dashboard.md) for Supabase migration, credentials, role security, and callback configuration.

Build with `npm run build`, check TypeScript with `npm run typecheck`, and preview with `npm run start`.

## Cloudflare Workers deployment

This project uses the same Workers setup pattern as `altajer-dash`: the Cloudflare Vite plugin builds the `ssr` environment, `src/worker.ts` serves TanStack Start, and `wrangler.jsonc` configures the Worker. It does not reuse that project's domain, account, or bindings.

Use Node.js **22.20.0**, pinned in `.node-version` (minimum 22.12.0). Set `NODE_VERSION=22.20.0` in the Cloudflare build environment if an older version is configured there.

### Deploy from your machine

```bash
npx wrangler login
npm run deploy
```

This builds and deploys the `islam-sayed-portfolio` Worker with SSR and static assets to your account's `workers.dev` subdomain. No account ID or custom domain is hard-coded. Add your own custom domain in the Worker settings after verifying the deployment.

### Deploy from Git with Workers Builds

The previous Cloudflare Pages project cannot deploy this Workers SSR output as a static site. Create a **Worker** connected to this repository, using:

- Worker name: `islam-sayed-portfolio` (must match `wrangler.jsonc`).
- Root directory: repository root.
- Build command: `npm run build`.
- Deploy command: `npx wrangler deploy`.
- Build variable: `NODE_VERSION=22.20.0`.

Keep the existing Pages site until the Worker is verified, then move the custom domain if needed. Do not deploy only `dist/client`; the SSR Worker is required. Vite generates the deploy configuration in `dist/server/wrangler.json`, and Wrangler finds it automatically.

### Local verification

```bash
npm run typecheck
npm run preview         # Build and serve using local Wrangler/Workers runtime
npm run deploy:dry-run  # Build and validate deployment without publishing
npm run cf-typegen     # Generate binding types when needed
```

`npm run dev` also uses the Workers runtime through the Cloudflare Vite plugin. Cloudflare local state, generated types, and `.dev.vars` secrets are ignored by Git.

## Localization

The header language selector supports `en-US`, `en-UK`, `en-AU`, `ar-EG`, and `ar-KSA`.

- `en-UK` uses the standard `en-GB` HTML/Intl locale; `ar-KSA` uses `ar-SA`.
- A `portfolio_locale` cookie saves explicit choices for one year. Without a saved choice, the app negotiates `Accept-Language`, falling back to `en-US`.
- The root loader resolves the language on the server, so translated content, page metadata, `lang`, and `dir` match on the initial render. Switching languages reloads the current page and keeps its URL.
- English variants initially share English copy; Arabic variants share Modern Standard Arabic copy. Regional dates and numbers use `Intl`, with Gregorian dates for the career timeline.
- Arabic uses local Noto Sans Arabic fonts and RTL layouts, including mirrored timeline controls and carousel keyboard navigation. Brand/project names are preserved.
- Catalogs and regional overrides live in `src/localization/messages.ts`; English source text is the fallback for missing keys.
- Locale-dependent responses use private/no-store caching so one visitor's language is not cached for another.
- Dashboard authentication and administration use the same locale provider and translated UI.

## Styling

- Tailwind CSS is integrated through `@tailwindcss/vite`.
- Components use Tailwind utility classes; shared utility strings live in `src/ui.ts`.
- `src/styles.css` contains only the Tailwind import, local font declarations, and theme/animation tokens.
- Public images, icons, and fonts live in `public/`.
- The old standalone HTML pages, CSS stylesheets, and JavaScript have been replaced by the app in `src/`.
