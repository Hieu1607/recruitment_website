# Docker Setup Guide

## Quick Start

1. **Copy the environment file:**
   ```bash
   cp .env.docker .env
   ```

2. **Build and start containers:**
   ```bash
   docker-compose up -d
   ```

3. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

## Common Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (clean everything)
```bash
docker-compose down -v
```

### View logs
```bash
docker-compose logs -f          # All services
docker-compose logs -f backend  # Backend only
docker-compose logs -f db       # Database only
```

### Execute commands in container
```bash
# Run migrations
docker-compose exec backend npm run migrate

# Run seeders
docker-compose exec backend npm run seed:all

# Access PostgreSQL shell
docker-compose exec db psql -U postgres -d recruitment_db
```

### Rebuild containers
```bash
docker-compose up -d --build
```

## Environment Variables

Edit `.env` file to customize:
- `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database credentials
- `PORT` - Backend server port
- `JWT_SECRET` - JWT secret key (change in production)
- `NODE_ENV` - Environment (development/production)

## Database

- PostgreSQL runs on port `5432`
- Data is persisted in `postgres_data` volume
- Connection string: `postgresql://postgres:password@db:5432/recruitment_db`

## Backend

- Express server runs on port `5000`
- API available at `http://localhost:5000/api/v1`
- Code is hot-reloaded (volumes mounted)
- Logs accessible via `docker-compose logs`

## Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env file or
docker-compose down  # stop existing containers
```

**Database connection error:**
```bash
# Wait for DB to be ready and restart backend
docker-compose restart backend
```

**Clean rebuild:**
```bash
docker-compose down -v
docker-compose up -d --build
```
