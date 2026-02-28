# Rilevamento Framework

Segui queste regole nell'ordine indicato per determinare il framework del progetto.

## Passo 1: Controlla `package.json`

Se esiste `package.json` nella root del progetto, leggilo e cerca nelle `dependencies` e `devDependencies`:

| Dipendenza in `dependencies` o `devDependencies` | Framework |
|---|---|
| `next` | Next.js |
| `gatsby` | Gatsby |
| `nuxt` | Nuxt.js |
| `@sveltejs/kit` | SvelteKit |
| `astro` | Astro |
| `vite` + `react` (senza nessun framework sopra) | React (Vite) |
| `react-scripts` | React (Create React App) |
| `vite` + `vue` (senza Nuxt) | Vue (Vite) |
| `@angular/core` | Angular |
| `express` o `fastify` o `koa` o `hono` (senza framework frontend sopra) | Backend Node.js |

La tabella e' in ordine di priorita': se trovi `next` e anche `react`, il framework e' Next.js (non React).

### Rilevamento versione framework

Dopo aver identificato il framework, rileva la sua versione dal campo corrispondente in `package.json` (`dependencies` o `devDependencies`). Estrai la versione numerica rimuovendo prefissi come `^`, `~`, `>=`, ecc.

Esempi:
- `"next": "^14.0.0"` → `version`: `"14.0.0"`
- `"react": "~18.2.0"` → `version`: `"18.2.0"`
- `"express": "4.18.2"` → `version`: `"4.18.2"`
- `"astro": ">=4.0.0"` → `version`: `"4.0.0"`

Se la versione non e' determinabile (es. `"*"` o `"latest"`), imposta `version`: `null`.

## Passo 2: Se non esiste `package.json`

Controlla la presenza di questi file/cartelle:

