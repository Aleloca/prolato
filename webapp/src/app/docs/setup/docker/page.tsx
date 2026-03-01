"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function DockerPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>5. Docker</h1>
      <p>
        In this step you will install Docker to run project containers, Node.js for the webhook server, and create the necessary working directories.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>VPS configured with deploy user</li>
        <li>Caddy and Gitea running</li>
      </ul>

      <h2>Step 1: Install Docker</h2>
      <p>
        Install Docker using the official script. This method automatically detects the distribution and installs the stable version:
      </p>
      <pre><code>curl -fsSL https://get.docker.com | bash</code></pre>
      <p>
        The script installs Docker Engine, the CLI, and the Docker Compose plugin. There is no need to install Docker Compose separately.
      </p>

      <blockquote>
        <p>
          After this step you should be able to run <code>docker --version</code> and see the installed version.
        </p>
      </blockquote>

      <h2>Step 2: Add the deploy user to the docker group</h2>
      <p>
        The deploy user must be able to run Docker commands without <code>sudo</code>:
      </p>
      <pre><code>usermod -aG docker deploy</code></pre>
      <p>
        This adds the deploy user to the <code>docker</code> group, which has permissions to communicate with the Docker socket.
      </p>

      <blockquote>
        <p>
          After this step you should be able to run <code>su - deploy -c &quot;docker ps&quot;</code> without permission errors.
        </p>
      </blockquote>

      <h2>Step 3: Install Node.js 20</h2>
      <p>
        The webhook server is written in Node.js. Install Node.js 20 LTS via NodeSource:
      </p>
      <pre><code>{`curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs`}</code></pre>
      <p>
        Node.js 20 is the LTS (Long Term Support) version with active support until April 2026.
      </p>

      <blockquote>
        <p>
          After this step you should be able to run <code>node --version</code> and see <code>v20.x.x</code>.
        </p>
      </blockquote>

      <h2>Step 4: Create the working directories</h2>
      <p>
        Create the directories that will be used by the webhook server and Docker containers:
      </p>
      <pre><code>{`mkdir -p /var/www/projects
mkdir -p /opt/docker-projects
mkdir -p /etc/caddy/projects.d
mkdir -p /opt/webhook

chown deploy:deploy /var/www/projects
chown deploy:deploy /opt/docker-projects
chown deploy:deploy /opt/webhook`}</code></pre>
      <p>Here&apos;s what each directory is used for:</p>
      <ul>
        <li><code>/var/www/projects</code> &mdash; contains the project source files (cloned from Gitea)</li>
        <li><code>/opt/docker-projects</code> &mdash; contains the Dockerfiles and Docker configurations for each project</li>
        <li><code>/etc/caddy/projects.d</code> &mdash; contains the <code>.caddy</code> files with the reverse proxy configuration for each project</li>
        <li><code>/opt/webhook</code> &mdash; contains the webhook server code</li>
      </ul>

      <blockquote>
        <p>
          After this step all directories should exist with the correct permissions. Verify with <code>ls -la /var/www/projects /opt/docker-projects /opt/webhook</code>.
        </p>
      </blockquote>

      <h2>Step 5: Verify</h2>
      <p>Check that everything is installed correctly:</p>
      <pre><code>{`docker --version
node --version
npm --version
su - deploy -c "docker ps"
ls -la /var/www/projects /opt/docker-projects /opt/webhook`}</code></pre>
      <p>
        All commands should work without errors. In particular, <code>su - deploy -c &quot;docker ps&quot;</code> should show the container list (empty, but without permission errors).
      </p>

      <h2>Troubleshooting</h2>
      <h3>docker ps returns &quot;permission denied&quot;</h3>
      <p>
        The deploy user may not yet be in the docker group. After running <code>usermod -aG docker deploy</code>, a new login is required. Try with:
      </p>
      <pre><code>{`su - deploy -c "groups"  # verify that 'docker' is in the list
su - deploy -c "docker ps"  # retry after re-login`}</code></pre>
      <p>
        If the group doesn&apos;t appear, try restarting the Docker service: <code>systemctl restart docker</code>.
      </p>

      <h3>Node.js not found after installation</h3>
      <p>
        If <code>node --version</code> returns &quot;command not found&quot;, verify that the NodeSource repository was added correctly:
      </p>
      <pre><code>ls /etc/apt/sources.list.d/nodesource.list</code></pre>
      <p>
        If the file doesn&apos;t exist, re-run the NodeSource setup script.
      </p>

      <h3>Docker won&apos;t start</h3>
      <p>
        Check the logs with <code>journalctl -u docker -n 50</code>. The most common error on VPS with an old kernel is the lack of <code>overlay2</code> support. Verify that the kernel is at least version 4.x.
      </p>

      <hr />
      <p>
        <Link href="/docs/setup/webhook">Next step: Webhook →</Link>
      </p>
    </div>
  );
}
