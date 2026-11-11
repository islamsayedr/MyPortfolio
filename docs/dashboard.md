# Main-site dashboard with Supabase

## Routes

The public portfolio and dashboard share the main domain:

| URL | Purpose |
| --- | --- |
| `https://example.com/` | Public portfolio |
| `https://example.com/login` | Sign in and create an account |
| `https://example.com/auth/callback` | Supabase email-confirmation callback |
| `https://example.com/dashboard` | Protected member/admin overview |
| `https://example.com/dashboard/account` | Own account settings |
| `https://example.com/dashboard/users` | Admin-only account/role management |
| `https://example.com/dashboard/work` | Admin-only portfolio project list |
| `https://example.com/dashboard/work/new` | Create a project |
| `https://example.com/dashboard/work/PROJECT_UUID` | Private saved-project preview (including drafts) |
| `https://example.com/dashboard/work/PROJECT_UUID/edit` | Edit a project |

Replace `example.com` with your actual domain. **No dashboard subdomain is required.**

`PUBLIC_SITE_URL` optionally sets the canonical main origin. Public content can also be served on its www/apex counterpart. Dashboard, login, and callback requests on the alternate origin redirect to the canonical origin so cookies and PKCE verification stay consistent. Other hosts are rejected when a canonical origin is configured. Without `PUBLIC_SITE_URL`, the current request origin is used, supporting localhost and Workers previews.

`DASHBOARD_SITE_URL` is no longer used; remove it from runtime configuration if previously added. Existing sessions on an old dashboard subdomain are not transferred; sign in again on the main domain.

## Supabase setup

1. Create a Supabase project and copy its project URL and **publishable** API key. A legacy anon key also works. Do not use a service-role/secret key.
2. Apply `supabase/migrations/202611100001_dashboard_accounts.sql` in the Supabase SQL editor, or use `supabase db push` after linking the project. This migration expects the new `profiles` and `user_roles` tables not to exist. If already applied, no database migration is required for the move from subdomain to `/dashboard`.
3. Enable email/password authentication. Keep email confirmation enabled for production and configure production SMTP and Supabase Auth rate limits.
4. Set Auth **Site URL** to `https://example.com`.
5. Add the exact allowed redirect URL `https://example.com/auth/callback`. For local testing also allow `http://localhost:5173/auth/callback` (or the actual port). Remove obsolete dashboard-subdomain redirects if no longer needed. Avoid wildcard production redirects.
6. Sign up at `/login` and open the confirmation link in the **same browser** (the PKCE verifier is in a host-only cookie).
7. Bootstrap the first administrator in the trusted Supabase SQL editor:

```sql
update public.user_roles
set role = 'admin'
where user_id = (
  select id from auth.users where email = 'YOUR_OWN_EMAIL'
);
```

Never provide a role during signup. All new accounts are assigned `user` by a database trigger, regardless of metadata.

## Manage work projects

After applying the accounts migration, apply **`supabase/migrations/202611100002_work_projects.sql`** in the SQL editor (or via the linked Supabase CLI). If accounts are already configured, apply only this new migration; do not rerun the accounts migration.

The migration seeds the five existing projects and their images. Administrators can manage projects at `/dashboard/work`. The list contains actions only; **New project** opens `/dashboard/work/new`, and **Edit** opens `/dashboard/work/PROJECT_UUID/edit`. Saving either form opens the saved-project preview at `/dashboard/work/PROJECT_UUID`. Both public and dashboard project URLs use the stable database UUID; editing a title does not change either URL. Previews share the public detail renderer, stay inside the dashboard shell, and display a draft/published notice. Both published and draft previews require a freshly verified administrator on the server; they are not shareable public draft links.

Localized, RTL-aware breadcrumbs appear in a full-width top bar with independent padding and a darker background, including the project title in preview/edit paths. Dashboard page headers/back links are omitted; screen-reader headings, useful status/action controls, and error notices remain. Public-site headers are unchanged. These route changes do not require an additional database migration.

