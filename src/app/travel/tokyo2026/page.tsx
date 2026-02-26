"use client";

import MainNavigationShell from "@/components/main-navigation-shell";
import HotelCard from "@/components/hotel-card";
import CurrencyTracker from "@/components/currency-tracker";
import { TokyoDayGrid } from "@/components/tokyo-nav";
import { TokyoFontButtons, TokyoZoomWrap } from "@/components/tokyo-font-scale";
import { TokyoLangButton, useTkLang } from "@/components/tokyo-lang";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type TabId = "plan" | "baggage" | "highlights";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "plan", label: "Plan", icon: "📋" },
  { id: "baggage", label: "Baggage", icon: "🧳" },
  { id: "highlights", label: "สิ่งที่น่าสนใจ", icon: "✨" },
];

const DAYS = [
  "Sun. 1", "Mon. 2", "Tue. 3", "Wed. 4",
  "Thu. 5", "Fri. 6", "Sat. 7", "Sun. 8",
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
    bg: "bg-[#F5B731]/18",
    border: "border-[#F5B731]/40",
    shops: [
      { name: "Kisaburo Nojo", highlight: "บุฟเฟ่ต์ไข่ดิบหลากสายพันธุ์ ทานคู่กับข้าวสวย", mapUrl: "https://www.google.com/maps/search/?api=1&query=Kisaburo+Nojo+Sengoku" },
    ],
  },
  {
    name: "Shibuya",
    color: "text-[#FF6482]",
    bg: "bg-[#FF6482]/18",
    border: "border-[#FF6482]/40",
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
    bg: "bg-[#64D2FF]/18",
    border: "border-[#64D2FF]/40",
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
    bg: "bg-[#BF5AF2]/18",
    border: "border-[#BF5AF2]/40",
    shops: [
      { name: "Kuma no Te Cafe", highlight: "คาเฟ่มือหมีส่งน้ำผ่านรู น่ารักมาก", mapUrl: "https://www.google.com/maps/search/?api=1&query=Kuma+no+Te+Cafe+Harajuku" },
      { name: "Afuri Ramen", highlight: "ราเมงซุปยูสุ หอม สดชื่น", mapUrl: "https://www.google.com/maps/search/?api=1&query=Afuri+Ramen+Harajuku" },
      { name: "Tabanenoshi", highlight: "เครปเย็นแป้งหนานุ่ม ไส้มันหวาน/ทีรามิสุ", mapUrl: "https://www.google.com/maps/search/?api=1&query=Tabanenoshi+Harajuku" },
    ],
  },
  {
    name: "Ginza",
    color: "text-[var(--c-star)]",
    bg: "bg-[#FFD60A]/18",
    border: "border-[#FFD60A]/40",
    shops: [
      { name: "Sushi no Midori", highlight: "ซูชิคุณภาพดี ราคาไม่แพง คิวยาว", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sushi+no+Midori+Ginza" },
      { name: "Age.3", highlight: "แซนด์วิชทอด ไส้ทะลักทั้งคาวและหวาน", mapUrl: "https://www.google.com/maps/search/?api=1&query=Age.3+Ginza" },
      { name: "Ginza Kimuraya", highlight: "ขนมปังถั่วแดงร้านเก่าแก่กว่า 150 ปี", mapUrl: "https://www.google.com/maps/search/?api=1&query=Ginza+Kimuraya" },
    ],
  },
  {
    name: "Asakusa",
    color: "text-[#FF453A]",
    bg: "bg-[#FF453A]/18",
    border: "border-[#FF453A]/40",
    shops: [
      { name: "Hatcoffee", highlight: "ลาเต้อาร์ตฟองนม 3D ตามสั่ง", mapUrl: "https://www.google.com/maps/search/?api=1&query=Hatcoffee+Asakusa" },
      { name: "Tonkatsu Hasegawa", highlight: "ทงคัตสึหมูทอดชิ้นหนานุ่ม ข้าวเติมได้", mapUrl: "https://www.google.com/maps/search/?api=1&query=Tonkatsu+Hasegawa+Asakusa" },
      { name: "Asakusa Naniwaya", highlight: "คากิโกริ (น้ำแข็งไส) สตรอว์เบอร์รี/มัทฉะ", mapUrl: "https://www.google.com/maps/search/?api=1&query=Asakusa+Naniwaya" },
    ],
  },
  {
    name: "Ueno",
    color: "text-[#30D158]",
    bg: "bg-[#30D158]/18",
    border: "border-[#30D158]/40",
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
    bg: "bg-[#FF9F0A]/18",
    border: "border-[#FF9F0A]/40",
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
    bg: "bg-[#5E5CE6]/18",
    border: "border-[#5E5CE6]/40",
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

const TRIP_SUMMARY = [
  { day: 1, date: "อา. 1 มี.ค.", title: "เดินทาง → เช็คอิน", color: "#FF453A", icon: "✈️", desc: "บิน DMK→NRT เช็คอินโรงแรม Asakusabashi สำรวจรอบๆ ย่าน",
    dateJp: "3/1（日）", titleJp: "到着・チェックイン", descJp: "Air Japan XJ 606 DMK→NRT ホテルチェックイン・周辺散策" },
  { day: 2, date: "จ. 2 มี.ค.", title: "Tsukiji → Ueno → Akihabara", color: "#FF9F0A", icon: "🐟", desc: "ตะลุยกินตลาดซึกิจิ เที่ยวอุเอโนะ ช้อปอากิฮาบาระ",
    dateJp: "3/2（月）", titleJp: "築地場外市場 → 上野 → 秋葉原", descJp: "築地で海鮮・上野公園・アメ横・秋葉原電気街" },
  { day: 3, date: "อ. 3 มี.ค.", title: "Shibuya → Harajuku", color: "#FF6482", icon: "🛍️", desc: "ชิบูย่า สครัมเบิลครอสซิ่ง ฮาราจูกุ เมจิชริงค์ แพนเค้ก",
    dateJp: "3/3（火）", titleJp: "渋谷 → 原宿 → 明治神宮", descJp: "スクランブル交差点・渋谷スカイ・竹下通り・明治神宮" },
  { day: 4, date: "พ. 4 มี.ค.", title: "Tokyo DisneySea", color: "#5E5CE6", icon: "🏰", desc: "เต็มวันที่ DisneySea ดินแดนแฟนตาซีริมอ่าว",
    dateJp: "3/4（水）", titleJp: "東京ディズニーシー", descJp: "終日ディズニーシー（チケット購入済み）" },
  { day: 5, date: "พฤ. 5 มี.ค.", title: "Kamakura", color: "#30D158", icon: "🛕", desc: "พระใหญ่ไดบุทสึ เอโนชิมะ โลเกชันซีรีส์ ถนนโคมาจิ",
    dateJp: "3/5（木）", titleJp: "鎌倉", descJp: "鎌倉大仏・長谷寺・小町通り・江ノ島" },
  { day: 6, date: "ศ. 6 มี.ค.", title: "Kawaguchiko (ฟูจิ)", color: "#64D2FF", icon: "🗻", desc: "ชมวิวภูเขาไฟฟูจิ กระเช้า Kachi Kachi โฮโต",
    dateJp: "3/6（金）", titleJp: "河口湖・富士山", descJp: "カチカチ山ロープウェイ・大石公園・ほうとう" },
  { day: 7, date: "ส. 7 มี.ค.", title: "Kawagoe → Ginza → Tokyo St.", color: "#FF9F0A", icon: "🏯", desc: "คาวาโกเอะลิตเติลเอโดะ กินซ่า สถานีโตเกียว",
    dateJp: "3/7（土）", titleJp: "川越 → 銀座 → 東京駅", descJp: "小江戸川越・銀座歩行者天国・東京駅ラーメンストリート" },
  { day: 8, date: "อา. 8 มี.ค.", title: "ช้อปสุดท้าย → กลับ", color: "#FF453A", icon: "🛫", desc: "ซื้อของฝากลาสนาที เช็คเอาท์ บิน NRT→DMK",
    dateJp: "3/8（日）", titleJp: "チェックアウト → 帰国", descJp: "Air Japan XJ 607 NRT→DMK 出発11:15" },
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

const BAG_SECTIONS: { id: string; title: string; icon: string; color: string; items: { id: string; name: string; note: string }[] }[] = [
  { id: "dad", title: "พ่อ (Hon) — เสื้อผ้า", icon: "👨", color: "#64D2FF", items: [
    { id: "d1", name: "เสื้อยืดคอกลม (โทนเข้ม) x3", note: "Mix ได้ทุกกางเกง" },
    { id: "d2", name: "กางเกงขายาว (สีเข้ม) x2", note: "เดินสบาย ไม่ยับง่าย" },
    { id: "d3", name: "สเวตเตอร์ / แขนยาว x1", note: "Mid layer — ซื้อเพิ่ม UNIQLO ได้" },
    { id: "d4", name: "เสื้อกันลมกันฝน (มีฮู้ด)", note: "ใส่ขึ้นเครื่อง ไม่ต้องพกในกระเป๋า" },
    { id: "d5", name: "กางเกงใน + ถุงเท้า x4", note: "ซัก Day 4 หมุนเวียน" },
    { id: "d6", name: "ชุดนอน x1", note: "" },
  ]},
  { id: "mom", title: "แม่ (Jay) — เสื้อผ้า", icon: "👩", color: "#FF6482", items: [
    { id: "m1", name: "เสื้อแขนยาว (neutral) x3", note: "Capsule: ขาว/ดำ/เบจ mix ได้หมด" },
    { id: "m2", name: "กางเกงขายาว / leggings x2", note: "เดินสบาย กันหนาว" },
    { id: "m3", name: "เสื้อกันลมกันฝน", note: "ใส่ขึ้นเครื่อง" },
    { id: "m4", name: "กระโปรง/กางเกงสวย x1", note: "ถ่ายรูปวัด/ถนน" },
    { id: "m5", name: "ชุดชั้นใน + ถุงเท้า x4", note: "ซัก Day 4" },
    { id: "m6", name: "ชุดนอน x1", note: "" },
  ]},
  { id: "contact", title: "คอนแทคเลนส์ & แว่น", icon: "👓", color: "#BF5AF2", items: [
    { id: "c1", name: "คอนแทคเลนส์ + สำรอง 2 คู่", note: "เผื่อหาย/ขาด" },
    { id: "c2", name: "น้ำยาล้างคอนแทค (≤100ml carry-on)", note: "ขวดใหญ่ใส่โหลด" },
    { id: "c3", name: "กล่องใส่คอนแทค + คีบ", note: "" },
    { id: "c4", name: "กล่องแว่นตา → Backpack!", note: "กันแตก ห้ามโหลด!" },
    { id: "c5", name: "แว่นตาสำรอง", note: "เผื่อคอนแทคมีปัญหา" },
  ]},
  { id: "kids", title: "ลูกๆ — เสื้อผ้า", icon: "👶", color: "#FF9F0A", items: [
    { id: "k1", name: "เสื้อยืด/แขนยาว x5", note: "เผื่อเปื้อน — เด็กต้องเผื่อเยอะ" },
    { id: "k2", name: "กางเกงขายาว x3", note: "เผื่อเปียก/เลอะ" },
    { id: "k3", name: "เสื้อกันหนาวเด็ก (มีฮู้ด)", note: "ใส่ขึ้นเครื่อง" },
    { id: "k4", name: "ชุดชั้นใน + ถุงเท้า x5", note: "" },
    { id: "k5", name: "ชุดนอน x1", note: "" },
    { id: "k6", name: "ผ้าอ้อม/กางเกงผ้าอ้อม", note: "ถ้ายังใช้ — ซื้อเพิ่มที่ 7-11 ได้" },
  ]},
  { id: "shoes", title: "รองเท้า (ทุกคน)", icon: "👟", color: "#30D158", items: [
    { id: "s1", name: "รองเท้าผ้าใบ — ใส่ไปเลย", note: "วันละ 15,000+ ก้าว ไม่ต้องใส่กระเป๋า" },
    { id: "s2", name: "รองเท้าแตะเบาๆ x1 คู่", note: "ใส่ในห้อง / อาบน้ำ" },
  ]},
  { id: "shared", title: "ของใช้รวมครอบครัว", icon: "🧴", color: "#FF9F0A", items: [
    { id: "h1", name: "ยา: พารา, แก้แพ้, ท้องเสีย", note: "ใส่ถุงซิปล็อค" },
    { id: "h2", name: "พลาสเตอร์กันกัด/กันถลอก", note: "เด็กเล็กจำเป็น" },
    { id: "h3", name: "ครีมกันแดด SPF50 (ขวดเล็ก)", note: "มีนาคม UV เริ่มแรง" },
    { id: "h4", name: "ลิปมัน", note: "อากาศแห้ง ปากแตก" },
    { id: "h5", name: "แปรงสีฟัน + ยาสีฟัน (เด็ก)", note: "ผู้ใหญ่ใช้ของ รร.ได้" },
    { id: "h6", name: "ถุงซิปล็อค (หลายขนาด)", note: "ของเหลว + เสื้อเปียก" },
    { id: "h7", name: "ถุงขยะ x5-6", note: "ญี่ปุ่นหาถังขยะยาก พกไว้ทิ้งของระหว่างวัน" },
    { id: "h8", name: "ถุงพลาสติกใบใหญ่ x3-4", note: "เด็กอ้วก / เสื้อเปียก" },
    { id: "h9", name: "ถุงผ้าซักรีด", note: "แยกผ้าสกปรกรอซัก" },
    { id: "h10", name: "ถุงสุญญากาศ (vacuum bag) x4-5", note: "บีบอากาศออก ประหยัดพื้นที่เสื้อผ้า" },
    { id: "h11", name: "ที่ดูดสุญญากาศมือ / ปั๊มเล็ก", note: "แบบมือบีบหรือพกพาได้ ไม่ต้องเสียบไฟ" },
    { id: "h12", name: "Packing cubes", note: "แยกเสื้อผ้าแต่ละคน" },
  ]},
  { id: "tech", title: "อุปกรณ์ / ชาร์จ", icon: "📱", color: "#5E5CE6", items: [
    { id: "t1", name: "สายชาร์จ USB-C x2-3", note: "มือถือ 2 เครื่อง + iPad" },
    { id: "t2", name: "หัวชาร์จ", note: "ปลั๊กญี่ปุ่น = แบนเหมือนไทย ไม่ต้อง adapter!" },
    { id: "t3", name: "Power bank (≥20,000mAh) → Backpack!", note: "ห้ามโหลด! เดินทั้งวัน ชาร์จ 2-3 รอบ" },
    { id: "t4", name: "iPad + case", note: "สำหรับลูก — โหลดหนังการ์ตูน offline!" },
    { id: "t5", name: "หูฟังเด็ก (จำกัดเสียง)", note: "เครื่องบิน + รถไฟ" },
    { id: "t6", name: "eSIM ญี่ปุ่น (แนะนำ)", note: "ซื้อ Klook/Kkday ถูกกว่า roaming มาก ~200-400 บ./8 วัน" },
  ]},
  { id: "docs", title: "เอกสาร / การเงิน", icon: "📄", color: "#FF453A", items: [
    { id: "p1", name: "พาสปอร์ต 4 เล่ม", note: "เหลือ >6 เดือน!" },
    { id: "p2", name: "สำเนาพาสปอร์ต (รูปในมือถือ)", note: "เผื่อหาย" },
    { id: "p3", name: "Visit Japan Web QR (4 คน)", note: "กรอกล่วงหน้า" },
    { id: "p4", name: "ประกันเดินทาง (print + digital)", note: "" },
    { id: "p5", name: "Boarding pass", note: "" },
    { id: "p6", name: "ปากกา 1 ด้าม", note: "กรอกใบ ตม." },
    { id: "p7", name: "เงินเยนสด ~50,000 เยน", note: "แลกจากไทยก่อนไป สำหรับ 2-3 วันแรก (แท็กซี่+อาหาร+ตู้หยอด)" },
    { id: "p8", name: "เงินเยนสด สำรอง ~30,000 เยน", note: "เผื่อที่ที่รับเฉพาะเงินสด ถอน ATM ญี่ปุ่นก็ได้ (7-11 ATM)" },
    { id: "p9", name: "บัตรเครดิต/เดบิต (Visa/Master)", note: "ร้านใหญ่ คอนบินิ รถไฟ รูดบัตรได้ — ประหยัดค่าแลกเยน" },
    { id: "p10", name: "บัตรที่ไม่มี foreign fee (ถ้ามี)", note: "เช่น Wise, YouTrip — rate ดีกว่าแลกสด" },
  ]},
  { id: "money", title: "เงิน & SIM — แนะนำ", icon: "💴", color: "#FFD60A", items: [
    { id: "mn1", name: "แลกเยนสดที่ไทย ~80,000 เยน", note: "SuperRich/ธนาคาร เรทดี แลกก่อน 3-5 วัน" },
    { id: "mn2", name: "ที่เหลือรูดบัตร Visa/Master", note: "ร้านใหญ่ รถไฟ combini — สะดวกกว่าพกเงินสดเยอะ" },
    { id: "mn3", name: "ATM 7-11 ถอนเยนสดเพิ่มได้", note: "ค่าธรรมเนียม ~220 เยน/ครั้ง ใช้ได้ทุกบัตร Visa" },
    { id: "mn4", name: "eSIM แนะนำมากกว่า SIM/Roaming", note: "ไม่ต้องเปลี่ยนถาด ใช้ได้ทันที เน็ตเร็ว" },
    { id: "mn5", name: "eSIM ซื้อ Klook/Kkday ~200-400 บาท/8 วัน", note: "ถูกกว่า roaming 10 เท่า เน็ตไม่อั้น" },
    { id: "mn6", name: "Roaming AIS/TRUE ~299 บ./วัน = แพงมาก", note: "8 วัน = 2,400 บ. vs eSIM 300 บาทจบ" },
  ]},
  { id: "backpack", title: "Backpack ขึ้นเครื่อง", icon: "🎒", color: "#FF6482", items: [
    { id: "b1", name: "iPad + หนังการ์ตูน (offline!)", note: "ลูก 6 ชม.บนเครื่อง" },
    { id: "b2", name: "หูฟังเด็ก", note: "ไม่รบกวนคนข้างๆ" },
    { id: "b3", name: "ขวดน้ำเปล่า", note: "ซื้อหลังผ่าน security" },
    { id: "b4", name: "ขนมนิ้ว / นมกล่อง", note: "ลูกงอแง → ขนมช่วย" },
    { id: "b5", name: "พาสปอร์ต + boarding pass + ปากกา", note: "" },
    { id: "b6", name: "กล่องแว่นตาแม่", note: "กันแตก ห้ามโหลด" },
    { id: "b7", name: "Power bank + สายชาร์จ", note: "ห้ามโหลด!" },
    { id: "b8", name: "เสื้อกันหนาวบาง 1 ตัว/คน", note: "เครื่องเย็น + ลง 5°C" },
    { id: "b9", name: "ของเหลว ≤100ml (ถุง 3-1-1)", note: "น้ำยาคอนแทค, ครีมเล็ก" },
    { id: "b10", name: "ยาจำเป็นเฉพาะหน้า", note: "พารา, ยาแก้แพ้" },
  ]},
  { id: "weather", title: "กันฝน / กันหนาว", icon: "🌧", color: "#64D2FF", items: [
    { id: "w1", name: "เสื้อกันลมกันฝน (มีฮู้ด)", note: "ใส่ขึ้นเครื่อง — ไม่กิน kg" },
    { id: "w2", name: "ร่มพับเล็ก x1", note: "หรือซื้อที่ 7-11 ~500 เยน" },
    { id: "w3", name: "ผ้าพันคอบาง", note: "กันลม + ถ่ายรูปสวย" },
    { id: "w4", name: "หมวกไหมพรม/แก๊ป", note: "Kawaguchiko Day 6 หนาวมาก" },
  ]},
];

const BAG_BUY_JP = [
  { name: "กระเป๋าเดินทางใบ 2 (โหลด 20 kg)", where: "Ginza Karen (Ameyoko)", day: "Day 2", price: "5,500-7,700 เยน" },
  { name: "เสื้อผ้า UNIQLO / GU", where: "UNIQLO Okachimachi", day: "Day 2", price: "ตามต้องการ" },
  { name: "Heattech (ถ้าหนาว)", where: "UNIQLO", day: "Day 2", price: "~1,500 เยน/ตัว" },
  { name: "ถุงเท้ากันหนาว", where: "UNIQLO / 100 yen", day: "Day 2", price: "~300-500 เยน" },
  { name: "ร่มฉุกเฉิน", where: "7-11 / Lawson", day: "เมื่อฝนตก", price: "~500 เยน" },
  { name: "ของใช้จุกจิก", where: "Matsumoto Kiyoshi", day: "Day 2", price: "" },
];

const BAG_TIMELINE = [
  { label: "7 วันก่อนบิน", date: "22 ก.พ.", color: "#64D2FF", tasks: ["เช็คพาสปอร์ต 4 เล่ม", "กรอก Visit Japan Web", "จองประกันเดินทาง", "สั่ง eSIM (Klook/Kkday)", "แลกเงินเยนสด ~80,000 เยน (SuperRich)", "ซื้อถุงสุญญากาศ + ปั๊มมือ", "ซื้อถุงซิปล็อค/ยา/ถุงขยะ"] },
  { label: "3 วันก่อนบิน", date: "26 ก.พ.", color: "#FF9F0A", tasks: ["ซักผ้าทุกตัว", "เริ่มจัดลง packing cubes", "ติดตั้ง eSIM ทดสอบ", "เช็คคอนแทค+น้ำยา", "เช็คยาไม่หมดอายุ", "ชาร์จ power bank เต็ม"] },
  { label: "1 วันก่อนบิน", date: "28 ก.พ.", color: "#FF453A", tasks: ["จัดกระเป๋าตาม checklist", "ถุงสุญญากาศบีบเสื้อผ้า", "ชาร์จ iPad + โหลดการ์ตูน offline", "เช็ค Backpack ขึ้นเครื่อง", "เยนสด + บัตรเครดิต พร้อม"] },
  { label: "เช้าวันบิน", date: "1 มี.ค.", color: "#30D158", tasks: ["พาสปอร์ต 4 เล่ม", "มือถือ (ชาร์จเต็ม + eSIM)", "กระเป๋าเงิน + เยนสด", "Power bank ใน Backpack", "ออกจากบ้าน 09:50"] },
];

const DEVICES = [
  { id: "ipad-jh", label: "iPad ลูก", icon: "📱" },
  { id: "ipad-hon", label: "iPad พ่อ", icon: "📱" },
  { id: "ipad-mini", label: "iPad mini", icon: "📱" },
  { id: "phone-jay", label: "มือถือแม่", icon: "📲" },
  { id: "phone-hon", label: "มือถือพ่อ", icon: "📲" },
];
const POSTER_SM = "https://image.tmdb.org/t/p/w154";
const POSTER_LG = "https://image.tmdb.org/t/p/w342";

const FAMILY_SUGGEST = [
  { key: "kid", label: "ลูก", emoji: "🧒", desc: "การ์ตูน · Disney · Netflix", genres: "16|10751", providers: "8|337" },
  { key: "mom", label: "แม่", emoji: "👩", desc: "เกาหลี · ตลก · รัก · ซึ้ง", genres: "35|10749|18", originLang: "ko" },
  { key: "dad", label: "พ่อ", emoji: "👨", desc: "Action · ลึกลับ · Plot Twist", genres: "28|9648|53" },
] as const;

export default function Tokyo2026Page() {
  const pathname = usePathname();
  const isPublic = pathname.startsWith("/tokyotripplan");
  const lang = useTkLang();
  const [activeTab, setActiveTab] = useState<TabId>("plan");
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  const [highlightSub, setHighlightSub] = useState<HighlightSubTab>("food");
  const [expandedBag, setExpandedBag] = useState<string | null>(null);
  const [checkedBag, setCheckedBag] = useState<Set<string>>(new Set());
  useEffect(() => {
    try { const s = localStorage.getItem("tk26-bag"); if (s) setCheckedBag(new Set(JSON.parse(s))); } catch {}
  }, []);
  const toggleBag = (id: string) => {
    setCheckedBag(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("tk26-bag", JSON.stringify([...next]));
      return next;
    });
  };
  const totalBagItems = BAG_SECTIONS.reduce((s, sec) => s + sec.items.length, 0);
  const checkedBagCount = BAG_SECTIONS.reduce((s, sec) => s + sec.items.filter(i => checkedBag.has(i.id)).length, 0);

  // --- Movie downloads (per device) ---
  type DeviceMovie = { id: number; title: string; poster: string; year: string; providers: string[] };
  type SearchResult = { id: number; title: string; poster_path: string | null; release_date: string; vote_average: number };
  const [bagSub, setBagSub] = useState<"packing" | "movies">("packing");
  const [deviceMovies, setDeviceMovies] = useState<Record<string, DeviceMovie[]>>({});
  const [activeDevice, setActiveDevice] = useState(DEVICES[0].id);
  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState<SearchResult[]>([]);
  const [searchingMovies, setSearchingMovies] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    try { const s = localStorage.getItem("tk26-device-movies"); if (s) setDeviceMovies(JSON.parse(s)); } catch {}
  }, []);
  const searchMovies = (q: string) => {
    setMovieQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setMovieResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearchingMovies(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setMovieResults((data.results || []).slice(0, 8));
      } catch {}
      setSearchingMovies(false);
    }, 400);
  };
  const addMovieToDevice = (movie: SearchResult) => {
    const devId = activeDevice;
    setDeviceMovies(prev => {
      const list = prev[devId] || [];
      if (list.length >= 7 || list.some(m => m.id === movie.id)) return prev;
      const nm: DeviceMovie = { id: movie.id, title: movie.title, poster: movie.poster_path || "", year: movie.release_date?.slice(0, 4) || "", providers: [] };
      const updated = { ...prev, [devId]: [...list, nm] };
      localStorage.setItem("tk26-device-movies", JSON.stringify(updated));
      fetch(`/api/tmdb/providers?id=${movie.id}`).then(r => r.json()).then((d: { providers?: { name: string }[] }) => {
        if (d.providers?.length) {
          setDeviceMovies(p => {
            const l = p[devId] || [];
            const idx = l.findIndex(m => m.id === movie.id);
            if (idx === -1) return p;
            const nl = [...l]; nl[idx] = { ...nl[idx], providers: d.providers!.map(pp => pp.name).slice(0, 3) };
            const u = { ...p, [devId]: nl };
            localStorage.setItem("tk26-device-movies", JSON.stringify(u));
            return u;
          });
        }
      }).catch(() => {});
      return updated;
    });
    setMovieQuery(""); setMovieResults([]);
  };
  const removeMovie = (devId: string, movieId: number) => {
    setDeviceMovies(prev => {
      const updated = { ...prev, [devId]: (prev[devId] || []).filter(m => m.id !== movieId) };
      localStorage.setItem("tk26-device-movies", JSON.stringify(updated));
      return updated;
    });
  };
  const reorderMovie = (devId: string, movieId: number, dir: "up" | "down") => {
    setDeviceMovies(prev => {
      const list = [...(prev[devId] || [])];
      const idx = list.findIndex(m => m.id === movieId);
      if (idx === -1) return prev;
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= list.length) return prev;
      [list[idx], list[swap]] = [list[swap], list[idx]];
      const updated = { ...prev, [devId]: list };
      localStorage.setItem("tk26-device-movies", JSON.stringify(updated));
      return updated;
    });
  };
  const totalDeviceMovies = DEVICES.reduce((s, d) => s + (deviceMovies[d.id]?.length || 0), 0);

  // --- Family movie suggestions ---
  const [suggestTab, setSuggestTab] = useState("kid");
  const [suggestMovies, setSuggestMovies] = useState<Record<string, SearchResult[]>>({});
  const [suggestLoading, setSuggestLoading] = useState<Record<string, boolean>>({});
  const loadSuggest = (key: string, force = false) => {
    if (!force && suggestMovies[key]) return;
    if (suggestLoading[key]) return;
    const p = FAMILY_SUGGEST.find(f => f.key === key);
    if (!p) return;
    setSuggestLoading(prev => ({ ...prev, [key]: true }));
    const page = Math.floor(Math.random() * 15) + 1;
    const params = new URLSearchParams({ genre: p.genres, page: String(page) });
    if ("providers" in p && p.providers) params.set("provider", p.providers);
    if ("originLang" in p && p.originLang) params.set("originLang", p.originLang);
    fetch(`/api/tmdb/discover?${params}`)
      .then(r => r.json())
      .then(data => {
        const results: SearchResult[] = (data.results || []).slice(0, 12).map((m: Record<string, unknown>) => ({
          id: m.id as number, title: m.title as string, poster_path: m.poster_path as string | null,
          release_date: m.release_date as string, vote_average: m.vote_average as number,
        }));
        const shuffled = [...results].sort(() => Math.random() - 0.5);
        setSuggestMovies(prev => ({ ...prev, [key]: shuffled }));
      })
      .finally(() => setSuggestLoading(prev => ({ ...prev, [key]: false })));
  };
  useEffect(() => {
    FAMILY_SUGGEST.forEach(f => { if (!suggestMovies[f.key] && !suggestLoading[f.key]) loadSuggest(f.key); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    setActiveTab("plan");
    setTimeout(() => window.print(), 200);
  };

  return (
    <MainNavigationShell>
      <div className="w-full max-w-[1600px] mx-auto">
        {/* Print-only header */}
        <div className="print-only hidden mb-4 pb-3 border-b-2 border-[var(--c-text)]">
          <p className="text-[22pt] font-bold text-[var(--c-text)] leading-tight">Tokyo Trip Plan 2026</p>
          <p className="text-[11pt] text-[var(--c-text-2)] mt-1">1 - 8 March 2026 &middot; 8 Days 7 Nights &middot; 4 People &middot; MONday Apart Asakusabashi</p>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-5 md:mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] tracking-tight no-print">
                Tokyo 2026
              </p>
              <a
                href="/tokyotripplan"
                target="_blank"
                rel="noopener noreferrer"
                className="no-print inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--c-accent)]/15 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/25 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H18m0 0v4.5m0-4.5L10.5 13.5" />
                </svg>
                Public
              </a>
            </div>
            <p className="text-[14px] text-[var(--c-text-2)] mt-1 no-print">1 - 8 Mar 2026</p>
          </div>
          <div className="flex items-center gap-1.5 no-print">
            <button
              onClick={handlePrint}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--c-fill-2)] active:bg-[var(--c-fill)] transition-colors"
              title="Print Plan (A4)"
            >
              <svg className="w-[18px] h-[18px] text-[var(--c-text-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.25 7.034V3.375" />
              </svg>
            </button>
            <TokyoLangButton />
            <TokyoFontButtons />
          </div>
        </div>

        {/* Tab Bar (hidden on public share link + print) */}
        {!isPublic && (
          <div className="no-print flex gap-1.5 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
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
          <TokyoZoomWrap>
            <div className="space-y-6">
              {/* Day Grid (quick nav) — hidden in print */}
              <div className="no-print">
                <TokyoDayGrid days={DAYS} />
              </div>

              {/* Immigration card (JP only) */}
              {lang === "jp" && (
                <div className="rounded-[16px] border border-[#64D2FF]/40 bg-[#64D2FF]/12 p-5 md:p-6">
                  <p className="text-[16px] font-bold text-[var(--c-text)] mb-3">旅行情報 — Travel Information</p>
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14px]">
                    <span className="text-[var(--c-text-2)]">旅行者</span>
                    <span className="text-[var(--c-text)] font-medium">4名（大人2名・子供2名）タイ国籍</span>
                    <span className="text-[var(--c-text-2)]">目的</span>
                    <span className="text-[var(--c-text)] font-medium">観光（Sightseeing）</span>
                    <span className="text-[var(--c-text-2)]">滞在期間</span>
                    <span className="text-[var(--c-text)] font-medium">2026年3月1日〜8日（7泊8日）</span>
                    <span className="text-[var(--c-text-2)]">宿泊先</span>
                    <span className="text-[var(--c-text)] font-medium">MONday Apart 浅草橋 秋葉原<br />東京都台東区浅草橋4-15-5</span>
                    <span className="text-[var(--c-text-2)]">往路</span>
                    <span className="text-[var(--c-text)] font-medium">Air Japan XJ 606 DMK→NRT 01:50→10:00</span>
                    <span className="text-[var(--c-text-2)]">復路</span>
                    <span className="text-[var(--c-text)] font-medium">Air Japan XJ 607 NRT→DMK 11:15→16:40</span>
                  </div>
                </div>
              )}

              {/* Trip Summary */}
              <div className="rounded-[18px] border border-[var(--c-accent)]/30 bg-[var(--c-accent-bg)] p-5 md:p-7 print-break-avoid">
                <p className="text-[20px] md:text-[24px] font-bold text-[var(--c-text)] leading-tight">
                  {lang === "jp" ? "旅行日程（8日間）" : "สรุปทริป 8 วัน"}
                </p>
                <p className="text-[13px] text-[var(--c-text-2)] mt-1">
                  {lang === "jp" ? "2026年3月1日〜8日 · 東京 & 近郊" : "1 - 8 มี.ค. 2026 · Tokyo & รอบนอก"}
                </p>
                <div className="mt-4 space-y-2">
                  {TRIP_SUMMARY.map((d) => (
                    <a
                      key={d.day}
                      href={`${isPublic ? "/tokyotripplan" : "/travel/tokyo2026"}/day-${d.day}`}
                      className="flex items-center gap-3 rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-3 hover:bg-[var(--c-fill-3)] active:scale-[0.99] transition-all group"
                    >
                      <span
                        className="shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center text-[16px]"
                        style={{ backgroundColor: `${d.color}40`, border: `1px solid ${d.color}40` }}
                      >
                        {d.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[12px] font-bold px-1.5 py-0.5 rounded-[5px]"
                            style={{ color: d.color, backgroundColor: `${d.color}40` }}
                          >
                            Day {d.day}
                          </span>
                          <span className="text-[12px] text-[var(--c-text-2)]">{lang === "jp" ? d.dateJp : d.date}</span>
                        </div>
                        <p className="text-[14px] font-semibold text-[var(--c-text)] mt-0.5 leading-tight">{lang === "jp" ? d.titleJp : d.title}</p>
                        <p className="text-[12px] text-[var(--c-text-2)] leading-snug">{lang === "jp" ? d.descJp : d.desc}</p>
                      </div>
                      <svg className="w-4 h-4 text-[var(--c-text-3)] shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>

              <div className="no-print">
                <HotelCard hotel={HOTEL} />
              </div>

              {/* Print-only: Hotel info expanded */}
              <div className="print-only hidden rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 print-break-avoid">
                <p className="text-[10pt] uppercase tracking-wide text-[var(--c-text-2)] mb-1">Hotel (7 Nights)</p>
                <p className="text-[13pt] font-semibold text-[var(--c-text)]">{HOTEL.name}</p>
                <div className="grid grid-cols-2 gap-3 mt-3 text-[9pt]">
                  <div>
                    <p className="text-[var(--c-text-2)]">Address (EN)</p>
                    <p className="text-[var(--c-text)]">{HOTEL.addressEn}</p>
                  </div>
                  <div>
                    <p className="text-[var(--c-text-2)]">Address (JP)</p>
                    <p className="text-[var(--c-text)]">{HOTEL.addressJp}</p>
                  </div>
                  <div>
                    <p className="text-[var(--c-text-2)]">Check-in</p>
                    <p className="text-[var(--c-text)]">{HOTEL.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-[var(--c-text-2)]">Check-out</p>
                    <p className="text-[var(--c-text)]">{HOTEL.checkOut}</p>
                  </div>
                </div>
              </div>

              <div className="no-print">
                <p className="text-[16px] font-semibold text-[var(--c-text)]">
                  {lang === "jp" ? "各日の詳細スケジュール" : "รายละเอียดแผนรายวัน"}
                </p>
                <p className="text-[13px] text-[var(--c-text-2)] mt-1">
                  {lang === "jp" ? "上のボタンから日付を選んでください" : "เลือกวันด้านบนเพื่อดูไทม์ไลน์รายวัน"}
                </p>
              </div>
            </div>
          </TokyoZoomWrap>
        )}

        {/* ======== Baggage Tab ======== */}
        {!isPublic && activeTab === "baggage" && (
          <div>
            {/* Sub-tab bar */}
            <div className="flex gap-1 mb-6 border-b border-[var(--c-sep)]">
              {([
                { id: "packing" as const, label: "กระเป๋า", icon: "🧳", count: `${checkedBagCount}/${totalBagItems}` },
                { id: "movies" as const, label: "หนังลงเครื่อง", icon: "📺", count: totalDeviceMovies > 0 ? `${totalDeviceMovies}` : "" },
              ]).map(sub => (
                <button key={sub.id} onClick={() => setBagSub(sub.id)} className={`flex items-center gap-1.5 px-4 py-2.5 text-[16px] font-medium border-b-2 transition-all ${bagSub === sub.id ? "border-[var(--c-accent)] text-[var(--c-accent)]" : "border-transparent text-[var(--c-text-2)] hover:text-[var(--c-text)]"}`}>
                  <span className="text-[17px]">{sub.icon}</span>
                  {sub.label}
                  {sub.count && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[12px] font-bold bg-[var(--c-accent)]/15 text-[var(--c-accent)]">{sub.count}</span>}
                </button>
              ))}
            </div>

            {/* ════ Sub: กระเป๋า ════ */}
            {bagSub === "packing" && (
              <div className="space-y-6">
                {/* Row 1: Progress + Strategy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-[16px] border border-[var(--c-accent)]/40 bg-[var(--c-accent-bg)] p-4 md:p-5">
                    <p className="text-[16px] text-[var(--c-text-2)] mb-3">4 คน &middot; 8 วัน &middot; ขาไป 25 kg (1 ใบ) &middot; ขากลับ 25+20 kg (ซื้อกระเป๋าเพิ่ม)</p>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[15px] text-[var(--c-text-2)]">เตรียมของ</span>
                      <span className="text-[15px] font-bold text-[var(--c-accent)]">{checkedBagCount}/{totalBagItems}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[var(--c-fill-2)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--c-accent)] transition-all duration-300" style={{ width: `${totalBagItems ? (checkedBagCount / totalBagItems) * 100 : 0}%` }} />
                    </div>
                    {checkedBagCount === totalBagItems && totalBagItems > 0 && (
                      <p className="text-[14px] text-[#30D158] font-semibold mt-2">พร้อมบินเลย!</p>
                    )}
                  </div>
                  <div className="rounded-[16px] border border-[#30D158]/40 bg-[#30D158]/12 p-4 md:p-5">
                    <p className="text-[15px] font-semibold text-[#30D158] mb-2.5">กลยุทธ์ &ldquo;1 ใบ 25 kg&rdquo;</p>
                    <div className="space-y-2">
                      {["ขาไป: กระเป๋า 1 ใบ 25 kg — พกเบาๆ", "ขากลับ: ซื้อกระเป๋าเพิ่ม → 25 kg + 20 kg = 45 kg!", "ซื้อเสื้อผ้า UNIQLO/GU ที่ญี่ปุ่น → ไม่ต้องพกจากไทย", "ที่พักมีเครื่องซัก → พก 3-4 ชุดพอ", "ถุงสุญญากาศบีบเสื้อผ้า → ประหยัดพื้นที่ขากลับ"].map((tip, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-[#30D158] text-[15px] mt-0.5">✓</span>
                          <p className="text-[15px] text-[var(--c-text)] leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 2: Checklist */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {BAG_SECTIONS.map(sec => {
                    const secChecked = sec.items.filter(i => checkedBag.has(i.id)).length;
                    const isOpen = expandedBag === sec.id;
                    return (
                      <div key={sec.id} className={`rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] overflow-hidden ${isOpen ? "lg:col-span-2" : ""}`}>
                        <button onClick={() => setExpandedBag(isOpen ? null : sec.id)} className="w-full flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-[var(--c-fill-3)] transition-colors active:bg-[var(--c-fill-2)]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[18px]">{sec.icon}</span>
                            <span className="text-[16px] font-semibold text-[var(--c-text)] truncate">{sec.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded-full text-[13px] font-bold" style={{ backgroundColor: secChecked === sec.items.length ? "#30D15830" : `${sec.color}30`, color: secChecked === sec.items.length ? "#30D158" : sec.color }}>{secChecked}/{sec.items.length}</span>
                            <svg className={`w-3.5 h-3.5 text-[var(--c-text-3)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-3 pb-3 grid grid-cols-1 md:grid-cols-2 gap-1.5">
                            {sec.items.map(item => {
                              const done = checkedBag.has(item.id);
                              return (
                                <button key={item.id} onClick={() => toggleBag(item.id)} className={`w-full flex items-start gap-2.5 rounded-[10px] px-3 py-2.5 text-left transition-all ${done ? "bg-[#30D158]/22 border border-[#30D158]/30" : "bg-[var(--c-subtle-card)] border border-[var(--c-sep)] hover:bg-[var(--c-fill-3)]"}`}>
                                  <span className={`mt-0.5 w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 text-[13px] font-bold transition-all ${done ? "bg-[#30D158] text-white" : "border-2 border-[var(--c-text-3)]"}`}>{done && "✓"}</span>
                                  <div className="min-w-0 flex-1">
                                    <p className={`text-[15px] font-medium leading-tight transition-all ${done ? "line-through text-[var(--c-text-2)]" : "text-[var(--c-text)]"}`}>{item.name}</p>
                                    {item.note && <p className="text-[13px] text-[var(--c-text-2)] mt-0.5 leading-snug">{item.note}</p>}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Row 3: Buy Japan + Timeline + Top 5 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-[16px] border border-[#BF5AF2]/40 bg-[#BF5AF2]/12 p-4 md:p-5">
                    <p className="text-[15px] font-semibold text-[var(--c-text)] mb-1">ไปซื้อที่ญี่ปุ่น!</p>
                    <p className="text-[14px] text-[var(--c-text-2)] mb-3">ลดน้ำหนักขาไป เพิ่มพื้นที่ขากลับ</p>
                    <div className="space-y-1.5">
                      {BAG_BUY_JP.map(item => (
                        <div key={item.name} className="flex items-center gap-2.5 rounded-[10px] bg-[#BF5AF2]/22 border border-[#BF5AF2]/30 px-3 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-medium text-[var(--c-text)]">{item.name}</p>
                            <p className="text-[13px] text-[var(--c-text-2)]">{item.where}{item.price ? ` · ${item.price}` : ""}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-[#BF5AF2]/22 text-[#BF5AF2] shrink-0">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-5">
                      <p className="text-[15px] font-semibold text-[var(--c-text)] mb-3">Timeline ก่อนบิน</p>
                      <div className="space-y-3">
                        {BAG_TIMELINE.map(phase => (
                          <div key={phase.label}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="px-2.5 py-0.5 rounded-full text-[13px] font-bold" style={{ backgroundColor: `${phase.color}30`, color: phase.color }}>{phase.label}</span>
                              <span className="text-[13px] text-[var(--c-text-2)]">{phase.date}</span>
                            </div>
                            <div className="space-y-1 pl-0.5">
                              {phase.tasks.map((task, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: phase.color }} />
                                  <span className="text-[14px] text-[var(--c-text)]">{task}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[16px] border border-[#FF453A]/40 bg-[#FF453A]/12 p-4">
                      <p className="text-[16px] font-semibold text-[#FF453A] mb-2.5">ห้ามลืม!</p>
                      <div className="space-y-1.5">
                        {[
                          { icon: "🛂", text: "พาสปอร์ต 4 เล่ม" },
                          { icon: "👓", text: "คอนแทค + น้ำยา + กล่องแว่น" },
                          { icon: "📱", text: "iPad + การ์ตูน offline + หูฟัง" },
                          { icon: "🔋", text: "Power bank (เป้ขึ้นเครื่อง ห้ามโหลด)" },
                          { icon: "💴", text: "เงินเยนสด + บัตรเครดิต" },
                          { icon: "📶", text: "eSIM ติดตั้ง + ทดสอบแล้ว" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-[8px] bg-[#FF453A]/15 px-3 py-2">
                            <span className="text-[16px]">{item.icon}</span>
                            <p className="text-[14px] text-[var(--c-text)]">{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {checkedBagCount > 0 && (
                  <button onClick={() => { setCheckedBag(new Set()); localStorage.removeItem("tk26-bag"); }} className="w-full py-2.5 rounded-[12px] text-[15px] font-medium text-[var(--c-text-2)] bg-[var(--c-fill-2)] hover:bg-[var(--c-fill)] transition-colors">
                    รีเซ็ต checklist ทั้งหมด
                  </button>
                )}
              </div>
            )}

            {/* ════ Sub: หนังลงเครื่อง ════ */}
            {bagSub === "movies" && (
              <div className="space-y-6">
                {/* Device tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {DEVICES.map(dev => {
                    const count = deviceMovies[dev.id]?.length || 0;
                    return (
                      <button key={dev.id} onClick={() => { setActiveDevice(dev.id); setMovieQuery(""); setMovieResults([]); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[16px] font-medium whitespace-nowrap transition-all ${activeDevice === dev.id ? "bg-[var(--c-accent)] text-white shadow-md" : "bg-[var(--c-fill-2)] text-[var(--c-text-2)] hover:bg-[var(--c-fill)]"}`}>
                        {dev.icon} {dev.label}
                        {count > 0 && <span className={`px-2 py-0.5 rounded-full text-[13px] font-bold ${activeDevice === dev.id ? "bg-white/25 text-white" : "bg-[var(--c-accent)]/15 text-[var(--c-accent)]"}`}>{count}/7</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <div>
                  <div className="flex items-center gap-2.5 rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] px-4 py-3">
                    <svg className="w-5 h-5 text-[var(--c-text-3)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                      type="text"
                      value={movieQuery}
                      onChange={e => searchMovies(e.target.value)}
                      placeholder="ค้นหาหนัง เช่น Frozen, Moana, Spider-Man..."
                      className="flex-1 bg-transparent text-[15px] text-[var(--c-text)] placeholder:text-[var(--c-text-3)] outline-none"
                    />
                    {movieQuery && (
                      <button onClick={() => { setMovieQuery(""); setMovieResults([]); }} className="text-[var(--c-text-3)] hover:text-[var(--c-text)] p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                    {searchingMovies && <span className="w-5 h-5 border-2 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin shrink-0" />}
                  </div>

                  {/* Search results — full width grid */}
                  {movieResults.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                      {movieResults.map(r => {
                        const alreadyAdded = (deviceMovies[activeDevice] || []).some(m => m.id === r.id);
                        const isFull = (deviceMovies[activeDevice] || []).length >= 7;
                        return (
                          <button
                            key={r.id}
                            disabled={alreadyAdded || isFull}
                            onClick={() => addMovieToDevice(r)}
                            className={`rounded-[14px] border overflow-hidden transition-all text-left ${alreadyAdded ? "border-[#30D158]/40 opacity-60" : isFull ? "border-[var(--c-sep)] opacity-40" : "border-[var(--c-sep)] bg-[var(--c-card-alt)] hover:border-[var(--c-accent)]/50 hover:shadow-lg active:scale-[0.97]"}`}
                          >
                            {r.poster_path ? (
                              <img src={`${POSTER_SM}${r.poster_path}`} alt="" className="w-full aspect-[2/3] object-cover bg-[var(--c-fill-2)]" />
                            ) : (
                              <div className="w-full aspect-[2/3] bg-[var(--c-fill-2)] flex items-center justify-center text-[20px] text-[var(--c-text-3)]">🎬</div>
                            )}
                            <div className="p-2">
                              <p className="text-[12px] font-semibold text-[var(--c-text)] leading-snug line-clamp-2">{r.title}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-[11px] text-[var(--c-star)]">★</span>
                                <span className="text-[11px] text-[var(--c-text-2)]">{r.vote_average?.toFixed(1) || "?"}</span>
                                <span className="text-[11px] text-[var(--c-text-3)]">&middot;</span>
                                <span className="text-[11px] text-[var(--c-text-2)]">{r.release_date?.slice(0, 4) || "?"}</span>
                              </div>
                              {alreadyAdded && <p className="text-[11px] font-bold text-[#30D158] mt-1">เพิ่มแล้ว ✓</p>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Movie list for active device */}
                {(() => {
                  const movies = deviceMovies[activeDevice] || [];
                  const devLabel = DEVICES.find(d => d.id === activeDevice)?.label || "";
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[16px] font-bold text-[var(--c-text)]">{devLabel}</p>
                        <span className="text-[15px] text-[var(--c-text-2)]">{movies.length}/7 เรื่อง</span>
                      </div>

                      {movies.length === 0 ? (
                        <div className="rounded-[16px] border border-dashed border-[var(--c-sep)] bg-[var(--c-card-alt)] py-12 text-center">
                          <p className="text-[28px] mb-2">🎬</p>
                          <p className="text-[16px] text-[var(--c-text-3)]">ยังไม่มีหนัง — ค้นหาเพื่อเพิ่ม</p>
                        </div>
                      ) : (
                        <>
                          {/* Big poster preview — horizontal scroll */}
                          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth mb-4" style={{ scrollbarWidth: "thin" }}>
                            {movies.map(movie => (
                              <div key={movie.id} className="w-[120px] md:w-[150px] lg:w-[170px] shrink-0 snap-start">
                                {movie.poster ? (
                                  <img src={`${POSTER_LG}${movie.poster}`} alt="" className="w-full aspect-[2/3] rounded-[12px] object-cover bg-[var(--c-fill-2)] shadow-lg" />
                                ) : (
                                  <div className="w-full aspect-[2/3] rounded-[12px] bg-[var(--c-fill-2)] flex items-center justify-center text-[24px]">🎬</div>
                                )}
                                <p className="text-[14px] md:text-[15px] font-semibold text-[var(--c-text)] text-center mt-2 leading-snug line-clamp-2">{movie.title}</p>
                                {movie.providers.length > 0 && (
                                  <div className="flex justify-center gap-1 mt-1 flex-wrap">
                                    {movie.providers.map(p => (
                                      <span key={p} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[var(--c-fill-2)] text-[var(--c-text-2)]">{p}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Compact list with reorder + delete */}
                          <div className="space-y-1.5">
                            {movies.map((movie, idx) => (
                              <div key={movie.id} className="flex items-center gap-3 rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] px-3 py-2.5">
                                <span className="text-[15px] font-bold text-[var(--c-text-3)] w-5 text-center shrink-0">{idx + 1}</span>
                                {movie.poster ? (
                                  <img src={`${POSTER_SM}${movie.poster}`} alt="" className="w-[34px] h-[51px] rounded-[6px] object-cover shrink-0 bg-[var(--c-fill-2)]" />
                                ) : (
                                  <div className="w-[34px] h-[51px] rounded-[6px] bg-[var(--c-fill-2)] shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-[15px] font-semibold text-[var(--c-text)] truncate">{movie.title}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className="text-[13px] text-[var(--c-text-2)]">{movie.year}</span>
                                    {movie.providers.map(p => (
                                      <span key={p} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[var(--c-fill-2)] text-[var(--c-text-2)]">{p}</span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button onClick={() => reorderMovie(activeDevice, movie.id, "up")} disabled={idx === 0} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${idx === 0 ? "text-[var(--c-text-3)]/20" : "text-[var(--c-text-3)] hover:bg-[var(--c-fill-2)]"}`}>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                                  </button>
                                  <button onClick={() => reorderMovie(activeDevice, movie.id, "down")} disabled={idx === movies.length - 1} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${idx === movies.length - 1 ? "text-[var(--c-text-3)]/20" : "text-[var(--c-text-3)] hover:bg-[var(--c-fill-2)]"}`}>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                  </button>
                                  <button onClick={() => removeMovie(activeDevice, movie.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--c-text-3)] hover:bg-[#FF453A]/18 hover:text-[#FF453A] transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* All devices summary */}
                {totalDeviceMovies > 0 && (
                  <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-5">
                    <p className="text-[16px] font-semibold text-[var(--c-text)] mb-4">สรุปทุกเครื่อง</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {DEVICES.map(dev => {
                        const movies = deviceMovies[dev.id] || [];
                        return (
                          <div key={dev.id} className={`rounded-[12px] border p-3 ${movies.length > 0 ? "border-[var(--c-accent)]/30 bg-[var(--c-accent)]/3" : "border-[var(--c-sep)] bg-[var(--c-subtle-card)]"}`}>
                            <p className="text-[14px] font-semibold text-[var(--c-text)] mb-2">{dev.icon} {dev.label}</p>
                            {movies.length === 0 ? (
                              <p className="text-[13px] text-[var(--c-text-3)]">ยังว่าง</p>
                            ) : (
                              <div className="space-y-1">
                                {movies.map(m => (
                                  <p key={m.id} className="text-[13px] text-[var(--c-text-2)] truncate">{m.title}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── แนะนำหนังสำหรับครอบครัว ── */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1 bg-[var(--c-sep)]" />
                    <span className="text-[14px] font-semibold text-[var(--c-text-2)] px-2">แนะนำสำหรับครอบครัว</span>
                    <div className="h-px flex-1 bg-[var(--c-sep)]" />
                  </div>

                  {/* Family tabs */}
                  <div className="flex gap-1 mb-2 bg-[var(--c-fill-3)] rounded-xl p-1">
                    {FAMILY_SUGGEST.map(f => (
                      <button key={f.key} onClick={() => setSuggestTab(f.key)} className={`flex-1 py-2.5 rounded-lg text-[14px] font-medium transition-all flex items-center justify-center gap-1.5 ${suggestTab === f.key ? "bg-[var(--c-accent)] text-white shadow-sm" : "text-[var(--c-text-2)] hover:text-[var(--c-text)]"}`}>
                        <span className="text-[16px]">{f.emoji}</span> {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Subtitle + random */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <p className="text-[13px] text-[var(--c-text-2)]">{FAMILY_SUGGEST.find(f => f.key === suggestTab)?.desc}</p>
                    <button onClick={() => loadSuggest(suggestTab, true)} disabled={suggestLoading[suggestTab]} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--c-accent-bg)] text-[var(--c-accent)] text-[13px] font-semibold active:opacity-70 disabled:opacity-40 transition-colors">
                      🎲 สุ่มใหม่
                    </button>
                  </div>

                  {/* Movie grid — full width */}
                  {suggestLoading[suggestTab] ? (
                    <div className="flex justify-center py-10">
                      <div className="w-6 h-6 border-2 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : !suggestMovies[suggestTab] || suggestMovies[suggestTab].length === 0 ? (
                    <div className="text-center py-10 text-[var(--c-text-3)] text-[14px]">กำลังโหลด...</div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                      {suggestMovies[suggestTab].map(movie => {
                        const alreadyAdded = (deviceMovies[activeDevice] || []).some(m => m.id === movie.id);
                        const isFull = (deviceMovies[activeDevice] || []).length >= 7;
                        return (
                          <button
                            key={movie.id}
                            disabled={alreadyAdded || isFull}
                            onClick={() => addMovieToDevice(movie)}
                            className={`rounded-[14px] border overflow-hidden transition-all text-left ${alreadyAdded ? "border-[#30D158]/40 opacity-60" : isFull ? "border-[var(--c-sep)] opacity-40" : "border-[var(--c-sep)] bg-[var(--c-card-alt)] hover:border-[var(--c-accent)]/50 hover:shadow-lg active:scale-[0.97]"}`}
                          >
                            {movie.poster_path ? (
                              <img src={`${POSTER_SM}${movie.poster_path}`} alt="" className="w-full aspect-[2/3] object-cover bg-[var(--c-fill-2)]" />
                            ) : (
                              <div className="w-full aspect-[2/3] bg-[var(--c-fill-2)] flex items-center justify-center text-[20px] text-[var(--c-text-3)]">🎬</div>
                            )}
                            <div className="p-2">
                              <p className="text-[12px] font-semibold text-[var(--c-text)] leading-snug line-clamp-2">{movie.title}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-[11px] text-[var(--c-star)]">★</span>
                                <span className="text-[11px] text-[var(--c-text-2)]">{movie.vote_average?.toFixed(1) || "?"}</span>
                                <span className="text-[11px] text-[var(--c-text-3)]">&middot;</span>
                                <span className="text-[11px] text-[var(--c-text-2)]">{movie.release_date?.slice(0, 4) || "?"}</span>
                              </div>
                              {alreadyAdded && <p className="text-[11px] font-bold text-[#30D158] mt-1">เพิ่มแล้ว ✓</p>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
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
                <div className="rounded-[18px] border border-[#FF9F0A]/40 bg-[#FF9F0A]/12 p-5 md:p-7">
                  <p className="text-[22px] md:text-[28px] font-bold text-[var(--c-text)] leading-tight">ร้านอาหารใกล้โรงแรม</p>
                  <p className="text-[14px] text-[var(--c-text-2)] mt-1">แถว Asakusabashi &middot; เดินไม่ถึง 5 นาที &middot; ราคาประหยัด</p>
                </div>
                <div className="space-y-3">
                  {NEAR_HOTEL.map((r) => (
                    <div key={r.name} className={`rounded-[16px] border p-4 md:p-5 ${r.tag === "แนะนำ อันดับ 1!" ? "border-[#FF9F0A]/40 bg-[#FF9F0A]/12" : "border-[var(--c-sep)] bg-[var(--c-card-alt)]"}`}>
                      <div className="flex items-center gap-2.5 flex-wrap mb-2">
                        <span className="text-[22px]">{r.icon}</span>
                        <span className="text-[16px] font-semibold text-[var(--c-text)]">{r.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.tag === "แนะนำ อันดับ 1!" ? "bg-[#FF9F0A]/22 text-[#FF9F0A]" :
                          r.tag === "24 ชม." || r.tag === "ซุปเปอร์ 24 ชม." ? "bg-[#30D158]/22 text-[#30D158]" :
                          r.tag === "เปิดดึก" ? "bg-[#BF5AF2]/22 text-[#BF5AF2]" :
                          "bg-[#64D2FF]/22 text-[#64D2FF]"
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
                <div className="rounded-[12px] border border-[#30D158]/35 bg-[#30D158]/12 p-4">
                  <p className="text-[13px] text-[#30D158] font-medium">Tip: LIFE Kanda-Izumicho ซุปเปอร์ใหญ่ ของครบ ถูกกว่าร้านสะดวกซื้อ แวะซื้อน้ำ/ขนม/สตรอว์เบอร์รี่ตุนเข้าตู้เย็นได้เลย</p>
                </div>
              </div>
            )}

            {/* --- Shopping sub-tab --- */}
            {highlightSub === "shopping" && (
              <div className="space-y-5">
                <div className="rounded-[18px] border border-[#BF5AF2]/40 bg-[#BF5AF2]/12 p-5 md:p-7">
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
                            <div className="rounded-[8px] bg-[#30D158]/22 border border-[#30D158]/30 p-3">
                              <p className="text-[11px] text-[#30D158]">Tax Free (ลด 10%)</p>
                              <p className="text-[15px] font-semibold text-[#30D158]">{m.taxFree} บาท</p>
                            </div>
                            <div className="rounded-[8px] bg-[#FF9F0A]/8 border border-[#FF9F0A]/30 p-3">
                              <p className="text-[11px] text-[#FF9F0A]">ประหยัดได้</p>
                              <p className="text-[15px] font-semibold text-[#FF9F0A]">{m.save} บาท</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="rounded-[12px] border border-[#30D158]/35 bg-[#30D158]/12 p-4">
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
                <div className="rounded-[18px] border border-[#30D158]/40 bg-[#30D158]/12 p-5 md:p-7">
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
                          section.category === "จ่ายแล้ว" ? "bg-[#30D158]/18 text-[#30D158]" : "bg-[#FF9F0A]/18 text-[#FF9F0A]"
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
