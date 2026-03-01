"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

/* ── Logo ──────────────────────────────────────────────────── */

function Logo({ size = "small" }: { size?: "small" | "large" }) {
  const sizeClasses = {
    small: "text-base",
    large: "text-4xl sm:text-5xl",
  };

  const cursorClasses = {
    small: "h-3.5 w-[5px]",
    large: "h-8 w-[11px] sm:h-10 sm:w-[13px]",
  };

  return (
    <span
      className={`inline-flex items-baseline leading-none ${sizeClasses[size]}`}
    >
      <span className="font-mono font-semibold tracking-tight text-stone-100">
        pro
      </span>
      <span className="font-serif italic text-stone-100">lato</span>
      <span
        className={`${cursorClasses[size]} ml-[2px] inline-block animate-blink self-end bg-amber-400`}
      />
    </span>
  );
}

/* ── Scroll-reveal wrapper ─────────────────────────────────── */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Terminal Demo ──────────────────────────────────────────── */

const terminalLines = [
  { text: "$ claude", color: "text-stone-300" },
  { text: "> Deploy this project", color: "text-amber-400" },
  { text: "\u00A0", color: "" },
  { text: "\u2713 Analyzing project... Next.js 14 detected", color: "text-green-400" },
  { text: "\u2713 Strategy: Docker (SSR application)", color: "text-green-400" },
  { text: "\u2713 Building container...", color: "text-green-400" },
  { text: "\u2713 Pushing to git.yourdomain.dev...", color: "text-green-400" },
  { text: "\u2713 Live at https://myapp.yourdomain.dev", color: "text-green-400" },
];

function TerminalDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-xl border border-stone-800 bg-[#0c0c0d]">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-stone-800/60 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-stone-700/80" />
          <div className="h-3 w-3 rounded-full bg-stone-700/80" />
          <div className="h-3 w-3 rounded-full bg-stone-700/80" />
          <span className="ml-2 font-mono text-xs text-stone-600">
            terminal
          </span>
        </div>
        {/* Lines */}
        <div className="space-y-1 p-5 font-mono text-sm leading-relaxed sm:p-6">
          {terminalLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                delay: 0.3 + i * 0.45,
                duration: 0.25,
                ease: "easeOut",
              }}
              className={line.color}
            >
              {line.text}
            </motion.div>
          ))}
          {/* Blinking cursor */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 4.2 }}
            className="mt-1"
          >
            <span className="inline-block h-4 w-[9px] animate-blink bg-amber-400/80" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ── Architecture Diagram ──────────────────────────────────── */

const archNodes = [
  { name: "You", desc: "Terminal" },
  { name: "Claude Code", desc: "AI Agent" },
  { name: "Gitea", desc: "Git Server" },
  { name: "Webhook", desc: "Build Trigger" },
  { name: "Docker", desc: "Containers" },
  { name: "Caddy", desc: "Reverse Proxy" },
];

function ArchitectureDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref}>
      {/* Desktop — horizontal flow */}
      <div className="hidden items-center justify-center gap-1 md:flex">
        {archNodes.map((node, i) => (
          <div key={node.name} className="flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="flex h-14 w-28 items-center justify-center rounded border border-stone-700/50 bg-stone-900/60 px-3 py-2">
                <span className="font-mono text-xs font-semibold text-stone-200">
                  {node.name}
                </span>
              </div>
              <span className="mt-1.5 text-[11px] text-stone-500">
                {node.desc}
              </span>
            </motion.div>
            {i < archNodes.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: i * 0.08 + 0.15 }}
                className="flex items-center px-1 text-stone-600"
              >
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6h8M7 3l3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile — vertical flow */}
      <div className="flex flex-col items-center gap-2 md:hidden">
        {archNodes.map((node, i) => (
          <div key={node.name} className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex w-52 items-center justify-between rounded border border-stone-700/50 bg-stone-900/60 px-4 py-2.5"
            >
              <span className="font-mono text-xs font-semibold text-stone-200">
                {node.name}
              </span>
              <span className="text-[11px] text-stone-500">{node.desc}</span>
            </motion.div>
            {i < archNodes.length - 1 && (
              <svg
                className="h-4 w-4 text-stone-600"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M6 2v8M3 7l3 3 3-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Result URL */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <span className="inline-block rounded-full border border-amber-500/20 bg-amber-500/5 px-5 py-2 font-mono text-sm text-amber-400">
          project.yourdomain.dev
        </span>
      </motion.div>
    </div>
  );
}

/* ── Feature Card ──────────────────────────────────────────── */

function FeatureCard({
  title,
  desc,
  code,
  delay,
}: {
  title: string;
  desc: string;
  code: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="rounded-xl border border-stone-800/60 bg-stone-900/30 p-6">
        <h3 className="mb-2 font-semibold text-stone-100">{title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-stone-400">{desc}</p>
        <div className="rounded-lg border border-stone-800/40 bg-[#0c0c0d] p-3">
          <pre className="font-mono text-xs leading-relaxed text-green-400/90">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </Reveal>
  );
}

/* ── Page ───────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-stone-100">
      {/* Subtle grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(120,113,108,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(120,113,108,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

      {/* ── Hero ── */}
      <header className="relative">
        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-28 sm:pt-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            <div className="mb-8">
              <Logo size="large" />
            </div>

            <h1 className="font-serif text-5xl tracking-tight text-stone-100 sm:text-7xl lg:text-8xl">
              Deploy from your terminal.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-400 sm:text-xl">
              Self-hosted platform that turns &ldquo;deploy this
              project&rdquo; into a live URL. A Claude Code skill that
              analyzes, builds, and ships any web project.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/docs/overview"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-medium text-stone-950 transition-colors hover:bg-amber-400"
              >
                Read the docs
              </a>
              <a
                href="https://github.com/user/prolato"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-stone-700 px-6 py-3 font-medium text-stone-300 transition-colors hover:border-stone-600 hover:text-stone-100"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>
            </div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-16 flex justify-center"
          >
            <motion.svg
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-5 w-5 text-stone-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </motion.div>
        </div>
      </header>

      {/* ── Terminal Demo ── */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="mb-10 text-center font-mono text-xs uppercase tracking-widest text-stone-500">
              The entire experience
            </p>
          </Reveal>
          <TerminalDemo />
        </div>
      </section>

      {/* Separator */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-stone-800/60 to-transparent" />
      </div>

      {/* ── Architecture ── */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="mb-3 text-center font-mono text-xs uppercase tracking-widest text-stone-500">
              Architecture
            </p>
            <h2 className="mb-4 text-center text-2xl font-semibold text-stone-100 sm:text-3xl">
              You own every piece
            </h2>
            <p className="mx-auto mb-14 max-w-lg text-center text-sm text-stone-400">
              No vendor lock-in. Every component runs on your server, under your
              control.
            </p>
          </Reveal>
          <ArchitectureDiagram />
        </div>
      </section>

      {/* Separator */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-stone-800/60 to-transparent" />
      </div>

      {/* ── Features ── */}
      <section className="relative py-20">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <p className="mb-3 text-center font-mono text-xs uppercase tracking-widest text-stone-500">
              Features
            </p>
            <h2 className="mb-14 text-center text-2xl font-semibold text-stone-100 sm:text-3xl">
              Infrastructure, not magic
            </h2>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              title="Zero Config"
              desc="Automatic framework detection. Your project structure tells Prolato everything it needs."
              code={
                "\u2713 Detected: Next.js 14\n\u2713 Build: npm run build\n\u2713 Strategy: Docker (SSR)\n\u2713 Port: 3000"
              }
              delay={0}
            />
            <FeatureCard
              title="Universal Deploy"
              desc="Static sites served via Caddy. Docker apps with full container lifecycle. Both in the same system."
              code={
                "# Static \u2192 /srv/project/\n# Docker \u2192 container + compose\n# Caddy \u2192 reverse proxy + HTTPS"
              }
              delay={0.1}
            />
            <FeatureCard
              title="Instant URL"
              desc="Every project gets a subdomain. HTTPS configured automatically via Caddy."
              code={
                "project.yourdomain.dev\n\u251C\u2500\u2500 HTTPS (auto-provisioned)\n\u251C\u2500\u2500 Reverse proxy \u2192 :3000\n\u2514\u2500\u2500 Live in seconds"
              }
              delay={0.2}
            />
            <FeatureCard
              title="Database Support"
              desc="PostgreSQL, MySQL, MongoDB, Redis. Auto-provisioned with credentials injected into your app."
              code={
                "services:\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_DB: myapp\n      POSTGRES_PASSWORD: [auto]"
              }
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-stone-800/60 to-transparent" />
      </div>

      {/* ── Three Steps ── */}
      <section className="relative py-20">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <p className="mb-10 text-center font-mono text-xs uppercase tracking-widest text-stone-500">
              Three steps
            </p>
          </Reveal>

          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center sm:gap-12">
            {[
              {
                step: "01",
                label: "Install",
                code: "cp -r prolato/skill ~/.claude/skills/prolato",
              },
              {
                step: "02",
                label: "Deploy",
                code: '"Deploy this project"',
              },
              {
                step: "03",
                label: "Live",
                code: "https://myapp.yourdomain.dev",
              },
            ].map((item, i) => (
              <Reveal
                key={item.step}
                delay={i * 0.1}
                className="flex flex-col items-center text-center"
              >
                <span className="font-mono text-xs text-amber-400/80">
                  {item.step}
                </span>
                <span className="mt-1 text-sm font-semibold text-stone-200">
                  {item.label}
                </span>
                <div className="mt-3 rounded-lg border border-stone-800/40 bg-[#0c0c0d] px-4 py-2">
                  <code className="font-mono text-xs text-stone-400">
                    {item.code}
                  </code>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-stone-800/60 to-transparent" />
      </div>

      {/* ── Bottom CTA ── */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <Reveal>
            <h2 className="font-serif text-3xl text-stone-100 sm:text-4xl">
              Your server. Your projects. Your rules.
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/docs/setup/dns"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-medium text-stone-950 transition-colors hover:bg-amber-400"
              >
                Setup Guide
              </a>
              <a
                href="https://github.com/user/prolato"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-stone-700 px-6 py-3 font-medium text-stone-300 transition-colors hover:border-stone-600 hover:text-stone-100"
              >
                GitHub
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-800/40 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex flex-col items-center gap-1.5 sm:items-start">
              <Logo size="small" />
              <span className="text-xs text-stone-600">
                Self-hosted deployment platform
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="/docs/overview"
                className="text-xs text-stone-500 transition-colors hover:text-stone-300"
              >
                Docs
              </a>
              <a
                href="/docs/setup/dns"
                className="text-xs text-stone-500 transition-colors hover:text-stone-300"
              >
                Setup
              </a>
              <a
                href="https://github.com/user/prolato"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-stone-500 transition-colors hover:text-stone-300"
              >
                GitHub
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <span>Built with Caddy, Gitea, Docker</span>
              <span>&middot;</span>
              <span>MIT License</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
