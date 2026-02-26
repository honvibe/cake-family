"use client";

import MainNavigationShell from "@/components/main-navigation-shell";
import { useEffect, useState, useCallback, useRef } from "react";

// ─── Types ───
type ProductCategory = "baby" | "food" | "drink" | "household" | "other";

interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  unit: string;
  image?: string;
  createdAt: string;
}

interface PriceEntry {
  id: string;
  productId: string;
  price: number;
  qty?: number;        // จำนวนหน่วย เช่น 12 ขวด
  store: string;
  channel: "online" | "offline";
  date: string;
  note?: string;
  url?: string;
}

interface PriceData {
  products: Product[];
  entries: PriceEntry[];
}

// ─── Constants ───
const CATEGORIES: { id: ProductCategory | "all"; label: string; emoji: string }[] = [
  { id: "all", label: "ทั้งหมด", emoji: "📋" },
  { id: "baby", label: "เด็ก/ทารก", emoji: "👶" },
  { id: "food", label: "อาหาร", emoji: "🍚" },
  { id: "drink", label: "เครื่องดื่ม", emoji: "🥤" },
  { id: "household", label: "ของใช้", emoji: "🧴" },
  { id: "other", label: "อื่นๆ", emoji: "📦" },
];

const STORES: { name: string; channel: "online" | "offline"; color: string }[] = [
  { name: "Makro", channel: "offline", color: "#E33C3C" },
  { name: "Big C", channel: "offline", color: "#FF6B00" },
  { name: "Tops", channel: "offline", color: "#00B14F" },
  { name: "Lotus's", channel: "offline", color: "#1E88E5" },
  { name: "7-11", channel: "offline", color: "#FF9800" },
  { name: "Shopee", channel: "online", color: "#EE4D2D" },
  { name: "Lazada", channel: "online", color: "#0F146D" },
  { name: "NocNoc", channel: "online", color: "#00BFA5" },
];

const UNITS = ["กล่อง", "ถุง", "ขวด", "ชิ้น", "แพ็ค", "กระป๋อง", "ลัง", "กก."];

