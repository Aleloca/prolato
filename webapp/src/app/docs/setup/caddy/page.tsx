"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function CaddyPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>3. Caddy</h1>
      <p>
        {replaceDomain(
          "In questo step installerai Caddy, il reverse proxy che gestisce HTTPS automatico per tuodominio.dev e tutti i sottodomini. Caddy viene compilato con il plugin Cloudflare DNS per generare certificati wildcard."
        )}
      </p>

      <h2>Prerequisiti</h2>
      <ul>
        <li>VPS configurata con utente deploy (step precedente)</li>
        <li>Token API Cloudflare (creato nello step DNS)</li>
        <li>{replaceDomain("Record DNS configurati per tuodominio.dev e *.tuodominio.dev")}</li>
      </ul>

      <h2>Step 1: Installa Go</h2>
      <p>
        Caddy deve essere compilato da sorgente per includere il plugin Cloudflare DNS. Per questo serve Go:
      </p>
      <pre><code>{`wget https://go.dev/dl/go1.22.5.linux-amd64.tar.gz
rm -rf /usr/local/go
tar -C /usr/local -xzf go1.22.5.linux-amd64.tar.gz
rm go1.22.5.linux-amd64.tar.gz

echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
export PATH=$PATH:/usr/local/go/bin`}</code></pre>
      <p>
        Verifica l&apos;installazione:
      </p>
      <pre><code>go version</code></pre>

      <blockquote>
        <p>
          Dopo questo step dovresti vedere <code>go version go1.22.5 linux/amd64</code> o simile.
        </p>
      </blockquote>

      <h2>Step 2: Installa xcaddy</h2>
      <p>
        <code>xcaddy</code> e' lo strumento ufficiale per compilare Caddy con plugin personalizzati:
      </p>
      <pre><code>go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest</code></pre>

      <h2>Step 3: Compila Caddy con il plugin Cloudflare</h2>
      <p>
        Compila Caddy includendo il modulo DNS per Cloudflare. Questo permette a Caddy di usare il DNS challenge per generare certificati wildcard:
      </p>
      <pre><code>{`~/go/bin/xcaddy build --with github.com/caddy-dns/cloudflare

mv caddy /usr/local/bin/caddy
chmod +x /usr/local/bin/caddy`}</code></pre>
      <p>
        La compilazione puo' richiedere 1-2 minuti. Alla fine avrai un binario <code>caddy</code> nella directory corrente che verra' spostato in <code>/usr/local/bin/</code>.
      </p>

      <blockquote>
        <p>
          Dopo questo step dovresti poter eseguire <code>caddy version</code> e vedere la versione installata.
        </p>
      </blockquote>

      <h2>Step 4: Crea le directory di configurazione</h2>
      <pre><code>{`mkdir -p /etc/caddy/projects.d
mkdir -p /var/log/caddy`}</code></pre>

      <h2>Step 5: Crea il Caddyfile</h2>
      <p>
        {replaceDomain(
          "Il Caddyfile e' il file di configurazione principale di Caddy. Contiene 4 blocchi per gestire il dominio principale, Gitea, il webhook e i progetti:"
        )}
      </p>
      <pre><code>{replaceDomain(`cat > /etc/caddy/Caddyfile << 'EOF'
# Dominio principale
tuodominio.dev {
  tls {
    dns cloudflare {env.CLOUDFLARE_API_TOKEN}
  }
  respond "Prolato - Server attivo" 200
}

# Gitea
git.tuodominio.dev {
  tls {
    dns cloudflare {env.CLOUDFLARE_API_TOKEN}
  }
  reverse_proxy localhost:3000
}

# Webhook
webhook.tuodominio.dev {
  tls {
    dns cloudflare {env.CLOUDFLARE_API_TOKEN}
  }
  reverse_proxy localhost:4000
}

# Progetti (caricati dinamicamente)
import /etc/caddy/projects.d/*.caddy
EOF`)}</code></pre>
      <p>
        Ecco cosa fa ogni blocco:
      </p>
      <ul>
        <li>{replaceDomain("<strong>tuodominio.dev</strong> — dominio principale, mostra un messaggio di conferma")}</li>
        <li>{replaceDomain("<strong>git.tuodominio.dev</strong> — proxy verso Gitea (porta 3000)")}</li>
        <li>{replaceDomain("<strong>webhook.tuodominio.dev</strong> — proxy verso il server webhook (porta 4000)")}</li>
        <li><strong>import projects.d</strong> &mdash; carica automaticamente le configurazioni dei progetti deployati</li>
      </ul>

      <h2>Step 6: Configura il token Cloudflare</h2>
      <p>
        Salva il token API di Cloudflare in un file environment. Caddy lo usera' per il DNS challenge:
      </p>
      <pre><code>{`cat > /etc/caddy/caddy.env << EOF
CLOUDFLARE_API_TOKEN=IL_TUO_TOKEN_CLOUDFLARE
EOF

chmod 600 /etc/caddy/caddy.env`}</code></pre>
      <p>
        <strong>Importante:</strong> sostituisci <code>IL_TUO_TOKEN_CLOUDFLARE</code> con il token che hai creato nello step DNS. Il file ha permessi 600 per proteggere il token.
      </p>

      <h2>Step 7: Crea il servizio systemd</h2>
      <p>
        Crea un file unit systemd per avviare Caddy automaticamente:
      </p>
      <pre><code>{`cat > /etc/systemd/system/caddy.service << 'EOF'
[Unit]
Description=Caddy web server
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
ExecStart=/usr/local/bin/caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
ExecReload=/usr/local/bin/caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
EnvironmentFile=/etc/caddy/caddy.env
TimeoutStopSec=5s
LimitNOFILE=1048576
LimitNPROC=512
AmbientCapabilities=CAP_NET_BIND_SERVICE
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF`}</code></pre>
      <p>
        La direttiva <code>EnvironmentFile</code> carica il token Cloudflare come variabile d&apos;ambiente. <code>AmbientCapabilities=CAP_NET_BIND_SERVICE</code> permette a Caddy di ascoltare sulle porte 80 e 443 senza essere root.
      </p>

      <h2>Step 8: Avvia Caddy</h2>
      <pre><code>{`systemctl daemon-reload
systemctl enable --now caddy`}</code></pre>
      <p>
        Il flag <code>--now</code> abilita il servizio all&apos;avvio e lo avvia immediatamente.
      </p>

      <h2>Step 9: Verifica</h2>
      <p>Controlla che Caddy sia in esecuzione e che HTTPS funzioni:</p>
      <pre><code>{replaceDomain(`systemctl status caddy
curl -I https://tuodominio.dev`)}</code></pre>
      <p>
        {replaceDomain(
          "Il comando systemctl status caddy dovrebbe mostrare \"active (running)\". Il comando curl dovrebbe restituire un codice HTTP 200 con un certificato SSL valido per tuodominio.dev."
        )}
      </p>

      <blockquote>
        <p>
          {replaceDomain(
            "Dopo questo step dovresti poter aprire https://tuodominio.dev nel browser e vedere il messaggio \"Prolato - Server attivo\"."
          )}
        </p>
      </blockquote>

      <h2>Troubleshooting</h2>
      <h3>Caddy non si avvia</h3>
      <p>
        Controlla i log con <code>journalctl -u caddy -n 50</code>. Gli errori piu' comuni sono:
      </p>
      <ul>
        <li><strong>Token Cloudflare non valido</strong> &mdash; verifica il contenuto di <code>/etc/caddy/caddy.env</code></li>
        <li><strong>Porta 80/443 gia' in uso</strong> &mdash; controlla con <code>ss -tlnp | grep -E &apos;:80|:443&apos;</code> e ferma il servizio che le occupa (es. Apache o Nginx)</li>
        <li><strong>Errore di sintassi nel Caddyfile</strong> &mdash; verifica con <code>caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile</code></li>
      </ul>

      <h3>Certificato SSL non generato</h3>
      <p>
        Caddy genera i certificati al primo avvio. Se non riesce, controlla che:
      </p>
      <ul>
        <li>I record DNS siano propagati (vedi step DNS)</li>
        <li>Il token Cloudflare abbia i permessi corretti (<code>Zone &gt; DNS &gt; Edit</code>)</li>
        <li>La porta 443 sia raggiungibile dall&apos;esterno</li>
      </ul>

      <h3>curl restituisce errore di certificato</h3>
      <p>
        Se il certificato non e' ancora pronto, attendi 1-2 minuti. Caddy genera il certificato in modo asincrono. Controlla i log con <code>journalctl -u caddy -f</code> per vedere lo stato.
      </p>

      <hr />
      <p>
        <Link href="/docs/setup/gitea">Prossimo step: Gitea →</Link>
      </p>
    </div>
  );
}
