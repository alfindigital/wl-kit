import { Globe, Send } from "lucide-react";

const links = [
  { href: "https://alfindigital.com", label: "Website", Icon: Globe },
  { href: "https://t.me/alfidx", label: "Telegram", Icon: Send },
];

export function Footer() {
  return (
    <footer
      className="mt-16 border-t border-border bg-background py-6"
      style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-3 px-4 text-xs text-muted-foreground">
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
        <ul className="flex items-center gap-1">
          {links.map(({ href, label, Icon }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                title={label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
