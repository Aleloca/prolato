# PostgreSQL Configuration

Docker Compose service and environment variables for PostgreSQL.

## Docker Compose Service

```yaml
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - db_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${PROJECT_NAME}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 3s
      retries: 10
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
```

Add to volumes section:
```yaml
volumes:
  db_data:
```

Add to app service `depends_on`:
```yaml
    depends_on:
      db:
        condition: service_healthy
```

## Environment Variables

Add to `.env.production`:
```
DATABASE_URL=postgresql://app:{generated_password}@db:5432/{project_name}
```

Add to `.env` (for Docker Compose interpolation):
```
DB_PASSWORD={generated_password}
PROJECT_NAME={project_name}
```

## Connection String Format

```
postgresql://app:{password}@db:5432/{database_name}
```

Where `db` is the Docker service name (internal DNS), port `5432` is PostgreSQL default.
