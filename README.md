# Tamil Islamic Podcast

A single-page React/Vite PWA for Tamil Islamic lectures and Quran recitation, with a built-in admin CMS. Public listeners get a podcast-app experience (browse, search, bookmark, resume playback, background/lock-screen audio); admins manage the catalogue at `/admin` without a separate backend — everything talks to Firebase directly.

Live app: deployed via Vercel (see [DEPLOYMENT.md](./docs/DEPLOYMENT.md)). Working with Claude Code on this repo? See [CLAUDE.md](./CLAUDE.md) for agent-oriented notes.

## Features

**Public app**
- Home feed: featured episodes, continue-listening (resumes from where you left off), a scholar spotlight, and a full discover list
- Browse/Discover: search across episodes/scholars/series, category chips, a scholar grid
- Scholars section: portrait grid, per-scholar episode list
- Episode detail screen (Apple-Podcasts-style "about this episode" page) before playback starts
- Library: bookmarks + listening history, searchable, with per-row bookmark toggle and a "clear history" action
- Quran: separate recitation player (own audio engine, own mini/full player), reachable at `/quran` (not in the mobile bottom nav — see `CLAUDE.md`)
- Persistent mini-player + full player sheet with Media Session (lock-screen/notification-shade) integration, background audio, play/pause/seek/skip/next/prev, playback speed, sleep timer
- Installable PWA (Add to Home Screen / desktop install), works offline for already-loaded data (Firestore offline persistence)
- No visible sign-in required — every visitor gets a stable anonymous Firebase Auth session so bookmarks/history persist per-device; optional email/password sign-in exists (`/login`, `/register`) for syncing across devices

