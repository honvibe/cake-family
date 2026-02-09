import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = Redis.fromEnv();

export const dynamic = "force-dynamic";

const SHORT_DAYS = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

interface NotifySettings {
  enabled: boolean;
}

interface ScheduleEntry {
  morning: string;
  evening: string;
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

    // Next Monday (Saturday + 2 days) in Thailand timezone
    const now = new Date();
    const thNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const daysUntilMonday = (8 - thNow.getUTCDay()) % 7 || 7;
    const monday = new Date(thNow);
    monday.setUTCDate(monday.getUTCDate() + daysUntilMonday);

    const schedule = (await redis.get("cake-schedule")) as Record<string, ScheduleEntry> | null;

    // Check which days are missing assignments
    const missing: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + i);
      const entry = schedule?.[formatDateKey(d)];
      if (!entry?.morning || !entry?.evening) {
        missing.push(SHORT_DAYS[i]);
      }
    }

    if (missing.length === 0) {
      return NextResponse.json({ status: "skipped", reason: "all assigned" });
    }

    const message = `📢 Hon Jay อย่าลืม assign ตารางด้วยนะ ยัง assign ไม่ครบครับ\n(เหลือ ${missing.join(", ")} ยังไม่มีคนขับ)`;

    const token = process.env.LINE_CHANNEL_TOKEN;
    const groupId = process.env.LINE_GROUP_ID;
    if (!token || !groupId) {
      return NextResponse.json({ error: "Missing LINE config" }, { status: 500 });
    }

    const lineRes = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ to: groupId, messages: [{ type: "text", text: message }] }),
    });

    if (!lineRes.ok) {
      const err = await lineRes.text();
      console.error("[cron-remind] LINE API error:", err);
      return NextResponse.json({ error: "LINE API error", detail: err }, { status: 500 });
    }

    return NextResponse.json({ status: "sent", missing, message });
  } catch (e) {
    console.error("[cron-remind] Error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
