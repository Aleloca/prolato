"use client";

import { useState } from "react";
import Link from "next/link";
import DocsNav from "@/components/DocsNav";
import DomainReplacer from "@/components/DomainReplacer";
import { DomainContext, useDomainState } from "@/lib/useDomain";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const domainState = useDomainState();

  return (
    <DomainContext.Provider value={domainState}>
      <div className="min-h-screen bg-[#0a0a0b] text-stone-100">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-stone-800/60 bg-[#0a0a0b]/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md border border-stone-700 bg-stone-900 p-1.5 text-stone-300 transition-colors hover:bg-stone-800"
            aria-label="Open menu"
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
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <Link
            href="/"
            className="font-mono text-sm font-semibold text-stone-300"
          >
            Prolato
          </Link>
          <span className="text-xs text-stone-600">/</span>
          <span className="text-xs text-stone-400">Docs</span>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-50 flex h-full w-72 flex-col border-r border-stone-800/60 bg-[#0f0e0d] transition-transform duration-200 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-stone-800/60 px-4 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-stone-400 transition-colors hover:text-amber-400"
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
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to home
            </Link>
            {/* Close button on mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 text-stone-400 transition-colors hover:text-stone-200 lg:hidden"
              aria-label="Close menu"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Domain replacer */}
          <div className="border-b border-stone-800/60">
            <DomainReplacer />
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <DocsNav onNavigate={() => setSidebarOpen(false)} />
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:pl-72">
          <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 lg:py-16">
            <article className="prose-docs">{children}</article>
          </div>
        </main>
      </div>
    </DomainContext.Provider>
  );
}
