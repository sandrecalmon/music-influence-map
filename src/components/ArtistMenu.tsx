import { useEffect, useRef } from 'react';
import type { GraphIndex, NavigationSession, Side, ExplorationStep, Link } from './exploration';
import { expandMenu, type MenuSlots } from './menuMap';
import { MENU_COLUMN, MENU_ROW, menuEdgePath, menuEdgePoints } from './menuEdges';
type Props = {
 sourceUrl?: string; index: GraphIndex; selected: string; session: NavigationSession | null;
 mode: 'both' | 'past' | 'future'; trail?: ExplorationStep[]; slots?: MenuSlots;
 links?: Link[]; focusRequest?: number;
 onHighlight: (id: string, side: Side) => void; onConfirm: (id: string) => void;
 onReturn?: (id: string) => void;
};
export default function ArtistMenu({ index, selected, session, mode, trail = [], slots, links = [], sourceUrl, focusRequest, onHighlight, onConfirm, onReturn }: Props) {
 const center = useRef<HTMLButtonElement>(null);
 const active = useRef<HTMLButtonElement>(null);
 const pending = session?.candidates[session.index];
 const placement = slots ?? [...trail.map(s => s.id), selected].reduce<MenuSlots>((map, id) => expandMenu(map, id, index), new Map());
 const values = [...placement.values()];
 const currentColumn = placement.get(selected)!.column;
 const min = Math.min(currentColumn - 1, ...values.map(s => s.column));
 const max = Math.max(currentColumn + 1, ...values.map(s => s.column));
 const rows = Math.max(...values.map(s => s.row)) + 1;
 const columns = Array.from({ length: max - min + 1 }, (_, i) => min + i);
 const path = new Set(trail.map(step => step.id));
 const pathEdges = new Set(trail.slice(1).map((step, i) => step.via === 'past' ? `${step.id}->${trail[i].id}` : `${trail[i].id}->${step.id}`));
 const scroll = (node: HTMLElement | null) => node?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
 useEffect(() => { scroll(center.current); }, [selected, focusRequest]);
 useEffect(() => { if (pending) scroll(active.current); }, [pending]);
 const sideOf = (id: string): Side | undefined => index.past.get(selected)?.includes(id) ? 'past' : index.future.get(selected)?.includes(id) ? 'future' : undefined;
 const stage = (id: string) => { const side = sideOf(id); if (side) onHighlight(id, side); };
 const enter = (id: string) => {
  if (sideOf(id)) onConfirm(pending ?? id);
  else onReturn?.(id);
 };
 return <div className="exploration-menu spatial-menu" aria-label="Menu de artistas">
  {trail.length > 1 && <nav className="trail-nav" aria-label="Caminho da exploração">{trail.map((step, i) => <button key={step.id} aria-current={step.id === selected ? 'step' : undefined} onClick={() => onReturn?.(step.id)}>{i > 0 && <span aria-hidden="true">{step.via === 'past' ? '←' : '→'} </span>}{index.names.get(step.id)}</button>)}</nav>}
  <div className="menu-map-scroll" aria-label="Região explorada">
   <div className="menu-map-board" style={{ gridTemplateColumns: `repeat(${columns.length}, var(--menu-column))`, gridTemplateRows: `repeat(${rows + 2}, ${MENU_ROW}px)` }}>
    <svg className="menu-map-links" aria-hidden="true" viewBox={`0 0 ${columns.length * MENU_COLUMN} ${(rows + 2) * MENU_ROW}`} preserveAspectRatio="none">
     <defs>{[['origin','#8956a6'],['future','#098658'],['route','#007acc'],['pending','#b87900']].map(([id,color])=><marker key={id} id={`menu-arrow-${id}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={color}/></marker>)}</defs>
     {links.map(edge => {
      const from = placement.get(edge.source), to = placement.get(edge.target);
      if (!from || !to) return null;
      const forward = to.column > from.column;
      const points = menuEdgePoints(from, to, min, `${edge.source}->${edge.target}`);
      const marked = pathEdges.has(`${edge.source}->${edge.target}`);
      const preview = (edge.source === selected && edge.target === pending) || (edge.target === selected && edge.source === pending);
      const dim = mode !== 'both' && !(mode === 'past' ? edge.target === selected : edge.source === selected);
      return <path key={`${edge.source}->${edge.target}`} className={`${marked ? 'route-link' : ''} ${preview ? 'preview-link' : ''} ${dim && !marked ? 'filtered-link' : ''}`} data-path={marked ? 'true' : undefined} d={menuEdgePath(points)} stroke={forward ? '#098658' : '#8956a6'} markerEnd={`url(#menu-arrow-${preview ? 'pending' : marked ? 'route' : forward ? 'future' : 'origin'})`} strokeDasharray={edge.kind === 'continuity' ? '4 4' : undefined} />;
     })}
    </svg>
    {columns.map(column => {
     const label = column === currentColumn - 1 ? 'Influências' : column === currentColumn + 1 ? 'Influenciados' : column === currentColumn ? 'Coluna atual' : `Coluna ${column - min + 1}`;
     const cards = [...placement].filter(([, slot]) => slot.column === column);
     return <section key={column} className="menu-map-column" aria-label={label} style={{ gridColumn: column - min + 1, gridRow: `1 / ${rows + 3}` }}>
      <h3>{label}{((column === currentColumn - 1 && !index.past.get(selected)?.length) || (column === currentColumn + 1 && !index.future.get(selected)?.length)) && <p className="tv-empty">Nenhum artista nesta direção</p>}</h3>
      <div role="list" className="menu-map-cards">{cards.map(([id, slot]) => {
       const current = id === selected, highlighted = id === pending, visited = path.has(id), side = sideOf(id);
       const filtered = mode !== 'both' && side !== mode;
       return <div role="listitem" key={id} style={{ gridRow: slot.row + 1 }}>
        <button ref={current ? center : highlighted ? active : undefined} data-artist={id} data-column={slot.column} data-row={slot.row} data-route={visited || current ? 'true' : 'false'} className={`menu-map-card ${current ? 'current-card' : visited ? 'route-card' : 'context-card'} ${highlighted ? 'pending-card' : ''} ${filtered && !visited && !current ? 'filtered-card' : ''}`} aria-current={current ? 'true' : undefined} aria-description={current ? 'Artista atual' : visited ? 'No caminho percorrido' : 'Artista revelado fora do caminho'} aria-pressed={highlighted} onMouseEnter={() => stage(id)} onFocus={() => stage(id)} onClick={() => side ? stage(id) : onReturn?.(id)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); enter(id); } }}>{index.names.get(id)}</button>
       </div>;
      })}</div>
     </section>;
    })}
   </div>
  </div>
  <div className="menu-map-preview">
   <div aria-label="Artista atual"><small>VOCÊ ESTÁ EM</small><strong>{index.names.get(selected)}</strong></div>
   <div role="status" aria-label="Artista destacado">{pending ? <><strong>{index.names.get(pending)}</strong><span aria-label={`${index.past.get(pending)?.length ?? 0} influências e ${index.future.get(pending)?.length ?? 0} influenciados`}>{index.past.get(pending)?.length ?? 0}/{index.future.get(pending)?.length ?? 0}</span><small>Selecionar ou Enter para entrar</small></> : <small>← Origens · Legado → · ↑↓ opções · Selecionar confirma</small>}</div>
   {pending && sourceUrl && <div className="tv-source" aria-label="Fonte da conexão">Fonte: <a href={sourceUrl} target="_blank" rel="noopener noreferrer" title={sourceUrl}>{new URL(sourceUrl).hostname.replace(/^www\./, '')}</a></div>}
  </div>
 </div>;
}
