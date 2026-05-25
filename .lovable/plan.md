# Plan Implementasi — 11 Fitur Terpilih

Dibagi 3 wave berdasarkan dependensi & effort. Bisa dikerjakan berurutan atau saya skip ke wave tertentu sesuai permintaan.

---

## Wave 1 — Quick Wins (1 batch, semua fitur S)

### 1. Haptic Feedback
- Helper baru: `src/lib/haptics.ts` — `haptic(pattern: number | number[])` cek `'vibrate' in navigator`, no-op kalau tidak ada atau `prefers-reduced-motion`.
- Pasang di: `handleCopy` success, `handleSave` success, swipe-delete commit di `SavedWatchlists`, sticky bar tap.
- Pattern: copy `10ms`, save `[10,30,10]`, delete `[20,40]`.

### 2. Dark Mode Toggle
- Hook baru: `src/hooks/use-theme.ts` — state `'light'|'dark'|'system'`, persist di `localStorage` key `wlkit-theme`. Apply class `dark` ke `<html>`. Listen `matchMedia('prefers-color-scheme: dark')` untuk mode system.
- UI: tombol Sun/Moon di sticky mobile header (kanan, sebelah badge count) dan di pojok kanan-atas main container desktop. 3-state cycle: system → light → dark → system.
- CSS sudah punya `.dark` palette — tinggal aktifkan.

### 3. Auto-Uppercase saat Ngetik
- Di `TickerInput`: tambahkan opsi (default ON) `autoUppercase`. `onChange` transform value `.toUpperCase()` sebelum panggil prop `onChange`.
- Pertahankan caret position (penting!) — gunakan `selectionStart` snapshot lalu restore via `requestAnimationFrame`.
- Toggle di toolbar bawah textarea: ikon "Aa" kecil (off) / "AA" (on), state disimpan di localStorage.

### 4. Confirm Dialog Clear (>20 tickers)
- Threshold: `tickers.length > 20` (bukan input chars).
- Komponen `AlertDialog` reuse. Saat user tekan Clear di TickerInput toolbar atau `Ctrl+Backspace`, kalau di atas threshold → buka dialog "Clear N tickers?". Tombol Cancel + Clear (destructive).
- Tetap pertahankan undo toast setelahnya (sudah ada di `handleClearInput`).

### 5. Sticky "Scroll-to-Input" FAB (Mobile)
- Komponen baru: `src/components/watchlist/ScrollToInputFab.tsx`.
- Detection: IntersectionObserver pada `textareaRef.current`. Saat tidak terlihat di viewport DAN user scroll posisi > textarea bottom, tampilkan FAB.
- Posisi: `fixed bottom-[88px] right-4` (di atas sticky action bar), bulat 48px, ikon `ArrowUp` + label "Edit". Hanya mobile (`sm:hidden`).
- Click: `scrollIntoView({behavior:'smooth', block:'center'})` + focus textarea.

### 9. First-Run Onboarding (3 Slide)
- Komponen baru: `src/components/watchlist/OnboardingDialog.tsx` pakai `Dialog`.
- 3 slide horizontal swipe (atau dot pagination): "Paste apa saja", "Pilih format & copy", "Simpan & share". Tiap slide: ilustrasi ringan (lucide icon besar), judul, 1 kalimat.
- Trigger: `useEffect` di `index.tsx` cek `localStorage.getItem('wlkit-onboarded')`. Kalau null → buka. Tombol "Skip" dan "Get started" → set flag.
- Tombol "Show again" tersedia di Keyboard Shortcut overlay.

### 11. Keyboard Shortcut Overlay
- Komponen baru: `src/components/watchlist/ShortcutOverlay.tsx` pakai `Dialog`.
- Trigger: shortcut `?` (tanpa modifier, hanya saat tidak di field). Juga tombol "?" di header sticky desktop & mobile.
- Konten: grid 2 kolom — kategori "Navigation", "Edit", "Format", "Actions". Tiap baris: `<Kbd>` combo + deskripsi.
- Sertakan link kecil "Tampilkan onboarding lagi" di footer dialog.

---

## Wave 2 — Folder Grouping (M)

### 8. Folder/Grouping Watchlist
- Schema: tambah field `folder?: string` di `SavedWatchlist` (`src/lib/storage.ts`). Backward compatible (null = "Ungrouped").
- Folder dikelola implicit (string bebas, dibuat saat assign). Disimpan turunan di `loadFolders()`: unique set dari semua items.
- UI di `SavedWatchlists`:
  - Filter chip baru di toolbar: "All / [Folder1] / [Folder2] / Ungrouped".
  - Di renderItem mobile: tambah baris kecil "📁 Folder name" di metadata.
  - Drawer detail: tambah aksi "Move to folder…" → sub-drawer pilih folder existing atau "New folder…".
