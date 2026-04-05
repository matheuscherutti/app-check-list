import { useState } from 'react';
import { Menu, CheckCircle2, Circle, ChevronDown, ChevronUp, AlignLeft } from 'lucide-react';
import {
    SortableContext,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import SortableSubtaskItem from './SortableSubtaskItem';
import type { Card } from '../../types';

interface CardItemProps {
    card: Card;
    openEditCard: (card: Card) => void;
    onToggleStatus: (cardId: string, currentStatus: string) => void;
    onToggleSubTask?: (cardId: string, subTaskId: string, currentStatus: string) => void;
    dragHandleProps?: any;
}

export default function CardItem({ card, openEditCard, onToggleStatus, onToggleSubTask, dragHandleProps }: CardItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const isConcluido = card.isMultiTask
        ? (card.subTasks && card.subTasks.length > 0 && card.subTasks.every(st => st.status === 'Concluído'))
        : card.status === 'Concluído';

    const hasSubTasks = card.isMultiTask && Boolean(card.subTasks) && card.subTasks!.length > 0;
    const completedSubTasks = hasSubTasks ? card.subTasks!.filter(s => s.status === 'Concluído').length : 0;
    const totalSubTasks = hasSubTasks ? card.subTasks!.length : 0;
    const progressPercent = hasSubTasks && totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0;
    const hasNotes = Boolean(card.notes && card.notes.trim() !== '');

    const subTaskIds = hasSubTasks ? card.subTasks!.map(st => st.id) : [];

    return (
        <div
            onClick={() => openEditCard(card)}
            className={`
                border border-slate-100 rounded-[1.25rem] p-3 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col cursor-pointer group/card
                ${isConcluido ? 'bg-emerald-50 text-slate-900 border-emerald-100/50' : 'bg-white text-slate-900'}
            `}
        >
            {/* Top Area */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        {...dragHandleProps}
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-300 hover:text-slate-400 cursor-grab active:cursor-grabbing pl-1 touch-manipulation focus:outline-none"
                    >
                        <Menu size={16} strokeWidth={2.5} />
                    </button>
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <span className={`text-[13px] font-bold truncate ${isConcluido ? 'text-emerald-900' : 'text-slate-900'}`}>
                            {card.title}
                        </span>
                        {hasSubTasks && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progressPercent}%` }} />
                                </div>
                                <span className="text-[9px] font-black text-slate-400">{completedSubTasks}/{totalSubTasks}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pl-3">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg transition-colors border ${isConcluido ? 'bg-emerald-200/30 text-emerald-700 border-emerald-200/50' : 'bg-slate-50 text-slate-500 border-slate-200/50 group-hover/card:bg-white group-hover/card:border-slate-300'}`}>
                        {card.equipment}
                    </span>

                    {/* Expand/Collapse Button for Subtasks */}
                    {hasSubTasks && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-blue-50 text-blue-600' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
                        >
                            {isExpanded ? <ChevronUp size={16} strokeWidth={2.5} /> : <ChevronDown size={16} strokeWidth={2.5} />}
                        </button>
                    )}

                    {/* Main Card Status Toggle */}
                    {!hasSubTasks && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStatus(card.id, card.status);
                            }}
                            className={`focus:outline-none active:scale-90 transition-transform ${isConcluido ? 'text-emerald-600' : 'text-slate-200 hover:text-blue-500'}`}
                        >
                            {isConcluido ? <CheckCircle2 size={22} className="fill-emerald-100" strokeWidth={2.5} /> : <Circle size={22} strokeWidth={2.5} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Direct Notes Display */}
            {hasNotes && (
                <div className="mt-3 ml-8 mr-2 pl-2 border-l-2 border-amber-200/50">
                    <div className="flex items-start gap-1.5">
                        <AlignLeft size={10} className="text-amber-500 mt-1 shrink-0" />
                        <p className="text-[11px] text-slate-500 italic leading-relaxed line-clamp-3 overflow-hidden text-ellipsis">
                            {card.notes}
                        </p>
                    </div>
                </div>
            )}

            {/* Subtasks Expanded Area */}
            {hasSubTasks && isExpanded && (
                <div
                    className="mt-3 pt-3 border-t border-slate-100 space-y-2 ml-8 mr-2"
                    onClick={(e) => e.stopPropagation()} // Prevent opening edit modal when clicking inside subtasks
                >
                    <SortableContext items={subTaskIds} strategy={verticalListSortingStrategy}>
                        {card.subTasks!.map((st) => (
                            <SortableSubtaskItem
                                key={st.id}
                                subTask={st}
                                cardId={card.id}
                                onToggleSubTask={onToggleSubTask!}
                            />
                        ))}
                    </SortableContext>
                </div>
            )}
        </div>
    );
}
