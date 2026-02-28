---
name: prolato-manage
description: Gestione progetti deployati (lista, elimina, aggiorna, rollback, logs, stato)
---

# Gestione Progetti

Leggi `~/.deploy-config.json` per ottenere `webhook_url` e `deploy_token`.

## Lista progetti

```bash
curl -s -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    "{WEBHOOK_URL}/projects?owner={USERNAME}"
```

Mostra i risultati in formato leggibile:

```
I tuoi progetti:

1. nome-progetto (statico)
   URL: https://nome-progetto.{DOMINIO}
   Repo: https://git.{DOMINIO}/{USERNAME}/nome-progetto
   Ultimo deploy: {DATA}
```

## Aggiorna progetto

E' un re-deploy. Chiedi quale progetto aggiornare (mostra la lista), poi esegui il flusso di deploy normale (analyze → deploy). Il nome progetto e il repo Gitea esistono gia'.

## Elimina progetto

**IMPORTANTE: chiedi SEMPRE conferma prima di eliminare.**

Mostra chiaramente cosa verra' eliminato, specialmente se c'e' un database con dati.

```bash
curl -s -X DELETE -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    "{WEBHOOK_URL}/projects/{NOME_PROGETTO}"
```

## Rollback

```bash
curl -s -X POST -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    "{WEBHOOK_URL}/projects/{NOME_PROGETTO}/rollback"
```

Mostra il risultato. Informa l'utente che supporta un solo livello di rollback.

## Logs

Solo per progetti Docker.

```bash
curl -s -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    "{WEBHOOK_URL}/projects/{NOME_PROGETTO}/logs?lines=50"
```

Mostra i log all'utente. Utile per debug se il progetto non funziona.

## Stato

```bash
curl -s -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    "{WEBHOOK_URL}/projects/{NOME_PROGETTO}/status"
```

Mostra lo stato: per statico (file presenti o meno), per Docker (container running/stopped).
