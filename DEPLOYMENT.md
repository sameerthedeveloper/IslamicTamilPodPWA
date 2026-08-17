# Deployment Guide

Tamil Islamic Audio Platform — four deployable pieces:

| Piece | Repo path | Runs where |
|---|---|---|
| API | `backend/` | Railway (Docker) |
| Worker | `backend/` (same image, `start:worker` command) | Railway (Docker, separate service) |
| Frontend (listener PWA) | `frontend/` | Vercel |
| CMS (admin) | `cms/` | Vercel (separate project) |

Postgres and Redis are Railway managed plugins. Audio/thumbnail storage is Cloudflare R2 in production, MinIO locally — same client code, only env vars differ (`backend/src/common/storage/storage.service.ts`).

---

## 1. Local development

Requires Docker + Docker Compose.

```bash
cd backend
cp .env.example .env
docker compose up -d --build
```

Brings up `postgres`, `redis`, `minio`, `api` (port 3000), `worker`. First boot, run migrations and seed:

```bash
docker exec tamil_audio_api npx prisma migrate deploy
docker exec tamil_audio_api npm run seed
```

Frontend and CMS run outside Docker:

```bash
cp frontend/.env.example frontend/.env.local
cp cms/.env.example cms/.env.local
npm --prefix frontend run dev   # http://localhost:5173
npm --prefix cms run dev        # http://localhost:5174
```

Verify:
- `curl http://localhost:3000/health` → `{"status":"ok","checks":{"db":true,"redis":true}}`
- `curl http://localhost:3000/api/v1/episodes` → real seeded data
- Swagger docs: `http://localhost:3000/docs`

If `docker compose up` errors with "port already allocated" on 5432/6379/9000, another local project is squatting those ports — this compose file already uses 6380/9002/9003 on the host side for redis/minio to reduce collisions; adjust further in `backend/docker-compose.yml` if needed. Only the host-side mapping matters; containers still talk to each other over the internal Docker network on the standard ports.

---

## 2. Backend + worker → Railway

Both API and worker deploy from the same `backend/Dockerfile` as two separate Railway services pointed at the same repo/root — they differ only in **start command**.

1. Create a Railway project, add **PostgreSQL** and **Redis** plugins.
2. Add service **api**:
   - Root directory: `backend`
   - Build: Dockerfile (auto-detected)
   - Start command: `npm start` (i.e. `node dist/main.js`)
   - Attach the env vars from the table below
3. Add service **worker**:
   - Same repo/root/Dockerfile
   - Start command: `npm run start:worker`
   - Same env vars as api, minus `APP_PORT`/`CORS_ORIGINS` (unused by the worker)
4. Run migrations once against the Railway Postgres (from local machine or a Railway one-off run):
   ```bash
   DATABASE_URL=<railway-postgres-url> npx prisma migrate deploy
   ```
5. First deploy: verify `https://<api-domain>/health` returns `db: true, redis: true`, and `https://<api-domain>/docs` loads.

The worker has no HTTP port — Railway just needs to see the process running (BullMQ `Worker` keeps it alive); don't attach a public domain to it.

---

## 3. Frontend + CMS → Vercel

Two separate Vercel projects, both pointed at this repo:

**Frontend**
- Root directory: `frontend`
- Framework preset: Vite
- Build command: `npm run build` — Output: `dist`
- Env var: `VITE_API_URL=https://<api-domain>/api/v1`

**CMS**
- Root directory: `cms`
- Same Vite preset/build/output
- Env var: `VITE_API_URL=https://<api-domain>/api/v1`
- Consider putting this project behind Vercel's password protection or a separate subdomain (`admin.yourdomain.com`) since the app itself only gates by JWT role, not network access.

Both are static SPAs — no server-side env vars, no serverless functions.

---

## 4. Cloudflare R2 (production storage)

1. Create an R2 bucket (e.g. `tamil-audio-prod`).
2. Create an R2 API token with read/write scoped to that bucket → gives you Access Key ID + Secret.
3. On the **api** and **worker** Railway services, set:
   ```
   STORAGE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
   STORAGE_ACCESS_KEY=<r2-access-key-id>
   STORAGE_SECRET_KEY=<r2-secret-access-key>
   STORAGE_BUCKET=tamil-audio-prod
   STORAGE_REGION=auto
   ```
   No code change — `StorageService` reads these directly; it's the same MinIO-compatible S3 client either way.
4. Put Cloudflare CDN in front of the bucket's public/custom domain for delivery, and in front of the Vercel frontend domain via Cloudflare DNS proxy (orange-cloud) for caching + DDoS protection.
5. Signed URLs (`StorageService.signedUrl`) are used for anything that shouldn't be world-readable; never expose `STORAGE_SECRET_KEY` to the frontend or CMS.

---

## 5. Environment variables

### `backend/.env` (API + worker)

