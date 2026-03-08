import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CardItem from './CardItem';
import type { Card } from '../../types';

interface SortableCardItemProps {
    card: Card;
    openEditCard: (card: Card) => void;
    onToggleStatus: (cardId: string, currentStatus: string) => void;
    onToggleSubTask: (cardId: string, subTaskId: string, currentStatus: string) => void;
}

export default function SortableCardItem({ card, ...props }: SortableCardItemProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id,
        data: {
            type: 'Card',
            card,
        },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="touch-manipulation group relative">
            <CardItem
                card={card}
                {...props}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
}
