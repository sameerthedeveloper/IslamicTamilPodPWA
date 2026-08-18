# Deployment Guide

Tamil Islamic Podcast — one deployable app plus a legacy, no-longer-used API.

| Piece | Repo path | Runs where |
|---|---|---|
| App (public listener PWA + `/admin` CMS) | repo root (`src/`) | Vercel |
| Firebase project (Auth, Firestore, Storage) | n/a — hosted by Firebase | Google Cloud |
| ~~API~~ (legacy, unused) | `backend/` | Not deployed — kept in the repo but neither the app nor the CMS calls it anymore |

The app used to be two separate Vite projects (`frontend/` and `cms/`) talking to a custom Node API in `backend/`. It's now a single Vite project at the repo root: the public site lives at `/`, `/library`, `/browse`, `/quran`, and the admin CMS lives at `/admin/*` (`src/admin/`), gated by Firebase Auth + a Firestore role check. Both talk to Firebase directly — there is no backend server to deploy.

---

## 1. Local development

```bash
cp .env.example .env   # fill in the VITE_FIREBASE_* values below
npm install
npm run dev             # http://localhost:5173
```

- Public app: `http://localhost:5173/`
- Admin CMS: `http://localhost:5173/admin/login`

No Docker, database, or worker needed — Firestore/Storage/Auth are Google-hosted.

---

## 2. App → Vercel

One Vercel project, pointed at the repo root:

- Root directory: repo root (leave blank/default)
- Framework preset: Vite
- Build command: `npm run build` — Output: `dist`
- `vercel.json` at the repo root already adds the SPA rewrite (`/*` → `/index.html`) that client-side routing (`react-router-dom`) needs for direct loads/refreshes of `/admin/episodes` etc.

**Environment variables** (Project Settings → Environment Variables — set for Production, Preview, and Development):

| Var | Where to find it |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project settings → General → Your apps → Web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | same |
| `VITE_FIREBASE_PROJECT_ID` | same |
| `VITE_FIREBASE_STORAGE_BUCKET` | same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same |
| `VITE_FIREBASE_APP_ID` | same |
| `VITE_FIREBASE_MEASUREMENT_ID` | same (Analytics — optional) |

These are Firebase's public client-side web config values, not secrets — access control is enforced by Firestore/Storage security rules, not by hiding this config. See `.env.example` for the full list.

Since `/admin` only gates by Firebase Auth + a Firestore role check (no network-level restriction), consider also putting Vercel's password protection in front of the whole deployment, or restricting who you hand out ADMIN Firestore roles to.

---

## 3. Firebase project setup

1. **Auth**: Firebase Console → Authentication → enable **Email/Password** sign-in. Create your admin user(s) there (Authentication → Users → Add user).
2. **Firestore**: Firebase Console → Firestore Database → create the database (production mode).
3. **Storage**: Firebase Console → Storage → create the default bucket.
4. **Security rules**: paste `firestore.rules` into Firestore → Rules, and `storage.rules` into Storage → Rules (Publish both). Or, from a machine that can run `firebase login` (this sandbox's outbound proxy blocks Firebase's CLI auth endpoint, so it has to be done from your own machine):
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```
5. **Admin role**: for each admin user, create a Firestore doc at `users/{uid}` (UID from step 1) with `{ name, email, role: "ADMIN" }`. Without this doc, `/admin` login succeeds against Firebase Auth but is immediately signed back out — see `src/admin/store/authStore.js`.
6. **Composite index**: the app's published-episodes query (`status == 'PUBLISHED'` + order by `createdAt`) needs the composite index defined in `firestore.indexes.json`. Deploying indexes via the CLI creates it, or Firestore will show a one-click "create index" link in the browser console the first time that query runs without it.

---

## 4. Data model (Firestore collections)

| Collection | Written by | Notes |
|---|---|---|
| `episodes` | Admin CMS (`/admin/episodes`, `/admin/audio`) | `status` field (`DRAFT`/`PROCESSING`/`READY`/`PUBLISHED`/`UNPUBLISHED`); `audioUrl`/`audioPath` set by Storage upload |
| `scholars`, `series`, `topics` | Admin CMS | Public read |
| `rights` | Admin CMS | Admin-only, drives the "blocked" state on Episodes when EXPIRED/REVOKED |
| `featured` | Admin CMS | Ordered by `position` |
| `settings` | Admin CMS (singleton doc `settings/app`) | |
| `users/{uid}` | Manual (Firebase Console) for admins; self-created (non-admin) on first sign-in elsewhere if you add that flow | `role` field gates `/admin` |
| `users/{uid}/bookmarks`, `users/{uid}/history` | Not yet written by any UI | Read by `src/api/client.js`'s `getBookmarks`/`getHistory`; the public app has no sign-in flow yet, so these stay empty until one's added |

Audio files live in Storage under `audio/{episodeId}/...`; images (not yet wired up end-to-end — see Known gaps) under `images/**`.

---

## 5. Rollback

- **App (Vercel):** every deploy is a preserved, immutable deployment — promote a previous one to production from the Vercel dashboard's Deployments tab, or `vercel rollback`.
- **Firestore data:** no automatic versioning — if you need point-in-time recovery, enable scheduled Firestore backups (Firebase Console → Firestore → Backups) before you need them.
- **Firestore/Storage rules:** re-publish an earlier version of `firestore.rules`/`storage.rules` from git history; the Firebase Console also keeps a rules version history under Rules → History.

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `/admin` login succeeds then immediately bounces to `/admin/login` | No `users/{uid}` Firestore doc, or `role` isn't exactly `"ADMIN"` | Create/fix the doc — see §3 step 5 |
| Reading/writing any collection throws `permission-denied` | Firestore rules not published yet, or the signed-in user doesn't satisfy them | Publish `firestore.rules`; check the specific collection's rule in that file |
| Refreshing `/admin/episodes` (or any non-root path) on Vercel 404s | SPA rewrite missing | Confirm `vercel.json`'s rewrite is present and the Vercel project is using the repo root, not a subdirectory |
| Query throws "The query requires an index" | Missing the composite index from `firestore.indexes.json` | Click the link in the error, or deploy indexes via the CLI |
| Episode publish blocked unexpectedly | Rights record for that scholar is `EXPIRED`/`REVOKED` | Working as intended — update/add a `Rights` record for the scholar via `/admin/rights` |
| Audio upload finishes but episode never shows a working `audioUrl` | Storage rules blocking the write, or the upload never completed | Check the browser console for a Storage `permission-denied`; confirm `storage.rules` is published and the signed-in user has `role: "ADMIN"` |

---

## Known gaps (not hidden, just not built yet)

- The public app (`/`, `/library`, `/browse`, `/quran`) has no sign-in UI — `getBookmarks`/`getHistory` only return data once *some* Firebase Auth session exists, which currently nothing in the public app creates.
- Image upload (`src/admin/components/ImageUpload.jsx`) previews locally but isn't wired to actually upload to Storage yet — only audio files (`src/admin/api/client.js`'s `audioApi.upload`) are.
- Topics only supports create + list from the CMS — no edit/delete UI or backend call for it yet.
- `backend/` (the old Node/Prisma API) still exists in the repo and is still covered by CI, but nothing calls it anymore. Safe to ignore, or remove in a follow-up if you're sure nothing external depends on it.
