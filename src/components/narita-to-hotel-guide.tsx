"use client";

import { useState } from "react";

type RouteId = "kae" | "nex";

interface RouteInfo {
  id: RouteId;
  label: string;
  badge: string;
  color: string;
  cost: string;
  time: string;
  summary: string;
}

const ROUTES: RouteInfo[] = [
  {
    id: "kae",
    label: "KAE (Access Express)",
    badge: "แนะนำ",
    color: "#FF9F0A",
    cost: "¥3,930",
    time: "~55 นาที",
    summary: "ถูกกว่า ตรงถึง Asakusabashi ไม่ต้องต่อรถ",
  },
  {
    id: "nex",
    label: "N'EX (Narita Express)",
    badge: "ทางเลือก",
    color: "#FF453A",
    cost: "¥9,720",
    time: "~70 นาที",
    summary: "สะดวกสบาย ที่นั่ง reserved แต่ต้องต่อ Sobu + แพงกว่า",
  },
];

interface Step {
  step: number;
  icon: string;
  title: string;
  time: string;
  details: string[];
  tip?: string;
}

const KAE_TIMETABLE = [
  { depart: "20:30", arrive: "21:25", note: "to Haneda/Nishi-Magome" },
  { depart: "21:10", arrive: "22:05", note: "to Sengakuji/Shimbashi" },
  { depart: "21:50", arrive: "22:45", note: "to Asakusa" },
  { depart: "22:30", arrive: "23:25", note: "to Haneda" },
  { depart: "23:10", arrive: "00:05", note: "เที่ยวสุดท้าย" },
];

const NEX_TIMETABLE = [
  { depart: "20:45", arrive: "21:38", asakusabashi: "~21:50", note: "N'EX 52 to Tokyo/Shinjuku" },
  { depart: "21:15", arrive: "22:08", asakusabashi: "~22:20", note: "N'EX 53 to Tokyo/Ofuna" },
  { depart: "21:44", arrive: "22:37", asakusabashi: "~22:50", note: "เที่ยวสุดท้าย" },
];

const KAE_STEPS: Step[] = [
  {
    step: 1,
    icon: "🛂",
    title: "ผ่าน ตม. & รับกระเป๋า",
    time: "20:00 – 21:15",
    details: [
      "ลงเครื่อง → เดินตามป้าย \"Arrivals\" / \"Immigration\"",
      "ด่าน ตม. → เปิด QR Code (Visit Japan Web) ทั้ง 4 คน",
      "รับกระเป๋า → ดูจอว่าไฟลท์อยู่สายพานเบอร์อะไร",
      "ศุลกากร → สแกน QR Code อีกครั้ง แล้วออกมาที่ Arrival Hall",
    ],
  },
  {
    step: 2,
    icon: "🎫",
    title: "ซื้อ Welcome Suica + ตั๋ว KAE",
    time: "21:15 – 21:30",
    details: [
      "ลงชั้น B1F → ตามป้าย \"Train\"",
      "หาตู้ Welcome Suica (สีแดง) → ซื้อ 4 ใบ (Adult 2 + Child 2)",
      "เติมเงิน ≥ ¥2,000/ใบ (รวม ¥8,000; เผื่อค่าเดินทางในเมือง 7 วัน)",
      "ไม่ต้อง reserve! แตะ Suica เข้าได้เลย ค่าโดยสาร ¥1,310/ผู้ใหญ่, ¥655/เด็ก",
    ],
    tip: "ไม่อยากทำ Suica ก็ซื้อตั๋วกระดาษที่ตู้ Keisei (สีส้ม) เลือก \"Asakusabashi\" จ่ายเงินสด/บัตรได้",
  },
  {
    step: 3,
    icon: "🚃",
    title: "ขึ้น Access Express",
    time: "~55 นาที ถึง Asakusabashi",
    details: [
      "เดินตามป้าย \"Keisei Line\" (สีส้ม) → Platform 1-2",
      "เช็คจอ → มองหา \"Access Express\" / \"For Haneda / Sengakuji / Asakusa\"",
      "แตะ Suica เข้า → ขึ้นรถ ไม่มี reserved seat นั่งที่ว่าง",
      "กระเป๋าใหญ่/รถเข็น → วางปลายตู้หรือพื้นที่ยืน",
    ],
  },
  {
    step: 4,
    icon: "📍",
    title: "ลงสถานี Asakusabashi",
    time: "ถึงตามตาราง",
    details: [
      "ฟังประกาศ / ดูจอ → ลง \"Asakusabashi\"",
      "แตะ Suica ขาออก",
      "ออก West Exit → เลี้ยวขวา → เดินตรง 150 เมตร → โรงแรมอยู่ซ้ายมือ",
    ],
  },
  {
    step: 5,
    icon: "🏨",
    title: "ถึงที่พัก!",
    time: "~22:30 – 23:00",
    details: [
      "Check-in: แจ้งชื่อที่จอง พนักงานจะให้ Keycard / รหัสห้อง",
      "ขึ้นห้องพัก อาบน้ำ นอน!",
    ],
    tip: "แวะ Lawson/7-11 ใกล้โรงแรม ซื้อน้ำ + ของกินก่อนขึ้นห้อง",
  },
];

