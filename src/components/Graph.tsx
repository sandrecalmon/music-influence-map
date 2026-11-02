import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
type Artist={id:string;name:string};
type Influence={source:string;target:string;confidence: "high" | "medium" | "low";note:string;evidenceUrl:string;kind?:string};
type Props={artists:Artist[];influences:Influence[];selected:string;onSelect:(id:string)=>void;onEdge:(edge:Influence)=>void};
export default function Graph({artists,influences,selected,onSelect,onEdge}:Props){
 const holder=useRef<HTMLDivElement>(null);const cyRef=useRef<cytoscape.Core|null>(null);
 const selectRef=useRef(onSelect);const edgeRef=useRef(onEdge);
 useEffect(()=>{selectRef.current=onSelect;edgeRef.current=onEdge},[onSelect,onEdge]);
 useEffect(()=>{if(!holder.current)return;
 // Directed breadth-first layers relative to the selected artist. Visited sets
 // keep cycles finite; ancestors take the left side and descendants the right.
 const layers=new Map<string,number>([[selected,0]]);
 for(const direction of [-1,1]){
   const visited=new Set([selected]);let frontier=[selected],depth=0;
   while(frontier.length){depth++;const next:string[]=[];
     for(const id of frontier)for(const e of influences){
       const from=direction<0?e.target:e.source,to=direction<0?e.source:e.target;
       if(from===id&&!visited.has(to)){visited.add(to);next.push(to);if(!layers.has(to))layers.set(to,direction*depth)}
     }
     frontier=next;
   }
 }
 const columns=new Map<number,Artist[]>();
 for(const artist of artists){const layer=layers.get(artist.id)??2;columns.set(layer,[...(columns.get(layer)??[]),artist])}
 const positions=new Map<string,{x:number;y:number}>();
 for(const [layer,column] of columns){column.sort((a,b)=>a.name.localeCompare(b.name));column.forEach((a,i)=>positions.set(a.id,{x:layer*260,y:(i-(column.length-1)/2)*80}))}
 const cy=cytoscape({container:holder.current,elements:[...artists.map(a=>({data:{id:a.id,label:a.name},position:positions.get(a.id)})),...influences.map((e,i)=>({data:{id:`e${i}`,source:e.source,target:e.target,kind:e.kind??'influence',color:e.kind==='continuity'?'#795e26':(layers.get(e.target)??0)<=0?'#8956a6':'#098658',detail:e}}))],
 style:[{selector:'node',style:{'shape':'round-rectangle','background-color':'#f3f6fc','border-width':1.5,'border-color':'#9baec8','label':'data(label)','color':'#333333','font-size':13,'font-weight':500,'text-valign':'center','text-halign':'center','width':180,'height':40,'overlay-opacity':0}},{selector:'node:selected',style:{'background-color':'#e3f2fd','border-color':'#007acc','border-width':3,'color':'#005a9e','font-weight':700}},{selector:'edge',style:{'width':2,'line-color':'data(color)','target-arrow-color':'data(color)','target-arrow-shape':'triangle','arrow-scale':0.9,'curve-style':'bezier','opacity':0.85}},{selector:'edge[kind="continuity"]',style:{'line-style':'dashed'}}],
 layout:{name:'preset',fit:true,padding:85},minZoom:0.15,maxZoom:3,wheelSensitivity:0.18});
 const resize=new ResizeObserver(()=>{cy.resize();cy.fit(undefined,85)});resize.observe(holder.current);
 cyRef.current=cy;cy.on('tap','node',event=>selectRef.current(event.target.id()));cy.on('tap','edge',event=>edgeRef.current(event.target.data('detail')));cy.$id(selected).select();
 return()=>{resize.disconnect();cy.destroy();cyRef.current=null};
 },[artists,influences,selected]);
 useEffect(()=>{const cy=cyRef.current;if(cy){cy.nodes().unselect();cy.$id(selected).select()}},[selected]);
 return <div ref={holder} className="cytoscape" role="img" aria-label="Grafo interativo de influências musicais"/>;
}
