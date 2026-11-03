import type { GraphIndex } from './exploration';
export type MenuSlot = { column: number; row: number };
export type MenuSlots = ReadonlyMap<string, MenuSlot>;
// Only append cards in vacant rows. Existing artists never move or duplicate.
export function expandMenu(slots: MenuSlots, selected: string, index: GraphIndex): MenuSlots {
 if (!index.names.has(selected)) return slots;
 const next = new Map(slots);
 const add = (id: string, column: number) => {
  if (next.has(id)) return;
  let row = 0;
  for (const slot of next.values()) if (slot.column === column) row = Math.max(row, slot.row + 1);
  next.set(id, { column, row });
 };
 add(selected, slots.size ? Math.max(...[...slots.values()].map(s => s.column)) + 2 : 0);
 const column = next.get(selected)!.column;
 for (const id of index.past.get(selected) ?? []) add(id, column - 1);
 for (const id of index.future.get(selected) ?? []) add(id, column + 1);
 for (const id of index.neighbors.get(selected) ?? []) add(id, column + 1);
 return next;
}