function genId() {
  return Math.random().toString(36).substring(2, 10);
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatThaiDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${d} ${months[m - 1]} ${y + 543 - 2500}`;
}

function getStoreColor(storeName: string) {
  return STORES.find((s) => s.name === storeName)?.color || "var(--c-accent)";
}

function unitPrice(e: PriceEntry) {
  return e.qty && e.qty > 0 ? e.price / e.qty : e.price;
}

function fmtUnit(n: number) {
  return n % 1 === 0 ? n.toLocaleString() : n.toFixed(2);
}

// ─── Main Component ───
export default function PriceTrackerPage() {
  const [data, setData] = useState<PriceData>({ products: [], entries: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">("all");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [editEntryId, setEditEntryId] = useState<string | null>(null);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Fetch ───
  useEffect(() => {
    fetch("/api/price-tracker")
      .then((r) => r.json())
      .then((d) => setData({ products: d.products || [], entries: d.entries || [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ─── Save to Redis (debounced) ───
  const saveData = useCallback((newData: PriceData) => {
    setData(newData);
    setSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      fetch("/api/price-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      }).finally(() => setSaving(false));
    }, 500);
  }, []);

  // ─── Helpers ───
  const getProductEntries = (pid: string) =>
    data.entries.filter((e) => e.productId === pid).sort((a, b) => b.date.localeCompare(a.date));

  const getCheapest = (pid: string) => {
    const entries = getProductEntries(pid);
    if (!entries.length) return null;
    // latest entry per store
    const latestPerStore = new Map<string, PriceEntry>();
    for (const e of entries) {
      if (!latestPerStore.has(e.store)) latestPerStore.set(e.store, e);
    }
    let cheapest: PriceEntry | null = null;
    for (const e of latestPerStore.values()) {
      if (!cheapest || unitPrice(e) < unitPrice(cheapest)) cheapest = e;
    }
    return cheapest;
  };

  const getUniqueStores = (pid: string) => {
    const stores = new Set<string>();
    data.entries.filter((e) => e.productId === pid).forEach((e) => stores.add(e.store));
    return Array.from(stores);
  };

  const filteredProducts = data.products.filter((p) => {
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
    if (searchText && !p.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const selectedProduct = data.products.find((p) => p.id === selectedProductId) || null;

  // ─── Handlers ───
  const addProduct = (product: Omit<Product, "id" | "createdAt">, initialEntry?: { price: number; store: string; channel: "online" | "offline" }) => {
    const newProduct: Product = { ...product, id: genId(), createdAt: new Date().toISOString() };
    const newEntries = [...data.entries];
    if (initialEntry && initialEntry.price > 0) {
      newEntries.push({
        id: genId(),
        productId: newProduct.id,
        price: initialEntry.price,
        store: initialEntry.store,
        channel: initialEntry.channel,
        date: todayStr(),
      });
    }
    saveData({ products: [...data.products, newProduct], entries: newEntries });
    setShowAddProduct(false);
  };

  const updateProduct = (id: string, updates: Partial<Pick<Product, "name" | "category" | "unit" | "image">>) => {
    const products = data.products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveData({ ...data, products });
    setEditProductId(null);
  };

  const deleteProduct = (id: string) => {
    const products = data.products.filter((p) => p.id !== id);
    const entries = data.entries.filter((e) => e.productId !== id);
    saveData({ products, entries });
    setDeleteConfirm(null);
    setSelectedProductId(null);
  };

  const addPriceEntry = (entry: Omit<PriceEntry, "id">) => {
    const newEntry: PriceEntry = { ...entry, id: genId() };
    saveData({ ...data, entries: [...data.entries, newEntry] });
    setShowAddPrice(false);
  };

  const updatePriceEntry = (entryId: string, updates: Partial<Omit<PriceEntry, "id" | "productId">>) => {
    const entries = data.entries.map((e) => (e.id === entryId ? { ...e, ...updates } : e));
    saveData({ ...data, entries });
    setEditEntryId(null);
  };

  const deletePriceEntry = (entryId: string) => {
    saveData({ ...data, entries: data.entries.filter((e) => e.id !== entryId) });
  };

  // ─── Render ───
  if (loading) {
    return (
      <MainNavigationShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      </MainNavigationShell>
    );
  }

  // Product detail view
  if (selectedProduct) {
    const entries = getProductEntries(selectedProduct.id);
    const cheapest = getCheapest(selectedProduct.id);

    // Group latest price per store
    const latestPerStore = new Map<string, PriceEntry>();
    for (const e of entries) {
      if (!latestPerStore.has(e.store)) latestPerStore.set(e.store, e);
    }
    const onlineStores = Array.from(latestPerStore.values()).filter((e) => e.channel === "online").sort((a, b) => unitPrice(a) - unitPrice(b));
    const offlineStores = Array.from(latestPerStore.values()).filter((e) => e.channel === "offline").sort((a, b) => unitPrice(a) - unitPrice(b));
    const catInfo = CATEGORIES.find((c) => c.id === selectedProduct.category);

    return (
      <MainNavigationShell>
        <div className="max-w-2xl mx-auto">
          {/* Back + Title */}
          <button
            onClick={() => setSelectedProductId(null)}
            className="flex items-center gap-1.5 text-[var(--c-accent)] text-[15px] font-medium mb-4 -ml-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับ
          </button>

          <div className="flex items-start gap-4 mb-5">
            {selectedProduct.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedProduct.image} alt="" className="w-16 h-16 rounded-xl object-cover bg-[var(--c-fill-3)]" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[var(--c-fill-3)] flex items-center justify-center text-2xl">
                {catInfo?.emoji || "📦"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-[22px] font-bold text-[var(--c-text)] leading-tight">{selectedProduct.name}</h2>
              <p className="text-[14px] text-[var(--c-text-2)] mt-0.5">
                {catInfo?.emoji} {catInfo?.label} · {selectedProduct.unit}
              </p>
              {cheapest && (
                <div className="mt-1">
                  <p className="text-[14px] font-semibold" style={{ color: getStoreColor(cheapest.store) }}>
                    ถูกสุด: ฿{cheapest.price.toLocaleString()} @ {cheapest.store}
                  </p>
                  {cheapest.qty && cheapest.qty > 1 && (
                    <p className="text-[13px] text-[var(--c-text-2)]">
                      = ฿{fmtUnit(unitPrice(cheapest))}/{selectedProduct.unit}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setEditProductId(selectedProduct.id)}
                className="w-9 h-9 rounded-full bg-[var(--c-fill-3)] flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-[var(--c-text-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => setDeleteConfirm(selectedProduct.id)}
                className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Edit Product Modal */}
          {editProductId === selectedProduct.id && (
            <EditProductModal
              product={selectedProduct}
              onSave={(updates) => updateProduct(selectedProduct.id, updates)}
              onClose={() => setEditProductId(null)}
            />
          )}

          {/* Delete Confirm */}
          {deleteConfirm === selectedProduct.id && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[var(--c-overlay)]" onClick={() => setDeleteConfirm(null)} />
              <div className="relative bg-[var(--c-card)] rounded-2xl p-5 w-full max-w-sm shadow-xl">
                <p className="text-[16px] font-semibold text-[var(--c-text)] mb-2">ลบสินค้านี้?</p>
                <p className="text-[14px] text-[var(--c-text-2)] mb-4">
                  &quot;{selectedProduct.name}&quot; และประวัติราคาทั้งหมดจะถูกลบ
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl bg-[var(--c-fill-3)] text-[var(--c-text)] text-[15px] font-medium">
                    ยกเลิก
                  </button>
                  <button onClick={() => deleteProduct(selectedProduct.id)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[15px] font-medium">
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Price Comparison */}
          {(onlineStores.length > 0 || offlineStores.length > 0) && (<>
            {/* Unit Price Summary */}
            {cheapest && cheapest.qty && cheapest.qty > 1 && (
              <div className="rounded-2xl border-2 border-[var(--c-accent)]/30 bg-[var(--c-accent-bg)] p-4 mb-4">
                <p className="text-[13px] font-medium text-[var(--c-text-2)] mb-1">ราคาต่อ{selectedProduct.unit} (ถูกสุด)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[28px] font-bold text-[var(--c-accent)]">
                    ฿{fmtUnit(unitPrice(cheapest))}
                  </span>
                  <span className="text-[14px] text-[var(--c-text-2)]">
                    /{selectedProduct.unit}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--c-text-3)] mt-1">
                  จาก {cheapest.store} · ฿{cheapest.price.toLocaleString()} ÷ {cheapest.qty} {selectedProduct.unit}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-2xl border border-[var(--c-sep)] bg-[var(--c-card)] p-3.5">
                <p className="text-[13px] font-semibold text-[var(--c-text-2)] mb-2.5">🛒 Offline</p>
                {offlineStores.length === 0 ? (
                  <p className="text-[13px] text-[var(--c-text-3)]">ยังไม่มีข้อมูล</p>
                ) : (
                  <div className="space-y-2.5">
                    {offlineStores.map((e) => (
                      <div key={e.id}>
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] font-medium" style={{ color: getStoreColor(e.store) }}>
                            {e.store}
                          </span>
                          <span className="text-[14px] font-semibold text-[var(--c-text)]">
                            ฿{e.price.toLocaleString()}
                          </span>
                        </div>
                        {e.qty && e.qty > 1 && (
                          <p className="text-[11px] text-[var(--c-text-3)] text-right">
                            ฿{fmtUnit(unitPrice(e))}/{selectedProduct.unit} × {e.qty}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-2xl border border-[var(--c-sep)] bg-[var(--c-card)] p-3.5">
                <p className="text-[13px] font-semibold text-[var(--c-text-2)] mb-2.5">📱 Online</p>
                {onlineStores.length === 0 ? (
                  <p className="text-[13px] text-[var(--c-text-3)]">ยังไม่มีข้อมูล</p>
                ) : (
                  <div className="space-y-2.5">
                    {onlineStores.map((e) => (
                      <div key={e.id}>
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] font-medium" style={{ color: getStoreColor(e.store) }}>
                            {e.store}
                          </span>
                          <span className="text-[14px] font-semibold text-[var(--c-text)]">
                            ฿{e.price.toLocaleString()}
                          </span>
                        </div>
                        {e.qty && e.qty > 1 && (
                          <p className="text-[11px] text-[var(--c-text-3)] text-right">
                            ฿{fmtUnit(unitPrice(e))}/{selectedProduct.unit} × {e.qty}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>)}

          {/* Price History */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[18px] font-semibold text-[var(--c-text)]">ประวัติราคา</h3>
              <span className="text-[12px] text-[var(--c-text-3)]">{entries.length} รายการ</span>
            </div>
            {entries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--c-sep)] p-6 text-center">
                <p className="text-[14px] text-[var(--c-text-3)]">ยังไม่มีประวัติราคา</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {entries.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-xl bg-[var(--c-card)] border border-[var(--c-sep)] px-3.5 py-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-semibold text-[var(--c-text)]">
                          ฿{e.price.toLocaleString()}
                        </span>
                        {e.qty && e.qty > 1 && (
                          <span className="text-[12px] text-[var(--c-accent)] font-medium">
                            ÷{e.qty} = ฿{fmtUnit(unitPrice(e))}
                          </span>
                        )}
                        <span
                          className="text-[13px] font-medium px-1.5 py-0.5 rounded-md"
                          style={{ color: getStoreColor(e.store), backgroundColor: getStoreColor(e.store) + "18" }}
                        >
                          {e.store}
                        </span>
                        <span className="text-[11px] text-[var(--c-text-3)] px-1.5 py-0.5 rounded bg-[var(--c-fill-3)]">
                          {e.channel === "online" ? "online" : "offline"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[12px] text-[var(--c-text-3)]">{formatThaiDate(e.date)}</span>
                        {e.note && <span className="text-[12px] text-[var(--c-text-2)]">· {e.note}</span>}
                        {e.url && (
                          <a
                            href={e.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(ev) => ev.stopPropagation()}
                            className="text-[12px] text-[var(--c-accent)] underline underline-offset-2"
                          >
                            ดูลิงค์
                          </a>
                        )}
                      </div>
                    </div>
                    {e.url && (
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--c-fill-2)] transition-colors shrink-0"
                      >
                        <svg className="w-4 h-4 text-[var(--c-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    <button
                      onClick={() => setEditEntryId(e.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--c-fill-2)] transition-colors shrink-0"
                    >
                      <svg className="w-3.5 h-3.5 text-[var(--c-text-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deletePriceEntry(e.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <svg className="w-3.5 h-3.5 text-[var(--c-text-3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Price Button */}
          <button
            onClick={() => setShowAddPrice(true)}
            className="w-full py-3 rounded-2xl bg-[var(--c-accent)] text-white text-[15px] font-semibold"
          >
            + เพิ่มราคาใหม่
          </button>

          {/* Add Price Modal */}
          {showAddPrice && (
            <AddPriceModal
              productId={selectedProduct.id}
              onSave={addPriceEntry}
              onClose={() => setShowAddPrice(false)}
            />
          )}
        </div>
      </MainNavigationShell>
    );
  }

  // ─── Product List View ───
  return (
    <MainNavigationShell>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-[24px] md:text-[32px] font-bold text-[var(--c-text)]">
              ติดตามราคาของใช้ในบ้าน
            </h1>
            <p className="text-[16px] text-[var(--c-text-2)]">Price Tracker</p>
          </div>
          <button
            onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--c-accent)] text-white text-[14px] font-semibold shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่ม
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--c-text-3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--c-input)] text-[var(--c-text)] text-[16px] placeholder:text-[var(--c-text-3)] border-none outline-none"
          />
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none -mx-4 px-4">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = cat.id === "all" ? data.products.length : data.products.filter((p) => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-[var(--c-accent)] text-white"
                    : "bg-[var(--c-fill-3)] text-[var(--c-text-2)] hover:bg-[var(--c-fill-2)]"
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
                {count > 0 && (
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20" : "bg-[var(--c-fill)]"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Saving indicator */}
        {saving && (
          <div className="flex items-center gap-2 mb-3 text-[13px] text-[var(--c-text-3)]">
            <div className="w-3 h-3 border-2 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
            กำลังบันทึก...
          </div>
        )}

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--c-sep)] bg-[var(--c-card-alt)] p-8 text-center">
            {data.products.length === 0 ? (
              <>
                <p className="text-3xl mb-3">🏷️</p>
                <h2 className="text-[18px] font-semibold text-[var(--c-text)] mb-1">ยังไม่มีสินค้า</h2>
                <p className="text-[14px] text-[var(--c-text-3)] mb-4">
                  เริ่มเพิ่มสินค้าที่ต้องการติดตามราคา
                </p>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="px-5 py-2.5 rounded-xl bg-[var(--c-accent)] text-white text-[14px] font-semibold"
                >
                  + เพิ่มสินค้าแรก
                </button>
              </>
            ) : (
              <>
                <p className="text-[14px] text-[var(--c-text-3)]">ไม่พบสินค้าในหมวดนี้</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map((product) => {
              const cheapest = getCheapest(product.id);
              const stores = getUniqueStores(product.id);
              const catInfo = CATEGORIES.find((c) => c.id === product.category);

              return (
                <button
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  className="text-left rounded-2xl border border-[var(--c-sep)] bg-[var(--c-card)] p-3.5 transition-all hover:border-[var(--c-accent)]/40 active:scale-[0.98]"
                >
                  {/* Image */}
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt=""
                      className="w-full h-24 md:h-28 rounded-xl object-cover bg-[var(--c-fill-3)] mb-2.5"
                    />
                  ) : (
                    <div className="w-full h-24 md:h-28 rounded-xl bg-[var(--c-fill-3)] flex items-center justify-center text-3xl mb-2.5">
                      {catInfo?.emoji || "📦"}
                    </div>
                  )}

                  {/* Name */}
                  <p className="text-[15px] font-semibold text-[var(--c-text)] leading-snug line-clamp-2 mb-1">
                    {product.name}
                  </p>

                  {/* Category */}
                  <p className="text-[12px] text-[var(--c-text-3)] mb-2">
                    {catInfo?.emoji} {catInfo?.label}
                  </p>

                  {/* Cheapest */}
                  {cheapest ? (
                    <div className="mb-2">
                      <p className="text-[13px] font-semibold" style={{ color: getStoreColor(cheapest.store) }}>
                        ฿{cheapest.price.toLocaleString()} {cheapest.store}
                      </p>
                      {cheapest.qty && cheapest.qty > 1 && (
                        <p className="text-[11px] text-[var(--c-text-2)]">
                          = ฿{fmtUnit(unitPrice(cheapest))}/{product.unit}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[var(--c-text-3)] mb-2">ยังไม่มีราคา</p>
                  )}

                  {/* Store badges */}
                  {stores.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {stores.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-[11px] font-medium px-1.5 py-0.5 rounded-md"
                          style={{ color: getStoreColor(s), backgroundColor: getStoreColor(s) + "18" }}
                        >
                          {s}
                        </span>
                      ))}
                      {stores.length > 3 && (
                        <span className="text-[11px] text-[var(--c-text-3)]">+{stores.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Add Product Modal */}
        {showAddProduct && (
          <AddProductModal
            onSave={addProduct}
            onClose={() => setShowAddProduct(false)}
          />
        )}
      </div>
    </MainNavigationShell>
  );
}

// ─── Add Product Modal ───
function AddProductModal({
  onSave,
  onClose,
}: {
  onSave: (product: Omit<Product, "id" | "createdAt">, initialEntry?: { price: number; store: string; channel: "online" | "offline" }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("household");
  const [unit, setUnit] = useState("ชิ้น");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [store, setStore] = useState("Makro");
  const [channel, setChannel] = useState<"online" | "offline">("offline");
  const [customStore, setCustomStore] = useState("");
  const [useCustomStore, setUseCustomStore] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    const finalStore = useCustomStore ? customStore.trim() : store;
    onSave(
      { name: name.trim(), category, unit, image: image.trim() || undefined },
      price ? { price: Number(price), store: finalStore, channel } : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[var(--c-overlay)]" onClick={onClose} />
      <div className="relative bg-[var(--c-card)] rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[var(--c-card)] border-b border-[var(--c-sep)] px-5 py-3.5 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-[17px] font-semibold text-[var(--c-text)]">เพิ่มสินค้า</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--c-fill-3)] flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--c-text-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">ชื่อสินค้า *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น นมผง S-26 Gold 600g"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-input)] text-[var(--c-text)] text-[15px] placeholder:text-[var(--c-text-3)] outline-none"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">หมวดหมู่</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id as ProductCategory)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    category === cat.id
                      ? "bg-[var(--c-accent)] text-white"
                      : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unit */}
          <div>
            <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">หน่วย</label>
            <div className="flex flex-wrap gap-2">
              {UNITS.map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    unit === u
                      ? "bg-[var(--c-accent)] text-white"
                      : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">URL รูปภาพ (ไม่บังคับ)</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-input)] text-[var(--c-text)] text-[15px] placeholder:text-[var(--c-text-3)] outline-none"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--c-sep)] pt-4">
            <p className="text-[14px] font-semibold text-[var(--c-text)] mb-3">ราคาเริ่มต้น (ไม่บังคับ)</p>

            {/* Price */}
            <div className="mb-3">
              <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">ราคา (บาท)</label>
              <input
                type="number"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-input)] text-[var(--c-text)] text-[15px] placeholder:text-[var(--c-text-3)] outline-none"
              />
            </div>

            {/* Store */}
            <div className="mb-3">
              <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">ร้านค้า</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {STORES.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => { setStore(s.name); setChannel(s.channel); setUseCustomStore(false); }}
                    className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                      !useCustomStore && store === s.name
                        ? "text-white"
                        : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                    }`}
                    style={!useCustomStore && store === s.name ? { backgroundColor: s.color } : {}}
                  >
                    {s.name}
                  </button>
                ))}
                <button
                  onClick={() => setUseCustomStore(true)}
                  className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    useCustomStore
                      ? "bg-[var(--c-accent)] text-white"
                      : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                  }`}
                >
                  + พิมพ์เอง
                </button>
              </div>
              {useCustomStore && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customStore}
                    onChange={(e) => setCustomStore(e.target.value)}
                    placeholder="ชื่อร้าน"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-input)] text-[var(--c-text)] text-[15px] placeholder:text-[var(--c-text-3)] outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChannel("offline")}
                      className={`flex-1 py-2 rounded-xl text-[13px] font-medium ${
                        channel === "offline" ? "bg-[var(--c-accent)] text-white" : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                      }`}
                    >
                      🛒 Offline
                    </button>
                    <button
                      onClick={() => setChannel("online")}
                      className={`flex-1 py-2 rounded-xl text-[13px] font-medium ${
                        channel === "online" ? "bg-[var(--c-accent)] text-white" : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                      }`}
                    >
                      📱 Online
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-3 rounded-2xl bg-[var(--c-accent)] text-white text-[15px] font-semibold disabled:opacity-40"
          >
            เพิ่มสินค้า
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Price Modal ───
function AddPriceModal({
  productId,
  onSave,
  onClose,
}: {
  productId: string;
  onSave: (entry: Omit<PriceEntry, "id">) => void;
  onClose: () => void;
}) {
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [store, setStore] = useState("Makro");
  const [channel, setChannel] = useState<"online" | "offline">("offline");
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [customStore, setCustomStore] = useState("");
  const [useCustomStore, setUseCustomStore] = useState(false);

  const priceNum = Number(price) || 0;
  const qtyNum = Number(qty) || 0;
  const perUnit = qtyNum > 1 ? priceNum / qtyNum : 0;

  const handleSubmit = () => {
    if (!price || priceNum <= 0) return;
    const finalStore = useCustomStore ? customStore.trim() : store;
    if (!finalStore) return;
    onSave({
      productId,
      price: priceNum,
      qty: qtyNum > 0 ? qtyNum : undefined,
      store: finalStore,
      channel,
      date,
      note: note.trim() || undefined,
      url: url.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[var(--c-overlay)]" onClick={onClose} />
      <div className="relative bg-[var(--c-card)] rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[var(--c-card)] border-b border-[var(--c-sep)] px-5 py-3.5 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-[17px] font-semibold text-[var(--c-text)]">เพิ่มราคา</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--c-fill-3)] flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--c-text-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Price + Qty */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">ราคา (บาท) *</label>
              <input
                type="number"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-input)] text-[var(--c-text)] text-[18px] font-semibold placeholder:text-[var(--c-text-3)] outline-none"
                autoFocus
              />
            </div>
            <div className="w-24">
              <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">จำนวน</label>
              <input
                type="number"
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-input)] text-[var(--c-text)] text-[18px] font-semibold placeholder:text-[var(--c-text-3)] outline-none text-center"
              />
            </div>
          </div>
          {perUnit > 0 && (
            <div className="rounded-xl bg-[var(--c-accent-bg)] px-3.5 py-2.5 -mt-2">
              <span className="text-[14px] font-semibold text-[var(--c-accent)]">
                = ฿{fmtUnit(perUnit)} ต่อชิ้น
              </span>
              <span className="text-[12px] text-[var(--c-text-3)] ml-2">
                (฿{priceNum.toLocaleString()} ÷ {qtyNum})
              </span>
            </div>
          )}

          {/* Store */}
          <div>
            <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">ร้านค้า *</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {STORES.map((s) => (
                <button
                  key={s.name}
                  onClick={() => { setStore(s.name); setChannel(s.channel); setUseCustomStore(false); }}
                  className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    !useCustomStore && store === s.name
                      ? "text-white"
                      : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                  }`}
                  style={!useCustomStore && store === s.name ? { backgroundColor: s.color } : {}}
                >
                  {s.name}
                </button>
              ))}
              <button
                onClick={() => setUseCustomStore(true)}
                className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  useCustomStore
                    ? "bg-[var(--c-accent)] text-white"
                    : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                }`}
              >
                + พิมพ์เอง
              </button>
            </div>
            {useCustomStore && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customStore}
                  onChange={(e) => setCustomStore(e.target.value)}
                  placeholder="ชื่อร้าน"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-input)] text-[var(--c-text)] text-[15px] placeholder:text-[var(--c-text-3)] outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setChannel("offline")}
                    className={`flex-1 py-2 rounded-xl text-[13px] font-medium ${
                      channel === "offline" ? "bg-[var(--c-accent)] text-white" : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                    }`}
                  >
                    🛒 Offline
                  </button>
                  <button
                    onClick={() => setChannel("online")}
                    className={`flex-1 py-2 rounded-xl text-[13px] font-medium ${
                      channel === "online" ? "bg-[var(--c-accent)] text-white" : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                    }`}
                  >
                    📱 Online
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">วันที่</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-input)] text-[var(--c-text)] text-[15px] outline-none"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">หมายเหตุ</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น โปรลด 20%, 1 แถม 1"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-input)] text-[var(--c-text)] text-[15px] placeholder:text-[var(--c-text-3)] outline-none"
            />
          </div>

          {/* URL */}
          <div>
            <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">ลิงค์สินค้า</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="วางลิงค์จาก Shopee, Lazada, Makro..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-input)] text-[var(--c-text)] text-[15px] placeholder:text-[var(--c-text-3)] outline-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!price || Number(price) <= 0}
            className="w-full py-3 rounded-2xl bg-[var(--c-accent)] text-white text-[15px] font-semibold disabled:opacity-40"
          >
            บันทึกราคา
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Product Modal ───
function EditProductModal({
  product,
  onSave,
  onClose,
}: {
  product: Product;
  onSave: (updates: Partial<Pick<Product, "name" | "category" | "unit" | "image">>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState<ProductCategory>(product.category);
  const [unit, setUnit] = useState(product.unit);
  const [image, setImage] = useState(product.image || "");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[var(--c-overlay)]" onClick={onClose} />
      <div className="relative bg-[var(--c-card)] rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[var(--c-card)] border-b border-[var(--c-sep)] px-5 py-3.5 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-[17px] font-semibold text-[var(--c-text)]">แก้ไขสินค้า</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--c-fill-3)] flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--c-text-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">ชื่อสินค้า</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-input)] text-[var(--c-text)] text-[15px] outline-none"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">หมวดหมู่</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id as ProductCategory)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    category === cat.id ? "bg-[var(--c-accent)] text-white" : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">หน่วย</label>
            <div className="flex flex-wrap gap-2">
              {UNITS.map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    unit === u ? "bg-[var(--c-accent)] text-white" : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--c-text-2)] mb-1.5 block">URL รูปภาพ</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-input)] text-[var(--c-text)] text-[15px] placeholder:text-[var(--c-text-3)] outline-none"
            />
          </div>
          <button
            onClick={() => onSave({ name: name.trim(), category, unit, image: image.trim() || undefined })}
            disabled={!name.trim()}
            className="w-full py-3 rounded-2xl bg-[var(--c-accent)] text-white text-[15px] font-semibold disabled:opacity-40"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