const NEX_STEPS: Step[] = [
  {
    step: 1,
    icon: "🛂",
    title: "ผ่าน ตม. & รับกระเป๋า",
    time: "20:00 – 21:15",
    details: [
      "ลงเครื่อง → เดินตามป้าย \"Arrivals\" / \"Immigration\"",
      "ด่าน ตม. → เปิด QR Code (Visit Japan Web) ทั้ง 4 คน",
      "รับกระเป๋า → ดูจอว่าไฟลท์อยู่สายพานเบอร์อะไร",
      "ศุลกากร → สแกน QR Code อีกครั้ง แล้วออกมาที่ Arrival Hall",
    ],
  },
  {
    step: 2,
    icon: "🎫",
    title: "ซื้อตั๋ว N'EX + Welcome Suica",
    time: "21:15 – 21:35",
    details: [
      "ลงชั้น B1F → ตามป้าย \"Train\"",
      "ไป JR Ticket Office (ป้ายสีแดง) → ซื้อ N'EX one-way to Tokyo",
      "ค่าตั๋ว N'EX: ¥3,070/ผู้ใหญ่, ¥1,535/เด็ก (reserved seat ฟรี)",
      "ซื้อ Welcome Suica 4 ใบ (สำหรับต่อ Sobu + ใช้ในเมือง) เติม ¥2,000/ใบ",
    ],
    tip: "แนะนำจอง reserved seat เพื่อ guarantee ที่นั่ง + มีที่วางกระเป๋า",
  },
  {
    step: 3,
    icon: "🚅",
    title: "นั่ง N'EX ไป Tokyo Station",
    time: "~53 นาที",
    details: [
      "เดินตามป้าย \"Narita Express\" (สีแดง) → Platform 1-2",
      "ยื่นตั๋วเข้า → นั่ง reserved seat ตามที่ระบุ",
      "กระเป๋าใหญ่ → luggage rack กว้างสบาย",
      "นั่งยาวจนถึง \"Tokyo Station\"",
    ],
  },
  {
    step: 4,
    icon: "🔄",
    title: "ต่อ JR Sobu Line → Asakusabashi",
    time: "~15 นาที (เดิน + รอรถ)",
    details: [
      "ลง Tokyo Station → เดินตามป้าย \"JR Sobu Line (Local)\" สีเหลือง",
      "ใช้ลิฟต์สำหรับ stroller/กระเป๋า (เดิน 5-10 นาที)",
      "แตะ Suica ขึ้น Sobu → ลงสถานี Asakusabashi (1-2 สถานี ~5 นาที)",
      "ค่า Sobu: ¥170/ผู้ใหญ่, ¥85/เด็ก (หักจาก Suica อัตโนมัติ)",
    ],
    tip: "Tokyo Station ใหญ่มาก ถ้าหลงถาม staff ได้ พูดอังกฤษ OK",
  },
  {
    step: 5,
    icon: "📍",
    title: "ลงสถานี Asakusabashi",
    time: "ถึงตามตาราง",
    details: [
      "แตะ Suica ขาออก",
      "ออก West Exit → เลี้ยวขวา → เดินตรง 150 เมตร → โรงแรมอยู่ซ้ายมือ",
    ],
  },
  {
    step: 6,
    icon: "🏨",
    title: "ถึงที่พัก!",
    time: "~22:30 – 23:00",
    details: [
      "Check-in: แจ้งชื่อที่จอง พนักงานจะให้ Keycard / รหัสห้อง",
      "ขึ้นห้องพัก อาบน้ำ นอน!",
    ],
    tip: "แวะ Lawson/7-11 ใกล้โรงแรม ซื้อน้ำ + ของกินก่อนขึ้นห้อง",
  },
];

