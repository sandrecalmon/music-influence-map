import { useEffect, useRef, useState } from 'react';
import type cytoscape from 'cytoscape';
import { centeredPan } from './navigation';

type Props = { cy: cytoscape.Core | null };
export default function Minimap({ cy }: Props) {
 const canvas = useRef<HTMLCanvasElement>(null);
 const [collapsed, setCollapsed] = useState(false);
 useEffect(() => {
  const element = canvas.current;
  if (!cy || !element || collapsed) return;
  const context = element.getContext('2d');
  if (!context) return;
  let frame = 0, dirty = true;
  let transform = { scale: 1, x: 0, y: 0 };
  let drag: { pointer: number; dx: number; dy: number } | null = null;
  // Cache a raster of the network. Pan/zoom only repaint this image and the viewport.
  const raster = document.createElement('canvas');
  function draw() {
   frame = 0;
   if (!context || !cy || cy.destroyed()) return;
   const { width, height } = element!.getBoundingClientRect();
   if (!width || !height) return;
   const ratio = window.devicePixelRatio || 1;
   if (element!.width !== Math.round(width * ratio) || element!.height !== Math.round(height * ratio)) dirty = true;
   if (dirty) { element!.width = Math.round(width * ratio); element!.height = Math.round(height * ratio); }
   context.clearRect(0, 0, element!.width, element!.height);
   context.setTransform(ratio, 0, 0, ratio, 0, 0);
   if (dirty) {
    dirty = false;
    const bounds = cy.elements().boundingBox({ includeLabels: false });
    const scale = Math.min((width - 20) / Math.max(bounds.w, 1), (height - 20) / Math.max(bounds.h, 1));
    transform = { scale, x: (width - bounds.w * scale) / 2 - bounds.x1 * scale, y: (height - bounds.h * scale) / 2 - bounds.y1 * scale };
    raster.width = element!.width; raster.height = element!.height;
    const ctx = raster.getContext('2d')!;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const point = (p: { x: number; y: number }) => ({ x: p.x * scale + transform.x, y: p.y * scale + transform.y });
    cy.edges().forEach(edge => {
     const from = point(edge.source().position()), to = point(edge.target().position());
     ctx.strokeStyle = edge.data('color'); ctx.globalAlpha = 0.65; ctx.lineWidth = 1;
     ctx.setLineDash(edge.data('kind') === 'continuity' ? [3, 2] : []);
     ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    });
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    cy.nodes().forEach(node => {
     const p = point(node.position()), selected = node.selected();
     ctx.fillStyle = selected ? '#007acc' : '#9baec8';
     ctx.fillRect(p.x - (selected ? 4 : 2), p.y - 2, selected ? 8 : 4, 4);
    });
   }
   context.drawImage(raster, 0, 0, width, height);
   const extent = cy.extent();
   context.fillStyle = '#007acc18'; context.strokeStyle = '#007acc'; context.lineWidth = 1.5;
   const x = extent.x1 * transform.scale + transform.x, y = extent.y1 * transform.scale + transform.y;
   context.fillRect(x, y, extent.w * transform.scale, extent.h * transform.scale);
   context.strokeRect(x, y, extent.w * transform.scale, extent.h * transform.scale);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  function invalidate() { dirty = true; schedule(); }
  function local(event: PointerEvent) {
   const rect = element!.getBoundingClientRect();
   return { x: (event.clientX - rect.left - transform.x) / transform.scale, y: (event.clientY - rect.top - transform.y) / transform.scale };
  }
  function navigate(event: PointerEvent) {
   if (!drag || !cy) return;
   const p = local(event), zoom = cy.zoom();
   cy.pan(centeredPan(cy.width(), cy.height(), zoom, { x: p.x + drag.dx, y: p.y + drag.dy }));
  }
  function down(event: PointerEvent) {
   if (event.button !== 0 || !cy) return;
   event.preventDefault(); cy.stop(); element!.setPointerCapture(event.pointerId);
   const p = local(event), extent = cy.extent();
   const inside = p.x >= extent.x1 && p.x <= extent.x2 && p.y >= extent.y1 && p.y <= extent.y2;
   drag = { pointer: event.pointerId, dx: inside ? (extent.x1 + extent.x2) / 2 - p.x : 0, dy: inside ? (extent.y1 + extent.y2) / 2 - p.y : 0 };
   navigate(event);
  }
  function move(event: PointerEvent) { if (drag?.pointer === event.pointerId) navigate(event); }
  function up() { drag = null; }
  function key(event: KeyboardEvent) {
   if (!cy || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
   event.preventDefault(); event.stopPropagation(); cy.stop();
   cy.panBy({ x: event.key === 'ArrowLeft' ? 60 : event.key === 'ArrowRight' ? -60 : 0, y: event.key === 'ArrowUp' ? 60 : event.key === 'ArrowDown' ? -60 : 0 });
  }
  cy.on('pan zoom', schedule); cy.on('position add remove select unselect resize', invalidate);
  const observer = new ResizeObserver(invalidate); observer.observe(element);
  element.addEventListener('pointerdown', down); element.addEventListener('pointermove', move);
  element.addEventListener('pointerup', up); element.addEventListener('pointercancel', up); element.addEventListener('lostpointercapture', up); element.addEventListener('keydown', key);
  schedule();
  return () => {
   cancelAnimationFrame(frame); observer.disconnect();
   cy.off('pan zoom', schedule); cy.off('position add remove select unselect resize', invalidate);
   element.removeEventListener('pointerdown', down); element.removeEventListener('pointermove', move);
   element.removeEventListener('pointerup', up); element.removeEventListener('pointercancel', up); element.removeEventListener('lostpointercapture', up); element.removeEventListener('keydown', key);
  };
 }, [cy, collapsed]);
 return <div className={`minimap ${collapsed ? 'collapsed' : ''}`}>
  <button onClick={() => setCollapsed(value => !value)} aria-expanded={!collapsed} aria-controls="network-minimap">{collapsed ? 'Abrir minimapa' : 'Recolher minimapa'}</button>
  {!collapsed && <canvas id="network-minimap" ref={canvas} tabIndex={0} role="application" aria-label="Minimapa da rede. Clique ou arraste para navegar; use as setas do teclado para mover o mapa." />}
 </div>;
}
