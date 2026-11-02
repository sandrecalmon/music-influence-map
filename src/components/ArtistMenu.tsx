import { useEffect, useRef } from 'react';
import type { GraphIndex, NavigationSession, Side } from './exploration';
type Props={index:GraphIndex;selected:string;session:NavigationSession|null;mode:'both'|'past'|'future';onHighlight:(id:string,side:Side)=>void;onConfirm:(id:string)=>void};
export default function ArtistMenu({index,selected,session,mode,onHighlight,onConfirm}:Props){
 const active=useRef<HTMLButtonElement>(null);
 const pending=session?.candidates[session.index];
 useEffect(()=>{active.current?.scrollIntoView?.({block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})},[pending]);
 const column=(side:Side,title:string)=>{
  const ids=index[side].get(selected)??[];
  return <section className={`tv-column tv-${side} ${mode!=='both'&&mode!==side?'tv-dim':''}`} aria-label={title}>
   <h3>{title} <span>{ids.length}</span></h3>
   <div className="tv-list" role="list">{ids.length?ids.map(id=><div role="listitem" key={id}><button ref={pending===id&&session?.side===side?active:undefined} aria-pressed={pending===id&&session?.side===side} onMouseEnter={()=>onHighlight(id,side)} onFocus={()=>onHighlight(id,side)} onClick={()=>onHighlight(id,side)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();event.stopPropagation();onConfirm(pending??id)}}}>{index.names.get(id)}</button></div>):<p className="tv-empty">Nenhum artista nesta direção</p>}</div>
  </section>;
 };
 return <div className="artist-menu" aria-label="Menu de artistas">
  {column('past','Influências')}
  <section className="tv-center" aria-label="Artista atual">
   <div className="tv-current"><small>VOCÊ ESTÁ EM</small><strong>{index.names.get(selected)}</strong><span>← Origens · Legado →</span></div>
   <div className="tv-pending" role="status" aria-label="Artista destacado">{pending?<><small>EM DESTAQUE</small><strong>{index.names.get(pending)}</strong><span>Pressione Selecionar ou Enter para entrar.</span></>:<span>Use as setas para destacar um artista. Depois, confirme em Selecionar.</span>}</div>
  </section>
  {column('future','Influenciados')}
 </div>;
}
