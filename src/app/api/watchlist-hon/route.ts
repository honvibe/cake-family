import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY = "cake-watchlist-hon";
const MAX_ITEMS = 8;

export const dynamic = "force-dynamic";

interface HonItem {
  id: number;
  title: string;
  poster: string;
  year: string;
  overview: string;
  rating: number;
  addedAt: string;
}

async function loadList(): Promise<HonItem[]> {
  const raw = await redis.get(KEY);
  if (Array.isArray(raw)) return raw as HonItem[];
  return [];
}

export async function GET() {
  try {
    const list = await loadList();
    return NextResponse.json({ list });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body as { action: string };
    const list = await loadList();

    if (action === "add") {
      const { item } = body as { item: HonItem };
      if (list.some((m) => m.id === item.id)) {
        return NextResponse.json({ error: "already exists" }, { status: 409 });
      }
      if (list.length >= MAX_ITEMS) {
        return NextResponse.json({ error: `max ${MAX_ITEMS} items` }, { status: 400 });
      }
      item.addedAt = new Date().toISOString();
      list.push(item);
    } else if (action === "remove") {
      const { id } = body as { id: number };
      const idx = list.findIndex((m) => m.id === id);
      if (idx !== -1) list.splice(idx, 1);
    } else if (action === "reorder") {
      const { fromIndex, toIndex } = body as { fromIndex: number; toIndex: number };
      if (fromIndex >= 0 && fromIndex < list.length && toIndex >= 0 && toIndex < list.length) {
        const [item] = list.splice(fromIndex, 1);
        list.splice(toIndex, 0, item);
      }
    } else {
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }

    await redis.set(KEY, list);
    return NextResponse.json({ success: true, list });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
