"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function OverviewPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>Introduction to Prolato</h1>
      <p>
        {replaceDomain(
          "Prolato is a self-hosted platform for automatic deployment of web projects. With Prolato you can set up your server on yourdomain.dev and deploy applications with a single command, directly from your editor."
        )}
      </p>

      <h2>What is Prolato</h2>
      <p>
        Prolato automates the entire deploy lifecycle: from Git repository creation, to Docker build, to automatic HTTPS configuration via reverse proxy. All on your server, under your control.
      </p>
      <p>The main features are:</p>
      <ul>
        <li><strong>Automatic deploy</strong> &mdash; push to the repository and the deploy starts automatically</li>
        <li><strong>Automatic HTTPS</strong> &mdash; SSL certificates managed by Caddy with Let&apos;s Encrypt</li>
        <li><strong>Self-hosted</strong> &mdash; your data stays on your server</li>
        <li><strong>Claude Code integration</strong> &mdash; a dedicated skill to manage deploys from the editor</li>
      </ul>

      <h2>Architecture</h2>
      <p>
        {replaceDomain(
          "The Prolato infrastructure consists of 4 main components, all installed on the same VPS with yourdomain.dev:"
        )}
      </p>
      <ol>
        <li>
          {replaceDomain(
            "<strong>Caddy</strong> — reverse proxy and web server that handles automatic HTTPS for yourdomain.dev and all subdomains. Generates and renews SSL certificates via Cloudflare DNS challenge."
          )}
        </li>
        <li>
          {replaceDomain(
            "<strong>Gitea</strong> — lightweight Git server accessible at git.yourdomain.dev. Hosts your project repositories and notifies the webhook on every push."
          )}
        </li>
        <li>
          <strong>Docker</strong> &mdash; container runtime. Each project is built as a Docker image and launched as an isolated container.
        </li>
        <li>
          {replaceDomain(
            "<strong>Webhook Server</strong> — Node.js service on webhook.yourdomain.dev that receives notifications from Gitea, runs the Docker build, and configures Caddy to serve the new project."
          )}
        </li>
      </ol>

      <h2>What you need</h2>
      <p>Before starting, make sure you have:</p>
      <ul>
        <li><strong>A VPS</strong> with Ubuntu 22.04 or higher (minimum 1 GB RAM, 20 GB disk)</li>
        <li><strong>A domain</strong> registered (you can purchase one from any registrar)</li>
        <li><strong>A Cloudflare account</strong> (free plan) for DNS management and SSL certificates</li>
        <li><strong>SSH access</strong> to the server as root user</li>
      </ul>

      <h2>How the guide is organized</h2>
      <p>
        The setup is divided into <strong>7 steps</strong>, designed to be followed in order:
      </p>
      <ol>
        <li><Link href="/docs/setup/dns">DNS & Domain</Link> &mdash; configure the domain and Cloudflare</li>
        <li><Link href="/docs/setup/vps">VPS Server</Link> &mdash; prepare the server with user and base packages</li>
        <li><Link href="/docs/setup/caddy">Caddy</Link> &mdash; install the reverse proxy with Cloudflare support</li>
        <li><Link href="/docs/setup/gitea">Gitea</Link> &mdash; install the Git server</li>
        <li><Link href="/docs/setup/docker">Docker</Link> &mdash; install Docker and Node.js</li>
        <li><Link href="/docs/setup/webhook">Webhook</Link> &mdash; install the webhook server for automatic deploy</li>
        <li><Link href="/docs/setup/verify">Verify</Link> &mdash; check that everything works correctly</li>
      </ol>

      <h2>Estimated time</h2>
      <p>
        The entire setup takes about <strong>30 minutes</strong> if you already have the VPS and domain ready. If starting from scratch (domain + VPS purchase), plan for about 1 hour.
      </p>

      <hr />
      <p>
        <Link href="/docs/setup/dns">Start with the first step: DNS & Domain →</Link>
      </p>
    </div>
  );
}
