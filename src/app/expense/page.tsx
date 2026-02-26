"use client";

import MainNavigationShell from "@/components/main-navigation-shell";
import { useEffect, useState, useCallback, useRef } from "react";

// ─── Types ───
type Person = "Hon" | "Jay";
type ExpenseType = "personal" | "shared";

interface ExpenseEntry {
  id: string;
  date: string;       // "YYYY-MM-DDTHH:mm"
  description: string;
  amount: number;
  paidBy: Person;
  source: string;
  type: ExpenseType;
  photos?: string[];   // base64 compressed images
}

interface CashTopup {
  amount: number;
  date: string;
  person: Person;
  note?: string;
}

interface CashPool {
  hon: number;         // Hon's initial cash (default 40000)
  jay: number;         // Jay's initial cash (default 40000)
  topups: CashTopup[];
}

interface PaymentSource {
  id: string;
  label: string;
  owner: Person | "shared";
  type: "cash" | "credit";
}

interface ExpenseData {
  entries: ExpenseEntry[];
  cashPool: CashPool;
  sources: PaymentSource[];
  exchangeRate: number;
}

// ─── Constants ───
const DEFAULT_SOURCES: PaymentSource[] = [
  { id: "cash", label: "เงินสด", owner: "shared", type: "cash" },
  { id: "scb-hon", label: "SCB Planet (Hon)", owner: "Hon", type: "credit" },
  { id: "youtrip-hon", label: "Youtrip (Hon)", owner: "Hon", type: "credit" },
  { id: "cypher-hon", label: "Cypher (Hon)", owner: "Hon", type: "credit" },
  { id: "kbank-line-hon", label: "Kbank LINE (Hon)", owner: "Hon", type: "credit" },
  { id: "scb-jay", label: "SCB Planet (Jay)", owner: "Jay", type: "credit" },
  { id: "youtrip-jay", label: "Youtrip (Jay)", owner: "Jay", type: "credit" },
];

const PERSON_COLORS: Record<Person, string> = {
  Hon: "#3B82F6",
  Jay: "#EC4899",
};

const PERSON_BG: Record<Person, string> = {
  Hon: "rgba(59,130,246,0.15)",
  Jay: "rgba(236,72,153,0.15)",
};

type TabId = "record" | "transactions" | "summary";
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "record", label: "บันทึก", icon: "+" },
  { id: "transactions", label: "รายการ", icon: "#" },
  { id: "summary", label: "สรุป", icon: "=" },
];

function genId() {
  return Math.random().toString(36).substring(2, 10);
}

function nowStr() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtYen(n: number) {
  return `¥${n.toLocaleString()}`;
}

function fmtBaht(n: number) {
  return `฿${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatThaiDate(dateStr: string) {
  // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm"
  const datePart = dateStr.split("T")[0];
  const [y, m, d] = datePart.split("-").map(Number);
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${d} ${months[m - 1]} ${y + 543 - 2500}`;
}

function formatTime(dateStr: string) {
  if (!dateStr.includes("T")) return "";
  const timePart = dateStr.split("T")[1];
  return timePart || "";
}

function dateOnly(dateStr: string) {
  return dateStr.split("T")[0];
}

