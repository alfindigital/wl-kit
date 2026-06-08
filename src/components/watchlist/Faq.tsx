import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ_ITEMS = [
  {
    q: "Apa itu WatchlistKit?",
    a: "WatchlistKit adalah alat gratis berbasis browser untuk memformat dan merapikan ticker saham IDX (Bursa Efek Indonesia). Tempel ticker dalam format apa pun, lalu ekspor langsung ke TradingView, teks biasa, atau daftar baris.",
  },
  {
    q: "Bagaimana cara format ticker IDX untuk TradingView?",
    a: "Tempel daftar ticker Anda di kotak input — WatchlistKit otomatis menambahkan prefiks IDX:, menghapus duplikat, dan menampilkan hasilnya dalam format TradingView yang siap disalin ke watchlist.",
  },
  {
    q: "Apakah WatchlistKit gratis?",
    a: "Ya, sepenuhnya gratis. Tidak perlu mendaftar akun, tidak ada batasan harian, dan tidak ada iklan.",
  },
  {
    q: "Apakah data watchlist saya aman?",
    a: "Semua watchlist disimpan secara lokal di browser Anda (localStorage). Tidak ada data yang dikirim ke server — Anda bisa ekspor dan impor file JSON kapan saja sebagai cadangan.",
  },
  {
    q: "Format ekspor apa saja yang didukung?",
    a: "TradingView (BBCA,BBRI,…), teks biasa dengan koma, dan daftar baris per ticker. Anda juga bisa mengunduh hasil sebagai file .txt atau gambar PNG bermerek.",
  },
  {
    q: "Bisakah saya membagikan watchlist dengan orang lain?",
    a: "Bisa. Klik tombol Share untuk menghasilkan tautan unik berisi ticker Anda, atau buat gambar PNG yang siap dibagikan ke media sosial.",
  },
];

export function Faq() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="mx-auto mt-16 w-full max-w-2xl px-4 sm:px-6"
    >
      <h2
        id="faq-heading"
        className="font-display text-xl font-semibold tracking-tight sm:text-2xl"
      >
        Pertanyaan yang sering diajukan
      </h2>
      <Accordion type="single" collapsible className="mt-4">
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
