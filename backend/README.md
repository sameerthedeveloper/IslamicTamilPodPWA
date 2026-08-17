# Tamil Islamic Audio Platform - Backend

NestJS backend API for Islamic audio content platform.

## Tech Stack

- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Redis + BullMQ
- **Storage:** MinIO (dev) / S3 (prod)
- **Auth:** JWT
- **API Docs:** Swagger/OpenAPI

## Project Structure

```
src/
├── prisma/
│   └── prisma.service.ts
├── common/
│   ├── dtos/
│   ├── filters/
│   ├── guards/
│   └── interceptors/
├── modules/
│   ├── episodes/
│   ├── scholars/
│   ├── topics/
│   ├── series/
│   ├── audio/
│   ├── auth/
│   ├── user/
│   └── search/
├── app.module.ts
└── main.ts
```

## Setup

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+

### Local Development

```bash
# Install dependencies
npm install

# Setup .env
cp .env.example .env

# Start services (Docker)
docker-compose up -d

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run seed

# Start dev server
npm run dev
```

### Database Migrations

```bash
# Create migration
npm run db:migrate -- --name <migration-name>

# Push schema
npm run db:push

# Prisma Studio
npm run db:studio
```

## API Routes

All routes prefixed with `/api/v1/`

### Episodes
- `GET /episodes` - List episodes (paginated)
- `GET /episodes/:id` - Get episode detail
- `POST /admin/episodes` - Create episode (admin)
- `PATCH /admin/episodes/:id` - Update episode (admin)
- `DELETE /admin/episodes/:id` - Delete episode (admin)

### Scholars
- `GET /scholars` - List scholars
- `GET /scholars/:slug` - Get scholar detail
- `POST /admin/scholars` - Create scholar (admin)
- `PATCH /admin/scholars/:id` - Update scholar (admin)

### Topics
- `GET /topics` - List topics
- `POST /admin/topics` - Create topic (admin)

### Series
- `GET /series` - List series
- `GET /series/:slug` - Get series detail
- `POST /admin/series` - Create series (admin)

### Auth
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout user
- `GET /me` - Current user

### User
- `GET /me/history` - Listening history
- `GET /me/bookmarks` - Bookmarked episodes
- `POST /me/bookmarks/:episodeId` - Add bookmark
- `DELETE /me/bookmarks/:episodeId` - Remove bookmark
- `GET /me/listening` - Listening progress
- `PATCH /me/listening/:episodeId` - Update progress

### Search
- `GET /search?q=...&type=episode|scholar|topic` - Global search

### Home
- `GET /home` - Homepage data (featured sections)

## Docs

Swagger API docs available at `http://localhost:3000/docs`

## Environment Variables

See `.env.example`

## Testing

```bash
npm run test
npm run test:watch
npm run test:cov
```

## Deployment

- Backend: AWS ECS / DigitalOcean App Platform
- Database: AWS RDS PostgreSQL
- Cache: AWS ElastiCache Redis
- Storage: AWS S3 / Cloudflare R2

## License

MIT
