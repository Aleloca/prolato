# Deploy Docker

Questa guida copre il deploy di progetti che necessitano di un server (SSR, backend, API). Il progetto viene containerizzato con Docker e deployato tramite il webhook.

## Prerequisiti

Leggi `~/.deploy-config.json` per ottenere le seguenti variabili:

- `{GITEA_URL}` → campo `gitea_url`
- `{USER_TOKEN}` → campo `gitea_token`
- `{DOMINIO}` → campo `domain`
- `{WEBHOOK_URL}` → campo `webhook_url`
- `{DEPLOY_TOKEN}` → campo `deploy_token`
- `{username}` → campo `gitea_username`

## Passo 1: Nome progetto

Chiedi all'utente il nome del progetto. Suggerisci un nome derivato dalla cartella corrente (es. se la cartella si chiama `my-app`, suggerisci `my-app`).

### Validazione del nome

Il nome DEVE rispettare tutte queste regole:

- Solo caratteri `[a-z0-9-]` (minuscole, numeri, trattini)
- Lunghezza massima: 63 caratteri
- NON puo' iniziare con un trattino `-`
- NON puo' terminare con un trattino `-`

Se il nome non e' valido, chiedi all'utente di sceglierne un altro spiegando quali regole ha violato.

### Verifica disponibilita'

Dopo la validazione, verifica che il nome non sia gia' in uso:

```bash
curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: token {USER_TOKEN}" \
    "{GITEA_URL}/api/v1/repos/{username}/{project_name}"
```

- Se risponde `200` → il progetto esiste gia'. Chiedi all'utente se vuole sovrascriverlo (re-deploy) o scegliere un altro nome.
- Se risponde `404` → il nome e' disponibile, prosegui.

## Passo 2: Generazione Dockerfile

Se il progetto NON ha gia' un `Dockerfile`, generane uno in base al framework rilevato dall'analisi.

### Next.js SSR (con output standalone)

Prima di generare il Dockerfile, assicurati che `next.config.js` (o `.mjs`/`.ts`) contenga `output: 'standalone'`. Se non e' presente, aggiungilo.

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

**Nota**: lo stage `builder` installa TUTTE le dipendenze (incluse le devDependencies come `next`) perche' sono necessarie per il build. Lo stage `runner` copia solo l'output `standalone`, che include gia' le dipendenze di produzione necessarie, riducendo la dimensione dell'immagine finale.

### Express / Node.js backend

```dockerfile
FROM node:{NODE_VERSION}-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE {PORT}
CMD ["node", "{entry_file}"]
```

Dove:
- `{NODE_VERSION}` → dalla campo `node_version` del report (default: `20`)
- `{PORT}` → la porta rilevata nel codice (default: `3000`)
- `{entry_file}` → il file di ingresso (es. `server.js`, `index.js`, `app.js`)

Se il progetto ha un comando `build` in `package.json` (es. per TypeScript), aggiungi uno stage di build:

```dockerfile
FROM node:{NODE_VERSION}-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:{NODE_VERSION}-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE {PORT}
CMD ["node", "dist/{entry_file}"]
```

### Python FastAPI

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Note:
- Se il file principale non si chiama `main.py`, adatta il comando `uvicorn` (es. `app.main:app`).
- Se esiste `pyproject.toml` con dipendenze Poetry, usa:
  ```dockerfile
  RUN pip install poetry && poetry config virtualenvs.create false && poetry install --no-dev
  ```

