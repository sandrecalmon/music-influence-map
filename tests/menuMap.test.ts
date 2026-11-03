import { expect, it } from 'vitest';
import { graphIndex } from '../src/components/exploration';
import { expandMenu, type MenuSlots } from '../src/components/menuMap';
const index=graphIndex(['a','b','c','d','e','z'].map(id=>({id,name:id})),[
 {source:'a',target:'b'},{source:'b',target:'c'},{source:'c',target:'d'},{source:'c',target:'e'},
]);
it('reveals only immediate neighbors, arranged in aligned columns',()=>{
 const slots=expandMenu(new Map(),'b',index);
 expect([...slots.keys()].sort()).toEqual(['a','b','c']);
 expect(slots.get('a')!.column).toBeLessThan(slots.get('b')!.column);
 expect(slots.get('c')!.column).toBeGreaterThan(slots.get('b')!.column);
});
it('appends new cards without moving any existing card or mutating the previous map',()=>{
 const before=expandMenu(new Map(),'b',index), after=expandMenu(before,'c',index);
 for(const [id,position] of before) expect(after.get(id)).toBe(position);
 expect(before.has('d')).toBe(false);expect(after.has('d')).toBe(true);
 expect(after.get('d')!.column).toBe(after.get('e')!.column);
 expect(after.get('d')!.row).not.toBe(after.get('e')!.row);
});
it('keeps abandoned branches available after returning and changing the highlight',()=>{
 const all=['a','b','c','d','c','e'].reduce<MenuSlots>((map,id)=>expandMenu(map,id,index),new Map());
 expect([...all.keys()].sort()).toEqual(['a','b','c','d','e']);
 expect(new Set([...all.values()].map(s=>`${s.column}/${s.row}`)).size).toBe(all.size);
});
it('handles cycles and shared neighbors without duplicate cards or reordering',()=>{
 const cyclic=graphIndex(['a','b','c'].map(id=>({id,name:id})),[{source:'a',target:'b'},{source:'b',target:'a'},{source:'c',target:'b'},{source:'a',target:'c'}]);
 const before=expandMenu(new Map(),'a',cyclic),after=expandMenu(before,'b',cyclic);
 expect(after.size).toBe(3);expect([...after]).toEqual([...before]);
});
it('adds disconnected search results without moving the discovered region',()=>{
 const before=expandMenu(new Map(),'b',index),after=expandMenu(before,'z',index);
 for(const [id,position] of before)expect(after.get(id)).toBe(position);
 expect(after.has('z')).toBe(true);expect(expandMenu(after,'missing',index)).toBe(after);
});
it('places continuity neighbors without treating them as influence candidates',()=>{
 const continuity=graphIndex([{id:'a',name:'A'},{id:'b',name:'B'}],[{source:'a',target:'b',kind:'continuity'}]);
 expect(expandMenu(new Map(),'a',continuity).size).toBe(2);
 expect(continuity.future.get('a')).toEqual([]);
});
