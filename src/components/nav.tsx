"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/app/(app)/actions";
import { ROLE_LABELS, type Role } from "@/lib/constants";

type NavProps = {
  user: { name: string; role: Role };
  isAdmin: boolean;
  canFinance: boolean;
};

type NavLink = {
  href: string;
  label: string;
  adminOnly?: boolean;
  financeOnly?: boolean;
};

const links: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/welcome", label: "New to Belvedere" },
  { href: "/announcements", label: "Announcements" },
  { href: "/meetings", label: "Meetings" },
  { href: "/decisions", label: "Decisions" },
  { href: "/documents", label: "Documents" },
  { href: "/projects", label: "Projects" },
  { href: "/finance", label: "Finance", financeOnly: true },
  { href: "/search", label: "Search" },
  { href: "/admin/users", label: "People", adminOnly: true },
  { href: "/admin/settings", label: "Settings", adminOnly: true },
];

export function Nav({ user, isAdmin, canFinance }: NavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const visible = links.filter(
    (l) => (!l.adminOnly || isAdmin) && (!l.financeOnly || canFinance),
  );

  const linkClass = (href: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return `rounded px-3 py-2 text-sm font-medium ${
      active ? "bg-blue-700 text-white" : "text-gray-700 hover:bg-gray-100"
    }`;
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between py-3">
          <Link href="/dashboard" className="text-lg font-bold">
            Belvedere Court
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-600 sm:inline">
              {user.name} · {ROLE_LABELS[user.role]}
            </span>
            {/* Desktop sign out */}
            <form action={signOutAction} className="hidden md:block">
              <button type="submit" className="btn">
                Sign out
              </button>
            </form>
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Toggle menu"
              className="btn md:hidden"
            >
              {open ? "✕ Close" : "☰ Menu"}
            </button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden flex-wrap gap-1 pb-2 md:flex">
          {visible.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile nav */}
        {open ? (
          <nav className="flex flex-col gap-1 pb-3 md:hidden">
            {visible.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={linkClass(l.href)}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-gray-200 pt-2 text-sm text-gray-600">
              <div className="px-3 py-1">
                {user.name} · {ROLE_LABELS[user.role]}
              </div>
              <form action={signOutAction} className="px-3 py-1">
                <button type="submit" className="btn w-full">
                  Sign out
                </button>
              </form>
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
