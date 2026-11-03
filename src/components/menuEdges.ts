import type { MenuSlot } from './menuMap';
export const MENU_COLUMN = 240;
export const MENU_ROW = 96;
export type Point = { x: number; y: number };
// Route in column gutters; long edges cross other columns in the gaps between rows.
export function menuEdgePoints(from: MenuSlot, to: MenuSlot, minColumn: number, key: string): Point[] {
 const lane = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 7 - 3;
 const sameColumn = from.column === to.column;
 const direction = to.column >= from.column ? 1 : -1;
 const start = { x: (from.column - minColumn) * MENU_COLUMN + (direction > 0 ? 200 : 40), y: (from.row + 1) * MENU_ROW + 48 };
 const end = { x: (to.column - minColumn) * MENU_COLUMN + (sameColumn || direction < 0 ? 200 : 40), y: (to.row + 1) * MENU_ROW + 48 };
 if (sameColumn) {
  const channel = start.x + 20 + lane * 4;
  return [start, { x: channel, y: start.y }, { x: channel, y: end.y }, end];
 }
 if (Math.abs(to.column - from.column) === 1) {
  const channel = (start.x + end.x) / 2 + lane * 6;
  return [start, { x: channel, y: start.y }, { x: channel, y: end.y }, end];
 }
 const exit = start.x + direction * (20 + lane * 4);
 const entry = end.x - direction * (20 - lane * 4);
 const corridor = (from.row + 2) * MENU_ROW + lane * 3;
 return [start, { x: exit, y: start.y }, { x: exit, y: corridor }, { x: entry, y: corridor }, { x: entry, y: end.y }, end];
}
export function menuEdgePath(points: Point[]) {
 return `M${points[0].x},${points[0].y}` + points.slice(1).map((point, i) => point.x === points[i].x ? ` V${point.y}` : ` H${point.x}`).join('');
}
