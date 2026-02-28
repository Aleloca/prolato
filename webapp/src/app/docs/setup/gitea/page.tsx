"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function GiteaPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>4. Gitea</h1>
      <p>
        {replaceDomain(
          "In questo step installerai Gitea, un server Git leggero e self-hosted. Gitea sara' accessibile su git.tuodominio.dev e ospitera' i repository dei tuoi progetti."
        )}
      </p>

      <h2>Prerequisiti</h2>
      <ul>
        <li>VPS configurata con utente deploy</li>
        <li>{replaceDomain("Caddy in esecuzione con il blocco git.tuodominio.dev configurato")}</li>
      </ul>

      <h2>Step 1: Scarica il binario di Gitea</h2>
      <p>
        Scarica l&apos;ultima versione stabile di Gitea direttamente dal repository ufficiale:
      </p>
      <pre><code>{`GITEA_VERSION=$(curl -s https://api.github.com/repos/go-gitea/gitea/releases/latest | jq -r .tag_name | sed 's/v//')
wget -O /usr/local/bin/gitea "https://dl.gitea.io/gitea/$GITEA_VERSION/gitea-$GITEA_VERSION-linux-amd64"
chmod +x /usr/local/bin/gitea`}</code></pre>
      <p>
        Il primo comando recupera il numero dell&apos;ultima versione, il secondo scarica il binario e il terzo lo rende eseguibile.
      </p>

      <blockquote>
        <p>
          Dopo questo step dovresti poter eseguire <code>gitea --version</code> e vedere la versione installata.
        </p>
      </blockquote>

      <h2>Step 2: Crea l&apos;utente git</h2>
      <p>
        Gitea ha bisogno di un utente di sistema dedicato:
      </p>
      <pre><code>{`adduser --system --shell /bin/bash --gecos 'Git Version Control' \\
  --group --disabled-password --home /home/git git`}</code></pre>

      <h2>Step 3: Crea le directory</h2>
      <p>
        Crea le directory necessarie per Gitea:
      </p>
      <pre><code>{`mkdir -p /var/lib/gitea/{custom,data,log}
mkdir -p /etc/gitea

chown -R git:git /var/lib/gitea
chown -R root:git /etc/gitea
chmod 770 /etc/gitea`}</code></pre>
      <ul>
        <li><code>/var/lib/gitea/</code> &mdash; dati, repository e log di Gitea</li>
        <li><code>/etc/gitea/</code> &mdash; file di configurazione</li>
      </ul>

      <h2>Step 4: Configura app.ini</h2>
      <p>
        {replaceDomain(
          "Crea il file di configurazione principale di Gitea. I parametri importanti sono ROOT_URL, SSH_DOMAIN e SSH_PORT:"
        )}
      </p>
      <pre><code>{replaceDomain(`cat > /etc/gitea/app.ini << 'EOF'
APP_NAME = Prolato Git
RUN_MODE = prod
RUN_USER = git

[server]
HTTP_PORT      = 3000
ROOT_URL       = https://git.tuodominio.dev/
SSH_DOMAIN     = git.tuodominio.dev
SSH_PORT       = 2222
START_SSH_SERVER = true
DOMAIN         = git.tuodominio.dev
DISABLE_SSH    = false
LFS_START_SERVER = true

[database]
DB_TYPE = sqlite3
PATH    = /var/lib/gitea/data/gitea.db

[repository]
ROOT = /var/lib/gitea/data/repositories

[security]
INSTALL_LOCK = false

[service]
DISABLE_REGISTRATION       = true
REQUIRE_SIGNIN_VIEW        = false
DEFAULT_KEEP_EMAIL_PRIVATE = true

[log]
MODE = console
LEVEL = Info
ROOT_PATH = /var/lib/gitea/log
EOF

chown root:git /etc/gitea/app.ini
chmod 640 /etc/gitea/app.ini`)}</code></pre>
      <p>Ecco cosa fanno i parametri principali:</p>
      <ul>
        <li><code>HTTP_PORT = 3000</code> &mdash; Gitea ascolta sulla porta 3000 (Caddy fa da proxy)</li>
        <li>{replaceDomain("<code>ROOT_URL</code> — l'URL pubblico di Gitea (https://git.tuodominio.dev/)")}</li>
        <li><code>SSH_PORT = 2222</code> &mdash; porta SSH separata per non conflittuare con la porta 22 del sistema</li>
        <li><code>DISABLE_REGISTRATION = true</code> &mdash; disabilita la registrazione pubblica dopo la creazione dell&apos;admin</li>
        <li><code>DB_TYPE = sqlite3</code> &mdash; usa SQLite come database (nessun server database necessario)</li>
      </ul>

      <h2>Step 5: Crea il servizio systemd</h2>
      <pre><code>{`cat > /etc/systemd/system/gitea.service << 'EOF'
[Unit]
Description=Gitea (Git with a cup of tea)
After=network.target

[Service]
Type=simple
User=git
Group=git
WorkingDirectory=/var/lib/gitea
ExecStart=/usr/local/bin/gitea web --config /etc/gitea/app.ini
Restart=always
RestartSec=5
Environment=USER=git HOME=/home/git GITEA_WORK_DIR=/var/lib/gitea

[Install]
WantedBy=multi-user.target
EOF`}</code></pre>

      <h2>Step 6: Avvia Gitea</h2>
      <pre><code>{`systemctl daemon-reload
systemctl enable --now gitea`}</code></pre>

      <blockquote>
        <p>
          {replaceDomain(
            "Dopo questo step dovresti poter aprire https://git.tuodominio.dev nel browser e vedere la pagina di installazione iniziale di Gitea."
          )}
        </p>
      </blockquote>

      <h2>Step 7: Completa il wizard di installazione</h2>
      <p>
        {replaceDomain(
          "Apri https://git.tuodominio.dev nel browser. Vedrai la pagina di configurazione iniziale. La maggior parte dei campi e' gia' precompilata dal file app.ini. Verifica che:"
        )}
      </p>
      <ul>
        <li>Il tipo di database sia <strong>SQLite3</strong></li>
        <li>{replaceDomain("Il dominio SSH sia <strong>git.tuodominio.dev</strong>")}</li>
        <li>La porta SSH sia <strong>2222</strong></li>
        <li>{replaceDomain("L'URL base sia <strong>https://git.tuodominio.dev/</strong>")}</li>
      </ul>
      <p>
        Clicca <strong>Installa Gitea</strong> in fondo alla pagina per completare il setup.
      </p>

      <h2>Step 8: Crea l&apos;account amministratore</h2>
      <p>
        Dopo l&apos;installazione, registra il primo utente &mdash; sara' automaticamente l&apos;amministratore. Scegli un nome utente e una password sicura e salvali in un posto sicuro.
      </p>

      <blockquote>
        <p>
          Dopo questo step dovresti poter accedere alla dashboard di Gitea con il tuo account admin.
        </p>
      </blockquote>

      <h2>Step 9: Genera un token API</h2>
      <p>
        Il server webhook ha bisogno di un token API per interagire con Gitea (creare repository, configurare hook, ecc.). Per generarlo:
      </p>
      <ol>
        <li>Accedi a Gitea con l&apos;account admin</li>
        <li>Vai su <strong>Impostazioni</strong> (icona utente in alto a destra → Settings)</li>
        <li>Clicca sulla tab <strong>Applicazioni</strong></li>
        <li>Nella sezione &quot;Genera nuovo token&quot;, inserisci un nome (es. <code>prolato-webhook</code>)</li>
        <li>Seleziona i permessi necessari (almeno: <code>repo</code>, <code>admin:repo_hook</code>, <code>admin:org</code>)</li>
        <li>Clicca <strong>Genera token</strong></li>
        <li>Copia il token generato e salvalo &mdash; ti servira' nello step Webhook</li>
      </ol>

      <blockquote>
        <p>
          Dopo questo step dovresti avere un token API Gitea che usera' il server webhook per gestire i repository.
        </p>
      </blockquote>

      <h2>Step 10: Verifica</h2>
      <pre><code>{replaceDomain(`systemctl status gitea
curl -s https://git.tuodominio.dev/api/v1/version`)}</code></pre>
      <p>
        Il primo comando deve mostrare <code>active (running)</code>. Il secondo deve restituire un JSON con la versione di Gitea.
      </p>

      <h2>Troubleshooting</h2>
      <h3>Gitea non si avvia</h3>
      <p>
        Controlla i log con <code>journalctl -u gitea -n 50</code>. Gli errori piu' comuni:
      </p>
      <ul>
        <li><strong>Permessi sul database</strong> &mdash; verifica che <code>/var/lib/gitea/data/</code> sia di proprietà dell&apos;utente <code>git</code></li>
        <li><strong>Porta 3000 occupata</strong> &mdash; controlla con <code>ss -tlnp | grep 3000</code></li>
      </ul>

      <h3>La pagina web non si carica</h3>
      <p>
        {replaceDomain(
          "Verifica che Caddy stia facendo proxy verso Gitea: controlla il blocco git.tuodominio.dev nel Caddyfile e che Caddy sia in esecuzione."
        )}
      </p>

      <h3>Errore durante il wizard di installazione</h3>
      <p>
        Se il wizard mostra errori, controlla i permessi delle directory <code>/var/lib/gitea</code> e <code>/etc/gitea</code>. Devono essere accessibili dall&apos;utente <code>git</code>.
      </p>

      <hr />
      <p>
        <Link href="/docs/setup/docker">Prossimo step: Docker →</Link>
      </p>
    </div>
  );
}
