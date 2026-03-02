# SQLite Configuration

Volume configuration for SQLite in Docker. SQLite does NOT require
a separate database service — it runs embedded in the application.

## Docker Compose Configuration

Do NOT add a database service. Instead, add a volume to the app service
to persist the SQLite file across container restarts:

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "${APP_PORT:-3000}:3000"
    env_file:
      - .env.production
    volumes:
      - sqlite_data:/app/data
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  sqlite_data:
```

Make sure the SQLite file path in the code points to `/app/data/`
(or the mounted folder).

## Environment Variables

Add to `.env.production`:
```
DATABASE_URL=file:/app/data/{project_name}.db
```

No entry needed in `.env` (Docker Compose interpolation) — no separate
database service.

## Notes

- No `depends_on` needed — SQLite is not a separate service
- No healthcheck needed — the file is always available
- Migrations work normally (Prisma, Drizzle, etc.) — no need to wait
  for the database
- The `sleep 2` in `start.sh` can be removed for SQLite-only projects
