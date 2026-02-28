export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Background grid pattern */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Gradient orb top-right */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse-slow" />
        {/* Gradient orb bottom-left */}
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-teal-500/8 blur-3xl animate-pulse-slow" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pt-32">
          <div className="animate-fade-in-up text-center">
            {/* Terminal-style badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/80 px-4 py-1.5 font-mono text-sm text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              <span>v1.0 &mdash; self-hosted deploy platform</span>
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
              <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-cyan-400 bg-clip-text text-transparent">
                Prolato
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-slate-300 sm:text-2xl">
              Deploy automatico per progetti web
            </p>

            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-400">
              Piattaforma self-hosted che analizza, builda e deploya qualsiasi
              progetto web con un singolo comando. Integrata come skill di
              Claude Code.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/docs/setup/dns"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-medium text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-[0_0_24px_rgba(34,211,238,0.3)]"
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Guida al Setup
              </a>
              <a
                href="https://github.com/user/prolato"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-6 py-3 font-medium text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800/80"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Flow Diagram Section */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="animate-fade-in-up-delay-1 mb-4 text-center text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Come funziona il deploy
          </h2>
          <p className="animate-fade-in-up-delay-2 mx-auto mb-16 max-w-lg text-center text-slate-400">
            Dal codice sorgente al sito online in pochi secondi
          </p>

          {/* Flow steps */}
          <div className="animate-fade-in-up-delay-3 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-0">
            {[
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
                label: "Analizza",
                desc: "Framework detection",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-3.18M11.42 15.17l5.1-3.18M11.42 15.17V21m4.68-4.68l5.1 3.18M16.1 10.49l5.1-3.18M16.1 10.49V4.8m-4.68 4.69L6.32 6.31M11.42 9.49V3.8m0 0L6.32 6.98" />
                  </svg>
                ),
                label: "Build",
                desc: "Compilazione",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                ),
                label: "Push",
                desc: "Repository Gitea",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                ),
                label: "Deploy",
                desc: "Container / Statico",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L6.1 8.588" />
                  </svg>
                ),
                label: "URL",
                desc: "progetto.tuodominio.it",
              },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center gap-3 sm:gap-0">
                {/* Step node */}
                <div className="group flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/80 text-cyan-400 transition-all group-hover:border-cyan-500/40 group-hover:shadow-[0_0_16px_rgba(34,211,238,0.15)]">
                    {step.icon}
                  </div>
                  <span className="mt-2 font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
                    {step.label}
                  </span>
                  <span className="mt-0.5 text-xs text-slate-500">
                    {step.desc}
                  </span>
                </div>
                {/* Arrow connector */}
                {i < arr.length - 1 && (
                  <div className="hidden sm:flex items-center px-3">
                    <div className="h-px w-8 bg-gradient-to-r from-cyan-500/40 to-cyan-500/10" />
                    <svg className="h-3 w-3 -ml-1 text-cyan-500/40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      </div>

      {/* Features Grid */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="animate-fade-in-up mb-4 text-center text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Funzionalit&agrave;
          </h2>
          <p className="animate-fade-in-up-delay-1 mx-auto mb-16 max-w-lg text-center text-slate-400">
            Tutto quello che serve per deployare i tuoi progetti
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Zero Config",
                desc: "Analisi automatica del framework. Rileva Next.js, React, Vue, Astro, Go, Python e molti altri senza configurazione.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                ),
              },
              {
                title: "Deploy Universale",
                desc: "Supporto per siti statici e applicazioni Docker. Output statico servito via Caddy, container gestiti con Docker Compose.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                  </svg>
                ),
              },
              {
                title: "URL Istantaneo",
                desc: "Sottodominio automatico per ogni progetto. Il tuo sito disponibile su progetto.tuodominio.it in pochi secondi.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L6.1 8.588" />
                  </svg>
                ),
              },
              {
                title: "Versionamento Git",
                desc: "Repository Gitea incluso. Ogni deploy viene versionato automaticamente con cronologia completa dei rilasci.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                ),
              },
              {
                title: "Supporto Database",
                desc: "PostgreSQL, MySQL, MongoDB e Redis. Provisioning automatico dei database con credenziali e variabili d'ambiente.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75" />
                  </svg>
                ),
              },
              {
                title: "Rollback",
                desc: "Torna alla versione precedente in un istante. Ogni deploy è un tag Git, il rollback è un singolo comando.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 transition-all hover:border-slate-700/80 hover:bg-slate-900/60"
              >
                <div className="mb-4 inline-flex rounded-lg border border-slate-700/40 bg-slate-800/50 p-2.5 text-cyan-400 transition-colors group-hover:border-cyan-500/30 group-hover:text-cyan-300">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-100">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      </div>

      {/* How It Works */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="animate-fade-in-up mb-4 text-center text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Tre passi
          </h2>
          <p className="animate-fade-in-up-delay-1 mx-auto mb-16 max-w-lg text-center text-slate-400">
            Dall&apos;installazione al deploy in meno di un minuto
          </p>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Installa la skill",
                desc: "Aggiungi la skill Prolato al tuo Claude Code. Un solo comando per configurare tutto.",
                code: "claude mcp add prolato",
              },
              {
                step: "02",
                title: 'Di\' "deploya questo progetto"',
                desc: "Claude analizza il tuo progetto, sceglie la strategia di deploy e prepara tutto automaticamente.",
                code: '"Deploya questo progetto"',
              },
              {
                step: "03",
                title: "Il tuo sito è online",
                desc: "Ricevi l'URL del tuo progetto. Sottodominio configurato, HTTPS attivo, tutto pronto.",
                code: "https://miosito.example.com",
              },
            ].map((item) => (
              <div key={item.step} className="group text-center">
                {/* Step number */}
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/5 font-mono text-lg font-bold text-cyan-400">
                  {item.step}
                </div>
                <h3 className="mb-3 text-lg font-semibold text-slate-100">
                  {item.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-400">
                  {item.desc}
                </p>
                {/* Code snippet */}
                <div className="mx-auto max-w-xs rounded-lg border border-slate-800/60 bg-slate-900/80 px-4 py-2.5">
                  <code className="font-mono text-xs text-cyan-300/80">
                    {item.code}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      </div>

      {/* Bottom CTA */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-100 sm:text-4xl">
            Pronto per{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">
              deployare
            </span>
            ?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-slate-400">
            Configura il tuo server e inizia a deployare progetti con un singolo
            comando.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/docs/setup/dns"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-medium text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-[0_0_24px_rgba(34,211,238,0.3)]"
            >
              Inizia il Setup
            </a>
            <a
              href="https://github.com/user/prolato"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-6 py-3 font-medium text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800/80"
            >
              Vedi su GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-slate-300">
                Prolato
              </span>
              <span className="text-xs text-slate-600">&mdash;</span>
              <span className="text-xs text-slate-500">
                Deploy automatico per progetti web
              </span>
            </div>
            <div className="text-xs text-slate-500">MIT License</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
