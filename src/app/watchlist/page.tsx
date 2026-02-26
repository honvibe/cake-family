"use client";

import Link from "next/link";
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

interface WatchlistData {
  nextWatch: WatchlistItem | null;
  lastPicker: "hon" | "jay" | null;
  honList: WatchlistItem[];
  jayList: WatchlistItem[];
  spareList: WatchlistItem[];
  watchedList: WatchlistItem[];
  boringList: WatchlistItem[];
  undo: unknown;
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

type ListName = "hon" | "jay" | "spare";

/* ── Constants ── */
const POSTER_SM = "https://image.tmdb.org/t/p/w154";
const POSTER_LG = "https://image.tmdb.org/t/p/w342";
const LOGO_BASE = "https://image.tmdb.org/t/p/w45";

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

function emptyData(): WatchlistData {
  return { nextWatch: null, lastPicker: null, honList: [], jayList: [], spareList: [], watchedList: [], boringList: [], undo: null };
}

let customIdCounter = -1;

export default function WatchlistPage() {
  const [data, setData] = useState<WatchlistData>(emptyData());
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [providers, setProviders] = useState<Record<number, Provider[]>>({});
  const [addTarget, setAddTarget] = useState<{ movie: TMDBMovie } | null>(null);
  const [showWatched, setShowWatched] = useState(false);
  const [showBoring, setShowBoring] = useState(false);

  // Streaming section
  const [streamTab, setStreamTab] = useState("netflix");
  const [streamMovies, setStreamMovies] = useState<Record<string, TMDBMovie[]>>({});
  const [streamLoading, setStreamLoading] = useState<Record<string, boolean>>({});

  // Genre section
  const [genreMovies, setGenreMovies] = useState<Record<string, TMDBMovie[]>>({});
  const [genreLoading, setGenreLoading] = useState<Record<string, boolean>>({});
  const usedIdsRef = useRef<Set<number>>(new Set());

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalItems = data.honList.length + data.jayList.length + data.spareList.length + (data.nextWatch ? 1 : 0);

  /* ── Fetch watchlist ── */
  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlist");
      const json = await res.json();
      if (json && typeof json === "object" && "honList" in json) {
        setData(json as WatchlistData);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  /* ── Fetch providers for nextWatch ── */
  useEffect(() => {
    if (!data.nextWatch) return;
    const id = data.nextWatch.id;
    if (id < 0 || id in providers) return; // skip custom movies (negative id)
    fetch(`/api/tmdb/providers?id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.providers) setProviders((prev) => ({ ...prev, [id]: d.providers }));
      })
      .catch(() => {});
  }, [data.nextWatch, providers]);

  /* ── Fetch streaming top movies ── */
  useEffect(() => {
    if (streamMovies[streamTab] || streamLoading[streamTab]) return;
    const tab = STREAMING_TABS.find((t) => t.key === streamTab);
    if (!tab) return;

    setStreamLoading((p) => ({ ...p, [streamTab]: true }));
    fetch(`/api/tmdb/discover?provider=${tab.providerId}`)
      .then((r) => r.json())
      .then((d) => {
        setStreamMovies((p) => ({ ...p, [streamTab]: (d.results || []).slice(0, 5) }));
      })
      .finally(() => setStreamLoading((p) => ({ ...p, [streamTab]: false })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamTab]);

  /* ── Fetch genre movies ── */
  const loadGenre = useCallback((genreId: string, force = false) => {
    if (!force && genreMovies[genreId]) return;
    if (genreLoading[genreId]) return;
    setGenreLoading((p) => ({ ...p, [genreId]: true }));
    if (force && genreMovies[genreId]) {
      genreMovies[genreId].forEach((m) => usedIdsRef.current.delete(m.id));
    }
    const page = Math.floor(Math.random() * 20) + 1;
    fetch(`/api/tmdb/discover?genre=${genreId}&page=${page}`)
      .then((r) => r.json())
      .then((d) => {
        const all: TMDBMovie[] = d.results || [];
        const fresh = all.filter((m) => !usedIdsRef.current.has(m.id));
        const picked = fresh.slice(0, 10);
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
    usedIdsRef.current.clear();
    GENRE_SECTIONS.forEach((g) => loadGenre(g.id, true));
  };

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
      setSearchDone(false);
      return;
    }
    setSearchDone(false);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query.trim())}`);
        const d = await res.json();
        setSearchResults(d.results || []);
        setSearchDone(true);
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
      const json = await res.json();
      if (json.data) setData(json.data);
      return res.ok;
    } finally {
      setBusy(false);
    }
  };

  const addMovie = async (movie: TMDBMovie, list: ListName) => {
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
    const ok = await doAction({ action: "add", item, list });
    if (ok) {
      setQuery("");
      setSearchResults([]);
      setSearchDone(false);
      setAddTarget(null);
    }
  };

  const addCustomMovie = (title: string, list: ListName) => {
    const item = {
      id: customIdCounter--,
      title,
      poster: "",
      year: "",
      order: 0,
      addedAt: "",
      overview: "",
      rating: 0,
    };
    doAction({ action: "add", item, list }).then((ok) => {
      if (ok) {
        setQuery("");
        setSearchResults([]);
        setSearchDone(false);
        setAddTarget(null);
      }
    });
  };

  const isInList = (id: number) => {
    const all = [...data.honList, ...data.jayList, ...data.spareList];
    if (data.nextWatch) all.push(data.nextWatch);
    return all.some((m) => m.id === id);
  };

  // Turn logic: who picks next?
  const nextPicker: "hon" | "jay" | null =
    data.lastPicker === "hon" ? "jay" : data.lastPicker === "jay" ? "hon" : null;

  /* ── Sub-components ── */

  const AddListPicker = ({ movie }: { movie: TMDBMovie }) => {
    if (isInList(movie.id)) {
      return (
        <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[13px] bg-[var(--c-fill-2)] text-[var(--c-text-3)]">
          ✓
        </span>
      );
    }
    return (
      <button
        onClick={() => setAddTarget({ movie })}
        disabled={busy}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[13px] bg-[var(--c-accent)] text-white active:opacity-80 transition-colors"
      >
        +
      </button>
    );
  };

  // Modal for picking which list to add to (both TMDB + custom)
  const AddTargetModal = () => {
    if (!addTarget) return null;
    const { movie } = addTarget;
    const isCustom = movie.id <= 0;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6" onClick={() => setAddTarget(null)}>
        <div className="bg-[var(--c-card)] rounded-2xl p-5 w-full max-w-xs border border-[var(--c-sep)]" onClick={(e) => e.stopPropagation()}>
          <p className="text-[16px] font-semibold text-[var(--c-text)] text-center mb-1 truncate">
            {movie.title}
          </p>
          <p className="text-[14px] text-[var(--c-text-3)] text-center mb-4">เพิ่มเข้า list ไหน?</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => isCustom ? addCustomMovie(movie.title, "hon") : addMovie(movie, "hon")}
              disabled={busy}
              className="h-11 rounded-xl bg-blue-600 text-white text-[16px] font-semibold active:opacity-80 transition-opacity"
            >
              🔵 Hon List
            </button>
            <button
              onClick={() => isCustom ? addCustomMovie(movie.title, "jay") : addMovie(movie, "jay")}
              disabled={busy}
              className="h-11 rounded-xl bg-pink-600 text-white text-[16px] font-semibold active:opacity-80 transition-opacity"
            >
              🩷 Jay List
            </button>
            <button
              onClick={() => isCustom ? addCustomMovie(movie.title, "spare") : addMovie(movie, "spare")}
              disabled={busy}
              className="h-11 rounded-xl bg-amber-600 text-white text-[16px] font-semibold active:opacity-80 transition-opacity"
            >
              ⭐ Spare List
            </button>
            <button
              onClick={() => setAddTarget(null)}
              className="h-11 rounded-xl bg-[var(--c-fill-3)] text-[var(--c-text-2)] text-[14px] font-medium active:opacity-80"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DeleteButton = ({ id, list }: { id: number; list: ListName }) => (
    <button
      onClick={() => doAction({ action: "remove", id, list })}
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
      <div className="flex gap-1 flex-wrap mt-1">
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
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[var(--c-fill-3)] transition-colors">
      {movie.poster_path ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${POSTER_SM}${movie.poster_path}`}
          alt={movie.title}
          className="w-10 h-[60px] rounded-md object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-[60px] rounded-md bg-[var(--c-fill-2)] flex items-center justify-center flex-shrink-0">
          <span className="text-[var(--c-text-3)] text-[11px]">N/A</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-medium text-[var(--c-text)] truncate">{movie.title}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] text-[var(--c-text-3)]">
            {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
          </span>
          {movie.vote_average > 0 && (
            <span className="text-[14px] text-yellow-500">★{movie.vote_average.toFixed(1)}</span>
          )}
        </div>
      </div>
      {showAdd && <AddListPicker movie={movie} />}
    </div>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-3 mt-10 mb-4">
      <div className="h-px flex-1 bg-[var(--c-sep)]" />
      <h2 className="text-[18px] font-semibold text-[var(--c-text-2)] px-3">{children}</h2>
      <div className="h-px flex-1 bg-[var(--c-sep)]" />
    </div>
  );

  const MiniSpinner = () => (
    <div className="flex justify-center py-6">
      <div className="w-5 h-5 border-2 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  /* ── Next Watch Card ── */
  const NextWatchCard = () => {
    const nw = data.nextWatch;
    if (!nw) {
      return (
        <div className="rounded-2xl border border-dashed border-[var(--c-sep)] bg-[var(--c-card)] p-8 text-center">
          <p className="text-[16px] text-[var(--c-text-3)] leading-relaxed">
            ยังไม่ได้เลือก — กดเลือกจาก list ด้านล่าง
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-[var(--c-accent)]/30 bg-[var(--c-card)] overflow-hidden">
        <div className="flex gap-3 p-3">
          {nw.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${POSTER_LG}${nw.poster}`}
              alt={nw.title}
              className="w-[100px] h-[150px] rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-[100px] h-[150px] rounded-xl bg-[var(--c-fill-2)] flex items-center justify-center flex-shrink-0">
              <span className="text-[var(--c-text-3)] text-[12px]">N/A</span>
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col">
            <h2 className="text-[22px] font-bold text-[var(--c-text)] leading-tight line-clamp-2">
              {nw.title}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[15px] text-[var(--c-text-3)]">{nw.year || "N/A"}</span>
              {nw.rating ? (
                <span className="text-[15px] text-yellow-500">★ {nw.rating.toFixed(1)}</span>
              ) : null}
            </div>
            {data.lastPicker && (
              <div className="mt-2">
                <span className={`inline-block text-[13px] font-semibold px-2.5 py-0.5 rounded-full ${
                  data.lastPicker === "hon"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-pink-500/20 text-pink-400"
                }`}>
                  {data.lastPicker === "hon" ? "Hon" : "Jay"} เลือก
                </span>
              </div>
            )}
            <ProviderLogos movieId={nw.id} />
            <div className="mt-auto pt-3 flex flex-wrap gap-2">
              <button
                onClick={() => doAction({ action: "finish" })}
                disabled={busy}
                className="h-10 px-4 rounded-lg bg-green-600 text-white text-[15px] font-semibold active:opacity-80 transition-opacity"
              >
                ✓ ดูแล้ว
              </button>
              <button
                onClick={() => doAction({ action: "drop" })}
                disabled={busy}
                className="h-10 px-4 rounded-lg bg-red-600/80 text-white text-[15px] font-semibold active:opacity-80 transition-opacity"
              >
                ✕ ทิ้ง
              </button>
              {data.undo !== null && (
                <button
                  onClick={() => doAction({ action: "undo" })}
                  disabled={busy}
                  className="h-10 px-4 rounded-lg bg-[var(--c-fill-3)] text-[var(--c-text-2)] text-[15px] font-medium active:bg-[var(--c-fill-2)] transition-colors"
                >
                  ↩ Undo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── List Section ── */
  const ListSection = ({
    title,
    emoji,
    color,
    items,
    listName,
  }: {
    title: string;
    emoji: string;
    color: string;
    items: WatchlistItem[];
    listName: ListName;
  }) => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    // Can this list's items be picked next?
    const canPick = listName === "spare"
      ? true  // spare always pickable, no turn restriction
      : (nextPicker === listName || nextPicker === null);

    return (
      <div>
        <div className="flex items-center gap-2 mb-2.5 px-1">
          <h3 className={`text-[18px] font-semibold ${color}`}>
            {emoji} {title} ({sorted.length})
          </h3>
        </div>
        {sorted.length === 0 ? (
          <div className="text-center py-5 text-[var(--c-text-3)] text-[16px] rounded-xl border border-dashed border-[var(--c-sep)]">
            ว่าง
          </div>
        ) : (
          <div className="rounded-xl bg-[var(--c-card)] border border-[var(--c-sep)] overflow-hidden">
            {sorted.map((movie, i) => (
              <div
                key={movie.id}
                className={`flex items-center gap-2.5 px-3 py-2.5 ${i > 0 ? "border-t border-[var(--c-sep)]" : ""}`}
              >
                <span className="text-[14px] text-[var(--c-text-3)] w-5 text-center flex-shrink-0 font-semibold">
                  {i + 1}
                </span>
                {movie.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${POSTER_SM}${movie.poster}`}
                    alt={movie.title}
                    className="w-10 h-[60px] rounded-md object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-[60px] rounded-md bg-[var(--c-fill-2)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[var(--c-text-3)] text-[10px]">N/A</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-medium text-[var(--c-text)] truncate">{movie.title}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] text-[var(--c-text-3)]">{movie.year || "N/A"}</span>
                    {movie.rating ? (
                      <span className="text-[14px] text-yellow-500">★{movie.rating.toFixed(1)}</span>
                    ) : null}
                  </div>
                </div>
                {/* Pick next buttons */}
                {canPick && listName !== "spare" && (
                  <button
                    onClick={() => doAction({ action: "pick-next", id: movie.id, list: listName, picker: listName })}
                    disabled={busy}
                    className={`h-8 px-2.5 rounded-lg text-[13px] font-semibold text-white active:opacity-80 transition-opacity flex-shrink-0 ${
                      listName === "hon" ? "bg-blue-600" : "bg-pink-600"
                    }`}
                  >
                    ▶ Next
                  </button>
                )}
                {listName === "spare" && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => doAction({ action: "move", id: movie.id, from: "spare", to: "hon" })}
                      disabled={busy}
                      className="h-8 px-2 rounded-lg bg-blue-600 text-white text-[13px] font-semibold active:opacity-80 transition-opacity"
                    >
                      ▶Hon
                    </button>
                    <button
                      onClick={() => doAction({ action: "move", id: movie.id, from: "spare", to: "jay" })}
                      disabled={busy}
                      className="h-8 px-2 rounded-lg bg-pink-600 text-white text-[13px] font-semibold active:opacity-80 transition-opacity"
                    >
                      ▶Jay
                    </button>
                    <button
                      onClick={() => doAction({ action: "pick-next", id: movie.id, list: "spare" })}
                      disabled={busy}
                      className="h-8 px-2 rounded-lg bg-green-600 text-white text-[13px] font-semibold active:opacity-80 transition-opacity"
                    >
                      ▶Watch
                    </button>
                  </div>
                )}
                <button
                  onClick={() => doAction({ action: "reorder", id: movie.id, list: listName, direction: "up" })}
                  disabled={busy || i === 0}
                  className="w-8 h-8 rounded-lg bg-[var(--c-fill-3)] text-[var(--c-text-2)] flex items-center justify-center text-[14px] disabled:opacity-30 flex-shrink-0"
                >
                  ▲
                </button>
                <button
                  onClick={() => doAction({ action: "reorder", id: movie.id, list: listName, direction: "down" })}
                  disabled={busy || i === sorted.length - 1}
                  className="w-8 h-8 rounded-lg bg-[var(--c-fill-3)] text-[var(--c-text-2)] flex items-center justify-center text-[14px] disabled:opacity-30 flex-shrink-0"
                >
                  ▼
                </button>
                <DeleteButton id={movie.id} list={listName} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── Pool Section (watched / boring) ── */
  const PoolSection = ({
    title,
    emoji,
    items,
    pool,
    show,
    toggle,
  }: {
    title: string;
    emoji: string;
    items: WatchlistItem[];
    pool: "watched" | "boring";
    show: boolean;
    toggle: () => void;
  }) => {
    if (items.length === 0) return null;
    return (
      <div>
        <button
          onClick={toggle}
          className="flex items-center gap-2 mb-2 px-1 w-full text-left"
        >
          <h3 className="text-[18px] font-semibold text-[var(--c-text-2)]">
            {emoji} {title} ({items.length})
          </h3>
          <span className="text-[13px] text-[var(--c-text-3)]">{show ? "▼" : "▶"}</span>
        </button>
        {show && (
          <div className="rounded-xl bg-[var(--c-card)] border border-[var(--c-sep)] overflow-hidden">
            {items.map((movie, i) => (
              <div
                key={movie.id}
                className={`flex items-center gap-3 px-3 py-2.5 ${i > 0 ? "border-t border-[var(--c-sep)]" : ""}`}
              >
                {movie.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${POSTER_SM}${movie.poster}`}
                    alt={movie.title}
                    className="w-10 h-[60px] rounded-md object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-[60px] rounded-md bg-[var(--c-fill-2)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[var(--c-text-3)] text-[10px]">N/A</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-medium text-[var(--c-text)] truncate">{movie.title}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] text-[var(--c-text-3)]">{movie.year || "N/A"}</span>
                    {movie.rating ? (
                      <span className="text-[14px] text-yellow-500">★{movie.rating.toFixed(1)}</span>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={() => doAction({ action: "remove-pool", id: movie.id, pool })}
                  disabled={busy}
                  className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center text-[14px] flex-shrink-0 active:bg-red-500/25 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <MainNavigationShell title="Watchlist">
      <div className="max-w-7xl mx-auto px-2 md:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] md:text-[32px] font-bold text-[var(--c-text)]">
            Watchlist
          </h1>
          <p className="text-[16px] md:text-[18px] text-[var(--c-text-2)] leading-relaxed">
            รายการหนังที่อยากดู ({totalItems}/90)
            {nextPicker && (
              <span className={`ml-2 font-semibold ${nextPicker === "hon" ? "text-blue-400" : "text-pink-400"}`}>
                — คิวถัดไป: {nextPicker === "hon" ? "Hon" : "Jay"}
              </span>
            )}
          </p>
          <Link
            href="/watchlist/hon"
            className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl bg-blue-600/15 text-blue-400 text-[14px] font-semibold hover:bg-blue-600/25 transition-colors"
          >
            🔵 Hon คนเดียว →
          </Link>
        </div>

        {/* ── Search ── */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาหนัง..."
              className="w-full h-12 px-5 pr-11 rounded-xl bg-[var(--c-fill-3)] text-[var(--c-text)] placeholder:text-[var(--c-text-3)] text-[16px] border border-[var(--c-sep)] focus:outline-none focus:border-[var(--c-accent)] transition-colors"
            />
            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
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
                    <p className="text-[16px] font-medium text-[var(--c-text)] leading-tight truncate">
                      {movie.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[14px] text-[var(--c-text-3)]">
                        {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
                      </span>
                      {movie.vote_average > 0 && (
                        <span className="text-[14px] text-yellow-500">★ {movie.vote_average.toFixed(1)}</span>
                      )}
                    </div>
                    <p className="text-[14px] text-[var(--c-text-2)] mt-1 leading-snug line-clamp-2">
                      {movie.overview || "ไม่มีเรื่องย่อ"}
                    </p>
                  </div>
                  <AddListPicker movie={movie} />
                </div>
              ))}
            </div>
          )}

          {/* Custom add — always show when query is not empty and search is done */}
          {searchDone && query.trim() && !searching && (
            <div className="mt-2 rounded-xl border border-dashed border-[var(--c-sep)] bg-[var(--c-card)] px-5 py-3.5 flex items-center justify-between gap-3">
              <p className="text-[14px] text-[var(--c-text-3)] min-w-0 truncate">
                {searchResults.length === 0 ? "ไม่พบใน TMDB — " : "ไม่ใช่เรื่องที่หา? "}
              </p>
              <button
                onClick={() => setAddTarget({ movie: { id: 0, title: query.trim(), poster_path: null, release_date: "", overview: "", vote_average: 0 } })}
                disabled={busy}
                className="flex-shrink-0 h-10 px-5 rounded-xl bg-[var(--c-accent)] text-white text-[16px] font-semibold active:opacity-80 transition-opacity"
              >
                + เพิ่ม &quot;{query.trim()}&quot;
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            SECTION 1: Next Watch + 3 Lists
        ══════════════════════════════════════════ */}
        {loading ? (
          <MiniSpinner />
        ) : (
          <div className="space-y-6">
            {/* Next Watch — full width */}
            <div>
              <div className="flex items-center gap-2 mb-2.5 px-1">
                <h2 className="text-[20px] font-semibold text-[var(--c-text)]">
                  🎬 Next Watch
                </h2>
              </div>
              <NextWatchCard />
            </div>

            <div className="h-px bg-[var(--c-sep)]" />

            {/* Hon + Jay — 2 columns on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ListSection
                title="Hon List"
                emoji="🔵"
                color="text-blue-400"
                items={data.honList}
                listName="hon"
              />
              <ListSection
                title="Jay List"
                emoji="🩷"
                color="text-pink-400"
                items={data.jayList}
                listName="jay"
              />
            </div>

            <div className="h-px bg-[var(--c-sep)]" />

            {/* Spare List — full width */}
            <ListSection
              title="Spare List"
              emoji="⭐"
              color="text-amber-400"
              items={data.spareList}
              listName="spare"
            />

            <div className="h-px bg-[var(--c-sep)]" />

            {/* Watched + Boring — 2 columns on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PoolSection
                title="ดูแล้ว"
                emoji="✅"
                items={data.watchedList || []}
                pool="watched"
                show={showWatched}
                toggle={() => setShowWatched((v) => !v)}
              />
              <PoolSection
                title="ไม่สนุก"
                emoji="💤"
                items={data.boringList || []}
                pool="boring"
                show={showBoring}
                toggle={() => setShowBoring((v) => !v)}
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            SECTION 2: Top 5 จากสตรีมมิง
        ══════════════════════════════════════════ */}
        <SectionTitle>ยอดนิยมจากสตรีมมิง</SectionTitle>

        <div className="flex gap-1.5 mb-4 bg-[var(--c-fill-3)] rounded-xl p-1.5">
          {STREAMING_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setStreamTab(t.key)}
              className={`flex-1 py-2.5 rounded-lg text-[16px] font-medium transition-all ${
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
            <div className="text-center py-6 text-[var(--c-text-3)] text-[16px]">
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

        <div className="flex justify-end mb-3">
          <button
            onClick={refreshAllGenres}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--c-fill-3)] text-[var(--c-text-2)] text-[16px] font-medium active:bg-[var(--c-fill-2)] transition-colors"
          >
            <span className="text-[17px]">🎲</span> สุ่มใหม่ทั้งหมด
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GENRE_SECTIONS.map((genre) => (
            <div key={genre.id}>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <h3 className="text-[18px] font-semibold text-[var(--c-text)]">
                  {genre.label}
                </h3>
                <button
                  onClick={() => loadGenre(genre.id, true)}
                  disabled={genreLoading[genre.id]}
                  className="text-[14px] text-[var(--c-accent)] font-medium active:opacity-60 disabled:opacity-40"
                >
                  🔄 สุ่มใหม่
                </button>
              </div>
              {genreLoading[genre.id] ? (
                <MiniSpinner />
              ) : !genreMovies[genre.id] || genreMovies[genre.id].length === 0 ? (
                <div className="text-center py-4 text-[var(--c-text-3)] text-[16px]">
                  กำลังโหลด...
                </div>
              ) : (
                <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  {genreMovies[genre.id].map((movie) => (
                    <div
                      key={movie.id}
                      className="flex-shrink-0 w-[120px] rounded-xl bg-[var(--c-card)] border border-[var(--c-sep)] overflow-hidden flex flex-col"
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
                          <span className="text-[var(--c-text-3)] text-[11px]">N/A</span>
                        </div>
                      )}
                      <div className="p-2 flex-1 flex flex-col">
                        <p className="text-[13px] font-medium text-[var(--c-text)] leading-tight line-clamp-2">
                          {movie.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[12px] text-[var(--c-text-3)]">
                            {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
                          </span>
                          {movie.vote_average > 0 && (
                            <span className="text-[12px] text-yellow-500">★{movie.vote_average.toFixed(1)}</span>
                          )}
                        </div>
                        <div className="mt-auto pt-1.5">
                          <AddListPicker movie={movie} />
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
        <div className="h-10" />
      </div>

      {/* Add target modal */}
      <AddTargetModal />
    </MainNavigationShell>
  );
}
