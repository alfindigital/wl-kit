import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";


type Social = {
  href: string;
  label: string;
  handle: string;
  path: string;
};

const SOCIALS: Social[] = [
  {
    href: "https://t.me/lotmetrik",
    label: "Telegram",
    handle: "@lotmetrik",
    path: "M9.8 18.7l.3-4.2 7.7-6.9c.3-.3-.1-.5-.5-.2L7.7 13.3 3.6 12c-.9-.3-.9-.9.2-1.3L19.8 4.5c.7-.3 1.4.2 1.1 1.3l-2.7 12.8c-.2.9-.7 1.1-1.5.7L12.6 16.3l-2 1.9c-.2.2-.4.4-.8.4z",
  },
  {
    href: "https://www.instagram.com/lotmetrik",
    label: "Instagram",
    handle: "@lotmetrik",
    path: "M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4a3.9 3.9 0 0 1-1.4-.9 3.9 3.9 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 2c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1C2.6 8.5 2.6 8.9 2.6 12s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1a3.5 3.5 0 0 0-.8-1.3 3.5 3.5 0 0 0-1.3-.8c-.4-.2-1-.3-2.1-.4C15.5 4.2 15.1 4.2 12 4.2zm0 3.4a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8zm0 2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm5.6-2.3a1 1 0 1 1-2 0 1 1 0 0 1 2 0z",
  },
];

export function Footer() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [glow, setGlow] = useState({ left: "-20%", top: "0%" });
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setActive((i) => (i + 1) % SOCIALS.length);
    }, 2300);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const move = () => {
      setGlow({
        left: `${Math.random() * 120 - 30}%`,
        top: `${Math.random() * 60 - 30}%`,
      });
      timeout = setTimeout(move, 4000 + Math.random() * 4000);
    };
    move();
    return () => clearTimeout(timeout);
  }, []);

  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @keyframes afd-blink { 50% { opacity: 0 } }
        @keyframes afd-ripple {
          0% { box-shadow: 0 0 0 0 color-mix(in oklch, var(--primary) 50%, transparent) }
          100% { box-shadow: 0 0 0 22px color-mix(in oklch, var(--primary) 0%, transparent) }
        }
        .afd-foot {
          position: relative; overflow: hidden;
          font-family: inherit;
          background: var(--card, var(--background));
          border-top: 1px solid var(--border);
          padding: 10px 18px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; flex-wrap: wrap;
        }
        .afd-foot > * { position: relative; z-index: 1 }
        .afd-glow {
          position: absolute; top: -40%; bottom: -40%; width: 48%;
          border-radius: 50%; z-index: 0; pointer-events: none;
          background: radial-gradient(closest-side, color-mix(in oklch, var(--primary) 22%, transparent), transparent);
          filter: blur(8px);
          transition: left 6s ease-in-out, top 6s ease-in-out;
        }
        .afd-cr {
          font-size: 12px; color: var(--muted-foreground);
          display: inline-flex; align-items: center;
          border-left: 3px solid var(--primary);
          padding-left: 9px;
        }
        .afd-brand { color: var(--primary); font-weight: 600; text-decoration: none; margin-left: 3px }
        .afd-brand:hover { text-decoration: underline }
        .afd-caret {
          display: inline-block; width: 6px; height: 12px;
          background: var(--primary); margin-left: 3px;
          animation: afd-blink 1.1s step-end infinite;
        }
        .afd-rot { position: relative; height: 26px; min-width: 160px; flex: 0 0 auto }
        .afd-item {
          position: absolute; right: 0; top: 0; height: 26px;
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; color: var(--foreground); font-size: 12px;
          opacity: 0; transform: translateY(6px);
          transition: opacity .5s, transform .5s; pointer-events: none;
        }
        .afd-item.active { opacity: 1; transform: translateY(0); pointer-events: auto }
        .afd-item b { color: var(--primary); font-weight: 600 }
        .afd-ico {
          position: relative; width: 26px; height: 26px; border-radius: 50%;
          flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
          background: color-mix(in oklch, var(--primary) 11%, transparent);
          color: var(--primary);
          transition: background .25s, color .25s;
        }
        .afd-ico svg { width: 14px; height: 14px }
        @media (hover: hover) {
          .afd-rot:hover .afd-item.active .afd-ico {
            background: var(--primary); color: var(--card, var(--background));
          }
          .afd-rot:hover .afd-item.active .afd-ico::after {
            content: ""; position: absolute; inset: 0; border-radius: 50%;
            animation: afd-ripple 1.3s ease-out infinite;
          }
        }
        .afd-version { font-size: 10px; color: color-mix(in oklch, var(--muted-foreground) 60%, transparent); margin-left: 6px }
      `}</style>
      <footer
        className="afd-foot mt-4"
        style={{ paddingBottom: "calc(10px + env(safe-area-inset-bottom))" }}
      >
        <div className="afd-glow" style={{ left: glow.left, top: glow.top }} aria-hidden />
        <span className="afd-cr">
          © {year}
          <a
            href="https://alfindigital.com"
            target="_blank"
            rel="noopener noreferrer"
            className="afd-brand"
          >
            alfindigital
          </a>
          <span className="afd-caret" aria-hidden />
        </span>

        <div className="flex items-center gap-4">
          <div
            className="afd-rot"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {SOCIALS.map((s, idx) => (
              <a
                key={s.label}
                className={`afd-item${idx === active ? " active" : ""}`}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
              >
                <span className="afd-ico">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d={s.path} />
                  </svg>
                </span>
                <b>{s.handle}</b>
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
