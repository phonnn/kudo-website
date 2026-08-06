# Good Job web

Next.js App Router frontend for the Good Job peer-recognition platform. The initial app is client-first and uses an in-memory API implementation, following `WEB-ARCHITECTURE.md`.

## Run locally

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Node 22.22.0 is pinned in `.nvmrc`.

Set `NEXT_PUBLIC_API_MODE=http` and `NEXT_PUBLIC_API_URL` to swap to the HTTP provider when the backend is ready.
