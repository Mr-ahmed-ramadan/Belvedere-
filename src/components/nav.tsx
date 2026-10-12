"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
];

export function Nav({ user, isAdmin, canFinance }: NavProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between py-3">
          <Link href="/dashboard" className="text-lg font-bold">
            Belvedere
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-600 sm:inline">
              {user.name} · {ROLE_LABELS[user.role]}
            </span>
            <form action={signOutAction}>
              <button type="submit" className="btn">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="flex flex-wrap gap-1 pb-2">
          {links
            .filter((l) => (!l.adminOnly || isAdmin) && (!l.financeOnly || canFinance))
            .map((l) => {
              const active =
                pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded px-3 py-1.5 text-sm font-medium ${
                    active
                      ? "bg-blue-700 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
        </nav>
      </div>
    </header>
  );
}
