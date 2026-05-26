## Tujuan
Merapikan area input ticker. Auto-uppercase tetap jalan tapi tanpa ikon toggle. Tombol Sample dihilangkan. Toolbar bawah yang terlihat "nyambung paksa" dengan outline orange yang terputus diperbaiki jadi satu kesatuan visual.

## Masalah pada UI sekarang
Textarea dan toolbar bawah saat ini adalah **dua container terpisah** yang ditempel dengan trik `border-b-0` + `rounded-b-none`. Saat textarea fokus, `focus-visible:ring-2 ring-primary` hanya membungkus textarea — jadi muncul dua garis orange vertikal pendek di kiri-kanan area atas yang **tidak menyambung** ke toolbar bawah (persis seperti di screenshot). Bordernya juga dobel di garis tengah.

## Perubahan

### 1. `src/components/watchlist/TickerInput.tsx`
- **Hapus toggle Auto-UPPERCASE**: buang state `autoUpper`, `toggleUpper`, `UPPERCASE_KEY`, import `CaseSensitive`, dan tombol `AA/Aa`. Auto-uppercase **selalu aktif** — fungsi `emit()` selalu meng-uppercase input (logika preserve selection range tetap dipertahankan).
- **Hapus tombol Sample**: hapus prop `onSample`, blok `DropdownMenu` Sample, import `Sparkles`, `DropdownMenu*`, dan `SAMPLES`.
- **Satukan frame input + toolbar**:
  - Bungkus textarea + toolbar dalam satu `<div>` wrapper dengan `rounded-2xl border border-border/80 bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition`.
  - Textarea: hapus `border`, `rounded-*`, `shadow-sm`, `focus-visible:ring-*`, `border-b-0` — jadikan transparent/borderless di dalam wrapper (`border-0 bg-transparent shadow-none focus-visible:ring-0 rounded-none`), padding tetap.
  - Toolbar div: hapus `border`, `rounded-b-2xl`, `shadow-sm`. Tambahkan separator halus `border-t border-border/60` saja.
  - Drag-state indicator pindah ke wrapper (ganti styling `isDragging` ke `ring-2 ring-primary bg-primary/5`).
- Hasil: saat fokus, **satu ring orange mulus** mengelilingi seluruh kartu input. Saat tidak fokus, satu border netral. Tidak ada lagi garis terputus.

### 2. `src/routes/index.tsx`
- Hapus passing prop `onSample` ke `<TickerInput />` (sample insertion lewat tombol di dalam input dihilangkan; jika handler `handleSample` tidak dipakai lagi di tempat lain, hapus juga).
- Cek pemakaian `SAMPLES` — jika hanya dipakai TickerInput, biarkan file `lib/samples.ts` (tidak dihapus, mungkin masih dipakai onboarding/empty state).

## Yang TIDAK berubah
- Logika paste, drop file, clear + confirm dialog, shortcut Ctrl+Backspace.
- Counter "3 tickers · 1 invalid" di bawah (komponen terpisah).
- Behavior auto-uppercase itu sendiri — cuma toggle UI-nya hilang.

## Verifikasi
Setelah implementasi: cek di preview bahwa (a) fokus textarea menghasilkan satu ring orange penuh mengelilingi kartu, (b) tombol Paste & Clear tetap berfungsi, (c) ketik huruf kecil tetap otomatis jadi UPPERCASE, (d) tidak ada tombol Sample atau AA/Aa lagi.
