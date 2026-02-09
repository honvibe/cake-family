import MainNavigationShell from "@/components/main-navigation-shell";

export default function PriceTrackerPage() {
  return (
    <MainNavigationShell>
      <div className="max-w-5xl mx-auto">
        <div className="mb-5">
          <p className="text-[22px] md:text-[28px] font-bold text-[var(--c-text)] tracking-tight">ติดตามราคาของใช้ในบ้าน</p>
          <p className="text-[14px] text-[var(--c-text-2)]">Price Tracker</p>
        </div>

        <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] p-5">
          <p className="text-[16px] font-semibold text-[var(--c-text)]">พร้อมต่อยอดเป็น slug แล้ว</p>
          <p className="text-[13px] text-[var(--c-text-2)] mt-1">ตอนนี้แยก URL สำหรับ Price Tracker สำเร็จแล้ว และสามารถเพิ่มรายหมวดสินค้าเป็น slug ย่อยได้ต่อทันที</p>
        </div>
      </div>
    </MainNavigationShell>
  );
}
