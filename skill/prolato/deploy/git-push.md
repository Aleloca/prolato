# Git Init and Push

## Initialize Git Repository

If the folder is NOT already a git repository (`.git/` doesn't exist):

```bash
git init
```

## Create .gitignore

If a `.gitignore` doesn't already exist, create an appropriate one:

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
*.log
__pycache__/
*.pyc
.venv/
venv/
```

If `.gitignore` already exists, verify it contains at least `node_modules`, `.env`, and `.env.production`. If missing, add them.

## Ensure Sensitive Files Are Never Committed

**BEFORE running `git add`**, verify that `.env.production` is in `.gitignore`:

```bash
grep -q '\.env\.production' .gitignore || echo '.env.production' >> .gitignore
```

Also ensure `.env` is in `.gitignore`:

```bash
grep -q '^\.env$' .gitignore || echo '.env' >> .gitignore
```

## Stage and Commit

```bash
git add -A
```

**Security check**: verify that `.env.production` was not accidentally staged:

```bash
git diff --cached --name-only | grep '.env.production'
```

If found among staged files, remove it BEFORE committing:

```bash
git rm --cached .env.production
```

Then commit:

```bash
git commit -m "deploy: {project_name} via Prolato"
```

If the commit fails because there are no changes, ignore the error and continue.

## Create Gitea Repository

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

If the repository already exists (error 409), continue without error.

## Add Remote

Check if an `origin` remote already exists:

```bash
git remote get-url origin 2>/dev/null
```

- If `origin` does NOT exist → add as `origin`:
  ```bash
  git remote add origin git@git.{DOMAIN}:{username}/{project_name}.git
  ```

- If `origin` ALREADY EXISTS (and points to a different URL) → add as `deploy`:
  ```bash
  git remote add deploy git@git.{DOMAIN}:{username}/{project_name}.git
  ```
  In this case, use `deploy` instead of `origin` in all subsequent commands.

If the remote already exists and points to the same URL, do nothing.

## Push to Main

```bash
git push -u {remote_name} main
```

Where `{remote_name}` is `origin` or `deploy` (based on above).

**Do NOT use `--force`** for pushing to main. If the push fails due to conflicts, notify the user.
