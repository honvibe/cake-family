"use client";

import { useState } from "react";

const TAXI_TEXT = `運転手様 (To Driver):
すみませんが、ここまでお願いします。

📍 hotel MONday Apart Akihabara Asakusabashi
(hotel MONday Apart 秋葉原浅草橋)

Address / 住所:
〒111-0053 東京都台東区浅草橋２丁目６−１０
(2 Chome-6-10 Asakusabashi, Taito City)

Premium ではありません。浅草橋の東南側 (Southeast) です。`;

interface Step {
  step: number;
  icon: string;
  title: string;
  time: string;
  details: string[];
  tip?: string;
}

const STEPS: Step[] = [
  {
    step: 1,
    icon: "🛂",
    title: "ผ่าน ตม. & รับกระเป๋า",
    time: "20:00 - 21:15",
    details: [
      'ลงเครื่อง → เดินตามป้าย "Arrivals" หรือ "Immigration"',
      "ด่าน ตม. → เปิด QR Code (Visit Japan Web) ทั้ง 4 คน",
      "รับกระเป๋า → ดูจอมอนิเตอร์ว่าไฟลท์อยู่สายพานเบอร์อะไร",
      "ศุลกากร → สแกน QR Code อีกครั้ง แล้วออกมาที่ Arrival Hall (ชั้น 1)",
    ],
  },
  {
    step: 2,
    icon: "🎫",
    title: "ซื้อตั๋ว Skyliner",
    time: "21:15 - 21:35",
    details: [
      "ลงชั้นล่าง → มองหาป้าย \"Train\" แล้วลงบันไดเลื่อนไป B1F",
      "มองหาเคาน์เตอร์สีน้ำเงิน → ป้ายเขียนว่า \"Keisei Skyliner\" (อย่าเข้าช่อง JR สีแดง)",
      "บอกเจ้าหน้าที่ → \"Skyliner to Ueno / 4 persons (2 Adult, 2 Child)\"",
      "รอบแนะนำ: 21:39 หรือ 21:59 (ออกทุก 20 นาที)",
    ],
    tip: "สอดตั๋วเข้าเครื่อง อย่าลืมหยิบตั๋วคืน! ดูให้ดีว่าขึ้นรถ Skyliner ไม่ใช่รถธรรมดา",
  },
  {
    step: 3,
    icon: "🚄",
    title: "นั่งรถไฟ Skyliner เข้าเมือง",
    time: "ใช้เวลา 45 นาที",
    details: [
      "เก็บตั๋วไว้ดีๆ ต้องใช้สอดขาออก",
      "มีที่วางกระเป๋าใบใหญ่ตรงรอยต่อตู้รถไฟ",
      "นั่งยาวไปจนสุดสาย ลงที่สถานี \"Keisei Ueno\"",
      "ถึงประมาณ 22:25 (รอบ 21:39) หรือ 22:45 (รอบ 21:59)",
    ],
  },
  {
    step: 4,
    icon: "🚕",
    title: "เรียกแท็กซี่ที่สถานี Keisei Ueno",
    time: "22:30 - 22:50",
    details: [
      "ออกจากรถไฟ → ขึ้นบันไดเลื่อนมาที่ชั้นตรวจตั๋ว",
      "คืนตั๋ว → สอดตั๋วขาออก (ตั๋วจะถูกกินไปเลย)",
      "หาทางออก → มองหาป้าย \"Taxi\" หรือ \"Main Exit\"",
      "จุดจอดรถ → เดินออกมาจะเจอ Taxi Stand ด้านหน้า",
    ],
  },
  {
    step: 5,
    icon: "💬",
    title: "ภารกิจคุยกับคนขับแท็กซี่",
    time: "สำคัญ!",
    details: [
      "ยืนรอเฉยๆ ประตูรถจะเปิดเองอัตโนมัติ (ห้ามดึงเปิดเอง)",
      "ยื่นข้อความภาษาญี่ปุ่นให้คนขับดูทันที (กดปุ่มก็อปด้านล่าง)",
      "นั่งรถ ~10-15 นาที (ค่ามิเตอร์ ~1,200-1,500 เยน)",
      "จ่ายเงิน → เตรียมบัตรเครดิต หรือเงินสด (แบงก์ 1,000 เยน)",
    ],
  },
  {
    step: 6,
    icon: "🏨",
    title: "ถึงที่พัก!",
    time: "~23:00",
    details: [
      "แท็กซี่จอดหน้าโรงแรม ประตูเปิดเอง ลงรถ ขนกระเป๋า",
      "Check-in: แจ้งชื่อที่จอง พนักงานจะให้ Keycard / รหัสห้อง",
      "ขึ้นห้องพัก อาบน้ำ นอน!",
    ],
    tip: "ก่อนเข้าโรงแรม แวะกดน้ำจากตู้หน้าโรงแรม หรือร้าน Lawson ใกล้ๆ ได้เลย / อย่าลืมเชื่อมต่อ WiFi โรงแรมทันที",
  },
];

export default function NaritaToHotelGuide() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(TAXI_TEXT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = TAXI_TEXT;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-1">
        <p className="text-[20px] font-semibold text-[var(--c-text)]">
          คู่มือ: จากนาริตะ สู่ที่พัก
        </p>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30">
          6 ขั้นตอน
        </span>
      </div>

      {STEPS.map((s) => {
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
                <p className="text-[12px] text-[var(--c-text-2)] mt-0.5">
                  {s.time}
                </p>
              </div>
              <svg
                className={`w-[14px] h-[14px] text-[var(--c-text-3)] shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-2">
                {s.details.map((d, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <span className="text-[11px] font-bold text-[var(--c-accent)] bg-[var(--c-accent)]/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[14px] text-[var(--c-text)] leading-relaxed">
                      {d}
                    </p>
                  </div>
                ))}

                {s.tip && (
                  <div className="mt-3 rounded-[10px] bg-[#FF9F0A]/10 border border-[#FF9F0A]/25 px-3.5 py-2.5">
                    <p className="text-[13px] text-[#FF9F0A] font-medium">
                      {s.tip}
                    </p>
                  </div>
                )}

                {s.step === 5 && (
                  <div className="mt-3 space-y-3">
                    <div className="rounded-[10px] bg-[var(--c-card)] border border-[var(--c-sep)] p-3.5">
                      <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)] mb-2">
                        ข้อความยื่นให้คนขับ
                      </p>
                      <pre className="text-[13px] text-[var(--c-text)] whitespace-pre-wrap font-[inherit] leading-relaxed">
                        {TAXI_TEXT}
                      </pre>
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`w-full py-3 rounded-[12px] text-[14px] font-semibold transition-all active:scale-[0.98] ${
                        copied
                          ? "bg-[#30D158] text-white"
                          : "bg-[var(--c-accent)] text-white hover:brightness-110"
                      }`}
                    >
                      {copied ? "ก็อปแล้ว!" : "ก็อปข้อความภาษาญี่ปุ่น"}
                    </button>
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
