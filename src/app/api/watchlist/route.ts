import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY = "cake-watchlist";
const MAX_ITEMS = 30; // per list

export const dynamic = "force-dynamic";

interface WatchlistItem {
  id: number;
  title: string;
  poster: string;
  year: string;
  order: number;
  status?: string;
  addedAt: string;
  overview?: string;
  rating?: number;
}

interface WatchlistData {
  nextWatch: WatchlistItem | null;
  lastPicker: "hon" | "jay" | null;
  honList: WatchlistItem[];
  jayList: WatchlistItem[];
  spareList: WatchlistItem[];
  watchedList: WatchlistItem[];
  boringList: WatchlistItem[];
  undo: {
    nextWatch: WatchlistItem | null;
    lastPicker: "hon" | "jay" | null;
    honList: WatchlistItem[];
    jayList: WatchlistItem[];
    spareList: WatchlistItem[];
  } | null;
}

function emptyData(): WatchlistData {
  return {
    nextWatch: null,
    lastPicker: null,
    honList: [],
    jayList: [],
    spareList: [],
    watchedList: [],
    boringList: [],
    undo: null,
  };
}

function reindex(list: WatchlistItem[]) {
  list.forEach((m, i) => (m.order = i));
}

/** Migrate old formats → current WatchlistData */
function migrate(raw: unknown): WatchlistData {
  if (Array.isArray(raw)) {
    const data = emptyData();
    const sorted = (raw as WatchlistItem[]).sort((a, b) => a.order - b.order);
    data.spareList = sorted;
    reindex(data.spareList);
    return data;
  }
  if (raw && typeof raw === "object" && "honList" in raw) {
    const d = raw as Record<string, unknown>;
    const base = emptyData();
    // Merge existing fields, fill missing with defaults
    return {
      ...base,
      ...(d as unknown as WatchlistData),
      watchedList: (d.watchedList as WatchlistItem[] | undefined) || [],
      boringList: (d.boringList as WatchlistItem[] | undefined) || [],
    };
  }
  return emptyData();
}

async function loadData(): Promise<WatchlistData> {
  const raw = await redis.get(KEY);
  return migrate(raw);
}

function allItems(data: WatchlistData): WatchlistItem[] {
  const items = [...data.honList, ...data.jayList, ...data.spareList];
  if (data.nextWatch) items.push(data.nextWatch);
  return items;
}

type ListName = "hon" | "jay" | "spare";

function getList(data: WatchlistData, list: ListName): WatchlistItem[] {
  if (list === "hon") return data.honList;
  if (list === "jay") return data.jayList;
  return data.spareList;
}

function setList(data: WatchlistData, list: ListName, items: WatchlistItem[]) {
  if (list === "hon") data.honList = items;
  else if (list === "jay") data.jayList = items;
  else data.spareList = items;
}

