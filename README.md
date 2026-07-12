# dotti.work

dotti.work is a Next.js front-end for discovering open source repositories that match a developer's stack, seniority, contribution goals, and repository health preferences.

The app is now wired to the dotti.work API. It uses GitHub OAuth for authentication, stores the GitHub token only on the backend, and talks to the API through typed service modules in `services/dotti`.

## Project Status

- Production-oriented front end implemented with the Next.js App Router.
- Static export enabled with `output: "export"` and `trailingSlash: true`.
- API-backed authentication, profile, onboarding, matches, repository states, history, badges, invites, consent records, public profiles, and account export/import.
- Local browser storage remains only as a fallback or migration surface for theme, pending onboarding, consent cache, and legacy local app data.
- Deployed to Hostinger through GitHub Actions and FTP.
- Sentry client/server configuration is present for observability.

## Stack

- Next.js `16.2.9`
- React `19.2.4`
- TypeScript
- TailwindCSS `4`
- `lucide-react`
- `motion`
- `radix-ui`
- `@sentry/nextjs`
- ESLint

> Important: this project uses a Next.js version with breaking changes. Before changing framework APIs, App Router conventions, or file structure, read `AGENTS.md` and the local guides in `node_modules/next/dist/docs/`.

## Environment

Create a local `.env` file from `.env.example`:

```bash
NEXT_PUBLIC_DOTTI_API_BASE_URL=http://localhost/dottiwork_api/api
NEXT_PUBLIC_DOTTI_SITE_URL=https://dotti.work
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
```

Production deploys create `.env.production` from GitHub secrets:

