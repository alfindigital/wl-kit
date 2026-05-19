# WatchlistKit — Round 2 Improvements

Empat kelompok fitur: **Smart Input**, **Watchlist Management**, **UX Polish**, **PWA**. Semua client-side, no backend. Light mode tetap.

---

## 1. Smart Input & Validasi

### 1.1 Parser baru dengan klasifikasi
`src/lib/tickers.ts` — ganti `parseTickers` jadi `analyzeInput(raw)` yang mengembalikan:
```ts
{
  valid: string[],            // 4 huruf, unique, urut sesuai input
  invalid: { token: string, reason: 'length' | 'chars' }[],
  duplicates: string[],       // ticker valid yang muncul >1x (dihitung dari occurrence)
  delimiter: 'tab' | 'comma' | 'semicolon' | 'newline' | 'space' | 'mixed'
}
```
- Tokenisasi: split by `/[\s,;]+/` lalu trim; deteksi `\t` → delimiter `tab` (handle paste Excel multi-kolom).
- Token uppercase. Cocokkan `^[A-Z0-9]+$`:
  - Bukan huruf saja & bukan 4 char → `invalid` dengan reason.
  - 4 huruf A–Z → valid. Selain itu (3 atau 5+, atau berisi angka) → `invalid`.
- Hitung duplikat sebelum dedupe (untuk badge).
- `formatTickers` tetap; hanya konsumsi `valid` array.

### 1.2 Live counter di atas Output
Komponen baru `<InputStats />` (di `index.tsx`, di atas `<OutputBlock />`):
- `12 tickers • 2 duplicates removed • 1 invalid`
- Klik bagian "invalid" → expand list token-token invalid (small chips merah).

### 1.3 Highlight invalid token di textarea
Approach minim: di bawah `<TickerInput>` munculkan baris ringkas:
- `Invalid: BBC, BBCAX` sebagai chip merah dengan tooltip alasan (`"must be 4 letters"`).
- (Tidak edit canvas overlay di textarea — too brittle. Chip list cukup jelas.)

### 1.4 Drag & drop .txt / .csv
- `TickerInput.tsx`: tambah `onDragOver` (preventDefault, set state `isDragging` → ring biru), `onDrop`:
  - Ambil `e.dataTransfer.files[0]`, validasi `type` atau ekstensi `.txt/.csv`, max 1MB.
  - `await file.text()` → append ke value (sama seperti paste).
  - Toast sukses / error.

### 1.5 Excel paste — handle multi-kolom
Sudah jalan via tokenisasi 1.1 (tab = delimiter). Tambah explicit test: jika delimiter terdeteksi `tab`, toast subtle `Detected Excel paste`.

---

## 2. Watchlist Management

### 2.1 Schema update
`src/lib/storage.ts` — perbesar `SavedWatchlist`:
```ts
type SavedWatchlist = {
  id: string;
  name: string;
  tickers: string[];
  savedAt: number;
  pinned?: boolean;
  tags?: string[];        // free-form, lowercase
  lastUsedAt?: number;    // updated saat "Load" diklik
};
```
Migration: pas `loadWatchlists`, fill missing field dengan default.

Helper baru: `togglePin(id)`, `setTags(id, tags)`, `touchUsed(id)`, `exportAll(): string` (JSON), `importAll(json: string): { added: number, skipped: number }` (skip kalau id sama).

### 2.2 UI di `SavedWatchlists.tsx`
Layout baru per item (sudah ada rename/delete/select dari plan sebelumnya — extend, jangan ganti):
- Icon pin (kiri nama) — toggle.
- Inline tag chips di bawah nama. Klik chip → set filter.
- Action row: existing + dropdown "Edit tags" (popover dengan input comma-separated).

Header list:
- Sort dropdown: `Recent`, `Name A–Z`, `Most tickers`, `Pinned first` (default).
- Tag filter chips row (semua tag unik dari koleksi, klik untuk filter).
- Tombol `Export all` & `Import` (file input, JSON).

Section ordering (top → bottom):
1. **Pinned** (kalau ada)
2. **Recently used** (3 terbaru `lastUsedAt`, kecuali yang sudah pinned)
3. **All** (sisanya, sort sesuai pilihan)

### 2.3 Wiring di `index.tsx`
- Saat `Load`: `touchUsed(id)`, set input ke joined newline, format newline, toast.
- Export: trigger download `watchlistkit-backup-<date>.json`.
- Import: konfirmasi dialog `Add N watchlists?`, jalankan, toast hasil.

