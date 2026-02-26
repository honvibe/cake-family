import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "TMDB_API_KEY not set" }, { status: 500 });

    const provider = searchParams.get("provider"); // e.g. 8 = Netflix
    const genre = searchParams.get("genre"); // e.g. 28 = Action
    const page = searchParams.get("page") || "1";
    const region = searchParams.get("region") || "TH";
    const lang = searchParams.get("lang") || "en-US";
    const type = searchParams.get("type") || "movie"; // movie | tv
    const keywords = searchParams.get("keywords"); // comma-separated keyword IDs

    const params = new URLSearchParams({
      language: lang,
      sort_by: "popularity.desc",
      page,
      "vote_count.gte": type === "tv" ? "20" : "50",
    });

    if (provider) {
      params.set("with_watch_providers", provider);
      params.set("watch_region", region);
    }
    if (genre) {
      params.set("with_genres", genre);
    }
    if (keywords) {
      params.set("with_keywords", keywords);
    }

    const originLang = searchParams.get("originLang");
    if (originLang) {
      params.set("with_original_language", originLang);
    }

    const url = `https://api.themoviedb.org/3/discover/${type}?${params}`;
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
      title: m.title || m.name, // TV uses "name" instead of "title"
      poster_path: m.poster_path,
      release_date: m.release_date || m.first_air_date,
      overview: m.overview,
      vote_average: m.vote_average,
    }));

    return NextResponse.json({ results, total_pages: data.total_pages || 1 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
