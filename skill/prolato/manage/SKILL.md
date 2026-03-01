---
name: prolato-manage
description: Manage deployed projects (list, delete, update, rollback, logs, status)
---

# Project Management

Read `~/.deploy-config.json` to get `webhook_url` and `deploy_token`.

## List Projects

```bash
curl -s -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    "{WEBHOOK_URL}/projects?owner={USERNAME}"
```

Display the results in a readable format:

```
Your projects:

1. project-name (static)
   URL: https://project-name.{DOMAIN}
   Repo: https://git.{DOMAIN}/{USERNAME}/project-name
   Last deploy: {DATE}
```

## Update Project

This is a re-deploy. Ask which project to update (show the list), then execute the normal deploy flow (analyze → deploy). The project name and Gitea repo already exist.

## Delete Project

**IMPORTANT: ALWAYS ask for confirmation before deleting.**

Clearly show what will be deleted, especially if there is a database with data.

```bash
curl -s -X DELETE -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    "{WEBHOOK_URL}/projects/{PROJECT_NAME}?owner={USERNAME}"
```

## Rollback

```bash
curl -s -X POST -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    "{WEBHOOK_URL}/projects/{PROJECT_NAME}/rollback?owner={USERNAME}"
```

Show the result. Inform the user that only one level of rollback is supported.

## Logs

Only for Docker projects.

```bash
curl -s -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    "{WEBHOOK_URL}/projects/{PROJECT_NAME}/logs?lines=50"
```

Show the logs to the user. Useful for debugging if the project is not working.

## Status

```bash
curl -s -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    "{WEBHOOK_URL}/projects/{PROJECT_NAME}/status"
```

Show the status: for static (files present or not), for Docker (container running/stopped).
