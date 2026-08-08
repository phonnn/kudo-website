# Good Job Web Architecture

This document describes the architecture currently implemented in `kudo-website`.
The application is a Next.js frontend for the Good Job recognition platform and connects
to `kudo-service` through HTTP and server-sent events (SSE).

## Technology

- Next.js 15 with the App Router
- React 19 and TypeScript
- TanStack Query for remote state
- Hand-written CSS in `src/app/globals.css` and `src/styles/theme.css`, using custom
  properties for the design tokens (colors, spacing). Tailwind is an installed dependency
  (`@import "tailwindcss"`) but its utility classes are not used in components — it
  currently contributes only its reset layer.
- Yarn 1.22.22
- Node.js 22

The frontend runs on `http://localhost:3001`. The backend runs on
`http://localhost:3000`.

## Routes

| Route       | Access        | Purpose                                              |
| ----------- | ------------- | ---------------------------------------------------- |
| `/login`    | Public        | Sign in                                              |
| `/register` | Public        | Create an account                                    |
| `/`         | Authenticated | Send recognition and view the realtime feed          |
| `/profile`  | Authenticated | View balances, point history, and redemption history |
| `/rewards`  | Authenticated | Browse and redeem rewards                            |

`AuthGate` protects every route except `/login` and `/register`. It checks the access
token in browser storage and redirects unauthenticated users to `/login`.

## Layout and navigation

`AppShell` renders `AppHeader` and a footer around each authenticated page. `AppHeader`
shows the primary nav (Feed, Rewards, My profile) inline above an 800px viewport width.
Below that breakpoint the inline nav hides and a hamburger toggle (`.menu-toggle`) opens
the same links in a dropdown panel. This is CSS-driven (`src/app/globals.css`); the header
component always renders both, visibility switches on viewport width.

## Source structure

```text
src/
  app/                         Route entry points and global styles
  components/                  Shared layout components
    ui/                        Reusable UI and typography primitives
  features/
    auth/                      Login, registration, and route protection
    feed/                      Feed queries, realtime updates, reactions, comments
    kudo/                      Recognition form, budget, shared API view types
    notification/              Notification list and realtime notification bell
    reward/                    Reward catalog and redemption
    user/                      User balance and history
  lib/
    api/
      auth/                     Authentication contract and HTTP adapter
      feed/                     Feed contract and HTTP adapter
      kudo/                     Recognition contract and HTTP adapter
      notification/             Notification contract and HTTP adapter
      reward/                   Reward contract and HTTP adapter
      user/                     User contract and HTTP adapter
      client.interface.ts      Composed API contract used by features
      shared-types.ts          Transport-level shared models
      http/http-client.ts      HTTP client composition
      http/http-transport.ts   Fetch, authorization, errors, and SSE
      mock/mock-client.ts      Shared in-memory development adapter
      provider.ts              Selects and creates the adapter
    errors/                    Typed API errors
  providers/                   API context and TanStack Query provider
```

Route files stay small. Feature behavior belongs under `features`, shared visual
building blocks belong under `components`, and transport details belong under `lib/api`.

## Component conventions

- One React component per file.
- Use shared UI components instead of repeating native controls or containers.
- Use `Text`, `Heading`, and `Eyebrow` for typography.
- Use `Button`, `Input`, `Select`, and `Textarea` for form controls.
- Use `Surface`, `FormSurface`, `Field`, `FormError`, and `EmptyState` for common layouts.
- Put blank lines between logical blocks and use full condition blocks.
- Avoid ternary expressions. ESLint enforces this rule.

Typography components are polymorphic. They preserve semantic HTML through the `as`
property while keeping styling and usage consistent:

```tsx
<Heading as="h1">Team recognition</Heading>
<Text as="p">Celebrate excellent work.</Text>
<Text as="small">Updated today</Text>
```

## API boundary

Feature code depends on small domain interfaces composed into `ApiClient`, not directly on
`fetch`, `EventSource`, the HTTP domain clients, or `MockApiClient`.

```text
Page
  -> Feature component
    -> Feature hook or query
      -> Domain client interface
        -> Composed ApiClient
          -> HTTP domain client or MockApiClient
```

`createApiClient` selects the implementation using `NEXT_PUBLIC_API_MODE`:

- `http`: compose the HTTP domain clients using `NEXT_PUBLIC_API_URL`
- Any other value: use `MockApiClient`

The configured client is created once by `AppProviders` and exposed through `useApi()`.

## Backend integration

The normal local configuration is:

```env
NEXT_PUBLIC_API_MODE=http
NEXT_PUBLIC_API_URL=http://localhost:3000
```

