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
4. Rileva variabili d'ambiente → popola `env_vars`

## Passo 4: Rilevamento variabili d'ambiente

Se esiste `.env.example` nella root del progetto, leggilo e raccogli i nomi di tutte le variabili d'ambiente definite. Per ogni variabile, annota il nome e lascia il valore vuoto (stringa vuota). Queste variabili verranno inserite nel campo `env_vars` dell'output.

Esempio: se `.env.example` contiene:
```
DATABASE_URL=postgresql://localhost:5432/mydb
NEXT_PUBLIC_API_URL=http://localhost:3000/api
SECRET_KEY=changeme
REDIS_URL=redis://localhost:6379
```

Il campo `env_vars` sara':
```json
{
    "DATABASE_URL": "",
    "NEXT_PUBLIC_API_URL": "",
    "SECRET_KEY": "",
    "REDIS_URL": ""
}
```

Se `.env.example` non esiste, imposta `env_vars`: `{}`.

**Attenzione**: non copiare mai i valori reali delle variabili d'ambiente nell'output. Raccogli solo i nomi.

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
