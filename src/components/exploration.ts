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
 return via ? [...trail, { id, via }] : [{ id }];
}
