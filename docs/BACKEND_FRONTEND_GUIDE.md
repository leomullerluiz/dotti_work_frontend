# Backend and Frontend Integration Guide - dotti.work API v2

This guide summarizes how the dotti.work frontend integrates with the dotti.work API. It is based on `openapi.yaml` and the current service modules in `services/dotti`.

The goal is to keep frontend work aligned with the backend domain, API response envelopes, authentication model, matching rules, and static-export deployment constraints.

## Executive Summary

dotti.work helps developers discover open source repositories and issues that match:

- technical stack;
- seniority;
- professional goals;
- contribution preferences;
- repository health;
- beginner-friendly issue signals;
- user-specific repository state.

The backend owns:

- GitHub OAuth;
- session cookies;
- encrypted GitHub token storage;
- GitHub repository and issue lookup;
- repository and issue cache;
- deterministic match generation;
- repository state persistence;
- history events;
- badges;
- public profiles;
- invite links;
- consent records;
- account export/import/delete.

The frontend owns:

- the static Next.js UI;
- OAuth redirect UX;
- session bootstrap;
- onboarding screens;
- API service calls;
- API DTO adapters;
- loading/error/empty UI states;
- static-export-friendly route helpers;
- local fallback data migration.

The frontend must not build screens for deprecated task-management flows, manual signup, password login, or password reset.

## API Base URLs

The API contract is available without a prefix and with `/api/v1`.

Production:

```txt
https://api.dottiwork.com
https://api.dottiwork.com/api/v1
```

Local examples:

```txt
http://localhost/dottiwork_api/api
http://localhost/dottiwork_api/api/api/v1
```

The frontend uses one base URL:

```bash
NEXT_PUBLIC_DOTTI_API_BASE_URL=...
```

Do not hard-code API origins in components.

## Response Envelope

Successful responses use:

```json
{
  "success": true,
  "data": {}
}
```

Error responses use:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid data.",
    "details": [
      {
        "field": "technologies.0.technology_id",
        "message": "technology_id must be an integer."
      }
    ]
  }
}
```

`services/dotti/client.ts` unwraps `data` and throws `DottiApiError` for non-OK responses or API errors.

Important frontend status handling:

- `401 UNAUTHORIZED`: session is absent, invalid, or expired; redirect or prompt for login.
- `403 FORBIDDEN`: origin is not allowed, session cannot perform action, or CSRF/origin validation failed.
- `404 NOT_FOUND`: resource does not exist or public item is disabled/private.
- `422 VALIDATION_ERROR`: show field-aware feedback when details are available.
- `429 RATE_LIMITED`: cooldown or rate limit; keep existing data when possible.
- `502 BAD_GATEWAY`: GitHub/API integration failed.
- `503 SERVICE_UNAVAILABLE`: backend or database is temporarily unavailable.

## Authentication and Session

GitHub OAuth is the only supported login flow.

Start OAuth by navigating the browser to:

```txt
GET /auth/github/start?return_to=/internal-path
```

OAuth rules:

- `return_to` must be an internal path that starts with `/`.
- External or unsafe values such as `http:`, `https:`, `//`, `javascript:`, and `data:` are rejected or replaced by a safe fallback.
- The backend creates a strong `state`, stores only its hash, and expires it after a short period.
- The backend exchanges the GitHub code server-side.
- The GitHub token is encrypted in the backend and never returned to the frontend.
- The backend creates its own API session and sets an HttpOnly cookie.
- Success redirects to `/auth/callback?status=success&return_to=...`.
- Error redirects to `/auth/callback?status=error&reason=...`.

Protected routes support:

- HttpOnly cookie `dotti_session`, recommended for browser frontend use.
- Opaque bearer token for future integrations and tests.

Browser fetches should use:

```ts
fetch(url, {
  credentials: "include",
});
```

`dottiRequest` already does this by default.

## Frontend Bootstrap

On app startup:

1. Call `GET /auth/me`.
2. If it returns `401`, show the public state or redirect protected screens to `/login`.
3. If authenticated, store `data.user`, `data.profile`, and `data.github`.
4. If onboarding is incomplete, send the user to `/onboarding` when entering authenticated workflows.
5. After onboarding, load matches with `GET /matches` and refresh only when needed.

## Environment and CORS

Mutating requests validate `Origin` when the header exists. The frontend production origin must be present in the backend CORS configuration.

Production environment values are injected by GitHub Actions. The workflow rejects local API URLs before deploy.

## Pagination

List endpoints use `limit` and `cursor`.

Typical shape:

