"use client";

import MainNavigationShell from "@/components/main-navigation-shell";
import { Emoji } from "@/components/emoji";
import { useEffect, useState } from "react";

interface NotifySettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

const DEFAULT_SETTINGS: NotifySettings = { enabled: false, hour: 20, minute: 0 };


export default function SettingsPage() {
  const [settings, setSettings] = useState<NotifySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/notify-settings")
      .then((r) => r.json())
      .then((data) => setSettings({ ...DEFAULT_SETTINGS, ...data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/notify-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/cron-notify");
      const data = await res.json();
      if (data.status === "sent") {
        setTestResult("ส่งสำเร็จ! เช็ค LINE กลุ่มได้เลย");
      } else if (data.status === "skipped") {
        setTestResult("ข้าม — Notification ปิดอยู่ (เปิดก่อนแล้วกด Save)");
      } else {
        setTestResult(`Error: ${data.error || JSON.stringify(data)}`);
      }
    } catch (e) {
      setTestResult(`Error: ${String(e)}`);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <MainNavigationShell>
        <div className="max-w-md mx-auto pt-10 text-center text-[var(--c-text-2)]">Loading...</div>
      </MainNavigationShell>
    );
  }

  return (
    <MainNavigationShell>
      <div className="max-w-md mx-auto">
        <div className="mb-5">
          <p className="text-[22px] md:text-[28px] font-bold text-[var(--c-text)] tracking-tight">Settings</p>
          <p className="text-[14px] text-[var(--c-text-2)]">จัดการ Notification</p>
        </div>

        {/* Notification Settings Card */}
        <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card)] overflow-hidden">

          {/* Row 1: Toggle */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Emoji char="🔔" size={22} />
              <div>
                <p className="text-[16px] font-medium text-[var(--c-text)]">LINE Notification</p>
                <p className="text-[12px] text-[var(--c-text-3)] mt-0.5">ส่งสรุปตารางสัปดาห์ทุกอาทิตย์ 20:00</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
              className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-200 shrink-0 ${
                settings.enabled ? "bg-[#30D158]" : "bg-[var(--c-fill-2)]"
              }`}
            >
              <span
                className={`absolute top-[2px] left-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-md transition-transform duration-200 ${
                  settings.enabled ? "translate-x-[20px]" : "translate-x-0"
                }`}
              />
            </button>
          </div>

        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-4 py-3.5 rounded-[14px] text-[16px] font-semibold text-white bg-[var(--c-accent)] hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : saved ? "บันทึกแล้ว ✓" : "บันทึก"}
        </button>

        {/* Test Section */}
        <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card)] p-5 mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Emoji char="🧪" size={22} />
            <div>
              <p className="text-[16px] font-medium text-[var(--c-text)]">ทดสอบส่ง</p>
              <p className="text-[12px] text-[var(--c-text-3)] mt-0.5">ส่งข้อความตัวอย่างไป LINE กลุ่มตอนนี้</p>
            </div>
          </div>

          <button
            onClick={handleTest}
            disabled={testing}
            className="w-full py-3 rounded-[12px] text-[15px] font-semibold text-[var(--c-text)] bg-[var(--c-fill-2)] hover:bg-[var(--c-fill-3)] active:opacity-80 transition-all disabled:opacity-50"
          >
            {testing ? "กำลังส่ง..." : "ส่งทดสอบ"}
          </button>

          {testResult && (
            <p className={`text-[13px] ${testResult.startsWith("Error") ? "text-[#FF453A]" : "text-[#30D158]"}`}>
              {testResult}
            </p>
          )}
        </div>
      </div>
    </MainNavigationShell>
  );
}
