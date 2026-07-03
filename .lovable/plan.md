
Asumsi: target user retail IDX yang bikin/mindahin watchlist ke TradingView, dominan mobile; sukses diukur dari retensi (buka lagi minggu depan) + share link kena klik + klik "Open in TradingView". Belum ada analytics apapun jadi semua asumsi produk masih blind.

## Critical (bug / broken flow / data loss / security)

1. [P0 | S] Ticker whitelist statis per 21 Mei 2026 di `src/lib/idx-tickers.ts` → IPO baru selalu ditandai `unknown` dan didrop. Solusi: build-time fetch dari sumber IDX (atau CSV di `public/tickers.csv`) + fallback flag `unknownButAllow` supaya ticker 4-huruf tak dikenal tetap masuk output dengan warning, bukan dibuang diam-diam.
2. [P0 | S] `handleSave` di `src/routes/index.tsx:388` tolak duplikat nama tapi UI baru terima error via toast setelah dialog tertutup (`setSaveOpen(false)` tidak dipanggil, jadi dialog stuck). Cek: dialog `SaveDialog` sudah blokir dup lokal, tapi kalau user cepat rename di tab lain (storage event), state saved bisa desync. Solusi: pass hasil save (ok/err) balik ke dialog dan tampilkan inline.
3. [P0 | S] `handleImport` (`index.tsx:478`) tidak batasi ukuran file. `importAllTXT` parse seluruh string, > 5MB bisa freeze UI di HP low-end. Solusi: reject `file.size > 1MB` (samakan dengan drop di TickerInput), plus batasi jumlah watchlist yang di-merge ke `MAX_WATCHLISTS - current.length`.
4. [P0 | S] Share URL (`buildShareUrl`) taruh seluruh ticker di query string. 500 ticker × 5 char = > 3KB, sebagian mail client & IG bio potong. Solusi: kompres LZ-string base64url untuk `t=` bila > 40 ticker, decode di route loader.
5. [P1 | M] Storage schema `v > 1` di-load `return []` (`storage.ts:32`) tanpa peringatan → user pindah dari versi baru ke lama kehilangan akses data (bukan hilang di disk, tapi terlihat kosong). Solusi: render banner "Data disimpan oleh versi lebih baru; refresh atau hubungi support" instead of silent empty.
6. [P1 | S] `wlkit.session` disimpan tanpa cap ukuran; user paste 100k baris → localStorage quota exceeded diam (hanya console.warn di DEV). Solusi: guard 200KB, drop `input` dari session kalau melebihi.
7. [P1 | S] Race di keyboard shortcut `Cmd+D` (`index.tsx:683`) meng-hijack "Bookmark this tab" di browser walaupun input tidak fokus. Solusi: hanya intercept bila `!inField` DAN `tickers.length > 0`, kalau tidak biarkan default.
8. [P1 | S] `crypto.randomUUID` dipakai di `handleSave` tanpa fallback; iOS lama / non-HTTPS embed crash. Solusi: helper `newId()` yang fallback ke `${Date.now()}-${Math.random().toString(36).slice(2)}` (sudah dipakai di `storage.ts`, konsistenkan).

## UI

9. [P1 | S] Hero title `<em>Instantly.</em>` pakai `font-display` serif italic ala Instrument Serif tapi tag hanya `<em>` tanpa class font, sehingga tergantung inheritance dari h1. Verifikasi + hardcode `font-display italic` untuk konsistensi (screenshot tampak sudah oke tapi rapuh).
10. [P1 | S] `Footer.tsx` inject `<style>` inline setiap mount (117 baris CSS) di setiap route. Solusi: pindah ke `styles.css` dengan prefix `.afd-*` agar tidak duplikat & bisa di-tree-shake.
11. [P2 | S] `OutputBlock` dan `TickerInput` pakai `rounded-2xl` + shadow yang identik, di layar sempit dua kartu terasa "double". Solusi: hilangkan shadow pada `OutputBlock` (biar terasa jadi kelanjutan `FormatTabs`), atau padatkan jadi satu kartu terpadu `input + tabs + output`.
12. [P2 | S] Sort popover di `OutputBlock` (`h-7 w-7`) dan Copy pakai icon 3.5×3.5 → tap target < 32px, di bawah rekomendasi. Naikkan ke `h-8 w-8` khusus mobile.
13. [P3 | S] Tanggal hero `dateStr` re-render tiap render tanpa memo & pakai `en-GB` walau app English-US. Ubah ke `en-US` konsisten dan `useMemo`.

## UX flow

