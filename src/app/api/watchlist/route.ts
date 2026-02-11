import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY = "cake-watchlist";
const MAX_ITEMS = 30;

export const dynamic = "force-dynamic";

interface WatchlistItem {
  id: number;
  title: string;
  poster: string;
  year: string;
  order: number;
  status?: string; // kept for backward compat, not used in UI
  addedAt: string;
  overview?: string;
  rating?: number;
}

function reindex(list: WatchlistItem[]) {
  list.sort((a, b) => a.order - b.order).forEach((m, i) => (m.order = i));
}

export async function GET() {
  try {
    const data = await redis.get<WatchlistItem[]>(KEY);
    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body as { action: string };

    const list = (await redis.get<WatchlistItem[]>(KEY)) || [];

    if (action === "add") {
      const { item } = body as { item: WatchlistItem };
      if (list.some((m) => m.id === item.id)) {
        return NextResponse.json({ error: "already exists" }, { status: 409 });
      }
      if (list.length >= MAX_ITEMS) {
        return NextResponse.json({ error: `max ${MAX_ITEMS} items` }, { status: 400 });
      }
      item.order = list.length;
      item.addedAt = new Date().toISOString();
      list.push(item);
    } else if (action === "remove") {
      const { id } = body as { id: number };
      const idx = list.findIndex((m) => m.id === id);
      if (idx !== -1) list.splice(idx, 1);
      reindex(list);
    } else if (action === "reorder") {
      const { id, direction } = body as { id: number; direction: "up" | "down" };
      const sorted = [...list].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((m) => m.id === id);
      if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });

      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) {
        return NextResponse.json({ success: true, data: list });
      }

      const tempOrder = sorted[idx].order;
      sorted[idx].order = sorted[swapIdx].order;
      sorted[swapIdx].order = tempOrder;
    } else {
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }

    await redis.set(KEY, list);
    return NextResponse.json({ success: true, data: list });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
