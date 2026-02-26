"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  { key: "checkin", label: "Check-in ล่วงหน้า" },
  { key: "money", label: "แลกเงินเยน" },
  { key: "sim", label: "ซื้อซิม / eSIM" },
  { key: "klook", label: "eSIM จาก Klook — ติดตั้ง" },
  { key: "cards", label: "Exchange YouTrip & SCB Planet" },
  { key: "suica", label: "บัตร Suica — สร้างใน Wallet" },
  { key: "insurance", label: "Print ประกันการเดินทาง" },
  { key: "passport", label: "เตรียม Passport ทุกคน (4 เล่ม)" },
  { key: "lounge", label: "Coupon เข้า Lounge + บัตรเครดิต" },
  { key: "birth-cert", label: "สูติบัตรลูก" },
  { key: "vjw", label: "Print QR Visit Japan Web (4 คน)" },
  { key: "prints", label: "Print แผนเดินทาง + ใบจองโรงแรม" },
];

const LS_KEY = "tokyo-prep-checklist";

export default function PrepChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setChecked(JSON.parse(saved));
    } catch {}
  }, []);

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const done = ITEMS.filter((i) => checked[i.key]).length;

  return (
    <div className="rounded-[16px] border border-[var(--c-accent)]/40 bg-[var(--c-accent)]/6 p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[18px] font-semibold text-[var(--c-text)]">
          Checklist เตรียมตัว
        </p>
        <span
          className={`text-[13px] font-bold px-2.5 py-0.5 rounded-full ${
            done === ITEMS.length
              ? "bg-[#30D158]/20 text-[#30D158]"
              : "bg-[var(--c-accent)]/15 text-[var(--c-accent)]"
          }`}
        >
          {done}/{ITEMS.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => toggle(item.key)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
              checked[item.key]
                ? "bg-[#30D158]/10"
                : "bg-[var(--c-subtle-card)]"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 text-[11px] font-bold transition-colors ${
                checked[item.key]
                  ? "bg-[#30D158] border-[#30D158] text-white"
                  : "border-[var(--c-text-3)]"
              }`}
            >
              {checked[item.key] ? "✓" : ""}
            </span>
            <span
              className={`text-[14px] leading-tight ${
                checked[item.key]
                  ? "text-[var(--c-text-3)] line-through"
                  : "text-[var(--c-text)]"
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