14. [P0 | S] Setelah user paste tickers, tidak ada auto-scroll ke output di mobile → user paste, tak lihat hasil, mengira gagal. Solusi: bila `tickers.length` naik dari 0 ke > 0 dan viewport < 640, `formatStepRef.current?.scrollIntoView({block:"start"})`.
14a. [P1 | S] "Open in TradingView" hanya buka chart symbol pertama; user mengira watchlist ke-import. Solusi: ubah label jadi "Open first ticker + copy list", plus toast persistent 8 detik dengan langkah paste ke watchlist (link ke `/guides/import-to-tradingview` tetap ada).
15. [P1 | S] Ganti format (Tab TradingView/Plain/Newline) auto-copy ke clipboard (`handleFormatChange`) → user cuma mau lihat preview, malah nimpa clipboard. Solusi: auto-copy hanya kalau user klik tab yang sudah aktif (double-tap), atau tampilkan toast "Copied" dengan Undo yang restore clipboard sebelumnya.
16. [P1 | S] Invalid/unknown tickers tidak ditampilkan di UI (`analysis.invalid` tidak dirender). User paste 20 ticker, 3 di-drop, tidak tahu. Solusi: chip "3 unrecognized (BUMII, XYZW…) — Fix?" di bawah `OutputBlock`, klik untuk highlight di textarea.
17. [P2 | S] Load watchlist dari `SavedWatchlists` mengganti input tanpa konfirmasi ketika ada tickers yg belum di-save. Solusi: kalau `input` non-empty dan berbeda dari `loadedName`, tampil AlertDialog "Replace current input?".
18. [P2 | S] `SaveDialog` tidak preview jumlah ticker padahal `tickerCount` prop sudah dihapus (user request sebelumnya). Kompromi: tampil `{count} tickers` sebagai muted subtitle bawah input, bukan `DialogDescription`.

## Fitur core

19. [P0 | M] Belum ada mode "Edit watchlist yang di-load" — user Load → edit textarea → harus Save As baru (dup) atau overwrite manual. Solusi: kalau `loadedName` diset, tombol Save berubah jadi "Update {name}" + dropdown "Save as new". Track `dirty` bit dari input vs original tickers.
20. [P1 | M] Tambah bulk paste dari **screenshot** IDX Mobile: OCR via `tesseract.js` di worker (lazy load 500KB) untuk foto watchlist RTI/Stockbit. Niche tapi jadi hook viral.
21. [P1 | S] Sektor tag otomatis: pakai lookup `IDX_TICKERS` diperkaya dengan sektor IDX-IC (Financial, Energy, dll). Chip filter di atas `OutputBlock`: "Financials (3), Energy (5)". Data statis, gampang.
22. [P1 | S] "Quick presets": tombol chips di bawah TickerInput saat kosong — "LQ45", "IDX30", "IDX-BUMN20". Load array statis, drop ke input. Ini onboarding + growth.
23. [P2 | M] Diff watchlist saat ini vs saved: user load watchlist lama, edit, lalu klik "Compare with saved" langsung → reuse `diffTickers`, tampilkan added/removed pill di atas output.
24. [P2 | S] Export ke `.csv` kolom `Symbol,Exchange` supaya cocok import Yahoo Finance & Stockbit. Sudah punya `.txt`, tambah 30 baris.
25. [P3 | M] Multi-watchlist tab bar di atas OutputBlock (mirip browser tab) supaya user bandingkan 2-3 list tanpa buka drawer.

## Onboarding

26. [P1 | S] `OnboardingTour` (`index.tsx:916`) langsung muncul saat first paint sebelum konten selesai animasi, di mobile spotlight overlap header. Solusi: delay `setOnboardingActive(true)` sampai `requestIdleCallback` atau `setTimeout(300)`.
27. [P1 | S] Tour step 4 sebut "long-press or use the menu to delete" — tidak akurat, delete di mobile via drawer "More", swipe hanya di desktop-mode. Sinkronkan copy dengan implementasi.
28. [P2 | S] Setelah tour selesai, tidak ada CTA "Try with sample data". Tambah tombol "Load 10 sample tickers" di step terakhir untuk jump-start.
29. [P2 | S] Empty state `SavedWatchlists` cuma "No saved watchlists yet." — tidak menuntun. Ganti dengan ilustrasi + tombol "Save your first watchlist" yang buka SaveDialog.

## Data (persistence / export / backup)

