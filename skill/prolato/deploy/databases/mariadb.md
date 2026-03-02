# MariaDB Configuration

Docker Compose service and environment variables for MariaDB.

## Docker Compose Service

```yaml
  db:
    image: mariadb:11
    restart: unless-stopped
    volumes:
      - db_data:/var/lib/mysql
    environment:
      MARIADB_USER: app
      MARIADB_PASSWORD: ${DB_PASSWORD}
      MARIADB_DATABASE: ${PROJECT_NAME}
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
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

## Additional Password

MariaDB requires a root password in addition to the app user password:
```bash
DB_ROOT_PASSWORD=$(openssl rand -hex 24)
```

## Environment Variables

Add to `.env.production`:
```
DATABASE_URL=mysql://app:{generated_password}@db:3306/{project_name}
```

Add to `.env` (for Docker Compose interpolation):
```
DB_PASSWORD={generated_password}
DB_ROOT_PASSWORD={generated_root_password}
PROJECT_NAME={project_name}
```

## Connection String Format

```
mysql://app:{password}@db:3306/{database_name}
```

Note: MariaDB is MySQL-compatible. The connection string uses the `mysql://` protocol.
Applications using MySQL drivers (mysql2, Prisma with mysql provider, etc.) work
with MariaDB without changes.
