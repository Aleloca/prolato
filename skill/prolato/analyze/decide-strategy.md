# Decisione Strategia di Deploy

Usa le informazioni raccolte da `detect-framework.md` e `detect-database.md` per decidere la strategia di deploy.

## Albero decisionale

Segui questo albero dall'alto verso il basso:

```
Il progetto ha un backend (Express, Fastify, Koa, Hono, Django, Flask, FastAPI)?
├── SI' → deploy_strategy: "docker"
└── NO → Il framework necessita SSR?
    ├── SI' (Next.js con SSR, Nuxt con SSR, SvelteKit con adapter-node, Astro con output server/hybrid) → deploy_strategy: "docker"
    └── NO → Ha un database?
        ├── SI' → Ha SOLO SQLite locale?
        │   ├── SI' → deploy_strategy: "docker"
        │   │   (SQLite necessita un volume persistente, quindi serve Docker anche se l'app e' statica.
        │   │    Eccezione: se l'app e' puramente statica e SQLite e' usato solo in fase di build,
        │   │    si puo' procedere con statico. Verifica controllando se il codice client accede al DB.)
        │   └── NO (Postgres, MySQL, Mongo, Redis) → deploy_strategy: "docker"
        └── NO → deploy_strategy: "static"
```

## Regole riassuntive

| Condizione | Strategia |
|---|---|
| Backend Node.js (Express/Fastify/Koa/Hono) | `docker` |
| Python (Flask/Django/FastAPI) | `docker` |
| Next.js con SSR, API routes o middleware | `docker` |
| Next.js con `output: 'export'` e senza API | `static` |
| Nuxt con `ssr: true` (default) | `docker` |
| Nuxt con `ssr: false` | `static` |
| SvelteKit con `adapter-node` o `adapter-auto` | `docker` |
| SvelteKit con `adapter-static` | `static` |
| Astro con `output: 'server'` o `'hybrid'` | `docker` |
| Astro con `output: 'static'` (default) | `static` |
| Gatsby | `static` |
| React (Vite/CRA) senza backend | `static` |
| Vue (senza Nuxt) | `static` |
| Angular senza Angular Universal | `static` |
| HTML/CSS/JS puro | `static` |
| Qualsiasi progetto con database Postgres/MySQL/Mongo/Redis | `docker` |
| Qualsiasi progetto con solo SQLite locale | `docker` |
| Docker generico (solo Dockerfile) | `docker` |

## Output

Produci questo JSON:

```json
{
    "deploy_strategy": "static | docker",
    "needs_docker": true | false,
    "docker_services": ["app", "db", "redis"],
    "build_locally": true | false,
    "static_output_dir": "out | dist | build | public | null"
}
```

### Dettagli sui campi

- **`deploy_strategy`**: `"static"` o `"docker"`. Determinato dall'albero decisionale sopra.

- **`needs_docker`**: `true` se `deploy_strategy` e' `"docker"`, `false` altrimenti. Corrisponde sempre alla strategia.

- **`docker_services`**: lista dei servizi Docker necessari. Imposta cosi':
  - Se `deploy_strategy` e' `"static"` → `[]`
  - Se `deploy_strategy` e' `"docker"` → sempre almeno `["app"]`
  - Se c'e' un database PostgreSQL o MySQL → aggiungi `"db"`
  - Se c'e' MongoDB → aggiungi `"mongo"`
  - Se c'e' Redis → aggiungi `"redis"`
  - Esempio con app + PostgreSQL + Redis: `["app", "db", "redis"]`

- **`build_locally`**: determina dove avviene la build.
  - `true` per progetti statici: la build avviene sulla macchina dello sviluppatore prima del push. Il risultato (la cartella di output) viene poi pushato al server.
  - `false` per progetti Docker: la build avviene sul server all'interno del container.

- **`static_output_dir`**: la cartella contenente i file statici da pushare.
  - Se `deploy_strategy` e' `"static"` → imposta alla cartella di output del framework (es. `"dist"`, `"build"`, `"out"`, `"public"`, `"."`).
  - Se `deploy_strategy` e' `"docker"` → `null`.
  - Usa il valore `output_dir` determinato in `detect-framework.md`.
