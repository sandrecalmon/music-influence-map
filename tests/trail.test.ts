import { describe, expect, it } from 'vitest';
import { advanceTrail, graphIndex, type ExplorationStep } from '../src/components/exploration';
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
 it('starts a new highlighted branch at a change of direction',()=>{
  expect(walk('d','c','b','x')).toEqual([{id:'b'},{id:'x',via:'future'}]);
 });
 it('starts a separate path for a disconnected search result and ignores invalid IDs',()=>{
  const path=walk('a','b');
  expect(advanceTrail(path,'z',index)).toEqual([{id:'z'}]);
  expect(advanceTrail(path,'missing',index)).toBe(path);
  expect(advanceTrail(path,'b',index)).toEqual(path);
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

it('dims REM after going from REM through Led Zeppelin to Aerosmith',()=>{
 const graph=graphIndex(['rem','led','aero'].map(id=>({id,name:id})),[{source:'led',target:'rem'},{source:'led',target:'aero'}]);
 const previous=advanceTrail([{id:'rem'}],'led',graph,'past');
 expect(advanceTrail(previous,'aero',graph,'future')).toEqual([{id:'led'},{id:'aero',via:'future'}]);
 expect(previous.map(s=>s.id)).toEqual(['rem','led']);
 expect(advanceTrail(previous,'rem',graph,'future')).toEqual([{id:'rem'}]);
});
