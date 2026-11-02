import fs from 'node:fs';
import ts from 'typescript';
import cytoscape from 'cytoscape';
const load = async path => import('data:text/javascript;base64,' + Buffer.from(ts.transpile(fs.readFileSync(path, 'utf8'), { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 })).toString('base64'));
const { networkPositions } = await load('src/components/layout.ts');
const { highlight } = await load('src/components/navigation.ts');
const artists = JSON.parse(fs.readFileSync('src/data/artists.json'));
const influences = JSON.parse(fs.readFileSync('src/data/influences.json'));
const start = performance.now();
const positions = networkPositions(artists, influences);
const layoutMs = performance.now() - start;
const cy = cytoscape({ headless: true, layout: { name: 'preset' }, elements: [
 ...artists.map(n => ({ data: { id: n.id }, position: positions.get(n.id) })),
 ...influences.map((edge, i) => ({ data: { ...edge, id: `edge${i}` } }))
] });
const before = performance.now();
for (const artist of artists) highlight(cy, artist.id, 'both');
const selectionsMs = performance.now() - before;
cy.destroy();
console.log(JSON.stringify({ artists: artists.length, relations: influences.length, layoutMs: +layoutMs.toFixed(2), allSelectionsMs: +selectionsMs.toFixed(2), environment: 'Node headless; excludes browser painting and touch latency' }, null, 2));
