# Backend Architecture

## Phase 0: Complete ✅

Backend infrastructure setup complete. Ready for Phase 1 (Episodes integration).

### What's Built

```
backend/
├── prisma/
│   ├── schema.prisma          (Database models + relations)
│   └── seed.ts                (Initial data seeding)
├── src/
│   ├── main.ts                (Entry point + Swagger setup)
│   ├── app.module.ts          (Root module with all imports)
│   ├── prisma/
│   │   └── prisma.service.ts  (Database connection pooling)
│   ├── common/
│   │   ├── dtos/              (API response schemas)
│   │   ├── filters/           (HTTP exception handling)
│   │   ├── guards/            (JWT + Admin auth)
│   │   ├── decorators/        (CurrentUser decorator)
│   │   └── utils/             (slugify, hash functions)
│   └── modules/
│       ├── episodes/
│       │   ├── dtos/
│       │   ├── episodes.service.ts
│       │   ├── episodes.controller.ts
│       │   └── episodes.module.ts
│       ├── scholars/
│       ├── topics/
│       ├── series/
│       ├── auth/              (JWT + Register/Login)
│       ├── user/              (Bookmarks, History, Progress)
│       ├── search/            (Full-text search)
│       └── home/              (Homepage data aggregation)
├── docker-compose.yml         (PostgreSQL, Redis, MinIO, API)
├── Dockerfile
├── package.json               (NestJS + dependencies)
├── tsconfig.json
└── .env                       (Local development)
```

### Database Models

- **User** - Authentication + roles (USER|ADMIN)
- **Scholar** - Islamic teachers/speakers
- **Topic** - Content categories (Tawheed, Fiqh, Hadith, etc)
- **Series** - Collections of episodes
- **Episode** - Audio content with metadata
- **EpisodeTopic** - Many-to-many episode/topic mapping
- **AudioAsset** - Storage references (MinIO/S3)
- **ListeningHistory** - User activity tracking
- **ListeningProgress** - Resume playback state
- **Bookmark** - User favorites
- **Featured** - Homepage featured content
- **SystemSettings** - App configuration

### API Routes (v1)

All routes prefixed `/api/v1/`

**Episodes** (CRUD)
- `GET /episodes` - List (paginated)
- `GET /episodes/:id` - Detail
- `POST /admin/episodes` - Create (admin)
- `PATCH /admin/episodes/:id` - Update (admin)
- `DELETE /admin/episodes/:id` - Delete (admin)

**Scholars** (CRUD)
- `GET /scholars` - List
- `GET /scholars/:slug` - Detail
- `POST /admin/scholars` - Create (admin)

**Topics**
- `GET /topics` - List
- `POST /admin/topics` - Create (admin)

**Series**
- `GET /series` - List (paginated)
- `GET /series/:slug` - Detail
- `POST /admin/series` - Create (admin)

**Auth**
- `POST /auth/register` - User signup
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT
- `GET /auth/me` - Current user (requires JWT)

**User** (Authenticated)
- `GET /me/history` - Listening history
- `GET /me/bookmarks` - Saved episodes
- `POST /me/bookmarks/:episodeId` - Add bookmark
- `DELETE /me/bookmarks/:episodeId` - Remove bookmark
- `GET /me/listening` - Playback progress
- `PATCH /me/listening/:episodeId` - Update progress (sync)

**Search**
- `GET /search?q=...&type=episode|scholar|topic` - Global search

**Home**
- `GET /home` - Featured sections + recent episodes + continue listening

### Services

| Module | Purpose |
|--------|---------|
| **PrismaService** | DB connection pooling, ORM |
| **EpisodesService** | Episode CRUD + search queries |
| **ScholarsService** | Scholar management |
| **TopicsService** | Topic taxonomy |
| **SeriesService** | Series collections |
| **AuthService** | JWT generation, login/register |
| **UserService** | User data (bookmarks, history, progress) |
| **SearchService** | Full-text search across models |
| **HomeService** | Homepage data aggregation |

### Auth Strategy

1. **JWT** - Bearer token in `Authorization` header
2. **Passport** - Strategy-based auth (JWT + future OAuth)
3. **Guards** - JwtAuthGuard, AdminGuard for routes
4. **Passwords** - bcryptjs hashing (10 rounds)
5. **Tokens** - 15m access, 7d refresh (configurable)

### Database Features

- **Indexes** - On frequently queried fields (email, slug, status, dates)
- **Soft deletes** - Via status field (not hard delete)
- **Cascades** - Foreign key cascades (e.g., delete scholar = delete episodes)
- **Unique constraints** - slug, email, userId+episodeId pairs
- **Timestamps** - createdAt, updatedAt on all models

## Next Steps: Phase 1

### Immediate (Today)

```bash
# Install dependencies
npm install

# Start Docker services
docker-compose up -d

# Run migrations
npm run db:migrate

# Seed database
npm run seed

# Start dev server
npm run dev
```

### Endpoints to Test

1. **Register/Login**
   ```bash
   POST /api/v1/auth/register
   { "name": "User", "email": "user@example.com", "password": "password123" }
   
   POST /api/v1/auth/login
   { "email": "user@example.com", "password": "password123" }
   ```

2. **Get Episodes**
   ```bash
   GET /api/v1/episodes?page=1&limit=20
   GET /api/v1/episodes/1
   ```

3. **Search**
   ```bash
   GET /api/v1/search?q=tawheed&type=episode
   ```

4. **Home**
   ```bash
   GET /api/v1/home
   ```

5. **Add Bookmark** (requires JWT)
   ```bash
   POST /api/v1/me/bookmarks/1
   Authorization: Bearer <token>
   ```

### Swagger Docs

Available at `http://localhost:3000/docs` after server starts.

## Phase 2-7 Roadmap

**Phase 2:** User auth integration + JWT in frontend
**Phase 3:** Admin CMS dashboard (React)
**Phase 4:** Audio storage pipeline (MinIO + BullMQ + FFmpeg)
**Phase 5:** Full-text search + filters
**Phase 6:** Recommendations engine
**Phase 7:** Production hardening + deployment

## Development Commands

```bash
# Run
npm run dev

# Build
npm run build
npm start

# Database
npm run db:migrate
npm run db:push
npm run db:studio
npm run seed

# Lint/Format
npm run lint
npm run format

# Test
npm run test
npm run test:watch
npm run test:cov
```

## Environment

See `.env.example` for all configurable vars.

Key settings:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis cache + BullMQ
- `MINIO_*` - Object storage
- `JWT_SECRET` - Min 32 chars for production
- `NODE_ENV` - development|test|production

## Notes

- Admin endpoints require `role === 'ADMIN'` (checked via AdminGuard)
- All episode data is filtered by `status === 'PUBLISHED'` for public API
- Search is case-insensitive full-text
- Listening progress auto-marks episode as "completed" at 90% listened
- Database uses connection pooling via Prisma (pooled connections in production)
