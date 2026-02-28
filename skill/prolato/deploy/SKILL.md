---
name: prolato-deploy
description: Esegue il deploy del progetto in base al report dell'analisi
---

# Deploy

## Flusso

1. Leggi il report dell'analisi
2. Se `deploy_strategy == "static"` → leggi e segui `static.md`
3. Se `deploy_strategy == "docker"` → leggi e segui `docker.md`
   - Se `database` presente → leggi e segui anche `database.md`
4. Restituisci URL all'utente
