# MongoDB Configuration

Docker Compose service and environment variables for MongoDB.

## Docker Compose Service

```yaml
  db:
    image: mongo:7
    restart: unless-stopped
    volumes:
      - db_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: app
      MONGO_INITDB_ROOT_PASSWORD: ${DB_PASSWORD}
      MONGO_INITDB_DATABASE: ${PROJECT_NAME}
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
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
MONGODB_URI=mongodb://app:{generated_password}@db:27017/{project_name}?authSource=admin
```

Add to `.env` (for Docker Compose interpolation):
```
DB_PASSWORD={generated_password}
PROJECT_NAME={project_name}
```

## Connection String Format

```
mongodb://app:{password}@db:27017/{database_name}?authSource=admin
```

Note: `authSource=admin` is required because the root user is created in the `admin` database.
