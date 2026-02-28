"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function DockerPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>5. Docker</h1>
      <p>
        In questo step installerai Docker per eseguire i container dei progetti, Node.js per il server webhook, e creerai le directory di lavoro necessarie.
      </p>

      <h2>Prerequisiti</h2>
      <ul>
        <li>VPS configurata con utente deploy</li>
        <li>Caddy e Gitea in esecuzione</li>
      </ul>

      <h2>Step 1: Installa Docker</h2>
      <p>
        Installa Docker usando lo script ufficiale. Questo metodo rileva automaticamente la distribuzione e installa la versione stabile:
      </p>
      <pre><code>curl -fsSL https://get.docker.com | bash</code></pre>
      <p>
        Lo script installa Docker Engine, il CLI e il plugin Docker Compose. Non serve installare Docker Compose separatamente.
      </p>

      <blockquote>
        <p>
          Dopo questo step dovresti poter eseguire <code>docker --version</code> e vedere la versione installata.
        </p>
      </blockquote>

      <h2>Step 2: Aggiungi l&apos;utente deploy al gruppo docker</h2>
      <p>
        L&apos;utente deploy deve poter eseguire comandi Docker senza <code>sudo</code>:
      </p>
      <pre><code>usermod -aG docker deploy</code></pre>
      <p>
        Questo aggiunge l&apos;utente deploy al gruppo <code>docker</code>, che ha i permessi per comunicare con il socket Docker.
      </p>

      <blockquote>
        <p>
          Dopo questo step dovresti poter eseguire <code>su - deploy -c &quot;docker ps&quot;</code> senza errori di permessi.
        </p>
      </blockquote>

      <h2>Step 3: Installa Node.js 20</h2>
      <p>
        Il server webhook e' scritto in Node.js. Installa Node.js 20 LTS tramite NodeSource:
      </p>
      <pre><code>{`curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs`}</code></pre>
      <p>
        Node.js 20 e' la versione LTS (Long Term Support) con supporto attivo fino ad aprile 2026.
      </p>

      <blockquote>
        <p>
          Dopo questo step dovresti poter eseguire <code>node --version</code> e vedere <code>v20.x.x</code>.
        </p>
      </blockquote>

      <h2>Step 4: Crea le directory di lavoro</h2>
      <p>
        Crea le directory che verranno usate dal server webhook e dai container Docker:
      </p>
      <pre><code>{`mkdir -p /var/www/projects
mkdir -p /opt/docker-projects
mkdir -p /etc/caddy/projects.d
mkdir -p /opt/webhook

chown deploy:deploy /var/www/projects
chown deploy:deploy /opt/docker-projects
chown deploy:deploy /opt/webhook`}</code></pre>
      <p>Ecco a cosa serve ogni directory:</p>
      <ul>
        <li><code>/var/www/projects</code> &mdash; contiene i file sorgente dei progetti (clonati da Gitea)</li>
        <li><code>/opt/docker-projects</code> &mdash; contiene i Dockerfile e le configurazioni Docker per ogni progetto</li>
        <li><code>/etc/caddy/projects.d</code> &mdash; contiene i file <code>.caddy</code> con la configurazione reverse proxy per ogni progetto</li>
        <li><code>/opt/webhook</code> &mdash; contiene il codice del server webhook</li>
      </ul>

      <blockquote>
        <p>
          Dopo questo step tutte le directory dovrebbero esistere con i permessi corretti. Verifica con <code>ls -la /var/www/projects /opt/docker-projects /opt/webhook</code>.
        </p>
      </blockquote>

      <h2>Step 5: Verifica</h2>
      <p>Controlla che tutto sia installato correttamente:</p>
      <pre><code>{`docker --version
node --version
npm --version
su - deploy -c "docker ps"
ls -la /var/www/projects /opt/docker-projects /opt/webhook`}</code></pre>
      <p>
        Tutti i comandi devono funzionare senza errori. In particolare, <code>su - deploy -c &quot;docker ps&quot;</code> deve mostrare la lista dei container (vuota, ma senza errori di permessi).
      </p>

      <h2>Troubleshooting</h2>
      <h3>docker ps restituisce &quot;permission denied&quot;</h3>
      <p>
        L&apos;utente deploy potrebbe non essere ancora nel gruppo docker. Dopo aver eseguito <code>usermod -aG docker deploy</code>, e' necessario un nuovo login. Prova con:
      </p>
      <pre><code>{`su - deploy -c "groups"  # verifica che 'docker' sia nella lista
su - deploy -c "docker ps"  # riprova dopo il re-login`}</code></pre>
      <p>
        Se il gruppo non appare, prova a riavviare il servizio Docker: <code>systemctl restart docker</code>.
      </p>

      <h3>Node.js non trovato dopo l&apos;installazione</h3>
      <p>
        Se <code>node --version</code> restituisce &quot;command not found&quot;, verifica che il repository NodeSource sia stato aggiunto correttamente:
      </p>
      <pre><code>ls /etc/apt/sources.list.d/nodesource.list</code></pre>
      <p>
        Se il file non esiste, riesegui lo script di setup di NodeSource.
      </p>

      <h3>Docker non si avvia</h3>
      <p>
        Controlla i log con <code>journalctl -u docker -n 50</code>. L&apos;errore piu' comune su VPS con kernel vecchio e' la mancanza del supporto per <code>overlay2</code>. Verifica che il kernel sia almeno alla versione 4.x.
      </p>

      <hr />
      <p>
        <Link href="/docs/setup/webhook">Prossimo step: Webhook →</Link>
      </p>
    </div>
  );
}
