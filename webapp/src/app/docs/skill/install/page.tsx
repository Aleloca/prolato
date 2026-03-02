"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function SkillInstallPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>Skill Installation</h1>
      <p>
        {replaceDomain(
          "In this guide you will install the Prolato skill for Claude Code. The skill allows Claude to deploy your projects directly to yourdomain.dev with a simple command."
        )}
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>
          {replaceDomain(
            "VPS configured with all components installed (setup completed on yourdomain.dev)"
          )}
        </li>
        <li>
          Claude Code installed and working on your local computer
        </li>
        <li>
          {replaceDomain(
            "A Gitea account — register at https://git.yourdomain.dev (self-registration is open)"
          )}
        </li>
        <li>
          A Gitea API token — after registering, go to <strong>Settings → Applications → Generate New Token</strong> and select the scopes <code>write:repository</code> and <code>write:user</code>
        </li>
        <li>
          The <strong>deploy token</strong> and <strong>domain</strong> provided by the system admin
        </li>
      </ul>

      <h2>Step 1: Clone the Prolato repository</h2>
      <p>
        Open the terminal on your local computer and clone the repository:
      </p>
      <pre><code>git clone https://github.com/Aleloca/prolato.git</code></pre>
      <p>
        This downloads all the Prolato code, including the skill for Claude Code.
      </p>

      <h2>Step 2: Copy the skill files</h2>
      <p>
        Copy the skill directory into the Claude Code skills folder:
      </p>
      <pre><code>cp -r prolato/skill/prolato ~/.claude/skills/prolato</code></pre>
      <p>
        Alternatively, you can create a symbolic link. This is useful if you want to receive updates with a simple <code>git pull</code>:
      </p>
      <pre><code>ln -s /path/to/prolato/skill/prolato ~/.claude/skills/prolato</code></pre>
      <p>
        Replace <code>/path/to/prolato</code> with the absolute path where you cloned the repository.
      </p>

      <blockquote>
        <p>
          After this step you should see the <code>~/.claude/skills/prolato</code> directory with the skill files.
        </p>
      </blockquote>

      <h2>Step 3: Copy and configure the configuration file</h2>
      <p>
        Copy the example configuration file to your home directory:
      </p>
      <pre><code>cp prolato/skill/prolato/config.example.json ~/.deploy-config.json</code></pre>
      <p>
        Open the file <code>~/.deploy-config.json</code> with your preferred editor and fill in all the fields:
      </p>
      <pre><code>{replaceDomain(`{
  "gitea_url": "https://git.yourdomain.dev",
  "gitea_username": "your-username",
  "gitea_token": "gitea-api-token",
  "webhook_url": "https://webhook.yourdomain.dev",
  "deploy_token": "deploy-token-from-env-file",
  "domain": "yourdomain.dev",
  "ssh_key_path": "~/.ssh/deploy_key"
}`)}</code></pre>

      <p>Here&apos;s what each field means:</p>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>gitea_url</code></td>
            <td>{replaceDomain("URL of the Gitea server (e.g. https://git.yourdomain.dev)")}</td>
          </tr>
          <tr>
            <td><code>gitea_username</code></td>
            <td>Your Gitea username (the one you chose when registering on Gitea)</td>
          </tr>
          <tr>
            <td><code>gitea_token</code></td>
            <td>Your personal Gitea API token (created in Settings &rarr; Applications with <code>write:repository</code> and <code>write:user</code> scopes)</td>
          </tr>
          <tr>
            <td><code>webhook_url</code></td>
            <td>{replaceDomain("URL of the webhook (e.g. https://webhook.yourdomain.dev)")}</td>
          </tr>
          <tr>
            <td><code>deploy_token</code></td>
            <td>Deploy token (provided by the system admin)</td>
          </tr>
          <tr>
            <td><code>domain</code></td>
            <td>{replaceDomain("Your domain (e.g. yourdomain.dev)")}</td>
          </tr>
          <tr>
            <td><code>ssh_key_path</code></td>
            <td>Path to the SSH key (e.g. <code>~/.ssh/deploy_key</code>)</td>
          </tr>
        </tbody>
      </table>

      <h2>Step 4: First launch</h2>
      <p>
        Open Claude Code and invoke the skill for the first time:
      </p>
      <pre><code>/prolato</code></pre>
      <p>
        The skill will verify the configuration and guide you through the initial setup. Follow the on-screen instructions to complete the configuration.
      </p>

      <h2>Verification</h2>
      <p>
        To verify that the skill is installed correctly, invoke the <code>/prolato</code> command in Claude Code. The skill should respond without errors and display the available options.
      </p>
      <p>
        If you receive errors, check that:
      </p>
      <ul>
        <li>The file <code>~/.deploy-config.json</code> exists and contains all fields</li>
        <li>The tokens are valid and not expired</li>
        <li>{replaceDomain("The VPS is reachable (try with curl https://webhook.yourdomain.dev/health)")}</li>
        <li>The SSH key is configured correctly</li>
      </ul>

      <hr />
      <p>
        <Link href="/docs/skill/usage">Next step: Skill Usage &rarr;</Link>
      </p>
    </div>
  );
}