30. [P0 | M] `.txt` backup tidak encode versi schema per-item, kalau di-import ke versi baru dengan field baru akan hilang. Solusi: tambah `# schema: 1` di header + strict version bump policy; refuse import kalau `schema > EXPORT_FORMAT_VERSION`.
31. [P1 | S] `MAX_WATCHLISTS = 20` hard-coded, user power > 20 mentok. Solusi: naikkan ke 50 + peringatan storage estimate via `navigator.storage.estimate()`.
32. [P1 | M] Cloud sync opsional lewat Lovable Cloud (Supabase) — device-to-device tanpa akun via one-time sync code (magic link 6 digit). Bukan sign-in wajib, opt-in.
33. [P2 | S] `lastUsedAt` di-track tapi tidak ditampilkan di UI. Tambah kolom "Last used 3d ago" di `SavedWatchlists` untuk sortir behavior.
34. [P2 | S] Auto-backup: setiap Sunday, prompt "Download backup?" pakai `Notification` opt-in atau just toast. Persistensi via `wlkit.lastBackupPrompt`.

## Performance

35. [P1 | S] `IDX_TICKERS` di-bundle 960 string ke JS main → ~14KB gzipped. Solusi: split ke `public/tickers.txt` dan lazy-fetch pada mount pertama, cache di `sessionStorage`. Selain itu simpan sebagai plain string dgn `.split(",")` di runtime (bundle turun ~40%).
36. [P1 | S] Onboarding tour + shortcut overlay + command palette + share dialogs semua di-mount statis, walau tak dipakai. Dynamic import via `React.lazy` untuk `CommandPalette`, `ShareImageDialog`, `ShareLinkDialog`, `OnboardingTour`.
37. [P2 | S] `useEffect` keyboard shortcut re-attach setiap `output/tickers.length/saved.length/input` berubah (`index.tsx:713`) → ratusan add/removeEventListener saat mengetik. Bungkus handler dalam `useRef` yang selalu ke-update, listener di-attach sekali.
38. [P2 | S] `analyzeInput` jalan tiap keystroke tanpa debounce untuk input > 5KB. Debounce 80ms untuk hasil non-blocking.

## Mobile / responsive

39. [P0 | S] Sticky header desktop (`sticky top-0 z-30`) di mobile masih ada padahal user request "headless" sebelumnya (ada history). Verifikasi ulang, mungkin header masih render di `sm:hidden` breakpoint yang salah. Jika benar, jadikan floating pill full-mobile.
40. [P1 | S] Tap on `Open in TradingView` di iOS Safari sering blocked karena `window.open` di async handler. Solusi: buka window dulu, isi URL setelah copy.
41. [P1 | S] Drawer `SavedWatchlists` di mobile pakai `pb-safe` tapi content di-scroll di dalam `DrawerContent` → di iPhone landscape header ke-cut. Tambah `max-h-[85dvh]` + `overflow-y-auto`.
42. [P2 | S] `Textarea` `min-h-[88px]` di mobile terlalu pendek untuk paste 30+ baris; auto-grow max 360 bagus, tapi cap-nya bikin scroll dalam scroll. Naikkan cap mobile ke 60dvh.

## Trust

43. [P1 | S] Copy hero + FAQ tidak sebut "Data disimpan hanya di browser Anda, tidak dikirim ke server". Trust cue eksplisit di bawah input: badge kecil "Offline · No account · Data stays on your device".
44. [P1 | S] Tidak ada Privacy page atau `/privacy` route. Buat 1 halaman statis (150 kata) menegaskan zero-server, plus link di footer.
45. [P2 | S] "Made with WatchlistKit" di `ShareCard` — tambah versi tanggal snapshot ticker & disclaimer "Not investment advice" biar aman disclaimer.
46. [P2 | S] Meta author `alfindigital` sudah ada, tapi tidak ada "Contact / Feedback" link. Tambah `mailto:` atau form di footer.

## Monetisasi / konversi

47. [P2 | M] Sponsor slot 1 kartu di bawah OutputBlock ketika `tickers.length > 0`: label "Sponsored by [broker]" — target broker/PPKM Indonesia. Non-intrusif, opt-out via localStorage flag (bila user share ke publik).
48. [P2 | S] Affiliate deep-link ke TradingView Pro upgrade (`?aff=alfindigital`) di dialog Share dan Guide. TradingView punya program referral yang bayar per subscription.
49. [P3 | M] "Buy me a coffee" / Trakteer button subtle di footer, cocok untuk audiens IDX Indonesia. Hindari popup.

## Retensi

