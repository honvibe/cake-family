"use client";

import { useEffect, useMemo, useState } from "react";

interface Entry {
  ts: string;
  rate: number;
}

type TF = "h4" | "day" | "month";

const TF_LABELS: { id: TF; label: string }[] = [
  { id: "h4", label: "H4" },
  { id: "day", label: "Day" },
  { id: "month", label: "Month" },
];

function fmtDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  const th = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  const dd = String(th.getUTCDate()).padStart(2, "0");
  const mm = String(th.getUTCMonth() + 1).padStart(2, "0");
  const hh = String(th.getUTCHours()).padStart(2, "0");
  const min = String(th.getUTCMinutes()).padStart(2, "0");
  return `${dd}/${mm} ${hh}:${min}`;
}

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export default function CurrencyTracker() {
  const [h4Entries, setH4Entries] = useState<Entry[]>([]);
  const [dailyHistory, setDailyHistory] = useState<Entry[]>([]);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tf, setTf] = useState<TF>("day");

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      // 1) Fetch recorded H4 data from our API
      const recPromise = fetch("/api/currency")
        .then((r) => r.json())
        .catch(() => ({ entries: [], recording: false }));

      // 2) Fetch 3-month historical daily data from Frankfurter
      const today = new Date();
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const from = threeMonthsAgo.toISOString().slice(0, 10);
      const to = today.toISOString().slice(0, 10);

      const histPromise = fetch(
        `https://api.frankfurter.app/${from}..${to}?amount=100&from=JPY&to=THB`
      )
        .then((r) => r.json())
        .catch(() => null);

      const [recData, histData] = await Promise.all([recPromise, histPromise]);

      if (cancelled) return;

      // Process recorded data
      setH4Entries(recData.entries || []);
      setRecording(recData.recording ?? false);

      // Process historical daily data
      if (histData?.rates) {
        const daily: Entry[] = Object.entries(histData.rates)
          .map(([date, rates]) => ({
            ts: date,
            rate: (rates as Record<string, number>).THB,
          }))
          .sort((a, b) => a.ts.localeCompare(b.ts));
        setDailyHistory(daily);
      }

      setLoading(false);
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  // Build chart data based on timeframe
  const chartData = useMemo(() => {
    if (tf === "h4") {
      // H4: last 7 days of daily history (since we don't have intraday historical)
      // + any recorded H4 entries
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const cutoff = sevenDaysAgo.toISOString().slice(0, 10);

      const recent = dailyHistory.filter((e) => e.ts >= cutoff);
      // Merge with recorded H4 entries
      const h4Dates = new Set(h4Entries.map((e) => e.ts.slice(0, 10)));
      const combined = [
        ...recent.filter((e) => !h4Dates.has(e.ts)),
        ...h4Entries,
      ].sort((a, b) => a.ts.localeCompare(b.ts));
      return combined;
    }

    if (tf === "day") {
      return dailyHistory;
    }

    // Month: group by week and average
    if (dailyHistory.length === 0) return [];
    const byMonth = new Map<string, Entry[]>();
    for (const e of dailyHistory) {
      const key = e.ts.slice(0, 7); // YYYY-MM
      if (!byMonth.has(key)) byMonth.set(key, []);
      byMonth.get(key)!.push(e);
    }
    return Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, arr]) => {
        const avg = arr.reduce((s, e) => s + e.rate, 0) / arr.length;
        return { ts: key, rate: Math.round(avg * 100) / 100 };
      });
  }, [tf, dailyHistory, h4Entries]);

  // Latest rate
  const latest = dailyHistory.length > 0
    ? dailyHistory[dailyHistory.length - 1]
    : h4Entries.length > 0
    ? h4Entries[h4Entries.length - 1]
    : null;

  // Change from previous
  const change = useMemo(() => {
    if (dailyHistory.length < 2) return null;
    const curr = dailyHistory[dailyHistory.length - 1].rate;
    const prev = dailyHistory[dailyHistory.length - 2].rate;
    return { diff: curr - prev, pct: ((curr - prev) / prev) * 100 };
  }, [dailyHistory]);

  if (loading) {
    return (
      <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-6">
        <p className="text-[14px] text-[var(--c-text-2)] animate-pulse">กำลังโหลดข้อมูลอัตราแลกเปลี่ยน...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="rounded-[18px] border border-[var(--c-accent)]/40 bg-[var(--c-accent-bg)] p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] text-[var(--c-text-2)]">100 เยน =</p>
            <p className="text-[32px] md:text-[40px] font-bold text-[var(--c-text)] leading-none mt-1">
              {latest ? `${latest.rate.toFixed(2)}` : "—"}
              <span className="text-[18px] md:text-[22px] font-semibold text-[var(--c-text-2)] ml-1">บาท</span>
            </p>
            {change && (
              <p className={`text-[13px] mt-2 font-medium ${change.diff >= 0 ? "text-[#30D158]" : "text-[#FF453A]"}`}>
                {change.diff >= 0 ? "+" : ""}{change.diff.toFixed(2)} ({change.pct >= 0 ? "+" : ""}{change.pct.toFixed(2)}%)
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[12px] text-[var(--c-text-3)]">JPY → THB</p>
            <p className="text-[11px] text-[var(--c-text-3)] mt-1">
              {recording ? "บันทึก H4 ถึง 28 ก.พ." : ""}
            </p>
            <p className="text-[11px] text-[var(--c-text-3)]">
              {dailyHistory.length} วัน · {h4Entries.length} H4
            </p>
          </div>
        </div>

        {/* Timeframe toggle */}
        <div className="flex gap-1 mt-5 bg-[var(--c-fill-2)] rounded-[10px] p-1 w-fit">
          {TF_LABELS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTf(t.id)}
              className={`px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all ${
                tf === t.id
                  ? "bg-[var(--c-accent)] text-white"
                  : "text-[var(--c-text-2)] hover:text-[var(--c-text)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {chartData.length >= 2 ? (
        <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-5">
          <MiniChart data={chartData} tf={tf} />
        </div>
      ) : (
        <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-6">
          <p className="text-[14px] text-[var(--c-text-2)]">ข้อมูลยังไม่เพียงพอสำหรับแสดงกราฟ</p>
        </div>
      )}

      {/* History table */}
      <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--c-sep)]">
          <p className="text-[14px] font-semibold text-[var(--c-text)]">
            ประวัติรายวัน ({dailyHistory.length} วัน)
          </p>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {dailyHistory.length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-[var(--c-text-2)]">ยังไม่มีข้อมูล</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="sticky top-0">
                <tr className="border-b border-[var(--c-sep)] bg-[var(--c-fill-3)]">
                  <th className="px-5 py-2 text-left font-medium text-[var(--c-text-2)]">วันที่</th>
                  <th className="px-5 py-2 text-right font-medium text-[var(--c-text-2)]">100 JPY</th>
                  <th className="px-5 py-2 text-right font-medium text-[var(--c-text-2)]">เปลี่ยนแปลง</th>
                </tr>
              </thead>
              <tbody>
                {[...dailyHistory].reverse().map((e, i, arr) => {
                  const prev = arr[i + 1];
                  const diff = prev ? e.rate - prev.rate : 0;
                  return (
                    <tr key={e.ts} className="border-b border-[var(--c-sep)]/40">
                      <td className="px-5 py-2.5 text-[var(--c-text)]">{fmtDate(e.ts)}</td>
                      <td className="px-5 py-2.5 text-right font-semibold text-[var(--c-accent)]">
                        {e.rate.toFixed(2)} ฿
                      </td>
                      <td className={`px-5 py-2.5 text-right font-medium ${
                        diff > 0 ? "text-[#30D158]" : diff < 0 ? "text-[#FF453A]" : "text-[var(--c-text-3)]"
                      }`}>
                        {prev ? `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SVG Line Chart ---
function MiniChart({ data, tf }: { data: Entry[]; tf: TF }) {
  const rates = data.map((d) => d.rate);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const range = max - min || 0.01;
  const pad = range * 0.15;
  const yMin = min - pad;
  const yMax = max + pad;
  const yRange = yMax - yMin;

  const W = 800;
  const H = 240;
  const P = { top: 15, right: 55, bottom: 35, left: 10 };
  const plotW = W - P.left - P.right;
  const plotH = H - P.top - P.bottom;

  const points = data.map((d, i) => ({
    x: P.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW),
    y: P.top + (1 - (d.rate - yMin) / yRange) * plotH,
    ...d,
  }));

  const lineD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${lineD} L${points[points.length - 1].x},${P.top + plotH} L${points[0].x},${P.top + plotH} Z`;

  // Y grid (4 levels)
  const yTickCount = 4;
  const yTicks = Array.from({ length: yTickCount }, (_, i) => yMin + (yRange * i) / (yTickCount - 1));

  // X labels
  const maxLabels = tf === "month" ? data.length : tf === "day" ? 8 : 7;
  const xStep = Math.max(1, Math.floor(data.length / maxLabels));

  function xLabel(entry: Entry): string {
    if (tf === "month") {
      const [y, m] = entry.ts.split("-");
      return THAI_MONTHS_SHORT[parseInt(m) - 1] + " " + y.slice(2);
    }
    if (tf === "h4" && entry.ts.includes("T")) {
      return fmtDateTime(entry.ts).slice(0, 5);
    }
    return fmtDate(entry.ts);
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {yTicks.map((val, i) => {
        const y = P.top + (1 - (val - yMin) / yRange) * plotH;
        return (
          <g key={i}>
            <line
              x1={P.left}
              y1={y}
              x2={W - P.right}
              y2={y}
              stroke="var(--c-sep)"
              strokeWidth={0.5}
              strokeDasharray={i === 0 || i === yTickCount - 1 ? "0" : "4,4"}
            />
            <text x={W - P.right + 8} y={y + 4} fontSize={11} fill="var(--c-text-3)">
              {val.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--c-accent)" stopOpacity={0.2} />
          <stop offset="100%" stopColor="var(--c-accent)" stopOpacity={0.01} />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={lineD} fill="none" stroke="var(--c-accent)" strokeWidth={2} strokeLinejoin="round" />

      {/* Dots */}
      {data.length <= 60 &&
        points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={data.length > 30 ? 2 : 3} fill="var(--c-accent)" />
        ))}

      {/* X labels */}
      {points
        .filter((_, i) => i % xStep === 0 || i === points.length - 1)
        .map((p, i) => (
          <text key={i} x={p.x} y={H - 5} textAnchor="middle" fontSize={10} fill="var(--c-text-3)">
            {xLabel(p)}
          </text>
        ))}
    </svg>
  );
}
