import { useTranslation } from "react-i18next";
import { useStore } from "@/store/useStore";
import { CURRENCIES } from "@/lib/currency";
import { exportSvg } from "@/lib/svg-export";
import type { Locale } from "@/types";

/**
 * Top toolbar — currency picker, language toggle, export, reset.
 */
export function Toolbar({ svgRef }: { svgRef: React.RefObject<SVGSVGElement | null> }) {
  const { t, i18n } = useTranslation();
  const currencyCode = useStore((s) => s.currencyCode);
  const locale = useStore((s) => s.locale);
  const { setCurrency, setLocale, reset } = useStore((s) => s.actions);

  const onLocale = (l: Locale) => {
    setLocale(l);
    i18n.changeLanguage(l);
  };

  return (
    <header className="flex items-center justify-between gap-3 border-b border-white/5 bg-ink-900/70 px-6 py-3 backdrop-blur-xl">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-2xl italic leading-none text-chalk-50">
          Flow<span className="text-accent-lime not-italic">·</span>ance
        </span>
        <span className="hidden text-xs text-chalk-400 sm:inline">{t("app.tagline")}</span>
      </div>

      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
        {/* Currency */}
        <label className="sr-only" htmlFor="currency">{t("toolbar.currency")}</label>
        <select
          id="currency"
          className="input shrink-0 py-1.5 text-xs"
          style={{ width: "7.25rem" }}
          value={currencyCode}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {Object.values(CURRENCIES).map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code}
            </option>
          ))}
        </select>

        {/* Language toggle — segmented control */}
        <div className="inline-flex shrink-0 overflow-hidden rounded-md ring-1 ring-white/5">
          {(["de", "en"] as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => onLocale(l)}
              className={`shrink-0 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider transition ${
                locale === l ? "bg-accent-lime text-ink-950" : "bg-ink-800 text-chalk-300 hover:text-chalk-50"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <button className="btn shrink-0 whitespace-nowrap" onClick={reset}>{t("toolbar.reset")}</button>
        <button
          className="btn btn-primary shrink-0 whitespace-nowrap"
          aria-label={t("toolbar.export")}
          title={t("toolbar.export")}
          onClick={() => svgRef.current && exportSvg(svgRef.current, `flowance-${Date.now()}.svg`)}
        >
          ↓ SVG
        </button>
      </div>
    </header>
  );
}
