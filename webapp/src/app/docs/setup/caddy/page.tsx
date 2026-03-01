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
          "In this step you will install Caddy, the reverse proxy that handles automatic HTTPS for yourdomain.dev and all subdomains. Caddy is compiled with the Cloudflare DNS plugin to generate wildcard certificates."
        )}
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>VPS configured with deploy user (previous step)</li>
        <li>Cloudflare API token (created in the DNS step)</li>
        <li>{replaceDomain("DNS records configured for yourdomain.dev and *.yourdomain.dev")}</li>
      </ul>

      <h2>Step 1: Install Go</h2>
      <p>
        Caddy must be compiled from source to include the Cloudflare DNS plugin. This requires Go:
      </p>
      <pre><code>{`wget https://go.dev/dl/go1.22.5.linux-amd64.tar.gz
rm -rf /usr/local/go
tar -C /usr/local -xzf go1.22.5.linux-amd64.tar.gz
rm go1.22.5.linux-amd64.tar.gz

echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
export PATH=$PATH:/usr/local/go/bin`}</code></pre>
      <p>
        Verify the installation:
      </p>
      <pre><code>go version</code></pre>

      <blockquote>
        <p>
          After this step you should see <code>go version go1.22.5 linux/amd64</code> or similar.
        </p>
      </blockquote>

      <h2>Step 2: Install xcaddy</h2>
      <p>
        <code>xcaddy</code> is the official tool for compiling Caddy with custom plugins:
      </p>
      <pre><code>go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest</code></pre>

      <h2>Step 3: Compile Caddy with the Cloudflare plugin</h2>
      <p>
        Compile Caddy including the DNS module for Cloudflare. This allows Caddy to use the DNS challenge to generate wildcard certificates:
      </p>
      <pre><code>{`~/go/bin/xcaddy build --with github.com/caddy-dns/cloudflare

mv caddy /usr/local/bin/caddy
chmod +x /usr/local/bin/caddy`}</code></pre>
      <p>
        Compilation may take 1-2 minutes. At the end you will have a <code>caddy</code> binary in the current directory that will be moved to <code>/usr/local/bin/</code>.
      </p>

      <blockquote>
        <p>
          After this step you should be able to run <code>caddy version</code> and see the installed version.
        </p>
      </blockquote>

      <h2>Step 4: Create the configuration directories</h2>
      <pre><code>{`mkdir -p /etc/caddy/projects.d
mkdir -p /var/log/caddy`}</code></pre>

      <h2>Step 5: Create the Caddyfile</h2>
      <p>
        {replaceDomain(
          "The Caddyfile is the main configuration file for Caddy. It contains 4 blocks for managing the main domain, Gitea, the webhook, and the projects:"
        )}
      </p>
      <pre><code>{replaceDomain(`cat > /etc/caddy/Caddyfile << 'EOF'
# Main domain
yourdomain.dev {
  tls {
    dns cloudflare {env.CLOUDFLARE_API_TOKEN}
  }
  respond "Prolato - Server active" 200
}

# Gitea
git.yourdomain.dev {
  tls {
    dns cloudflare {env.CLOUDFLARE_API_TOKEN}
  }
  reverse_proxy localhost:3000
}

# Webhook
webhook.yourdomain.dev {
  tls {
    dns cloudflare {env.CLOUDFLARE_API_TOKEN}
  }
  reverse_proxy localhost:4000
}

# Projects (loaded dynamically)
import /etc/caddy/projects.d/*.caddy
EOF`)}</code></pre>
      <p>
        Here&apos;s what each block does:
      </p>
      <ul>
        <li>{replaceDomain("<strong>yourdomain.dev</strong> — main domain, shows a confirmation message")}</li>
        <li>{replaceDomain("<strong>git.yourdomain.dev</strong> — proxy to Gitea (port 3000)")}</li>
        <li>{replaceDomain("<strong>webhook.yourdomain.dev</strong> — proxy to the webhook server (port 4000)")}</li>
        <li><strong>import projects.d</strong> &mdash; automatically loads configurations for deployed projects</li>
      </ul>

      <h2>Step 6: Configure the Cloudflare token</h2>
      <p>
        Save the Cloudflare API token in an environment file. Caddy will use it for the DNS challenge:
      </p>
      <pre><code>{`cat > /etc/caddy/caddy.env << EOF
CLOUDFLARE_API_TOKEN=YOUR_CLOUDFLARE_TOKEN
EOF

chmod 600 /etc/caddy/caddy.env`}</code></pre>
      <p>
        <strong>Important:</strong> replace <code>YOUR_CLOUDFLARE_TOKEN</code> with the token you created in the DNS step. The file has 600 permissions to protect the token.
      </p>

      <h2>Step 7: Create the systemd service</h2>
      <p>
        Create a systemd unit file to start Caddy automatically:
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
        The <code>EnvironmentFile</code> directive loads the Cloudflare token as an environment variable. <code>AmbientCapabilities=CAP_NET_BIND_SERVICE</code> allows Caddy to listen on ports 80 and 443 without being root.
      </p>

      <h2>Step 8: Start Caddy</h2>
      <pre><code>{`systemctl daemon-reload
systemctl enable --now caddy`}</code></pre>
      <p>
        The <code>--now</code> flag enables the service at boot and starts it immediately.
      </p>

      <h2>Step 9: Verify</h2>
      <p>Check that Caddy is running and that HTTPS works:</p>
      <pre><code>{replaceDomain(`systemctl status caddy
curl -I https://yourdomain.dev`)}</code></pre>
      <p>
        {replaceDomain(
          "The systemctl status caddy command should show \"active (running)\". The curl command should return an HTTP 200 code with a valid SSL certificate for yourdomain.dev."
        )}
      </p>

      <blockquote>
        <p>
          {replaceDomain(
            "After this step you should be able to open https://yourdomain.dev in the browser and see the message \"Prolato - Server active\"."
          )}
        </p>
      </blockquote>

      <h2>Troubleshooting</h2>
      <h3>Caddy won&apos;t start</h3>
      <p>
        Check the logs with <code>journalctl -u caddy -n 50</code>. The most common errors are:
      </p>
      <ul>
        <li><strong>Invalid Cloudflare token</strong> &mdash; verify the contents of <code>/etc/caddy/caddy.env</code></li>
        <li><strong>Port 80/443 already in use</strong> &mdash; check with <code>ss -tlnp | grep -E &apos;:80|:443&apos;</code> and stop the service occupying them (e.g. Apache or Nginx)</li>
        <li><strong>Caddyfile syntax error</strong> &mdash; verify with <code>caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile</code></li>
      </ul>

      <h3>SSL certificate not generated</h3>
      <p>
        Caddy generates certificates on first startup. If it fails, check that:
      </p>
      <ul>
        <li>DNS records have propagated (see DNS step)</li>
        <li>The Cloudflare token has the correct permissions (<code>Zone &gt; DNS &gt; Edit</code>)</li>
        <li>Port 443 is reachable from outside</li>
      </ul>

      <h3>curl returns a certificate error</h3>
      <p>
        If the certificate is not ready yet, wait 1-2 minutes. Caddy generates the certificate asynchronously. Check the logs with <code>journalctl -u caddy -f</code> to see the status.
      </p>

      <hr />
      <p>
        <Link href="/docs/setup/gitea">Next step: Gitea →</Link>
      </p>
    </div>
  );
}
