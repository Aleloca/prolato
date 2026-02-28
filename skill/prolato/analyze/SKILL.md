---
name: prolato-analyze
description: Analizza il progetto corrente per determinare framework, database e strategia di deploy
---

# Analisi Progetto

Analizza il progetto nella directory corrente e produci un report JSON.

## Flusso

1. Leggi e segui `detect-framework.md` → ottieni info framework
2. Leggi e segui `detect-database.md` → ottieni info database
3. Leggi e segui `decide-strategy.md` → ottieni strategia

## Output

Produci questo JSON e comunicalo al flusso di deploy:

```json
{
    "project_name_suggestion": "nome-derivato-dalla-cartella",
    "framework": {
        "name": "react-vite | nextjs | express | ...",
        "version": "x.y.z",
        "has_ssr": false,
        "has_api_routes": false,
        "build_command": "npm run build",
        "output_dir": "dist",
        "start_command": null
    },
    "database": null,
    "deploy_strategy": "static | docker",
    "needs_docker": false,
    "node_version": "20",
    "env_vars": {}
}
```
