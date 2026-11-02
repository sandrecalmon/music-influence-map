import { it, expect } from 'vitest';
import { networkPositions } from '../src/components/layout';
import artists from '../src/data/artists.json';
import influences from '../src/data/influences.json';
it('positions every artist without node overlaps and is deterministic',()=>{const positions=networkPositions(artists,influences);expect(positions.size).toBe(artists.length);expect(new Set([...positions.values()].map(p=>`${p.x},${p.y}`)).size).toBe(artists.length);expect(networkPositions(artists,influences)).toEqual(positions)});
it('supports multiple parents, cycles and disconnected artists',()=>{const nodes=['a','b','c','d','e'].map(id=>({id,name:id}));const p=networkPositions(nodes,[{source:'a',target:'b'},{source:'b',target:'a'},{source:'b',target:'c'},{source:'d',target:'c'}]);expect(p.get('a')!.x).toBe(p.get('b')!.x);expect(p.get('c')!.x).toBeGreaterThan(p.get('b')!.x);expect(p.get('c')!.x).toBeGreaterThan(p.get('d')!.x);expect(p.has('e')).toBe(true)});
it('handles an empty graph',()=>expect(networkPositions([],[]).size).toBe(0));
it('lays out 1000 artists within a generous regression budget',()=>{const nodes=Array.from({length:1000},(_,i)=>({id:`${i}`,name:`Artist ${i}`}));const edges=nodes.slice(1).map((n,i)=>({source:`${i}`,target:n.id}));const start=performance.now();expect(networkPositions(nodes,edges).size).toBe(1000);expect(performance.now()-start).toBeLessThan(1000)});
