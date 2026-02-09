import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const events = body.events || [];

    for (const event of events) {
      const sourceType = event.source?.type;
      const groupId = event.source?.groupId;
      const userId = event.source?.userId;

      console.log("[LINE Webhook]", JSON.stringify({
        type: event.type,
        sourceType,
        groupId: groupId || null,
        userId: userId || null,
        text: event.message?.text || null,
      }));

      // If someone sends "groupid" in the group, reply with the group ID
      if (
        event.type === "message" &&
        event.message?.type === "text" &&
        event.message.text.toLowerCase().includes("groupid")
      ) {
        const replyToken = event.replyToken;
        const token = process.env.LINE_CHANNEL_TOKEN;

        if (replyToken && token) {
          await fetch("https://api.line.me/v2/bot/message/reply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              replyToken,
              messages: [
                {
                  type: "text",
                  text: `Group ID: ${groupId || "ไม่ใช่ group (ส่งใน group นะ)"}\nUser ID: ${userId || "-"}`,
                },
              ],
            }),
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (e) {
    console.error("[LINE Webhook] Error:", e);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

// LINE sends GET to verify webhook URL
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
