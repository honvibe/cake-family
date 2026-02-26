"use client";

import MainNavigationShell from "@/components/main-navigation-shell";
import { useCallback, useEffect, useRef, useState } from "react";

interface HonItem {
  id: number;
  title: string;
  poster: string;
  year: string;
  overview: string;
  rating: number;
  addedAt: string;
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

const POSTER = "https://image.tmdb.org/t/p/w342";
const POSTER_SM = "https://image.tmdb.org/t/p/w154";
const LOGO_BASE = "https://image.tmdb.org/t/p/w45";
const MAX = 8;

interface GenreConfig {
  id: string;
  label: string;
  type?: "tv" | "movie";
  keywords?: string;
  originLang?: string;
  genre?: string; // override genre param (for configs that use id as unique key)
}

const GENRES: GenreConfig[] = [
  // Movies
  { id: "28", label: "Action" },
  { id: "53", label: "Thriller" },
  { id: "plot-twist", label: "Plot Twist", genre: "53,9648" },
  { id: "878", label: "Sci-Fi" },
  { id: "80", label: "Crime" },
  { id: "10752", label: "War" },
  { id: "27", label: "Horror" },
  { id: "12", label: "Adventure" },
  { id: "9648", label: "Mystery" },
  { id: "16", label: "Animation" },
  { id: "35", label: "Comedy" },
  { id: "99", label: "Documentary" },
  { id: "37", label: "Western" },
  // TV Series
  { id: "kserie", label: "K-Series", type: "tv", originLang: "ko" },
  { id: "jserie", label: "J-Series", type: "tv", originLang: "ja" },
  { id: "tv-animation", label: "Animation (TV)", type: "tv", genre: "16" },
];

export default function HonWatchlistPage() {
  const [list, setList] = useState<HonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Genre suggestions
  const [genreMovies, setGenreMovies] = useState<Record<string, TMDBMovie[]>>({});
  const [genreLoading, setGenreLoading] = useState<Record<string, boolean>>({});
  const [providers, setProviders] = useState<Record<number, Provider[]>>({});
  const seenIdsRef = useRef<Set<number>>(new Set());

  // Detail modal
  const [detailMovie, setDetailMovie] = useState<HonItem | null>(null);
  const [thaiOverview, setThaiOverview] = useState<string | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Drag reorder
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlist-hon");
      const json = await res.json();
      if (json.list) setList(json.list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  // Fetch providers for list items
  useEffect(() => {
    if (list.length === 0) return;
    const missing = list.filter((m) => m.id > 0 && !(m.id in providers));
    if (missing.length === 0) return;
    const ids = missing.map((m) => m.id).join(",");
    fetch(`/api/tmdb/providers?ids=${ids}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.batch) {
          setProviders((prev) => {
            const next = { ...prev };
            for (const [mid, provs] of Object.entries(d.batch)) {
              next[Number(mid)] = provs as Provider[];
            }
            return next;
          });
        }
      })
      .catch(() => {});
  }, [list, providers]);

  // Fetch Thai overview when detail modal opens
  const openDetail = (movie: HonItem) => {
    setDetailMovie(movie);
    setThaiOverview(null);
    if (movie.id > 0) {
      setOverviewLoading(true);
      fetch(`/api/tmdb/detail?id=${movie.id}&lang=th`)
        .then((r) => r.json())
        .then((d) => {
          setThaiOverview(d.overview || movie.overview || "ไม่มีเรื่องย่อ");
        })
        .catch(() => setThaiOverview(movie.overview || "ไม่มีเรื่องย่อ"))
        .finally(() => setOverviewLoading(false));
    } else {
      setThaiOverview(movie.overview || "ไม่มีเรื่องย่อ");
    }
  };

  // Search debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query.trim())}`);
        const d = await res.json();
        setResults(d.results || []);
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // Load genre movies
  const loadGenre = useCallback((genreId: string, force = false) => {
    if (!force && genreMovies[genreId]) return;
    if (genreLoading[genreId]) return;
    setGenreLoading((p) => ({ ...p, [genreId]: true }));

    // Remove old IDs if refreshing
    if (force && genreMovies[genreId]) {
      genreMovies[genreId].forEach((m) => seenIdsRef.current.delete(m.id));
    }

    const config = GENRES.find((g) => g.id === genreId);
    const mediaType = config?.type || "movie";
    const page = Math.floor(Math.random() * 30) + 1;

    // Build query params
    const qp = new URLSearchParams({ page: String(page) });
    if (mediaType === "tv") qp.set("type", "tv");
    const genreParam = config?.genre || (!config?.keywords && !config?.originLang && /^\d+$/.test(genreId) ? genreId : "");
    if (genreParam) qp.set("genre", genreParam);
    if (config?.keywords) qp.set("keywords", config.keywords);
    if (config?.originLang) qp.set("originLang", config.originLang);

    fetch(`/api/tmdb/discover?${qp}`)
      .then((r) => r.json())
      .then((d) => {
        const all: TMDBMovie[] = d.results || [];
        const fresh = all.filter((m) => !seenIdsRef.current.has(m.id));
        const picked = fresh.slice(0, 4);
        picked.forEach((m) => seenIdsRef.current.add(m.id));
        setGenreMovies((p) => ({ ...p, [genreId]: picked }));

        // Batch fetch providers
        const ids = picked.map((m) => m.id).join(",");
        if (ids) {
          const provQp = new URLSearchParams({ ids });
          if (mediaType === "tv") provQp.set("type", "tv");
          fetch(`/api/tmdb/providers?${provQp}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.batch) {
                setProviders((prev) => {
                  const next = { ...prev };
                  for (const [mid, provs] of Object.entries(d.batch)) {
                    next[Number(mid)] = provs as Provider[];
                  }
                  return next;
                });
              }
            })
            .catch(() => {});
        }
      })
      .finally(() => setGenreLoading((p) => ({ ...p, [genreId]: false })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genreMovies, genreLoading]);

  // Initial load: first 6 genres immediately, rest after delay
  useEffect(() => {
    GENRES.slice(0, 6).forEach((g) => loadGenre(g.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      GENRES.slice(6).forEach((g) => {
        if (!genreMovies[g.id] && !genreLoading[g.id]) loadGenre(g.id);
      });
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshAll = () => {
    seenIdsRef.current.clear();
    GENRES.forEach((g) => loadGenre(g.id, true));
  };

  const addMovie = async (movie: TMDBMovie) => {
    if (list.length >= MAX) return;
    setBusy(true);
    try {
      const res = await fetch("/api/watchlist-hon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          item: {
            id: movie.id,
            title: movie.title,
            poster: movie.poster_path || "",
            year: movie.release_date ? movie.release_date.slice(0, 4) : "",
            overview: movie.overview || "",
            rating: movie.vote_average || 0,
            addedAt: "",
          },
        }),
      });
      const json = await res.json();
      if (json.list) {
        setList(json.list);
        setQuery("");
        setResults([]);
      }
    } finally {
      setBusy(false);
    }
  };

  const removeMovie = async (id: number) => {
    setBusy(true);
    try {
      const res = await fetch("/api/watchlist-hon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", id }),
      });
      const json = await res.json();
      if (json.list) setList(json.list);
    } finally {
      setBusy(false);
    }
  };

  const reorderList = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    // Optimistic update
    const newList = [...list];
    const [item] = newList.splice(fromIndex, 1);
    newList.splice(toIndex, 0, item);
    setList(newList);
    // Save to API
    fetch("/api/watchlist-hon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", fromIndex, toIndex }),
    }).catch(() => {});
  };

  const handleDragStart = (idx: number) => { dragIdx.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDrop = (idx: number) => {
    if (dragIdx.current !== null && dragIdx.current !== idx) {
      reorderList(dragIdx.current, idx);
    }
    dragIdx.current = null;
    setDragOverIdx(null);
  };
  const handleDragEnd = () => { dragIdx.current = null; setDragOverIdx(null); };

  const isInList = (id: number) => list.some((m) => m.id === id);

  const AddBtn = ({ movie }: { movie: TMDBMovie }) => {
    if (isInList(movie.id)) {
      return <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] bg-[var(--c-fill-2)] text-[var(--c-text-3)] flex-shrink-0">✓</span>;
    }
    if (list.length >= MAX) return null;
    return (
      <button
        onClick={(e) => { e.stopPropagation(); addMovie(movie); }}
        disabled={busy}
        className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] bg-[var(--c-accent)] text-white active:opacity-80 flex-shrink-0"
      >+</button>
    );
  };

  const ProviderLogos = ({ movieId }: { movieId: number }) => {
    const p = providers[movieId];
    if (!p || p.length === 0) return <span className="text-[11px] text-[var(--c-text-4)]">—</span>;
    return (
      <div className="flex gap-0.5">
        {p.slice(0, 3).map((prov) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={prov.id} src={`${LOGO_BASE}${prov.logo}`} alt={prov.name} title={prov.name} className="w-5 h-5 rounded" />
        ))}
        {p.length > 3 && <span className="text-[10px] text-[var(--c-text-3)] self-center ml-0.5">+{p.length - 3}</span>}
      </div>
    );
  };

  return (
    <MainNavigationShell title="Hon Watchlist">
      <div className="max-w-7xl mx-auto px-2 md:px-6">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-[28px] md:text-[32px] font-bold text-[var(--c-text)]">
            Hon คนเดียว
          </h1>
          <p className="text-[16px] text-[var(--c-text-2)] leading-relaxed">
            รายการส่วนตัว ({list.length}/{MAX})
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาหนัง / ซีรีส์..."
              className="w-full h-12 px-5 pr-11 rounded-xl bg-[var(--c-fill-3)] text-[var(--c-text)] placeholder:text-[var(--c-text-3)] text-[16px] border border-[var(--c-sep)] focus:outline-none focus:border-[var(--c-accent)] transition-colors"
            />
            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {results.length > 0 && (
            <div className="mt-2 rounded-xl border border-[var(--c-sep)] bg-[var(--c-card)] overflow-hidden divide-y divide-[var(--c-sep)]">
              {results.slice(0, 6).map((movie) => (
                <div key={movie.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--c-fill-3)] transition-colors">
                  {movie.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${POSTER_SM}${movie.poster_path}`} alt="" className="w-9 h-[54px] rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-[54px] rounded-lg bg-[var(--c-fill-2)] flex items-center justify-center flex-shrink-0">
                      <span className="text-[var(--c-text-3)] text-[10px]">N/A</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[var(--c-text)] truncate">{movie.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-[var(--c-text-3)]">{movie.release_date?.slice(0, 4) || "N/A"}</span>
                      {movie.vote_average > 0 && <span className="text-[13px] text-yellow-500">★{movie.vote_average.toFixed(1)}</span>}
                    </div>
                  </div>
                  <AddBtn movie={movie} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My List Gallery */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--c-sep)] bg-[var(--c-card)] p-10 text-center mb-8">
            <p className="text-[16px] text-[var(--c-text-3)]">ยังไม่มีรายการ — ค้นหาหรือเลือกจากด้านล่าง</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 mb-8">
            {list.map((movie, idx) => (
              <div
                key={movie.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={handleDragEnd}
                className={`rounded-xl bg-[var(--c-card)] border overflow-hidden flex flex-col cursor-grab active:cursor-grabbing transition-all ${
                  dragOverIdx === idx ? "border-[var(--c-accent)] scale-[1.03]" : "border-[var(--c-sep)]"
                }`}
                onPointerDown={(e) => { pointerStart.current = { x: e.clientX, y: e.clientY }; }}
                onPointerUp={(e) => {
                  if (!pointerStart.current) return;
                  const dx = Math.abs(e.clientX - pointerStart.current.x);
                  const dy = Math.abs(e.clientY - pointerStart.current.y);
                  pointerStart.current = null;
                  if (dx < 10 && dy < 10) openDetail(movie);
                }}
              >
                {movie.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${POSTER_SM}${movie.poster}`} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
                ) : (
                  <div className="w-full aspect-[2/3] bg-[var(--c-fill-2)] flex items-center justify-center">
                    <span className="text-[var(--c-text-3)] text-lg">🎬</span>
                  </div>
                )}
                <div className="p-1.5 flex-1 flex flex-col">
                  <p className="text-[12px] font-semibold text-[var(--c-text)] leading-tight line-clamp-2 mb-0.5">{movie.title}</p>
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[10px] text-[var(--c-text-3)]">{movie.year || ""}</span>
                    {movie.rating > 0 && <span className="text-[10px] text-yellow-500">★{movie.rating.toFixed(1)}</span>}
                  </div>
                  <div className="mb-1">
                    <ProviderLogos movieId={movie.id} />
                  </div>
                  <div className="mt-auto">
                    <button onClick={(e) => { e.stopPropagation(); removeMovie(movie.id); }} disabled={busy} className="w-full py-1 rounded-md bg-red-500/10 text-red-400 text-[11px] font-medium active:bg-red-500/20 transition-colors">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Genre Suggestions ── */}
        <div className="border-t border-[var(--c-sep)] pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-bold text-[var(--c-text)]">แนะนำ</h2>
            <button
              onClick={refreshAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--c-fill-3)] text-[var(--c-text-2)] text-[13px] font-medium active:bg-[var(--c-fill-2)] transition-colors"
            >
              🎲 สุ่มใหม่ทั้งหมด
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-5">
            {GENRES.map((genre) => (
              <div key={genre.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[15px] font-semibold text-[var(--c-text)]">{genre.label}</h3>
                  <button
                    onClick={() => loadGenre(genre.id, true)}
                    disabled={genreLoading[genre.id]}
                    className="text-[12px] text-[var(--c-accent)] font-medium active:opacity-60 disabled:opacity-40"
                  >
                    🔄
                  </button>
                </div>

                {genreLoading[genre.id] && !genreMovies[genre.id] ? (
                  <div className="flex justify-center py-4">
                    <div className="w-4 h-4 border-2 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !genreMovies[genre.id] || genreMovies[genre.id].length === 0 ? (
                  <p className="text-[13px] text-[var(--c-text-3)] py-3">กำลังโหลด...</p>
                ) : (
                  <div className="rounded-xl bg-[var(--c-card)] border border-[var(--c-sep)] overflow-hidden divide-y divide-[var(--c-sep)]">
                    {genreMovies[genre.id].map((movie) => (
                      <div key={movie.id} className="flex items-center gap-2.5 px-2.5 py-2">
                        {movie.poster_path ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`${POSTER_SM}${movie.poster_path}`} alt="" className="w-9 h-[54px] rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-[54px] rounded bg-[var(--c-fill-2)] flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] text-[var(--c-text-3)]">N/A</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-[var(--c-text)] truncate leading-tight">{movie.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-[var(--c-text-3)]">{movie.release_date?.slice(0, 4) || ""}</span>
                            {movie.vote_average > 0 && (
                              <span className="text-[11px] text-yellow-500">★{movie.vote_average.toFixed(1)}</span>
                            )}
                          </div>
                          <div className="mt-0.5">
                            <ProviderLogos movieId={movie.id} />
                          </div>
                        </div>
                        <AddBtn movie={movie} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="h-10" />
      </div>

      {/* Detail Modal */}
      {detailMovie && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setDetailMovie(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative bg-[var(--c-card)] rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {detailMovie.poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${POSTER}${detailMovie.poster}`} alt="" className="w-full aspect-[2/3] object-cover rounded-t-2xl" />
            )}
            <div className="p-4">
              <h3 className="text-[20px] font-bold text-[var(--c-text)] leading-tight mb-1.5">
                {detailMovie.title}
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[14px] text-[var(--c-text-3)]">{detailMovie.year || "N/A"}</span>
                {detailMovie.rating > 0 && <span className="text-[14px] text-yellow-500">★ {detailMovie.rating.toFixed(1)}</span>}
              </div>
              <div className="mb-3">
                <ProviderLogos movieId={detailMovie.id} />
              </div>
              <div className="border-t border-[var(--c-sep)] pt-3">
                <h4 className="text-[14px] font-semibold text-[var(--c-text-2)] mb-1.5">เรื่องย่อ</h4>
                {overviewLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <div className="w-4 h-4 border-2 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[14px] text-[var(--c-text-3)]">กำลังโหลด...</span>
                  </div>
                ) : (
                  <p className="text-[15px] text-[var(--c-text)] leading-relaxed">
                    {thaiOverview || "ไม่มีเรื่องย่อ"}
                  </p>
                )}
              </div>
              <button
                onClick={() => setDetailMovie(null)}
                className="w-full mt-4 py-2.5 rounded-xl bg-[var(--c-fill-3)] text-[var(--c-text-2)] text-[15px] font-medium active:bg-[var(--c-fill-2)] transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </MainNavigationShell>
  );
}
