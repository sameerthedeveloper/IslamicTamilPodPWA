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

No test suite exists in this repo. `npm run seed:abdul-basith` runs a one-off Node seeding script (`scripts/seedAbdulBasithEpisodes.js`).

## Architecture

One Vite/React SPA at the repo root — **not** the old two-project split. Everything talks directly to Firebase (Auth, Firestore, Storage); there is no backend server to run or deploy.

- **Public app** — routes `/`, `/library`, `/browse`, `/quran`, `/settings` (`src/pages/`, `src/components/`, wrapped by `src/layouts/AppLayout.jsx`). No sign-in UI: every visitor is silently signed in anonymously in `src/firebase.js` so `users/{uid}/bookmarks` and `users/{uid}/history` (continue-listening progress) have a stable per-device uid to write to.
- **Admin CMS** — mounted at `/admin/*` (`src/admin/`), gated by `ProtectedRoute` + `useAuthStore` (`src/admin/store/authStore.js`): Firebase email/password auth, then a Firestore `users/{uid}.role === "ADMIN"` check — if the doc is missing or the role doesn't match, the user is immediately signed back out. Admin login replaces the anonymous session.
- **`src/admin/firebase.js`** just re-exports `src/firebase.js` — the whole app shares one Firebase project/app; don't create a second `initializeApp` call.
- **Data access is Firestore-direct, no REST layer**: `src/admin/api/client.js` wraps CRUD per collection (`episodesApi`, `scholarsApi`, etc.) through small generic helpers (`listAll`, `listPaged`, `createDoc`, `updateDocById`, `removeDoc`, `bulkUpdateDocs`). Admin lists are fetched in full and paginated client-side (Firestore doesn't offset-paginate cheaply). Batched writes are chunked at 400 (Firestore's cap is 500). `src/api/client.js` is the public-app read side (`getBookmarks`/`getHistory`, etc.).
- **State**: Zustand stores per concern — `src/admin/store/authStore.js` (admin session), `src/store/playerStore.js` / `activePlayerStore.js` (podcast audio), `src/store/quranStore.js` (Quran playback), `src/store/bookmarkStore.js`, `src/store/userStore.js`. TanStack Query is used for server-state caching on top of the Firestore calls.
- **Audio playback**: `src/components/AudioEngine.jsx` (podcast) and `src/components/QuranAudioEngine.jsx` are separate engines with their own mini/full player sheets (`MiniPlayer`/`FullPlayerSheet` vs `QuranMiniPlayer`/`QuranFullPlayerSheet`) — don't assume one player handles both content types.
- **PWA / service worker** (`vite-plugin-pwa`, configured in `vite.config.js`): `registerType: 'autoUpdate'`. Runtime caching is deliberately asymmetric — Firebase Storage audio URLs (`.../o/audio%2F...`) are `NetworkOnly` because Workbox's cache strategies don't serve HTTP Range requests correctly (breaks seeking/resume), while other Storage assets (thumbnails/cover art) are `CacheFirst` since re-uploads always write a new path.
- **Firestore collections and their write/read owners** are documented in `DEPLOYMENT.md` §5 — check there before assuming a collection's shape (`episodes` has a `status` state machine: `DRAFT`/`PROCESSING`/`READY`/`PUBLISHED`/`UNPUBLISHED`; `rights` drives a "blocked" state on episodes when `EXPIRED`/`REVOKED`).

## Known gaps (see `DEPLOYMENT.md` for full list)

- Image upload (`src/admin/components/ImageUpload.jsx`) previews locally but isn't wired to Storage yet — only audio upload (`audioApi.upload`) actually writes.
- Topics only supports create + list from the CMS, no edit/delete.
- `backend/` (old NestJS+Prisma API) and `cms/` (old separate Next.js CMS) directories exist on disk but are dead — nothing on `main` calls them. The real legacy backend code lives on the separate `backend` git branch (`git checkout backend` to reference it).
