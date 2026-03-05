# Static Deploy

This guide covers the deployment of static sites (HTML, CSS, JS). The project is built locally and the output folder is pushed to a `deploy` branch of the Gitea repository.

## Prerequisites

Read `~/.deploy-config.json` to get the following variables:

- `{GITEA_URL}` → field `gitea_url`
- `{USER_TOKEN}` → field `gitea_token`
- `{DOMAIN}` → field `domain`
- `{WEBHOOK_URL}` → field `webhook_url`
- `{DEPLOY_TOKEN}` → field `deploy_token`
- `{username}` → field `gitea_username`

## Step 1: Project Name

Read and follow `project-name.md` for name selection, validation, and availability check.

## Step 2: Install Dependencies

Detect the package manager from the lockfile present in the project root and install dependencies:

| Lockfile present | Command |
|---|---|
| `package-lock.json` | `npm install` |
| `yarn.lock` | `yarn install` |
| `pnpm-lock.yaml` | `pnpm install` |

If no lockfile is present but `package.json` exists, use `npm install`.

If `package.json` doesn't exist either (e.g., pure HTML), skip this step.

## Step 3: Build

Run the appropriate build command based on the framework detected by the analysis.

### Build Table by Framework

| Framework | Build command | Output directory |
|---|---|---|
| Next.js (static) | `npx next build` (with `output: 'export'`) | `out/` |
| React (Vite) | `npm run build` | `dist/` |
| React (CRA) | `npm run build` | `build/` |
| Gatsby | `npx gatsby build` | `public/` |
| Astro (static) | `npm run build` | `dist/` |
| Vue (Vite) | `npm run build` | `dist/` |
| Angular | `npm run build` | `dist/{project-name}/` |
| SvelteKit (static) | `npm run build` | `build/` |
| Pure HTML | No build | `.` (root) |

### Framework-Specific Notes

#### Static Next.js

For Next.js in static mode, `next.config.js` (or `next.config.mjs` or `next.config.ts`) must contain `output: 'export'`.

Check the configuration file:
- If `output: 'export'` is already present → proceed with the build.
- If `output: 'export'` is NOT present → add it automatically to the configuration file before building.

Example modification for `next.config.js`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    // ...other existing configurations
}
module.exports = nextConfig
```

Example modification for `next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    // ...other existing configurations
}
export default nextConfig
```

#### Build-Time Environment Variables

Some environment variables must be present at build time because they are embedded in the generated static code:

- `NEXT_PUBLIC_*` — Next.js public variables
- `VITE_*` — Vite public variables
- `REACT_APP_*` — Create React App public variables

If the analysis report contains `env_vars` with variables matching these patterns:
1. Ask the user for the values of these variables
2. Set them as environment variables BEFORE running the build

```bash
export VITE_API_URL="value-provided-by-user"
npm run build
```

### Build Verification

After the build, verify that the output directory exists and contains at least one file:

```bash
ls {output_dir}
```

If the directory doesn't exist or is empty, the build failed. Show the error to the user and stop the process.

## Step 4: Git Init and Push

Read and follow `git-push.md` for git init, .gitignore, commit, Gitea repo creation, remote setup, and push to main.

Then push the output to the deploy branch:

Use `git subtree` to push ONLY the output folder to the `deploy` branch:

```bash
git subtree push --prefix {output_dir} {remote_name} deploy
```

If the subtree push fails (e.g., `deploy` branch already exists with different history), use the alternative method:

```bash
git subtree split --prefix {output_dir} -b deploy-temp
git push {remote_name} deploy-temp:deploy --force
git branch -D deploy-temp
```

**IMPORTANT**: `--force` is allowed ONLY for the `deploy` branch, NEVER for `main`.

For pure HTML (output_dir = `.`), don't use subtree. Instead, push directly:

```bash
git push -u {remote_name} main:deploy --force
```

## Step 5: Trigger Webhook

Send the deploy request to the webhook server:

```bash
curl -s -X POST "{WEBHOOK_URL}/deploy" \
    -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "project_name": "{project_name}",
        "git_repo_url": "git@git.{DOMAIN}:{username}/{project_name}.git",
        "branch": "deploy",
        "deploy_type": "static",
        "owner": "{username}"
    }'
```

Verify the response:
- If `status` is `success` or HTTP code is `200`/`201` → deploy started successfully.
- If error → show the error message to the user.

## Step 6: Verify and Output

Wait a few seconds and verify the site is reachable:

```bash
curl -s -o /dev/null -w "%{http_code}" "https://{project_name}.{DOMAIN}"
```

Show the user the final result:

```
Deploy completed successfully!

Site URL:    https://{project_name}.{DOMAIN}
Repository:  {GITEA_URL}/{username}/{project_name}

The site is now reachable at the URL above.
To update the site, run the deploy again with Prolato.
```

If the site is not yet reachable, inform the user that the deploy may take a few minutes to propagate and the URL will be active soon.
