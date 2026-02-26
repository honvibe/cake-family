"use client";

import { useState, useEffect, type ReactNode } from "react";

const KEY = "tokyo-font-scale";
const MIN = 0.85;
const MAX = 1.4;
const STEP = 0.1;
const DEFAULT = 1.0;

function read(): number {
  if (typeof window === "undefined") return DEFAULT;
  const v = localStorage.getItem(KEY);
  return v ? parseFloat(v) : DEFAULT;
}

export function TokyoFontButtons() {
  const [scale, setScale] = useState(DEFAULT);

  useEffect(() => setScale(read()), []);

  const update = (delta: number) => {
    const next = Math.max(MIN, Math.min(MAX, Math.round((scale + delta) * 10) / 10));
    setScale(next);
    localStorage.setItem(KEY, String(next));
    window.dispatchEvent(new CustomEvent("tokyo-font-scale", { detail: next }));
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => update(-STEP)}
        disabled={scale <= MIN}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold bg-[var(--c-fill-2)] text-[var(--c-text)] hover:bg-[var(--c-fill)] active:scale-95 transition-all disabled:opacity-30"
        aria-label="ลดขนาดฟอนต์"
      >
        A<span className="text-[10px]">-</span>
      </button>
      <span className="text-[11px] text-[var(--c-text-2)] w-8 text-center tabular-nums">
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={() => update(STEP)}
        disabled={scale >= MAX}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold bg-[var(--c-fill-2)] text-[var(--c-text)] hover:bg-[var(--c-fill)] active:scale-95 transition-all disabled:opacity-30"
        aria-label="เพิ่มขนาดฟอนต์"
      >
        A<span className="text-[10px]">+</span>
      </button>
    </div>
  );
}

export function TokyoZoomWrap({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(DEFAULT);

  useEffect(() => {
    setScale(read());
    const h = (e: Event) => setScale((e as CustomEvent).detail);
    window.addEventListener("tokyo-font-scale", h);
    return () => window.removeEventListener("tokyo-font-scale", h);
  }, []);

  return <div style={{ zoom: scale }}>{children}</div>;
}