The backend allow-lists origins for CORS via a static `CORS_ORIGIN` env var (exact string
match, no wildcard or subdomain matching). Vercel preview deployments get a new random
`*.vercel.app` URL per branch/PR, so previews cannot reach the real backend unless that
exact URL is added to `CORS_ORIGIN` — there's no way to allow "any preview" today. Only the
production frontend URL is expected to be allow-listed by default.

The HTTP domain clients are responsible for endpoint-specific request and response mapping.
The shared `HttpTransport` is responsible for:

- Adding the bearer access token to authenticated requests
- Mapping backend responses into frontend view models
- Sending idempotency keys for recognition and redemption
- Presigning and uploading media
- Opening authenticated SSE streams with stream tickets
- Converting unsuccessful responses into `ApiError`
- Clearing the session and redirecting after an unauthorized response

Features must not duplicate these transport concerns.

### Media trust model

Uploads and reads are asymmetric. Uploading media is authenticated: the backend issues a
presigned POST (`presignMedia`) that the client uploads directly to storage. Reading media
back is not authenticated at all — `FeedCard` renders `<img src="{domain}/{objectKey}">` as
a plain GET, with no token or signed URL. This only works because the storage bucket is
configured for public anonymous reads (`mc anonymous set download`); a private bucket would
make every existing recognition image 403. There is currently no per-object access control
on reads — anyone with an object URL can view it.

## Authentication and session storage

Login and registration use `/auth/login` and `/auth/register`. The accepted session is
stored under these browser-storage keys:

- `goodjob.accessToken`
- `goodjob.refreshToken`
- `goodjob.user`

The access token is attached as a bearer token by `HttpTransport`. The refresh token is
stored, but automatic token refresh is not currently implemented.

`AuthGate` only checks that `goodjob.accessToken` is *present* in browser storage, not
that it's valid. A stale or garbage value (e.g. left over from a different API mode)
is treated as an active session; the first authenticated request then fails with a
401, which `HttpTransport` handles by clearing storage and redirecting to `/login`. So
recovery is one failed request, not an immediate check.

Authentication is client-side. Consequently, protected pages render through client
components after `AuthGate` verifies browser storage.

## Remote state

TanStack Query owns data received from the API. `AppProviders` configures a shared query
client with a 30-second stale time and disables refetch-on-window-focus.

Current query areas include:

- Feed
- Comments, fetched only once a post has at least one comment
- Giving budget
- Notifications
- Rewards
- User balances and history

Mutations update or invalidate the relevant cache. Feed reactions use an optimistic cache
update and restore the previous post when the request fails. Posting a comment optimistically
appends to that post's comments cache entry rather than refetching.

## Realtime updates

Realtime feed and notification subscriptions are methods on `ApiClient`, so components
remain independent of the transport implementation.

The HTTP adapter requests a short-lived ticket from `/auth/stream-ticket`, then opens:

- `/kudos/events` for `post.published` and `post.updated`
- `/notifications/events` for `notification.created`

Feed events trigger feed refreshes or patch visible counters. Notification events prepend
the new notification to the notification query cache. Components close their subscription
when they unmount.

## Error handling

`HttpTransport` parses backend error responses into `ApiError`. Application behavior should
use stable error codes; messages are display text and must not be parsed for control flow.

TanStack Query retries a failed mutation only when it receives a retryable `ApiError`, with
at most two retries. A `401` from an authenticated endpoint clears the local session and
returns the user to `/login`.

## Rendering model

The root layout is a Server Component. Interactive features, browser storage, TanStack
Query, and SSE require Client Components marked with `"use client"`.

The current application is client-first because its session lives in browser storage and
both API implementations are provided through client context. Server-side initial data
loading would require a server-readable session strategy.

## Development commands

```bash
yarn install
yarn dev
yarn format
yarn lint
yarn typecheck
yarn build
yarn start
```

Both `yarn dev` and `yarn start` use port 3001. Development output is written to
`.next-dev`, while production builds use `.next`, preventing the two processes from
modifying the same build files.

## Known integration gaps

The following HTTP-backed methods currently return incomplete data and should be connected
when matching backend endpoints are available:

- `getUsers()` returns only the signed-in user.
- `getPointHistory()` returns an empty list.
- `getRedemptionHistory()` returns an empty list.
- Lifetime redeemed and lifetime earned totals are partially derived from the balance
  response.
- `getComments()` is capped at the backend's most recent 20 comments per post; there is no
  pagination past that, so "See more comments" plateaus at 20 on posts with more.

These limitations belong in the HTTP adapter. UI components should continue using the
`ApiClient` contract so backend completion does not require component rewrites.
