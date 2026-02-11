"use client";

import MainNavigationShell from "@/components/main-navigation-shell";
import { useCallback, useEffect, useRef, useState } from "react";

/* ── Types ── */
interface WatchlistItem {
  id: number;
  title: string;
  poster: string;
  year: string;
  order: number;
  addedAt: string;
  overview?: string;
  rating?: number;
}

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
}

interface Provider {
  id: number;
  name: string;
  logo: string;
}

/* ── Constants ── */
const POSTER_SM = "https://image.tmdb.org/t/p/w154";
const POSTER_LG = "https://image.tmdb.org/t/p/w342";
const LOGO_BASE = "https://image.tmdb.org/t/p/w45";

const RANK_STYLES: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-yellow-500", text: "text-yellow-950" },
  2: { bg: "bg-gray-300", text: "text-gray-800" },
  3: { bg: "bg-amber-700", text: "text-amber-100" },
};

const TOP_COUNT = 4;

const STREAMING_TABS = [
  { key: "netflix", label: "Netflix", providerId: "8" },
  { key: "prime", label: "Prime", providerId: "119" },
  { key: "apple", label: "Apple TV+", providerId: "350" },
  { key: "hotstar", label: "Hotstar", providerId: "122" },
];

const GENRE_SECTIONS = [
  { id: "28", label: "Action" },
  { id: "35", label: "Comedy" },
  { id: "27", label: "Horror" },
  { id: "878", label: "Sci-Fi" },
  { id: "18", label: "Drama" },
  { id: "16", label: "Animation" },
  { id: "10749", label: "Romance" },
  { id: "53", label: "Thriller" },
];

