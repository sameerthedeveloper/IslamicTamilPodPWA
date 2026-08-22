# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev       # http://localhost:5173 — public app at /, admin CMS at /admin/login
npm run build      # production build to dist/ (required to test PWA features — dev server doesn't register the SW)
npm run preview    # serve the production build locally
npm run lint        # eslint .
```

No test suite exists in this repo. Seed/maintenance scripts (all need `ADMIN_EMAIL`/`ADMIN_PASSWORD` for an existing ADMIN-role account, plus the same Firebase env vars as the app):
- `npm run seed:abdul-basith` — one-off script for a fixed episode list (`scripts/seedAbdulBasithEpisodes.js`)
- `npm run seed:tamildawah` — upserts `tamildawah_audio_v2.json` into Firestore, safe to re-run (`scripts/seedTamilDawahEpisodes.js`)
- `npm run seed:speaker-images` — applies `speaker_images.json` as scholar portraits + episode artwork (`scripts/applySpeakerImages.js`)
- `npm run wipe:content` — **destructive**, deletes all episodes/scholars/series/topics; requires `CONFIRM_WIPE=yes-delete-everything` (`scripts/wipeContentData.js`)

## Architecture

One Vite/React SPA at the repo root — **not** the old two-project split. Everything talks directly to Firebase (Auth, Firestore, Storage); there is no backend server to run or deploy.

- **Public app** — routes `/`, `/library`, `/browse`, `/quran`, `/scholars`, `/scholars/:scholarId`, `/episode/:episodeId`, `/settings` (`src/pages/`, `src/components/`, wrapped by `src/layouts/AppLayout.jsx`). No sign-in UI: every visitor is silently signed in anonymously in `src/firebase.js` so `users/{uid}/bookmarks` and `users/{uid}/history` (continue-listening progress) have a stable per-device uid to write to. `/quran` is reachable but not in the mobile bottom nav (`BottomNavigationBar.jsx` shows Scholars there instead; the desktop `Sidebar.jsx` still lists Quran).
- **Episode cards navigate, they don't autoplay** — `TitleCard`/`ListCard`/`FeaturedCard` (`src/components/Card/`) send you to `/episode/:id` (`EpisodeDetailPage.jsx`) on tap, matching an Apple-Podcasts-style flow; `ListCard` keeps a small dedicated play button for instant playback. Don't wire a card's main click straight to `usePlayerStore.play()` without a reason — that pattern was deliberately changed.
- **Admin CMS** — mounted at `/admin/*` (`src/admin/`), gated by `ProtectedRoute` + `useAuthStore` (`src/admin/store/authStore.js`): Firebase email/password auth, then a Firestore `users/{uid}.role === "ADMIN"` check — if the doc is missing or the role doesn't match, the user is immediately signed back out. Admin login replaces the anonymous session.
- **`src/admin/firebase.js`** just re-exports `src/firebase.js` — the whole app shares one Firebase project/app; don't create a second `initializeApp` call.
- **Data access is Firestore-direct, no REST layer**: `src/admin/api/client.js` wraps CRUD per collection (`episodesApi`, `scholarsApi`, etc.) through small generic helpers (`listAll`, `listPaged`, `createDoc`, `updateDocById`, `removeDoc`, `bulkUpdateDocs`). Admin lists are fetched in full and paginated client-side (Firestore doesn't offset-paginate cheaply). Batched writes are chunked at 400 (Firestore's cap is 500). `src/api/client.js` is the public-app read side (`getBookmarks`/`getHistory`, etc.).
- **State**: Zustand stores per concern — `src/admin/store/authStore.js` (admin session), `src/store/playerStore.js` / `activePlayerStore.js` (podcast audio), `src/store/quranStore.js` (Quran playback), `src/store/bookmarkStore.js`, `src/store/userStore.js`. `src/queryClient.js` is a shared TanStack Query client (5 min staleTime) wrapping the app in `main.jsx` — `HomePage`/`BrowsePage`/`ScholarsPage` deliberately reuse the same query keys (`['episodes']`, `['scholars']`, `['topics']`, `['history', uid]`) so switching tabs reuses cached data instead of refetching; writes made outside a query (bookmark toggles in `bookmarkStore.js`, `saveProgress` in `utils/history.js`) call `queryClient.invalidateQueries()` so those caches don't go stale.
- **Audio playback**: `src/components/AudioEngine.jsx` (podcast) and `src/components/QuranAudioEngine.jsx` are separate engines with their own mini/full player sheets (`MiniPlayer`/`FullPlayerSheet` vs `QuranMiniPlayer`/`QuranFullPlayerSheet`) — don't assume one player handles both content types. `AudioEngine.jsx` registers a `{seek, resume, pause}` interface per engine (`usePlayerStore.registerEngine`/`activeEngine()`) — **Media Session's `play`/`pause` handlers must call `activeEngine().resume()`/`.pause()` directly and synchronously**, not via `togglePlay()` + a React effect: iOS only grants a lock-screen tap's implicit user-gesture to a `play()` call made inside that same synchronous callback, so routing it through state+effect (fine for in-app button clicks) breaks lock-screen resume.
- **PWA / service worker** (`vite-plugin-pwa`, configured in `vite.config.js`): `registerType: 'autoUpdate'`. Runtime caching is deliberately asymmetric — Firebase Storage audio URLs (`.../o/audio%2F...`) are `NetworkOnly` because Workbox's cache strategies don't serve HTTP Range requests correctly (breaks seeking/resume), while other Storage assets (thumbnails/cover art) are `CacheFirst` since re-uploads always write a new path.
- **Firestore collections and their write/read owners** are documented in `docs/DEPLOYMENT.md` §5 — check there before assuming a collection's shape (`episodes` has a `status` state machine: `DRAFT`/`PROCESSING`/`READY`/`PUBLISHED`/`UNPUBLISHED`; `rights` drives a "blocked" state on episodes when `EXPIRED`/`REVOKED`).

## Known gaps (see `docs/DEPLOYMENT.md` for full list)

- Image upload (`src/admin/components/ImageUpload.jsx`) previews locally but isn't wired to Storage yet — only audio upload (`audioApi.upload`) actually writes.
- Topics only supports create + list from the CMS, no edit/delete.
- Series has no public detail page — search results for a series aren't clickable, only scholar results are.
- The old NestJS+Prisma API and a separate Next.js CMS are dead — neither is on `main`. The real legacy backend code lives on the separate `backend` git branch (`git checkout backend` to reference it); local `backend/`/`cms/`/`frontend/` directories that used to sit untracked on disk have been removed.
