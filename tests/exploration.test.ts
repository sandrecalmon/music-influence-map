import { describe,it,expect } from 'vitest';
import { graphIndex,reveal,nextMove,isTyping } from '../src/components/exploration';
const artists=[{id:'a',name:'Center'},{id:'b',name:'Zulu'},{id:'c',name:'Alfa'},{id:'d',name:'Beta'},{id:'x',name:'Isolated'}];
const edges=[{source:'b',target:'a'},{source:'c',target:'a'},{source:'a',target:'d'},{source:'d',target:'b'},{source:'a',target:'d'}];
const index=graphIndex(artists,edges);
describe('progressive graph exploration',()=>{
 it('orders candidates by name independently of edge order and removes duplicates',()=>{expect(index.past.get('a')).toEqual(['c','b']);expect(graphIndex(artists,[...edges].reverse()).past.get('a')).toEqual(index.past.get('a'));expect(index.future.get('a')).toEqual(['d'])});
 it('reveals a neighborhood without mutating or losing discoveries',()=>{const original=new Set(['x']);const next=reveal(original,'a',index);expect([...next].sort()).toEqual(['a','b','c','d','x']);expect([...original]).toEqual(['x']);expect(reveal(next,'d',index)).toEqual(next)});
 it('handles missing and isolated artists',()=>{expect(reveal(new Set(),'missing',index).size).toBe(0);expect([...reveal(new Set(),'x',index)]).toEqual(['x']);expect(nextMove('x',null,'ArrowRight',index)).toMatchObject({selected:'x',empty:true})});
 it('left/right enter first candidate of current artist; up/down traverse frozen siblings circularly',()=>{const left=nextMove('a',null,'ArrowLeft',index);expect(left.selected).toBe('c');const down=nextMove(left.selected,left.session,'ArrowDown',index);expect(down.selected).toBe('b');expect(down.session.origin).toBe('a');expect(nextMove('b',down.session,'ArrowDown',index).selected).toBe('c');expect(nextMove('c',left.session,'ArrowUp',index).selected).toBe('b');expect(nextMove('a',null,'ArrowRight',index).selected).toBe('d')});
 it('up/down before choosing a side use incoming candidates deterministically',()=>{expect(nextMove('a',null,'ArrowDown',index).selected).toBe('c');expect(nextMove('a',null,'ArrowUp',index).selected).toBe('b')});
 it('an empty directional list remains a safe no-op for repeated moves',()=>{const result=nextMove('c',null,'ArrowLeft',index);expect(result.empty).toBe(true);expect(nextMove('c',result.session,'ArrowDown',index)).toMatchObject({selected:'c',empty:true});expect(nextMove('c',result.session,'ArrowUp',index)).toMatchObject({selected:'c',empty:true})});
 it('separates continuity from influence navigation but preserves it in discovery',()=>{const i=graphIndex(artists,[{source:'a',target:'b',kind:'continuity'},{source:'unknown',target:'a'}]);expect(i.future.get('a')).toEqual([]);expect([...reveal(new Set(),'a',i)]).toEqual(['a','b'])});
 it.each(['input','textarea','select','div'])('protects editable targets: %s',tag=>{const element=document.createElement(tag);if(tag==='div')element.setAttribute('contenteditable','true');expect(isTyping(element)).toBe(true)});
 it('does not protect ordinary map targets',()=>{expect(isTyping(null)).toBe(false);expect(isTyping(document.createElement('button'))).toBe(false)});
 it('keeps separate candidates with equal names stable by ID',()=>{const i=graphIndex([{id:'a',name:'A'},{id:'b',name:'Same'},{id:'c',name:'Same'}],[{source:'c',target:'a'},{source:'b',target:'a'}]);expect(i.past.get('a')).toEqual(['b','c'])});
});