```json
{
  "pagination": {
    "next_cursor": null
  }
}
```

The frontend should treat `next_cursor: null` as the end of the list.

## Domain Model

### User and Auth Profile

Users are created or updated from GitHub OAuth data. They may not have a public email and they do not have passwords in the current domain.

Auth/profile data includes:

- GitHub login and public GitHub fields;
- display name;
- role;
- seniority;
- goals;
- onboarding completion state;
- GitHub integration status.

### Technologies

The API exposes a global technology catalog. Users can select up to 50 technologies.

Each selected technology has:

- `technology_id`;
- `proficiency_level`: `learning`, `basic`, `daily`, `advanced`;
- `interest_level`: `learn`, `contribute`, `mentor`.

Changing technologies invalidates active matches.

### Preferences

Preferences influence match generation and sorting:

- contribution types;
- difficulty levels;
- project sizes;
- documentation languages;
- organization types;
- activity window;
- minimum stars;
- `good first issue` requirement;
- `help wanted` requirement;
- default sort.

Changing preferences invalidates active matches.

### Repositories

Repository data comes from GitHub and is normalized into backend cache:

- owner/name;
- description;
- URL;
- stars;
- forks;
- open issues;
- languages;
- topics;
- license;
- homepage;
- update time;
- health signals.

### Matches

Matches are deterministic, explainable, persisted per user, and expire by TTL.

They include:

- repository summary;
- score;
- recommended seniority;
- score breakdown;
- reasons;
- generated/expiration timestamps;
- current user repository state.

Ignored repositories are hidden from the default match list.

### Repository States

A single user-repository state table controls:

- `saved`;
- `ignored`;
- `researching`;
- `working`;
- `pull_request_sent`;
- `contributed`;
- `archived`.

Do not create separate frontend concepts for favorites or ignored projects. Use repository state.

### History

History is user-scoped and records interaction events. It must not contain tokens or sensitive data.

### Badges

The API exposes:

- public badge catalog;
- earned user badges;
- badge progress;
- recently awarded badges;
- unseen badge notifications;
- manual badge evaluation endpoint;
- notification viewed endpoint.

### Public Profiles

Public profiles expose a curated, shareable contributor page:

- public GitHub/user profile fields;
- technologies;
- metrics;
- badges;
- featured repositories;
- canonical/share URLs.

Disabled or missing public profiles return `404`.

### Invites

Invite links allow users to share dotti.work and track effective referrals.

The frontend supports:

- active invite link creation/listing;
- copy/share UI;
- referral summary;
- public invite validation.

### Consents

Consent records support LGPD-style optional consent management:

- analytics;
- marketing;
- Sentry Replay or similar optional telemetry.

Necessary app/session data may still be used for security and core functionality.

## Recommended Frontend Flows

### Login

1. Build the login URL with `buildGitHubOAuthStartUrl(returnTo)`.
2. Navigate the browser to the backend OAuth start URL.
3. The backend redirects to `/auth/callback`.
4. The callback page refreshes `/auth/me`.
5. Redirect to the safe `return_to` path or `/matches`.

### Onboarding

1. Load `GET /catalog/technologies`.
2. Collect profile, technologies, and preferences.
3. If unauthenticated, persist pending onboarding locally and start OAuth.
4. Submit:
   - `PUT /me/profile`
   - `PUT /me/technologies`
   - `PUT /me/preferences`
5. Trigger `POST /matches/refresh` when appropriate.
6. Navigate to `/matches`.

### Matches

1. Call `GET /matches`.
2. If empty/stale or user explicitly refreshes, call `POST /matches/refresh`.
3. If `429`, show cooldown feedback and keep existing data.
4. Cards should use repository summary, match score, reasons, and user state.
5. Do not call GitHub directly from the frontend.
6. Do not refresh matches on every render.

### Repository Detail

1. Open `/projects?owner=...&repo=...`.
2. Call `GET /repositories/{owner}/{repo}`.
3. Call `GET /repositories/{owner}/{repo}/issues`.
4. Register `viewed_project` or `opened_github` activity as appropriate.
5. Update user state with `PUT /me/repositories/{githubRepositoryId}/state`.

### Repository State Changes

Use:

- `saved` for saved projects.
- `ignored` to hide from default matches.
- `researching` for discovery/research.
- `working` for active contribution.
- `pull_request_sent` after a PR is submitted.
- `contributed` after contribution completion.
- `archived` to remove from active flow without marking as contributed.
- `POST /restore` to bring ignored repositories back as saved.

### Account Data

