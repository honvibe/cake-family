"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import MainNavigationShell from "@/components/main-navigation-shell";

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

type DriveType = "HDD" | "SSD" | "USB" | "SD" | "NVMe";
type SizeUnit = "GB" | "TB";
type FolderSizeUnit = "MB" | "GB" | "TB";
type TabId = "search" | "drives" | "folders" | "import" | "duplicates";

interface Drive {
  id: string;
  name: string;
  type: DriveType;
  brand: string;
  size: number;
  sizeUnit: SizeUnit;
  color: string;
  createdAt: string;
}

interface FileItem {
  name: string;
  size: string;
  type: string;
}

interface FolderEntry {
  id: string;
  driveId: string;
  name: string;
  size: string;
  sizeUnit: FolderSizeUnit;
  description: string;
  files?: FileItem[];
  createdAt: string;
}

const DRIVE_TYPES: { value: DriveType; label: string }[] = [
  { value: "HDD", label: "HDD" },
  { value: "SSD", label: "SSD" },
  { value: "USB", label: "USB" },
  { value: "SD", label: "SD" },
  { value: "NVMe", label: "NVMe" },
];

const DRIVE_COLORS: { value: string; label: string; dot: string }[] = [
  { value: "black", label: "ดำ", dot: "bg-gray-800" },
  { value: "silver", label: "เงิน", dot: "bg-gray-400" },
  { value: "white", label: "ขาว", dot: "bg-white border border-gray-300" },
  { value: "blue", label: "น้ำเงิน", dot: "bg-blue-500" },
  { value: "red", label: "แดง", dot: "bg-red-500" },
  { value: "green", label: "เขียว", dot: "bg-green-500" },
  { value: "orange", label: "ส้ม", dot: "bg-orange-500" },
  { value: "pink", label: "ชมพู", dot: "bg-pink-400" },
];

const TYPE_ICON: Record<DriveType, string> = {
  HDD: "💿",
  SSD: "⚡",
  USB: "🔌",
  SD: "💳",
  NVMe: "🚀",
};

