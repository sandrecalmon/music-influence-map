import { expect, it } from 'vitest';
import { graphIndex, nextMove, moveInMenu } from '../src/components/exploration';
import { expandMenu, menuNavigationIndex, type MenuSlots } from '../src/components/menuMap';
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

it('visits previously selected R.E.M. before Aerosmith in their visible row order',()=>{
 const graph=graphIndex([{id:'rem',name:'R.E.M.'},{id:'led',name:'Led Zeppelin'},{id:'aero',name:'Aerosmith'}],[{source:'led',target:'rem'},{source:'led',target:'aero'}]);
 const before=expandMenu(new Map(),'rem',graph),slots=expandMenu(before,'led',graph);
 const navigation=menuNavigationIndex(graph,slots,'led');
 expect(graph.future.get('led')).toEqual(['aero','rem']);
 expect(navigation.future.get('led')).toEqual(['rem','aero']);
 const first=nextMove('led',null,'ArrowRight',navigation);
 expect(first.candidate).toBe('rem');
 expect(nextMove('led',first.session,'ArrowDown',navigation).candidate).toBe('aero');
 expect(nextMove('led',first.session,'ArrowUp',navigation).candidate).toBe('aero');
 expect(menuNavigationIndex(graph,new Map(),'unknown').past.get('unknown')).toEqual([]);
 expect(menuNavigationIndex(graph,new Map(),'led').future.get('led')).toEqual(['aero','rem']);
});

it('keeps unrelated revealed cards out of a relationship list',()=>{
 const graph=graphIndex(['cure','cranberries','above','z-below'].map(id=>({id,name:id})),[{source:'cure',target:'cranberries'},{source:'cure',target:'z-below'}]);
 const slots=new Map([['cure',{column:0,row:0}],['cranberries',{column:1,row:3}],['above',{column:1,row:1}],['z-below',{column:1,row:5}]]);
 const first=moveInMenu('cure',null,'ArrowRight',graph,slots);
 expect(first.candidate).toBe('cranberries');
 const up=moveInMenu('cure',first.session,'ArrowUp',graph,slots);
 expect(up.candidate).toBe('z-below');
 expect(moveInMenu('cure',up.session,'ArrowDown',graph,slots).candidate).toBe('cranberries');
});
it('starts vertical navigation from the selected card and can return through it',()=>{
 const slots=new Map([['a',{column:0,row:0}],['b',{column:0,row:2}],['c',{column:0,row:4}]]);
 const up=moveInMenu('b',null,'ArrowUp',index,slots);
 expect(up.candidate).toBe('a');
 expect(moveInMenu('b',up.session,'ArrowDown',index,slots).candidate).toBe('b');
 expect(moveInMenu('b',null,'ArrowDown',index,slots).candidate).toBe('c');
});
it('keeps single-card columns safe and uses the existing fallback without a placement',()=>{
 const slots=new Map([['a',{column:-1,row:0}],['b',{column:0,row:0}]]);
 const horizontal=moveInMenu('b',null,'ArrowLeft',index,slots);
 expect(moveInMenu('b',horizontal.session,'ArrowUp',index,slots).candidate).toBe('a');
 expect(moveInMenu('b',null,'ArrowDown',index,new Map())).toEqual(nextMove('b',null,'ArrowDown',index));
 expect(moveInMenu('a',null,'ArrowDown',index,new Map([['a',{column:0,row:0}]]))).toMatchObject({candidate:'a',empty:false});
});

it.each([
 ['ArrowRight','ArrowLeft','c'],
 ['ArrowLeft','ArrowRight','a'],
] as const)('returns through the center when reversing %s with %s',(outward,back,expected)=>{
 const slots=expandMenu(new Map(),'b',index);
 const first=moveInMenu('b',null,outward,index,slots);
 expect(first.candidate).toBe(expected);
 const center=moveInMenu('b',first.session,back,index,slots);
 expect(center).toMatchObject({candidate:'b',empty:false});
 expect(moveInMenu('b',center.session,back,index,slots).candidate).not.toBe('b');
 expect(moveInMenu('b',center.session,outward,index,slots).candidate).toBe(expected);
});
it('keeps vertical column browsing available after returning to the center',()=>{
 const slots=new Map([['a',{column:0,row:0}],['b',{column:0,row:1}],['c',{column:1,row:0}]]);
 const first=moveInMenu('b',null,'ArrowRight',index,slots);
 const center=moveInMenu('b',first.session,'ArrowLeft',index,slots);
 expect(moveInMenu('b',center.session,'ArrowUp',index,slots).candidate).toBe('a');
});
