"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function VpsPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>2. VPS Server</h1>
      <p>
        {replaceDomain(
          "In this step you will prepare the VPS server by installing the necessary packages and creating the system user for deploys. At the end of this step your VPS will be ready to host yourdomain.dev."
        )}
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>A VPS with Ubuntu 22.04 or higher</li>
        <li>SSH access as <code>root</code> user</li>
        <li>{replaceDomain("DNS already configured (previous step) with yourdomain.dev pointing to the VPS IP")}</li>
      </ul>

      <h2>Step 1: Connect to the VPS</h2>
      <p>Open your terminal and connect via SSH as root:</p>
      <pre><code>ssh root@YOUR_VPS_IP</code></pre>

      <h2>Step 2: Choose the installation method</h2>
      <p>
        You have two options to configure the VPS. You can use the <strong>automatic script</strong> that installs everything at once, or follow the <strong>manual steps</strong> (steps 2-7 of this guide).
      </p>

      <h3>Option A: Automatic script</h3>
      <p>
        The automatic script installs and configures all components (Caddy, Gitea, Docker, Webhook) in a single run:
      </p>
      <pre><code>{replaceDomain(`curl -sSL https://raw.githubusercontent.com/user/prolato/main/setup/setup.sh | bash`)}</code></pre>
      <p>
        The script will ask for your domain, the Cloudflare token, and the Gitea credentials. Once finished, you can skip directly to{" "}
        <Link href="/docs/setup/verify">step 7 (Verify)</Link> to check that everything works.
      </p>

      <h3>Option B: Manual installation</h3>
      <p>
        If you prefer to have full control over each component, follow the steps below and then proceed with steps 3-7 of the guide.
      </p>

      <h2>Step 3: Update the system</h2>
      <p>
        Update the package index and install available updates:
      </p>
      <pre><code>apt update &amp;&amp; apt upgrade -y</code></pre>
      <p>
        This ensures that the operating system and all packages are at the latest version, with the latest security patches.
      </p>

      <blockquote>
        <p>
          After this step you should see the message &quot;All packages are up to date&quot; or similar.
        </p>
      </blockquote>

      <h2>Step 4: Install prerequisite packages</h2>
      <p>
        Install the basic tools needed for the next steps:
      </p>
      <pre><code>apt install -y curl wget gnupg2 software-properties-common git jq unzip tar</code></pre>
      <p>
        Here&apos;s what they are used for:
      </p>
      <ul>
        <li><code>curl</code> / <code>wget</code> &mdash; for downloading files and scripts</li>
        <li><code>gnupg2</code> &mdash; for verifying package signatures</li>
        <li><code>software-properties-common</code> &mdash; for adding external repositories</li>
        <li><code>git</code> &mdash; for cloning repositories</li>
        <li><code>jq</code> &mdash; for processing JSON from the command line</li>
        <li><code>unzip</code> / <code>tar</code> &mdash; for extracting archives</li>
      </ul>

      <h2>Step 5: Create the deploy user</h2>
      <p>
        Create a dedicated system user for deploys. This user will run the Docker containers and build processes:
      </p>
      <pre><code>useradd --system --create-home --shell /bin/bash deploy</code></pre>
      <p>
        The <code>--system</code> flag creates a system user (no password, cannot log in directly). The <code>--create-home</code> flag creates the home directory <code>/home/deploy</code>.
      </p>

      <blockquote>
        <p>
          After this step you should be able to verify the user with <code>id deploy</code>.
        </p>
      </blockquote>

      <h2>Step 6: Configure sudo permissions</h2>
      <p>
        The deploy user needs to run some commands as root (for example, managing systemd services). Create a dedicated sudoers file:
      </p>
      <pre><code>{`cat > /etc/sudoers.d/deploy << 'EOF'
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart caddy
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload caddy
deploy ALL=(ALL) NOPASSWD: /usr/bin/tee /etc/caddy/projects.d/*
EOF

chmod 440 /etc/sudoers.d/deploy`}</code></pre>
      <p>
        This allows the deploy user to:
      </p>
      <ul>
        <li>Restart and reload Caddy (to apply new configurations)</li>
        <li>Write configuration files in the Caddy projects directory</li>
      </ul>

      <h2>Step 7: Verify</h2>
      <p>Verify that the user was created correctly:</p>
      <pre><code>{`id deploy
su - deploy -c "whoami"
su - deploy -c "echo 'Deploy user working'"`}</code></pre>
      <p>
        The <code>id deploy</code> command should show the UID, GID, and groups of the user. The <code>su - deploy</code> command should work without errors.
      </p>

      <blockquote>
        <p>
          After this step you should see the output of <code>id deploy</code> with the user and group created, and <code>su - deploy</code> should work correctly.
        </p>
      </blockquote>

      <h2>Troubleshooting</h2>
      <h3>apt update fails with repository errors</h3>
      <p>
        If you see errors related to unreachable repositories, it may be a temporary mirror issue. Try again after a few minutes or change the mirror in <code>/etc/apt/sources.list</code>.
      </p>

      <h3>The deploy user already exists</h3>
      <p>
        If the <code>deploy</code> user already exists (for example from a previous installation), you can verify it with <code>id deploy</code>. If you want to recreate it, first remove it with <code>userdel -r deploy</code> and then re-run the creation command.
      </p>

      <h3>Sudo permission errors</h3>
      <p>
        Make sure the file <code>/etc/sudoers.d/deploy</code> has the correct permissions (440). You can verify with <code>ls -la /etc/sudoers.d/deploy</code>. If the file has different permissions, sudo may ignore it.
      </p>

      <hr />
      <p>
        <Link href="/docs/setup/caddy">Next step: Caddy →</Link>
      </p>
    </div>
  );
}
