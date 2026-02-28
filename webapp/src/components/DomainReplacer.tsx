"use client";

import { useDomain } from "@/lib/useDomain";

export default function DomainReplacer() {
  const { domain, setDomain, resetDomain } = useDomain();
  const isCustom = domain !== "tuodominio.dev";

  return (
    <div className="px-4 py-4">
      <label
        htmlFor="domain-input"
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400"
      >
        Il tuo dominio
      </label>
      <div className="flex items-center gap-2">
        <input
          id="domain-input"
          type="text"
          value={isCustom ? domain : ""}
          placeholder="tuodominio.dev"
          onChange={(e) => setDomain(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
        />
        {isCustom && (
          <button
            onClick={resetDomain}
            title="Ripristina dominio predefinito"
            className="flex-shrink-0 rounded-md border border-slate-700 bg-slate-800 p-1.5 text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {isCustom && (
        <p className="mt-1.5 text-xs text-cyan-400/70">
          I domini nelle guide verranno sostituiti con{" "}
          <span className="font-mono font-semibold">{domain}</span>
        </p>
      )}
    </div>
  );
}
