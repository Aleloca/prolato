"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function DnsPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>1. DNS & Domain</h1>
      <p>
        {replaceDomain(
          "In this step you will configure the domain yourdomain.dev and the DNS records on Cloudflare, so that traffic is correctly routed to your VPS."
        )}
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>A registered domain (you can purchase one from any registrar)</li>
        <li>The IP address of your VPS</li>
      </ul>

      <h2>Step 1: Register a Cloudflare account</h2>
      <p>
        If you don&apos;t have a Cloudflare account yet, sign up for free at{" "}
        <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noopener noreferrer">
          dash.cloudflare.com/sign-up
        </a>
        . The free plan is sufficient for Prolato.
      </p>

      <h2>Step 2: Add the domain to Cloudflare</h2>
      <p>
        {replaceDomain(
          "From the Cloudflare dashboard, click \"Add a site\" and enter yourdomain.dev. Select the Free plan and continue."
        )}
      </p>
      <p>
        Cloudflare will show you the nameservers to configure. Take note of the two assigned nameservers (for example <code>ada.ns.cloudflare.com</code> and <code>bill.ns.cloudflare.com</code>).
      </p>

      <h2>Step 3: Update the nameservers on the registrar</h2>
      <p>
        Go to your registrar&apos;s panel (where you purchased the domain) and replace the existing nameservers with those provided by Cloudflare. Propagation can take up to 24 hours, but usually happens within a few minutes.
      </p>
      <blockquote>
        <p>
          After this step you should receive an email from Cloudflare confirming that the domain is active.
        </p>
      </blockquote>

      <h2>Step 4: Create the DNS records</h2>
      <p>
        {replaceDomain(
          "In the Cloudflare DNS section, create the following A records pointing to your VPS IP (replace 203.0.113.1 with your actual IP):"
        )}
      </p>

      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Content</th>
            <th>Proxy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A</td>
            <td>{replaceDomain("yourdomain.dev")}</td>
            <td>203.0.113.1</td>
            <td>DNS only</td>
          </tr>
          <tr>
            <td>A</td>
            <td>{replaceDomain("*.yourdomain.dev")}</td>
            <td>203.0.113.1</td>
            <td>DNS only</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Important:</strong> set the proxy to <strong>DNS only</strong> (grey icon, not orange). Caddy will handle HTTPS directly and the Cloudflare proxy is not needed.
      </p>

      <p>
        {replaceDomain(
          "The wildcard record (*.yourdomain.dev) allows automatically creating subdomains for every project you deploy, without having to add DNS records manually."
        )}
      </p>

      <blockquote>
        <p>
          {replaceDomain(
            "After this step you should see the A records in the Cloudflare DNS dashboard for yourdomain.dev and *.yourdomain.dev."
          )}
        </p>
      </blockquote>

      <h2>Step 5: Create a Cloudflare API Token</h2>
      <p>
        Caddy needs an API token to generate SSL certificates via DNS challenge. Here&apos;s how to create it:
      </p>
      <ol>
        <li>Go to <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener noreferrer">Cloudflare → Profile → API Tokens</a></li>
        <li>Click <strong>Create Token</strong></li>
        <li>Select the <strong>Edit zone DNS</strong> template</li>
        <li>In the <strong>Permissions</strong> section, verify that it includes: <code>Zone &gt; DNS &gt; Edit</code></li>
        <li>{replaceDomain("In the Zone Resources section, select: Include > Specific zone > yourdomain.dev")}</li>
        <li>Click <strong>Continue to summary</strong> and then <strong>Create Token</strong></li>
        <li>Copy the generated token and save it in a safe place &mdash; you will need it during the Caddy setup</li>
      </ol>

      <blockquote>
        <p>
          After this step you should have a Cloudflare API token that starts with an alphanumeric string. You can verify it with:
        </p>
      </blockquote>
      <pre><code>{replaceDomain(`curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"`)}</code></pre>
      <p>
        You should receive a response with <code>&quot;status&quot;: &quot;active&quot;</code>.
      </p>

      <h2>Step 6: Verify DNS propagation</h2>
      <p>
        {replaceDomain(
          "Verify that the DNS records have propagated correctly using the dig command:"
        )}
      </p>
      <pre><code>{replaceDomain(`dig +short yourdomain.dev
dig +short git.yourdomain.dev
dig +short webhook.yourdomain.dev`)}</code></pre>
      <p>
        All three commands should return your VPS IP. If you don&apos;t see results, wait a few minutes and try again.
      </p>

      <blockquote>
        <p>
          After this step you should see your VPS IP as the response to all <code>dig</code> commands.
        </p>
      </blockquote>

      <h2>Troubleshooting</h2>
      <h3>The dig command returns no results</h3>
      <p>
        DNS propagation can take up to 24 hours. If after 30 minutes you don&apos;t see results, verify that you saved the records in the Cloudflare dashboard and that the nameservers were updated on the registrar.
      </p>

      <h3>dig returns a different IP</h3>
      <p>
        Verify that the Cloudflare proxy is disabled (grey &quot;DNS only&quot; icon). If it&apos;s active (orange icon), <code>dig</code> will return Cloudflare&apos;s IPs instead of your VPS IP.
      </p>

      <h3>The API token doesn&apos;t work</h3>
      <p>
        {replaceDomain(
          "Verify that the token has the correct permissions (Zone > DNS > Edit) and that it was configured for the correct zone (yourdomain.dev)."
        )}
      </p>

      <hr />
      <p>
        <Link href="/docs/setup/vps">Next step: VPS Server →</Link>
      </p>
    </div>
  );
}
