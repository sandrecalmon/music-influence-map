export type ArtistNode = { id: string; name: string };
export type Link = { source: string; target: string; kind?: string };
export type Side = 'past' | 'future';
export type MoveKey = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown';
export type NavigationSession = { origin: string; side: Side; candidates: string[]; index: number };
export function graphIndex(artists: ArtistNode[], edges: Link[]) {
 const names = new Map(artists.map(a => [a.id, a.name]));
 const incoming = new Map(artists.map(a => [a.id, new Set<string>()]));
 const outgoing = new Map(artists.map(a => [a.id, new Set<string>()]));
 const neighbors = new Map(artists.map(a => [a.id, new Set<string>()]));
 for (const edge of edges) {
  if (!names.has(edge.source) || !names.has(edge.target)) continue;
  neighbors.get(edge.source)!.add(edge.target); neighbors.get(edge.target)!.add(edge.source);
  if (edge.kind === 'continuity') continue;
  incoming.get(edge.target)!.add(edge.source); outgoing.get(edge.source)!.add(edge.target);
 }
 const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });
 const order = (ids: Set<string>) => [...ids].sort((a, b) => collator.compare(names.get(a)!, names.get(b)!) || a.localeCompare(b));
 return { names, neighbors, past: new Map([...incoming].map(([id, values]) => [id, order(values)])), future: new Map([...outgoing].map(([id, values]) => [id, order(values)])) };
}
export type GraphIndex = ReturnType<typeof graphIndex>;
export function reveal(discovered: ReadonlySet<string>, id: string, index: GraphIndex) {
 if (!index.names.has(id)) return new Set(discovered);
 return new Set([...discovered, id, ...(index.neighbors.get(id) ?? [])]);
}
export function nextMove(selected: string, session: NavigationSession | null, key: MoveKey, index: GraphIndex) {
 let next = session;
 if (key === 'ArrowLeft' || key === 'ArrowRight' || !next) {
  const side = key === 'ArrowRight' ? 'future' : key === 'ArrowLeft' ? 'past' : session?.side ?? 'past';
  const candidates = index[side].get(selected) ?? [];
  next = { origin: selected, side, candidates, index: key === 'ArrowUp' ? candidates.length - 1 : 0 };
 } else {
  const count = next.candidates.length;
  next = { ...next, index: count ? (next.index + (key === 'ArrowDown' ? 1 : -1) + count) % count : 0 };
 }
 return { candidate: next.candidates[next.index] ?? selected, session: next, empty: next.candidates.length === 0 };
}
export function isTyping(target: EventTarget | null) {
 return target instanceof Element && !!target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="application"]');
}

export type ExplorationStep = { id: string; via?: Side };
// Revisiting an ancestor removes only the suffix opened from it.
export function advanceTrail(trail: ExplorationStep[], id: string, index: GraphIndex, direction?: Side): ExplorationStep[] {
 if (!index.names.has(id)) return trail;
 const previous = trail.findIndex(step => step.id === id);
 if (previous >= 0) return trail.slice(0, previous + 1);
 const current = trail[trail.length-1]?.id;
 const via = current && direction && index[direction].get(current)?.includes(id) ? direction
  : current && index.future.get(current)?.includes(id) ? 'future'
  : current && index.past.get(current)?.includes(id) ? 'past' : undefined;
 if (!via) return [{ id }];
 const last = trail[trail.length - 1];
 const base = last?.via && last.via !== via ? [{ id: last.id }] : trail;
 return [...base, { id, via }];
}

// Vertical movement belongs to the displayed column, not just direct musical neighbors.
export function moveInMenu(selected: string, session: NavigationSession | null, key: MoveKey, index: GraphIndex, slots: ReadonlyMap<string, { column: number; row: number }>, previousArtist?: string) {
 if (key === 'ArrowLeft' || key === 'ArrowRight') {
  const side: Side = key === 'ArrowLeft' ? 'past' : 'future';
  const pending = session?.candidates[session.index];
  const currentColumn = slots.get(selected)?.column;
  const sideOf = (id: string): Side | undefined => {
   const column = slots.get(id)?.column;
   if (column === undefined || currentColumn === undefined || column === currentColumn) return undefined;
   return column < currentColumn ? 'past' : 'future';
  };
  if (session && pending && pending !== selected && (sideOf(pending) ?? session.side) !== side) {
   return { candidate: selected, session: { origin: selected, side, candidates: [selected], index: 0 }, empty: false };
  }
  const next = nextMove(selected, session, key, index);
  if (previousArtist) {
   const previousSide = sideOf(previousArtist) ??
    (index.past.get(selected)?.includes(previousArtist) ? 'past' :
     index.future.get(selected)?.includes(previousArtist) ? 'future' : undefined);
   if (previousSide === side) {
    const candidates = next.session.candidates;
    const previousIndex = candidates.indexOf(previousArtist);
    return {
     candidate: previousArtist,
     session: {
      ...next.session,
      candidates: previousIndex < 0 ? [previousArtist, ...candidates] : candidates,
      index: Math.max(0, previousIndex),
     },
     empty: false,
    };
   }
  }
  return next;
 }
 const anchor = session?.candidates[session.index] ?? selected;
 const position = slots.get(anchor);
 if (!position) return nextMove(selected, session, key, index);
 const candidates = [...slots].filter(([, slot]) => slot.column === position.column)
  .sort((a, b) => a[1].row - b[1].row).map(([id]) => id);
 const offset = candidates.indexOf(anchor);
 const nextIndex = (offset + (key === 'ArrowUp' ? -1 : 1) + candidates.length) % candidates.length;
 const side = session?.side ?? (position.column < (slots.get(selected)?.column ?? position.column) ? 'past' : 'future');
 return { candidate: candidates[nextIndex], session: { origin: selected, side, candidates, index: nextIndex }, empty: false };
}
