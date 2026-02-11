import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const redis = Redis.fromEnv();
const REDIS_KEY = "cake-currency";

// Start: 2026-02-09 07:00 TH = 00:00 UTC
const START_UTC = new Date("2026-02-09T00:00:00Z");
// Deadline: 2026-02-28 23:00 TH = 16:00 UTC (last stamp of the day)
const DEADLINE_UTC = new Date("2026-02-28T16:00:00Z");
const INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours

interface Entry {
  ts: string;
  rate: number; // 100 JPY → THB
}

function toThaiDateKey(d: Date): string {
  const th = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return th.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const stored: Entry[] = (await redis.get(REDIS_KEY)) || [];
    const now = new Date();

    // Past deadline → no more recording
    if (now > DEADLINE_UTC) {
      return NextResponse.json({ entries: stored, recording: false });
    }

    // Before start → nothing to record yet
    if (now < START_UTC) {
      return NextResponse.json({ entries: stored, recording: false });
    }

    // Calculate expected stamps up to now
    const expected: Date[] = [];
    let t = new Date(START_UTC);
    while (t <= now && t <= DEADLINE_UTC) {
      expected.push(new Date(t));
      t = new Date(t.getTime() + INTERVAL_MS);
    }

    // Find missing stamps
    const recorded = new Set(stored.map((e) => e.ts));
    const missing = expected.filter((d) => !recorded.has(d.toISOString()));

    if (missing.length === 0) {
      return NextResponse.json({ entries: stored, recording: true });
    }

    // Collect unique TH dates for missing stamps
    const dateSet = new Set<string>();
    for (const d of missing) dateSet.add(toThaiDateKey(d));
    const dates = Array.from(dateSet).sort();

    // Fetch rates from Frankfurter API
    const rateByDate: Record<string, number> = {};

    // Range endpoint for historical
    if (dates.length >= 2) {
      const url = `https://api.frankfurter.app/${dates[0]}..${dates[dates.length - 1]}?amount=100&from=JPY&to=THB`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.rates) {
          for (const [date, rates] of Object.entries(data.rates)) {
            rateByDate[date] = (rates as Record<string, number>).THB;
          }
        }
      }
    }

    // Also fetch latest (covers today / most recent)
    const latestRes = await fetch(
      "https://api.frankfurter.app/latest?amount=100&from=JPY&to=THB"
    );
    if (latestRes.ok) {
      const ld = await latestRes.json();
      if (ld.rates?.THB) rateByDate[ld.date] = ld.rates.THB;
    }

    // Single date fallback
    if (dates.length === 1 && !rateByDate[dates[0]]) {
      const url = `https://api.frankfurter.app/${dates[0]}?amount=100&from=JPY&to=THB`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.rates?.THB) rateByDate[data.date || dates[0]] = data.rates.THB;
      }
    }

    // Fill gaps (weekends/holidays) with nearest previous rate
    const allDates = Array.from(
      new Set([...Object.keys(rateByDate), ...dates])
    ).sort();
    let lastRate = 0;
    for (const d of allDates) {
      if (rateByDate[d]) {
        lastRate = rateByDate[d];
      } else if (lastRate > 0) {
        rateByDate[d] = lastRate;
      }
    }

    // Append missing entries
    const newEntries = [...stored];
    for (const d of missing) {
      const key = toThaiDateKey(d);
      const rate = rateByDate[key];
      if (rate) {
        newEntries.push({ ts: d.toISOString(), rate });
      }
    }

    newEntries.sort((a, b) => a.ts.localeCompare(b.ts));
    await redis.set(REDIS_KEY, newEntries);

    return NextResponse.json({ entries: newEntries, recording: true });
  } catch (e) {
    return NextResponse.json(
      { entries: [], recording: false, error: String(e) },
      { status: 500 }
    );
  }
}
