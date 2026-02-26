"use client";

import { useState, useEffect, useCallback, useRef, FormEvent } from "react";
import Link from "next/link";
import { Emoji } from "@/components/emoji";

const PASS_HASH = "bb5cdcc387ba6d03de464d72a6e0a9464b002821dad2cd76d4718b82d878c009";

async function hashPassphrase(pass: string): Promise<string> {
  const encoded = new TextEncoder().encode(pass);
  const buf = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getAuthCookie(): boolean {
  return document.cookie.split(";").some((c) => c.trim().startsWith("cake_auth=1"));
}

function setAuthCookie() {
  const expires = new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `cake_auth=1; expires=${expires}; path=/; SameSite=Lax`;
}

type Driver = "Hon" | "Jay" | "JH" | "";
type TimeSlot = "morning" | "evening";
type TabId = "schedule" | "price" | "travel";

type DriverRemarks = Partial<Record<"Hon" | "Jay" | "JH", string>>;

interface CalEvent {
  id: string;
  driver: "Hon" | "Jay" | "JH";
  startDate?: string; // YYYY-MM-DD (ถ้าไม่มี = วันที่ entry นั้นอยู่)
  endDate?: string;   // YYYY-MM-DD (optional, multi-day)
  time: string;       // "HH:mm" or "" = all-day
  endTime?: string;   // "HH:mm"
  duration?: number;  // นาที (backward compat)
  detail: string;
  gcalId?: string;
}

interface ScheduleEntry {
  morning: Driver;
  evening: Driver;
  fuel: string;
  mileage: string;
  remarks: DriverRemarks;
  events?: CalEvent[];
  emojis?: string[];
  /** @deprecated old format, migrated to remarks */
  remark?: string;
}

type ScheduleData = Record<string, ScheduleEntry>;

const DRIVERS: { name: Driver; label: string; color: string; bg: string; border: string; ring: string }[] = [
  { name: "Hon", label: "Hon", color: "text-[#F5B731]", bg: "bg-[#F5B731]/15", border: "border-[#F5B731]/40", ring: "ring-[#F5B731]" },
  { name: "Jay", label: "Jay", color: "text-[#FF6482]", bg: "bg-[#FF6482]/15", border: "border-[#FF6482]/40", ring: "ring-[#FF6482]" },
  { name: "JH", label: "JH", color: "text-[#5ED4A5]", bg: "bg-[#5ED4A5]/15", border: "border-[#5ED4A5]/40", ring: "ring-[#5ED4A5]" },
];

const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

/** Preset: เสาร์+อาทิตย์ = JH ทั้งวัน, ศุกร์เย็น = JH */
function getPresetDriver(dayOfWeek: number, slot: TimeSlot): Driver | null {
  if (dayOfWeek === 0 || dayOfWeek === 6) return "JH"; // เสาร์+อาทิตย์ เช้า+เย็น
  if (dayOfWeek === 5 && slot === "evening") return "JH"; // ศุกร์เย็น
  return null;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getWeekDays(monday: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function getDriverStyle(driver: Driver) {
  const d = DRIVERS.find((dr) => dr.name === driver);
  if (!d) return { bg: "bg-[var(--c-fill-3)]", color: "text-[var(--c-text-3)]", border: "border-[var(--c-sep)]" };
  return { bg: d.bg, color: d.color, border: d.border };
}

// Migrate old remarks → CalEvent[]
function migrateRemarks(entry: ScheduleEntry): ScheduleEntry {
  if (entry.events && entry.events.length > 0) return entry; // already migrated
  const remarks = entry.remarks || {};
  const events: CalEvent[] = [];
  for (const driver of ["Hon", "Jay", "JH"] as const) {
    const text = remarks[driver];
    if (text && text.trim()) {
      events.push({
        id: crypto.randomUUID().slice(0, 8),
        driver,
        time: "",
        detail: text.trim(),
      });
    }
  }
  if (events.length === 0) return entry;
  return { ...entry, events };
}

export default function Home() {
  const [currentMonday, setCurrentMonday] = useState<Date>(() => {
    return getMonday(new Date());
  });
  const [schedule, setSchedule] = useState<ScheduleData>({});
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [dayDraft, setDayDraft] = useState<ScheduleEntry | null>(null);
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState(false);
  const [forgotConfirm, setForgotConfirm] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [activeTab, setActiveTab] = useState<TabId>("schedule");
  const [selectedTravelDay, setSelectedTravelDay] = useState(1);
  const [travelDetailOpen, setTravelDetailOpen] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pulledEvents, setPulledEvents] = useState<Record<string, CalEvent[]>>({});

  useEffect(() => {
    setAuthed(getAuthCookie());
    setMounted(true);
    const saved = (typeof window !== "undefined" ? localStorage.getItem("ui-theme") : null) as "dark" | "light" | null;
    const next = saved === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  // Load schedule from server + migrate remarks → events
  useEffect(() => {
    if (!authed) return;
    fetch("/api/schedule")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          // Migrate old remarks → events for all entries
          const migrated: ScheduleData = {};
          let didMigrate = false;
          for (const [key, entry] of Object.entries(data as ScheduleData)) {
            const m = migrateRemarks(entry);
            migrated[key] = m;
            if (m !== entry) didMigrate = true;
          }
          setSchedule(migrated);
          // Persist migrated data
          if (didMigrate) {
            fetch("/api/schedule", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(migrated),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, [authed]);

  const [calSyncing, setCalSyncing] = useState(false);

  const pullCalendar = useCallback(() => {
    const weekDaysLocal = getWeekDays(currentMonday);
    const start = formatDateKey(weekDaysLocal[0]);
    const end = formatDateKey(weekDaysLocal[6]);
    setCalSyncing(true);
    fetch(`/api/calendar/sync?start=${start}&end=${end}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.events) {
          const grouped: Record<string, CalEvent[]> = {};
          for (const ev of data.events) {
            const mapped: CalEvent = {
              id: ev.id,
              driver: ev.driver,
              startDate: ev.date,
              endDate: ev.endDate || undefined,
              time: ev.time || "",
              endTime: ev.endTime || undefined,
              detail: ev.detail,
              gcalId: ev.gcalId,
            };
            if (!grouped[ev.date]) grouped[ev.date] = [];
            grouped[ev.date].push(mapped);
          }
          setPulledEvents(grouped);
        }
      })
      .catch(() => {})
      .finally(() => setCalSyncing(false));
  }, [currentMonday]);

  // Pull on load, week change, and every 10 min
  useEffect(() => {
    if (!authed) return;
    pullCalendar();
    const interval = setInterval(pullCalendar, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [authed, currentMonday, pullCalendar]);

  const weekDays = getWeekDays(currentMonday);

  const getEntry = useCallback(
    (dateKey: string): ScheduleEntry => {
      if (editingDay === dateKey && dayDraft) {
        return dayDraft;
      }
      const raw = schedule[dateKey] || { morning: "", evening: "", fuel: "", mileage: "", remarks: {} };
      // Pre-fill empty slots with presets (ไม่ override ข้อมูลที่มีอยู่แล้ว)
      const d = new Date(dateKey + "T00:00:00");
      const dow = d.getDay();
      const base = {
        ...raw,
        morning: raw.morning || getPresetDriver(dow, "morning") || "",
        evening: raw.evening || getPresetDriver(dow, "evening") || "",
      } as ScheduleEntry;
      // Merge pulled calendar events that aren't already in local events
      // Merge pulled calendar events
      const pulled = pulledEvents[dateKey];
      let events = [...(base.events || [])];
      if (pulled && pulled.length > 0) {
        const localIds = new Set(events.map((e) => e.id));
        events = [...events, ...pulled.filter((e) => !localIds.has(e.id))];
      }
      // Merge multi-day events from other days that span into this date
      const ids = new Set(events.map((e) => e.id));
      for (const [otherKey, otherEntry] of Object.entries(schedule)) {
        if (otherKey === dateKey) continue;
        for (const ev of otherEntry.events || []) {
          if (ids.has(ev.id)) continue;
          if (ev.endDate && ev.startDate && ev.startDate <= dateKey && ev.endDate >= dateKey) {
            events.push(ev);
            ids.add(ev.id);
          }
        }
      }
      // Also scan pulled events from other dates for multi-day
      for (const [otherDate, otherPulled] of Object.entries(pulledEvents)) {
        if (otherDate === dateKey) continue;
        for (const ev of otherPulled) {
          if (ids.has(ev.id)) continue;
          if (ev.endDate && ev.startDate && ev.startDate <= dateKey && ev.endDate >= dateKey) {
            events.push(ev);
            ids.add(ev.id);
          }
        }
      }
      if (events.length !== (base.events || []).length) {
        return { ...base, events };
      }
      return base;
    },
    [editingDay, dayDraft, schedule, pulledEvents]
  );

  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const scheduleRef = useRef(schedule);
  scheduleRef.current = schedule;

  const syncCalendar = useCallback((dateKey: string, newEntry: ScheduleEntry) => {
    const events = newEntry.events || [];
    // Always push the full events list for this date — API handles diff/delete
    fetch("/api/calendar/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ date: dateKey, events }] }),
    }).catch(() => {});
  }, []);

  const saveDay = useCallback(() => {
    if (!editingDay || !dayDraft) return;
    syncCalendar(editingDay, dayDraft);
    const updated = { ...schedule, [editingDay]: dayDraft };
    setSchedule(updated);
    fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(() => {});
    // Clear pulled events for this date so stale data doesn't re-add deleted events
    const savedKey = editingDay;
    setPulledEvents((prev) => {
      const next = { ...prev };
      delete next[savedKey];
      return next;
    });
    setEditingDay(null);
    setDayDraft(null);
    setSavedFlash(savedKey);
    setTimeout(() => setSavedFlash(null), 1200);
  }, [editingDay, dayDraft, schedule, syncCalendar]);

  const startEditing = (dateKey: string) => {
    if (editingDay === dateKey) return; // already editing this day — do nothing
    // If editing another day, auto-save first
    if (editingDay && dayDraft) {
      syncCalendar(editingDay, dayDraft);
      const updated = { ...schedule, [editingDay]: dayDraft };
      setSchedule(updated);
      fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).catch(() => {});
      // Clear pulled events for saved date
      const savedKey = editingDay;
      setPulledEvents((prev) => {
        const next = { ...prev };
        delete next[savedKey];
        return next;
      });
      setSavedFlash(savedKey);
      setTimeout(() => setSavedFlash(null), 1200);
    }
    const entry = getEntry(dateKey);
    setEditingDay(dateKey);
    setDayDraft({ ...entry, events: [...(entry.events || [])] });
  };

  const cancelEdit = () => {
    setEditingDay(null);
    setDayDraft(null);
  };

  const handleDriverSelect = (dateKey: string, slot: TimeSlot, driver: Driver) => {
    if (editingDay !== dateKey || !dayDraft) return;
    setDayDraft({ ...dayDraft, [slot]: dayDraft[slot] === driver ? "" : driver });
  };

  const handleFuelChange = (dateKey: string, value: string) => {
    if (editingDay !== dateKey || !dayDraft) return;
    setDayDraft({ ...dayDraft, fuel: value });
  };

  const handleMileageChange = (dateKey: string, value: string) => {
    if (editingDay !== dateKey || !dayDraft) return;
    setDayDraft({ ...dayDraft, mileage: value });
  };

  const getMaxMileage = useCallback((): number => {
    let max = 0;
    for (const entry of Object.values(schedule)) {
      const val = parseFloat(entry.mileage);
      if (!isNaN(val) && val > max) max = val;
    }
    return max;
  }, [schedule]);

  const handleEmojisChange = (dateKey: string, emojis: string[]) => {
    if (editingDay !== dateKey || !dayDraft) return;
    setDayDraft({ ...dayDraft, emojis });
  };

  const handleEventsChange = (dateKey: string, events: CalEvent[]) => {
    if (editingDay !== dateKey || !dayDraft) return;
    setDayDraft({ ...dayDraft, events });
  };

  const navigateWeek = (direction: number) => {
    setCurrentMonday((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7 * direction);
      return next;
    });
  };

  const goToCurrentWeek = () => {
    setCurrentMonday(getMonday(new Date()));
  };

  const weekRange = () => {
    const first = weekDays[0];
    const last = weekDays[6];
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()} - ${last.getDate()} ${THAI_MONTHS[first.getMonth()]} ${first.getFullYear()}`;
    }
    return `${first.getDate()} ${THAI_MONTHS[first.getMonth()]} - ${last.getDate()} ${THAI_MONTHS[last.getMonth()]} ${first.getFullYear()}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const h = await hashPassphrase(passInput);
    if (h === PASS_HASH) {
      setAuthCookie();
      setAuthed(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--c-bg)]">
        <div className="animate-pulse text-[var(--c-text-3)] text-[17px]">Loading...</div>
      </div>
    );
  }

  const handleForgotSend = async () => {
    setForgotStatus("sending");
    try {
      const res = await fetch("/api/forgot-pass", { method: "POST" });
      if (res.ok) {
        setForgotStatus("sent");
      } else {
        setForgotStatus("error");
      }
    } catch {
      setForgotStatus("error");
    }
  };

  // Auth login form — rendered inline inside schedule tab
  const authGateUI = (
    <div className="flex items-center justify-center py-16 px-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <p className="text-[15px] text-[var(--c-text-2)]">กรุณาใส่รหัสผ่านเพื่อดูตารางรับส่ง</p>
        </div>
        <input
          type="password"
          value={passInput}
          onChange={(e) => { setPassInput(e.target.value); setPassError(false); }}
          placeholder="Passphrase"
          className="w-full px-4 py-3 rounded-[10px] bg-[var(--c-input)] text-[var(--c-text)] text-center text-[17px] placeholder-[var(--c-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--c-accent)] border-0"
          autoFocus
        />
        {passError && <p className="text-[#FF453A] text-[13px] text-center">รหัสผ่านไม่ถูกต้อง</p>}
        <button
          type="submit"
          className="w-full py-3.5 rounded-[12px] bg-[var(--c-accent)] text-white font-semibold text-[17px] hover:brightness-110 active:brightness-90 transition-all"
        >
          Remember Forever
        </button>
        <button
          type="button"
          onClick={() => { setForgotConfirm(true); setForgotStatus("idle"); }}
          className="w-full text-[var(--c-accent)] text-[15px] hover:brightness-110 transition-all"
        >
          ลืมรหัสผ่าน?
        </button>
      </form>

      {forgotConfirm && (
        <div className="fixed inset-0 bg-[var(--c-overlay)] backdrop-blur-xl flex items-center justify-center z-50 px-4">
          <div className="bg-[var(--c-card)] rounded-[14px] w-full max-w-[270px] overflow-hidden">
            {forgotStatus === "idle" && (
              <>
                <div className="px-4 pt-5 pb-4 text-center">
                  <p className="text-[17px] font-semibold text-[var(--c-text)] mb-1">ลืมรหัสผ่าน</p>
                  <p className="text-[13px] text-[var(--c-text-2)]">ส่งรหัสผ่านไปยังอีเมลของคุณ?</p>
                </div>
                <div className="border-t border-[var(--c-sep)] flex">
                  <button onClick={() => setForgotConfirm(false)} className="flex-1 py-3 text-[17px] text-[var(--c-accent)] border-r border-[var(--c-sep)] active:bg-[var(--c-fill-3)]">ยกเลิก</button>
                  <button onClick={handleForgotSend} className="flex-1 py-3 text-[17px] font-semibold text-[var(--c-accent)] active:bg-[var(--c-fill-3)]">ยืนยัน</button>
                </div>
              </>
            )}
            {forgotStatus === "sending" && <div className="px-4 py-6 text-center"><p className="text-[15px] text-[var(--c-text-2)] animate-pulse">กำลังส่ง...</p></div>}
            {forgotStatus === "sent" && (
              <>
                <div className="px-4 pt-5 pb-4 text-center"><p className="text-[17px] font-semibold text-[var(--c-text)] mb-1">สำเร็จ</p><p className="text-[13px] text-[var(--c-text-2)]">ส่งแล้ว! กรุณาเช็คอีเมล</p></div>
                <div className="border-t border-[var(--c-sep)]"><button onClick={() => setForgotConfirm(false)} className="w-full py-3 text-[17px] font-semibold text-[var(--c-accent)] active:bg-[var(--c-fill-3)]">ตกลง</button></div>
              </>
            )}
            {forgotStatus === "error" && (
              <>
                <div className="px-4 pt-5 pb-4 text-center"><p className="text-[17px] font-semibold text-[var(--c-text)] mb-1">ผิดพลาด</p><p className="text-[13px] text-[var(--c-text-2)]">ส่งไม่สำเร็จ ลองใหม่อีกครั้ง</p></div>
                <div className="border-t border-[var(--c-sep)] flex">
                  <button onClick={() => setForgotConfirm(false)} className="flex-1 py-3 text-[17px] text-[var(--c-accent)] border-r border-[var(--c-sep)] active:bg-[var(--c-fill-3)]">ปิด</button>
                  <button onClick={handleForgotSend} className="flex-1 py-3 text-[17px] font-semibold text-[var(--c-accent)] active:bg-[var(--c-fill-3)]">ลองใหม่</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const NAV_ITEMS = [
    { id: "schedule" as const, label: "ตารางรับส่ง", icon: "🚗", enabled: true },
    { id: "price" as const, label: "ติดตามราคา", icon: "🏷️", enabled: true },
    { id: "travel" as const, label: "Travel", icon: "✈️", enabled: true },
    { id: "watchlist" as const, label: "Watchlist", icon: "🎬", enabled: true },
  ];
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("ui-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };
  const TRAVEL_PLAN_DAYS = Array.from({ length: 8 }, (_, i) => ({
    day: i + 1,
    label: `Day ${i + 1}`,
    dateLabel: i === 0 ? "1 มี.ค. 2026" : "ยังไม่กำหนด",
  }));

  return (
    <div className="min-h-screen bg-[var(--c-bg)]">
      {/* Apple-style Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[var(--c-glass)] backdrop-blur-xl backdrop-saturate-[1.8] border-b border-[var(--c-sep)]">
        <div className="flex items-center justify-between px-4 h-11 md:h-12 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--c-fill-3)] transition-colors active:bg-[var(--c-fill-2)]"
            >
              <svg className="w-[22px] h-[22px] text-[var(--c-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                }
              </svg>
            </button>
            <h1 className="text-[17px] md:text-[19px] font-semibold tracking-tight text-[var(--c-text)]">
              Cake Family
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--c-fill-3)] transition-colors active:bg-[var(--c-fill-2)]"
          >
            <Emoji char={theme === "dark" ? "🌙" : "☀️"} size={18} />
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-[var(--c-overlay)] backdrop-blur-sm" />
        </div>
      )}

      {/* Sidebar — Apple style */}
      <aside className={`fixed top-11 md:top-12 left-0 z-30 h-[calc(100vh-44px)] md:h-[calc(100vh-48px)] w-[270px] bg-[var(--c-glass)] backdrop-blur-xl border-r border-[var(--c-sep)] transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col">
          <nav className="p-2.5 pt-3 space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                disabled={!item.enabled}
                onClick={() => {
                  if (!item.enabled) return;
                  if (item.id === "schedule") window.location.href = "/driver";
                  if (item.id === "price") window.location.href = "/price-tracker";
                  if (item.id === "travel") window.location.href = "/travel/tokyo2026";
                  if (item.id === "watchlist") window.location.href = "/watchlist";
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-[10px] text-[17px] transition-all ${
                  activeTab === item.id && item.enabled
                    ? "bg-[var(--c-accent)] text-white font-medium"
                    : item.enabled
                    ? "text-[var(--c-text)] font-normal hover:bg-[var(--c-fill-2)]"
                    : "text-[var(--c-text-3)] cursor-not-allowed"
                }`}
              >
                <Emoji char={item.icon} size={22} />
                <span>{item.label}</span>
                {!item.enabled && <span className="ml-auto text-[11px] text-[var(--c-text-3)] bg-[var(--c-fill-2)] px-2 py-0.5 rounded-full">เร็วๆนี้</span>}
              </button>
            ))}
          </nav>

        </div>
      </aside>

      {/* Main Content — Apple HIG spacing */}
      <main className="px-4 py-5 md:px-8 md:py-6">
        <div className="max-w-7xl mx-auto">

        {/* Tab: Schedule */}
        {activeTab === "schedule" && (!authed ? authGateUI : <>

        {/* Week Navigation — Apple Large Title style */}
        <div className="flex items-center justify-between mb-5 md:mb-8">
          <h2 className="text-[22px] md:text-[28px] font-bold text-[var(--c-text)] tracking-tight">{weekRange()}</h2>
          <div className="flex items-center gap-0.5">
            <button
              onClick={pullCalendar}
              disabled={calSyncing}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--c-fill-2)] transition-colors active:scale-95"
              title="Sync Calendar"
            >
              <svg className={`w-[18px] h-[18px] text-[var(--c-text-2)] ${calSyncing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
            <Link
              href="/settings"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--c-fill-2)] transition-colors active:scale-95"
            >
              <svg className="w-[20px] h-[20px] text-[var(--c-text-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.212-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </Link>
            <button
              onClick={() => navigateWeek(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--c-fill-2)] transition-colors active:scale-95"
            >
              <svg className="w-[18px] h-[18px] text-[var(--c-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToCurrentWeek}
              className="px-3 py-1.5 rounded-full hover:bg-[var(--c-fill-2)] transition-colors text-[15px] font-medium text-[var(--c-accent)] active:scale-95"
            >
              วันนี้
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--c-fill-2)] transition-colors active:scale-95"
            >
              <svg className="w-[18px] h-[18px] text-[var(--c-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Weather Dashboard */}
        <EventDashboard monday={currentMonday} getEntry={getEntry} />

        {/* Schedule Table */}
        <div className="bg-[var(--c-card)] rounded-[14px] overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--c-sep)]">
                  <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[var(--c-text-2)] uppercase tracking-wide w-36">วัน</th>
                  <th className="px-5 py-3.5 text-center text-[13px] font-semibold text-[var(--c-text-2)] uppercase tracking-wide">เช้า (ส่ง)</th>
                  <th className="px-5 py-3.5 text-center text-[13px] font-semibold text-[var(--c-text-2)] uppercase tracking-wide">เย็น (รับ)</th>
                  <th className="px-5 py-3.5 text-center text-[13px] font-semibold text-[var(--c-text-2)] uppercase tracking-wide w-36">น้ำมัน</th>
                  <th className="px-5 py-3.5 text-center text-[13px] font-semibold text-[var(--c-text-2)] uppercase tracking-wide w-44">เลขไมล์</th>
                  <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[var(--c-text-2)] uppercase tracking-wide w-56">กิจกรรม</th>
                </tr>
              </thead>
              <tbody>
                {weekDays.map((day, idx) => {
                  const dateKey = formatDateKey(day);
                  const entry = getEntry(dateKey);
                  const today = isToday(day);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const isEditing = editingDay === dateKey;

                  return (
                    <tr
                      key={dateKey}
                      onClick={() => { if (editingDay !== dateKey) startEditing(dateKey); }}
                      className={`border-b border-[var(--c-sep)]/60 transition-colors cursor-pointer ${
                        savedFlash === dateKey
                          ? "bg-[#30D158]/8"
                          : isEditing
                          ? "bg-[var(--c-accent)]/8"
                          : "hover:bg-[var(--c-fill-3)]"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className={`font-semibold text-[17px] ${today ? "text-[var(--c-accent)]" : "text-[var(--c-text)]"}`}>
                          {THAI_DAYS[day.getDay()]}
                        </div>
                        <div className={`text-[13px] mt-0.5 ${today ? "text-[var(--c-accent)]" : "text-[var(--c-text-2)]"}`}>
                          {day.getDate()}/{day.getMonth() + 1}
                          {today && (
                            <span className="ml-2 px-1.5 py-0.5 bg-[var(--c-accent)]/15 text-[var(--c-accent)] rounded-full text-[11px] font-semibold">
                              วันนี้
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <DriverCell
                          value={entry.morning}
                          editMode={isEditing}
                          onSelect={(d) => handleDriverSelect(dateKey, "morning", d)}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <DriverCell
                          value={entry.evening}
                          editMode={isEditing}
                          onSelect={(d) => handleDriverSelect(dateKey, "evening", d)}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <FuelCell
                          value={entry.fuel}
                          editMode={isEditing}
                          onChange={(v) => handleFuelChange(dateKey, v)}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <MileageCell
                          value={entry.mileage}
                          editMode={isEditing}
                          onChange={(v) => handleMileageChange(dateKey, v)}
                          getMaxMileage={getMaxMileage}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <CalendarEventCell
                          dateKey={dateKey}
                          events={entry.events || []}
                          emojis={entry.emojis || []}
                          editMode={isEditing}
                          onEventsChange={(v) => handleEventsChange(dateKey, v)}
                          onEmojisChange={(v) => handleEmojisChange(dateKey, v)}
                          onSave={saveDay}
                          onCancel={cancelEdit}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile — Apple Grouped List */}
          <div className="md:hidden rounded-[14px] bg-[var(--c-card)] overflow-hidden">
            {weekDays.map((day, idx) => {
              const dateKey = formatDateKey(day);
              const entry = getEntry(dateKey);
              const today = isToday(day);
              const isEditing = editingDay === dateKey;

              return (
                <div
                  key={dateKey}
                  className={`transition-colors ${idx > 0 ? "border-t border-[var(--c-sep)]/60" : ""} ${
                    savedFlash === dateKey
                      ? "bg-[#30D158]/8"
                      : isEditing
                      ? "bg-[var(--c-accent)]/6"
                      : ""
                  }`}
                >
                  {/* Day header */}
                  <div className="w-full flex items-center justify-between px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => { if (!isEditing) startEditing(dateKey); }}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <span className={`font-semibold text-[17px] ${today ? "text-[var(--c-accent)]" : "text-[var(--c-text)]"}`}>
                        {THAI_DAYS[day.getDay()]}
                      </span>
                      <span className={`text-[13px] ${today ? "text-[var(--c-accent)]" : "text-[var(--c-text-2)]"}`}>
                        {day.getDate()}/{day.getMonth() + 1}
                      </span>
                      {today && (
                        <span className="px-1.5 py-0.5 bg-[var(--c-accent)]/15 text-[var(--c-accent)] rounded-full text-[11px] font-semibold">วันนี้</span>
                      )}
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      {savedFlash === dateKey && (
                        <span className="text-[#30D158] text-[13px] font-medium">บันทึกแล้ว</span>
                      )}
                      {isEditing ? (
                        <span className="text-[12px] text-[var(--c-accent)] font-medium">editing</span>
                      ) : (
                        <>
                          {(entry.morning || entry.evening) && (
                            <div className="flex items-center gap-1 text-[13px]">
                              {entry.morning && <span className={`${getDriverStyle(entry.morning).color} font-medium`}>{entry.morning}</span>}
                              {entry.morning && entry.evening && <span className="text-[var(--c-text-4)]">/</span>}
                              {entry.evening && <span className={`${getDriverStyle(entry.evening).color} font-medium`}>{entry.evening}</span>}
                            </div>
                          )}
                          {entry.emojis && entry.emojis.length > 0 && (
                            <span className="flex items-center gap-0.5">{entry.emojis.map((e, i) => <Emoji key={i} char={e} size={13} />)}</span>
                          )}
                          <button type="button" onClick={() => startEditing(dateKey)}>
                            <svg className="w-[14px] h-[14px] text-[var(--c-text-3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded edit area */}
                  {isEditing && <div className="px-4 pb-4">

                  {/* Row 1: Morning + Evening */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <div className="text-[13px] text-[var(--c-text-2)] mb-2 font-medium uppercase tracking-wide">เช้า (ส่ง)</div>
                      <DriverCell
                        value={entry.morning}
                        editMode={isEditing}
                        onSelect={(d) => handleDriverSelect(dateKey, "morning", d)}
                        mobile
                      />
                    </div>
                    <div>
                      <div className="text-[13px] text-[var(--c-text-2)] mb-2 font-medium uppercase tracking-wide">เย็น (รับ)</div>
                      <DriverCell
                        value={entry.evening}
                        editMode={isEditing}
                        onSelect={(d) => handleDriverSelect(dateKey, "evening", d)}
                        mobile
                      />
                    </div>
                  </div>

                  {/* Row 2: Fuel + Mileage */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <div className="text-[13px] text-[var(--c-text-2)] mb-2 font-medium uppercase tracking-wide">น้ำมัน (L)</div>
                      <FuelCell
                        value={entry.fuel}
                        editMode={isEditing}
                        onChange={(v) => handleFuelChange(dateKey, v)}
                        mobile
                      />
                    </div>
                    <div>
                      <div className="text-[13px] text-[var(--c-text-2)] mb-2 font-medium uppercase tracking-wide">เลขไมล์</div>
                      <MileageCell
                        value={entry.mileage}
                        editMode={isEditing}
                        onChange={(v) => handleMileageChange(dateKey, v)}
                        getMaxMileage={getMaxMileage}
                        mobile
                      />
                    </div>
                  </div>

                  {/* Row 3: Calendar Events */}
                  <div>
                    <div className="text-[13px] text-[var(--c-text-2)] mb-2 font-medium uppercase tracking-wide">กิจกรรม</div>
                    <CalendarEventCell
                      dateKey={dateKey}
                      events={entry.events || []}
                      emojis={entry.emojis || []}
                      editMode={isEditing}
                      onEventsChange={(v) => handleEventsChange(dateKey, v)}
                      onEmojisChange={(v) => handleEmojisChange(dateKey, v)}
                      onSave={saveDay}
                      onCancel={cancelEdit}
                      mobile
                    />
                  </div></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-[11px] text-[var(--c-text-3)]">
          ข้อมูลถูกบันทึกบนเซิร์ฟเวอร์ ใช้ได้ทุกเครื่อง
        </div>

        </>)}

        {/* Tab: Price Tracker */}
        {activeTab === "price" && (
          <div className="py-20">
            <p className="text-[17px] font-medium text-[var(--c-text)]">ติดตามราคาของใช้ในบ้าน</p>
          </div>
        )}

        {activeTab === "travel" && (
          <div className="py-6 md:py-8">
            <p className="text-[22px] md:text-[28px] font-bold text-[var(--c-text)] tracking-tight mb-1">แผนการเดินทาง</p>
            <p className="text-[14px] text-[var(--c-text-2)] mb-5">Tokyo 2026</p>
            <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-4xl">
              {TRAVEL_PLAN_DAYS.map((day) => (
                <button
                  key={day.label}
                  onClick={() => setSelectedTravelDay(day.day)}
                  className={`rounded-[14px] border px-3 py-4 text-center transition-all ${
                    selectedTravelDay === day.day
                      ? "border-[var(--c-accent)] bg-[var(--c-accent-bg)] text-[var(--c-accent)]"
                      : "border-[var(--c-sep)] bg-[var(--c-card)] text-[var(--c-text)] hover:bg-[var(--c-fill-3)]"
                  }`}
                >
                  <div className="text-[15px] font-semibold">{day.label}</div>
                  <div className="text-[12px] mt-1 text-[var(--c-text-2)]">{day.dateLabel}</div>
                </button>
              ))}
            </div>

            {selectedTravelDay === 1 && (
              <div className="mt-6 max-w-4xl space-y-4">
                <div className="rounded-[16px] border border-[var(--c-accent)]/45 bg-[var(--c-accent-bg)] p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[20px] md:text-[24px] font-bold text-[var(--c-text)]">Day 1: ออกเดินทางไปโตเกียว</p>
                      <p className="text-[13px] mt-1 text-[var(--c-text-2)]">วันอาทิตย์ 1 มีนาคม 2026</p>
                    </div>
                    <button
                      onClick={() => setTravelDetailOpen((prev) => !prev)}
                      className="px-3 py-1.5 rounded-full text-[13px] font-medium bg-[var(--c-fill-2)] text-[var(--c-text)] hover:bg-[var(--c-fill)] transition-colors"
                    >
                      {travelDetailOpen ? "ซ่อนรายละเอียด" : "แสดงรายละเอียด"}
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-4">
                      <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">เที่ยวบิน</p>
                      <p className="text-[17px] font-semibold text-[var(--c-text)] mt-1">XJ 606 (บินตรง)</p>
                    </div>
                    <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-4">
                      <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">เส้นทาง</p>
                      <p className="text-[17px] font-semibold text-[var(--c-text)] mt-1">DMK -&gt; NRT</p>
                    </div>
                    <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-4">
                      <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">เวลาบิน</p>
                      <p className="text-[17px] font-semibold text-[var(--c-text)] mt-1">11:50 - 20:00</p>
                    </div>
                  </div>
                </div>

                {travelDetailOpen && (
                  <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-5">
                    <p className="text-[16px] font-semibold text-[var(--c-text)] mb-4">ไทม์ไลน์ Day 1</p>
                    <div className="space-y-4">
                      {[
                        { time: "09:50", title: "ออกจากบ้าน", note: "คำนวณตามเงื่อนไข: ออกก่อนเวลาไฟลท์ 2 ชั่วโมง" },
                        { time: "10:20", title: "ถึงสนามบินดอนเมือง (DMK)", note: "เตรียมเช็กอินและผ่านจุดตรวจ", map: "https://www.google.com/maps?q=Don+Mueang+International+Airport&output=embed", mapTitle: "แผนที่สนามบินดอนเมือง" },
                        { time: "11:20", title: "พร้อมที่เกต", note: "เผื่อเวลาขึ้นเครื่องและตรวจเอกสารรอบสุดท้าย" },
                        { time: "11:50", title: "เครื่องออก (XJ 606)", note: "บินตรง DMK -> NRT" },
                        { time: "20:00", title: "ถึงสนามบินนาริตะ (NRT)", note: "เวลาท้องถิ่นโตเกียว" },
                        { time: "20:45", title: "ตม. + รับกระเป๋า", note: "เผื่อเวลาโดยประมาณหลังลงเครื่อง" },
                        { time: "21:30", title: "ออกจาก NRT ไปโรงแรม", note: "ดูเส้นทางเบื้องต้นไปโซนที่พัก", map: "https://www.google.com/maps?q=Narita+International+Airport+to+Shinjuku+Station&output=embed", mapTitle: "เส้นทางจากนาริตะไปที่พัก" },
                        { time: "23:00", title: "เช็กอินที่พัก / พักผ่อน", note: "จบแผนการเดินทางของ Day 1" },
                      ].map((row) => (
                        <div key={`${row.time}-${row.title}`} className="rounded-[12px] bg-[var(--c-subtle-card)] border border-[var(--c-sep)] p-3">
                          <div className="flex gap-3">
                            <div className="min-w-14 text-[15px] font-semibold text-[var(--c-accent)]">{row.time}</div>
                            <div>
                              <p className="text-[15px] font-medium text-[var(--c-text)]">{row.title}</p>
                              <p className="text-[13px] text-[var(--c-text-2)]">{row.note}</p>
                            </div>
                          </div>
                          {"map" in row && row.map && (
                            <div className="mt-3 overflow-hidden rounded-[10px] border border-[var(--c-sep)]">
                              <iframe
                                title={row.mapTitle}
                                src={row.map}
                                loading="lazy"
                                className="w-full h-44"
                                referrerPolicy="no-referrer-when-downgrade"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTravelDay !== 1 && (
              <div className="mt-6 max-w-4xl rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-5">
                <p className="text-[16px] font-semibold text-[var(--c-text)]">Day {selectedTravelDay}</p>
                <p className="text-[13px] text-[var(--c-text-2)] mt-1">เตรียมเทมเพลตไทม์ไลน์ไว้แล้ว สามารถเติมกิจกรรมของวันนี้ได้ต่อทันที</p>
              </div>
            )}
          </div>
        )}

        </div>
      </main>

    </div>
  );
}

function DriverCell({
  value,
  editMode,
  onSelect,
  mobile,
}: {
  value: Driver;
  editMode: boolean;
  onSelect: (d: Driver) => void;
  mobile?: boolean;
}) {
  const style = getDriverStyle(value);

  if (!editMode) {
    if (!value) {
      return (
        <div className={mobile ? "flex justify-start" : "flex justify-center"}>
          <span className="text-[var(--c-text-3)] text-[15px]">—</span>
        </div>
      );
    }
    return (
      <div className={mobile ? "flex justify-start" : "flex justify-center"}>
        <span className={`${mobile ? "px-3 py-1 text-[13px]" : "px-4 py-1.5 text-[15px]"} rounded-full font-semibold ${style.bg} ${style.color}`}>
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${mobile ? "justify-start" : "justify-center"} gap-2 flex-wrap`}>
      {DRIVERS.map((d) => {
        const isSelected = value === d.name;
        return (
          <button
            key={d.name}
            onClick={() => onSelect(d.name)}
            className={`${mobile ? "px-3.5 py-2 text-[13px]" : "px-4 py-2 text-[13px]"} rounded-full font-semibold transition-all active:scale-95 ${
              isSelected
                ? `${d.bg} ${d.color} ring-2 ${d.ring}/50`
                : `bg-[var(--c-fill-2)] text-[var(--c-text-2)]`
            }`}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}

function FuelCell({
  value,
  editMode,
  onChange,
  mobile,
}: {
  value: string;
  editMode: boolean;
  onChange: (v: string) => void;
  mobile?: boolean;
}) {
  if (!editMode) {
    if (!value) {
      return (
        <div className={mobile ? "flex justify-start" : "flex justify-center"}>
          <span className="text-[var(--c-text-3)] text-[15px]">—</span>
        </div>
      );
    }
    return (
      <div className={mobile ? "flex justify-start" : "flex justify-center"}>
        <span className={`${mobile ? "px-3 py-1 text-[13px]" : "px-4 py-1.5 text-[15px]"} rounded-full font-semibold bg-[#FF9F0A]/15 text-[#FF9F0A]`}>
          {value} L
        </span>
      </div>
    );
  }

  return (
    <div className={mobile ? "flex justify-start" : "flex justify-center"}>
      <input
        type="number"
        min="0"
        step="0.1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className={`${mobile ? "w-full" : "w-20"} text-center py-2 px-3 rounded-[10px] bg-[var(--c-input)] text-[#FF9F0A] font-semibold text-[15px] placeholder-[var(--c-text-3)] focus:outline-none focus:ring-2 focus:ring-[#FF9F0A]/50 border-0 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />
    </div>
  );
}

const FUEL_PRESETS = [15, 20, 30];

function randomKmPerLiter(): number {
  // random 6.9 - 7.6 with micro noise so it's never a clean pattern
  const base = 6.9 + Math.random() * 0.7;
  const noise = (Math.random() - 0.5) * 0.2;
  const raw = base + noise;
  // clamp 6.8 - 7.7 then round to 2 decimals
  return Math.round(Math.min(7.7, Math.max(6.8, raw)) * 100) / 100;
}

function estimateMileage(baseMileage: number, liters: number): number {
  const rate = randomKmPerLiter();
  return Math.round(baseMileage + liters * rate);
}

function MileageCell({
  value,
  editMode,
  onChange,
  getMaxMileage,
  mobile,
}: {
  value: string;
  editMode: boolean;
  onChange: (v: string) => void;
  getMaxMileage: () => number;
  mobile?: boolean;
}) {
  const [customLiters, setCustomLiters] = useState("");
  const [previewKm, setPreviewKm] = useState<Record<number, number>>({});
  const refreshPreview = useCallback(() => {
    const obj: Record<number, number> = {};
    for (const l of FUEL_PRESETS) {
      obj[l] = Math.round(l * randomKmPerLiter());
    }
    setPreviewKm(obj);
  }, []);
  useEffect(() => { refreshPreview(); }, [refreshPreview]);

  if (!editMode) {
    if (!value) {
      return (
        <div className={mobile ? "flex justify-start" : "flex justify-center"}>
          <span className="text-[var(--c-text-3)] text-[15px]">—</span>
        </div>
      );
    }
    return (
      <div className={mobile ? "flex justify-start" : "flex justify-center"}>
        <span className={`${mobile ? "px-3 py-1 text-[13px]" : "px-4 py-1.5 text-[15px]"} rounded-full font-semibold bg-[#BF5AF2]/15 text-[#BF5AF2]`}>
          {Number(value).toLocaleString()} km
        </span>
      </div>
    );
  }

  const maxMileage = getMaxMileage();
  const hasBase = maxMileage > 0;

  if (mobile) {
    return (
      <div className="flex flex-col gap-2">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="เลขไมล์"
          className="w-full text-center py-2 px-3 rounded-[10px] bg-[var(--c-input)] text-[#BF5AF2] font-semibold text-[15px] placeholder-[var(--c-text-3)] focus:outline-none focus:ring-2 focus:ring-[#BF5AF2]/50 border-0 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {hasBase && (
          <button
            type="button"
            onClick={() => onChange(String(maxMileage))}
            className="text-[13px] px-3 py-1.5 rounded-[8px] bg-[#BF5AF2]/10 text-[#BF5AF2] active:bg-[#BF5AF2]/20 transition-all w-full"
          >
            Auto ({maxMileage.toLocaleString()})
          </button>
        )}
        <div className="flex gap-1.5 flex-wrap">
          {FUEL_PRESETS.map((liters) => (
            <button
              key={liters}
              type="button"
              onClick={() => {
                onChange(String(estimateMileage(maxMileage, liters)));
                refreshPreview();
              }}
              disabled={!hasBase}
              className={`text-[13px] px-2.5 py-1.5 rounded-[8px] flex-1 transition-all ${
                hasBase
                  ? "bg-[var(--c-fill-2)] text-[var(--c-text)] active:bg-[var(--c-fill)]"
                  : "bg-[var(--c-fill-3)] text-[var(--c-text-4)] cursor-not-allowed"
              }`}
            >
              +{liters}L{previewKm[liters] ? ` (~${previewKm[liters]})` : ""}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            step="0.1"
            value={customLiters}
            onChange={(e) => setCustomLiters(e.target.value)}
            placeholder="L"
            className="flex-1 text-center py-1.5 px-2 rounded-[8px] bg-[var(--c-input)] text-[var(--c-text)] text-[13px] placeholder-[var(--c-text-3)] focus:outline-none focus:ring-1 focus:ring-[#BF5AF2]/50 border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => {
              const l = parseFloat(customLiters);
              if (!isNaN(l) && l > 0 && hasBase) {
                onChange(String(estimateMileage(maxMileage, l)));
              }
            }}
            disabled={!hasBase || !customLiters}
            className={`text-[13px] px-3 py-1.5 rounded-[8px] transition-all ${
              hasBase && customLiters
                ? "bg-[#BF5AF2]/10 text-[#BF5AF2] active:bg-[#BF5AF2]/20"
                : "bg-[var(--c-fill-3)] text-[var(--c-text-4)] cursor-not-allowed"
            }`}
          >
            +คำนวณ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="เลขไมล์"
        className="w-28 text-center py-2 px-2 rounded-[10px] bg-[var(--c-input)] text-[#BF5AF2] font-semibold text-[15px] placeholder-[var(--c-text-3)] focus:outline-none focus:ring-2 focus:ring-[#BF5AF2]/50 border-0 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {hasBase && (
        <button
          type="button"
          onClick={() => onChange(String(maxMileage))}
          className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[#BF5AF2]/10 text-[#BF5AF2] active:bg-[#BF5AF2]/20 transition-all"
        >
          Auto ({maxMileage.toLocaleString()})
        </button>
      )}
      <div className="flex gap-1 flex-wrap justify-center">
        {FUEL_PRESETS.map((liters) => (
          <button
            key={liters}
            type="button"
            onClick={() => {
              onChange(String(estimateMileage(maxMileage, liters)));
              refreshPreview();
            }}
            disabled={!hasBase}
            className={`text-[11px] px-1.5 py-0.5 rounded-[6px] transition-all ${
              hasBase
                ? "bg-[var(--c-fill-2)] text-[var(--c-text)] active:bg-[var(--c-fill)]"
                : "bg-[var(--c-fill-3)] text-[var(--c-text-4)] cursor-not-allowed"
            }`}
          >
            +{liters}L{previewKm[liters] ? ` (~${previewKm[liters]})` : ""}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          step="0.1"
          value={customLiters}
          onChange={(e) => setCustomLiters(e.target.value)}
          placeholder="L"
          className="w-12 text-center py-0.5 px-1 rounded-[6px] bg-[var(--c-input)] text-[var(--c-text)] text-[11px] placeholder-[var(--c-text-3)] focus:outline-none focus:ring-1 focus:ring-[#BF5AF2]/50 border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => {
            const l = parseFloat(customLiters);
            if (!isNaN(l) && l > 0 && hasBase) {
              onChange(String(estimateMileage(maxMileage, l)));
            }
          }}
          disabled={!hasBase || !customLiters}
          className={`text-[11px] px-1.5 py-0.5 rounded-[6px] transition-all ${
            hasBase && customLiters
              ? "bg-[#BF5AF2]/10 text-[#BF5AF2] active:bg-[#BF5AF2]/20"
              : "bg-[var(--c-fill-3)] text-[var(--c-text-4)] cursor-not-allowed"
          }`}
        >
          +คำนวณ
        </button>
      </div>
    </div>
  );
}

const REMARK_EMOJIS = [
  { emoji: "\uD83E\uDD5A", label: "egg" },
  { emoji: "\u2764\uFE0F", label: "heart" },
  { emoji: "\uD83E\uDE78", label: "blood" },
];

function CalendarEventCell({
  dateKey,
  events,
  emojis,
  editMode,
  onEventsChange,
  onEmojisChange,
  onSave,
  onCancel,
  mobile,
}: {
  dateKey: string;
  events: CalEvent[];
  emojis: string[];
  editMode: boolean;
  onEventsChange: (v: CalEvent[]) => void;
  onEmojisChange: (v: string[]) => void;
  onSave?: () => void;
  onCancel?: () => void;
  mobile?: boolean;
}) {
  const [formDriver, setFormDriver] = useState<"Hon" | "Jay" | "JH" | "">("");
  const [formStartDate, setFormStartDate] = useState(dateKey);
  const [formEndDate, setFormEndDate] = useState("");
  const [formEnableEndDate, setFormEnableEndDate] = useState(false);
  const [formTime, setFormTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formDetail, setFormDetail] = useState("");
  const [formAllDay, setFormAllDay] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  const openTimePicker = () => {
    if (!formTime && timeRef.current) timeRef.current.value = "09:00";
    try { timeRef.current?.showPicker(); } catch { timeRef.current?.focus(); }
  };

  const openEndTimePicker = () => {
    if (!formEndTime && endTimeRef.current) {
      if (formTime) {
        const [h, m] = formTime.split(":").map(Number);
        endTimeRef.current.value = `${String(Math.min(h + 1, 23)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      } else {
        endTimeRef.current.value = "10:00";
      }
    }
    try { endTimeRef.current?.showPicker(); } catch { endTimeRef.current?.focus(); }
  };

  const toggleEmoji = (emoji: string) => {
    onEmojisChange(emojis.includes(emoji) ? emojis.filter((e) => e !== emoji) : [...emojis, emoji]);
  };

  const resetForm = () => {
    setFormDriver(""); setFormTime(""); setFormEndTime(""); setFormDetail("");
    setFormAllDay(false); setFormStartDate(dateKey); setFormEndDate("");
    setFormEnableEndDate(false); setEditingId(null);
  };

  const startEdit = (ev: CalEvent) => {
    setEditingId(ev.id);
    setFormDriver(ev.driver);
    setFormDetail(ev.detail);
    setFormAllDay(!ev.time);
    setFormTime(ev.time || "");
    setFormEndTime(ev.endTime || "");
    setFormStartDate(ev.startDate || dateKey);
    setFormEndDate(ev.endDate || "");
    setFormEnableEndDate(!!ev.endDate);
  };

  const saveEvent = () => {
    if (!formDetail.trim() || !formDriver) return;
    const ev: CalEvent = {
      id: editingId || crypto.randomUUID().slice(0, 8),
      driver: formDriver as "Hon" | "Jay" | "JH",
      startDate: formStartDate || dateKey,
      endDate: formEnableEndDate && formEndDate ? formEndDate : undefined,
      time: formAllDay ? "" : formTime,
      endTime: formAllDay ? undefined : (formEndTime || undefined),
      detail: formDetail.trim(),
    };
    if (editingId) {
      onEventsChange(events.map((e) => (e.id === editingId ? { ...ev, gcalId: e.gcalId } : e)));
    } else {
      onEventsChange([...events, ev]);
    }
    resetForm();
  };

  const removeEvent = (id: string) => {
    onEventsChange(events.filter((e) => e.id !== id));
    if (editingId === id) resetForm();
  };

  const sorted = [...events].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return -1;
    if (!b.time) return 1;
    return a.time.localeCompare(b.time);
  });

  const shortDate = (d: string) => {
    const p = d.split("-");
    return `${parseInt(p[2])}/${parseInt(p[1])}`;
  };

  // --- display mode ---
  if (!editMode) {
    if (events.length === 0 && emojis.length === 0) {
      return <span className="text-[var(--c-text-3)] text-[15px]">—</span>;
    }
    return (
      <div className="space-y-1">
        {emojis.length > 0 && (
          <div className="flex gap-1">{emojis.map((e, i) => <span key={i} className="text-[15px]">{e}</span>)}</div>
        )}
        {sorted.map((ev) => {
          const d = DRIVERS.find((dr) => dr.name === ev.driver)!;
          const isMultiDay = ev.endDate && ev.startDate;
          return (
            <div key={ev.id} className="flex items-center gap-1.5">
              {ev.time ? (
                <span className="text-[11px] text-[var(--c-text-3)] font-mono shrink-0">
                  {ev.time}{ev.endTime ? `–${ev.endTime}` : ""}
                </span>
              ) : (
                <span className="text-[10px] text-[var(--c-text-4)] shrink-0">ALL-DAY</span>
              )}
              <span className={`shrink-0 px-1.5 py-0.5 rounded-[4px] text-[11px] font-semibold ${d.bg} ${d.color}`}>
                {d.label}
              </span>
              <span className="text-[13px] text-[var(--c-text-2)] leading-snug break-words line-clamp-1">
                {ev.detail}
              </span>
              {isMultiDay && (
                <span className="text-[10px] text-[var(--c-text-4)] shrink-0">
                  ({shortDate(ev.startDate!)}–{shortDate(ev.endDate!)})
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // --- edit mode ---
  const isEditingExisting = editingId !== null;

  return (
    <div className="space-y-2.5">
      {/* Emoji toggles */}
      <div className="flex gap-1.5 flex-wrap items-center">
        {REMARK_EMOJIS.map((re) => {
          const on = emojis.includes(re.emoji);
          return (
            <button key={re.label} type="button" onClick={() => toggleEmoji(re.emoji)}
              className={`${mobile ? "px-2.5 py-1.5" : "px-1.5 py-0.5"} rounded-[8px] text-[15px] transition-all active:scale-95 ${
                on ? "bg-[var(--c-fill)] ring-1 ring-[var(--c-sep)]" : "bg-[var(--c-fill-3)] opacity-40"
              }`}
            >
              <Emoji char={re.emoji} size={15} />
            </button>
          );
        })}
      </div>

      {/* Existing events */}
      {sorted.length > 0 && (
        <div className="space-y-1">
          {sorted.map((ev) => {
            const d = DRIVERS.find((dr) => dr.name === ev.driver)!;
            const active = editingId === ev.id;
            const isMultiDay = ev.endDate && ev.startDate;
            return (
              <div key={ev.id}
                onClick={() => { if (!active) startEdit(ev); }}
                className={`flex items-center gap-1.5 rounded-[8px] py-1.5 px-2 cursor-pointer transition-all ${
                  active
                    ? "bg-[var(--c-accent)]/12 ring-1 ring-[var(--c-accent)]/40"
                    : "bg-[var(--c-fill-3)]/60 hover:bg-[var(--c-fill-2)]"
                }`}
              >
                <span className={`shrink-0 text-[11px] font-mono ${ev.time ? "text-[var(--c-text-2)]" : "text-[var(--c-text-4)] text-[10px] tracking-tight"}`}>
                  {ev.time ? (ev.endTime ? `${ev.time}–${ev.endTime}` : ev.time) : "All-day"}
                </span>
                <span className={`shrink-0 px-1.5 py-0.5 rounded-[5px] text-[11px] font-bold ${d.bg} ${d.color}`}>
                  {d.label}
                </span>
                <span className="text-[13px] text-[var(--c-text)] leading-snug flex-1 truncate font-medium">
                  {ev.detail}
                </span>
                {isMultiDay && (
                  <span className="shrink-0 text-[9px] text-[var(--c-text-3)] bg-[var(--c-fill-2)] px-1.5 py-0.5 rounded-full">
                    {shortDate(ev.startDate!)}–{shortDate(ev.endDate!)}
                  </span>
                )}
                {active && (
                  <span className="shrink-0 text-[10px] text-[var(--c-accent)] font-medium">editing</span>
                )}
                <button type="button" onClick={(e) => { e.stopPropagation(); removeEvent(ev.id); }}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[var(--c-text-4)] hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors active:scale-90"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Event form — add / edit */}
      <div className={`rounded-[12px] border overflow-hidden transition-all ${
        isEditingExisting
          ? "border-[var(--c-accent)]/30 bg-[var(--c-accent)]/5"
          : "border-[var(--c-sep)]/60 bg-[var(--c-fill-3)]/40"
      }`}>
        {/* Form header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--c-sep)]/40">
          <span className={`text-[12px] font-semibold tracking-wide ${isEditingExisting ? "text-[var(--c-accent)]" : "text-[var(--c-text-2)]"}`}>
            {isEditingExisting ? "Edit Event" : "New Event"}
          </span>
          {isEditingExisting && (
            <button type="button" onClick={resetForm}
              className="text-[12px] text-[var(--c-text-3)] hover:text-[var(--c-text)] font-medium transition-colors"
            >Cancel</button>
          )}
        </div>

        <div className="px-3 py-2.5 space-y-2.5">
          {/* Row 1: Driver pills */}
          <div className="flex items-center gap-1.5">
            {DRIVERS.map((d) => (
              <button key={d.name} type="button"
                onClick={() => setFormDriver(d.name as "Hon" | "Jay" | "JH")}
                className={`px-3 py-1.5 text-[12px] rounded-full font-semibold transition-all active:scale-95 ${
                  formDriver === d.name
                    ? `${d.bg} ${d.color} ring-1.5 ${d.ring}/60`
                    : "bg-[var(--c-fill-2)] text-[var(--c-text-3)]"
                }`}
              >{d.label}</button>
            ))}
          </div>

          {/* Row 2: Start date + End date */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[var(--c-text-3)] w-8">Start</span>
              <input type="date" value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="py-1 px-2 rounded-[8px] bg-[var(--c-fill-2)] text-[var(--c-text)] text-[13px] border-0 focus:outline-none focus:ring-1 focus:ring-[var(--c-accent)]/50 [color-scheme:dark]"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={formEnableEndDate}
                  onChange={(e) => {
                    setFormEnableEndDate(e.target.checked);
                    if (e.target.checked && !formEndDate) {
                      const d = new Date(formStartDate || dateKey);
                      d.setDate(d.getDate() + 1);
                      setFormEndDate(formatDateKey(d));
                    }
                  }}
                  className="w-3.5 h-3.5 rounded accent-[var(--c-accent)]"
                />
                <span className="text-[11px] text-[var(--c-text-3)]">End</span>
              </label>
              {formEnableEndDate && (
                <input type="date" value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  min={formStartDate}
                  className="py-1 px-2 rounded-[8px] bg-[var(--c-fill-2)] text-[var(--c-text)] text-[13px] border-0 focus:outline-none focus:ring-1 focus:ring-[var(--c-accent)]/50 [color-scheme:dark]"
                />
              )}
            </div>
          </div>

          {/* Row 3: All-day + Start time → End time */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button type="button"
              onClick={() => { setFormAllDay(!formAllDay); if (!formAllDay) { setFormTime(""); setFormEndTime(""); } }}
              className={`px-3 py-1.5 text-[12px] rounded-full font-semibold transition-all active:scale-95 ${
                formAllDay
                  ? "bg-[var(--c-accent)]/15 text-[var(--c-accent)] ring-1 ring-[var(--c-accent)]/40"
                  : "bg-[var(--c-fill-2)] text-[var(--c-text-3)]"
              }`}
            >All-day</button>
            {!formAllDay && (
              <>
                <button type="button" onClick={openTimePicker}
                  className={`relative h-[34px] px-3 rounded-[8px] text-[13px] font-semibold transition-all active:scale-95 ${
                    formTime
                      ? "bg-[var(--c-fill-2)] text-[var(--c-text)]"
                      : "bg-[var(--c-accent)]/12 text-[var(--c-accent)] ring-1 ring-[var(--c-accent)]/30"
                  }`}
                >
                  {formTime || "--:--"}
                  <input ref={timeRef} type="time" value={formTime}
                    onChange={(e) => {
                      setFormTime(e.target.value);
                      if (!formEndTime && e.target.value) {
                        const [h, m] = e.target.value.split(":").map(Number);
                        setFormEndTime(`${String(Math.min(h + 1, 23)).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer [color-scheme:dark]"
                    tabIndex={-1}
                  />
                </button>
                <span className="text-[11px] text-[var(--c-text-4)]">→</span>
                <button type="button" onClick={openEndTimePicker}
                  className={`relative h-[34px] px-3 rounded-[8px] text-[13px] font-semibold transition-all active:scale-95 ${
                    formEndTime
                      ? "bg-[var(--c-fill-2)] text-[var(--c-text)]"
                      : "bg-[var(--c-fill-3)] text-[var(--c-text-4)]"
                  }`}
                >
                  {formEndTime || "--:--"}
                  <input ref={endTimeRef} type="time" value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer [color-scheme:dark]"
                    tabIndex={-1}
                  />
                </button>
              </>
            )}
          </div>

          {/* Row 4: Detail + Save */}
          <div className="flex gap-1.5 items-center">
            <input type="text" value={formDetail}
              onChange={(e) => setFormDetail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveEvent(); } }}
              placeholder="รายละเอียด..."
              className="flex-1 min-w-0 py-2 px-3 rounded-[10px] bg-[var(--c-fill-2)] text-[var(--c-text)] text-[14px] placeholder-[var(--c-text-3)] focus:outline-none focus:ring-1.5 focus:ring-[var(--c-accent)]/50 border-0"
            />
            <button type="button" onClick={saveEvent} disabled={!formDetail.trim() || !formDriver}
              className={`shrink-0 h-[36px] px-4 rounded-[10px] text-[13px] font-semibold transition-all active:scale-95 ${
                formDetail.trim() && formDriver
                  ? "bg-[var(--c-accent)] text-white shadow-sm"
                  : "bg-[var(--c-fill-3)] text-[var(--c-text-4)] cursor-not-allowed"
              }`}
            >{isEditingExisting ? "Save" : "Add"}</button>
          </div>
        </div>

        {/* Day-level save/cancel — inside the card */}
        {onSave && onCancel && (
          <>
            <div className="border-t border-[var(--c-sep)]" />
            <div className="flex justify-end gap-2 px-3 py-2.5">
              <button type="button" onClick={onCancel}
                className="px-4 py-2 rounded-[8px] text-[14px] text-[var(--c-text-2)] bg-[var(--c-fill-2)] active:bg-[var(--c-fill)] transition-colors"
              >ยกเลิก</button>
              <button type="button" onClick={onSave}
                className="px-5 py-2 rounded-[8px] text-[14px] font-semibold text-white bg-[var(--c-accent)] active:brightness-90 transition-all"
              >บันทึก</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Event Dashboard (Mon-Fri overview) ---

const MINI_DAYS = ["\u0E08", "\u0E2D", "\u0E1E", "\u0E1E\u0E24", "\u0E28"];

function EventDashboard({ monday, getEntry }: { monday: Date; getEntry: (key: string) => ScheduleEntry }) {
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const today = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  return (
    <div className="mb-5 md:mb-8 rounded-[14px] bg-[var(--c-card)] overflow-hidden">
      <div className="grid grid-cols-5 divide-x divide-[var(--c-sep)]">
        {weekDays.map((day, i) => {
          const key = formatDateKey(day);
          const entry = getEntry(key);
          const todayFlag = isSameDay(day, today);
          const events = entry.events || [];
          const sorted = [...events].sort((a, b) => {
            if (!a.time && !b.time) return 0;
            if (!a.time) return -1;
            if (!b.time) return 1;
            return a.time.localeCompare(b.time);
          });

          return (
            <div key={i} className={`px-1 py-2.5 md:px-2 md:py-3 ${todayFlag ? "bg-[var(--c-accent)]/8" : ""}`}>
              {/* Day + Date + Emojis */}
              <div className={`text-[11px] md:text-[13px] font-semibold text-center ${todayFlag ? "text-[var(--c-accent)]" : "text-[var(--c-text-2)]"}`}>
                {MINI_DAYS[i]} <span className={`font-normal ${todayFlag ? "text-[var(--c-accent)]/70" : "text-[var(--c-text-3)]"}`}>{day.getDate()}/{day.getMonth() + 1}</span>
                {entry.emojis && entry.emojis.length > 0 && (
                  <span className="ml-0.5">{entry.emojis.map((e, j) => <Emoji key={j} char={e} size={9} />)}</span>
                )}
              </div>

              {/* Driver summary: ส่ง X / รับ X */}
              <div className="mt-1.5 text-center space-y-0.5">
                <div className="flex items-center justify-center gap-0.5">
                  <span className="text-[9px] text-[var(--c-text-3)]">ส่ง</span>
                  {entry.morning ? (
                    <span className={`font-bold text-[10px] ${DRIVERS.find((d) => d.name === entry.morning)?.color || ""}`}>{entry.morning}</span>
                  ) : <span className="text-[var(--c-text-4)] text-[10px]">{"\u2014"}</span>}
                </div>
                <div className="flex items-center justify-center gap-0.5">
                  <span className="text-[9px] text-[var(--c-text-3)]">รับ</span>
                  {entry.evening ? (
                    <span className={`font-bold text-[10px] ${DRIVERS.find((d) => d.name === entry.evening)?.color || ""}`}>{entry.evening}</span>
                  ) : <span className="text-[var(--c-text-4)] text-[10px]">{"\u2014"}</span>}
                </div>
              </div>

              {/* Events — show all */}
              {sorted.length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  {sorted.map((ev) => {
                    const d = DRIVERS.find((dr) => dr.name === ev.driver);
                    return (
                      <div key={ev.id} className="flex items-start gap-1.5 min-w-0">
                        <span className="text-[9px] text-[var(--c-text)] font-mono shrink-0 text-right">
                          {ev.time ? (ev.endTime ? `${ev.time}–${ev.endTime}` : ev.time) : "Day"}
                        </span>
                        <span className={`text-[9px] md:text-[10px] leading-tight truncate ${d?.color || "text-[var(--c-text-2)]"}`}>
                          {ev.detail}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {sorted.length === 0 && !entry.morning && !entry.evening && (!entry.emojis || entry.emojis.length === 0) && (
                <div className="text-[9px] text-[var(--c-text-4)] text-center mt-1.5">{"\u2014"}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
