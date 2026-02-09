import MainNavigationShell from "@/components/main-navigation-shell";
import HotelCard from "@/components/hotel-card";
import Link from "next/link";
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
    "Sun. 2 Mar",
    "Sun. 3 Mar",
    "Sun. 4 Mar",
    "Sun. 5 Mar",
    "Sun. 6 Mar",
    "Sun. 7 Mar",
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
          <Link
            href="/travel/tokyo2026"
            className="px-3 py-1.5 rounded-full text-[13px] font-medium bg-[var(--c-fill-2)] text-[var(--c-text)] hover:bg-[var(--c-fill)] transition-colors"
          >
            กลับหน้า Tokyo
          </Link>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5 md:gap-3">
          {dayLabels.map((label, idx) => {
            const current = idx + 1 === dayNumber;
            return (
              <Link
                key={label}
                href={`/travel/tokyo2026/day-${idx + 1}`}
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

        <div className="mt-6 md:mt-7">
        {dayNumber === 1 ? (
          <div className="space-y-5">
            <div className="rounded-[18px] border border-[var(--c-accent)]/45 bg-[var(--c-accent-bg)] p-5 md:p-7">
              <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] leading-tight">Day 1: ออกเดินทางไปโตเกียว</p>
              <p className="text-[14px] mt-2 text-[var(--c-text-2)]">วันอาทิตย์ 1 มีนาคม 2026</p>
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-5">
                  <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">เที่ยวบิน</p>
                  <p className="text-[22px] font-semibold text-[var(--c-text)] mt-2">XJ 606</p>
                  <p className="text-[13px] text-[var(--c-text-2)] mt-1">บินตรง</p>
                </div>
                <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-5">
                  <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">เส้นทาง</p>
                  <p className="text-[22px] font-semibold text-[var(--c-text)] mt-2">DMK -&gt; NRT</p>
                  <p className="text-[13px] text-[var(--c-text-2)] mt-1">Bangkok to Tokyo</p>
                </div>
                <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-5">
                  <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">เวลาบิน</p>
                  <p className="text-[22px] font-semibold text-[var(--c-text)] mt-2">11:50 - 20:00</p>
                  <p className="text-[13px] text-[var(--c-text-2)] mt-1">เวลา Local</p>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
              <p className="text-[20px] font-semibold text-[var(--c-text)] mb-5">ไทม์ไลน์ Day 1</p>
              <div className="space-y-5">
                {[
                  { time: "09:50", title: "ออกจากบ้าน", note: "คำนวณตามเงื่อนไข: ออกก่อนเวลาไฟลท์ 2 ชั่วโมง" },
                  { time: "10:20", title: "ถึงสนามบินดอนเมือง (DMK)", note: "เตรียมเช็กอินและผ่านจุดตรวจ", map: "https://www.google.com/maps?q=Don+Mueang+International+Airport&output=embed", mapTitle: "แผนที่สนามบินดอนเมือง" },
                  { time: "11:20", title: "พร้อมที่เกต", note: "เผื่อเวลาขึ้นเครื่องและตรวจเอกสารรอบสุดท้าย" },
                  { time: "11:50", title: "เครื่องออก (XJ 606)", note: "บินตรง DMK -> NRT" },
                  { time: "20:00", title: "ถึงสนามบินนาริตะ (NRT)", note: "เวลาท้องถิ่นโตเกียว" },
                  { time: "20:45", title: "ตม. + รับกระเป๋า", note: "เผื่อเวลาโดยประมาณหลังลงเครื่อง" },
                  { time: "21:30", title: "ออกจาก NRT ไปโรงแรม", note: "ไปที่ MONday Apart Asakusabashi Akihabara", map: "https://www.google.com/maps?q=Narita+International+Airport+to+MONday+Apart+Asakusabashi+Akihabara&output=embed", mapTitle: "เส้นทางจากนาริตะไปโรงแรม" },
                  { time: "23:00", title: "เช็กอินที่พัก / พักผ่อน", note: "จบแผนการเดินทางของ Day 1" },
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
