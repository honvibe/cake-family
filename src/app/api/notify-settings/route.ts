import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();
const KEY = "cake-notify-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await redis.get(KEY);
    return NextResponse.json(data || { enabled: false, hour: 20, minute: 0 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await redis.set(KEY, body);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
