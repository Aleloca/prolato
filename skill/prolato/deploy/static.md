# Deploy Statico

Questa guida copre il deploy di siti statici (HTML, CSS, JS). Il progetto viene buildato localmente e la cartella di output viene pushata su un branch `deploy` del repository Gitea.

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

## Passo 2: Installa dipendenze

Rileva il package manager dal lockfile presente nella root del progetto e installa le dipendenze:

| Lockfile presente | Comando |
|---|---|
| `package-lock.json` | `npm install` |
| `yarn.lock` | `yarn install` |
| `pnpm-lock.yaml` | `pnpm install` |

Se nessun lockfile e' presente ma esiste `package.json`, usa `npm install`.

Se non esiste nemmeno `package.json` (es. HTML puro), salta questo passo.

## Passo 3: Build

Esegui il comando di build appropriato in base al framework rilevato dall'analisi.

### Tabella build per framework

| Framework | Comando build | Output directory |
|---|---|---|
| Next.js (statico) | `npx next build` (con `output: 'export'`) | `out/` |
| React (Vite) | `npm run build` | `dist/` |
| React (CRA) | `npm run build` | `build/` |
| Gatsby | `npx gatsby build` | `public/` |
| Astro (statico) | `npm run build` | `dist/` |
| Vue (Vite) | `npm run build` | `dist/` |
| Angular | `npm run build` | `dist/{nome-progetto}/` |
| SvelteKit (statico) | `npm run build` | `build/` |
| HTML puro | Nessun build | `.` (root) |

### Note specifiche per framework

#### Next.js statico

Per Next.js in modalita' statica, e' necessario che `next.config.js` (o `next.config.mjs` o `next.config.ts`) contenga `output: 'export'`.

Controlla il file di configurazione:
- Se `output: 'export'` e' gia' presente → procedi con il build.
- Se `output: 'export'` NON e' presente → aggiungilo automaticamente al file di configurazione prima del build.

Esempio di modifica per `next.config.js`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    // ...altre configurazioni esistenti
}
module.exports = nextConfig
```

Esempio di modifica per `next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    // ...altre configurazioni esistenti
}
export default nextConfig
```

#### Variabili d'ambiente a build time

Alcune variabili d'ambiente devono essere presenti al momento del build perche' vengono incorporate nel codice statico generato:

- `NEXT_PUBLIC_*` — variabili pubbliche Next.js
- `VITE_*` — variabili pubbliche Vite
- `REACT_APP_*` — variabili pubbliche Create React App

Se il report dell'analisi contiene `env_vars` con variabili che corrispondono a questi pattern:
1. Chiedi all'utente i valori di queste variabili
2. Impostale come variabili d'ambiente PRIMA di eseguire il build

```bash
export VITE_API_URL="valore-fornito-dall-utente"
npm run build
```

### Verifica build

Dopo il build, verifica che la directory di output esista e contenga almeno un file:

```bash
ls {output_dir}
```

Se la directory non esiste o e' vuota, il build e' fallito. Mostra l'errore all'utente e interrompi il processo.

## Passo 4: Git init e push

### 4.1: Inizializza repository git

Se la cartella NON e' gia' un repository git (non esiste `.git/`):

```bash
git init
```

### 4.2: Crea .gitignore

Se non esiste gia' un `.gitignore`, creane uno appropriato:

```
node_modules/
.env
.env.local
.env.development
.env.production
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.next/
out/
dist/
build/
```

Se `.gitignore` esiste gia', verifica che contenga almeno `node_modules` e `.env`. Se mancano, aggiungili.

### 4.3: Commit sorgente su main

```bash
git add -A
git commit -m "deploy: {project_name} via Prolato"
```

Se il commit fallisce perche' non ci sono modifiche, ignora l'errore e prosegui.

### 4.4: Crea repository Gitea

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

### 4.5: Aggiungi remote

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

### 4.6: Push sorgente su main

```bash
git push -u {remote_name} main
```

Dove `{remote_name}` e' `origin` o `deploy` (in base al passo 4.5).

NON usare `--force` per il push su main.

### 4.7: Push output su branch deploy

Usa `git subtree` per pushare SOLO la cartella di output sul branch `deploy`:

```bash
git subtree push --prefix {output_dir} {remote_name} deploy
```

Se il subtree push fallisce (es. branch `deploy` gia' esistente con storia diversa), usa il metodo alternativo:

```bash
git subtree split --prefix {output_dir} -b deploy-temp
git push {remote_name} deploy-temp:deploy --force
git branch -D deploy-temp
```

**IMPORTANTE**: `--force` e' consentito SOLO per il branch `deploy`, MAI per `main`.

Per HTML puro (output_dir = `.`), non usare subtree. Invece, pusha direttamente:

```bash
git push -u {remote_name} main:deploy --force
```

## Passo 5: Trigger webhook

Invia la richiesta di deploy al server webhook:

```bash
curl -s -X POST "{WEBHOOK_URL}/deploy" \
    -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "project_name": "{project_name}",
        "git_repo_url": "git@git.{DOMINIO}:{username}/{project_name}.git",
        "branch": "deploy",
        "deploy_type": "static",
        "owner": "{username}"
    }'
```

Verifica la risposta:
- Se `status` e' `success` o il codice HTTP e' `200`/`201` → deploy avviato con successo.
- Se errore → mostra il messaggio di errore all'utente.

## Passo 6: Verifica e output

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
