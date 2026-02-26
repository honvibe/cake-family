"use client";

/* ── all itinerary data inline for a single self-contained page ── */

const HOTEL = {
  name: "MONday Apart Asakusabashi Akihabara",
  address: "4-15-5 Asakusabashi, Taito-Ku, Tokyo 111-0053",
  checkIn: "อา. 1 มี.ค. (หลัง 15:00)",
  checkOut: "อา. 8 มี.ค. (ก่อน 10:00)",
};

const FLIGHT_GO = { code: "XJ 606", route: "DMK → NRT", time: "11:50 → 20:00" };
const FLIGHT_BACK = { code: "XJ 603", route: "NRT → DMK", time: "12:10 → 17:40" };

interface TL {
  time: string;
  title: string;
  note?: string;
}

const DAYS: {
  day: number;
  date: string;
  title: string;
  theme: string;
  timeline: TL[];
  tips?: string[];
}[] = [
  {
    day: 1,
    date: "อา. 1 มี.ค.",
    title: "เดินทางถึงญี่ปุ่น",
    theme: "บิน DMK→NRT, เช็คอินโรงแรม",
    timeline: [
      { time: "08:00", title: "ออกจากบ้าน" },
      { time: "09:30", title: "ถึง DMK — เช็กอิน + ซื้อขนมปัง" },
      { time: "10:00", title: "กิน Miracle Lounge", note: "ผ่าน ตม. → เลี้ยวซ้ายไป Gate 1-6" },
      { time: "11:50", title: "เครื่องออก XJ 606 (DMK → NRT)" },
      { time: "20:00", title: "ถึงนาริตะ — ตม. + รับกระเป๋า + ศุลกากร" },
      { time: "21:15", title: "ซื้อตั๋ว Keisei Skyliner → Ueno", note: "B1F เคาน์เตอร์สีน้ำเงิน" },
      { time: "21:39", title: "นั่ง Skyliner (45 นาที → Keisei Ueno)" },
      { time: "22:25", title: "แท็กซี่ Keisei Ueno → โรงแรม", note: "~1,200-1,500 เยน" },
      { time: "23:00", title: "Check-in & พักผ่อน" },
    ],
    tips: [
      "เตรียมแบงก์ 1,000 เยน จ่ายแท็กซี่",
      "แวะซื้อน้ำ/ขนมที่ Lawson ข้างโรงแรม",
    ],
  },
  {
    day: 2,
    date: "จ. 2 มี.ค.",
    title: "Akihabara & Ueno",
    theme: "ช้อปปิ้ง & สำรวจ | เดิน + JR",
    timeline: [
      { time: "08:00", title: "มื้อเช้าในห้องพัก" },
      { time: "09:00", title: "เดินไป Yodobashi Akiba (800m)" },
      { time: "09:30", title: "Yodobashi Akiba", note: "ชั้น7 ABC-MART+DAISO | ชั้น6 ของเล่น | ชั้น1-5 เทค" },
      { time: "11:40", title: "JR Yamanote → Ueno (2 สถานี)" },
      { time: "11:50", title: "[เที่ยง] Miura Misaki Port Ueno", note: "ซูชิสายพานหน้าล้น" },
      { time: "13:00", title: "Yamashiroya — ตึกของเล่น 6 ชั้น" },
      { time: "13:45", title: "Seria (Marui ชั้น7) — ของ Sanrio 100¥" },
      { time: "15:30", title: "Ameyoko + ซื้อกระเป๋าเดินทาง", note: "Ginza Karen 5,500-7,700¥ | London Sports รองเท้า" },
      { time: "16:30", title: "Uniqlo Okachimachi" },
      { time: "17:30", title: "นำกระเป๋ากลับ รร." },
      { time: "18:30", title: "[เย็น] Yakiniku Motoyama", note: "จองล่วงหน้า! ร้านแถว รร." },
      { time: "19:30", title: "กลับโรงแรมพักผ่อน" },
    ],
  },
  {
    day: 3,
    date: "อ. 3 มี.ค.",
    title: "Tokyo DisneySea",
    theme: "Fantasy Springs | Frozen | Toy Story | Believe!",
    timeline: [
      { time: "07:00", title: "ออกจาก รร. — ซื้อข้าวปั้นรองท้อง" },
      { time: "07:20", title: "JR Chuo-Sobu → Nishi-Funabashi → Keiyo → Maihama" },
      { time: "08:15", title: "ถึงหน้าประตู DisneySea — ต่อแถว" },
      { time: "09:00", title: "ประตูเปิด! กด DPA ทันที", note: "แม่กด DPA → Frozen | พ่อกด Priority Pass → Nemo" },
      { time: "09:40", title: "Nemo & Friends SeaRider (Priority Pass)" },
      { time: "10:00", title: "!! กด DPA ใบ 2 (ครบ 1 ชม.)", note: "Peter Pan หรือ Toy Story Mania" },
      { time: "10:30", title: "Fantasy Springs — Frozen Journey (DPA)" },
      { time: "12:00", title: "[เที่ยง] Sebastian's Calypso Kitchen", note: "Mermaid Lagoon | กด Mobile Order ล่วงหน้า 30 นาที" },
      { time: "13:30", title: "Mermaid Lagoon (Indoor) — แอร์เย็น" },
      { time: "15:00", title: "Sindbad's Voyage — เรือล่องช้าๆ พัก" },
      { time: "16:30", title: "Toy Story Mania! (DPA)" },
      { time: "17:30", title: "[เย็น] Zambini Brothers' Ristorante", note: "พาสต้า/พิซซ่า ใกล้จุดดูโชว์" },
      { time: "19:15", title: "Believe! Sea of Dreams", note: "โชว์แสงสีบนผิวน้ำ ต้องดู!" },
      { time: "20:00", title: "เดินทางกลับ → ถึง รร. ~21:00" },
    ],
    tips: [
      "ตั้งปลุก 10:00 กด DPA ใบ 2 ทันที!",
      "Mobile Order อาหาร กดล่วงหน้า 30 นาที",
      "Electric Railway ขึ้นลิฟต์ชั้น 2 นั่งรถไฟข้ามฟาก ประหยัดแรง",
    ],
  },
  {
    day: 4,
    date: "พ. 4 มี.ค.",
    title: "Asakusa & Shibuya",
    theme: "Sanrio & Stationery Edition",
    timeline: [
      { time: "08:30", title: "วัด Sensoji — โคมแดง Kaminarimon" },
      { time: "08:45", title: "ถนน Nakamise ชิมขนม" },
      { time: "09:30", title: "ไหว้พระที่วัดเซ็นโซจิ" },
      { time: "10:30", title: "ไปต่อคิว Asakusa Gyukatsu", note: "ร้านเปิด 11:00 ไปรอ 10:30 ได้คิวแรกๆ" },
      { time: "11:00", title: "[เที่ยง] Asakusa Gyukatsu", note: "เนื้อทอด ย่างบนหินร้อน" },
      { time: "12:00", title: "Suzukien — ไอติมชาเขียว 7 ระดับ" },
      { time: "13:30", title: "Ginza Line ยาวไป Shibuya (ไม่ต้องเปลี่ยน)" },
      { time: "14:30", title: "Hands Shibuya — เป้ EDC + เครื่องเขียน" },
      { time: "15:30", title: "Shibuya Parco", note: "ชั้น6 Jump/Nintendo/Pokemon | ชั้น2 Porter Exchange" },
      { time: "16:30", title: "MUJI Shibuya" },
      { time: "17:00", title: "LOFT Shibuya — สวรรค์เครื่องเขียน" },
      { time: "18:00", title: "[เย็น] JB's TOKYO (Miyashita Park)", note: "แฮมเบอร์เกอร์ หรือ Kiwamiya (Parco B1)" },
      { time: "19:30", title: "กลับ รร. ซักผ้า พักผ่อน" },
    ],
    tips: [
      "Gyukatsu: ไป 10:30! เปิด 11:00 คิวแรกๆ",
      "Suzukien ลองระดับ 5-6 ก่อนถ้ากลัวขม",
    ],
  },
  {
    day: 5,
    date: "พฤ. 5 มี.ค.",
    title: "Kamakura",
    theme: "ตามรอยซีรีส์ | ไข่ฟูฟ่อง | พระใหญ่ | ถนนขนม",
    timeline: [
      { time: "08:30", title: "JR Yokosuka Line → Kamakura (~1.5 ชม.)" },
      { time: "10:00", title: "ถึง Kamakura — ซื้อ Enoden Pass 800¥" },
      { time: "10:15", title: "Enoden → Inamuragasaki" },
      { time: "10:30", title: "!! จองคิว Cafe Yoridokoro ทันที", note: "ลงชื่อแล้วแว๊บไปเที่ยว" },
      { time: "10:45", title: "Enoden → Hase (ตามรอยซีรีส์)" },
      { time: "11:00", title: "Goryo Shrine — รถไฟวิ่งผ่านหน้าเสาประตู" },
      { time: "12:10", title: "Enoden กลับ Inamuragasaki" },
      { time: "12:30", title: "[เที่ยง] Cafe Yoridokoro", note: "ไข่ฟูฟ่อง + ปลาแดดเดียว + วิวรถไฟ" },
      { time: "13:45", title: "พระใหญ่ Kotoku-in (Great Buddha)", note: "มุดเข้าตัวองค์พระ 50¥ | ค่าเข้า 300¥" },
      { time: "15:00", title: "ถนน Komachi-dori — ขนม & ช้อปปิ้ง", note: "Chacha มัทฉะ | Giraffe แกงกะหรี่ปัง | Mameya ถั่ว | ดังโงะ" },
      { time: "17:00", title: "JR Yokosuka กลับ (ต้นสาย ได้นั่ง!)" },
      { time: "18:30", title: "ถึง รร. พักผ่อน" },
    ],
    tips: [
      "Enoden Pass คุ้มมาก นั่งวนได้ไม่จำกัด",
      "Yoridokoro: ลงชื่อก่อน แล้วไปเที่ยว กลับมาพอดี",
      "Komachi-dori: อย่ากินอิ่ม ร้านขนมเยอะมาก",
    ],
  },
  {
    day: 6,
    date: "ศ. 6 มี.ค.",
    title: "Fuji Kawaguchiko",
    theme: "กระเช้า Kachi Kachi | Oishi Park | ภูเขาไฟฟูจิ",
    timeline: [
      { time: "07:30", title: "ออกจาก รร. → JR ไป Akihabara" },
      { time: "07:45", title: "จุดขึ้นรถบัส Traffic Plaza (East Exit)" },
      { time: "08:00", title: "Highway Bus → Kawaguchiko (~2 ชม.)", note: "นั่งฝั่งซ้าย เห็นวิวฟูจิ" },
      { time: "10:20", title: "ถึงสถานี Kawaguchiko" },
      { time: "10:40", title: "Red Line Bus → กระเช้า (ป้าย 9)" },
      { time: "11:00", title: "Kachi Kachi Ropeway — กระเช้าชมวิว", note: "ศาลเจ้ากระต่าย + ระฆัง + ดังโงะย่าง" },
      { time: "12:30", title: "[เที่ยง] Koubaiya (Oishi Park)", note: "โฮโต หม้อร้อน | สำรอง: Momijitei ป้าย19" },
      { time: "13:30", title: "Oishi Park — วิวฟูจิสวยสุด!", note: "ไอติม Blueberry + ลูกวิ่งเล่นริมทะเลสาบ" },
      { time: "15:00", title: "Red Line กลับสถานี (เผื่อเวลา!)" },
      { time: "15:45", title: "[เย็น] Entaku หน้าสถานี", note: "เทมปุระ & โซบะ | สำรอง: Hirai กุ้งเทมปุระยักษ์" },
      { time: "17:00", title: "Highway Bus กลับ Akihabara (~2 ชม.)" },
      { time: "19:00", title: "ถึง Akihabara → กลับ รร." },
    ],
    tips: [
      "จองรถบัสรอบเช้าล่วงหน้า!",
      "กระเช้า: คิวเกิน 40 นาที → ข้าม ไป Oishi Park เลย",
      "15:00 ต้องเริ่มกลับ! อย่าดื่มด่ำจนลืมเวลา",
      "Fujiyama Cookie ซื้อเป็นของฝาก (ตีนเขากระเช้า)",
    ],
  },
  {
    day: 7,
    date: "ส. 7 มี.ค.",
    title: "Kawagoe → Ginza → Tokyo Station",
    theme: "เมืองเก่า Little Edo | Ginza ถนนปิด | Ramen Street",
    timeline: [
      { time: "09:00", title: "JR → Ikebukuro → Tobu Tojo → Kawagoe" },
      { time: "10:00", title: "ถึง Kawagoe — รถเมล์เข้าเมืองเก่า" },
      { time: "10:30", title: "เดิน Little Edo — หอระฆัง Toki no Kane" },
      { time: "11:00", title: "ของกิน Kawagoe", note: "Osatsuan มันหวานทอด | Candy Alley | Kawagoe Pudding" },
      { time: "13:00", title: "รถไฟกลับ → Ginza (เปลี่ยนที่ Ikebukuro)" },
      { time: "14:30", title: "Ginza Pedestrian Paradise!", note: "ถนนปิดทุกเสาร์ เดินถ่ายรูปกลางถนน" },
      { time: "15:00", title: "Senchado Tokyo — ซื้อชาเขียว" },
      { time: "15:30", title: "Itoya — ร้านเครื่องเขียนตึกแดง" },
      { time: "16:15", title: "เดินไป Tokyo Station (ฝั่ง Yaesu)" },
      { time: "16:30", title: "Tomica Shop & Plarail Shop", note: "First Avenue B1 ของเล่นรถไฟ Limited Edition" },
      { time: "18:00", title: "[เย็น] Tokyo Ramen Street (B1)", note: "หรือ Daimaru ชั้น 12-13" },
      { time: "19:30", title: "กลับ รร. — แพ็คกระเป๋า!", note: "คืนสุดท้าย! เก็บของให้เรียบร้อย" },
    ],
    tips: [
      "Kawagoe = เมืองมันหวาน! ลองให้ครบ",
      "Ginza ถนนปิดเฉพาะ ส.-อา. เราไปพอดี!",
      "คืนสุดท้าย แพ็คกระเป๋าให้เสร็จ",
    ],
  },
  {
    day: 8,
    date: "อา. 8 มี.ค.",
    title: "เดินทางกลับกรุงเทพฯ",
    theme: "Check-out → NRT → DMK",
    timeline: [
      { time: "08:30", title: "เช็กเอาท์ (ก่อน 10:00)" },
      { time: "08:45", title: "ออกจาก รร. → NRT" },
      { time: "10:20", title: "ถึงนาริตะ — เช็กอิน + โหลดกระเป๋า" },
      { time: "11:40", title: "พร้อมขึ้นเครื่อง" },
      { time: "12:10", title: "เครื่องออก XJ 603 (NRT → DMK)" },
      { time: "17:40", title: "ถึง DMK — รับกระเป๋า" },
      { time: "18:30", title: "กลับบ้าน จบทริป!" },
    ],
  },
];

