/**
 * Export the live Sankey <svg> to a standalone .svg file.
 *
 * Why inline styles? The on-screen SVG references Tailwind classes & CSS
 * variables. To make the downloaded file self-contained, we serialize a
 * cloned node with all computed styles flattened.
 */
export function exportSvg(svg: SVGSVGElement, filename = "flowance.svg") {
  const clone = svg.cloneNode(true) as SVGSVGElement;

  // Walk both trees in parallel; copy computed styles onto the clone.
  const liveEls = svg.querySelectorAll<SVGElement>("*");
  const cloneEls = clone.querySelectorAll<SVGElement>("*");
  for (let i = 0; i < liveEls.length; i++) {
    const cs = getComputedStyle(liveEls[i]);
    // Only the styles relevant for static rendering — keeps the file small.
    const props = [
      "fill", "fill-opacity", "stroke", "stroke-width", "stroke-opacity",
      "font-family", "font-size", "font-weight", "letter-spacing",
      "text-anchor", "dominant-baseline", "opacity", "mix-blend-mode",
    ];
    let style = "";
    for (const p of props) {
      const v = cs.getPropertyValue(p);
      if (v) style += `${p}:${v};`;
    }
    cloneEls[i].setAttribute("style", style);
    cloneEls[i].removeAttribute("class");
  }

  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
