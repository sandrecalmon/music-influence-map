import { render, screen, fireEvent, act } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import Graph from '../src/components/Graph';
const state=vi.hoisted(()=>({cy:null as any,builds:0}));
vi.mock('cytoscape',async()=>{const {default:real}=await vi.importActual<typeof import('cytoscape')>('cytoscape');return {default:(options:any)=>{state.builds++;const cy=real({...options,headless:true,styleEnabled:true,container:undefined});cy.animate=vi.fn().mockReturnValue(cy);state.cy=cy;return cy}}});
vi.mock('../src/components/Minimap',()=>({default:()=>null}));
const artists=[{id:'a',name:'A'},{id:'b',name:'B'},{id:'c',name:'C'}];
const influences=[{source:'a',target:'b',confidence:'medium' as const,note:'Source',evidenceUrl:'https://example.org'},{source:'b',target:'c',confidence:'high' as const,note:'Other',evidenceUrl:'https://example.org'}];
function props(){return {discovered:new Set(artists.map(a=>a.id)),artists,influences,selected:'b',mode:'both' as const,focusRequest:0,onSelect:vi.fn(),onEdge:vi.fn()}}
it('creates the network once, keeps positions on selection, filters and recenter requests',()=>{const p=props();const {rerender}=render(<Graph {...p}/>);const cy=state.cy;const builds=state.builds;const positions=cy.nodes().map((n:any)=>({...n.position()}));rerender(<Graph {...p} selected="c" mode="past" focusRequest={1}/>);expect(state.cy).toBe(cy);expect(state.builds).toBe(builds);expect(cy.nodes().map((n:any)=>({...n.position()}))).toEqual(positions);expect(cy.$(':selected').id()).toBe('c');expect(cy.animate).toHaveBeenCalled()});
it('fits the complete network using navigation controls',()=>{render(<Graph {...props()}/>);fireEvent.click(screen.getByRole('button',{name:'Ver região descoberta'}));expect(state.cy.animate.mock.calls.at(-1)[0].fit.eles.map((e:any)=>e.id())).toEqual(state.cy.elements().map((e:any)=>e.id()));fireEvent.click(screen.getByRole('button',{name:'Centralizar selecionado'}));expect(state.cy.animate).toHaveBeenLastCalledWith(expect.objectContaining({zoom:expect.any(Number),pan:expect.any(Object)}),expect.anything())});
it('forwards node and edge taps using current callbacks',()=>{const p=props();const {rerender}=render(<Graph {...p}/>);const onSelect=vi.fn();rerender(<Graph {...p} onSelect={onSelect}/>);act(()=>{state.cy.$id('a').emit('tap');state.cy.edges().first().emit('tap')});expect(onSelect).toHaveBeenCalledWith('a');expect(p.onSelect).not.toHaveBeenCalled();expect(p.onEdge).toHaveBeenCalledWith(influences[0])});
it('respects reduced motion and handles an invalid selection',()=>{vi.mocked(window.matchMedia).mockReturnValue({matches:true} as MediaQueryList);const p=props();const {rerender}=render(<Graph {...p}/>);expect(state.cy.animate).toHaveBeenLastCalledWith(expect.anything(),expect.objectContaining({duration:0}));rerender(<Graph {...p} selected="missing"/>)});
it('destroys the renderer on unmount',()=>{const {unmount}=render(<Graph {...props()}/>);const cy=state.cy;unmount();expect(cy.destroyed()).toBe(true)});

it('renders only discovered artists and adds their existing links without relayout',()=>{
 const p=props();const {rerender}=render(<Graph {...p} selected="a" discovered={new Set(['a'])}/>);const cy=state.cy;const builds=state.builds;
 expect(cy.nodes().map((n:any)=>n.id())).toEqual(['a']);const position={...cy.$id('a').position()};
 rerender(<Graph {...p} discovered={new Set(['a','b'])}/>);expect(state.cy).toBe(cy);expect(state.builds).toBe(builds);expect(cy.nodes()).toHaveLength(2);expect(cy.edges()).toHaveLength(1);expect(cy.$id('a').position()).toEqual(position);
 rerender(<Graph {...p} selected="c" discovered={new Set(['a','b','c'])}/>);expect(cy.edges()).toHaveLength(2);const positionB={...cy.$id('b').position()};
 rerender(<Graph {...p} selected="a" discovered={new Set(['a'])}/>);expect(cy.nodes()).toHaveLength(1);expect(cy.edges()).toHaveLength(0);
 rerender(<Graph {...p} discovered={new Set(['a','b'])}/>);expect(cy.nodes()).toHaveLength(2);expect(cy.edges()).toHaveLength(1);expect(cy.$id('b').position()).toEqual(positionB);
});
it('highlights the preview connection',()=>{const p=props();render(<Graph {...p} preview={{origin:'a',target:'b'}}/>);expect(state.cy.$id('b').hasClass('preview')).toBe(true);expect(state.cy.edges().filter((e:any)=>e.source().id()==='a').hasClass('preview')).toBe(true)});

it('keeps a 1000-artist catalog outside the renderer until discovery',()=>{const many=Array.from({length:1000},(_,i)=>({id:`n${i}`,name:`Artist ${i}`}));const links=many.slice(1).map((a,i)=>({...influences[0],source:`n${i}`,target:a.id}));const p=props();const visible=new Set(['n0','n1']);const {rerender}=render(<Graph {...p} artists={many} influences={links} selected="n0" discovered={visible}/>);const cy=state.cy;expect(cy.nodes()).toHaveLength(2);expect(cy.edges()).toHaveLength(1);const positions=cy.nodes().map((n:any)=>({...n.position()}));rerender(<Graph {...p} artists={many} influences={links} selected="n1" discovered={new Set(['n0','n1','n2'])}/>);expect(state.cy).toBe(cy);expect(cy.nodes()).toHaveLength(3);expect(cy.nodes().slice(0,2).map((n:any)=>({...n.position()}))).toEqual(positions)});
