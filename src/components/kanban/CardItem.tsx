import { useState } from 'react';
import { Menu, CheckCircle2, Circle, ChevronDown, ChevronUp, AlignLeft } from 'lucide-react';
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

    const isConcluido = card.status === 'Concluído';
    const hasSubTasks = card.isMultiTask && Boolean(card.subTasks) && card.subTasks!.length > 0;
    const completedSubTasks = hasSubTasks ? card.subTasks!.filter(s => s.status === 'Concluído').length : 0;
    const totalSubTasks = hasSubTasks ? card.subTasks!.length : 0;
    const progressPercent = hasSubTasks && totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0;
    const hasNotes = Boolean(card.notes && card.notes.trim() !== '');

    return (
        <div
            onClick={() => openEditCard(card)}
            className={`
                bg-white border outline outline-1 outline-offset-[-1px] rounded-[1.25rem] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col cursor-pointer group/card
                ${isConcluido ? 'outline-emerald-200 border-emerald-100' : 'outline-slate-200 border-slate-100'}
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
                        <span className={`text-[13px] font-bold truncate ${isConcluido ? 'text-emerald-500' : 'text-slate-700'}`}>
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
                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100/80 px-3 py-1 rounded-md border border-slate-200/60 transition-colors group-hover/card:bg-slate-200/50">
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
                            className={`focus:outline-none active:scale-90 transition-transform ${isConcluido ? 'text-emerald-400' : 'text-slate-200 hover:text-blue-500'}`}
                        >
                            {isConcluido ? <CheckCircle2 size={22} className="fill-emerald-50" strokeWidth={2.5} /> : <Circle size={22} strokeWidth={2.5} />}
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
                    {card.subTasks!.map((st) => {
                        const isSubTaskConcluido = st.status === 'Concluído';
                        return (
                            <div key={st.id} className="flex items-center justify-between group/subtask p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                                <span className={`text-[11px] font-medium transition-colors ${isSubTaskConcluido ? 'text-slate-400 line-through' : 'text-slate-600 group-hover/subtask:text-slate-800'}`}>
                                    {st.title}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onToggleSubTask) onToggleSubTask(card.id, st.id, st.status);
                                    }}
                                    className={`focus:outline-none active:scale-90 transition-transform ${isSubTaskConcluido ? 'text-emerald-400' : 'text-slate-200 hover:text-blue-500'}`}
                                >
                                    {isSubTaskConcluido ? <CheckCircle2 size={16} className="fill-emerald-50" strokeWidth={2.5} /> : <Circle size={16} strokeWidth={2.5} />}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
