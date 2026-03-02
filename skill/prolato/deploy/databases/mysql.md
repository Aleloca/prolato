# MySQL Configuration

Docker Compose service and environment variables for MySQL.

## Docker Compose Service

```yaml
  db:
    image: mysql:8-oracle
    restart: unless-stopped
    volumes:
      - db_data:/var/lib/mysql
    environment:
      MYSQL_USER: app
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${PROJECT_NAME}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
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

MySQL requires a root password in addition to the app user password:
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
