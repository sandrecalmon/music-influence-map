import { useEffect, useRef, useState, useMemo } from 'react';
import cytoscape from 'cytoscape';
import { networkPositions } from './layout';
import Minimap from './Minimap';
import { highlight, centeredPan } from './navigation';
type Artist={id:string;name:string};
type Influence={source:string;target:string;confidence: "high" | "medium" | "low";note:string;evidenceUrl:string;kind?:string};
type Props={discovered:ReadonlySet<string>;preview?:{origin:string;target:string}|null;artists:Artist[];influences:Influence[];selected:string;mode:'both'|'past'|'future';focusRequest:number;onSelect:(id:string)=>void;onEdge:(edge:Influence)=>void};
export default function Graph({artists,influences,selected,mode,focusRequest,onSelect,onEdge,discovered,preview}:Props){
 const holder=useRef<HTMLDivElement>(null);const cyRef=useRef<cytoscape.Core|null>(null);
 const [instance,setInstance]=useState<cytoscape.Core|null>(null);
 const positions=useMemo(()=>networkPositions(artists,influences),[artists,influences]);
 const visible=discovered;
 const selectRef=useRef(onSelect);const edgeRef=useRef(onEdge);
 useEffect(()=>{selectRef.current=onSelect;edgeRef.current=onEdge},[onSelect,onEdge]);
 useEffect(()=>{if(!holder.current)return;
 const cy=cytoscape({container:holder.current,elements:[],
 style:[{selector:'node',style:{'shape':'round-rectangle','background-color':'#f3f6fc','border-width':1.5,'border-color':'#9baec8','label':'data(label)','color':'#333333','font-size':13,'font-weight':500,'text-valign':'center','text-halign':'center','width':180,'height':40,'overlay-opacity':0}},{selector:'node:selected',style:{'background-color':'#e3f2fd','border-color':'#007acc','border-width':3,'color':'#005a9e','font-weight':700}},{selector:'edge',style:{'width':2,'line-color':'data(color)','target-arrow-color':'data(color)','target-arrow-shape':'triangle','arrow-scale':0.9,'curve-style':'bezier','opacity':0.85}},{selector:'.muted',style:{'opacity':0.22}},{selector:'edge.direct',style:{'width':3.5,'opacity':1}},{selector:'.preview',style:{'border-color':'#c07800','border-width':3,'opacity':1}},{selector:'edge.preview',style:{'line-color':'#c07800','target-arrow-color':'#c07800','width':4,'opacity':1}},{selector:'edge[kind="continuity"]',style:{'line-style':'dashed'}}],
 autoungrabify:true,layout:{name:'preset',fit:false},minZoom:0.001,maxZoom:3});
 const resize=new ResizeObserver(()=>{cy.resize()});resize.observe(holder.current);
 cyRef.current=cy;setInstance(cy);cy.on('tap','node',event=>selectRef.current(event.target.id()));cy.on('tap','edge',event=>edgeRef.current(event.target.data('detail')));cy.$id(selected).select();
 return()=>{resize.disconnect();cy.destroy();cyRef.current=null};
 },[artists,influences]);
 useEffect(()=>{
  const cy=instance;if(!cy)return;
  let added=cy.collection();
  cy.batch(()=>{
   cy.nodes().filter(node=>!visible.has(node.id())).remove();
   for(const a of artists)if(visible.has(a.id)&&cy.$id(a.id).empty())added=added.add(cy.add({data:{id:a.id,label:a.name},position:positions.get(a.id)}));
   influences.forEach((e,i)=>{const id=`e${i}`;if(visible.has(e.source)&&visible.has(e.target)&&cy.$id(id).empty())cy.add({data:{id,source:e.source,target:e.target,kind:e.kind??'influence',color:e.kind==='continuity'?'#795e26':positions.get(e.target)!.x<=660?'#8956a6':'#098658',detail:e}})});
  });
  if(added.length&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){added.style('opacity',0);added.animate({style:{opacity:1}},{duration:200,complete:()=>{if(!cy.destroyed())added.removeStyle('opacity')}})}
 },[instance,visible,artists,influences,positions]);
 useEffect(()=>{
  const cy=instance;if(!cy)return;
  highlight(cy,selected,mode);
  cy.elements().removeClass('preview');
  if(preview){cy.$id(preview.target).addClass('preview');cy.edges().filter(e=>(e.source().id()===preview.origin&&e.target().id()===preview.target)||(e.target().id()===preview.origin&&e.source().id()===preview.target)).addClass('preview')}
 },[instance,selected,mode,visible,preview]);
 useEffect(()=>{
  const cy=instance;if(!cy)return;
  const node=cy.$id(selected);if(node.empty())return;
  const zoom=Math.min(1.25,Math.max(0.7,cy.zoom()));
  const p=node.position();cy.stop();
  cy.animate({zoom,pan:centeredPan(cy.width(),cy.height(),zoom,p)},{duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:420,easing:'ease-in-out-cubic'});
 },[instance,selected,focusRequest]);
 return <>
  <div ref={holder} className="cytoscape" role="img" aria-label="Grafo interativo de influências musicais"/>
  <div className="map-tools"><button onClick={()=>{instance?.stop();instance?.animate({fit:{eles:instance.elements(),padding:45}},{duration:350})}}>Ver região descoberta</button><button onClick={()=>{
   const cy=instance;if(!cy)return;const p=cy.$id(selected).position(),zoom=Math.max(cy.zoom(),0.7);cy.stop();cy.animate({zoom,pan:centeredPan(cy.width(),cy.height(),zoom,p)},{duration:350});
  }}>Centralizar selecionado</button></div>
  <Minimap cy={instance}/>
 </>;
}
