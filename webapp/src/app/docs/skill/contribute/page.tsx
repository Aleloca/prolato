"use client";

import Link from "next/link";

export default function SkillContributePage() {
  return (
    <div>
      <h1>Community Contribution</h1>
      <p>
        Prolato is a self-evolving skill. When the skill encounters a new
        technology or configuration that isn&apos;t yet documented in its rules,
        it offers you the chance to contribute that knowledge back to the
        project &mdash; helping all other Prolato users.
      </p>

      <h2>How it works</h2>
      <p>
        After every successful deploy, the skill automatically performs a
        self-reflection step:
      </p>
      <ol>
        <li>
          It compares what it did during the deploy against the rules documented
          in its own skill files (framework detection, database detection,
          Docker templates, etc.)
        </li>
        <li>
          If it had to improvise beyond the documented rules (e.g. handling
          Redis, BullMQ, or a new framework), it detects the gap
        </li>
        <li>
          It asks you explicitly: &quot;Would you like to contribute these
          improvements to the Prolato project?&quot;
        </li>
        <li>
          If you accept, it opens a Pull Request on the{" "}
          <a
            href="https://github.com/Aleloca/prolato"
            target="_blank"
            rel="noopener noreferrer"
          >
            Prolato GitHub repository
          </a>{" "}
          from your GitHub account
        </li>
      </ol>
      <p>
        You always have full control. The skill never acts without your explicit
        consent, and a declined contribution has zero impact on your deploy.
      </p>

      <h2>Prerequisites</h2>
      <p>
        To contribute, you need the{" "}
        <a
          href="https://cli.github.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub CLI
        </a>{" "}
        installed and authenticated:
      </p>
      <pre>
        <code>{`# Install (macOS)
brew install gh

# Authenticate
gh auth login`}</code>
      </pre>
      <p>
        If <code>gh</code> is not available or not authenticated, the skill
        simply skips the contribution step silently. No errors, no interruptions
        &mdash; your deploy completes as usual.
      </p>

      <h2>What gets contributed</h2>
      <p>
        The Pull Request contains only updates to the skill&apos;s Markdown
        instruction files:
      </p>
      <ul>
        <li>
          New detection rules (e.g. &quot;if <code>package.json</code> contains{" "}
          <code>ioredis</code>, detect Redis&quot;)
        </li>
        <li>
          New Docker Compose templates (e.g. Redis service with healthcheck and
          volume)
        </li>
        <li>
          New database configuration patterns (connection strings, migration
          commands)
        </li>
        <li>
          New framework detection entries and Dockerfile templates
        </li>
      </ul>
      <p>
        All contributions are based on what actually worked during your deploy
        &mdash; real, tested configurations, not speculation.
      </p>

      <blockquote>
        <p>
          <strong>Privacy:</strong> The PR never includes any information about
          your project. No project names, URLs, credentials, environment
          variable values, or file paths from your machine. Only generic
          detection rules and templates.
        </p>
      </blockquote>

      <h2>The PR lifecycle</h2>
      <p>
        When you accept to contribute:
      </p>
      <ol>
        <li>
          The skill forks the Prolato repository on your GitHub account (if not
          already forked)
        </li>
        <li>
          It creates a branch named{" "}
          <code>contrib/add-[technology]-support</code>
        </li>
        <li>
          It commits the updated skill files and opens a PR
        </li>
        <li>
          The Prolato maintainer reviews and merges if appropriate
        </li>
        <li>
          Once merged, all Prolato users benefit from the new rules
        </li>
      </ol>
      <p>
        The skill also checks for duplicate contributions &mdash; if an open PR
        already covers the same technology, it lets you know and skips the
        submission.
      </p>

      <hr />
      <p>
        <Link href="/docs/maintenance/backup">
          Next step: Database Backup &rarr;
        </Link>
      </p>
    </div>
  );
}
