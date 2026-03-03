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
                className="mb-5 flex items-center px-1 text-stone-600"
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

/* ── Self-Evolving Showcase ────────────────────────────────── */

const evolutionSteps = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    label: "Deploy",
    desc: "You deploy a project with new technologies",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    label: "Detect",
    desc: "The skill spots undocumented patterns",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
    label: "Share",
    desc: "A PR brings that knowledge to everyone",
  },
];

function MockPR() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto max-w-lg"
    >
      <div className="overflow-hidden rounded-xl border border-stone-800 bg-[#0c0c0d]">
        {/* PR header */}
        <div className="border-b border-stone-800/60 px-5 py-4">
          <div className="flex items-start gap-3">
            {/* Merge icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.3, type: "spring" }}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10"
            >
              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </motion.div>
            <div className="min-w-0 flex-1">
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="font-mono text-sm font-semibold leading-snug text-stone-100"
              >
                contrib: add Redis + BullMQ support
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="mt-2 flex flex-wrap gap-2"
              >
                <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-amber-400">
                  auto-generated
                </span>
                <span className="inline-flex items-center rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-green-400">
                  community
                </span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* PR body */}
        <div className="px-5 py-4">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="text-xs leading-relaxed text-stone-500"
          >
            Automatically generated after a successful deploy that required handling
            technologies not yet documented in the skill files.
          </motion.p>
        </div>

        {/* File changes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.3 }}
          className="border-t border-stone-800/60 px-5 py-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-500">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="font-mono text-[11px]">3 files changed</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-green-400">+47</span>
              <span className="text-stone-600">-0</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── Tech Stack ────────────────────────────────────────────── */

const frameworks = [
  { name: "Next.js", slug: "nextdotjs", color: "#fff" },
  { name: "Remix", slug: "remix", color: "#fff" },
  { name: "Nuxt", slug: "nuxt", color: "#00DC82" },
  { name: "SvelteKit", slug: "svelte", color: "#FF3E00" },
  { name: "Astro", slug: "astro", color: "#BC52EE" },
  { name: "NestJS", slug: "nestjs", color: "#E0234E" },
  { name: "Express", slug: "express", color: "#fff" },
  { name: "Go", slug: "go", color: "#00ADD8" },
  { name: "Flask", slug: "flask", color: "#fff" },
  { name: "FastAPI", slug: "fastapi", color: "#009688" },
  { name: "Django", slug: "django", color: "#2BA977" },
];

const databases = [
  { name: "PostgreSQL", slug: "postgresql", color: "#4169E1" },
  { name: "MySQL", slug: "mysql", color: "#4479A1" },
  { name: "MariaDB", slug: "mariadb", color: "#00A9E0" },
  { name: "MongoDB", slug: "mongodb", color: "#47A248" },
  { name: "Redis", slug: "redis", color: "#FF4438" },
  { name: "SQLite", slug: "sqlite", color: "#4DA6E0" },
];

function TechItem({
  name,
  slug,
  color,
  delay,
}: {
  name: string;
  slug: string;
  color: string;
  delay: number;
}) {
  const iconColor = color === "#fff" ? "d6d3d1" : color.replace("#", "");
  return (
    <Reveal delay={delay}>
      <div className="group flex items-center gap-2.5 rounded-lg border border-stone-700/40 bg-stone-900/40 px-4 py-2.5 transition-all duration-300 hover:border-stone-600/60 hover:bg-stone-800/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://cdn.simpleicons.org/${slug}/${iconColor}`}
          alt={name}
          width={18}
          height={18}
          loading="lazy"
          className="h-[18px] w-[18px] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        />
        <span className="font-mono text-[13px] text-stone-300 transition-colors duration-300 group-hover:text-stone-100">
          {name}
        </span>
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

            <h1 className="font-display text-5xl tracking-tight text-stone-100 sm:text-7xl lg:text-8xl">
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
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
                Read the docs
              </a>
              <a
                href="https://github.com/Aleloca/prolato"
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

      {/* ── Self-Evolving ── */}
      <section className="relative py-20">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <p className="mb-3 text-center font-mono text-xs uppercase tracking-widest text-stone-500">
              Self-evolving
            </p>
            <h2 className="mb-4 text-center font-display text-2xl text-stone-100 sm:text-3xl">
              A skill that teaches itself
            </h2>
            <p className="mx-auto mb-14 max-w-lg text-center text-sm text-stone-400">
              When Prolato encounters new technologies during a deploy, it offers
              to contribute that knowledge back. Every user makes the skill
              smarter for everyone else.
            </p>
          </Reveal>

          <MockPR />

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {evolutionSteps.map((step, i) => (
              <Reveal key={step.label} delay={i * 0.12}>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-stone-800/60 bg-stone-900/40 text-amber-400/80">
                    {step.icon}
                  </div>
                  <span className="mb-1 text-sm font-semibold text-stone-200">
                    {step.label}
                  </span>
                  <span className="text-xs leading-relaxed text-stone-500">
                    {step.desc}
                  </span>
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

      {/* ── Supported Stack ── */}
      <section className="relative py-20">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <p className="mb-3 text-center font-mono text-xs uppercase tracking-widest text-stone-500">
              Supported stack
            </p>
            <h2 className="mb-4 text-center text-2xl font-semibold text-stone-100 sm:text-3xl">
              Works with what you already use
            </h2>
            <p className="mx-auto mb-12 max-w-lg text-center text-sm text-stone-400">
              Auto-detected frameworks and databases with dedicated deploy
              configurations.
            </p>
          </Reveal>

          {/* Frameworks */}
          <Reveal delay={0.1}>
            <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-widest text-stone-500">
              Frameworks
            </p>
          </Reveal>
          <div className="mb-10 flex flex-wrap justify-center gap-2.5">
            {frameworks.map((t, i) => (
              <TechItem key={t.slug} {...t} delay={0.12 + i * 0.03} />
            ))}
          </div>

          {/* Databases */}
          <Reveal delay={0.2}>
            <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-widest text-stone-500">
              Databases
            </p>
          </Reveal>
          <div className="mb-12 flex flex-wrap justify-center gap-2.5">
            {databases.map((t, i) => (
              <TechItem key={t.slug} {...t} delay={0.25 + i * 0.03} />
            ))}
          </div>

          {/* Not listed callout */}
          <Reveal delay={0.35}>
            <div className="mx-auto max-w-xl rounded-xl border border-amber-500/15 bg-amber-500/[0.03] px-6 py-5 text-center">
              <p className="text-sm leading-relaxed text-stone-300">
                Don&apos;t see your stack?{" "}
                <span className="font-semibold text-amber-400">
                  Not a problem.
                </span>{" "}
                Prolato handles any framework on first deploy and{" "}
                <span className="text-stone-200">
                  learns it for everyone else
                </span>{" "}
                automatically.
              </p>
            </div>
          </Reveal>
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
                href="https://github.com/Aleloca/prolato"
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
                href="https://github.com/Aleloca/prolato"
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
