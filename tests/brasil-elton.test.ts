import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import artists from '../src/data/artists.json';
import edges from '../src/data/influences.json';
import evidence from '../src/data/evidence.json';
import manifest from '../docs/brasil-elton-manifest.json';
import { graphIndex, nextMove, reveal } from '../src/components/exploration';

const index = graphIndex(artists, edges);
const key = (e: { source: string; target: string }) => `${e.source}->${e.target}`;

describe('Brazil and Elton John curation batch', () => {
 it.each([
  ['artists', artists, 352, 'b444c9d22f55f076db6501f0d663814687ae32b921fb06ac932d98823c7d8e17'],
  ['relations', edges, 470, 'd6118dc04f5d0691793292bd8c66d9a01aa38bc5883e0035e3d9295afdb7eca9'],
  ['source ledger', evidence, 476, 'a6d669399f4f9a65ac1d3398a1229db6ad090634c99f3180beeb7a21825d7519'],
 ] as const)('preserves all pre-existing %s without editorial changes', (_, entries, count, hash) => {
  expect(createHash('sha256').update(JSON.stringify(entries.slice(0, count))).digest('hex')).toBe(hash);
 });

 it('matches its published manifest and adds no quota-only isolated nodes', () => {
  const added = new Set(manifest.addedArtists);
  expect(added.size).toBe(manifest.addedArtists.length);
  expect(manifest.addedArtists.every(id => artists.some(a => a.id === id))).toBe(true);
  expect(artists.slice(manifest.baseline.artists, manifest.baseline.artists + added.size).map(a => a.id)).toEqual(manifest.addedArtists);
  const batch = evidence.filter(e => e.batch === manifest.batch);
  expect(batch.map(key).sort()).toEqual(manifest.addedRelations.map(key).sort());
  for (const id of added) expect(batch.some(e => e.source === id || e.target === id)).toBe(true);
 });

 it('requires matching verified URLs and explicit confidence for every new relationship', () => {
  for (const item of evidence.filter(e => e.batch === manifest.batch)) {
   const edge = edges.find(e => key(e) === key(item));
   expect(edge).toMatchObject({ evidenceUrl: item.url, evidenceType: item.evidenceType, verificationStatus: 'verified', verifiedOn: manifest.reviewedOn });
   expect(edge!.confidence).toBe(item.evidenceType === 'artist-statement' ? 'high' : 'medium');
   expect(new URL(item.url).protocol).toBe('https:');
   expect(item.section).toBeTruthy();
  }
 });

 it('connects Brazilian musical generations with correctly directed paths', () => {
  for (const [source, target] of [
   ['clementina-de-jesus', 'clara-nunes'], ['clementina-de-jesus', 'jovelina-perola-negra'],
   ['joao-gilberto', 'novos-baianos'], ['luiz-gonzaga', 'tom-ze'],
   ['dominguinhos', 'mestrinho'], ['gonzaguinha', 'lenine'],
   ['tiao-carreiro', 'almir-sater'], ['francis-dalva', 'gaby-amarantos'],
  ]) expect(index.future.get(source)).toContain(target);
 });

 it('makes Elton discoverable through documented incoming and outgoing influences', () => {
  expect(index.past.get('elton-john')).toEqual(expect.arrayContaining(['leon-russell', 'laura-nyro', 'joni-mitchell', 'brian-wilson', 'the-band', 'ray-charles']));
  expect(index.future.get('elton-john')).toEqual(expect.arrayContaining(['brandi-carlile', 'lady-gaga', 'guilherme-arantes', 'jerry-cantrell', 'axl-rose', 'kate-bush', 'ed-sheeran']));
 });

 it('distinguishes artist statements from accounts by other musicians', () => {
  expect(edges.find(e => e.source === 'leon-russell' && e.target === 'elton-john')).toMatchObject({ evidenceType: 'artist-statement', confidence: 'high' });
  expect(edges.find(e => e.source === 'joni-mitchell' && e.target === 'elton-john')).toMatchObject({ evidenceType: 'secondary', confidence: 'medium' });
  expect(edges.find(e => e.source === 'elton-john' && e.target === 'guilherme-arantes')!.note).toContain('Nenhum Sinal do Sol');
 });

 it('keeps candidate ordering stable and previews both directions without mutating discoveries', () => {
  const reversed = graphIndex([...artists].reverse(), [...edges].reverse());
  const discovered = reveal(new Set(), 'elton-john', index);
  for (const side of ['past', 'future'] as const) expect(reversed[side].get('elton-john')).toEqual(index[side].get('elton-john'));
  for (const key of ['ArrowLeft', 'ArrowRight'] as const) {
   const first = nextMove('elton-john', null, key, index);
   const down = nextMove('elton-john', first.session, 'ArrowDown', index);
   const up = nextMove('elton-john', down.session, 'ArrowUp', index);
   expect(first.empty).toBe(false);
   expect(down.candidate).not.toBe(first.candidate);
   expect(up.candidate).toBe(first.candidate);
  }
  expect([...discovered]).toEqual([...reveal(new Set(), 'elton-john', index)]);
  const expanded = reveal(discovered, 'guilherme-arantes', index);
  expect(expanded.has('ivan-lins')).toBe(true);
  expect([...discovered].every(id => expanded.has(id))).toBe(true);
  expect(expanded.size).toBeLessThan(artists.length);
 });
});
