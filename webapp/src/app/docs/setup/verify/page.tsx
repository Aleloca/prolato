"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function VerifyPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>7. Verifica</h1>
      <p>
        {replaceDomain(
          "Hai completato l'installazione di tutti i componenti di Prolato su tuodominio.dev. In questo step finale verificherai che tutto funzioni correttamente e raccoglierai le credenziali generate durante il setup."
        )}
      </p>

      <h2>Prerequisiti</h2>
      <ul>
        <li>Tutti gli step precedenti completati (DNS, VPS, Caddy, Gitea, Docker, Webhook)</li>
      </ul>

      <h2>Checklist di verifica</h2>
      <p>
        Esegui tutti i controlli seguenti. Ogni punto deve funzionare correttamente prima di procedere.
      </p>

      <h3>1. DNS risolve correttamente</h3>
      <pre><code>{replaceDomain(`dig +short tuodominio.dev
dig +short git.tuodominio.dev
dig +short webhook.tuodominio.dev`)}</code></pre>
      <p>
        Tutti e tre devono restituire l&apos;IP della tua VPS.
      </p>

      <h3>2. Caddy e' in esecuzione e HTTPS funziona</h3>
      <pre><code>{replaceDomain(`systemctl status caddy
curl -I https://tuodominio.dev`)}</code></pre>
      <p>
        {replaceDomain(
          "Lo status deve essere \"active (running)\". curl deve restituire HTTP 200 con un certificato SSL valido per tuodominio.dev."
        )}
      </p>

      <h3>3. Gitea e' accessibile via web</h3>
      <pre><code>{replaceDomain(`systemctl status gitea
curl -s https://git.tuodominio.dev/api/v1/version`)}</code></pre>
      <p>
        {replaceDomain(
          "Lo status deve essere \"active (running)\". L'API deve restituire la versione di Gitea. Verifica anche di poter accedere a https://git.tuodominio.dev nel browser."
        )}
      </p>

      <h3>4. Docker e' installato e l&apos;utente deploy puo' usarlo</h3>
      <pre><code>{`docker --version
su - deploy -c "docker ps"
su - deploy -c "docker info --format '{{.ServerVersion}}'"
`}</code></pre>
      <p>
        Tutti i comandi devono funzionare senza errori. In particolare, l&apos;utente deploy deve poter eseguire <code>docker ps</code> senza <code>sudo</code>.
      </p>

      <h3>5. Webhook e' in esecuzione e l&apos;health endpoint risponde</h3>
      <pre><code>{replaceDomain(`systemctl status webhook
curl -s https://webhook.tuodominio.dev/health`)}</code></pre>
      <p>
        Lo status deve essere &quot;active (running)&quot;. L&apos;health endpoint deve restituire una risposta positiva.
      </p>

      <h3>6. Chiave SSH configurata</h3>
      <pre><code>{replaceDomain(`su - deploy -c "ssh -T -p 2222 git@git.tuodominio.dev"`)}</code></pre>
      <p>
        Dovresti vedere un messaggio di benvenuto da Gitea. Se vedi un errore di &quot;host key verification&quot;, esegui:
      </p>
      <pre><code>{replaceDomain(`su - deploy -c 'ssh-keyscan -p 2222 git.tuodominio.dev >> /home/deploy/.ssh/known_hosts'`)}</code></pre>

      <h3>7. Tutti i servizi sopravvivono al reboot</h3>
      <pre><code>systemctl is-enabled caddy gitea webhook</code></pre>
      <p>
        Tutti e tre devono restituire <code>enabled</code>. Questo significa che i servizi partiranno automaticamente al riavvio del server.
      </p>
      <p>
        Se un servizio non e' abilitato, attivalo con:
      </p>
      <pre><code>{`systemctl enable caddy
systemctl enable gitea
systemctl enable webhook`}</code></pre>

      <h2>Test completo con reboot</h2>
      <p>
        Per una verifica definitiva, riavvia il server e controlla che tutto riparta:
      </p>
      <pre><code>{replaceDomain(`reboot

# Dopo il riavvio, riconnettiti e verifica:
ssh root@IP_DELLA_TUA_VPS
systemctl status caddy gitea webhook
curl -s https://webhook.tuodominio.dev/health`)}</code></pre>

      <h2>Riepilogo credenziali</h2>
      <p>
        Durante il setup hai generato diverse credenziali. Assicurati di averle salvate in un posto sicuro:
      </p>

      <table>
        <thead>
          <tr>
            <th>Credenziale</th>
            <th>Posizione</th>
            <th>Utilizzo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Deploy Token</strong></td>
            <td><code>/opt/webhook/.env</code></td>
            <td>Autentica le richieste di deploy dalla skill Claude Code</td>
          </tr>
          <tr>
            <td><strong>Token API Cloudflare</strong></td>
            <td><code>/etc/caddy/caddy.env</code></td>
            <td>Generazione certificati SSL via DNS challenge</td>
          </tr>
          <tr>
            <td><strong>Chiave SSH pubblica</strong></td>
            <td><code>/home/deploy/.ssh/id_ed25519.pub</code></td>
            <td>Clonare repository da Gitea senza password</td>
          </tr>
          <tr>
            <td><strong>Credenziali admin Gitea</strong></td>
            <td>Impostate durante il wizard</td>
            <td>Accesso all&apos;interfaccia web di Gitea</td>
          </tr>
          <tr>
            <td><strong>Token API Gitea</strong></td>
            <td>Generato nelle impostazioni</td>
            <td>Interazione programmatica con Gitea (usato dal webhook)</td>
          </tr>
        </tbody>
      </table>

      <h2>Troubleshooting</h2>
      <h3>Un servizio non e' attivo dopo il reboot</h3>
      <p>
        Controlla i log del servizio per capire perche' non si e' avviato:
      </p>
      <pre><code>{`journalctl -u caddy -n 30 --no-pager
journalctl -u gitea -n 30 --no-pager
journalctl -u webhook -n 30 --no-pager`}</code></pre>

      <h3>I certificati SSL non funzionano dopo il reboot</h3>
      <p>
        Caddy conserva i certificati in cache. Se per qualche motivo non vengono caricati, riavvia Caddy:
      </p>
      <pre><code>systemctl restart caddy</code></pre>
      <p>
        Attendi 1-2 minuti per la rigenerazione dei certificati e riprova.
      </p>

      <h3>Docker non parte dopo il reboot</h3>
      <p>
        Verifica che il servizio Docker sia abilitato:
      </p>
      <pre><code>{`systemctl is-enabled docker
systemctl enable docker
systemctl start docker`}</code></pre>

      <hr />
      <p>
        {replaceDomain(
          "Complimenti! Il tuo server Prolato e' configurato e pronto per i deploy su tuodominio.dev."
        )}
      </p>
      <p>
        <Link href="/docs/skill/install">Prossimo step: Installa la skill Prolato per Claude Code →</Link>
      </p>
    </div>
  );
}
