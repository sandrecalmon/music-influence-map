import type cytoscape from 'cytoscape';
export type Direction = 'both' | 'past' | 'future';
export function highlight(cy: cytoscape.Core, selected: string, mode: Direction) {
 const node = cy.$id(selected);
 cy.batch(() => {
  cy.nodes().unselect(); node.select(); cy.elements().removeClass('muted direct');
  const connections = node.connectedEdges().filter(edge => mode === 'both' || (mode === 'past' ? edge.target().id() === selected : edge.source().id() === selected));
  cy.elements().addClass('muted'); node.removeClass('muted');
  connections.add(connections.connectedNodes()).removeClass('muted'); connections.addClass('direct');
 });
}
export function centeredPan(width: number, height: number, zoom: number, point: { x: number; y: number }) {
 return { x: width / 2 - point.x * zoom, y: height / 2 - point.y * zoom };
}
