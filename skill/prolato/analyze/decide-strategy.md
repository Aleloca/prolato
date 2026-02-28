# Deploy Strategy Decision

Use the information gathered from `detect-framework.md` and `detect-database.md` to decide the deploy strategy.

## Decision Tree

Follow this tree from top to bottom:

```
Does the project have a backend (Express, Fastify, Koa, Hono, Django, Flask, FastAPI)?
├── YES → deploy_strategy: "docker"
└── NO → Does the framework need SSR?
    ├── YES (Next.js with SSR, Nuxt with SSR, SvelteKit with adapter-node, Astro with output server/hybrid) → deploy_strategy: "docker"
    └── NO → Does it have a database?
        ├── YES → Does it have ONLY local SQLite?
        │   ├── YES → deploy_strategy: "docker"
        │   │   (SQLite needs a persistent volume, so Docker is needed even if the app is static.
        │   │    Exception: if the app is purely static and SQLite is only used at build time,
        │   │    you can proceed with static. Verify by checking if client code accesses the DB.)
        │   └── NO (Postgres, MySQL, Mongo, Redis) → deploy_strategy: "docker"
        └── NO → deploy_strategy: "static"
```

## Summary Rules

| Condition | Strategy |
|---|---|
| Backend Node.js (Express/Fastify/Koa/Hono) | `docker` |
| Python (Flask/Django/FastAPI) | `docker` |
| Next.js with SSR, API routes, or middleware | `docker` |
| Next.js with `output: 'export'` and no API | `static` |
| Nuxt with `ssr: true` (default) | `docker` |
| Nuxt with `ssr: false` | `static` |
| SvelteKit with `adapter-node` or `adapter-auto` | `docker` |
| SvelteKit with `adapter-static` | `static` |
| Astro with `output: 'server'` or `'hybrid'` | `docker` |
| Astro with `output: 'static'` (default) | `static` |
| Gatsby | `static` |
| React (Vite/CRA) without backend | `static` |
| Vue (without Nuxt) | `static` |
| Angular without Angular Universal | `static` |
| Pure HTML/CSS/JS | `static` |
| Any project with Postgres/MySQL/Mongo/Redis database | `docker` |
| Any project with only local SQLite | `docker` |
| Generic Docker (Dockerfile only) | `docker` |

## Output

Produce this JSON:

```json
{
    "deploy_strategy": "static | docker",
    "needs_docker": true | false,
    "docker_services": ["app", "db", "redis"],
    "build_locally": true | false,
    "static_output_dir": "out | dist | build | public | null"
}
```

### Field Details

- **`deploy_strategy`**: `"static"` or `"docker"`. Determined by the decision tree above.

- **`needs_docker`**: `true` if `deploy_strategy` is `"docker"`, `false` otherwise. Always matches the strategy.

- **`docker_services`**: list of required Docker services. Set as follows:
  - If `deploy_strategy` is `"static"` → `[]`
  - If `deploy_strategy` is `"docker"` → always at least `["app"]`
  - If there's a PostgreSQL or MySQL database → add `"db"`
  - If there's MongoDB → add `"mongo"`
  - If there's Redis → add `"redis"`
  - Example with app + PostgreSQL + Redis: `["app", "db", "redis"]`

- **`build_locally`**: determines where the build happens.
  - `true` for static projects: the build happens on the developer's machine before pushing. The result (the output folder) is then pushed to the server.
  - `false` for Docker projects: the build happens on the server inside the container.

- **`static_output_dir`**: the folder containing the static files to push.
  - If `deploy_strategy` is `"static"` → set to the framework's output folder (e.g., `"dist"`, `"build"`, `"out"`, `"public"`, `"."`).
  - If `deploy_strategy` is `"docker"` → `null`.
  - Use the `output_dir` value determined in `detect-framework.md`.
