import { render, screen, fireEvent, act } from '@testing-library/react';
import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import cytoscape from 'cytoscape';
import Minimap from '../src/components/Minimap';
import artists from '../src/data/artists.json';
import influences from '../src/data/influences.json';
import { networkPositions } from '../src/components/layout';
let contexts:Map<HTMLCanvasElement,any>,frames:Map<number,FrameRequestCallback>,id:number;
const instances:ReturnType<typeof cytoscape>[]=[];
function flush(){act(()=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(cb=>cb(0))})}
function network(){const cy=cytoscape({headless:true,styleEnabled:true,layout:{name:'preset'},elements:[{data:{id:'a'},position:{x:0,y:0}},{data:{id:'b'},position:{x:300,y:100}},{data:{id:'ab',source:'a',target:'b',color:'#8956a6',kind:'continuity'}}]});instances.push(cy);return cy}
beforeEach(()=>{contexts=new Map();frames=new Map();id=0;vi.stubGlobal('requestAnimationFrame',(cb:FrameRequestCallback)=>{frames.set(++id,cb);return id});vi.stubGlobal('cancelAnimationFrame',(key:number)=>frames.delete(key));vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockImplementation(function(this:HTMLCanvasElement){if(!contexts.has(this))contexts.set(this,Object.fromEntries(['clearRect','setTransform','fillRect','strokeRect','drawImage','setLineDash','beginPath','moveTo','lineTo','stroke'].map(name=>[name,vi.fn()])));return contexts.get(this)});vi.spyOn(HTMLCanvasElement.prototype,'getBoundingClientRect').mockReturnValue({width:220,height:135,left:0,top:0} as DOMRect);HTMLCanvasElement.prototype.setPointerCapture=vi.fn();vi.stubGlobal('PointerEvent',class extends MouseEvent{pointerId:number;constructor(type:string,options:any){super(type,options);this.pointerId=options.pointerId??1}})});
afterEach(()=>{instances.splice(0).forEach(cy=>cy.destroy());vi.unstubAllGlobals()});
it('can collapse and reopen without a renderer',()=>{render(<Minimap cy={null}/>);fireEvent.click(screen.getByRole('button',{name:'Recolher minimapa'}));expect(screen.queryByRole('application')).toBeNull();fireEvent.click(screen.getByRole('button',{name:'Abrir minimapa'}));expect(screen.getByRole('application')).toBeInTheDocument()});
it('updates viewport after zoom and pan without redrawing network or executing layout',()=>{const cy=network();const layout=vi.spyOn(cy,'layout');const {unmount}=render(<Minimap cy={cy}/>);flush();const canvas=screen.getByRole('application') as HTMLCanvasElement;const ctx=contexts.get(canvas);const original=ctx.strokeRect.mock.calls.at(-1);const raster=[...contexts.entries()].find(([c])=>c!==canvas)![1];const strokes=raster.stroke.mock.calls.length;cy.zoom(2);cy.pan({x:100,y:200});flush();expect(ctx.strokeRect.mock.calls.at(-1)).not.toEqual(original);expect(raster.stroke.mock.calls.length).toBe(strokes);expect(layout).not.toHaveBeenCalled();unmount();cy.destroy()});
it('clicks and drags navigate the main camera without changing zoom or node positions',()=>{const cy=network();const pan=vi.spyOn(cy,'pan');const positions=cy.nodes().map(n=>({...n.position()}));render(<Minimap cy={cy}/>);flush();const canvas=screen.getByRole('application');const zoom=cy.zoom();fireEvent.pointerDown(canvas,{button:0,pointerId:1,clientX:150,clientY:90});fireEvent.pointerMove(canvas,{pointerId:1,clientX:170,clientY:100});fireEvent.pointerUp(canvas,{pointerId:1});expect(pan).toHaveBeenCalled();expect(cy.zoom()).toBe(zoom);expect(cy.nodes().map(n=>({...n.position()}))).toEqual(positions);cy.destroy()});
it('ignores non-primary buttons and unstarted drags',()=>{const cy=network();const pan=vi.spyOn(cy,'pan');render(<Minimap cy={cy}/>);flush();const canvas=screen.getByRole('application');fireEvent.pointerMove(canvas,{pointerId:2});fireEvent.pointerDown(canvas,{button:2,pointerId:2});expect(pan).not.toHaveBeenCalled();cy.destroy()});
it.each(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'])('supports keyboard navigation %s',key=>{const cy=network();const pan=vi.spyOn(cy,'panBy');render(<Minimap cy={cy}/>);flush();fireEvent.keyDown(screen.getByRole('application'),{key});expect(pan).toHaveBeenCalled();cy.destroy()});
it('ignores unrelated keys and invalidates cached raster on selection',()=>{const cy=network();const pan=vi.spyOn(cy,'panBy');const {unmount}=render(<Minimap cy={cy}/>);flush();fireEvent.keyDown(screen.getByRole('application'),{key:'Enter'});expect(pan).not.toHaveBeenCalled();cy.$id('b').select();flush();unmount();const remaining=frames.size;cy.panBy({x:2,y:2});expect(frames.size).toBe(remaining);cy.destroy()});
it('handles missing canvas contexts gracefully',()=>{vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);const cy=network();render(<Minimap cy={cy}/>);expect(screen.getByRole('application')).toBeInTheDocument();cy.destroy()});

it('coalesces camera events and keeps the raster cached with the complete editorial network',()=>{
 const positions=networkPositions(artists,influences);
 const cy=cytoscape({headless:true,layout:{name:'preset'},elements:[...artists.map(a=>({data:{id:a.id},position:positions.get(a.id)})),...influences.map((e,i)=>({data:{id:`edge${i}`,source:e.source,target:e.target,color:'#007acc'}}))]});instances.push(cy);
 const layout=vi.spyOn(cy,'layout');render(<Minimap cy={cy}/>);flush();
 const canvas=screen.getByRole('application') as HTMLCanvasElement;
 const raster=[...contexts.entries()].find(([c])=>c!==canvas)![1];const strokes=raster.stroke.mock.calls.length;
 const start=performance.now();
 for(let i=0;i<60;i++){cy.panBy({x:1,y:1});cy.zoom(1+i/100);flush()}
 expect(performance.now()-start).toBeLessThan(2000);
 expect(raster.stroke.mock.calls.length).toBe(strokes);expect(layout).not.toHaveBeenCalled();
 expect(contexts.get(canvas).strokeRect.mock.calls.length).toBeGreaterThan(1);
});

it('redraws only nodes still present after a branch is collapsed',()=>{const cy=network();const {unmount}=render(<Minimap cy={cy}/>);flush();const canvas=screen.getByRole('application') as HTMLCanvasElement;const raster=[...contexts.entries()].find(([c])=>c!==canvas)![1];raster.fillRect.mockClear();cy.$id('b').remove();flush();expect(raster.fillRect).toHaveBeenCalledTimes(1);cy.add({data:{id:'c'},position:{x:100,y:50}});raster.fillRect.mockClear();flush();expect(raster.fillRect).toHaveBeenCalledTimes(2);unmount();cy.destroy()});
