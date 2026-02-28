"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

const BACKUP_SCRIPT = `cat > /opt/scripts/backup.sh << 'SCRIPT'
#!/bin/bash
set -euo pipefail

BACKUP_BASE="/opt/backups"
DATE=$(date +%Y-%m-%d_%H-%M)
RETENTION_DAYS=7

# Crea la directory base se non esiste
mkdir -p "$BACKUP_BASE"

# Loop sui progetti Docker
for PROJECT_DIR in /opt/docker-projects/*/; do
  PROJECT=$(basename "$PROJECT_DIR")
  BACKUP_DIR="$BACKUP_BASE/$PROJECT"
  mkdir -p "$BACKUP_DIR"

  # PostgreSQL
  PG_CONTAINER=$(docker ps --filter "name=\${PROJECT}.*postgres" \\
    --format "{{.Names}}" 2>/dev/null | head -1)
  if [ -n "$PG_CONTAINER" ]; then
    echo "[backup] PostgreSQL: $PROJECT ($PG_CONTAINER)"
    docker exec "$PG_CONTAINER" pg_dump -U app app \\
      | gzip > "$BACKUP_DIR/\${DATE}.sql.gz" \\
      && echo "[backup] OK: $BACKUP_DIR/\${DATE}.sql.gz" \\
      || echo "[backup] ERRORE: backup PostgreSQL fallito per $PROJECT"
  fi

  # MySQL / MariaDB
  MYSQL_CONTAINER=$(docker ps --filter "name=\${PROJECT}.*mysql" \\
    --filter "name=\${PROJECT}.*mariadb" \\
    --format "{{.Names}}" 2>/dev/null | head -1)
  if [ -n "$MYSQL_CONTAINER" ]; then
    echo "[backup] MySQL: $PROJECT ($MYSQL_CONTAINER)"
    docker exec "$MYSQL_CONTAINER" mysqldump -u app -papp app \\
      | gzip > "$BACKUP_DIR/\${DATE}.sql.gz" \\
      && echo "[backup] OK: $BACKUP_DIR/\${DATE}.sql.gz" \\
      || echo "[backup] ERRORE: backup MySQL fallito per $PROJECT"
  fi

  # MongoDB
  MONGO_CONTAINER=$(docker ps --filter "name=\${PROJECT}.*mongo" \\
    --format "{{.Names}}" 2>/dev/null | head -1)
  if [ -n "$MONGO_CONTAINER" ]; then
    echo "[backup] MongoDB: $PROJECT ($MONGO_CONTAINER)"
    docker exec "$MONGO_CONTAINER" mongodump \\
      --archive --gzip --db app \\
      > "$BACKUP_DIR/\${DATE}.archive.gz" \\
      && echo "[backup] OK: $BACKUP_DIR/\${DATE}.archive.gz" \\
      || echo "[backup] ERRORE: backup MongoDB fallito per $PROJECT"
  fi
done

# Pulizia backup vecchi
echo "[backup] Pulizia backup piu' vecchi di $RETENTION_DAYS giorni..."
find "$BACKUP_BASE" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_BASE" -type d -empty -delete

echo "[backup] Completato."
SCRIPT

chmod +x /opt/scripts/backup.sh`;

export default function BackupPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>Backup Database</h1>
      <p>
        I backup sono fondamentali per proteggere i dati dei tuoi progetti. Questa guida spiega come configurare backup automatici per i database dei progetti Docker deployati con Prolato.
      </p>

      <h2>Introduzione</h2>
      <p>
        I progetti Docker che includono un database (PostgreSQL, MySQL, MongoDB) contengono dati che non sono presenti nel repository Git. Se un container viene eliminato o corrotto, i dati del database vanno persi a meno che non esista un backup.
      </p>
      <p>
        Lo script di backup che configurerai:
      </p>
      <ul>
        <li>Analizza tutti i progetti Docker deployati</li>
        <li>Identifica i container con database</li>
        <li>Esegue il dump dei dati in file compressi</li>
        <li>Mantiene i backup degli ultimi 7 giorni</li>
      </ul>

      <h2>Script di backup</h2>
      <p>
        Crea lo script di backup sul VPS:
      </p>
      <pre><code>{BACKUP_SCRIPT}</code></pre>

      <blockquote>
        <p>
          Lo script usa <code>app</code> come nome utente e database di default. Se i tuoi progetti usano credenziali diverse, modifica lo script di conseguenza.
        </p>
      </blockquote>

      <h2>Cron job</h2>
      <p>
        Configura un cron job per eseguire il backup automaticamente ogni giorno alle 3:00 di notte:
      </p>
      <pre><code>{`crontab -e

# Aggiungi questa riga:
0 3 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1`}</code></pre>
      <p>
        I log del backup vengono salvati in <code>/var/log/backup.log</code> per poter verificare eventuali errori.
      </p>

      <h2>Retention</h2>
      <p>
        Lo script mantiene automaticamente solo i backup degli ultimi 7 giorni. I file piu&apos; vecchi vengono eliminati ad ogni esecuzione. Le directory vuote vengono rimosse per mantenere ordine.
      </p>
      <p>
        Per modificare il periodo di retention, cambia il valore della variabile <code>RETENTION_DAYS</code> nello script.
      </p>

      <h2>Ripristino</h2>
      <p>
        Per ripristinare un backup, usa i comandi specifici per ogni tipo di database.
      </p>

      <h3>PostgreSQL</h3>
      <pre><code>{`gunzip < /opt/backups/PROGETTO/DATA.sql.gz \\
  | docker exec -i CONTAINER_POSTGRES psql -U app app`}</code></pre>

      <h3>MySQL / MariaDB</h3>
      <pre><code>{`gunzip < /opt/backups/PROGETTO/DATA.sql.gz \\
  | docker exec -i CONTAINER_MYSQL mysql -u app -papp app`}</code></pre>

      <h3>MongoDB</h3>
      <pre><code>{`docker exec -i CONTAINER_MONGO mongorestore \\
  --archive --gzip < /opt/backups/PROGETTO/DATA.archive.gz`}</code></pre>

      <p>
        Sostituisci:
      </p>
      <ul>
        <li><code>PROGETTO</code> &mdash; il nome del progetto</li>
        <li><code>DATA</code> &mdash; la data del backup (es. <code>2024-01-15_03-00</code>)</li>
        <li><code>CONTAINER_*</code> &mdash; il nome del container Docker (trovalo con <code>docker ps</code>)</li>
      </ul>

      <blockquote>
        <p>
          <strong>Attenzione:</strong> Il ripristino sovrascrive i dati attuali del database. Assicurati di voler procedere prima di eseguire il comando.
        </p>
      </blockquote>

      <h2>Verifica</h2>
      <p>
        Per verificare che lo script funzioni, eseguilo manualmente:
      </p>
      <pre><code>{`/opt/scripts/backup.sh
ls -la /opt/backups/`}</code></pre>
      <p>
        Dovresti vedere le directory dei progetti con i file di backup compressi.
      </p>

      <blockquote>
        <p>
          Questa configurazione e&apos; opzionale ma fortemente raccomandata per progetti in produzione con dati importanti.
        </p>
      </blockquote>

      <hr />
      <p>
        <Link href="/docs/maintenance/reboot">Prossimo step: Comportamento al Reboot &rarr;</Link>
      </p>
    </div>
  );
}
