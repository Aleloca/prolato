# Configurazione Database per Deploy Docker

Questa guida estende il deploy Docker quando il report dell'analisi indica che il progetto utilizza un database. Viene usata in combinazione con `docker.md`.

## Panoramica

Quando il campo `database` del report dell'analisi non e' `null`, questo file guida la generazione di:

1. Servizio database nel `docker-compose.yml`
2. Variabili d'ambiente per la connessione al database
3. Script `start.sh` con comandi di migrazione
4. Password del database

## Passo 1: Generazione password database

Genera una password sicura per il database:

```bash
DB_PASSWORD=$(openssl rand -hex 24)
```

Questa password:
- Viene salvata SOLO nel file `.env.production`
- NON viene mai mostrata all'utente
- NON viene mai committata nel repository

Se il database richiede anche una password root (es. MySQL), generane una separata:

```bash
DB_ROOT_PASSWORD=$(openssl rand -hex 24)
```

## Passo 2: Generazione docker-compose.yml

Genera il `docker-compose.yml` completo, includendo il servizio applicazione E il servizio database.

### PostgreSQL

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "${APP_PORT:-3000}:3000"
    env_file:
      - .env.production
    depends_on:
      db:
        condition: service_healthy
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

volumes:
  db_data:
```

Variabile d'ambiente per l'app:
```
DATABASE_URL=postgresql://app:${DB_PASSWORD}@db:5432/${PROJECT_NAME}
```

### MySQL

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "${APP_PORT:-3000}:3000"
    env_file:
      - .env.production
    depends_on:
      db:
        condition: service_healthy
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

volumes:
  db_data:
```

Variabile d'ambiente per l'app:
```
DATABASE_URL=mysql://app:${DB_PASSWORD}@db:3306/${PROJECT_NAME}
```

### MongoDB

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "${APP_PORT:-3000}:3000"
    env_file:
      - .env.production
    depends_on:
      db:
        condition: service_healthy
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

volumes:
  db_data:
```

Variabile d'ambiente per l'app:
```
MONGODB_URI=mongodb://app:${DB_PASSWORD}@db:27017/${PROJECT_NAME}?authSource=admin
```

### Redis (servizio aggiuntivo)

Redis viene aggiunto come servizio aggiuntivo, non come database principale. Si aggiunge al `docker-compose.yml` insieme al database principale (o da solo se il progetto usa solo Redis).

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

Variabile d'ambiente per l'app:
```
REDIS_URL=redis://redis:6379
```

Se Redis e' presente insieme ad un altro database, aggiungi `redis_data` ai volumi:
```yaml
volumes:
  db_data:
  redis_data:
```

E aggiungi `redis` come dipendenza dell'app:
```yaml
  app:
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
```

### Note importanti per tutti i servizi database

- **Limiti di risorse**: ogni servizio database DEVE avere `memory: 512M` e `cpus: '0.5'` per evitare di consumare troppe risorse sul server.
- **Rotazione log**: ogni servizio DEVE avere la configurazione di log rotation (`max-size: "10m"`, `max-file: "3"`) per evitare crescita incontrollata dei log.
- **Healthcheck**: ogni servizio database DEVE avere un healthcheck configurato. L'app DEVE usare `depends_on` con `condition: service_healthy` per attendere che il database sia pronto prima di avviarsi.
- **Volumi persistenti**: i dati del database sono salvati in volumi Docker per persistere tra i riavvii del container.

### Adattamento porte

La porta interna dell'app nel `docker-compose.yml` deve corrispondere alla porta `EXPOSE` del Dockerfile:
- Next.js, Nuxt, SvelteKit: `3000`
- Express/Node.js: la porta rilevata nel codice (default `3000`)
- FastAPI, Django: `8000`
- Astro: `4321`

Sostituisci `3000` negli esempi sopra con la porta corretta.

## Passo 3: Generazione start.sh

Genera uno script `start.sh` che gestisce le migrazioni del database prima di avviare l'applicazione.

### Template base

```bash
#!/bin/sh
set -e

echo "Attesa database..."
# Il healthcheck di Docker Compose gestisce l'attesa,
# ma aggiungiamo un breve ritardo di sicurezza
sleep 2

echo "Esecuzione migrations..."
# {comando migrazione in base all'ORM}

