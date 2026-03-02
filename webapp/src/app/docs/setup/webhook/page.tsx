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
          "In this step you will install the Prolato webhook server, the component that handles automatic deploys. The webhook receives notifications from Gitea, runs the Docker build, and configures Caddy to serve the project on yourdomain.dev."
        )}
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>Docker and Node.js installed (previous step)</li>
        <li>Gitea running with an admin account and API token generated</li>
        <li>{replaceDomain("Caddy configured with the webhook.yourdomain.dev block")}</li>
      </ul>

      <h2>Step 1: Clone the webhook repository</h2>
      <p>
        Clone the webhook server code into the dedicated directory:
      </p>
      <pre><code>{`cd /opt/webhook
git clone https://github.com/Aleloca/prolato.git .
cd webhook
npm install --production`}</code></pre>
      <p>
        The <code>npm install --production</code> command installs only the dependencies needed for runtime, without development dependencies.
      </p>

      <h2>Step 2: Generate the deploy token</h2>
      <p>
        The deploy token is a secret string that authenticates deploy requests from the Claude Code skill. Generate it with:
      </p>
      <pre><code>openssl rand -hex 32</code></pre>
      <p>
        Copy the generated value &mdash; you will need it in the next step. This token is like a password: anyone who has it can deploy to your server.
      </p>

      <h2>Step 3: Configure the .env file</h2>
      <p>
        {replaceDomain(
          "Create the configuration file with all the required parameters:"
        )}
      </p>
      <pre><code>{replaceDomain(`cat > /opt/webhook/.env << EOF
# Token to authenticate deploy requests
DEPLOY_TOKEN=YOUR_TOKEN_GENERATED_ABOVE

# Main domain
DOMAIN=yourdomain.dev

# Gitea configuration
GITEA_URL=https://git.yourdomain.dev
GITEA_API_TOKEN=YOUR_GITEA_API_TOKEN

# Working paths
PROJECTS_DIR=/var/www/projects
DOCKER_PROJECTS_DIR=/opt/docker-projects
CADDY_PROJECTS_DIR=/etc/caddy/projects.d

# Webhook server port
PORT=4000

# Environment
NODE_ENV=production
EOF`)}</code></pre>
      <p>
        Replace the following values:
      </p>
      <ul>
        <li><code>DEPLOY_TOKEN</code> &mdash; the token generated with <code>openssl rand -hex 32</code></li>
        <li><code>GITEA_API_TOKEN</code> &mdash; the token created in the Gitea step (Settings → Applications)</li>
      </ul>
      <pre><code>chmod 600 /opt/webhook/.env</code></pre>
      <p>
        The file has 600 permissions to protect the tokens.
      </p>

      <h2>Step 4: Generate the SSH key for deploy</h2>
      <p>
        The webhook server needs an SSH key to clone repositories from Gitea. Generate a key pair for the deploy user:
      </p>
      <pre><code>{`su - deploy -c 'ssh-keygen -t ed25519 -C "prolato-deploy-bot" -f /home/deploy/.ssh/id_ed25519 -N ""'`}</code></pre>
      <p>
        This creates:
      </p>
      <ul>
        <li><code>/home/deploy/.ssh/id_ed25519</code> &mdash; private key (stays on the server)</li>
        <li><code>/home/deploy/.ssh/id_ed25519.pub</code> &mdash; public key (to be added to Gitea)</li>
      </ul>

      <h2>Step 5: Add the SSH key to Gitea</h2>
      <p>
        Display the public key:
      </p>
      <pre><code>cat /home/deploy/.ssh/id_ed25519.pub</code></pre>
      <p>
        Copy the output and add it to Gitea:
      </p>
      <ol>
        <li>Log in to Gitea with the admin account</li>
        <li>Go to <strong>Settings</strong> → <strong>SSH / GPG Keys</strong></li>
        <li>Click <strong>Add Key</strong></li>
        <li>Paste the public key and assign a name (e.g. <code>prolato-deploy-bot</code>)</li>
        <li>Click <strong>Add Key</strong> to save</li>
      </ol>

      <p>
        {replaceDomain(
          "Also configure known_hosts to avoid interactive SSH prompts:"
        )}
      </p>
      <pre><code>{replaceDomain(`su - deploy -c 'ssh-keyscan -p 2222 git.yourdomain.dev >> /home/deploy/.ssh/known_hosts'`)}</code></pre>

      <blockquote>
        <p>
          {replaceDomain(
            "After this step you should be able to run su - deploy -c \"ssh -p 2222 git@git.yourdomain.dev\" and see a welcome message from Gitea (without unknown host errors)."
          )}
        </p>
      </blockquote>

      <h2>Step 6: Create the systemd service</h2>
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
        The <code>After</code> directive ensures the webhook starts after Gitea and Docker. <code>Requires=docker.service</code> guarantees that Docker is active.
      </p>

      <h2>Step 7: Configure logrotate</h2>
      <p>
        Create a logrotate configuration to prevent webhook logs from growing indefinitely:
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
        This configuration keeps logs from the last 14 days, compressed, and rotates the file daily.
      </p>

      <h2>Step 8: Start the webhook</h2>
      <pre><code>{`systemctl daemon-reload
systemctl enable --now webhook`}</code></pre>

      <h2>Step 9: Verify</h2>
      <p>Check that the webhook is running and responding:</p>
      <pre><code>{replaceDomain(`systemctl status webhook
curl -s https://webhook.yourdomain.dev/health`)}</code></pre>
      <p>
        The <code>systemctl status</code> command should show <code>active (running)</code>. The <code>curl</code> command should return a JSON response indicating that the service is active.
      </p>

      <blockquote>
        <p>
          {replaceDomain(
            "After this step you should see the webhook active and the endpoint https://webhook.yourdomain.dev/health responding correctly."
          )}
        </p>
      </blockquote>

      <h2>Troubleshooting</h2>
      <h3>The webhook does not start</h3>
      <p>
        Check the logs with <code>journalctl -u webhook -n 50</code>. The most common errors:
      </p>
      <ul>
        <li><strong>Missing or incomplete .env file</strong> &mdash; verify that <code>/opt/webhook/.env</code> exists and contains all parameters</li>
        <li><strong>Missing npm dependencies</strong> &mdash; run <code>cd /opt/webhook/webhook &amp;&amp; npm install --production</code></li>
        <li><strong>Port 4000 in use</strong> &mdash; check with <code>ss -tlnp | grep 4000</code></li>
      </ul>

      <h3>The /health endpoint does not respond</h3>
      <p>
        {replaceDomain(
          "Verify that Caddy is proxying to the webhook: check the webhook.yourdomain.dev block in the Caddyfile. You can also test directly on the local port:"
        )}
      </p>
      <pre><code>curl -s http://localhost:4000/health</code></pre>
      <p>
        If this works but the HTTPS URL does not, the problem is in the Caddy configuration.
      </p>

      <h3>SSH connection error to Gitea</h3>
      <p>
        If the SSH key is not working, verify that:
      </p>
      <ul>
        <li>The public key has been correctly added to the Gitea admin account</li>
        <li>The file <code>/home/deploy/.ssh/known_hosts</code> contains the Gitea host</li>
        <li>The <code>.ssh</code> directory permissions are correct: <code>chmod 700 /home/deploy/.ssh &amp;&amp; chmod 600 /home/deploy/.ssh/id_ed25519</code></li>
      </ul>

      <hr />
      <p>
        <Link href="/docs/setup/verify">Next step: Verify →</Link>
      </p>
    </div>
  );
}
