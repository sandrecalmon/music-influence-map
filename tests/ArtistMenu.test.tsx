import { render, screen, fireEvent, within } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import ArtistMenu from '../src/components/ArtistMenu';
import { graphIndex } from '../src/components/exploration';
import { expandMenu } from '../src/components/menuMap';
const index=graphIndex([{id:'a',name:'Artist A'},{id:'b',name:'Artist B'},{id:'c',name:'Artist C'},{id:'d',name:'Artist D'}],[{source:'b',target:'a'},{source:'c',target:'a'},{source:'a',target:'d'}]);
function props(){return {index,selected:'a',session:null,mode:'both' as const,onHighlight:vi.fn(),onConfirm:vi.fn()}}
it('shows ordered neighbors and keeps the centered artist separate',()=>{render(<ArtistMenu {...props()}/>);expect(screen.getByLabelText('Artista atual')).toHaveTextContent('Artist A');expect(within(screen.getByLabelText('Influências')).getAllByRole('button').map(b=>b.textContent)).toEqual(['Artist B','Artist C']);expect(within(screen.getByLabelText('Influenciados')).getByRole('button')).toHaveTextContent('Artist D')});
it('focus and click only highlight; Enter confirms explicitly',()=>{const p=props();render(<ArtistMenu {...p}/>);const button=screen.getByRole('button',{name:'Artist B'});fireEvent.focus(button);fireEvent.click(button);expect(p.onHighlight).toHaveBeenCalledWith('b','past');expect(p.onConfirm).not.toHaveBeenCalled();expect(screen.getByLabelText('Artista atual')).toHaveTextContent('Artist A');fireEvent.keyDown(button,{key:'Enter'});expect(p.onConfirm).toHaveBeenCalledWith('b')});
it('marks the highlighted side option while leaving the current artist centered',()=>{render(<ArtistMenu {...props()} session={{origin:'a',side:'past',candidates:['b','c'],index:1}}/>);expect(screen.getByRole('button',{name:'Artist C'})).toHaveAttribute('aria-pressed','true');expect(screen.getByRole('button',{name:'Artist B'})).toHaveAttribute('aria-pressed','false');expect(screen.getByRole('status',{name:'Artista destacado'})).toHaveTextContent('Artist C');expect(screen.getByLabelText('Artista atual')).toHaveTextContent('Artist A')});
it('handles empty directions and a future highlight',()=>{const {rerender}=render(<ArtistMenu {...props()} mode="future" session={{origin:'a',side:'future',candidates:['d'],index:0}}/>);expect(screen.getByRole('button',{name:'Artist D'})).toHaveAttribute('aria-pressed','true');rerender(<ArtistMenu {...props()} selected="d" session={null}/>);expect(screen.getByText('Nenhum artista nesta direção')).toBeInTheDocument()});

it('Enter confirms the current highlight even when DOM focus remains on the previous card',()=>{const p=props();const {rerender}=render(<ArtistMenu {...p} session={{origin:'a',side:'past',candidates:['b','c'],index:0}}/>);const button=screen.getByRole('button',{name:'Artist B'});fireEvent.focus(button);rerender(<ArtistMenu {...p} session={{origin:'a',side:'past',candidates:['b','c'],index:1}}/>);fireEvent.keyDown(button,{key:'Enter'});expect(p.onConfirm).toHaveBeenCalledWith('c')});
it('shows the highlighted artist global counts before confirmation',()=>{render(<ArtistMenu {...props()} selected="b" session={{origin:'b',side:'future',candidates:['a'],index:0}}/>);expect(screen.getByLabelText('2 influências e 1 influenciados')).toHaveTextContent('2/1');expect(screen.getByLabelText('Artista atual')).toHaveTextContent('Artist B')});
it('shows a compact source link and never confirms when it is opened',()=>{const p=props();render(<ArtistMenu {...p} sourceUrl="https://www.example.org/evidence" session={{origin:'a',side:'past',candidates:['b','c'],index:0}}/>);const link=within(screen.getByLabelText('Fonte da conexão')).getByRole('link');expect(link).toHaveTextContent('example.org');expect(link).toHaveAttribute('href','https://www.example.org/evidence');expect(link).toHaveAttribute('target','_blank');expect(link).toHaveAttribute('rel','noopener noreferrer');expect(p.onConfirm).not.toHaveBeenCalled()});
it('does not show a source box without a highlighted connection',()=>{render(<ArtistMenu {...props()} sourceUrl="https://example.org"/>);expect(screen.queryByLabelText('Fonte da conexão')).not.toBeInTheDocument()});

