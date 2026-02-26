import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ProviderInfo { id: number; name: string; logo: string }

async function fetchProviders(movieId: string, apiKey: string, type = "movie"): Promise<ProviderInfo[]> {
  const url = `https://api.themoviedb.org/3/${type}/${movieId}/watch/providers`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}`, accept: "application/json" },
  });
  if (!res.ok) return [];

  const data = await res.json();
  const region = data.results?.TH || data.results?.US;
  if (!region) return [];

  const seen = new Set<number>();
  const providers: ProviderInfo[] = [];
  for (const type of ["flatrate", "rent", "buy"] as const) {
    for (const p of region[type] || []) {
      if (!seen.has(p.provider_id)) {
        seen.add(p.provider_id);
        providers.push({ id: p.provider_id, name: p.provider_name, logo: p.logo_path });
      }
    }
  }
  return providers.slice(0, 6);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "TMDB_API_KEY not set" }, { status: 500 });

    const id = searchParams.get("id");
    const ids = searchParams.get("ids"); // batch: comma-separated
    const type = searchParams.get("type") || "movie"; // movie | tv

    // Batch mode
    if (ids) {
      const idList = ids.split(",").slice(0, 12);
      const results: Record<string, ProviderInfo[]> = {};
      await Promise.all(
        idList.map(async (mid) => {
          results[mid] = await fetchProviders(mid, apiKey, type);
        })
      );
      return NextResponse.json({ batch: results });
    }

    // Single mode
    if (!id) return NextResponse.json({ providers: [] });
    const providers = await fetchProviders(id, apiKey, type);
    return NextResponse.json({ providers });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
