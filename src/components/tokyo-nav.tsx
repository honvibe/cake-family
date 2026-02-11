"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function useBasePath() {
  const pathname = usePathname();
  return pathname.startsWith("/tokyotripplan") ? "/tokyotripplan" : "/travel/tokyo2026";
}

export function TokyoBackLink() {
  const basePath = useBasePath();
  return (
    <Link
      href={basePath}
      className="px-3 py-1.5 rounded-full text-[13px] font-medium bg-[var(--c-fill-2)] text-[var(--c-text)] hover:bg-[var(--c-fill)] transition-colors"
    >
      กลับหน้า Tokyo
    </Link>
  );
}

export function TokyoDaySelector({
  dayLabels,
  dayNumber,
}: {
  dayLabels: string[];
  dayNumber: number;
}) {
  const basePath = useBasePath();
  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5 md:gap-3">
      {dayLabels.map((label, idx) => {
        const current = idx + 1 === dayNumber;
        return (
          <Link
            key={label}
            href={`${basePath}/day-${idx + 1}`}
            className={`rounded-[14px] border px-3 py-3 text-center transition-all ${
              current
                ? "border-[var(--c-accent)] bg-[var(--c-accent-bg)] text-[var(--c-accent)] font-semibold"
                : "border-[var(--c-sep)] bg-[var(--c-card)] text-[var(--c-text)] hover:bg-[var(--c-fill-3)]"
            }`}
          >
            <div className="text-[13px] font-semibold leading-tight">{label}</div>
          </Link>
        );
      })}
    </div>
  );
}

export function TokyoDayGrid({ days }: { days: string[] }) {
  const basePath = useBasePath();
  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5 md:gap-3">
      {days.map((label, i) => (
        <Link
          key={label}
          href={`${basePath}/day-${i + 1}`}
          className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-card)] px-3 py-3 text-center text-[var(--c-text)] hover:bg-[var(--c-fill-3)] transition-all"
        >
          <div className="text-[13px] font-semibold leading-tight">{label}</div>
        </Link>
      ))}
    </div>
  );
}
