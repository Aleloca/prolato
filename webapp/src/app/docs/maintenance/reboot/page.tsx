"use client";

import { useDomain } from "@/lib/useDomain";

export default function RebootPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>Reboot Behavior</h1>
      <p>
        {replaceDomain(
          "All Prolato services on yourdomain.dev are configured to restart automatically after a server reboot. This guide explains what happens and how to verify that everything works."
        )}
      </p>

      <h2>What happens on reboot</h2>
      <p>
        When the VPS is restarted (manually or for provider maintenance), all services restart automatically thanks to two mechanisms:
      </p>
      <ul>
        <li>
          <strong>systemd</strong> &mdash; services enabled with <code>systemctl enable</code> are started automatically at system boot
        </li>
        <li>
          <strong>Docker restart policy</strong> &mdash; containers with <code>restart: unless-stopped</code> are restarted by the Docker daemon
        </li>
      </ul>

      <h2>Services that restart automatically</h2>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Type</th>
            <th>Mechanism</th>
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
            <td>Deploy server</td>
            <td>systemd enabled</td>
          </tr>
          <tr>
            <td><strong>Docker Containers</strong></td>
            <td>Deployed projects</td>
            <td>restart: unless-stopped</td>
          </tr>
        </tbody>
      </table>
      <p>
        No manual intervention is needed: after the server restarts, all services and deployed sites come back online automatically.
      </p>

      <h2>Post-reboot verification</h2>
      <p>
        After a reboot, you can verify the status of all services with these commands:
      </p>
      <pre><code>{replaceDomain(`# Verify systemd services
systemctl status caddy
systemctl status gitea
systemctl status webhook

# Verify Docker containers
docker ps

# Quick endpoint test
curl -s https://yourdomain.dev
curl -s https://git.yourdomain.dev/api/v1/version
curl -s https://webhook.yourdomain.dev/health`)}</code></pre>
      <p>
        All services should be <code>active (running)</code> and all Docker containers should be in <code>Up</code> state.
      </p>

      <h2>Post-reboot checklist</h2>
      <p>
        Use this checklist for a complete verification after a reboot:
      </p>
      <ul>
        <li>{replaceDomain("Caddy responds on HTTPS (curl https://yourdomain.dev)")}</li>
        <li>{replaceDomain("Gitea is accessible (curl https://git.yourdomain.dev/api/v1/version)")}</li>
        <li>{replaceDomain("Webhook health check responds (curl https://webhook.yourdomain.dev/health)")}</li>
        <li>All Docker containers are running (<code>docker ps</code>)</li>
        <li>Deployed sites are reachable from the browser</li>
      </ul>

      <h2>Troubleshooting</h2>
      <p>
        If after a reboot a service does not restart, follow these steps to diagnose and fix the problem.
      </p>

      <h3>1. Check the service logs</h3>
      <p>
        Use <code>journalctl</code> to read the logs and understand the cause of the error:
      </p>
      <pre><code>{`# Caddy logs
journalctl -u caddy -n 50 --no-pager

# Gitea logs
journalctl -u gitea -n 50 --no-pager

# Webhook logs
journalctl -u webhook -n 50 --no-pager`}</code></pre>

      <h3>2. Restart the service manually</h3>
      <p>
        If a service did not start, try restarting it manually:
      </p>
      <pre><code>{`systemctl restart caddy
systemctl restart gitea
systemctl restart webhook`}</code></pre>
      <p>
        After the manual restart, verify the status with <code>systemctl status</code>.
      </p>

      <h3>3. Verify that the service is enabled</h3>
      <p>
        If a service does not start automatically at boot, it may not be enabled:
      </p>
      <pre><code>{`systemctl is-enabled caddy
systemctl is-enabled gitea
systemctl is-enabled webhook`}</code></pre>
      <p>
        If the result is <code>disabled</code>, enable the service:
      </p>
      <pre><code>{`systemctl enable caddy
systemctl enable gitea
systemctl enable webhook`}</code></pre>

      <h3>4. Check Docker containers</h3>
      <p>
        If Docker containers did not restart, verify that the Docker daemon is active and check the logs of individual containers:
      </p>
      <pre><code>{`# Verify Docker
systemctl status docker

# List all containers (including stopped ones)
docker ps -a

# Logs for a specific container
cd /opt/docker-projects/project-name
docker compose logs`}</code></pre>
      <p>
        If the container has <code>Exited</code> as its status, the logs will show the cause of the error. You can restart it with:
      </p>
      <pre><code>{`cd /opt/docker-projects/project-name
docker compose up -d`}</code></pre>

      <h3>Common issues</h3>
      <ul>
        <li>
          <strong>Port in use</strong> &mdash; another process is occupying the port. Find the process with <code>ss -tlnp | grep PORT</code>
        </li>
        <li>
          <strong>Disk full</strong> &mdash; check disk space with <code>df -h</code>. Free up space with <code>docker system prune</code> if needed
        </li>
        <li>
          <strong>Expired SSL certificates</strong> &mdash; Caddy renews certificates automatically. If there are issues, restart Caddy and wait 1-2 minutes
        </li>
      </ul>
    </div>
  );
}
