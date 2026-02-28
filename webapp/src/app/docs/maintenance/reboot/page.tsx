"use client";

import { useDomain } from "@/lib/useDomain";

export default function RebootPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>Comportamento al Reboot</h1>
      <p>
        {replaceDomain(
          "Tutti i servizi di Prolato su tuodominio.dev sono configurati per ripartire automaticamente dopo un reboot del server. Questa guida spiega cosa succede e come verificare che tutto funzioni."
        )}
      </p>

      <h2>Cosa succede al reboot</h2>
      <p>
        Quando il VPS viene riavviato (manualmente o per manutenzione del provider), tutti i servizi ripartono automaticamente grazie a due meccanismi:
      </p>
      <ul>
        <li>
          <strong>systemd</strong> &mdash; i servizi abilitati con <code>systemctl enable</code> vengono avviati automaticamente all&apos;avvio del sistema
        </li>
        <li>
          <strong>Docker restart policy</strong> &mdash; i container con <code>restart: unless-stopped</code> vengono riavviati dal daemon Docker
        </li>
      </ul>

      <h2>Servizi che ripartono automaticamente</h2>
      <table>
        <thead>
          <tr>
            <th>Servizio</th>
            <th>Tipo</th>
            <th>Meccanismo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Caddy</strong></td>
            <td>Reverse proxy + HTTPS</td>
            <td>systemd enabled</td>
          </tr>
          <tr>
            <td><strong>Gitea</strong></td>
            <td>Git server</td>
            <td>systemd enabled</td>
          </tr>
          <tr>
            <td><strong>Webhook</strong></td>
            <td>Server di deploy</td>
            <td>systemd enabled</td>
          </tr>
          <tr>
            <td><strong>Container Docker</strong></td>
            <td>Progetti deployati</td>
            <td>restart: unless-stopped</td>
          </tr>
        </tbody>
      </table>
      <p>
        Non e' necessario alcun intervento manuale: dopo il riavvio del server, tutti i servizi e i siti deployati tornano online automaticamente.
      </p>

      <h2>Verifica post-reboot</h2>
      <p>
        Dopo un reboot, puoi verificare lo stato di tutti i servizi con questi comandi:
      </p>
      <pre><code>{replaceDomain(`# Verifica servizi systemd
systemctl status caddy
systemctl status gitea
systemctl status webhook

# Verifica container Docker
docker ps

# Test rapido degli endpoint
curl -s https://tuodominio.dev
curl -s https://git.tuodominio.dev/api/v1/version
curl -s https://webhook.tuodominio.dev/health`)}</code></pre>
      <p>
        Tutti i servizi devono essere <code>active (running)</code> e tutti i container Docker devono essere in stato <code>Up</code>.
      </p>

      <h2>Checklist post-reboot</h2>
      <p>
        Usa questa checklist per una verifica completa dopo un riavvio:
      </p>
      <ul>
        <li>{replaceDomain("Caddy risponde su HTTPS (curl https://tuodominio.dev)")}</li>
        <li>{replaceDomain("Gitea e' accessibile (curl https://git.tuodominio.dev/api/v1/version)")}</li>
        <li>{replaceDomain("Webhook health check risponde (curl https://webhook.tuodominio.dev/health)")}</li>
        <li>Tutti i container Docker sono running (<code>docker ps</code>)</li>
        <li>I siti deployati sono raggiungibili dal browser</li>
      </ul>

      <h2>Troubleshooting</h2>
      <p>
        Se dopo un reboot un servizio non riparte, segui questi passaggi per diagnosticare e risolvere il problema.
      </p>

      <h3>1. Controlla i log del servizio</h3>
      <p>
        Usa <code>journalctl</code> per leggere i log e capire la causa dell&apos;errore:
      </p>
      <pre><code>{`# Log di Caddy
journalctl -u caddy -n 50 --no-pager

# Log di Gitea
journalctl -u gitea -n 50 --no-pager

# Log del Webhook
journalctl -u webhook -n 50 --no-pager`}</code></pre>

      <h3>2. Riavvia il servizio manualmente</h3>
      <p>
        Se un servizio non si e' avviato, prova a riavviarlo manualmente:
      </p>
      <pre><code>{`systemctl restart caddy
systemctl restart gitea
systemctl restart webhook`}</code></pre>
      <p>
        Dopo il riavvio manuale, verifica lo stato con <code>systemctl status</code>.
      </p>

      <h3>3. Verifica che il servizio sia abilitato</h3>
      <p>
        Se un servizio non si avvia automaticamente al boot, potrebbe non essere abilitato:
      </p>
      <pre><code>{`systemctl is-enabled caddy
systemctl is-enabled gitea
systemctl is-enabled webhook`}</code></pre>
      <p>
        Se il risultato e' <code>disabled</code>, abilita il servizio:
      </p>
      <pre><code>{`systemctl enable caddy
systemctl enable gitea
systemctl enable webhook`}</code></pre>

      <h3>4. Controlla i container Docker</h3>
      <p>
        Se i container Docker non sono ripartiti, verifica che il daemon Docker sia attivo e controlla i log dei singoli container:
      </p>
      <pre><code>{`# Verifica Docker
systemctl status docker

# Lista tutti i container (anche quelli fermi)
docker ps -a

# Log di un container specifico
cd /opt/docker-projects/nome-progetto
docker compose logs`}</code></pre>
      <p>
        Se il container ha <code>Exited</code> come stato, i log mostreranno la causa dell&apos;errore. Puoi riavviarlo con:
      </p>
      <pre><code>{`cd /opt/docker-projects/nome-progetto
docker compose up -d`}</code></pre>

      <h3>Problemi comuni</h3>
      <ul>
        <li>
          <strong>Porta occupata</strong> &mdash; un altro processo occupa la porta. Trova il processo con <code>ss -tlnp | grep PORTA</code>
        </li>
        <li>
          <strong>Disco pieno</strong> &mdash; verifica lo spazio con <code>df -h</code>. Libera spazio con <code>docker system prune</code> se necessario
        </li>
        <li>
          <strong>Certificati SSL scaduti</strong> &mdash; Caddy rinnova i certificati automaticamente. Se ci sono problemi, riavvia Caddy e attendi 1-2 minuti
        </li>
      </ul>
    </div>
  );
}