- `PROD_DOTTI_API_BASE_URL`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`

The deploy workflow rejects production env files that contain `localhost` or `127.0.0.1`.

## Running Locally

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Recommended validation:

```bash
npm run lint
npm run test:services
npm run build
```

## Scripts

- `npm run dev`: start the Next development server.
- `npm run lint`: run ESLint.
- `npm run test:services`: compile and run Node tests for routes, adapters, services, API error state, and acceptance criteria.
- `npm run build`: build the static export with `next build --webpack`.
- `npm run start`: run `next start`, mainly useful outside the static-export deployment path.

## Main Features

- Marketing landing page for the product.
- GitHub OAuth login and callback handling.
- Authenticated app shell with sidebar, header, mobile navigation, theme controls, and toast feedback.
- Multi-step onboarding:
  - professional role;
  - seniority;
  - contribution goals;
  - technical stack with proficiency and interest;
  - contribution preferences;
  - pending onboarding persistence before GitHub login when needed.
- API-backed matches:
  - profile-based repository recommendations;
  - refresh action;
  - filters and sorting;
  - save, ignore, restore, and status updates.
- Repository details:
  - repository metrics;
  - compatibility score;
  - match reasons and breakdown;
  - health checklist;
  - recommended issues with difficulty estimates;
  - GitHub activity registration.
- Saved projects with editable contribution status.
- Interaction history from the API, with local fallback behavior where needed.
- Profile page with GitHub account data, selected technologies, account stats, public profile link, and JSON export.
- Public profile route for shareable contributor profiles.
- Top repositories page backed by the API ranking endpoint.
- Badges and progress tracking.
- Invite links and referral stats.
- Account settings:
  - GitHub integration sync/disconnect;
  - public profile settings;
  - consent management;
  - import/export;
  - logout all sessions;
  - account deletion.
- Privacy and terms pages.
- Loading, empty, error, skeleton, dialog, and confirmation states.

## Routes

```txt
/                         Home landing page
/lp                       Alternate landing page
/login                    GitHub login entry
/auth/callback            OAuth callback landing page
/onboarding               Multi-step onboarding
/matches                  API-backed recommendations
/projects                 Static-export-friendly repository detail via query string
/projects/[owner]/[repo]  Legacy/compatibility path generated with placeholder params
/top-repositories         Global top repository rankings
/saved                    Saved repositories
/history                  Activity history
/badges                   Badge catalog, progress, and earned badges
/profile                  Technical profile and account stats
/settings                 Settings, data, consent, public profile, and account actions
/settings/invites         Invite link management
/invite                   Public invite validation via query string
/u                        Public profile shell
/privacy                  Privacy policy
/terms                    Terms of use
/sentry-example-page      Sentry browser event test page
```

Static export cannot render arbitrary dynamic paths on demand. Routes that need arbitrary user or repository input therefore use query strings or server rewrites:

- Repository detail links use `/projects?owner=...&repo=...`.
- Invite links use `/invite/?code=...`.
- Public profiles are shared as `/u/:login`; `public/.htaccess` rewrites those requests to `/u/` on Apache/Hostinger so the client route can read the path.

## Project Structure

```txt
app/          Next.js App Router routes and layouts
components/   Reusable UI and screen components
contexts/     Global providers and API-backed state
hooks/        Public hooks used by the UI
services/     dotti.work API client, services, adapters, and helpers
data/         Constants and local UI defaults
types/        Front-end domain types
utils/        Small route and formatting helpers
docs/         Maintenance and API integration documentation
tests/        Node tests for services, adapters, routes, and acceptance rules
public/       Static assets and Apache rewrite file
```

## API Integration

All API calls go through `services/dotti/client.ts`.

Key behavior:

- `NEXT_PUBLIC_DOTTI_API_BASE_URL` is required.
- Requests default to `credentials: "include"` for the HttpOnly API session cookie.
- Request bodies are JSON-encoded automatically when a plain object is passed.
- API envelopes are unwrapped and failures are raised as `DottiApiError`.
- `401` is treated as an expired or missing session.
- `buildGitHubOAuthStartUrl()` centralizes OAuth redirects and validates `return_to`.

The front-end service layer is organized by API domain:

- `auth.ts`
- `profile.ts`
- `onboarding.ts`
- `matches.ts`
- `repositories.ts`
- `repositoryStates.ts`
- `history.ts`
- `badges.ts`
- `invites.ts`
- `githubIntegration.ts`
- `publicProfile.ts`
- `consents.ts`
- `account.ts`
- `topRepositories.ts`
- `adapters.ts`

## State and Persistence

`contexts/AppProviders.tsx` wraps the app in this order:

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

Authenticated product state should come from the API. Local storage is reserved for:

- theme preference;
- pending onboarding before OAuth finishes;
- local consent cache;
- legacy data import/export and cleanup;
- compatibility behavior inside explicitly documented fallback surfaces.

Storage keys are defined in `data/constants.ts`.

## Static Export and Deployment

The project is built as a static export:

```ts
const nextConfig = {
  output: "export",
  trailingSlash: true,
};
```

The GitHub Actions workflow in `.github/workflows/deploy.yml`:

1. checks out the code;
2. installs Node `22`;
3. creates `.env.production` from secrets;
4. runs `npm ci`;
5. runs `npm run lint`;
6. runs `npm run build`;
7. verifies the `out/` directory;
8. copies `out/` into a deploy artifact;
9. explicitly copies `public/.htaccess`;
10. uploads the artifact to Hostinger over FTP.

`public/.htaccess` contains the public profile rewrite needed by the Apache deployment target.

## Documentation

- `docs/AI_HANDOFF.md`: concise operational summary for another AI or maintainer.
- `docs/ARCHITECTURE.md`: architecture, providers, state, routing, API layer, and deployment notes.
- `docs/BACKEND_FRONTEND_GUIDE.md`: API contract summary and frontend integration rules.
- `openapi.yaml`: API contract source used by the frontend services and tests.

## Contributor Notes

- Keep route files in `app/` thin. Put UI and business logic in `components/**`, `contexts/**`, `hooks/**`, `services/**`, and `utils/**`.
- Components that use hooks, events, `window`, `navigator`, or `localStorage` need `"use client"`.
- Do not store GitHub tokens in the browser.
- Do not send `user_id` in authenticated API payloads. The backend resolves the user from the session.
- Do not call GitHub directly from the frontend for data already exposed by the dotti.work API.
- Preserve API adapter tests when changing response contracts.
- Prefer static-export-friendly URLs unless the hosting target is changed to a Node-capable Next deployment.
