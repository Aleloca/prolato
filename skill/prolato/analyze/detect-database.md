# Rilevamento Database

Segui queste regole nell'ordine indicato per determinare se il progetto usa un database e quale.

## Passo 1: File di configurazione ORM

Controlla la presenza di questi file nella root del progetto:

| File | ORM | Come determinare il motore DB |
|---|---|---|
| `prisma/schema.prisma` | Prisma | Leggi il campo `provider` nel blocco `datasource`: `"postgresql"`, `"mysql"`, `"sqlite"`, `"mongodb"` |
| `drizzle.config.ts` o `drizzle.config.js` | Drizzle | Leggi il campo `dialect`: `"postgresql"`, `"mysql"`, `"sqlite"` |
| `knexfile.js` o `knexfile.ts` | Knex | Leggi il campo `client`: `"pg"`, `"mysql"`, `"mysql2"`, `"sqlite3"` |
| `ormconfig.json` o `ormconfig.ts` o `data-source.ts` (con `typeorm`) | TypeORM | Leggi il campo `type`: `"postgres"`, `"mysql"`, `"sqlite"`, `"mongodb"` |
| `sequelize` in package.json + file di configurazione | Sequelize | Leggi il campo `dialect`: `"postgres"`, `"mysql"`, `"sqlite"`, `"mariadb"` |

Se trovi un file ORM, hai gia' tutte le informazioni principali. Continua comunque con i passi successivi per rilevare servizi aggiuntivi (es. Redis come cache).

## Passo 2: Variabili d'ambiente

Controlla questi file nell'ordine (fermati al primo trovato per ogni variabile):
- `.env`
- `.env.local`
- `.env.example`
- `.env.development`

Cerca questi pattern nei valori delle variabili:

| Pattern nella variabile | Database |
|---|---|
| `DATABASE_URL=postgresql://...` o `DATABASE_URL=postgres://...` | PostgreSQL |
| `DATABASE_URL=mysql://...` | MySQL |
| `DATABASE_URL=file:./...` o `DATABASE_URL=file:...` | SQLite (via Prisma) |
| `MONGODB_URI=mongodb://...` o `MONGODB_URL=mongodb://...` o `MONGO_URL=mongodb://...` | MongoDB |
| `REDIS_URL=redis://...` o `REDIS_HOST=...` | Redis |

Annota anche il nome della variabile d'ambiente (es. `DATABASE_URL`, `MONGODB_URI`) — servira' per il campo `env_var_name` nell'output.

**ATTENZIONE — Dati sensibili**: ai fini del rilevamento, conta solo il nome della variabile e il prefisso dello schema URL (es. `postgresql://`, `mongodb://`). NON includere mai password, hostname, porte o credenziali reali nell'output dell'analisi. I valori effettivi delle variabili d'ambiente non devono mai comparire nel report JSON.

## Passo 3: Dipendenze in package.json

Controlla `dependencies` e `devDependencies` in `package.json`:

| Pacchetto | Database |
|---|---|
| `pg` o `postgres` o `@neondatabase/serverless` | PostgreSQL |
| `mysql` o `mysql2` | MySQL |
| `better-sqlite3` o `sql.js` o `sqlite3` | SQLite |
| `mongoose` o `mongodb` | MongoDB |
| `redis` o `ioredis` | Redis |

## Passo 4: File di database locali

Cerca nella root del progetto e nella cartella `prisma/`:

| Pattern file | Database |
|---|---|
| `*.db` o `*.sqlite` o `*.sqlite3` | SQLite |

## Passo 5: docker-compose.yml esistente

Se esiste un file `docker-compose.yml` o `docker-compose.yaml` o `compose.yml`, leggilo e cerca le immagini usate:

| Immagine | Database |
|---|---|
| `postgres:*` o `postgis/*` | PostgreSQL |
| `mysql:*` o `mariadb:*` | MySQL/MariaDB |
| `mongo:*` | MongoDB |
| `redis:*` | Redis |

## Output

Il campo `database` e' **sempre un array** (anche con un solo database). Se non viene trovato nessun database, imposta `"database": null`.

Per ogni database trovato, aggiungi un elemento all'array con queste informazioni:

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

Dettagli sui campi:
- `engine`: `"postgres"`, `"mysql"`, `"sqlite"`, `"mongodb"`, `"redis"`
- `orm`: il nome dell'ORM trovato al Passo 1, o `null` se non usa un ORM
- `schema_source`: il percorso del file di schema/configurazione ORM, o `null`
- `has_migrations`: `true` se esiste una cartella di migrazioni (es. `prisma/migrations`, `migrations/`, `drizzle/`)
- `migrations_dir`: il percorso della cartella migrazioni, o `null`
- `has_seed`: `true` se esiste uno script di seed (controlla `prisma.seed` in `package.json`, o file `seed.ts`/`seed.js`)
- `seed_command`: il comando per eseguire il seed (es. `"npx prisma db seed"`, `"npm run seed"`), o `null`
- `local_db_file`: il percorso del file SQLite locale se trovato al Passo 4, o `null`
- `env_var_name`: il nome della variabile d'ambiente che contiene l'URL del database

## Database multipli

Un progetto puo' usare piu' database contemporaneamente (es. PostgreSQL per i dati + Redis per la cache). Ogni servizio ha il proprio elemento nell'array:

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
