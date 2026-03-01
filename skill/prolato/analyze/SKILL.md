---
name: prolato-analyze
description: Analyze the current project to determine framework, database, and deploy strategy
---

# Project Analysis

Analyze the project in the current directory and produce a JSON report.

## Flow

1. Read and follow `detect-framework.md` → get framework info
2. Read and follow `detect-database.md` → get database info
3. Read and follow `decide-strategy.md` → get strategy
4. Detect environment variables → populate `env_vars`

## Step 4: Environment Variable Detection

If `.env.example` exists in the project root, read it and collect the names of all defined environment variables. For each variable, note the name and leave the value empty (empty string). These variables will go into the `env_vars` field of the output.

Example: if `.env.example` contains:
```
DATABASE_URL=postgresql://localhost:5432/mydb
NEXT_PUBLIC_API_URL=http://localhost:3000/api
SECRET_KEY=changeme
REDIS_URL=redis://localhost:6379
```

The `env_vars` field will be:
```json
{
    "DATABASE_URL": "",
    "NEXT_PUBLIC_API_URL": "",
    "SECRET_KEY": "",
    "REDIS_URL": ""
}
```

If `.env.example` does not exist, set `env_vars`: `{}`.

**Warning**: never copy actual environment variable values into the output. Collect only the names.

## Output

Produce this JSON and pass it to the deploy flow:

```json
{
    "project_name_suggestion": "name-derived-from-folder",
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
    "node_version": "22",
    "env_vars": {}
}
```
