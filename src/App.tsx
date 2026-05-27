import { useRef } from "react";
import { Toolbar } from "@/components/Toolbar";
import { SidePanel } from "@/components/SidePanel";
import { SankeyDiagram } from "@/components/SankeyDiagram";
import { SummaryBar } from "@/components/SummaryBar";

/**
 * App shell — desktop split view, mobile sidebar-only editor.
 *
 * The SVG ref is owned here so the toolbar's export button can serialize the
 * off-screen diagram renderer while the on-screen chart remains desktop-only.
 */
export default function App() {
  const exportSvgRef = useRef<SVGSVGElement>(null);
  const liveSvgRef = useRef<SVGSVGElement>(null);

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden text-chalk-100">
      <Toolbar svgRef={exportSvgRef} />
      <SummaryBar />
      <main className="flex min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4 md:overflow-hidden">
        <SidePanel />

        <section className="relative ml-4 hidden min-h-0 flex-1 overflow-hidden rounded-xl border border-white/5 bg-ink-900/30 md:block">
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
          <SankeyDiagram svgRef={liveSvgRef} />
        </section>
      </main>

      {/* Keep an off-screen renderer so export still works without a live preview. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[99999px] top-0 h-[720px] w-[1280px] overflow-hidden opacity-0"
      >
        <SankeyDiagram svgRef={exportSvgRef} />
      </div>

      <footer className="border-t border-white/5 px-4 py-2 text-[10px] uppercase tracking-widest text-chalk-400 sm:px-6">
        Flowance · v1.2.0
      </footer>
    </div>
  );
}
