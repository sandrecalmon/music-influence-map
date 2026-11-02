type Node = { id: string; name: string };
type Edge = { source: string; target: string };

// Collapse strongly connected components before ranking the resulting DAG.
// Cycles stay together rather than forcing the musical network into a tree.
export function networkPositions(nodes: Node[], edges: Edge[]) {
 const adjacency = new Map(nodes.map(n => [n.id, [] as string[]]));
 for (const edge of edges) adjacency.get(edge.source)?.push(edge.target);
 let index = 0;
 const indices = new Map<string, number>(), low = new Map<string, number>();
 const stack: string[] = [], active = new Set<string>(), groups: string[][] = [];
 function visit(id: string) {
  indices.set(id, index); low.set(id, index++); stack.push(id); active.add(id);
  for (const next of adjacency.get(id) ?? []) {
   if (!indices.has(next)) { visit(next); low.set(id, Math.min(low.get(id)!, low.get(next)!)); }
   else if (active.has(next)) low.set(id, Math.min(low.get(id)!, indices.get(next)!));
  }
  if (low.get(id) === indices.get(id)) {
   const group: string[] = []; let next: string;
   do { next = stack.pop()!; active.delete(next); group.push(next); } while (next !== id);
   groups.push(group);
  }
 }
 nodes.forEach(n => { if (!indices.has(n.id)) visit(n.id); });
 const component = new Map<string, number>();
 groups.forEach((group, i) => group.forEach(id => component.set(id, i)));
 const successors = groups.map(() => new Set<number>()), indegree = groups.map(() => 0), ranks = groups.map(() => 0);
 for (const edge of edges) {
  const from = component.get(edge.source)!, to = component.get(edge.target)!;
  if (from !== to && !successors[from].has(to)) { successors[from].add(to); indegree[to]++; }
 }
 const queue = indegree.flatMap((degree, i) => degree === 0 ? [i] : []);
 for (let i = 0; i < queue.length; i++) for (const next of successors[queue[i]]) {
  ranks[next] = Math.max(ranks[next], ranks[queue[i]] + 1);
  if (--indegree[next] === 0) queue.push(next);
 }
 const columns = new Map<number, Node[]>();
 for (const node of nodes) {
  const rank = ranks[component.get(node.id)!];
  columns.set(rank, [...(columns.get(rank) ?? []), node]);
 }
 const positions = new Map<string, { x: number; y: number }>();
 for (const [rank, column] of columns) {
  column.sort((a, b) => a.name.localeCompare(b.name));
  column.forEach((node, i) => positions.set(node.id, { x: rank * 330, y: (i - (column.length - 1) / 2) * 88 }));
 }
 return positions;
}
