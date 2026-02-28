# Database Detection

Follow these rules in the order shown to determine if the project uses a database and which one.

## Step 1: ORM Configuration Files

Check for the presence of these files in the project root:

| File | ORM | How to determine the DB engine |
|---|---|---|
| `prisma/schema.prisma` | Prisma | Read the `provider` field in the `datasource` block: `"postgresql"`, `"mysql"`, `"sqlite"`, `"mongodb"` |
| `drizzle.config.ts` or `drizzle.config.js` | Drizzle | Read the `dialect` field: `"postgresql"`, `"mysql"`, `"sqlite"` |
| `knexfile.js` or `knexfile.ts` | Knex | Read the `client` field: `"pg"`, `"mysql"`, `"mysql2"`, `"sqlite3"` |
| `ormconfig.json` or `ormconfig.ts` or `data-source.ts` (with `typeorm`) | TypeORM | Read the `type` field: `"postgres"`, `"mysql"`, `"sqlite"`, `"mongodb"` |
| `sequelize` in package.json + configuration file | Sequelize | Read the `dialect` field: `"postgres"`, `"mysql"`, `"sqlite"`, `"mariadb"` |

If you find an ORM file, you already have all the main information. Continue with the following steps anyway to detect additional services (e.g., Redis as cache).

## Step 2: Environment Variables

Check these files in order (stop at the first found for each variable):
- `.env`
- `.env.local`
- `.env.example`
- `.env.development`

Look for these patterns in variable values:

| Pattern in variable | Database |
|---|---|
| `DATABASE_URL=postgresql://...` or `DATABASE_URL=postgres://...` | PostgreSQL |
| `DATABASE_URL=mysql://...` | MySQL |
| `DATABASE_URL=file:./...` or `DATABASE_URL=file:...` | SQLite (via Prisma) |
| `MONGODB_URI=mongodb://...` or `MONGODB_URL=mongodb://...` or `MONGO_URL=mongodb://...` | MongoDB |
| `REDIS_URL=redis://...` or `REDIS_HOST=...` | Redis |

Also note the environment variable name (e.g., `DATABASE_URL`, `MONGODB_URI`) — it will be needed for the `env_var_name` field in the output.

**WARNING — Sensitive data**: for detection purposes, only the variable name and the URL scheme prefix matter (e.g., `postgresql://`, `mongodb://`). NEVER include passwords, hostnames, ports, or real credentials in the analysis output. Actual environment variable values must never appear in the JSON report.

## Step 3: Dependencies in package.json

Check `dependencies` and `devDependencies` in `package.json`:

| Package | Database |
|---|---|
| `pg` or `postgres` or `@neondatabase/serverless` | PostgreSQL |
| `mysql` or `mysql2` | MySQL |
| `better-sqlite3` or `sql.js` or `sqlite3` | SQLite |
| `mongoose` or `mongodb` | MongoDB |
| `redis` or `ioredis` | Redis |

## Step 4: Local Database Files

Search in the project root and in the `prisma/` folder:

| File pattern | Database |
|---|---|
| `*.db` or `*.sqlite` or `*.sqlite3` | SQLite |

## Step 5: Existing docker-compose.yml

If a `docker-compose.yml` or `docker-compose.yaml` or `compose.yml` file exists, read it and look for the images used:

| Image | Database |
|---|---|
| `postgres:*` or `postgis/*` | PostgreSQL |
| `mysql:*` or `mariadb:*` | MySQL/MariaDB |
| `mongo:*` | MongoDB |
| `redis:*` | Redis |

## Output

The `database` field is **always an array** (even with a single database). If no database is found, set `"database": null`.

For each database found, add an element to the array with this information:

```json
{
    "database": [
        {
            "engine": "postgres",
            "orm": "prisma",
            "schema_source": "prisma/schema.prisma",
            "has_migrations": true,
            "migrations_dir": "prisma/migrations",
            "has_seed": true,
            "seed_command": "npx prisma db seed",
            "local_db_file": null,
            "env_var_name": "DATABASE_URL"
        }
    ]
}
```

Field details:
- `engine`: `"postgres"`, `"mysql"`, `"sqlite"`, `"mongodb"`, `"redis"`
- `orm`: the name of the ORM found in Step 1, or `null` if no ORM is used
- `schema_source`: the path to the ORM schema/configuration file, or `null`
- `has_migrations`: `true` if a migrations folder exists (e.g., `prisma/migrations`, `migrations/`, `drizzle/`)
- `migrations_dir`: the path to the migrations folder, or `null`
- `has_seed`: `true` if a seed script exists (check `prisma.seed` in `package.json`, or `seed.ts`/`seed.js` files)
- `seed_command`: the command to run the seed (e.g., `"npx prisma db seed"`, `"npm run seed"`), or `null`
- `local_db_file`: the path to the local SQLite file if found in Step 4, or `null`
- `env_var_name`: the name of the environment variable containing the database URL

## Multiple Databases

A project may use multiple databases simultaneously (e.g., PostgreSQL for data + Redis for caching). Each service has its own element in the array:

```json
{
    "database": [
        {
            "engine": "postgres",
            "orm": "prisma",
            "schema_source": "prisma/schema.prisma",
            "has_migrations": true,
            "migrations_dir": "prisma/migrations",
            "has_seed": true,
            "seed_command": "npx prisma db seed",
            "local_db_file": null,
            "env_var_name": "DATABASE_URL"
        },
        {
            "engine": "redis",
            "orm": null,
            "schema_source": null,
            "has_migrations": false,
            "migrations_dir": null,
            "has_seed": false,
            "seed_command": null,
            "local_db_file": null,
            "env_var_name": "REDIS_URL"
        }
    ]
}
```
