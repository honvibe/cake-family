import MainNavigationShell from "@/components/main-navigation-shell";
import HotelCard from "@/components/hotel-card";
import NaritaToHotelGuide from "@/components/narita-to-hotel-guide";
import { TokyoBackLink, TokyoDaySelector } from "@/components/tokyo-nav";
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
    "Sun. 1 Mar",
    "Mon. 2 Mar",
    "Tue. 3 Mar",
    "Wed. 4 Mar",
    "Thu. 5 Mar",
    "Fri. 6 Mar",
    "Sat. 7 Mar",
    "Sun. 8 Mar",
  ];
  const HOTEL = {
    name: "MONday Apart Asakusabashi Akihabara",
    rating: "4.0 stars rating out of five",
    addressEn: "4-15-5 Asakusabashi Taito-Ku Tokyo Japan, Tokyo, Japan, 111-0053",
    addressJp: "東京都台東区浅草橋4-15-5, 東京, 日本, 111-0053",
    checkIn: "Sunday March 1, 2026 (after 3:00 PM)",
    checkOut: "Sunday March 8, 2026 (before 10:00 AM)",
  };

  return (
    <MainNavigationShell>
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div>
            <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] tracking-tight">Tokyo 2026</p>
            <p className="text-[15px] text-[var(--c-text-2)]">Day {dayNumber}</p>
          </div>
          <TokyoBackLink />
        </div>

        <TokyoDaySelector dayLabels={dayLabels} dayNumber={dayNumber} />

        <div className="mt-6 md:mt-7">
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

            {/* Timeline */}
            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-5">ไทม์ไลน์ Day 1</p>
              <div className="relative space-y-0">
                {[
                  { time: "09:50", icon: "🏠", title: "ออกจากบ้าน", note: "คำนวณตามเงื่อนไข: ออกก่อนเวลาไฟลท์ 2 ชั่วโมง", phase: "th" as const },
                  { time: "10:20", icon: "🛫", title: "ถึงสนามบินดอนเมือง (DMK)", note: "เช็กอิน + ผ่านจุดตรวจ", phase: "th" as const },
                  { time: "11:20", icon: "🚪", title: "พร้อมที่เกต", note: "เผื่อเวลาขึ้นเครื่องและตรวจเอกสาร", phase: "th" as const },
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
                        row.phase === "fly" ? "bg-[#FF9F0A]/15 ring-2 ring-[#FF9F0A]/40" :
                        row.phase === "jp" ? "bg-[#FF453A]/10 ring-2 ring-[#FF453A]/30" :
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
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/15 text-[#FF9F0A]">ON AIR</span>
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
            <div className="rounded-[16px] border border-[#30D158]/30 bg-[#30D158]/5 p-5">
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
                  { time: "09:30", icon: "🏢", title: "Yodobashi Akiba", note: "ห้างเปิดพอดี! ดูรายละเอียดชั้นด้านล่าง", tag: "ช้อปปิ้ง", mapQuery: "Yodobashi+Akiba+Akihabara" },
                  { time: "12:00", icon: "🍣", title: "มื้อเที่ยง: Miura Misaki Port Ueno", note: "ซูชิสายพานหน้าล้น เครื่องพูนจัดเต็ม ใกล้สถานี Ueno", tag: "มื้อเที่ยง", mapQuery: "Miura-misaki-kou+Ueno" },
                  { time: "13:30", icon: "🚃", title: "ย้ายไป Ueno (JR Yamanote 2 สถานี)", note: "Yamashiroya: ตึกของเล่นตรงข้ามสถานี (Sanrio/Disney Princess ชั้น 2)", tag: "", mapQuery: "Yamashiroya+Ueno" },
                  { time: "14:00", icon: "💯", title: "Seria (ตึก Marui ชั้น 7)", note: "Sanrio ลิขสิทธิ์แท้ ทุกชิ้น 100 เยน น่ารักกว่า Daiso!", tag: "ช้อปปิ้ง", mapQuery: "Seria+Marui+Ueno" },
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
                              ? "bg-[#FF9F0A]/15 text-[#FF9F0A]"
                              : "bg-[#BF5AF2]/15 text-[#BF5AF2]"
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
                  { floor: "ชั้น 7", who: "แม่ & รองเท้า", color: "bg-[#FF6482]/10 text-[#FF6482] border-[#FF6482]/30", items: "ABC-MART (รองเท้าผ้าใบเด็ก/ผู้ใหญ่ รุ่นใหม่/ใส่สบาย) + DAISO (ของ Sanrio ราคา 100 เยน)" },
                  { floor: "ชั้น 6", who: "ลูกๆ", color: "bg-[#FF9F0A]/10 text-[#FF9F0A] border-[#FF9F0A]/30", items: "Tomica / Marvel / Disney — ปล่อยลูกดูของเล่น" },
                  { floor: "ชั้น 1-5", who: "พ่อ", color: "bg-[#64D2FF]/10 text-[#64D2FF] border-[#64D2FF]/30", items: "คอมพิวเตอร์ / กล้อง / เกม" },
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
            <div className="rounded-[16px] border border-[#30D158]/30 bg-[#30D158]/5 p-5">
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
            <div className="rounded-[18px] border border-[#BF5AF2]/40 bg-[#BF5AF2]/5 p-5 md:p-7">
              <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] leading-tight">Day 3: Tokyo DisneySea</p>
              <p className="text-[14px] mt-2 text-[var(--c-text-2)]">วันอังคาร 3 มีนาคม 2026 — Fantasy Springs &middot; Frozen &middot; Toy Story &middot; Believe!</p>
              <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "เปิดประตู", value: "09:00", icon: "🏁" },
                  { label: "ไฮไลท์", value: "Fantasy Springs", icon: "🧚" },
                  { label: "โชว์ค่ำ", value: "Believe! ~19:15", icon: "🎆" },
                  { label: "ค่าตั๋ว DPA", value: "~5,800 เยน", icon: "🎫" },
                ].map((card) => (
                  <div key={card.label} className="rounded-[14px] border border-[#BF5AF2]/25 bg-[#BF5AF2]/8 p-4">
                    <span className="text-[20px]">{card.icon}</span>
                    <p className="text-[12px] text-[var(--c-text-2)] mt-2">{card.label}</p>
                    <p className="text-[14px] font-semibold text-[var(--c-text)] mt-0.5">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* DPA Strategy */}
            <div className="rounded-[16px] border border-[#FF9F0A]/30 bg-[#FF9F0A]/5 p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">กลยุทธ์ DPA &amp; Priority Pass</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">กดทันทีตอน 09:00 ประตูเปิด — แม่กด DPA / พ่อกด Priority Pass</p>
              <div className="space-y-3">
                {[
                  { time: "09:00", who: "แม่", type: "DPA (เสียเงิน)", ride: "Frozen Journey", icon: "❄️", color: "bg-[#64D2FF]/10 text-[#64D2FF] border-[#64D2FF]/30" },
                  { time: "09:00", who: "พ่อ", type: "Priority Pass (ฟรี)", ride: "Nemo & Friends SeaRider (รอบ 09:30-10:00)", icon: "🐠", color: "bg-[#30D158]/10 text-[#30D158] border-[#30D158]/30" },
                  { time: "10:00", who: "ใครก็ได้", type: "DPA ใบที่ 2 (ครบ 1 ชม.)", ride: "Peter Pan หรือ Toy Story Mania", icon: "🧸", color: "bg-[#FF9F0A]/10 text-[#FF9F0A] border-[#FF9F0A]/30" },
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
                <div className="rounded-[10px] bg-[#FF453A]/10 border border-[#FF453A]/25 px-3.5 py-2.5 mt-2">
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
                  { time: "09:00", icon: "🏁", title: "ประตูเปิด! กด DPA ทันที", note: "แม่กด DPA → Frozen / พ่อกด Priority Pass → Nemo", phase: "disney" as const },
                  { time: "09:20", icon: "🚂", title: "Electric Railway → โซน Nemo", note: "เอารถเข็นขึ้นลิฟต์ไปชั้น 2 นั่งรถไฟข้ามฟากไปลงโซน Nemo (ประหยัดแรงเดิน)", phase: "disney" as const },
                  { time: "09:40", icon: "🐠", title: "Nemo & Friends SeaRider", note: "ใช้ช่องทางด่วน Priority Pass ที่กดไว้", phase: "disney" as const },
                  { time: "10:00", icon: "⏰", title: "นาฬิกาปลุกดัง! กด DPA ใบ 2", note: "Peter Pan หรือ Toy Story Mania", phase: "disney" as const },
                  { time: "10:30", icon: "🧚", title: "Fantasy Springs", note: "เล่น Anna and Elsa's Frozen Journey (ตามเวลา DPA) + ถ่ายรูปโซนใหม่", phase: "disney" as const },
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
                        row.phase === "food" ? "bg-[#FF9F0A]/10 ring-2 ring-[#FF9F0A]/30" :
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
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/15 text-[#FF9F0A]">อาหาร</span>
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
                      <div key={r.name} className={`rounded-[12px] border p-4 ${r.primary ? "border-[#FF9F0A]/30 bg-[#FF9F0A]/5" : "border-[var(--c-sep)] bg-[var(--c-subtle-card)]"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[16px]">{r.icon}</span>
                          <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                          {r.primary && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/15 text-[#FF9F0A]">แนะนำ</span>}
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
                      <div key={r.name} className={`rounded-[12px] border p-4 ${r.primary ? "border-[#FF9F0A]/30 bg-[#FF9F0A]/5" : "border-[var(--c-sep)] bg-[var(--c-subtle-card)]"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[16px]">{r.icon}</span>
                          <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                          {r.primary && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/15 text-[#FF9F0A]">แนะนำ</span>}
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
            <div className="rounded-[16px] border border-[#30D158]/30 bg-[#30D158]/5 p-5">
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
                  <div key={card.label} className="rounded-[14px] border border-[#FF453A]/25 bg-[#FF453A]/8 p-4">
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
                  { time: "09:00", icon: "⛩️", title: "ถึงสถานี Asakusa", note: "ถ่ายรูปกับโคมแดง Kaminarimon", phase: "asakusa" as const, mapQuery: "Kaminarimon+Asakusa" },
                  { time: "09:15", icon: "🍘", title: "เดินถนน Nakamise ชิมขนม", note: "ซาลาเปาทอด (Kokonoe) / เซมเบ้ (Ichiban-ya) — อย่าเพิ่งอิ่ม!", phase: "asakusa" as const, mapQuery: "Nakamise+Street+Asakusa" },
                  { time: "10:00", icon: "🙏", title: "ไหว้พระที่วัดเซ็นโซจิ", note: "ขอพรที่วัดเก่าแก่ที่สุดในโตเกียว", phase: "asakusa" as const, mapQuery: "Sensoji+Temple+Asakusa" },
                  { time: "10:30", icon: "⏰", title: "ไปต่อคิวร้าน Asakusa Gyukatsu", note: "สำคัญ! ร้านเปิด 11:00 ไปรอ 10:30 จะได้คิวแรกๆ — อยู่ตรงข้ามวัด", phase: "food" as const, mapQuery: "Asakusa+Gyukatsu" },
                  { time: "11:00", icon: "🥩", title: "มื้อเที่ยง: Asakusa Gyukatsu", note: "เนื้อชุบแป้งทอด ย่างเนื้อบนหินร้อนๆ ฟินมาก!", phase: "food" as const },
                  { time: "12:00", icon: "🍵", title: "ช่วงเวลาแห่งชาเขียว", note: "เดินย่อยอาหาร ดูร้านชาเขียวด้านล่าง", phase: "food" as const },
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
                        row.phase === "asakusa" ? "bg-[#FF453A]/10 ring-2 ring-[#FF453A]/30" :
                        row.phase === "food" ? "bg-[#FF9F0A]/10 ring-2 ring-[#FF9F0A]/30" :
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
            <div className="rounded-[16px] border border-[#30D158]/30 bg-[#30D158]/5 p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-1">ช่วงเวลาแห่งชาเขียว (12:00-13:00)</p>
              <p className="text-[13px] text-[var(--c-text-2)] mb-4">เดินย่อยหลังกิน Gyukatsu ไปร้านชาเขียวใกล้ๆ วัด</p>
              <div className="space-y-2.5">
                {[
                  { name: "Suzukien Asakusa", tag: "ไอติมเข้มข้น", desc: "เจลาโต้ชาเขียวที่เข้มที่สุดในโลก 7 ระดับ! เดิน 5 นาทีจากวัด", icon: "🍦", mapQuery: "Suzukien+Asakusa" },
                  { name: "Kaminari Issa", tag: "เครื่องดื่ม/เครป", desc: "Latte ชาเขียวและขนมอร่อย นั่งสบายกว่า", icon: "☕", mapQuery: "Kaminari+Issa+Asakusa" },
                  { name: "Hatoya Asakusa", tag: "ชาแบบดั้งเดิม", desc: "ชาร้อนบรรยากาศญี่ปุ่นแท้ ~220 บาท", icon: "🍵", mapQuery: "Hatoya+Asakusa" },
                ].map((r) => (
                  <div key={r.name} className="rounded-[12px] border border-[#30D158]/25 bg-[#30D158]/5 p-4">
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
                  { floor: "ชั้น 2", who: "พ่อ", color: "bg-[#64D2FF]/10 text-[#64D2FF] border-[#64D2FF]/30", items: "Porter Exchange — ดูเป้ EDC" },
                  { floor: "ชั้น B1", who: "ทุกคน", color: "bg-[#FF9F0A]/10 text-[#FF9F0A] border-[#FF9F0A]/30", items: "Kiwamiya (แฮมเบิร์กหินร้อน) / Saryo Suisen (อุด้ง + มัทฉะ)" },
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
                  <div key={r.name} className={`rounded-[12px] border p-4 ${r.tag ? "border-[#FF9F0A]/30 bg-[#FF9F0A]/5" : "border-[var(--c-sep)] bg-[var(--c-subtle-card)]"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[16px]">{r.icon}</span>
                      <span className="text-[14px] font-semibold text-[var(--c-text)]">{r.name}</span>
                      {r.tag && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/15 text-[#FF9F0A]">{r.tag}</span>}
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
            <div className="rounded-[16px] border border-[#30D158]/30 bg-[#30D158]/5 p-5">
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
        ) : (
          <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-6">
            <p className="text-[16px] font-semibold text-[var(--c-text)]">Day {dayNumber}</p>
            <p className="text-[13px] text-[var(--c-text-2)] mt-1">เตรียมเทมเพลตไทม์ไลน์ไว้แล้ว สามารถเติมกิจกรรมของวันนี้ได้ต่อทันที</p>
          </div>
        )}
        </div>
      </div>
    </MainNavigationShell>
  );
}