The desktop sidebar can be resized from its outer edge (RTL-aware). The sidebar and content follow the pointer immediately, even when opening from the collapsed rail below the 200px expanded-width minimum. Releasing at or below 200px snaps back to the 64px rail; larger widths stay expanded, capped at 384px. The chosen expanded width is remembered locally; double-clicking the edge resets it to 224px. The focused edge supports arrow keys (Shift for larger steps), Home to collapse, End for maximum width, and Enter to toggle. Phones retain the compact rail/overlay behavior, with expanded overlays constrained to leave room for dismissal.

Project management includes:

- Create/edit title, plain-text description, Markdown presentation, cover image URL/path, accessible image description, and categories. There is no slug input.
- New projects are drafts. Editing preserves existing publish status and display order; these are no longer form inputs. Delete permanently with confirmation.
- Lower display-order values appear first; ties use creation time and ID.
- Each card has a leading drag handle and a three-dot Preview/Edit/Delete menu. Use mouse/touch or focus the handle and press Space, then Up/Down and Space to drop (Escape cancels).
- Public links use `/work/PROJECT_UUID`, matching the record's database ID. Title edits never regenerate identifiers.
- Images use existing local paths or HTTPS URLs. File uploading/storage management is not implemented.
- Content accepts Unicode and is shared across locales; the admin interface and existing category labels are localized.

To enable saved drag-and-drop ordering, apply **`supabase/migrations/202611100003_work_reordering.sql`** after the first two migrations. Dragging reorders the current 20-project page, saves automatically, and preserves the relative order on other pages. The guarded RPC checks page membership and record versions, locks the table during its transaction, and normalizes display-order numbers atomically. A stale list or failed save restores the previous displayed order and reports an error; a missing RPC/migration is never treated as a successful save. No live database migration is applied automatically.

### ID-based project URLs

Apply **`supabase/migrations/202611100005_work_id_urls.sql`** before creating projects with the ID-based editor. Existing UUIDs and content are unchanged. New projects no longer require or write a slug. The old `slug` column is nullable and read-only to authenticated API clients, retained solely for **301 redirects** from previously shared, published URLs. Anonymous RLS protects legacy lookups too: draft/deleted aliases do not expose projects. Canonical cards, detail lookups, and public-page actions all use the database UUID. Before database setup, static sample UUIDs remain available; once connected, those sample URLs can redirect to the corresponding actual database records.

### Markdown presentations

Apply **`supabase/migrations/202611100004_work_presentation.sql`** to add the `presentation` text column and its explicit column-level write grants. It defaults to an empty string, so existing projects keep their current content. The existing published/admin RLS policies still apply. The database and server validate a maximum of 100,000 characters; Markdown indentation and line breaks are preserved.

The edit page separates **Project info** and **Presentation** into keyboard-accessible, RTL-aware tabs. Unsaved changes and the live-preview state survive tab switching, and one Save action submits both panels. Validation reveals an invalid field's panel before focusing it. The new-project page retains its combined layout. The presentation panel has a **Presentation (Markdown)** field with an optional live preview. Saved dashboard previews and public detail pages use the same renderer. The engine is **Remarkable 2**, matching `../../msa7a/msa7a-desktop/`. Public rendering is deterministic and DOM-free: semantic HTML is included in the initial Workers SSR response, including when JavaScript is disabled. This makes the content available to crawlers; it does not guarantee search ranking improvements. The short description also supplies the detail page's meta description when present.

Markdown supports headings, paragraphs, lists, images, links, tables, quotes and fenced code. Presentation headings start at H2 beneath the existing project H1. Raw HTML is escaped rather than enabled; unsafe URL protocols are blocked. Unlike the desktop app's browser-side sanitation, safety does not depend on `window` or `DOMParser`. Never bypass the shared renderer to insert source Markdown/HTML directly.

Presentation bodies are fetched only for detail/edit/preview reads, not for the homepage, public work list or paginated admin cards. Blank presentations produce no additional section. Older databases can continue displaying existing content without this column, but must apply this migration before saving with the new editor.

