# Project "Good Job" — Web Architecture Reference

Frontend for the peer-recognition & reward platform. Separate repo (`kudos-web`),
consumes the API's public contract. Companion to `ARCHITECTURE.md` (backend).

**The situation shapes the architecture:** the backend does not exist yet. So the
frontend is built **FE-first against a mock**, and the entire design is organized so that
swapping mock → real API changes **one layer and nothing else**. This mirrors the backend's
tool-swapping philosophy: the API client is a *swappable provider behind one interface*,
exactly like `persistence` or `messaging` on the backend.

Stack: **Next.js (App Router)** · **TanStack Query** (server state) · **Tailwind**
(+ shadcn/ui for primitives) · **TypeScript**.

---

## Table of contents

1. [Core principles](#1-core-principles)
2. [The ApiClient seam (mock ⇄ real)](#2-the-apiclient-seam-mock--real)
3. [Next.js App Router: render boundaries](#3-nextjs-app-router-render-boundaries)
4. [Structure (feature slices)](#4-structure-feature-slices)
5. [Server state with TanStack Query](#5-server-state-with-tanstack-query)
6. [Optimistic updates](#6-optimistic-updates)
7. [Mocking real-time (SSE)](#7-mocking-real-time-sse)
8. [Error handling (mirrors BE taxonomy)](#8-error-handling-mirrors-be-taxonomy)
9. [Auth & session](#9-auth--session)
10. [The swap checklist (mock → real)](#10-the-swap-checklist-mock--real)
11. [Deliberate scope choices](#11-deliberate-scope-choices)

---

## 1. Core principles

**W1 — The API client is a swappable provider.** All UI talks to a single `ApiClient`
*interface*. Two implementations satisfy it: `MockApiClient` (in-memory, now) and
`HttpApiClient` (real fetch, later). Swap via one env flag. This is the backend's
"app chooses the provider via config" pattern, one layer up.

**W2 — Build the whole UI against the mock.** Every screen, loading state, optimistic
update, error path, and real-time behavior is developed and demoable with no backend. The
mock doubles as the *contract handed to the BE team* — "here is the shape the frontend
expects."

**W3 — Real-time is a provider too.** The SSE connection sits behind an interface with a
mock-emitter (scripted events on a timer) and a real `EventSource` implementation. The live
UI (pill, live card patches, notification bell) is built against the mock emitter.

**W4 — The client cache is a projection; the server is truth.** TanStack Query's cache is
the client-side projection of server state — the same "read from a cheap projection,
reconcile from truth" idea as the backend's balances. SSE events patch/invalidate the cache;
reconnect refetches from truth.

**W5 — Feature slices mirror backend domains.** `kudo`, `feed`, `reward`, `notification`,
`user`, `auth` — same mental model on both sides; a change to "how kudos work" lives in one
slice per side.

**W6 — Switch on error `code`, never parse `message`.** The UI maps the backend's stable
error codes to behavior. Human-readable `message` is for display only.

---

## 2. The ApiClient seam (mock ⇄ real)

The single most important structure in the web app. Everything the UI does routes through
one typed interface; the implementation is chosen at composition time.

```
UI (components)
  └─▶ TanStack Query hooks (useFeed, useSendKudo, useRedeem…)
        └─▶ ApiClient  interface        ← the ONLY thing features code against
              ├─ MockApiClient   (in-memory fixtures, realistic latency)   [now]
              └─ HttpApiClient   (real fetch against BE)                    [later]
                    ▲ chosen by NEXT_PUBLIC_API_MODE (mock | http)
```

### The interface (the contract)

```ts
// lib/api/client.interface.ts — the UI depends on THIS, not on any implementation
export interface ApiClient {
  // kudo
  sendKudo(cmd: SendKudoCommand, idempotencyKey: string): Promise<KudoView>;
  getBudget(): Promise<BudgetView>;                       // spent / remaining this month
  // feed
  getFeed(cursor?: string): Promise<Page<FeedPostView>>;  // keyset pagination
  // reactions & comments
  react(postId: string, emoji: string): Promise<void>;
  comment(postId: string, body: string): Promise<CommentView>;
  // rewards
  getRewards(): Promise<RewardView[]>;
  redeem(rewardId: string, idempotencyKey: string): Promise<RedemptionView>;
  // notifications
  getNotifications(unreadOnly?: boolean): Promise<NotificationView[]>;
  markRead(ids: string[]): Promise<void>;
  // user
  getMe(): Promise<UserView>;
  getUser(id: string): Promise<UserView>;
}
```

### The mock implementation

```ts
// lib/api/mock/mock-client.ts
export class MockApiClient implements ApiClient {
  private db = seedFixtures();                 // in-memory users, kudos, rewards, balances

  async sendKudo(cmd, idempotencyKey) {
    await sleep(300);                          // realistic latency for loading-state dev
    if (this.db.seen(idempotencyKey)) return this.db.kudoFor(idempotencyKey);  // idempotent
    const budget = this.db.budgetOf(cmd.senderId);
    if (budget.remaining < cmd.points)
      throw new ApiError('INSUFFICIENT_BUDGET', 'Not enough giving budget this month');
    if (cmd.senderId === cmd.recipientId)
      throw new ApiError('SELF_RECOGNITION', 'You cannot recognize yourself');
    return this.db.createKudo(cmd, idempotencyKey);        // updates in-memory state
  }
  // …every method returns fixtures and throws the SAME coded errors the BE will
}
```

Key: the mock **throws the same coded errors** the backend will (`INSUFFICIENT_BUDGET`,
`SELF_RECOGNITION`, `DUPLICATE_REQUEST`), so the full error UX is built and demoed with no
backend. It also honors the **idempotency key** so double-submit UX is testable.

### The provider (the one place the choice is made)

```ts
// lib/api/provider.ts
export function createApiClient(): ApiClient {
  return process.env.NEXT_PUBLIC_API_MODE === 'http'
    ? new HttpApiClient(process.env.NEXT_PUBLIC_API_URL!)
    : new MockApiClient();
}
```

Injected once via an `<ApiProvider>` React context; features consume it through a
`useApi()` hook. No feature file names `MockApiClient` or `HttpApiClient` — they see only
`ApiClient`. (Same discipline as the backend: vendor/impl names appear only at the
composition seam.)

### Mock strategy: in-memory now, MSW-ready later

Two ways to mock; the interface makes them interchangeable:

- **In-memory `MockApiClient` (default now):** fastest, fully typed, zero network. Best for
  pure UI development.
- **MSW (Mock Service Worker) later, optional:** intercepts real `fetch` at the network
  layer, so `HttpApiClient` runs *even in mock mode* — smoother mock→real transition
  (no client swap, just turn MSW off). More setup; adopt if network-level fidelity is wanted.

Whether the mock is in-memory or MSW is itself a swappable detail behind `ApiClient`.

---

## 3. Next.js App Router: render boundaries

The key App Router decision is the **Server Component / Client Component boundary**. It
falls out along the backend's read/write + real-time split.

- **Server Components** — page shells, static layout, and *initial* non-interactive fetches
  (first feed page, reward catalog, a profile). Render on the server, ship less JS, fast
  first paint.
- **Client Components** (`'use client'`) — anything interactive or live: the send-kudo form,
  reaction buttons, infinite-scroll feed (after initial), notification bell, and
  **everything touching the SSE stream** (real-time is inherently client-side).

### The mock-phase caveat (important)

A pure in-memory mock **cannot run meaningfully in Server Components** — server and client
are separate runtimes; in-memory state won't share or persist across them. So during the
mock phase, **build client-first**: fetch through TanStack Query in Client Components against
the mock.

Server-side data fetching (RSC calling the real API for first paint) is adopted **as an
enhancement once `HttpApiClient` exists** — a real HTTP API *can* be called server-side.
Do not over-invest in RSC data-fetching against a mock that can't support it.

Sequence:
1. **Now (mock):** client-side fetching everywhere via TanStack Query + `MockApiClient`.
2. **Later (real API):** move initial feed/catalog/profile fetches into Server Components
   for first-paint speed; keep interactive + live pieces as Client Components.

---

## 4. Structure (feature slices)

Feature slices mirror the backend domain modules.

```
kudos-web/                              # separate repo
├── src/
│   ├── app/                            # App Router — routes only, thin
│   │   ├── layout.tsx                  # root shell + providers
│   │   ├── (app)/                      # authenticated app shell (route group)
│   │   │   ├── feed/page.tsx
│   │   │   ├── rewards/page.tsx
│   │   │   └── profile/[id]/page.tsx
│   │   └── (auth)/login/page.tsx       # login area (route group)
│   │
│   ├── features/                       # slices mirror BE domains
│   │   ├── kudo/
│   │   │   ├── components/  SendKudoForm, KudoCard, CoreValueTag, MediaUpload
│   │   │   ├── hooks/       useSendKudo (optimistic), useBudget
│   │   │   └── types.ts     # local view types (until generated client exists)
│   │   ├── feed/
│   │   │   ├── components/  FeedList (infinite scroll), NewActivityPill
│   │   │   └── hooks/       useFeed (infinite query), useFeedRealtime (SSE patches)
│   │   ├── reaction/        components/{ReactionBar, CommentThread}, hooks/
│   │   ├── reward/          components/{RewardCatalog, RewardCard, RedeemButton}, hooks/useRedeem
│   │   ├── notification/    components/{NotificationBell, NotificationList}, hooks/useNotifications
│   │   ├── user/            components/{Avatar, UserPicker}, hooks/useMe
│   │   └── auth/            components/{LoginButton}, hooks/useSession
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.interface.ts     # ApiClient — the UI's contract
│   │   │   ├── mock/  mock-client.ts, fixtures.ts, mock-realtime.ts
│   │   │   ├── http/  http-client.ts   # built later
│   │   │   └── provider.ts             # mock | http from env
│   │   ├── query/     query-client.ts  # TanStack Query config
│   │   ├── realtime/  connection.interface.ts, mock-emitter.ts, sse-connection.ts
│   │   └── errors/    error-codes.ts, api-error.ts, error-ui-map.ts
│   │
│   ├── components/ui/                   # shadcn/ui primitives (Tailwind)
│   └── providers/                       # QueryProvider, ApiProvider, SessionProvider, RealtimeProvider
│
├── .env.local                          # NEXT_PUBLIC_API_MODE=mock | http · NEXT_PUBLIC_API_URL
└── package.json
```

Rule: `features/*` depend only on the `lib/*` interfaces (`ApiClient`, realtime connection,
error codes) — never on a concrete client or `EventSource`. Same dependency discipline as
the backend modules depending on tool tokens.

---

## 5. Server state with TanStack Query

TanStack Query owns all server-derived state; there is no Redux for server data. The query
cache is the client-side projection of backend state (W4).

- **`useFeed`** — `useInfiniteQuery`, keyset cursor (`getNextPageParam` returns the last
  item's cursor). Matches the backend's keyset pagination; no offset.
- **`useBudget` / balances** — normal queries; short `staleTime`. These are *display* reads
  (eventually consistent on the backend), so mild staleness is expected and fine.
- **Query keys mirror resources:** `['feed']`, `['budget']`, `['rewards']`,
  `['notifications','unread']`, `['user', id]`.
- **SSE events drive cache updates** (§7): a `feed.new` shows the pill; a `kudo.reacted`
  patches that card in cache; a `notification` bumps the unread query. Reconnect →
  `queryClient.invalidateQueries` (refetch from truth, mirroring the backend's
  refetch-on-reconnect).

Configuration: sensible `retry` (don't retry non-retryable coded errors — see §8),
`refetchOnWindowFocus` tuned for an internal tool, and a global error handler that routes
`ApiError` through the error-UI map.

---

## 6. Optimistic updates

The backend's "one sync request, async fan-out" + per-part states map directly to optimistic
mutations, giving the instant-feedback UX the design promises.

- **`useSendKudo`** — on submit, optimistically prepend the kudo to the `['feed']` cache and
  decrement the displayed budget *before* the response ("Sent ✓" instantly). Roll back on
  error; reconcile on success. Media shows a "processing" state until a later signal.
- **`useRedeem`** — generate a **UUID idempotency key per click**, send it in the header,
  optimistically disable the button + decrement balance. Double-click is a client no-op *and*
  a server no-op (the key). Matches the backend's double-spend guards.
- **Reactions** — toggle optimistically (Slack-style), reconciled by the incoming SSE patch.

Every optimistic mutation follows TanStack Query's `onMutate` (snapshot + apply) /
`onError` (rollback) / `onSettled` (reconcile) pattern. Because the `MockApiClient` enforces
the same rules and latency, all of this is built and demoed against the mock.

---

## 7. Mocking real-time (SSE)

Real-time can't be an afterthought — the feed and notifications depend on it, so the mock
must fake it convincingly. Real-time sits behind its own interface (W3).

```ts
// lib/realtime/connection.interface.ts
export interface RealtimeConnection {
  connect(onEvent: (e: RealtimeEvent) => void): () => void;   // returns disconnect
}
```

Two implementations:

- **`MockEmitter`** — pushes scripted events on a timer: every few seconds emits a fake
  `feed.new`, `notification`, or `kudo.reacted` into the same `onEvent` handler the real
  stream would call. The pill appears, cards patch live, the bell increments — all with no
  server.
- **`SseConnection`** — wraps a real `EventSource` on `/events`, dispatching by SSE
  `event:` type into the same handler.

Swap via `RealtimeProvider` (mock-emitter | real SSE), same env flag family. `useFeedRealtime`
and `NotificationBell` consume `RealtimeConnection` and never know which is live.

The event → cache mapping (identical for mock and real):
- `feed.new`     → set a "new activity" flag → render `NewActivityPill`; prepend on click.
- `kudo.reacted` → patch that post in the `['feed']` cache (count ticks up in place).
- `notification` → bump `['notifications','unread']`; animate the bell.

This realizes the backend's UX rule: **new top-of-feed items → pill (user-pulled); updates
to visible items → live patch (pushed).**

---

## 8. Error handling (mirrors BE taxonomy)

The backend returns `{ code, message, requestId }` with stable codes. The web mirrors those
codes and maps each to UI behavior — switching on `code`, never parsing `message` (W6).

```ts
// lib/errors/error-ui-map.ts
export const ERROR_UI: Record<string, (e: ApiError) => UiAction> = {
  INSUFFICIENT_BUDGET:  () => ({ kind: 'inline', hint: 'showBudgetRemaining' }),
  INSUFFICIENT_BALANCE: () => ({ kind: 'inline', hint: 'showEarnedBalance' }),
  SELF_RECOGNITION:     () => ({ kind: 'inline', field: 'recipient' }),
  DUPLICATE_REQUEST:    () => ({ kind: 'silent-success' }),   // idempotent → treat as done
  REWARD_OUT_OF_STOCK:  () => ({ kind: 'toast', tone: 'warn' }),
  RATE_LIMITED:         (e) => ({ kind: 'toast', tone: 'warn', retryAfter: e.retryAfter }),
  UNAUTHENTICATED:      () => ({ kind: 'redirect', to: '/login' }),
  INTERNAL:             () => ({ kind: 'toast', tone: 'error', msg: 'Something went wrong' }),
};
```

- `ApiError` carries `code`, `message`, `requestId`, `retryable` — the mock throws these; the
  real client parses them from the response body.
- TanStack Query's `retry` respects `retryable`: never auto-retry a non-retryable domain
  error (a 409 insufficient-budget), only transient ones.
- `requestId` is surfaced in a dev/error boundary for correlating with backend logs.

Because `MockApiClient` throws the same coded errors for the same edge cases (over-budget,
self-give, double-click), the **entire error UX is built and demonstrable pre-backend**.

---

## 9. Auth & session

- Route groups split `(auth)` (login) from `(app)` (authenticated shell). Middleware guards
  `(app)` routes.
- `useSession` reads the current user (`getMe`); during mock phase, the mock returns a seeded
  "current user," so the whole authed experience is navigable without a real IdP.
- When the backend is ready, login flows through the BE's OIDC endpoints; the web only holds
  the session token and attaches it (the backend's `libs/security` owns actual auth). The web
  never implements crypto/auth itself — it consumes the BE's session.

---

## 10. The swap checklist (mock → real)

The entire payoff — the change surface is tiny and localized:

1. Implement **`HttpApiClient`** against the real endpoints (interface already exists).
2. Flip **`NEXT_PUBLIC_API_MODE=http`**.
3. Swap the **realtime provider** (mock-emitter → real `EventSource`).
4. Replace hand-written `features/*/types.ts` with the **generated client / published
   `@kudos/contracts`** once the BE exposes it.
5. *(Enhancement)* Push initial feed/catalog/profile fetches into **Server Components** now
   that a real server API exists.

Nothing in `features/*` components or hooks changes — they only ever knew the interfaces.

---

## 11. Deliberate scope choices

- **FE-first against a mock**, with the API client as a swappable provider. The mock is both
  a dev tool and the contract handed to the BE team.
- **Client-first rendering during mock phase**; RSC server-fetching adopted only after a real
  API exists (an in-memory mock can't back Server Components).
- **In-memory mock now, MSW-ready later** — both sit behind `ApiClient`.
- **No Redux for server state** — TanStack Query is the server-state projection; local UI
  state uses React state/context.
- **shadcn/ui + Tailwind** for fast, modern, responsive primitives with good loading-state
  ergonomics (meaningful loading states are explicitly graded).
- **Web consumes the BE's contract; it never co-owns it** — hand-written view types now,
  generated client later. Direction is BE → (exposes contract) → web.

### One-line summary

> The web app codes entirely against a small set of interfaces — `ApiClient`,
> `RealtimeConnection`, and the shared error codes — with mock providers behind each, so the
> full UI, optimistic flows, live feed, and error UX are built and demoable before the backend
> exists. Swapping to the real API is a localized change (implement `HttpApiClient`, flip a
> flag, swap the realtime provider); feature code, which only ever knew the interfaces, does
> not change. TanStack Query is the client-side projection of server state; App Router renders
> static shells on the server and interactive/live pieces on the client.
