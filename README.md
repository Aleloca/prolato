# Prolato

Piattaforma self-hosted per il deploy automatico di progetti web, integrata come skill di Claude Code.

## Cosa fa Prolato

- **Analizza automaticamente** il framework e il database del tuo progetto
- **Deploya progetti statici e Docker** con un singolo comando
- **Genera URL istantanei** con sottodominio automatico (es. `mio-progetto.tuodominio.dev`)
- **Gestione completa**: rollback, logs, stato, eliminazione

## Quick start

Consulta la [documentazione completa](https://prolato.dev/docs/overview) per iniziare.

## Struttura del repository

```
prolato/
├── webhook/     # Server Node.js/Express per gestire i deploy
├── skill/       # Skill Claude Code (file Markdown di istruzioni)
├── setup/       # Script di provisioning VPS
└── webapp/      # Sito web Next.js con documentazione
```

## Requisiti

- VPS con Ubuntu 22.04+ (o Debian 12+)
- Dominio con DNS su Cloudflare
- Claude Code installato

## Come funziona

1. Configura il VPS con lo script di setup
2. Installa la skill Prolato in Claude Code
3. Nella cartella del tuo progetto, di' a Claude: *"deploya questo progetto"*

## Documentazione

La documentazione completa è disponibile su [prolato.dev/docs](https://prolato.dev/docs/overview).

## Licenza

[MIT](LICENSE)