export default function DriveInfoPage() {
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState(false);

  const [drives, setDrives] = useState<Drive[]>([]);
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("search");
  const [searchQuery, setSearchQuery] = useState("");

  const [dName, setDName] = useState("");
  const [dType, setDType] = useState<DriveType>("HDD");
  const [dBrand, setDBrand] = useState("");
  const [dSize, setDSize] = useState("");
  const [dSizeUnit, setDSizeUnit] = useState<SizeUnit>("TB");
  const [dColor, setDColor] = useState("black");

  const [fName, setFName] = useState("");
  const [fSize, setFSize] = useState("");
  const [fSizeUnit, setFSizeUnit] = useState<FolderSizeUnit>("GB");
  const [fDesc, setFDesc] = useState("");
  const [fDriveId, setFDriveId] = useState("");

  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [detailDriveId, setDetailDriveId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Import
  const [importText, setImportText] = useState("");
  const [importDriveId, setImportDriveId] = useState("");

  useEffect(() => {
    if (getAuthCookie()) {
      setAuthed(true);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/drive-info")
      .then((r) => r.json())
      .then((d) => {
        setDrives(d.drives || []);
        setFolders(d.folders || []);
      })
      .finally(() => setLoading(false));
  }, [authed]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    const hash = await hashPassphrase(passInput);
    if (hash === PASS_HASH) {
      setAuthCookie();
      setAuthed(true);
      setLoading(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  }

  const driveMap = useMemo(() => {
    const m: Record<string, Drive> = {};
    drives.forEach((d) => (m[d.id] = d));
    return m;
  }, [drives]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { drives, folders, fileHits: [] as { file: FileItem; folder: FolderEntry; drive: Drive }[] };
    const q = searchQuery.toLowerCase();
    const matchedDrives = drives.filter(
      (d) => d.name.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q) || d.type.toLowerCase().includes(q)
    );
    const matchedFolders = folders.filter(
      (f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || (driveMap[f.driveId]?.name || "").toLowerCase().includes(q)
    );
    // Search inside files
    const fileHits: { file: FileItem; folder: FolderEntry; drive: Drive }[] = [];
    folders.forEach((f) => {
      if (!f.files) return;
      const drive = driveMap[f.driveId];
      if (!drive) return;
      f.files.forEach((fi) => {
        if (fi.name.toLowerCase().includes(q) || fi.type.toLowerCase().includes(q)) {
          fileHits.push({ file: fi, folder: f, drive });
        }
      });
    });
    return { drives: matchedDrives, folders: matchedFolders, fileHits };
  }, [searchQuery, drives, folders, driveMap]);

  // Drive capacity stats
  const driveStats = useMemo(() => {
    const stats: Record<string, { totalMB: number; usedMB: number; freeMB: number }> = {};
    drives.forEach((d) => {
      const totalMB = d.sizeUnit === "TB" ? d.size * 1024 * 1024 : d.size * 1024;
      stats[d.id] = { totalMB, usedMB: 0, freeMB: totalMB };
    });
    folders.forEach((f) => {
      if (!stats[f.driveId]) return;
      const sz = parseFloat(f.size) || 0;
      let mb = sz;
      if (f.sizeUnit === "GB") mb = sz * 1024;
      else if (f.sizeUnit === "TB") mb = sz * 1024 * 1024;
      stats[f.driveId].usedMB += mb;
    });
    Object.values(stats).forEach((s) => { s.freeMB = s.totalMB - s.usedMB; });
    return stats;
  }, [drives, folders]);

  function formatMB(mb: number): string {
    if (mb >= 1024 * 1024) return `${(mb / 1024 / 1024).toFixed(1)} TB`;
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(0)} MB`;
  }

  // Delete a specific file from a folder's files array
  const [confirmDupDelete, setConfirmDupDelete] = useState<string | null>(null); // "folderId|fileName"
  function handleDupFileDelete(folderId: string, fileName: string, fileSize: string) {
    const confirmKey = `${folderId}|${fileName}|${fileSize}`;
    if (confirmDupDelete !== confirmKey) {
      setConfirmDupDelete(confirmKey);
      return;
    }
    // Find folder and remove the file
    const folder = folders.find((f) => f.id === folderId);
    if (!folder || !folder.files) return;
    const updatedFiles = folder.files.filter(
      (fi) => !(fi.name === fileName && fi.size === fileSize)
    );
    apiPost({
      action: "editFolder",
      id: folderId,
      updates: { files: updatedFiles },
    });
    setConfirmDupDelete(null);
  }

  // Duplicate file detection — cross-drive only
  interface DuplicateGroup {
    key: string;
    fileName: string;
    fileSize: string;
    fileType: string;
    category: string;
    locations: { folder: FolderEntry; drive: Drive }[];
    recommendation: { deleteFrom: string; reason: string } | null;
  }

  const FILE_CATEGORIES: { id: string; label: string; match: string[] }[] = [
    { id: "all", label: "ทั้งหมด", match: [] },
    { id: "design", label: "🎨 Design", match: ["Design"] },
    { id: "video", label: "🎬 Video", match: ["Video"] },
    { id: "image", label: "🖼️ Image", match: ["Image"] },
    { id: "audio", label: "🔊 Audio", match: ["Audio"] },
    { id: "document", label: "📄 Doc", match: ["Document", "Presentation", "Spreadsheet", "Text"] },
    { id: "archive", label: "📦 Archive", match: ["Archive", "WP Backup", "Installer"] },
    { id: "code", label: "💻 Code", match: ["Code"] },
    { id: "comic", label: "📚 Comic", match: ["Comic", "E-Book"] },
    { id: "font", label: "🔤 Font", match: ["Font"] },
    { id: "other", label: "❓ Other", match: [] },
  ];

  const [dupFilter, setDupFilter] = useState("all");
  const [dupSort, setDupSort] = useState<"count" | "name" | "type">("count");
  const [searchTypeFilter, setSearchTypeFilter] = useState("all");
  const [searchSort, setSearchSort] = useState<"default" | "name" | "type">("default");

  function getFileCategory(type: string): string {
    const t = type.toLowerCase();
    for (const cat of FILE_CATEGORIES) {
      if (cat.id === "all" || cat.id === "other") continue;
      if (cat.match.some((m) => t.includes(m.toLowerCase()))) return cat.id;
    }
    return "other";
  }

  const duplicates = useMemo(() => {
    // Group files by name+size+type
    const fileMap = new Map<string, { file: FileItem; folder: FolderEntry; drive: Drive }[]>();
    folders.forEach((f) => {
      if (!f.files) return;
      const drive = driveMap[f.driveId];
      if (!drive) return;
      f.files.forEach((fi) => {
        const key = `${fi.name.toLowerCase()}|${fi.size.toLowerCase()}|${fi.type.toLowerCase()}`;
        if (!fileMap.has(key)) fileMap.set(key, []);
        fileMap.get(key)!.push({ file: fi, folder: f, drive });
      });
    });

    // Filter: only cross-drive duplicates
    const groups: DuplicateGroup[] = [];
    fileMap.forEach((locs, key) => {
      if (locs.length < 2) return;
      const uniqueDriveIds = [...new Set(locs.map((l) => l.drive.id))];
      if (uniqueDriveIds.length < 2) return; // skip same-drive dupes
      const first = locs[0].file;
      // Recommend: delete from drive with less free space
      let minFreeId = uniqueDriveIds[0];
      uniqueDriveIds.forEach((id) => {
        if ((driveStats[id]?.freeMB || 0) < (driveStats[minFreeId]?.freeMB || 0)) minFreeId = id;
      });
      const minDrive = driveMap[minFreeId];
      groups.push({
        key,
        fileName: first.name,
        fileSize: first.size,
        fileType: first.type,
        category: getFileCategory(first.type),
        locations: locs.map((l) => ({ folder: l.folder, drive: l.drive })),
        recommendation: minDrive ? { deleteFrom: minDrive.name, reason: `${minDrive.name} เหลือที่น้อยกว่า` } : null,
      });
    });

    return groups;
  }, [drives, folders, driveMap]);

  const filteredDuplicates = useMemo(() => {
    let list = dupFilter === "all" ? duplicates : duplicates.filter((g) => g.category === dupFilter);
    if (dupSort === "count") list = [...list].sort((a, b) => b.locations.length - a.locations.length);
    else if (dupSort === "name") list = [...list].sort((a, b) => a.fileName.localeCompare(b.fileName));
    else if (dupSort === "type") list = [...list].sort((a, b) => a.fileType.localeCompare(b.fileType) || a.fileName.localeCompare(b.fileName));
    return list;
  }, [duplicates, dupFilter, dupSort]);

  // Count per category for filter badges
  const dupCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: duplicates.length };
    duplicates.forEach((g) => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    return counts;
  }, [duplicates]);

  // Search file hits — filtered & sorted
  const filteredFileHits = useMemo(() => {
    let hits = searchResults.fileHits;
    if (searchTypeFilter !== "all") {
      hits = hits.filter((h) => getFileCategory(h.file.type) === searchTypeFilter);
    }
    if (searchSort === "name") hits = [...hits].sort((a, b) => a.file.name.localeCompare(b.file.name));
    else if (searchSort === "type") hits = [...hits].sort((a, b) => a.file.type.localeCompare(b.file.type) || a.file.name.localeCompare(b.file.name));
    return hits;
  }, [searchResults.fileHits, searchTypeFilter, searchSort]);

  // Search folder hits — filtered
  const filteredFolderHits = useMemo(() => {
    return searchResults.folders.filter((f) => !searchResults.drives.some((d) => d.id === f.driveId));
  }, [searchResults]);

  // File type counts in search results
  const searchTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: searchResults.fileHits.length };
    searchResults.fileHits.forEach((h) => {
      const cat = getFileCategory(h.file.type);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [searchResults.fileHits]);

  async function apiPost(body: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/drive-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.data) {
        setDrives(json.data.drives || []);
        setFolders(json.data.folders || []);
      }
      return json;
    } finally {
      setSaving(false);
    }
  }

  function addDrive() {
    if (!dName.trim() || !dBrand.trim() || !dSize) return;
    apiPost({ action: "addDrive", name: dName.trim(), type: dType, brand: dBrand.trim(), size: Number(dSize), sizeUnit: dSizeUnit, color: dColor })
      .then(() => { setDName(""); setDBrand(""); setDSize(""); });
  }

  function addFolder() {
    if (!fName.trim() || !fDriveId) return;
    apiPost({ action: "addFolder", driveId: fDriveId, name: fName.trim(), size: fSize, sizeUnit: fSizeUnit, description: fDesc.trim() })
      .then(() => { setFName(""); setFSize(""); setFDesc(""); });
  }

  function handleDelete(type: "Drive" | "Folder", id: string) {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    apiPost({ action: type === "Drive" ? "deleteDrive" : "deleteFolder", id });
    setConfirmDelete(null);
  }

  function parseImportText(text: string): { name: string; description: string }[] {
    return text
      .split("\n")
      .map((line) => {
        // Strip tree chars: ├── └── │ ─ , bullets: - * •, and leading whitespace
        let clean = line
          .replace(/[├└│─┬┤┌┐┘┼]/g, "")
          .replace(/^[\s\-\*•]+/, "")
          .trim();
        if (!clean || clean === "/" || clean === "\\") return null;
        // Remove trailing /
        clean = clean.replace(/\/+$/, "").trim();
        if (!clean) return null;
        // Check for description after — or - or :
        const sepMatch = clean.match(/^(.+?)\s*[—\-:]\s+(.+)$/);
        if (sepMatch) {
          return { name: sepMatch[1].trim(), description: sepMatch[2].trim() };
        }
        return { name: clean, description: "" };
      })
      .filter((x): x is { name: string; description: string } => x !== null);
  }

  const parsedImport = useMemo(() => parseImportText(importText), [importText]);

  function parseMdInventory(md: string): { name: string; size: string; sizeUnit: string; description: string }[] {
    const results: { name: string; size: string; sizeUnit: string; description: string }[] = [];
    // Match table rows: | โฟลเดอร์ | ขนาด | จำนวนไฟล์ |
    const tableRegex = /\|\s*([^|]+?)\s*\|\s*([\d,.]+)\s*(KB|MB|GB|TB)\s*\|\s*([\d,]+)\s*\|/gi;
    let match;
    while ((match = tableRegex.exec(md)) !== null) {
      const name = match[1].replace(/📁\s*/, "").trim();
      if (!name || name === "โฟลเดอร์" || name === "---" || name === "(root)") continue;
      const size = match[2].replace(/,/g, "");
      const unit = match[3].toUpperCase();
      const fileCount = match[4].replace(/,/g, "");
      results.push({
        name,
        size,
        sizeUnit: unit === "KB" ? "MB" : unit as string,
        description: `${fileCount} ไฟล์`,
      });
    }
    // Fallback: match ## 📁 headers if no table found
    if (results.length === 0) {
      const headerRegex = /^##\s*📁?\s*(.+)$/gm;
      while ((match = headerRegex.exec(md)) !== null) {
        const name = match[1].trim();
        if (name && name !== "(root)" && !name.startsWith("📁 (root)")) {
          // Try to extract size from the next line
          const afterHeader = md.slice(match.index + match[0].length, match.index + match[0].length + 200);
          const sizeMatch = afterHeader.match(/([\d,.]+)\s*(KB|MB|GB|TB)/i);
          results.push({
            name,
            size: sizeMatch ? sizeMatch[1].replace(/,/g, "") : "",
            sizeUnit: sizeMatch ? sizeMatch[2].toUpperCase() : "GB",
            description: "",
          });
        }
      }
    }
    return results;
  }

  function handleMdUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const md = e.target?.result as string;
      const parsed = parseMdInventory(md);
      if (parsed.length > 0) {
        // Convert to import text format for preview
        const lines = parsed.map((p) =>
          `${p.name}${p.size ? ` [${p.size}${p.sizeUnit}]` : ""}${p.description ? ` — ${p.description}` : ""}`
        ).join("\n");
        setImportText(lines);
        setMdParsed(parsed);
      }
    };
    reader.readAsText(file);
  }

  const [mdParsed, setMdParsed] = useState<{ name: string; size: string; sizeUnit: string; description: string }[] | null>(null);

  function doMdImport() {
    if (!importDriveId || !mdParsed || mdParsed.length === 0) return;
    apiPost({
      action: "bulkAddFolders",
      driveId: importDriveId,
      items: mdParsed.map((p) => ({
        name: p.name,
        size: p.size,
        sizeUnit: p.sizeUnit === "KB" ? "MB" : p.sizeUnit,
        description: p.description,
      })),
    }).then(() => {
      setImportText("");
      setMdParsed(null);
    });
  }

  function doImport() {
    if (!importDriveId || parsedImport.length === 0) return;
    apiPost({
      action: "bulkAddFolders",
      driveId: importDriveId,
      items: parsedImport.map((p) => ({ name: p.name, description: p.description })),
    }).then(() => {
      setImportText("");
    });
  }

  const colorDot = (color: string) => DRIVE_COLORS.find((c) => c.value === color)?.dot || "bg-gray-500";

  const TABS: { id: TabId; label: string }[] = [
    { id: "search", label: "🔍 ค้นหา" },
    { id: "duplicates", label: "🔁 ซ้ำ" },
    { id: "drives", label: "💾 Drive" },
    { id: "folders", label: "📁 Folder" },
    { id: "import", label: "📋 Import" },
  ];

  if (!authed) {
    return (
      <MainNavigationShell title="Drive Info">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-5xl mb-4">🔒</div>
          <div className="text-[17px] font-semibold text-[var(--c-text)] mb-1">Drive Info</div>
          <div className="text-[14px] text-[var(--c-text-3)] mb-5">ใส่ passphrase เพื่อเข้าถึง</div>
          <form onSubmit={handleLogin} className="w-full max-w-[280px] space-y-3">
            <input
              type="password"
              placeholder="Passphrase"
              value={passInput}
              onChange={(e) => { setPassInput(e.target.value); setPassError(false); }}
              className={`w-full px-4 py-3 bg-[var(--c-input)] rounded-xl text-[16px] text-[var(--c-text)] text-center placeholder:text-[var(--c-text-3)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]/50 ${passError ? "ring-2 ring-red-500" : ""}`}
              autoFocus
            />
            {passError && <div className="text-red-400 text-[13px] text-center">ผิดค่ะ ลองใหม่</div>}
            <button
              type="submit"
              className="w-full py-3 bg-[var(--c-accent)] text-white rounded-xl font-medium text-[16px]"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </MainNavigationShell>
    );
  }

  if (loading) {
    return (
      <MainNavigationShell title="Drive Info">
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      </MainNavigationShell>
    );
  }

  const DelBtn = ({ id, type }: { id: string; type: "Drive" | "Folder" }) => (
    <button
      onClick={() => handleDelete(type, id)}
      className={`text-[13px] px-2.5 py-1 rounded-md shrink-0 transition-colors ${
        confirmDelete === id ? "bg-red-500 text-white" : "text-[var(--c-text-4)] hover:text-red-400"
      }`}
    >
      {confirmDelete === id ? "ยืนยัน?" : "ลบ"}
    </button>
  );

  return (
    <MainNavigationShell title="Drive Info">
      {/* Tab bar */}
      <div className="flex gap-0.5 mb-4 bg-[var(--c-fill-3)] rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setConfirmDelete(null); }}
            className={`flex-1 py-2 text-[15px] rounded-lg font-medium transition-all ${
              tab === t.id ? "bg-[var(--c-card)] text-[var(--c-text)] shadow-sm" : "text-[var(--c-text-2)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Search Tab ─── */}
      {tab === "search" && (
        <div>
          {/* Detail View — single drive */}
          {detailDriveId ? (() => {
            const dd = driveMap[detailDriveId];
            if (!dd) return null;
            const dfs = folders.filter((f) => f.driveId === detailDriveId);
            const totalFiles = dfs.reduce((n, f) => n + (f.files?.length || 0), 0);
            return (
              <div>
                {/* Back button */}
                <button
                  onClick={() => setDetailDriveId(null)}
                  className="flex items-center gap-1.5 text-[var(--c-accent)] text-[15px] font-medium mb-3 -ml-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  กลับ
                </button>

                {/* Drive header */}
                <div className="bg-[var(--c-card)] rounded-xl p-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{TYPE_ICON[dd.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[19px] text-[var(--c-text)] truncate">{dd.name}</div>
                      <div className="text-[14px] text-[var(--c-text-3)]">
                        {dd.brand} · {dd.size}{dd.sizeUnit} · {dd.type}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full shrink-0 ${colorDot(dd.color)}`} />
                  </div>
                  <div className="flex gap-4 mt-2 text-[13px] text-[var(--c-text-3)]">
                    <span>{dfs.length} folders</span>
                    {totalFiles > 0 && <span>{totalFiles} files</span>}
                  </div>
                </div>

                {/* Folders + files (collapsible) */}
                {dfs.length === 0 ? (
                  <div className="text-center py-8 text-[var(--c-text-3)] text-[15px] italic">ยังไม่มี folder</div>
                ) : (
                  <div className="space-y-2">
                    {dfs.map((f) => {
                      const isExpanded = expandedFolders.has(f.id);
                      const hasFiles = f.files && f.files.length > 0;
                      return (
                        <div key={f.id} className="bg-[var(--c-card)] rounded-xl p-3">
                          {/* Folder header — clickable to expand */}
                          <div
                            className={`flex items-center justify-between ${hasFiles ? "cursor-pointer" : ""}`}
                            onClick={() => {
                              if (!hasFiles) return;
                              setExpandedFolders((prev) => {
                                const next = new Set(prev);
                                if (next.has(f.id)) next.delete(f.id); else next.add(f.id);
                                return next;
                              });
                            }}
                          >
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              {hasFiles && (
                                <svg className={`w-4 h-4 shrink-0 text-[var(--c-text-3)] transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                              <span className="text-[16px]">📁</span>
                              <span className="font-medium text-[16px] text-[var(--c-text)] truncate">{f.name}</span>
                              {f.size && <span className="text-[var(--c-text-3)] text-[13px] shrink-0">{f.size}{f.sizeUnit}</span>}
                              {hasFiles && <span className="text-[var(--c-text-4)] text-[12px] shrink-0">({f.files!.length})</span>}
                            </div>
                            <DelBtn id={f.id} type="Folder" />
                          </div>
                          {f.description && (
                            <div className="text-[var(--c-text-4)] text-[13px] mt-0.5 ml-6">{f.description}</div>
                          )}
                          {/* Files — only when expanded */}
                          {isExpanded && hasFiles && (
                            <div className="mt-2 ml-6 space-y-0.5 max-h-[400px] overflow-y-auto">
                              {f.files!.map((fi, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-[13px] text-[var(--c-text-2)]">
                                  <span className="text-[11px]">📄</span>
                                  <span className="truncate">{fi.name}</span>
                                  {fi.size && <span className="text-[var(--c-text-4)] shrink-0">{fi.size}</span>}
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
            );
          })() : (
            /* Grid view — collapsed */
            <div>
              <div className="relative mb-3">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--c-text-3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="ค้นหา Drive, Folder, ไฟล์..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-9 py-3 bg-[var(--c-input)] rounded-xl text-[16px] text-[var(--c-text)] placeholder:text-[var(--c-text-3)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]/50"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-text-3)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Inline stats */}
              <div className="flex gap-4 mb-3 text-[14px] text-[var(--c-text-3)]">
                <span>{drives.length} drives</span>
                <span>{folders.length} folders</span>
                {searchQuery && (
                  <span className="text-[var(--c-accent)]">
                    พบ {searchResults.drives.length} drives · {searchResults.folders.length} folders{searchResults.fileHits.length > 0 ? ` · ${searchResults.fileHits.length} files` : ""}
                  </span>
                )}
              </div>

              {/* Drive cards — portrait grid 2 cols, collapsed (max 3 folders, no files) */}
              {searchResults.drives.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5">
                  {searchResults.drives.map((d) => {
                    const dfs = folders.filter((f) => f.driveId === d.id);
                    const show3 = dfs.slice(0, 3);
                    const moreCount = dfs.length - 3;
                    return (
                      <div
                        key={d.id}
                        onClick={() => setDetailDriveId(d.id)}
                        className="bg-[var(--c-card)] rounded-xl p-3.5 flex flex-col cursor-pointer hover:ring-2 hover:ring-[var(--c-accent)]/40 transition-all active:scale-[0.98]"
                      >
                        {/* Icon + color dot */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-3xl">{TYPE_ICON[d.type]}</span>
                          <div className={`w-3.5 h-3.5 rounded-full ${colorDot(d.color)}`} />
                        </div>
                        {/* Name */}
                        <div className="font-semibold text-[17px] text-[var(--c-text)] leading-tight truncate">{d.name}</div>
                        {/* Meta */}
                        <div className="text-[13px] text-[var(--c-text-3)] mt-0.5">
                          {d.brand} · {d.size}{d.sizeUnit}
                        </div>
                        <div className="text-[12px] text-[var(--c-text-4)] mt-0.5">
                          {dfs.length} folders
                        </div>
                        {/* Folders preview — max 3 */}
                        {dfs.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-[var(--c-sep)]/20 space-y-1 flex-1">
                            {show3.map((f) => (
                              <div key={f.id} className="flex items-center gap-1 text-[13px] leading-snug min-w-0">
                                <span className="shrink-0">📁</span>
                                <span className="text-[var(--c-text)] truncate">{f.name}</span>
                              </div>
                            ))}
                            {moreCount > 0 && (
                              <div className="text-[12px] text-[var(--c-accent)]">+{moreCount} more</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : drives.length === 0 ? (
                <div className="text-center py-8 text-[var(--c-text-3)] text-[15px]">
                  <div className="text-4xl mb-2">💾</div>
                  ยังไม่มี Drive — เพิ่มที่แท็บ &quot;Drive&quot;
                </div>
              ) : !searchQuery ? null : (
                <div className="text-center py-6 text-[var(--c-text-3)] text-[15px]">ไม่พบ Drive</div>
              )}

              {/* Folder-only search results */}
              {searchQuery && filteredFolderHits.length > 0 && (
                <div className="mt-3">
                  <div className="text-[13px] text-[var(--c-text-3)] uppercase tracking-wider mb-1.5">Folder ที่เจอ</div>
                  <div className="space-y-1.5">
                    {filteredFolderHits.map((f) => {
                      const drive = driveMap[f.driveId];
                      return (
                        <div
                          key={f.id}
                          onClick={() => drive && setDetailDriveId(drive.id)}
                          className="bg-[var(--c-card)] rounded-xl p-2.5 flex items-center justify-between text-[14px] cursor-pointer hover:ring-1 hover:ring-[var(--c-accent)]/30"
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                            <span>📁</span>
                            <span className="font-medium text-[var(--c-text)] truncate">{f.name}</span>
                            {f.size && <span className="text-[var(--c-text-3)]">{f.size}{f.sizeUnit}</span>}
                            {f.description && <span className="text-[var(--c-text-4)] truncate">— {f.description}</span>}
                            {drive && (
                              <span className="text-[var(--c-accent)] shrink-0 ml-1 text-[13px]">{TYPE_ICON[drive.type]} {drive.name}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* File search results with filter + sort */}
              {searchQuery && searchResults.fileHits.length > 0 && (
                <div className="mt-3">
                  <div className="text-[13px] text-[var(--c-text-3)] uppercase tracking-wider mb-2">ไฟล์ที่เจอ</div>

                  {/* Type filter chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {FILE_CATEGORIES.filter((c) => c.id === "all" || (searchTypeCounts[c.id] || 0) > 0).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSearchTypeFilter(cat.id)}
                        className={`px-2.5 py-1 rounded-full text-[12px] font-medium transition-all ${
                          searchTypeFilter === cat.id
                            ? "bg-[var(--c-accent)] text-white"
                            : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                        }`}
                      >
                        {cat.label}
                        {(searchTypeCounts[cat.id] || 0) > 0 && (
                          <span className={`ml-1 ${searchTypeFilter === cat.id ? "text-white/70" : "text-[var(--c-text-4)]"}`}>
                            {searchTypeCounts[cat.id]}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] text-[var(--c-text-3)]">เรียง:</span>
                    {([
                      { id: "default" as const, label: "ค่าเริ่มต้น" },
                      { id: "name" as const, label: "ชื่อ" },
                      { id: "type" as const, label: "ประเภท" },
                    ]).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSearchSort(s.id)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                          searchSort === s.id
                            ? "bg-[var(--c-accent)]/15 text-[var(--c-accent)]"
                            : "text-[var(--c-text-3)]"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                    <span className="text-[11px] text-[var(--c-text-4)] ml-auto">{filteredFileHits.length} ไฟล์</span>
                  </div>

                  <div className="space-y-1.5">
                    {filteredFileHits.slice(0, 50).map((hit, idx) => (
                      <div
                        key={idx}
                        onClick={() => setDetailDriveId(hit.drive.id)}
                        className="bg-[var(--c-card)] rounded-xl p-2.5 cursor-pointer hover:ring-1 hover:ring-[var(--c-accent)]/30"
                      >
                        <div className="flex items-center gap-1.5 text-[14px] min-w-0">
                          <span>📄</span>
                          <span className="font-medium text-[var(--c-text)] truncate">{hit.file.name}</span>
                          {hit.file.size && <span className="text-[var(--c-text-3)] text-[13px] shrink-0">{hit.file.size}</span>}
                          {hit.file.type && <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--c-fill-3)] text-[var(--c-text-4)] shrink-0">{hit.file.type}</span>}
                        </div>
                        <div className="text-[12px] text-[var(--c-text-4)] mt-0.5 ml-5">
                          {TYPE_ICON[hit.drive.type]} {hit.drive.name} → 📁 {hit.folder.name}
                        </div>
                      </div>
                    ))}
                    {filteredFileHits.length > 50 && (
                      <div className="text-[13px] text-[var(--c-text-3)] text-center py-1">
                        +{filteredFileHits.length - 50} ไฟล์อื่นๆ
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No results at all */}
              {searchQuery && searchResults.drives.length === 0 && searchResults.folders.length === 0 && searchResults.fileHits.length === 0 && (
                <div className="text-center py-6 text-[var(--c-text-3)] text-[15px]">ไม่พบผลลัพธ์</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Add Drive Tab ─── */}
      {tab === "drives" && (
        <div>
          <div className="bg-[var(--c-card)] rounded-xl p-4 mb-4">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="ชื่อ Drive *"
                value={dName}
                onChange={(e) => setDName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[var(--c-input)] rounded-xl text-[16px] text-[var(--c-text)] placeholder:text-[var(--c-text-3)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]/50"
              />

              <div className="flex flex-wrap gap-2">
                {DRIVE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setDType(t.value)}
                    className={`px-3 py-2 rounded-lg text-[14px] font-medium transition-all ${
                      dType === t.value ? "bg-[var(--c-accent)] text-white" : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                    }`}
                  >
                    {TYPE_ICON[t.value]} {t.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Brand * (WD, Seagate, Samsung...)"
                value={dBrand}
                onChange={(e) => setDBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[var(--c-input)] rounded-xl text-[16px] text-[var(--c-text)] placeholder:text-[var(--c-text-3)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]/50"
              />

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="ขนาด *"
                  value={dSize}
                  onChange={(e) => setDSize(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-[var(--c-input)] rounded-xl text-[16px] text-[var(--c-text)] placeholder:text-[var(--c-text-3)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]/50"
                />
                <div className="flex bg-[var(--c-fill-3)] rounded-lg overflow-hidden">
                  {(["GB", "TB"] as SizeUnit[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => setDSizeUnit(u)}
                      className={`px-4 py-2 text-[14px] font-medium transition-all ${
                        dSizeUnit === u ? "bg-[var(--c-accent)] text-white" : "text-[var(--c-text-2)]"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {DRIVE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setDColor(c.value)}
                    title={c.label}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      dColor === c.value ? "ring-2 ring-[var(--c-accent)] ring-offset-1 ring-offset-[var(--c-card)]" : ""
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full ${c.dot}`} />
                  </button>
                ))}
              </div>

              <button
                onClick={addDrive}
                disabled={saving || !dName.trim() || !dBrand.trim() || !dSize}
                className="w-full py-3 bg-[var(--c-accent)] text-white rounded-xl font-medium text-[16px] disabled:opacity-40"
              >
                {saving ? "บันทึก..." : "+ เพิ่ม Drive"}
              </button>
            </div>
          </div>

          {/* Existing drives — grid */}
          {drives.length > 0 && (
            <>
              <div className="text-[13px] text-[var(--c-text-3)] uppercase tracking-wider mb-2">
                ทั้งหมด {drives.length} drives
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {drives.map((d) => {
                  const cnt = folders.filter((f) => f.driveId === d.id).length;
                  return (
                    <div key={d.id} className="bg-[var(--c-card)] rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xl">{TYPE_ICON[d.type]}</span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-3 h-3 rounded-full ${colorDot(d.color)}`} />
                          <DelBtn id={d.id} type="Drive" />
                        </div>
                      </div>
                      <div className="font-semibold text-[15px] text-[var(--c-text)] truncate">{d.name}</div>
                      <div className="text-[13px] text-[var(--c-text-3)]">
                        {d.brand} · {d.size}{d.sizeUnit}
                        {cnt > 0 && <span> · {cnt} folders</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Add Folder Tab ─── */}
      {tab === "folders" && (
        <div>
          {drives.length === 0 ? (
            <div className="text-center py-8 text-[var(--c-text-3)] text-[15px]">
              <div className="text-4xl mb-2">💾</div>
              เพิ่ม Drive ก่อน
              <button onClick={() => setTab("drives")} className="ml-2 text-[var(--c-accent)] underline">ไปเพิ่ม</button>
            </div>
          ) : (
            <>
              <div className="bg-[var(--c-card)] rounded-xl p-4 mb-4">
                <div className="space-y-3">
                  <select
                    value={fDriveId}
                    onChange={(e) => setFDriveId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--c-input)] rounded-xl text-[16px] text-[var(--c-text)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]/50"
                  >
                    <option value="">เลือก Drive *</option>
                    {drives.map((d) => (
                      <option key={d.id} value={d.id}>
                        {TYPE_ICON[d.type]} {d.name} ({d.brand} {d.size}{d.sizeUnit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="ชื่อ Folder / File *"
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--c-input)] rounded-xl text-[16px] text-[var(--c-text)] placeholder:text-[var(--c-text-3)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]/50"
                  />

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ขนาด"
                      value={fSize}
                      onChange={(e) => setFSize(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-[var(--c-input)] rounded-xl text-[16px] text-[var(--c-text)] placeholder:text-[var(--c-text-3)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]/50"
                    />
                    <div className="flex bg-[var(--c-fill-3)] rounded-lg overflow-hidden">
                      {(["MB", "GB", "TB"] as FolderSizeUnit[]).map((u) => (
                        <button
                          key={u}
                          onClick={() => setFSizeUnit(u)}
                          className={`px-3.5 py-2 text-[14px] font-medium transition-all ${
                            fSizeUnit === u ? "bg-[var(--c-accent)] text-white" : "text-[var(--c-text-2)]"
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="คำอธิบาย (optional)"
                    value={fDesc}
                    onChange={(e) => setFDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--c-input)] rounded-xl text-[16px] text-[var(--c-text)] placeholder:text-[var(--c-text-3)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]/50"
                  />

                  <button
                    onClick={addFolder}
                    disabled={saving || !fName.trim() || !fDriveId}
                    className="w-full py-3 bg-[var(--c-accent)] text-white rounded-xl font-medium text-[16px] disabled:opacity-40"
                  >
                    {saving ? "บันทึก..." : "+ เพิ่ม Folder"}
                  </button>
                </div>
              </div>

              {/* Folders grouped by drive */}
              {drives.map((d) => {
                const dfs = folders.filter((f) => f.driveId === d.id);
                if (dfs.length === 0) return null;
                return (
                  <div key={d.id} className="mb-3">
                    <div className="flex items-center gap-1.5 mb-1 text-[13px] text-[var(--c-text-3)] uppercase tracking-wider">
                      <span>{TYPE_ICON[d.type]}</span>
                      <span>{d.name}</span>
                      <span>({dfs.length})</span>
                    </div>
                    <div className="space-y-1">
                      {dfs.map((f) => (
                        <div key={f.id} className="bg-[var(--c-card)] rounded-xl p-2.5 flex items-center justify-between text-[15px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span>📁</span>
                            <span className="font-medium text-[var(--c-text)] truncate">{f.name}</span>
                            {f.size && <span className="text-[var(--c-text-3)] text-[13px] shrink-0">{f.size}{f.sizeUnit}</span>}
                            {f.description && <span className="text-[var(--c-text-4)] text-[13px] truncate">— {f.description}</span>}
                          </div>
                          <DelBtn id={f.id} type="Folder" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
      {/* ─── Import Tab ─── */}
      {tab === "import" && (
        <div>
          {drives.length === 0 ? (
            <div className="text-center py-8 text-[var(--c-text-3)] text-[15px]">
              <div className="text-4xl mb-2">💾</div>
              เพิ่ม Drive ก่อน
              <button onClick={() => setTab("drives")} className="ml-2 text-[var(--c-accent)] underline">ไปเพิ่ม</button>
            </div>
          ) : (
            <>
              <div className="bg-[var(--c-card)] rounded-xl p-4 mb-4">
                <div className="space-y-3">
                  <select
                    value={importDriveId}
                    onChange={(e) => setImportDriveId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--c-input)] rounded-xl text-[16px] text-[var(--c-text)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]/50"
                  >
                    <option value="">เลือก Drive ปลายทาง *</option>
                    {drives.map((d) => (
                      <option key={d.id} value={d.id}>
                        {TYPE_ICON[d.type]} {d.name} ({d.brand} {d.size}{d.sizeUnit})
                      </option>
                    ))}
                  </select>

                  {/* Upload MD file */}
                  <label className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--c-fill-3)] text-[var(--c-text)] rounded-xl font-medium text-[15px] cursor-pointer hover:bg-[var(--c-fill-2)] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload ไฟล์ .md
                    <input
                      type="file"
                      accept=".md,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMdUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  <div className="flex items-center gap-3 text-[13px] text-[var(--c-text-3)]">
                    <div className="flex-1 h-px bg-[var(--c-sep)]/30" />
                    <span>หรือวาง text</span>
                    <div className="flex-1 h-px bg-[var(--c-sep)]/30" />
                  </div>

                  <textarea
                    placeholder={`วางโครงสร้าง folder ที่นี่...\n\nMovies\nProjects 2024 — งาน freelance\n├── Vacation\n└── Family`}
                    value={importText}
                    onChange={(e) => { setImportText(e.target.value); setMdParsed(null); }}
                    rows={6}
                    className="w-full px-3.5 py-2.5 bg-[var(--c-input)] rounded-xl text-[15px] text-[var(--c-text)] placeholder:text-[var(--c-text-3)] outline-none focus:ring-2 focus:ring-[var(--c-accent)]/50 resize-none font-mono leading-relaxed"
                  />

                  {/* Preview — MD parsed */}
                  {mdParsed && mdParsed.length > 0 && (
                    <div>
                      <div className="text-[13px] text-[var(--c-text-2)] mb-1.5">
                        จาก MD — พบ {mdParsed.length} folders (พร้อมขนาด)
                      </div>
                      <div className="bg-[var(--c-fill-3)] rounded-xl p-3 space-y-1 max-h-[250px] overflow-y-auto">
                        {mdParsed.map((p, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[14px]">
                            <span>📁</span>
                            <span className="text-[var(--c-text)]">{p.name}</span>
                            {p.size && <span className="text-[var(--c-text-3)] text-[12px]">{p.size}{p.sizeUnit}</span>}
                            {p.description && <span className="text-[var(--c-text-4)] text-[12px]">— {p.description}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview — text parsed */}
                  {!mdParsed && parsedImport.length > 0 && (
                    <div>
                      <div className="text-[13px] text-[var(--c-text-2)] mb-1.5">
                        Preview — {parsedImport.length} folders
                      </div>
                      <div className="bg-[var(--c-fill-3)] rounded-xl p-3 space-y-1 max-h-[200px] overflow-y-auto">
                        {parsedImport.map((p, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[14px]">
                            <span>📁</span>
                            <span className="text-[var(--c-text)]">{p.name}</span>
                            {p.description && <span className="text-[var(--c-text-3)] text-[12px]">— {p.description}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={mdParsed ? doMdImport : doImport}
                    disabled={saving || !importDriveId || (mdParsed ? mdParsed.length === 0 : parsedImport.length === 0)}
                    className="w-full py-3 bg-[var(--c-accent)] text-white rounded-xl font-medium text-[16px] disabled:opacity-40"
                  >
                    {saving ? "กำลัง import..." : `Import ${mdParsed ? mdParsed.length : parsedImport.length} folders`}
                  </button>
                </div>
              </div>

              {/* Format guide */}
              <div className="bg-[var(--c-card)] rounded-xl p-4">
                <div className="text-[15px] font-semibold text-[var(--c-text)] mb-2">รูปแบบที่รองรับ</div>
                <div className="space-y-2 text-[14px] text-[var(--c-text-2)]">
                  <div>
                    <div className="text-[var(--c-text)] font-medium">Plain list</div>
                    <pre className="text-[13px] text-[var(--c-text-3)] font-mono mt-0.5">Movies{"\n"}Photos{"\n"}Music</pre>
                  </div>
                  <div>
                    <div className="text-[var(--c-text)] font-medium">Tree format</div>
                    <pre className="text-[13px] text-[var(--c-text-3)] font-mono mt-0.5">{"├── Projects\n├── Backup\n└── Archive"}</pre>
                  </div>
                  <div>
                    <div className="text-[var(--c-text)] font-medium">พร้อมคำอธิบาย</div>
                    <pre className="text-[13px] text-[var(--c-text-3)] font-mono mt-0.5">{"Movies — หนังรวม\nWork — งาน 2024"}</pre>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {/* ─── Duplicates Tab ─── */}
      {tab === "duplicates" && (
        <div>
          {duplicates.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-[17px] font-semibold text-[var(--c-text)]">ไม่มีไฟล์ซ้ำข้าม Drive</div>
              <div className="text-[14px] text-[var(--c-text-3)] mt-1">ไฟล์ทั้งหมดไม่ซ้ำกัน (ชื่อ+ขนาด+ประเภท ข้าม Drive)</div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-[var(--c-card)] rounded-xl p-4 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[20px]">🔁</span>
                  <span className="text-[17px] font-semibold text-[var(--c-text)]">ไฟล์ซ้ำข้าม Drive: {duplicates.length} กลุ่ม</span>
                </div>
                <div className="text-[13px] text-[var(--c-text-3)]">
                  ไฟล์ชื่อ+ขนาด+ประเภทเดียวกัน อยู่คนละ Drive — แนะนำลบจาก drive ที่เหลือที่น้อย
                </div>
              </div>

              {/* Filter chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {FILE_CATEGORIES.filter((c) => c.id === "all" || (dupCategoryCounts[c.id] || 0) > 0).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setDupFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                      dupFilter === cat.id
                        ? "bg-[var(--c-accent)] text-white"
                        : "bg-[var(--c-fill-3)] text-[var(--c-text-2)]"
                    }`}
                  >
                    {cat.label}
                    {(dupCategoryCounts[cat.id] || 0) > 0 && (
                      <span className={`ml-1 ${dupFilter === cat.id ? "text-white/70" : "text-[var(--c-text-4)]"}`}>
                        {dupCategoryCounts[cat.id]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[12px] text-[var(--c-text-3)]">เรียงตาม:</span>
                {([
                  { id: "count" as const, label: "จำนวนซ้ำ" },
                  { id: "name" as const, label: "ชื่อ" },
                  { id: "type" as const, label: "ประเภท" },
                ]).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setDupSort(s.id)}
                    className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition-all ${
                      dupSort === s.id
                        ? "bg-[var(--c-accent)]/15 text-[var(--c-accent)]"
                        : "text-[var(--c-text-3)] hover:text-[var(--c-text-2)]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
                <span className="text-[12px] text-[var(--c-text-4)] ml-auto">{filteredDuplicates.length} รายการ</span>
              </div>

              {/* List */}
              {filteredDuplicates.length === 0 ? (
                <div className="text-center py-6 text-[var(--c-text-3)] text-[14px]">ไม่มีไฟล์ซ้ำในหมวดนี้</div>
              ) : (
                <div className="space-y-2.5">
                  {filteredDuplicates.map((g) => {
                    const isRecommended = g.recommendation?.deleteFrom;
                    return (
                      <div key={g.key} className="bg-[var(--c-card)] rounded-xl p-3.5">
                        {/* File info */}
                        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                          <span className="text-[14px]">📄</span>
                          <span className="font-medium text-[15px] text-[var(--c-text)] truncate">{g.fileName}</span>
                          <span className="text-[12px] text-[var(--c-text-3)] shrink-0">{g.fileSize}</span>
                          {g.fileType && <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--c-fill-3)] text-[var(--c-text-3)] shrink-0">{g.fileType}</span>}
                          <span className="text-[12px] font-bold text-[#FF9F0A] shrink-0">x{g.locations.length}</span>
                        </div>
                        {/* Locations with capacity + delete buttons */}
                        <div className="space-y-2 ml-1">
                          {g.locations.map((loc, i) => {
                            const stat = driveStats[loc.drive.id];
                            const confirmKey = `${loc.folder.id}|${g.fileName}|${g.fileSize}`;
                            const isConfirming = confirmDupDelete === confirmKey;
                            const isRec = isRecommended === loc.drive.name;
                            return (
                              <div key={i} className={`rounded-lg border px-3 py-2.5 ${isRec ? "border-[#FF9F0A]/30 bg-[#FF9F0A]/5" : "border-[var(--c-sep)]/30 bg-[var(--c-fill-3)]/30"}`}>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 text-[13px] min-w-0">
                                    <span>{TYPE_ICON[loc.drive.type]}</span>
                                    <span className="text-[var(--c-accent)] font-semibold">{loc.drive.name}</span>
                                    <span className="text-[var(--c-text-4)]">/</span>
                                    <span className="text-[var(--c-text-2)] truncate">📁 {loc.folder.name}</span>
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDupFileDelete(loc.folder.id, g.fileName, g.fileSize); }}
                                    disabled={saving}
                                    className={`text-[12px] px-3 py-1.5 rounded-lg font-medium shrink-0 transition-all ${
                                      isConfirming
                                        ? "bg-red-500 text-white"
                                        : "bg-[var(--c-fill-3)] text-[var(--c-text-3)] hover:text-red-400 hover:bg-red-500/10"
                                    }`}
                                  >
                                    {isConfirming ? "ยืนยันลบ?" : "ลบจากที่นี่"}
                                  </button>
                                </div>
                                {/* Drive capacity bar */}
                                {stat && (
                                  <div className="mt-1.5">
                                    <div className="flex items-center justify-between text-[11px] text-[var(--c-text-4)] mb-0.5">
                                      <span>ใช้ {formatMB(stat.usedMB)} / {formatMB(stat.totalMB)}</span>
                                      <span>เหลือ {formatMB(stat.freeMB)}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[var(--c-fill-3)] rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${stat.freeMB / stat.totalMB < 0.15 ? "bg-red-500" : stat.freeMB / stat.totalMB < 0.3 ? "bg-[#FF9F0A]" : "bg-[var(--c-accent)]"}`}
                                        style={{ width: `${Math.min(100, (stat.usedMB / stat.totalMB) * 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                                {isRec && (
                                  <div className="mt-1.5 text-[11px] text-[#FF9F0A] flex items-center gap-1">
                                    <span>💡</span> แนะนำลบจากที่นี่ — เหลือที่น้อยกว่า
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </MainNavigationShell>
  );
}