export default function WatchlistPage() {
  const [list, setList] = useState<WatchlistItem[]>([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [providers, setProviders] = useState<Record<number, Provider[]>>({});

  // Streaming section
  const [streamTab, setStreamTab] = useState("netflix");
  const [streamMovies, setStreamMovies] = useState<Record<string, TMDBMovie[]>>({});
  const [streamLoading, setStreamLoading] = useState<Record<string, boolean>>({});

  // Genre section
  const [genreMovies, setGenreMovies] = useState<Record<string, TMDBMovie[]>>({});
  const [genreLoading, setGenreLoading] = useState<Record<string, boolean>>({});
  const usedIdsRef = useRef<Set<number>>(new Set());

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Fetch watchlist ── */
  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      if (Array.isArray(data)) setList(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  /* ── Fetch providers for top cards ── */
  const sorted = [...list].sort((a, b) => a.order - b.order);
  const topCards = sorted.slice(0, TOP_COUNT);
  const poolList = sorted.slice(TOP_COUNT);

  useEffect(() => {
    const ids = topCards.map((m) => m.id).filter((id) => !(id in providers));
    if (ids.length === 0) return;
    ids.forEach(async (id) => {
      try {
        const res = await fetch(`/api/tmdb/providers?id=${id}`);
        const data = await res.json();
        if (data.providers) {
          setProviders((prev) => ({ ...prev, [id]: data.providers }));
        }
      } catch { /* ignore */ }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topCards.map((m) => m.id).join(",")]);

  /* ── Fetch streaming top movies ── */
  useEffect(() => {
    if (streamMovies[streamTab] || streamLoading[streamTab]) return;
    const tab = STREAMING_TABS.find((t) => t.key === streamTab);
    if (!tab) return;

    setStreamLoading((p) => ({ ...p, [streamTab]: true }));
    fetch(`/api/tmdb/discover?provider=${tab.providerId}`)
      .then((r) => r.json())
      .then((data) => {
        setStreamMovies((p) => ({ ...p, [streamTab]: (data.results || []).slice(0, 5) }));
      })
      .finally(() => setStreamLoading((p) => ({ ...p, [streamTab]: false })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamTab]);

  /* ── Fetch genre movies (lazy load first 4 genres on mount, rest on scroll) ── */
  const loadGenre = useCallback((genreId: string, force = false) => {
    if (!force && genreMovies[genreId]) return;
    if (genreLoading[genreId]) return;
    setGenreLoading((p) => ({ ...p, [genreId]: true }));

    // If forcing, remove old IDs from used set so they can be replaced
    if (force && genreMovies[genreId]) {
      genreMovies[genreId].forEach((m) => usedIdsRef.current.delete(m.id));
    }

    const page = Math.floor(Math.random() * 20) + 1;
    fetch(`/api/tmdb/discover?genre=${genreId}&page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        const all: TMDBMovie[] = data.results || [];
        // Filter out movies already used in other genres
        const fresh = all.filter((m) => !usedIdsRef.current.has(m.id));
        const picked = fresh.slice(0, 10);
        // Track these IDs as used
        picked.forEach((m) => usedIdsRef.current.add(m.id));
        setGenreMovies((p) => ({ ...p, [genreId]: picked }));
      })
      .finally(() => setGenreLoading((p) => ({ ...p, [genreId]: false })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genreMovies, genreLoading]);

  useEffect(() => {
    GENRE_SECTIONS.slice(0, 4).forEach((g) => {
      if (genreMovies[g.id] || genreLoading[g.id]) return;
      loadGenre(g.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshAllGenres = () => {
    // Clear all used IDs before refreshing
    usedIdsRef.current.clear();
    GENRE_SECTIONS.forEach((g) => loadGenre(g.id, true));
  };

  // Load remaining genres after short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      GENRE_SECTIONS.slice(4).forEach((g) => {
        if (!genreMovies[g.id] && !genreLoading[g.id]) loadGenre(g.id);
      });
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Search (debounce 500ms) ── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  /* ── API action ── */
  const doAction = async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.data) setList(data.data);
      return res.ok;
    } finally {
      setBusy(false);
    }
  };

  const addMovie = async (movie: TMDBMovie) => {
    const item = {
      id: movie.id,
      title: movie.title,
      poster: movie.poster_path || "",
      year: movie.release_date ? movie.release_date.slice(0, 4) : "",
      order: 0,
      addedAt: "",
      overview: movie.overview || "",
      rating: movie.vote_average || 0,
    };
    const ok = await doAction({ action: "add", item });
    if (ok) {
      setQuery("");
      setSearchResults([]);
    }
  };

  const isInList = (id: number) => list.some((m) => m.id === id);

  /* ── Sub-components ── */

  const AddButton = ({ movie }: { movie: TMDBMovie }) => (
    <button
      onClick={() => addMovie(movie)}
      disabled={busy || isInList(movie.id)}
      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition-colors ${
        isInList(movie.id)
          ? "bg-[var(--c-fill-2)] text-[var(--c-text-3)]"
          : "bg-[var(--c-accent)] text-white active:opacity-80"
      }`}
    >
      {isInList(movie.id) ? "✓" : "+"}
    </button>
  );

  const DeleteButton = ({ id }: { id: number }) => (
    <button
      onClick={() => doAction({ action: "remove", id })}
      disabled={busy}
      className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center text-[14px] flex-shrink-0 active:bg-red-500/25 transition-colors"
    >
      ✕
    </button>
  );

  const ProviderLogos = ({ movieId }: { movieId: number }) => {
    const p = providers[movieId];
    if (!p || p.length === 0) return null;
    return (
      <div className="flex gap-1 flex-wrap mt-1.5">
        {p.slice(0, 4).map((prov) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={prov.id}
            src={`${LOGO_BASE}${prov.logo}`}
            alt={prov.name}
            title={prov.name}
            className="w-6 h-6 rounded-md"
          />
        ))}
      </div>
    );
  };

  const CompactRow = ({ movie, showAdd = true }: { movie: TMDBMovie; showAdd?: boolean }) => (
    <div className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-[var(--c-fill-3)] transition-colors">
      {movie.poster_path ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${POSTER_SM}${movie.poster_path}`}
          alt={movie.title}
          className="w-9 h-[54px] rounded-md object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-9 h-[54px] rounded-md bg-[var(--c-fill-2)] flex items-center justify-center flex-shrink-0">
          <span className="text-[var(--c-text-3)] text-[10px]">N/A</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[var(--c-text)] truncate">{movie.title}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[var(--c-text-3)]">
            {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
          </span>
          {movie.vote_average > 0 && (
            <span className="text-[11px] text-yellow-500">★{movie.vote_average.toFixed(1)}</span>
          )}
        </div>
      </div>
      {showAdd && <AddButton movie={movie} />}
    </div>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mt-8 mb-3">
      <div className="h-px flex-1 bg-[var(--c-sep)]" />
      <span className="text-[13px] font-semibold text-[var(--c-text-2)] px-2">{children}</span>
      <div className="h-px flex-1 bg-[var(--c-sep)]" />
    </div>
  );

  const MiniSpinner = () => (
    <div className="flex justify-center py-6">
      <div className="w-5 h-5 border-2 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <MainNavigationShell title="Watchlist">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          <p className="text-[22px] md:text-[28px] font-bold text-[var(--c-text)] tracking-tight">
            Watchlist
          </p>
          <p className="text-[14px] text-[var(--c-text-2)]">
            รายการหนังที่อยากดู ({list.length}/30)
          </p>
        </div>

        {/* ── Search ── */}
        <div className="mb-5">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาหนัง..."
              className="w-full h-11 px-4 pr-10 rounded-xl bg-[var(--c-fill-3)] text-[var(--c-text)] placeholder:text-[var(--c-text-3)] text-[16px] border border-[var(--c-sep)] focus:outline-none focus:border-[var(--c-accent)] transition-colors"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 rounded-xl border border-[var(--c-sep)] bg-[var(--c-card)] overflow-hidden divide-y divide-[var(--c-sep)]">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  className="flex gap-3 p-3 hover:bg-[var(--c-fill-3)] transition-colors"
                >
                  {movie.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${POSTER_SM}${movie.poster_path}`}
                      alt={movie.title}
                      className="w-[54px] h-[81px] rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-[60px] rounded-lg bg-[var(--c-fill-2)] flex items-center justify-center flex-shrink-0">
                      <span className="text-[var(--c-text-3)] text-[11px]">N/A</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[var(--c-text)] leading-tight truncate">
                      {movie.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[12px] text-[var(--c-text-3)]">
                        {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
                      </span>
                      {movie.vote_average > 0 && (
                        <span className="text-[12px] text-yellow-500">★ {movie.vote_average.toFixed(1)}</span>
                      )}
                    </div>
                    <p className="text-[13px] text-[var(--c-text-2)] mt-1 leading-snug line-clamp-2">
                      {movie.overview || "ไม่มีเรื่องย่อ"}
                    </p>
                  </div>
                  <AddButton movie={movie} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            SECTION 1: My Watchlist
        ══════════════════════════════════════════ */}
        {loading ? (
          <MiniSpinner />
        ) : sorted.length === 0 ? (
          <div className="text-center py-8 text-[var(--c-text-3)] text-[15px]">
            ยังไม่มีหนังในลิสต์ — ค้นหาหรือเลือกจากด้านล่าง
          </div>
        ) : (
          <>
            {/* Top 4 portrait cards */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {topCards.map((movie, idx) => {
                const rank = idx + 1;
                const badge = RANK_STYLES[rank];
                return (
                  <div key={movie.id} className="flex flex-col">
                    <div className="flex items-center justify-center mb-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          badge
                            ? `${badge.bg} ${badge.text}`
                            : "bg-[var(--c-fill-2)] text-[var(--c-text-2)]"
                        }`}
                      >
                        {rank}
                      </div>
                    </div>
                    <div className="rounded-xl bg-[var(--c-card)] border border-[var(--c-sep)] overflow-hidden flex-1 flex flex-col">
                      {movie.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${POSTER_LG}${movie.poster}`}
                          alt={movie.title}
                          className="w-full aspect-[2/3] object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-[2/3] bg-[var(--c-fill-2)] flex items-center justify-center">
                          <span className="text-[var(--c-text-3)] text-[11px]">N/A</span>
                        </div>
                      )}
                      <div className="p-1.5 flex-1 flex flex-col">
                        <p className="text-[11px] font-medium text-[var(--c-text)] leading-tight line-clamp-2">
                          {movie.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-[var(--c-text-3)]">{movie.year || "N/A"}</span>
                          {movie.rating ? (
                            <span className="text-[10px] text-yellow-500">★{movie.rating.toFixed(1)}</span>
                          ) : null}
                        </div>
                        <ProviderLogos movieId={movie.id} />
                        <div className="flex items-center gap-1 mt-auto pt-1.5">
                          <button
                            onClick={() => doAction({ action: "reorder", id: movie.id, direction: "up" })}
                            disabled={busy || idx === 0}
                            className="w-7 h-7 rounded-md bg-[var(--c-fill-3)] text-[var(--c-text-2)] flex items-center justify-center text-[12px] disabled:opacity-30 active:bg-[var(--c-fill-2)]"
                          >
                            ◀
                          </button>
                          <button
                            onClick={() => doAction({ action: "reorder", id: movie.id, direction: "down" })}
                            disabled={busy || idx === sorted.length - 1}
                            className="w-7 h-7 rounded-md bg-[var(--c-fill-3)] text-[var(--c-text-2)] flex items-center justify-center text-[12px] disabled:opacity-30 active:bg-[var(--c-fill-2)]"
                          >
                            ▶
                          </button>
                          <div className="flex-1" />
                          <DeleteButton id={movie.id} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pool list (5-30) */}
            {poolList.length > 0 && (
              <div className="rounded-xl bg-[var(--c-card)] border border-[var(--c-sep)] overflow-hidden mb-2">
                {poolList.map((movie, poolIdx) => {
                  const globalIdx = TOP_COUNT + poolIdx;
                  return (
                    <div
                      key={movie.id}
                      className={`flex items-center gap-2.5 px-3 py-2 ${
                        poolIdx > 0 ? "border-t border-[var(--c-sep)]" : ""
                      }`}
                    >
                      <span className="text-[12px] text-[var(--c-text-3)] w-4 text-center flex-shrink-0 font-medium">
                        {globalIdx + 1}
                      </span>
                      {movie.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${POSTER_SM}${movie.poster}`}
                          alt={movie.title}
                          className="w-8 h-12 rounded-md object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-12 rounded-md bg-[var(--c-fill-2)] flex items-center justify-center flex-shrink-0">
                          <span className="text-[var(--c-text-3)] text-[9px]">N/A</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[var(--c-text)] truncate">{movie.title}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[var(--c-text-3)]">{movie.year || "N/A"}</span>
                          {movie.rating ? (
                            <span className="text-[11px] text-yellow-500">★{movie.rating.toFixed(1)}</span>
                          ) : null}
                        </div>
                      </div>
                      <button
                        onClick={() => doAction({ action: "reorder", id: movie.id, direction: "up" })}
                        disabled={busy || globalIdx === 0}
                        className="w-7 h-7 rounded-md bg-[var(--c-fill-3)] text-[var(--c-text-2)] flex items-center justify-center text-[12px] disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => doAction({ action: "reorder", id: movie.id, direction: "down" })}
                        disabled={busy || globalIdx === sorted.length - 1}
                        className="w-7 h-7 rounded-md bg-[var(--c-fill-3)] text-[var(--c-text-2)] flex items-center justify-center text-[12px] disabled:opacity-30"
                      >
                        ▼
                      </button>
                      <DeleteButton id={movie.id} />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════
            SECTION 2: Top 5 จากสตรีมมิง
        ══════════════════════════════════════════ */}
        <SectionTitle>ยอดนิยมจากสตรีมมิง</SectionTitle>

        {/* Sub-tabs */}
        <div className="flex gap-1 mb-3 bg-[var(--c-fill-3)] rounded-xl p-1">
          {STREAMING_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setStreamTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all ${
                streamTab === t.key
                  ? "bg-[var(--c-accent)] text-white shadow-sm"
                  : "text-[var(--c-text-2)] hover:text-[var(--c-text)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl bg-[var(--c-card)] border border-[var(--c-sep)] overflow-hidden">
          {streamLoading[streamTab] ? (
            <MiniSpinner />
          ) : !streamMovies[streamTab] || streamMovies[streamTab].length === 0 ? (
            <div className="text-center py-6 text-[var(--c-text-3)] text-[13px]">
              ไม่พบข้อมูล
            </div>
          ) : (
            streamMovies[streamTab].map((movie, i) => (
              <div
                key={movie.id}
                className={i > 0 ? "border-t border-[var(--c-sep)]" : ""}
              >
                <CompactRow movie={movie} />
              </div>
            ))
          )}
        </div>

        {/* ══════════════════════════════════════════
            SECTION 3: สำรวจตามหมวด
        ══════════════════════════════════════════ */}
        <SectionTitle>สำรวจตามหมวด</SectionTitle>

        <div className="flex justify-end mb-2">
          <button
            onClick={refreshAllGenres}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--c-fill-3)] text-[var(--c-text-2)] text-[13px] font-medium active:bg-[var(--c-fill-2)] transition-colors"
          >
            <span className="text-[15px]">🎲</span> สุ่มใหม่ทั้งหมด
          </button>
        </div>

        <div className="space-y-5">
          {GENRE_SECTIONS.map((genre) => (
            <div key={genre.id}>
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-[14px] font-semibold text-[var(--c-text)]">
                  {genre.label}
                </p>
                <button
                  onClick={() => loadGenre(genre.id, true)}
                  disabled={genreLoading[genre.id]}
                  className="text-[12px] text-[var(--c-accent)] font-medium active:opacity-60 disabled:opacity-40"
                >
                  🔄 สุ่มใหม่
                </button>
              </div>
              {genreLoading[genre.id] ? (
                <MiniSpinner />
              ) : !genreMovies[genre.id] || genreMovies[genre.id].length === 0 ? (
                <div className="text-center py-4 text-[var(--c-text-3)] text-[13px]">
                  กำลังโหลด...
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  {genreMovies[genre.id].map((movie) => (
                    <div
                      key={movie.id}
                      className="flex-shrink-0 w-[105px] rounded-xl bg-[var(--c-card)] border border-[var(--c-sep)] overflow-hidden flex flex-col"
                    >
                      {movie.poster_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${POSTER_SM}${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full aspect-[2/3] object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-[2/3] bg-[var(--c-fill-2)] flex items-center justify-center">
                          <span className="text-[var(--c-text-3)] text-[10px]">N/A</span>
                        </div>
                      )}
                      <div className="p-1.5 flex-1 flex flex-col">
                        <p className="text-[10px] font-medium text-[var(--c-text)] leading-tight line-clamp-2">
                          {movie.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] text-[var(--c-text-3)]">
                            {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
                          </span>
                          {movie.vote_average > 0 && (
                            <span className="text-[9px] text-yellow-500">★{movie.vote_average.toFixed(1)}</span>
                          )}
                        </div>
                        <div className="mt-auto pt-1">
                          <AddButton movie={movie} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </MainNavigationShell>
  );
}
