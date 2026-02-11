"use client";

import MainNavigationShell from "@/components/main-navigation-shell";
import HotelCard from "@/components/hotel-card";
import CurrencyTracker from "@/components/currency-tracker";
import { TokyoDayGrid } from "@/components/tokyo-nav";
import { useState } from "react";
import { usePathname } from "next/navigation";

type TabId = "plan" | "baggage" | "highlights";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "plan", label: "Plan", icon: "📋" },
  { id: "baggage", label: "Baggage", icon: "🧳" },
  { id: "highlights", label: "สิ่งที่น่าสนใจ", icon: "✨" },
];

const DAYS = [
  "Sun. 1 Mar", "Mon. 2 Mar", "Tue. 3 Mar", "Wed. 4 Mar",
  "Thu. 5 Mar", "Fri. 6 Mar", "Sat. 7 Mar", "Sun. 8 Mar",
];

const HOTEL = {
  name: "MONday Apart Asakusabashi Akihabara",
  rating: "4.0 stars rating out of five",
  addressEn: "4-15-5 Asakusabashi Taito-Ku Tokyo Japan, Tokyo, Japan, 111-0053",
  addressJp: "東京都台東区浅草橋4-15-5, 東京, 日本, 111-0053",
  checkIn: "Sunday March 1, 2026 (after 3:00 PM)",
  checkOut: "Sunday March 8, 2026 (before 10:00 AM)",
};

// --- Food Guide Data ---
interface Restaurant {
  name: string;
  highlight: string;
  mapUrl: string;
}

interface Zone {
  name: string;
  color: string;
  bg: string;
  border: string;
  shops: Restaurant[];
}

