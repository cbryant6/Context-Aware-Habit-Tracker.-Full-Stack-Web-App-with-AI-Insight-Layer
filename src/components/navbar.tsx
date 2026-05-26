"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/home", label: "Home" },
  { href: "/dashboard", label: "Today" },
  { href: "/habits", label: "Habits" },
  { href: "/history", label: "History" },
  { href: "/insights", label: "Insights" },
];

export function Navbar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-neutral-800 bg-neutral-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Top row: logo + email + sign out */}
        <div className="flex items-center justify-between py-3">
          <Link href="/home" className="text-lg font-bold text-white">
            Habit Tracker
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-neutral-400 sm:inline">
              {email}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Nav links */}
        <div className="-mb-px flex gap-1 overflow-x-auto">
          {navItems.map(({ href, label }) => {
            const isActive =
              href === "/home" || href === "/dashboard"
                ? pathname === href
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-violet-700"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
