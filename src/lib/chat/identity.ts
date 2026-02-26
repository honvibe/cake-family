import { Redis } from "@upstash/redis";
import { UserIdentity } from "./types";

const redis = Redis.fromEnv();
const KEY = "cake-user-map";

// ดึง identity จาก Redis hash
export async function getIdentity(userId: string): Promise<UserIdentity | null> {
  const data = await redis.hget<UserIdentity>(KEY, userId);
  return data || null;
}

// ลงทะเบียน userId → ชื่อ (Hon/Jay/JH)
export async function registerIdentity(
  userId: string,
  name: "Hon" | "Jay" | "JH"
): Promise<void> {
  const identity: UserIdentity = {
    name,
    registeredAt: new Date().toISOString(),
  };
  await redis.hset(KEY, { [userId]: identity });
}

// แปลงข้อความ "ลงทะเบียน Hon" → ชื่อ หรือ null
export function parseRegistration(text: string): "Hon" | "Jay" | "JH" | null {
  const match = text.match(/^ลงทะเบียน\s*(hon|jay|jh)$/i);
  if (!match) return null;
  const raw = match[1].toLowerCase();
  if (raw === "hon") return "Hon";
  if (raw === "jay") return "Jay";
  if (raw === "jh") return "JH";
  return null;
}
