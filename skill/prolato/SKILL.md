---
name: prolato
description: Deploy automatico di progetti web su server interno. Usa questo comando per deployare, aggiornare, eliminare o gestire i tuoi progetti.
---

# Prolato — Deploy Automatico

Questa skill gestisce il deploy automatico di progetti web su un server self-hosted.

## Configurazione

La configurazione si trova in `~/.deploy-config.json`. Se non esiste, esegui prima il setup.

Leggi il file `~/.deploy-config.json` per ottenere le credenziali necessarie.

## Flusso decisionale

1. **Controlla configurazione**: leggi `~/.deploy-config.json`
   - Se NON esiste → leggi e segui `setup/SKILL.md`
   - Se esiste → prosegui

2. **Determina l'azione** dall'input dell'utente:
   - "deploya" / "pubblica" / "metti online" / "deploy" → vai al punto 3
   - "aggiorna" / "update" / "rideploya" → vai al punto 3 (e' un re-deploy)
   - "lista progetti" / "i miei progetti" / "projects" → leggi e segui `manage/SKILL.md` sezione Lista
   - "elimina" / "rimuovi" / "delete" → leggi e segui `manage/SKILL.md` sezione Elimina
   - "rollback" / "torna indietro" → leggi e segui `manage/SKILL.md` sezione Rollback
   - "logs" / "log" → leggi e segui `manage/SKILL.md` sezione Logs
   - "stato" / "status" → leggi e segui `manage/SKILL.md` sezione Stato

3. **Analizza il progetto**: leggi e segui `analyze/SKILL.md`
   - Questo produce un report JSON con framework, database e strategia di deploy

4. **Esegui il deploy**: leggi e segui `deploy/SKILL.md`
   - Passa il report dell'analisi al deploy

5. **Restituisci l'URL** all'utente
