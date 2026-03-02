# Redis Configuration

Docker Compose service and environment variables for Redis.

Redis is typically added as an additional service alongside a primary database,
but can also be used standalone.

## Docker Compose Service

```yaml
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
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

Note: the service name is `redis`, not `db`. This allows Redis to coexist
alongside a primary database service named `db`.

Add to volumes section:
```yaml
volumes:
  redis_data:
```

If Redis is used alongside another database, merge the volumes:
```yaml
volumes:
  db_data:
  redis_data:
```

Add `redis` to app service `depends_on`:
```yaml
    depends_on:
      redis:
        condition: service_healthy
```

If used alongside another database:
```yaml
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
```

## Environment Variables

Add to `.env.production`:
```
REDIS_URL=redis://redis:6379
```

No entry needed in `.env` (Docker Compose interpolation) — Redis has no passwords
in this default configuration.

## Connection String Format

```
redis://redis:6379
```

Where `redis` is the Docker service name (internal DNS).
