/**
 * Domain types.
 *
 * The data model is intentionally flexible: a flat array of nodes connected by
 * `parentId`, supporting arbitrary nesting. Leaves with `amount` carry real
 * monetary values; parent nodes auto-aggregate from their children.
 */

export type NodeKind = "income" | "category" | "expense";

export interface FlowNode {
  id: string;
  name: string;
  kind: NodeKind;
  /** Monetary value for leaves. Ignored for non-leaf categories (computed). */
  amount?: number;
  /** Null for income roots; otherwise references parent FlowNode.id. */
  parentId: string | null;
  /** Sibling ordering (lower = first). */
  order: number;
  /** Optional accent color override (hex). */
  color?: string;
}

export type Locale = "en" | "de";

export interface Currency {
  code: string;      // ISO 4217
  symbol: string;
  /** Intl.NumberFormat locale, distinct from UI locale. */
  numberLocale: string;
}

export interface AppState {
  nodes: FlowNode[];
  currency: Currency;
  locale: Locale;
  /** Show Sparen (Savings) node when income > spendings. */
  autoSavings: boolean;
}