it('highlights the active path within a single board and allows return',()=>{
 const p=props();const onReturn=vi.fn();
 render(<ArtistMenu {...p} selected="d" trail={[{id:'b'},{id:'a',via:'future'},{id:'d',via:'future'}]} onReturn={onReturn}/>);
 const board=within(screen.getByLabelText('Região explorada'));
 expect(board.getByRole('button',{name:'Artist B'})).toHaveAttribute('data-route','true');
 expect(board.getByRole('button',{name:'Artist A'})).toHaveAttribute('data-route','true');
 expect(board.queryByRole('button',{name:'Artist C'})).not.toBeInTheDocument();
 fireEvent.click(within(screen.getByLabelText('Caminho da exploração')).getByRole('button',{name:'Artist A'}));
 expect(onReturn).toHaveBeenCalledWith('a');
});
it('hides abandoned branches outside the current neighborhood',()=>{
 const branch=graphIndex(['a','b','c','d','e'].map(id=>({id,name:`Artist ${id.toUpperCase()}`})),[
  {source:'a',target:'b'},{source:'b',target:'c'},{source:'c',target:'d'},{source:'c',target:'e'},
 ]);
 const prefix=[{id:'a'},{id:'b',via:'future' as const},{id:'c',via:'future' as const}];
 const slots=['a','b','c','d','e'].reduce((map,id)=>expandMenu(map,id,branch),new Map());
 const p={...props(),index:branch,slots,links:[{source:'c',target:'d'},{source:'c',target:'e'}]};
 const {rerender,container}=render(<ArtistMenu {...p} selected="d" trail={[...prefix,{id:'d',via:'future'}]}/>);
 const board=within(screen.getByLabelText('Região explorada'));
 const d=board.getByRole('button',{name:'Artist D'});
 expect(d).toHaveClass('current-card');
 rerender(<ArtistMenu {...p} selected="c" trail={prefix}/>);
 expect(d).toHaveClass('context-card');
 rerender(<ArtistMenu {...p} selected="e" trail={[...prefix,{id:'e',via:'future'}]}/>);
 expect(board.queryByRole("button",{name:"Artist D"})).not.toBeInTheDocument();
 expect(board.getByRole('button',{name:'Artist E'})).toHaveClass('current-card');
 expect(screen.getByLabelText('Caminho da exploração')).not.toHaveTextContent('Artist D');
 expect(container.querySelectorAll('path[data-path="true"]')).toHaveLength(1);
});
it('opens an already revealed nonadjacent artist and keeps filtering contextual',()=>{
 const p=props();const onReturn=vi.fn();
 render(<ArtistMenu {...p} selected="d" mode="future" trail={[{id:'b'},{id:'a',via:'future'},{id:'d',via:'future'}]} onReturn={onReturn}/>);
 const b=within(screen.getByLabelText('Região explorada')).getByRole('button',{name:'Artist B'});
 fireEvent.click(b);fireEvent.keyDown(b,{key:'Enter'});
 expect(onReturn).toHaveBeenCalledWith('b');
 expect(b).toHaveClass('route-card');expect(b).not.toHaveClass('filtered-card');
});
it('confirms a vertically highlighted non-neighbor even when focus stays on the current card',()=>{
 const p={...props(),selected:'d'};
 const {rerender}=render(<ArtistMenu {...p}/>);
 const current=within(screen.getByLabelText('Região explorada')).getByRole('button',{name:'Artist D'});
 fireEvent.focus(current);
 rerender(<ArtistMenu {...p} session={{origin:'d',side:'past',candidates:['b','d'],index:0}}/>);
 fireEvent.keyDown(current,{key:'Enter'});
 expect(p.onConfirm).toHaveBeenCalledWith('b');
 rerender(<ArtistMenu {...p} session={{origin:'d',side:'future',candidates:['b','d'],index:1}}/>);
 expect(current).toHaveClass('pending-card');
 expect(current).toHaveAttribute('aria-current','true');
});
it('labels context cards separately from verified musical relationships',()=>{
 const p=props();
 const slots=expandMenu(expandMenu(new Map(),'a',index),'d',index);
 const {rerender}=render(<ArtistMenu {...p} slots={slots} selected="d" session={{origin:'d',side:'past',candidates:['b'],index:0}} sourceUrl="https://example.org/unrelated"/>);
 expect(screen.getByLabelText('Vínculo musical')).toHaveTextContent('Sem conexão direta cadastrada');
 expect(screen.queryByLabelText('Fonte da conexão')).not.toBeInTheDocument();
 rerender(<ArtistMenu {...p} slots={slots} selected="a" session={{origin:'a',side:'past',candidates:['b'],index:0}}/>);
 expect(screen.getByLabelText('Vínculo musical')).toHaveTextContent('Influenciou Artist A');
 rerender(<ArtistMenu {...p} slots={slots} selected="a" session={{origin:'a',side:'future',candidates:['d'],index:0}}/>);
 expect(screen.getByLabelText('Vínculo musical')).toHaveTextContent('Influenciado por Artist A');
 rerender(<ArtistMenu {...p} slots={slots} selected="a" session={{origin:'a',side:'future',candidates:['a'],index:0}}/>);
 expect(screen.getByLabelText('Vínculo musical')).toHaveTextContent('Artista já selecionado');
});
it('does not label a mixed column as all influenced by the current artist',()=>{
 const slots=new Map([['a',{column:0,row:0}],['d',{column:1,row:0}],['b',{column:1,row:1}],['c',{column:-1,row:0}]]);
 render(<ArtistMenu {...props()} slots={slots}/>);
 expect(screen.getByLabelText('Artistas revelados à direita')).toBeInTheDocument();
 expect(screen.queryByLabelText('Influenciados')).not.toBeInTheDocument();
});

it('confirms the highlighted neighbor on a second click', () => {
 const p = props();
 const {rerender} = render(<ArtistMenu {...p} />);
 const button = screen.getByRole('button', {name: 'Artist B'});
 fireEvent.focus(button);
 expect(p.onHighlight).not.toHaveBeenCalled();
 fireEvent.click(button);
 expect(p.onHighlight).toHaveBeenCalledWith('b', 'past');
 expect(p.onConfirm).not.toHaveBeenCalled();
 rerender(<ArtistMenu {...p} session={{origin:'a',side:'past',candidates:['b','c'],index:0}} />);
 fireEvent.click(button);
 expect(p.onConfirm).toHaveBeenCalledExactlyOnceWith('b');
});

it('shows the current artist counts without a highlighted card', () => {
 render(<ArtistMenu {...props()} />);
 const current = within(screen.getByLabelText('Artista atual'));
 expect(current.getByLabelText('2 influências e 1 influenciados')).toHaveTextContent('2/1');
});