### Python Django

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python manage.py collectstatic --noinput
EXPOSE 8000
CMD ["gunicorn", "{project_name}.wsgi:application", "--bind", "0.0.0.0:8000"]
```

Dove `{project_name}` e' il nome del modulo Django (la cartella che contiene `wsgi.py`).

### Nuxt.js SSR

```dockerfile
FROM node:{NODE_VERSION}-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:{NODE_VERSION}-alpine
WORKDIR /app
COPY --from=builder /app/.output ./.output
EXPOSE 3000
ENV PORT=3000
CMD ["node", ".output/server/index.mjs"]
```

### SvelteKit (adapter-node)

```dockerfile
FROM node:{NODE_VERSION}-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:{NODE_VERSION}-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
RUN npm ci --only=production
EXPOSE 3000
ENV PORT=3000
CMD ["node", "build"]
```

**Nota**: a differenza di Next.js standalone, l'output di SvelteKit con `adapter-node` richiede `node_modules` a runtime. E' necessario installare le dipendenze di produzione nello stage runner.

### Astro SSR

```dockerfile
FROM node:{NODE_VERSION}-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:{NODE_VERSION}-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0
CMD ["node", "./dist/server/entry.mjs"]
```

**Nota**: Astro usa la porta 4321 in sviluppo, ma in produzione usiamo la porta 3000 per coerenza con gli altri framework e con il template `docker-compose.yml` (che usa `${APP_PORT:-3000}:3000` come default). La variabile `PORT=3000` viene letta da Astro SSR per il binding.

### Se il Dockerfile esiste gia'

Se il progetto ha gia' un `Dockerfile`, NON sovrascriverlo. Mostra il contenuto all'utente e chiedi conferma:

- Se l'utente conferma → usa il Dockerfile esistente.
- Se l'utente vuole modificarlo → applica le modifiche richieste.

## Passo 3: Generazione docker-compose.yml

Se il report dell'analisi indica che `database` e' presente (non `null`), la generazione del `docker-compose.yml` completo e' delegata a `database.md`. In quel caso, salta questo passo e segui `database.md`.

Se `database` e' `null`, genera un `docker-compose.yml` base:

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

Note:
- La porta interna (dopo i `:`) deve corrispondere alla porta `EXPOSE` del Dockerfile.
- La porta esterna usa la variabile `APP_PORT` con default `3000`.
- I **limiti di risorse** (`memory: 512M`, `cpus: '0.5'`) sono obbligatori per evitare che un singolo container consumi troppe risorse sul server.
- La **rotazione dei log** (`max-size: "10m"`, `max-file: "3"`) e' obbligatoria per evitare che i log crescano indefinitamente.

## Passo 4: Generazione .dockerignore

Crea un file `.dockerignore` per escludere file non necessari dall'immagine Docker:

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

Adatta il contenuto in base al framework:
- Per Python aggiungi: `__pycache__`, `*.pyc`, `.venv`, `venv`
- Per progetti con `.next`, mantieni `.next` nel `.dockerignore` (verra' ricostruito nel build Docker)

## Passo 5: Generazione start.sh

Se il report dell'analisi indica che `database` e' presente, genera un file `start.sh` con i comandi di migrazione. I dettagli su quali comandi di migrazione usare sono descritti in `database.md`.

Se `database` non e' presente, questo passo non e' necessario (il container usa direttamente il `CMD` del Dockerfile).

Se `start.sh` viene generato, assicurati che:
1. Il file sia eseguibile: `chmod +x start.sh`
2. Il `CMD` del Dockerfile punti a `start.sh` invece del comando diretto:
   ```dockerfile
   CMD ["./start.sh"]
   ```

## Passo 6: Generazione .env.production

Raccogli tutte le variabili d'ambiente necessarie dal report dell'analisi (campo `env_vars`) e genera il file `.env.production`.

### Regole

1. **Chiedi i valori all'utente** per ogni variabile d'ambiente rilevata, TRANNE:
   - `DATABASE_URL` / `MONGODB_URI` / `REDIS_URL` → generati automaticamente (vedi `database.md`)
   - `PORT` → deve corrispondere alla porta `EXPOSE` del Dockerfile
   - `NODE_ENV` → impostato a `production`
   - `DB_PASSWORD` → generato automaticamente (vedi sotto)

2. **Genera password automaticamente** per il database:
   ```bash
   openssl rand -hex 24
   ```
   La password viene salvata SOLO nel file `.env.production` e non viene mai mostrata all'utente.

3. **DATABASE_URL deve puntare al servizio Docker interno**, non a `localhost`. Esempio:
   - PostgreSQL: `postgresql://app:{DB_PASSWORD}@db:5432/{project_name}`
   - MySQL: `mysql://app:{DB_PASSWORD}@db:3306/{project_name}`
   - MongoDB: `mongodb://app:{DB_PASSWORD}@db:27017/{project_name}?authSource=admin`

4. **PORT** deve corrispondere alla porta del Dockerfile:
   - Next.js, Nuxt, SvelteKit, Astro: `3000`
   - Express/Node.js: la porta rilevata nel codice (default `3000`)
   - FastAPI, Django: `8000`

### IMPORTANTE: sicurezza del file .env.production

- Il file `.env.production` **NON viene MAI committato** nel repository git.
- Viene passato al webhook come stringa codificata in base64 (vedi Passo 8).
- Deve essere incluso nel `.gitignore`.
- Avvisa l'utente se alcune variabili contengono valori sensibili (API keys, secrets, passwords) e conferma che non verranno esposti nel repository.

## Passo 7: Git init e push

### 7.1: Inizializza repository git

Se la cartella NON e' gia' un repository git (non esiste `.git/`):

```bash
git init
```

### 7.2: Crea .gitignore

Se non esiste gia' un `.gitignore`, creane uno appropriato:

```
node_modules/
.env
.env.local
.env.development
.env.production
.next/
dist/
build/
out/
*.log
.DS_Store
__pycache__/
*.pyc
.venv/
venv/
```

Se `.gitignore` esiste gia', verifica che contenga almeno:
- `node_modules`
- `.env`
- `.env.production`
- `.env.local`
- `.env.development`

