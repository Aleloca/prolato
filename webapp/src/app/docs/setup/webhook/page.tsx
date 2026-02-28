"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function WebhookPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>6. Webhook</h1>
      <p>
        {replaceDomain(
          "In questo step installerai il server webhook di Prolato, il componente che gestisce il deploy automatico. Il webhook riceve le notifiche da Gitea, esegue la build Docker e configura Caddy per servire il progetto su tuodominio.dev."
        )}
      </p>

      <h2>Prerequisiti</h2>
      <ul>
        <li>Docker e Node.js installati (step precedente)</li>
        <li>Gitea in esecuzione con account admin e token API generato</li>
        <li>{replaceDomain("Caddy configurato con il blocco webhook.tuodominio.dev")}</li>
      </ul>

      <h2>Step 1: Clona il repository webhook</h2>
      <p>
        Clona il codice del server webhook nella directory dedicata:
      </p>
      <pre><code>{`cd /opt/webhook
git clone https://github.com/user/prolato.git .
cd webhook
npm install --production`}</code></pre>
      <p>
        Il comando <code>npm install --production</code> installa solo le dipendenze necessarie per l&apos;esecuzione, senza le dipendenze di sviluppo.
      </p>

      <h2>Step 2: Genera il token di deploy</h2>
      <p>
        Il token di deploy e' una stringa segreta che autentica le richieste di deploy dalla skill Claude Code. Generalo con:
      </p>
      <pre><code>openssl rand -hex 32</code></pre>
      <p>
        Copia il valore generato &mdash; ti servira' nel prossimo step. Questo token e' come una password: chiunque lo possieda puo' deployare sul tuo server.
      </p>

      <h2>Step 3: Configura il file .env</h2>
      <p>
        {replaceDomain(
          "Crea il file di configurazione con tutti i parametri necessari:"
        )}
      </p>
      <pre><code>{replaceDomain(`cat > /opt/webhook/.env << EOF
# Token per autenticare le richieste di deploy
DEPLOY_TOKEN=IL_TOKEN_GENERATO_SOPRA

# Dominio principale
DOMAIN=tuodominio.dev

# Configurazione Gitea
GITEA_URL=https://git.tuodominio.dev
GITEA_API_TOKEN=IL_TOKEN_API_GITEA

# Percorsi di lavoro
PROJECTS_DIR=/var/www/projects
DOCKER_PROJECTS_DIR=/opt/docker-projects
CADDY_PROJECTS_DIR=/etc/caddy/projects.d

# Porta del server webhook
PORT=4000

# Ambiente
NODE_ENV=production
EOF`)}</code></pre>
      <p>
        Sostituisci i seguenti valori:
      </p>
      <ul>
        <li><code>DEPLOY_TOKEN</code> &mdash; il token generato con <code>openssl rand -hex 32</code></li>
        <li><code>GITEA_API_TOKEN</code> &mdash; il token creato nello step Gitea (Settings → Applications)</li>
      </ul>
      <pre><code>chmod 600 /opt/webhook/.env</code></pre>
      <p>
        Il file ha permessi 600 per proteggere i token.
      </p>

      <h2>Step 4: Genera la chiave SSH per il deploy</h2>
      <p>
        Il server webhook ha bisogno di una chiave SSH per clonare i repository da Gitea. Genera una coppia di chiavi per l&apos;utente deploy:
      </p>
      <pre><code>{`su - deploy -c 'ssh-keygen -t ed25519 -C "prolato-deploy-bot" -f /home/deploy/.ssh/id_ed25519 -N ""'`}</code></pre>
      <p>
        Questo crea:
      </p>
      <ul>
        <li><code>/home/deploy/.ssh/id_ed25519</code> &mdash; chiave privata (resta sul server)</li>
        <li><code>/home/deploy/.ssh/id_ed25519.pub</code> &mdash; chiave pubblica (da aggiungere a Gitea)</li>
      </ul>

      <h2>Step 5: Aggiungi la chiave SSH a Gitea</h2>
      <p>
        Visualizza la chiave pubblica:
      </p>
      <pre><code>cat /home/deploy/.ssh/id_ed25519.pub</code></pre>
      <p>
        Copia l&apos;output e aggiungilo a Gitea:
      </p>
      <ol>
        <li>Accedi a Gitea con l&apos;account admin</li>
        <li>Vai su <strong>Impostazioni</strong> → <strong>Chiavi SSH / GPG</strong></li>
        <li>Clicca <strong>Aggiungi chiave</strong></li>
        <li>Incolla la chiave pubblica e assegna un nome (es. <code>prolato-deploy-bot</code>)</li>
        <li>Clicca <strong>Aggiungi chiave</strong> per salvare</li>
      </ol>

      <p>
        {replaceDomain(
          "Configura anche il known_hosts per evitare prompt SSH interattivi:"
        )}
      </p>
      <pre><code>{replaceDomain(`su - deploy -c 'ssh-keyscan -p 2222 git.tuodominio.dev >> /home/deploy/.ssh/known_hosts'`)}</code></pre>

      <blockquote>
        <p>
          {replaceDomain(
            "Dopo questo step dovresti poter eseguire su - deploy -c \"ssh -p 2222 git@git.tuodominio.dev\" e vedere un messaggio di benvenuto da Gitea (senza errori di host sconosciuto)."
          )}
        </p>
      </blockquote>

      <h2>Step 6: Crea il servizio systemd</h2>
      <pre><code>{`cat > /etc/systemd/system/webhook.service << 'EOF'
[Unit]
Description=Prolato Webhook Server
After=network.target gitea.service docker.service
Requires=docker.service

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/opt/webhook/webhook
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
EnvironmentFile=/opt/webhook/.env

[Install]
WantedBy=multi-user.target
EOF`}</code></pre>
      <p>
        La direttiva <code>After</code> assicura che il webhook parta dopo Gitea e Docker. <code>Requires=docker.service</code> garantisce che Docker sia attivo.
      </p>

      <h2>Step 7: Configura logrotate</h2>
      <p>
        Crea una configurazione logrotate per evitare che i log del webhook crescano indefinitamente:
      </p>
      <pre><code>{`cat > /etc/logrotate.d/webhook << 'EOF'
/var/log/webhook/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
    postrotate
        systemctl reload webhook > /dev/null 2>&1 || true
    endscript
}
EOF

mkdir -p /var/log/webhook
chown deploy:deploy /var/log/webhook`}</code></pre>
      <p>
        Questa configurazione mantiene i log degli ultimi 14 giorni, compressi, e ruota il file ogni giorno.
      </p>

      <h2>Step 8: Avvia il webhook</h2>
      <pre><code>{`systemctl daemon-reload
systemctl enable --now webhook`}</code></pre>

      <h2>Step 9: Verifica</h2>
      <p>Controlla che il webhook sia in esecuzione e risponda:</p>
      <pre><code>{replaceDomain(`systemctl status webhook
curl -s https://webhook.tuodominio.dev/health`)}</code></pre>
      <p>
        Il comando <code>systemctl status</code> deve mostrare <code>active (running)</code>. Il comando <code>curl</code> deve restituire una risposta JSON indicando che il servizio e' attivo.
      </p>

      <blockquote>
        <p>
          {replaceDomain(
            "Dopo questo step dovresti vedere il webhook attivo e l'endpoint https://webhook.tuodominio.dev/health che risponde correttamente."
          )}
        </p>
      </blockquote>

      <h2>Troubleshooting</h2>
      <h3>Il webhook non si avvia</h3>
      <p>
        Controlla i log con <code>journalctl -u webhook -n 50</code>. Gli errori piu' comuni:
      </p>
      <ul>
        <li><strong>File .env mancante o incompleto</strong> &mdash; verifica che <code>/opt/webhook/.env</code> esista e contenga tutti i parametri</li>
        <li><strong>Dipendenze npm mancanti</strong> &mdash; esegui <code>cd /opt/webhook/webhook &amp;&amp; npm install --production</code></li>
        <li><strong>Porta 4000 occupata</strong> &mdash; controlla con <code>ss -tlnp | grep 4000</code></li>
      </ul>

      <h3>L&apos;endpoint /health non risponde</h3>
      <p>
        {replaceDomain(
          "Verifica che Caddy stia facendo proxy verso il webhook: controlla il blocco webhook.tuodominio.dev nel Caddyfile. Puoi anche testare direttamente sulla porta locale:"
        )}
      </p>
      <pre><code>curl -s http://localhost:4000/health</code></pre>
      <p>
        Se questo funziona ma l&apos;URL HTTPS no, il problema e' nella configurazione di Caddy.
      </p>

      <h3>Errore di connessione SSH a Gitea</h3>
      <p>
        Se la chiave SSH non funziona, verifica che:
      </p>
      <ul>
        <li>La chiave pubblica sia stata aggiunta correttamente all&apos;account admin di Gitea</li>
        <li>Il file <code>/home/deploy/.ssh/known_hosts</code> contenga l&apos;host di Gitea</li>
        <li>I permessi della directory <code>.ssh</code> siano corretti: <code>chmod 700 /home/deploy/.ssh &amp;&amp; chmod 600 /home/deploy/.ssh/id_ed25519</code></li>
      </ul>

      <hr />
      <p>
        <Link href="/docs/setup/verify">Prossimo step: Verifica →</Link>
      </p>
    </div>
  );
}
