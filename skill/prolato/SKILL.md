---
name: prolato
description: Automatic deployment of web projects to an internal server. Use this command to deploy, update, delete, or manage your projects.
---

# Prolato — Automatic Deployment

This skill handles automatic deployment of web projects to a self-hosted server.

## Configuration

The configuration is stored in `~/.deploy-config.json`. If it doesn't exist, run the setup first.

Read the file `~/.deploy-config.json` to get the required credentials.

## Decision Flow

1. **Check configuration**: read `~/.deploy-config.json`
   - If it does NOT exist → read and follow `setup/SKILL.md`
   - If it exists → continue

2. **Determine the action** from user input:
   - "deploy" / "publish" / "put online" → go to step 3
   - "update" / "redeploy" → go to step 3 (it's a re-deploy)
   - "list projects" / "my projects" / "projects" → read and follow `manage/SKILL.md` List section
   - "delete" / "remove" → read and follow `manage/SKILL.md` Delete section
   - "rollback" / "revert" → read and follow `manage/SKILL.md` Rollback section
   - "logs" / "log" → read and follow `manage/SKILL.md` Logs section
   - "status" → read and follow `manage/SKILL.md` Status section

3. **Analyze the project**: read and follow `analyze/SKILL.md`
   - This produces a JSON report with framework, database, and deploy strategy

4. **Execute the deploy**: read and follow `deploy/SKILL.md`
   - Pass the analysis report to the deploy

5. **Return the URL** to the user
