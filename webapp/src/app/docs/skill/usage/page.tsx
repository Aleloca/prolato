"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function SkillUsagePage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>Skill Usage</h1>
      <p>
        {replaceDomain(
          "The Prolato skill lets you manage your projects on yourdomain.dev directly from Claude Code. Here are all the available commands."
        )}
      </p>

      <h2>Deploy a project</h2>
      <p>
        To deploy a new project, navigate to the project folder and ask Claude:
      </p>
      <pre><code>{`"deploy this project"`}</code></pre>
      <p>
        Or invoke the direct command:
      </p>
      <pre><code>/prolato deploy</code></pre>

      <h3>What happens behind the scenes</h3>
      <ol>
        <li>Claude analyzes the project to determine the type (static, Node.js, Docker, etc.)</li>
        <li>It asks you for a project name (which becomes the subdomain)</li>
        <li>It creates a repository on Gitea and pushes the code</li>
        <li>It sends a request to the webhook to start the deploy</li>
        <li>The webhook runs the build and configures Caddy</li>
      </ol>

      <h3>Expected result</h3>
      <p>
        {replaceDomain(
          "At the end of the deploy, Claude shows you the project URL (e.g. https://project-name.yourdomain.dev) and confirms that the site is online."
        )}
      </p>

      <h2>List projects</h2>
      <p>To see all deployed projects, ask Claude:</p>
      <pre><code>{`"list my projects"`}</code></pre>

      <h3>What happens behind the scenes</h3>
      <p>
        Claude queries the webhook to get the list of registered projects with their URLs and status.
      </p>

      <h3>Expected result</h3>
      <p>
        {replaceDomain(
          "A list of all projects with name, URL (e.g. https://name.yourdomain.dev), deploy type, and status (running/stopped)."
        )}
      </p>

      <h2>Update a project</h2>
      <p>To re-deploy a project with updated code:</p>
      <pre><code>{`"update project project-name"`}</code></pre>

      <h3>What happens behind the scenes</h3>
      <p>
        Claude pushes the changes to the Gitea repository and sends a new deploy request to the webhook. The webhook runs a new build with the updated code.
      </p>

      <h3>Expected result</h3>
      <p>
        The project is updated with the latest code. Claude confirms the deploy completion and verifies that the site responds correctly.
      </p>

      <h2>Delete a project</h2>
      <p>To delete a deployed project:</p>
      <pre><code>{`"delete project project-name"`}</code></pre>

      <h3>What happens behind the scenes</h3>
      <p>
        Claude asks for confirmation before proceeding. After confirmation, it removes the Docker container (if present), the Caddy configuration, and the Gitea repository.
      </p>

      <h3>Expected result</h3>
      <p>
        {replaceDomain(
          "The project is completely removed. The URL (e.g. https://name.yourdomain.dev) will no longer be reachable."
        )}
      </p>

      <blockquote>
        <p>
          <strong>Warning:</strong> Deleting a Docker project also removes the associated volumes. If the project has a database, <strong>all data will be lost</strong>. Perform a backup before deleting a project with a database.
        </p>
      </blockquote>

      <h2>Rollback</h2>
      <p>To revert to the previous version of a project:</p>
      <pre><code>{`"rollback project project-name"`}</code></pre>

      <h3>What happens behind the scenes</h3>
      <p>
        Claude restores the previous version of the project. The webhook runs a new deploy using the code from the saved version.
      </p>

      <h3>Expected result</h3>
      <p>
        The project reverts to the version before the most recent deploy.
      </p>

      <blockquote>
        <p>
          <strong>Note:</strong> Only one level of rollback is available. The rollback restores the version immediately before the last deploy.
        </p>
      </blockquote>

      <h2>Logs</h2>
      <p>To view the logs of a Docker project:</p>
      <pre><code>{`"show logs for project-name"`}</code></pre>

      <h3>What happens behind the scenes</h3>
      <p>
        Claude retrieves the logs from the project&apos;s Docker container via the webhook.
      </p>

      <h3>Expected result</h3>
      <p>
        The latest Docker container logs are displayed directly in the chat. Useful for debugging and monitoring.
      </p>

      <blockquote>
        <p>
          <strong>Note:</strong> This command only works for Docker projects. Static projects do not have container logs.
        </p>
      </blockquote>

      <h2>Project status</h2>
      <p>To check the status of a project:</p>
      <pre><code>{`"status of project-name"`}</code></pre>

      <h3>What happens behind the scenes</h3>
      <p>
        Claude queries the webhook to get the current status of the project, including the Docker container status (if applicable).
      </p>

      <h3>Expected result</h3>
      <p>
        Claude shows whether the project is running, the deploy type, the URL, and other useful information such as uptime.
      </p>

      <hr />
      <p>
        <Link href="/docs/skill/contribute">Next step: Community Contribution &rarr;</Link>
      </p>
    </div>
  );
}
