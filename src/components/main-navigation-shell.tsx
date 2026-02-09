"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Emoji } from "@/components/emoji";

type ThemeMode = "dark" | "light";

const NAV_ITEMS = [
  { href: "/driver", label: "Driver", icon: "🚗", sub: "" },
  { href: "/price-tracker", label: "Price Tracker", icon: "🏷️", sub: "" },
  { href: "/travel/tokyo2026", label: "Tokyo 2026", icon: "✈️", sub: "Travel" },
];

export default function MainNavigationShell({
  children,
  title = "Cake Family",
}: {
  children: ReactNode;
  title?: string;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem("ui-theme") : null) as ThemeMode | null;
    const next = saved === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("ui-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <div className="min-h-screen bg-[var(--c-bg)]">
      <header className="sticky top-0 z-40 bg-[var(--c-glass)] backdrop-blur-xl backdrop-saturate-[1.8] border-b border-[var(--c-sep)]">
        <div className="flex items-center justify-between px-4 h-11 md:h-12 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--c-fill-3)] transition-colors active:bg-[var(--c-fill-2)]"
            >
              <svg className="w-[22px] h-[22px] text-[var(--c-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                }
              </svg>
            </button>
            <h1 className="text-[17px] md:text-[19px] font-semibold tracking-tight text-[var(--c-text)]">
              {title}
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--c-fill-3)] transition-colors active:bg-[var(--c-fill-2)]"
          >
            <Emoji char={theme === "dark" ? "🌙" : "☀️"} size={18} />
          </button>
        </div>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-[var(--c-overlay)] backdrop-blur-sm" />
        </div>
      )}

      <aside className={`fixed top-11 md:top-12 left-0 z-30 h-[calc(100vh-44px)] md:h-[calc(100vh-48px)] w-[270px] bg-[var(--c-card)]/95 backdrop-blur-xl border-r border-[var(--c-sep)] transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="h-full flex flex-col">
          <nav className="p-2.5 pt-3 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-[10px] text-[17px] transition-all ${
                    active
                      ? "bg-[var(--c-accent)] text-white font-medium"
                      : "text-[var(--c-text)] font-normal hover:bg-[var(--c-fill-2)]"
                  }`}
                >
                  <Emoji char={item.icon} size={22} />
                  <div className="flex flex-col leading-tight">
                    <span>{item.label}</span>
                    {item.sub && <span className={`text-[11px] font-normal ${active ? "text-white/70" : "text-[var(--c-text-3)]"}`}>{item.sub}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>

        </div>
      </aside>

      <main className="px-4 py-5 md:px-8 md:py-6 md:pl-[302px]">{children}</main>
    </div>
  );
}
