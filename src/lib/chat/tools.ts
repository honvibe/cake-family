import { Redis } from "@upstash/redis";
import { ScheduleData, ScheduleEntry, Driver } from "./types";

const redis = Redis.fromEnv();
const KEY = "cake-schedule";

// ===== Tool declarations สำหรับ OpenAI-compatible API (Groq) =====

export const toolDeclarations = [
  {
    type: "function" as const,
    function: {
      name: "get_schedule_today",
      description: "ดูข้อมูลวันนี้ทั้งหมด: ตารางรับส่งลูก, น้ำมัน, เลขไมล์, กิจกรรม, หมายเหตุ",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_schedule_date",
      description: "ดูข้อมูลวันที่ระบุ: ตารางรับส่ง, น้ำมัน, เลขไมล์, กิจกรรม, หมายเหตุ",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "วันที่ YYYY-MM-DD เช่น 2026-02-15" },
        },
        required: ["date"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_schedule_week",
      description: "ดูข้อมูลทั้งสัปดาห์: ตารางรับส่ง, น้ำมัน, กิจกรรมทุกวัน",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "วันที่ใดก็ได้ในสัปดาห์นั้น (YYYY-MM-DD) ถ้าไม่ระบุจะใช้สัปดาห์ปัจจุบัน" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_schedule",
      description: "เปลี่ยนคนขับรับส่งลูก (เช้าหรือเย็น) ของวันที่ระบุ",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "วันที่ YYYY-MM-DD" },
          slot: { type: "string", description: "morning (เช้า) หรือ evening (เย็น)", enum: ["morning", "evening"] },
          driver: { type: "string", description: "ชื่อคนขับ: Hon, Jay, JH หรือค่าว่างถ้าต้องการลบ", enum: ["Hon", "Jay", "JH", ""] },
        },
        required: ["date", "slot", "driver"],
      },
    },
  },
];

// ===== Tool implementations =====

async function getScheduleData(): Promise<ScheduleData> {
  const data = await redis.get<ScheduleData>(KEY);
  return data || {};
}

async function saveScheduleData(data: ScheduleData): Promise<void> {
  await redis.set(KEY, data);
}

function getTodayISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
}

function getWeekDates(dateStr?: string): string[] {
  const base = dateStr ? new Date(dateStr + "T00:00:00+07:00") : new Date();
  const day = base.getDay(); // 0=Sun
  const monday = new Date(base);
  monday.setDate(base.getDate() - ((day + 6) % 7));

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }));
  }
  return dates;
}

const DAY_NAMES_TH = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

const EMOJI_LABELS: Record<string, string> = {
  "🥚": "ไข่",
  "❤️": "หัวใจ",
  "🩸": "ประจำเดือน",
};

function formatEntry(date: string, entry: ScheduleEntry | undefined, detailed: boolean = false): string {
  const d = new Date(date + "T00:00:00+07:00");
  const dayName = DAY_NAMES_TH[(d.getDay() + 6) % 7];
  const morning = entry?.morning || "(ว่าง)";
  const evening = entry?.evening || "(ว่าง)";

  let result = `${dayName} ${date}:\n  รับเช้า: ${morning} | ส่งเย็น: ${evening}`;

  if (!entry) return result;

  // น้ำมัน + เลขไมล์
  if (entry.fuel) result += `\n  น้ำมัน: ${entry.fuel} ลิตร`;
  if (entry.mileage) result += `\n  เลขไมล์: ${entry.mileage} km`;

  // Emojis
  if (entry.emojis && entry.emojis.length > 0) {
    const labels = entry.emojis.map(e => EMOJI_LABELS[e] || e).join(", ");
    result += `\n  สัญลักษณ์: ${entry.emojis.join("")} (${labels})`;
  }

  // กิจกรรม
  if (entry.events && entry.events.length > 0) {
    result += `\n  กิจกรรม:`;
    for (const ev of entry.events) {
      const time = ev.time ? `${ev.time}${ev.endTime ? `-${ev.endTime}` : ""}` : "ทั้งวัน";
      result += `\n    - ${ev.detail} (${ev.driver}, ${time})`;
    }
  }

  // หมายเหตุ (detailed only)
  if (detailed && entry.remarks) {
    const remarksArr = Object.entries(entry.remarks).filter(([, v]) => v);
    if (remarksArr.length > 0) {
      result += `\n  หมายเหตุ:`;
      for (const [who, text] of remarksArr) {
        result += `\n    - ${who}: ${text}`;
      }
    }
  }

  return result;
}

// สำหรับ fallback (ไม่มี tool calling) → inject ข้อมูลลง prompt แทน
export async function getScheduleContext(): Promise<string> {
  const schedule = await getScheduleData();
  const today = getTodayISO();
  const weekDates = getWeekDates(today);

  const todayEntry = formatEntry(today, schedule[today], true);
  const weekEntries = weekDates
    .filter(d => d !== today)
    .map(d => formatEntry(d, schedule[d], false))
    .join("\n\n");

  return `[ข้อมูลตารางรับส่งวันนี้]\n${todayEntry}\n\n[ตารางทั้งสัปดาห์]\n${weekEntries}`;
}

export async function executeTool(
  name: string,
  args: Record<string, string>
): Promise<string> {
  const schedule = await getScheduleData();

  switch (name) {
    case "get_schedule_today": {
      const today = getTodayISO();
      return formatEntry(today, schedule[today], true);
    }

    case "get_schedule_date": {
      const { date } = args;
      return formatEntry(date, schedule[date], true);
    }

    case "get_schedule_week": {
      const dates = getWeekDates(args.date);
      return dates.map((d) => formatEntry(d, schedule[d], false)).join("\n\n");
    }

    case "update_schedule": {
      const { date, slot, driver } = args;
      if (slot !== "morning" && slot !== "evening") {
        return "ERROR: slot ต้องเป็น morning หรือ evening";
      }
      const validDrivers = ["Hon", "Jay", "JH", ""];
      if (!validDrivers.includes(driver)) {
        return `ERROR: driver ต้องเป็น Hon, Jay, JH หรือ "" (ว่าง)`;
      }

      const existing = schedule[date] || {
        morning: "",
        evening: "",
        fuel: "",
        mileage: "",
        remarks: {},
      };
      const oldDriver = existing[slot as "morning" | "evening"];
      existing[slot as "morning" | "evening"] = driver as Driver;
      schedule[date] = existing;
      await saveScheduleData(schedule);

      const slotTH = slot === "morning" ? "เช้า" : "เย็น";
      return `อัปเดตสำเร็จ: ${date} ${slotTH} เปลี่ยนจาก ${oldDriver || "(ว่าง)"} → ${driver || "(ว่าง)"}`;
    }

    default:
      return `ERROR: ไม่รู้จัก tool "${name}"`;
  }
}