/* ── page component ── */

export default function PrintItinerary() {
  return (
    <div className="print-itinerary">
      <style>{`
        .print-itinerary {
          font-family: "Noto Sans Thai", "Helvetica Neue", Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 20px;
          color: #000;
          background: #fff;
          font-size: 13px;
          line-height: 1.55;
        }

        /* header */
        .pi-header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .pi-header h1 {
          font-size: 22px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .pi-header p {
          font-size: 12px;
          margin: 4px 0 0;
          color: #444;
        }

        /* info grid */
        .pi-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 20px;
          border: 1px solid #999;
          padding: 10px 14px;
          margin-bottom: 20px;
          font-size: 12px;
        }
        .pi-info dt { font-weight: 700; display: inline; }
        .pi-info dd { display: inline; margin: 0; }

        /* day block */
        .pi-day {
          page-break-inside: avoid;
          margin-bottom: 14px;
          border: 1px solid #999;
        }
        .pi-day-header {
          background: #000;
          color: #fff;
          padding: 5px 12px;
          font-size: 14px;
          font-weight: 700;
        }
        .pi-day-theme {
          padding: 3px 12px;
          font-size: 11px;
          color: #555;
          border-bottom: 1px solid #ccc;
          background: #f5f5f5;
        }

        /* timeline table */
        .pi-tl {
          width: 100%;
          border-collapse: collapse;
        }
        .pi-tl td {
          padding: 3px 8px;
          vertical-align: top;
          border-bottom: 1px solid #eee;
        }
        .pi-tl tr:last-child td { border-bottom: none; }
        .pi-tl .pi-time {
          width: 52px;
          font-weight: 700;
          font-size: 12px;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }
        .pi-tl .pi-title { font-weight: 600; }
        .pi-tl .pi-note {
          font-size: 11px;
          color: #555;
        }

        /* tips */
        .pi-tips {
          padding: 3px 12px 6px;
          font-size: 11px;
          color: #333;
          border-top: 1px dashed #bbb;
        }
        .pi-tips span { font-weight: 700; }

        /* print button */
        .pi-btn {
          display: block;
          margin: 0 auto 20px;
          padding: 10px 32px;
          font-size: 15px;
          font-weight: 600;
          border: 2px solid #000;
          background: #fff;
          cursor: pointer;
          border-radius: 6px;
        }
        .pi-btn:hover { background: #f0f0f0; }

        /* print media */
        @media print {
          .pi-btn, .pi-no-print { display: none !important; }
          .print-itinerary {
            padding: 0;
            font-size: 11px;
            max-width: 100%;
          }
          .pi-header h1 { font-size: 18px; }
          .pi-day { margin-bottom: 8px; }
          .pi-day-header { font-size: 12px; padding: 3px 10px; }
          .pi-tl td { padding: 2px 6px; }
          .pi-info { font-size: 11px; padding: 6px 10px; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>

      {/* Print Button */}
      <button className="pi-btn pi-no-print" onClick={() => window.print()}>
        Print / Save PDF
      </button>

      {/* Header */}
      <div className="pi-header">
        <h1>TOKYO 2026 — ITINERARY</h1>
        <p>1-8 March 2026 | 4 persons | 7 nights</p>
      </div>

      {/* Quick Info */}
      <div className="pi-info">
        <div><dt>Hotel: </dt><dd>{HOTEL.name}</dd></div>
        <div><dt>Address: </dt><dd>{HOTEL.address}</dd></div>
        <div><dt>Check-in: </dt><dd>{HOTEL.checkIn}</dd></div>
        <div><dt>Check-out: </dt><dd>{HOTEL.checkOut}</dd></div>
        <div><dt>ขาไป: </dt><dd>{FLIGHT_GO.code} {FLIGHT_GO.route} ({FLIGHT_GO.time})</dd></div>
        <div><dt>ขากลับ: </dt><dd>{FLIGHT_BACK.code} {FLIGHT_BACK.route} ({FLIGHT_BACK.time})</dd></div>
      </div>

      {/* Days */}
      {DAYS.map((d) => (
        <div key={d.day} className="pi-day">
          <div className="pi-day-header">
            Day {d.day} ({d.date}) — {d.title}
          </div>
          <div className="pi-day-theme">{d.theme}</div>
          <table className="pi-tl">
            <tbody>
              {d.timeline.map((t, i) => (
                <tr key={i}>
                  <td className="pi-time">{t.time}</td>
                  <td>
                    <span className="pi-title">{t.title}</span>
                    {t.note && <span className="pi-note"> — {t.note}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {d.tips && d.tips.length > 0 && (
            <div className="pi-tips">
              <span>Tips: </span>
              {d.tips.join(" | ")}
            </div>
          )}
        </div>
      ))}

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: "10px", color: "#999", marginTop: "12px", borderTop: "1px solid #ccc", paddingTop: "8px" }}>
        Generated from cake-family.vercel.app/travel/tokyo2026
      </div>
    </div>
  );
}
