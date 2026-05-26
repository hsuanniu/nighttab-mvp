"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "首頁" },
  { href: "/bills/new", label: "開局" },
  { href: "/history", label: "歷史" },
  { href: "/girls", label: "妹名" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <header className="app-head">
        <Link href="/" className="brand">
          <span>夜帳</span>
          <strong>NightTab</strong>
        </Link>
        <Link href="/bills/new" className="primary-link">開局</Link>
      </header>
      <main>{children}</main>
      <nav className="bottom-nav" aria-label="主導覽">
        {NAV.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return <Link key={item.href} href={item.href} className={isActive ? "active" : undefined}>{item.label}</Link>;
        })}
      </nav>
    </div>
  );
}
