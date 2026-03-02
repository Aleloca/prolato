# Skill File Restructuring Design

## Problema

Con il modulo self-evolving, nuove tecnologie verranno aggiunte continuamente alla skill. I file attuali (specialmente `database.md` a 630 righe e `docker.md` a 522 righe) diventeranno troppo grandi, causando problemi sia per Claude (troppi token, rischio di perdere dettagli) sia per i contributor (conflitti nelle PR, review complesse).

## Soluzione

Approccio ibrido: i file di detection/strategy restano monolitici (sono tabelle compatte), mentre i file con template e configurazioni dettagliate vengono splittati in file per-tecnologia. `docker.md` e `database.md` diventano router con fallback per tecnologie sconosciute.

## Nuova struttura directory

```
skill/prolato/
├── SKILL.md                          (invariato)
├── setup/SKILL.md                    (invariato)
├── contribute/SKILL.md               (invariato)
├── manage/SKILL.md                   (invariato)
├── analyze/
│   ├── SKILL.md                      (invariato)
│   ├── detect-framework.md           (invariato - resta monolitico)
│   ├── detect-database.md            (invariato - resta monolitico)
│   └── decide-strategy.md            (invariato)
├── deploy/
│   ├── SKILL.md                      (invariato)
│   ├── static.md                     (invariato)
│   ├── docker.md                     (diventa ROUTER per Step 2)
│   ├── database.md                   (diventa ROUTER)
│   ├── dockerfiles/
│   │   ├── nextjs.md
│   │   ├── express.md
│   │   ├── fastapi.md
│   │   ├── django.md
│   │   ├── nuxt.md
│   │   ├── sveltekit.md
│   │   └── astro.md
│   └── databases/
│       ├── postgres.md
│       ├── mysql.md
│       ├── mongodb.md
│       ├── redis.md
│       └── sqlite.md
```

## Router database.md

Il file database.md viene svuotato e sostituito con un router:

- Tabella di routing: engine → file (es. postgres → `databases/postgres.md`)
- Per database multipli (es. postgres + redis): legge OGNI file corrispondente e merge i servizi in un unico docker-compose.yml
- Fallback per engine sconosciuti: improvvisa basandosi sui pattern dei file esistenti, completa il deploy, poi il modulo contribute rileva il gap e propone di creare un nuovo file dedicato

Ogni file sotto `databases/` e' autocontenuto: password generation, docker-compose template, healthcheck, volume, env vars, start.sh/migration commands.

## Router docker.md

docker.md mantiene tutti i passi generici del deploy Docker (Steps 1-9: project name, git push, webhook trigger, verify) ma trasforma lo Step 2 (Dockerfile Generation) in un router:

- Tabella di routing: framework → file (es. Next.js SSR → `dockerfiles/nextjs.md`)
- Fallback per framework sconosciuti: legge un file esistente come riferimento, genera un Dockerfile appropriato, completa il deploy, poi il contribute rileva il gap
- Se un Dockerfile esiste gia': mostra e chiede conferma (logica invariata)

Ogni file sotto `dockerfiles/` contiene solo il template Dockerfile specifico per quel framework.

## Impatto sul modulo contribute

Con la struttura splittata, il contribute genera PR piu' pulite:

1. Quando manca un file dedicato (es. CockroachDB), la PR **crea un nuovo file** `databases/cockroachdb.md` invece di modificare un file esistente
2. La PR aggiunge anche una riga alla tabella del router in `database.md`
3. La PR aggiunge una riga di detection in `detect-database.md`

Vantaggi:
- PR piccole e focalizzate (1 nuovo file + 2 righe aggiunte)
- Zero rischio di conflitti (file nuovo)
- Review semplice (un file autocontenuto)
- Contributor paralleli senza conflitti

Richiede aggiornamento dello Step 5 di `contribute/SKILL.md` per istruire Claude a creare nuovi file dedicati quando appropriato.

## File che NON cambiano

- `analyze/detect-framework.md` (221 righe) — tabella di pattern matching, compatta
- `analyze/detect-database.md` (138 righe) — stessa logica
- `analyze/decide-strategy.md` (82 righe) — albero decisionale compatto
- `deploy/static.md` (285 righe) — flusso generico, non ha template per-tecnologia
- `deploy/SKILL.md` — router gia' esistente, invariato
- Tutti i file fuori da `deploy/` — invariati
