import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import {
  sankey,
  sankeyLinkHorizontal,
  sankeyJustify,
  type SankeyGraph,
} from "d3-sankey";
import { useTranslation } from "react-i18next";
import { useStore, useCurrency } from "@/store/useStore";
import { buildSankey, type SankeyDatum } from "@/lib/sankey-builder";
import { formatMoney } from "@/lib/currency";

/**
 * SankeyDiagram — renders the live flow using d3-sankey.
 *
 * We forward a ref to the inner <svg> so the export utility can serialize it.
 * Resize is handled via ResizeObserver to stay responsive without a heavy hook.
 */

type Props = { svgRef: React.RefObject<SVGSVGElement | null> };

interface D3Node extends SankeyDatum {
  x0?: number; x1?: number; y0?: number; y1?: number;
  index?: number;
}
type D3Link = {};

const PALETTE: Record<SankeyDatum["kind"], string> = {
  income: "#d4ff3a",     // chartreuse — the lifeblood
  budget: "#e6e8ec",     // chalk — neutral hub
  category: "#f5a524",   // amber — spending stems
  expense: "#fb923c",    // softer orange — leaf items
  savings: "#5eead4",    // mint — the good outcome
};

export function SankeyDiagram({ svgRef }: Props) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const nodes = useStore((s) => s.nodes);
  const currency = useCurrency();

  const graph = useMemo(
    () => buildSankey(nodes, { budget: t("sankey.budget"), savings: t("sankey.savings") }),
    [nodes, t],
  );

  // Render whenever data, locale or size changes.
  useEffect(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const draw = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      // Reset SVG
      d3.select(svg).selectAll("*").remove();
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));

      // Empty-state: render hint instead of an empty canvas.
      if (graph.nodes.length <= 1 || graph.totals.income === 0) {
        const g = d3.select(svg).append("g")
          .attr("transform", `translate(${width / 2}, ${height / 2})`);
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("font-family", "Instrument Serif, serif")
          .attr("font-size", 28)
          .attr("fill", "#6b7280")
          .text(t("warnings.noIncome"));
        return;
      }

      const margin = { top: 24, right: 220, bottom: 24, left: 24 };

      // Build sankey layout
      const layout = sankey<D3Node, D3Link>()
        .nodeId((d) => d.id)
        .nodeAlign(sankeyJustify)
        .nodeWidth(14)
        .nodePadding(18)
        .extent([
          [margin.left, margin.top],
          [width - margin.right, height - margin.bottom],
        ]);

      const data: SankeyGraph<D3Node, D3Link> = layout({
        nodes: graph.nodes.map((d) => ({ ...d })),
        links: graph.links.map((d) => ({ ...d })),
      });

      // ───── Defs: per-node gradient on links (source → target color blend)
      const defs = d3.select(svg).append("defs");
      data.links.forEach((link, i) => {
        const src = link.source as D3Node;
        const tgt = link.target as D3Node;
        const grad = defs.append("linearGradient")
          .attr("id", `lg-${i}`)
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", src.x1 ?? 0).attr("x2", tgt.x0 ?? 0);
        grad.append("stop").attr("offset", "0%").attr("stop-color", PALETTE[src.kind]).attr("stop-opacity", 0.55);
        grad.append("stop").attr("offset", "100%").attr("stop-color", PALETTE[tgt.kind]).attr("stop-opacity", 0.55);
      });

      // ───── Links
      const linkLayer = d3.select(svg).append("g").attr("fill", "none");
      linkLayer
        .selectAll("path")
        .data(data.links)
        .join("path")
        .attr("class", "sankey-link")
        .attr("d", sankeyLinkHorizontal())
        .attr("stroke", (_d, i) => `url(#lg-${i})`)
        .attr("stroke-width", (d) => Math.max(1, d.width ?? 0))
        .attr("opacity", 0.78)
        .append("title")
        .text((d) => {
          const s = (d.source as D3Node).name;
          const tg = (d.target as D3Node).name;
          return `${s} → ${tg}\n${formatMoney(d.value, currency)}`;
        });

      // ───── Nodes
      const nodeLayer = d3.select(svg).append("g");
      const nodeG = nodeLayer
        .selectAll("g")
        .data(data.nodes)
        .join("g")
        .attr("class", "sankey-node");

      nodeG
        .append("rect")
        .attr("x", (d) => d.x0 ?? 0)
        .attr("y", (d) => d.y0 ?? 0)
        .attr("height", (d) => Math.max(1, (d.y1 ?? 0) - (d.y0 ?? 0)))
        .attr("width", (d) => (d.x1 ?? 0) - (d.x0 ?? 0))
        .attr("fill", (d) => PALETTE[d.kind])
        .attr("rx", 2);

      // Labels — right of node, left for terminal/edge-of-canvas
      nodeG
        .append("text")
        .attr("x", (d) =>
          (d.x0 ?? 0) < width / 2 ? (d.x1 ?? 0) + 8 : (d.x0 ?? 0) - 8,
        )
        .attr("y", (d) => ((d.y0 ?? 0) + (d.y1 ?? 0)) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", (d) => ((d.x0 ?? 0) < width / 2 ? "start" : "end"))
        .attr("font-family", "Geist, sans-serif")
        .attr("font-size", 12)
        .attr("font-weight", 500)
        .attr("fill", "#e6e8ec")
        .text((d) => d.name);

      // Amount line below name — monospaced for tabular feel
      nodeG
        .append("text")
        .attr("x", (d) =>
          (d.x0 ?? 0) < width / 2 ? (d.x1 ?? 0) + 8 : (d.x0 ?? 0) - 8,
        )
        .attr("y", (d) => ((d.y0 ?? 0) + (d.y1 ?? 0)) / 2 + 14)
        .attr("dy", "0.35em")
        .attr("text-anchor", (d) => ((d.x0 ?? 0) < width / 2 ? "start" : "end"))
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("font-size", 10)
        .attr("fill", "#9aa1ad")
        .text((d) => formatMoney(d.amount, currency));
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(container);
    return () => ro.disconnect();
  }, [graph, currency, svgRef, t]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <svg ref={svgRef} className="block h-full w-full" role="img" aria-label="Sankey diagram" />
    </div>
  );
}
