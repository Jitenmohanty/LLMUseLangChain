# Express AI Research (TypeScript + Drizzle + BullMQ)

## Setup
1. Copy `.env.example` → `.env` and fill keys.
2. Start infra (local): `docker-compose up -d` (Postgres + Redis)
3. Install deps: `npm install`
4. Run Drizzle migrations:
   - `npm run migrate:generate` (optional)
   - `npm run migrate:push`
5. Start the API: `npm run dev`
6. Start workers in another terminal: `npm run workers`
7. Optionally run bull-board: `npm run monitor`

## Notes
- Workers should be run separately.
- API endpoints:
  - `POST /auth/register` { email, username, password }
  - `POST /auth/login` { email, password }
  - `POST /api/reports` (auth) { query, forceRefresh }
  - `GET /api/reports` (auth)
  - `GET /api/reports/:id/pdf` (auth) - downloads PDF
