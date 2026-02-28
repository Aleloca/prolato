"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "Panoramica",
    items: [{ label: "Introduzione", href: "/docs/overview" }],
  },
  {
    title: "Setup VPS",
    items: [
      { label: "1. DNS e Dominio", href: "/docs/setup/dns" },
      { label: "2. Server VPS", href: "/docs/setup/vps" },
      { label: "3. Caddy", href: "/docs/setup/caddy" },
      { label: "4. Gitea", href: "/docs/setup/gitea" },
      { label: "5. Docker", href: "/docs/setup/docker" },
      { label: "6. Webhook", href: "/docs/setup/webhook" },
      { label: "7. Verifica", href: "/docs/setup/verify" },
    ],
  },
  {
    title: "Skill Claude Code",
    items: [
      { label: "Installazione", href: "/docs/skill/install" },
      { label: "Utilizzo", href: "/docs/skill/usage" },
    ],
  },
  {
    title: "Manutenzione",
    items: [
      { label: "Backup Database", href: "/docs/maintenance/backup" },
      { label: "Comportamento al Reboot", href: "/docs/maintenance/reboot" },
    ],
  },
];

export default function DocsNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6 px-4 py-4">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            {section.title}
          </h3>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "border-l-2 border-cyan-400 bg-cyan-500/10 pl-[10px] font-medium text-cyan-300"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
