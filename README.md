# Islam Sayed Portfolio

TanStack Start portfolio site with React, file-based routes, Tailwind CSS 4, and SSR-ready Vite configuration.

## Run locally

```bash
npm install
npm run dev
```

Routes:

- `/` — portfolio home
- `/work` — all portfolio projects
- `/reviews` — all client reviews
- `/about` — about and skills
- `/for-designers` — coming soon page

Build with `npm run build`, check TypeScript with `npm run typecheck`, and preview with `npm run start`.

## Styling

- Tailwind CSS is integrated through `@tailwindcss/vite`.
- Components use Tailwind utility classes; shared utility strings live in `src/ui.ts`.
- `src/styles.css` contains only the Tailwind import, local font declarations, and theme/animation tokens.
- Public images, icons, and fonts live in `public/`.
- The old standalone HTML pages, CSS stylesheets, and JavaScript have been replaced by the app in `src/`.
