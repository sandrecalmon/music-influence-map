import { describe, expect, it } from 'vitest';
import { advanceTrail, graphIndex, trailRegion, type ExplorationStep } from '../src/components/exploration';
const index=graphIndex(['a','b','c','d','x','z'].map(id=>({id,name:id})),[
 {source:'a',target:'b'},{source:'b',target:'c'},{source:'c',target:'d'},{source:'b',target:'x'},
]);
const walk=(...ids:string[])=>ids.reduce((trail,id)=>advanceTrail(trail,id,index),[] as ExplorationStep[]);
describe('persistent exploration path',()=>{
 it('keeps three confirmed advances and records their direction',()=>{
  expect(walk('a','b','c','d')).toEqual([{id:'a'},{id:'b',via:'future'},{id:'c',via:'future'},{id:'d',via:'future'}]);
 });
 it('truncates descendants recursively when returning to an ancestor',()=>{
  const path=walk('a','b','c','d');
  const back=advanceTrail(path,'b',index);
  expect(back.map(s=>s.id)).toEqual(['a','b']);
  expect(advanceTrail(back,'a',index)).toEqual([{id:'a'}]);
  expect(path.map(s=>s.id)).toEqual(['a','b','c','d']);
 });
 it('opens a different branch after returning without restoring the abandoned suffix',()=>{
  const back=advanceTrail(walk('a','b','c','d'),'b',index);
  expect(advanceTrail(back,'x',index).map(s=>s.id)).toEqual(['a','b','x']);
 });
 it('also keeps incoming and mixed directions',()=>{
  expect(walk('d','c','b','x')).toEqual([{id:'d'},{id:'c',via:'past'},{id:'b',via:'past'},{id:'x',via:'future'}]);
 });
 it('starts a separate path for a disconnected search result and ignores invalid IDs',()=>{
  const path=walk('a','b');
  expect(advanceTrail(path,'z',index)).toEqual([{id:'z'}]);
  expect(advanceTrail(path,'missing',index)).toBe(path);
  expect(advanceTrail(path,'b',index)).toEqual(path);
 });
 it('retains every active step neighborhood and prunes only abandoned discoveries',()=>{
  const path=walk('a','b','c','d');
  expect([...trailRegion(path,index)].sort()).toEqual(['a','b','c','d','x']);
  const region=trailRegion(advanceTrail(path,'b',index),index);
  expect([...region].sort()).toEqual(['a','b','c','x']); // C is still a direct neighbor of B.
  expect(trailRegion([],index).size).toBe(0);
 });
 it('handles an empty path and cycles without duplicate columns',()=>{
  expect(advanceTrail([],'a',index)).toEqual([{id:'a'}]);
  expect(walk('a','b','c','b').map(s=>s.id)).toEqual(['a','b']);
 });
});
it('honors the chosen side when two artists influence one another',()=>{
 const mutual=graphIndex([{id:'a',name:'A'},{id:'b',name:'B'}],[{source:'a',target:'b'},{source:'b',target:'a'}]);
 expect(advanceTrail([{id:'a'}],'b',mutual,'past')[1].via).toBe('past');
 expect(advanceTrail([{id:'a'}],'b',mutual,'future')[1].via).toBe('future');
});
