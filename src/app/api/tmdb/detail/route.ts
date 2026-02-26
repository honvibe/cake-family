import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "TMDB_API_KEY not set" }, { status: 500 });

    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const type = searchParams.get("type") || "movie";
    const lang = searchParams.get("lang") || "th";

    const url = `https://api.themoviedb.org/3/${type}/${id}?language=${lang}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}`, accept: "application/json" },
    });

    if (!res.ok) return NextResponse.json({ error: `TMDB ${res.status}` }, { status: 502 });

    const data = await res.json();
    return NextResponse.json({
      id: data.id,
      title: data.title || data.name,
      overview: data.overview || "",
      poster_path: data.poster_path,
      vote_average: data.vote_average,
      release_date: data.release_date || data.first_air_date,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
