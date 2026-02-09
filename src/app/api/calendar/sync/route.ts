import { NextRequest, NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

export const dynamic = "force-dynamic";

const CALENDAR_IDS: Record<string, string> = {
  Hon: process.env.GCAL_HON_ID || "",
  Jay: process.env.GCAL_JAY_ID || "",
  JH: process.env.GCAL_JH_ID || "",
};

const BASE = "https://www.googleapis.com/calendar/v3";

async function getAccessToken(): Promise<string> {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token || "";
}

// Find existing event by cakeId
async function findEvent(
  token: string,
  calendarId: string,
  cakeId: string
): Promise<string | null> {
  const url = `${BASE}/calendars/${encodeURIComponent(calendarId)}/events?privateExtendedProperty=cakeId%3D${encodeURIComponent(cakeId)}&maxResults=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.items?.[0]?.id || null;
}

// --- GET: Pull events from all 3 calendars for a date range ---
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start"); // YYYY-MM-DD
    const end = searchParams.get("end"); // YYYY-MM-DD
    if (!start || !end) {
      return NextResponse.json({ error: "start and end required" }, { status: 400 });
    }

    const token = await getAccessToken();
    const timeMin = `${start}T00:00:00+07:00`;
    const timeMax = `${end}T23:59:59+07:00`;

    interface PulledEvent {
      id: string;
      driver: string;
      date: string;
      time: string;
      detail: string;
      gcalId: string;
    }

    const allEvents: PulledEvent[] = [];

    for (const [driver, calendarId] of Object.entries(CALENDAR_IDS)) {
      if (!calendarId) continue;
      const url = `${BASE}/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=100`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) continue;
      const data = await res.json();

      for (const item of data.items || []) {
        // Extract cakeId if set
        const cakeId = item.extendedProperties?.private?.cakeId || "";
        // Parse date from start
        let date = "";
        let time = "";
        if (item.start?.date) {
          // All-day event
          date = item.start.date;
        } else if (item.start?.dateTime) {
          // Timed event — parse directly from ISO string (already has +07:00)
          // Format: "2026-02-09T09:30:00+07:00" → date="2026-02-09", time="09:30"
          const raw = item.start.dateTime as string;
          date = raw.slice(0, 10);
          time = raw.slice(11, 16);
        }

        // Parse detail: strip "Name - " prefix if present
        let detail = item.summary || "";
        const prefix = `${driver} - `;
        if (detail.startsWith(prefix)) {
          detail = detail.slice(prefix.length);
        }

        allEvents.push({
          id: cakeId || item.id?.slice(0, 8) || crypto.randomUUID().slice(0, 8),
          driver,
          date,
          time,
          detail,
          gcalId: item.id || "",
        });
      }
    }

    return NextResponse.json({ events: allEvents });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// --- POST: Push events to Google Calendar ---
interface CalEvent {
  id: string;
  driver: "Hon" | "Jay" | "JH";
  time: string; // "HH:mm" or "" for all-day
  duration?: number; // minutes (default 60)
  detail: string;
  gcalId?: string;
}

interface SyncPayload {
  date: string; // YYYY-MM-DD
  events: CalEvent[];
}

export async function POST(req: Request) {
  try {
    const { items } = (await req.json()) as { items: SyncPayload[] };
    if (!items?.length) {
      return NextResponse.json({ synced: 0 });
    }

    const token = await getAccessToken();
    const results: string[] = [];

    for (const item of items) {
      const { date, events } = item;

      // Collect all cakeIds that should exist for this date
      const activeCakeIds = new Set<string>();

      for (const ev of events) {
        const calendarId = CALENDAR_IDS[ev.driver];
        if (!calendarId || !ev.detail.trim()) continue;

        const cakeId = ev.id;
        activeCakeIds.add(cakeId);

        const summary = `${ev.driver} - ${ev.detail}`;

        // Build start/end based on time
        let start: Record<string, string>;
        let end: Record<string, string>;

        if (ev.time) {
          // Timed event with duration
          start = { dateTime: `${date}T${ev.time}:00`, timeZone: "Asia/Bangkok" };
          const [h, m] = ev.time.split(":").map(Number);
          const dur = ev.duration || 60;
          const totalMin = h * 60 + m + dur;
          const endH = String(Math.floor(totalMin / 60) % 24).padStart(2, "0");
          const endM = String(totalMin % 60).padStart(2, "0");
          end = { dateTime: `${date}T${endH}:${endM}:00`, timeZone: "Asia/Bangkok" };
        } else {
          // All-day
          start = { date };
          end = { date };
        }

        const eventBody = {
          summary,
          start,
          end,
          extendedProperties: { private: { cakeId } },
        };

        // Check if event already exists
        const existingEventId = await findEvent(token, calendarId, cakeId);

        if (existingEventId) {
          await fetch(
            `${BASE}/calendars/${encodeURIComponent(calendarId)}/events/${existingEventId}`,
            {
              method: "PATCH",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify(eventBody),
            }
          );
          results.push(`updated:${cakeId}`);
        } else {
          await fetch(
            `${BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify(eventBody),
            }
          );
          results.push(`created:${cakeId}`);
        }
      }

      // Delete events that were removed: find all cake-app events for this date
      for (const [driver, calendarId] of Object.entries(CALENDAR_IDS)) {
        if (!calendarId) continue;
        const timeMin = `${date}T00:00:00+07:00`;
        const timeMax = `${date}T23:59:59+07:00`;
        const url = `${BASE}/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&privateExtendedProperty=cakeId%3D*&singleEvents=true&maxResults=50`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) continue;
        const data = await res.json();
        for (const gcalEvent of data.items || []) {
          const eid = gcalEvent.extendedProperties?.private?.cakeId;
          if (eid && !activeCakeIds.has(eid)) {
            await fetch(
              `${BASE}/calendars/${encodeURIComponent(calendarId)}/events/${gcalEvent.id}`,
              { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
            );
            results.push(`deleted:${eid}`);
          }
        }
      }
    }

    return NextResponse.json({ synced: results.length, results });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
