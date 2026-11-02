import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { networkPositions } from './layout';
import Minimap from './Minimap';
import { highlight, centeredPan } from './navigation';
type Artist={id:string;name:string};
type Influence={source:string;target:string;confidence: "high" | "medium" | "low";note:string;evidenceUrl:string;kind?:string};
type Props={artists:Artist[];influences:Influence[];selected:string;mode:'both'|'past'|'future';focusRequest:number;onSelect:(id:string)=>void;onEdge:(edge:Influence)=>void};
export default function Graph({artists,influences,selected,mode,focusRequest,onSelect,onEdge}:Props){
 const holder=useRef<HTMLDivElement>(null);const cyRef=useRef<cytoscape.Core|null>(null);
 const [instance,setInstance]=useState<cytoscape.Core|null>(null);
 const selectRef=useRef(onSelect);const edgeRef=useRef(onEdge);
 useEffect(()=>{selectRef.current=onSelect;edgeRef.current=onEdge},[onSelect,onEdge]);
 useEffect(()=>{if(!holder.current)return;
 const positions=networkPositions(artists,influences);
 const cy=cytoscape({container:holder.current,elements:[...artists.map(a=>({data:{id:a.id,label:a.name},position:positions.get(a.id)})),...influences.map((e,i)=>({data:{id:`e${i}`,source:e.source,target:e.target,kind:e.kind??'influence',color:e.kind==='continuity'?'#795e26':positions.get(e.target)!.x<=660?'#8956a6':'#098658',detail:e}}))],
 style:[{selector:'node',style:{'shape':'round-rectangle','background-color':'#f3f6fc','border-width':1.5,'border-color':'#9baec8','label':'data(label)','color':'#333333','font-size':13,'font-weight':500,'text-valign':'center','text-halign':'center','width':180,'height':40,'overlay-opacity':0}},{selector:'node:selected',style:{'background-color':'#e3f2fd','border-color':'#007acc','border-width':3,'color':'#005a9e','font-weight':700}},{selector:'edge',style:{'width':2,'line-color':'data(color)','target-arrow-color':'data(color)','target-arrow-shape':'triangle','arrow-scale':0.9,'curve-style':'bezier','opacity':0.85}},{selector:'.muted',style:{'opacity':0.22}},{selector:'edge.direct',style:{'width':3.5,'opacity':1}},{selector:'edge[kind="continuity"]',style:{'line-style':'dashed'}}],
 autoungrabify:true,layout:{name:'preset',fit:true,padding:85},minZoom:0.15,maxZoom:3,wheelSensitivity:0.18});
 const resize=new ResizeObserver(()=>{cy.resize()});resize.observe(holder.current);
 cyRef.current=cy;setInstance(cy);cy.on('tap','node',event=>selectRef.current(event.target.id()));cy.on('tap','edge',event=>edgeRef.current(event.target.data('detail')));cy.$id(selected).select();
 return()=>{resize.disconnect();cy.destroy();cyRef.current=null};
 },[artists,influences]);
 useEffect(()=>{
  const cy=instance;if(!cy)return;
  highlight(cy,selected,mode);
 },[instance,selected,mode]);
 useEffect(()=>{
  const cy=instance;if(!cy)return;
  const node=cy.$id(selected);if(node.empty())return;
  const zoom=Math.min(1.25,Math.max(0.7,cy.zoom()));
  const p=node.position();cy.stop();
  cy.animate({zoom,pan:centeredPan(cy.width(),cy.height(),zoom,p)},{duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:420,easing:'ease-in-out-cubic'});
 },[instance,selected,focusRequest]);
 return <>
  <div ref={holder} className="cytoscape" role="img" aria-label="Grafo interativo de influências musicais"/>
  <div className="map-tools"><button onClick={()=>{instance?.stop();instance?.animate({fit:{eles:instance.elements(),padding:45}},{duration:350})}}>Ver toda a rede</button><button onClick={()=>{
   const cy=instance;if(!cy)return;const p=cy.$id(selected).position(),zoom=Math.max(cy.zoom(),0.7);cy.stop();cy.animate({zoom,pan:centeredPan(cy.width(),cy.height(),zoom,p)},{duration:350});
  }}>Centralizar selecionado</button></div>
  <Minimap cy={instance}/>
 </>;
}
