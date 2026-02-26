"use client";

interface TimeItem {
  time: string;
  place: string;
  detail?: string;
}

interface DayPlan {
  date: string;
  title: string;
  color: string;
  schedule: TimeItem[];
  notes?: string[];
}

const PLANS: Record<number, DayPlan> = {
  1: {
    date: "2026年3月1日（日）",
    title: "到着・チェックイン",
    color: "#FF453A",
    schedule: [
      { time: "01:50", place: "ドンムアン空港（DMK）出発", detail: "Air Japan XJ 606" },
      { time: "10:00", place: "成田空港（NRT）到着", detail: "入国審査・荷物受取" },
      { time: "11:00", place: "成田空港 → 浅草橋", detail: "京成アクセス特急 or 成田エクスプレス" },
      { time: "13:00", place: "浅草橋到着・昼食" },
      { time: "15:00", place: "ホテルチェックイン", detail: "MONday Apart 浅草橋 秋葉原\n東京都台東区浅草橋4-15-5" },
      { time: "16:00", place: "周辺散策", detail: "コンビニ・ドラッグストアで買い物" },
      { time: "19:00", place: "夕食（浅草橋周辺）" },
    ],
  },
  2: {
    date: "2026年3月2日（月）",
    title: "築地場外市場 → 上野 → 秋葉原",
    color: "#FF9F0A",
    schedule: [
      { time: "08:00", place: "ホテル出発" },
      { time: "08:30", place: "築地場外市場", detail: "海鮮丼・玉子焼き・抹茶・煎餅・苺大福" },
      { time: "11:30", place: "築地 → 上野（電車）" },
      { time: "12:00", place: "上野公園", detail: "アメヤ横丁（アメ横）散策" },
      { time: "14:00", place: "上野 → 秋葉原（電車）" },
      { time: "14:30", place: "秋葉原", detail: "ヨドバシカメラ・電気街・ガチャポン" },
      { time: "17:00", place: "夕食" },
      { time: "19:00", place: "ホテルへ戻る" },
    ],
  },
  3: {
    date: "2026年3月3日（火）",
    title: "渋谷 → 原宿 → 明治神宮",
    color: "#FF6482",
    schedule: [
      { time: "09:00", place: "ホテル出発" },
      { time: "09:45", place: "渋谷到着", detail: "スクランブル交差点・ハチ公像" },
      { time: "10:30", place: "渋谷スカイ展望台", detail: "屋上展望（230m）" },
      { time: "12:00", place: "昼食（渋谷）", detail: "パンケーキ or ハンバーグ" },
      { time: "13:30", place: "原宿・竹下通り", detail: "クレープ・ショッピング" },
      { time: "15:00", place: "明治神宮参拝" },
      { time: "16:30", place: "キャットストリート散策" },
      { time: "18:00", place: "夕食", detail: "しゃぶしゃぶ or 焼肉" },
      { time: "20:00", place: "ホテルへ戻る" },
    ],
  },
  4: {
    date: "2026年3月4日（水）",
    title: "東京ディズニーシー",
    color: "#5E5CE6",
    schedule: [
      { time: "07:30", place: "ホテル出発" },
      { time: "08:30", place: "東京ディズニーシー到着" },
      { time: "09:00", place: "開園", detail: "アトラクション・ショー・パレード\nファンタジースプリングス（新エリア）" },
      { time: "12:00", place: "園内で昼食" },
      { time: "18:00", place: "園内で夕食" },
      { time: "21:00", place: "ディズニーシー出発" },
      { time: "22:00", place: "ホテル到着" },
    ],
    notes: ["チケット: 事前購入済み"],
  },
  5: {
    date: "2026年3月5日（木）",
    title: "鎌倉",
    color: "#30D158",
    schedule: [
      { time: "08:00", place: "ホテル出発" },
      { time: "09:30", place: "鎌倉到着", detail: "JR横須賀線" },
      { time: "10:00", place: "鎌倉大仏（高徳院）", detail: "国宝・阿弥陀如来坐像" },
      { time: "11:00", place: "長谷寺", detail: "あじさいの名所・見晴台" },
      { time: "12:00", place: "小町通り", detail: "散策・食べ歩き・昼食" },
      { time: "14:00", place: "江ノ電で移動" },
      { time: "14:30", place: "江ノ島散策" },
      { time: "16:30", place: "鎌倉 → 東京（電車）" },
      { time: "18:30", place: "夕食" },
      { time: "20:00", place: "ホテルへ戻る" },
    ],
  },
  6: {
    date: "2026年3月6日（金）",
    title: "河口湖・富士山",
    color: "#64D2FF",
    schedule: [
      { time: "07:00", place: "ホテル出発" },
      { time: "07:30", place: "新宿駅 → 河口湖駅", detail: "特急富士回遊" },
      { time: "09:30", place: "河口湖到着" },
      { time: "10:00", place: "カチカチ山ロープウェイ", detail: "富士山パノラマビュー" },
      { time: "11:30", place: "大石公園", detail: "富士山と花の絶景スポット" },
      { time: "12:30", place: "昼食", detail: "ほうとう（山梨郷土料理）" },
      { time: "14:00", place: "河口湖周辺散策・お土産" },
      { time: "15:30", place: "河口湖駅 → 新宿駅" },
      { time: "18:00", place: "夕食" },
      { time: "20:00", place: "ホテルへ戻る" },
    ],
    notes: ["チケット: 富士回遊 事前購入済み"],
  },
  7: {
    date: "2026年3月7日（土）",
    title: "川越 → 銀座 → 東京駅",
    color: "#FF9F0A",
    schedule: [
      { time: "08:30", place: "ホテル出発" },
      { time: "09:30", place: "川越到着（小江戸）", detail: "蔵造りの町並み・時の鐘" },
      { time: "10:30", place: "菓子屋横丁", detail: "駄菓子・さつまいもスイーツ" },
      { time: "12:00", place: "昼食（川越）" },
      { time: "13:30", place: "川越 → 銀座（電車）" },
      { time: "14:30", place: "銀座散策", detail: "歩行者天国（土曜日）" },
      { time: "16:00", place: "東京駅", detail: "ラーメンストリート・大丸デパート" },
      { time: "18:30", place: "夕食（東京駅周辺）" },
      { time: "20:00", place: "ホテルへ戻る" },
    ],
  },
  8: {
    date: "2026年3月8日（日）",
    title: "チェックアウト → 帰国",
    color: "#FF453A",
    schedule: [
      { time: "07:00", place: "起床・荷造り" },
      { time: "08:00", place: "チェックアウト" },
      { time: "08:30", place: "最後の買い物（浅草橋周辺）" },
      { time: "09:30", place: "浅草橋 → 成田空港（電車）" },
      { time: "11:15", place: "成田空港（NRT）出発", detail: "Air Japan XJ 607" },
      { time: "16:40", place: "ドンムアン空港（DMK）到着" },
    ],
  },
};