The homepage, work index, and project details read published database records through an anonymous server-side client. RLS independently hides drafts from visitors and members; only verified admins may write. Mutations are POST server functions with the existing CSRF protection. Updates and deletes match the last-read database timestamp to reject stale edits.

Before credentials/the work table are configured, public pages retain the original static samples. A successfully loaded empty table never falls back to samples: unpublished/deleted projects stay hidden. Other database failures show an unavailable message, not sample projects.

## Local development

```bash
cp .dev.vars.example .dev.vars
# Fill in SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in .dev.vars
npm run dev
```

- Public: `http://localhost:5173/`
- Dashboard: `http://localhost:5173/dashboard`
- Sign in: `http://localhost:5173/login`

Leave `PUBLIC_SITE_URL` unset to derive the origin from the local request. Wrangler preview also uses its current host/port. No hosts-file entry or special local domain is needed.

With no Supabase credentials, dashboard routes display a setup notice. They do **not** authenticate a demo user or fabricate data.

## Cloudflare production configuration

Add these runtime variables/secrets to the **same Worker**:

- `PUBLIC_SITE_URL=https://example.com` (recommended canonical origin)
- `SUPABASE_URL=https://YOUR_PROJECT.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY`

For CLI setup, `npx wrangler secret put VARIABLE_NAME` prompts for values without adding them to Git. Cloudflare dashboard runtime variables are also supported. These values are intentionally **not** `VITE_*` or `NEXT_PUBLIC_*` variables and are not bundled into client JavaScript.

Attach the apex and/or www hostnames as **Custom Domains** on the Worker in Cloudflare, or configure equivalent Worker routes. No `dash.*` custom domain is needed. This repository does not automatically change DNS, attach domains, create a Supabase project, or apply migrations. Once a canonical domain is configured, unrelated workers.dev/preview hosts are rejected; use appropriate per-environment origins when testing previews.

Keep `NODE_VERSION=22.20.0` in Workers Builds. Build and deploy normally:

```bash
npm run typecheck
npm test
npm run deploy
```

## Authentication and authorization

- Public and dashboard routes share an origin. Protected operations are authorized by verified sessions and database RLS, not by a subdomain boundary.
- Supabase sessions are stored in HTTP-only, SameSite=Lax, host-only cookies on the main origin. Production HTTPS cookies are Secure. A wildcard cookie domain is never set.
- Auth clients are created per request; no global client/session is shared across users.
- Server handlers verify identities with `auth.getUser()`, never trust cookie contents or `getSession()` alone, and read roles from the database on every privileged operation.
- TanStack Start's default server-function CSRF protection covers POST sign-in, signup, logout, profile updates, and role changes. Do not remove that middleware if adding `src/start.ts` later.
- Profiles and roles have RLS enabled. Members can read only their own profile/role and update only their own display name. Email/ID/role are not client-writable.
- Admins can list application accounts and change other accounts between member/admin through a guarded database RPC. They cannot change their own role or remove the final administrator.
- Auth/session responses use private/no-store caching and must never be cached at the CDN. Dashboard pages also prevent indexing and framing.
- No service-role key is needed or exposed. The users page manages application roles, not destructive Supabase Auth operations such as deleting/banning accounts.
- Password reset and MFA are not included in this initial foundation. Enable/implement MFA before using the dashboard for highly sensitive administration.

## Testing

`npm test` covers origin validation, canonical auth redirects, unknown hosts, and input validation without requiring credentials. It also executes the actual migration and PostgreSQL RLS in isolated PGlite, using a minimal stand-in for Supabase's `auth` schema. This verifies table privileges, role escalation prevention, profile ownership, and the guarded admin RPC, but does not replace live Supabase Auth testing.

`supabase/tests/database/accounts.test.sql` provides pgTAP checks for a **local/test Supabase database**. Initialize local Supabase with `supabase init` if needed, start it with `supabase start`, apply migrations with `supabase db reset`, then run `supabase test db`.

Do not run database tests against a production project. Live authentication, email confirmation, and production domain routing must be verified after connecting your Supabase project and configuring its redirect allowlist.
