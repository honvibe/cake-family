import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = Redis.fromEnv();

export const dynamic = "force-dynamic";

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

const DRIVER_SQUARE: Record<string, string> = {
  Hon: "🟨",
  Jay: "🟥",
  JH: "🟩",
};

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildWeeklyMessage(weekStart: Date, schedule: Record<string, ScheduleEntry> | null): string {
  const endDate = new Date(weekStart);
  endDate.setDate(endDate.getDate() + 6);

  const startDay = weekStart.getDate();
  const endDay = endDate.getDate();
  const mStart = THAI_MONTHS_SHORT[weekStart.getMonth()];
  const mEnd = THAI_MONTHS_SHORT[endDate.getMonth()];

  const dateRange = mStart === mEnd
    ? `${startDay}-${endDay} ${mStart}`
    : `${startDay} ${mStart} - ${endDay} ${mEnd}`;

  const lines: string[] = [`📋 ${dateRange}`];

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const key = formatDateKey(d);
    const entry = schedule?.[key];

    const mSq = entry?.morning ? (DRIVER_SQUARE[entry.morning] || "⬜") : "⬜";
    const eSq = entry?.evening ? (DRIVER_SQUARE[entry.evening] || "⬜") : "⬜";

    lines.push(`${SHORT_DAYS[i]} ${mSq}${eSq}`);
  }

  lines.push("─");
  lines.push("🟨H 🟥J 🟩JH (เช้า|เย็น)");

  return lines.join("\n");
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

    // Calculate upcoming Monday in Thailand timezone (UTC+7)
    const now = new Date();
    const thNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const dayOfWeek = thNow.getUTCDay(); // 0=Sun
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const monday = new Date(thNow);
    monday.setUTCDate(monday.getUTCDate() + daysUntilMonday);
    const weekStart = new Date(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate());

    const schedule = (await redis.get("cake-schedule")) as Record<string, ScheduleEntry> | null;
    const message = buildWeeklyMessage(weekStart, schedule);

    const token = process.env.LINE_CHANNEL_TOKEN;
    const groupId = process.env.LINE_GROUP_ID;

    if (!token || !groupId) {
      return NextResponse.json({ error: "Missing LINE_CHANNEL_TOKEN or LINE_GROUP_ID" }, { status: 500 });
    }

    const lineRes = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: groupId,
        messages: [{ type: "text", text: message }],
      }),
    });

    if (!lineRes.ok) {
      const err = await lineRes.text();
      console.error("[cron-notify] LINE API error:", err);
      return NextResponse.json({ error: "LINE API error", detail: err }, { status: 500 });
    }

    return NextResponse.json({ status: "sent", message });
  } catch (e) {
    console.error("[cron-notify] Error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