export default function NaritaToHotelGuide() {
  const [activeRoute, setActiveRoute] = useState<RouteId>("kae");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const route = ROUTES.find((r) => r.id === activeRoute)!;
  const steps = activeRoute === "kae" ? KAE_STEPS : NEX_STEPS;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-1">
        <p className="text-[20px] font-semibold text-[var(--c-text)]">
          คู่มือ: จากนาริตะ สู่ที่พัก
        </p>
      </div>

      {/* Route selector */}
      <div className="flex gap-2">
        {ROUTES.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              setActiveRoute(r.id);
              setExpandedStep(null);
            }}
            className={`flex-1 rounded-[12px] border-2 p-3 transition-all ${
              activeRoute === r.id
                ? `border-[${r.color}] bg-[${r.color}]/10`
                : "border-[var(--c-sep)] bg-[var(--c-card)]"
            }`}
            style={activeRoute === r.id ? { borderColor: r.color, background: `${r.color}18` } : {}}
          >
            <div className="flex items-center gap-1.5 justify-center mb-1">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ background: r.color }}
              >
                {r.badge}
              </span>
            </div>
            <p className={`text-[13px] font-semibold ${activeRoute === r.id ? "text-[var(--c-text)]" : "text-[var(--c-text-2)]"}`}>
              {r.label}
            </p>
            <p className="text-[11px] text-[var(--c-text-3)] mt-0.5">{r.cost} · {r.time}</p>
          </button>
        ))}
      </div>

      {/* Route summary */}
      <div
        className="rounded-[12px] px-4 py-3 text-[13px] font-medium"
        style={{ background: `${route.color}15`, color: route.color, borderLeft: `3px solid ${route.color}` }}
      >
        {route.summary}
      </div>

      {/* Timetable */}
      <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--c-sep)]/50">
          <p className="text-[14px] font-semibold text-[var(--c-text)]">
            🕐 ตารางเวลา (อาทิตย์หลัง 20:30 จาก Terminal 2/3)
          </p>
          <p className="text-[11px] text-[var(--c-text-3)] mt-0.5">Terminal 1 ออกก่อน +4-5 นาที · เช็ค real-time ด้วย Google Maps</p>
        </div>
        <div className="divide-y divide-[var(--c-sep)]/30">
          {activeRoute === "kae"
            ? KAE_TIMETABLE.map((t, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-mono font-bold text-[var(--c-text)]">{t.depart}</span>
                    <span className="text-[12px] text-[var(--c-text-3)]">→</span>
                    <span className="text-[14px] font-mono font-semibold text-[var(--c-accent)]">{t.arrive}</span>
                  </div>
                  <span className={`text-[11px] ${t.note === "เที่ยวสุดท้าย" ? "text-[#FF453A] font-semibold" : "text-[var(--c-text-3)]"}`}>
                    {t.note}
                  </span>
                </div>
              ))
            : NEX_TIMETABLE.map((t, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-mono font-bold text-[var(--c-text)]">{t.depart}</span>
                    <span className="text-[11px] text-[var(--c-text-3)]">→ Tokyo</span>
                    <span className="text-[14px] font-mono font-semibold text-[var(--c-accent)]">{t.arrive}</span>
                    <span className="text-[11px] text-[var(--c-text-3)]">→ 浅草橋</span>
                    <span className="text-[13px] font-mono font-semibold text-[#30D158]">{t.asakusabashi}</span>
                  </div>
                  <span className={`text-[11px] shrink-0 ml-2 ${t.note === "เที่ยวสุดท้าย" ? "text-[#FF453A] font-semibold" : "text-[var(--c-text-3)]"}`}>
                    {t.note}
                  </span>
                </div>
              ))}
        </div>
      </div>

      {/* Cost breakdown */}
      <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-4">
        <p className="text-[14px] font-semibold text-[var(--c-text)] mb-2">💰 ค่าใช้จ่าย (ครอบครัว 4 คน: ผู้ใหญ่ 2 + เด็ก 2)</p>
        {activeRoute === "kae" ? (
          <div className="space-y-1.5 text-[13px]">
            <div className="flex justify-between"><span className="text-[var(--c-text-2)]">ผู้ใหญ่ 2 × ¥1,310</span><span className="text-[var(--c-text)] font-medium">¥2,620</span></div>
            <div className="flex justify-between"><span className="text-[var(--c-text-2)]">เด็ก 2 × ¥655</span><span className="text-[var(--c-text)] font-medium">¥1,310</span></div>
            <div className="flex justify-between pt-1.5 border-t border-[var(--c-sep)]/50"><span className="text-[var(--c-text)] font-semibold">รวม</span><span className="font-bold" style={{ color: "#FF9F0A" }}>¥3,930</span></div>
          </div>
        ) : (
          <div className="space-y-1.5 text-[13px]">
            <div className="flex justify-between"><span className="text-[var(--c-text-2)]">N'EX ผู้ใหญ่ 2 × ¥3,070</span><span className="text-[var(--c-text)] font-medium">¥6,140</span></div>
            <div className="flex justify-between"><span className="text-[var(--c-text-2)]">N'EX เด็ก 2 × ¥1,535</span><span className="text-[var(--c-text)] font-medium">¥3,070</span></div>
            <div className="flex justify-between"><span className="text-[var(--c-text-2)]">Sobu ผู้ใหญ่ 2 × ¥170</span><span className="text-[var(--c-text)] font-medium">¥340</span></div>
            <div className="flex justify-between"><span className="text-[var(--c-text-2)]">Sobu เด็ก 2 × ¥85</span><span className="text-[var(--c-text)] font-medium">¥170</span></div>
            <div className="flex justify-between pt-1.5 border-t border-[var(--c-sep)]/50"><span className="text-[var(--c-text)] font-semibold">รวม</span><span className="font-bold" style={{ color: "#FF453A" }}>¥9,720</span></div>
          </div>
        )}
      </div>

      {/* Steps */}
      <p className="text-[14px] font-semibold text-[var(--c-text)]">
        📋 ขั้นตอน ({steps.length} steps)
      </p>
      {steps.map((s) => {
        const isOpen = expandedStep === s.step;
        return (
          <div
            key={s.step}
            className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] overflow-hidden"
          >
            <button
              onClick={() => setExpandedStep(isOpen ? null : s.step)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--c-fill-3)] transition-colors active:bg-[var(--c-fill-2)]"
            >
              <span className="text-[20px]">{s.icon}</span>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[15px] font-semibold text-[var(--c-text)] leading-tight">
                  STEP {s.step}: {s.title}
                </p>
                <p className="text-[12px] text-[var(--c-text-2)] mt-0.5">{s.time}</p>
              </div>
              <svg
                className={`w-[14px] h-[14px] text-[var(--c-text-3)] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-2">
                {s.details.map((d, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <span className="text-[11px] font-bold text-[var(--c-accent)] bg-[var(--c-accent)]/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[14px] text-[var(--c-text)] leading-relaxed">{d}</p>
                  </div>
                ))}

                {s.tip && (
                  <div className="mt-3 rounded-[10px] bg-[#FF9F0A]/10 border border-[#FF9F0A]/25 px-3.5 py-2.5">
                    <p className="text-[13px] text-[#FF9F0A] font-medium">{s.tip}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
