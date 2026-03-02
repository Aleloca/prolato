---
name: prolato-contribute
description: Self-reflection and community contribution after a successful deploy
---

# Contribute — Self-Evolving Skill

This module runs after every successful deploy. It checks whether Claude had to improvise
beyond what is documented in the skill files, and if so, offers the user to contribute
that knowledge back to the Prolato project.

IMPORTANT: This entire flow is optional and non-blocking. If anything fails (no gh CLI,
no network, PR creation error), show a brief informative message and stop. Never let
a contribute error affect the completed deploy.

## Step 1: Check Prerequisites

Run:
```bash
gh auth status 2>&1
```

- If the command fails or `gh` is not found → stop silently. Do NOT show any error.
  The user simply doesn't have gh CLI configured and that's fine.
- If authenticated → continue to Step 2.

## Step 2: Self-Reflection

Re-read the following skill files and compare them against what you ACTUALLY did during this deploy session:

- `analyze/detect-framework.md`
- `analyze/detect-database.md`
- `analyze/decide-strategy.md`
- `deploy/docker.md` (if deploy_strategy was docker)
- `deploy/static.md` (if deploy_strategy was static)
- `deploy/database.md` (if database was present)

Ask yourself: "Did I have to make decisions, generate configurations, or handle technologies
that are NOT covered by the rules and templates written in these files?"

Produce a structured gap analysis:

```json
{
  "has_gaps": true,
  "gaps": [
    {
      "file": "analyze/detect-database.md",
      "description": "Missing detection rule for Redis (dependency: redis/ioredis in package.json)",
      "what_i_did": "Detected Redis via ioredis dependency and REDIS_URL env var"
    },
    {
      "file": "deploy/database.md",
      "description": "Missing docker-compose template for Redis service",
      "what_i_did": "Generated redis:7-alpine service with healthcheck and volume"
    }
  ]
}
```

- If `has_gaps` is false → stop silently. Nothing to contribute.
- If `has_gaps` is true → continue to Step 3.

## Step 3: Ask User Consent

Show the user a message like this (adapt based on actual gaps found):

---

**Prolato Community Contribution**

During this deploy, I handled technologies/configurations not yet documented in the Prolato skill:

- [list each gap in plain language, e.g. "Redis detection and docker-compose configuration"]

Would you like to contribute these improvements to the Prolato project? This will:
- Fork the Prolato repo on your GitHub account (if not already forked)
- Open a PR with the updated skill files
- The PR will be reviewed by the Prolato maintainer before being merged

The PR will contain ONLY generic detection rules and templates — no information about your project, URLs, credentials, or file paths will be included.

**Do you want to contribute?** (yes/no)

---

- If the user says no → say "No problem! Your deploy is complete." and stop.
- If the user says yes → continue to Step 4.

## Step 4: Check for Duplicate PRs

For each gap identified in Step 2, search for open PRs using the specific technology keyword
from the gap analysis (e.g., "redis", "bullmq", "mongodb"):

```bash
gh pr list --repo Aleloca/prolato --state open --search "{technology_keyword}" --json title,url
```

Where `{technology_keyword}` is the main technology name from each gap (e.g., if the gap
describes "Missing detection rule for Redis", search for "redis").

Check if any open PR already covers the same technologies. For example, if there's already
a PR titled "Add Redis support", don't open another one.

- If duplicate found → tell user: "There's already an open PR covering this: {url}. Skipping."
  and stop.
- If no duplicate → continue to Step 5.

## Step 5: Generate Updated Skill Files

For each gap identified in Step 2, generate the updated version of the affected skill file.

CRITICAL RULES:
- ONLY ADD content. Never modify or remove existing rules, templates, or tables.
- Add new rows to existing tables (e.g., new dependency → framework mapping in detect-framework.md)
- Add new sections following the exact same formatting patterns as existing sections
- Add new templates following the exact same structure as existing templates
- Base everything on what ACTUALLY WORKED during this deploy, not speculation
- NEVER include any project-specific information:
  - No project names, URLs, or domains
  - No credentials, tokens, or passwords
  - No file paths from the user's machine
  - No environment variable VALUES (only names/patterns)
  - No git repository URLs from the user's project

## Step 6: Fork and Create PR

6.1 Fork the repo and capture fork info (idempotent):
```bash
FORK=$(gh repo fork Aleloca/prolato --clone=false 2>&1 | grep -o '[^ ]*/prolato' | head -1)
FORK_OWNER=$(echo "$FORK" | cut -d'/' -f1)
```
If the fork already exists, `gh` will print the existing fork name.

6.2 Clone the fork to a temp directory:
```bash
CONTRIB_TMPDIR=$(mktemp -d)
gh repo clone "$FORK" "$CONTRIB_TMPDIR" -- --depth=1
cd "$CONTRIB_TMPDIR"
```

> Note: All subsequent git and gh commands in this section must run from `$CONTRIB_TMPDIR`. Use `cd "$CONTRIB_TMPDIR"` at the start or prefix git commands with `-C "$CONTRIB_TMPDIR"`.

6.3 Create a descriptive branch:
```bash
BRANCH="contrib/add-$(echo '{technologies}' | tr ' ' '-' | tr '[:upper:]' '[:lower:]')-support"
git checkout -b "$BRANCH"
```
Where `{technologies}` is derived from the gap analysis (e.g., "redis-bullmq").

6.4 Apply the updated skill files:
Write the updated content to the corresponding files under `skill/prolato/` in the cloned repo.

6.5 Commit:
```bash
git add skill/prolato/
git commit -m "contrib: add {technologies} detection and deploy support"
```

6.6 Push and create PR:
```bash
git push origin "$BRANCH"

gh pr create \
  --repo Aleloca/prolato \
  --head "$FORK_OWNER:$BRANCH" \
  --title "contrib: add {technologies} support" \
  --body "$(cat <<'EOF'
## Community Contribution (auto-generated)

This PR was automatically generated by the Prolato skill after a successful deploy
that required handling technologies not yet documented in the skill files.

### Changes
- [list each file modified and what was added]

### Technologies Added
- [list technologies, e.g. "Redis detection via redis/ioredis dependency"]

### How This Was Tested
These rules and templates were generated from a real, successful deploy.
They reflect configurations that actually worked in production.

---
*Generated by Prolato self-evolving skill*
EOF
)"
```

6.7 Cleanup:
```bash
rm -rf "$CONTRIB_TMPDIR"
```

6.8 Show result to user:
```
Contribution submitted! PR: {pr_url}
The Prolato maintainer will review your contribution. Thank you!
```

If any step in this section fails, show: "Could not create the PR: {error}. No worries,
your deploy is still complete!" and stop.
