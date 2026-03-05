# Framework Detection

Follow these rules in the order shown to determine the project's framework.

## Step 1: Check `package.json`

If `package.json` exists in the project root, read it and look in `dependencies` and `devDependencies`:

| Dependency in `dependencies` or `devDependencies` | Framework |
|---|---|
| `next` | Next.js |
| `@remix-run/react` | Remix |
| `gatsby` | Gatsby |
| `nuxt` | Nuxt.js |
| `@sveltejs/kit` | SvelteKit |
| `astro` | Astro |
| `vite` + `react` (without any framework above) | React (Vite) |
| `react-scripts` | React (Create React App) |
| `vite` + `vue` (without Nuxt) | Vue (Vite) |
| `@angular/core` | Angular |
| `@nestjs/core` | NestJS |
| `express` or `fastify` or `koa` or `hono` (without any frontend framework above) | Backend Node.js |

The table is in priority order: if you find both `next` and `react`, the framework is Next.js (not React).

### Framework Version Detection

After identifying the framework, detect its version from the corresponding field in `package.json` (`dependencies` or `devDependencies`). Extract the numeric version by removing prefixes like `^`, `~`, `>=`, etc.

Examples:
- `"next": "^14.0.0"` → `version`: `"14.0.0"`
- `"react": "~18.2.0"` → `version`: `"18.2.0"`
- `"express": "4.18.2"` → `version`: `"4.18.2"`
- `"astro": ">=4.0.0"` → `version`: `"4.0.0"`

If the version cannot be determined (e.g., `"*"` or `"latest"`), set `version`: `null`.

## Step 2: If `package.json` Does Not Exist

Check for the presence of these files/folders:

| File/folder present | Project type |
|---|---|
| `index.html` in root | Static HTML/CSS/JS |
| `requirements.txt` or `pyproject.toml` or `Pipfile` | Python (Flask/Django/FastAPI) |
| `go.mod` | Go |
| `Dockerfile` (and nothing else recognizable) | Generic Docker |

## Step 3: Additional Information Per Framework

### Next.js — determine if static or dynamic

Run these checks in order. If you find even one condition requiring SSR, the project needs Docker.

- Look for `getServerSideProps` or `getInitialProps` in any file under `pages/` or `src/pages/`. If found → SSR, needs Docker.
- Look for files under `app/` or `src/app/` with `export const dynamic = 'force-dynamic'` or `export const revalidate = 0`. If found → SSR, needs Docker.
- Look for files under `app/api/` or `pages/api/`. If found → has API routes, needs Docker.
- Look for `middleware.ts` or `middleware.js` in the root or in `src/`. If found → needs Docker.
- Check `next.config.js` or `next.config.mjs`: if it contains `output: 'export'` → explicitly static.
- If none of the conditions above → consider static and use `next build` with export output.

Values to set:
- `has_ssr`: `true` if SSR conditions found, otherwise `false`
- `has_api_routes`: `true` if `app/api/` or `pages/api/` folder found
- `build_command`: `"npm run build"`
- `output_dir`: `"out"` (if static with export), `".next"` (if SSR/Docker)
- `start_command`: `"npm start"` (if SSR/Docker), `null` (if static)

### React (Vite / CRA) — almost always static

- Build command: `npm run build`.
- Output: `dist/` (Vite) or `build/` (CRA).
- Exception: if there are files importing `express` and there's a `server.js` → has integrated backend, needs Docker.

Values to set:
- `has_ssr`: `false`
- `has_api_routes`: `false`
- `build_command`: `"npm run build"`
- `output_dir`: `"dist"` (Vite) or `"build"` (CRA)
- `start_command`: `null` (static) or `"node server.js"` (if has backend)

### Gatsby — always static

- Build command: `gatsby build`.
- Output: `public/`.

Values to set:
- `has_ssr`: `false`
- `has_api_routes`: `false`
- `build_command`: `"gatsby build"`
- `output_dir`: `"public"`
- `start_command`: `null`

### Astro — check mode

- Check `astro.config.mjs` (or `astro.config.ts`): if it contains `output: 'server'` or `output: 'hybrid'` → needs Docker.
- Default (`output: 'static'` or not specified) → static.
- Output: `dist/`.

Values to set:
- `has_ssr`: `true` if `output` is `'server'` or `'hybrid'`, otherwise `false`
- `has_api_routes`: `false`
- `build_command`: `"npm run build"`
- `output_dir`: `"dist"`
- `start_command`: `"node ./dist/server/entry.mjs"` (if SSR), `null` (if static)

### Vue (Nuxt) — check mode

- Check `nuxt.config.ts` (or `nuxt.config.js`): if `ssr: false` → static, use `nuxt generate`, output `.output/public/`.
- If `ssr: true` (default) → needs Docker.

Values to set for Nuxt:
- `has_ssr`: value of `ssr` in config (default `true`)
- `has_api_routes`: check if files exist in `server/api/`
- `build_command`: `"nuxt generate"` (static) or `"nuxt build"` (SSR)
- `output_dir`: `".output/public"` (static) or `".output"` (SSR)
- `start_command`: `"node .output/server/index.mjs"` (SSR), `null` (static)

Values to set for Vue (without Nuxt):
- `has_ssr`: `false`
- `has_api_routes`: `false`
- `build_command`: `"npm run build"`
- `output_dir`: `"dist"`
- `start_command`: `null`

### Angular — almost always static

- Build command: `ng build` or `npm run build`.
- Output: `dist/{project-name}/`. To find the project name, read `angular.json` and look for the main project name under `projects`.

