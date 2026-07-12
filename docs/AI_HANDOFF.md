# AI Handoff - dotti.work

This is a Next.js App Router front end for dotti.work, an open source project discovery product. It helps developers find repositories and issues that match their stack, seniority, goals, contribution preferences, and repository health expectations.

## Current State

- The app is API-backed, not mock-backed.
- The API client lives in `services/dotti/client.ts`.
- API domain services live in `services/dotti/**`.
- Auth uses GitHub OAuth through the backend.
- The GitHub token must never be stored or exposed in the front end.
- Authenticated requests use the backend's HttpOnly session cookie with `credentials: "include"`.
- The app is deployed as a static export to Hostinger.
- Public profile pretty URLs (`/u/:login`) require the Apache rewrite in `public/.htaccess`.

## Required Reading Before Code Changes

- Read `AGENTS.md`.
- This project uses Next.js `16.2.9`. Before changing framework APIs, routing behavior, App Router conventions, static export behavior, metadata, or file structure, read the relevant local guide in `node_modules/next/dist/docs/`.
- For API contract changes, inspect `openapi.yaml` and the matching service/adapters/tests.

## Commands

```bash
npm run dev
npm run lint
npm run test:services
npm run build
```

Use `npm run build` to validate static export behavior. The production deploy depends on the generated `out/` folder.

## Important Environment Variables

```bash
NEXT_PUBLIC_DOTTI_API_BASE_URL=http://localhost/dottiwork_api/api
NEXT_PUBLIC_DOTTI_SITE_URL=https://dotti.work
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
```

Production values are created by `.github/workflows/deploy.yml` from GitHub secrets.

## Implemented Routes

- `/`: home landing page.
- `/lp`: alternate landing page.
- `/login`: GitHub login screen.
- `/auth/callback`: OAuth callback handling.
- `/onboarding`: multi-step profile, stack, and preferences flow.
- `/matches`: API-backed repository recommendations.
- `/projects`: repository detail loaded from `owner` and `repo` query params.
- `/projects/[owner]/[repo]`: compatibility route with generated placeholder params.
- `/top-repositories`: global repository ranking.
- `/saved`: saved repositories and status management.
- `/history`: activity history.
- `/badges`: earned badges and progress.
- `/profile`: technical profile and public profile link.
- `/settings`: theme, GitHub integration, public profile, consent, data, and account settings.
- `/settings/invites`: invite link management.
- `/invite`: public invite validation through query params.
- `/u`: public profile shell.
- `/privacy`: privacy policy.
- `/terms`: terms of use.
- `/sentry-example-page`: Sentry browser event test page.

## Where To Work First

- Screen components: `components/**`
- Global state: `contexts/**`
- API services and adapters: `services/dotti/**`
- Public hooks: `hooks/**`
- Shared front-end types: `types/index.ts`
- API contract types: `services/dotti/types.ts`
- Constants and UI defaults: `data/constants.ts`
- Small route helpers: `utils/**`
- Global styles: `app/globals.css`

## Provider Order

`contexts/AppProviders.tsx` wraps the app with:

1. `ThemeProvider`
2. `ToastProvider`
3. `AuthProvider`
4. `LocalStorageMaintenance`
5. `ConsentProvider`
6. `HistoryProvider`
7. `BadgesProvider`
8. `ProfileProvider`
9. `SavedProjectsProvider`
10. `MatchesProvider`
11. `AuthenticatedConsentBanner`

Keep this order in mind when changing cross-provider behavior. Saved projects, matches, badges, history, and consent all rely on auth and shared feedback.

## Common Pitfalls

- Static export cannot render arbitrary dynamic URLs on demand. Prefer query-string routes or host-level rewrites.
- `/u/:login` works in production only if `.htaccess` is deployed and Apache rewrites it to `/u/`.
- Repository detail links should use `/projects?owner=...&repo=...`.
- Invite links should use `/invite/?code=...`.
- Components using hooks, events, `window`, `navigator`, or `localStorage` need `"use client"`.
- App Router pages and layouts are Server Components by default.
- In this Next.js version, dynamic route `params` are a `Promise`; see `app/projects/[owner]/[repo]/page.tsx`.
- If you add local persistence, register the key in `STORAGE_KEYS` and update the acceptance test allowlist if the usage is intentional.
- Do not reintroduce `data/repositories` or `mockProjects` into authenticated screens. Acceptance tests guard against this.

## API Rules

- Use `dottiRequest` for API calls.
- Handle `DottiApiError` for status-aware errors.
- Treat `401` as an expired or missing session.
- Treat `429` as a cooldown or rate-limit state and keep existing UI data where possible.
- Treat `502` and `503` as temporary API/GitHub/backend outages.
- Never send `user_id` in authenticated payloads.
- Never call GitHub directly from the frontend for repository data that the backend exposes.
- Never store GitHub OAuth tokens in local storage, session storage, cookies, or React state.

## Validation Before Delivery

At minimum, run:

```bash
npm run lint
npm run build
```

For service, adapter, route helper, or API contract work, also run:

```bash
npm run test:services
```
