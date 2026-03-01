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
          "In this step you will install Gitea, a lightweight self-hosted Git server. Gitea will be accessible at git.yourdomain.dev and will host your project repositories."
        )}
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>VPS configured with deploy user</li>
        <li>{replaceDomain("Caddy running with the git.yourdomain.dev block configured")}</li>
      </ul>

      <h2>Step 1: Download the Gitea binary</h2>
      <p>
        Download the latest stable version of Gitea directly from the official repository:
      </p>
      <pre><code>{`GITEA_VERSION=$(curl -s https://api.github.com/repos/go-gitea/gitea/releases/latest | jq -r .tag_name | sed 's/v//')
wget -O /usr/local/bin/gitea "https://dl.gitea.io/gitea/$GITEA_VERSION/gitea-$GITEA_VERSION-linux-amd64"
chmod +x /usr/local/bin/gitea`}</code></pre>
      <p>
        The first command retrieves the latest version number, the second downloads the binary, and the third makes it executable.
      </p>

      <blockquote>
        <p>
          After this step you should be able to run <code>gitea --version</code> and see the installed version.
        </p>
      </blockquote>

      <h2>Step 2: Create the git user</h2>
      <p>
        Gitea needs a dedicated system user:
      </p>
      <pre><code>{`adduser --system --shell /bin/bash --gecos 'Git Version Control' \\
  --group --disabled-password --home /home/git git`}</code></pre>

      <h2>Step 3: Create the directories</h2>
      <p>
        Create the necessary directories for Gitea:
      </p>
      <pre><code>{`mkdir -p /var/lib/gitea/{custom,data,log}
mkdir -p /etc/gitea

chown -R git:git /var/lib/gitea
chown -R root:git /etc/gitea
chmod 770 /etc/gitea`}</code></pre>
      <ul>
        <li><code>/var/lib/gitea/</code> &mdash; Gitea data, repositories, and logs</li>
        <li><code>/etc/gitea/</code> &mdash; configuration files</li>
      </ul>

      <h2>Step 4: Configure app.ini</h2>
      <p>
        {replaceDomain(
          "Create the main Gitea configuration file. The important parameters are ROOT_URL, SSH_DOMAIN, and SSH_PORT:"
        )}
      </p>
      <pre><code>{replaceDomain(`cat > /etc/gitea/app.ini << 'EOF'
APP_NAME = Prolato Git
RUN_MODE = prod
RUN_USER = git

[server]
HTTP_PORT      = 3000
ROOT_URL       = https://git.yourdomain.dev/
SSH_DOMAIN     = git.yourdomain.dev
SSH_PORT       = 2222
START_SSH_SERVER = true
DOMAIN         = git.yourdomain.dev
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
DISABLE_REGISTRATION       = false
REQUIRE_SIGNIN_VIEW        = false
DEFAULT_KEEP_EMAIL_PRIVATE = true

[log]
MODE = console
LEVEL = Info
ROOT_PATH = /var/lib/gitea/log
EOF

chown root:git /etc/gitea/app.ini
chmod 640 /etc/gitea/app.ini`)}</code></pre>
      <p>Here&apos;s what the main parameters do:</p>
      <ul>
        <li><code>HTTP_PORT = 3000</code> &mdash; Gitea listens on port 3000 (Caddy acts as proxy)</li>
        <li>{replaceDomain("<code>ROOT_URL</code> — the public URL of Gitea (https://git.yourdomain.dev/)")}</li>
        <li><code>SSH_PORT = 2222</code> &mdash; separate SSH port to avoid conflicting with the system&apos;s port 22</li>
        <li><code>DISABLE_REGISTRATION = false</code> &mdash; allows users to self-register on Gitea (each user creates their own account)</li>
        <li><code>DB_TYPE = sqlite3</code> &mdash; uses SQLite as the database (no database server needed)</li>
      </ul>

      <h2>Step 5: Create the systemd service</h2>
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

      <h2>Step 6: Start Gitea</h2>
      <pre><code>{`systemctl daemon-reload
systemctl enable --now gitea`}</code></pre>

      <blockquote>
        <p>
          {replaceDomain(
            "After this step you should be able to open https://git.yourdomain.dev in the browser and see the Gitea initial installation page."
          )}
        </p>
      </blockquote>

      <h2>Step 7: Complete the installation wizard</h2>
      <p>
        {replaceDomain(
          "Open https://git.yourdomain.dev in the browser. You will see the initial configuration page. Most fields are already pre-filled from the app.ini file. Verify that:"
        )}
      </p>
      <ul>
        <li>The database type is <strong>SQLite3</strong></li>
        <li>{replaceDomain("The SSH domain is <strong>git.yourdomain.dev</strong>")}</li>
        <li>The SSH port is <strong>2222</strong></li>
        <li>{replaceDomain("The base URL is <strong>https://git.yourdomain.dev/</strong>")}</li>
      </ul>
      <p>
        Click <strong>Install Gitea</strong> at the bottom of the page to complete the setup.
      </p>

      <h2>Step 8: Create the administrator account</h2>
      <p>
        After installation, register the first user &mdash; it will automatically become the administrator. Choose a username and a secure password and save them in a safe place.
      </p>
      <p>
        Since registration is open (<code>DISABLE_REGISTRATION = false</code>), other team members will be able to create their own accounts directly from the Gitea login page. Each user will then generate their own API token to use with the Prolato skill (see the <Link href="/docs/skill/install">Skill Installation</Link> guide).
      </p>

      <blockquote>
        <p>
          After this step you should be able to access the Gitea dashboard with your admin account.
        </p>
      </blockquote>

      <h2>Step 9: Generate an admin API token</h2>
      <p>
        The webhook server needs an admin API token to interact with Gitea (create repositories, configure hooks, etc.). To generate it:
      </p>
      <ol>
        <li>Log in to Gitea with the admin account</li>
        <li>Go to <strong>Settings</strong> (user icon in the top right → Settings)</li>
        <li>Click on the <strong>Applications</strong> tab</li>
        <li>In the &quot;Generate new token&quot; section, enter a name (e.g. <code>prolato-webhook</code>)</li>
        <li>Select the required permissions (at minimum: <code>repo</code>, <code>admin:repo_hook</code>, <code>admin:org</code>)</li>
        <li>Click <strong>Generate token</strong></li>
        <li>Copy the generated token and save it &mdash; you will need it in the Webhook step</li>
      </ol>
      <p>
        <strong>Note:</strong> this is the <em>admin</em> token for the webhook server. Regular users do not need this token &mdash; they will create their own personal token during the <Link href="/docs/skill/install">Skill Installation</Link> step.
      </p>

      <blockquote>
        <p>
          After this step you should have a Gitea API token that the webhook server will use to manage repositories.
        </p>
      </blockquote>

      <h2>Step 10: Verify</h2>
      <pre><code>{replaceDomain(`systemctl status gitea
curl -s https://git.yourdomain.dev/api/v1/version`)}</code></pre>
      <p>
        The first command should show <code>active (running)</code>. The second should return a JSON with the Gitea version.
      </p>

      <h2>Troubleshooting</h2>
      <h3>Gitea won&apos;t start</h3>
      <p>
        Check the logs with <code>journalctl -u gitea -n 50</code>. The most common errors:
      </p>
      <ul>
        <li><strong>Database permissions</strong> &mdash; verify that <code>/var/lib/gitea/data/</code> is owned by the <code>git</code> user</li>
        <li><strong>Port 3000 occupied</strong> &mdash; check with <code>ss -tlnp | grep 3000</code></li>
      </ul>

      <h3>The web page won&apos;t load</h3>
      <p>
        {replaceDomain(
          "Verify that Caddy is proxying to Gitea: check the git.yourdomain.dev block in the Caddyfile and that Caddy is running."
        )}
      </p>

      <h3>Error during the installation wizard</h3>
      <p>
        If the wizard shows errors, check the permissions of the <code>/var/lib/gitea</code> and <code>/etc/gitea</code> directories. They must be accessible by the <code>git</code> user.
      </p>

      <hr />
      <p>
        <Link href="/docs/setup/docker">Next step: Docker →</Link>
      </p>
    </div>
  );
}