// ─── Image compression ───
function compressImage(file: File, maxW = 800, quality = 0.6): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxW) { h = (maxW / w) * h; w = maxW; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function emptyData(): ExpenseData {
  return {
    entries: [],
    cashPool: { hon: 40000, jay: 40000, topups: [] },
    sources: [...DEFAULT_SOURCES],
    exchangeRate: 0.27,
  };
}

// ─── Main Component ───
export default function ExpensePage() {
  const [data, setData] = useState<ExpenseData>(emptyData());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("record");

  // Record form state
  const [formAmount, setFormAmount] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState(nowStr());
  const [formPaidBy, setFormPaidBy] = useState<Person>("Hon");
  const [formSource, setFormSource] = useState("cash");
  const [formType, setFormType] = useState<ExpenseType>("shared");

  // Edit modal
  const [editEntry, setEditEntry] = useState<ExpenseEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Cash topup modal
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupNote, setTopupNote] = useState("");
  const [topupPerson, setTopupPerson] = useState<Person>("Hon");

  // Photos
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<{ src: string; context: "form" | "edit"; index: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Exchange rate edit
  const [editRate, setEditRate] = useState(false);
  const [rateInput, setRateInput] = useState("");
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  // ─── Fetch ───
  useEffect(() => {
    fetch("/api/expense-tracker")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.entries) {
          // Migrate old cashPool format
          let cashPool = d.cashPool;
          if (cashPool && typeof cashPool.initial === "number") {
            // Old format: { initial: 80000, topups: [] }
            cashPool = {
              hon: Math.round(cashPool.initial / 2),
              jay: Math.round(cashPool.initial / 2),
              topups: (cashPool.topups || []).map((t: CashTopup & { person?: Person }) => ({
                ...t,
                person: t.person || "Hon",
              })),
            };
          }
          setData({
            entries: d.entries || [],
            cashPool: cashPool || { hon: 40000, jay: 40000, topups: [] },
            sources: [...DEFAULT_SOURCES],
            exchangeRate: d.exchangeRate ?? 0.27,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ─── Save ───
  const saveData = useCallback((newData: ExpenseData) => {
    setData(newData);
    setSaving(true);
    fetch("/api/expense-tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    }).finally(() => setSaving(false));
  }, []);

  // ─── Available sources for a paidBy person ───
  function sourcesFor(person: Person): PaymentSource[] {
    return data.sources.filter(
      (s) => s.owner === "shared" || s.owner === person
    );
  }

  // ─── Photo handlers ───
  async function handlePhotoPick(files: FileList | null, target: "form" | "edit") {
    if (!files || files.length === 0) return;
    const compressed = await Promise.all(
      Array.from(files).map((f) => compressImage(f))
    );
    if (target === "form") {
      setFormPhotos((prev) => [...prev, ...compressed]);
    } else if (editEntry) {
      setEditEntry({ ...editEntry, photos: [...(editEntry.photos || []), ...compressed] });
    }
  }

  // ─── Record Tab: Add entry ───
  function handleAdd() {
    const amt = parseFloat(formAmount);
    if (!amt || amt <= 0 || !formDesc.trim()) return;
    const entry: ExpenseEntry = {
      id: genId(),
      date: formDate,
      description: formDesc.trim(),
      amount: amt,
      paidBy: formPaidBy,
      source: formSource,
      type: formType,
      photos: formPhotos.length > 0 ? formPhotos : undefined,
    };
    const newData = { ...data, entries: [...data.entries, entry] };
    saveData(newData);
    setFormAmount("");
    setFormDesc("");
    setFormDate(nowStr());
    setFormPhotos([]);
  }

  // ─── Edit entry ───
  function handleSaveEdit() {
    if (!editEntry) return;
    const newEntries = data.entries.map((e) =>
      e.id === editEntry.id ? editEntry : e
    );
    saveData({ ...data, entries: newEntries });
    setEditEntry(null);
  }

  // ─── Delete entry ───
  function handleDelete(id: string) {
    const newEntries = data.entries.filter((e) => e.id !== id);
    saveData({ ...data, entries: newEntries });
    setDeleteConfirm(null);
  }

  // ─── Cash calculations per person ───
  function cashUsedBy(person: Person) {
    return data.entries
      .filter((e) => e.source === "cash" && e.paidBy === person)
      .reduce((sum, e) => sum + e.amount, 0);
  }
  function cashTopupsBy(person: Person) {
    return data.cashPool.topups
      .filter((t) => t.person === person)
      .reduce((sum, t) => sum + t.amount, 0);
  }
  const honCashInitial = data.cashPool.hon;
  const jayCashInitial = data.cashPool.jay;
  const honCashUsed = cashUsedBy("Hon");
  const jayCashUsed = cashUsedBy("Jay");
  const honCashTopup = cashTopupsBy("Hon");
  const jayCashTopup = cashTopupsBy("Jay");
  const honCashRemaining = honCashInitial + honCashTopup - honCashUsed;
  const jayCashRemaining = jayCashInitial + jayCashTopup - jayCashUsed;
  const totalCashRemaining = honCashRemaining + jayCashRemaining;

  // ─── Summary calculations ───
  const totalAll = data.entries.reduce((sum, e) => sum + e.amount, 0);

  function personSummary(person: Person) {
    const personal = data.entries
      .filter((e) => e.paidBy === person && e.type === "personal")
      .reduce((sum, e) => sum + e.amount, 0);
    const sharedPaid = data.entries
      .filter((e) => e.paidBy === person && e.type === "shared")
      .reduce((sum, e) => sum + e.amount, 0);
    return { personal, sharedPaid };
  }

  function sourceSummary() {
    const map = new Map<string, { total: number; entries: ExpenseEntry[] }>();
    for (const e of data.entries) {
      const existing = map.get(e.source);
      if (existing) {
        existing.total += e.amount;
        existing.entries.push(e);
      } else {
        map.set(e.source, { total: e.amount, entries: [e] });
      }
    }
    return Array.from(map.entries()).map(([sourceId, { total, entries }]) => {
      const src = data.sources.find((s) => s.id === sourceId);
      // Sort entries by date descending
      entries.sort((a, b) => b.date.localeCompare(a.date));
      return { sourceId, label: src?.label || sourceId, total, entries };
    });
  }

  // Settlement: shared ทั้งหมดหาร 2, ดูใครจ่ายไปเกิน
  function settlement() {
    const totalShared = data.entries
      .filter((e) => e.type === "shared")
      .reduce((sum, e) => sum + e.amount, 0);
    const eachShare = totalShared / 2;

    const honSharedPaid = data.entries
      .filter((e) => e.type === "shared" && e.paidBy === "Hon")
      .reduce((sum, e) => sum + e.amount, 0);
    const jaySharedPaid = data.entries
      .filter((e) => e.type === "shared" && e.paidBy === "Jay")
      .reduce((sum, e) => sum + e.amount, 0);

    const honOwes = eachShare - honSharedPaid;
    const jayOwes = eachShare - jaySharedPaid;

    return { totalShared, eachShare, honSharedPaid, jaySharedPaid, honOwes, jayOwes };
  }

  // ─── Source label helper ───
  function sourceLabel(id: string) {
    return data.sources.find((s) => s.id === id)?.label || id;
  }

  // ─── Grouped transactions by date ───
  function groupedEntries() {
    const sorted = [...data.entries].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    const groups: { date: string; entries: ExpenseEntry[] }[] = [];
    let currentDate = "";
    for (const e of sorted) {
      const d = dateOnly(e.date);
      if (d !== currentDate) {
        currentDate = d;
        groups.push({ date: d, entries: [] });
      }
      groups[groups.length - 1].entries.push(e);
    }
    return groups;
  }

  // ─── Type badge ───
  function typeBadge(type: ExpenseType, small = false) {
    const isShared = type === "shared";
    const sz = small ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";
    return (
      <span
        className={`inline-flex items-center gap-0.5 rounded-full font-medium ${sz}`}
        style={{
          background: isShared ? "rgba(59,130,246,0.12)" : "rgba(168,85,247,0.12)",
          color: isShared ? "#60A5FA" : "#A78BFA",
        }}
      >
        {isShared ? "👥" : "👤"} {isShared ? "แชร์" : "ส่วนตัว"}
      </span>
    );
  }

  if (loading) {
    return (
      <MainNavigationShell title="Expense Tracker">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      </MainNavigationShell>
    );
  }

  return (
    <MainNavigationShell title="Expense Tracker">
      {/* Saving indicator */}
      {saving && (
        <div className="fixed top-14 right-4 z-50 bg-[var(--c-card)] px-3 py-1.5 rounded-full shadow-lg text-[13px] text-[var(--c-text-2)] border border-[var(--c-sep)]">
          กำลังบันทึก...
        </div>
      )}

      {/* Tab pills */}
      <div className="flex gap-1.5 mb-6 bg-[var(--c-fill-3)] rounded-[10px] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-[8px] text-[14px] font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[var(--c-accent)] text-white shadow-sm"
                : "text-[var(--c-text-2)] hover:text-[var(--c-text)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab 1: Record ─── */}
      {activeTab === "record" && (
        <div className="space-y-5">
          {/* Amount: baht preview left, yen input right */}
          <div>
            <label className="block text-[13px] text-[var(--c-text-2)] mb-1.5">จำนวนเงิน</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-14 bg-[var(--c-card)] border border-[var(--c-sep)] rounded-xl px-4 flex items-center">
                <span className="text-[13px] text-[var(--c-text-3)] mr-1">≈</span>
                <span className="text-[20px] font-bold text-[var(--c-accent)]">
                  {formAmount ? fmtBaht(Math.round((parseFloat(formAmount) || 0) * data.exchangeRate)) : "฿0"}
                </span>
              </div>
              <div className="relative flex-1">
                <input
                  type="number"
                  inputMode="numeric"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0"
                  className="w-full h-14 bg-[var(--c-input)] rounded-xl pl-8 pr-4 text-[24px] font-bold text-[var(--c-text)] placeholder:text-[var(--c-text-4)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[var(--c-text-3)] font-medium">¥</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] text-[var(--c-text-2)] mb-1.5">รายละเอียด</label>
            <input
              type="text"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="เช่น ราเมน, ตั๋วรถไฟ"
              className="w-full h-11 bg-[var(--c-input)] rounded-xl px-4 text-[16px] text-[var(--c-text)] placeholder:text-[var(--c-text-4)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]"
            />
          </div>

          {/* Date + Time */}
          <div>
            <label className="block text-[13px] text-[var(--c-text-2)] mb-1.5">วันที่ & เวลา</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={formDate.split("T")[0]}
                onChange={(e) => setFormDate(e.target.value + "T" + (formDate.split("T")[1] || "12:00"))}
                className="flex-1 min-w-0 h-11 bg-[var(--c-input)] rounded-xl px-3 text-[15px] text-[var(--c-text)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]"
              />
              <input
                type="time"
                value={formDate.split("T")[1] || "12:00"}
                onChange={(e) => setFormDate((formDate.split("T")[0]) + "T" + e.target.value)}
                className="w-[110px] h-11 bg-[var(--c-input)] rounded-xl px-3 text-[15px] text-[var(--c-text)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]"
              />
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-[13px] text-[var(--c-text-2)] mb-1.5">ใครจ่าย</label>
            <div className="flex gap-3">
              {(["Hon", "Jay"] as Person[]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setFormPaidBy(p);
                    const avail = sourcesFor(p);
                    if (avail.length && !avail.find((s) => s.id === formSource)) {
                      setFormSource(avail[0].id);
                    }
                  }}
                  className="flex-1 h-12 rounded-xl text-[16px] font-semibold transition-all"
                  style={{
                    background: formPaidBy === p ? PERSON_COLORS[p] : "var(--c-fill-3)",
                    color: formPaidBy === p ? "#fff" : "var(--c-text-2)",
                    borderWidth: 2,
                    borderColor: formPaidBy === p ? PERSON_COLORS[p] : "transparent",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Source */}
          <div>
            <label className="block text-[13px] text-[var(--c-text-2)] mb-1.5">จ่ายจาก</label>
            <div className="flex flex-wrap gap-2">
              {sourcesFor(formPaidBy).map((src) => (
                <button
                  key={src.id}
                  onClick={() => setFormSource(src.id)}
                  className="px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                  style={{
                    background: formSource === src.id ? "var(--c-accent)" : "var(--c-fill-3)",
                    color: formSource === src.id ? "#fff" : "var(--c-text-2)",
                  }}
                >
                  {src.type === "cash" ? "💵 " : "💳 "}{src.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[13px] text-[var(--c-text-2)] mb-1.5">ประเภท</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormType("shared")}
                className="flex-1 h-12 rounded-xl text-[15px] font-medium transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: formType === "shared" ? "rgba(59,130,246,0.2)" : "var(--c-fill-3)",
                  color: formType === "shared" ? "#60A5FA" : "var(--c-text-2)",
                  borderWidth: 2,
                  borderColor: formType === "shared" ? "#3B82F6" : "transparent",
                }}
              >
                👥 แชร์กัน
              </button>
              <button
                onClick={() => setFormType("personal")}
                className="flex-1 h-12 rounded-xl text-[15px] font-medium transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: formType === "personal" ? "rgba(168,85,247,0.2)" : "var(--c-fill-3)",
                  color: formType === "personal" ? "#A78BFA" : "var(--c-text-2)",
                  borderWidth: 2,
                  borderColor: formType === "personal" ? "#8B5CF6" : "transparent",
                }}
              >
                👤 ส่วนตัว
              </button>
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-[13px] text-[var(--c-text-2)] mb-1.5">รูปภาพ (ไม่จำเป็น)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { handlePhotoPick(e.target.files, "form"); e.target.value = ""; }}
            />
            <div className="flex gap-2 flex-wrap">
              {formPhotos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewPhoto({ src: photo, context: "form", index: i })}
                  className="w-16 h-16 rounded-lg overflow-hidden border border-[var(--c-sep)] active:opacity-70 transition-opacity"
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-[var(--c-sep)] flex flex-col items-center justify-center text-[var(--c-text-3)] active:bg-[var(--c-fill-3)]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                </svg>
                <span className="text-[10px] mt-0.5">เพิ่มรูป</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleAdd}
            disabled={!formAmount || !(parseFloat(formAmount) > 0) || !formDesc.trim()}
            className="w-full h-13 rounded-xl text-[16px] font-semibold text-white transition-all disabled:opacity-40"
            style={{ background: "var(--c-accent)" }}
          >
            บันทึก
          </button>
        </div>
      )}

      {/* ─── Tab 2: Transactions ─── */}
      {activeTab === "transactions" && (
        <div className="space-y-5">
          {data.entries.length === 0 ? (
            <div className="text-center py-16 text-[var(--c-text-3)]">
              <div className="text-[40px] mb-2">📝</div>
              <div className="text-[15px]">ยังไม่มีรายการ</div>
            </div>
          ) : (
            groupedEntries().map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="text-[13px] text-[var(--c-text-3)] font-semibold">
                    {formatThaiDate(group.date)}
                  </div>
                  <div className="text-[12px] text-[var(--c-text-3)]">
                    {fmtYen(group.entries.reduce((s, e) => s + e.amount, 0))}
                  </div>
                </div>
                <div className="bg-[var(--c-card)] rounded-xl border border-[var(--c-sep)] overflow-hidden">
                  {group.entries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className={`px-4 py-3.5 flex items-center gap-3 active:bg-[var(--c-fill-3)] transition-colors ${
                        idx > 0 ? "border-t border-[var(--c-sep)]/50" : ""
                      }`}
                      onClick={() => setEditEntry({ ...entry })}
                    >
                      {/* Person avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0"
                        style={{
                          background: PERSON_BG[entry.paidBy],
                          color: PERSON_COLORS[entry.paidBy],
                        }}
                      >
                        {entry.paidBy}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[15px] text-[var(--c-text)] font-medium truncate">
                            {entry.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {typeBadge(entry.type, true)}
                          <span className="text-[11px] text-[var(--c-text-4)]">·</span>
                          <span className="text-[11px] text-[var(--c-text-3)]">{sourceLabel(entry.source)}</span>
                          {formatTime(entry.date) && (
                            <>
                              <span className="text-[11px] text-[var(--c-text-4)]">·</span>
                              <span className="text-[11px] text-[var(--c-text-3)]">{formatTime(entry.date)}</span>
                            </>
                          )}
                          {entry.photos && entry.photos.length > 0 && (
                            <>
                              <span className="text-[11px] text-[var(--c-text-4)]">·</span>
                              <span className="text-[11px] text-[var(--c-text-3)]">📷{entry.photos.length}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <div className="text-[16px] font-semibold text-[var(--c-text)]">{fmtYen(entry.amount)}</div>
                        <div className="text-[11px] text-[var(--c-text-3)]">
                          ≈ {fmtBaht(Math.round(entry.amount * data.exchangeRate))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── Tab 3: Summary ─── */}
      {activeTab === "summary" && (
        <div className="space-y-5">
          {/* Cash remaining — per person */}
          <div className="bg-[var(--c-card)] rounded-xl p-4 border border-[var(--c-sep)]">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[14px] text-[var(--c-text)] font-semibold">💵 เงินสดคงเหลือ</div>
              <button
                onClick={() => {
                  setShowTopup(true);
                  setTopupAmount("");
                  setTopupNote("");
                  setTopupPerson("Hon");
                }}
                className="px-2.5 py-1 rounded-lg text-[12px] font-medium bg-[var(--c-fill-3)] text-[var(--c-accent)]"
              >
                + เพิ่มเงินสด
              </button>
            </div>

            {/* Total cash */}
            <div className="text-[28px] font-bold text-[var(--c-text)] mb-3">
              {fmtYen(totalCashRemaining)}
              <span className="text-[14px] font-normal text-[var(--c-text-3)] ml-2">
                ≈ {fmtBaht(Math.round(totalCashRemaining * data.exchangeRate))}
              </span>
            </div>

            {/* Per person breakdown */}
            <div className="grid grid-cols-2 gap-3">
              {(["Hon", "Jay"] as Person[]).map((p) => {
                const initial = p === "Hon" ? honCashInitial : jayCashInitial;
                const used = p === "Hon" ? honCashUsed : jayCashUsed;
                const topup = p === "Hon" ? honCashTopup : jayCashTopup;
                const remaining = p === "Hon" ? honCashRemaining : jayCashRemaining;
                return (
                  <div
                    key={p}
                    className="rounded-lg p-3"
                    style={{ background: PERSON_BG[p] }}
                  >
                    <div className="text-[13px] font-semibold mb-1" style={{ color: PERSON_COLORS[p] }}>
                      {p}
                    </div>
                    <div className="text-[20px] font-bold text-[var(--c-text)]">{fmtYen(remaining)}</div>
                    <div className="text-[11px] text-[var(--c-text-3)] mt-1">
                      {fmtYen(initial)}{topup > 0 && ` +${fmtYen(topup)}`} - {fmtYen(used)}
                    </div>
                  </div>
                );
              })}
            </div>

            {data.cashPool.topups.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--c-sep)]/50 space-y-1">
                {data.cashPool.topups.map((t, i) => (
                  <div key={i} className="text-[12px] text-[var(--c-text-3)]">
                    + {fmtYen(t.amount)} ({t.person}, {formatThaiDate(t.date)})
                    {t.note && <> — {t.note}</>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total all */}
          <div className="bg-[var(--c-card)] rounded-xl p-4 border border-[var(--c-sep)]">
            <div className="text-[14px] text-[var(--c-text)] font-semibold mb-2">📊 ยอดรวมทั้งหมด</div>
            <div className="text-[26px] font-bold text-[var(--c-text)]">
              {fmtYen(totalAll)}
              <span className="text-[14px] font-normal text-[var(--c-text-3)] ml-2">
                ≈ {fmtBaht(Math.round(totalAll * data.exchangeRate))}
              </span>
            </div>
            <div className="text-[12px] text-[var(--c-text-3)] mt-1">{data.entries.length} รายการ</div>
          </div>

          {/* Per-person summary */}
          <div className="bg-[var(--c-card)] rounded-xl p-4 border border-[var(--c-sep)]">
            <div className="text-[14px] text-[var(--c-text)] font-semibold mb-4">👥 สรุปตามคน</div>
            <div className="space-y-4">
              {(["Hon", "Jay"] as Person[]).map((p) => {
                const s = personSummary(p);
                const total = s.personal + s.sharedPaid;
                return (
                  <div key={p} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5"
                      style={{ background: PERSON_BG[p], color: PERSON_COLORS[p] }}
                    >
                      {p.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[15px] font-semibold text-[var(--c-text)]">{p}</span>
                        <span className="text-[15px] font-bold text-[var(--c-text)]">{fmtYen(total)}</span>
                      </div>
                      <div className="text-[12px] text-[var(--c-text-3)] space-y-0.5">
                        <div>👤 ส่วนตัว: {fmtYen(s.personal)}</div>
                        <div>👥 แชร์ที่จ่ายไป: {fmtYen(s.sharedPaid)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Settlement */}
          {(() => {
            const s = settlement();
            if (s.totalShared === 0) return null;
            return (
              <div className="bg-[var(--c-card)] rounded-xl p-4 border border-[var(--c-sep)]">
                <div className="text-[14px] text-[var(--c-text)] font-semibold mb-3">⚖️ ใครต้องจ่ายใครเพิ่ม</div>
                <div className="text-[13px] text-[var(--c-text-3)] mb-3">
                  แชร์รวม {fmtYen(s.totalShared)} → คนละ {fmtYen(Math.round(s.eachShare))}
                </div>
                <div className="text-[13px] space-y-1.5 mb-3">
                  <div className="flex justify-between">
                    <span className="text-[var(--c-text-2)]">Hon จ่ายแชร์ไป</span>
                    <span className="font-medium text-[var(--c-text)]">{fmtYen(s.honSharedPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--c-text-2)]">Jay จ่ายแชร์ไป</span>
                    <span className="font-medium text-[var(--c-text)]">{fmtYen(s.jaySharedPaid)}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--c-fill-3)]">
                  {s.honOwes > 10 ? (
                    <div className="text-[15px] font-semibold text-center" style={{ color: PERSON_COLORS.Hon }}>
                      Hon ต้องจ่าย Jay เพิ่ม {fmtYen(Math.round(s.honOwes))}
                    </div>
                  ) : s.jayOwes > 10 ? (
                    <div className="text-[15px] font-semibold text-center" style={{ color: PERSON_COLORS.Jay }}>
                      Jay ต้องจ่าย Hon เพิ่ม {fmtYen(Math.round(s.jayOwes))}
                    </div>
                  ) : (
                    <div className="text-[15px] font-semibold text-center text-[var(--c-text)]">
                      เท่ากัน ไม่ต้องจ่ายเพิ่ม ✓
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* By source */}
          <div className="bg-[var(--c-card)] rounded-xl border border-[var(--c-sep)] overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <div className="text-[14px] text-[var(--c-text)] font-semibold">💳 สรุปตามแหล่งจ่าย</div>
            </div>
            {sourceSummary().length === 0 ? (
              <div className="px-4 pb-4 text-[13px] text-[var(--c-text-3)]">ยังไม่มีรายการ</div>
            ) : (
              <div>
                {sourceSummary().map((s) => {
                  const isExpanded = expandedSource === s.sourceId;
                  return (
                    <div key={s.sourceId}>
                      <button
                        onClick={() => setExpandedSource(isExpanded ? null : s.sourceId)}
                        className="w-full flex items-center justify-between px-4 py-3 active:bg-[var(--c-fill-3)] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            className={`w-3.5 h-3.5 text-[var(--c-text-3)] transition-transform ${isExpanded ? "rotate-90" : ""}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-[14px] text-[var(--c-text)]">{s.label}</span>
                          <span className="text-[11px] text-[var(--c-text-3)]">({s.entries.length})</span>
                        </div>
                        <span className="text-[14px] font-semibold text-[var(--c-text)]">{fmtYen(s.total)}</span>
                      </button>
                      {isExpanded && (
                        <div className="bg-[var(--c-fill-3)]/50 px-4 pb-2">
                          {s.entries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-[var(--c-sep)]/30 last:border-0">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                                    style={{ background: PERSON_BG[entry.paidBy], color: PERSON_COLORS[entry.paidBy] }}
                                  >
                                    {entry.paidBy}
                                  </span>
                                  <span className="text-[13px] text-[var(--c-text)] truncate">{entry.description}</span>
                                </div>
                                <div className="text-[11px] text-[var(--c-text-3)] mt-0.5">
                                  {formatThaiDate(entry.date)}
                                  {formatTime(entry.date) && <> · {formatTime(entry.date)}</>}
                                  {" · "}{entry.type === "shared" ? "👥 แชร์" : "👤 ส่วนตัว"}
                                </div>
                              </div>
                              <div className="text-right shrink-0 ml-2">
                                <div className="text-[13px] font-semibold text-[var(--c-text)]">{fmtYen(entry.amount)}</div>
                                <div className="text-[10px] text-[var(--c-text-3)]">≈ {fmtBaht(Math.round(entry.amount * data.exchangeRate))}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Exchange rate */}
          <div className="bg-[var(--c-card)] rounded-xl p-4 border border-[var(--c-sep)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] text-[var(--c-text)] font-semibold">💱 อัตราแลกเปลี่ยน</div>
                {!editRate && (
                  <div className="text-[15px] text-[var(--c-text-2)] mt-0.5">¥1 = ฿{data.exchangeRate}</div>
                )}
              </div>
              {!editRate ? (
                <button
                  onClick={() => {
                    setEditRate(true);
                    setRateInput(String(data.exchangeRate));
                  }}
                  className="px-2.5 py-1 rounded-lg text-[12px] font-medium bg-[var(--c-fill-3)] text-[var(--c-accent)]"
                >
                  แก้ไข
                </button>
              ) : (
                <div className="flex gap-2 items-center">
                  <span className="text-[14px] text-[var(--c-text-2)]">¥1 = ฿</span>
                  <input
                    type="number"
                    step="0.01"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    className="w-20 h-9 bg-[var(--c-input)] rounded-lg px-2 text-[15px] text-[var(--c-text)] outline-none"
                  />
                  <button
                    onClick={() => {
                      const rate = parseFloat(rateInput);
                      if (rate > 0) saveData({ ...data, exchangeRate: rate });
                      setEditRate(false);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[12px] font-medium bg-[var(--c-accent)] text-white"
                  >
                    บันทึก
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Initial cash edit per person */}
          <div className="bg-[var(--c-card)] rounded-xl p-4 border border-[var(--c-sep)]">
            <div className="text-[14px] text-[var(--c-text)] font-semibold mb-3">⚙️ ตั้งค่าเงินสดเริ่มต้น</div>
            <div className="space-y-3">
              {(["Hon", "Jay"] as Person[]).map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <span className="text-[14px] font-medium w-10" style={{ color: PERSON_COLORS[p] }}>{p}</span>
                  <span className="text-[14px] text-[var(--c-text-2)]">¥</span>
                  <input
                    type="number"
                    value={p === "Hon" ? data.cashPool.hon : data.cashPool.jay}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      const newPool = { ...data.cashPool };
                      if (p === "Hon") newPool.hon = val;
                      else newPool.jay = val;
                      saveData({ ...data, cashPool: newPool });
                    }}
                    className="w-28 h-9 bg-[var(--c-input)] rounded-lg px-2 text-[15px] text-[var(--c-text)] outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ─── */}
      {editEntry && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-[var(--c-overlay)] backdrop-blur-sm" onClick={() => setEditEntry(null)} />
          <div className="relative w-full max-w-lg bg-[var(--c-card)] rounded-t-2xl p-5 pb-8 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[17px] font-semibold text-[var(--c-text)]">แก้ไขรายการ</h3>
              <button
                onClick={() => setDeleteConfirm(editEntry.id)}
                className="text-[13px] text-red-500 font-medium"
              >
                ลบ
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[13px] text-[var(--c-text-2)] mb-1">จำนวนเงิน (¥)</label>
              <input
                type="number"
                inputMode="numeric"
                value={editEntry.amount}
                onChange={(e) => setEditEntry({ ...editEntry, amount: parseFloat(e.target.value) || 0 })}
                className="w-full h-12 bg-[var(--c-input)] rounded-xl px-4 text-[20px] font-bold text-[var(--c-text)] outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[13px] text-[var(--c-text-2)] mb-1">รายละเอียด</label>
              <input
                type="text"
                value={editEntry.description}
                onChange={(e) => setEditEntry({ ...editEntry, description: e.target.value })}
                className="w-full h-11 bg-[var(--c-input)] rounded-xl px-4 text-[15px] text-[var(--c-text)] outline-none"
              />
            </div>

            {/* Date + Time */}
            <div>
              <label className="block text-[13px] text-[var(--c-text-2)] mb-1">วันที่ & เวลา</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={editEntry.date.split("T")[0]}
                  onChange={(e) => setEditEntry({ ...editEntry, date: e.target.value + "T" + (editEntry.date.split("T")[1] || "12:00") })}
                  className="flex-1 min-w-0 h-11 bg-[var(--c-input)] rounded-xl px-3 text-[15px] text-[var(--c-text)] outline-none"
                />
                <input
                  type="time"
                  value={editEntry.date.split("T")[1] || "12:00"}
                  onChange={(e) => setEditEntry({ ...editEntry, date: editEntry.date.split("T")[0] + "T" + e.target.value })}
                  className="w-[110px] h-11 bg-[var(--c-input)] rounded-xl px-3 text-[15px] text-[var(--c-text)] outline-none"
                />
              </div>
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-[13px] text-[var(--c-text-2)] mb-1">ใครจ่าย</label>
              <div className="flex gap-2">
                {(["Hon", "Jay"] as Person[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setEditEntry({ ...editEntry, paidBy: p })}
                    className="flex-1 h-11 rounded-xl text-[15px] font-semibold transition-all"
                    style={{
                      background: editEntry.paidBy === p ? PERSON_COLORS[p] : "var(--c-fill-3)",
                      color: editEntry.paidBy === p ? "#fff" : "var(--c-text-2)",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Source */}
            <div>
              <label className="block text-[13px] text-[var(--c-text-2)] mb-1">จ่ายจาก</label>
              <div className="flex flex-wrap gap-2">
                {sourcesFor(editEntry.paidBy).map((src) => (
                  <button
                    key={src.id}
                    onClick={() => setEditEntry({ ...editEntry, source: src.id })}
                    className="px-3 py-2 rounded-lg text-[13px] font-medium transition-all"
                    style={{
                      background: editEntry.source === src.id ? "var(--c-accent)" : "var(--c-fill-3)",
                      color: editEntry.source === src.id ? "#fff" : "var(--c-text-2)",
                    }}
                  >
                    {src.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-[13px] text-[var(--c-text-2)] mb-1">ประเภท</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditEntry({ ...editEntry, type: "shared" })}
                  className="flex-1 h-11 rounded-xl text-[15px] font-medium transition-all flex items-center justify-center gap-1"
                  style={{
                    background: editEntry.type === "shared" ? "rgba(59,130,246,0.2)" : "var(--c-fill-3)",
                    color: editEntry.type === "shared" ? "#60A5FA" : "var(--c-text-2)",
                    borderWidth: 2,
                    borderColor: editEntry.type === "shared" ? "#3B82F6" : "transparent",
                  }}
                >
                  👥 แชร์กัน
                </button>
                <button
                  onClick={() => setEditEntry({ ...editEntry, type: "personal" })}
                  className="flex-1 h-11 rounded-xl text-[15px] font-medium transition-all flex items-center justify-center gap-1"
                  style={{
                    background: editEntry.type === "personal" ? "rgba(168,85,247,0.2)" : "var(--c-fill-3)",
                    color: editEntry.type === "personal" ? "#A78BFA" : "var(--c-text-2)",
                    borderWidth: 2,
                    borderColor: editEntry.type === "personal" ? "#8B5CF6" : "transparent",
                  }}
                >
                  👤 ส่วนตัว
                </button>
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-[13px] text-[var(--c-text-2)] mb-1">รูปภาพ</label>
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { handlePhotoPick(e.target.files, "edit"); e.target.value = ""; }}
              />
              <div className="flex gap-2 flex-wrap">
                {(editEntry.photos || []).map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setPreviewPhoto({ src: photo, context: "edit", index: i })}
                    className="w-16 h-16 rounded-lg overflow-hidden border border-[var(--c-sep)] active:opacity-70 transition-opacity"
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                <button
                  onClick={() => editFileInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-[var(--c-sep)] flex flex-col items-center justify-center text-[var(--c-text-3)] active:bg-[var(--c-fill-3)]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-[10px]">เพิ่มรูป</span>
                </button>
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditEntry(null)}
                className="flex-1 h-11 rounded-xl text-[15px] font-medium bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 h-11 rounded-xl text-[15px] font-semibold text-white"
                style={{ background: "var(--c-accent)" }}
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm ─── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-[var(--c-overlay)]" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-[var(--c-card)] rounded-2xl p-5 w-[280px] text-center">
            <div className="text-[17px] font-semibold text-[var(--c-text)] mb-2">ลบรายการนี้?</div>
            <div className="text-[14px] text-[var(--c-text-2)] mb-4">ลบแล้วไม่สามารถกู้คืนได้</div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-11 rounded-xl text-[15px] font-medium bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  handleDelete(deleteConfirm);
                  setEditEntry(null);
                }}
                className="flex-1 h-11 rounded-xl text-[15px] font-semibold text-white bg-red-500"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Cash Topup Modal ─── */}
      {showTopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[var(--c-overlay)] backdrop-blur-sm" onClick={() => setShowTopup(false)} />
          <div className="relative bg-[var(--c-card)] rounded-2xl p-5 w-[320px] space-y-3">
            <h3 className="text-[17px] font-semibold text-[var(--c-text)]">เพิ่มเงินสด</h3>

            {/* Who */}
            <div>
              <label className="block text-[13px] text-[var(--c-text-2)] mb-1">เพิ่มให้ใคร</label>
              <div className="flex gap-2">
                {(["Hon", "Jay"] as Person[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTopupPerson(p)}
                    className="flex-1 h-10 rounded-xl text-[14px] font-semibold transition-all"
                    style={{
                      background: topupPerson === p ? PERSON_COLORS[p] : "var(--c-fill-3)",
                      color: topupPerson === p ? "#fff" : "var(--c-text-2)",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[13px] text-[var(--c-text-2)] mb-1">จำนวน (¥)</label>
              <input
                type="number"
                inputMode="numeric"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="0"
                className="w-full h-11 bg-[var(--c-input)] rounded-xl px-4 text-[18px] font-bold text-[var(--c-text)] outline-none"
              />
            </div>
            <div>
              <label className="block text-[13px] text-[var(--c-text-2)] mb-1">หมายเหตุ (ไม่จำเป็น)</label>
              <input
                type="text"
                value={topupNote}
                onChange={(e) => setTopupNote(e.target.value)}
                placeholder="เช่น แลกเพิ่มที่สนามบิน"
                className="w-full h-11 bg-[var(--c-input)] rounded-xl px-4 text-[15px] text-[var(--c-text)] placeholder:text-[var(--c-text-4)] outline-none"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowTopup(false)}
                className="flex-1 h-11 rounded-xl text-[15px] font-medium bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  const amt = parseInt(topupAmount) || 0;
                  if (amt <= 0) return;
                  const newTopup: CashTopup = {
                    amount: amt,
                    date: nowStr().split("T")[0],
                    person: topupPerson,
                    note: topupNote || undefined,
                  };
                  saveData({
                    ...data,
                    cashPool: {
                      ...data.cashPool,
                      topups: [...data.cashPool.topups, newTopup],
                    },
                  });
                  setShowTopup(false);
                }}
                disabled={!(parseInt(topupAmount) > 0)}
                className="flex-1 h-11 rounded-xl text-[15px] font-semibold text-white disabled:opacity-40"
                style={{ background: "var(--c-accent)" }}
              >
                เพิ่ม
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── Photo Preview Modal ─── */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/90"
          onClick={() => setPreviewPhoto(null)}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 z-10" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewPhoto(null)}
              className="w-10 h-10 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-white text-[18px]"
            >
              ×
            </button>
            <button
              onClick={() => {
                const { context, index } = previewPhoto;
                if (context === "form") {
                  setFormPhotos((prev) => prev.filter((_, i) => i !== index));
                } else if (context === "edit" && editEntry) {
                  const newPhotos = (editEntry.photos || []).filter((_, i) => i !== index);
                  setEditEntry({ ...editEntry, photos: newPhotos.length > 0 ? newPhotos : undefined });
                }
                setPreviewPhoto(null);
              }}
              className="h-9 px-4 bg-red-500/80 backdrop-blur rounded-full flex items-center gap-1.5 text-white text-[13px] font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              ลบรูปนี้
            </button>
          </div>
          <img
            src={previewPhoto.src}
            alt=""
            className="max-w-[95vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </MainNavigationShell>
  );
}
