import { NextResponse } from "next/server";

const STATION_IDS = [1842, 1836, 1841];
const AQICN_MAP_URL = "https://aqicn.org/map/bangkok/";
const AQICN_FEED_URL = "https://feed.aqicn.org/feed/bangkok/en/feed.v1.json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Strategy 1: Scrape AQICN map for Samut Prakan station US AQI
    const mapRes = await fetch(AQICN_MAP_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
      cache: "no-store",
    });

    if (mapRes.ok) {
      const html = await mapRes.text();
      const results: { id: number; name: string; aqi: number }[] = [];
      const regex = /\{"x":(\d+),"g":\[([\d.]+),([\d.]+)\],"t":"[^"]+","aqi":"(\d+)","name":"([^"]+)"/g;
      let match;
      while ((match = regex.exec(html)) !== null) {
        const id = parseInt(match[1]);
        if (STATION_IDS.includes(id)) {
          results.push({ id, name: match[5].split(",")[0], aqi: parseInt(match[4]) });
        }
      }
      if (results.length > 0) {
        const maxAqi = Math.max(...results.map((s) => s.aqi));
        return NextResponse.json({ source: "aqicn", aqi: maxAqi, stations: results });
      }
    }

    // Strategy 2: Fallback to Bangkok feed
    const feedRes = await fetch(AQICN_FEED_URL, { cache: "no-store" });
    if (feedRes.ok) {
      const feed = await feedRes.json();
      if (feed.aqi) {
        return NextResponse.json({
          source: "aqicn-bangkok",
          aqi: feed.aqi.val,
          stations: [{ id: 0, name: "Bangkok", aqi: feed.aqi.val }],
        });
      }
    }

    return NextResponse.json({ source: "none", aqi: null, stations: [] }, { status: 502 });
  } catch (e) {
    return NextResponse.json({ source: "error", aqi: null, error: String(e) }, { status: 502 });
  }
}
