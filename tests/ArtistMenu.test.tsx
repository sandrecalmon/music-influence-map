import { render, screen, fireEvent, within } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import ArtistMenu from '../src/components/ArtistMenu';
import { graphIndex } from '../src/components/exploration';
const index=graphIndex([{id:'a',name:'Artist A'},{id:'b',name:'Artist B'},{id:'c',name:'Artist C'},{id:'d',name:'Artist D'}],[{source:'b',target:'a'},{source:'c',target:'a'},{source:'a',target:'d'}]);
function props(){return {index,selected:'a',session:null,mode:'both' as const,onHighlight:vi.fn(),onConfirm:vi.fn()}}
it('shows ordered neighbors and keeps the centered artist separate',()=>{render(<ArtistMenu {...props()}/>);expect(screen.getByLabelText('Artista atual')).toHaveTextContent('Artist A');expect(within(screen.getByLabelText('Influências')).getAllByRole('button').map(b=>b.textContent)).toEqual(['Artist B','Artist C']);expect(within(screen.getByLabelText('Influenciados')).getByRole('button')).toHaveTextContent('Artist D')});
it('hover, focus and click only highlight; Enter confirms explicitly',()=>{const p=props();render(<ArtistMenu {...p}/>);const button=screen.getByRole('button',{name:'Artist B'});fireEvent.mouseEnter(button);fireEvent.focus(button);fireEvent.click(button);expect(p.onHighlight).toHaveBeenCalledWith('b','past');expect(p.onConfirm).not.toHaveBeenCalled();expect(screen.getByLabelText('Artista atual')).toHaveTextContent('Artist A');fireEvent.keyDown(button,{key:'Enter'});expect(p.onConfirm).toHaveBeenCalledWith('b')});
it('marks the highlighted side option while leaving the current artist centered',()=>{render(<ArtistMenu {...props()} session={{origin:'a',side:'past',candidates:['b','c'],index:1}}/>);expect(screen.getByRole('button',{name:'Artist C'})).toHaveAttribute('aria-pressed','true');expect(screen.getByRole('button',{name:'Artist B'})).toHaveAttribute('aria-pressed','false');expect(screen.getByRole('status',{name:'Artista destacado'})).toHaveTextContent('Artist C');expect(screen.getByLabelText('Artista atual')).toHaveTextContent('Artist A')});
it('handles empty directions and a future highlight',()=>{const {rerender}=render(<ArtistMenu {...props()} mode="future" session={{origin:'a',side:'future',candidates:['d'],index:0}}/>);expect(screen.getByRole('button',{name:'Artist D'})).toHaveAttribute('aria-pressed','true');rerender(<ArtistMenu {...props()} selected="d" session={null}/>);expect(screen.getByText('Nenhum artista nesta direção')).toBeInTheDocument()});

it('Enter confirms the current highlight even when DOM focus remains on the previous card',()=>{const p=props();const {rerender}=render(<ArtistMenu {...p} session={{origin:'a',side:'past',candidates:['b','c'],index:0}}/>);const button=screen.getByRole('button',{name:'Artist B'});fireEvent.focus(button);rerender(<ArtistMenu {...p} session={{origin:'a',side:'past',candidates:['b','c'],index:1}}/>);fireEvent.keyDown(button,{key:'Enter'});expect(p.onConfirm).toHaveBeenCalledWith('c')});
it('shows the highlighted artist global counts before confirmation',()=>{render(<ArtistMenu {...props()} selected="b" session={{origin:'b',side:'future',candidates:['a'],index:0}}/>);expect(screen.getByLabelText('2 influências e 1 influenciados')).toHaveTextContent('2/1');expect(screen.getByLabelText('Artista atual')).toHaveTextContent('Artist B')});
it('shows a compact source link and never confirms when it is opened',()=>{const p=props();render(<ArtistMenu {...p} sourceUrl="https://www.example.org/evidence" session={{origin:'a',side:'past',candidates:['b','c'],index:0}}/>);const link=within(screen.getByLabelText('Fonte da conexão')).getByRole('link');expect(link).toHaveTextContent('example.org');expect(link).toHaveAttribute('href','https://www.example.org/evidence');expect(link).toHaveAttribute('target','_blank');expect(link).toHaveAttribute('rel','noopener noreferrer');expect(p.onConfirm).not.toHaveBeenCalled()});
it('does not show a source box without a highlighted connection',()=>{render(<ArtistMenu {...props()} sourceUrl="https://example.org"/>);expect(screen.queryByLabelText('Fonte da conexão')).not.toBeInTheDocument()});

it('retains previous outgoing columns and offers explicit ancestor return',()=>{
 const p=props();const onReturn=vi.fn();
 render(<ArtistMenu {...p} selected="d" trail={[{id:'b'},{id:'a',via:'future'},{id:'d',via:'future'}]} onReturn={onReturn}/>);
 expect(screen.getByLabelText('Etapa 1: Artist B')).toHaveTextContent('Artist A');
 expect(screen.getByLabelText('Etapa 2: Artist A')).toHaveTextContent('Artist D');
 expect(screen.getByLabelText('Caminho da exploração')).toHaveTextContent('Artist B');
 expect(screen.getByLabelText('Artista atual')).toHaveTextContent('Artist D');
 fireEvent.click(screen.getByRole('button',{name:'Voltar para Artist A'}));
 expect(onReturn).toHaveBeenCalledWith('a');
});
it('renders incoming history and removes descendants supplied by a return',()=>{
 const p=props();const onReturn=vi.fn();
 const {rerender}=render(<ArtistMenu {...p} selected="b" trail={[{id:'d'},{id:'a',via:'past'},{id:'b',via:'past'}]} onReturn={onReturn}/>);
 expect(screen.getByLabelText('Etapa 1: Artist D')).toBeInTheDocument();
 expect(screen.getByLabelText('Etapa 2: Artist A')).toHaveTextContent('Artist B');
 fireEvent.click(within(screen.getByLabelText('Caminho da exploração')).getByRole('button',{name:'Artist D'}));
 expect(onReturn).toHaveBeenCalledWith('d');
 rerender(<ArtistMenu {...p} selected="d" trail={[{id:'d'}]} onReturn={onReturn}/>);
 expect(screen.queryByLabelText('Caminho da exploração')).not.toBeInTheDocument();
 expect(screen.queryByLabelText('Etapa 2: Artist A')).not.toBeInTheDocument();
});
