import MainNavigationShell from "@/components/main-navigation-shell";
import HotelCard from "@/components/hotel-card";
import NaritaToHotelGuide from "@/components/narita-to-hotel-guide";
import { TokyoBackLink, TokyoDaySelector } from "@/components/tokyo-nav";
import { TokyoFontButtons, TokyoZoomWrap } from "@/components/tokyo-font-scale";
import { TokyoLangButton, TokyoLangWrap } from "@/components/tokyo-lang";
import TokyoDayJP from "@/components/tokyo-day-jp";
import PrepChecklist from "@/components/prep-checklist";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return Array.from({ length: 8 }, (_, i) => ({ daySlug: `day-${i + 1}` }));
}

export default async function TokyoDayPage({
  params,
}: {
  params: Promise<{ daySlug: string }>;
}) {
  const { daySlug } = await params;
  const match = /^day-(\d+)$/.exec(daySlug);
  const dayNumber = match ? Number(match[1]) : NaN;
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 8) notFound();
  const dayLabels = [
    "Sun. 1",
    "Mon. 2",
    "Tue. 3",
    "Wed. 4",
    "Thu. 5",
    "Fri. 6",
    "Sat. 7",
    "Sun. 8",
  ];
  const HOTEL = {
    name: "MONday Apart Asakusabashi Akihabara",
    rating: "4.0 stars rating out of five",
    addressEn: "4-15-5 Asakusabashi Taito-Ku Tokyo Japan, Tokyo, Japan, 111-0053",
    addressJp: "東京都台東区浅草橋4-15-5, 東京, 日本, 111-0053",
    checkIn: "Sunday March 1, 2026 (after 3:00 PM)",
    checkOut: "Sunday March 8, 2026 (before 10:00 AM)",
  };

  const WEATHER: Record<number, { icon: string; temp: string; desc: string; area: string; tip: string }> = {
    1: { icon: "☀️", temp: "7° – 16°", desc: "แดดออก", area: "Tokyo", tip: "อากาศดี แต่กลางคืนเย็น เตรียมแจ็คเก็ต" },
    2: { icon: "☁️", temp: "9° – 13°", desc: "เมฆมาก", area: "Tokyo", tip: "อากาศเย็นสบาย ช้อปในร่มเป็นหลัก ไม่มีปัญหา" },
    3: { icon: "🌧️", temp: "6° – 10°", desc: "ฝน 85%", area: "Tokyo (DisneySea)", tip: "⚠️ ฝนเกือบแน่นอน! เตรียม poncho + hot pack + แต่งกันน้ำ" },
    4: { icon: "🌦️", temp: "5° – 12°", desc: "ฝน 45%", area: "Tokyo", tip: "พกร่มพับไว้ อาจมีฝนช่วงบ่าย" },
    5: { icon: "☀️", temp: "4° – 13°", desc: "แดดออก", area: "Kamakura", tip: "วันดีสุด! ถ่ายรูปสวย เช้าหนาวใส่ layer" },
    6: { icon: "☁️", temp: "2° – 8°", desc: "เมฆมาก", area: "Fujikawaguchiko", tip: "⚠️ หนาวจัด! ใส่หนาสุด + ถุงมือ หมวก ผ้าพันคอ ฟูจิอาจไม่ชัด" },
    7: { icon: "🌧️", temp: "6° – 12°", desc: "ฝน 55%", area: "Kawagoe → Ginza", tip: "พกร่ม Pedestrian Paradise อาจไม่จัดถ้าฝนตก" },
    8: { icon: "☀️", temp: "5° – 12°", desc: "แดดออก", area: "Tokyo → BKK", tip: "อากาศดี เดินทางสบาย" },
  };

  const weather = WEATHER[dayNumber];

  return (
    <MainNavigationShell>
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div>
            <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] tracking-tight">Tokyo 2026</p>
            <p className="text-[15px] text-[var(--c-text-2)]">Day {dayNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <TokyoLangButton />
            <TokyoFontButtons />
            <TokyoBackLink />
          </div>
        </div>

        <TokyoZoomWrap>
        <TokyoDaySelector dayLabels={dayLabels} dayNumber={dayNumber} />

        <TokyoLangWrap>
        <div className="lang-th">
        {/* Weather Card */}
        {weather && (
          <div className="mt-4 mb-5 rounded-[14px] border border-[var(--c-sep)] bg-gradient-to-r from-[var(--c-card-alt)] to-[var(--c-card)] p-4 flex items-center gap-4">
            <div className="text-[36px] shrink-0">{weather.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[18px] font-bold text-[var(--c-text)]">{weather.temp}</span>
                <span className="text-[13px] text-[var(--c-text-3)]">{weather.desc}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--c-fill-3)] text-[var(--c-text-2)]">{weather.area}</span>
              </div>
              <p className="text-[13px] text-[var(--c-text-2)] mt-1">{weather.tip}</p>
            </div>
          </div>
        )}

        <div className="mt-2 md:mt-3">
        {dayNumber === 1 ? (
          <div className="space-y-5">
            {/* Flight Info */}
            <div className="rounded-[18px] border border-[var(--c-accent)]/45 bg-[var(--c-accent-bg)] p-5 md:p-7">
              <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] leading-tight">Day 1: เดินทางถึงญี่ปุ่น</p>
              <p className="text-[14px] mt-2 text-[var(--c-text-2)]">วันอาทิตย์ 1 มีนาคม 2026 — Air Japan XJ 606</p>
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-5">
                  <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">เที่ยวบิน</p>
                  <p className="text-[22px] font-semibold text-[var(--c-text)] mt-2">XJ 606</p>
                  <p className="text-[13px] text-[var(--c-text-2)] mt-1">Air Japan &middot; บินตรง &middot; Terminal 1</p>
                </div>
                <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-5">
                  <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">เส้นทาง</p>
                  <p className="text-[22px] font-semibold text-[var(--c-text)] mt-2">DMK &rarr; NRT</p>
                  <p className="text-[13px] text-[var(--c-text-2)] mt-1">ดอนเมือง &rarr; นาริตะ</p>
                </div>
                <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-5">
                  <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">เวลาบิน</p>
                  <p className="text-[22px] font-semibold text-[var(--c-text)] mt-2">11:50 &rarr; 20:00</p>
                  <p className="text-[13px] text-[var(--c-text-2)] mt-1">เวลาท้องถิ่นแต่ละประเทศ</p>
                </div>
              </div>
            </div>

            {/* Checklist กดเช็ค */}
            <PrepChecklist />

            {/* สิ่งที่ต้องเตรียมก่อนเดินทาง */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">รายละเอียดแต่ละข้อ</p>
              <p className="text-[13px] text-[var(--c-text-3)] mb-4">กดแต่ละหัวข้อเพื่อดูรายละเอียด</p>
              <div className="space-y-2.5">
                {/* 1. Check-in ล่วงหน้า */}
                <details className="group rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] overflow-hidden">
                  <summary className="flex items-center gap-3 p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="w-8 h-8 rounded-full bg-[var(--c-accent)]/12 flex items-center justify-center text-[16px] shrink-0">✈️</span>
                    <span className="flex-1 text-[15px] font-semibold text-[var(--c-text)]">1. Check-in ล่วงหน้า</span>
                    <span className="text-[12px] text-[var(--c-text-3)] group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  <div className="px-3.5 pb-3.5 space-y-2">
                    <div className="rounded-lg bg-[var(--c-accent)]/8 p-3">
                      <p className="text-[13px] font-semibold text-[var(--c-accent)] mb-1">Thai AirAsia X (XJ 606)</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">Web check-in ผ่าน <span className="font-semibold text-[var(--c-text)]">airasia.com</span> หรือแอป AirAsia</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">เปิดให้ check-in: <span className="font-semibold text-[var(--c-text)]">14 วันก่อนเดินทาง</span> ถึง 1 ชม.ก่อนเครื่องออก</p>
                    </div>
                    <div className="text-[13px] text-[var(--c-text-2)] leading-relaxed space-y-1">
                      <p>• เคาน์เตอร์ DMK เปิด 3 ชม.ก่อน, ปิด 45 นาทีก่อนเครื่องออก</p>
                      <p>• ถึงสนามบินอย่างน้อย 2-3 ชม.ก่อน (เที่ยวบินระหว่างประเทศ)</p>
                    </div>
                  </div>
                </details>

                {/* 2. แลกเงินเยน */}
                <details className="group rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] overflow-hidden">
                  <summary className="flex items-center gap-3 p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="w-8 h-8 rounded-full bg-[#FF9F0A]/12 flex items-center justify-center text-[16px] shrink-0">💴</span>
                    <span className="flex-1 text-[15px] font-semibold text-[var(--c-text)]">2. แลกเงินเยน</span>
                    <span className="text-[12px] text-[var(--c-text-3)] group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  <div className="px-3.5 pb-3.5 space-y-2">
                    <div className="rounded-lg bg-[#FF9F0A]/8 p-3">
                      <p className="text-[13px] font-semibold text-[#FF9F0A] mb-1">แลกที่ไหนดี?</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed"><span className="font-semibold text-[var(--c-text)]">Super Rich</span> (สีเขียว/สีส้ม) สาขาราชดำริ เรทดีที่สุด</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">เช็คเรทล่วงหน้าผ่านแอป SuperRichTH หรือเว็บ superrich.co.th</p>
                    </div>
                    <div className="text-[13px] text-[var(--c-text-2)] leading-relaxed space-y-1">
                      <p className="font-semibold text-[var(--c-text)]">ควรแลกเท่าไหร่ (4 คน, 8 วัน)</p>
                      <p>• แบบประหยัด: 100,000-150,000 เยน (~22,000-33,000 บาท)</p>
                      <p>• แบบสบาย: 200,000-300,000 เยน (~44,000-66,000 บาท)</p>
                      <p>• แลก 70-80% ของงบเงินสด ส่วนที่เหลือใช้ YouTrip/SCB Planet</p>
                      <p>• อย่าแลกที่สนามบิน — เรทแพงกว่าร้านในเมืองมาก</p>
                    </div>
                  </div>
                </details>

                {/* 3. ซื้อซิม / eSIM */}
                <details className="group rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] overflow-hidden">
                  <summary className="flex items-center gap-3 p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="w-8 h-8 rounded-full bg-[#30D158]/12 flex items-center justify-center text-[16px] shrink-0">📶</span>
                    <span className="flex-1 text-[15px] font-semibold text-[var(--c-text)]">3. ซื้อซิม / eSIM</span>
                    <span className="text-[12px] text-[var(--c-text-3)] group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  <div className="px-3.5 pb-3.5 space-y-2">
                    <div className="rounded-lg bg-[#30D158]/8 p-3">
                      <p className="text-[13px] font-semibold text-[#30D158] mb-1">แนะนำ eSIM (ไม่ต้องเปลี่ยนซิม)</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">ใช้ได้กับ iPhone XS ขึ้นไป — ซิมไทยเดิมยังรับ SMS/โทรได้ (Dual SIM)</p>
                    </div>
                    <div className="text-[13px] text-[var(--c-text-2)] leading-relaxed space-y-1">
                      <p className="font-semibold text-[var(--c-text)]">eSIM ที่แนะนำ</p>
                      <p>• <span className="font-semibold">Klook eSIM (DOCOMO)</span> — เน็ตไม่จำกัด, เครือข่าย DOCOMO ดีสุดในญี่ปุ่น</p>
                      <p>• Trip.com eSIM — เริ่ม ~31 บาท/วัน</p>
                      <p>• Airalo — แอป eSIM ระดับโลก หลายแพ็กเกจ</p>
                      <p className="mt-1">• eSIM 1 ตัว <span className="font-semibold">แชร์ hotspot</span> ให้คนอื่นได้</p>
                      <p>• ซื้อก่อนเดินทาง 1-2 วัน เพื่อทดสอบการติดตั้ง</p>
                      <p>• เลือกแพ็กเกจ <span className="font-semibold">unlimited data</span> จะสบายใจกว่า</p>
                    </div>
                  </div>
                </details>

                {/* 4. ซิมจาก Klook */}
                <details className="group rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] overflow-hidden">
                  <summary className="flex items-center gap-3 p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="w-8 h-8 rounded-full bg-[#BF5AF2]/12 flex items-center justify-center text-[16px] shrink-0">🎫</span>
                    <span className="flex-1 text-[15px] font-semibold text-[var(--c-text)]">4. eSIM จาก Klook — วิธีรับ+ใช้</span>
                    <span className="text-[12px] text-[var(--c-text-3)] group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  <div className="px-3.5 pb-3.5 space-y-2">
                    <div className="text-[13px] text-[var(--c-text-2)] leading-relaxed space-y-1.5">
                      <p className="font-semibold text-[var(--c-text)]">ขั้นตอนที่ 1: สั่งซื้อ</p>
                      <p>• แอป Klook หรือเว็บ klook.com &rarr; ค้นหา &quot;Japan eSIM DOCOMO&quot; &rarr; เลือกแพ็กเกจ 8 วัน unlimited &rarr; ชำระเงิน</p>
                      <p className="font-semibold text-[var(--c-text)] mt-2">ขั้นตอนที่ 2: รับ QR code</p>
                      <p>• ได้ <span className="font-semibold">QR code ทันทีทาง email + ในแอป Klook</span> (ไม่ต้องรอรับที่สนามบิน ไม่ต้องส่งบ้าน)</p>
                      <p className="font-semibold text-[var(--c-text)] mt-2">ขั้นตอนที่ 3: ติดตั้ง</p>
                      <p>• เปิดแอป Klook &rarr; Account &rarr; Bookings &rarr; กด Activate</p>
                      <p>• หรือ Settings &rarr; Cellular &rarr; SIMs &rarr; Add eSIM &rarr; สแกน QR code</p>
                      <p>• ติดตั้งขณะ <span className="font-semibold">เชื่อมต่อ WiFi</span> (ก่อนขึ้นเครื่อง)</p>
                      <p className="font-semibold text-[var(--c-text)] mt-2">ขั้นตอนที่ 4: เปิดใช้งาน</p>
                      <p>• ถึงญี่ปุ่น &rarr; เปิด Data Roaming ของ eSIM ตัวใหม่ &rarr; ตั้งเป็น Cellular Data หลัก</p>
                      <p>• ซิมไทยเดิมยังรับ SMS/โทรได้ตามปกติ</p>
                    </div>
                  </div>
                </details>

                {/* 5. YouTrip & SCB Planet */}
                <details className="group rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] overflow-hidden">
                  <summary className="flex items-center gap-3 p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="w-8 h-8 rounded-full bg-[#FF453A]/12 flex items-center justify-center text-[16px] shrink-0">💳</span>
                    <span className="flex-1 text-[15px] font-semibold text-[var(--c-text)]">5. YouTrip &amp; SCB Planet</span>
                    <span className="text-[12px] text-[var(--c-text-3)] group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  <div className="px-3.5 pb-3.5 space-y-2">
                    <div className="rounded-lg bg-[#007AFF]/8 p-3">
                      <p className="text-[13px] font-semibold text-[#007AFF] mb-1">YouTrip (Mastercard)</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">• แลกเยนล่วงหน้าในแอป YouTrip (lock rate ได้)</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">• เรท Mastercard wholesale — ไม่มี markup</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">• กด ATM ญี่ปุ่น <span className="font-semibold text-[#30D158]">ฟรีค่าธรรมเนียม</span> (7-Eleven, Japan Post, Lawson)</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">• เติมเงินผ่าน K-Plus</p>
                    </div>
                    <div className="rounded-lg bg-[#BF5AF2]/8 p-3">
                      <p className="text-[13px] font-semibold text-[#BF5AF2] mb-1">SCB Planet (VISA)</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">• แลกเยนล่วงหน้าในแอป SCB Easy (lock rate 24 ชม.)</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">• เรทเทียบเท่าร้านแลกเงิน — ไม่มี markup</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">• กด ATM ค่าธรรมเนียม 100 บาท/ครั้ง (กดที่ AEON ATM ฝั่งตู้ฟรี)</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">• รองรับ 13 สกุลเงิน (มากกว่า YouTrip)</p>
                    </div>
                    <div className="rounded-lg bg-[#FF9F0A]/8 p-3">
                      <p className="text-[13px] font-semibold text-[#FF9F0A] mb-1">ทริคสำคัญ</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">• <span className="font-semibold text-[var(--c-text)]">พกทั้งสองใบ</span> ไว้สำรองกัน</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">• กดเงินสด &rarr; ใช้ <span className="font-semibold">YouTrip</span> (ฟรี)</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">• Lock rate &rarr; ใช้ <span className="font-semibold">SCB Planet</span> เมื่อเจอเรทดี</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">• ตอนรูดในญี่ปุ่น <span className="font-semibold text-[#FF453A]">เลือกจ่ายเป็น JPY เสมอ</span> อย่าเลือก THB</p>
                    </div>
                  </div>
                </details>

                {/* 6. บัตร Suica */}
                <details className="group rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] overflow-hidden">
                  <summary className="flex items-center gap-3 p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="w-8 h-8 rounded-full bg-[#64D2FF]/12 flex items-center justify-center text-[16px] shrink-0">🚃</span>
                    <span className="flex-1 text-[15px] font-semibold text-[var(--c-text)]">6. บัตร Suica</span>
                    <span className="text-[12px] text-[var(--c-text-3)] group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  <div className="px-3.5 pb-3.5 space-y-2">
                    <div className="rounded-lg bg-[#64D2FF]/8 p-3">
                      <p className="text-[13px] font-semibold text-[#64D2FF] mb-1">Suica คืออะไร?</p>
                      <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">บัตรเติมเงิน IC Card ของ JR East — ใช้แตะเข้า-ออกรถไฟ, ซื้อของ convenience store, ตู้กดเครื่องดื่ม, ล็อกเกอร์สถานี</p>
                    </div>
                    <div className="text-[13px] text-[var(--c-text-2)] leading-relaxed space-y-1.5">
                      <p className="font-semibold text-[var(--c-text)]">สร้างบน iPhone (ทำที่บ้านได้เลย)</p>
                      <p>1. เปิดแอป <span className="font-semibold">Wallet</span> &rarr; กดปุ่ม + &rarr; Transit Card &rarr; เลือก Suica</p>
                      <p>2. เลือกเติมครั้งแรกขั้นต่ำ <span className="font-semibold">1,000 เยน</span></p>
                      <p>3. ชำระผ่านบัตรเครดิตใน Apple Pay &rarr; ยืนยัน Face ID</p>
                      <p>4. ได้ Suica ทันที!</p>
                      <p className="font-semibold text-[var(--c-text)] mt-2">เติมเงิน</p>
                      <p>• ผ่าน Wallet &rarr; แตะ Suica &rarr; Add Money &rarr; เลือกจำนวน</p>
                      <p>• ที่ตู้ขายตั๋วในสถานี (IC Charge) หยอดเงินสด</p>
                      <p>• ที่ร้าน convenience store — บอก &quot;Suica charge&quot;</p>
                      <p className="font-semibold text-[var(--c-text)] mt-2">ใช้อะไรได้บ้าง</p>
                      <p>• 🚃 รถไฟ/รถไฟใต้ดิน/รถบัส ทุกสาย</p>
                      <p>• 🏪 Convenience store (7-Eleven, FamilyMart, Lawson)</p>
                      <p>• 🥤 ตู้กดเครื่องดื่ม, ล็อกเกอร์, ร้านอาหาร</p>
                      <p className="font-semibold text-[#FF9F0A] mt-2">ทริคสำคัญ</p>
                      <p>• เปิด <span className="font-semibold">Express Transit Mode</span> — แตะได้โดยไม่ต้องปลดล็อก</p>
                      <p>• วงเงินสูงสุดเติมได้ 20,000 เยน/บัตร</p>
                      <p>• ครอบครัว 4 คน: สร้าง Suica <span className="font-semibold">แยกคนละ iPhone</span></p>
                      <p>• คนไม่มี iPhone &rarr; ซื้อ <span className="font-semibold">Welcome Suica</span> (บัตรกายภาพ) ที่สถานี Narita / JR ใหญ่ๆ</p>
                    </div>
                  </div>
                </details>

                {/* 7. Print ประกันการเดินทาง */}
                <details className="group rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] overflow-hidden">
                  <summary className="flex items-center gap-3 p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="w-8 h-8 rounded-full bg-[#FF453A]/12 flex items-center justify-center text-[16px] shrink-0">🛡️</span>
                    <span className="flex-1 text-[15px] font-semibold text-[var(--c-text)]">7. Print ประกันการเดินทาง</span>
                    <span className="text-[12px] text-[var(--c-text-3)] group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  <div className="px-3.5 pb-3.5 space-y-1.5 text-[13px] text-[var(--c-text-2)] leading-relaxed">
                    <p>• Print กรมธรรม์ประกันเดินทาง (Travel Insurance) ทุกคน</p>
                    <p>• เก็บไว้ในแฟ้มเดินทาง + บันทึกไฟล์ PDF ไว้ในมือถือด้วย</p>
                    <p>• สิ่งสำคัญ: เลขกรมธรรม์, เบอร์ hotline ฉุกเฉิน 24 ชม., วงเงินคุ้มครอง</p>
                    <p>• บางประกันต้องโชว์ตอน check-in หรือเข้าเมือง</p>
                  </div>
                </details>

                {/* 8. เตรียม Passport */}
                <details className="group rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] overflow-hidden">
                  <summary className="flex items-center gap-3 p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="w-8 h-8 rounded-full bg-[#007AFF]/12 flex items-center justify-center text-[16px] shrink-0">🛂</span>
                    <span className="flex-1 text-[15px] font-semibold text-[var(--c-text)]">8. เตรียม Passport ทุกคน</span>
                    <span className="text-[12px] text-[var(--c-text-3)] group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  <div className="px-3.5 pb-3.5 space-y-1.5 text-[13px] text-[var(--c-text-2)] leading-relaxed">
                    <p>• เช็ค Passport <span className="font-semibold text-[var(--c-text)]">ทั้ง 4 เล่ม</span> — หมดอายุต้องเหลืออย่างน้อย 6 เดือน</p>
                    <p>• ถ่ายรูปหน้า Passport เก็บไว้ในมือถือทุกคน (สำรองกรณีหาย)</p>
                    <p>• เตรียม <span className="font-semibold text-[var(--c-text)]">สำเนา Passport</span> อย่างน้อยคนละ 1 ชุด แยกเก็บคนละที่กับตัวจริง</p>
                    <p>• เข้าญี่ปุ่นไม่ต้องวีซ่า (คนไทยอยู่ได้ 15 วัน)</p>
                  </div>
                </details>

                {/* 9. Coupon Lounge + บัตรเครดิต */}
                <details className="group rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] overflow-hidden">
                  <summary className="flex items-center gap-3 p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="w-8 h-8 rounded-full bg-[#FF9F0A]/12 flex items-center justify-center text-[16px] shrink-0">🎟️</span>
                    <span className="flex-1 text-[15px] font-semibold text-[var(--c-text)]">9. Coupon เข้า Lounge + บัตรเครดิต</span>
                    <span className="text-[12px] text-[var(--c-text-3)] group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  <div className="px-3.5 pb-3.5 space-y-1.5 text-[13px] text-[var(--c-text-2)] leading-relaxed">
                    <p>• เตรียม <span className="font-semibold text-[var(--c-text)]">Coupon / Voucher เข้า Miracle Lounge</span></p>
                    <p>• พกบัตรเครดิตที่ได้สิทธิ์เข้า Lounge ไปด้วย (ต้องโชว์ตอนเข้า)</p>
                    <p>• เช็คเงื่อนไข: จำนวนคนต่อบัตร, ต้องเป็นเที่ยวบินขาออกระหว่างประเทศ</p>
                    <p>• Print หรือ Screenshot coupon เก็บไว้ (บาง Lounge ไม่รับดิจิทัล)</p>
                    <p className="font-semibold text-[#FF9F0A]">จุดสังเกต Miracle Lounge ที่ DMK:</p>
                    <p>• ผ่าน ตม. แล้ว เดินผ่านร้าน King Power Duty Free แล้ว <span className="font-semibold text-[var(--c-text)]">&quot;เลี้ยวซ้าย&quot;</span> (ทางไป Gate 1-6)</p>
                  </div>
                </details>

                {/* 10. สูติบัตรลูก */}
                <details className="group rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] overflow-hidden">
                  <summary className="flex items-center gap-3 p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="w-8 h-8 rounded-full bg-[#30D158]/12 flex items-center justify-center text-[16px] shrink-0">👶</span>
                    <span className="flex-1 text-[15px] font-semibold text-[var(--c-text)]">10. สูติบัตรลูก</span>
                    <span className="text-[12px] text-[var(--c-text-3)] group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  <div className="px-3.5 pb-3.5 space-y-1.5 text-[13px] text-[var(--c-text-2)] leading-relaxed">
                    <p>• สูติบัตร (Birth Certificate) สำหรับเด็กที่เดินทาง</p>
                    <p>• ใช้ยืนยันความสัมพันธ์พ่อ-แม่-ลูก กรณี ตม. ถาม</p>
                    <p>• พก <span className="font-semibold text-[var(--c-text)]">ตัวจริง + สำเนา</span></p>
                    <p>• ถ่ายรูปเก็บไว้ในมือถือด้วย</p>
                  </div>
                </details>

                {/* 11. Print QR Visit Japan Web */}
                <details className="group rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] overflow-hidden">
                  <summary className="flex items-center gap-3 p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="w-8 h-8 rounded-full bg-[#BF5AF2]/12 flex items-center justify-center text-[16px] shrink-0">📱</span>
                    <span className="flex-1 text-[15px] font-semibold text-[var(--c-text)]">11. Print QR Visit Japan Web</span>
                    <span className="text-[12px] text-[var(--c-text-3)] group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  <div className="px-3.5 pb-3.5 space-y-1.5 text-[13px] text-[var(--c-text-2)] leading-relaxed">
                    <p>• ลงทะเบียนที่ <span className="font-semibold text-[var(--c-text)]">vjw.digital.go.jp</span> &mdash; กรอกข้อมูล <span className="font-semibold text-[var(--c-text)]">ทั้ง 4 คน</span></p>
                    <p>• ได้ QR code 2 อัน: (1) <span className="font-semibold">ตม. เข้าเมือง</span> (2) <span className="font-semibold">ศุลกากร</span></p>
                    <p>• <span className="font-semibold text-[#FF453A]">Print QR ทุกคน</span> ไว้ในกระดาษ &mdash; เผื่อมือถือไม่มีเน็ต/แบตหมด</p>
                    <p>• Screenshot เก็บไว้ในมือถือด้วย (เปิดได้แม้ offline)</p>
                    <p>• กรอกข้อมูลล่วงหน้าก่อนเดินทาง 1-2 สัปดาห์ได้เลย</p>
                  </div>
                </details>

                {/* 12. Print แผนเดินทาง + ใบจองโรงแรม */}
                <details className="group rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] overflow-hidden">
                  <summary className="flex items-center gap-3 p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="w-8 h-8 rounded-full bg-[#64D2FF]/12 flex items-center justify-center text-[16px] shrink-0">🖨️</span>
                    <span className="flex-1 text-[15px] font-semibold text-[var(--c-text)]">12. Print แผนเดินทาง + ใบจองโรงแรม</span>
                    <span className="text-[12px] text-[var(--c-text-3)] group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  <div className="px-3.5 pb-3.5 space-y-1.5 text-[13px] text-[var(--c-text-2)] leading-relaxed">
                    <p>• Print <span className="font-semibold text-[var(--c-text)]">ใบจองโรงแรม</span> (Booking Confirmation) &mdash; ใช้แสดงตอน check-in + เผื่อ ตม. ถาม</p>
                    <p>• Print <span className="font-semibold text-[var(--c-text)]">ตั๋วเครื่องบิน / Boarding Pass</span></p>
                    <p>• Print <span className="font-semibold text-[var(--c-text)]">แผนเดินทาง</span> (Itinerary) แต่ละวัน &mdash; เผื่อมือถือใช้ไม่ได้</p>
                    <p>• รวมเอกสารทั้งหมดไว้ใน <span className="font-semibold text-[var(--c-text)]">แฟ้มเดินทาง 1 แฟ้ม</span></p>
                  </div>
                </details>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-5">ไทม์ไลน์ Day 1</p>
              <div className="relative space-y-0">
                {[
                  { time: "08:00", icon: "🏠", title: "ออกจากบ้าน", note: "ออกไม่เกิน 08:30 — ซื้อขนมปังกินบน Taxi / ซื้อชารอไว้ หรือไม่ซื้อเลยไปกินที่ Lounge", phase: "th" as const },
                  { time: "09:30", icon: "🛫", title: "ถึงสนามบินดอนเมือง (DMK)", note: "เช็กอิน + ซื้อขนมปัง + เข้า Gate", phase: "th" as const },
                  { time: "10:00", icon: "🍽️", title: "กิน Miracle Lounge", note: "จุดสังเกต: พอผ่าน ตม. เข้ามาแล้ว เดินผ่านร้าน King Power Duty Free แล้ว \"เลี้ยวซ้าย\" (ทางไป Gate 1-6)", phase: "th" as const },
                  { time: "10:00-\n11:15", icon: "🚶", title: "กินเสร็จ → เดินเล่น / รอที่ Gate", note: "เดินดูร้านค้าหรือนั่งรอที่ Gate ก่อนขึ้นเครื่อง", phase: "th" as const },
                  { time: "11:50", icon: "✈️", title: "เครื่องออก XJ 606", note: "บินตรง DMK → NRT", phase: "fly" as const },
                  { time: "20:00", icon: "🛬", title: "ถึงสนามบินนาริตะ (NRT)", note: "เวลาท้องถิ่นโตเกียว — Terminal 1", phase: "jp" as const },
                  { time: "20:00-\n21:15", icon: "🛂", title: "ตม. + รับกระเป๋า + ศุลกากร", note: "เปิด QR Visit Japan Web ทั้ง 4 คน → รับกระเป๋า → สแกน QR ศุลกากร → ออก Arrival Hall ชั้น 1", phase: "jp" as const },
                  { time: "21:15-\n21:35", icon: "🎫", title: "ซื้อตั๋ว Keisei Skyliner", note: "ลง B1F มองหาเคาน์เตอร์สีน้ำเงิน → \"Skyliner to Ueno / 4 persons\" → รอบ 21:39 หรือ 21:59", phase: "jp" as const },
                  { time: "21:39", icon: "🚄", title: "นั่ง Skyliner เข้าเมือง", note: "ใช้เวลา 45 นาที → ลงที่ Keisei Ueno (เก็บตั๋วไว้สอดขาออก)", phase: "jp" as const },
                  { time: "22:25", icon: "🚕", title: "แท็กซี่จาก Keisei Ueno → โรงแรม", note: "ออกทางออก Main Exit → Taxi Stand หน้าสถานี → ยื่นข้อความญี่ปุ่นให้คนขับ (~10-15 นาที / ~1,200-1,500 เยน)", phase: "jp" as const },
                  { time: "23:00", icon: "🏨", title: "ถึงที่พัก Check-in & พักผ่อน", note: "MONday Apart Asakusabashi Akihabara → แวะซื้อน้ำ/ขนมที่ร้านสะดวกซื้อ → เชื่อมต่อ WiFi → นอน!", phase: "jp" as const },
                ].map((row, i, arr) => (
                  <div key={`${row.time}-${row.title}`} className="flex gap-4 group">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[18px] shrink-0 ${
                        row.phase === "fly" ? "bg-[#FF9F0A]/22 ring-2 ring-[#FF9F0A]/40" :
                        row.phase === "jp" ? "bg-[#FF453A]/18 ring-2 ring-[#FF453A]/30" :
                        "bg-[var(--c-accent)]/10 ring-2 ring-[var(--c-accent)]/30"
                      }`}>
                        {row.icon}
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`w-[2px] flex-1 min-h-[20px] ${
                          row.phase === "jp" ? "bg-[#FF453A]/20" : "bg-[var(--c-sep)]"
                        }`} />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-5 min-w-0 flex-1">
                      <div className="flex items-baseline gap-2.5">
                        <span className={`text-[15px] font-bold whitespace-pre-line leading-tight ${
                          row.phase === "fly" ? "text-[#FF9F0A]" :
                          row.phase === "jp" ? "text-[#FF453A]" :
                          "text-[var(--c-accent)]"
                        }`}>{row.time}</span>
                        {row.phase === "fly" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/22 text-[#FF9F0A]">ON AIR</span>
                        )}
                      </div>
                      <p className="text-[16px] font-semibold text-[var(--c-text)] mt-1 leading-tight">{row.title}</p>
                      <p className="text-[13px] text-[var(--c-text-2)] mt-1 leading-relaxed">{row.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Narita to Hotel step-by-step guide */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <NaritaToHotelGuide />
            </div>

            {/* Tips */}
            <div className="rounded-[16px] border border-[#30D158]/40 bg-[#30D158]/12 p-5">
              <p className="text-[16px] font-semibold text-[#30D158] mb-3">ทริคเสริมกันลืม</p>
              <div className="space-y-2.5">
                {[
                  { icon: "💧", text: "น้ำดื่ม: แวะกดตู้หน้าโรงแรม หรือร้าน Lawson ใกล้ๆ ได้เลย" },
                  { icon: "📶", text: "WiFi: เชื่อมต่อ WiFi โรงแรมทันทีเพื่อติดต่อทางบ้าน" },
                  { icon: "💴", text: "เงินสด: เตรียมแบงก์ 1,000 เยน สำหรับจ่ายแท็กซี่" },
                  { icon: "🧳", text: "กระเป๋าใบใหญ่: วางตรงรอยต่อตู้รถไฟ Skyliner ได้" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[16px]">{tip.icon}</span>
                    <p className="text-[14px] text-[var(--c-text)] leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <HotelCard hotel={HOTEL} />
          </div>
        ) : dayNumber === 8 ? (
          <div className="space-y-5">
            <div className="rounded-[18px] border border-[var(--c-accent)]/45 bg-[var(--c-accent-bg)] p-5 md:p-7">
              <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] leading-tight">Day 8: เดินทางกลับกรุงเทพฯ</p>
              <p className="text-[14px] mt-2 text-[var(--c-text-2)]">วันอาทิตย์ 8 มีนาคม 2026</p>
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-5">
                  <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">เที่ยวบินขากลับ</p>
                  <p className="text-[22px] font-semibold text-[var(--c-text)] mt-2">XJ 603</p>
                  <p className="text-[13px] text-[var(--c-text-2)] mt-1">บินตรง</p>
                </div>
                <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-5">
                  <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">เส้นทาง</p>
                  <p className="text-[22px] font-semibold text-[var(--c-text)] mt-2">NRT -&gt; DMK</p>
                  <p className="text-[13px] text-[var(--c-text-2)] mt-1">Tokyo to Bangkok</p>
                </div>
                <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-5">
                  <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">เวลาบิน</p>
                  <p className="text-[22px] font-semibold text-[var(--c-text)] mt-2">12:10 - 17:40</p>
                  <p className="text-[13px] text-[var(--c-text-2)] mt-1">เวลา Local</p>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-5">ไทม์ไลน์ Day 8</p>
              <div className="space-y-5">
                {[
                  { time: "08:30", title: "เช็กเอาท์จากที่พัก", note: "ออกก่อน 10:00 AM ตามเงื่อนไขโรงแรม" },
                  { time: "08:45", title: "ออกจากโรงแรมไป NRT", note: "เดินทางจาก MONday Apart Asakusabashi Akihabara", map: "https://www.google.com/maps?q=MONday+Apart+Asakusabashi+Akihabara+to+Narita+International+Airport&output=embed", mapTitle: "เส้นทางจากโรงแรมไปนาริตะ" },
                  { time: "10:20", title: "ถึงสนามบินนาริตะ (NRT)", note: "เตรียมเช็กอินและโหลดสัมภาระ" },
                  { time: "11:40", title: "พร้อมขึ้นเครื่อง", note: "ผ่านจุดตรวจและรอเรียกขึ้นเครื่อง" },
                  { time: "12:10", title: "เครื่องออก (XJ 603)", note: "บินตรง NRT -> DMK" },
                  { time: "17:40", title: "ถึงสนามบินดอนเมือง (DMK)", note: "รับกระเป๋าและเตรียมเดินทางกลับบ้าน", map: "https://www.google.com/maps?q=Don+Mueang+International+Airport&output=embed", mapTitle: "แผนที่สนามบินดอนเมือง" },
                  { time: "18:30", title: "ออกจาก DMK กลับบ้าน", note: "จบทริป Tokyo 2026" },
                ].map((row) => (
                  <div key={`${row.time}-${row.title}`} className="rounded-[12px] bg-[var(--c-subtle-card)] border border-[var(--c-sep)] p-4">
                    <div className="flex gap-4">
                      <div className="min-w-16 text-[22px] leading-none font-semibold text-[var(--c-accent)]">{row.time}</div>
                      <div>
                        <p className="text-[20px] font-medium text-[var(--c-text)] leading-tight">{row.title}</p>
                        <p className="text-[14px] text-[var(--c-text-2)] mt-1">{row.note}</p>
                      </div>
                    </div>
                    {"map" in row && row.map && (
                      <div className="mt-4 overflow-hidden rounded-[10px] border border-[var(--c-sep)]">
                        <iframe
                          title={row.mapTitle}
                          src={row.map}
                          loading="lazy"
                          className="w-full h-[320px]"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : dayNumber === 2 ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="rounded-[18px] border border-[var(--c-accent)]/45 bg-[var(--c-accent-bg)] p-5 md:p-7">
              <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] leading-tight">Day 2: Akihabara &amp; Ueno</p>
              <p className="text-[14px] mt-2 text-[var(--c-text-2)]">วันจันทร์ 2 มีนาคม 2026 — ตื่นสาย &middot; เดินห้างใกล้ๆ &middot; ช้อปของที่ต้องใช้</p>
              <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "ธีม", value: "ช้อปปิ้ง & สำรวจ", icon: "🛍️" },
                  { label: "โซน", value: "Akihabara → Ueno", icon: "📍" },
                  { label: "การเดินทาง", value: "เดิน + JR", icon: "🚶" },
                  { label: "มื้อเด็ด", value: "ซูชิหน้าล้น + ยากินิกุ", icon: "🍣" },
                ].map((card) => (
                  <div key={card.label} className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-4">
                    <span className="text-[20px]">{card.icon}</span>
                    <p className="text-[12px] text-[var(--c-text-2)] mt-2">{card.label}</p>
                    <p className="text-[14px] font-semibold text-[var(--c-text)] mt-0.5">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-5">ไทม์ไลน์ Day 2</p>
              <div className="relative space-y-0">
                {[
                  { time: "08:00", icon: "🥪", title: "ตื่นนอน & มื้อเช้าในห้องพัก", note: "แซนด์วิช/นม เตรียมตัวลุย", tag: "" },
                  { time: "09:00", icon: "🚶", title: "เดินไป Yodobashi Akiba", note: "จากโรงแรม 800 เมตร (10-15 นาที) ไม่ต้องเสียค่ารถไฟ", tag: "" },
                  { time: "09:30", icon: "🏢", title: "Yodobashi Akiba", note: "ห้างเปิดพอดี! ดูรายละเอียดชั้นด้านล่าง (ใช้เวลา ~2 ชม.)", tag: "ช้อปปิ้ง", mapQuery: "Yodobashi+Akiba+Akihabara" },
                  { time: "11:30", icon: "🚶", title: "เดินไปสถานี JR Akihabara", note: "ออกจาก Yodobashi → เดินไปสถานี JR (~5 นาที)", tag: "" },
                  { time: "11:40", icon: "🚃", title: "นั่ง JR Yamanote → Ueno (2 สถานี)", note: "ใช้เวลา ~4 นาที → ถึง Ueno ~11:45", tag: "" },
                  { time: "11:50", icon: "🍣", title: "มื้อเที่ยง: Miura Misaki Port Ueno", note: "ถึงก่อนคนแน่น! ซูชิสายพานหน้าล้น เครื่องพูนจัดเต็ม ใกล้สถานี Ueno", tag: "มื้อเที่ยง", mapQuery: "Miura-misaki-kou+Ueno" },
                  { time: "13:00", icon: "🧸", title: "Yamashiroya (ตรงข้ามสถานี Ueno)", note: "ตึกของเล่น 6 ชั้น — Sanrio/Disney Princess ชั้น 2, เดินดูเพลินๆ หลังกินข้าว", tag: "ช้อปปิ้ง", mapQuery: "Yamashiroya+Ueno" },
                  { time: "13:45", icon: "💯", title: "Seria (ตึก Marui ชั้น 7)", note: "Sanrio ลิขสิทธิ์แท้ ทุกชิ้น 100 เยน น่ารักกว่า Daiso!", tag: "ช้อปปิ้ง", mapQuery: "Seria+Marui+Ueno" },
                  { time: "15:30", icon: "👟", title: "ตลาด Ameyoko & ภารกิจซื้อกระเป๋า", note: "London Sports: รองเท้าราคาถูก / Ginza Karen (สาขา Ueno): กระเป๋าเดินทางใบใหม่ 5,500-7,700 เยน", tag: "ช้อปปิ้ง", mapQuery: "Ameyoko+Market+Ueno" },
                  { time: "16:30", icon: "👕", title: "Uniqlo Okachimachi", note: "ตึก Yoshiike — ซื้อเสื้อผ้า Uniqlo/GU ร้านใหญ่", tag: "ช้อปปิ้ง", mapQuery: "Uniqlo+Okachimachi" },
                  { time: "17:30", icon: "🏨", title: "นำกระเป๋าไปเก็บที่โรงแรม", note: "นั่ง JR กลับ Asakusabashi แป๊บเดียว แล้วเตรียมตัวไปทานข้าว", tag: "" },
                  { time: "18:30", icon: "🥩", title: "มื้อเย็น: Yakiniku Motoyama (Akihabara)", note: "ยากินิกุพรีเมียม — จองล่วงหน้า! ร้านแถว รร.", tag: "มื้อเย็น", mapQuery: "Yakiniku+Motoyama+Akihabara" },
                  { time: "19:30", icon: "😴", title: "กลับโรงแรมพักผ่อน", note: "เตรียมตัวสำหรับ DisneySea พรุ่งนี้!", tag: "" },
                ].map((row, i, arr) => (
                  <div key={`${row.time}-${row.title}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-[18px] shrink-0 bg-[var(--c-accent)]/10 ring-2 ring-[var(--c-accent)]/30">
                        {row.icon}
                      </div>
                      {i < arr.length - 1 && (
                        <div className="w-[2px] flex-1 min-h-[20px] bg-[var(--c-sep)]" />
                      )}
                    </div>
                    <div className="pb-5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-[15px] font-bold text-[var(--c-accent)]">{row.time}</span>
                        {row.tag && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.tag === "มื้อเที่ยง" || row.tag === "มื้อเย็น"
                              ? "bg-[#FF9F0A]/22 text-[#FF9F0A]"
                              : "bg-[#BF5AF2]/22 text-[#BF5AF2]"
                          }`}>{row.tag}</span>
                        )}
                      </div>
                      <p className="text-[16px] font-semibold text-[var(--c-text)] mt-1 leading-tight">{row.title}</p>
                      <p className="text-[13px] text-[var(--c-text-2)] mt-1 leading-relaxed">{row.note}</p>
                      {"mapQuery" in row && row.mapQuery && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${row.mapQuery}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                          </svg>
                          เปิดแผนที่
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Yodobashi Floor Guide */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">Yodobashi Akiba — แผนผังชั้น</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">เปิด 09:30 น. ใช้เวลาประมาณ 2-2.5 ชม.</p>
              <div className="space-y-2.5">
                {[
                  { floor: "ชั้น 7", who: "แม่ & รองเท้า", color: "bg-[#FF6482]/18 text-[#FF6482] border-[#FF6482]/40", items: "ABC-MART (รองเท้าผ้าใบเด็ก/ผู้ใหญ่ รุ่นใหม่/ใส่สบาย) + DAISO (ของ Sanrio ราคา 100 เยน)" },
                  { floor: "ชั้น 6", who: "ลูกๆ", color: "bg-[#FF9F0A]/18 text-[#FF9F0A] border-[#FF9F0A]/40", items: "Tomica / Marvel / Disney — ปล่อยลูกดูของเล่น" },
                  { floor: "ชั้น 1-5", who: "พ่อ", color: "bg-[#64D2FF]/18 text-[#64D2FF] border-[#64D2FF]/40", items: "คอมพิวเตอร์ / กล้อง / เกม" },
                ].map((f) => (
                  <div key={f.floor} className={`rounded-[12px] border ${f.color} p-4`}>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-[12px] font-bold ${f.color}`}>{f.floor}</span>
                      <span className="text-[14px] font-semibold text-[var(--c-text)]">{f.who}</span>
                    </div>
                    <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">{f.items}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transport Summary */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-4">การเดินทางวันนี้</p>
              <div className="space-y-2.5">
                {[
                  { from: "โรงแรม", to: "Yodobashi Akiba", method: "เดิน 800m", cost: "ฟรี" },
                  { from: "Akihabara", to: "Ueno", method: "JR Yamanote (2 สถานี)", cost: "~170 เยน/คน" },
                  { from: "Ueno → Ameyoko", to: "Okachimachi", method: "เดินลัดเลาะตลาด", cost: "ฟรี" },
                  { from: "Okachimachi", to: "Asakusabashi (โรงแรม)", method: "JR เปลี่ยนที่ Akihabara", cost: "~150 เยน/คน" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[10px] bg-[var(--c-subtle-card)] border border-[var(--c-sep)] px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[var(--c-text)]">{t.from} &rarr; {t.to}</p>
                      <p className="text-[12px] text-[var(--c-text-2)]">{t.method}</p>
                    </div>
                    <span className="text-[13px] font-semibold text-[var(--c-accent)] whitespace-nowrap">{t.cost}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-[16px] border border-[#30D158]/40 bg-[#30D158]/12 p-5">
              <p className="text-[16px] font-semibold text-[#30D158] mb-3">ทริค Day 2</p>
              <div className="space-y-2.5">
                {[
                  { icon: "🧳", text: "Ginza Karen (Ameyoko): กระเป๋าเดินทาง 5,500-7,700 เยน สังเกตป้ายร้านที่มีกระเป๋าวางเรียงหน้าร้านเยอะๆ" },
                  { icon: "👟", text: "London Sports (Ameyoko): กองรองเท้าหน้าร้าน ลองรื้อหาคู่ละ 500-800 บาท" },
                  { icon: "📦", text: "ช่วง 17:30: เอากระเป๋าไปเก็บโรงแรมก่อนไปทานเย็น จะได้ไม่ต้องลากไปด้วย" },
                  { icon: "📞", text: "Yakiniku Motoyama: จองล่วงหน้า! ร้านอยู่แถวโรงแรม เดินไปสะดวก" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[16px]">{tip.icon}</span>
                    <p className="text-[14px] text-[var(--c-text)] leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : dayNumber === 3 ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="rounded-[18px] border border-[#BF5AF2]/45 bg-[#BF5AF2]/12 p-5 md:p-7">
              <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] leading-tight">Day 3: Tokyo DisneySea</p>
              <p className="text-[14px] mt-2 text-[var(--c-text-2)]">วันอังคาร 3 มีนาคม 2026 — Fantasy Springs &middot; Toy Story &middot; Soaring &middot; Believe!</p>
              <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "เปิดประตู", value: "09:00", icon: "🏁" },
                  { label: "ไฮไลท์", value: "Fantasy Springs", icon: "🧚" },
                  { label: "โชว์ค่ำ", value: "Believe! ~19:15", icon: "🎆" },
                  { label: "ค่าตั๋ว DPA", value: "~5,800 เยน", icon: "🎫" },
                ].map((card) => (
                  <div key={card.label} className="rounded-[14px] border border-[#BF5AF2]/35 bg-[#BF5AF2]/15 p-4">
                    <span className="text-[20px]">{card.icon}</span>
                    <p className="text-[12px] text-[var(--c-text-2)] mt-2">{card.label}</p>
                    <p className="text-[14px] font-semibold text-[var(--c-text)] mt-0.5">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* DPA Strategy */}
            <div className="rounded-[16px] border border-[#FF9F0A]/40 bg-[#FF9F0A]/12 p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">กลยุทธ์ DPA &amp; Priority Pass</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">กดทันทีตอน 09:00 ประตูเปิด — แม่กด DPA / พ่อกด Priority Pass</p>
              <div className="space-y-3">
                {[
                  { time: "09:00", who: "แม่", type: "DPA (เสียเงิน)", ride: "❌ Frozen Journey — ปิดปรับปรุง! เปลี่ยนเป็น Toy Story Mania แทน", icon: "🚫", color: "bg-[#FF453A]/18 text-[#FF453A] border-[#FF453A]/40" },
                  { time: "09:00", who: "พ่อ", type: "Priority Pass (ฟรี)", ride: "Nemo & Friends SeaRider (รอบ 09:30-10:00)", icon: "🐠", color: "bg-[#30D158]/18 text-[#30D158] border-[#30D158]/40" },
                  { time: "10:00", who: "ใครก็ได้", type: "DPA ใบที่ 2 (ครบ 1 ชม.)", ride: "❌ Peter Pan ปิดปรับปรุง! เปลี่ยนเป็น Soaring แทน", icon: "🚫", color: "bg-[#FF453A]/18 text-[#FF453A] border-[#FF453A]/40" },
                ].map((dpa, i) => (
                  <div key={i} className={`rounded-[12px] border ${dpa.color} p-4`}>
                    <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                      <span className="text-[18px]">{dpa.icon}</span>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${dpa.color}`}>{dpa.time} — {dpa.who}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dpa.color}`}>{dpa.type}</span>
                    </div>
                    <p className="text-[15px] font-semibold text-[var(--c-text)]">{dpa.ride}</p>
                  </div>
                ))}
                <div className="rounded-[10px] bg-[#FF453A]/18 border border-[#FF453A]/35 px-3.5 py-2.5 mt-2">
                  <p className="text-[13px] text-[#FF453A] font-medium">ตั้งนาฬิกาปลุก 10:00 น. เพื่อกด DPA ใบที่ 2 ทันที!</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-5">ไทม์ไลน์ Day 3</p>
              <div className="relative space-y-0">
                {[
                  { time: "07:00", icon: "🌅", title: "ออกจากโรงแรม", note: "แวะซื้อข้าวปั้น/รองท้องมื้อเช้าที่ร้านสะดวกซื้อ", phase: "travel" as const },
                  { time: "07:20", icon: "🚃", title: "ขึ้นรถไฟไป DisneySea", note: "JR Chuo-Sobu (สีเหลือง) → Nishi-Funabashi → JR Keiyo (สีแดง) → Maihama", phase: "travel" as const },
                  { time: "08:15", icon: "🏰", title: "ถึงหน้าประตู DisneySea", note: "นั่ง Monorail มา → ต่อแถวตรวจกระเป๋า ทานมื้อเช้าระหว่างรอ", phase: "disney" as const },
                  { time: "09:00", icon: "🏁", title: "ประตูเปิด! กด DPA ทันที", note: "แม่กด DPA → Toy Story Mania (Frozen ปิด!) / พ่อกด Priority Pass → Nemo", phase: "disney" as const },
                  { time: "09:20", icon: "🚂", title: "Electric Railway → โซน Nemo", note: "เอารถเข็นขึ้นลิฟต์ไปชั้น 2 นั่งรถไฟข้ามฟากไปลงโซน Nemo (ประหยัดแรงเดิน)", phase: "disney" as const },
                  { time: "09:40", icon: "🐠", title: "Nemo & Friends SeaRider", note: "ใช้ช่องทางด่วน Priority Pass ที่กดไว้", phase: "disney" as const },
                  { time: "10:00", icon: "⏰", title: "นาฬิกาปลุกดัง! กด DPA ใบ 2", note: "Soaring: Fantastic Flight (Peter Pan ปิด!)", phase: "disney" as const },
                  { time: "10:30", icon: "🧚", title: "Fantasy Springs", note: "เดินถ่ายรูปโซนใหม่ (Frozen Journey ปิดปรับปรุง)", phase: "disney" as const },
                  { time: "12:00", icon: "🍕", title: "มื้อเที่ยง: Sebastian's Calypso Kitchen", note: "โซน Mermaid Lagoon — พิซซ่าซีฟู้ด, แซนด์วิช / กด Mobile Order ล่วงหน้า 30 นาที", phase: "food" as const },
                  { time: "13:30", icon: "🧜", title: "Mermaid Lagoon (Indoor)", note: "Blowfish Balloon Race / Flounder's Coaster — แอร์เย็น ถ้าลูกง่วงนอนรถเข็นได้", phase: "disney" as const },
                  { time: "15:00", icon: "🧞", title: "Arabian Coast: Sindbad's Voyage", note: "เรือล่องช้าๆ เพลงเพราะ นั่งพักสบาย — ผ่อนคลายช่วงบ่าย", phase: "disney" as const },
                  { time: "16:30", icon: "🤠", title: "Toy Story Mania!", note: "โซน American Waterfront — ใช้ DPA ใบที่ 2 หรือ 3", phase: "disney" as const },
                  { time: "17:30", icon: "🍝", title: "มื้อเย็น: Zambini Brothers' Ristorante", note: "โซนท่าเรือ — พาสต้า/พิซซ่า ร้านใหญ่ อยู่ใกล้จุดดูโชว์", phase: "food" as const },
                  { time: "19:15", icon: "🎆", title: "Believe! Sea of Dreams", note: "โชว์แสงสีเสียงบนผิวน้ำ ตัวละคร Disney บนเรือไฟ — ต้องดู! (เช็คเวลาในแอป)", phase: "disney" as const },
                  { time: "20:00", icon: "🚃", title: "เดินทางกลับโรงแรม", note: "Disney Resort Line → Maihama → JR Keiyo → Nishi-Funabashi → JR Chuo-Sobu → Asakusabashi", phase: "travel" as const },
                  { time: "21:00", icon: "😴", title: "ถึงที่พัก พักผ่อน", note: "จบวัน DisneySea!", phase: "travel" as const },
                ].map((row, i, arr) => (
                  <div key={`${row.time}-${row.title}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[18px] shrink-0 ${
                        row.phase === "travel" ? "bg-[var(--c-accent)]/10 ring-2 ring-[var(--c-accent)]/30" :
                        row.phase === "food" ? "bg-[#FF9F0A]/18 ring-2 ring-[#FF9F0A]/30" :
                        "bg-[#BF5AF2]/10 ring-2 ring-[#BF5AF2]/30"
                      }`}>
                        {row.icon}
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`w-[2px] flex-1 min-h-[20px] ${
                          row.phase === "disney" ? "bg-[#BF5AF2]/20" :
                          row.phase === "food" ? "bg-[#FF9F0A]/20" :
                          "bg-[var(--c-sep)]"
                        }`} />
                      )}
                    </div>
                    <div className="pb-5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`text-[15px] font-bold ${
                          row.phase === "disney" ? "text-[#BF5AF2]" :
                          row.phase === "food" ? "text-[#FF9F0A]" :
                          "text-[var(--c-accent)]"
                        }`}>{row.time}</span>
                        {row.phase === "food" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/22 text-[#FF9F0A]">อาหาร</span>
                        )}
                      </div>
                      <p className="text-[16px] font-semibold text-[var(--c-text)] mt-1 leading-tight">{row.title}</p>
                      <p className="text-[13px] text-[var(--c-text-2)] mt-1 leading-relaxed">{row.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Restaurant Options */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">ร้านอาหารใน DisneySea</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">แนะนำ + สำรอง ถ้าร้านหลักคิวยาว</p>
              <div className="space-y-4">
                {/* Lunch */}
                <div>
                  <p className="text-[14px] font-semibold text-[#FF9F0A] mb-2.5">มื้อเที่ยง (โซน Mermaid Lagoon)</p>
                  <div className="space-y-2.5">
                    {[
                      { name: "Sebastian's Calypso Kitchen", zone: "Mermaid Lagoon", icon: "🧜", desc: "พิซซ่าซีฟู้ด, แซนด์วิช, ขนมหวาน — เด็กๆ ชอบมาก", price: "~1,100-1,300 เยน", primary: true },
                      { name: "Casbah Food Court", zone: "Arabian Coast", icon: "🧞", desc: "แกงกะหรี่ไก่ + แป้งนาน — ที่นั่งเยอะ แอร์เย็น เด็กชอบฉีกนานจิ้มแกง", price: "~1,100-1,300 เยน", primary: false },
                      { name: "Yucatan Base Camp Grill", zone: "Lost River Delta", icon: "⛺", desc: "ไก่รมควันชิ้นใหญ่ / สเต็กหมู — เน้นโปรตีน สำหรับสายกินจุ", price: "~1,600-2,000 เยน", primary: false },
                    ].map((r, i) => (
                      <div key={r.name} className={`rounded-[12px] border p-4 ${r.primary ? "border-[#FF9F0A]/40 bg-[#FF9F0A]/12" : "border-[var(--c-sep)] bg-[var(--c-subtle-card)]"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[16px]">{r.icon}</span>
                          <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                          {r.primary && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/22 text-[#FF9F0A]">แนะนำ</span>}
                          {!r.primary && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--c-fill-2)] text-[var(--c-text-2)]">สำรอง {i}</span>}
                        </div>
                        <p className="text-[12px] text-[var(--c-text-2)]">{r.zone} &middot; {r.price}</p>
                        <p className="text-[13px] text-[var(--c-text-2)] mt-1">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Dinner */}
                <div>
                  <p className="text-[14px] font-semibold text-[#FF9F0A] mb-2.5">มื้อเย็น (โซน Mediterranean / American)</p>
                  <div className="space-y-2.5">
                    {[
                      { name: "Zambini Brothers' Ristorante", zone: "Mediterranean Harbor", icon: "🍝", desc: "พาสต้า/พิซซ่า ร้านใหญ่ อยู่ใกล้จุดดูโชว์ Believe!", price: "~1,500-2,200 เยน", primary: true },
                      { name: "Dockside Diner", zone: "American Waterfront", icon: "🚢", desc: "ไก่ทอดกรอบ + เฟรนช์ฟรายส์ อยู่ใกล้ Toy Story Mania", price: "~1,200-1,500 เยน", primary: false },
                      { name: "Cafe Portofino", zone: "Mediterranean Harbor", icon: "🍗", desc: "ไก่ย่างหมุนครึ่งตัว หนังกรอบเนื้อนุ่ม + พาสต้าคาโบนาร่า", price: "~1,500-2,200 เยน", primary: false },
                    ].map((r, i) => (
                      <div key={r.name} className={`rounded-[12px] border p-4 ${r.primary ? "border-[#FF9F0A]/40 bg-[#FF9F0A]/12" : "border-[var(--c-sep)] bg-[var(--c-subtle-card)]"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[16px]">{r.icon}</span>
                          <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                          {r.primary && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/22 text-[#FF9F0A]">แนะนำ</span>}
                          {!r.primary && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--c-fill-2)] text-[var(--c-text-2)]">สำรอง {i}</span>}
                        </div>
                        <p className="text-[12px] text-[var(--c-text-2)]">{r.zone} &middot; {r.price}</p>
                        <p className="text-[13px] text-[var(--c-text-2)] mt-1">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Transport */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-4">การเดินทาง ไป-กลับ DisneySea</p>
              <div className="space-y-4">
                <div>
                  <p className="text-[13px] font-semibold text-[var(--c-accent)] mb-2">ขาไป (เลี่ยง Tokyo Station เพื่อรถเข็น)</p>
                  <div className="space-y-2">
                    {[
                      { step: "1", text: "Asakusabashi → Nishi-Funabashi", sub: "JR Chuo-Sobu Line (สีเหลือง)" },
                      { step: "2", text: "Nishi-Funabashi → Maihama", sub: "JR Musashino/Keiyo Line (สีแดง)" },
                      { step: "3", text: "Maihama → DisneySea", sub: "Disney Resort Monorail" },
                    ].map((s) => (
                      <div key={s.step} className="flex items-center gap-3 rounded-[10px] bg-[var(--c-subtle-card)] border border-[var(--c-sep)] px-4 py-2.5">
                        <span className="w-6 h-6 rounded-full bg-[var(--c-accent)]/10 text-[var(--c-accent)] text-[12px] font-bold flex items-center justify-center">{s.step}</span>
                        <div>
                          <p className="text-[14px] font-medium text-[var(--c-text)]">{s.text}</p>
                          <p className="text-[12px] text-[var(--c-text-2)]">{s.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--c-accent)] mb-2">ขากลับ (เส้นทางเดียวกัน กลับทาง)</p>
                  <div className="space-y-2">
                    {[
                      { step: "1", text: "DisneySea → Maihama", sub: "Disney Resort Line" },
                      { step: "2", text: "Maihama → Nishi-Funabashi", sub: "JR Keiyo Line (สีแดง)" },
                      { step: "3", text: "Nishi-Funabashi → Asakusabashi", sub: "JR Chuo-Sobu Line (สีเหลือง)" },
                    ].map((s) => (
                      <div key={s.step} className="flex items-center gap-3 rounded-[10px] bg-[var(--c-subtle-card)] border border-[var(--c-sep)] px-4 py-2.5">
                        <span className="w-6 h-6 rounded-full bg-[var(--c-accent)]/10 text-[var(--c-accent)] text-[12px] font-bold flex items-center justify-center">{s.step}</span>
                        <div>
                          <p className="text-[14px] font-medium text-[var(--c-text)]">{s.text}</p>
                          <p className="text-[12px] text-[var(--c-text-2)]">{s.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-[16px] border border-[#30D158]/40 bg-[#30D158]/12 p-5">
              <p className="text-[16px] font-semibold text-[#30D158] mb-3">ทริค DisneySea</p>
              <div className="space-y-2.5">
                {[
                  { icon: "📱", text: "Mobile Order: กดสั่งอาหารในแอป Disney ล่วงหน้า 30 นาที → ถึงร้านกด \"I'm Here\" → รับอาหารได้เลย ไม่ต้องรอคิว" },
                  { icon: "🚂", text: "Electric Railway: เอารถเข็นขึ้นลิฟต์ไปชั้น 2 นั่งรถไฟข้ามฟาก ประหยัดแรงเดินมาก" },
                  { icon: "❄️", text: "Mermaid Lagoon: โซน Indoor แอร์เย็น ช่วงบ่าย 1-2 โมง ถ้าลูกง่วงให้นอนรถเข็นที่นี่ได้" },
                  { icon: "🎆", text: "Believe! Sea of Dreams: เช็คเวลาในแอปอีกที เพราะเวลาอาจปรับเปลี่ยนตามวัน" },
                  { icon: "⏰", text: "ตั้งนาฬิกาปลุก 10:00 น. เพื่อกด DPA ใบที่ 2 ครบ 1 ชม. หลังกดใบแรก" },
                  { icon: "🧳", text: "พับรถเข็น: เตรียมพร้อมสำหรับเครื่องเล่น บางจุดต้องจอดรถเข็นข้างนอก" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[16px]">{tip.icon}</span>
                    <p className="text-[14px] text-[var(--c-text)] leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : dayNumber === 4 ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="rounded-[18px] border border-[#FF453A]/40 bg-[#FF453A]/5 p-5 md:p-7">
              <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] leading-tight">Day 4: Asakusa &amp; Shibuya</p>
              <p className="text-[14px] mt-2 text-[var(--c-text-2)]">วันพุธ 4 มีนาคม 2026 — Sanrio &amp; Stationery Edition</p>
              <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "ช่วงเช้า", value: "วัดเซ็นโซจิ + ขนม", icon: "🏮" },
                  { label: "มื้อเด็ด", value: "เนื้อทอด Gyukatsu", icon: "🥩" },
                  { label: "ช่วงบ่าย", value: "Shibuya ช้อปปิ้ง", icon: "🛍️" },
                  { label: "ชาเขียว", value: "ไอติม 7 ระดับ!", icon: "🍵" },
                ].map((card) => (
                  <div key={card.label} className="rounded-[14px] border border-[#FF453A]/35 bg-[#FF453A]/8 p-4">
                    <span className="text-[20px]">{card.icon}</span>
                    <p className="text-[12px] text-[var(--c-text-2)] mt-2">{card.label}</p>
                    <p className="text-[14px] font-semibold text-[var(--c-text)] mt-0.5">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-5">ไทม์ไลน์ Day 4</p>
              <div className="relative space-y-0">
                {[
                  { time: "08:30", icon: "⛩️", title: "ถึง Sensoji (วัดเซ็นโซจิ) — โคมแดง Kaminarimon", note: "ถ่ายรูปกับโคมแดงยักษ์ที่ประตู Kaminarimon (雷門) — มาเช้าคนน้อย ถ่ายรูปสวย!", phase: "asakusa" as const, mapQuery: "Kaminarimon+Asakusa" },
                  { time: "08:45", icon: "🍘", title: "เดินถนน Nakamise ชิมขนม", note: "ซาลาเปาทอด (Kokonoe) / เซมเบ้ (Ichiban-ya) — อย่าเพิ่งอิ่ม!", phase: "asakusa" as const, mapQuery: "Nakamise+Street+Asakusa" },
                  { time: "09:30", icon: "🙏", title: "ไหว้พระที่วัดเซ็นโซจิ (Sensoji)", note: "ขอพรที่วัดเก่าแก่ที่สุดในโตเกียว — สร้างปี 645 อายุกว่า 1,300 ปี", phase: "asakusa" as const, mapQuery: "Sensoji+Temple+Asakusa" },
                  { time: "10:30", icon: "⏰", title: "ไปต่อคิวร้าน Asakusa Gyukatsu", note: "สำคัญ! ร้านเปิด 11:00 ไปรอ 10:30 จะได้คิวแรกๆ — อยู่ตรงข้ามวัด", phase: "food" as const, mapQuery: "Asakusa+Gyukatsu" },
                  { time: "11:00", icon: "🥩", title: "มื้อเที่ยง: Asakusa Gyukatsu", note: "เนื้อชุบแป้งทอด ย่างเนื้อบนหินร้อนๆ ฟินมาก!", phase: "food" as const },
                  { time: "12:00", icon: "🍵", title: "ช่วงเวลาแห่งชาเขียว", note: "เดินย่อยอาหาร ดูร้านชาเขียวด้านล่าง", phase: "food" as const },
                  { time: "12:45", icon: "🏯", title: "วัด Matsuchiyama Shoden (待乳山聖天)", note: "วัดหัวไชเท้าศักดิ์สิทธิ์! เดิน 10 นาทีจาก Sensoji — ขอพรเรื่องเงินทอง/ความอุดมสมบูรณ์ มีรูปหัวไชเท้าประดับทั่ววัด (ถ้าเดินไหวแวะได้)", phase: "asakusa" as const, mapQuery: "Matsuchiyama+Shoden+Asakusa" },
                  { time: "13:30", icon: "🚇", title: "นั่ง Ginza Line ยาวไป Shibuya", note: "จาก Asakusa ไป Shibuya ตรงไม่ต้องเปลี่ยน", phase: "travel" as const },
                  { time: "14:30", icon: "✏️", title: "Hands Shibuya", note: "เป้ EDC ให้พ่อ + เครื่องเขียน/DIY เน้นฟังก์ชันการใช้งาน", phase: "shibuya" as const, mapQuery: "Tokyu+Hands+Shibuya" },
                  { time: "15:30", icon: "🎮", title: "Shibuya Parco", note: "ชั้น 6: Jump Shop / Nintendo / Pokemon Center — ชั้น 2: Porter Exchange (เป้ EDC)", phase: "shibuya" as const, mapQuery: "Shibuya+Parco" },
                  { time: "16:30", icon: "📦", title: "MUJI Shibuya Seibu", note: "ของใช้มินิมอล ของแต่งบ้าน ขนม MUJI", phase: "shibuya" as const, mapQuery: "MUJI+Shibuya" },
                  { time: "17:00", icon: "📒", title: "LOFT Shibuya (สวรรค์เครื่องเขียน!)", note: "ปากกาเป็นล้านด้าม สมุดโน้ต สติ๊กเกอร์ Washi Tape — แม่+ลูกสาวเดินเพลินจนลืมเวลา", phase: "shibuya" as const, mapQuery: "LOFT+Shibuya" },
                  { time: "18:00", icon: "🍔", title: "มื้อเย็นใน Shibuya", note: "ดูตัวเลือกร้านด้านล่าง", phase: "food" as const },
                  { time: "19:30", icon: "🏨", title: "กลับโรงแรม ซักผ้า พักผ่อน", note: "เดินเล่นแถว รร. ได้อยู่", phase: "travel" as const },
                ].map((row, i, arr) => (
                  <div key={`${row.time}-${row.title}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[18px] shrink-0 ${
                        row.phase === "asakusa" ? "bg-[#FF453A]/18 ring-2 ring-[#FF453A]/30" :
                        row.phase === "food" ? "bg-[#FF9F0A]/18 ring-2 ring-[#FF9F0A]/30" :
                        row.phase === "shibuya" ? "bg-[#BF5AF2]/10 ring-2 ring-[#BF5AF2]/30" :
                        "bg-[var(--c-accent)]/10 ring-2 ring-[var(--c-accent)]/30"
                      }`}>
                        {row.icon}
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`w-[2px] flex-1 min-h-[20px] ${
                          row.phase === "asakusa" ? "bg-[#FF453A]/20" :
                          row.phase === "food" ? "bg-[#FF9F0A]/20" :
                          row.phase === "shibuya" ? "bg-[#BF5AF2]/20" :
                          "bg-[var(--c-sep)]"
                        }`} />
                      )}
                    </div>
                    <div className="pb-5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`text-[15px] font-bold ${
                          row.phase === "asakusa" ? "text-[#FF453A]" :
                          row.phase === "food" ? "text-[#FF9F0A]" :
                          row.phase === "shibuya" ? "text-[#BF5AF2]" :
                          "text-[var(--c-accent)]"
                        }`}>{row.time}</span>
                      </div>
                      <p className="text-[16px] font-semibold text-[var(--c-text)] mt-1 leading-tight">{row.title}</p>
                      <p className="text-[13px] text-[var(--c-text-2)] mt-1 leading-relaxed">{row.note}</p>
                      {"mapQuery" in row && row.mapQuery && (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${row.mapQuery}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                          เปิดแผนที่
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Green Tea Options */}
            <div className="rounded-[16px] border border-[#30D158]/40 bg-[#30D158]/12 p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">ช่วงเวลาแห่งชาเขียว (12:00-13:00)</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">เดินย่อยหลังกิน Gyukatsu ไปร้านชาเขียวใกล้ๆ วัด</p>
              <div className="space-y-2.5">
                {[
                  { name: "Suzukien Asakusa", tag: "ไอติมเข้มข้น", desc: "เจลาโต้ชาเขียวที่เข้มที่สุดในโลก 7 ระดับ! เดิน 5 นาทีจากวัด", icon: "🍦", mapQuery: "Suzukien+Asakusa" },
                  { name: "Kaminari Issa", tag: "เครื่องดื่ม/เครป", desc: "Latte ชาเขียวและขนมอร่อย นั่งสบายกว่า", icon: "☕", mapQuery: "Kaminari+Issa+Asakusa" },
                  { name: "Hatoya Asakusa", tag: "ชาแบบดั้งเดิม", desc: "ชาร้อนบรรยากาศญี่ปุ่นแท้ ~220 บาท", icon: "🍵", mapQuery: "Hatoya+Asakusa" },
                ].map((r) => (
                  <div key={r.name} className="rounded-[12px] border border-[#30D158]/25 bg-[#30D158]/12 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[16px]">{r.icon}</span>
                      <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#30D158]/15 text-[#30D158]">{r.tag}</span>
                    </div>
                    <p className="text-[13px] text-[var(--c-text-2)]">{r.desc}</p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${r.mapQuery}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      เปิดแผนที่
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Lunch Backup */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">มื้อเที่ยง Asakusa — ร้านสำรอง</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">ถ้า Gyukatsu คิวยาวเกิน ลองร้านเหล่านี้</p>
              <div className="space-y-2.5">
                {[
                  { name: "Torokeru Hamburger Steak Fukuyoshi", desc: "สเต็กเนื้อบดนุ่มละลาย ย่าน Kuramae", icon: "🍖", mapQuery: "Torokeru+Hamburger+Steak+Fukuyoshi+Asakusa+Kuramae" },
                  { name: "Tonkatsu Yutaka", desc: "หมูทอดร้านเก่าแก่ เดิน 5-7 นาที", icon: "🐷", mapQuery: "Tonkatsu+Yutaka+Asakusa" },
                  { name: "Unatoto Asakusa", desc: "ข้าวหน้าปลาไหล ราคาไม่แพง คุณภาพตามราคา", icon: "🐟", mapQuery: "Unatoto+Asakusa" },
                ].map((r) => (
                  <div key={r.name} className="rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[16px]">{r.icon}</span>
                      <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                    </div>
                    <p className="text-[13px] text-[var(--c-text-2)]">{r.desc}</p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${r.mapQuery}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      เปิดแผนที่
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Shibuya Parco Floor Guide */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">Shibuya Parco — แผนผังชั้น</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">เปิด 11:00 น. ฐานทัพพ่อ &amp; ลูก</p>
              <div className="space-y-2.5">
                {[
                  { floor: "ชั้น 6", who: "พ่อ & ลูก", color: "bg-[#BF5AF2]/10 text-[#BF5AF2] border-[#BF5AF2]/30", items: "Jump Shop / Nintendo / Pokemon Center" },
                  { floor: "ชั้น 2", who: "พ่อ", color: "bg-[#64D2FF]/18 text-[#64D2FF] border-[#64D2FF]/40", items: "Porter Exchange — ดูเป้ EDC" },
                  { floor: "ชั้น B1", who: "ทุกคน", color: "bg-[#FF9F0A]/18 text-[#FF9F0A] border-[#FF9F0A]/40", items: "Kiwamiya (แฮมเบิร์กหินร้อน) / Saryo Suisen (อุด้ง + มัทฉะ)" },
                ].map((f) => (
                  <div key={f.floor} className={`rounded-[12px] border ${f.color} p-4`}>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-[12px] font-bold ${f.color}`}>{f.floor}</span>
                      <span className="text-[14px] font-semibold text-[var(--c-text)]">{f.who}</span>
                    </div>
                    <p className="text-[13px] text-[var(--c-text-2)] leading-relaxed">{f.items}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dinner Options */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">มื้อเย็น Shibuya — ร้านน่าลอง</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">ร้านอยู่ในตึก/ใกล้ตึก หนีฝนได้ อร่อยชัวร์</p>
              <div className="space-y-2.5">
                {[
                  { name: "JB's TOKYO (MIYASHITA PARK)", desc: "แฮมเบอร์เกอร์เนื้อย่างบนเตาร้อน", icon: "🍔", tag: "แนะนำ", mapQuery: "JB's+TOKYO+MIYASHITA+PARK+Shibuya" },
                  { name: "Kiwamiya (Parco ชั้น B1)", desc: "แฮมเบิร์กเนื้อย่างบนหินร้อน เนื้อหวานฉ่ำ ย่างเองสนุก! (คิวอาจยาว)", icon: "🥩", tag: "", mapQuery: "Kiwamiya+Shibuya+Parco" },
                  { name: "Saryo Suisen (Parco ชั้น B1)", desc: "อุด้งเส้นสดนุ่ม + มองบลังค์มัทฉะเข้มข้น — เหมาะครอบครัว", icon: "🍜", tag: "", mapQuery: "Saryo+Suisen+Shibuya+Parco" },
                ].map((r) => (
                  <div key={r.name} className={`rounded-[12px] border p-4 ${r.tag ? "border-[#FF9F0A]/40 bg-[#FF9F0A]/12" : "border-[var(--c-sep)] bg-[var(--c-subtle-card)]"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[16px]">{r.icon}</span>
                      <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                      {r.tag && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/22 text-[#FF9F0A]">{r.tag}</span>}
                    </div>
                    <p className="text-[13px] text-[var(--c-text-2)]">{r.desc}</p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${r.mapQuery}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      เปิดแผนที่
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Transport */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-4">การเดินทางวันนี้</p>
              <div className="space-y-2.5">
                {[
                  { from: "Asakusabashi", to: "Shibuya", method: "JR เปลี่ยนที่ Akihabara → Ginza Line", cost: "ผู้ใหญ่ 230 x 2 + เด็ก 110 = 570 เยน" },
                  { from: "Shibuya", to: "Harajuku (ถ้าแวะ)", method: "Metro 1 สถานี", cost: "ผู้ใหญ่ 180 x 2 + เด็ก 90 = 450 เยน" },
                  { from: "Shibuya", to: "Asakusabashi", method: "JR Yamanote → เปลี่ยนที่ Akihabara", cost: "ผู้ใหญ่ 210 x 2 + เด็ก 100 = 520 เยน" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[10px] bg-[var(--c-subtle-card)] border border-[var(--c-sep)] px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[var(--c-text)]">{t.from} &rarr; {t.to}</p>
                      <p className="text-[12px] text-[var(--c-text-2)]">{t.method}</p>
                    </div>
                    <span className="text-[12px] font-semibold text-[var(--c-accent)] whitespace-nowrap text-right">{t.cost}</span>
                  </div>
                ))}
                <div className="rounded-[10px] bg-[var(--c-accent)]/8 border border-[var(--c-accent)]/20 px-4 py-3">
                  <p className="text-[14px] font-semibold text-[var(--c-text)]">รวมค่าเดินทางทั้งวัน</p>
                  <p className="text-[13px] text-[var(--c-accent)] font-bold">~1,910 เยน (ประมาณ 460 บาท)</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-[16px] border border-[#30D158]/40 bg-[#30D158]/12 p-5">
              <p className="text-[16px] font-semibold text-[#30D158] mb-3">ทริค Day 4</p>
              <div className="space-y-2.5">
                {[
                  { icon: "⏰", text: "Gyukatsu: ต้องไป 10:30! ร้านเปิด 11:00 ไปก่อนจะได้คิวแรกๆ กินเสร็จไว" },
                  { icon: "🍵", text: "Suzukien: ไอติมชาเขียว 7 ระดับ (No.7 เข้มสุด) ลองระดับ 5-6 ก่อนถ้ากลัวขม" },
                  { icon: "🏪", text: "LOFT + Hands + MUJI เปิด 11:00 น. ทั้งหมด — วางแผนลำดับไม่ให้รอเปล่า" },
                  { icon: "🧺", text: "กลับถึง รร. ยังมีเวลาซักผ้าและเดินเล่นแถวโรงแรมได้" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[16px]">{tip.icon}</span>
                    <p className="text-[14px] text-[var(--c-text)] leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : dayNumber === 5 ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="rounded-[18px] border border-[#30D158]/40 bg-[#30D158]/12 p-5 md:p-7">
              <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] leading-tight">Day 5: Kamakura</p>
              <p className="text-[14px] mt-2 text-[var(--c-text-2)]">วันพฤหัสบดี 5 มีนาคม 2026 — ตามรอยซีรีส์ &middot; ไข่ฟูฟ่อง &middot; พระใหญ่ &middot; ถนนขนม</p>
              <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "ธีม", value: "ตามรอยซีรีส์ & ทะเล", icon: "⛩️" },
                  { label: "โซน", value: "Kamakura & Hase", icon: "📍" },
                  { label: "ตั๋วพิเศษ", value: "Enoden Pass 800¥", icon: "🎫" },
                  { label: "มื้อเด็ด", value: "ไข่ฟูฟ่อง Yoridokoro", icon: "🍳" },
                ].map((card) => (
                  <div key={card.label} className="rounded-[14px] border border-[#30D158]/25 bg-[#30D158]/8 p-4">
                    <span className="text-[20px]">{card.icon}</span>
                    <p className="text-[12px] text-[var(--c-text-2)] mt-2">{card.label}</p>
                    <p className="text-[14px] font-semibold text-[var(--c-text)] mt-0.5">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-5">ไทม์ไลน์ Day 5</p>
              <div className="relative space-y-0">
                {[
                  { time: "08:30", icon: "🚃", title: "ออกจากโรงแรม นั่ง JR ไป Kamakura", note: "JR Yokosuka Line จาก Asakusabashi → Kamakura (~1.5 ชม.)", phase: "travel" as const },
                  { time: "10:00", icon: "🎫", title: "ถึงสถานี Kamakura — ซื้อ Enoden Pass", note: "ซื้อที่ตู้ขายตั๋วรถไฟสายสีเขียว (800 เยน) นั่งได้ทั้งวัน!", phase: "travel" as const },
                  { time: "10:15", icon: "🚋", title: "นั่ง Enoden ไปลง Inamuragasaki", note: "รถไฟสายวิวทะเลสุดคลาสสิก", phase: "travel" as const },
                  { time: "10:30", icon: "📝", title: "ภารกิจ \"จองโต๊ะ\" Cafe Yoridokoro", note: "เดิน 2 นาทีจากสถานี ลงชื่อจองคิวทันที! พนักงานอาจแจ้งรอ 1.5-2 ชม. แล้วแว๊บไปเที่ยวก่อน", phase: "food" as const, mapQuery: "Cafe+Yoridokoro+Inamuragasaki+Kamakura" },
                  { time: "10:45", icon: "🚋", title: "วาร์ปไป Hase ตามรอยซีรีส์", note: "นั่ง Enoden จาก Inamuragasaki ไป Hase (2 สถานี / 4 นาที)", phase: "series" as const },
                  { time: "11:00", icon: "⛩️", title: "Goryo Shrine — ศาลเจ้าโกเรียว", note: "จุดถ่ายรถไฟวิ่งผ่านหน้าเสาประตู (Unseen สุดๆ!) + Tanaka Barber Shop ร้านตัดผมฉากสำคัญ", phase: "series" as const, mapQuery: "Goryo+Shrine+Kamakura" },
                  { time: "12:10", icon: "🚋", title: "นั่งรถไฟจาก Hase กลับ Inamuragasaki", note: "ใช้ Enoden Pass นั่งวนได้ไม่จำกัด คุ้มแล้ว!", phase: "travel" as const },
                  { time: "12:30", icon: "🍳", title: "มื้อเที่ยง: Cafe Yoridokoro", note: "ตีไข่ขาวให้ฟูฟ่องกับลูกๆ + ถ่ายรูปคู่รถไฟวิ่งผ่านหน้าต่าง + ปลาแดดเดียวหอมๆ", phase: "food" as const },
                  { time: "13:45", icon: "🙏", title: "พระใหญ่ Kotoku-in (Great Buddha)", note: "นั่ง Enoden กลับไป Hase → เดินไปวัด ไหว้ขอพร ถ่ายรูป มุดเข้าตัวองค์พระ", phase: "temple" as const, mapQuery: "Kotoku-in+Great+Buddha+Kamakura" },
                  { time: "15:00", icon: "🍡", title: "ถนน Komachi-dori — ช้อปปิ้ง & ขนม", note: "นั่ง Enoden กลับสถานี Kamakura → เดินเข้าถนนขนมเลย!", phase: "shopping" as const, mapQuery: "Komachi-dori+Kamakura" },
                  { time: "17:00", icon: "🚃", title: "เดินทางกลับ JR Yokosuka Line", note: "ต้นสายที่ Kamakura ได้นั่งแน่นอน → ยิงยาวกลับ Asakusabashi", phase: "travel" as const },
                  { time: "18:30", icon: "🏨", title: "ถึงโรงแรม พักผ่อน", note: "ถึงก่อนค่ำ เด็กๆ ไม่เหนื่อยจนเกินไป พร้อมลุยวันรุ่งขึ้น!", phase: "travel" as const },
                ].map((row, i, arr) => (
                  <div key={`${row.time}-${row.title}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[18px] shrink-0 ${
                        row.phase === "series" ? "bg-[#BF5AF2]/10 ring-2 ring-[#BF5AF2]/30" :
                        row.phase === "food" ? "bg-[#FF9F0A]/18 ring-2 ring-[#FF9F0A]/30" :
                        row.phase === "temple" ? "bg-[#30D158]/18 ring-2 ring-[#30D158]/30" :
                        row.phase === "shopping" ? "bg-[#FF6482]/18 ring-2 ring-[#FF6482]/30" :
                        "bg-[var(--c-accent)]/10 ring-2 ring-[var(--c-accent)]/30"
                      }`}>
                        {row.icon}
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`w-[2px] flex-1 min-h-[20px] ${
                          row.phase === "series" ? "bg-[#BF5AF2]/20" :
                          row.phase === "food" ? "bg-[#FF9F0A]/20" :
                          row.phase === "temple" ? "bg-[#30D158]/20" :
                          row.phase === "shopping" ? "bg-[#FF6482]/20" :
                          "bg-[var(--c-sep)]"
                        }`} />
                      )}
                    </div>
                    <div className="pb-5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`text-[15px] font-bold ${
                          row.phase === "series" ? "text-[#BF5AF2]" :
                          row.phase === "food" ? "text-[#FF9F0A]" :
                          row.phase === "temple" ? "text-[#30D158]" :
                          row.phase === "shopping" ? "text-[#FF6482]" :
                          "text-[var(--c-accent)]"
                        }`}>{row.time}</span>
                        {row.phase === "series" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#BF5AF2]/22 text-[#BF5AF2]">ตามรอยซีรีส์</span>
                        )}
                        {row.phase === "food" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/22 text-[#FF9F0A]">อาหาร</span>
                        )}
                      </div>
                      <p className="text-[16px] font-semibold text-[var(--c-text)] mt-1 leading-tight">{row.title}</p>
                      <p className="text-[13px] text-[var(--c-text-2)] mt-1 leading-relaxed">{row.note}</p>
                      {"mapQuery" in row && row.mapQuery && (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${row.mapQuery}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                          เปิดแผนที่
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Series Locations */}
            <div className="rounded-[16px] border border-[#BF5AF2]/30 bg-[#BF5AF2]/12 p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">จุดตามรอยซีรีส์ที่ Hase (10:45-12:10)</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">ใกล้สถานี Hase มาก เดินถ่ายรูปช้าๆ ฆ่าเวลาได้พอดีเป๊ะ</p>
              <div className="space-y-2.5">
                {[
                  { name: "Goryo Shrine (ศาลเจ้าโกเรียว)", desc: "ศาลเจ้าที่มีรถไฟวิ่งผ่านหน้าประตู — Unseen สุดๆ! จุดถ่ายรูปยอดฮิต", icon: "⛩️", mapQuery: "Goryo+Shrine+Kamakura" },
                  { name: "Tanaka Barber Shop", desc: "ร้านตัดผมฉากสำคัญ อยู่ติดกับศาลเจ้าเลย", icon: "💈", mapQuery: "Tanaka+Barber+Shop+Hase+Kamakura" },
                ].map((r) => (
                  <div key={r.name} className="rounded-[12px] border border-[#BF5AF2]/35 bg-[#BF5AF2]/12 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[16px]">{r.icon}</span>
                      <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                    </div>
                    <p className="text-[13px] text-[var(--c-text-2)]">{r.desc}</p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${r.mapQuery}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      เปิดแผนที่
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Komachi-dori Snacks */}
            <div className="rounded-[16px] border border-[#FF6482]/40 bg-[#FF6482]/5 p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">ถนน Komachi-dori — ตามล่าของหวาน (15:00-17:00)</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">เดินจากสถานี Kamakura เข้าถนนช้อปปิ้ง+ขนมเลย!</p>
              <div className="space-y-2.5">
                {[
                  { name: "Kamakura Chacha", desc: "ไอติมมัทฉะเข้มข้น เลือกระดับความเข้มได้!", icon: "🍦", mapQuery: "Kamakura+Chacha+Komachi" },
                  { name: "Giraffe Curry Pan", desc: "ขนมปังแกงกะหรี่ชีสยืดดด!", icon: "🍛", mapQuery: "Giraffe+Curry+Pan+Kamakura" },
                  { name: "Kamakura Mameya", desc: "ร้านถั่วหลากรส มีให้ชิมฟรีเยอะมาก ซื้อกลับเป็นของฝากได้", icon: "🥜", mapQuery: "Kamakura+Mameya" },
                  { name: "Sakura no Yumemiya", desc: "ดังโงะสีหวานๆ ถ่ายรูปสวย!", icon: "🍡", mapQuery: "Sakura+no+Yumemiya+Kamakura" },
                ].map((r) => (
                  <div key={r.name} className="rounded-[12px] border border-[#FF6482]/25 bg-[#FF6482]/5 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[16px]">{r.icon}</span>
                      <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                    </div>
                    <p className="text-[13px] text-[var(--c-text-2)]">{r.desc}</p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${r.mapQuery}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      เปิดแผนที่
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Transport */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-4">การเดินทางวันนี้</p>
              <div className="space-y-2.5">
                {[
                  { from: "Asakusabashi", to: "Kamakura", method: "JR Yokosuka Line (~1.5 ชม.)", cost: "~920 เยน/คน" },
                  { from: "Kamakura ↔ Hase ↔ Inamuragasaki", to: "นั่งวนทั้งวัน", method: "Enoden Pass (เหมาจ่าย)", cost: "800 เยน/คน" },
                  { from: "วัดพระใหญ่ Kotoku-in", to: "ค่าเข้าชม", method: "เข้าชม + มุดเข้าตัวองค์พระ", cost: "300 + 50 เยน" },
                  { from: "Kamakura", to: "Asakusabashi", method: "JR Yokosuka Line (ต้นสาย ได้นั่ง!)", cost: "~920 เยน/คน" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[10px] bg-[var(--c-subtle-card)] border border-[var(--c-sep)] px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[var(--c-text)]">{t.from} &rarr; {t.to}</p>
                      <p className="text-[12px] text-[var(--c-text-2)]">{t.method}</p>
                    </div>
                    <span className="text-[12px] font-semibold text-[var(--c-accent)] whitespace-nowrap text-right">{t.cost}</span>
                  </div>
                ))}
                <div className="rounded-[10px] bg-[var(--c-accent)]/8 border border-[var(--c-accent)]/20 px-4 py-3">
                  <p className="text-[14px] font-semibold text-[var(--c-text)]">รวมค่าใช้จ่ายทั้งวัน</p>
                  <p className="text-[13px] text-[var(--c-accent)] font-bold">~4,070 เยน (ประมาณ 970 บาท)</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-[16px] border border-[#30D158]/40 bg-[#30D158]/12 p-5">
              <p className="text-[16px] font-semibold text-[#30D158] mb-3">ทริค Day 5</p>
              <div className="space-y-2.5">
                {[
                  { icon: "📝", text: "Cafe Yoridokoro: ลงชื่อจองคิวก่อน แล้วแว๊บไปเที่ยวที่อื่น กลับมาพอดีเวลา!" },
                  { icon: "🎫", text: "Enoden Pass 800 เยน คุ้มมาก! นั่งวนไปมา Kamakura ↔ Hase ↔ Inamuragasaki ได้ไม่จำกัด" },
                  { icon: "📸", text: "Goryo Shrine: รอจังหวะรถไฟวิ่งผ่านหน้าเสาประตู ถ่ายรูปได้มุมสุด Unseen" },
                  { icon: "🚃", text: "ขากลับ: JR Yokosuka Line ต้นสายที่ Kamakura ได้นั่งแน่นอน ไม่ต้องยืน" },
                  { icon: "🍡", text: "Komachi-dori: อย่ากินอิ่มมาก! เพราะร้านขนมเยอะมาก เดินชิมไปเรื่อยๆ" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[16px]">{tip.icon}</span>
                    <p className="text-[14px] text-[var(--c-text)] leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : dayNumber === 6 ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="rounded-[18px] border border-[#64D2FF]/40 bg-[#64D2FF]/5 p-5 md:p-7">
              <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] leading-tight">Day 6: Fuji Kawaguchiko</p>
              <p className="text-[14px] mt-2 text-[var(--c-text-2)]">วันศุกร์ 6 มีนาคม 2026 — รถบัส &middot; กระเช้าชมวิว &middot; Oishi Park &middot; ภูเขาไฟฟูจิ</p>
              <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "ธีม", value: "ภูเขาไฟฟูจิ", icon: "🗻" },
                  { label: "การเดินทาง", value: "รถบัส ~2 ชม.", icon: "🚌" },
                  { label: "ไฮไลท์", value: "กระเช้า + Oishi Park", icon: "🚠" },
                  { label: "มื้อเด็ด", value: "โฮโต + เทมปุระยักษ์", icon: "🍜" },
                ].map((card) => (
                  <div key={card.label} className="rounded-[14px] border border-[#64D2FF]/25 bg-[#64D2FF]/8 p-4">
                    <span className="text-[20px]">{card.icon}</span>
                    <p className="text-[12px] text-[var(--c-text-2)] mt-2">{card.label}</p>
                    <p className="text-[14px] font-semibold text-[var(--c-text)] mt-0.5">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-5">ไทม์ไลน์ Day 6</p>
              <div className="relative space-y-0">
                {[
                  { time: "07:30", icon: "🏨", title: "ออกจากโรงแรม", note: "นั่ง JR ไป Akihabara → เดินไปทางออก East Exit (Central Gate)", phase: "travel" as const },
                  { time: "07:45", icon: "🚏", title: "ถึงจุดขึ้นรถบัส Traffic Plaza", note: "มองหาป้ายรถบัส \"Kawaguchiko\" ที่ East Exit / ซื้อข้าวปั้นตุนไว้ทานบนรถ", phase: "travel" as const, mapQuery: "Akihabara+Station+East+Exit" },
                  { time: "08:00", icon: "🚌", title: "ขึ้น Highway Bus มุ่งหน้า Kawaguchiko", note: "จองฝั่งซ้าย (หลังคนขับ) จะเห็นวิวฟูจิระหว่างทาง! ให้เด็กๆ นอนเก็บแรง 2 ชม.", phase: "travel" as const },
                  { time: "10:20", icon: "🗻", title: "ถึงสถานี Kawaguchiko", note: "เข้าห้องน้ำที่สถานีให้เรียบร้อย (สะอาด แต่คนเยอะหน่อย)", phase: "fuji" as const },
                  { time: "10:40", icon: "🚌", title: "ขึ้นรถเมล์ Red Line ไปกระเช้า", note: "ใช้ IC Card แตะจ่ายตอนลง → ลงป้ายหมายเลข 9 (Ropeway Ent.)", phase: "fuji" as const },
                  { time: "11:00", icon: "🚠", title: "Kachi Kachi Ropeway — กระเช้าชมวิว", note: "กระเช้าลอยฟ้า วิวพาโนรามา! ด้านบน: ไหว้ศาลเจ้ากระต่าย + สั่นระฆังแห่งความรัก", phase: "fuji" as const, mapQuery: "Kachi+Kachi+Ropeway+Kawaguchiko" },
                  { time: "12:30", icon: "🍜", title: "มื้อเที่ยง (ดูตัวเลือกด้านล่าง)", note: "ลงจากกระเช้า แวะซื้อ Fujiyama Cookie เป็นของฝาก แล้วทานมื้อเที่ยง", phase: "food" as const },
                  { time: "13:30", icon: "🌷", title: "Oishi Park — จุดไฮไลท์!", note: "นั่ง Red Line ไปป้าย 20 เห็นฟูจิสวยที่สุด ไม่มีสายไฟบัง + ไอติม Blueberry + ปล่อยลูกวิ่งเล่นริมทะเลสาบ", phase: "fuji" as const, mapQuery: "Oishi+Park+Kawaguchiko" },
                  { time: "15:00", icon: "🚌", title: "รถ Red Line กลับสถานี", note: "ต้องมารอรถกลับแล้ว! เผื่อเวลารถมาช้าและรถติด", phase: "travel" as const },
                  { time: "15:45", icon: "🍝", title: "มื้อเย็นหน้าสถานี Kawaguchiko", note: "ข้ามถนนไปฝั่งตรงข้ามสถานี ดูร้านอร่อยด้านล่าง", phase: "food" as const },
                  { time: "17:00", icon: "🚌", title: "รถบัสกลับ Tokyo", note: "จากสถานี Kawaguchiko กลับ Akihabara (~2 ชม.)", phase: "travel" as const },
                  { time: "19:00", icon: "🏨", title: "ถึง Akihabara → กลับโรงแรม", note: "พักผ่อนทันที เตรียมตัวลุยวันสุดท้ายพรุ่งนี้!", phase: "travel" as const },
                ].map((row, i, arr) => (
                  <div key={`${row.time}-${row.title}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[18px] shrink-0 ${
                        row.phase === "fuji" ? "bg-[#64D2FF]/18 ring-2 ring-[#64D2FF]/30" :
                        row.phase === "food" ? "bg-[#FF9F0A]/18 ring-2 ring-[#FF9F0A]/30" :
                        "bg-[var(--c-accent)]/10 ring-2 ring-[var(--c-accent)]/30"
                      }`}>
                        {row.icon}
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`w-[2px] flex-1 min-h-[20px] ${
                          row.phase === "fuji" ? "bg-[#64D2FF]/20" :
                          row.phase === "food" ? "bg-[#FF9F0A]/20" :
                          "bg-[var(--c-sep)]"
                        }`} />
                      )}
                    </div>
                    <div className="pb-5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`text-[15px] font-bold ${
                          row.phase === "fuji" ? "text-[#64D2FF]" :
                          row.phase === "food" ? "text-[#FF9F0A]" :
                          "text-[var(--c-accent)]"
                        }`}>{row.time}</span>
                        {row.phase === "food" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/22 text-[#FF9F0A]">อาหาร</span>
                        )}
                      </div>
                      <p className="text-[16px] font-semibold text-[var(--c-text)] mt-1 leading-tight">{row.title}</p>
                      <p className="text-[13px] text-[var(--c-text-2)] mt-1 leading-relaxed">{row.note}</p>
                      {"mapQuery" in row && row.mapQuery && (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${row.mapQuery}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                          เปิดแผนที่
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ropeway Details */}
            <div className="rounded-[16px] border border-[#64D2FF]/40 bg-[#64D2FF]/5 p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">Kachi Kachi Ropeway — กระเช้าชมวิว</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">ขึ้นกระเช้าดูวิวพาโนรามาฟูจิ + ของกิน</p>
              <div className="space-y-2.5">
                {[
                  { icon: "🚠", title: "กระเช้าลอยฟ้า", desc: "วิวพาโนรามาทะเลสาบ + ภูเขาไฟฟูจิ เด็กๆ ชอบมาก" },
                  { icon: "🐰", title: "ศาลเจ้ากระต่าย", desc: "ด้านบนกระเช้า ไหว้ขอพร + ถ่ายรูป" },
                  { icon: "🔔", title: "ระฆังแห่งความรัก (Tenjo Bell)", desc: "สั่นระฆังคู่ ถ่ายรูปวิวหลังสวย" },
                  { icon: "🍡", title: "ดังโงะย่าง", desc: "ไม้ละ 400 เยน หรือ Tanuki Dango รูปการ์ตูน กินไปดูวิวไป" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-[12px] border border-[#64D2FF]/20 bg-[#64D2FF]/5 p-4">
                    <span className="text-[20px]">{item.icon}</span>
                    <div>
                      <p className="text-[14px] font-semibold text-[var(--c-text)]">{item.title}</p>
                      <p className="text-[13px] text-[var(--c-text-2)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-[10px] bg-[#FF453A]/18 border border-[#FF453A]/35 px-3.5 py-2.5 mt-3">
                <p className="text-[13px] text-[#FF453A] font-medium">แผนสำรอง: ถ้าคิวรอกระเช้ายาวเกิน 40 นาที &rarr; ตัดออก! ข้ามไป Oishi Park เลย</p>
              </div>
            </div>

            {/* Lunch Options */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">มื้อเที่ยง — ร้านจัดอันดับ</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">เรียงตามความสะดวกเส้นทาง</p>
              <div className="space-y-2.5">
                {[
                  { rank: "1", name: "Koubaiya (สาขา Oishi Park)", desc: "ตั้งอยู่ที่ Oishi Park ป้ายรถเมล์ No.20 จุดหมายต่อไปของเราพอดี! นั่ง Red Line จากกระเช้า (ป้าย 9) ยิงยาวมาลงทีเดียว", icon: "🥇", mapQuery: "Koubaiya+Oishi+Park+Kawaguchiko", color: "border-[#FF9F0A]/40 bg-[#FF9F0A]/12" },
                  { rank: "2", name: "Momijitei (โมมิจิเท)", desc: "อยู่ป้าย No.19 ก่อนถึง Oishi Park แค่ป้ายเดียว ทานเสร็จเดินไป Oishi Park ได้ (500-600 ม.)", icon: "🥈", mapQuery: "Momijitei+Kawaguchiko", color: "border-[var(--c-sep)] bg-[var(--c-subtle-card)]" },
                  { rank: "3", name: "Houtou Fudou (โดมขาว)", desc: "ดังโฮโตหม้อร้อน อยู่ป้าย No.17 ใกล้กระเช้าสุด แต่ทานเสร็จต้องรอรถบัสอีกรอบไป Oishi Park", icon: "🥉", mapQuery: "Houtou+Fudou+Kawaguchiko", color: "border-[var(--c-sep)] bg-[var(--c-subtle-card)]" },
                ].map((r) => (
                  <div key={r.name} className={`rounded-[12px] border p-4 ${r.color}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[18px]">{r.icon}</span>
                      <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                    </div>
                    <p className="text-[13px] text-[var(--c-text-2)]">{r.desc}</p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${r.mapQuery}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      เปิดแผนที่
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Dinner Options */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">มื้อเย็น — ร้านหน้าสถานี Kawaguchiko</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">ข้ามถนนฝั่งตรงข้ามสถานี ทานก่อนขึ้นรถกลับ</p>
              <div className="space-y-2.5">
                {[
                  { name: "Entaku", desc: "บ้านไม้ญี่ปุ่นโบราณ เทมปุระ & โซบะ บรรยากาศดี", icon: "🏡", tag: "แนะนำ", mapQuery: "Entaku+Kawaguchiko" },
                  { name: "Houtou Fudou (สาขาหน้าสถานี)", desc: "ร้านสีขาว ดังโฮโตหม้อร้อน (ถ้ายังไม่ได้ทานตอนเที่ยง)", icon: "🍲", tag: "", mapQuery: "Houtou+Fudou+Kawaguchiko+Station" },
                  { name: "Hirai", desc: "ร้านที่มีกุ้งเทมปุระยักษ์!", icon: "🦐", tag: "", mapQuery: "Hirai+Kawaguchiko" },
                ].map((r) => (
                  <div key={r.name} className={`rounded-[12px] border p-4 ${r.tag ? "border-[#FF9F0A]/40 bg-[#FF9F0A]/12" : "border-[var(--c-sep)] bg-[var(--c-subtle-card)]"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[16px]">{r.icon}</span>
                      <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                      {r.tag && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/22 text-[#FF9F0A]">{r.tag}</span>}
                    </div>
                    <p className="text-[13px] text-[var(--c-text-2)]">{r.desc}</p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${r.mapQuery}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      เปิดแผนที่
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Transport */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-4">การเดินทางวันนี้</p>
              <div className="space-y-2.5">
                {[
                  { from: "โรงแรม", to: "Akihabara", method: "JR Chuo-Sobu (1 สถานี)", cost: "~150 เยน/คน" },
                  { from: "Akihabara", to: "Kawaguchiko", method: "Highway Bus (~2 ชม.)", cost: "~2,200 เยน/คน" },
                  { from: "สถานี Kawaguchiko", to: "รอบทะเลสาบ", method: "Red Line Bus (IC Card)", cost: "~600 เยน/คน" },
                  { from: "กระเช้า Ropeway", to: "ไป-กลับ", method: "Kachi Kachi Ropeway", cost: "~900 เยน/คน" },
                  { from: "Kawaguchiko", to: "Akihabara", method: "Highway Bus (~2 ชม.)", cost: "~2,200 เยน/คน" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[10px] bg-[var(--c-subtle-card)] border border-[var(--c-sep)] px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[var(--c-text)]">{t.from} &rarr; {t.to}</p>
                      <p className="text-[12px] text-[var(--c-text-2)]">{t.method}</p>
                    </div>
                    <span className="text-[12px] font-semibold text-[var(--c-accent)] whitespace-nowrap text-right">{t.cost}</span>
                  </div>
                ))}
                <div className="rounded-[10px] bg-[var(--c-accent)]/8 border border-[var(--c-accent)]/20 px-4 py-3">
                  <p className="text-[14px] font-semibold text-[var(--c-text)]">รวมค่าใช้จ่ายทั้งวัน</p>
                  <p className="text-[13px] text-[var(--c-accent)] font-bold">~6,720 เยน (ประมาณ 1,600 บาท)</p>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-[16px] border border-[#FF453A]/40 bg-[#FF453A]/5 p-4 md:p-6">
              <p className="text-[16px] font-semibold text-[#FF453A] mb-3">Checklist วันนี้</p>
              <div className="space-y-2.5">
                {[
                  { icon: "🧥", text: "เสื้อกันหนาว: ลมที่ทะเลสาบและบนยอดเขากระเช้าแรงมาก อย่าลืมรูดซิปให้ลูกให้มิดชิด" },
                  { icon: "👶", text: "พับรถเข็น: ตอนขึ้นรถบัส Red Line คนอาจจะแน่น เตรียมพับรถเข็นให้คล่อง" },
                  { icon: "🎫", text: "ตั๋วขากลับ: เก็บตั๋วรถบัสขากลับไว้ให้ดี อย่าทำหาย!" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[16px]">{item.icon}</span>
                    <p className="text-[14px] text-[var(--c-text)] leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-[16px] border border-[#30D158]/40 bg-[#30D158]/12 p-5">
              <p className="text-[16px] font-semibold text-[#30D158] mb-3">ทริค Day 6</p>
              <div className="space-y-2.5">
                {[
                  { icon: "🚌", text: "จองรถบัสรอบเช้าล่วงหน้า! นั่งฝั่งซ้ายจะเห็นวิวฟูจิระหว่างทาง" },
                  { icon: "⏱️", text: "กระเช้า: ถ้าคิวเกิน 40 นาที ข้ามไป Oishi Park เลย ไม่ต้องเสียเวลารอ" },
                  { icon: "🍦", text: "Oishi Park: ต้องกิน Soft Cream รส Blueberry ของดีประจำสวน!" },
                  { icon: "🍪", text: "Fujiyama Cookie: ซื้อคุกกี้รูปภูเขาฟูจิเป็นของฝาก อยู่ตีนเขากระเช้า" },
                  { icon: "🕐", text: "15:00 ต้องเริ่มกลับ! เผื่อเวลารถบัสกลับ อย่าดื่มด่ำจนลืมเวลา" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[16px]">{tip.icon}</span>
                    <p className="text-[14px] text-[var(--c-text)] leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : dayNumber === 7 ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="rounded-[18px] border border-[#FF9F0A]/40 bg-[#FF9F0A]/12 p-5 md:p-7">
              <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] leading-tight">Day 7: Kawagoe &amp; Ginza</p>
              <p className="text-[14px] mt-2 text-[var(--c-text-2)]">วันเสาร์ 7 มีนาคม 2026 — เมืองเก่า Little Edo &middot; Ginza ถนนปิด &middot; Tokyo Station ส่งท้าย</p>
              <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "ช่วงเช้า", value: "Kawagoe เมืองเก่า", icon: "🏯" },
                  { label: "ช่วงบ่าย", value: "Ginza ถนนปิด!", icon: "🛍️" },
                  { label: "ช่วงเย็น", value: "Tokyo Station", icon: "🚄" },
                  { label: "มื้อเด็ด", value: "Ramen Street", icon: "🍜" },
                ].map((card) => (
                  <div key={card.label} className="rounded-[14px] border border-[#FF9F0A]/25 bg-[#FF9F0A]/8 p-4">
                    <span className="text-[20px]">{card.icon}</span>
                    <p className="text-[12px] text-[var(--c-text-2)] mt-2">{card.label}</p>
                    <p className="text-[14px] font-semibold text-[var(--c-text)] mt-0.5">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-5">ไทม์ไลน์ Day 7</p>
              <div className="relative space-y-0">
                {[
                  { time: "09:00", icon: "🚃", title: "มุ่งหน้า Kawagoe", note: "JR ไป Ikebukuro → ต่อ Tobu Tojo Line ไป Kawagoe", phase: "travel" as const },
                  { time: "10:00", icon: "🚌", title: "ถึง Kawagoe นั่งรถเมล์เข้าเมืองเก่า", note: "ลงป้าย \"Ichibangai\" หรือ \"Kura no machi\"", phase: "kawagoe" as const },
                  { time: "10:30", icon: "🏯", title: "เดินเล่นเมืองเก่า Little Edo", note: "ถ่ายรูปกับหอระฆัง Toki no Kane + เดินชมตึกโกดังเก่า", phase: "kawagoe" as const, mapQuery: "Toki+no+Kane+Kawagoe" },
                  { time: "11:00", icon: "🍠", title: "ตามล่าของกิน Kawagoe", note: "Koedo Osatsuan มันหวานทอดแผ่นยาว + Candy Alley ขนมแท่งยาว + Kawagoe Pudding", phase: "food" as const },
                  { time: "13:00", icon: "🚃", title: "นั่งรถไฟกลับเข้าโตเกียว", note: "มุ่งหน้า Ginza (เปลี่ยนที่ Ikebukuro → Marunouchi Line)", phase: "travel" as const },
                  { time: "14:30", icon: "🛣️", title: "Ginza Pedestrian Paradise!", note: "ถนนปิดทุกเสาร์! เดินถ่ายรูปกลางถนนกับลูกๆ สนุกมาก", phase: "ginza" as const, mapQuery: "Ginza+Pedestrian+Paradise+Chuo+Dori" },
                  { time: "15:00", icon: "🍵", title: "Senchado Tokyo — ซื้อชาเขียว", note: "ตาม List แม่ แวะซื้อชาเขียวคุณภาพดี", phase: "ginza" as const, mapQuery: "Senchado+Tokyo+Ginza" },
                  { time: "15:30", icon: "✏️", title: "Itoya — ร้านเครื่องเขียนตึกแดง", note: "เดินดูปากกา/กระดาษ ร้านเครื่องเขียนตำนานของ Ginza", phase: "ginza" as const, mapQuery: "Itoya+Ginza" },
                  { time: "16:15", icon: "🚶", title: "เดินไป Tokyo Station", note: "เดิน หรือนั่งรถไฟ 1 สถานี ไปฝั่ง Yaesu", phase: "travel" as const },
                  { time: "16:30", icon: "🚂", title: "Tomica Shop & Plarail Shop", note: "Tokyo Station First Avenue ชั้น B1 ฝั่ง Yaesu — ให้ลูกชายเลือกซื้อรถไฟ/ต่อรางเล่น", phase: "tokyo" as const, mapQuery: "Tokyo+Character+Street+First+Avenue" },
                  { time: "18:00", icon: "🍜", title: "มื้อเย็นส่งท้ายทริป!", note: "Tokyo Ramen Street (B1) หรือขึ้นชั้น 12-13 ห้าง Daimaru", phase: "food" as const, mapQuery: "Tokyo+Ramen+Street+Tokyo+Station" },
                  { time: "19:30", icon: "🏨", title: "กลับโรงแรม — คืนสุดท้าย", note: "เก็บของ แพ็คกระเป๋า เตรียมตัว Check-out พรุ่งนี้เช้า!", phase: "travel" as const },
                ].map((row, i, arr) => (
                  <div key={`${row.time}-${row.title}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[18px] shrink-0 ${
                        row.phase === "kawagoe" ? "bg-[#FF9F0A]/18 ring-2 ring-[#FF9F0A]/30" :
                        row.phase === "ginza" ? "bg-[#BF5AF2]/10 ring-2 ring-[#BF5AF2]/30" :
                        row.phase === "tokyo" ? "bg-[#FF453A]/18 ring-2 ring-[#FF453A]/30" :
                        row.phase === "food" ? "bg-[#FF6482]/18 ring-2 ring-[#FF6482]/30" :
                        "bg-[var(--c-accent)]/10 ring-2 ring-[var(--c-accent)]/30"
                      }`}>
                        {row.icon}
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`w-[2px] flex-1 min-h-[20px] ${
                          row.phase === "kawagoe" ? "bg-[#FF9F0A]/20" :
                          row.phase === "ginza" ? "bg-[#BF5AF2]/20" :
                          row.phase === "tokyo" ? "bg-[#FF453A]/20" :
                          row.phase === "food" ? "bg-[#FF6482]/20" :
                          "bg-[var(--c-sep)]"
                        }`} />
                      )}
                    </div>
                    <div className="pb-5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`text-[15px] font-bold ${
                          row.phase === "kawagoe" ? "text-[#FF9F0A]" :
                          row.phase === "ginza" ? "text-[#BF5AF2]" :
                          row.phase === "tokyo" ? "text-[#FF453A]" :
                          row.phase === "food" ? "text-[#FF6482]" :
                          "text-[var(--c-accent)]"
                        }`}>{row.time}</span>
                        {row.phase === "kawagoe" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/22 text-[#FF9F0A]">Kawagoe</span>
                        )}
                        {row.phase === "ginza" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#BF5AF2]/22 text-[#BF5AF2]">Ginza</span>
                        )}
                        {row.phase === "tokyo" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF453A]/15 text-[#FF453A]">Tokyo Sta.</span>
                        )}
                        {row.phase === "food" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6482]/15 text-[#FF6482]">อาหาร</span>
                        )}
                      </div>
                      <p className="text-[16px] font-semibold text-[var(--c-text)] mt-1 leading-tight">{row.title}</p>
                      <p className="text-[13px] text-[var(--c-text-2)] mt-1 leading-relaxed">{row.note}</p>
                      {"mapQuery" in row && row.mapQuery && (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${row.mapQuery}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                          เปิดแผนที่
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kawagoe Snacks */}
            <div className="rounded-[16px] border border-[#FF9F0A]/40 bg-[#FF9F0A]/12 p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">ของกิน Kawagoe — ตามล่ามันหวาน!</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">Kawagoe ขึ้นชื่อเรื่องมันหวาน (Sweet Potato) ทุกร้านมีเมนูมันหวาน!</p>
              <div className="space-y-2.5">
                {[
                  { name: "Koedo Osatsuan", desc: "มันหวานทอดแผ่นยาว (Osatsu Chips) กรอบๆ หวานๆ!", icon: "🍠", tag: "ต้องลอง!", mapQuery: "Koedo+Osatsuan+Kawagoe" },
                  { name: "Candy Alley (Kashiya Yokocho)", desc: "ซอยขนมโบราณ! ซื้อขนมแท่งยาว Fugashi ที่ร้าน Matsuriku", icon: "🍭", tag: "", mapQuery: "Kashiya+Yokocho+Candy+Alley+Kawagoe" },
                  { name: "Kawagoe Pudding", desc: "พุดดิ้งมันหวาน ซื้อกลับบ้านเป็นของฝากได้!", icon: "🍮", tag: "", mapQuery: "Kawagoe+Pudding" },
                ].map((r) => (
                  <div key={r.name} className={`rounded-[12px] border p-4 ${r.tag ? "border-[#FF9F0A]/40 bg-[#FF9F0A]/12" : "border-[var(--c-sep)] bg-[var(--c-subtle-card)]"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[16px]">{r.icon}</span>
                      <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                      {r.tag && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/22 text-[#FF9F0A]">{r.tag}</span>}
                    </div>
                    <p className="text-[13px] text-[var(--c-text-2)]">{r.desc}</p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${r.mapQuery}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      เปิดแผนที่
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Ginza Spots */}
            <div className="rounded-[16px] border border-[#BF5AF2]/30 bg-[#BF5AF2]/12 p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">Ginza Pedestrian Paradise (14:30-16:15)</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">ทุกวันเสาร์ถนน Chuo-dori ปิด! เดินถ่ายรูปกลางถนนได้</p>
              <div className="space-y-2.5">
                {[
                  { name: "ถนนปิด Chuo-dori", desc: "เดินกลางถนนกับลูกๆ ถ่ายรูปสนุก! ไม่มีรถเลย", icon: "📸", mapQuery: "Ginza+Chuo+Dori" },
                  { name: "Senchado Tokyo", desc: "ร้านชาเขียวคุณภาพดี ตาม List แม่", icon: "🍵", mapQuery: "Senchado+Tokyo+Ginza" },
                  { name: "Itoya (ตึกแดง)", desc: "ร้านเครื่องเขียนตำนานของ Ginza! ปากกา กระดาษ เครื่องเขียนสวยๆ ครบทุกชั้น", icon: "✏️", mapQuery: "Itoya+Ginza" },
                ].map((r) => (
                  <div key={r.name} className="rounded-[12px] border border-[#BF5AF2]/35 bg-[#BF5AF2]/12 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[16px]">{r.icon}</span>
                      <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                    </div>
                    <p className="text-[13px] text-[var(--c-text-2)]">{r.desc}</p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${r.mapQuery}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      เปิดแผนที่
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Tokyo Station */}
            <div className="rounded-[16px] border border-[#FF453A]/40 bg-[#FF453A]/5 p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">Tokyo Station — ส่งท้ายทริป (16:30-19:30)</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">First Avenue ชั้น B1 ฝั่ง Yaesu — สวรรค์ของเล่น + ราเมน</p>
              <div className="space-y-2.5">
                {[
                  { name: "Tomica Shop", desc: "ให้ลูกชายเลือกซื้อรถไฟ/ต่อรางเล่น ของที่นี่มี Limited Edition!", icon: "🚂", tag: "ลูกชาย", mapQuery: "Tomica+Shop+Tokyo+Station+First+Avenue" },
                  { name: "Plarail Shop", desc: "ร้านรางรถไฟ Plarail ใหญ่ที่สุด ลองเล่นได้!", icon: "🛤️", tag: "ลูกชาย", mapQuery: "Plarail+Shop+Tokyo+Station" },
                  { name: "Tokyo Ramen Street", desc: "รวมร้านราเมนดังจากทั่วญี่ปุ่น 8 ร้าน เลือกสายที่ชอบได้เลย", icon: "🍜", tag: "มื้อเย็น", mapQuery: "Tokyo+Ramen+Street" },
                  { name: "Daimaru ชั้น 12-13", desc: "ทางเลือกมื้อเย็น ร้านอาหารหลากสไตล์ในห้างติดสถานี", icon: "🏬", tag: "มื้อเย็น", mapQuery: "Daimaru+Tokyo+Station" },
                ].map((r) => (
                  <div key={r.name} className="rounded-[12px] border border-[#FF453A]/20 bg-[#FF453A]/5 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[16px]">{r.icon}</span>
                      <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.tag === "มื้อเย็น" ? "bg-[#FF9F0A]/22 text-[#FF9F0A]" : "bg-[#FF453A]/15 text-[#FF453A]"
                      }`}>{r.tag}</span>
                    </div>
                    <p className="text-[13px] text-[var(--c-text-2)]">{r.desc}</p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${r.mapQuery}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      เปิดแผนที่
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Transport */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-4">การเดินทางวันนี้</p>
              <div className="space-y-2.5">
                {[
                  { from: "Asakusabashi", to: "Ikebukuro", method: "JR Chuo-Sobu → Yamanote", cost: "~210 เยน/คน" },
                  { from: "Ikebukuro", to: "Kawagoe", method: "Tobu Tojo Line (~30 นาที)", cost: "~480 เยน/คน" },
                  { from: "Kawagoe", to: "Ginza", method: "Tobu → Ikebukuro → Marunouchi Line", cost: "~650 เยน/คน" },
                  { from: "Ginza", to: "Tokyo Station", method: "เดิน หรือ Marunouchi Line 1 สถานี", cost: "ฟรี (เดิน)" },
                  { from: "Tokyo Station", to: "Asakusabashi", method: "JR Chuo-Sobu (เปลี่ยนที่ Akihabara)", cost: "~170 เยน/คน" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[10px] bg-[var(--c-subtle-card)] border border-[var(--c-sep)] px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[var(--c-text)]">{t.from} &rarr; {t.to}</p>
                      <p className="text-[12px] text-[var(--c-text-2)]">{t.method}</p>
                    </div>
                    <span className="text-[12px] font-semibold text-[var(--c-accent)] whitespace-nowrap text-right">{t.cost}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-[16px] border border-[#30D158]/40 bg-[#30D158]/12 p-5">
              <p className="text-[16px] font-semibold text-[#30D158] mb-3">ทริค Day 7</p>
              <div className="space-y-2.5">
                {[
                  { icon: "🍠", text: "Kawagoe = เมืองมันหวาน! ทุกร้านมีเมนูมันหวาน ลองให้ครบ" },
                  { icon: "📸", text: "หอระฆัง Toki no Kane: จุดถ่ายรูปสัญลักษณ์ Kawagoe ต้องไม่พลาด" },
                  { icon: "🛣️", text: "Ginza ถนนปิดเฉพาะวันเสาร์-อาทิตย์! เราไปพอดีวันเสาร์" },
                  { icon: "🧳", text: "คืนสุดท้าย! กลับถึง รร. ต้องแพ็คกระเป๋าให้เรียบร้อย Check-out พรุ่งนี้เช้า" },
                  { icon: "🍜", text: "Tokyo Ramen Street: เลือกสายราเมนที่ชอบ — ทงคตสึ/โชยุ/มิโซะ มีครบ!" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[16px]">{tip.icon}</span>
                    <p className="text-[14px] text-[var(--c-text)] leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-6">
            <p className="text-[16px] font-semibold text-[var(--c-text)]">Day {dayNumber}</p>
            <p className="text-[13px] text-[var(--c-text-2)] mt-1">เตรียมเทมเพลตไทม์ไลน์ไว้แล้ว</p>
          </div>
        )}
        </div>
        </div>
        <div className="lang-jp">
          <TokyoDayJP dayNumber={dayNumber} />
        </div>
        </TokyoLangWrap>
        </TokyoZoomWrap>
      </div>
    </MainNavigationShell>
  );
}
