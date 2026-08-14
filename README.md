# Good Job web

Next.js App Router frontend for the Good Job peer-recognition platform. The initial app is client-first and uses an in-memory API implementation.
Backend: [kudo-service](https://github.com/phonnn/kudo-service)
Live: [https://kudo-website.vercel.app/](https://kudo-website.vercel.app)

For the design decisions behind this (API provider abstraction, feature structure, state/data-fetching approach, trade-offs), see [WEB-ARCHITECTURE.md](./WEB-ARCHITECTURE.md).

## Run locally

```bash
nvm use
yarn install
cp .env.example .env.local
yarn dev
```

Open http://localhost:3001. The backend uses port 3000. Node 22.22.0 is pinned in `.nvmrc`.

Set `NEXT_PUBLIC_API_MODE=http` and `NEXT_PUBLIC_API_URL` to swap to the HTTP provider when the backend is ready.

The local `.env.local` is configured to use `http://localhost:3000`.

## CI/CD

GitHub Actions runs formatting, linting, type checking, and a production build for pull
requests and pushes to `main`.

Vercel deploys the website through its Git integration. Configure `main` as the production
branch, then set `NEXT_PUBLIC_API_MODE=http` and `NEXT_PUBLIC_API_URL` in the Vercel project
environment.