echo "Avvio applicazione..."
exec {start_command}
```

**IMPORTANTE**: usa `exec` prima del comando di avvio per sostituire il processo shell con il processo dell'applicazione. Questo garantisce che i segnali Docker (SIGTERM, etc.) vengano inoltrati correttamente.

### Comandi di migrazione per ORM

#### Prisma

Se il progetto usa Prisma (presenza di `prisma/schema.prisma` o `@prisma/client` nelle dipendenze):

- **Con cartella `prisma/migrations/` esistente** (migrazioni gia' create):
  ```bash
  npx prisma migrate deploy
  ```

- **Senza cartella `prisma/migrations/`** (primo deploy o sviluppo senza migrazioni):
  ```bash
  npx prisma db push --skip-generate
  ```

- **Con seed** (se esiste `prisma/seed.ts` o `prisma/seed.js` e il seed e' idempotente):
  ```bash
  npx prisma db seed
  ```
  **Nota**: esegui il seed SOLO se il file di seed e' idempotente (usa `upsert` o `createMany` con `skipDuplicates`). In caso di dubbio, chiedi all'utente.

Esempio `start.sh` completo per Prisma con migrazioni:
```bash
#!/bin/sh
set -e
echo "Attesa database..."
sleep 2
echo "Esecuzione migrations Prisma..."
npx prisma migrate deploy
echo "Avvio applicazione..."
exec npm start
```

#### Drizzle

Se il progetto usa Drizzle ORM (presenza di `drizzle.config.ts` o `drizzle-orm` nelle dipendenze):

- **Con cartella `drizzle/` contenente file SQL di migrazione**:
  ```bash
  npx drizzle-kit migrate
  ```

- **Senza migrazioni generate**:
  ```bash
  npx drizzle-kit push
  ```

Esempio `start.sh` completo per Drizzle:
```bash
#!/bin/sh
set -e
echo "Attesa database..."
sleep 2
echo "Esecuzione migrations Drizzle..."
npx drizzle-kit migrate
echo "Avvio applicazione..."
exec npm start
```

#### Knex

Se il progetto usa Knex (presenza di `knexfile.js` o `knex` nelle dipendenze):

```bash
npx knex migrate:latest
```

Per eseguire i seed (se presenti nella cartella `seeds/`):
```bash
npx knex seed:run
```

Esempio `start.sh` completo per Knex:
```bash
#!/bin/sh
set -e
echo "Attesa database..."
sleep 2
echo "Esecuzione migrations Knex..."
npx knex migrate:latest
echo "Avvio applicazione..."
exec npm start
```

#### TypeORM

Se il progetto usa TypeORM (presenza di `data-source.ts` o `typeorm` nelle dipendenze):

```bash
npx typeorm migration:run -d data-source.ts
```

Se il file data-source ha un nome diverso, adattare il percorso.

Esempio `start.sh` completo per TypeORM:
```bash
#!/bin/sh
set -e
echo "Attesa database..."
sleep 2
echo "Esecuzione migrations TypeORM..."
npx typeorm migration:run -d data-source.ts
echo "Avvio applicazione..."
exec npm start
```

#### Sequelize

Se il progetto usa Sequelize (presenza di `.sequelizerc` o `sequelize` nelle dipendenze):

```bash
npx sequelize-cli db:migrate
```

Per eseguire i seed (se presenti):
```bash
npx sequelize-cli db:seed:all
```

Esempio `start.sh` completo per Sequelize:
```bash
#!/bin/sh
set -e
echo "Attesa database..."
sleep 2
echo "Esecuzione migrations Sequelize..."
npx sequelize-cli db:migrate
echo "Avvio applicazione..."
exec npm start
```

#### Django (Python)

Se il progetto e' Django:

```bash
python manage.py migrate
```

Per eseguire i seed/fixtures (se presenti):
```bash
python manage.py loaddata {fixture_file}
```

Esempio `start.sh` completo per Django:
```bash
#!/bin/sh
set -e
echo "Attesa database..."
sleep 2
echo "Esecuzione migrations Django..."
python manage.py migrate
echo "Avvio applicazione..."
exec gunicorn {project_name}.wsgi:application --bind 0.0.0.0:8000
```

#### SQLAlchemy / Alembic (Python)

Se il progetto usa Alembic (presenza di `alembic.ini` o cartella `alembic/`):

```bash
alembic upgrade head
```

Esempio `start.sh` completo per Alembic:
```bash
#!/bin/sh
set -e
echo "Attesa database..."
sleep 2
echo "Esecuzione migrations Alembic..."
alembic upgrade head
echo "Avvio applicazione..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
```

### Aggiornamento Dockerfile

Dopo aver generato `start.sh`, aggiorna il Dockerfile:

1. Aggiungi la copia di `start.sh`:
   ```dockerfile
   COPY start.sh .
   RUN chmod +x start.sh
   ```

2. Sostituisci il `CMD` originale:
   ```dockerfile
   CMD ["./start.sh"]
   ```

### SQLite in Docker

Se il database e' SQLite:
- NON aggiungere un servizio database al `docker-compose.yml`
- Aggiungi un volume per persistere il file SQLite:
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
- Assicurati che il percorso del file SQLite nel codice punti a `/app/data/` (o la cartella montata).
- Imposta `DATABASE_URL=file:/app/data/{project_name}.db` nel `.env.production`.
- Le migrazioni funzionano normalmente (Prisma, Drizzle, etc.) — non serve attendere il database.

## Passo 4: Variabili d'ambiente per il database

Aggiungi le seguenti variabili al file `.env.production` (generato in `docker.md` Passo 6):

### Per PostgreSQL
```
DB_PASSWORD={password_generata}
PROJECT_NAME={project_name}
DATABASE_URL=postgresql://app:{password_generata}@db:5432/{project_name}
```

### Per MySQL
```
DB_PASSWORD={password_generata}
DB_ROOT_PASSWORD={root_password_generata}
PROJECT_NAME={project_name}
DATABASE_URL=mysql://app:{password_generata}@db:3306/{project_name}
```

### Per MongoDB
```
DB_PASSWORD={password_generata}
PROJECT_NAME={project_name}
MONGODB_URI=mongodb://app:{password_generata}@db:27017/{project_name}?authSource=admin
```

### Per Redis
```
REDIS_URL=redis://redis:6379
```

### Per SQLite
```
DATABASE_URL=file:/app/data/{project_name}.db
```

### Combinazioni

Se il progetto usa sia un database relazionale che Redis, includi TUTTE le variabili d'ambiente corrispondenti.

Esempio con PostgreSQL + Redis:
```
DB_PASSWORD={password_generata}
PROJECT_NAME={project_name}
DATABASE_URL=postgresql://app:{password_generata}@db:5432/{project_name}
REDIS_URL=redis://redis:6379
```

## Riepilogo flusso

1. Genera password con `openssl rand -hex 24`
2. Genera `docker-compose.yml` con servizio app + servizio database (con healthcheck, resource limits, log rotation)
3. Genera `start.sh` con comandi di migrazione appropriati per l'ORM rilevato
4. Aggiungi variabili d'ambiente database a `.env.production`
5. Aggiorna Dockerfile per usare `start.sh`
6. Prosegui con Passo 7 di `docker.md` (Git init e push)
