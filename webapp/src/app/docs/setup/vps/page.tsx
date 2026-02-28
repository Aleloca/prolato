"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function VpsPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>2. Server VPS</h1>
      <p>
        {replaceDomain(
          "In questo step preparerai il server VPS installando i pacchetti necessari e creando l'utente di sistema per i deploy. Alla fine di questo step la tua VPS sara' pronta per ospitare tuodominio.dev."
        )}
      </p>

      <h2>Prerequisiti</h2>
      <ul>
        <li>Una VPS con Ubuntu 22.04 o superiore</li>
        <li>Accesso SSH come utente <code>root</code></li>
        <li>{replaceDomain("DNS gia' configurato (step precedente) con tuodominio.dev che punta all'IP della VPS")}</li>
      </ul>

      <h2>Step 1: Connettiti alla VPS</h2>
      <p>Apri il terminale e connettiti via SSH come root:</p>
      <pre><code>ssh root@IP_DELLA_TUA_VPS</code></pre>

      <h2>Step 2: Scegli il metodo di installazione</h2>
      <p>
        Hai due opzioni per configurare la VPS. Puoi usare lo <strong>script automatico</strong> che installa tutto in un colpo, oppure seguire i <strong>passaggi manuali</strong> (step 2-7 di questa guida).
      </p>

      <h3>Opzione A: Script automatico</h3>
      <p>
        Lo script automatico installa e configura tutti i componenti (Caddy, Gitea, Docker, Webhook) in una sola esecuzione:
      </p>
      <pre><code>{replaceDomain(`curl -sSL https://raw.githubusercontent.com/user/prolato/main/setup/setup.sh | bash`)}</code></pre>
      <p>
        Lo script ti chiedera' il dominio, il token Cloudflare e le credenziali per Gitea. Al termine, puoi saltare direttamente allo{" "}
        <Link href="/docs/setup/verify">step 7 (Verifica)</Link> per controllare che tutto funzioni.
      </p>

      <h3>Opzione B: Installazione manuale</h3>
      <p>
        Se preferisci avere il pieno controllo su ogni componente, segui i passaggi qui sotto e poi procedi con gli step 3-7 della guida.
      </p>

      <h2>Step 3: Aggiorna il sistema</h2>
      <p>
        Aggiorna l&apos;indice dei pacchetti e installa gli aggiornamenti disponibili:
      </p>
      <pre><code>apt update &amp;&amp; apt upgrade -y</code></pre>
      <p>
        Questo assicura che il sistema operativo e tutti i pacchetti siano alla versione piu' recente, con le ultime patch di sicurezza.
      </p>

      <blockquote>
        <p>
          Dopo questo step dovresti vedere il messaggio &quot;All packages are up to date&quot; o simile.
        </p>
      </blockquote>

      <h2>Step 4: Installa i pacchetti prerequisito</h2>
      <p>
        Installa gli strumenti di base necessari per i prossimi step:
      </p>
      <pre><code>apt install -y curl wget gnupg2 software-properties-common git jq unzip tar</code></pre>
      <p>
        Ecco a cosa servono:
      </p>
      <ul>
        <li><code>curl</code> / <code>wget</code> &mdash; per scaricare file e script</li>
        <li><code>gnupg2</code> &mdash; per verificare le firme dei pacchetti</li>
        <li><code>software-properties-common</code> &mdash; per aggiungere repository esterni</li>
        <li><code>git</code> &mdash; per clonare repository</li>
        <li><code>jq</code> &mdash; per processare JSON da linea di comando</li>
        <li><code>unzip</code> / <code>tar</code> &mdash; per estrarre archivi</li>
      </ul>

      <h2>Step 5: Crea l&apos;utente deploy</h2>
      <p>
        Crea un utente di sistema dedicato al deploy. Questo utente eseguira' i container Docker e i processi di build:
      </p>
      <pre><code>useradd --system --create-home --shell /bin/bash deploy</code></pre>
      <p>
        Il flag <code>--system</code> crea un utente di sistema (senza password, non puo' fare login diretto). Il flag <code>--create-home</code> crea la home directory <code>/home/deploy</code>.
      </p>

      <blockquote>
        <p>
          Dopo questo step dovresti poter verificare l&apos;utente con <code>id deploy</code>.
        </p>
      </blockquote>

      <h2>Step 6: Configura i permessi sudo</h2>
      <p>
        L&apos;utente deploy ha bisogno di eseguire alcuni comandi come root (ad esempio gestire i servizi systemd). Crea un file sudoers dedicato:
      </p>
      <pre><code>{`cat > /etc/sudoers.d/deploy << 'EOF'
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart caddy
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload caddy
deploy ALL=(ALL) NOPASSWD: /usr/bin/tee /etc/caddy/projects.d/*
EOF

chmod 440 /etc/sudoers.d/deploy`}</code></pre>
      <p>
        Questo permette all&apos;utente deploy di:
      </p>
      <ul>
        <li>Riavviare e ricaricare Caddy (per applicare nuove configurazioni)</li>
        <li>Scrivere file di configurazione nella directory dei progetti Caddy</li>
      </ul>

      <h2>Step 7: Verifica</h2>
      <p>Verifica che l&apos;utente sia stato creato correttamente:</p>
      <pre><code>{`id deploy
su - deploy -c "whoami"
su - deploy -c "echo 'Utente deploy funzionante'"`}</code></pre>
      <p>
        Il comando <code>id deploy</code> dovrebbe mostrare l&apos;UID, GID e i gruppi dell&apos;utente. Il comando <code>su - deploy</code> dovrebbe funzionare senza errori.
      </p>

      <blockquote>
        <p>
          Dopo questo step dovresti vedere l&apos;output di <code>id deploy</code> con l&apos;utente e il gruppo creati, e <code>su - deploy</code> dovrebbe funzionare correttamente.
        </p>
      </blockquote>

      <h2>Troubleshooting</h2>
      <h3>apt update fallisce con errori di repository</h3>
      <p>
        Se vedi errori relativi a repository non raggiungibili, puo' essere un problema temporaneo del mirror. Riprova dopo qualche minuto oppure cambia il mirror in <code>/etc/apt/sources.list</code>.
      </p>

      <h3>L&apos;utente deploy esiste gia'</h3>
      <p>
        Se l&apos;utente <code>deploy</code> esiste gia' (ad esempio da un&apos;installazione precedente), puoi verificarlo con <code>id deploy</code>. Se vuoi ricrearlo, prima rimuovilo con <code>userdel -r deploy</code> e poi riesegui il comando di creazione.
      </p>

      <h3>Errori di permessi con sudo</h3>
      <p>
        Assicurati che il file <code>/etc/sudoers.d/deploy</code> abbia i permessi corretti (440). Puoi verificarlo con <code>ls -la /etc/sudoers.d/deploy</code>. Se il file ha permessi diversi, sudo potrebbe ignorarlo.
      </p>

      <hr />
      <p>
        <Link href="/docs/setup/caddy">Prossimo step: Caddy →</Link>
      </p>
    </div>
  );
}
