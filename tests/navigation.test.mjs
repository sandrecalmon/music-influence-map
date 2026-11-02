import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import cytoscape from 'cytoscape';
const code = ts.transpile(fs.readFileSync(new URL('../src/components/navigation.ts', import.meta.url), 'utf8'), { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 });
const { highlight, centeredPan } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
test('changing artist and direction preserves all nodes, edges and positions', () => {
 const cy = cytoscape({ headless: true, layout: { name: 'preset' }, elements: [
  ...['a', 'b', 'c', 'd'].map((id, i) => ({ data: { id }, position: { x: i * 330, y: i * 80 } })),
  { data: { id: 'ab', source: 'a', target: 'b' } }, { data: { id: 'bc', source: 'b', target: 'c' } }
 ] });
 const positions = cy.nodes().map(n => ({ ...n.position() }));
 highlight(cy, 'b', 'past');
 assert.ok(cy.$id('ab').hasClass('direct')); assert.ok(cy.$id('bc').hasClass('muted'));
 highlight(cy, 'b', 'future');
 assert.ok(cy.$id('bc').hasClass('direct')); assert.ok(cy.$id('ab').hasClass('muted'));
 highlight(cy, 'c', 'both');
 assert.equal(cy.$(':selected').id(), 'c');
 assert.deepEqual(cy.nodes().map(n => ({ ...n.position() })), positions);
 assert.equal(cy.nodes().length, 4); assert.equal(cy.edges().length, 2);
 highlight(cy, 'd', 'both'); assert.equal(cy.$(':selected').id(), 'd');
 cy.destroy();
});
test('camera centering shared by main graph and minimap works at different zoom levels', () => {
 for (const zoom of [0.15, 0.7, 1, 3]) {
  const p = { x: -360, y: 820 }, pan = centeredPan(1200, 700, zoom, p);
  assert.equal(p.x * zoom + pan.x, 600); assert.equal(p.y * zoom + pan.y, 350);
 }
});
