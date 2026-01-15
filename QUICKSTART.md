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
- API port: `   `

## Stop
```bash
docker compose down
```


One-time setup
# From repo root
npm install

# Manually add required libs (if not in package.json)
npm install react-router-dom react-icons groq-sdk
# Note: Grok chatbot integration usually requires an API client (e.g., axios or specific SDK)
npm install axios

This ensures react-router-dom (routing), react-icons (UI icons), and necessary packages for the Grok chatbot are ready.

Run application
Bash

# From repo root
npm start