- Desktop: drag handle kiri item, drop ke folder header (HTML5 drag-and-drop, tanpa library).
- Section rendering: kalau ada folder aktif filter, render flat. Default: section per folder (Pinned tetap di atas).

---

## Wave 3 — Voice & Tour (M masing-masing)

### 6. Voice Input
- Komponen baru: `src/components/watchlist/VoiceButton.tsx`.
- API: `window.SpeechRecognition || window.webkitSpeechRecognition`. Feature-detect; sembunyikan tombol kalau tidak ada.
- Lokasi: di toolbar bawah TickerInput (sebelah Sample), ikon `Mic`.
- Flow: tap → start recognition (`lang: 'en-US'`, `interimResults: false`, `continuous: false`). Hasil string di-uppercase, dipecah dengan regex IDX ticker (`/[A-Z]{4}/g`), validasi via `idx-tickers.ts`, append ke input.
- Visual saat aktif: pulse merah + label "Listening…", auto-stop setelah 8 detik.
- Note di dialog kalau permission ditolak.

### 10. Tour Interaktif
- Library: pakai custom (no extra dep) — `react-joyride` ~50KB, atau roll our own dengan portal + spotlight.
- Pilih custom (lebih ringan): komponen `Tour.tsx` dengan steps array `{ targetSelector, title, body, placement }`. Spotlight via `clip-path` overlay.
- Trigger: tombol "?" header → menu "Keyboard shortcuts" / "Take a tour".
- Steps minimum: 1) Input, 2) Format tabs, 3) Output & copy, 4) Save button, 5) Saved watchlists, 6) Theme toggle.
- Persist `wlkit-tour-completed` di localStorage; tetap bisa rerun via menu.

---

## Catatan Teknis Umum

- **Tidak menambah dependency baru** untuk Wave 1 & 2. Wave 3 voice pakai Web Speech API native; Tour custom (tanpa lib).
- **State theme & onboarding** disimpan di localStorage dengan prefix `wlkit-*` untuk konsistensi.
- **SSR safety**: semua localStorage/`matchMedia` akses dibungkus `useEffect` atau `typeof window !== 'undefined'`.
- **Mobile-first**: semua dialog gunakan `Dialog` shadcn (responsive); overlay shortcut dan onboarding fullscreen di mobile via `sm:max-w-lg`.
- **A11y**: dialog onboarding & shortcut punya proper `DialogTitle`, focus trap default, ESC close.

## File Map (Wave 1)

Baru:
- `src/lib/haptics.ts`
- `src/hooks/use-theme.ts`
- `src/components/watchlist/ThemeToggle.tsx`
- `src/components/watchlist/ScrollToInputFab.tsx`
- `src/components/watchlist/OnboardingDialog.tsx`
- `src/components/watchlist/ShortcutOverlay.tsx`

Edit:
- `src/routes/index.tsx` — mount theme, onboarding, shortcut overlay, FAB; tambah confirm clear logic, `?` shortcut, theme toggle di header.
- `src/components/watchlist/TickerInput.tsx` — auto-uppercase toggle + transform; confirm dialog hook.
- `src/components/watchlist/SavedWatchlists.tsx` — panggil haptic saat delete swipe.
- `src/components/watchlist/ActionButtons.tsx` — panggil haptic.

## File Map (Wave 2)

Edit:
- `src/lib/storage.ts` — field folder.
- `src/components/watchlist/SavedWatchlists.tsx` — filter chip, section per folder, drag-drop, Drawer "Move to folder".

## File Map (Wave 3)

Baru:
- `src/components/watchlist/VoiceButton.tsx`
- `src/components/watchlist/Tour.tsx`

Edit:
- `src/components/watchlist/TickerInput.tsx` — slot VoiceButton.
- `src/routes/index.tsx` — mount Tour, tombol "?" trigger.

---

## Saran Eksekusi

**Wave 1 dulu, satu push besar** — semua fitur S independen, tidak konflik satu sama lain. Setelah Wave 1 selesai dan kamu review, lanjut Wave 2 (folder), lalu Wave 3 (voice + tour) terakhir.

Kalau setuju plan ini, switch ke build mode dan saya mulai dari Wave 1.
