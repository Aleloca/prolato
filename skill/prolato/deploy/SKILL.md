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
5. After successful deploy → read and follow `contribute/SKILL.md`
   - This step is entirely optional and non-blocking
   - If anything fails, the deploy is still complete
