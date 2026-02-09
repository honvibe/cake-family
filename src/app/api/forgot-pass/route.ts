import { NextResponse } from "next/server";

const RECIPIENT = "nattahon@gmail.com";
const PASSPHRASE = "CakeFamily1988+";

export async function POST() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cake Family <onboarding@resend.dev>",
        to: [RECIPIENT],
        subject: "🍰 รหัสผ่าน Cake Family",
        html: `<div style="font-family:sans-serif;padding:20px">
          <h2>🍰 Cake Family</h2>
          <p>รหัสผ่านของคุณคือ:</p>
          <p style="font-size:24px;font-weight:bold;color:#ec4899;background:#1e293b;padding:12px 20px;border-radius:8px;display:inline-block">${PASSPHRASE}</p>
        </div>`,
      }),
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    }

    const err = await res.json();
    return NextResponse.json({ error: err.message }, { status: 500 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
