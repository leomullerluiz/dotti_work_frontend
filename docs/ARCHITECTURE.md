# Architecture

## Overview

dotti.work is a static-exported Next.js App Router application that consumes a separate dotti.work API. The frontend owns routing, rendering, UI state, API adapters, authentication flow handling, and static deployment behavior. The backend owns GitHub OAuth, session cookies, GitHub token storage, repository discovery, matching, badges, public profiles, invites, consent records, and account data.

```text
Browser
  -> Static Next.js export on Hostinger
  -> Client-side React screens
  -> services/dotti API client
  -> dotti.work API
  -> GitHub / MySQL / backend services
```

## Source Layout

```text
app/          Route files, root layout, error boundaries, metadata
components/   Screen components, layout components, UI primitives
contexts/     Global providers and API-backed state orchestration
hooks/        Public hooks wrapping context access or local utilities
services/     dotti.work API client, service modules, adapters, API types
data/         UI constants, defaults, storage keys
types/        Front-end domain types used by components and contexts
utils/        Route helpers, formatting helpers, class name helper
docs/         Project documentation and API integration notes
tests/        Node tests for services, adapters, route helpers, and criteria
public/       Static assets plus `.htaccess` for Hostinger rewrites
```

## App Router

Route files in `app/` stay intentionally thin. They import a screen component, wrap it in auth or `Suspense` when needed, and avoid embedding business logic directly in route files.

Example:

```tsx
import { MatchesPage } from "@/components/projects/MatchesPage";

export default function MatchesRoute() {
  return <MatchesPage />;
}
```

Most authenticated screens are client-driven because they depend on user session, API requests, toasts, and local browser APIs.

## Static Export

`next.config.ts` uses:

```ts
const nextConfig = {
  output: "export",
  trailingSlash: true,
};
```

This generates static files in `out/`. It also means request-time dynamic routes and Next server features are unavailable in production.

Frontend routing patterns account for that constraint:

- Repository details use `/projects?owner=...&repo=...`.
- Invite links use `/invite/?code=...`.
- Public profile pretty URLs use `/u/:login`, with `public/.htaccess` rewriting them to `/u/`.
- The legacy `/projects/[owner]/[repo]` route exists only as a generated compatibility route with placeholder params.
- Public profile frames are rendered from the API `profile.profile_frame.style_config` tokens and do not require static frame image assets.

If the project moves to a Node-capable Next.js deployment later, these routing constraints can be revisited.

## Provider Tree

`contexts/AppProviders.tsx` is the root client provider tree:

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

The order matters:

- Auth must be available before API-backed profile, badges, history, repository states, and consent.
- Toasts must be available to all downstream providers.
- Local storage maintenance runs near auth startup to migrate or clean old browser data.
- The authenticated consent banner depends on consent state.

## API Layer

The API layer lives in `services/dotti`.

`client.ts` provides:

- required `NEXT_PUBLIC_DOTTI_API_BASE_URL` validation;
- URL normalization;
- JSON request body handling;
- default `accept: application/json`;
- default `credentials: "include"`;
- response envelope parsing;
- `DottiApiError`;
- auth redirect helpers.

Domain modules map to backend areas:

```text
auth.ts               /auth/*
profile.ts            /me/profile, /me/technologies, /me/preferences, /catalog/technologies
onboarding.ts         profile + technologies + preferences + match refresh orchestration
matches.ts            /matches
repositories.ts       /repositories/*
repositoryStates.ts   /me/repositories/*
history.ts            /me/history
badges.ts             /badges and /me/badges
invites.ts            /me/invite-links, /me/referrals, /invites/*
githubIntegration.ts  /integrations/github/*
publicProfile.ts      /public/profiles and /me/public-profile
consents.ts           /me/consents
account.ts            /me/export, /me/import-local-data, /me/account
topRepositories.ts    /repositories/top
adapters.ts           API DTOs -> front-end domain models
```

Adapters isolate API DTO changes from UI components. When the backend contract changes, update `services/dotti/types.ts`, the relevant service, the adapter, and tests together.