---

## 3. UX Polish

### 3.1 Undo toast
Util kecil di `index.tsx`: `withUndo(action, undoFn, message)`:
- Simpan snapshot sebelum delete/clear/merge.
- `toast(message, { action: { label: 'Undo', onClick: () => restore() }, duration: 5000 })`.
- Pakai untuk: delete saved, clear textarea, bulk delete (kalau ada).

### 3.2 Command Palette (⌘K)
- Pakai shadcn `command` (`CommandDialog`) yang sudah ada di `src/components/ui/command.tsx`.
- Trigger: ⌘/Ctrl+K (override existing ⌘K focus shortcut — promote palette, focus textarea bisa pakai ⌘/Ctrl+/).
- Groups:
  - **Actions**: Copy output, Download TXT, Save, Share, Clear.
  - **Format**: TradingView, Plain, Newline.
  - **Saved Watchlists**: list, pilih → load.
- Komponen baru `src/components/watchlist/CommandPalette.tsx`. Props: state + handlers dari index.

### 3.3 Onboarding tooltip first-visit
- `localStorage` key `watchlistkit.onboarded`.
- Kalau belum: render small floating hint card di pojok kanan textarea: `Paste your tickers here →` dengan tombol `Got it`. Hilang otomatis saat user mulai ngetik atau klik close.

### 3.4 Empty state interaktif di OutputBlock
- Ganti teks `"Paste tickers above to start"` jadi:
  - `"Try a sample:"` + 3 chip kecil: `BBCA BBRI BMRI`, `LQ45 starter`, `Banking`.
  - Klik chip → isi textarea dengan tickers tersebut (hardcoded sample arrays di constants).

### 3.5 Micro animation Copy success
- Tombol Copy: saat sukses, swap icon `Copy` → `Check` dengan transisi scale + fade selama 1.2s.
- Pakai state lokal `copied` + Tailwind classes (`transition-all duration-200`). No new dep.

---

## 4. PWA — installable, light caching

⚠️ Sesuai rule platform: **manifest-only**, tanpa `vite-plugin-pwa` / service worker yang aggressive. Cukup biar bisa "Add to Home Screen".

### 4.1 Manifest
- `public/manifest.webmanifest`:
  ```json
  {
    "name": "WatchlistKit",
    "short_name": "WatchlistKit",
    "description": "Format your IDX watchlist in seconds.",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#ea580c",
    "icons": [
      { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
      { "src": "/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
    ]
  }
  ```
- Generate 3 icon assets (orange "W" mark) ke `public/`.

### 4.2 Link tags
`src/routes/__root.tsx` head():
- `<link rel="manifest" href="/manifest.webmanifest" />`
- `<meta name="theme-color" content="#ea580c" />`
- `<link rel="apple-touch-icon" href="/icon-192.png" />`
- `<meta name="apple-mobile-web-app-capable" content="yes" />`

### 4.3 Skip service worker
Tidak install SW. Offline support real akan butuh SW yang bermasalah di preview iframe Lovable. App sudah client-side setelah load awal, jadi setelah dibuka sekali browser cache HTTP biasa cukup untuk usage berulang. Catat ini di response ke user.

---

## File yang berubah

- `src/lib/tickers.ts` — `analyzeInput`, refactor.
- `src/lib/storage.ts` — schema fields, helpers pin/tag/touch/export/import.
- `src/lib/samples.ts` — **baru**, sample ticker arrays.
- `src/components/watchlist/TickerInput.tsx` — drag & drop, onboarding hint.
- `src/components/watchlist/InputStats.tsx` — **baru**, counter + invalid chips.
- `src/components/watchlist/OutputBlock.tsx` — empty state interaktif.
- `src/components/watchlist/ActionButtons.tsx` — copy check animation.
- `src/components/watchlist/SavedWatchlists.tsx` — pin, tag chips, sort, sections, export/import.
- `src/components/watchlist/CommandPalette.tsx` — **baru**.
- `src/routes/index.tsx` — wiring, undo toasts, palette mount, shortcut update (⌘K → palette, ⌘/ → focus textarea).
- `src/routes/__root.tsx` — manifest + meta tags.
- `public/manifest.webmanifest`, `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable.png` — **baru**.

Tidak ada dependency baru.

---

## Out of scope

- Service worker / offline cache aktif (hanya manifest).
- Preset watchlist LQ45/IDX30 (akan dibahas terpisah kalau diminta).
- Backend / sync antar device (export-import JSON manual cukup).