50. [P1 | S] Zero "return trigger" — user selesai, tutup tab, lupa. Tambah PWA install prompt custom setelah 2 kali visit (`localStorage.wlkit.visits`).
51. [P2 | S] Weekly digest email opt-in via Resend + Lovable Cloud: kirim ringkasan movers dari watchlist tersimpan. Ini butuh email capture kecil di footer.
52. [P2 | S] Recent watchlists (yang di-load minggu ini) tampil sebagai chip di header (mirip Notion recent) — 1 klik load ulang.
53. [P3 | S] Streak counter subtle: "Used 3 weeks in a row" di footer — appeal ke user retail yg self-track.

## Growth

54. [P1 | S] Open Graph image saat share link tickers-spesifik masih pakai OG statis default. Solusi: server route `/api/public/og?t=BUMI,ANTM` yang render PNG dinamis (tanstack server-route + `satori` atau canvas). Tiap share jadi thumbnail unik → CTR naik.
55. [P1 | S] `/guides/import-to-tradingview` sudah ada; expand ke katalog: `/guides/lq45`, `/guides/idx30-vs-bumn`, `/guides/screener-tradingview`. Setiap guide sekaligus preseeds watchlist via CTA "Open in WatchlistKit".
56. [P2 | S] Embed widget: `<iframe src="…/embed?t=BUMI,ANTM">` supaya blogger IDX bisa taruh watchlist di post. Backlink otomatis.
57. [P2 | S] Referral share text di `ShareLinkDialog` sekarang plain URL. Tambah `title` "Cek watchlist IDX saya" dan hashtag `#IDX` biar copy-paste ke X lebih menarik.

## Teknis

58. [P0 | S] Belum ada analytics/error reporting. Tambah Plausible (self-hosted, GDPR-safe) atau lovable-analytics untuk basic event: `paste`, `format_change`, `save`, `share`, `open_tradingview`. Tanpa ini semua improvement adalah tebakan.
59. [P1 | S] `guideOpen` state URL-driven via `?guide=tradingview` tapi tidak divalidate saat URL manual, dan tidak nutup ketika navigate to `/faq`. Verifikasi flow.
60. [P1 | S] Test coverage: hanya 3 test files (`idx-tickers.test.ts`, `storage.test.ts`, `tickers.test.ts`). Belum ada test untuk `importAllTXT` legacy JSON, `parseTXT` edge cases (empty section, komentar). Tambah 6-8 case.
61. [P2 | S] `console.warn` sudah di-gate `import.meta.env.DEV`, tapi `console.error` di `AppErrorBoundary` (`__root.tsx:26`) juga di DEV only — di prod error bisu. Kirim ke Sentry/lovable-logs opt-in.
62. [P2 | S] `sw.js` di `public/` register tanpa versioning strategy visible. Verifikasi cache-busting kalau deploy baru, atau pindah ke Workbox precache manifest generated at build.
63. [P3 | S] TypeScript `SearchParams` di `handleFormatChange` cast manual (`prev: SearchParams`) berulang. Refactor jadi typed helper `updateSearch(patch)`.

---

## Top 10 urutan eksekusi lintas kategori

1. #58 Analytics dulu — tanpa ini semua prioritas berikut buta.
2. #1 IDX ticker whitelist fallback — data loss diam-diam paling parah.
3. #14 Auto-scroll ke output di mobile — fundamental usability first-touch.
4. #3 Batasi ukuran & jumlah import — data corruption / freeze.
5. #39 Verifikasi header mobile headless — regression from prior ask.
6. #19 Edit mode "Update {name}" — flow saat ini paksa duplikat.
7. #4 Kompres share URL — share link long = broken di banyak platform.
8. #16 Tampilkan invalid tickers — trust + iteration cepat.
9. #15 Hentikan auto-copy on format change — clipboard hijack.
10. #22 Quick presets (LQ45/IDX30) — onboarding + growth combined.

## 3 ide yang sengaja tidak disarankan + trade-off

- **User accounts + wajib login.** Trade-off: gain sync & analytics per user, tapi bunuh proposition "no account, offline". Cukup opt-in sync code (#32) untuk 80% value.
- **Real-time harga saham inline di output.** Trade-off: WOW factor tinggi, tapi butuh API IDX (bayar / rate-limit), delay news, dan menggeser positioning dari "formatter" jadi "quote app" yang saturated (Stockbit/RTI). Fokus tetap: formatting + hand-off ke TradingView.
- **AI chat "explain this watchlist".** Trade-off: novelty tinggi, tapi Lovable AI credit cost per user, jawaban finansial berisiko regulatoris (OJK). Kalau mau, cukup deterministic sector-breakdown (#21) tanpa LLM.