| File/cartella presente | Tipo progetto |
|---|---|
| `index.html` nella root | HTML/CSS/JS statico |
| `requirements.txt` o `pyproject.toml` o `Pipfile` | Python (Flask/Django/FastAPI) |
| `Dockerfile` (e nient'altro di riconoscibile) | Docker generico |

## Passo 3: Informazioni aggiuntive per ogni framework

### Next.js — determina se statico o dinamico

Esegui questi controlli nell'ordine. Se trovi anche solo una condizione che richiede SSR, il progetto necessita Docker.

- Cerca `getServerSideProps` o `getInitialProps` in qualsiasi file sotto `pages/` o `src/pages/`. Se trovato → SSR, necessita Docker.
- Cerca file sotto `app/` o `src/app/` con `export const dynamic = 'force-dynamic'` o `export const revalidate = 0`. Se trovato → SSR, necessita Docker.
- Cerca file sotto `app/api/` o `pages/api/`. Se trovati → ha API routes, necessita Docker.
- Cerca `middleware.ts` o `middleware.js` nella root o in `src/`. Se trovato → necessita Docker.
- Controlla `next.config.js` o `next.config.mjs`: se contiene `output: 'export'` → esplicitamente statico.
- Se nessuna delle condizioni sopra → considera statico e usa `next build` con output export.

Valori da impostare:
- `has_ssr`: `true` se trovate condizioni SSR, altrimenti `false`
- `has_api_routes`: `true` se trovata cartella `app/api/` o `pages/api/`
- `build_command`: `"npm run build"`
- `output_dir`: `"out"` (se statico con export), `".next"` (se SSR/Docker)
- `start_command`: `"npm start"` (se SSR/Docker), `null` (se statico)

### React (Vite / CRA) — quasi sempre statico

- Build command: `npm run build`.
- Output: `dist/` (Vite) o `build/` (CRA).
- Eccezione: se ci sono file che importano `express` e c'e' un `server.js` → ha backend integrato, necessita Docker.

Valori da impostare:
- `has_ssr`: `false`
- `has_api_routes`: `false`
- `build_command`: `"npm run build"`
- `output_dir`: `"dist"` (Vite) o `"build"` (CRA)
- `start_command`: `null` (statico) o `"node server.js"` (se ha backend)

### Gatsby — sempre statico

- Build command: `gatsby build`.
- Output: `public/`.

Valori da impostare:
- `has_ssr`: `false`
- `has_api_routes`: `false`
- `build_command`: `"gatsby build"`
- `output_dir`: `"public"`
- `start_command`: `null`

### Astro — controlla modalita'

- Controlla `astro.config.mjs` (o `astro.config.ts`): se contiene `output: 'server'` o `output: 'hybrid'` → necessita Docker.
- Default (`output: 'static'` o non specificato) → statico.
- Output: `dist/`.

Valori da impostare:
- `has_ssr`: `true` se `output` e' `'server'` o `'hybrid'`, altrimenti `false`
- `has_api_routes`: `false`
- `build_command`: `"npm run build"`
- `output_dir`: `"dist"`
- `start_command`: `"node ./dist/server/entry.mjs"` (se SSR), `null` (se statico)

### Vue (Nuxt) — controlla modalita'

- Controlla `nuxt.config.ts` (o `nuxt.config.js`): se `ssr: false` → statico, usa `nuxt generate`, output `.output/public/`.
- Se `ssr: true` (default) → necessita Docker.

Valori da impostare per Nuxt:
- `has_ssr`: valore di `ssr` nel config (default `true`)
- `has_api_routes`: controlla se esistono file in `server/api/`
- `build_command`: `"nuxt generate"` (statico) o `"nuxt build"` (SSR)
- `output_dir`: `".output/public"` (statico) o `".output"` (SSR)
- `start_command`: `"node .output/server/index.mjs"` (SSR), `null` (statico)

Valori da impostare per Vue (senza Nuxt):
- `has_ssr`: `false`
- `has_api_routes`: `false`
- `build_command`: `"npm run build"`
- `output_dir`: `"dist"`
- `start_command`: `null`

### Angular — quasi sempre statico

- Build command: `ng build` o `npm run build`.
- Output: `dist/{nome-progetto}/`. Per trovare il nome del progetto, leggi `angular.json` e cerca il nome del progetto principale sotto `projects`.

Valori da impostare:
- `has_ssr`: `false` (a meno che non usi Angular Universal — cerca `@nguniversal` nelle dipendenze)
- `has_api_routes`: `false`
- `build_command`: `"npm run build"`
- `output_dir`: `"dist/{nome-progetto}"` (o `"dist/{nome-progetto}/browser"` per Angular 17+)
- `start_command`: `null` (statico), `"node dist/{nome-progetto}/server/main.js"` (se SSR)

### SvelteKit — controlla adapter

- Controlla `svelte.config.js`: cerca quale adapter viene usato.
  - Se usa `@sveltejs/adapter-static` → statico.
  - Se usa `@sveltejs/adapter-node` → necessita Docker.
  - Se usa `@sveltejs/adapter-auto` → necessita Docker (per sicurezza).

Valori da impostare:
- `has_ssr`: `true` se usa `adapter-node` o `adapter-auto`, `false` se usa `adapter-static`
- `has_api_routes`: controlla se esistono file `+server.ts`/`+server.js` sotto `src/routes/`
- `build_command`: `"npm run build"`
- `output_dir`: `"build"` (statico con adapter-static) o `"build"` (Docker con adapter-node)
- `start_command`: `"node build"` (adapter-node), `null` (adapter-static)

### Backend Node.js (Express/Fastify/Koa/Hono) — sempre Docker

- Trova il file di ingresso: campo `main` in `package.json`, oppure `server.js`, `index.js`, `app.js`.
- Identifica la porta: cerca `listen(`, `PORT`, `process.env.PORT`.
- Start command: `node {file_ingresso}` o lo script `start` in `package.json`.

Valori da impostare:
- `has_ssr`: `false`
- `has_api_routes`: `true`
- `build_command`: script `build` in `package.json` se esiste, altrimenti `null`
- `output_dir`: `null`
- `start_command`: `"npm start"` o `"node {file_ingresso}"`

### Python (Flask/Django/FastAPI) — sempre Docker

- **Flask**: cerca `from flask import` o `Flask(__name__)` nei file `.py`.
- **Django**: cerca `django` in `requirements.txt` e verifica la presenza di `manage.py`.
- **FastAPI**: cerca `from fastapi import` o `FastAPI()` nei file `.py`.

Valori da impostare:
- `name`: `"flask"`, `"django"` o `"fastapi"`
- `has_ssr`: `false`
- `has_api_routes`: `true`
- `build_command`: `null`
- `output_dir`: `null`
- `start_command`:
  - Flask: `"python -m flask run --host=0.0.0.0 --port=8080"` (oppure `"gunicorn app:app"` se `gunicorn` e' nelle dipendenze)
  - Django: `"python manage.py runserver 0.0.0.0:8080"` (oppure `"gunicorn {nome_progetto}.wsgi"` se `gunicorn` e' nelle dipendenze)
  - FastAPI: `"uvicorn main:app --host 0.0.0.0 --port 8080"` (cerca il file che contiene `FastAPI()` per determinare il modulo, es. `app.main:app`)

### HTML/CSS/JS puro — sempre statico

- Non serve build.
- La cartella stessa e' l'output.

Valori da impostare:
- `name`: `"static-html"`
- `has_ssr`: `false`
- `has_api_routes`: `false`
- `build_command`: `null`
- `output_dir`: `"."` (la root del progetto)
- `start_command`: `null`

## Passo 4: Progetto non riconosciuto

Se dopo i Passi 1-3 non riesci a identificare nessun framework o tipo di progetto, imposta:

- `name`: `"unknown"`
- `version`: `null`
- `has_ssr`: `false`
- `has_api_routes`: `false`
- `build_command`: `null`
- `output_dir`: `null`
- `start_command`: `null`

In questo caso, chiedi all'utente di specificare:
1. Di che tipo di progetto si tratta
2. Qual e' il comando di build (se presente)
3. Qual e' la cartella di output
4. Se il progetto necessita di un server (e quale comando lo avvia)

Non procedere con il deploy fino a quando l'utente non fornisce queste informazioni.

## Passo 5: Rilevamento versione Node

Controlla nell'ordine (fermati al primo trovato):

1. `.nvmrc` → contiene la versione (es. `20`, `18.17.0`).
2. `.node-version` → contiene la versione.
3. `engines.node` in `package.json` → contiene un range (es. `>=18`, `^20.0.0`). Usa la versione major.
4. Default: `20` (LTS corrente).

Imposta il campo `node_version` con la versione major trovata (es. `"20"`, `"18"`).
