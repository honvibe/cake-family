import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    if (!q) return NextResponse.json({ results: [] });

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "TMDB_API_KEY not set" }, { status: 500 });

    const lang = searchParams.get("lang") || "en-US";
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&language=${lang}&page=1`;

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
    const results = (data.results || []).slice(0, 10).map((m: Record<string, unknown>) => ({
      id: m.id,
      title: m.title,
      poster_path: m.poster_path,
      release_date: m.release_date,
      overview: m.overview,
      vote_average: m.vote_average,
    }));

    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
