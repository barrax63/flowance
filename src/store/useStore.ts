import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FlowNode, Locale } from "@/types";
import { CURRENCIES } from "@/lib/currency";

/**
 * Global app store.
 *
 * State is persisted to localStorage so a returning visitor sees their setup —
 * the user's primary "save" mechanism is SVG export, but losing the form on
 * refresh would be hostile.
 */

const uid = () => Math.random().toString(36).slice(2, 10);

interface Actions {
  addNode: (partial: Omit<FlowNode, "id" | "order"> & { order?: number }) => string;
  updateNode: (id: string, patch: Partial<FlowNode>) => void;
  removeNode: (id: string) => void;
  reorderSiblings: (parentId: string | null, orderedIds: string[]) => void;
  setCurrency: (code: string) => void;
  setLocale: (l: Locale) => void;
  reset: () => void;
}

export interface Store {
  nodes: FlowNode[];
  currencyCode: string;
  locale: Locale;
  actions: Actions;
}

const sanitizeNodeAmount = (node: FlowNode): FlowNode =>
  node.kind === "category" ? { ...node, amount: undefined } : node;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      nodes: [],
      currencyCode: "EUR",
      locale: "de",
      actions: {
        addNode: (partial) => {
          const id = uid();
          const siblings = get().nodes.filter((n) => n.parentId === partial.parentId);
          const order = partial.order ?? siblings.length;
          const newNode = sanitizeNodeAmount({ ...partial, id, order } as FlowNode);
          set({ nodes: [...get().nodes, newNode] });
          return id;
        },
        updateNode: (id, patch) =>
          set({ nodes: get().nodes.map((n) => (n.id === id ? sanitizeNodeAmount({ ...n, ...patch }) : n)) }),
        removeNode: (id) => {
          // Cascade delete: drop the node and all descendants.
          const toDrop = new Set<string>([id]);
          let grew = true;
          while (grew) {
            grew = false;
            for (const n of get().nodes) {
              if (n.parentId && toDrop.has(n.parentId) && !toDrop.has(n.id)) {
                toDrop.add(n.id);
                grew = true;
              }
            }
          }
          set({ nodes: get().nodes.filter((n) => !toDrop.has(n.id)) });
        },
        reorderSiblings: (parentId, orderedIds) => {
          const orderMap = new Map(orderedIds.map((id, i) => [id, i]));
          set({
            nodes: get().nodes.map((n) =>
              n.parentId === parentId && orderMap.has(n.id) ? { ...n, order: orderMap.get(n.id)! } : n,
            ),
          });
        },
        setCurrency: (code) => {
          if (CURRENCIES[code]) set({ currencyCode: code });
        },
        setLocale: (l) => {
          set({ locale: l });
          localStorage.setItem("flowance.lng", l);
        },
        reset: () => set({ nodes: [] }),
      },
    }),
    {
      name: "flowance.store",
      // Persist data — but not the `actions` object.
      partialize: (s) => ({ nodes: s.nodes, currencyCode: s.currencyCode, locale: s.locale }),
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<Store> | undefined;
        if (!state) return persistedState as Store;

        if (version < 2 && Array.isArray(state.nodes)) {
          return {
            ...state,
            nodes: state.nodes.map((n) => sanitizeNodeAmount(n as FlowNode)),
          } as Store;
        }

        return {
          ...state,
          nodes: Array.isArray(state.nodes)
            ? state.nodes.map((n) => sanitizeNodeAmount(n as FlowNode))
            : [],
        } as Store;
      },
    },
  ),
);

/** Convenience selector. */
export const useCurrency = () => CURRENCIES[useStore((s) => s.currencyCode)] ?? CURRENCIES.EUR;
