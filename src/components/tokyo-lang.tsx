"use client";

import { useState, useEffect, type ReactNode } from "react";

const KEY = "tokyo-lang";
const DEFAULT = "th";

function read(): string {
  if (typeof window === "undefined") return DEFAULT;
  return localStorage.getItem(KEY) || DEFAULT;
}

export function TokyoLangButton() {
  const [lang, setLang] = useState(DEFAULT);

  useEffect(() => setLang(read()), []);

  const toggle = () => {
    const next = lang === "th" ? "jp" : "th";
    setLang(next);
    localStorage.setItem(KEY, next);
    window.dispatchEvent(new CustomEvent("tokyo-lang-change", { detail: next }));
  };

  return (
    <button
      onClick={toggle}
      className="h-8 px-2.5 rounded-full flex items-center gap-1.5 text-[12px] font-bold bg-[var(--c-fill-2)] text-[var(--c-text)] hover:bg-[var(--c-fill)] active:scale-95 transition-all"
      aria-label="เปลี่ยนภาษา"
    >
      <span className="text-[14px]">{lang === "th" ? "🇯🇵" : "🇹🇭"}</span>
      {lang === "th" ? "JP" : "TH"}
    </button>
  );
}

export function useTkLang() {
  const [lang, setLang] = useState(DEFAULT);
  useEffect(() => {
    setLang(read());
    const h = (e: Event) => setLang((e as CustomEvent).detail);
    window.addEventListener("tokyo-lang-change", h);
    return () => window.removeEventListener("tokyo-lang-change", h);
  }, []);
  return lang;
}

export function TokyoLangWrap({ children }: { children: ReactNode }) {
  const lang = useTkLang();
  return (
    <div data-tokyo-lang={lang}>
      <style>{`
        [data-tokyo-lang="jp"] .lang-th { display: none !important; }
        [data-tokyo-lang="th"] .lang-jp { display: none !important; }
      `}</style>
      {children}
    </div>
  );
}