export async function GET() {
  try {
    const data = await loadData();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body as { action: string };
    const data = await loadData();

    if (action === "add") {
      const { item, list } = body as { item: WatchlistItem; list: ListName };
      const target = list || "spare";
      // Check duplicate across all active lists (not watched/boring)
      if (allItems(data).some((m) => m.id === item.id)) {
        return NextResponse.json({ error: "already exists" }, { status: 409 });
      }
      const arr = getList(data, target);
      if (arr.length >= MAX_ITEMS) {
        return NextResponse.json({ error: `max ${MAX_ITEMS} items` }, { status: 400 });
      }
      item.order = arr.length;
      item.addedAt = new Date().toISOString();
      arr.push(item);
      setList(data, target, arr);

    } else if (action === "remove") {
      const { id, list } = body as { id: number; list: ListName };
      const target = list || "spare";
      const arr = getList(data, target);
      const idx = arr.findIndex((m) => m.id === id);
      if (idx !== -1) arr.splice(idx, 1);
      reindex(arr);
      setList(data, target, arr);

    } else if (action === "move") {
      // Move item between hon/jay/spare lists
      const { id, from, to } = body as { id: number; from: ListName; to: ListName };
      const srcArr = getList(data, from);
      const idx = srcArr.findIndex((m) => m.id === id);
      if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });
      const dstArr = getList(data, to);
      if (dstArr.length >= MAX_ITEMS) {
        return NextResponse.json({ error: `max ${MAX_ITEMS} items` }, { status: 400 });
      }
      const [item] = srcArr.splice(idx, 1);
      reindex(srcArr);
      setList(data, from, srcArr);
      item.order = dstArr.length;
      dstArr.push(item);
      setList(data, to, dstArr);

    } else if (action === "pick-next") {
      const { id, list, picker } = body as { id: number; list: ListName; picker?: "hon" | "jay" };
      const arr = getList(data, list);
      const idx = arr.findIndex((m) => m.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
      // Save undo state
      data.undo = {
        nextWatch: data.nextWatch ? { ...data.nextWatch } : null,
        lastPicker: data.lastPicker,
        honList: data.honList.map((m) => ({ ...m })),
        jayList: data.jayList.map((m) => ({ ...m })),
        spareList: data.spareList.map((m) => ({ ...m })),
      };
      // Move current nextWatch back to its picker's list (or spare if no picker)
      if (data.nextWatch) {
        if (data.lastPicker) {
          const returnList = getList(data, data.lastPicker);
          data.nextWatch.order = returnList.length;
          returnList.push(data.nextWatch);
          setList(data, data.lastPicker, returnList);
        } else {
          data.nextWatch.order = data.spareList.length;
          data.spareList.push(data.nextWatch);
        }
      }
      // Set new nextWatch
      const picked = arr.splice(idx, 1)[0];
      reindex(arr);
      setList(data, list, arr);
      data.nextWatch = picked;
      // Only change lastPicker if picker is specified
      if (picker) data.lastPicker = picker;

    } else if (action === "finish") {
      // ดูแล้ว → watchedList
      if (!data.nextWatch) {
        return NextResponse.json({ error: "no nextWatch" }, { status: 400 });
      }
      data.nextWatch.order = data.watchedList.length;
      data.watchedList.push(data.nextWatch);
      data.nextWatch = null;
      data.undo = null;

    } else if (action === "drop") {
      // ทิ้ง → boringList
      if (!data.nextWatch) {
        return NextResponse.json({ error: "no nextWatch" }, { status: 400 });
      }
      data.nextWatch.order = data.boringList.length;
      data.boringList.push(data.nextWatch);
      data.nextWatch = null;
      data.undo = null;

    } else if (action === "remove-pool") {
      // Remove from watched or boring
      const { id, pool } = body as { id: number; pool: "watched" | "boring" };
      const arr = pool === "watched" ? data.watchedList : data.boringList;
      const idx = arr.findIndex((m) => m.id === id);
      if (idx !== -1) arr.splice(idx, 1);
      reindex(arr);
      if (pool === "watched") data.watchedList = arr;
      else data.boringList = arr;

    } else if (action === "undo") {
      if (!data.undo) {
        return NextResponse.json({ error: "nothing to undo" }, { status: 400 });
      }
      data.nextWatch = data.undo.nextWatch;
      data.lastPicker = data.undo.lastPicker;
      data.honList = data.undo.honList;
      data.jayList = data.undo.jayList;
      data.spareList = data.undo.spareList;
      data.undo = null;

    } else if (action === "reorder") {
      const { id, list, direction } = body as { id: number; list: ListName; direction: "up" | "down" };
      const arr = getList(data, list);
      const sorted = [...arr].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((m) => m.id === id);
      if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx >= 0 && swapIdx < sorted.length) {
        const tmp = sorted[idx].order;
        sorted[idx].order = sorted[swapIdx].order;
        sorted[swapIdx].order = tmp;
      }
      setList(data, list, sorted);

    } else {
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }

    await redis.set(KEY, data);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
