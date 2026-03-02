# Database Configuration for Docker Deploy

This guide extends the Docker deploy when the analysis report indicates that the project uses a database. It is used in combination with `docker.md`.

## Overview

When the `database` field of the analysis report is not `null`, this file guides the generation of:

1. Database service in `docker-compose.yml`
2. Environment variables for database connection
3. `start.sh` script with migration commands
4. Database password

## Step 1: Database Password Generation

Generate a secure password for the database:

```bash
DB_PASSWORD=$(openssl rand -hex 24)
```

This password:
- Is saved ONLY in the `.env.production` file
- Is NEVER shown to the user
- Is NEVER committed to the repository

If the database also requires a root password (e.g., MySQL), generate a separate one:

```bash
DB_ROOT_PASSWORD=$(openssl rand -hex 24)
```

## Step 2: .env File Generation for Docker Compose

Docker Compose interpolates `${...}` variables present in `docker-compose.yml` from the `.env` file in the project root (NOT from `env_file`, which is only available inside the container). Since the `db` service uses `${DB_PASSWORD}`, `${PROJECT_NAME}` (and `${DB_ROOT_PASSWORD}` for MySQL) in the `environment` section, these values must be present in the `.env` file.

Create a `.env` file in the project root containing:

```
DB_PASSWORD={generated_password}
PROJECT_NAME={project_name}
```

For MySQL, also add:
```
DB_ROOT_PASSWORD={generated_root_password}
```

**IMPORTANT**: this `.env` file is separate from `.env.production`. The `.env` file is ONLY used for variable interpolation in `docker-compose.yml` by Docker Compose. The `.env.production` file is passed to containers via `env_file` and contains all the application's environment variables.

Add `.env` to `.gitignore` (if not already present) — it contains passwords and must NOT be committed:

```bash
grep -q '^\.env$' .gitignore || echo '.env' >> .gitignore
```

**Note**: the `.env` file is passed to the webhook along with `.env.production` as base64. When sending to the webhook (Step 8 of `docker.md`), encode BOTH files:

```bash
ENV_B64=$(base64 < .env.production | tr -d '\n')
COMPOSE_ENV_B64=$(base64 < .env | tr -d '\n')
```

And add `"compose_env"` to the webhook payload:
```json
"compose_env": "{base64_encoded_compose_env_file}"
```

## Step 3: docker-compose.yml Generation

Generate the complete `docker-compose.yml`, including the application service AND the database service(s).

For each database in the analysis report's `database` array, read and follow the corresponding file:

| Engine   | File                    |
|----------|-------------------------|
| postgres | `databases/postgres.md` |
| mysql    | `databases/mysql.md`    |
| mongodb  | `databases/mongodb.md`  |
| redis    | `databases/redis.md`    |
| sqlite   | `databases/sqlite.md`   |

If the database has multiple entries (e.g., postgres + redis), read and follow EACH corresponding file. Merge all services into a single `docker-compose.yml`.

### Unknown Database Engine

If the engine is NOT in the table above:
1. Read one existing file as reference (e.g., `databases/postgres.md`) to understand the pattern
2. Generate a working docker-compose service with healthcheck, volume, resource limits, and log rotation
3. Complete the deploy normally
4. The contribute module (called after deploy) will detect this gap and offer to create a new dedicated file

### Important Notes for All Database Services

- **Resource limits**: every database service MUST have `memory: 512M` and `cpus: '0.5'` to prevent consuming too many server resources.
- **Log rotation**: every service MUST have log rotation configured (`max-size: "10m"`, `max-file: "3"`) to prevent uncontrolled log growth.
- **Healthcheck**: every database service MUST have a healthcheck configured. The app MUST use `depends_on` with `condition: service_healthy` to wait for the database to be ready before starting.
- **Persistent volumes**: database data is stored in Docker volumes to persist across container restarts.

### Port Adaptation

The app's internal port in `docker-compose.yml` must match the `EXPOSE` port in the Dockerfile:
- Next.js, Nuxt, SvelteKit, Astro: `3000`
- Express/Node.js: the port detected in the code (default `3000`)
- FastAPI, Django: `8000`

