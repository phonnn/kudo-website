# Good Job web

Next.js App Router frontend for the Good Job peer-recognition platform. The initial app is client-first and uses an in-memory API implementation, following `WEB-ARCHITECTURE.md`.

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
requests and pushes to `main`. A second workflow deploys validated pushes to Vercel.

Configure these GitHub Actions secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Run `yarn vercel link` locally to create `.vercel/project.json`, where the organization and
project IDs can be found. Configure `NEXT_PUBLIC_API_MODE=http` and
`NEXT_PUBLIC_API_URL` in the Vercel production environment.
