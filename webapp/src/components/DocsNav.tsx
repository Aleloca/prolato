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
    title: "Overview",
    items: [{ label: "Introduction", href: "/docs/overview" }],
  },
  {
    title: "VPS Setup",
    items: [
      { label: "1. DNS & Domain", href: "/docs/setup/dns" },
      { label: "2. VPS Server", href: "/docs/setup/vps" },
      { label: "3. Caddy", href: "/docs/setup/caddy" },
      { label: "4. Gitea", href: "/docs/setup/gitea" },
      { label: "5. Docker", href: "/docs/setup/docker" },
      { label: "6. Webhook", href: "/docs/setup/webhook" },
      { label: "7. Verify", href: "/docs/setup/verify" },
    ],
  },
  {
    title: "Claude Code Skill",
    items: [
      { label: "Installation", href: "/docs/skill/install" },
      { label: "Usage", href: "/docs/skill/usage" },
    ],
  },
  {
    title: "Maintenance",
    items: [
      { label: "Database Backup", href: "/docs/maintenance/backup" },
      { label: "Reboot Behavior", href: "/docs/maintenance/reboot" },
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
