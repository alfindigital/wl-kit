import { useI18n } from "@/lib/i18n";

/** Compact EN/ID language switch for the app header. */
export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className="flex items-center rounded-full border border-border/60 bg-card/60 p-0.5 text-xs font-medium"
    >
      {(["en", "id"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2 py-1 uppercase transition-colors ${
            lang === l
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
