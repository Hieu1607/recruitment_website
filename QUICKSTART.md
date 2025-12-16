# Quickstart

## Prerequisites
- Docker and Docker Compose installed
- Ports: `5432` (Postgres) and `5000` (backend) available

## One-time setup
```bash
# From repo root
cp .env.example .env   # nếu có sẵn; nếu chưa, tạo .env với DB_USER/DB_PASSWORD/DB_NAME/DB_PORT
```
Ensure `.env` matches the values expected in `docker-compose.yml` (defaults: postgres/postgres/recruitment_db/5432).

## Run services
```bash
# From repo root
docker compose up -d
```
This starts Postgres and the backend. Backend uses `DB_HOST=db` inside the compose network.

## Seed database (inside backend container)
```bash
# From repo root
docker compose exec backend npx sequelize-cli db:migrate
docker compose exec backend npx sequelize-cli db:seed:all
```
`jobs.json` and `companies.json` are already generated and will be loaded by the seeders.

## Verify
- Backend logs: `docker compose logs backend --tail=100`
- API port: `http://localhost:5000`

## Stop
```bash
docker compose down
```
Add `-v` if you want to drop the Postgres volume: `docker compose down -v`.
