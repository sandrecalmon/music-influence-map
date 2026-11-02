import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
type Artist={id:string;name:string};
type Influence={source:string;target:string;confidence:string;note:string;evidenceUrl:string;kind?:string};
type Props={artists:Artist[];influences:Influence[];selected:string;onSelect:(id:string)=>void;onEdge:(edge:Influence)=>void};
export default function Graph({artists,influences,selected,onSelect,onEdge}:Props){
 const holder=useRef<HTMLDivElement>(null);const cyRef=useRef<cytoscape.Core|null>(null);
 const selectRef=useRef(onSelect);const edgeRef=useRef(onEdge);
 useEffect(()=>{selectRef.current=onSelect;edgeRef.current=onEdge},[onSelect,onEdge]);
 useEffect(()=>{if(!holder.current)return;
 const cy=cytoscape({container:holder.current,elements:[...artists.map(a=>({data:{id:a.id,label:a.name}})),...influences.map((e,i)=>({data:{id:`e${i}`,source:e.source,target:e.target,detail:e}}))],
 style:[{selector:'node',style:{'background-color':'#34465d','border-width':1.5,'border-color':'#7990a6','label':'data(label)','color':'#d9e3ef','font-size':12,'font-weight':500,'text-valign':'bottom','text-margin-y':9,'text-outline-width':2,'text-outline-color':'#101821','width':28,'height':28,'overlay-opacity':0}},{selector:'node[id="rem"]',style:{'background-color':'#edb66a','border-color':'#ffdf9f','width':47,'height':47,'color':'#ffe1a5','font-size':15,'font-weight':700}},{selector:'node:selected',style:{'background-color':'#f0b86d','border-color':'#fff0ce','border-width':3,'width':45,'height':45,'color':'#ffdf9f','font-weight':700}},{selector:'edge',style:{'width':1.6,'line-color':'#5b7188','target-arrow-color':'#9ab3c8','target-arrow-shape':'triangle','arrow-scale':0.85,'curve-style':'bezier','opacity':0.8}},{selector:'edge[kind="continuity"]',style:{'line-style':'dashed'}}],
 layout:{name:'cose',animate:false,fit:true,padding:65,nodeRepulsion:()=>120000,idealEdgeLength:()=>125,edgeElasticity:()=>90,gravity:0.35,numIter:1000},minZoom:0.25,maxZoom:3,wheelSensitivity:0.18});
 cyRef.current=cy;cy.on('tap','node',event=>selectRef.current(event.target.id()));cy.on('tap','edge',event=>edgeRef.current(event.target.data('detail')));cy.$id(selected).select();
 return()=>{cy.destroy();cyRef.current=null};
 },[artists,influences]);
 useEffect(()=>{const cy=cyRef.current;if(cy){cy.nodes().unselect();cy.$id(selected).select()}},[selected]);
 return <div ref={holder} className="cytoscape" role="img" aria-label="Grafo interativo de influências musicais"/>;
}
