# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prolato is a self-hosted platform for automatic web project deployment, integrated as a Claude Code skill. Users tell Claude "deploy this project" and the skill analyzes the project, pushes to a self-hosted Gitea instance, and deploys via a webhook server with automatic subdomain routing.

## Repository Structure

- **`webhook/`** — Node.js/Express deployment server (ES modules, plain JS). Receives deploy requests, manages Docker/static projects, configures Caddy reverse proxy, and tracks projects in a JSON registry.
- **`webapp/`** — Next.js 16 static site (TypeScript, Tailwind CSS v4, Motion). Documentation website exported as static HTML (`output: 'export'`).
- **`skill/`** — Claude Code skill definition (Markdown files). Hierarchical skill tree: analyze → deploy → manage. Entry point is `skill/prolato/SKILL.md`.
- **`setup/`** — VPS provisioning bash script (`setup.sh`).
- **`docs/plans/`** — Design and implementation plan documents.

## Commands

### Webhook server (`cd webhook`)
```bash
npm run dev          # Start with --watch for auto-reload
npm start            # Production start
npm test             # Run all tests (vitest run)
npm run test:watch   # Watch mode (vitest)
```

### Webapp (`cd webapp`)
```bash
npm run dev    # Next.js dev server (localhost:3000)
npm run build  # Static export to out/
npm run lint   # ESLint
```

## Architecture Notes

### Webhook Server
- **Dependency injection pattern**: `createApp()` in `server.js` accepts `{config, registry, lock, logger, caddy, shell}` — all library modules from `src/lib/`. Tests use this to inject mocks.
- **API routes**: `/health` (no auth), then all routes behind Bearer token auth. Key endpoints: `POST /deploy`, `GET /projects`, `GET /projects/:name/logs`, `POST /projects/:name/rollback`, `DELETE /projects/:name`.
- **Deployer** (`src/lib/deployer.js`): Orchestrates the full deploy pipeline — Gitea repo creation, Docker build or static file copy, Caddy config generation.
- **Registry** (`src/lib/registry.js`): JSON file-based project store with owner-based access control.
- **Lock** (`src/lib/lock.js`): File-based locking to prevent concurrent deploys of the same project.
- **Config**: Environment variables defined in `.env` (see `.env.example`).

### Skill System
- Skills are hierarchical Markdown files with `SKILL.md` as entry points per directory.
- Flow: config check → action routing → project analysis (framework/database detection) → deploy execution → URL returned.
- Deploy strategies: `static` (plain files to Caddy) or `docker` (Dockerfile templates per framework in `deploy/dockerfiles/`).
- Supported frameworks have Dockerfile templates: Next.js, Nuxt, SvelteKit, Remix, Astro, Django, FastAPI, Flask, Express, NestJS, Go.
- Database templates in `deploy/databases/`: PostgreSQL, MySQL, MariaDB, MongoDB, Redis, SQLite.

### Webapp
- Static export site — no server-side rendering.
- Docs pages under `src/app/docs/` using Next.js App Router.
- `DomainReplacer` component + `useDomain` hook allow docs to show user's actual domain.
