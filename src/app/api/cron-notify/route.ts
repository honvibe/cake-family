import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = Redis.fromEnv();

export const dynamic = "force-dynamic";

const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];
const SHORT_DAYS = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

interface NotifySettings {
  enabled: boolean;
  hour?: number;
  minute?: number;
}

interface ScheduleEntry {
  morning: string;
  evening: string;
  fuel: string;
  mileage: string;
  remarks: Partial<Record<"Hon" | "Jay" | "JH", string>>;
  emojis?: string[];
}

const DRIVER_EMOJI: Record<string, string> = { Hon: "🟡", Jay: "🔴", JH: "🟢" };
const DRIVER_SQUARE: Record<string, string> = { Hon: "🟨", Jay: "🟥", JH: "🟩" };

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function driverLabel(name: string): string {
  if (!name) return "-";
  const emoji = DRIVER_EMOJI[name] || "";
  return emoji ? `${emoji} ${name}` : name;
}

function formatMileage(val: string): string {
  const n = parseInt(val, 10);
  if (isNaN(n)) return "-";
  return n.toLocaleString("en-US");
}

// ── Daily: tomorrow's detail ──
function buildDailyMessage(tomorrow: Date, entry: ScheduleEntry | null): string {
  const dayName = THAI_DAYS[tomorrow.getDay()];
  const day = tomorrow.getDate();
  const monthName = THAI_MONTHS_SHORT[tomorrow.getMonth()];

  const morning = driverLabel(entry?.morning || "");
  const evening = driverLabel(entry?.evening || "");
  const fuel = entry?.fuel || "-";
  const mileage = entry?.mileage ? formatMileage(entry.mileage) : "-";

  const lines: string[] = [
    `📌 พรุ่งนี้ วัน${dayName} ${day} ${monthName}`,
    `เช้า ${morning} | เย็น ${evening}`,
  ];

  if (fuel !== "-" && fuel) lines.push(`⛽ ${fuel} ลิตร`);
  if (mileage !== "-") lines.push(`🔢 ${mileage} km`);

  // remarks
  if (entry?.emojis?.length) lines.push(entry.emojis.join(" "));
  if (entry?.remarks) {
    for (const [driver, note] of Object.entries(entry.remarks)) {
      if (note) {
        const sq = DRIVER_SQUARE[driver] || "";
        lines.push(`${sq}${driver}: ${note}`);
      }
    }
  }

  return lines.join("\n");
}

// ── Weekly: compact overview จ-อา ──
function buildWeeklyMessage(weekStart: Date, schedule: Record<string, ScheduleEntry> | null): string {
  const endDate = new Date(weekStart);
  endDate.setDate(endDate.getDate() + 6);

  const mStart = THAI_MONTHS_SHORT[weekStart.getMonth()];
  const mEnd = THAI_MONTHS_SHORT[endDate.getMonth()];
  const dateRange = mStart === mEnd
    ? `${weekStart.getDate()}-${endDate.getDate()} ${mStart}`
    : `${weekStart.getDate()} ${mStart} - ${endDate.getDate()} ${mEnd}`;

  const lines: string[] = [`📋 ตาราง ${dateRange}`];

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const entry = schedule?.[formatDateKey(d)];
    const mSq = entry?.morning ? (DRIVER_SQUARE[entry.morning] || "⬜") : "⬜";
    const eSq = entry?.evening ? (DRIVER_SQUARE[entry.evening] || "⬜") : "⬜";
    lines.push(`${SHORT_DAYS[i]} ${mSq}${eSq}`);
  }

  lines.push("─");
  lines.push("🟨H 🟥J 🟩JH (เช้า|เย็น)");

  return lines.join("\n");
}

// ── Helper: send LINE message ──
async function sendLine(token: string, groupId: string, text: string) {
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: groupId, messages: [{ type: "text", text }] }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = (await redis.get("cake-notify-settings")) as NotifySettings | null;
    if (!settings?.enabled) {
      return NextResponse.json({ status: "skipped", reason: "disabled" });
    }

    const token = process.env.LINE_CHANNEL_TOKEN;
    const groupId = process.env.LINE_GROUP_ID;
    if (!token || !groupId) {
      return NextResponse.json({ error: "Missing LINE config" }, { status: 500 });
    }

    // Thailand time (UTC+7)
    const now = new Date();
    const thNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const isSunday = thNow.getUTCDay() === 0;

    // Tomorrow
    const tmr = new Date(thNow);
    tmr.setUTCDate(tmr.getUTCDate() + 1);
    const tomorrowDate = new Date(tmr.getUTCFullYear(), tmr.getUTCMonth(), tmr.getUTCDate());
    const dateKey = formatDateKey(tomorrowDate);

    const schedule = (await redis.get("cake-schedule")) as Record<string, ScheduleEntry> | null;
    const sent: string[] = [];

    // Sunday → send weekly overview first
    if (isSunday) {
      const monday = tomorrowDate; // tomorrow is Monday
      const weeklyMsg = buildWeeklyMessage(monday, schedule);
      await sendLine(token, groupId, weeklyMsg);
      sent.push("weekly");
    }

    // Every day → send daily for tomorrow
    const dailyMsg = buildDailyMessage(tomorrowDate, schedule?.[dateKey] || null);
    await sendLine(token, groupId, dailyMsg);
    sent.push("daily");

    return NextResponse.json({ status: "sent", sent, dateKey });
  } catch (e) {
    console.error("[cron-notify] Error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