export default function TokyoDayJP({ dayNumber }: { dayNumber: number }) {
  const plan = PLANS[dayNumber];
  if (!plan) return null;

  return (
    <div className="mt-6 md:mt-7 space-y-5">
      {/* Day header */}
      <div
        className="rounded-[18px] border p-5 md:p-7"
        style={{ borderColor: `${plan.color}40`, backgroundColor: `${plan.color}08` }}
      >
        <p className="text-[12px] font-bold tracking-wide" style={{ color: plan.color }}>
          DAY {dayNumber}
        </p>
        <p className="text-[24px] md:text-[34px] font-bold text-[var(--c-text)] leading-tight mt-1">
          {plan.title}
        </p>
        <p className="text-[14px] text-[var(--c-text-2)] mt-2">{plan.date}</p>
      </div>

      {/* Immigration info */}
      <div className="rounded-[14px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-4 md:p-5">
        <p className="text-[13px] font-semibold text-[var(--c-text-2)] mb-2">旅行情報</p>
        <div className="grid grid-cols-2 gap-2 text-[13px]">
          <div className="text-[var(--c-text-2)]">旅行者</div>
          <div className="text-[var(--c-text)] font-medium">4名（大人2名・子供2名）</div>
          <div className="text-[var(--c-text-2)]">国籍</div>
          <div className="text-[var(--c-text)] font-medium">タイ王国</div>
          <div className="text-[var(--c-text-2)]">目的</div>
          <div className="text-[var(--c-text)] font-medium">観光</div>
          <div className="text-[var(--c-text-2)]">滞在期間</div>
          <div className="text-[var(--c-text)] font-medium">3月1日〜8日（7泊8日）</div>
          <div className="text-[var(--c-text-2)]">宿泊先</div>
          <div className="text-[var(--c-text)] font-medium">MONday Apart 浅草橋 秋葉原</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--c-sep)]">
          <p className="text-[16px] font-semibold text-[var(--c-text)]">スケジュール</p>
        </div>
        <div className="divide-y divide-[var(--c-sep)]">
          {plan.schedule.map((item, i) => (
            <div key={i} className="flex gap-4 px-5 py-3.5">
              <span
                className="shrink-0 text-[14px] font-bold tabular-nums w-12"
                style={{ color: plan.color }}
              >
                {item.time}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[var(--c-text)] leading-tight">
                  {item.place}
                </p>
                {item.detail && (
                  <p className="text-[13px] text-[var(--c-text-2)] mt-0.5 whitespace-pre-line leading-relaxed">
                    {item.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {plan.notes && (
        <div className="rounded-[12px] border border-[#30D158]/25 bg-[#30D158]/5 p-4">
          {plan.notes.map((n, i) => (
            <p key={i} className="text-[13px] text-[#30D158] font-medium">{n}</p>
          ))}
        </div>
      )}
    </div>
  );
}
