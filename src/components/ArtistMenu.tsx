import { useEffect, useRef } from 'react';
import type { GraphIndex, NavigationSession, Side } from './exploration';
type Props={index:GraphIndex;selected:string;session:NavigationSession|null;mode:'both'|'past'|'future';onSelect:(id:string)=>void;onCandidate:(id:string,index:number)=>void;onPreview:(origin:string,target:string)=>void};
export default function ArtistMenu({index,selected,session,mode,onSelect,onCandidate,onPreview}:Props){
 const active=useRef<HTMLButtonElement>(null);
 useEffect(()=>{active.current?.scrollIntoView?.({block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})},[selected,session]);
 const column=(side:Side,title:string)=>{
  const ids=index[side].get(selected)??[];
  return <section className={`tv-column tv-${side} ${mode!=='both'&&mode!==side?'tv-dim':''}`} aria-label={title}>
   <h3>{title} <span>{ids.length}</span></h3>
   <div className="tv-list" role="list">{ids.length?ids.map(id=><div role="listitem" key={id}><button onMouseEnter={()=>onPreview(selected,id)} onFocus={()=>onPreview(selected,id)} onClick={()=>onSelect(id)}>{index.names.get(id)}</button></div>):<p className="tv-empty">Nenhum artista nesta direção</p>}</div>
  </section>;
 };
 return <div className="artist-menu" aria-label="Menu de artistas">
  {column('past','Influências')}
  <section className="tv-center" aria-label="Artista atual">
   <div className="tv-current"><small>VOCÊ ESTÁ EM</small><strong>{index.names.get(selected)}</strong><span>← Origens · Legado →</span></div>
   {session&&session.candidates.length>0&&<div className="tv-siblings"><p>↑↓ {session.side==='past'?'Influências de':'Influenciados por'} <b>{index.names.get(session.origin)}</b></p><div className="tv-list" role="list" aria-label="Alternativas da direção escolhida">{session.candidates.map((id,i)=><div role="listitem" key={id}><button ref={id===selected?active:undefined} aria-current={id===selected?'true':undefined} onFocus={()=>onPreview(session.origin,id)} onMouseEnter={()=>onPreview(session.origin,id)} onClick={()=>onCandidate(id,i)}>{index.names.get(id)}</button></div>)}</div></div>}
  </section>
  {column('future','Influenciados')}
 </div>;
}
