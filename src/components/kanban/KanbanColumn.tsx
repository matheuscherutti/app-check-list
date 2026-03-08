import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { Card } from '../../types';

interface KanbanColumnProps {
    id: string;
    team: string;
    cards: Card[];
    children: React.ReactNode;
}

export default function KanbanColumn({ id, team, cards, children }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id,
        data: {
            type: 'Column',
            team,
            columnId: id
        }
    });

    const cardIds = cards.map(c => c.id);

    return (
        <div ref={setNodeRef} className="flex-1 min-h-[100px]">
            <SortableContext items={cardIds} strategy={rectSortingStrategy}>
                {children}
            </SortableContext>
        </div>
    );
}
