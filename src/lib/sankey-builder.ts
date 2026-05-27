import type { FlowNode } from "@/types";

/**
 * Build a d3-sankey-compatible graph from our flexible tree model.
 *
 * Conventions:
 *   • Every income node feeds a central virtual "Budget" node.
 *   • Each income leaf carries its own `amount`; its contribution = amount.
 *   • Category nodes auto-aggregate their descendants' totals.
 *   • If total income > total spend, a virtual "Savings" leaf absorbs the gap.
 */

export interface SankeyDatum {
  id: string;
  name: string;
  kind: "income" | "budget" | "category" | "expense" | "savings";
  amount: number;
  /** Original FlowNode reference if applicable (for hover/inspect). */
  ref?: FlowNode;
}

export interface SankeyLinkDatum {
  source: string; // id
  target: string; // id
  value: number;
}

export interface BuiltGraph {
  nodes: SankeyDatum[];
  links: SankeyLinkDatum[];
  totals: { income: number; spend: number; savings: number };
}

const BUDGET_ID = "__budget__";
const SAVINGS_ID = "__savings__";

/** Sum all expense leaves descending from a given node id. */
function subtreeTotal(nodes: FlowNode[], rootId: string): number {
  const children = nodes.filter((n) => n.parentId === rootId);
  if (children.length === 0) {
    const self = nodes.find((n) => n.id === rootId);
    return self?.amount ?? 0;
  }
  return children.reduce((sum, c) => sum + subtreeTotal(nodes, c.id), 0);
}

export function buildSankey(
  nodes: FlowNode[],
  labels: { budget: string; savings: string },
): BuiltGraph {
  const incomes = nodes.filter((n) => n.kind === "income" && n.parentId === null);
  const spendingRoots = nodes.filter((n) => n.parentId && incomes.some((i) => i.id === n.parentId));

  const totalIncome = incomes.reduce((s, n) => s + (n.amount ?? 0), 0);
  const totalSpend = spendingRoots.reduce((s, n) => s + subtreeTotal(nodes, n.id), 0);
  const savings = Math.max(0, totalIncome - totalSpend);

  const out: SankeyDatum[] = [];
  const links: SankeyLinkDatum[] = [];

  // Budget hub
  out.push({ id: BUDGET_ID, name: labels.budget, kind: "budget", amount: totalIncome });

  // Income → Budget
  for (const inc of incomes) {
    out.push({ id: inc.id, name: inc.name, kind: "income", amount: inc.amount ?? 0, ref: inc });
    if ((inc.amount ?? 0) > 0) {
      links.push({ source: inc.id, target: BUDGET_ID, value: inc.amount ?? 0 });
    }
  }

  // Recursively walk spending tree, treating each income's children as top-level categories.
  const walk = (node: FlowNode, parentSinkId: string) => {
    const total = subtreeTotal(nodes, node.id);
    if (total <= 0) return;
    const kind = nodes.some((n) => n.parentId === node.id) ? "category" : "expense";
    out.push({ id: node.id, name: node.name, kind, amount: total, ref: node });
    links.push({ source: parentSinkId, target: node.id, value: total });
    const children = nodes
      .filter((n) => n.parentId === node.id)
      .sort((a, b) => a.order - b.order);
    for (const child of children) walk(child, node.id);
  };

  for (const root of spendingRoots.sort((a, b) => a.order - b.order)) {
    walk(root, BUDGET_ID);
  }

  // Auto-savings node
  if (savings > 0.005) {
    out.push({ id: SAVINGS_ID, name: labels.savings, kind: "savings", amount: savings });
    links.push({ source: BUDGET_ID, target: SAVINGS_ID, value: savings });
  }

  return { nodes: out, links, totals: { income: totalIncome, spend: totalSpend, savings } };
}
