import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "react-i18next";
import { useStore, useCurrency } from "@/store/useStore";
import type { FlowNode } from "@/types";
import { formatMoney } from "@/lib/currency";

/**
 * SidePanel — the form interface for editing nodes.
 *
 * Layout: Income list on top, then a tree of spending categories. Drag handles
 * reorder siblings only; nesting is changed via the [+] inside a category.
 */

export function SidePanel() {
  const { t } = useTranslation();
  const nodes = useStore((s) => s.nodes);
  const { addNode } = useStore((s) => s.actions);

  const incomes = nodes
    .filter((n) => n.kind === "income" && n.parentId === null)
    .sort((a, b) => a.order - b.order);

  // The first income is the "root" of spending; if none, render an empty hint.
  const primaryIncome = incomes[0];

  return (
    <aside className="flex h-full w-[380px] shrink-0 flex-col border-r border-white/5 bg-ink-900/80 backdrop-blur-xl">
      <Section
        title={t("panel.income")}
        action={
          <button
            className="btn btn-ghost"
            onClick={() =>
              addNode({ name: t("placeholder.income") as string, kind: "income", amount: 0, parentId: null })
            }
          >
            + {t("panel.addIncome")}
          </button>
        }
      >
        <NodeList items={incomes} parentId={null} />
      </Section>

      <Section title={t("panel.spendings")}>
        {primaryIncome ? (
          <TreeBranch parent={primaryIncome} depth={0} />
        ) : (
          <p className="text-xs text-chalk-400">{t("panel.empty")}</p>
        )}
        <p className="mt-4 text-[11px] leading-relaxed text-chalk-400">
          {t("panel.savingsNote")}
        </p>
      </Section>
    </aside>
  );
}

/* ─────────────────────────── pieces ─────────────────────────── */

function Section({
  title, action, children,
}: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-white/5 p-5">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg leading-none text-chalk-50">{title}</h2>
        {action}
      </header>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function TreeBranch({ parent, depth }: { parent: FlowNode; depth: number }) {
  const { t } = useTranslation();
  const nodes = useStore((s) => s.nodes);
  const { addNode } = useStore((s) => s.actions);

  const children = nodes
    .filter((n) => n.parentId === parent.id)
    .sort((a, b) => a.order - b.order);

  return (
    <div style={{ marginLeft: depth === 0 ? 0 : 12 }} className={depth > 0 ? "border-l border-white/5 pl-3" : ""}>
      <NodeList items={children} parentId={parent.id} />
      <div className="mt-2 flex gap-2">
        <button
          className="btn btn-ghost text-[11px]"
          onClick={() =>
            addNode({ name: t("placeholder.category") as string, kind: "category", parentId: parent.id })
          }
        >
          + {t("panel.addCategory")}
        </button>
        <button
          className="btn btn-ghost text-[11px]"
          onClick={() =>
            addNode({ name: t("placeholder.expense") as string, kind: "expense", amount: 0, parentId: parent.id })
          }
        >
          + {t("panel.addExpense")}
        </button>
      </div>
      {children
        .filter((c) => c.kind === "category" || nodes.some((n) => n.parentId === c.id))
        .map((c) => (
          <div key={`branch-${c.id}`} className="mt-2">
            <div className="mb-1 px-1 text-[10px] uppercase tracking-widest text-chalk-400">
              ↳ {c.name}
            </div>
            <TreeBranch parent={c} depth={depth + 1} />
          </div>
        ))}
    </div>
  );
}

function NodeList({ items, parentId }: { items: FlowNode[]; parentId: string | null }) {
  const { reorderSiblings } = useStore((s) => s.actions);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((n) => n.id === active.id);
    const newIndex = items.findIndex((n) => n.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    reorderSiblings(parentId, arrayMove(items, oldIndex, newIndex).map((n) => n.id));
  };

  if (items.length === 0) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-1.5">
          {items.map((n) => (
            <SortableRow key={n.id} node={n} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ node }: { node: FlowNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <li ref={setNodeRef} style={style}>
      <NodeRow node={node} dragHandle={
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-chalk-400 hover:text-chalk-100 active:cursor-grabbing"
          aria-label="Drag to reorder"
          tabIndex={-1}
        >
          ⋮⋮
        </button>
      } />
    </li>
  );
}

function NodeRow({ node, dragHandle }: { node: FlowNode; dragHandle: React.ReactNode }) {
  const { t } = useTranslation();
  const { updateNode, removeNode } = useStore((s) => s.actions);
  const currency = useCurrency();
  const hasChildren = useStore((s) => s.nodes.some((n) => n.parentId === node.id));
  const [editing, setEditing] = useState(false);

  // Show the computed total for parent categories (read-only).
  const isParent = hasChildren && node.kind !== "income";

  return (
    <div className="group flex items-center gap-2 rounded-md bg-ink-800/60 px-2 py-1.5 ring-1 ring-white/5 hover:ring-white/10">
      {dragHandle}

      <KindDot kind={node.kind} />

      <input
        className="min-w-0 flex-1 bg-transparent text-sm text-chalk-100 outline-none placeholder:text-chalk-400"
        value={node.name}
        onChange={(e) => updateNode(node.id, { name: e.target.value })}
        onFocus={() => setEditing(true)}
        onBlur={() => setEditing(false)}
      />

      {isParent ? (
        <span className="font-mono text-[11px] text-chalk-300">
          {formatMoney(0, currency).replace(/[\d.,]+/, "·")}
        </span>
      ) : (
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          className="w-24 rounded bg-ink-700/60 px-2 py-1 text-right font-mono text-[12px] text-chalk-100 outline-none ring-1 ring-white/5 focus:ring-accent-lime/50"
          value={node.amount ?? 0}
          onChange={(e) => updateNode(node.id, { amount: Math.max(0, Number(e.target.value) || 0) })}
        />
      )}

      <button
        className={`text-chalk-400 hover:text-accent-rose ${editing ? "" : "opacity-0 group-hover:opacity-100"} transition`}
        title={t("fields.delete") as string}
        onClick={() => removeNode(node.id)}
      >
        ×
      </button>
    </div>
  );
}

function KindDot({ kind }: { kind: FlowNode["kind"] }) {
  const color =
    kind === "income" ? "bg-accent-lime"
    : kind === "category" ? "bg-accent-amber"
    : "bg-orange-400";
  return <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} aria-hidden />;
}