| Var | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Railway Postgres plugin provides this |
| `REDIS_URL` | `redis://host:6379` | Railway Redis plugin provides this |
| `STORAGE_ENDPOINT` | `https://<acct>.r2.cloudflarestorage.com` | MinIO locally, R2 in prod |
| `STORAGE_ACCESS_KEY` | — | R2 API token access key |
| `STORAGE_SECRET_KEY` | — | R2 API token secret |
| `STORAGE_BUCKET` | `tamil-audio-prod` | |
| `STORAGE_REGION` | `auto` | R2 uses `auto`; MinIO ignores it |
| `JWT_SECRET` | 32+ random chars | **Rotate before real launch** — default in `.env.example` is a placeholder, never use it in prod |
| `JWT_EXPIRY` | `15m` | |
| `JWT_REFRESH_EXPIRY` | `7d` | |
| `CORS_ORIGINS` | `https://app.yourdomain.com,https://admin.yourdomain.com` | Comma-separated. **Required** outside dev — unset + non-dev NODE_ENV blocks all origins by design |
| `NODE_ENV` | `production` | |
| `APP_PORT` | `3000` | Railway sets `PORT` too; keep in sync if Railway overrides it |

### `frontend/.env.local`, `cms/.env.local`

| Var | Example |
|---|---|
| `VITE_API_URL` | `https://api.yourdomain.com/api/v1` |

No secrets belong in either frontend env file — both are bundled client-side and public by nature.

---

## 6. Migrations

```bash
# Create a new migration during development
cd backend
npx prisma migrate dev --name <description>

# Apply pending migrations to any target DB (staging/prod) without prompting
DATABASE_URL=<target-db-url> npx prisma migrate deploy
```

Never run `migrate dev` against production — it can prompt for destructive resets. `migrate deploy` only applies pending migration files.

---

## 7. Rollback

- **API/worker (Railway):** Railway keeps prior deployments — use the dashboard's "Redeploy" on the last-known-good build, or `railway rollback` via CLI.
- **Frontend/CMS (Vercel):** every deploy is a preserved, immutable deployment — promote a previous one to production from the Vercel dashboard's Deployments tab, or `vercel rollback`.
- **Database:** Prisma migrations are forward-only by default. To roll back a migration, write and apply a new migration that reverses the change — don't hand-edit `_prisma_migrations`. Keep a recent Postgres backup (Railway plugin has automatic backups) before any schema change that drops columns/tables.
- **Storage (R2):** enable R2 bucket versioning if you need to recover overwritten/deleted audio files.

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `docker compose up` fails with "port already allocated" | Another local stack using 5432/6379/9000 | Check `docker ps -a`; either stop the conflicting container or remap the host port in `docker-compose.yml` |
| API container crash-loops on `Cannot find module '@nestjs/throttler'` (or similar) after a dependency change | Bind-mounted `node_modules` volume is stale relative to `package.json` | `docker exec <container> npm ci` then restart the container |
| `PrismaClient did not initialize yet` | Prisma client wasn't generated inside the container (separate volume from host) | `docker exec <container> npx prisma generate`, restart |
| `/health` returns `redis: false` | `REDIS_URL` wrong, or Redis plugin not attached | Check env var matches the Railway Redis plugin's connection string |
| Episode publish blocked unexpectedly | Rights record for that scholar is `EXPIRED`/`REVOKED` | Working as intended — this is enforced both in the CMS UI and the API (`episodes.service.ts`). Update or add a `Rights` record for the scholar via the CMS Rights page |
| Frontend/CMS shows stale data after a CMS edit | Redis cache (`episodes:*`, `home:*`, `topics:*`) not invalidated | Should self-invalidate on create/update/delete/publish — if not, check the mutating endpoint actually calls `CacheService.invalidatePrefix` |
| Audio upload succeeds but episode stays `PROCESSING` | Worker not running, or `ffmpeg`/`ffprobe` missing from its image | Confirm the worker service is up (`docker logs tamil_audio_worker` / Railway logs) and its Dockerfile installed `ffmpeg` |
| CORS errors from frontend/CMS in production | `CORS_ORIGINS` unset or missing that origin | Set `CORS_ORIGINS` on the API service to a comma-separated list including the exact frontend/CMS origins |
| 429 Too Many Requests | Rate limiter (120 req/min per IP, `@nestjs/throttler`) tripped | Expected under abuse; if a legitimate client hits it, raise the limit in `app.module.ts`'s `ThrottlerModule.forRoot` |

---

## Known gaps (not hidden, just not built yet)

- Topics has no edit/delete API — CMS only supports create + list for it.
- Thumbnail/image upload fields in the CMS are preview-only; no backend storage wiring for images yet (only audio goes through the real upload → worker → R2/MinIO path).
- No job-status polling UI in the CMS Audio page beyond the initial upload progress bar — the worker updates the episode's `status` field (`PROCESSING` → `READY`), but there's no live "your file is being transcoded" indicator yet.
