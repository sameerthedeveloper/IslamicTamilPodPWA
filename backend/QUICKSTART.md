# Backend Quick Start

Built: NestJS + PostgreSQL + Redis + MinIO + JWT

## 1. Install & Setup

```bash
cd backend

# Install dependencies
npm install

# Copy .env
cp .env.example .env  # Already configured for Docker
```

## 2. Start Services

```bash
# Start all services (PostgreSQL + Redis + MinIO + API)
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f api
```

## 3. Initialize Database

```bash
# Run Prisma migrations
npm run db:migrate

# Seed sample data (scholars, topics, episodes)
npm run seed

# View database (Prisma Studio)
npm run db:studio
```

## 4. Run Dev Server

```bash
# Start NestJS in watch mode
npm run dev

# Visit API docs: http://localhost:3000/docs
```

## 5. Test API

### Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { "id": 1, "email": "john@example.com", "name": "John", "role": "USER" }
}
```

### Get Episodes

```bash
curl http://localhost:3000/api/v1/episodes?page=1&limit=20
```

### Add Bookmark (requires JWT)

```bash
curl -X POST http://localhost:3000/api/v1/me/bookmarks/1 \
  -H "Authorization: Bearer <access_token>"
```

### Search

```bash
curl "http://localhost:3000/api/v1/search?q=tawheed&type=episode"
```

### Admin: Create Scholar (requires JWT + ADMIN role)

```bash
# Use admin@example.com / password123 (from seed)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'

# Use returned accessToken to create scholar
curl -X POST http://localhost:3000/api/v1/scholars/admin \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sheikh Ibrahim",
    "biography": "Islamic scholar",
    "image": "url_to_image"
  }'
```

## 6. Database Access

### Prisma Studio (GUI)
```bash
npm run db:studio
# Opens http://localhost:5555
```

### Direct PostgreSQL
```bash
# Inside docker
docker exec -it tamil_audio_db psql -U app -d tamil_audio

# Or with local psql
psql -h localhost -U app -d tamil_audio
# Password: apppass
```

### MinIO Console (Object Storage)
```
http://localhost:9001
Username: minioadmin
Password: minioadmin
```

### Redis CLI
```bash
docker exec -it tamil_audio_redis redis-cli
```

## 7. Seeded Data

**Admin User**
- Email: admin@example.com
- Password: password123
- Role: ADMIN

**Sample Scholars**
- Ruwaid Ibn Najim
- Abdul Hameed Ash Shammari

**Sample Topics**
- Tawheed
- Fiqh
- Hadith

**Sample Series & Episodes**
- Tawheed Series (5 episodes)

## 8. Common Commands

```bash
# Development
npm run dev              # Start in watch mode
npm run build            # TypeScript build
npm start               # Run built app

# Database
npm run db:push         # Sync schema (dev only)
npm run db:migrate      # Create migration + apply
npm run db:studio       # Prisma Studio GUI
npm run seed            # Seed initial data

# Code quality
npm run lint            # ESLint check
npm run lint --fix      # Auto-fix linting issues
npm run format          # Prettier format

# Testing
npm run test            # Jest unit tests
npm run test:watch      # Watch mode
npm run test:cov        # Coverage report
```

## 9. Troubleshooting

**Port already in use**
```bash
# Change in docker-compose.yml or .env
# Default: 3000 (API), 5432 (DB), 6379 (Redis), 9000/9001 (MinIO)
```

**Database connection failed**
```bash
# Check if postgres is running
docker-compose logs postgres

# Restart services
docker-compose restart postgres
```

**Seeding fails**
```bash
# Make sure DB is migrated first
npm run db:push
npm run seed
```

**Modules not found (imports)**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

## 10. Next Steps

**Phase 1:** Test Episodes endpoints (CRUD + frontend integration)
**Phase 2:** Integrate auth with React frontend (JWT storage + refresh)
**Phase 3:** Build admin CMS dashboard (React)
**Phase 4:** Audio pipeline (MinIO + FFmpeg + BullMQ)
**Phase 5:** Full-text search indexing
**Phase 6:** Recommendation engine

## 11. API Documentation

Live Swagger docs at: `http://localhost:3000/docs`

Export OpenAPI spec:
```bash
curl http://localhost:3000/docs-json > openapi.json
```

---

**Status:** Backend Phase 0 ✅ Complete
**Next:** Deploy to staging for Phase 1 integration testing
