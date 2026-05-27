import { useRef } from "react";
import { Toolbar } from "@/components/Toolbar";
import { SidePanel } from "@/components/SidePanel";
import { SankeyDiagram } from "@/components/SankeyDiagram";
import { SummaryBar } from "@/components/SummaryBar";

/**
 * App shell — three-zone layout: toolbar / [side panel | canvas].
 *
 * The SVG ref is owned here so the toolbar's export button can serialize the
 * diagram without prop-drilling through the canvas component.
 */
export default function App() {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden text-chalk-100">
      <Toolbar svgRef={svgRef} />
      <SummaryBar />
      <main className="flex min-h-0 flex-1">
        <SidePanel />
        <section className="relative flex-1 overflow-hidden">
          {/* Decorative grid backdrop */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
            }}
          />
          <SankeyDiagram svgRef={svgRef} />
        </section>
      </main>
      <footer className="border-t border-white/5 px-6 py-2 text-[10px] uppercase tracking-widest text-chalk-400">
        Flowance · v1.0
      </footer>
    </div>
  );
}
