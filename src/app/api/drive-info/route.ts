import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY = "cake-drive-info";

export const dynamic = "force-dynamic";

interface Drive {
  id: string;
  name: string;
  type: "HDD" | "SSD" | "USB" | "SD" | "NVMe";
  brand: string;
  size: number;
  sizeUnit: "GB" | "TB";
  color: string;
  createdAt: string;
}

interface FileItem {
  name: string;
  size: string;
  type: string;
}

interface FolderEntry {
  id: string;
  driveId: string;
  name: string;
  size: string;
  sizeUnit: "MB" | "GB" | "TB";
  description: string;
  files?: FileItem[];
  createdAt: string;
}

interface DriveInfoData {
  drives: Drive[];
  folders: FolderEntry[];
}

async function getData(): Promise<DriveInfoData> {
  const data = await redis.get<DriveInfoData>(KEY);
  return data || { drives: [], folders: [] };
}

export async function GET() {
  try {
    const data = await getData();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await getData();

    if (body.action === "addDrive") {
      data.drives.push({
        id: crypto.randomUUID(),
        name: body.name,
        type: body.type,
        brand: body.brand,
        size: body.size,
        sizeUnit: body.sizeUnit,
        color: body.color,
        createdAt: new Date().toISOString(),
      });
    } else if (body.action === "addFolder") {
      data.folders.push({
        id: crypto.randomUUID(),
        driveId: body.driveId,
        name: body.name,
        size: body.size || "",
        sizeUnit: body.sizeUnit || "GB",
        description: body.description || "",
        files: body.files || [],
        createdAt: new Date().toISOString(),
      });
    } else if (body.action === "deleteDrive") {
      data.drives = data.drives.filter((d) => d.id !== body.id);
      data.folders = data.folders.filter((f) => f.driveId !== body.id);
    } else if (body.action === "deleteFolder") {
      data.folders = data.folders.filter((f) => f.id !== body.id);
    } else if (body.action === "editDrive") {
      const idx = data.drives.findIndex((d) => d.id === body.id);
      if (idx !== -1) data.drives[idx] = { ...data.drives[idx], ...body.updates };
    } else if (body.action === "editFolder") {
      const idx = data.folders.findIndex((f) => f.id === body.id);
      if (idx !== -1) data.folders[idx] = { ...data.folders[idx], ...body.updates };
    } else if (body.action === "bulkAddFolders") {
      const now = new Date().toISOString();
      for (const item of body.items) {
        data.folders.push({
          id: crypto.randomUUID(),
          driveId: body.driveId,
          name: item.name,
          size: item.size || "",
          sizeUnit: item.sizeUnit || "GB",
          description: item.description || "",
          files: item.files || [],
          createdAt: now,
        });
      }
    }

    await redis.set(KEY, data);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