const ZONES: Zone[] = [
  {
    name: "Sengoku",
    color: "text-[#F5B731]",
    bg: "bg-[#F5B731]/10",
    border: "border-[#F5B731]/30",
    shops: [
      { name: "Kisaburo Nojo", highlight: "บุฟเฟ่ต์ไข่ดิบหลากสายพันธุ์ ทานคู่กับข้าวสวย", mapUrl: "https://www.google.com/maps/search/?api=1&query=Kisaburo+Nojo+Sengoku" },
    ],
  },
  {
    name: "Shibuya",
    color: "text-[#FF6482]",
    bg: "bg-[#FF6482]/10",
    border: "border-[#FF6482]/30",
    shops: [
      { name: "Butter Premium Junk", highlight: "แพนเค้ก 3 ชิ้นโต พร้อมเนยก้อน 100 กรัม", mapUrl: "https://www.google.com/maps/search/?api=1&query=Butter+Premium+Junk+Shibuya" },
      { name: "Kitchen Hasegawa", highlight: "ออมเล็ตแฮมเบิร์ก กรีดไข่โชว์ที่โต๊ะ", mapUrl: "https://www.google.com/maps/search/?api=1&query=Kitchen+Hasegawa+Shibuya" },
      { name: "Hikiniku to Kome", highlight: "แฮมเบิร์ก 3 ชิ้น ย่างเตาถ่าน ข้าวเติมได้", mapUrl: "https://www.google.com/maps/search/?api=1&query=Hikiniku+to+Kome+Shibuya" },
      { name: "I'm donut?", highlight: "โดนัทแป้งเหนียวนุ่มหนึบ คิวยาวมาก", mapUrl: "https://www.google.com/maps/search/?api=1&query=I'm+donut+Shibuya" },
      { name: "Mo-Mo-Paradise", highlight: "บุฟเฟ่ต์วากิว A5 ไม่อั้น (ประมาณ 8,000 เยน)", mapUrl: "https://www.google.com/maps/search/?api=1&query=Mo-Mo+Paradise+Shibuya+Udagawacho" },
      { name: "Kobe Beef Ittetsu", highlight: "วากิวเสียบไม้ และข้าวหน้าเนื้อโกเบ", mapUrl: "https://www.google.com/maps/search/?api=1&query=Kobe+Beef+Ittetsu+Shibuya" },
    ],
  },
  {
    name: "Tsukiji",
    color: "text-[#64D2FF]",
    bg: "bg-[#64D2FF]/10",
    border: "border-[#64D2FF]/30",
    shops: [
      { name: "Unitora Nakadori", highlight: "ข้าวหน้าอูนิ 6 สายพันธุ์ (ชามละ 20,000 เยน)", mapUrl: "https://www.google.com/maps/search/?api=1&query=Unitora+Nakadori+Tsukiji" },
      { name: "Gyu (Wagyu & Crab)", highlight: "เนื้อย่างวากิว A5 ท็อปอูนิและขาปูยักษ์", mapUrl: "https://www.google.com/maps/search/?api=1&query=Gyu+Wagyu+Beef+Tsukiji" },
      { name: "Tsukiji Soratsuki", highlight: "สตรอว์เบอร์รีเคลือบน้ำตาลและไดฟูกุ", mapUrl: "https://www.google.com/maps/search/?api=1&query=Tsukiji+Soratsuki" },
      { name: "Yamacho", highlight: "ไข่ม้วนญี่ปุ่น (ไข่หวาน) ไม้ละ 200 เยน", mapUrl: "https://www.google.com/maps/search/?api=1&query=Tsukiji+Yamacho" },
      { name: "Matcha Stand Maruni", highlight: "มัทฉะลาเต้และพรีเมียมมัทฉะเข้มข้น", mapUrl: "https://www.google.com/maps/search/?api=1&query=Matcha+Stand+Maruni" },
      { name: "Tsukiji Ichiba Senbei", highlight: "ข้าวเกรียบเซมเบ้แผ่นยักษ์ใส่หมึก/กุ้ง", mapUrl: "https://www.google.com/maps/search/?api=1&query=Tsukiji+Ichiba+Senbei" },
      { name: "Marutake", highlight: "ไข่ม้วนเจ้าดังอีกหนึ่งร้านในตลาด", mapUrl: "https://www.google.com/maps/search/?api=1&query=Marutake+Tsukiji" },
    ],
  },
  {
    name: "Harajuku",
    color: "text-[#BF5AF2]",
    bg: "bg-[#BF5AF2]/10",
    border: "border-[#BF5AF2]/30",
    shops: [
      { name: "Kuma no Te Cafe", highlight: "คาเฟ่มือหมีส่งน้ำผ่านรู น่ารักมาก", mapUrl: "https://www.google.com/maps/search/?api=1&query=Kuma+no+Te+Cafe+Harajuku" },
      { name: "Afuri Ramen", highlight: "ราเมงซุปยูสุ หอม สดชื่น", mapUrl: "https://www.google.com/maps/search/?api=1&query=Afuri+Ramen+Harajuku" },
      { name: "Tabanenoshi", highlight: "เครปเย็นแป้งหนานุ่ม ไส้มันหวาน/ทีรามิสุ", mapUrl: "https://www.google.com/maps/search/?api=1&query=Tabanenoshi+Harajuku" },
    ],
  },
  {
    name: "Ginza",
    color: "text-[#FFD60A]",
    bg: "bg-[#FFD60A]/10",
    border: "border-[#FFD60A]/30",
    shops: [
      { name: "Sushi no Midori", highlight: "ซูชิคุณภาพดี ราคาไม่แพง คิวยาว", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sushi+no+Midori+Ginza" },
      { name: "Age.3", highlight: "แซนด์วิชทอด ไส้ทะลักทั้งคาวและหวาน", mapUrl: "https://www.google.com/maps/search/?api=1&query=Age.3+Ginza" },
      { name: "Ginza Kimuraya", highlight: "ขนมปังถั่วแดงร้านเก่าแก่กว่า 150 ปี", mapUrl: "https://www.google.com/maps/search/?api=1&query=Ginza+Kimuraya" },
    ],
  },
  {
    name: "Asakusa",
    color: "text-[#FF453A]",
    bg: "bg-[#FF453A]/10",
    border: "border-[#FF453A]/30",
    shops: [
      { name: "Hatcoffee", highlight: "ลาเต้อาร์ตฟองนม 3D ตามสั่ง", mapUrl: "https://www.google.com/maps/search/?api=1&query=Hatcoffee+Asakusa" },
      { name: "Tonkatsu Hasegawa", highlight: "ทงคัตสึหมูทอดชิ้นหนานุ่ม ข้าวเติมได้", mapUrl: "https://www.google.com/maps/search/?api=1&query=Tonkatsu+Hasegawa+Asakusa" },
      { name: "Asakusa Naniwaya", highlight: "คากิโกริ (น้ำแข็งไส) สตรอว์เบอร์รี/มัทฉะ", mapUrl: "https://www.google.com/maps/search/?api=1&query=Asakusa+Naniwaya" },
    ],
  },
  {
    name: "Ueno",
    color: "text-[#30D158]",
    bg: "bg-[#30D158]/10",
    border: "border-[#30D158]/30",
    shops: [
      { name: "Miura-misaki-kou", highlight: "ซูชิสายพานหน้าล้น เครื่องพูนจัดเต็ม", mapUrl: "https://www.google.com/maps/search/?api=1&query=Miura-misaki-kou+Ueno" },
      { name: "Gyukatsu Motomura", highlight: "เนื้อวากิวชุบแป้งทอด ย่างเพิ่มเองได้", mapUrl: "https://www.google.com/maps/search/?api=1&query=Gyukatsu+Motomura+Ueno" },
      { name: "Ichiran Ramen", highlight: "ราเมงข้อสอบ สาขาหน้าสถานีอุเอโนะ", mapUrl: "https://www.google.com/maps/search/?api=1&query=Ichiran+Ramen+Ueno" },
      { name: "Yakiniku Ponga", highlight: "บุฟเฟ่ต์ยากินิกุพรีเมียม (6,000 เยน)", mapUrl: "https://www.google.com/maps/search/?api=1&query=Yakiniku+Ponga+Ueno" },
      { name: "Dipper Dan Crepe", highlight: "เครปเย็นสตรอว์เบอร์รีมัทฉะ", mapUrl: "https://www.google.com/maps/search/?api=1&query=Dipper+Dan+Ueno" },
      { name: "Menya Musashi", highlight: "ราเมงต้มยำรสชาติจัดจ้าน", mapUrl: "https://www.google.com/maps/search/?api=1&query=Menya+Musashi+Ueno" },
      { name: "Domremy Outlet", highlight: "ร้านขนมราคาถูก แยมโรลและพุดดิ้ง", mapUrl: "https://www.google.com/maps/search/?api=1&query=Domremy+Outlet+Ueno" },
    ],
  },
  {
    name: "Yanaka",
    color: "text-[#FF9F0A]",
    bg: "bg-[#FF9F0A]/10",
    border: "border-[#FF9F0A]/30",
    shops: [
      { name: "Yanaka Senbei", highlight: "เซมเบ้แป้งข้าวทอดหลากรส", mapUrl: "https://www.google.com/maps/search/?api=1&query=Yanaka+Senbei" },
      { name: "Echigoya Wakasa", highlight: "โมจิเหนียวนุ่ม ทานคู่มัทฉะร้อน", mapUrl: "https://www.google.com/maps/search/?api=1&query=Echigoya+Wakasa" },
      { name: "Waguriya", highlight: "มองบังเกาลัดธรรมชาติ รสชาติเข้มข้น", mapUrl: "https://www.google.com/maps/search/?api=1&query=Waguriya+Yanaka" },
      { name: "Niku no Suzuki", highlight: "เมนจิคัตสึ (เนื้อบดทอด) คิวยาว", mapUrl: "https://www.google.com/maps/search/?api=1&query=Niku+no+Suzuki+Yanaka" },
    ],
  },
  {
    name: "Hongo",
    color: "text-[#5E5CE6]",
    bg: "bg-[#5E5CE6]/10",
    border: "border-[#5E5CE6]/30",
    shops: [
      { name: "Yakiniku Jumbo", highlight: "ยากินิกุพรีเมียม ข้าวผัดวากิวทีเด็ด", mapUrl: "https://www.google.com/maps/search/?api=1&query=Yakiniku+Jumbo+Hongo" },
    ],
  },
];

const TOTAL_SHOPS = ZONES.reduce((sum, z) => sum + z.shops.length, 0);

type HighlightSubTab = "food" | "near" | "shopping" | "budget" | "currency";

const HIGHLIGHT_SUBS: { id: HighlightSubTab; label: string }[] = [
  { id: "food", label: "ร้านอาหาร" },
  { id: "near", label: "ใกล้ รร." },
  { id: "shopping", label: "รองเท้า" },
  { id: "budget", label: "งบประมาณ" },
  { id: "currency", label: "แลกเงิน" },
];

const NEAR_HOTEL = [
  { name: "Ichikatsu (いちかつ)", icon: "🐷", tag: "แนะนำ อันดับ 1!", style: "หมูทอดทงคัตสึ", highlight: "หมูชิ้นใหญ่ แป้งกรอบ ไม่อมน้ำมัน ราคาถูกและคุ้มมาก", price: "700-1,000 เยน", distance: "เดิน 1-2 นาที", mapQuery: "Ichikatsu+Asakusabashi" },
  { name: "Torikizoku (鳥貴族)", icon: "🍢", tag: "ครอบครัว", style: "ไก่ย่างเสียบไม้ Yakitori", highlight: "ทุกเมนูราคาเดียว 360 เยน! ทั้งอาหารและเครื่องดื่ม เมนูมีรูปภาพ สั่งง่าย", price: "ทุกเมนู 360 เยน", distance: "ชั้น 6 ตึกใกล้สถานี", mapQuery: "Torikizoku+Asakusabashi" },
  { name: "Yamagasa no Ryu (山笠ノ龍)", icon: "🍜", tag: "เปิดดึก", style: "ราเมงทงคตสึแบบฮากาตะ", highlight: "เส้นเล็ก ซุปเข้มข้น ต้นตำรับ เปิดถึงตี 4! เหมาะมื้อดึก", price: "~900-1,200 เยน", distance: "ใกล้สถานี", mapQuery: "Yamagasa+no+Ryu+Asakusabashi" },
  { name: "Yoshinoya (吉野家)", icon: "🍚", tag: "24 ชม.", style: "ข้าวหน้าเนื้อต้ม Gyudon", highlight: "เร็ว อร่อย ประหยัด เปิด 24 ชั่วโมง — ที่พึ่งยามดึกหรือเช้าตรู่", price: "~400-600 เยน", distance: "ตรงข้ามสถานีเลย", mapQuery: "Yoshinoya+Asakusabashi" },
  { name: "Hanamasa (肉のハナマサ)", icon: "🛒", tag: "ซุปเปอร์ 24 ชม.", style: "ซุปเปอร์มาร์เก็ตขายส่ง", highlight: "เปิด 24 ชม. ของเยอะมาก เนื้อสัตว์ ผัก ผลไม้ ราคาถูกกว่าร้านสะดวกซื้อ แวะซื้อน้ำ/ขนม/สตรอว์เบอร์รี่ตุนเข้าตู้เย็นได้", price: "ราคาส่ง", distance: "เดิน 3-5 นาที", mapQuery: "Hanamasa+Asakusabashi" },
];

const SHOE_COMPARE = [
  { brand: "On Cloud", icon: "☁️", models: [
    { name: "Cloud 5 / Cloud 6", thPrice: "5,500-6,000", jpPrice: "17,380-18,700 เยน (~4,100-4,400)", taxFree: "~3,700-4,000", save: "~1,500-2,000" },
    { name: "Cloudmonster (พื้นหนา)", thPrice: "6,800-7,000", jpPrice: "19,800-22,000 เยน (~4,700-5,200)", taxFree: "~4,200-4,700", save: "~1,500-2,000" },
  ]},
  { brand: "New Balance", icon: "👟", models: [
    { name: "530 (ฮิตตลอดกาล)", thPrice: "3,990", jpPrice: "12,980 เยน (~3,100)", taxFree: "~2,800", save: "~1,200" },
    { name: "2002R / 1906R (สายแฟชั่น)", thPrice: "5,400-5,900", jpPrice: "19,800 เยน (~4,750)", taxFree: "~4,200-4,300", save: "~1,100-1,600" },
  ]},
];

const BUDGET = [
  { category: "จ่ายแล้ว", items: [
    { name: "ค่าตั๋วเครื่องบิน + ประกัน", amount: 42187 },
    { name: "กระเป๋า + ที่นั่ง", amount: 10513 },
    { name: "Air Asia อาหารขากลับ", amount: 888 },
    { name: "ค่าที่พัก (5,500 x 7 คืน)", amount: 39901 },
    { name: "Tokyo DisneySea", amount: 5580 },
    { name: "ค่ารถไฟไปฟูจิ", amount: 1480 },
  ]},
  { category: "ประมาณการ", items: [
    { name: "ค่ากิน (7 วัน 3 มื้อ มื้อละ 1,000)", amount: 21000 },
    { name: "ค่าเดินทาง", amount: 20000 },
    { name: "ค่าตั๋วเข้าชม", amount: 20000 },
    { name: "ช้อปปิ้ง & ของฝาก", amount: 20000 },
    { name: "ประกัน & อื่นๆ", amount: 5000 },
  ]},
];

export default function Tokyo2026Page() {
  const pathname = usePathname();
  const isPublic = pathname.startsWith("/tokyotripplan");
  const [activeTab, setActiveTab] = useState<TabId>("plan");
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  const [highlightSub, setHighlightSub] = useState<HighlightSubTab>("food");

  return (
    <MainNavigationShell>
      <div className="w-full max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-5 md:mb-6">
          <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] tracking-tight">
            Tokyo 2026
          </p>
          <p className="text-[14px] text-[var(--c-text-2)] mt-1">1 - 8 Mar 2026</p>
        </div>

        {/* Tab Bar (hidden on public share link) */}
        {!isPublic && (
          <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[14px] font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-[var(--c-accent)] text-white"
                    : "bg-[var(--c-fill-2)] text-[var(--c-text-2)] hover:bg-[var(--c-fill)]"
                }`}
              >
                <span className="text-[15px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ======== Plan Tab ======== */}
        {(isPublic || activeTab === "plan") && (
          <div className="space-y-6">
            <TokyoDayGrid days={DAYS} />

            <HotelCard hotel={HOTEL} />

            <div>
              <p className="text-[16px] font-semibold text-[var(--c-text)]">รายละเอียดแผนรายวัน</p>
              <p className="text-[13px] text-[var(--c-text-2)] mt-1">เลือกวันด้านบนเพื่อดูไทม์ไลน์รายวัน</p>
            </div>
          </div>
        )}

        {/* ======== Baggage Tab ======== */}
        {!isPublic && activeTab === "baggage" && (
          <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-6">
            <p className="text-[16px] font-semibold text-[var(--c-text)]">Baggage Checklist</p>
            <p className="text-[13px] text-[var(--c-text-2)] mt-1">
              สามารถเพิ่มรายการสิ่งของที่ต้องเตรียมได้ต่อทันที
            </p>
          </div>
        )}

        {/* ======== Highlights Tab ======== */}
        {!isPublic && activeTab === "highlights" && (
          <div className="space-y-5">
            {/* Sub-tab bar */}
            <div className="flex gap-1 border-b border-[var(--c-sep)] -mb-1">
              {HIGHLIGHT_SUBS.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setHighlightSub(sub.id)}
                  className={`px-4 py-2.5 text-[14px] font-medium border-b-2 transition-all ${
                    highlightSub === sub.id
                      ? "border-[var(--c-accent)] text-[var(--c-accent)]"
                      : "border-transparent text-[var(--c-text-2)] hover:text-[var(--c-text)]"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* --- Food sub-tab --- */}
            {highlightSub === "food" && (
              <div className="space-y-5">
                <div className="rounded-[18px] border border-[var(--c-accent)]/40 bg-[var(--c-accent-bg)] p-5 md:p-7">
                  <p className="text-[22px] md:text-[28px] font-bold text-[var(--c-text)] leading-tight">
                    ตะลุยกิน Tokyo
                  </p>
                  <p className="text-[14px] text-[var(--c-text-2)] mt-1">
                    4 วัน {TOTAL_SHOPS} ร้าน · {ZONES.length} โซน
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {ZONES.map((zone) => (
                      <button
                        key={zone.name}
                        onClick={() => {
                          setExpandedZone(expandedZone === zone.name ? null : zone.name);
                          setTimeout(() => {
                            document.getElementById(`zone-${zone.name}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }, 100);
                        }}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${zone.bg} ${zone.color} border ${zone.border}`}
                      >
                        {zone.name} · {zone.shops.length}
                      </button>
                    ))}
                  </div>
                </div>

                {ZONES.map((zone) => (
                  <div
                    key={zone.name}
                    id={`zone-${zone.name}`}
                    className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedZone(expandedZone === zone.name ? null : zone.name)}
                      className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-[var(--c-fill-3)] transition-colors active:bg-[var(--c-fill-2)]"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[13px] font-bold ${zone.bg} ${zone.color} border ${zone.border}`}>
                          {zone.name}
                        </span>
                        <span className="text-[13px] text-[var(--c-text-2)]">
                          {zone.shops.length} ร้าน
                        </span>
                      </div>
                      <svg
                        className={`w-[14px] h-[14px] text-[var(--c-text-3)] shrink-0 transition-transform duration-200 ${
                          expandedZone === zone.name ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {expandedZone === zone.name && (
                      <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {zone.shops.map((shop) => (
                          <div
                            key={shop.name}
                            className={`rounded-[14px] border ${zone.border} ${zone.bg} p-4 flex items-start justify-between gap-3`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className={`text-[16px] font-semibold ${zone.color} leading-tight`}>
                                {shop.name}
                              </p>
                              <p className="text-[13px] text-[var(--c-text-2)] mt-1">{shop.highlight}</p>
                            </div>
                            <a
                              href={shop.mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--c-accent)] text-white hover:brightness-110 active:scale-95 transition-all"
                              title="เปิดใน Google Maps"
                            >
                              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                              </svg>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* --- Near Hotel sub-tab --- */}
            {highlightSub === "near" && (
              <div className="space-y-5">
                <div className="rounded-[18px] border border-[#FF9F0A]/40 bg-[#FF9F0A]/5 p-5 md:p-7">
                  <p className="text-[22px] md:text-[28px] font-bold text-[var(--c-text)] leading-tight">ร้านอาหารใกล้โรงแรม</p>
                  <p className="text-[14px] text-[var(--c-text-2)] mt-1">แถว Asakusabashi &middot; เดินไม่ถึง 5 นาที &middot; ราคาประหยัด</p>
                </div>
                <div className="space-y-3">
                  {NEAR_HOTEL.map((r) => (
                    <div key={r.name} className={`rounded-[16px] border p-4 md:p-5 ${r.tag === "แนะนำ อันดับ 1!" ? "border-[#FF9F0A]/30 bg-[#FF9F0A]/5" : "border-[var(--c-sep)] bg-[var(--c-card-alt)]"}`}>
                      <div className="flex items-center gap-2.5 flex-wrap mb-2">
                        <span className="text-[22px]">{r.icon}</span>
                        <span className="text-[16px] font-semibold text-[var(--c-text)]">{r.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.tag === "แนะนำ อันดับ 1!" ? "bg-[#FF9F0A]/15 text-[#FF9F0A]" :
                          r.tag === "24 ชม." || r.tag === "ซุปเปอร์ 24 ชม." ? "bg-[#30D158]/15 text-[#30D158]" :
                          r.tag === "เปิดดึก" ? "bg-[#BF5AF2]/15 text-[#BF5AF2]" :
                          "bg-[#64D2FF]/15 text-[#64D2FF]"
                        }`}>{r.tag}</span>
                      </div>
                      <p className="text-[13px] text-[var(--c-text-2)] mb-1">{r.style}</p>
                      <p className="text-[14px] text-[var(--c-text)] leading-relaxed">{r.highlight}</p>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <span className="text-[13px] font-semibold text-[var(--c-accent)]">{r.price}</span>
                        <span className="text-[12px] text-[var(--c-text-2)]">{r.distance}</span>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${r.mapQuery}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors ml-auto">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                          แผนที่
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-[12px] border border-[#30D158]/25 bg-[#30D158]/5 p-4">
                  <p className="text-[13px] text-[#30D158] font-medium">Tip: LIFE Kanda-Izumicho ซุปเปอร์ใหญ่ ของครบ ถูกกว่าร้านสะดวกซื้อ แวะซื้อน้ำ/ขนม/สตรอว์เบอร์รี่ตุนเข้าตู้เย็นได้เลย</p>
                </div>
              </div>
            )}

            {/* --- Shopping sub-tab --- */}
            {highlightSub === "shopping" && (
              <div className="space-y-5">
                <div className="rounded-[18px] border border-[#BF5AF2]/40 bg-[#BF5AF2]/5 p-5 md:p-7">
                  <p className="text-[22px] md:text-[28px] font-bold text-[var(--c-text)] leading-tight">เปรียบเทียบราคารองเท้า</p>
                  <p className="text-[14px] text-[var(--c-text-2)] mt-1">ญี่ปุ่น vs ไทย &middot; ทำ Tax Free ประหยัดเพิ่ม 10%</p>
                </div>

                {SHOE_COMPARE.map((brand) => (
                  <div key={brand.brand} className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[22px]">{brand.icon}</span>
                      <p className="text-[18px] font-semibold text-[var(--c-text)]">{brand.brand}</p>
                    </div>
                    <div className="space-y-3">
                      {brand.models.map((m) => (
                        <div key={m.name} className="rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-4">
                          <p className="text-[14px] font-semibold text-[var(--c-text)] mb-3">{m.name}</p>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="rounded-[8px] bg-[var(--c-fill-3)] p-3">
                              <p className="text-[11px] text-[var(--c-text-2)]">ราคาไทย</p>
                              <p className="text-[15px] font-semibold text-[var(--c-text)]">{m.thPrice} บาท</p>
                            </div>
                            <div className="rounded-[8px] bg-[var(--c-fill-3)] p-3">
                              <p className="text-[11px] text-[var(--c-text-2)]">ราคาญี่ปุ่น</p>
                              <p className="text-[15px] font-semibold text-[var(--c-text)]">{m.jpPrice}</p>
                            </div>
                            <div className="rounded-[8px] bg-[#30D158]/8 border border-[#30D158]/20 p-3">
                              <p className="text-[11px] text-[#30D158]">Tax Free (ลด 10%)</p>
                              <p className="text-[15px] font-semibold text-[#30D158]">{m.taxFree} บาท</p>
                            </div>
                            <div className="rounded-[8px] bg-[#FF9F0A]/8 border border-[#FF9F0A]/20 p-3">
                              <p className="text-[11px] text-[#FF9F0A]">ประหยัดได้</p>
                              <p className="text-[15px] font-semibold text-[#FF9F0A]">{m.save} บาท</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="rounded-[12px] border border-[#30D158]/25 bg-[#30D158]/5 p-4">
                  <p className="text-[14px] font-semibold text-[#30D158] mb-2">ซื้อที่ไหนดี?</p>
                  <div className="space-y-1.5">
                    <p className="text-[13px] text-[var(--c-text)]">ABC-MART (Yodobashi ชั้น 7) — รุ่นใหม่ ใส่สบาย</p>
                    <p className="text-[13px] text-[var(--c-text)]">London Sports (Ameyoko) — กองรองเท้าราคาถูก คู่ละ 500-800 บาท</p>
                    <p className="text-[13px] text-[var(--c-text)]">New Balance สาขาใหญ่ — มีรุ่น Limited ที่ไทยหาไม่ได้</p>
                  </div>
                </div>
              </div>
            )}

            {/* --- Budget sub-tab --- */}
            {highlightSub === "budget" && (
              <div className="space-y-5">
                <div className="rounded-[18px] border border-[#30D158]/40 bg-[#30D158]/5 p-5 md:p-7">
                  <p className="text-[22px] md:text-[28px] font-bold text-[var(--c-text)] leading-tight">งบประมาณทริป</p>
                  <p className="text-[14px] text-[var(--c-text-2)] mt-1">8 วัน 7 คืน &middot; 4 คน &middot; สรุปค่าใช้จ่าย</p>
                </div>

                {BUDGET.map((section) => {
                  const total = section.items.reduce((s, item) => s + item.amount, 0);
                  return (
                    <div key={section.category} className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[18px] font-semibold text-[var(--c-text)]">{section.category}</p>
                        <span className={`px-3 py-1 rounded-full text-[13px] font-bold ${
                          section.category === "จ่ายแล้ว" ? "bg-[#30D158]/10 text-[#30D158]" : "bg-[#FF9F0A]/10 text-[#FF9F0A]"
                        }`}>{total.toLocaleString()} บาท</span>
                      </div>
                      <div className="space-y-2">
                        {section.items.map((item) => (
                          <div key={item.name} className="flex items-center justify-between rounded-[10px] bg-[var(--c-subtle-card)] border border-[var(--c-sep)] px-4 py-3">
                            <span className="text-[14px] text-[var(--c-text)]">{item.name}</span>
                            <span className="text-[14px] font-semibold text-[var(--c-text)] whitespace-nowrap">{item.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-[16px] border border-[var(--c-accent)]/30 bg-[var(--c-accent-bg)] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[18px] font-bold text-[var(--c-text)]">รวมทั้งหมด</p>
                    <p className="text-[22px] font-bold text-[var(--c-accent)]">
                      {(BUDGET[0].items.reduce((s, i) => s + i.amount, 0) + BUDGET[1].items.reduce((s, i) => s + i.amount, 0)).toLocaleString()} บาท
                    </p>
                  </div>
                  <p className="text-[13px] text-[var(--c-text-2)] mt-1">จ่ายแล้ว {BUDGET[0].items.reduce((s, i) => s + i.amount, 0).toLocaleString()} &middot; เหลือประมาณ {BUDGET[1].items.reduce((s, i) => s + i.amount, 0).toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* --- Currency sub-tab --- */}
            {highlightSub === "currency" && <CurrencyTracker />}
          </div>
        )}
      </div>
    </MainNavigationShell>
  );
}
