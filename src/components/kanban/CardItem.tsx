import { Menu, CheckCircle2, Circle } from 'lucide-react';
import type { Card } from '../../types';

interface CardItemProps {
    card: Card;
    openEditCard: (card: Card) => void;
    onToggleStatus: (cardId: string, currentStatus: string) => void;
    dragHandleProps?: any;
}

export default function CardItem({ card, openEditCard, onToggleStatus, dragHandleProps }: CardItemProps) {
    const isConcluido = card.status === 'Concluído';
    const hasSubTasks = card.isMultiTask && Boolean(card.subTasks) && card.subTasks!.length > 0;
    const completedSubTasks = hasSubTasks ? card.subTasks!.filter(s => s.status === 'Concluído').length : 0;
    const totalSubTasks = hasSubTasks ? card.subTasks!.length : 0;
    const progressPercent = hasSubTasks && totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0;

    return (
        <div
            onClick={() => openEditCard(card)}
            className={`
                bg-white border outline outline-1 outline-offset-[-1px] rounded-[1.25rem] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex items-center justify-between cursor-pointer group/card
                ${isConcluido ? 'outline-emerald-200 border-emerald-100' : 'outline-slate-200 border-slate-100'}
            `}
        >
            <div className="flex items-center gap-3 min-w-0">
                <button
                    {...dragHandleProps}
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-300 hover:text-slate-400 cursor-grab active:cursor-grabbing pl-1 touch-manipulation focus:outline-none"
                >
                    <Menu size={16} strokeWidth={2.5} />
                </button>
                <div className="flex flex-col gap-0.5">
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
    );
}
