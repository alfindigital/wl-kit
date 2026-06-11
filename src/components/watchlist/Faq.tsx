import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const FAQ_ITEMS = [
  {
    q: "What is WatchlistKit?",
    a: "WatchlistKit is a free, browser-based tool for formatting and cleaning up IDX (Indonesia Stock Exchange) ticker lists. Paste tickers in any format, then export directly to TradingView, plain text, or a line-by-line list.",
  },
  {
    q: "How do I format IDX tickers for TradingView?",
    a: "Paste your ticker list into the input box — WatchlistKit automatically adds the IDX: prefix, removes duplicates, and shows the result in a TradingView-ready format you can copy straight into your watchlist.",
  },
  {
    q: "Is WatchlistKit free?",
    a: "Yes, completely free. No account required, no daily limits, and no ads.",
  },
  {
    q: "Is my watchlist data safe?",
    a: "All watchlists are stored locally in your browser (localStorage). No data is sent to any server — you can export and import a JSON backup file at any time.",
  },
  {
    q: "Which export formats are supported?",
    a: "TradingView (IDX:BBCA,IDX:BBRI,…), plain comma-separated text, and a line-per-ticker list. You can also download the result as a .txt file or a branded PNG image.",
  },
  {
    q: "Can I share my watchlist with others?",
    a: "Yes. Click the Share button to generate a unique link containing your tickers, or create a shareable PNG image ready to post on social media.",
  },
];

export function FaqDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto rounded-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Frequently asked questions
          </DialogTitle>
        </DialogHeader>
        <Accordion type="single" collapsible className="mt-2">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}

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
        Frequently asked questions
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