Se mancano, aggiungili.

**CRITICO**: `.env.production` DEVE essere nel `.gitignore`. Non committare MAI questo file.

### 7.3: Commit su main

**PRIMA di eseguire `git add`**, verifica che `.env.production` sia nel `.gitignore`:

```bash
grep -q '\.env\.production' .gitignore
```

Se il grep fallisce (`.env.production` NON e' nel `.gitignore`), aggiungilo SUBITO:

```bash
echo '.env.production' >> .gitignore
```

Solo DOPO aver verificato il `.gitignore`, procedi con l'add e il commit:

```bash
git add -A
```

**Controllo di sicurezza**: verifica che `.env.production` non sia stato staged per errore:

```bash
git diff --cached --name-only | grep '.env.production'
```

Se il grep trova `.env.production` tra i file staged, rimuovilo PRIMA di committare:

```bash
git rm --cached .env.production
```

Infine, esegui il commit:

```bash
git commit -m "deploy: {project_name} via Prolato"
```

### 7.4: Crea repository Gitea

```bash
curl -s -X POST "{GITEA_URL}/api/v1/user/repos" \
    -H "Authorization: token {USER_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "{project_name}",
        "private": true,
        "auto_init": false
    }'
```

Se il repository esiste gia' (errore 409), prosegui senza errore.

### 7.5: Aggiungi remote

Controlla se esiste gia' un remote `origin`:

```bash
git remote get-url origin 2>/dev/null
```

- Se `origin` NON esiste → aggiungi come `origin`:
  ```bash
  git remote add origin git@git.{DOMINIO}:{username}/{project_name}.git
  ```

- Se `origin` ESISTE GIA' (e punta a un altro URL) → aggiungi come `deploy`:
  ```bash
  git remote add deploy git@git.{DOMINIO}:{username}/{project_name}.git
  ```
  In questo caso, usa `deploy` al posto di `origin` in tutti i comandi successivi.

Se il remote esiste gia' e punta allo stesso URL, non fare nulla.

### 7.6: Push su main

```bash
git push -u {remote_name} main
```

Dove `{remote_name}` e' `origin` o `deploy` (in base al passo 7.5).

**NON usare `--force`** per il push su main. Se il push fallisce per conflitti, avvisa l'utente.

## Passo 8: Trigger webhook

### Prepara i file environment in base64

```bash
ENV_B64=$(base64 < .env.production | tr -d '\n')
```

Se il progetto usa un database (e' stato seguito `database.md`), codifica anche il file `.env` di Docker Compose:

```bash
COMPOSE_ENV_B64=$(base64 < .env | tr -d '\n')
```

### Invia la richiesta di deploy

**Senza database:**

```bash
curl -s -X POST "{WEBHOOK_URL}/deploy" \
    -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "project_name": "{project_name}",
        "git_repo_url": "git@git.{DOMINIO}:{username}/{project_name}.git",
        "branch": "main",
        "deploy_type": "docker",
        "owner": "{username}",
        "port": {PORT},
        "env_production": "'"$ENV_B64"'"
    }'
```

**Con database:**

```bash
curl -s -X POST "{WEBHOOK_URL}/deploy" \
    -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "project_name": "{project_name}",
        "git_repo_url": "git@git.{DOMINIO}:{username}/{project_name}.git",
        "branch": "main",
        "deploy_type": "docker",
        "owner": "{username}",
        "port": {PORT},
        "env_production": "'"$ENV_B64"'",
        "compose_env": "'"$COMPOSE_ENV_B64"'"
    }'
```

Dove:
- `{PORT}` → la porta interna dell'applicazione (quella esposta nel Dockerfile)
- `env_production` → il contenuto di `.env.production` codificato in base64
- `compose_env` → il contenuto di `.env` (per interpolazione Docker Compose) codificato in base64, presente solo quando il progetto usa un database

Verifica la risposta:
- Se `status` e' `success` o il codice HTTP e' `200`/`201` → deploy avviato con successo.
- Se errore → mostra il messaggio di errore all'utente.

## Passo 9: Verifica e output

Attendi qualche secondo e verifica che il sito sia raggiungibile:

```bash
curl -s -o /dev/null -w "%{http_code}" "https://{project_name}.{DOMINIO}"
```

Mostra all'utente il risultato finale:

```
Deploy completato con successo!

URL del sito: https://{project_name}.{DOMINIO}
Repository:   {GITEA_URL}/{username}/{project_name}

Il sito e' ora raggiungibile all'URL indicato.
Per aggiornare il sito, esegui di nuovo il deploy con Prolato.
```

Se il sito non e' ancora raggiungibile, informa l'utente che il deploy potrebbe richiedere qualche minuto per propagarsi e che l'URL sara' presto attivo.