**Admin CMS** (`/admin/*`)
- Firebase email/password auth + a Firestore `role: "ADMIN"` check (see [DEPLOYMENT.md §4](./docs/DEPLOYMENT.md#4-firebase-project-setup))
- Full CRUD on Episodes, Scholars, Series, Playlists, Rights, Users, Featured, Settings; create+list for Topics
- Audio upload to Firebase Storage, with a rights/status state machine on episodes (`DRAFT → PROCESSING → READY → PUBLISHED/UNPUBLISHED`, blocked if the scholar's rights are `EXPIRED`/`REVOKED`)
- Bulk JSON import into any collection (Settings page)

## Tech stack

- **React 19** + **Vite** (single project, no monorepo)
- **react-router-dom** for routing (`BrowserRouter`, lazy-loaded routes)
- **Firebase** (Auth, Firestore, Storage) — the only backend; no custom API server
- **Zustand** for client state (player, Quran player, bookmarks, user session)
- **TanStack Query** for server-state caching (episodes/scholars/topics/history stay cached across tab switches instead of refetching every navigation)
- **Tailwind CSS v4** (via `@tailwindcss/vite`) + **Framer Motion** for animation
- **vite-plugin-pwa** (Workbox) for the service worker/manifest
- **lucide-react** for icons

## Getting started

```bash
cp .env.example .env    # fill in the VITE_FIREBASE_* values — see docs/DEPLOYMENT.md §4
npm install
npm run dev              # http://localhost:5173
```

- Public app: `http://localhost:5173/`
- Admin CMS: `http://localhost:5173/admin/login` (needs an ADMIN-role Firestore user — see [DEPLOYMENT.md §4](./docs/DEPLOYMENT.md#4-firebase-project-setup))

PWA features (install prompt, service worker, offline) only activate on a production build — `npm run dev` doesn't register the service worker:

```bash
npm run build && npm run preview
```

No database, Docker, or worker process to run locally — Firestore/Storage/Auth are fully Google-hosted.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` (also generates the PWA service worker + manifest) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over the whole repo |
| `npm run seed:abdul-basith` | One-off script seeding a fixed episode list for one scholar (`scripts/seedAbdulBasithEpisodes.js`) |
| `npm run seed:tamildawah` | Upserts `data/tamildawah_audio_v2.json` into Firestore — creates/links scholars, series, topics, and episodes; safe to re-run after editing the JSON (`scripts/seedTamilDawahEpisodes.js`) |
| `npm run seed:speaker-images` | Applies `data/speaker_images.json` as scholar portraits and propagates them to episode/player artwork (`scripts/applySpeakerImages.js`) |
| `npm run wipe:content` | **Destructive.** Deletes every doc in `episodes`/`scholars`/`series`/`topics`. Requires `CONFIRM_WIPE=yes-delete-everything` (`scripts/wipeContentData.js`) |

All seed/wipe scripts need Firebase env vars (same `.env` as the app) plus `ADMIN_EMAIL`/`ADMIN_PASSWORD` for an existing ADMIN-role account, e.g.:

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=••••• npm run seed:tamildawah
```

## Architecture

One Vite/React SPA at the repo root — everything talks directly to Firebase, there is no backend server.

```
data/                    Source JSON the seed scripts import (tamildawah_audio_v2.json, speaker_images.json)
docs/                     DEPLOYMENT.md — full ops guide (Vercel, Firebase setup, rollback, troubleshooting)
scripts/                  Node seed/maintenance scripts (see Scripts above) — run against Firebase directly, not part of the app build
src/
├── pages/              Public app screens (Home, Browse, Library, Scholars, Quran, Episode detail, Settings, Login/Register)
├── components/          Shared UI: nav, top bar, sidebar, both audio engines & their player sheets, error boundary
│   └── Card/            The episode/scholar/topic card family (TitleCard, ListCard, FeaturedCard, ScholarCard, ScholarListRow, ScholarSpotlightCard, TopicChip)
├── layouts/              AppLayout — wraps public routes with nav/player chrome + page transitions
├── store/                Zustand stores: playerStore, quranStore, bookmarkStore, userStore, activePlayerStore
├── api/                  Public-app read/write functions over Firestore (src/api/client.js)
├── hooks/                useImageFallback (broken-image → initial-letter fallback), useIncrementalReveal (render long lists a page at a time)
├── lib/                  Shared framer-motion presets
├── utils/                history.js (playback-progress persistence)
├── firebase.js           Single Firebase app init + anonymous-auth bootstrap — src/admin/firebase.js re-exports this, don't create a second app
├── queryClient.js         Shared TanStack Query client (5 min staleTime)
└── admin/
    ├── pages/            One page per admin CRUD screen
    ├── components/        ProtectedRoute, DataTable, FormModal, etc.
    ├── store/authStore.js  Admin auth/session + role check
    └── api/client.js       Admin CRUD over Firestore/Storage
```

**Routes** (all in `src/App.jsx`, lazy-loaded):

| Path | Page |
|---|---|
| `/`, `/library`, `/browse`, `/quran`, `/scholars`, `/scholars/:scholarId`, `/episode/:episodeId`, `/settings` | Public app (wrapped by `AppLayout`) |
| `/login`, `/register` | Optional account sign-in |
| `/admin/login` | Admin sign-in |
| `/admin`, `/admin/episodes`, `/admin/scholars`, `/admin/series`, `/admin/playlists`, `/admin/topics`, `/admin/audio`, `/admin/rights`, `/admin/users`, `/admin/featured`, `/admin/settings` | Admin CMS (gated by `ProtectedRoute`) |

**Audio**: two independent playback engines — `AudioEngine.jsx` (podcast episodes; wraps a single persistent native `<audio>` element plus a hidden YouTube iframe fallback) and `QuranAudioEngine.jsx` (Quran recitation) — each with its own mini-player and full-player sheet, coordinated by `activePlayerStore` so only one docks at a time. `AudioEngine.jsx` also owns Media Session (lock-screen/notification controls) — its `play`/`pause` handlers call the audio element directly and synchronously (not via React state + effect) because iOS only honors a lock-screen tap's implicit user-gesture for a `play()` call made inside that same synchronous callback.

**Data fetching**: `src/api/client.js` (public reads) and `src/admin/api/client.js` (admin CRUD) both go straight to Firestore — no REST layer. Public pages wrap these in TanStack Query (`useQuery`) so navigating between tabs reuses cached data instead of refetching; writes that happen outside a query (bookmark toggles, playback-progress saves) call `queryClient.invalidateQueries()` so the cache doesn't go stale.

**Data model**: see [DEPLOYMENT.md §5](./docs/DEPLOYMENT.md#5-data-model-firestore-collections) for the full Firestore collection list, and `firestore.rules` for what's public-read vs admin-only.

## Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for the full guide: Vercel setup, Firebase project setup (Auth/Firestore/Storage/rules/admin roles), PWA notes, rollback, and a troubleshooting table.

## Known gaps

- Image upload in the admin CMS (`src/admin/components/ImageUpload.jsx`) previews locally but isn't wired to Storage yet — only audio upload actually writes.
- Topics only supports create + list from the CMS, no edit/delete.
- Series has no public detail page yet — search results for a series aren't clickable.
- A legacy NestJS+Prisma API and a legacy separate Next.js CMS existed early in this project's history; neither is on `main` or deployed. The old backend source is preserved on the `backend` git branch (`git checkout backend`) if it's ever needed again.