Replace `3000` in the examples with the correct port.

## Step 4: start.sh Generation

Generate a `start.sh` script that handles database migrations before starting the application.

### Base Template

```bash
#!/bin/sh
set -e

echo "Waiting for database..."
# Docker Compose healthcheck handles the waiting,
# but we add a brief safety delay
sleep 2

echo "Running migrations..."
# {migration command based on the ORM}

echo "Starting application..."
exec {start_command}
```

**IMPORTANT**: use `exec` before the start command to replace the shell process with the application process. This ensures Docker signals (SIGTERM, etc.) are forwarded correctly.

### Migration Commands by ORM

#### Prisma

If the project uses Prisma (presence of `prisma/schema.prisma` or `@prisma/client` in dependencies):

- **With existing `prisma/migrations/` folder** (migrations already created):
  ```bash
  npx prisma migrate deploy
  ```

- **Without `prisma/migrations/` folder** (first deploy or development without migrations):
  ```bash
  npx prisma db push --skip-generate
  ```

- **With seed** (if `prisma/seed.ts` or `prisma/seed.js` exists and the seed is idempotent):
  ```bash
  npx prisma db seed
  ```
  **Note**: run the seed ONLY if the seed file is idempotent (uses `upsert` or `createMany` with `skipDuplicates`). When in doubt, ask the user.

#### Drizzle

If the project uses Drizzle ORM (presence of `drizzle.config.ts` or `drizzle-orm` in dependencies):

- **With `drizzle/` folder containing SQL migration files**:
  ```bash
  npx drizzle-kit migrate
  ```

- **Without generated migrations**:
  ```bash
  npx drizzle-kit push
  ```

#### Knex

If the project uses Knex (presence of `knexfile.js` or `knex` in dependencies):

```bash
npx knex migrate:latest
```

To run seeds (if present in the `seeds/` folder):
```bash
npx knex seed:run
```

#### TypeORM

If the project uses TypeORM (presence of `data-source.ts` or `data-source.js` or `typeorm` in dependencies):

**IMPORTANT**: in production (inside the Docker container), `ts-node` is not installed (it's a devDependency). If the project uses TypeScript, the `data-source.ts` file is compiled to `dist/data-source.js` during the build. Use the compiled JS file:

- **TypeScript project** (has `tsconfig.json` and build step):
  ```bash
  npx typeorm migration:run -d dist/data-source.js
  ```

- **JavaScript project** (no build step):
  ```bash
  npx typeorm migration:run -d data-source.js
  ```

#### Sequelize

If the project uses Sequelize (presence of `.sequelizerc` or `sequelize` in dependencies):

```bash
npx sequelize-cli db:migrate
```

To run seeds (if present):
```bash
npx sequelize-cli db:seed:all
```

#### Django (Python)

```bash
python manage.py migrate
```

To run seeds/fixtures (if present):
```bash
python manage.py loaddata {fixture_file}
```

#### SQLAlchemy / Alembic (Python)

If the project uses Alembic (presence of `alembic.ini` or `alembic/` folder):

```bash
alembic upgrade head
```

### Dockerfile Update

After generating `start.sh`, update the Dockerfile:

1. Add the copy of `start.sh`:
   ```dockerfile
   COPY start.sh .
   RUN chmod +x start.sh
   ```

2. Replace the original `CMD`:
   ```dockerfile
   CMD ["./start.sh"]
   ```

## Flow Summary

1. Generate password with `openssl rand -hex 24`
2. Create `.env` file for Docker Compose interpolation (with `DB_PASSWORD`, `PROJECT_NAME`, etc.)
3. Read the per-database file(s) from `databases/` and generate `docker-compose.yml` with app service + database service(s)
4. Generate `start.sh` with appropriate migration commands for the detected ORM
5. Add database environment variables to `.env.production` (as specified in the per-database file)
6. Update Dockerfile to use `start.sh`
7. Continue with Step 7 of `docker.md` (Git init and push)