## State Strategy

Authenticated product data should come from the API:

- session and GitHub integration;
- profile;
- technologies and preferences;
- matches;
- repository states;
- history;
- badges;
- public profile settings;
- invite links;
- consent records;
- account export/import/delete.

Local storage is intentionally limited to:

- theme preference;
- pending onboarding before OAuth completes;
- local optional consent cache;
- legacy local app data import/export;
- cleanup of old MVP keys.

The acceptance test `tests/acceptance-criteria.test.ts` enforces that `localStorage` stays limited to documented fallback files.

## Authentication Flow

1. The app calls `GET /auth/me` on startup.
2. If authenticated, `AuthProvider` stores `user`, `profile`, and GitHub integration status.
3. If unauthenticated, public pages stay available and protected flows redirect to `/login`.
4. Login buttons navigate the browser to `/auth/github/start?return_to=...`.
5. The backend handles GitHub callback and redirects back to `/auth/callback`.
6. The callback page refreshes the session and continues to the safe `return_to` route.

The frontend must never receive or persist a GitHub OAuth token.

## Onboarding Flow

`components/onboarding/MultiStepOnboarding.tsx` collects:

- display name;
- professional role;
- seniority;
- goal;
- technologies with skill levels;
- contribution preferences.

If the user is not authenticated at the final step:

1. the profile is stored as pending onboarding in local storage;
2. the user is sent to GitHub OAuth;
3. after `/auth/callback`, the user returns to onboarding with `complete=1`;
4. pending onboarding is submitted to the API;
5. matches are refreshed or reused according to backend response.

## UI Organization

- `components/layout`: app shell, sidebar, mobile nav, header, logo, not found content.
- `components/ui`: buttons, badges, dialogs, empty/loading states, stat cards, theme toggle, skeletons.
- `components/landing`: landing pages and consent modal.
- `components/onboarding`: onboarding flow and technology selector.
- `components/projects`: matches, filters, cards, repository detail, issues, health, readiness, top repositories.
- `components/profile`: authenticated profile screen.
- `components/public-profile`: public profile screen and settings panel.
- `components/badges`: badges page and badge cards.
- `components/invites`: public invite and invite settings.
- `components/privacy`: consent banner and consent settings.
- `components/account`: GitHub integration card and avatar.
- `components/auth`: login, callback, logout, and auth guard.

## Styling

TailwindCSS v4 is imported in `app/globals.css`.

Notable style conventions:

- `bg-app` is the global app background.
- `coral` is the primary accent color family based on `#FF6F61`.
- `.field-input` centralizes common form input styling.
- Theme is controlled through `.dark` on `document.documentElement`.
- The UI favors compact operational surfaces for authenticated pages.

## Observability and Privacy

Sentry is configured through:

- `instrumentation.ts`
- `instrumentation-client.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `next.config.ts`

Consent handling is split between:

- local consent storage for public/early decisions;
- authenticated consent records through `/me/consents`;
- `AuthenticatedConsentBanner`;
- `PrivacyConsentSettings`.

Optional analytics, marketing, and Sentry Replay-style collection should remain consent-aware.

## Tests

The service test suite compiles TypeScript into `.tmp/service-tests` and runs Node's built-in test runner.

Coverage includes:

- API service endpoint wiring;
- API adapters;
- API error state mapping;
- route helpers for static export;
- local storage strategy;
- match filters;
- acceptance criteria that prevent regressions to mocks or broad localStorage usage.

Run:

```bash
npm run test:services
```

## Deployment

The deploy workflow is `.github/workflows/deploy.yml`.

Production deploy:

1. builds with Node `22`;
2. creates `.env.production` from secrets;
3. rejects local production API URLs;
4. runs lint;
5. runs the static build;
6. verifies `out/index.html`, `out/_next`, and CSS output;
7. copies `out/` into `deploy/`;
8. copies `public/.htaccess`;
9. uploads to Hostinger by FTP.

Keep `public/.htaccess` in sync with public URL patterns that require Apache rewrites.
