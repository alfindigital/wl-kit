import { Globe, Facebook, Youtube, Twitter, Send } from "lucide-react";

declare const __APP_VERSION__: string;

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.66a8.16 8.16 0 0 0 4.77 1.52V6.73a4.85 4.85 0 0 1-1.84-.04z" />
  </svg>
);

const links = [
  { href: "https://alfindigital.com", label: "Website", Icon: Globe },
  { href: "https://facebook.com/alfindigital", label: "Facebook", Icon: Facebook },
  { href: "https://youtube.com/@alfindigital", label: "YouTube", Icon: Youtube },
  { href: "https://tiktok.com/@alfindigital", label: "TikTok", Icon: TikTokIcon },
  { href: "https://x.com/alfidx", label: "X", Icon: Twitter },
  { href: "https://t.me/alfidx", label: "Telegram", Icon: Send },
];

export function Footer() {
  return (
    <footer
      className="mt-8 border-t border-border bg-background py-1.5"
      style={{ paddingBottom: "calc(0.375rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 text-sm text-muted-foreground font-sans">
        <span>
          by{" "}
          <a
            href="https://alfindigital.com"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            @alfindigital
          </a>
        </span>
        <span aria-hidden className="text-border">|</span>
        <ul className="flex items-center gap-0.5">
          {links.map(({ href, label, Icon }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                title={label}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              >
                <Icon className="h-3 w-3" />
              </a>
            </li>
          ))}
        </ul>
        <span aria-hidden className="text-border">|</span>
        <span className="text-xs text-muted-foreground/60">
          v{__APP_VERSION__}
        </span>
      </div>
    </footer>
  );
}
