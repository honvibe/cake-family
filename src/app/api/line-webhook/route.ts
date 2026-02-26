import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/chat/engine";
import { getIdentity, registerIdentity, parseRegistration } from "@/lib/chat/identity";

export const dynamic = "force-dynamic";
export const maxDuration = 10; // Vercel timeout

// ===== LINE Signature Validation =====
async function validateSignature(
  body: string,
  signature: string | null
): Promise<boolean> {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return expected === signature;
}

// ===== Reply to LINE =====
async function replyToLine(replyToken: string, text: string) {
  const token = process.env.LINE_CHANNEL_TOKEN;
  if (!token) {
    console.error("[LINE Reply] No LINE_CHANNEL_TOKEN!");
    return;
  }

  console.log("[LINE Reply] Sending:", text.slice(0, 50));

  // ตัดข้อความไม่เกิน 5000 ตัวอักษร (LINE limit)
  const trimmed = text.length > 5000 ? text.slice(0, 4997) + "..." : text;

  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text: trimmed }],
    }),
  });
  const resBody = await res.text();
  console.log("[LINE Reply] Status:", res.status, resBody.slice(0, 200));
}

// ===== Group chat: ตอบเฉพาะเมื่อถูกเรียก =====
function shouldRespondInGroup(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return (
    lower.startsWith("เค้ก") ||
    lower.startsWith("cake") ||
    lower.startsWith("ลงทะเบียน")
  );
}

// ตัดคำนำหน้า "เค้ก" / "cake" ออก
function stripPrefix(text: string): string {
  return text
    .replace(/^(เค้ก|cake)\s*/i, "")
    .trim();
}

// ===== Main webhook handler =====
export async function POST(req: NextRequest) {
  const bodyText = await req.text();

  // Validate LINE signature (log แต่ไม่ block ถ้ายังไม่มี secret)
  const signature = req.headers.get("x-line-signature");
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (secret) {
    const isValid = await validateSignature(bodyText, signature);
    if (!isValid) {
      console.warn("[LINE Webhook] Invalid signature, secret exists but mismatch");
      // ยังไม่ block — log ไว้ debug ก่อน
    }
  } else {
    console.warn("[LINE Webhook] No LINE_CHANNEL_SECRET set, skipping validation");
  }

  console.log("[LINE Webhook] Received request, body length:", bodyText.length);

  const body = JSON.parse(bodyText);
  const events = body.events || [];

  for (const event of events) {
    if (event.type !== "message" || event.message?.type !== "text") continue;

    const sourceType = event.source?.type || "user"; // user | group | room
    const userId = event.source?.userId;
    const replyToken = event.replyToken;
    const text = (event.message.text || "").trim();

    if (!userId || !replyToken || !text) continue;

    console.log("[LINE Webhook]", JSON.stringify({
      sourceType,
      userId: userId.slice(0, 8) + "...",
      text: text.slice(0, 50),
    }));

    // Group chat: ตอบเฉพาะเมื่อถูกเรียก
    if ((sourceType === "group" || sourceType === "room") && !shouldRespondInGroup(text)) {
      continue;
    }

    // === คำสั่งพิเศษ: ลงทะเบียน ===
    const regName = parseRegistration(text);
    if (regName) {
      await registerIdentity(userId, regName);
      await replyToLine(replyToken, `ลงทะเบียนสำเร็จ! สวัสดี${regName === "JH" ? " JH" : "คุณ" + regName} 🎉\nตอนนี้เค้กรู้จักคุณแล้วครับ`);
      continue;
    }

    // === คำสั่งพิเศษ: groupid (เก็บไว้สำหรับ debug) ===
    if (text.toLowerCase() === "groupid") {
      const groupId = event.source?.groupId;
      await replyToLine(
        replyToken,
        `Group ID: ${groupId || "ไม่ใช่ group"}\nUser ID: ${userId}`
      );
      continue;
    }

    // === เช็คว่าลงทะเบียนหรือยัง ===
    const identity = await getIdentity(userId);
    if (!identity) {
      await replyToLine(
        replyToken,
        `สวัสดีครับ! เค้กยังไม่รู้จักคุณ\nกรุณาพิมพ์ "ลงทะเบียน Hon" หรือ "ลงทะเบียน Jay" หรือ "ลงทะเบียน JH" ก่อนนะครับ 😊`
      );
      continue;
    }

    // === ส่งไป Gemini chat engine ===
    const cleanText = stripPrefix(text);
    if (!cleanText) {
      await replyToLine(replyToken, "มีอะไรให้ช่วยครับ? 😊");
      continue;
    }

    try {
      const response = await chat({
        userId,
        text: cleanText,
        sourceType: sourceType as "user" | "group" | "room",
      });
      await replyToLine(replyToken, response.text);
    } catch (error) {
      console.error("[LINE Webhook] Chat error:", error);
      await replyToLine(replyToken, "ขอโทษครับ ระบบมีปัญหา ลองใหม่นะ 🙏");
    }
  }

  return NextResponse.json({ status: "ok" });
}

// LINE sends GET to verify webhook URL
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
