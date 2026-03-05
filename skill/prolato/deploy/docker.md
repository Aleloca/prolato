# Docker Deploy

This guide covers the deployment of projects that need a server (SSR, backend, API). The project is containerized with Docker and deployed via the webhook.

## Prerequisites

Read `~/.deploy-config.json` to get the following variables:

- `{GITEA_URL}` → field `gitea_url`
- `{USER_TOKEN}` → field `gitea_token`
- `{DOMAIN}` → field `domain`
- `{WEBHOOK_URL}` → field `webhook_url`
- `{DEPLOY_TOKEN}` → field `deploy_token`
- `{username}` → field `gitea_username`

## Step 1: Project Name

Read and follow `project-name.md` for name selection, validation, and availability check.

## Step 2: Dockerfile Generation

If the project does NOT already have a `Dockerfile`, generate one based on the framework detected by the analysis. Read and follow the corresponding file:

| Framework          | File                        |
|--------------------|-----------------------------|
| Next.js (SSR)      | `dockerfiles/nextjs.md`     |
| Express / Node.js  | `dockerfiles/express.md`    |
| FastAPI (Python)   | `dockerfiles/fastapi.md`    |
| Django (Python)    | `dockerfiles/django.md`     |
| Nuxt.js (SSR)      | `dockerfiles/nuxt.md`       |
| SvelteKit          | `dockerfiles/sveltekit.md`  |
| Astro (SSR)        | `dockerfiles/astro.md`      |
| Flask (Python)     | `dockerfiles/flask.md`      |
| Remix              | `dockerfiles/remix.md`      |
| Go                 | `dockerfiles/go.md`         |
| NestJS             | `dockerfiles/nestjs.md`     |

### Unknown Framework

If the framework is NOT in the table above:
1. Read one existing file as reference (e.g., `dockerfiles/express.md`) to understand the pattern
2. Generate an appropriate Dockerfile following the same conventions (multi-stage build if applicable, resource-efficient, production-ready)
3. Complete the deploy normally
4. The contribute module (called after deploy) will detect this gap and offer to create a new dedicated file

### If the Dockerfile Already Exists

If the project already has a `Dockerfile`, do NOT overwrite it. Show the contents to the user and ask for confirmation:

- If the user confirms → use the existing Dockerfile.
- If the user wants to modify it → apply the requested changes.

## Step 3: docker-compose.yml Generation

If the analysis report indicates that `database` is present (not `null`), the generation of the complete `docker-compose.yml` is delegated to `database.md`. In that case, skip this step and follow `database.md`.

If `database` is `null`, generate a basic `docker-compose.yml`:

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "${APP_PORT:-3000}:3000"
    env_file:
      - .env.production
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

Notes:
- The internal port (after the `:`) must match the `EXPOSE` port in the Dockerfile.
- The external port uses the `APP_PORT` variable with default `3000`.
- **Resource limits** (`memory: 512M`, `cpus: '0.5'`) are mandatory to prevent a single container from consuming too many server resources.
- **Log rotation** (`max-size: "10m"`, `max-file: "3"`) is mandatory to prevent logs from growing indefinitely.

## Step 4: .dockerignore Generation

Create a `.dockerignore` file to exclude unnecessary files from the Docker image:

```
node_modules
.git
.env
.env.local
.env.development
npm-debug.log
.next
dist
build
out
```

Adapt the contents based on the framework:
- For Python add: `__pycache__`, `*.pyc`, `.venv`, `venv`
- For projects with `.next`, keep `.next` in `.dockerignore` (it will be rebuilt in the Docker build)

## Step 5: start.sh Generation

If the analysis report indicates that `database` is present, generate a `start.sh` file with migration commands. The details of which migration commands to use are described in `database.md`.

If `database` is not present, this step is not necessary (the container uses the Dockerfile `CMD` directly).

If `start.sh` is generated, make sure that:
1. The file is executable: `chmod +x start.sh`
2. The Dockerfile `CMD` points to `start.sh` instead of the direct command:
   ```dockerfile
   CMD ["./start.sh"]
   ```

