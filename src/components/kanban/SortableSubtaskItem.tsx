import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CheckCircle2, Circle } from 'lucide-react';

interface SortableSubtaskItemProps {
    subTask: {
        id: string;
        title: string;
        status: string;
    };
    cardId: string;
    onToggleSubTask: (cardId: string, subTaskId: string, currentStatus: string) => void;
}

export default function SortableSubtaskItem({ subTask, cardId, onToggleSubTask }: SortableSubtaskItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: subTask.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    const isSubTaskConcluido = subTask.status === 'Concluído';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                flex items-center justify-between group/subtask p-1.5 rounded-lg transition-colors
                ${isDragging ? 'bg-blue-50 shadow-sm border border-blue-100' : 'hover:bg-slate-50'}
            `}
        >
            <div className="flex items-center gap-2 min-w-0">
                {/* Drag Handle - Apenas este ícone inicia o arraste da subtarefa */}
                <div
                    {...attributes}
                    {...listeners}
                    className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical size={14} />
                </div>

                <span className={`text-[11px] font-medium transition-colors truncate ${isSubTaskConcluido ? 'text-slate-400 line-through' : 'text-slate-600 group-hover/subtask:text-slate-800'}`}>
                    {subTask.title}
                </span>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleSubTask(cardId, subTask.id, subTask.status);
                }}
                className={`focus:outline-none active:scale-90 transition-transform px-1 ${isSubTaskConcluido ? 'text-emerald-600' : 'text-slate-300 hover:text-emerald-500'}`}
            >
                {isSubTaskConcluido ? <CheckCircle2 size={16} className="fill-white" strokeWidth={2.5} /> : <Circle size={16} strokeWidth={2.5} />}
            </button>
        </div>
    );
}
