import { Redis } from "@upstash/redis";
import { ChatMessage } from "./types";

const redis = Redis.fromEnv();
const MAX_MESSAGES = 20;
const TTL_SECONDS = 7 * 24 * 60 * 60; // 7 วัน

function chatKey(userId: string) {
  return `cake-chat:${userId}`;
}

// ดึงประวัติแชท
export async function getHistory(userId: string): Promise<ChatMessage[]> {
  const data = await redis.get<ChatMessage[]>(chatKey(userId));
  return data || [];
}

// บันทึกข้อความใหม่ (ทั้ง user + model)
export async function appendHistory(
  userId: string,
  userMsg: string,
  modelMsg: string
): Promise<void> {
  const key = chatKey(userId);
  let history = await getHistory(userId);

  history.push({ role: "user", text: userMsg });
  history.push({ role: "model", text: modelMsg });

  // เก็บแค่ 20 ข้อความล่าสุด
  if (history.length > MAX_MESSAGES) {
    history = history.slice(-MAX_MESSAGES);
  }

  await redis.set(key, history, { ex: TTL_SECONDS });
}