Authenticated export/import uses:

- `GET /me/export`
- `POST /me/import-local-data`

Local import/export remains available for legacy browser data and migration.

Account deletion uses:

- `DELETE /me/account`

After confirmed deletion, the frontend clears local browser data and redirects to login.

## Endpoint Map

### System

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| GET | `/` | API health | No |
| GET | `/health` | API health | No |
| GET | `/health/database` | Database health | Production may require auth |

### Auth and GitHub Integration

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| GET | `/auth/github/start` | Start GitHub OAuth | No |
| GET | `/auth/github/callback` | Backend OAuth callback | No |
| GET | `/auth/me` | Current authenticated user | Yes |
| POST | `/auth/logout` | Revoke current session | Yes |
| POST | `/auth/logout-all` | Revoke all user sessions | Yes |
| GET | `/auth/session` | Validate current session | Yes |
| GET | `/integrations/github/status` | GitHub integration status | Yes |
| DELETE | `/integrations/github` | Disconnect GitHub integration | Yes |
| POST | `/integrations/github/sync` | Sync GitHub public profile | Yes |

### Profile, Public Profile, Account Data

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| GET | `/me/profile` | Full user profile | Yes |
| PUT | `/me/profile` | Update profile | Yes |
| GET | `/public/profiles/{login}` | Public profile by login/slug | No |
| GET | `/me/public-profile` | Authenticated public profile preview | Yes |
| PUT | `/me/public-profile/settings` | Update public profile settings | Yes |
| POST | `/me/import-local-data` | Import legacy/local data | Yes |
| GET | `/me/export` | Export authenticated user data | Yes |
| DELETE | `/me/account` | Delete authenticated account | Yes |

### Invites

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| GET | `/me/invite-links` | List user invite links | Yes |
| POST | `/me/invite-links` | Create or return active invite link | Yes |
| POST | `/me/invite-links/{id}/revoke` | Revoke invite link | Yes |
| GET | `/me/referrals` | List effective referrals | Yes |
| GET | `/invites/{code}` | Validate public invite | No |

### Technologies and Preferences

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| GET | `/catalog/technologies` | List technology catalog | No |
| GET | `/catalog/technologies/{slug}` | Technology detail | No |
| GET | `/me/technologies` | User stack | Yes |
| PUT | `/me/technologies` | Replace user stack | Yes |
| GET | `/me/preferences` | User preferences | Yes |
| PUT | `/me/preferences` | Update preferences | Yes |

### Consents

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| GET | `/me/consents` | List user consents | Yes |
| POST | `/me/consents` | Grant or reactivate consent | Yes |
| DELETE | `/me/consents/{type}` | Revoke optional consent | Yes |

### Badges

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| GET | `/badges` | Public badge catalog | No |
| GET | `/me/badges` | Earned badges and progress | Yes |
| POST | `/me/badges/evaluate` | Recalculate badges | Yes |
| POST | `/me/badges/notifications/viewed` | Mark badge notifications viewed | Yes |

### Matches and Repositories

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| GET | `/matches` | List stored matches | Yes |
| POST | `/matches/refresh` | Refresh matches from GitHub/cache | Yes |
| GET | `/matches/{githubRepositoryId}` | Get match by repository ID | Yes |
| GET | `/repositories/top` | Global top repositories | Yes |
| GET | `/repositories/{owner}/{repo}` | Repository detail | Yes |
| GET | `/repositories/{owner}/{repo}/issues` | Recommended issues | Yes |
| POST | `/repositories/{owner}/{repo}/activity` | Register repository activity | Yes |

### Repository States and History

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| GET | `/me/repositories` | List user repository states | Yes |
| PUT | `/me/repositories/{githubRepositoryId}/state` | Set repository state | Yes |
| DELETE | `/me/repositories/{githubRepositoryId}/state` | Remove repository state | Yes |
| POST | `/me/repositories/{githubRepositoryId}/restore` | Restore ignored repository | Yes |
| GET | `/me/history` | List user history | Yes |
| DELETE | `/me/history` | Clear user history | Yes |

## Key Enums

### Seniority

```txt
junior
mid
senior
```

### Profile Goals

```txt
first_contribution
build_portfolio
practical_experience
join_communities
long_term_projects
```

### Technology Category

```txt
language
framework
library
tool
platform
database
devops_cloud
```

### Proficiency Level

```txt
learning
basic
daily
advanced
```

### Interest Level

```txt
learn
contribute
mentor
```

### Contribution Type

```txt
bug_fix
feature
documentation
tests
performance
refactor
accessibility
translation
```

