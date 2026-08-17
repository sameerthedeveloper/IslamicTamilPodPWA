# Tamil Islamic Audio — Admin CMS

Separate Vite + React app for content management. Not part of the listener PWA in `../frontend` — own routing, own auth gate, own deploy.

## Stack

- React 19 + Vite + Tailwind 4
- React Router (only app in this repo that uses a router — the listener frontend uses tab state)
- Zustand not used here (auth state lives in `src/store/authStore.js` via a small custom store)
- Axios client in `src/api/client.js`, JWT bearer attached per-request

## Design

Warm paper base (`#FAFAF9`), teal accent (`#0F766E`), Inter + JetBrains Mono. Status pills use a left-border-accent style (not filled badges) so state reads at a glance across dense tables. See `src/index.css` for the full token set.

## Auth

Login posts to `POST /auth/login`. Non-`ADMIN` accounts are rejected client-side even on a valid login — `ProtectedRoute` redirects to `/login` for anyone without `role === 'ADMIN'` in the stored JWT payload. Token + user persist in `localStorage` under `cms_auth`.

## Pages

| Route | Backed by |
|---|---|
| `/` | `GET /admin/stats` |
| `/episodes` | Full CRUD via `/episodes/admin*` |
| `/scholars` | Full CRUD via `/scholars/admin*` |
| `/series` | Full CRUD via `/series/admin*` |
| `/topics` | Create + list only — no backend edit/delete yet |
| `/audio` | `POST /audio/admin/upload` → BullMQ worker transcode |
| `/rights` | Full CRUD via `/admin/rights*` |
| `/users` | Read-only, `GET /admin/users` |
| `/featured` | Full CRUD + drag-reorder via `/admin/featured*` |
| `/settings` | `GET`/`PATCH /admin/settings` |

**Rights enforcement:** publishing an episode is blocked — both here (disabled button + inline message) and in the API — if the episode's scholar has a `Rights` record with status `EXPIRED` or `REVOKED`.

## Local dev

```bash
cp .env.example .env.local   # VITE_API_URL, defaults to http://localhost:3000/api/v1
npm install
npm run dev                  # http://localhost:5174
```

Needs the backend running (`../backend`, see its `README.md`/`DEPLOYMENT.md` at repo root) with an admin user — promote a registered user's `role` to `ADMIN` directly in Postgres, there's no self-serve admin signup.

## Deploy

See `../DEPLOYMENT.md` §3 — separate Vercel project, root directory `cms`, same `VITE_API_URL` env var pattern as the listener frontend.
