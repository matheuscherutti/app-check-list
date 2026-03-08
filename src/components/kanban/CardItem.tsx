import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Circle, GripVertical } from 'lucide-react';
import type { Card } from '../../types';

interface CardItemProps {
    card: Card;
    openEditCard: (card: Card) => void;
    onToggleStatus: (cardId: string, currentStatus: string) => void;
    onToggleSubTask: (cardId: string, subTaskId: string, currentStatus: string) => void;
    dragHandleProps?: any;
}

export default function CardItem({ card, openEditCard, onToggleStatus, onToggleSubTask, dragHandleProps }: CardItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const isConcluido = card.status === 'Concluído';
    const hasSubTasks = card.isMultiTask && card.subTasks && card.subTasks.length > 0;
    const completedSubTasks = hasSubTasks ? card.subTasks!.filter(s => s.status === 'Concluído').length : 0;
    const totalSubTasks = hasSubTasks ? card.subTasks!.length : 0;
    const progressPercent = hasSubTasks ? (completedSubTasks / totalSubTasks) * 100 : 0;

    return (
        <div
            onClick={() => openEditCard(card)}
            className={`
                group/card p-3 pl-1 rounded-lg border shadow-sm flex items-start cursor-pointer transition-all hover:shadow-md relative
                ${isConcluido ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-primary-300'}
            `}
        >
            {/* Dedicated Drag Handle */}
            <div
                {...dragHandleProps}
                onClick={(e) => e.stopPropagation()}
                className="self-stretch flex items-center px-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
            >
                <GripVertical size={16} />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-start justify-between">
                    <div className="flex-1 pr-3">
                        <p className={`text-sm font-bold leading-tight ${isConcluido ? 'text-emerald-800 line-through opacity-70' : 'text-slate-800'}`}>
                            {card.title}
                        </p>
                    </div>

                    {/* Main Card Status Toggle */}
                    {!hasSubTasks && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStatus(card.id, card.status);
                            }}
                            className={`
                                flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                ${isConcluido
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                    : 'border-slate-200 bg-white hover:border-primary-500 shadow-sm'
                                }
                            `}
                        >
                            {isConcluido && (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>

                {/* In-Card Notes Direct Display */}
                {card.notes && (
                    <div className="mt-2 text-[11px] text-slate-600 bg-amber-50/70 p-2 rounded-md border border-amber-100/50">
                        <p className="whitespace-pre-wrap leading-relaxed">{card.notes}</p>
                    </div>
                )}

                {/* SubTasks Area */}
                {hasSubTasks && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                        <div
                            className="flex items-center justify-between group/progress cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                        >
                            <div className="flex items-center gap-2 flex-1 mr-4">
                                <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                                <span className={`text-[10px] font-bold ${progressPercent === 100 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {completedSubTasks}/{totalSubTasks}
                                </span>
                            </div>
                            <div className="text-slate-400 group-hover/progress:text-slate-600 transition-colors">
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                        </div>

                        {/* Expanded List */}
                        {isExpanded && (
                            <div className="flex flex-col gap-1.5 mt-1.5 animate-in slide-in-from-top-1 duration-200">
                                {card.subTasks!.map(st => {
                                    const stConcluido = st.status === 'Concluído';
                                    return (
                                        <div
                                            key={st.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleSubTask(card.id, st.id, st.status);
                                            }}
                                            className={`
                                                flex items-center justify-between p-2 rounded-lg border transition-all text-[11px]
                                                ${stConcluido ? 'bg-emerald-50/40 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 hover:border-primary-200 text-slate-700'}
                                            `}
                                        >
                                            <span className={`font-medium truncate mr-2 ${stConcluido ? 'line-through opacity-60' : ''}`}>
                                                {st.title}
                                            </span>
                                            <div className={`${stConcluido ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                {stConcluido ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