## Step 6: .env.production Generation

Collect all necessary environment variables from the analysis report (`env_vars` field) and generate the `.env.production` file.

### Rules

1. **Ask the user for values** for each detected environment variable, EXCEPT:
   - `DATABASE_URL` / `MONGODB_URI` / `REDIS_URL` → generated automatically (see `database.md`)
   - `PORT` → must match the `EXPOSE` port in the Dockerfile
   - `NODE_ENV` → set to `production`
   - `DB_PASSWORD` → generated automatically (see below)

2. **Generate passwords automatically** for the database:
   ```bash
   openssl rand -hex 24
   ```
   The password is saved ONLY in the `.env.production` file and is never shown to the user.

3. **DATABASE_URL must point to the internal Docker service**, not `localhost`. Example:
   - PostgreSQL: `postgresql://app:{DB_PASSWORD}@db:5432/{project_name}`
   - MySQL: `mysql://app:{DB_PASSWORD}@db:3306/{project_name}`
   - MongoDB: `mongodb://app:{DB_PASSWORD}@db:27017/{project_name}?authSource=admin`

4. **PORT** must match the Dockerfile port:
   - Next.js, Nuxt, SvelteKit, Astro: `3000`
   - Express/Node.js: the port detected in the code (default `3000`)
   - FastAPI, Django: `8000`

### IMPORTANT: .env.production File Security

- The `.env.production` file is **NEVER committed** to the git repository.
- It is passed to the webhook as a base64-encoded string (see Step 8).
- It must be included in `.gitignore`.
- Warn the user if some variables contain sensitive values (API keys, secrets, passwords) and confirm they will not be exposed in the repository.

## Step 7: Git Init and Push

Read and follow `git-push.md` for git init, .gitignore, commit, Gitea repo creation, remote setup, and push to main.

## Step 8: Trigger Webhook

### Prepare Environment Files in Base64

```bash
ENV_B64=$(base64 < .env.production | tr -d '\n')
```

If the project uses a database (`database.md` was followed), also encode the Docker Compose `.env` file:

```bash
COMPOSE_ENV_B64=$(base64 < .env | tr -d '\n')
```

### Send the Deploy Request

**Without database:**

```bash
curl -s -X POST "{WEBHOOK_URL}/deploy" \
    -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "project_name": "{project_name}",
        "git_repo_url": "git@git.{DOMAIN}:{username}/{project_name}.git",
        "branch": "main",
        "deploy_type": "docker",
        "owner": "{username}",
        "port": {PORT},
        "env_production": "'"$ENV_B64"'"
    }'
```

**With database:**

```bash
curl -s -X POST "{WEBHOOK_URL}/deploy" \
    -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "project_name": "{project_name}",
        "git_repo_url": "git@git.{DOMAIN}:{username}/{project_name}.git",
        "branch": "main",
        "deploy_type": "docker",
        "owner": "{username}",
        "port": {PORT},
        "env_production": "'"$ENV_B64"'",
        "compose_env": "'"$COMPOSE_ENV_B64"'"
    }'
```

Where:
- `{PORT}` → the internal application port (the one exposed in the Dockerfile)
- `env_production` → the contents of `.env.production` encoded in base64
- `compose_env` → the contents of `.env` (for Docker Compose interpolation) encoded in base64, present only when the project uses a database

Verify the response:
- If `status` is `success` or HTTP code is `200`/`201` → deploy started successfully.
- If error → show the error message to the user.

## Step 9: Verify and Output

Wait a few seconds and verify the site is reachable:

```bash
curl -s -o /dev/null -w "%{http_code}" "https://{project_name}.{DOMAIN}"
```

Show the user the final result:

```
Deploy completed successfully!

Site URL:    https://{project_name}.{DOMAIN}
Repository:  {GITEA_URL}/{username}/{project_name}

The site is now reachable at the URL above.
To update the site, run the deploy again with Prolato.
```

If the site is not yet reachable, inform the user that the deploy may take a few minutes to propagate and the URL will be active soon.
