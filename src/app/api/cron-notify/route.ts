import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = Redis.fromEnv();

export const dynamic = "force-dynamic";

const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

interface NotifySettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

interface ScheduleEntry {
  morning: string;
  evening: string;
  fuel: string;
  mileage: string;
  remarks: Partial<Record<"Hon" | "Jay" | "JH", string>>;
  emojis?: string[];
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DRIVER_EMOJI: Record<string, string> = {
  Hon: "🟡",
  Jay: "🔴",
  JH: "🟢",
};

const DRIVER_SQUARE: Record<string, string> = {
  Hon: "🟨",
  Jay: "🟥",
  JH: "🟩",
};

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

function buildMessage(tomorrow: Date, entry: ScheduleEntry | null): string {
  const dayName = THAI_DAYS[tomorrow.getDay()];
  const day = tomorrow.getDate();
  const monthName = THAI_MONTHS_SHORT[tomorrow.getMonth()];
  const year = tomorrow.getFullYear();

  const dateLine = `【วัน${dayName} ${day} ${monthName} ${year}】`;

  const morning = driverLabel(entry?.morning || "");
  const evening = driverLabel(entry?.evening || "");
  const fuel = entry?.fuel || "-";
  const mileage = entry?.mileage ? formatMileage(entry.mileage) : "-";

  const lines: string[] = [
    dateLine,
    "----------",
    `ไปส่ง เช้า: ${morning} | ไปรับ เย็น: ${evening}`,
    "----------",
    `เติมน้ำมัน: ${fuel !== "-" && fuel ? fuel + " ลิตร" : "-"}`,
    `เลขไมล์: ${mileage}`,
    "----------",
  ];

  // Remarks section
  const hasEmojis = entry?.emojis && entry.emojis.length > 0;
  const hasRemarks = entry?.remarks && Object.values(entry.remarks).some((v) => v);

  if (hasEmojis || hasRemarks) {
    lines.push("Remark");
    if (hasEmojis) {
      lines.push(entry!.emojis!.join(" "));
    }
    if (hasRemarks) {
      for (const [driver, note] of Object.entries(entry!.remarks)) {
        if (note) {
          const sq = DRIVER_SQUARE[driver] || "";
          lines.push(`${sq} ${driver}: ${note}`);
        }
      }
    }
  }

  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (Vercel sets Authorization header)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Read settings
    const settings = (await redis.get("cake-notify-settings")) as NotifySettings | null;
    if (!settings?.enabled) {
      return NextResponse.json({ status: "skipped", reason: "disabled" });
    }

    // 2. Calculate tomorrow in Thailand timezone (UTC+7)
    const now = new Date();
    const thNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const tomorrow = new Date(thNow);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const dateKey = formatDateKey(
      new Date(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate())
    );

    // 3. Read schedule
    const schedule = (await redis.get("cake-schedule")) as Record<string, ScheduleEntry> | null;
    const entry = schedule?.[dateKey] || null;

    // 4. Format message
    const tomorrowDate = new Date(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate());
    const message = buildMessage(tomorrowDate, entry);

    // 5. Send to LINE
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

    return NextResponse.json({ status: "sent", dateKey, message });
  } catch (e) {
    console.error("[cron-notify] Error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