Values to set:
- `has_ssr`: `false` (unless using Angular Universal — look for `@nguniversal` in dependencies)
- `has_api_routes`: `false`
- `build_command`: `"npm run build"`
- `output_dir`: `"dist/{project-name}"` (or `"dist/{project-name}/browser"` for Angular 17+)
- `start_command`: `null` (static), `"node dist/{project-name}/server/main.js"` (if SSR)

### SvelteKit — check adapter

- Check `svelte.config.js`: look for which adapter is used.
  - If using `@sveltejs/adapter-static` → static.
  - If using `@sveltejs/adapter-node` → needs Docker.
  - If using `@sveltejs/adapter-auto` → needs Docker (to be safe).

Values to set:
- `has_ssr`: `true` if using `adapter-node` or `adapter-auto`, `false` if using `adapter-static`
- `has_api_routes`: check if `+server.ts`/`+server.js` files exist under `src/routes/`
- `build_command`: `"npm run build"`
- `output_dir`: `"build"` (static with adapter-static) or `"build"` (Docker with adapter-node)
- `start_command`: `"node build"` (adapter-node), `null` (adapter-static)

### Remix — always Docker

- Build command: `npm run build`.
- Output: `build/`.
- Always needs Docker (SSR framework).

Values to set:
- `has_ssr`: `true`
- `has_api_routes`: `true` (Remix uses loaders/actions as server-side data fetching)
- `build_command`: `"npm run build"`
- `output_dir`: `"build"`
- `start_command`: `"npx remix-serve build/server/index.js"`

### NestJS — always Docker

- NestJS is a TypeScript backend framework. Always needs Docker.
- Build command: `npm run build`.
- Output: `dist/`.
- Entry: `dist/main.js`.
- Default port: `3000` (check `main.ts` for `app.listen()`).

Values to set:
- `has_ssr`: `false`
- `has_api_routes`: `true`
- `build_command`: `"npm run build"`
- `output_dir`: `null`
- `start_command`: `"node dist/main.js"`

### Backend Node.js (Express/Fastify/Koa/Hono) — always Docker

- Find the entry file: `main` field in `package.json`, or `server.js`, `index.js`, `app.js`.
- Identify the port: look for `listen(`, `PORT`, `process.env.PORT`.
- Start command: `node {entry_file}` or the `start` script in `package.json`.

Values to set:
- `has_ssr`: `false`
- `has_api_routes`: `true`
- `build_command`: `build` script in `package.json` if it exists, otherwise `null`
- `output_dir`: `null`
- `start_command`: `"npm start"` or `"node {entry_file}"`

### Python (Flask/Django/FastAPI) — always Docker

- **Flask**: look for `from flask import` or `Flask(__name__)` in `.py` files.
- **Django**: look for `django` in `requirements.txt` and verify `manage.py` exists.
- **FastAPI**: look for `from fastapi import` or `FastAPI()` in `.py` files.

Values to set:
- `name`: `"flask"`, `"django"` or `"fastapi"`
- `has_ssr`: `false`
- `has_api_routes`: `true`
- `build_command`: `null`
- `output_dir`: `null`
- `start_command`:
  - Flask: `"python -m flask run --host=0.0.0.0 --port=8080"` (or `"gunicorn app:app"` if `gunicorn` is in dependencies)
  - Django: `"python manage.py runserver 0.0.0.0:8080"` (or `"gunicorn {project_name}.wsgi"` if `gunicorn` is in dependencies)
  - FastAPI: `"uvicorn main:app --host 0.0.0.0 --port 8080"` (look for the file containing `FastAPI()` to determine the module, e.g., `app.main:app`)

### Go (Gin/Echo/Fiber/Chi/net/http) — always Docker

- Read `go.mod` for the Go version (the `go` directive, e.g., `go 1.22`).
- Detect framework by scanning `.go` files for imports:
  - `github.com/gin-gonic/gin` → Gin
  - `github.com/labstack/echo` → Echo
  - `github.com/gofiber/fiber` → Fiber
  - `github.com/go-chi/chi` → Chi
  - `net/http` (without any framework above) → Standard library
- Find the entry file: typically `main.go` in root or `cmd/server/main.go`.
- Default port: `8080`.

Values to set:
- `name`: `"go"` (append framework name if detected, e.g., `"go-gin"`)
- `has_ssr`: `false`
- `has_api_routes`: `true`
- `build_command`: `null` (built inside Docker)
- `output_dir`: `null`
- `start_command`: `"./server"` (the compiled binary)

### Pure HTML/CSS/JS — always static

- No build needed.
- The folder itself is the output.

Values to set:
- `name`: `"static-html"`
- `has_ssr`: `false`
- `has_api_routes`: `false`
- `build_command`: `null`
- `output_dir`: `"."` (the project root)
- `start_command`: `null`

## Step 4: Unrecognized Project

If after Steps 1-3 you cannot identify any framework or project type, set:

- `name`: `"unknown"`
- `version`: `null`
- `has_ssr`: `false`
- `has_api_routes`: `false`
- `build_command`: `null`
- `output_dir`: `null`
- `start_command`: `null`

In this case, ask the user to specify:
1. What type of project it is
2. What the build command is (if any)
3. What the output folder is
4. Whether the project needs a server (and which command starts it)

Do not proceed with the deploy until the user provides this information.

## Step 5: Node Version Detection

Check in this order (stop at the first found):

1. `.nvmrc` → contains the version (e.g., `22`, `20.17.0`).
2. `.node-version` → contains the version.
3. `engines.node` in `package.json` → contains a range (e.g., `>=20`, `^22.0.0`). Use the major version.
4. Default: `22` (current LTS).

Set the `node_version` field with the **major version only** (e.g., `"22"`, `"20"`). This is important because Dockerfile templates use `node:{NODE_VERSION}-alpine`, and only major versions are guaranteed to have corresponding Alpine images on Docker Hub. If the source specifies `20.17.0`, extract just `20`.
