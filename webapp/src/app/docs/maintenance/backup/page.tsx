"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

const BACKUP_SCRIPT = `cat > /opt/scripts/backup.sh << 'SCRIPT'
#!/bin/bash
set -euo pipefail

BACKUP_BASE="/opt/backups"
DATE=$(date +%Y-%m-%d_%H-%M)
RETENTION_DAYS=7

# Create the base directory if it doesn't exist
mkdir -p "$BACKUP_BASE"

# Loop over Docker projects
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
      || echo "[backup] ERROR: PostgreSQL backup failed for $PROJECT"
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
      || echo "[backup] ERROR: MySQL backup failed for $PROJECT"
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
      || echo "[backup] ERROR: MongoDB backup failed for $PROJECT"
  fi
done

# Clean up old backups
echo "[backup] Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_BASE" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_BASE" -type d -empty -delete

echo "[backup] Completed."
SCRIPT

chmod +x /opt/scripts/backup.sh`;

export default function BackupPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>Database Backup</h1>
      <p>
        Backups are essential to protect your project data. This guide explains how to configure automatic backups for the databases of Docker projects deployed with Prolato.
      </p>

      <h2>Introduction</h2>
      <p>
        Docker projects that include a database (PostgreSQL, MySQL, MongoDB) contain data that is not present in the Git repository. If a container is deleted or corrupted, the database data is lost unless a backup exists.
      </p>
      <p>
        The backup script you will configure:
      </p>
      <ul>
        <li>Scans all deployed Docker projects</li>
        <li>Identifies containers with databases</li>
        <li>Dumps the data into compressed files</li>
        <li>Keeps backups from the last 7 days</li>
      </ul>

      <h2>Backup script</h2>
      <p>
        Create the backup script on the VPS:
      </p>
      <pre><code>{BACKUP_SCRIPT}</code></pre>

      <blockquote>
        <p>
          The script uses <code>app</code> as the default username and database name. If your projects use different credentials, modify the script accordingly.
        </p>
      </blockquote>

      <h2>Cron job</h2>
      <p>
        Configure a cron job to run the backup automatically every day at 3:00 AM:
      </p>
      <pre><code>{`crontab -e

# Add this line:
0 3 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1`}</code></pre>
      <p>
        Backup logs are saved to <code>/var/log/backup.log</code> so you can check for any errors.
      </p>

      <h2>Retention</h2>
      <p>
        The script automatically keeps only the backups from the last 7 days. Older files are deleted on each run. Empty directories are removed to keep things tidy.
      </p>
      <p>
        To change the retention period, modify the <code>RETENTION_DAYS</code> variable value in the script.
      </p>

      <h2>Restore</h2>
      <p>
        To restore a backup, use the specific commands for each database type.
      </p>

      <h3>PostgreSQL</h3>
      <pre><code>{`gunzip < /opt/backups/PROJECT/DATE.sql.gz \\
  | docker exec -i POSTGRES_CONTAINER psql -U app app`}</code></pre>

      <h3>MySQL / MariaDB</h3>
      <pre><code>{`gunzip < /opt/backups/PROJECT/DATE.sql.gz \\
  | docker exec -i MYSQL_CONTAINER mysql -u app -papp app`}</code></pre>

      <h3>MongoDB</h3>
      <pre><code>{`docker exec -i MONGO_CONTAINER mongorestore \\
  --archive --gzip < /opt/backups/PROJECT/DATE.archive.gz`}</code></pre>

      <p>
        Replace:
      </p>
      <ul>
        <li><code>PROJECT</code> &mdash; the project name</li>
        <li><code>DATE</code> &mdash; the backup date (e.g. <code>2024-01-15_03-00</code>)</li>
        <li><code>CONTAINER_*</code> &mdash; the Docker container name (find it with <code>docker ps</code>)</li>
      </ul>

      <blockquote>
        <p>
          <strong>Warning:</strong> Restoring overwrites the current database data. Make sure you want to proceed before running the command.
        </p>
      </blockquote>

      <h2>Verification</h2>
      <p>
        To verify that the script works, run it manually:
      </p>
      <pre><code>{`/opt/scripts/backup.sh
ls -la /opt/backups/`}</code></pre>
      <p>
        You should see the project directories with compressed backup files.
      </p>

      <blockquote>
        <p>
          This configuration is optional but strongly recommended for production projects with important data.
        </p>
      </blockquote>

      <hr />
      <p>
        <Link href="/docs/maintenance/reboot">Next step: Reboot Behavior &rarr;</Link>
      </p>
    </div>
  );
}
