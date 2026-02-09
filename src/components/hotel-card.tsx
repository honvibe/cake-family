"use client";

import { useState } from "react";

interface HotelInfo {
  name: string;
  rating: string;
  addressEn: string;
  addressJp: string;
  checkIn: string;
  checkOut: string;
}

export default function HotelCard({ hotel }: { hotel: HotelInfo }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[16px] border border-[var(--c-sep)] bg-[var(--c-card-alt)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-[var(--c-fill-3)] transition-colors active:bg-[var(--c-fill-2)]"
      >
        <div>
          <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">ที่พักตลอดทริป</p>
          <p className="text-[18px] font-semibold text-[var(--c-text)] mt-1">{hotel.name}</p>
        </div>
        <svg
          className={`w-[16px] h-[16px] text-[var(--c-text-3)] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-[var(--c-text-2)]">{hotel.rating}</p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=MONday+Apart+Asakusabashi+Akihabara"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-[10px] text-[13px] font-medium bg-[var(--c-accent)] text-white hover:opacity-90 transition-opacity"
            >
              Google Maps
            </a>
          </div>

          <div className="rounded-[12px] overflow-hidden border border-[var(--c-sep)]">
            <iframe
              title={hotel.name}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.1!2d139.7845!3d35.6985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188ea7e2e0e8ab%3A0x7a63c5468b4e2a28!2sMONday%20Apart%20Asakusabashi%20-%20Akihabara!5e0!3m2!1sen!2sjp!4v1"
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-4">
              <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">Address (EN)</p>
              <p className="text-[14px] text-[var(--c-text)] mt-1">{hotel.addressEn}</p>
            </div>
            <div className="rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-4">
              <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">Address (JP)</p>
              <p className="text-[14px] text-[var(--c-text)] mt-1">{hotel.addressJp}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-4">
              <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">Check in</p>
              <p className="text-[14px] text-[var(--c-text)] mt-1">{hotel.checkIn}</p>
            </div>
            <div className="rounded-[12px] border border-[var(--c-sep)] bg-[var(--c-subtle-card)] p-4">
              <p className="text-[12px] uppercase tracking-wide text-[var(--c-text-2)]">Check out</p>
              <p className="text-[14px] text-[var(--c-text)] mt-1">{hotel.checkOut}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
