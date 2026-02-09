# Cake Family App

## Project Overview
Family assistant web app. Started as a weekly child pickup/drop-off schedule ("ตารางรับส่งลูก"), expanding into a multi-tool family helper platform.

**Live URL:** https://cake-jh.vercel.app
**Passphrase:** CakeFamily1988+ (SHA-256 hashed on client, cookie-based auth with "Remember Forever")

## Tech Stack
- **Framework:** Next.js 16.1.6 (App Router, `"use client"`)
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"`, `@theme inline`)
- **Font:** Noto Sans Thai (Google Fonts)
- **Database:** Upstash Redis (free tier, `@upstash/redis`, env vars on Vercel)
- **Email:** Resend API (for forgot passphrase, `onboarding@resend.dev` sender)
- **Hosting:** Vercel (project name: `driver-schedule`, alias: `cake-jh.vercel.app`)
- **Language:** Thai UI, Thai comments OK

## Architecture
Single-page app — almost everything in `src/app/page.tsx` (~1100+ lines). API routes in `src/app/api/`.

### Key Files
- `src/app/page.tsx` — Main app: auth gate, weather dashboard, schedule table, all cell components
- `src/app/layout.tsx` — iOS meta tags, viewport-fit cover, Noto Sans Thai font
- `src/app/globals.css` — Safe-area padding, touch targets (44px), iOS zoom prevention
- `src/app/api/schedule/route.ts` — GET/POST schedule data to Upstash Redis
- `src/app/api/air-quality/route.ts` — Scrapes AQICN for US AQI (Samut Prakan stations)
- `src/app/api/forgot-pass/route.ts` — Sends passphrase to owner email via Resend

### Data Structure
```typescript
type Driver = "Hon" | "Jay" | "JH" | "";
interface ScheduleEntry {
  morning: Driver;
  evening: Driver;
  fuel: string;
  mileage: string;
  remarks: Partial<Record<"Hon" | "Jay" | "JH", string>>;
  emojis?: string[]; // 🥚 ❤️ 🩸
}
type ScheduleData = Record<string, ScheduleEntry>; // key = "YYYY-MM-DD"
```
Stored as single JSON blob in Redis under key `cake-schedule`.

### Vercel Environment Variables
- `UPSTASH_REDIS_REST_URL` — Redis endpoint
- `UPSTASH_REDIS_REST_TOKEN` — Redis auth token
- `RESEND_API_KEY` — For sending forgot passphrase emails

## Current Features
1. **Auth gate** — Passphrase login, Remember Forever cookie (10 years), forgot pass → email
2. **Weather dashboard** — Open-Meteo forecast (Phra Pradaeng) + AQICN US AQI header
3. **Weekly schedule** — Mon-Sun, driver selection per morning/evening slot
4. **Fuel tracking** — Manual input in liters
5. **Mileage estimation** — Preset buttons (+15L/+20L/+30L) with random ~7km/L, shows preview km. Always calculates from confirmed base (no compounding)
6. **Per-driver remarks** — Each driver (Hon/Jay/JH) has own remark field
7. **Emoji toggles** — 🥚 ❤️ 🩸 per day
8. **Edit mode** — Pending changes → confirm dialog → save to Redis
9. **Mobile optimized** — iPhone 15 Pro (393px), safe-area insets, 44px touch targets

## Design Decisions
- **Dark theme** — Slate-900/950 gradient background
- **Driver colors** — Hon=blue, Jay=pink, JH=emerald
- **Mobile-first** — `mobile` prop on cell components for responsive layout
- **No localStorage** — All data on Redis server for cross-device sync
- **Client-side auth** — Simple passphrase hash check, not security-critical

## Deploy Process
```bash
cd driver-schedule
npm run build
vercel --prod
# Alias is automatic: cake-jh.vercel.app
```

## Future Vision
Expand into a **Family Assistant Platform** with potential modules:
- Car maintenance wiki (owner has limited car knowledge)
- Home care guides
- Shopping/product recommendations
- Other family utility tools
- Possibly product data scraping from Thai retailers (Makro, Tops, Lotus)

## Important Notes
- Owner email (hidden, never shown in UI): nattahon@gmail.com
- Location context: Phra Pradaeng, Samut Prakan, Thailand
- User prefers quick iterations: build → deploy → test → adjust
- Keep Thai language for UI, code comments can be English or Thai
- Upstash Redis free tier: 256MB storage, 10,000 commands/day (more than enough)
