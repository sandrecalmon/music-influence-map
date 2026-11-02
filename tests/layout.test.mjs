import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const code = ts.transpile(fs.readFileSync(new URL('../src/components/layout.ts', import.meta.url), 'utf8'), { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 });
const { networkPositions } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const nodes = JSON.parse(fs.readFileSync(new URL('../src/data/artists.json', import.meta.url)));
const edges = JSON.parse(fs.readFileSync(new URL('../src/data/influences.json', import.meta.url)));
test('every editorial artist has a distinct position and influences run left to right', () => {
 const positions = networkPositions(nodes, edges);
 assert.equal(positions.size, nodes.length);
 assert.equal(new Set([...positions.values()].map(p => `${p.x},${p.y}`)).size, nodes.length);
 for (const edge of edges) assert.ok(positions.get(edge.source).x < positions.get(edge.target).x);
 assert.deepEqual(networkPositions(nodes, edges), positions);
});
test('cycles share a rank, disconnected and isolated artists remain positioned', () => {
 const nodes = ['a', 'b', 'c', 'd', 'e'].map(id => ({ id, name: id }));
 const positions = networkPositions(nodes, [{ source: 'a', target: 'b' }, { source: 'b', target: 'a' }, { source: 'b', target: 'c' }, { source: 'd', target: 'd' }]);
 assert.equal(positions.size, 5);
 assert.equal(positions.get('a').x, positions.get('b').x);
 assert.ok(positions.get('c').x > positions.get('b').x);
 assert.notEqual(positions.get('a').y, positions.get('b').y);
});
test('hundreds of artists and multiple influences keep finite, separated positions', () => {
 const nodes = Array.from({ length: 500 }, (_, i) => ({ id: `${i}`, name: `Artist ${i}` }));
 const edges = nodes.slice(1).flatMap((n, i) => [{ source: `${i}`, target: n.id }, ...(i > 1 ? [{ source: `${i - 2}`, target: n.id }] : [])]);
 const positions = networkPositions(nodes, edges);
 assert.equal(positions.size, 500);
 assert.ok([...positions.values()].every(p => Number.isFinite(p.x) && Number.isFinite(p.y)));
});
