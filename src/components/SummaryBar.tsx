import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useStore, useCurrency } from "@/store/useStore";
import { buildSankey } from "@/lib/sankey-builder";
import { formatMoney } from "@/lib/currency";

/**
 * SummaryBar — compact KPI strip beneath the toolbar.
 * Renders totals + an overspend warning when applicable.
 */
export function SummaryBar() {
  const { t } = useTranslation();
  const nodes = useStore((s) => s.nodes);
  const currency = useCurrency();

  const { totals } = useMemo(
    () => buildSankey(nodes, { budget: "", savings: "" }),
    [nodes],
  );

  const overspend = totals.spend - totals.income;
  const rate = totals.income > 0 ? Math.max(0, totals.savings / totals.income) : 0;

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-white/5 bg-ink-900/40 px-6 py-3 text-xs">
      <Stat label={t("summary.income")} value={formatMoney(totals.income, currency)} accent="lime" />
      <Stat label={t("summary.spendings")} value={formatMoney(totals.spend, currency)} accent="amber" />
      <Stat label={t("summary.savings")} value={formatMoney(totals.savings, currency)} accent="mint" />
      <Stat label={t("summary.rate")} value={`${(rate * 100).toFixed(1)} %`} accent="mint" />

      {overspend > 0 && (
        <div className="ml-auto flex items-center gap-2 rounded-md bg-accent-rose/10 px-3 py-1.5 text-accent-rose ring-1 ring-accent-rose/30">
          <span className="font-mono">▲</span>
          <span>{t("warnings.overspend", { amount: formatMoney(overspend, currency) })}</span>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: "lime" | "amber" | "mint" }) {
  const dot =
    accent === "lime" ? "bg-accent-lime"
    : accent === "amber" ? "bg-accent-amber"
    : "bg-accent-mint";
  return (
    <div className="flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      <span className="uppercase tracking-wider text-chalk-400">{label}</span>
      <span className="font-mono text-chalk-50">{value}</span>
    </div>
  );
}