### Difficulty Level

```txt
beginner
intermediate
advanced
```

### Project Size

```txt
small
medium
large
```

### Documentation Language

```txt
en
pt
es
any
```

### Organization Type

```txt
independent
startup
company
community
foundation
any
```

### Sort By

```txt
best_match
most_active
most_stars
beginner_friendly
recently_updated
```

### Repository State

```txt
saved
ignored
researching
working
pull_request_sent
contributed
archived
```

### Activity Event

```txt
viewed_project
saved_project
ignored_project
opened_github
started_contributing
sent_pull_request
marked_contributed
restored_project
```

### Consent Type

```txt
analytics
marketing
sentry_replay
```

## Matching Logic Summary

The current backend matching algorithm is deterministic and does not rely on generative AI.

Refresh flow:

1. Check user match refresh cooldown.
2. Load the user's GitHub OAuth account server-side.
3. Load technologies, profile, and preferences.
4. Generate GitHub queries from the user's first technologies.
5. Use language and topic signals where available.
6. Fall back to open source and beginner-friendly topics when the user has no stack.
7. Search public, non-archived repositories that meet preference constraints.
8. Deduplicate candidates.
9. Fetch repository languages, topics, labels, root content, and issues.
10. Compute repository health.
11. Estimate issue difficulty.
12. Compute score and reasons.
13. Persist top matches for the user.

Score categories:

```txt
stack: up to 35
difficulty: up to 20
issues: up to 15
activity: up to 10
health: up to 10
contribution_readiness: up to 10
total: up to 100
```

Common reasons:

- repository language matches the user's stack;
- repository topics match user technologies;
- repository is recently active;
- contribution-friendly issues are available;
- contribution guide was found;
- repository has public activity and can be explored.

## Repository Health

Health score is based on signals such as:

- README;
- CONTRIBUTING guide;
- code of conduct;
- license;
- CI;
- tests;
- contribution labels;
- description.

The frontend should present this as a helpful signal, not as a guarantee of project quality.

## Issue Difficulty

Issue difficulty is estimated from title, body, labels, and comments.

Beginner signals include:

```txt
good first issue
beginner
documentation
translation
easy
starter
simple test
```

Intermediate signals include:

```txt
bug
feature
refactor
test
performance
accessibility
```

Advanced signals include:

```txt
architecture
security
breaking change
migration
infrastructure
complex
```

The frontend should label this as an estimate.

## Cache and Rate Limits

Backend cache and refresh rules are designed to protect GitHub rate limits and keep the app responsive.

Frontend implications:

- Load existing matches before refreshing.
- Refresh only on explicit user action, onboarding completion, or empty state.
- Do not refresh on every render.
- If refresh returns `429`, keep current results and show cooldown feedback.
- If GitHub fails but cached data exists, keep the user in the flow.

## Security Rules for the Frontend

Never:

- store GitHub tokens in browser storage;
- expect to receive a GitHub token;
- send `user_id` in authenticated payloads;
- call GitHub directly for repository data already provided by the API;
- build email/password login screens;
- build password reset screens;
- display raw internal error details to end users;
- treat public GitHub data as non-personal by default.

Always:

- use `credentials: "include"`;
- treat `401` as a session problem;
- handle `422` with field-aware feedback where possible;
- handle `429` without destroying current UI state;
- keep cache/fallback UI when GitHub or the API is temporarily unavailable;
- use enums exactly as defined by the API;
- load the technology catalog before saving stack choices;
- keep optional tracking/telemetry consent-aware.

## Static Export Constraints

The frontend runs as a static export on Hostinger. That affects route design:

- No request-time Next.js dynamic route rendering.
- No Next.js API routes in this frontend.
- No Next.js rewrites/redirects in production.
- Host-level rewrites must be implemented in Apache `.htaccess`.
- Public profile pretty URLs require `public/.htaccess`.

Use route helpers in `utils/**` instead of hand-building URLs in components.

## Frontend Implementation Checklist

When adding or changing a feature:

- Check `openapi.yaml` first.
- Add or update API types in `services/dotti/types.ts`.
- Add or update a service module in `services/dotti`.
- Add adapter logic in `services/dotti/adapters.ts` when API DTOs differ from UI domain models.
- Update context/provider logic if the feature has shared state.
- Add loading, error, empty, and success states.
- Add or update tests in `tests/**`.
- Run `npm run lint`.
- Run `npm run test:services` for service/adapter/route work.
- Run `npm run build` before deployment-sensitive changes.
