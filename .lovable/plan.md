# Validasi ticker terhadap whitelist IDX resmi

Sekarang validator cuma cek regex `^[A-Z]{4}$`, jadi token random kayak `KIJA` lolos padahal mungkin valid, tapi juga `XXXX` lolos walau bukan emiten. Plus, parser ngebuang token yang nyangkut karakter aneh (`AMMN;;`, `TLKM.TLKM`) — padahal di contoh kamu mau yang ke-extract: **AMMN, KIJA, TLKM**.

## Yang akan dikerjakan

### 1. Whitelist ticker IDX
- File baru `src/lib/idx-tickers.ts`: export `IDX_TICKERS: Set<string>` berisi 957 kode dari `Daftar_Saham_-_20260521.xlsx` (AALI…PPRO). Di-generate sekali, hard-coded sebagai array literal lalu dibungkus `new Set()`.
- Komentar di atas berisi sumber + tanggal snapshot biar gampang di-refresh manual nanti.

### 2. Tokenizer lebih agresif (`src/lib/tickers.ts`)
- Ganti split regex jadi `/[^A-Z0-9]+/` setelah uppercase. Artinya semua separator (titik, koma, semicolon, spasi, tab, newline, `:`, dll.) jadi pemisah. Ini bikin `AMMN;;.;KIJA.;.;JPFA;..;.TLCO.;;'.TKLM.TLKM` ter-tokenize jadi `AMMN, KIJA, JPFA, TLCO, TKLM, TLKM` — bukan kebuang.
- Strip prefix `IDX:` tetap (sudah ada via tokenizer baru otomatis).

### 3. Klasifikasi pakai whitelist
- `analyzeInput` di-update:
  - Token lolos kalau **ada di `IDX_TICKERS`** (bukan cuma cocok regex 4 huruf).
  - Reason invalid ditambah varian baru: `"unknown"` untuk token 4 huruf yang formatnya valid tapi tidak ada di whitelist (mis. `TKLM`, `XXXX`).
  - `"length"` & `"chars"` tetap untuk token yang bahkan tidak memenuhi `^[A-Z]{4}$`.
- `InvalidToken.reason` jadi `"length" | "chars" | "unknown"`.

### 4. UI tooltip
- `InputStats.tsx`: extend mapping reason → pesan:
  - `length` → "Must be exactly 4 letters"
  - `chars` → "Contains invalid characters"
  - `unknown` → "Not a listed IDX ticker"
- Tidak ada perubahan layout lain.

### Contoh hasil untuk input kamu
Input: `AMMN;;.;KIJA.;.;JPFA;..;.TLCO.;;'.TKLM.TLKM`
- Valid: `AMMN, KIJA, JPFA, TLCO, TLKM` (5 ticker — semua ada di IDX)
- Invalid: `TKLM` (unknown — bukan emiten terdaftar)
- Stats: `5 tickers · 1 invalid`

## File yang berubah
- **Baru**: `src/lib/idx-tickers.ts` (957 kode)
- **Edit**: `src/lib/tickers.ts` (tokenizer + whitelist check)
- **Edit**: `src/components/watchlist/InputStats.tsx` (tooltip reason "unknown")

## Out of scope
- Auto-update whitelist dari sumber online (manual refresh per snapshot file).
- Suggestion / fuzzy match ("did you mean BBCA?").
- Validasi suspended/delisted status (semua 957 dianggap valid).
