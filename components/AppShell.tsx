"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "首頁", icon: "⌂" },
  { href: "/bills/new", label: "開局", icon: "+" },
  { href: "/history", label: "歷史", icon: "◷" },
  { href: "/girls", label: "妹名", icon: "♡" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <header className="app-head">
        <Link href="/" className="brand">
          <span className="brand-icon">帳</span>
          <span className="brand-copy">
            <em>NIGHTTAB</em>
            <strong>夜帳</strong>
            <small>NightTab</small>
          </span>
        </Link>
      </header>
      <main>{children}</main>
      <nav className="bottom-nav" aria-label="主導覽">
        {NAV.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href} className={isActive ? "active" : undefined}>
              <span>{item.icon}</span>
              <strong>{item.label}</strong>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
