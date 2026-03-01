"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function VerifyPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>7. Verify</h1>
      <p>
        {replaceDomain(
          "You have completed the installation of all Prolato components on yourdomain.dev. In this final step you will verify that everything works correctly and collect the credentials generated during setup."
        )}
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>All previous steps completed (DNS, VPS, Caddy, Gitea, Docker, Webhook)</li>
      </ul>

      <h2>Verification checklist</h2>
      <p>
        Run all the following checks. Each item must work correctly before proceeding.
      </p>

      <h3>1. DNS resolves correctly</h3>
      <pre><code>{replaceDomain(`dig +short yourdomain.dev
dig +short git.yourdomain.dev
dig +short webhook.yourdomain.dev`)}</code></pre>
      <p>
        All three must return the IP of your VPS.
      </p>

      <h3>2. Caddy is running and HTTPS works</h3>
      <pre><code>{replaceDomain(`systemctl status caddy
curl -I https://yourdomain.dev`)}</code></pre>
      <p>
        {replaceDomain(
          "The status should be \"active (running)\". curl should return HTTP 200 with a valid SSL certificate for yourdomain.dev."
        )}
      </p>

      <h3>3. Gitea is accessible via web</h3>
      <pre><code>{replaceDomain(`systemctl status gitea
curl -s https://git.yourdomain.dev/api/v1/version`)}</code></pre>
      <p>
        {replaceDomain(
          "The status should be \"active (running)\". The API should return the Gitea version. Also verify that you can access https://git.yourdomain.dev in the browser."
        )}
      </p>

      <h3>4. Docker is installed and the deploy user can use it</h3>
      <pre><code>{`docker --version
su - deploy -c "docker ps"
su - deploy -c "docker info --format '{{.ServerVersion}}'"
`}</code></pre>
      <p>
        All commands should work without errors. In particular, the deploy user must be able to run <code>docker ps</code> without <code>sudo</code>.
      </p>

      <h3>5. Webhook is running and the health endpoint responds</h3>
      <pre><code>{replaceDomain(`systemctl status webhook
curl -s https://webhook.yourdomain.dev/health`)}</code></pre>
      <p>
        The status should be &quot;active (running)&quot;. The health endpoint should return a positive response.
      </p>

      <h3>6. SSH key configured</h3>
      <pre><code>{replaceDomain(`su - deploy -c "ssh -T -p 2222 git@git.yourdomain.dev"`)}</code></pre>
      <p>
        You should see a welcome message from Gitea. If you see a &quot;host key verification&quot; error, run:
      </p>
      <pre><code>{replaceDomain(`su - deploy -c 'ssh-keyscan -p 2222 git.yourdomain.dev >> /home/deploy/.ssh/known_hosts'`)}</code></pre>

      <h3>7. All services survive a reboot</h3>
      <pre><code>systemctl is-enabled caddy gitea webhook</code></pre>
      <p>
        All three should return <code>enabled</code>. This means the services will start automatically when the server reboots.
      </p>
      <p>
        If a service is not enabled, activate it with:
      </p>
      <pre><code>{`systemctl enable caddy
systemctl enable gitea
systemctl enable webhook`}</code></pre>

      <h2>Full test with reboot</h2>
      <p>
        For a definitive verification, reboot the server and check that everything comes back up:
      </p>
      <pre><code>{replaceDomain(`reboot

# After the reboot, reconnect and verify:
ssh root@YOUR_VPS_IP
systemctl status caddy gitea webhook
curl -s https://webhook.yourdomain.dev/health`)}</code></pre>

      <h2>Credentials summary</h2>
      <p>
        During setup you generated several credentials. Make sure you have saved them in a secure location:
      </p>

      <table>
        <thead>
          <tr>
            <th>Credential</th>
            <th>Location</th>
            <th>Usage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Deploy Token</strong></td>
            <td><code>/opt/webhook/.env</code></td>
            <td>Authenticates deploy requests from the Claude Code skill</td>
          </tr>
          <tr>
            <td><strong>Cloudflare API Token</strong></td>
            <td><code>/etc/caddy/caddy.env</code></td>
            <td>SSL certificate generation via DNS challenge</td>
          </tr>
          <tr>
            <td><strong>SSH Public Key</strong></td>
            <td><code>/home/deploy/.ssh/id_ed25519.pub</code></td>
            <td>Clone repositories from Gitea without a password</td>
          </tr>
          <tr>
            <td><strong>Gitea Admin Credentials</strong></td>
            <td>Set during the wizard</td>
            <td>Access to the Gitea web interface</td>
          </tr>
          <tr>
            <td><strong>Gitea API Token</strong></td>
            <td>Generated in settings</td>
            <td>Programmatic interaction with Gitea (used by the webhook)</td>
          </tr>
        </tbody>
      </table>

      <h2>Troubleshooting</h2>
      <h3>A service is not active after reboot</h3>
      <p>
        Check the service logs to understand why it did not start:
      </p>
      <pre><code>{`journalctl -u caddy -n 30 --no-pager
journalctl -u gitea -n 30 --no-pager
journalctl -u webhook -n 30 --no-pager`}</code></pre>

      <h3>SSL certificates do not work after reboot</h3>
      <p>
        Caddy caches certificates. If for some reason they are not loaded, restart Caddy:
      </p>
      <pre><code>systemctl restart caddy</code></pre>
      <p>
        Wait 1-2 minutes for certificate regeneration and try again.
      </p>

      <h3>Docker does not start after reboot</h3>
      <p>
        Verify that the Docker service is enabled:
      </p>
      <pre><code>{`systemctl is-enabled docker
systemctl enable docker
systemctl start docker`}</code></pre>

      <hr />
      <p>
        {replaceDomain(
          "Congratulations! Your Prolato server is configured and ready for deploys on yourdomain.dev."
        )}
      </p>
      <p>
        <Link href="/docs/skill/install">Next step: Install the Prolato skill for Claude Code →</Link>
      </p>
    </div>
  );
}
