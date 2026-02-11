import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ providers: [] });

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "TMDB_API_KEY not set" }, { status: 500 });

    const url = `https://api.themoviedb.org/3/movie/${id}/watch/providers`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `TMDB error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    // ดึงข้อมูลไทย (TH) ก่อน fallback เป็น US
    const region = data.results?.TH || data.results?.US;
    if (!region) return NextResponse.json({ providers: [] });

    // รวม flatrate (subscription) + rent + buy เอาไม่ซ้ำ
    const seen = new Set<number>();
    const providers: { id: number; name: string; logo: string }[] = [];

    for (const type of ["flatrate", "rent", "buy"] as const) {
      for (const p of region[type] || []) {
        if (!seen.has(p.provider_id)) {
          seen.add(p.provider_id);
          providers.push({
            id: p.provider_id,
            name: p.provider_name,
            logo: p.logo_path,
          });
        }
      }
    }

    return NextResponse.json({ providers: providers.slice(0, 6) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
