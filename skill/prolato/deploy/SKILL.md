---
name: prolato-deploy
description: Execute the project deploy based on the analysis report
---

# Deploy

## Flow

1. Read the analysis report
2. If `deploy_strategy == "static"` → read and follow `static.md`
3. If `deploy_strategy == "docker"` → read and follow `docker.md`
   - If `database` is present → also read and follow `database.md`
4. Return URL to the user
