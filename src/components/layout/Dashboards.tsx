import { useMemo } from 'react';
import type { Card } from '../../types';

interface DashboardsProps {
    cards: Card[];
}

export default function Dashboards({ cards }: DashboardsProps) {
    const calculations = useMemo(() => {
        const WEIGHTS: Record<string, number> = {
            'Jeppesen': 50,
            'Pré Assigment': 33.33,
            'CAE': 16.95
        };

        const calculateWeightedProgress = (cardsToCalc: Card[]) => {
            if (cardsToCalc.length === 0) return 0;
            let earned = 0;
            let possible = 0;
            const teamsInCards = Array.from(new Set(cardsToCalc.map(c => c.team)));

            teamsInCards.forEach(team => {
                const teamCards = cardsToCalc.filter(c => c.team === team);
                const weight = WEIGHTS[team] || 0;
                if (weight > 0 && teamCards.length > 0) {
                    const completedCount = teamCards.filter(c => c.status === 'Concluído').length;
                    const completionRate = completedCount / teamCards.length;
                    earned += completionRate * weight;
                    possible += weight;
                }
            });
            if (possible === 0) return 0;
            return Math.min(100, Math.round((earned / possible) * 100));
        };

        const total = cards.length;
        const progressTotal = calculateWeightedProgress(cards);
        const groups = ['A320', 'A330', 'ATR', 'ERJ', 'Cmros'];
        const byEquipment = groups.map(group => {
            const groupCards = cards.filter(c => c.equipment === group);
            const progress = calculateWeightedProgress(groupCards);
            return { group, progress, total: groupCards.length };
        });

        return { progressTotal, total, byEquipment };
    }, [cards]);

    return (
        <div className="bg-white/40 backdrop-blur-md border-b border-slate-200/60 py-4 mb-2 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="max-w-[1600px] mx-auto px-8 flex items-center justify-between gap-12 overflow-x-auto scrollbar-hide">

                {/* Status Global - Capsule Design */}
                <div className="flex items-center gap-5 shrink-0 pr-10 border-r border-slate-200/50">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg width="64" height="64" className="transform -rotate-90 drop-shadow-sm">
                            <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(203, 213, 225, 0.3)" strokeWidth="6" />
                            <circle
                                cx="32" cy="32" r="28" fill="transparent" stroke="url(#blue-gradient)" strokeWidth="6"
                                strokeDasharray={175.9}
                                strokeDashoffset={175.9 - (calculations.progressTotal / 100) * 175.9}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                                <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#2563eb" />
                                    <stop offset="100%" stopColor="#0891b2" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="absolute text-xs font-black text-slate-800 tracking-tighter">{calculations.progressTotal}%</span>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight mb-0.5">Faturamento Global</h4>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-slate-900 leading-none">{calculations.total}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Cards</span>
                        </div>
                    </div>
                </div>

                {/* Progressão por Equipamento - Premium Horizontal Bars */}
                <div className="flex-1 flex gap-10 items-center min-w-max">
                    {calculations.byEquipment.map((eq) => (
                        <div key={eq.group} className="min-w-[140px] flex-1 group">
                            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 transition-colors group-hover:text-slate-800">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40 group-hover:bg-blue-600 transition-colors"></span>
                                    <span>{eq.group}</span>
                                </div>
                                <span className="text-blue-600 font-black">{eq.progress}%</span>
                            </div>
                            <div className="h-2 bg-slate-100/80 rounded-full overflow-hidden border border-slate-200/20 shadow-inner p-[1px]">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
                                    style={{ width: `${eq.progress}%` }}
                                />
                            </div>
                            <div className="mt-1.5 flex justify-end">
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{eq.total} atividades</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
